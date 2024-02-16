import assert from "node:assert/strict";
import parse from "../src/parser.js";

const syntaxChecks = [
  ["all numeric literal forms", "print(8 * 89.123);"],
  ["complex expressions", "print(83 * ((((-((((13 / 21)))))))) + 1 - 0);"],
  ["all unary operators", "print (-3); print (!false);"],
  ["all binary operators", "serve(x && y || z * 1 / 2 ** 3 + 4 < 5);"],
  [
    "all arithmetic operators",
    "ingredient x := (!3) * 2 + 4 - (-7.3) * 8 ** 13 / 1;",
  ],
  [
    "all relational operators",
    "ingredient x := 1<(2<=(3==(4!=(5 >= (6>7)))));",
  ],
  ["all logical operators", "ingredient x := true && false || (!false);"],
  ["the conditional operator", "serve(x ? y : z);"],
  ["end of program inside comment", "print(0); // yay"],
  ["comments with no text are ok", "print(1);//\nprint(0);//"],
  ["non-Latin letters in identifiers", "コンパイラ = 100;"],
  ["pyth for statement", "FdrXD {serve(D);}"],
  ["regular for statement", "for (ingredient x := 0; x < 5; ++x) {serve();}"],
  ["while statement", "while (true) {serve();}"],
  ["empty program", ""],
  ["program with just a comment", "// yay"],
  ["program with just a comment and a newline", "// yay\n"],
  ["program with just a newline", "\n"],
  ["program with just a newline and a comment", "\n// yay"],
  ["program with just a newline and a comment", "\n// yay\n"],
  ["if statement", "if (x != 27 || y == 3) {serve();}"],
  ["if-else statement", "if (x != 27 || y == 3) {serve();} else {serve();}"],
  [
    "if-else-if statement",
    "if (x != 27 || y == 3) {serve();} else if (x == 0) {serve();}",
  ],
  [
    "if-else-if-else statement",
    "if (x != 27 || y == 3) {serve();} else if (x == 0) {serve();} else {serve();}",
  ],
  [
    "if 3x else if statement",
    "if (x != 27 || y == 3) {serve();} else if (x == 0) {serve();} else if (x == 1) {serve();} else {serve();}",
  ],
  ["try catch statement", "try {serve();} catch (x) {serve();}"],
  [
    "try catch finally statement",
    "try {serve();} catch (x) {serve();} finally {serve();}",
  ],
  ["for statement without init", "for (ingredient x; x < 5; ++x) {serve();}"],
  ["serve works with list of expressions", "serve(5 + 3, 7 * 2, 1);"],
  ["serve works with single expression", "serve(5 + 3);"],
];

const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c = 2", /Line 1, col 3/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["missing semicolon", "x = 3 y = 1", /Line 1, col 7/],
  ["a missing right operand", "print(5 -", /Line 1, col 10/],
  ["a non-operator", "print(7 * ((2 _ 3)", /Line 1, col 15/],
  ["an expression starting with a )", "x = );", /Line 1, col 5/],
  ["a statement starting with expression", "x * 5;", /Line 1, col 3/],
  ["an illegal statement on line 2", "print(5);\nx * 5;", /Line 2, col 3/],
  ["a statement starting with a )", "print(5);\n) * 5", /Line 2, col 1/],
  ["an expression starting with a *", "x = * 71;", /Line 1, col 5/],
  ["pyth statement illegality", "FxsrDV {serve(x)}", /Line 1, col 8/],
  [
    "for statement without block",
    "for (ingredient x := 0; x < 5; ++x) serve();",
    /Line 1, col 37/,
  ],
  [
    "for statement without block",
    "for (ingredient x := 0; x < 5; ++x) {serve();",
    /Line 1, col 46/,
  ],
  ["while statement without block", "while (true) serve();", /Line 1, col 14/],
  [
    "if statement without block",
    "if (x != 27 || y == 3) serve();",
    /Line 1, col 24/,
  ],
  [
    "if-else statement without block",
    "if (x != 27 || y == 3) {serve();} else serve();",
    /Line 1, col 40/,
  ],
  [
    "if-else-if statement without block",
    "if (x != 27 || y == 3) {serve();} else if (x == 0) serve();",
    /Line 1, col 52/,
  ],
  [
    "if-else-if-else statement without block",
    "if (x != 27 || y == 3) {serve();} else if (x == 0) {serve();} else serve();",
    /Line 1, col 68/,
  ],
  [
    "try catch statement without block",
    "try serve(); catch (x) serve();",
    /Line 1, col 5/,
  ],
  [
    "try catch finally statement without block",
    "try serve(); catch (x) serve(); finally serve();",
    /Line 1, col 5/,
  ],
  ["unmatched right paren", "serve(5 + (3 * 7);", /Line 1, col 18/],
  ["unmatched right brace", "serve(5 + {3 * 7);", /Line 1, col 11/],
  ["illegal right bracket", "serve(5 + [3 * 7);", /Line 1, col 17/],
  ["illegal right angle", "serve(5 + <3 * 7);", /Line 1, col 11/],
  ["unmatched right quote", 'serve(5 + "3 * 7);', /Line 1, col 19/],
  ["unmatched right quote", "serve(5 + '3 * 7);", /Line 1, col 11/],
  ["unmatched right quote", "serve(5 + `3 * 7);", /Line 1, col 11/],
  [
    "for statement without condition",
    "for (ingredient x := 0; ; ++x) {serve();}",
    /Line 1, col 25/,
  ],
];

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`properly specifies ${scenario}`, () => {
      assert(parse(source).succeeded());
    });
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`does not permit ${scenario}`, () => {
      assert.throws(() => parse(source), errorMessagePattern);
    });
  }
});
