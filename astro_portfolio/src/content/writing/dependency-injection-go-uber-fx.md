---
title: "Taming the Dependencies: Mastering Dependency Injection in Go with Uber Fx"
excerpt: "Dependency injection makes code more flexible, reusable, and easier to test. This guide walks through what DI is, why it matters in Go, and how Uber Fx makes wiring large applications effortless."
date: "2024-12-10"
readMins: 7
tags: ["Go", "Uber Fx", "Dependency Injection", "Architecture"]
image_url: "https://res.cloudinary.com/dcnuiaskr/image/upload/v1736672975/Dependecy_Injection_2_kglg9a.png"
medium_link: "https://blog.stackademic.com/taming-the-dependencies-mastering-dependency-injection-in-go-with-uber-fx-b3c3600e822d"
---

Dependency injection might sound complex, but at its core it's about making code more flexible, reusable, and easier to test. By the end of this article you'll understand what DI is and how to use it effectively in Go with Uber Fx.

## What is Dependency Injection?

Instead of a struct constructing its own dependencies, they are passed in from the outside:

```go
// Without DI — hard to test, tightly coupled
type UserService struct {
  db *sql.DB
}

func NewUserService() *UserService {
  db, _ := sql.Open("postgres", os.Getenv("DB_URL"))
  return &UserService{db: db}
}

// With DI — testable, loosely coupled
type UserService struct {
  db Database
}

func NewUserService(db Database) *UserService {
  return &UserService{db: db}
}
```

## Benefits of Dependency Injection

1. **Loose Coupling** — components don't know how their dependencies are created
2. **Testability** — inject fakes/mocks in tests without changing production code
3. **Reusability** — swap implementations without touching business logic
4. **Single Responsibility** — construction logic lives in one place

## Introducing Uber Fx

Fx is a dependency injection framework for Go that uses reflection to wire up your application automatically.

```sh
go get go.uber.org/fx
```

## Wiring a Simple App

```go
package main

import (
  "context"
  "go.uber.org/fx"
)

func NewDatabase() *Database {
  return &Database{conn: connectPostgres()}
}

func NewUserRepository(db *Database) *UserRepository {
  return &UserRepository{db: db}
}

func NewUserService(repo *UserRepository) *UserService {
  return &UserService{repo: repo}
}

func NewHTTPServer(svc *UserService) *http.Server {
  mux := http.NewServeMux()
  mux.HandleFunc("/users", svc.HandleGetUsers)
  return &http.Server{Addr: ":8080", Handler: mux}
}

func main() {
  fx.New(
    fx.Provide(
      NewDatabase,
      NewUserRepository,
      NewUserService,
      NewHTTPServer,
    ),
    fx.Invoke(func(s *http.Server, lc fx.Lifecycle) {
      lc.Append(fx.Hook{
        OnStart: func(ctx context.Context) error {
          go s.ListenAndServe()
          return nil
        },
        OnStop: func(ctx context.Context) error {
          return s.Shutdown(ctx)
        },
      })
    }),
  ).Run()
}
```

## Lifecycle Hooks

Fx gives you `OnStart` and `OnStop` hooks for graceful startup and shutdown — critical in production services.

## Fx Modules

Group related providers into reusable modules:

```go
var DatabaseModule = fx.Module("database",
  fx.Provide(NewDatabase, NewMigrator),
)

var UserModule = fx.Module("user",
  fx.Provide(NewUserRepository, NewUserService),
)

func main() {
  fx.New(
    DatabaseModule,
    UserModule,
    fx.Provide(NewHTTPServer),
    fx.Invoke(startServer),
  ).Run()
}
```

## When to Use Uber Fx

Fx shines in large applications with many services and dependencies. For small CLIs or simple services, manual wiring is often clearer. The break-even point is roughly when you have 5+ interconnected services.
