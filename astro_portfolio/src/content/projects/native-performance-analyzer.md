---
title: "Native Performance Analyzer"
subtitle: "Rust-powered performance profiling SDK for Flutter"
description: "A Flutter SDK that embeds a Rust native engine via FFI to capture frame timing, memory pressure, network latency, and structured logs — all correlated and exportable as OpenTelemetry metrics. Targets Flutter teams who need deep performance insight without leaving their ecosystem."
tags: ["Flutter", "Rust", "FFI", "OpenTelemetry", "Dart", "Open Source"]
category: "sdk"
---

## The Problem

Flutter DevTools covers basic profiling but misses what production teams actually need — jank detection with root cause analysis, memory pressure tied to specific widget trees, CPU usage correlated to user interactions, and exportable telemetry for CI/CD regression gates. Platform-specific tools like Xcode Instruments and Android Profiler require context switching and have no Flutter-aware layer.

## Architecture

A three-layer system: Dart SDK for data collection, Rust native engine for processing, and pluggable exporters for output.

```
Flutter App
  └── Dart SDK Layer
        ├── Frame Tracker     — SchedulerBinding.addTimingsCallback
        ├── Network Monitor   — HttpClient interceptor + Dio interceptor
        └── Log Sink          — Zone-based print() override
              │
              ▼  Dart Streams event bus
        FFI Bridge (flutter_rust_bridge)
              │
              ▼
        Rust Engine
              ├── Ring Buffer       — bounded memory, no heap growth
              └── OTel Metric Mapper
                    │
                    ├── OTLP/HTTP  → Grafana / Datadog / SigNoz / Jaeger
                    ├── JSON       → local export / CI report
                    └── Overlay HUD → in-app draggable panel
```

## Key Technical Decisions

**`flutter_rust_bridge` over raw FFI** — auto-generates Dart bindings from Rust function signatures, handles async, enums, and complex types. Saves significant binding boilerplate.

**Ring buffer storage** — fixed-capacity circular buffer in Rust: new events overwrite the oldest. Prevents unbounded heap growth in long-running production apps. Shared safely across threads via `Arc<Mutex<RingBuffer<T>>>`.

**Zone-based log interception** — overrides `ZoneSpecification.print` inside `runZoned` to capture all `print()` calls without the host app changing any code. Passes through so normal logging is unaffected.

**Event correlation** — every network call and log entry is tagged with the active frame ID at the time of recording. Answers: *"which network call caused this jank?"* without a separate distributed trace.

**Broadcast `StreamController` event bus** — fans out from three independent collectors (frames, network, logs) into a single Rust processing pipeline. Multiple listeners tap the same flow without blocking.

## Data Captured

- **Frame events** — build time, raster time, jank flag (>16ms), severe jank flag (>32ms)
- **Network events** — URL, method, status code, request/response sizes, duration, error, correlated frame ID
- **Log events** — severity level, message, tag, correlated frame ID and network ID, arbitrary attributes
- **Memory snapshots** — RSS, heap used/capacity, external bytes, sampled on a background Rust thread

## OpenTelemetry Export

Frame events map to OTel histograms, network calls to HTTP client spans, logs to OTel log records, and memory to gauge metrics. OTLP/HTTP export works with Grafana, SigNoz, Datadog, and Jaeger out of the box.

**CI mode** — headless run with configurable regression thresholds. Fails the build if frame duration p95 or error rate exceeds baseline. Baseline diff compares sessions before and after a change.

## Overlay HUD

`OverlayEntry` injected at the `MaterialApp` level — sits above the route stack, survives navigation, works with any router. Draggable, collapsible, with per-tab views for Frames, Network, and Logs. Dark/light mode aware.
