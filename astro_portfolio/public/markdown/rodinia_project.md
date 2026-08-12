# Rodinia — Fast, Synchronous, Encrypted Key-Value Engine for Flutter

Rodinia is a fast, synchronous, optionally-encrypted key-value store designed specifically for Flutter applications. The core storage engine is implemented in **Rust** and exposed to **Dart** via `flutter_rust_bridge`. It functions as a local key-value cache and persistent store with TTLs, AES-256-GCM encryption, and live event streams — with zero asynchronous overhead for standard reads and writes.

---

## **Architecture Overview (3 Layers)**

```
Dart app
   │
   ▼
RodiniaStore (rodinia_flutter/lib/rodinia_store.dart)   ← ergonomic Dart API (set/get/watch/...)
   │  calls generated bindings in lib/src/rust/api/store.dart
   ▼
api::store (rodinia_ffi/src/api/store.rs)               ← #[frb] wire functions, the FFI surface
   │  holds a process-wide `static STORE: OnceLock<Store>`
   ▼
Store (rodinia_ffi/src/store.rs)                        ← the actual engine
   ├── cache: RwLock<HashMap<String, Entry>>             in-memory index
   ├── wal: Mutex<Wal>                                    on-disk append-only log (crash recovery)
   ├── encryption_key: RwLock<Option<EncryptionKey>>      AES-256-GCM, set at runtime
   └── events: EventBus                                   pub/sub → StreamSink<StorageEvent> to Dart
```

---

## **Core Features**

### **1. Synchronous CRUD Operations**
- Instant, non-blocking synchronous access: `set`, `get`, `contains`, `delete`, `clear`, `keys`, and `len`.
- Eliminates `Future` boilerplate and microtask delays for the common execution path.

### **2. TTL (Time-To-Live) Expiry**
- Supports expiration durations configured on `set`.
- **Lazy eviction**: Checked and pruned automatically upon read.
- **Active purging**: `purgeExpired()` allows eager sweeping and memory reclamation in the background.

### **3. Authenticated AES-256-GCM Encryption**
- `setEncryptionKey()` installs an in-memory AES-256-GCM encryption key.
- Setting `encrypted: true` on `set` encrypts values.
- Authenticated Additional Data (AAD) is bound directly to the key name (`crypto.rs`), ensuring ciphertexts cannot be swapped between keys.

### **4. Crash-Safe Persistence (Write-Ahead Log)**
- Every mutation is appended to an on-disk append-only Write-Ahead Log (`wal.rs`) prior to in-memory cache updates.
- Replayed automatically during `Store::open` to restore state reliably after app restart or unexpected termination.
- `compact()` defragments the log by rewriting only live, unexpired entries.

### **5. Reactive Event Stream**
- `watch(pattern)` returns a typed `Stream<StorageEvent>` (`KeyCreated`, `KeyUpdated`, `KeyDeleted`, `KeyExpired`, `StorageCleared`).
- Supports wildcard (`'*'`), scoped namespace (`'auth.*'`), and exact key matching.

### **6. Atomic Counters**
- Synchronous `increment(key, delta: ...)` operations natively backed by the WAL and TTL machinery.

---

## **Package Layout**

- **`rodinia_ffi/`**: Standalone Rust crate, buildable and testable independently (`cargo test`, no Flutter required).
- **`rodinia_flutter/`**: Flutter plugin wrapping the native library, with Dart bindings generated via `just gen`.
- **`examples/rodinia_flutter_example/`**: Demo application showcasing sync operations, encryption, TTLs, and reactive UI streams.

---

## **Technologies Utilized**

- **Languages**: Rust, Dart
- **Frameworks & Tooling**: Flutter, `flutter_rust_bridge`, Cargo
- **Security & Storage**: AES-256-GCM, Authenticated Additional Data (AAD), Write-Ahead Log (WAL)
