// The code generator exports a single function, generate(program), which
// accepts a program representation and returns the JavaScript translation
// as a string.

import { voidType, standardLibrary } from "./core.js";

export default function generate(program) {
  // When generating code for statements, we'll accumulate the lines of
  // the target code here. When we finish generating, we'll join the lines
  // with newlines and return the result.
  const output = [];

  const standardFunctions = new Map([
    [standardLibrary.serve, (x) => `console.log(${x})`],
    [standardLibrary.sin, (x) => `Math.sin(${x})`],
    [standardLibrary.cos, (x) => `Math.cos(${x})`],
    [standardLibrary.exp, (x) => `Math.exp(${x})`],
    [standardLibrary.ln, (x) => `Math.log(${x})`],
    [standardLibrary.hypot, ([x, y]) => `Math.hypot(${x},${y})`],
    [standardLibrary.bytes, (s) => `[...Buffer.from(${s}, "utf8")]`],
    [standardLibrary.codepoints, (s) => `[...(${s})].map(s=>s.codePointAt(0))`],
    [standardLibrary.count, (x) => `${x}.length`],
  ]);

  // Variable and function names in JS will be suffixed with _1, _2, _3,
  // etc. This is because "switch", for example, is a legal name in Carlos,
  // but not in JS. So, the Carlos variable "switch" must become something
  // like "switch_1". We handle this by mapping each name to its suffix.
  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1);
      }
      return `${entity.name}_${mapping.get(entity)}`;
    };
  })(new Map());

  const gen = (node) => generators?.[node?.kind]?.(node) ?? node;

  const generators = {
    // Key idea: when generating an expression, just return the JS string; when
    // generating a statement, write lines of translated JS to the output array.
    Program(p) {
      p.statements.forEach(gen);
    },

    VariableDeclaration(d) {
      // We don't care about const vs. let in the generated code! The analyzer has
      // already checked that we never updated a const, so let is always fine.
      output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`);
    },

    VariableList(l) {
      l.declarations.forEach(gen);
    },

    Variable(v) {
      // Standard library constants just get special treatment
      if (v === standardLibrary.π) return "Math.PI";
      return targetName(v);
    },

    FunctionDeclaration(d) {
      output.push(`function ${gen(d.fun)}(${d.params.map(gen).join(", ")}) {`);
      d.body.forEach((line) => {
        return gen(line);
      });
      output.push("}");
    },

    MethodDeclaration(d) {
      output.push(`${gen(d.fun)}(${d.params.map(gen).join(", ")}) {`);
      d.body.forEach((line) => {
        gen(line);
      });
      output.push("}");
    },

    EmptyOptional(_e) {
      return "undefined";
    },

    ClassDeclaration(d) {
      output.push(`class ${gen(d.type)} {`);
      const type = d.type;
      output.push(`constructor(${type.fields.map(gen).join(", ")}) {`);
      for (let field of d.type.fields) {
        output.push(`this[${JSON.stringify(gen(field))}] = ${gen(field)};`);
      }
      output.push("}");
      // figure out this because methods dont have function before the name in javascript
      type.methods.forEach((item) => {
        gen(item);
      });
      output.push("}");
    },

    ClassType(c) {
      return targetName(c);
    },

    ObjectConstructor(e) {
      const name = gen(e.variable);
      const className = gen(e.type);
      const fields = e.fields.map((f) => gen(f));
      output.push(`let ${name} = new ${className}(${fields.join(", ")});`);
    },

    Function(f) {
      return targetName(f);
    },

    Field(f) {
      return targetName(f);
    },

    Increment(s) {
      output.push(`${gen(s.variable)}++;`);
    },

    Decrement(s) {
      output.push(`${gen(s.variable)}--;`);
    },

    Assignment(s) {
      output.push(`${gen(s.target)} = ${gen(s.source)};`);
    },

    BreakStatement(s) {
      output.push("break;");
    },

    ContinueStatement(s) {
      output.push("continue;");
    },

    ReturnStatement(s) {
      output.push(`return ${gen(s.expression)};`);
    },

    ShortReturnStatement(s) {
      output.push("return;");
    },

    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`);
      s.consequent.forEach(gen);
      if (s.alternate?.kind?.endsWith?.("IfStatement")) {
        output.push("} else");
        gen(s.alternate);
      } else {
        output.push("} else {");
        s.alternate.forEach(gen);
        output.push("}");
      }
    },

    ShortIfStatement(s) {
      output.push(`if (${gen(s.test)}) {`);
      s.consequent.forEach(gen);
      output.push("}");
    },

    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`);
      s.body.forEach(gen);
      output.push("}");
    },

    Conditional(e) {
      return `((${gen(e.test)}) ? (${gen(e.consequent)}) : (${gen(
        e.alternate
      )}))`;
    },

    BinaryExpression(e) {
      const op = { "==": "===", "!=": "!==" }[e.op] ?? e.op;
      return `(${gen(e.left)} ${op} ${gen(e.right)})`;
    },

    UnaryExpression(e) {
      const operand = gen(e.operand);
      if (e.op === "poached") {
        return operand;
      } else if (e.op === "random") {
        return `((a=>a[~~(Math.random()*a.length)])(${operand}))`;
      }
      return `${e.op}(${operand})`;
    },

    SubscriptExpression(e) {
      return `${gen(e.array)}[${gen(e.index)}]`;
    },

    ArrayExpression(e) {
      if (e?.type?.baseType?.kind === "ClassType") {
        return `[${e.elements.map((f) => gen(f.variable)).join(",")}]`;
      }
      return `[${e.elements.map(gen).join(",")}]`;
    },

    EmptyArray(e) {
      return "[]";
    },

    MemberExpression(e) {
      const object = e.object.variable ? gen(e.object.variable) : gen(e.object);
      const field = JSON.stringify(gen(e.field));
      //   const chain = e.op === "." ? "" : "?";
      const chain = "";
      return `(${object}${chain}[${field}])`;
    },

    FunctionCall(c) {
      const targetCode = standardFunctions.has(c.callee)
        ? standardFunctions.get(c.callee)(c.args.map(gen))
        : `${gen(c.callee)}(${c.args.map(gen).join(", ")})`;
      // Calls in expressions vs in statements are handled differently
      if (c.callee.type.returnType !== voidType) {
        return targetCode;
      }
      output.push(`${targetCode};`);
    },

    PythForStatement(s) {
      const iter = gen(s.iterator);
      output.push(
        `for (let ${iter} = ${gen(s.low)}; ${iter} < ${gen(
          s.high
        )}; ${iter}++){`
      );
      s.body.forEach(gen);
      output.push("}");
    },

    ForRangeStatement(s) {
      let up;
      if (s.update.kind !== "Increment" && s.update.kind !== "Decrement") {
        up = gen(s.update);
      } else {
        up =
          `${gen(s.update.variable)}` +
          (s.update.kind === "Increment" ? "++" : "--");
      }
      output.push(
        `for (let ${gen(s.init.declarations[0].variable)} = ${gen(
          s.init.declarations[0].initializer
        )}; ${gen(s.test)}; ${up}) {`
      );
      s.body.forEach(gen);
      output.push("}");
    },

    ForUpdateAssignment(s) {
      return `${gen(s.target)} = ${gen(s.source)}`;
    },

    ForStatement(s) {
      output.push(`for (let ${gen(s.iterator)} of ${gen(s.collection)}) {`);
      s.body.forEach(gen);
      output.push("}");
    },

    TryStatement(s) {
      output.push("try {");
      s.body.forEach(gen);
      output.push("}");
      s.catchClauses.forEach(gen);
      gen(s.finallyBlock);
    },

    CatchClause(c) {
      output.push(`catch (${gen(c.errorName)}) {`);
      c.body.forEach(gen);
      output.push("}");
    },

    Finally(s) {
      output.push("finally {");
      s.body.forEach(gen);
      output.push("}");
    },

    ErrorStatement(s) {
      output.push(`throw new ${s.type}(${gen(s.message)});`);
    },

    MethodCall(m) {
      output.push(
        gen(m.object.variable) +
          "." +
          gen(m.method) +
          "(" +
          m.args.join(", ") +
          ");"
      );
    },

    RangeArray(m) {
      return `Array.from({length: ${m.end} - ${m.start}}, (_, i) => ${m.start} + i)`;
    },

    FieldReference(f) {
      return `this[${JSON.stringify(gen(f.field))}]`;
    },
  };

  gen(program);
  return output.join("\n");
}
