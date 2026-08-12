---
date: "2026-07-20"
tags: ["Flutter", "Dart", "Rust", "Concurrency"]
---

Dart isolates serialize and copy memory across message ports on separate event loops. When heavy computation or I/O occurs on the native side, spawning an OS thread in Rust and communicating back to Dart via `StreamSink` avoids isolate serialization overhead and keeps the Flutter UI thread completely unblocked.
