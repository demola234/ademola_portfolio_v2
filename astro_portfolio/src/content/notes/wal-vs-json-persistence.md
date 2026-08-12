---
date: "2026-08-05"
tags: ["Rust", "Storage", "Architecture"]
---

Rewriting a full JSON or binary snapshot on every mutation scales with $O(N)$ data size and kills mobile flash storage with write amplification. An append-only Write-Ahead Log (WAL) makes every mutation $O(1)$ disk I/O. Pair it with an in-memory index for $O(1)$ reads, and run log compaction (`compact()`) lazily in the background.
