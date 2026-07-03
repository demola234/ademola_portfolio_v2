---
title: "BookVally"
subtitle: "Cross-platform reading app — native Android & iOS"
description: "A cross-platform reading app built natively for Android (Kotlin + Jetpack Compose) and iOS (Swift + SwiftUI), backed by a Go REST API with 76 endpoints. Features Readium-powered EPUB rendering, offline-first sync with outbox pattern, on-device AI recap, OAuth social login, in-app purchases, TTS with background playback, and a Focus Lock mode that blocks other apps until a reading goal is met."
tags: ["Kotlin", "Jetpack Compose", "Swift", "SwiftUI", "Go", "Android", "iOS"]
category: "app"
order: 2
---

## Architecture

Both platforms share the same domain contract — identical entities, repository interfaces, and error taxonomy — re-implemented natively in Kotlin and Swift. No KMP. Each app stays fully idiomatic while staying behaviourally identical.

**Android** — Clean Architecture in a mono-app structure inspired by the Odyn micro-app framework. Features are vertical slices (`data / domain / presentation`) inside a single Gradle module. Cross-feature calls go through a typed Kotlin `EventBus` (replacing ARL string contracts). DI is compile-time via Hilt. `domain` is pure Kotlin — no Android imports, fully unit-testable.

**iOS** — Mirrors Android decision-for-decision in Swift idioms. `@Observable` ViewModels, `NavigationStack` with type-safe value routes, `URLSession` + `Codable`, SwiftData for local persistence. Cross-feature messaging via `AsyncStream`-based event bus.

**Backend (BookVault)** — Go REST API, 76 endpoints across Auth, Catalog, Library, Reader, Stats, Social, and Search. OAuth (Google / Apple / Twitter PKCE), JWT + refresh token rotation, server-validates every IAP transaction.

## Key Technical Decisions

| Concern | Android | iOS |
|---|---|---|
| UI | Jetpack Compose | SwiftUI (iOS 17+) |
| State | `StateFlow` + `collectAsStateWithLifecycle` | `@Observable` / `@State` |
| Async | Coroutines + `Flow` | `async/await` + `AsyncStream` |
| DI | Hilt (compile-time graph) | Lightweight container + `@Environment` |
| Navigation | Navigation Compose type-safe routes | `NavigationStack` + value routes |
| HTTP | Retrofit + kotlinx-serialization | `URLSession` + `Codable` |
| Local store | Room | SwiftData / GRDB |
| Cross-feature | Typed `EventBus` (Kotlin) | `AsyncStream` event bus (Swift) |

## Notable Features

**Readium Reader Engine** — EPUB pagination, reading position tracking, highlights and annotations with conflict resolution across devices.

**Offline-First Sync** — Outbox pattern: writes are persisted locally first, synced when online. Conflict resolution rules defined at the domain layer, applied identically on both platforms. Background sync via WorkManager (Android) and BGTaskScheduler (iOS).

**On-Device AI Recap** — Spoiler-safe book summaries generated entirely on-device. Uses `charOffset` boundaries to prevent summarising ahead of the reader's current position. Android: ML Kit GenAI / Gemini Nano. iOS: Apple Foundation Models (iOS 26+). Capability-gated with graceful degradation.

**Focus Lock** — Reading commitment mode that blocks other apps until a reading goal (minutes) is met. Android: UsageStats API + overlay foreground service, degrades gracefully without `PACKAGE_USAGE_STATS` permission. iOS: Screen Time / Family Controls API with entitlement gate.

**TTS & Audio** — Text-to-speech with background playback. Android: `MediaSession` + sentence prefetch. iOS: `AVAudioSession` + Now Playing integration.

**Security** — TLS certificate pinning, Readium LCP DRM for protected books, `FLAG_SECURE` / capture protection, biometric-guarded Keychain storage, data-at-rest encryption.

**Release Pipeline** — Fastlane + GitHub Actions. Lint, test, performance, and schema gates on every PR. Single-sourced versioning. CI-injected signing (`match` for iOS, upload-key for Android). Staged rollout to Play and App Store.

## Shared Domain Error Model

Typed `AppError` taxonomy defined once, implemented in both Kotlin (`sealed class`) and Swift (`enum`): `network`, `unauthorized`, `forbidden`, `notFound`, `validation(field, message)`, `conflict`, `rateLimited(retryAfter)`, `server`. Repositories return `Result<T>` — never throw. UI maps error category to treatment (inline, banner, dialog, full-screen) via a severity × surface matrix.
