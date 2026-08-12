---
title: "Rodinia"
subtitle: "Fast, synchronous, optionally-encrypted key-value store for Flutter powered by Rust"
description: "A high-performance, synchronous key-value store for Flutter apps with the storage engine written in Rust and bridged via flutter_rust_bridge. Provides zero-async-overhead reads and writes, TTL expiry, AES-256-GCM encryption with AAD binding, crash-safe WAL persistence, and reactive event streams."
tags: ["Flutter", "Rust", "Dart", "FFI", "Cryptography", "Storage Engine", "Open Source"]
category: "sdk"
order: 2
github: "https://github.com/demola234/tiny-tools/tree/main/rodinia"
---

## What It Is

**Rodinia** is a fast, synchronous, optionally-encrypted key-value store designed for Flutter applications. The core storage engine is built in **Rust** for maximum speed, memory safety, and deterministic performance, exposed seamlessly to **Dart** via `flutter_rust_bridge`.

Think of it as a local key-value cache and persistent store featuring TTLs, AES-256-GCM authenticated encryption, and a live reactive event stream — completely eliminating `Future` and asynchronous overhead for everyday reads and writes.

---

## 3-Layer Architecture

Rodinia is designed with clear layer separation, from the high-level ergonomic Dart API down to the low-level Rust storage engine:

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

## Core Features & Engine Internals

### 1. Synchronous CRUD Operations
- Direct, synchronous API for `set`, `get`, `contains`, `delete`, `clear`, `keys`, and `len`.
- Avoids `Future` allocations and microtask queuing on the common execution path, enabling instant state access in Flutter widget build methods and controllers.

### 2. TTL (Time-To-Live) Expiry
- Set expirations per key (`ttl` duration on `set`).
- **Lazy evaluation**: Expired keys are automatically checked and discarded on read attempts.
- **Eager cleanup**: Active background sweeps via `purgeExpired()` reclaim memory for stale entries without blocking foreground operations.

### 3. Authenticated AES-256-GCM Encryption
- `setEncryptionKey()` installs an in-memory AES-256-GCM encryption key at runtime.
- Setting `encrypted: true` on `set` encrypts values before writing to the log or memory.
- **AAD Key-Binding**: Ciphertexts use Authenticated Additional Data (AAD) bound to the specific key name (`crypto.rs`), preventing ciphertext swapping attacks between different keys.

### 4. Crash-Safe Persistence via Write-Ahead Log (WAL)
- Every mutation is appended to an on-disk Write-Ahead Log (`wal.rs`) before updating the in-memory cache.
- `Store::open` automatically replays the WAL on initialization to rebuild state after app termination or crash.
- `compact()` defragments and rewrites the log file to retain only active, unexpired entries.

### 5. Reactive Event Streams
- `watch(pattern)` returns a typed `Stream<StorageEvent>` emitting events (`KeyCreated`, `KeyUpdated`, `KeyDeleted`, `KeyExpired`, `StorageCleared`).
- Pattern matching support for wildcard (`'*'`), scoped prefixes (`'auth.*'`), and exact key subscriptions.

### 6. Atomic Counters
- Native `increment(key, delta: ...)` operation executed directly in Rust.
- Fully integrated with the same WAL logging and TTL machinery for thread-safe counters.

---

## Package Layout

The project is structured as a modular mono-repository:

```
rodinia/
├── rodinia_ffi/                         # Standalone Rust crate (cargo test, no Flutter required)
│   ├── src/
│   │   ├── api/store.rs                 # #[frb] wire functions & FFI surface
│   │   ├── store.rs                     # In-memory index & store coordinator
│   │   ├── wal.rs                       # On-disk append-only Write-Ahead Log
│   │   ├── crypto.rs                    # AES-256-GCM encryption & AAD binding
│   │   └── events.rs                    # EventBus & pub/sub implementation
├── rodinia_flutter/                     # Flutter plugin package
│   ├── lib/
│   │   ├── rodinia_store.dart           # Ergonomic Dart public API
│   │   └── src/rust/                    # Generated flutter_rust_bridge bindings
│   └── justfile                         # Generation scripts (just gen)
└── examples/
    └── rodinia_flutter_example/         # Demo app showcasing CRUD, TTL, & reactive UI
```

---

## Key Technical Decisions

- **`flutter_rust_bridge` Integration**: Generates zero-copy, type-safe Dart-Rust bindings with support for synchronous wire functions and asynchronous streams.
- **Fine-Grained Concurrency**: Uses `RwLock` for concurrent multi-reader access to in-memory entries and `Mutex` on the WAL to serialize disk writes without blocking reads.
- **Standalone Testability**: The core engine in `rodinia_ffi` can be compiled, benchmarked, and tested with standard `cargo test` independently of the Flutter toolchain.
