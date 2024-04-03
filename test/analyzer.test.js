import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import {
  program,
  variableDeclaration,
  variable,
  binary,
  floatType,
  variableList,
} from "../src/core.js";

// Programs that are semantically correct
const semanticChecks = [
  ["variable declarations", 'ingredient x := 1; ingredient y := "stale";'],
  ["complex array types", "recipe f(ingredient x: [[[int?]]?]) {}"],
  ["increment and decrement", "ingredient x := 10; --x; ++x;"],
  ["initialize with empty array", "ingredient a := [int]();"],
  [
    "class declaration",
    "Dish S {ingredient f: (int)->boolean?; ingredient g: string;}",
  ],
  ["assign arrays", "ingredient a := [int]();ingredient b:=[1];a=b;b=a;"],
  ["assign to array element", "ingredient a := [1,2,3] | const; a[1]=100;"],
  ["short return", "recipe f() { return; }"],
  ["long return", "recipe f(): boolean { return fresh; }"],
  [
    "assign optionals",
    "ingredient a := raw int;ingredient b:=poached 1;a=b;b=a;",
  ],
  ["return in nested if", "recipe f() {if (fresh) {return;}}"],
  ["break in nested if", "while (stale) {if (fresh) {break;}}"],
  ["long if", "if (fresh) {serve(1);} else {serve(3);}"],
  [
    "elsif",
    "if (fresh) {serve(1);} else if (fresh) {serve(0);} else {serve(3);}",
  ],
  ["for over collection", "for (i in [2,3,5]) {serve(1);}"],
  ["for in range", "for(ingredient i := 0; i < 10; ++i) {serve(0);}"],
  ["conditionals with ints", "serve(fresh ? 8 : 5);"],
  ["conditionals with floats", "serve(1<2 ? 8.0 : -5.22);"],
  ["conditionals with strings", 'serve(1<2 ? "x" : "y");'],
  ["??", "ingredient x: int?; x = poached 5; serve(x ?? 0);"],
  ["array type", "ingredient x := [5, 2, 3, 4];"],
  ["nested ??", "ingredient x: int?; x = poached 5;serve(x ?? 8 ?? 0);"],
  ["||", "serve(fresh||1<2||stale||!fresh);"],
  ["&&", "serve(fresh&&1<2&&stale&&!fresh);"],
  ["bit ops", "serve((1&2)|(9^3));"],
  ["relations", 'serve(1<=2 && "x">"y" && 3.5<1.2);'],
  ["ok to == arrays", "serve([1]==[5,8]);"],
  ["ok to != arrays", "serve([1]!=[5,8]);"],
  ["shifts", "serve(1<<3<<5<<8>>2>>0);"],
  ["arithmetic", "ingredient x:=1;serve(2*3+5**-3/2-5%8);"],
  ["array length", "serve(count([1,2,3]));"],
  ["random with array literals, ints", "serve(random [1,2,3]);"], //TODO: FIX THIS, implement random function
  ["random with array literals, strings", 'serve(random ["a", "b"]);'],
  [
    "random on array variables",
    "ingredient a:=[fresh, stale];serve(random a);",
  ],
  ["variables", "ingredient x:=[[[[1]]]]; serve(x[0][0][0][0]+2);"],
  [
    "nested classes",
    "Dish T{ingredient y:int;} Dish S{ingredient z: T;} T y := new T(1);S x:= new S(y); serve(x.z.y);",
  ],
  [
    "method exp",
    "Dish x {recipe s (ingredient y : int) {serve(y);}} x test := new x();test.s(5);",
  ],
  ["int without init", "ingredient x : int;"],
  ["string without init", "ingredient x : string;"],
  ["bool without init", "ingredient x : boolean;"],
  ["member exp", "Dish S {ingredient x: int;} S y := new S(1);serve(y.x);"],
  ["subscript exp", "ingredient a:=[1,2];serve(a[0]);"],
  [
    "array of struct",
    "Dish S{} S y := new S(); S z := new S(); ingredient x:=[y, z];",
  ],
  ["assigned functions", "recipe f() {}\ningredient g := f;g = f;"],
  ["class with method", "Dish S {recipe m() {}} S y := new S(); y.m();"],
  ["array of optionals", "ingredient x := [poached 1, poached 2, poached 3];"],
  [
    "call of assigned functions",
    "recipe f(ingredient x: int) {}\ningredient g:=f;g(1);",
  ],
  [
    "type equivalence of nested arrays",
    "recipe f(ingredient x: [[int]]) {} serve(f([[1],[2]]));",
  ],
  [
    "call of assigned function in expression",
    `recipe f(ingredient x: int, ingredient y: boolean): int {}
      ingredient g := f;
      serve(g(1, fresh));
      f = g; // Type check here`,
  ],
  [
    "pass a function to a function",
    `recipe f(ingredient x: int, ingredient y: (boolean)->void): int { return 1; }
       recipe g(ingredient z: boolean) {}
       f(2, g);`,
  ],
  [
    "function return types",
    `recipe square(ingredient x: int): int { return x * x; }
       recipe compose(): (int)->int { return square; }`,
  ],
  [
    "function assign",
    "recipe f() {} ingredient g := f; ingredient h := [g, f]; serve(h[0]());",
  ],
  ["class as parameters", "Dish S {} recipe f(ingredient x: S) {}"],
  ["array parameters", "recipe f(ingredient x: [int?]) {}"],
  [
    "optional parameters",
    "recipe f(ingredient x: [int], ingredient y: string?) {}",
  ],
  [
    "types in function type",
    "recipe f(ingredient g: (int?, float)->string) {}",
  ],
  ["voids in fn type", "recipe f(ingredient g: (void)->void) {}"],
  ["outer variable", "ingredient x:=1; while(stale) {serve(x);}"],
  ["built-in constants", "serve(25.0 * π);"],
  ["built-in sin", "serve(sin(π));"],
  ["built-in cos", "serve(cos(93.999));"],
  ["built-in hypot", "serve(hypot(-4.0, 3.00001));"],
  ["break statement", "while (fresh) {break;}"],
  ["continue statement", "while (fresh) {continue;}"],
  ["try-catch", "prep {serve(1/0);} rescue (Exception e) {serve(0);}"],
  [
    "try-catch-finally",
    "prep {serve(1/0);} rescue (Exception e) {serve(0);} cleanup {serve(1);}",
  ],
  [
    "error statements (throw)",
    'eightysix("Problem with this statement", Exception);',
  ],
  [
    "pyth for statement",
    'ingredient menu := ["Soup", "Salad", "Steak", "Dessert"]; ingredient Z := 0; ingredient C := count(menu); FDrZC { serve("Preparing ", menu[Z]);}',
  ],
  ["method calls", "Dish S{recipe x(){}} S y := new S();y.x();"],
  ["float without init", "ingredient x : float;"],
  ["error Without type", 'eightysix("Error Message", Exception);'],
  ["decrement", "for (ingredient x := 0; x < 10; --x) {}"],
  ["optionals", "ingredient x: int?; x = poached 5; serve(x);"],
  ["optional ingredient", "ingredient x := poached 5;"],
  ["empty optional ingredient", "ingredient r := raw int;"],
  [
    "optional ingredients in class",
    'Dish S {ingredient x: int?; ingredient y: string?;} S z := new S(raw int, raw string); S w := new S(poached 5, poached "hello"); serve(w?.x);',
  ],
  ["any type", "ingredient a : any; a = 5;"],
];

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  [
    "non-distinct fields",
    "Dish S {ingredient x: boolean; ingredient x: int;}",
    /Ingredient x is already declared you IDIOT SANDWICH/,
  ], //TODO: Figure out if i need to chnage this to check for distinct fields
  ["non-int increment", "ingredient x:=stale;++x;", /an integer/],
  ["non-int decrement", 'ingredient x:=[""];++x;', /an integer/],
  [
    "undeclared id",
    "serve(x);",
    /Ingredient x is so raw, it doesn't even have a value in it!/,
  ],
  [
    "redeclared id",
    "ingredient x := 1;ingredient x := 1;",
    /Ingredient x is already declared you IDIOT SANDWICH/,
  ],
  [
    "assign to const",
    "ingredient x := 1 | const;x = 2;",
    /You are assigning to a constant x, get your head right and stick to the ingredients!/,
  ],
  [
    "assign bad type",
    "ingredient x:=1;x=fresh;",
    /Cannot assign a boolean to a int/,
  ],
  [
    "assign bad array type",
    "ingredient x:=1;x=[fresh];",
    /Cannot assign a \[boolean\] to a int/,
  ],
  // [
  //   "assign bad optional type",
  //   "ingredient x=1;x=some 2;",
  //   /Cannot assign a int\? to a int/,
  // ],
  ["break outside loop", "break;", /Break can only appear in a loop/],
  [
    "break inside function",
    "while (fresh) {recipe f() {break;}}",
    /Break can only appear in a loop/,
  ],
  [
    "return outside function",
    "return;",
    /This is like asparagus and milk, return can only appear in a function/,
  ],
  [
    "return value from void function",
    "recipe f() {return 1;}",
    /Cannot return a value/,
  ],
  [
    "section without modifier",
    "ingredient x := 1 |;",
    /Cannot have section without modifier/,
  ],
  [
    "return nothing from non-void",
    "recipe f(): int {return;}",
    /should be returned/,
  ],
  [
    "return type mismatch",
    "recipe f(): int {return stale;}",
    /boolean to a int/,
  ],
  ["non-boolean short if test", "if (1) {}", /Expected a boolean/],
  ["non-boolean if test", "if (1) {} else {}", /Expected a boolean/],
  ["non-boolean while test", "while (1) {}", /Expected a boolean/],
  [
    "non-integer low range",
    "for (ingredient i := fresh; i < 10; ++i) {}",
    /Expected a number or string, but what is this?/,
  ],
  [
    "non-integer high range",
    "for (ingredient i := 1; i < fresh; ++i) {}",
    /Expected equality/,
  ],
  ["non-array in for", "for (i in 100) {}", /Expected an array/],
  ["non-boolean conditional test", "serve(1?2:3);", /Expected a boolean/],
  [
    "diff types in conditional arms",
    "serve(fresh?1:fresh);",
    /Expected equality/,
  ],
  ["unwrap non-optional", "serve(1??2);", /Expected an optional/],
  ["bad types for ||", "serve(stale||1);", /Expected a boolean/],
  ["bad types for &&", "serve(stale&&1);", /Expected a boolean/],
  ["bad types for ==", "serve(stale==1);", /Expected equality/],
  ["bad types for !=", "serve(stale!=1);", /Expected equality/],
  ["bad types for +", "serve(stale+1);", /Expected a number or string/],
  ["bad types for -", "serve(stale-1);", /Does this look like a NUMBER to you/],
  ["bad types for *", "serve(stale*1);", /Does this look like a NUMBER to you/],
  ["bad types for /", "serve(stale/1);", /Does this look like a NUMBER to you/],
  ["bad types for **", "serve(stale**1);", /Does this look like a NUMBER/],
  ["bad types for <", "serve(stale<1);", /Expected a number or string/],
  ["bad types for <=", "serve(stale<=1);", /Expected a number or string/],
  ["bad types for >", "serve(stale>1);", /Expected a number or string/],
  ["bad types for >=", "serve(stale>=1);", /Expected a number or string/],
  ["bad types for ==", "serve(2==2.0);", /Expected equality/],
  ["bad types for !=", "serve(stale!=1);", /Expected equality/],
  ["bad types for negation", "serve(-fresh);", /Does this look like a NUMBER/],
  ["bad types for not", 'serve(!"hello");', /Expected a boolean/],
  ["bad types for random", "serve(random 3);", /Expected an array/],
  [
    "non-integer index",
    "ingredient a:=[1];serve(a[stale]);",
    /Expected an integer/,
  ],
  [
    "no such field",
    "Dish S {} S x:=new S(); serve(x.y);",
    /Member y is so bland/,
  ],
  [
    "diff type array elements",
    "serve([3,3.0]);",
    /These don't have the same type/,
  ],
  [
    "shadowing",
    "ingredient x := 1;\nwhile (fresh) {ingredient x := 1;}",
    /Ingredient x is already declared you/,
  ],
  [
    "call of uncallable",
    "ingredient x := 1;\nserve(x());",
    /You're calling a non-function or non-constructor, you donut!/,
  ],
  [
    "Too many args",
    "recipe f(ingredient x: int) {}\nf(1,2);",
    /1 ingredient\(s\) required but 2 passed/,
  ],
  [
    "Too few args",
    "recipe f(ingredient x: int) {}\nf();",
    /1 ingredient\(s\) required but 0 passed/,
  ],
  [
    "Parameter type mismatch",
    "recipe f(ingredient x: int) {}\nf(stale);",
    /Cannot assign a boolean to a int/,
  ],
  [
    "function type mismatch",
    `recipe f(ingredient x: int, ingredient y: (boolean)->void): int { return 1; }
       recipe g(ingredient z: boolean): int { return 5; }
       f(2, g);`,
    /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
  ],
  [
    "bad param type in fn assign",
    "recipe f(ingredient x: int) {} recipe g(ingredient y: float) {} f = g;",
  ],
  [
    "bad return type in fn assign",
    'recipe f(ingredient x: int): int {return 1;} recipe g(ingredient y: int): string {return "uh-oh";} f = g;',
    /Cannot assign a \(int\)->string to a \(int\)->int/,
  ],
  [
    "bad call to sin()",
    "serve(sin(fresh));",
    /Cannot assign a boolean to a float/,
  ],
  [
    "Non-type in param",
    "ingredient x:=1;recipe f(ingredient y:x){}",
    /You didn't provide a type/,
  ],
  [
    "Non-type in return type",
    "ingredient x:=1;recipe f():x{return 1;}",
    /You didn't provide a type/,
  ],
  [
    "Non-type in field type",
    "ingredient x:=1;Dish S {ingredient y:x;}",
    /You didn't provide a type/,
  ],
  [
    "Wrong optional type",
    "ingredient x: int?; x = poached 1.0;",
    /Cannot assign a float\? to a int\?./,
  ],
  [
    "return mismatch in method",
    "Dish S {recipe m(): int {return fresh;}}",
    /Cannot assign a boolean to a int/,
  ],
  [
    "missing argument in method call",
    "Dish S {recipe m(ingredient x: int) {}} S y := new S(); y.m();",
    /1 ingredient\(s\) required but 0 passed/,
  ],
  [
    "accessing private field",
    "Dish S {ingredient _x: int;} S y := new S(1); serve(y._x);",
    /Cannot access private member/,
  ],
  [
    "non-class member access",
    "ingredient x := 5; serve(x.y);",
    /Expected a Dish, but this is like asking for a cake and getting a candle instead!/,
  ],
];

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern);
    });
  }
  it("produces the expected representation for a trivial program", () => {
    assert.deepEqual(
      analyze(parse("ingredient x := π + 2.2;")),
      program([
        variableList([
          variableDeclaration(
            variable("x", false, floatType),
            binary("+", variable("π", true, floatType), 2.2, floatType)
          ),
        ]),
      ])
    );
  });
});
