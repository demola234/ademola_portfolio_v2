---
title: "Flutter Bunny CLI"
subtitle: "Production-ready Flutter project scaffolding from the terminal"
description: "A Dart CLI tool that eliminates Flutter project boilerplate — guided project creation, code generation for models, screens, widgets, and tests, with built-in support for Clean Architecture, MVVM, MVC, and all major state management solutions. Available on pub.dev and Homebrew."
tags: ["Dart", "CLI", "Flutter", "Dev Tools", "Open Source"]
image_url: "https://res.cloudinary.com/dcnuiaskr/image/upload/v1735473593/Flutter_Bunny_Cli_4_1_qf9ksb.png"
category: "tool"
order: 3
github: "https://github.com/FlutterBunnyCLI/flutter_bunny_cli"
---

## What It Does

Flutter Bunny CLI removes the repetitive setup work from starting and scaling Flutter projects. Rather than manually creating folder structures, writing boilerplate files, and wiring up architecture layers by hand, you answer a few prompts and the CLI scaffolds everything correctly — with the right architecture, state management, and test structure from day one.

## Architecture Support

The CLI generates opinionated scaffolding for three architecture patterns:

- **Clean Architecture** — `data / domain / presentation` vertical slices per feature, repository interfaces, use-case classes
- **MVVM** — ViewModels, repositories, service layer
- **MVC** — controllers, models, views

Each pattern wires up dependency injection automatically based on the chosen state management solution.

## State Management Integration

Full support for Provider, Riverpod, Bloc, GetX, MobX, and Redux. The CLI generates the correct boilerplate for each — not just empty files, but working patterns with the right imports, class structures, and wiring.

## Code Generation

Beyond project creation, the CLI generates individual components on demand:

- **Models** — with JSON parsing and multiple serialization options: Freezed, `json_serializable`, manual, or Equatable
- **Screens** — with the correct ViewModel/controller boilerplate for the chosen architecture
- **Widgets** — reusable component stubs
- **Tests** — unit, widget, and integration test templates pre-wired for the generated class

## Technical Highlights

- Built with Dart's `CommandRunner` pattern — each subcommand (`create`, `generate`, `analyze`) is an isolated `Command` class
- Interactive prompts via `interact` package — arrow-key navigation, multi-select, confirmation steps
- File templating engine handles variable substitution for project name, package ID, architecture tokens
- `analyze` subcommand runs project health checks — unused imports, missing test coverage, architecture violations
- 11 releases shipped, published to pub.dev and installable via Homebrew on macOS
- Fully open source — MIT license, active contributions welcome
