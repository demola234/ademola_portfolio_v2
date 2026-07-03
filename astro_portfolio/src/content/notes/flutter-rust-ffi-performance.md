---
date: "2026-07-03"
tags: ["flutter", "rust", "ffi", "performance", "observability"]
excerpt: "Notes on bridging Flutter and Rust via FFI for performance tooling — frame timing, ring buffers, event correlation, and OpenTelemetry mapping."
---

## Flutter + Rust FFI via `flutter_rust_bridge`

Raw FFI requires manually writing C-compatible bindings. `flutter_rust_bridge` auto-generates Dart bindings from Rust function signatures — handles async, enums, and complex types without boilerplate.

## Frame Timing — Detecting Jank

Flutter exposes frame timings via `SchedulerBinding.addTimingsCallback`. Each callback gives you build duration and raster duration per frame.

Thresholds: **>16ms = jank** (drops below 60fps), **>32ms = severe jank** (drops below 30fps).

## Ring Buffer — Bounded Memory in Production SDKs

Fixed-capacity circular buffer — new events overwrite the oldest. Prevents unbounded heap growth in long-running apps. Shared safely across threads using `Arc<Mutex<RingBuffer<T>>>`.

## Dart Zone-Based Log Interception

Override `ZoneSpecification.print` inside `runZoned` to intercept all `print()` calls without the host app changing a single line. Capture the message, then pass it through so normal logging still works.

## HttpClient Interceptor — Capturing All Network

Wrap Dart's base `HttpClient` to capture all HTTP traffic regardless of which package the app uses. For Dio, use a `Dio` `Interceptor` — same concept, different hook point.

## Event Correlation — Tying Network + Logs to Frames

Tag each network call and log entry with the **active frame ID** at the time it was recorded. Answers: *"which network call caused this jank?"* — without needing a separate trace.

## OpenTelemetry Mapping

| Flutter Event | OTel Concept |
|---|---|
| Frame timing | Histogram metric |
| Network call | HTTP client span |
| Log entry | Log record |
| Memory snapshot | Gauge metric |

OTLP/HTTP has the widest compatibility — Grafana, SigNoz, Datadog, and Jaeger all support it.

## OverlayEntry for Non-Intrusive Debug UI

`OverlayEntry` sits above the entire route stack — survives navigation and works with any router (GoRouter, Navigator 1.0, etc). Good pattern for debug HUDs that need to persist across screens.

## Event Bus via Dart Streams

Use a broadcast `StreamController` to fan out from multiple collectors (frames, network, logs) into a single processing layer. Broadcast streams let multiple listeners tap the same flow without blocking each other.

## Architecture Flow

```
Flutter App
  └── Dart SDK Layer
        ├── Frame Tracker (SchedulerBinding)
        ├── Network Monitor (HttpClient interceptor)
        └── Log Sink (Zone override)
              │
              ▼ (Dart Streams event bus)
        FFI Bridge (flutter_rust_bridge)
              │
              ▼
        Rust Engine
              ├── Ring Buffer (bounded storage)
              └── OTel Metric Mapper
                    │
                    ▼
              Exporters
                    ├── OTLP/HTTP → Grafana / Datadog
                    ├── JSON → local report
                    └── Overlay HUD → in-app
```
