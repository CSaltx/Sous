<img src="./docs/sous-1024.png" height=64 width=64>

# Sous

> A Compiler made by people who love to cook

## About Sous

Ever since I was a child, I wanted to be a chef. I took culinary classes and watched every cooking video I could find. At the age of 12, I came to a harsh realization: becoming a chef is a terrible path so I chose a better one. The pay is poor, especially at the early levels, you work terrible hours, and the stress is unimaginable. However, the aching to cook never left. So, in this project, my group and I will realize my dream while combining our unique experiences in CS. Our language will improve on the many lanugage's inferior aspects, import some of our computer science experiences, and include some of the culinary professions. With conciseness, eloquent expressions, and a fun, unique approach, Sous cooks so you don't have to worry about it.

## Features

- [x] Variables
- [x] Restaurant-Style Infusion
- [x] Functions
- [x] Classes
- [x] Strongly-Typed
- [x] Static Typing
- [x] Type Inference
- [x] Static Scoping
- [x] Garbage Collection
- [x] Optionals
- [x] Generics
- [x] Allows for Variable Immutability and Variable Mutability
- [x] Allows for Pyth-style loops for conciseness

> Note: Features are tentative and likely will change/update as language develops <br/>
> More features likely to be realized as development process continues

## Examples

This section provides a side-by-side comparison of how common programming tasks are accomplished in Sous versus JavaScript. The comparison aims to highlight the syntax, features, and usability of Sous.

| Sous                                                                                                                                                                                                                                                                                                                 | JavaScript                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `serve("Hello World!");`                                                                                                                                                                                                                                                                                             | `console.log("Hello World");`                                    |
| `// valid`<br>`ingredient title := "Head Chef";`<br>`ingredient title = "Sous Chef";`<br>`ingredient age := 86;`<br>`ingredient _yoe := 10;`<br><br>`// invalid`<br>`ingredient title := 40;`<br>`ingredient 4name := "john";`<br>`ingredient title = "Dishwasher"`                                                  | `let title = "Head Chef";`<br>`const age = 25;`                  |
| `for (ingredient N := 0; N < 10; ++N) {`<br>`    serve(N)`<br>`}`<br>`// format FVrXY`<br>`// V is desired var to store value, X, Y are `<br>` // predefined values where range is [X, Y), must`<br>`be defined before looping`<br>`ingredient Z := 0`<br>`ingredient T := 10`<br>`FNrZT {`<br>`    serve(N)`<br>`}` | `for (let N = 0; N < 10; N++) {`<br>`    console.log(N);`<br>`}` |

> NOTE: See directory examples/ to see more examples
