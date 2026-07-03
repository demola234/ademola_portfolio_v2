---
date: "2026-07-03"
tags: ["Rust"]
excerpt: "A running reference while learning Rust — arrays, slices, structs, enums, traits, generics, error handling, iterators, and standard collections. Code examples tested and annotated."
---

A running reference while learning Rust — covering types, control flow, traits, generics, error handling, and standard collections. Code examples tested and annotated.

---

## Arrays & Slices

Arrays are fixed-length, stack-allocated sequences where every element shares the same type. Slices are *views* into a contiguous sequence — they don't own data.

```rust
pub fn arrays() {
    let a = [1, 2, 3, 4, 5]; // [i32; 5]
    println!("first: {}", a[0]);
}

pub fn slices() {
    let a = [1, 2, 3, 4, 5];
    let slice = &a[1..3]; // borrows indices 1 and 2
    assert_eq!(slice, &[2, 3]);
    println!("slice: {:?}", slice);
}
```

The `&a[1..3]` range is **exclusive** on the right — `1..3` gives indices 1 and 2.

---

## Loops

Rust gives you three loop constructs. `for` over a collection is idiomatic and preferred — it's impossible to go out of bounds.

```rust
pub fn loops() {
    let a = [1, 2, 3, 4, 5];

    // while — manual index, can panic if bounds are wrong
    let mut index = 0;
    while index < a.len() {
        println!("while: {}", a[index]);
        index += 1;
    }

    // for — idiomatic, always safe
    for element in a {
        println!("for: {element}");
    }

    // loop — infinite until explicit break; can return a value
    let mut counter = 0;
    let result = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2; // returns 20
        }
    };
    println!("loop result: {result}");

    // rev range
    for n in (1..=3).rev() {
        println!("{n}!");
    }
}
```

---

## Structs

A **struct** groups named fields of different types into a single type. Three flavours:

### Named-field struct

```rust
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}

pub fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username, // field-init shorthand when name matches
        email,
        sign_in_count: 1,
    }
}

// Struct update syntax: copy remaining fields from an existing instance
pub fn update_email(user: User, new_email: String) -> User {
    User { email: new_email, ..user }
}
```

### Tuple struct — positional, no field names

```rust
#[derive(Debug)]
struct Color(i32, i32, i32);

#[derive(Debug)]
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
    // Color and Point are distinct types even though the fields are identical
    println!("{:?} {:?}", black, origin);
}
```

### Unit-like struct — no fields, used with traits

```rust
struct Unit;

trait SomeTrait {
    fn describe(&self) -> &str;
}

impl SomeTrait for Unit {
    fn describe(&self) -> &str { "I am Unit" }
}

fn main() {
    let u = Unit;
    println!("{}", u.describe());
}
```

### Method implementation

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // associated function (no self) — constructor
    fn new(width: u32, height: u32) -> Self {
        Self { width, height }
    }

    fn square(size: u32) -> Self {
        Self { width: size, height: size }
    }

    // immutable method
    fn area(&self) -> u32 {
        self.width * self.height
    }

    // mutable method
    fn grow(&mut self, by: u32) {
        self.width += by;
        self.height += by;
    }
}

fn main() {
    let mut rect = Rectangle::new(30, 50);
    println!("area: {}", rect.area());
    rect.grow(10);
    println!("after grow: {:#?}", rect);
}
```

---

## Enums

An enum defines a type that can be one of several named **variants**. Unlike C enums, each variant can carry different data.

```rust
#[derive(Debug)]
enum IpAddr {
    V4(u8, u8, u8, u8), // tuple variant
    V6(String),
}

fn main() {
    let home = IpAddr::V4(127, 0, 0, 1);
    let loopback = IpAddr::V6(String::from("::1"));
    println!("{:?} {:?}", home, loopback);
}
```

### Mixed variant enum with methods

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

impl Message {
    fn call(&self) {
        match self {
            Message::Quit => println!("Quit"),
            Message::Move { x, y } => println!("Move to ({x}, {y})"),
            Message::Write(text) => println!("Write: {text}"),
            Message::ChangeColor(r, g, b) => println!("Color: rgb({r},{g},{b})"),
        }
    }
}

fn main() {
    Message::Write(String::from("hello")).call();
    Message::Move { x: 10, y: 20 }.call();
    Message::ChangeColor(0, 32, 43).call();
}
```

### Option — Rust's null replacement

`Option<T>` is an enum in std: `Some(T)` or `None`. No null pointer exceptions possible.

```rust
fn main() {
    let x: i8 = 5;
    let y: Option<i8> = Some(5);

    // must handle None explicitly before using the value
    match y {
        Some(val) => println!("{}", x + val),
        None => println!("no value"),
    }

    // unwrap_or provides a fallback
    println!("{}", y.unwrap_or(0));
}
```

---

## Flow Control

### if / else if / else

```rust
fn classify(n: i32) -> &'static str {
    if n % 4 == 0 { "divisible by 4" }
    else if n % 3 == 0 { "divisible by 3" }
    else { "neither" }
}
```

### match — exhaustive pattern matching

```rust
fn roll(dice: i32) {
    match dice {
        3 => println!("add hat"),
        7 => println!("remove hat"),
        other => println!("move {other} spaces"),
    }
}
```

### if let — match a single pattern, ignore the rest

```rust
fn main() {
    let config_max: Option<u8> = Some(3u8);

    if let Some(max) = config_max {
        println!("max is {max}");
    } else {
        println!("no value");
    }
}
```

---

## Traits

A trait defines a **contract** — a set of method signatures any implementing type must provide. Think: Go interfaces, Kotlin/Swift protocols.

```rust
pub trait Summary {
    fn summarize(&self) -> String;
    // optional: default implementation
    fn preview(&self) -> String {
        format!("{}...", &self.summarize()[..50.min(self.summarize().len())])
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
}

pub struct NewsArticle {
    pub headline: String,
    pub author: String,
    pub location: String,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}
```

### Dynamic dispatch — `dyn Trait`

Use `Box<dyn Trait>` when you need to store different concrete types behind the same trait at runtime. There is a small vtable overhead vs generics.

```rust
trait Animal {
    fn sound(&self) -> String;
}

struct Sheep;
struct Cow;

impl Animal for Sheep { fn sound(&self) -> String { "Maah".into() } }
impl Animal for Cow   { fn sound(&self) -> String { "Mooh".into() } }

fn hatch(species: u8) -> Box<dyn Animal> {
    match species {
        1 => Box::new(Sheep),
        2 => Box::new(Cow),
        _ => panic!("unknown species"),
    }
}

fn main() {
    println!("{}", hatch(1).sound()); // Maah
    println!("{}", hatch(2).sound()); // Mooh

    // slice of trait objects — heterogeneous collection
    let animals: [&dyn Animal; 2] = [&Sheep, &Cow];
    for a in animals { println!("{}", a.sound()); }
}
```

### Derivable traits

The compiler can auto-implement common traits via `#[derive(...)]`:

| Trait | Purpose |
|---|---|
| `Debug` | `{:?}` formatting |
| `Clone` | explicit `.clone()` |
| `Copy` | implicit copy on assignment |
| `PartialEq` | `==` / `!=` comparisons |
| `PartialOrd` | `<` / `>` / `<=` / `>=` |

```rust
#[derive(Debug, PartialEq, PartialOrd)]
struct Centimeter(f64);

#[derive(Debug)]
struct Inches(i32);

impl Inches {
    fn to_centimeters(&self) -> Centimeter {
        let &Inches(i) = self;
        Centimeter(i as f64 * 2.54)
    }
}

fn main() {
    let foot = Inches(12);
    println!("{:?}", foot.to_centimeters()); // Centimeter(30.48)
}
```

---

## Generics

Generics let you write code that works across multiple types without duplication. Zero runtime cost — the compiler monomorphises them.

```rust
// T must implement PartialOrd so we can compare elements
pub fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest { largest = item; }
    }
    largest
}

fn main() {
    println!("{}", largest(&[34, 50, 25, 200, 65])); // 200
    println!("{}", largest(&[1.5, 2.7, 0.8]));        // 2.7
}
```

### Generic structs with multiple type params

```rust
#[derive(Debug)]
struct Pointer<T, U> { x: T, y: U }

impl<T, U> Pointer<T, U> {
    // mix fields from two different Pointer instances
    fn mixup<V, W>(self, other: Pointer<V, W>) -> Pointer<T, W> {
        Pointer { x: self.x, y: other.y }
    }
}

fn main() {
    let p1 = Pointer { x: 20i32, y: 30i32 };
    let p2 = Pointer { x: "hello", y: '-' };
    let p3 = p2.mixup(p1);
    println!("{:?}", p3); // Pointer { x: "hello", y: 30 }
}
```

---

## Type Conversions

### `From` / `Into`

Implementing `From<A> for B` gives you `Into<B> for A` for free.

```rust
#[derive(Debug)]
struct Number { value: i32 }

impl From<i32> for Number {
    fn from(value: i32) -> Self { Self { value } }
}

fn main() {
    let n1 = Number::from(42);
    let n2: Number = 42.into(); // From impl provides this
    println!("{:?} {:?}", n1, n2);
}
```

### `TryFrom` / `TryInto` — fallible conversions

```rust
#[derive(Debug, PartialEq)]
struct EvenNum(i32);

impl TryFrom<i32> for EvenNum {
    type Error = ();

    fn try_from(value: i32) -> Result<Self, Self::Error> {
        if value % 2 == 0 { Ok(EvenNum(value)) }
        else { Err(()) }
    }
}

fn main() {
    println!("{:?}", EvenNum::try_from(8)); // Ok(EvenNum(8))
    println!("{:?}", EvenNum::try_from(7)); // Err(())

    let result: Result<EvenNum, _> = 8i32.try_into();
    println!("{:?}", result);
}
```

---

## Error Handling — `Result<T, E>`

Rust has no exceptions. Functions that can fail return `Result<T, E>`. The `?` operator short-circuits on `Err`, propagating it to the caller.

```rust
use std::fs::File;
use std::io::{self, Read};
use std::num::ParseIntError;

// ? operator propagates the error automatically
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut s = String::new();
    File::open(path)?.read_to_string(&mut s)?;
    Ok(s)
}

fn multiply(a: &str, b: &str) -> Result<i32, ParseIntError> {
    let x = a.parse::<i32>()?;
    let y = b.parse::<i32>()?;
    Ok(x * y)
}

fn main() {
    match multiply("10", "2") {
        Ok(val) => println!("product: {val}"),
        Err(e)  => println!("parse error: {e}"),
    }

    // and_then chains operations on Ok values
    let result = "10".parse::<i32>()
        .and_then(|n| "2".parse::<i32>().map(|m| n * m));
    println!("{:?}", result); // Ok(20)
}
```

### Custom error types with `From`

```rust
use std::{fs, io, num};

enum CliError {
    Io(io::Error),
    Parse(num::ParseIntError),
}

impl From<io::Error>           for CliError { fn from(e: io::Error)           -> Self { CliError::Io(e) } }
impl From<num::ParseIntError>  for CliError { fn from(e: num::ParseIntError)  -> Self { CliError::Parse(e) } }

fn open_and_parse(path: &str) -> Result<i32, CliError> {
    let contents = fs::read_to_string(path)?; // io::Error → CliError via From
    let num = contents.trim().parse::<i32>()?; // ParseIntError → CliError via From
    Ok(num)
}
```

---

## Lifetimes

Lifetimes annotate how long a reference is valid. The compiler mostly infers them (lifetime elision), but explicit annotations are needed when the compiler can't determine which input reference an output reference came from.

```rust
// 'a says: the returned reference lives as long as the shorter of x or y
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn print_one<'a>(x: &'a i32) {
    println!("x is {x}");
}

fn print_multi<'a, 'b>(x: &'a i32, y: &'b i32) {
    println!("x={x}, y={y}");
}

fn main() {
    let s1 = String::from("long string");
    let result;
    {
        let s2 = String::from("xyz");
        result = longest(s1.as_str(), s2.as_str());
        println!("longest: {result}");
    }
}
```

---

## Closures

Closures are anonymous functions that can capture their enclosing environment. Rust infers the types of parameters and return values.

- `Fn` — borrows immutably
- `FnMut` — borrows mutably
- `FnOnce` — takes ownership (can only be called once)

```rust
fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 { f(x) }

fn main() {
    let factor = 3;
    let triple = |x| x * factor; // captures `factor` by reference (Fn)

    println!("{}", apply(triple, 5)); // 15

    let mut count = 0;
    let mut increment = || { count += 1; count }; // FnMut
    println!("{}", increment()); // 1
    println!("{}", increment()); // 2
}
```

---

## Iterators

Iterators are lazy — no work happens until you consume them with `.collect()`, `.for_each()`, `.fold()`, etc.

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];

    // map + filter + collect
    let evens_doubled: Vec<i32> = v.iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| x * 2)
        .collect();
    println!("{:?}", evens_doubled); // [4, 8]

    // fold — reduce to a single value
    let sum: i32 = v.iter().fold(0, |acc, &x| acc + x);
    println!("sum: {sum}"); // 15

    // zip two iterators together
    let a = [1, 2, 3];
    let b = ["one", "two", "three"];
    let zipped: Vec<_> = a.iter().zip(b.iter()).collect();
    println!("{:?}", zipped);
}
```

---

## Standard Collections

### Vec — dynamic array

```rust
fn main() {
    let mut v: Vec<i32> = Vec::with_capacity(10); // pre-allocate, avoids reallocations

    for i in 0..12 { v.push(i); }

    println!("len: {}, cap: {}", v.len(), v.capacity());

    // safe access via .get() returns Option
    match v.get(2) {
        Some(val) => println!("index 2: {val}"),
        None => println!("out of bounds"),
    }

    v.pop(); // removes last element
    v.retain(|&x| x % 2 == 0); // keep only even numbers
    println!("{:?}", v);
}
```

### HashMap

```rust
use std::collections::HashMap;

fn main() {
    let mut scores: HashMap<&str, i32> = HashMap::new();
    scores.insert("Man Utd", 1);
    scores.insert("Man City", 3);

    // entry API — insert only if key is absent
    scores.entry("Arsenal").or_insert(2);

    if let Some(pts) = scores.get("Man City") {
        println!("Man City: {pts} pts");
    }

    for (team, pts) in &scores {
        println!("{team}: {pts}");
    }

    // build from array of tuples
    let foods: HashMap<&str, i32> = [
        ("Nigerian Food", 50),
        ("Chinese Food", 100),
        ("French Food", 30),
    ].into();

    println!("{:?}", foods);
}
```

### String

```rust
fn main() {
    let mut s = String::from("hello, ");
    s.push_str("world"); // append str slice
    s.push('!');         // append single char
    println!("{s}");

    // Strings are UTF-8 — indexing by byte is unsafe, use slices or chars()
    let hello = String::from("Здравствуйте");
    for c in hello.chars() { print!("{c} "); }
    println!();
}
```

---

## Debug & Display

`Debug` (via `#[derive]`) is for developers. `Display` is for end-users — you implement it manually.

```rust
use std::fmt;

struct Matrix(f64, f64, f64, f64);

impl fmt::Display for Matrix {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "( {} {} )\n( {} {} )", self.0, self.1, self.2, self.3)
    }
}

// Display for a Vec with indices
struct List(Vec<i32>);

impl fmt::Display for List {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[")?;
        for (i, v) in self.0.iter().enumerate() {
            if i != 0 { write!(f, ", ")?; }
            write!(f, "{i}: {v}")?;
        }
        write!(f, "]")
    }
}

fn main() {
    println!("{}", Matrix(1.1, 1.2, 2.1, 2.2));
    println!("{}", List(vec![1, 2, 3])); // [0: 1, 1: 2, 2: 3]
}
```

---

## Cargo Quick Reference

```bash
cargo new my_app          # new binary project
cargo new my_lib --lib    # new library project
cargo run                 # build + run
cargo build               # debug build
cargo build --release     # optimised release build
cargo test                # run all tests
cargo add serde           # add a dependency from crates.io
cargo doc --open          # generate + open docs
```

### Module structure

```
src/
├── main.rs           ← binary entry point
├── lib.rs            ← library root (optional)
└── utils/
    ├── mod.rs        ← declares sub-modules
    ├── strings.rs
    └── numbers.rs
```

```rust
// main.rs
mod utils;
use crate::utils::numbers::add;

fn main() {
    println!("{}", add(2, 3));
}
```

---

*Source: [Rust Full Course](https://www.youtube.com/watch?v=BpPEoZW5IiY) — timestamps inline above*
