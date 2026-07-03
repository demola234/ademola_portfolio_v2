---
date: "2025-09-28"
tags: ["Swift", "iOS"]
---

Swift's `@MainActor` is a compile-time guarantee that UI mutations stay on the main thread — something we used to enforce with `DispatchQueue.main.async` and hope. Actors eliminate the data races but they shift the discipline from runtime crashes to `await` boundaries. Trust the compiler, not your memory.
