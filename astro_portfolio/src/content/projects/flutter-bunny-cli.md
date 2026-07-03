---
title: "Flutter Bunny CLI"
subtitle: "Project scaffolding for Flutter developers"
description: "A robust command-line tool that enhances Flutter developer productivity by streamlining project setup and automating repetitive tasks. Generate features, screens, BLoC classes, and repository layers with a single command."
tags: ["Dart", "CLI", "Flutter", "Dev Tools", "Open Source"]
image_url: "https://res.cloudinary.com/dcnuiaskr/image/upload/v1735473593/Flutter_Bunny_Cli_4_1_qf9ksb.png"
category: "Dev Tools, Open Source"
github: "https://github.com/demola234/flutter_bunny_cli"
---

Flutter Bunny CLI is a productivity tool for Flutter developers. It generates opinionated project scaffolding — feature folders, BLoC classes, repositories, use-cases — following clean architecture conventions.

## What It Does

```bash
# Create a new Flutter project with full clean architecture structure
bunny create my_app

# Generate a new feature with BLoC + Repository + Use-cases
bunny feature auth

# Generate a screen with boilerplate
bunny screen login --feature auth
```

## Technical Highlights

- Built entirely in Dart using the `args` package
- Published to pub.dev with 50+ weekly downloads
- Supports clean architecture, feature-first, and layered project templates
- Interactive prompts for project configuration
- Fully open source — contributions welcome
