---
title: "Getting Started with Jetpack Compose: A Flutter Developer's Perspective"
excerpt: "Coming from Flutter, Jetpack Compose feels surprisingly familiar — but the mental model shifts matter. Here's what I learned moving between the two."
date: "2026-06-15"
readMins: 8
tags: ["Android", "Jetpack Compose", "Kotlin", "Flutter"]
---

When I first started building Android apps alongside my Flutter work, I expected Jetpack Compose to feel completely alien. It didn't. The declarative model is similar enough that a Flutter developer can get productive quickly — but similar isn't the same, and the places where they diverge are exactly where you'll trip up if you're not paying attention.

This is what I wish someone had told me when I made the switch.

## Why Compose Matters for Android in 2025

The old Android View system — XML layouts, `findViewById`, `ViewHolder` boilerplate was painful. It was designed for a different era of mobile development, and it showed. Jetpack Compose replaces all of that with a purely Kotlin, declarative UI system that feels much closer to how modern UI frameworks think.

If you've been building with Flutter, you already understand the shift from imperative to declarative. You'll feel at home faster than most.

## Composables vs Flutter Widgets — The Mental Model Shift

In Flutter, everything is a `Widget`. In Compose, everything is a `@Composable` function.

```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name!")
}
```

Compare to Flutter:

```dart
class Greeting extends StatelessWidget {
  final String name;
  const Greeting({required this.name});

  @override
  Widget build(BuildContext context) {
    return Text('Hello, $name!');
  }
}
```

The first obvious difference: composables are plain functions, not classes. There's no `build` method, no constructor boilerplate. You just call the function and Compose handles the rest.

The second difference is **recomposition** vs Flutter's **rebuild**. In Flutter, when state changes, `build` is called again and Flutter diffs the widget tree. In Compose, only the composables that read the changed state are recomposed — and Compose is smart about skipping work it doesn't need to do. This makes Compose very efficient but also means you need to think carefully about what state lives where.

## State Hoisting vs Flutter's State Management

Flutter developers often reach for `setState`, `Provider`, `Bloc`, or `Riverpod`. Compose has its own mental model called **state hoisting** — moving state up to the caller so composables stay stateless and reusable.

```kotlin
@Composable
fun Counter(count: Int, onIncrement: () -> Unit) {
    Button(onClick = onIncrement) {
        Text("Count: $count")
    }
}

@Composable
fun CounterScreen() {
    var count by remember { mutableStateOf(0) }
    Counter(count = count, onIncrement = { count++ })
}
```

`remember` keeps the state alive across recompositions. `rememberSaveable` goes further — it survives configuration changes like screen rotation, similar to how Flutter's `PageStorageKey` or `AutomaticKeepAliveClientMixin` works.

For larger apps, Compose pairs with `ViewModel` and `StateFlow` — which maps cleanly to Bloc or Riverpod patterns you already know.

## Navigation with NavHost vs Flutter's GoRouter

Flutter's `GoRouter` and Compose's `NavHost` are remarkably similar in concept — both use a route graph with typed destinations.

```kotlin
NavHost(navController = navController, startDestination = "home") {
    composable("home") { HomeScreen(navController) }
    composable("detail/{id}") { backStackEntry ->
        DetailScreen(backStackEntry.arguments?.getString("id"))
    }
}
```

The main difference from GoRouter is that Compose navigation passes arguments as strings through the route path (though typed navigation libraries like `Destinations` solve this). For complex navigation, `Navigation Compose` combined with a typed destinations library gets you most of what GoRouter gives you.

## Theming and Material 3

Both Flutter and Compose ship Material Design out of the box. Compose uses `MaterialTheme` to provide colors, typography, and shapes throughout the tree — exactly like Flutter's `ThemeData`.

```kotlin
MaterialTheme(
    colorScheme = darkColorScheme(
        primary = Color(0xFF5AFCFE),
        background = Color(0xFF060606)
    )
) {
    MyApp()
}
```

Material 3 in Compose is more opinionated than Flutter's implementation, but the concepts map directly. If you've customised `ThemeData` in Flutter, you'll find `ColorScheme` in Compose intuitive.

## Side Effects: LaunchedEffect, DisposableEffect, SideEffect

This is where Flutter developers usually get confused, because Flutter handles side effects differently depending on which state management you're using.

In Compose, side effects are explicit:

**`LaunchedEffect`** — runs a coroutine when a key changes. Use it for one-time operations tied to state.

```kotlin
LaunchedEffect(userId) {
    viewModel.loadUser(userId)
}
```

This is similar to `initState` in Flutter, but it can re-run when its key changes.

**`DisposableEffect`** — runs setup code and returns cleanup code. Maps closely to `initState` + `dispose` in Flutter.

```kotlin
DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event -> ... }
    lifecycleOwner.lifecycle.addObserver(observer)
    onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
}
```

**`SideEffect`** — runs after every successful recomposition. Use sparingly — mostly for syncing Compose state with non-Compose code.

## The Part That Took Me Longest to Internalise

Recomposition scope. In Flutter, the widget tree rebuilds from a defined scope — your `StatefulWidget` or `Consumer`. In Compose, the scope of recomposition depends on what the composable function reads. If a composable reads state, it recomposes when that state changes. If it doesn't, it won't.

This means function boundaries become important. Extracting small, focused composables isn't just about code organisation — it directly affects performance because Compose can skip recomposing functions whose inputs haven't changed.

It also means **lambda hoisting** matters. Passing `{ viewModel.doSomething() }` as a lambda in a composable can cause the parent to recompose unnecessarily. Wrapping it in `remember` or using `rememberUpdatedState` gives you more control.

---

Coming from Flutter, Jetpack Compose will feel like home faster than you expect. The declarative model, the component-based thinking, the separation of state and UI — all of it translates. The parts that don't translate cleanly (recomposition scoping, `remember`, side effect APIs) are worth spending deliberate time on.

Once you internalise those, building Android UIs with Compose starts to feel genuinely enjoyable. Which, if you remember the XML days, is saying something.
