In mobile development the need for more powerful and distributed tools working among multiple distributed has arise. gRPC tools are powerful when working across many teams or in distributed teams. This is because, in addition to server-side Golang, the gRPC tools can generate code for Dart, Swift, Objective-C, Java, Kotlin and many other languages.

Working with gRPC allows you to define an API and generate networking and object model code for use on your server and any client.

In this tutorial you’ll learn how to define an API based on gRPC and how to leverage its tools to generate code for Server Side Golang and client flutter apps. You’ll learn how to:

- Read and change a **_.proto_** file that describes an API.
- Exercise a gRPC API with **_Evans_**.
- Explore gRPC Web UI
- Use the **_protoc_** command line tool to generate Dart code for your Flutter Application.
- Communite with gRPC directly in your Flutter Application

NB: The server side code used in this tutorial was built with golang

## Getting Started

### Installing Evans

[Evans](https://github.com/ktr0731/evans) is the gRPC version of something like [cURL](https://curl.se/) or [Insomnia](https://insomnia.rest/) which allows you to make calls to a server that uses gRPC without having to write an entire client app first. Evans is also a quick way to check a **_.proto_** file for errors.

On **_macOS_**, Evans is available via **_Homebrew_**. To install it, type the following in Terminal:

```bash
brew tap ktr0731/evans && brew install evans

```

On **_Linux_** the builds are available on [GitHub](https://github.com/ktr0731/evans/releases).

After you install Evans, confirm it’s working by checking the output of this command in the Terminal:

```bash
evans --version
```

**Installing Protoc and the Dart Plugin**

To generate the Swift code from a gRPC spec file you need:

- **_The `protoc` executable_**.
- **_The plug-ins for Dart_**: one for generating Swift code for `Message` items and one for generating `Service` items.

Make sure you have dart install then run:

```bash
dart pub global activate protoc_plugin
```

## Learning About gRPC

gRPC is a technology developed at Google to help you define and maintain an app interface. It has tools and plugins that generate native networking and object models code for the server and client to use with the interface.

![Untitled]("markdown/Empowering%20Seamless%20Connectivity%20Exploring%20gRPC%20an%204316ef5fd3894a489a5b81c46e4c55b5/Untitled.png")

gRPC generates server and client code from the same spec, encoded in a **_.proto_** file, regardless of the programming language used.

This helps ensure that the code is less prone to errors caused by typos in a URL or field name. Since gRPC handles the network transport, developers don’t have to write specific code to support network calls.

### How is gRPC Different from REST?

The most common way you’ve probably worked with APIs is using a REST interface with JSON. These technologies were initially built for web browsers to talk to web servers. Servers with RESTful APIs organize around URL paths and use HTTP verbs such as; GET, POST etc., to determine what resource to send to the client.

When working with a RESTful server, you usually have to encode and decode JSON data and have HTTP stack functions. Any client that can read JSON data over an HTTP connection can use a RESTful API.

gRPC sets out to make the calls to a remote server look and act like calls to other local parts of an app. Instead of constructing a URL and encoding JSON to send over HTTP, your app calls a function or method and gRPC handles encoding the data to a compact format, then transmits the data.

### Learning the Difference Between gRPC and JSON?

For encoding and decoding data objects, gRPC uses **_Protocol Buffers_**.

Unlike the plain text files used by JSON, Protocol Buffers are a binary file type, not human readable. They enable the exchange of smaller payloads, which are more efficient and suitable for low bandwidth use cases.

To get started, you must define gRPC messages and data models in a **_.proto_** file.

## Working with a **_.proto_** File

A **_.proto_** file is a text file containing definitions for all your APIs. In this tutorial the domain revolves around **_Messages_** and **_Services_**. Messages are the data objects that get sent between the client and server. Services define how messages get transported. A **_.proto_** file can also have some metadata to help the various code generators.

Most exciting to anyone who has ever struggled with comments in JSON: a **_.proto_** file can have comments! It supports both `//` style and `/* ... */` style comments!

Open the **_todo.proto_** file in the root directory of the project to explore it a bit. The first line of the file specifies the version of gRPC to use. It looks like this:

```
syntax = "proto3";

```

If this line is missing, the gRPC system will assume that you’re using version 2, not version 3. After that, some options will assist the code generator in naming things.

### Defining the Services

Next, you’ll see the service definition. The `rpc` entries will each become a `func` in the generated Dart code.

```protobuf
syntax = "proto3";

package pb;

service TodoGrpc {
    rpc CreateTask(CreateTaskRequest) returns (CreateTaskResponse){}
    rpc GetTask(EmptyGetRequest) returns (GetAllTaskResponse){}
    rpc DeleteTask(DeleteTaskRequest) returns (EmptyTaskRequest){}
    rpc UpdateTask(UpdateTaskRequest) returns (UpdateTaskResponse){}
}
```

### Defining the Messages

Here is the message spec for the `Task` object:

```protobuf
syntax = "proto3";

package pb;
import "google/protobuf/timestamp.proto";

message CreateTaskRequest {
    string task_name = 1;
    string task_description = 2;
    string task_deadline = 3;
    optional string task_status = 4;
    optional string task_priority = 5;
    optional google.protobuf.Timestamp task_createdAt = 6;
}

message CreateTaskResponse {
    string task_name = 1;
    string task_description = 2;
    string task_deadline = 3;
    optional string task_status = 4;
    optional string task_priority = 5;
    google.protobuf.Timestamp task_createdAt = 6;
    optional google.protobuf.Timestamp task_updatedAt = 7;
}

message EmptyGetRequest {

}

message GetAllTaskResponse {
    repeated Task tasks = 1;
}

message DeleteTaskRequest {
    int64 id = 1;
}

message EmptyTaskRequest {

}

message UpdateTaskRequest {
    int64 id = 1;
    string title = 2;
    optional string description = 3;
    optional string task_status = 4;
    optional string task_priority = 5;
}

message UpdateTaskResponse {
    Task task = 1;
}

message Task {
    string task_name = 1;
    optional string task_description = 2;
    optional string task_deadline = 3;
    optional string task_status = 4;
    optional string task_priority = 5;
    optional google.protobuf.Timestamp task_createdAt = 6;
    optional google.protobuf.Timestamp task_updatedAt = 7;
}

```

This code defines two fields; `title` and `todoID`. It also ensures that they’re of type `string`.

The first field is marked as `optional`. It won’t have a value until it’s been stored in the database. The code generator keeps track of each field in a message by assigning it a number.

In addition to the `string` type, a field can be many different [scalar types](https://developers.google.com/protocol-buffers/docs/proto#scalar) and each language generator will make the appropriate translations. Fields can be enumerations or even other messages. For example, below is the definition of `TodoList`, which is a collection of `Todo` instances.

```
message TodoList {
  repeated Todo todos = 1;
}

```

The `repeated` keyword means that the code will generate an array of `Todo`s. You can learn more about the different options in the [proto3 language guide](https://developers.google.com/protocol-buffers/docs/proto3).

Google provides many well-known types including: `Empty`, `Timestamp`, `BoolValue` and many more. You can [read the documentation](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf) to learn about them. Since the `homebrew` version of `protoc` isn’t bundled with them, this tutorial uses a custom one. Both strategies, using Google’s or making your own, are common.

## Exercising a **_.proto_** File With Evans

In a Terminal window, navigate to the root directory of the project. This is the directory that contains the **_todo.proto_** file. Launch Evans in REPL mode using this command:

```
evans repl --host localhost --port 1234 --proto ./todo.proto

```

You’ll see the Evans prompt, similar to this:

```
  ______
 |  ____|
 | |__    __   __   __ _   _ __    ___
 |  __|   \ \ / /  / _. | | '_ \  / __|
 | |____   \ V /  | (_| | | | | | \__ \
 |______|   \_/    \__,_| |_| |_| |___/

 more expressive universal gRPC client

todos.TodoService@localhost:1234>

```

Even though you don’t have a running gRPC server yet and haven’t generated the gRPC Swift code, Evans uses the **_todo.proto_** file to provide information about the services.

Recall from the **_todo.proto_** file that you have four messages: v

Now type the following command in the Evans prompt:

```
show message

```

You’ll see the four defined messages, like this:

```
+----------+
| MESSAGE  |
+----------+
| Empty    |
| Todo     |
| TodoID   |
| TodoList |
+----------+

```

Now type `show service` to see the list of services. Evans will show:

```
+-------------+--------------+--------------+---------------+
|   SERVICE   |     RPC      | REQUEST TYPE | RESPONSE TYPE |
+-------------+--------------+--------------+---------------+
| TodoService | FetchTodos   | Empty        | TodoList      |
| TodoService | CreateTodo   | Todo         | Todo          |
| TodoService | DeleteTodo   | TodoID       | Empty         |
+-------------+--------------+--------------+---------------+

```

To close Evans and return to Terminal type: `exit`.

You are on the right track. The next step is to generate some Swift code.

## Generating Dart Code From a **_.proto_** file

Make sure Terminal is in the directory with the **_task.proto_** file and type the following:

```bash
 protoc --dart_out=grpc:lib/core/proto/generate \
 -Ilib/core/proto lib/core/proto/*.proto
```

## Working with proto in your flutter application

Create a new file in your service folder named grpcHandler, this is meant to handle your grpc request:

```yaml
dependencies:
  protobuf: ^latest
  get_it: ^latest
  grpc: ^latest
  dartz: ^latest
  flutter_riverpod: ^latest
  freezed: ^latest

dev_dependencies:
  freezed: ^latest
```

```dart
import 'package:grpc/grpc.dart';

import '../proto/generate/todo.pbgrpc.dart';

class GrpcHandlerService {
  late TodoGrpcClient client;

  static final GrpcHandlerService _grpcHandlerService =
      GrpcHandlerService._internal();

  factory GrpcHandlerService() {
    return _grpcHandlerService;
  }

  GrpcHandlerService._internal();

  static Future<GrpcHandlerService> init() async {
    final channel = ClientChannel('localhost',
        port: 9090,
        options: const ChannelOptions(
          credentials: ChannelCredentials.insecure(),
          idleTimeout: Duration(minutes: 30),
        ));

    print('connect');

    try {
      await channel.getConnection();

      _grpcHandlerService.client = TodoGrpcClient(channel,
          options: CallOptions(
            timeout: const Duration(minutes: 30),
          ));
    } catch (e) {
      print('unable to conntect');
      rethrow;
    }

    return GrpcHandlerService();
  }
}

```

late TodoGrpcClient client

```dart
import 'package:dartz/dartz.dart';

import '../../error/failure.dart';
import '../../proto/generate/todo.pb.dart' as $pb;
import '../grpc_handler.dart';

abstract class TodoFacade {
  Future<Either<Failure, Unit>> createTodo(
      $pb.CreateTaskRequest createTaskRequest);
  Future<Either<Failure, Unit>> updateTodo(
      $pb.UpdateTaskRequest updateTaskRequest);
  Future<Either<Failure, Unit>> deleteTodo(
      $pb.DeleteTaskRequest deleteTaskRequest);

  Future<Either<Failure, $pb.GetAllTaskResponse>> listTodo();
}

class ITodoFacade implements TodoFacade {
  final GrpcHandlerService _grpcHandlerService;

  ITodoFacade(this._grpcHandlerService);

  @override
  Future<Either<Failure, Unit>> createTodo(
      $pb.CreateTaskRequest createTaskRequest) async {
    final response =
        await _grpcHandlerService.client.createTask(createTaskRequest);

    if (response.isFrozen) {
      return right(unit);
    } else {
      return left(const Failure.errorFailure('An Error Occurred'));
    }
  }

  @override
  Future<Either<Failure, Unit>> deleteTodo(
      $pb.DeleteTaskRequest deleteTaskRequest) async {
    final response =
        await _grpcHandlerService.client.deleteTask(deleteTaskRequest);

    if (response.isFrozen) {
      return right(unit);
    } else {
      return left(const Failure.errorFailure('An Error Occurred'));
    }
  }

  @override
  Future<Either<Failure, $pb.GetAllTaskResponse>> listTodo() async {
    print(_grpcHandlerService.client.getTask($pb.EmptyGetRequest()));
    final response =
        await _grpcHandlerService.client.getTask($pb.EmptyGetRequest());

    print(response);

    return right(response);
  }

  @override
  Future<Either<Failure, Unit>> updateTodo(
      $pb.UpdateTaskRequest updateTaskRequest) async {
    final response =
        await _grpcHandlerService.client.updateTask(updateTaskRequest);

    if (response.isFrozen) {
      return right(unit);
    } else {
      return left(const Failure.errorFailure('An Error Occurred'));
    }
  }
}

```

Now You can inject the grpcHandler into your

```dart
import 'package:get_it/get_it.dart';

import '../grpc/api/todo.dart';
import '../grpc/grpc_handler.dart';

final sl = GetIt.I;

Future<void> injector() async {
  sl.registerSingletonAsync<GrpcHandlerService>(
      () async => GrpcHandlerService.init());
  sl.registerLazySingleton<TodoFacade>(() => ITodoFacade(sl()));
}

```

In this tutorial we would be using riverpod and freezed to handle our states

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

import 'core/proto/generate/todo.pb.dart';

part 'todo_states.freezed.dart';

@freezed
class TodoState with _$TodoState {
  const factory TodoState.initial() = _Initial;
  const factory TodoState.loading() = _Loading;
  const factory TodoState.getTodo({required GetAllTaskResponse data}) =
      _Success;
  const factory TodoState.error({required String message}) = _Error;
}

```

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/grpc/api/todo.dart';
import 'core/injector/injector.dart';
import 'core/proto/generate/todo.pb.dart';
import 'todo_states.dart';

class TodoNotifier extends StateNotifier<TodoState> {
  TodoNotifier() : super(const TodoState.initial());

  final todoList = sl<TodoFacade>();

  getTodo() async {
    final todo = await todoList.listTodo();

    todo.fold((l) {
      state = TodoState.error(message: l.message);
    }, (r) {
      state = TodoState.getTodo(data: r);
    });
  }

  createTodo({required CreateTaskRequest createTaskRequest}) async {
    state = const TodoState.loading();

    final todoList = sl<TodoFacade>();

    final todo = await todoList.createTodo(createTaskRequest);

    todo.fold((l) {
      state = TodoState.error(message: l.message);
    }, (r) {
      getTodo();
    });
  }

  updateTodo({required UpdateTaskRequest updateTaskRequest}) async {
    state = const TodoState.loading();

    final todoList = sl<TodoFacade>();

    final todo = await todoList.updateTodo(updateTaskRequest);

    todo.fold((l) {
      state = TodoState.error(message: l.message);
    }, (r) {
      getTodo();
    });
  }

  deleteTodo({required DeleteTaskRequest deleteTaskRequest}) async {
    state = const TodoState.loading();

    final todoList = sl<TodoFacade>();

    final todo = await todoList.deleteTodo(deleteTaskRequest);

    todo.fold((l) {
      state = TodoState.error(message: l.message);
    }, (r) {
      getTodo();
    });
  }
}

final todoNotifierProvider =
    StateNotifierProvider<TodoNotifier, TodoState>((ref) => TodoNotifier());

```

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/injector/injector.dart';
import 'core/localization/generated/strings.dart';
import 'core/proto/generate/google/protobuf/timestamp.pb.dart';
import 'core/proto/generate/todo.pbgrpc.dart';
import 'todo_notifier.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations(
      [DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);

  await injector();
  runApp(const ProviderScope(child: MyHomePage()));
}

class MyHomePage extends ConsumerStatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  ConsumerState<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends ConsumerState<MyHomePage> {
  @override
  void initState() {
    super.initState();
    ref.read(todoNotifierProvider.notifier).getTodo();
  }

  @override
  Widget build(BuildContext context) {
    return
    MaterialApp(
        title: 'gRPC Pratice',
        debugShowCheckedModeBanner: false,
		    home: const Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text("gRPC Pratice"),
      ),
      body: Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          ref.watch(todoNotifierProvider).maybeWhen(orElse: () {
            return const CircularProgressIndicator();
          }, loading: () {
            return const CircularProgressIndicator();
          }, getTodo: (data) {
            return ListView.builder(
                itemCount: data.tasks.length,
                itemBuilder: (context, index) {
                  return ListTile(
                    title: Text(data.tasks[index].taskName),
                  );
                });
          }, error: (error) {
            return Text(error.toString());
          })
        ]),
      ),
      floatingActionButton: Row(
        children: [
          FloatingActionButton(
            onPressed: () {
              // Add dummy todo

              DateTime currentDate = DateTime.now(); //DateTime

              ref.read(todoNotifierProvider.notifier).createTodo(
                  createTaskRequest: CreateTaskRequest(
                      taskName: 'Hello',
                      taskCreatedAt: Timestamp.fromDateTime(currentDate),
                      taskDeadline: 'Tomorrow',
                      taskDescription: 'A short Tasks',
                      taskPriority: 'High',
                      taskStatus: 'Not Started'));
            },
            tooltip: Strings.of(context)!.increment,
            child: const Icon(Icons.add),
          ),
          ),
        ],
      ),
    );
  }
}

```

## Where to Go from Here?

The completed project is in the demo project’s **_final_** folder. You can download the project file if you haven’t already by clicking the **_Download Materials_** button at the top or bottom of this tutorial.

In this tutorial, you learned the basics of working with a **_.proto_** file to describe a gRPC API. You also learned how to generate Swift code using **_protoc_** and how to modify a Vapor app to use gRPC instead of HTTP.

The GitHub projects for **_protobuf_**, **_grpc-swift_** and **_protoc_** all contain more documentation and tutorials:
