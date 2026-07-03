Unit testing in Flutter is a great way to ensure the quality of your code. It helps to identify bugs early on and reduce the risk of them making it to production. Unit tests can be written quickly and easily, and they provide a comprehensive overview of the code's functionality. By running unit tests regularly, you can be sure that your code is working as expected and that any changes you make don't cause unexpected issues.

# Adding dependecies

Add the following dependencies to the `pubspec.yaml` file.

```yaml
dependencies:
	state_notifier_test: ^latest_version
	flutter_riverpod: ^latest_version
	riverpod: ^latest_version
	dartz: ^latest_version

dev_dependencies:
  build_runner: any
  flutter_test:
    sdk: flutter
	freezed: ^latest_version
  freezed_annotation: ^latest_version
	mocktail: ^latest_version
```

The `state_notifier_test` dependency is necessary for running the unit tests. It will be useful for writing them.. To make sure the tests are running correctly, the `flutter_test` package should be imported as well. Finally, `freezed` and `freezed_annotation` should be imported so the unit tests can have access to the model classes. These packages help to provide a solid foundation for the unit tests and provide a way to test the data models. With these packages set up, the unit tests for Riverpod can be written.

It is important to import `flutter_riverpod` and `riverpod` package as our state management dependencies. The `build_runner` packages is an essential tools for our code generation process. It provides us with a robust and reliable way of creating and managing our code, allowing us to quickly and easily build applications that are both efficient and maintainable.

To write our unit tests, we will need to define our test methods, create our mocks, and define our assertions. `Mocktails` enable us to create mock objects that imitate the behavior of our real objects. This allows us to test our code without having to connect to an actual server or database. Mockito also provides us with an easy way to mock our data models and check that the data we expect is returned. Additionally, we can use assertions to verify that our code is working as expected. By using these tools, we can quickly and efficiently write unit tests for Riverpod.

We rely on `dartz` for our functional programming needs in Dart. It provides us with a range of powerful tools that enable us to write concise and expressive code. For example, the library provides us with an immutable data type called `Either`, which allows us to chain computations and recover from errors with ease. Additionally, `dartz` also comes with a wide variety of built-in functions that make it easy to manipulate data and create complex logic. All in all, `dartz` is an essential part of our toolkit when it comes to functional programming in Dart.

# **Getting started**

![goingdown.gif](/src/markdown/Implementing%20Unit%20tests%20for%20Riverpod%20aea68c2f9f26447ab7284963afc8d064/goingdown.gif)

First, let's create our `StateNotifier` and `State` classes using the incredibly powerful `freezed` package. This package helps us to easily manage our states and avoid bugs that can be caused by complex state management. With the help of `freezed`, we will be able to define a set of states, define transitions between them, and set the initial state. Additionally, it provides a great way to detect any invalid state transitions and to handle these cases gracefully. This makes our state management a breeze and allows us to focus on the important parts of our app.

```dart
part 'get_weather_state.freezed.dart';

@freezed
class WeatherState with _$WeatherState {
  const factory WeatherState.initial() = _Initial;
  const factory WeatherState.loading() = Loading;
  const factory WeatherState.getWeather(
      {required WeatherEntity weatherEntity}) = GetWeather;
  const factory WeatherState.error({required Failure error}) = _Error;
}
```

Run `flutter pub run build_runner build` `-delete-conflicting-outputs` to generate our states.

# Handling tests

Let's create our class of `WeatherNotifier`

```dart
class WeatherNotifier extends StateNotifier<WeatherState> {
final GetWeatherInfo getWeatherInfo;
  WeatherNotifier(this.getWeatherInfo) : super(const WeatherState.initial());

		Future<void> getWeather({required String cityName}) async {}

}
```

Following `Tdd` principles, it is important to write our tests before we write more code:

```dart
import 'weather_notifier_test.mocks.dart';

class MockGetWeatherInfo extends Mock implements GetWeatherInfo {}

void main() {
	late MockGetWeatherInfo mockGetWeatherInfo;
  late String tCityName;
  late WeatherEntity tWeatherEntity;
	setUp(() {
    mockGetWeatherInfo = MockGetWeatherInfo();
    tCityName = "London";
  });
  tWeatherEntity = const WeatherEntity(weather: [Weather()]);
}
```

`tWeatherEntity` is our default weather entity, check the click in the read me below to find the model

First, let's put our API to the test and check out what happens when we are able to successfully retrieve the weather. We can use this as a gauge to determine how reliable our API is, and if it is providing us with the data we need. If the results are satisfactory, then we can be assured that we can rely on the information that is being delivered, which is a key factor in any successful business operation. With a reliable API, we can be sure to make accurate predictions and decisions based on the data we receive.

```dart
import 'package:state_notifier_test/state_notifier_test.dart';

group('get Weather', () {
    stateNotifierTest<WeatherNotifier, WeatherState>(
      'state is GetWeatherLoading when getWeather is called',
      // Arrange - create notifier
      build: () => WeatherNotifier(mockGetWeatherInfo),
      // Arrange - set up dependencies
      setUp: () {
        when(() => mockGetWeatherInfo(Params(cityName: tCityName)))
            .thenAnswer((_) async {
          return Future<Either<Failure, WeatherEntity>>(
            () => Future.value(Right(tWeatherEntity)),
          );
        });
      },
      // Act - call the methods
      actions: (WeatherNotifier stateNotifier) async {
        await stateNotifier.getWeather(cityName: tCityName);
      },
      // Assert
      expect: () => [
        const WeatherState.loading(),
        WeatherState.getWeather(weatherEntity: tWeatherEntity),
      ],
    );
```

Now lets break this down,

- We imported our `state_notifier_test` earlier, which we added to our `pubsec.yaml` file.
- After determining the use case, we create a `group` to store all associated tests, so that we can easily keep track of them and make sure they are running properly. This will allow us to make sure that all tests related to this use case are being executed and that any issues can be quickly addressed. By having a `group` for each use case, it also makes it easier to review the results and make sure everything is working as expected.
- `stateNotifierTest` is a function that takes a notifier and a state as parameters. It ensures that the notifier is triggered when the state changes. we can use this function to write unit tests for our Riverpod code.
- The `build` function should construct the `stateNotifier` object being tested, initializing its attributes and data members with the necessary values.
- The `setUp` method is an optional step that can be taken prior to initializing the `stateNotifier` for testing. This is done to guarantee that the desired state is created and ready for the test case to be executed.
- `action` is an optional callback which, when invoked, provides you with the chance to explore its capabilities.
- `expect` is an optional `Function` that returns a `Matcher` which the `stateNotifier` under test is expected to emit after `action` is executed. In our case we expect the state to be loading before fetching the data.

Of course, if we run our test, it will likely fail since we have not implemented our notifier function.

```dart
  Future<void> getWeather({required String cityName}) async {
    state = const WeatherState.loading();

    final result = await getWeatherInfo(Params(cityName: cityName));
    result.fold(
      (l) {
        // Failure case
      },
      (r) {
        state = WeatherState.getWeather(weatherEntity: r);
      },
    );
  }
```

Now, when we run our test, it should pass without a doubt.

# Test Result

![Screenshot 2023-02-11 at 16.21.07.png](/src/markdown/Implementing%20Unit%20tests%20for%20Riverpod%20aea68c2f9f26447ab7284963afc8d064/Screenshot_2023-02-11_at_16.21.07.png)

We can now test if our data fails to fetch, which might happen when a user attempts to retrieve a city that does not exist.

```dart
stateNotifierTest<WeatherNotifier, WeatherState>(
      'state is GetWeatherError when getWeather is called',
      // Arrange - create notifier
      build: () => WeatherNotifier(mockGetWeatherInfo),
      // Arrange - set up dependencies
      setUp: () {
        when(() => mockGetWeatherInfo(Params(cityName: tCityName)))
            .thenAnswer((_) async {
          return Future<Either<Failure, WeatherEntity>>(
              () => Future.value(Left(ServerFailure())));
        });
      },
      // Act - call the methods
      actions: (WeatherNotifier stateNotifier) async {
        await stateNotifier.getWeather(cityName: tCityName);
      },
      // Assert
      expect: () => [
        const WeatherState.loading(),
        WeatherState.error(error: ServerFailure()),
      ],
    );
```

The Left to be called and a failure occured! and it is expected for the data to try loading before ultimatly failing!

Now lets write our state in the getWeather function:

```dart
class WeatherNotifier extends StateNotifier<WeatherState> {
  final GetWeatherInfo getWeatherInfo;
  WeatherNotifier(this.getWeatherInfo) : super(const WeatherState.initial());

  Future<void> getWeather({required String cityName}) async {
    state = const WeatherState.loading();

    final result = await getWeatherInfo(Params(cityName: cityName));
    result.fold(
      (l) {
        state = WeatherState.error(error: ServerFailure());
      },
      (r) {
        state = WeatherState.getWeather(weatherEntity: r);
      },
    );
  }
}
```

# Test Result

And when we run our test it should all pass:

![Screenshot 2023-02-11 at 16.27.57.png](/src/markdown/Implementing%20Unit%20tests%20for%20Riverpod%20aea68c2f9f26447ab7284963afc8d064/Screenshot_2023-02-11_at_16.27.57.png)

### **Thanks for reading**

For more information on writing integration tests, refer to the documentation. This will provide more detailed information on how to write unit tests for Riverpod and the tools available to help. Additionally, there are many tutorials available online that can help guide you through the process of writing unit tests in Dart. With the right resources, you can easily create comprehensive unit tests for your Riverpod code.

Check out the full code [**here**](https://github.com/demola234/tdd_weather)

![happy.gif](/src/markdown/Implementing%20Unit%20tests%20for%20Riverpod%20aea68c2f9f26447ab7284963afc8d064/happy.gif)
