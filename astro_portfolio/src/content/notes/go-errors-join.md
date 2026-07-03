---
date: "2026-04-10"
tags: ["Go"]
---

Go's `errors.Join` finally made aggregating failures readable. Wrap with `%w`, join at the boundary, unwrap with `errors.Is` at the handler. No more string concatenation that swallows stack context.
