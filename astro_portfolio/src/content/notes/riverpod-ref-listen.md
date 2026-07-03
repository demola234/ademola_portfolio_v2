---
date: "2026-05-20"
tags: ["Flutter", "Riverpod"]
---

Riverpod's `ref.listen` is underrated for side-effects — stop cramming navigation and snackbars into `build`. Listen fires once per state change, not on every frame. Your widget tree will thank you.
