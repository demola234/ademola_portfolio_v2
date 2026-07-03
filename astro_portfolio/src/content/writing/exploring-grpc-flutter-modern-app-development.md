---
title: "Exploring gRPC and Flutter for Modern App Development"
excerpt: "gRPC is powerful when working across distributed teams. It generates type-safe client and server code for Go, Dart, Swift, Kotlin and more — making it a natural fit for Flutter apps backed by Go microservices."
date: "2024-04-22"
readMins: 14
tags: ["Flutter", "gRPC", "Go", "Riverpod"]
image_url: "https://res.cloudinary.com/dcnuiaskr/image/upload/v1736673287/gRPC_i56qa9.png"
medium_link: "https://medium.com/stackademic/exploring-grpc-and-flutter-for-modern-app-development-ad2d890bfe95"
---

In mobile development the need for more powerful and distributed tools has grown significantly. gRPC tools are powerful when working across many teams or distributed environments. In addition to server-side Golang, gRPC can generate code for Dart, Swift, Objective-C, Java, Kotlin and many other languages.

Working with gRPC lets you define an API once and generate networking and model code for both your server and any client — including Flutter.

## What You'll Learn

- Read and modify a `.proto` file that describes an API
- Test a gRPC API with **Evans**
- Build a Flutter client that calls a Go gRPC server

## Defining the API with Protocol Buffers

```protobuf
syntax = "proto3";

package user;
option go_package = "github.com/demola234/realio/user/pb";

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
  rpc CreateUser (CreateUserRequest) returns (User);
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  string avatar_url = 4;
}

message GetUserRequest {
  string id = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}
```

## Go Server Implementation

Generate server stubs:

```bash
protoc --go_out=. --go-grpc_out=. user.proto
```

Implement the service:

```go
type UserServer struct {
  pb.UnimplementedUserServiceServer
  repo UserRepository
}

func (s *UserServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
  user, err := s.repo.FindByID(ctx, req.Id)
  if err != nil {
    return nil, status.Errorf(codes.NotFound, "user not found: %v", err)
  }
  return &pb.User{
    Id:        user.ID,
    Name:      user.Name,
    Email:     user.Email,
    AvatarUrl: user.AvatarURL,
  }, nil
}
```

## Flutter Client Setup

Add dependencies to `pubspec.yaml`:

```yaml
dependencies:
  grpc: ^3.2.4
  protobuf: ^3.1.0
```

Generate Dart stubs:

```bash
protoc --dart_out=grpc:lib/src/generated user.proto
```

Create the client:

```dart
class UserClient {
  late final ClientChannel _channel;
  late final UserServiceClient _stub;

  UserClient({required String host, required int port}) {
    _channel = ClientChannel(
      host,
      port: port,
      options: const ChannelOptions(
        credentials: ChannelCredentials.insecure(),
      ),
    );
    _stub = UserServiceClient(_channel);
  }

  Future<User> getUser(String id) async {
    final response = await _stub.getUser(
      GetUserRequest()..id = id,
    );
    return response;
  }

  Stream<User> listUsers({int page = 1, int pageSize = 20}) {
    return _stub.listUsers(
      ListUsersRequest()
        ..page = page
        ..pageSize = pageSize,
    );
  }

  Future<void> dispose() => _channel.shutdown();
}
```

## Integrating with Riverpod

```dart
final userClientProvider = Provider<UserClient>((ref) {
  return UserClient(host: 'localhost', port: 9090);
});

final userProvider = FutureProvider.family<User, String>((ref, id) async {
  final client = ref.read(userClientProvider);
  return client.getUser(id);
});
```

## Testing with Evans

Evans is a gRPC client for the terminal. Install it:

```bash
brew install evans
```

Connect to your server:

```bash
evans --host localhost --port 9090 --proto user.proto repl
```

Then call your service interactively:

```
user.UserService@localhost:9090> call GetUser
id (TYPE_STRING) => abc123
```

## Why gRPC Over REST?

| Feature | REST | gRPC |
|---------|------|------|
| Protocol | HTTP/1.1 | HTTP/2 |
| Payload | JSON | Protocol Buffers (binary) |
| Streaming | Limited | Bi-directional |
| Code gen | Optional | First-class |
| Type safety | No | Yes |

For Flutter + Go microservices, gRPC cuts payload size, eliminates serialization bugs, and makes API contracts explicit and versioned.
