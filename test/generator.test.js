import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
// import optimize from "../src/optimizer.js";
import generate from "../src/generator.js";

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
}

const fixtures = [
  {
    name: "small",
    source: `
      ingredient x := 3 * 7;
      ++x;
      --x;
      ingredient y := fresh;
      y = 5 ** -x / -100 > - x || stale;
      serve((y && y) || stale || (x*2) != 5);
    `,
    expected: dedent`
      let x_1 = (3 * 7);
      x_1++;
      x_1--;
      let y_2 = true;
      y_2 = ((((5 ** -(x_1)) / -(100)) > -(x_1)) || false);
      console.log((((y_2 && y_2) || false) || ((x_1 * 2) !== 5)));
    `,
  },
  {
    name: "if",
    source: `
      ingredient x := 0;
      if (x == 0) { serve("1"); }
      if (x == 0) { serve(1); } else { serve(2); }
      if (x == 0) { serve(1); } else if (x == 2) { serve(3); }
      if (x == 0) { serve(1); } else if (x == 2) { serve(3); } else { serve(4); }
    `,
    expected: dedent`
        let x_1 = 0;
        if ((x_1 === 0)) {
            console.log("1");
        }
        if ((x_1 === 0)) {
            console.log(1);
        } else {
            console.log(2);
        }
        if ((x_1 === 0)) {
            console.log(1);
        } else
        if ((x_1 === 2)) {
            console.log(3);
        }
        if ((x_1 === 0)) {
            console.log(1);
        } else
        if ((x_1 === 2)) {
            console.log(3);
        } else {
            console.log(4);
        }
    `,
  },
  {
    name: "while",
    source: `
        ingredient x := 0;
        while (x < 5) {
          ingredient y := 0;
          while (y < 5) {
            serve(x * y);
            y = y + 1;
            break;
          }
          x = x + 1;
        }
      `,
    expected: dedent`
        let x_1 = 0;
        while ((x_1 < 5)) {
          let y_2 = 0;
          while ((y_2 < 5)) {
            console.log((x_1 * y_2));
            y_2 = (y_2 + 1);
            break;
          }
          x_1 = (x_1 + 1);
        }
      `,
  },
  {
    name: "functions",
    source: `
        ingredient z := 0.5;
        recipe f(ingredient x: float, ingredient y: boolean) {
          serve(sin(x) > π);
          return;
        }
        recipe g(): boolean {
          return stale;
        }
        f(z, g());
      `,
    expected: dedent`
        let z_1 = 0.5;
        function f_2(x_3, y_4) {
          console.log((Math.sin(x_3) > Math.PI));
          return;
        }
        function g_5() {
          return false;
        }
        f_2(z_1, g_5());
      `,
  },
  {
    name: "arrays",
    source: `
        ingredient a := [fresh, stale, fresh];
        ingredient b := [10, count(a) - 20, 30];
        ingredient c := [[int]]() | const;
        ingredient d := random b | const;
        serve(a[1] || (b[0] < 88 ? stale : fresh));
      `,
    expected: dedent`
        let a_1 = [true,false,true];
        let b_2 = [10,(a_1.length - 20),30];
        let c_3 = [];
        let d_4 = ((a=>a[~~(Math.random()*a.length)])(b_2));
        console.log((a_1[1] || (((b_2[0] < 88)) ? (false) : (true))));
      `,
  },
  {
    name: "structs",
    source: `
        Dish S { ingredient x: int; }
        S x := new S(3);
        serve(x.x);
      `,
    expected: dedent`
        class S_1 {
        constructor(x_2) {
        this["x_2"] = x_2;
        }
        }
        let x_3 = new S_1(3);
        console.log((x_3["x_2"]));
      `,
  },
  {
    name: "optionals",
    source: `
        ingredient x := raw int;
        ingredient y := x ?? 2;
      `,
    expected: dedent`
        let x_1 = undefined;
        let y_2 = (x_1 ?? 2);
      `,
  },
  {
    name: "for loops",
    source: `
        for (j in [10, 20, 30]) {
          serve(j);
        }
        for (ingredient i := 0; i < 50; ++i) {
            serve(i);
        }
        for (ingredient k := 50; k < 0; --k) {
            serve(k);
        }
      `,
    expected: dedent`
        for (let j_1 of [10,20,30]) {
          console.log(j_1);
        }
        for (let i_2 = 0; (i_2 < 50); i_2++) {
          console.log(i_2);
        }
        for (let k_3 = 50; (k_3 < 0); k_3--) {
          console.log(k_3);
        }
      `,
  },
  {
    name: "standard library",
    source: `
        ingredient x := 0.5;
        serve(sin(x) - cos(x) + exp(x) * ln(x) / hypot(2.3, x));
        serve(bytes("∞§¶•"));
        serve(codepoints("💪🏽💪🏽🖖👩🏾💁🏽‍♀️"));
      `,
    expected: dedent`
        let x_1 = 0.5;
        console.log(((Math.sin(x_1) - Math.cos(x_1)) + ((Math.exp(x_1) * Math.log(x_1)) / Math.hypot(2.3,x_1))));
        console.log([...Buffer.from("∞§¶•", "utf8")]);
        console.log([...("💪🏽💪🏽🖖👩🏾💁🏽‍♀️")].map(s=>s.codePointAt(0)));
      `,
  },
  {
    name: "full class with methods",
    source: `
    Dish S {
        ingredient x : int;
        recipe bake() : int {
            serve(x);
        }
    }   

    S test := new S(5);

    test.bake();`,
    expected: dedent`
        class S_1 {
            constructor(x_2) {
                this["x_2"] = x_2;
            }
            bake_3() {
                console.log(x_2);
            }
        }
        let test_4 = new S_1(5);
        test_4.bake_3();`,
  },
  {
    name: "continue statement in for loop",
    source: `
    for (ingredient i := 0; i < 10; ++i) {
        if (i == 5) {
            continue;
        }
        serve(i);
    }`,
    expected: dedent`
        for (let i_1 = 0; (i_1 < 10); i_1++) {
            if ((i_1 === 5)) {
                continue;
            }
            console.log(i_1);
        }`,
  },
  {
    name: "poached usage",
    source: `
    ingredient x := poached 5;
    ingredient y := raw int;
    y = x;
    serve(x);
    `,
    expected: dedent`
    let x_1 = 5;
    let y_2 = undefined;
    y_2 = x_1;
    console.log(x_1);`,
  },
  {
    name: "pyth for loops",
    source: `
    ingredient menu := ["Soup", "Salad", "Steak", "Dessert"];
    ingredient Z := 0;
    ingredient C := count(menu);

    FDrZC {
        serve("Preparing ", menu[D]);
    }`,
    expected: dedent`
    let menu_1 = ["Soup","Salad","Steak","Dessert"];
    let Z_2 = 0;
    let C_3 = menu_1.length;
    for (let D_4 = Z_2; D_4 < C_3; D_4++){
        console.log("Preparing ",menu_1[D_4]);
    }`,
  },
  {
    name: "for loop with non-increment/decrement update",
    source: `
    for (ingredient i := 0; i < 10; i = i + 2) {
        serve(i);
    }`,
    expected: dedent`
    for (let i_1 = 0; (i_1 < 10); i_1 = (i_1 + 2)) {
        console.log(i_1);
    }`,
  },
  {
    name: "try statement with catch block and finally",
    source: `
    prep {
        serve(1);
        eightysix("error", TypeError);
    } rescue (TypeError e) {
        serve(e.stack);
    } cleanup {
        serve(3);
    }`,
    expected: dedent`
    try {
        console.log(1);
        throw new TypeError("error");
    }
    catch (e_1) {
        console.log((e_1["stack"]));
    }
    finally {
        console.log(3);
    }`,
  },
  {
    name: "array with classes",
    source: `
    Dish S {
        ingredient x : int;
    }
    S x := new S(5);
    S y := new S(10);
    ingredient z := [x, y];`,
    expected: dedent`
    class S_1 {
        constructor(x_2) {
            this["x_2"] = x_2;
        }
    }
    let x_3 = new S_1(5);
    let y_4 = new S_1(10);
    let z_5 = [x_3,y_4];`,
  },
];

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(analyze(parse(fixture.source)));
      assert.deepEqual(actual, fixture.expected);
    });
  }
});
