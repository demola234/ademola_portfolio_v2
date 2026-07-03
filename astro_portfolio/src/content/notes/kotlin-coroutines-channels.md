---
date: "2025-12-11"
tags: ["Kotlin", "Android"]
---

Kotlin `Channel` vs `SharedFlow` — Channel is a queue with backpressure (good for work items), SharedFlow is a broadcast with replay (good for events). Mixing them up causes dropped UI events or unbounded queues. Know the difference before you pick.
