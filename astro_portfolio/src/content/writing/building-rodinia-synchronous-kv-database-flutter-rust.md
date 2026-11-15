---
title: "Building A Synchronous Native Key-Value Database for Flutter + Rust"
excerpt: "Rodinia is a Redis-inspired key-value store for Flutter with a Rust engine: synchronous reads, an append-only log with crash recovery, a Dart-side LRU cache, per-key encryption and watch(), benchmarked against Hive, get_storage, shared_preferences and sqflite."
date: "2026-11-15"
readMins: 35
tags: ["flutter", "rust", "databases", "system design"]
image_url: "/writing/rodinia/rodinia-banner-1600.gif"
---


## Overview
There are plenty of key-value stores for Flutter today: `shared_preferences`, `flutter_secure_storage`, `get_storage` and Hive. They're all good libraries, and they all make trade-offs. To be honest, some trade-offs can't be avoided. But some of them, like the platform-channel overhead in SharedPreferences, are easy to ignore until they come back and bite you hard.

So I built **Rodinia**, a key-value database for Flutter inspired by Redis.

That might sound like a strange name for a database. Rodinia was an ancient supercontinent that joined almost all of Earth's landmasses during the Proterozoic Eon. The name comes from the Russian word _rodina_, meaning "motherland." I chose it because that's exactly what this database tries to do: bring the strengths of these approaches together. Also, it sounded cool 😎.

Before I break down Rodinia's design, here's a quick look at what Flutter developers use today, and where each option falls short.

## An Overview: key-value storage in Flutter today

There are four common choices. Each is good at one thing and pays for it somewhere else.

| Library                  | How it works                                                                                                  | What it costs                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `shared_preferences`     | Wraps native storage: SharedPreferences or DataStore on Android, `UserDefaults` on iOS, `localStorage` on web | Every call crosses Flutter's platform channel; cached reads can go stale across engines  |
| `flutter_secure_storage` | Encrypts with keys from Android Keystore; stores in the iOS Keychain                                          | Every read goes through the plugin and decrypts; behaviour differs per platform          |
| `get_storage`            | Pure Dart; keeps everything in memory and writes to disk in the background                                    | Whole dataset in RAM; a write can be lost if the app dies before the disk write finishes |
| Hive (`hive_ce`)         | Pure Dart; keeps each open box in memory and appends every change to a box file                               | Writes return a `Future` you must await to be safe; one isolate per box unless you switch to the slower `IsolatedHive`; encryption is all-or-nothing per box |

Hive is the closest relative of what I wanted. It's pure Dart, reads synchronously from memory, and persists through an append-only file, which is the same basic shape as Redis and as Rodinia. It's also the one that comes closest in the benchmarks later on, so it's the one to beat.

Two of those costs shape Rodinia's design, so they're worth seeing up close.

**Platform round-trips.** With SharedPreferences, each call is a message to Kotlin or Swift and back:

```dart
await prefs.setString('name', 'Ademola');
await prefs.setString('email', 'ademola@example.com');
await prefs.setInt('age', 28);
```

Three writes, three trips across the platform boundary.

**Stale caches.** The legacy SharedPreferences API caches values in memory, one cache per Flutter engine. If a background engine changes a value, your main engine can keep reading the old one.

And beyond those trade-offs, none of the four gives you expiring keys or atomic updates, and only Hive lets you watch a key for changes. I'll compare them side by side at the end, along with benchmark numbers against all four and sqflite. First, here's how Rodinia is built.

## Enter Rodinia

Each library above gets one thing right. SharedPreferences is native and simple. Secure Storage is secure. GetStorage is fast because it reads from memory. Hive pairs memory reads with an append-only file. Rodinia's goal is to keep those strengths without their costs: synchronous reads like GetStorage and Hive, durable without waiting, encrypted only where you ask for it, and with no platform channels at all.

The idea came from Redis. Redis holds its data in memory, logs every write to an append-only file, and rebuilds itself from that file on restart. Rodinia does something close to that inside a Flutter app, with the engine written in Rust and one important twist: the Rust side keeps only an **index** in memory, and the hot values live in a **cache on the Dart side**, so most reads never cross into Rust at all.

```
+------------------- [ LAYERS ] -------------------+
|                                                  |
| your app                                         |
| ├─ RodiniaStore           dart api               |
| │  ├─ ValueCache          lru, 8 MiB             |
| │  └─ generation pointer  read without ffi       |
| └─ flutter_rust_bridge    sync ffi               |
|    └─ Store               rust, one per process  |
|       ├─ index            key → file offset      |
|       ├─ keyring          aes-256-gcm cipher     |
|       ├─ event bus        watch streams          |
|       └─ wal              rodinia.wal            |
|                                                  |
+--------------------------------------------------+
```

Dart calls straight into one Rust `Store` per process. Writes go to the log first, then to the index. Reads are answered from a Dart-side cache when they can be, and otherwise from a single positioned read of the log file. The next sections walk through each piece.

### Rodinia as a database architecture

A **database architecture** is just the set of decisions that shape how data is stored, reached and kept safe. It helps to break Rodinia down along the same lines you'd use for any database:

| Component          | The question it answers          | Rodinia's answer                                                                                     |
| ------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Data model**     | What shape is the data?          | Key-value: a string key maps to bytes, plus a flag for encryption and an optional expiry time        |
| **Storage engine** | Where does live data sit?        | In the log file, found through an in-memory hash index (key → file offset) in the Rust core           |
| **Read path**      | How are reads made fast?         | A size-capped LRU cache of recently used values in Dart, kept correct by a shared change counter      |
| **Persistence**    | How does data survive a restart? | An append-only, checksummed write-ahead log, replayed on startup and compacted automatically          |
| **Interface**      | How do you talk to it?           | Synchronous Dart methods over FFI, modeled on Redis commands                                          |

### Which tier is it?

Database architectures are often described in **tiers**, by how many layers sit between your code and the data:

- **Three-tier:** your app talks to a backend server, which talks to the database. Most web systems work this way.
- **Two-tier (client-server):** your app talks directly to a database server over the network. This is how you'd normally use Redis.
- **One-tier (embedded):** the database runs inside your app's own process. No server, no network, no socket. SQLite works this way.

Rodinia is deliberately one-tier. It borrows Redis's ideas but not its client-server shape, because an app shouldn't need a server process to remember a theme setting. Every call is a function call into a library already loaded in memory.

### Why memory first?

Because reading RAM is far faster than reading storage. A main-memory access takes on the order of 100 nanoseconds, while a random read from an SSD takes on the order of 100 microseconds, roughly a thousand times longer (approximate, widely cited figures). Phone flash storage sits in the same slow range, although the operating system's page cache hides a lot of it for recently touched files.

That's the bet Redis makes, and Rodinia makes it too, with a budget: keep the values you actually use in memory so repeated reads never wait on storage, and use the disk as the source of truth so nothing is lost.

## Talking to Rust without platform channels

Rodinia skips Flutter's plugin channels entirely. The Dart side calls the Rust core through [flutter_rust_bridge](https://cbeuw.github.io/flutter_rust_bridge/), and almost every storage function is marked as a synchronous call:

```rust
#[flutter_rust_bridge::frb(sync)]
pub fn store_set(
    key: String,
    value: Vec<u8>,
    ttl_ms: Option<i64>,
    encrypted: bool,
    durable: bool,
) -> Result<(), StoreError> {
    store()?.set(key, value, ttl_ms, encrypted, durable)
}
```

That `sync` annotation is the whole point. A call goes straight from Dart into native code over FFI and returns a value. There's no message serialized onto a platform channel, no Kotlin or Swift handler, and no `Future` to await.

So on the Dart side, only opening the store is asynchronous, because it has to initialize the bridge first. Everything after that is plain synchronous code:

```dart
final dir = await getApplicationDocumentsDirectory();
final store = await RodiniaStore.open(dir.path);

store.set('username', 'Ademola');
final username = store.get<String>('username');
```

Compare that with the SharedPreferences example from earlier. Three writes no longer mean three trips across the platform boundary.

### One store per process

The store itself lives in a Rust `static`:

```rust
static STORE: OnceLock<Store> = OnceLock::new();
```

The native library is loaded once per process, so there is exactly one index and one log file no matter how many Flutter engines or isolates are running. A background engine and your main engine read and write the same data. This is how Rodinia sidesteps the stale-cache problem from SharedPreferences. (Each Dart handle does keep its own read cache, but as you'll see shortly, every one of those caches knows when someone else has written.)

One caveat: this holds within a process. If part of your app runs in a separate OS process, such as an Android service declared with its own process, it gets its own copy of the store.

### Guarding the global

A global needs rules about who can touch it. Two small functions enforce them:

```rust
fn store() -> Result<&'static Store, StoreError> {
    STORE.get().ok_or(StoreError::NotInitialized)
}

#[flutter_rust_bridge::frb(sync)]
pub fn store_open(path: String) -> Result<(), StoreError> {
    let opened = Store::open(&path)?;
    STORE.set(opened).map_err(|_| StoreError::AlreadyInitialized)
}
```

Every public function goes through `store()`, so calling `set` before `open` is a clean `NotInitialized` error rather than a crash. `OnceLock::set` only succeeds once, so a second `open` can't silently replace the store and throw away its state.

The Dart wrapper checks before it opens, which makes `RodiniaStore.open` safe to call from anywhere:

```dart
static Future<RodiniaStore> open(
  String path, {
  int cacheBytes = 8 * 1024 * 1024,
  bool preload = true,
}) async {
  if (!RustLib.instance.initialized) {
    await RustLib.init();
  }
  if (!native.storeIsOpen()) {
    native.storeOpen(path: path);
  }
  final store = RodiniaStore._(
    ValueCache(cacheBytes),
    Pointer<Uint64>.fromAddress(native.storeGenerationAddress()),
  );
  if (preload && cacheBytes > 0) {
    _preloads[store] = store._preload(cacheBytes);
  }
  return store;
}
```

Two new parameters show up here, `cacheBytes` and `preload`, plus a raw pointer. Those are the caching layer, and they get their own section below.

### From Dart values to bytes

The Rust core only knows about bytes: every value is a `Vec<u8>`. Typing happens at the edge, in Dart:

```dart
Uint8List _encode<T>(T value) {
  if (value is Uint8List) return value;
  if (value is List<int>) return Uint8List.fromList(value);
  if (value is String) return utf8.encode(value);
  return utf8.encode(jsonEncode(value));
}
```

Raw bytes pass through untouched, strings become UTF-8, and anything else (`int`, `bool`, `Map`, `List`) goes through JSON. That keeps the engine simple and makes binary data, like an image thumbnail, free of any encoding overhead.

The trade-off is that `get<T>` trusts you: the `T` you read with should match the type you wrote. Read a stored `Map` as `get<String>` and you get its JSON text back.

## The storage engine: an index over a log

The first version of Rodinia kept every value in a Rust `HashMap`, exactly like Redis. It worked, but it meant every read still paid for a trip across FFI and a copy of the value back into Dart, and the whole dataset sat in RAM whether you used it or not. The current engine splits that job in two: Rust keeps an **index** that says where each value lives in the log, and Dart keeps a **cache** of the values you actually read.

### First, what's a Write-ahead log?

A write-ahead log (WAL) is a file that records every change _before_ that change is applied. Instead of saving what your data looks like right now, it saves the list of things that happened to it:

```
set   theme    = dark
set   username = Ademola
delete token
set   theme    = light
```

The log is append-only. New entries always go at the end, and old entries are never edited.

The name comes from the one rule it follows: **write to the log first, apply the change second**. Because of that rule, the log always holds every change that was confirmed. If the app crashes, you can rebuild the exact state by replaying the log from top to bottom. Replay the four lines above and you end up with `theme = light` and `username = Ademola`.

This isn't a new idea. PostgreSQL and SQLite use write-ahead logs, and Redis's append-only file is the same thing under another name. Writing to the end of one file is also about the cheapest thing you can ask a disk to do: no searching, no rewriting what's already there.

The catch is visible in the example: `theme` appears twice, and only the last value matters. The log keeps growing even when your data doesn't. We'll come back to that under compaction.

### The index

In Rodinia, the log file **is** the data, and the index is how you find things in it. Here is the state Rust keeps in memory:

```rust
struct State {
    wal: Wal,
    index: HashMap<String, IndexEntry>,
    live_bytes: u64,
}

pub struct IndexEntry {
    pub loc: ValueLoc,      // offset and length of the value in the file
    pub record_len: u32,    // size of the whole record
    pub encrypted: bool,
    pub expires_at: Option<u64>,
}
```

For every live key, the index stores where its value starts in the file, how long it is, whether it's encrypted and when it expires. Not the value itself. That keeps Rust's memory proportional to the **number of keys**, not the **size of the data**: a thousand 1 KiB values cost the index a thousand small entries, not a megabyte.

Hive users will recognise the idea: it's what a Hive *lazy* box does, keeping only keys in memory and reading values from the file on demand. The difference is that Rodinia pairs the index with a cache, so you don't have to choose between a regular box (fast reads, everything in RAM) and a lazy box (small memory, every read hits the file).

A read becomes one hash lookup and one positioned read:

```rust
fn read_live(&self, key: &str) -> Result<Option<(Vec<u8>, IndexEntry)>, StoreError> {
    let state = self.state.read();
    let Some(entry) = state.index.get(key).copied() else {
        return Ok(None);
    };
    if entry.is_expired(now_ms()) {
        drop(state);
        self.expire_key(key);
        return Ok(None);
    }
    Ok(Some((state.read(&entry)?, entry)))
}
```

`state.read` is a `pread` on Unix (`seek_read` on Windows). A positioned read doesn't move a shared file cursor, so many readers can read at once under the read lock without stepping on each other. And because the file was just written, those bytes are usually still in the operating system's page cache, so "reading from disk" is mostly a memory copy in practice.

If the entry has expired, `read_live` reports it as missing and removes it, logging a `Delete` so it stays gone after a restart. That's Redis's lazy expiry: no background timer, just a check on access.

### The log format

The first version wrote each record as a 4-byte length followed by a [bincode](https://github.com/bincode-org/bincode) blob. The index needs something more precise than that: it has to know exactly where a value starts inside a record. So the format is now a fixed layout of its own. The file begins with a 5-byte header, `RDNA\x02`, and every record looks like this (integers are little-endian):

```
┌──────────┬──────────┬────────────────────────── body ──────────────────────────┐
│ body_len │ crc32    │ kind │ flags │ expires_at │ key_len │ key │ value        │
│ u32      │ u32      │ u8   │ u8    │ u64        │ u32     │     │              │
└──────────┴──────────┴──────┴───────┴────────────┴─────────┴─────┴──────────────┘
```

Two choices matter here:

- **The value always comes last.** That's what lets the index store just an offset and a length, and read a value with a single positioned read.
- **Every record carries a CRC-32 of its body.** A record whose checksum doesn't match is treated as the end of the log, which is what makes crash recovery trustworthy (more on that below).

A 16-byte value under a 10-byte key takes 8 + 14 + 10 + 16 = 48 bytes on disk.

### Walking through set()

Every mutation follows the same order:

```
+----------------------- [ WRITE ] ------------------------+
|                                                          |
| 1  encrypt the value if asked                            |
|    before taking any lock                                |
| │                                                        |
| 2  take the write lock on the state                      |
| │                                                        |
| 3  append the record to the log                          |
|    fdatasync it if the call is durable                   |
| │                                                        |
| 4  point the index at the new value                      |
| │                                                        |
| 5  compact if the log is mostly dead history             |
| │                                                        |
| 6  release the lock, bump the counter, publish the event |
|                                                          |
+----------------------------------------------------------+
```

Here's that order playing out for an encrypted write of `settings.theme`: the value is encrypted, the record is appended, the index moves, the counter goes up and the event fires.

![An encrypted write running through the six steps: bytes scrambled into ciphertext, the record appended to rodinia.wal, the index row updated, the counter bumped and a KeyUpdated event published, then the record broken into its fields](/writing/rodinia/rodinia-write.gif)

Here's the real code:

```rust
pub fn set(
    &self,
    key: String,
    value: Vec<u8>,
    ttl_ms: Option<i64>,
    encrypted: bool,
    durable: bool,
) -> Result<(), StoreError> {
    // Do the expensive work first, before taking any lock.
    let stored = self.encode_value(&key, value, encrypted)?;

    // Log first, then index, all under the write lock.
    let existed = self.state.write().write_set(
        &key,
        &stored,
        encrypted,
        expires_at_from_ttl(ttl_ms),
        durable,
    )?;

    // After the lock is released: bump the counter, tell subscribers.
    self.publish_write(key, existed);
    Ok(())
}
```

And `write_set`, where the log and the index meet:

```rust
fn write_set(&mut self, key: &str, value: &[u8], encrypted: bool,
             expires_at: Option<u64>, durable: bool) -> Result<bool, StoreError> {
    let record = Record { kind: RecordKind::Set, key, value, encrypted, expires_at };

    // Log first. If this fails, the index is untouched.
    let (loc, record_len) = self.wal.append(&record, durable)?;

    // Only now point the index at the new value.
    self.live_bytes += record_len as u64;
    let old = self.index.insert(key.to_string(), IndexEntry { loc, record_len, encrypted, expires_at });
    if let Some(old) = old {
        self.live_bytes -= old.record_len as u64;
    }
    self.compact_if_mostly_dead();
    Ok(old.is_some())
}
```

Three decisions are worth calling out:

- **Encryption happens outside the lock.** AES-GCM is the slowest part of a write, so doing it before locking keeps other readers and writers from waiting on it.
- **The log write and the index update happen under one lock.** That guarantees the order of records in the log matches the order of changes in the index, so a replay rebuilds exactly the same state.
- **Events fire after the lock is dropped.** A slow listener on the Dart side can't hold up the next write.

`Wal::append` writes the encoded record with a single `write_all`. If the write fails halfway, it truncates the file back to where the record started, so a failed write can't leave half a record in the middle of the log.

The log is written **before** the index changes, and before the call returns to Dart. So when `store.set()` returns, the record has already been handed to the operating system. If the app is killed a moment later, the write survives. That's the gap GetStorage leaves open.

### Choosing durability per write

The first version always stopped at "handed to the operating system." That survives an app crash, but not a power cut. Now every mutating call takes a `durable` flag:

```dart
store.set('settings.theme', 'dark');                         // fast: written to the OS
store.set('wallet.balance', balance, durable: true);         // safe: fdatasync before returning
```

The difference between the two is one sync call, and it decides which failures a write survives:

```
+------------------ [ DURABILITY ] ------------------+
|                                                    |
|                   | durable: false | durable: true |
| ------------------+----------------+-------------- |
| app crash or kill |              ✓ |             ✓ |
| power loss        |              – |             ✓ |
| fdatasync         |              – |             ✓ |
| cost on s10e      |         5–8 µs |      a few ms |
|                                                    |
+----------------------------------------------------+
```

`durable: false` is the default. This is Redis's `appendfsync` idea, applied per call instead of per server: you decide which writes are worth a sync.

### Crash recovery

On startup, `Wal::open` replays the log in one forward pass to rebuild the index: a `Set` points a key at its value, a `Delete` removes the key, a `Clear` empties the index. Values are never loaded during replay; only their locations are recorded. Expired keys are dropped once the replay finishes.

If the app crashed halfway through writing a record, the final record will be truncated or its checksum won't match. Replay stops at the first record that is incomplete or fails its CRC:

```rust
loop {
    let mut frame = [0u8; FRAME_LEN as usize];
    if reader.read_exact(&mut frame).is_err() {
        break;
    }
    let body_len = u32::from_le_bytes(frame[..4].try_into().unwrap()) as u64;
    if offset + FRAME_LEN + body_len > file_len {
        break; // the record claims more bytes than the file has
    }
    // ...read the body...
    let Some(decoded) = record::decode(&buf) else {
        break; // bad checksum or malformed record
    };
    match decoded.kind {
        RecordKind::Set => { index.insert(decoded.key, /* location */); }
        RecordKind::Delete => { index.remove(&decoded.key); }
        RecordKind::Clear => index.clear(),
    }
    offset += decoded.total_len as u64;
}
```

Every way the log can end badly ends in a `break`, never an error. If the break happened before the end of the file, the file is truncated back to the last good record and synced, so new appends never land after garbage. The store always opens, with everything up to the last complete record, and a torn write costs you at most the one write that was in flight.

Here's a torn write and the replay that follows it:

![A write cut short partway through, then replay checking each record, rebuilding the index, stopping at the torn record and truncating it](/writing/rodinia/rodinia-crash.gif)

The checksum is the part the first version didn't have. A length prefix alone can tell you a record is *short*; it can't tell you a record is *wrong*. With a CRC, a half-flushed record full of zeros is caught too.

### Compaction, now automatic

An append-only log only grows. Overwrite the same key a thousand times and the log holds a thousand records for one live value.

The index already tracks `live_bytes`, the total size of the records it points at. Everything else in the file is dead history. So after every write, Rodinia checks:

```rust
fn compact_if_mostly_dead(&mut self) {
    let file_len = self.wal.file_len();
    let dead = file_len.saturating_sub(MAGIC.len() as u64 + self.live_bytes);
    if file_len > AUTO_COMPACT_MIN_BYTES && dead > self.live_bytes {
        let _ = self.compact();
    }
}
```

Two rules: the file must be over 1 MiB, so small stores don't compact constantly, and dead bytes must exceed live bytes. That keeps the file at most about twice the size of its live data, and every compaction is paid for by at least as many bytes of writes as it rewrites. You can still call `compact()` yourself; it purges expired keys first.

Compaction writes one `Set` per live key to `rodinia.wal.tmp`, syncs it, renames it over the old log and syncs the directory. A rename is atomic, so a crash during compaction leaves you with either the old log or the new one, never a half-written mix. If the process dies before the rename, the next `open` deletes the leftover temp file. Afterwards, the index is handed the new offsets for every value.

Here it is in a small model, with the floor lowered to 420 B so it trips after a few overwrites:

![Repeated overwrites growing dead bytes until both rules pass, then live records copied to rodinia.wal.tmp, synced and renamed over the log](/writing/rodinia/rodinia-compact.gif)

## The caching layer: reads without crossing the bridge

An FFI call is cheap, but it isn't free. Every `get` that goes into Rust pays for the call, the lock, a `pread`, a copy of the bytes into a Dart `Uint8List`, and a UTF-8 decode back into a `String`. In the benchmarks below that adds up to about 3 µs for a 16-byte value and 12 µs for a 1 KiB one. For one read, nobody notices. For a screen that reads thirty settings on every rebuild, it starts to show.

So each Dart handle now keeps its own cache, and a repeated `get` never leaves Dart:

```dart
T? get<T>(String key) {
  _syncCache();
  final cached = _cache.lookup(key, _nowMs) ?? _load(key);
  return cached == null ? null : _fromCached<T>(cached);
}
```

A miss pays for the whole trip into Rust and fills the cache. The next read of that key stops at the cache:

![Reads of several keys: a miss lighting the path from the Dart cache through FFI, the index and pread, then a repeat read answered by the cache, and the least recently used value evicted when the cache is full](/writing/rodinia/rodinia-read.gif)

### An LRU cache capped in bytes

`ValueCache` is a least-recently-used cache built on Dart's `LinkedHashMap`, which remembers insertion order. A hit is removed and re-inserted at the end, so the first entry is always the least recently used and is the one evicted:

```dart
CachedValue? lookup(String key, int Function() nowMs) {
  final value = _entries.remove(key);
  if (value == null) return null;
  if (value.expiresAtMs != null && value.isExpiredAt(nowMs())) {
    _sizeBytes -= _cost(key, value);
    return null;
  }
  _entries[key] = value;
  return value;
}
```

Every operation is O(1). The cap is in **bytes**, not entries: each entry is charged `value bytes + 2 × key length + 64` as an estimate of its real memory, and when the total passes `cacheBytes` (8 MiB by default) the oldest entries are evicted. A single value bigger than the whole cap is simply not cached.

Each cached value also memoizes its decoding. The first `get<String>` decodes the UTF-8 once and keeps the `String`; strings, numbers and booleans are immutable, so they're shared on every later read. Maps, lists and byte arrays are handed out as fresh copies, so mutating something you read can never corrupt the cache.

And when **you** write a value, the cache keeps the exact object you passed in. A `get<String>` straight after `set` returns that same `String`, with no encoding or decoding in between.

### Keeping every cache correct: one shared number

A cache is only as good as its invalidation. Several things can change the store behind a Dart handle's back: another handle, another isolate, a background engine. Asking Rust "did anything change?" on every read would cost an FFI call, which is exactly what the cache is trying to avoid.

The answer is a single counter. Rust keeps an `AtomicU64`, boxed so its address never moves, and increments it **after** every change: each set, delete, clear, counter update, list change, expiry and key change. When a handle opens, Rust hands Dart the counter's address once, and from then on Dart reads it directly through a `Pointer<Uint64>`, with no call into Rust at all:

```dart
void _syncCache() {
  final generation = _generation.value;   // a plain memory read
  if (generation != _seen) {
    _cache.clear();
    _seen = generation;
  }
}
```

Each handle remembers the last counter value it accounted for, `_seen`. Before a read, if the counter has moved, someone else changed the store, so the whole cache is dropped. Around its own writes, the handle reads the counter before and after the call and only patches its cache if the counter moved by exactly the number of changes it made itself. Anything else means another writer slipped in, and the cache is dropped instead of patched:

```dart
final before = _generation.value;
final result = call();
final after = _generation.value;
if (before == _seen && after - before == expected) {
  apply(result);       // only our write happened: update the cache in place
} else {
  _cache.clear();      // someone else wrote too: start over
}
_seen = after;
```

Why this is safe: Rust increments the counter *after* the data has changed. A handle that sees the counter unchanged knows nothing has happened that it hasn't accounted for. Dropping the whole cache is coarse, but it's cheap and rare, because only writes from somewhere else cause it.

Here are two handles sharing one counter. The background isolate writes, and the UI isolate notices on its next read:

![Two isolates and one shared counter: the background isolate writes, the UI isolate sees the counter has moved, drops its cache and reloads, then both drop their caches after simultaneous writes](/writing/rodinia/rodinia-counter.gif)

### Preloading on open

A cache starts empty, which means the first read of every key after launch still goes to Rust. So by default, `open` starts a background fill. `storePreload` is the one function that is *not* `sync`; it runs on flutter_rust_bridge's worker pool so it never blocks your isolate. Under the read lock, it collects the live, unencrypted index entries, sorts them by file offset, and reads their values in one forward pass over the file until it reaches `cacheBytes`.

It also returns the counter value it read under the lock. Dart applies the batch only if the counter still matches, so anything written while the preload was running wins over the preloaded data. If the preload covered every live key, the cache is marked **complete**, and from then on `getAll()` is answered from Dart without calling Rust at all.

Encrypted values are never preloaded, because the key is usually set after `open`. They enter the cache as they're read.

You never have to wait for the preload; reads before it finishes are correct, just not yet served from the cache. If you want to, `await store.preloaded`. And if memory matters more than first-read speed, `RodiniaStore.open(path, preload: false)` or `cacheBytes: 0` turns it off.

## Borrowed from Redis

Redis is the reason Rodinia looks the way it does. Redis keeps its whole dataset in memory, persists through an append-only file, and gives you small, sharp commands instead of a query language. Rodinia brings that model into a Flutter app.

| Redis                       | Rodinia                                   | What it does                             |
| --------------------------- | ----------------------------------------- | ---------------------------------------- |
| `SET key value EX`          | `set(key, value, ttl: ...)`               | Write a value, optionally with an expiry |
| `GET`                       | `get<T>(key)`                             | Read a value                             |
| `INCR` / `INCRBY`           | `increment(key, delta: n)`                | Atomic counter                           |
| `SETNX`                     | `setIfAbsent(key, value)`                 | Write only if the key isn't already set  |
| `RPUSH` / `LRANGE` / `LREM` | `listPush` / `listGet` / `deleteFromList` | Lists stored under one key               |
| `PSUBSCRIBE`                | `watch('auth.*')`                         | Subscribe to changes by pattern          |
| AOF                         | `rodinia.wal`                             | Append-only persistence                  |
| `appendfsync always`        | `durable: true`                           | Sync a write to disk before returning    |
| `BGREWRITEAOF`              | `compact()` (also automatic)              | Rewrite the log to live data only        |

### Why your keys matter

In a relational database, keys identify rows and link tables together. In a key-value store, the key is the _only_ structure you get: there are no tables, columns or queries. So the way you name keys becomes your schema.

Redis users settle on namespaced keys, with parts separated by a delimiter, and Rodinia is built around the same habit using dots:

```dart
store.set('auth.token', token, encrypted: true);
store.set('auth.refresh_token', refresh, encrypted: true);
store.set('settings.theme', 'dark');
store.set('settings.locale', 'en-NG');
store.set('cache.feed.page1', feedJson, ttl: const Duration(minutes: 10));
```

That naming pays off in three places:

- **Watching:** `watch('auth.*')` fires for every auth change and nothing else.
- **Expiry:** everything under `cache.` can carry a TTL, while `settings.` never expires.
- **Encryption:** it's obvious at a glance which namespace should always be written with `encrypted: true`.

Pick a convention early. Renaming keys later means migrating stored data. And keep secrets out of key names: keys are stored in plain text, even for encrypted values.

### Expiring keys

Any value can carry a time-to-live. A session token is the classic case. Say your backend issues a JWT and the session is allowed to live for 30 minutes. Store it encrypted, with the session timeout as its TTL:

```dart
// After login: the token lives exactly as long as the session.
store.set(
  'auth.access_token',
  jwt,
  encrypted: true,
  ttl: const Duration(minutes: 30),
);
```

If you'd rather follow the token itself, compute the TTL from its `exp` claim, `ttl: expiresAt.difference(DateTime.now())`, so the stored copy and the token run out together.

Reading it back needs no expiry check of its own. Once the 30 minutes are up, `get` returns `null`, exactly as if the key had never been set:

```dart
final token = store.get<String>('auth.access_token');
if (token == null) {
  // Expired or never set: the session is over.
  router.go('/login');
}
```

Expiry works the way Redis does it, in two ways. **Lazily:** when you read an expired key, Rodinia treats it as missing, removes it, and publishes a `KeyExpired` event. **Actively:** `purgeExpired()` sweeps every expired key at once. Expired keys are also dropped when the log is replayed on startup and during compaction.

That event means a screen can react to the session ending without polling:

```dart
store.watch('auth.*').listen((event) {
  if (event is StorageEvent_KeyExpired) router.go('/login');
});
```

There's no background timer, though. The event fires when something notices the key has expired: a read, a `purgeExpired()` call or the next startup. If you want the logout to happen when the user comes back to the app, call `store.purgeExpired()` when the app resumes.

Under the hood, expiry is just an absolute timestamp, stored on the index entry and in the record's `expires_at` field:

```rust
impl IndexEntry {
    pub fn is_expired(&self, now_ms: u64) -> bool {
        matches!(self.expires_at, Some(t) if t <= now_ms)
    }
}
```

Storing an absolute time instead of the original TTL matters. The record goes into the log as-is, so a token set with a 30-minute session still expires at the right moment after the app restarts, instead of getting a fresh 30 minutes. Killing and reopening the app can't extend a session. (The flip side: it's wall-clock time, so changing the device clock moves expiries too.) The Dart cache remembers the expiry as well, so a cached value expires on time without asking Rust.

### Counters and atomic writes

```dart
final views = store.increment('profile.views');

final claimed = store.setIfAbsent('onboarding.started', true);
```

Both run under a single write lock, so the read-check-write sequence can't interleave with another write. Without them, you'd read a value in Dart, change it, and write it back, with a window for another isolate to slip in.

Here's `increment` in Rust:

```rust
pub fn increment(&self, key: &str, delta: i64, ttl_ms: Option<i64>, durable: bool) -> Result<i64, StoreError> {
    let (next, existed) = {
        let mut state = self.state.write();
        let current = match state.live(key, now_ms()) {
            Some(entry) => {
                let bytes = state.read(&entry)?;
                std::str::from_utf8(&bytes)
                    .ok()
                    .and_then(|text| text.parse::<i64>().ok())
                    .ok_or_else(|| StoreError::InvalidCounterValue(key.to_string()))?
            }
            None => 0,
        };
        let next = current.saturating_add(delta);
        let existed = state.write_set(key, next.to_string().as_bytes(), false,
                                      expires_at_from_ttl(ttl_ms), durable)?;
        (next, existed)
    };
    self.publish_write(key.to_string(), existed);
    Ok(next)
}
```

The write lock is taken _before_ the current value is read, which is what makes it atomic. Counters are stored as decimal text, the same way Redis stores them, so `get<String>('profile.views')` returns `"42"`. And `saturating_add` means a counter that hits `i64::MAX` stops there instead of wrapping around to a negative number.

### Lists

```dart
store.listPush('recent_searches', 'flutter ffi');
store.listPush('recent_searches', 'rust wal');

final searches = store.listGet<String>('recent_searches');
store.deleteFromList('recent_searches', 'rust wal');
```

The whole list is stored as one value. Removing the last item deletes the key, just like Redis does with an empty list.

In Rust, a list is a `Vec<Vec<u8>>` serialized with bincode, and `list_push` is a read-modify-write under one lock:

```rust
let mut list = match live {
    Some(entry) => {
        let bytes = self.decode_value(key, state.read(&entry)?, entry.encrypted)?;
        decode_list(key, &bytes)?   // errors if the key holds a non-list
    }
    None => Vec::new(),
};
list.push(item);
```

Pushing to a key that holds a plain string is normally rejected with a serialization error instead of being overwritten, a lighter version of Redis's `WRONGTYPE`. If you don't pass a new TTL, the list keeps its existing expiry.

Because the whole list is rewritten on every push, lists are best kept short: recent searches, a notification queue, a handful of IDs.

## Encryption, only where you need it

Secure Storage encrypts everything, so you pay the cryptographic cost on every read. Hive encrypts a whole box with AES-256-CBC, so you end up splitting secrets and settings into separate boxes. Rodinia flips that: encryption is a per-value flag, in one store.

```dart
final key = RodiniaStore.generateEncryptionKey();
store.setEncryptionKey(key);

store.set('auth.refresh_token', token, encrypted: true);
store.set('theme', 'dark'); // plain, no crypto cost
```

Encrypted values use **AES-256-GCM** in the Rust core. Each stored value is laid out as:

```
[version: 1 byte][nonce: 12 bytes][ciphertext][auth tag: 16 bytes]
```

### Build the cipher once, not on every write

The first version built a fresh `Aes256Gcm` from the raw key bytes inside every `encrypt` and `decrypt` call. Building the cipher means expanding the 256-bit key into AES's round keys, which is real work to repeat for a 16-byte value.

Now the cipher is built exactly once, when you call `setEncryptionKey`, and stored next to the key:

```rust
struct Keyring {
    key: EncryptionKey,
    cipher: Cipher,
}

pub fn set_encryption_key(&self, key: Vec<u8>) -> Result<(), StoreError> {
    if key.len() != crypto::KEY_LEN {
        return Err(StoreError::InvalidKeyLength(key.len()));
    }
    let key = Zeroizing::new(key);           // wiped when it goes out of scope
    let mut bytes = [0u8; crypto::KEY_LEN];
    bytes.copy_from_slice(&key);
    let key = EncryptionKey::from_bytes(bytes);
    let cipher = Cipher::new(&key);           // key schedule computed once
    *self.keyring.write() = Some(Keyring { key, cipher });
    self.bump_generation();
    Ok(())
}
```

`Cipher` is a thin wrapper that owns the prepared `Aes256Gcm` and reuses it for every value:

```rust
pub struct Cipher(Aes256Gcm);

impl Cipher {
    pub fn encrypt(&self, database_key: &[u8], plaintext: &[u8]) -> Result<Vec<u8>, StoreError> {
        // A fresh nonce for every encryption.
        let mut nonce_bytes = [0u8; NONCE_LEN];
        OsRng.fill_bytes(&mut nonce_bytes);

        // The key name is authenticated, not encrypted.
        let ciphertext = self.0
            .encrypt(Nonce::from_slice(&nonce_bytes), Payload { msg: plaintext, aad: database_key })
            .map_err(|_| StoreError::Encryption)?;

        let mut output = Vec::with_capacity(1 + NONCE_LEN + ciphertext.len());
        output.push(FORMAT_VERSION);
        output.extend_from_slice(&nonce_bytes);
        output.extend_from_slice(&ciphertext);
        Ok(output)
    }
}
```

The keyring sits behind its own `RwLock`, separate from the state lock, so encrypting and decrypting never wait on a writer holding the index. And because the output format didn't change, values encrypted by the old code still decrypt with the new cipher; there's a test with a fixed ciphertext to prove it.

On the Dart side, the read cache does the rest. Encrypted values are cached **decrypted**, so a repeated read of an encrypted key costs the same as a plain one: no FFI call and no AES at all. To keep that safe, `setEncryptionKey` and `lock()` drop every encrypted entry from every cache, so a cached plaintext can never outlive the key that unlocked it.

`decrypt` reverses `encrypt`: check the version byte, split off the 12-byte nonce, and hand the rest to AES-GCM with the same key name as associated data. If a single bit of the stored bytes changed, or the key name doesn't match, the authentication tag check fails and you get an error instead of corrupted plaintext.

The nonce comes from `OsRng`, the operating system's secure random source. With AES-GCM, reusing a nonce under the same key breaks its security, so this is the one line that must never be "optimized" into a counter or a cheaper RNG.

A few details matter here:

- **A fresh random nonce for every write.** Writing the same value twice produces two different ciphertexts.
- **The key name is bound to the value.** It's passed as GCM's associated data, so it's authenticated but not encrypted. If someone tampers with the log and moves an encrypted value under a different key, decryption fails instead of returning the wrong data.
- **A version byte.** The format can change later without breaking existing data.
- **Zeroized input.** The key bytes passed in from Dart are wiped from memory once they're copied into the store.

And what it doesn't protect: key names, expiry times and the encrypted flag are plain text in the log; the key and its prepared cipher stay in process memory while set; and decrypted values in the Dart cache are ordinary Dart objects until they're evicted, dropped by `lock()`, or garbage-collected.

### Where does the key live?

Rodinia holds the encryption key in memory only. It never writes it to the log, because a key stored next to the data it protects protects nothing.

That's where the two libraries work well together. Generate the key once, keep that single key in `flutter_secure_storage` (Keystore or Keychain), and hand it to Rodinia on startup:

```dart
const secure = FlutterSecureStorage();
var encoded = await secure.read(key: 'rodinia_key');
if (encoded == null) {
  encoded = base64Encode(RodiniaStore.generateEncryptionKey());
  await secure.write(key: 'rodinia_key', value: encoded);
}
store.setEncryptionKey(base64Decode(encoded));
```

You pay the platform's secure-storage cost once per launch, for one key. Every encrypted read after that is either a cache hit or a fast in-process AES decrypt.

## Reactive storage with watch() (Pub/Sub alike)

SharedPreferences and Secure Storage don't tell you when a value changes; you re-read and hope. Hive's `box.watch(key: ...)` gets closer, but it watches one box, by exact key. Rodinia watches by pattern across the whole store. Rodinia publishes an event for every change, and Dart receives them as a `Stream`:

```dart
store.watch('auth.*').listen((event) {
  // KeyCreated,
  // KeyUpdated,
  // KeyDeleted,
  // KeyExpired,
  // StorageCleared
  print(event);
});
```

Patterns work like Redis's `PSUBSCRIBE`:

| Pattern  | Matches                                                                   |
| -------- | ------------------------------------------------------------------------- |
| `*`      | Every key (the default)                                                   |
| `auth.*` | `auth` and anything under it, like `auth.token`, but not `authentication` |
| `user_*` | Any key starting with `user_`                                             |
| `theme`  | Exactly `theme`                                                           |

A `StorageCleared` event has no key, so it goes to every subscriber.

### How matching and fan-out work

The matcher is a dozen lines:

```rust
fn pattern_matches(pattern: &str, topic: &str) -> bool {
    if pattern == "*" {
        return true;
    }
    if let Some(prefix) = pattern.strip_suffix(".*") {
        return topic == prefix || topic.starts_with(&format!("{prefix}."));
    }
    if let Some(prefix) = pattern.strip_suffix('*') {
        return topic.starts_with(prefix);
    }
    pattern == topic
}
```

The `.*` case checks for the dot on purpose. A plain prefix check would let `auth.*` match `authentication`, which is almost never what you want.

Each `watch()` call registers a subscriber on the Rust side: a pattern plus a `StreamSink`, flutter_rust_bridge's handle for pushing values into a Dart `Stream`. Publishing walks the list:

```rust
pub fn publish(&self, event: StorageEvent) {
    let mut subscribers = self.subscribers.lock();
    subscribers.retain(|subscriber| {
        let matches = match event.topic() {
            Some(topic) => pattern_matches(&subscriber.pattern, topic),
            None => true,
        };
        if matches {
            subscriber.sink.add(event.clone()).is_ok()
        } else {
            true
        }
    });
}
```

`retain` does double duty. It delivers the event, and if `sink.add` fails because the Dart stream was cancelled, it returns `false` and the subscriber is dropped in the same pass. No separate unsubscribe call is needed, and the subscriber list doesn't grow forever.

This makes Rodinia a natural source of truth for app state. Log the user out from anywhere by deleting `auth.token`, and every screen watching `auth.*` hears about it.

## Benchmarks

Claims about speed are cheap, so I measured. The benchmark app in the repo runs every store from Dart, on a real device, in a profile build:

- **Device:** Samsung Galaxy S10e, Flutter 3.47.9, profile mode, one full run on 2026-11-14.
- **Stores:** Rodinia with its defaults (8 MiB cache, preload on), Rodinia with `cacheBytes: 0`, `hive_ce`, `shared_preferences` (`SharedPreferencesWithCache`), `sqflite` (one `kv` table), `get_storage`, and `flutter_secure_storage`.
- **Method:** 500 keys per scenario (100 for `flutter_secure_storage`, whose Keystore round-trips take milliseconds), one warm-up round and three measured rounds, median reported. Synchronous APIs are timed without an `await`; asynchronous ones are awaited per operation, as an app would. Stores that write to disk in the background (GetStorage) are made to finish that work inside the timer.

sqflite joins the four from the overview because it's the other package people reach for. It's a full SQLite database, used here as a single key-value table.

### Plain storage, 500 keys

Median µs per operation, lower is better.

|             | rodinia  | rodinia (no cache) | Hive     | shared_prefs | sqflite | get_storage |
| ----------- | -------: | -----------------: | -------: | -----------: | ------: | ----------: |
| write 16 B  | 8.03     | **5.12**           | 116      | 7,702        | 13,489  | 1,587       |
| read 16 B   | **0.39** | 3.19               | 0.99     | 0.43         | 2,836   | 0.67        |
| write 1 KiB | 48.9     | **47.5**           | 112      | 20,545       | 14,426  | 16,118      |
| read 1 KiB  | **0.67** | 11.7               | 0.86     | 0.75         | 2,597   | 0.69        |
| delete      | 7.29     | **5.70**           | 124      | 10,261       | 13,262  | 906         |
| read all    | 77.9     | 670                | **53.2** | 192          | 6,376   | 75.4        |

The same numbers, one operation at a time, on a log scale:

![Animated ranking of the six stores for each plain-storage operation on a log scale](/writing/rodinia/rodinia-bench-plain.gif)

### Encrypted storage, 500 keys (flutter_secure_storage: 100)

|             | rodinia (AES-GCM) | Hive (AES-CBC) | flutter_secure_storage |
| ----------- | ----------------: | -------------: | ---------------------: |
| write 16 B  | **6.85**          | 115            | 2,464                  |
| read 16 B   | **0.27**          | 0.85           | 1,885                  |
| write 1 KiB | **76.0**          | 237            | 1,397                  |
| read 1 KiB  | **0.87**          | 0.89           | 1,928                  |
| delete      | **5.79**          | 129            | 1,448                  |
| read all    | 78.8              | **55.5**       | 17,356                 |

![Animated ranking of Rodinia, Hive and flutter_secure_storage for each encrypted operation on a log scale](/writing/rodinia/rodinia-bench-enc.gif)

### Cold start: 1,000 × 1 KiB already on disk, fresh process per store

One sample per store. *Ready* is when background loading after `open` has finished; only Rodinia loads in the background (its preload), so for the others it equals *open*.

|                       | rodinia | Hive | shared_prefs | sqflite | get_storage | secure_storage |
| --------------------- | ------: | ---: | -----------: | ------: | ----------: | -------------: |
| open (ms)             | 7.8     | 48.5 | 455          | 13.1    | 17.2        | **0.02**       |
| ready (ms)            | 39.1    | 48.5 | 455          | 13.1    | 17.2        | **0.03**       |
| first read (µs)       | 33      | **14** | 20         | 1,536   | 19          | 110,738        |
| read every key (ms)   | 6.2     | 2.4  | **0.64**     | 1,173   | 1.3         | 1,081          |
| memory growth (MiB)   | 16.1    | 10.4 | 18.3         | 25.5    | **8.2**     | 18.1           |

![Animated ranking of the six stores for each cold-start metric: open, ready, first read, read every key and memory growth](/writing/rodinia/rodinia-bench-cold.gif)

### What the numbers say

**The cache is what makes reads fast.** Compare the first two columns. Without the cache, a 16-byte read costs 3.19 µs and a 1 KiB read 11.7 µs: an FFI call, a lock, a `pread`, a copy and a decode. With the cache, the same reads cost 0.39 µs and 0.67 µs, 8× and 17× faster, and the fastest single reads in the table. `read all` drops from 670 µs to 78 µs, because a complete cache answers it without calling Rust at all.

```
+------------------- [ READS ] --------------------+
|                                                  |
|             no cache µs     cache µs             |
| read 16 B           3.2  →       0.4             |
| read 1 KiB         11.7  →       0.7             |
| read all            670  →      77.9             |
|                                                  |
+--------------------------------------------------+
```

Put next to the other stores, cached Rodinia has the fastest 16-byte read of all. Without the cache it falls to last of these, and sqflite is left off because at 2,836 µs it wouldn't fit on the scale.

```
+------------------ [ READ 16 B ] ------------------+
|                                                   |
| rodinia           [==------------------]  0.39 µs |
| shared_prefs      [===-----------------]  0.43 µs |
| get_storage       [====----------------]  0.67 µs |
| hive              [======--------------]  0.99 µs |
| rodinia no cache  [====================]  3.19 µs |
|                                                   |
+---------------------------------------------------+
```

**Writes stay fast, and the cache costs a little.** Rodinia is the fastest store at every write and delete, plain and encrypted. On 16-byte writes it's about 15× ahead of Hive, and two to three orders of magnitude ahead of the stores that rewrite a file or commit a transaction per write (shared_preferences, sqflite, get_storage). But notice that the no-cache column wins the plain writes: keeping the cache coherent costs about 1–3 µs per write. That's the price of the read numbers, and I think it's a good trade for a settings-style workload where reads far outnumber writes.

**Encryption barely shows.** A 16-byte encrypted write costs about the same as a plain one, partly because the cipher is now built once instead of per write. (The encrypted write is actually *lower* than the plain one in this run; at this scale, a microsecond or so of difference is noise.) Encrypted reads are cache hits on decrypted values, which is why they're as fast as plain reads, and why flutter_secure_storage, at almost 2 ms per read, isn't really in the same race.

**Where Rodinia doesn't win.**

- **Read all:** Hive is ahead, 53 µs against 78 µs. GetStorage is level with Rodinia.
- **Cold start, first read and read every key:** Rodinia's `open` returns in 8 ms and its preload finishes at 39 ms, faster than Hive's 48 ms but slower than sqflite and GetStorage. After that, reading every key once takes 6.2 ms, against 0.6–2.4 ms for the stores that keep decoded strings in memory. The preload caches bytes, so each value is UTF-8 decoded on its first `get`; that decode is where most of the gap comes from.
- **Memory:** Rodinia's process grew 16.1 MiB with 1,000 × 1 KiB values loaded. That's less than shared_preferences, flutter_secure_storage and sqflite, but about twice GetStorage's 8.2 MiB and more than Hive's 10.4 MiB. The cache and preload are that cost. Rust only keeps the index, so the memory is spent where the speed comes from, and `preload: false` or a smaller `cacheBytes` trades it back.

**Read these fairly.** The stores don't promise the same durability: sqflite commits a journaled transaction per write, while Rodinia and Hive flush without `fsync` (Rodinia's `durable: true` writes take a few milliseconds, and aren't in these tables). shared_preferences and flutter_secure_storage open lazily, so part of their load cost lands on the first read; compare open and first read together. And cold-start numbers are single samples: Hive's open took 24 ms in an earlier run and 48 ms in this one, so treat differences under about 2× in that table as noise.

## Rodinia vs the rest

Here's how they compare on features.

| Property                                 | SharedPreferences       | Secure Storage         | GetStorage              | Hive                                   | Rodinia                                  |
| ---------------------------------------- | ----------------------- | ---------------------- | ----------------------- | -------------------------------------- | ---------------------------------------- |
| Primary purpose                          | Simple preferences      | Sensitive data         | Lightweight state       | Local objects and app data             | App state, cache and sensitive values    |
| Implementation                           | Native platform storage | Native secure storage  | Pure Dart               | Pure Dart, append-only box file        | Rust core over sync FFI, Dart read cache |
| Platform channels                        | Yes                     | Yes                    | No                      | No                                     | No                                       |
| Synchronous reads                        | Cached APIs only        | No                     | Yes                     | Yes (regular boxes)                    | Yes                                      |
| Synchronous writes                       | No                      | No                     | Memory only, disk later | Memory now, disk write is a `Future`   | Yes, logged before returning             |
| Shared across isolates and engines       | Separate caches         | Reads through platform | Separate instances      | Via `IsolatedHive` (slower)            | One store per process, coherent caches   |
| Survives an app kill right after a write | Platform-managed        | Platform-managed       | Not guaranteed          | If the write was awaited               | Yes                                      |
| Survives power loss                      | Platform-managed        | Platform-managed       | Not guaranteed          | Not guaranteed                         | With `durable: true`                     |
| Encryption                               | Not intended for it     | Always                 | Not built in            | Per box, AES-256-CBC                   | Per value, AES-256-GCM                   |
| Expiring keys (TTL)                      | No                      | No                     | No                      | No                                     | Yes                                      |
| Atomic counters and set-if-absent        | No                      | No                     | No                      | No                                     | Yes                                      |
| Change events                            | No                      | No                     | Listen to a box         | `box.watch()`, per box or key          | Pattern subscriptions                    |
| Indexing                                 | No                      | No                     | No                      | Keys in memory; lazy boxes read on demand | Primary-key index into the log        |
| Transactions                             | No                      | No                     | No                      | No                                     | Single-key atomic ops only               |

Rodinia isn't trying to be SQLite. Its index is a primary-key index, key to file offset; there are no secondary indexes, no queries by value and no multi-key transactions. It sits in the space those libraries share, small key-value data, and tries to remove the trade-offs that space has been living with.

## Rodinia's own trade-offs

I started this post by saying trade-offs can't be avoided. Rodinia doesn't escape that rule. It picks different trade-offs, and it's worth being exact about which ones, because each is right for some apps and wrong for others.

### The big one: memory for read speed

This is the trade the whole design is built around. The index on its own makes Rodinia small: Rust holds one small entry per key and leaves the values on disk. The cache on top of it is what makes Rodinia fast, and the cache is paid for in RAM.

Here's what that buys and what it costs, from the same benchmark run:

```
+------------------- [ CACHE ] --------------------+
|                                                  |
|               |     default | cacheBytes: 0      |
| --------------+-------------+--------------      |
| read 16 B     |     0.39 µs |       3.19 µs      |
| read 1 KiB    |     0.67 µs |       11.7 µs      |
| read all      |     77.9 µs |        670 µs      |
| write 16 B    |     8.03 µs |       5.12 µs      |
| delete        |     7.29 µs |       5.70 µs      |
| values in ram | up to 8 MiB |          none      |
|                                                  |
+--------------------------------------------------+
```

**What you get:** reads 8–17× faster than going to Rust each time, and `getAll()` almost 9× faster, because a complete cache answers it without leaving Dart.

**What you pay, three ways:**

- **RAM, up front.** Each handle may hold up to `cacheBytes` of values, 8 MiB by default, and the preload fills that budget as soon as the store opens. In the cold-start test, the process grew 16.1 MiB with 1,000 × 1 KiB values loaded. GetStorage grew 8.2 MiB and Hive 10.4 MiB. That figure also includes loading the native library and the bridge, but the cache is the part you control. The budget is per handle, so two handles can mean two caches.
- **A little time on every write.** Keeping the cache coherent means reading the change counter before and after each call and updating the cache entry. That adds 1–3 µs per write or delete. Rodinia is still the fastest writer in every row of the benchmark, but the no-cache build is faster still.
- **Coarse invalidation.** When another handle or isolate writes, a handle can't tell which key changed, only *that* something changed. So it drops its whole cache and refills it read by read. In an app where one isolate writes constantly while another reads, the reader's cache keeps getting emptied, and you pay for the cache without getting much back.

**When it's the right trade:** the usual app-storage workload. Settings, tokens, feature flags, a cached profile: small values, read on every screen and written rarely, from one main isolate. Reads far outnumber writes, so a few microseconds on each write buys back much more on reads.

**When to change it:**

- **Memory-tight devices, or a large store you mostly don't read:** lower `cacheBytes` so only the hot keys stay cached.
- **Cold-start memory matters more than first-read speed:** `RodiniaStore.open(path, preload: false)` fills the cache only as you read.
- **Write-heavy, or written from several isolates at once (logging, sync queues):** `cacheBytes: 0`. Every read goes to Rust (3–12 µs), writes are fastest, and Rust keeps only the index.

Switching between the two settings shows which rows move and which way:

![The cache trade-off: bars and numbers switching between cacheBytes: 0 and the default cache for reads, writes, deletes and memory](/writing/rodinia/rodinia-trade.gif)

### Durability for latency

A default write is handed to the operating system before `set` returns. That survives the app crashing or being killed, and costs about 5–8 µs. It doesn't survive a power cut or an OS crash: the most recent writes can be lost, though never half-written, because replay cuts the log back to the last complete record. `durable: true` closes that gap with an `fdatasync`, at a cost of a few milliseconds per write, hundreds of times slower.

Rodinia makes you choose per write instead of per store. Use `durable: true` for writes you can't afford to lose, like a payment state or the last step of onboarding. Leave it off for everything else.

### Synchronous calls for a blocked thread

Synchronous `get` and `set` are the reason you never await a theme setting. They also mean every call runs on the isolate that made it. For small values that's the point. But a `durable` write, encrypting a large value, or an automatic compaction (15–20 ms on a phone, because of its syncs) blocks that isolate too. At 60 fps a frame is about 16 ms, so one of those on the UI isolate can drop a frame. Keep `durable` writes and big values off the UI isolate, or batch them.

### Cached plaintext for encrypted reads

Encrypted values are cached **decrypted**. That's why an encrypted read costs 0.27 µs and not a full AES-GCM decrypt. The price is that those plaintexts sit in Dart memory as ordinary objects until they're evicted, dropped by `lock()`, or garbage-collected. Key names and expiry times are never encrypted, even for encrypted values. If your threat model includes someone reading the app's memory, call `lock()` when the app goes to the background, and keep secrets out of key names.

### Smaller preload for slower first reads

The preload caches raw bytes, not decoded strings, so the first `get<String>` of each key pays for a UTF-8 decode. That keeps the preload cheap and makes `open` return in 8 ms. But reading every key once after launch takes 6.2 ms, against 0.6–2.4 ms for stores that decode while they load. Later reads of the same key are cache hits.

### One file for no web

The whole store is one real file read with `pread`, which is what makes the index possible. The browser has no file like that, so there's no web support yet.

## Try it

Rodinia isn't on pub.dev yet, so install it straight from GitHub:

```yaml
dependencies:
  rodinia_flutter:
    git:
      url: https://github.com/demola234/tiny-tools.git
      path: rodinia/rodinia_flutter
```

The source lives at [github.com/demola234/tiny-tools/tree/main/rodinia](https://github.com/demola234/tiny-tools/tree/main/rodinia), and the benchmark app, with instructions to run it on your own device, is in [`rodinia/benchmarks`](https://github.com/demola234/tiny-tools/tree/main/rodinia/benchmarks). Issues, ideas and pull requests are welcome. If you break it, I want to know how.
