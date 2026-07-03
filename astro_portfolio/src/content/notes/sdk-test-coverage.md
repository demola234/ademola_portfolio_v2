---
date: "2026-02-18"
tags: ["Testing", "Flutter"]
---

Growing SDK test coverage from 4% to 76% taught me one thing: start with the event dispatcher, not the UI. Dispatchers are pure functions with clear contracts — easy to test, impossible to skip. UI tests are flaky; logic tests are gold.
