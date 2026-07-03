# Taming the Dependencies: Mastering Dependency Injection in Go with Uber Fx

### What is Dependency Injection

Dependency injection might sound like a complex concept, but at its core, it’s all about making your code more flexible, reusable, and easier to test. If you’ve struggled to grasp dependency injection in Go (or any other programming language), fear not! By the end of this article, you’ll clearly understand what dependency injection is and how to use it effectively in your Go projects.

### Benefits of Dependency Injection

1. **Loose Coupling**: By injecting dependencies from the outside, we reduce the tight coupling between components, making our code more modular and easier to understand.
2. **Reusability**: When our code is not tightly bound to specific dependencies, we can reuse it in different contexts or projects more easily.
3. **Testability**: Since dependencies are passed into our code, we can easily substitute them with mock or fake implementations during testing, making our code more testable.

### Understanding Basic Dependency Injection

Let’s break it down in simple terms. Imagine you have a piece of code, let’s call it **`A`**, that needs to use another piece of code, let's call it **`B`**, to perform some task. Instead of **`A`** creating **`B`** directly inside itself, we "inject" **`B`** into **`A`**. In other words, **`A`** relies on **`B`**, but **`B`** is provided to **`A`** from the outside.

So why is this useful? Well, by injecting **`B`** into, we make **`A`** independent of **`B`**. This means we can easily swap out **`B`** for a different implementation without having to modify **`A`**. This flexibility is what makes our code loosely coupled and easier to maintain.

Now, let’s see how we can implement dependency injection in Go:

**Define an Interface**:

```go
package main
import "fmt"
type User interface {
 GetUserName() string
 GetPassword() string
 GetAge() int
}
```

We define a **`User`** interface. This interface represents the functionality that any type must implement to be considered a user.

**Create a Struct**:

```go
type Student struct {
name     string
age      int
password string
}
```

We define a **`Student`** struct that represents a user of type **`Student`**. The **`Student`** struct contains fields for **`name`**, **`age`**, and **`password`**.

**Implement the Interface**:

```go
func (s *Student) GetUserName() string {
	return s.name
}
func (s *Student) GetPassword() string {
 return s.password
}
func (s *Student) GetAge() int {
 return s.age
}
```

**Implement the Main Function:**

```go
func main() {
	student := Student{
		name:     "zhangsan",
		age:      18,
		password: "<PASSWORD>",
	}

 fmt.Println(student.GetUserName())
 fmt.Println(student.GetPassword())
 fmt.Println(student.GetAge())
```

Now run your code, by doing this we have successfully decoupled the **`struct Student`** and allow for flexible implementation in many other cases.

### Understanding the Dependency Inversion Principle

The dependency Inversion principle suggests that software modules should depend on abstractions (interfaces or abstract classes) rather than concrete implementations. Dependency Inversion enables us to decouple our code in such a way that higher-level functions don’t depend on lower-level functions. This helps in decoupling, flexibility, testability, modularity and separation of your code. Now let's try to inverse our code written above.

```go
package main
import "fmt"

// UserRepository is a high-level module that depends on the User interface
type UserRepository interface {
 GetUser() User
}

// User is a low-level module that does not depend on the UserRepository interface
type User interface {
 GetUserName() string
 GetPassword() string
 GetAge() int
}

// Student is a low-level module that does not depend on the UserRepository interface
type Student struct {
 name     string
 age      int
 password string
}

func (s *Student) GetUserName() string {
 return s.name
}

func (s *Student) GetPassword() string {
 return s.password
}

func (s *Student) GetAge() int {
 return s.age
}

// UserRepositoryImpl implements the UserRepository interface
type UserRepositoryImpl struct{}

func (u UserRepositoryImpl) GetUser() User {
 return &Student{
  name:     "zhangsan",
  age:      18,
  password: "<PASSWORD>",
 }
}

func main() {
 // Dependency inversion: UserRepository is a high-level module that depends on the User interface
 var userRepository UserRepository = UserRepositoryImpl{}
 // User is a low-level module that depends on the UserRepository interface
 var user User = userRepository.GetUser()
 fmt.Println(user.GetUserName())
 fmt.Println(user.GetPassword())
 fmt.Println(user.GetAge())
}
```

- **`UserRepository`** the interface defines a method **`GetUser()`**, which returns a **`User`**.
- **`User`** interface defines methods **`GetUserName()`**, **`GetPassword()`**, and **`GetAge()`**.
- **`Student`** struct implements the **`User`** interface. It has fields for a user's name, age, and password, and methods to get these details.
- **`UserRepositoryImpl`** is a struct implementing the **`UserRepository`** interface. It provides a concrete implementation of **`GetUser()`** the method, returning an **`User`** object, which is an **`Student`** in this case.

### What is Uber FX?

Uber Fx is a dependency injection (DI) system for Go, developed by Uber. Its primary purpose is to simplify the setup of applications by reducing boilerplate code, eliminating global state, and facilitating the easy addition of new components that are instantly accessible across the application. Additionally, it enables the creation of general-purpose, shareable modules that seamlessly integrate into the application.

Key features and benefits of Uber Fx include:

1. **Boilerplate Reduction**: Uber Fx streamlines the setup of applications by minimizing the amount of repetitive and boilerplate code required, thus improving developer productivity.
2. **Elimination of Global State**: By implementing a dependency injection approach, Uber Fx helps eliminate global states within the application, which can lead to cleaner and more maintainable code.
3. **Instant Accessibility of Components**: With Uber Fx, new components can be easily added to the application and are instantly accessible throughout the codebase without the need for explicit configuration or management.
4. **General-Purpose Shareable Modules**: Uber Fx allows developers to build modules that are designed to be shareable and reusable across different parts of the application or even across multiple projects. This promotes code reusability and modularity.

### Why use Uber Fx?

1. Makes dependency injection easy.
2. Eliminates the need for a global state and `func init()`

### Let's go

The first step is to install the library via:

```bash
go get go.uber.org/fx
```

Now on your **`main.go`** file add

```go
package main
import "go.uber.org/fx"

func main() {
  fx.New().Run()
}
```

```go
go run main.go
```

Once you run the code you should see this

```bash
[Fx] PROVIDE    fx.Lifecycle <= go.uber.org/fx.New.func1()
[Fx] PROVIDE    fx.Shutdowner <= go.uber.org/fx.(*App).shutdowner-fm()
[Fx] PROVIDE    fx.DotGraph <= go.uber.org/fx.(*App).dotGraph-fm()
[Fx] RUNNING
```

### What is fx.New?

We then run this application with the `App.Run` method. This method blocks until it receives a signal to stop, and it then runs any cleanup operations necessary before exiting.

So now let’s convert our **`UserRepository`** to use Uber.FX

```go
package main

import (
 "fmt"
 "go.uber.org/fx"
)

// UserRepository is a high-level module that depends on the User interface
type UserRepository interface {
 GetUser() User
}

// User is a low-level module that does not depend on the UserRepository interface
type User interface {
 GetUserName() string
 GetPassword() string
 GetAge() int
}

// Student is a low-level module that does not depend on the UserRepository interface
type Student struct {
 name     string
 age      int
 password string
}

func (s *Student) GetUserName() string {
 return s.name
}

func (s *Student) GetPassword() string {
 return s.password
}

func (s *Student) GetAge() int {
 return s.age
}

// UserRepositoryImpl implements the UserRepository interface
type UserRepositoryImpl struct{}
func (u UserRepositoryImpl) GetUser() User {
 return &Student{
  name:     "zhangsan",
  age:      18,
  password: "<PASSWORD>",
 }
}

// ProvideUserRepository is a function to provide the UserRepository
func ProvideUserRepository() UserRepository {
 return UserRepositoryImpl{}
}

func main() {
 fx.New(
  fx.Provide(ProvideUserRepository),
  fx.Invoke(func(u UserRepository) {
   user := u.GetUser()
   println(user.GetUserName())
   println(user.GetPassword())
   println(user.GetAge())
  }),
 ).Run()
}
```

We initialize the FX application using **`fx.New()`**.**`fx.Provide(ProvideUserRepository)`** registers **`ProvideUserRepository`** as a provider of **`UserRepository`**.**`app.Run()`** runs the application, injecting the **`UserRepository`** dependency into the provided function. Inside the function, we retrieve a **`User`** instance using the **`GetUser()`** method and print its properties using methods from the **`User`** interface. `fx.Invoke()` helps to print the user details.

### Uber FX Gin Framework

Let's Explore other uses of Uber Fx by Implementing a simple [Gin](https://github.com/gin-gonic/gin). Gin is one of the most popular frameworks for creating servers in Golang.

Let's import the Gin package

```
go get github.com/gin-gonic/gin
```

Write a function to build our GinServer

```go
package main

import (
 "context"
 "fmt"
 "net/http"
 "github.com/gin-gonic/gin"
 "go.uber.org/fx"
)

func GinServer(lc fx.Lifecycle) *gin.Engine {
r := gin.Default()
return r
}
```

Now we need to add the add a _lifecycle hook_ to the application with the `fx.Lifecycle` object. This tells Fx how to start and stop the Gin server.

```go
func GinServer(lc fx.Lifecycle) *gin.Engine {
r := gin.Default()
srv := &http.Server{
  Addr:    ":8080",
  Handler: r,
 }

 lc.Append(fx.Hook{
  OnStart: func(ctx context.Context) error {
   srv.ListenAndServe()
   return nil
  },

  OnStop: func(ctx context.Context) error {
   srv.Shutdown(ctx)
   return nil
  },
 })
 return r
}
```

Now let’s Create a struct to handle our routes

```go
type Handler struct {
	GinServer *gin.Engine
}

func (s *Handler) Say() {
 s.GinServer.GET("/ping", func(c *gin.Context) {
  c.JSON(http.StatusOK, gin.H{
   "message": "pong",
  })
 })
}

func GinServer(lc fx.Lifecycle) *gin.Engine {
    r := gin.Default()
    srv := &http.Server{
        Addr:    ":8080",
        Handler: r,
    }

    lc.Append(fx.Hook{
        OnStart: func(ctx context.Context) error {
            go func() {
                if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
                    fmt.Printf("Error starting server: %s\n", err)
                }
            }()
            fmt.Println("Gin server started on :8080")
            return nil
        },
        OnStop: func(ctx context.Context) error {
            fmt.Println("Stopping Gin server...")
            return srv.Shutdown(ctx)
        },
    })

    return r
}
```

Now Let's provide this to your Fx application above with fx.Provide.

```go
func main() {
	app := fx.New(
	fx.Provide(GinServer),
	)
	app.Run()
	}
```

Provide this to your Fx application above with `fx.Provide`

```go
func main() {
    app := fx.New(
        fx.Provide(GinServer),
        fx.Invoke(func(r *gin.Engine) {
            r.GET("/ping", func(c *gin.Context) {
                c.JSON(http.StatusOK, gin.H{
                    "message": "pong",
                })
            })
        }),
    )

    app.Run()
}
```

Now let's run our application

```
go run main.go
```

```bash
[Fx] PROVIDE    *gin.Engine <= main.GinServer()
[Fx] PROVIDE    fx.Lifecycle <= go.uber.org/fx.New.func1()
[Fx] PROVIDE    fx.Shutdowner <= go.uber.org/fx.(*App).shutdowner-fm()
[Fx] PROVIDE    fx.DotGraph <= go.uber.org/fx.(*App).dotGraph-fm()
[Fx] INVOKE             main.main.func1()
[Fx] RUN        provide: go.uber.org/fx.New.func1()
[GIN-debug] [WARNING] Creating an Engine instance with the Logger and Recovery middleware already attached.
[GIN-debug] [WARNING] Running in "debug" mode. Switch to "release" mode in production.
 - using env:   export GIN_MODE=release
 - using code:  gin.SetMode(gin.ReleaseMode)
[Fx] RUN        provide: main.GinServer()
Server is running on port 8080[Fx] HOOK OnStart         main.GinServer.func1() executing (caller: main.GinServer)
[GIN-debug] GET    /ping                    --> main.(*Handler).Say.func1 (3 handlers)
```
