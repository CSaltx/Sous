import assert from "node:assert/strict";
import parse from "../src/parser.js";

const syntaxChecks = [
  ["all numeric literal forms", "serve(8 * 89.123);"],
  ["complex expressions", "serve(83 * ((((-((((13 / 21)))))))) + 1 - 0);"],
  ["all unary operators", "serve (-3); serve (!false);"],
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
  ["end of program inside comment", "serve(0); // yay"],
  ["comments with no text are ok", "serve(1);//\nserve(0);//"],
  ["non-Latin letters in identifiers", "コンパイラ = 100;"],
  ["pyth for statement", "FdrXD {serve(D);}"],
  ["regular for statement", "for (ingredient x := 0; x < 5; ++x) {serve();}"],
  ["program with just a serve statement", "serve(\"Hello World!\");"],
  [
    "for statement with subscript", 
    "for (ingredient dishIdx := 0; dishIdx < count(menu); ++dishIdx) {serve( \"Prepararing\", menu[dishIdx]);}"
  ],
  ["for statement without init", "for (ingredient x; x < 5; ++x) {serve();}"],
  ["while statement", "while (true) {serve();}"],
  ["empty program", ""],
  ["program with just a comment", "// yay"],
  ["program with just a comment and a newline", "// yay\n"],
  ["program with just a newline", "\n"],
  ["program with just a newline and a comment", "\n// yay"],
  ["program with just a newline and a comment", "\n// yay\n"],
  ["program with just a serve statement", "serve();"],
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
  ["serve works with list of expressions", "serve(5 + 3, 7 * 2, 1);"],
  ["serve works with single expression", "serve(5 + 3);"],
  ["Dish works with without expression", "Dish Cake {}"],
  ["Dish works with a single declaration", "Dish Cake { ingredient flour; }"],
  [
    "Dish works with a list of declarations",
    "Dish Cake { ingredient flour; recipe Bake() { serve(\"Baking the Cake...\"); } } "
  ],
  ["a class instance", "Cake myCake := new Cake(\"2 cups\", \"1 cup\", \"3\");"],
  ["a variable declaration with no assignment", "ingredient sugar;"],
  ["a variable declaration with an assignment", "ingredient temp := 350;"]
];

const syntaxErrors = [
  ["non-letter in an identifier", "ab😭c = 2", /Line 1, col 3/],
  ["malformed variable with integer", "4x = 7", /Line 1, col 1/],
  ["malformed variable with symbol", "@x = 7", /Line 1, col 1/],
  ["malformed number", "x= 2.", /Line 1, col 6/],
  ["malformed number expression", "x = 3-", /Line 1, col 7/],
  ["malformed signed number", "x = +-3", /Line 1, col 5/],
  ["malformed double signed number", "x = --3", /Line 1, col 6/],
  ["binary operators next to each other", "serve(x &&|| z * 1 / 2 ** 3 + 4 < 5);", /Line 1, col 11/],
  ["arithmetic operators next to each other", "serve(3*/ 5);", /Line 1, col 9/],
  ["multiple unary operators next to each other", "serve(!!false);", /Line 1, col 8/],
  ["missing semicolon", "x = 3 y = 1", /Line 1, col 7/],
  ["missing right operand", "serve(5 -", /Line 1, col 10/],
  ["missing right paren", "serve(\"Hello\";", /Line 1, col 14/],
  ["missing left paren", "serve\"Hello\");", /Line 1, col 6/],
  ["non-operator", "serve(7 * ((2 _ 3);", /Line 1, col 15/],
  ["malformed power operator", "serve(6**);", /Line 1, col 10/],
  ["expression starting with a )", "x = );", /Line 1, col 5/],
  ["statement starting with expression", "x * 5;", /Line 1, col 3/],
  ["illegal statement on line 2", "serve(5);\nx * 5;", /Line 2, col 3/],
  ["statement starting with a )", "serve(5);\n) * 5", /Line 2, col 1/],
  ["expression starting with a *", "x = * 71;", /Line 1, col 5/],
  ["expression starting with a /", "x = / 71;", /Line 1, col 5/],
  ["expression starting with a **", "x = ** 71;", /Line 1, col 5/],
  ["expression starting with a +", "x = + 71;", /Line 1, col 5/],
  ["expression starting with a >", "x = > 71;", /Line 1, col 5/],
  ["expression starting with a >", "x = < 71;", /Line 1, col 5/],
  ["malformed greater-than relational operator", "x => 0", /Line 1, col 4/],
  ["malformed less-than relational operator", "x =< 0", /Line 1, col 4/],
  ["malformed equal-to operator", "x === 0", /Line 1, col 4/],
  ["malformed serve statement with string", "serve(\"\"\")", /Line 1, col 9/],
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
  ["unmatched left paren", "serve(5 + 3 * 7));", /Line 1, col 17/],
  ["unmatched left brace", "serve(5 + 3 * 7)};", /Line 1, col 17/],
  ["illegal left bracket", "serve(5 + 3 * 7)];", /Line 1, col 17/],
  ["illegal left angle", "serve(5 + >3 * 7);", /Line 1, col 11/],
  ["unmatched right quote", 'serve(5 + "3 * 7);', /Line 1, col 19/],
  ["unmatched right quote", "serve(5 + '3 * 7);", /Line 1, col 11/],
  ["unmatched right quote", "serve(5 + `3 * 7);", /Line 1, col 11/],
  ["unmatched left quote", 'serve(5 + 3 * 7");', /Line 1, col 16/],
  ["unmatched left quote", "serve(5 + 3 * 7');", /Line 1, col 16/],
  ["unmatched left quote", "serve(5 + 3 * 7`);", /Line 1, col 16/],
  [
    "for statement without condition",
    "for (ingredient x := 0; ; ++x) {serve();}",
    /Line 1, col 25/,
  ]
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
