<img src="./docs/sous-1024.png" height=64 width=64>

# Sous

<a href="https://csaltx.github.io/Sous/">Visit the Home Page</a>

> A Compiler made by people who love to cook
> <br/>
> Created by Coby Schumitzky, Milla Penelope Markovic, Clifford Phillps, and Christina Choi

## About Sous

What are the two most calming things to do? Cooking and programming. What if you could combine the two? Sous is a language that is easy to learn and easy to use. Sous is a language that is made by people who love to cook. Sous is a language that is made by people who love to program. As people from various backgrounds, we chose to develop a language that combines our passions, creating Sous—a unique programming language that infuses culinary art into computer science. Sous is intuitive, blending features like strong and static typing, object-oriented programming, and Pyth-style loops with a playful, cooking-themed syntax. This language, ever-evolving is for those who savor the art of code as much as the art of cooking, offering a flavorful twist to traditional programming.

## Features

- [x] Variables
- [x] Restaurant-Style Infusion
- [x] Functions
- [x] Classes
  - [x] Private Class Variables
  - [x] Objects 
- [x] Static Typing
- [x] Static Scoping
- [x] Optionals
- [x] Allows for Variable Immutability and Variable Mutability
- [x] Multiple Loops:
  - [x] Regular For Loops (iterations)
  - [x] Collection For Loops
  - [x] Pyth-style for loops
  - [x] While Loops
- [x] If, Else Statements
- [x] Error Handling with Try-Catch-Finally Blocks (see [example](https://github.com/CSaltx/Sous/blob/main/examples/try.sous))
  - [x] Throw Errors with the `eightysix` keyword

> **Note:** Features are tentative and likely will change/update as language develops <br/>
> More features likely to be realized as development process continues

### **Grammar**

**Important:** To understand the structure of our language, consult the [grammar](https://github.com/CSaltx/Sous/blob/main/src/sous.ohm)!

## Examples

This section provides a side-by-side comparison of how common programming tasks are accomplished in Sous versus JavaScript. The comparison aims to highlight the syntax, features, and usability of Sous.

| Sous                                                                                                                                                                                                                                                                                                                 | JavaScript                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `serve("Hello World!");`                                                                                                                                                                                                                                                                                             | `console.log("Hello World");`                                    |
| `// valid`<br>`ingredient title := "Head Chef";`<br>`ingredient title = "Sous Chef";`<br>`ingredient age := 86;`<br>`ingredient _yoe := 10;`<br><br>`// invalid`<br>`ingredient title := 40;`<br>`ingredient 4name := "john";`<br>`ingredient title = "Dishwasher"`                                                  | `let title = "Head Chef";`<br>`const age = 25;`                  |
| `for (ingredient N := 0; N < 10; ++N) {`<br>`    serve(N)`<br>`}`<br>`// format FVrXY`<br>`// V is desired var to store value, X, Y are `<br>` // predefined values where range is [X, Y), must`<br>`be defined before looping`<br>`ingredient Z := 0`<br>`ingredient T := 10`<br>`FNrZT {`<br>`    serve(N)`<br>`}` | `for (let N = 0; N < 10; N++) {`<br>`    console.log(N);`<br>`}` |

> NOTE: See directory examples/ to see more examples
