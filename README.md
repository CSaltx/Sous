<img src="./docs/sous-64.png">

# Sous

> A Compiler made by people who love to cook

## About Sous

Ever since I was a child, I wanted to be a chef. I took culinary classes and watched every cooking video I could find. At the age of 12, I came to a harsh realization: becoming a chef is a terrible path so I chose a better one. The pay is poor, especially at the early levels, you work terrible hours, and the stress is unimaginable. However, the aching to cook never left. So, in this project, my group and I will realize my dream while combining our unique experiences in CS. Our language will improve on the many lanugage's inferior aspects, import some of our computer science experiences, and include some of the culinary professions. With conciseness, eloquent expressions, and

## Features

- [x] Variables
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

## Example 1: Hello World

### Sous

\```sous
serve("Hello World!")
\```

### JavaScript

\```javascript
console.log("Hello World");
\```

## Example 2: Variable Declarations

### Sous

\```sous
// valid
title := "Head Chef";
title = "Sous Chef";
age := 86;
\_yoe := 10;

//invalid
title := 40;
4name := "john";
title = "Dishwasher"

\```

### JavaScript

\```javascript
let title = "Head Chef";
const age = 25;
\```

## Example 3: For Loops (including concise versions)

### Sous

\```sous
for (N := 0; N < 10; ++N) {
serve(N)
}
// format FVrXY
// V is desired var to store value, X, Y are predefined values where range is [X, Y), must be defined before looping
Z := 0
T := 10
FNrZT {
serve(N)
}
\```

### JavaScript

\```javascript
for (let N = 0; N < 10; N++) {
console.log(N);
}
\```

| Sous                                                                                                                                                                                                                                                                 | JavaScript                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `serve("Hello World!")`                                                                                                                                                                                                                                              | `console.log("Hello World");`                                    |
| `// valid`<br>`title := "Head Chef";`<br>`title = "Sous Chef";`<br>`age := 86;`<br>`_yoe := 10;`<br><br>`// invalid`<br>`title := 40;`<br>`4name := "john";`<br>`title = "Dishwasher"`                                                                               | `let title = "Head Chef";`<br>`const age = 25;`                  |
| `for (N := 0; N < 10; ++N) {`<br>`    serve(N)`<br>`}`<br>`// format FVrXY`<br>`// V is desired var to store value, X, Y are predefined values where range is [X, Y), must be defined before looping`<br>`Z := 0`<br>`T := 10`<br>`FNrZT {`<br>`    serve(N)`<br>`}` | `for (let N = 0; N < 10; N++) {`<br>`    console.log(N);`<br>`}` |

> NOTE: See directory examples/ to see more examples
