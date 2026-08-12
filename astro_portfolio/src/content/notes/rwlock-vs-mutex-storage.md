---
date: "2026-07-28"
tags: ["Rust", "Concurrency", "Systems"]
---

In embedded storage engines, using a single `Mutex` over the entire state causes unnecessary read contention. Pairing `RwLock<HashMap<K, V>>` for concurrent multi-reader access with a focused `Mutex<Wal>` for serializing disk appends gives you thread-safe mutations without stalling concurrent cache hits.
