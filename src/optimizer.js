import * as core from "./core.js";

export default function optimize(node) {
  return optimizers?.[node?.kind]?.(node) ?? node;
}

const optimizers = {
  Program(p) {
    p.statements = p.statements.flatMap(optimize);
    return p;
  },
  VariableDeclaration(d) {
    d.variable = optimize(d.variable);
    d.initializer = optimize(d.initializer);
    return d;
  },
  FunctionDeclaration(d) {
    d.fun = optimize(d.fun);
    d.fun = optimize(d.fun);
    let foundReturn = false;
    let newBody = [];
    for (const statement of d.body) {
      if (foundReturn) {
        // Skip any code after return
        continue;
      }
      const optimizedStatement = optimize(statement);
      if (
        ["ReturnStatement", "ShortReturnStatement"].includes(
          optimizedStatement.kind
        )
      ) {
        foundReturn = true;
      }
      if (Array.isArray(optimizedStatement)) {
        newBody.push(...optimizedStatement);
      } else {
        newBody.push(optimizedStatement);
      }
    }
    d.body = newBody;
    return d;
  },
  Increment(s) {
    s.variable = optimize(s.variable);
    return s;
  },
  Decrement(s) {
    s.variable = optimize(s.variable);
    return s;
  },
  Assignment(s) {
    s.source = optimize(s.source);
    s.target = optimize(s.target);
    if (s.source === s.target) {
      return [];
    }
    return s;
  },
  ReturnStatement(s) {
    s.expression = optimize(s.expression);
    return s;
  },
  IfStatement(s) {
    s.test = optimize(s.test);
    s.consequent = s.consequent.flatMap(optimize);
    if (s.alternate?.kind?.endsWith?.("IfStatement")) {
      s.alternate = optimize(s.alternate);
    } else {
      s.alternate = s.alternate.flatMap(optimize);
    }
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : s.alternate;
    }
    return s;
  },
  ShortIfStatement(s) {
    s.test = optimize(s.test);
    s.consequent = s.consequent.flatMap(optimize);
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : [];
    }
    return s;
  },
  WhileStatement(s) {
    s.test = optimize(s.test);
    if (s.test === false) {
      // while false is a no-op
      return [];
    }
    s.body = s.body.flatMap(optimize);
    return s;
  },
  PythForStatement(s) {
    s.iterator = optimize(s.iterator);
    s.low = optimize(s.low);
    s.high = optimize(s.high);
    s.body = s.body.flatMap(optimize);
    return s;
  },
  ForStatement(s) {
    s.iterator = optimize(s.iterator);
    s.collection = optimize(s.collection);
    s.body = s.body.flatMap(optimize);
    if (s.collection?.kind === "EmptyArray") {
      return [];
    }
    if (
      s.collection?.kind === "RangeArray" &&
      s.collection.end - s.collection.start <= 5
    ) {
      const block = [];
      block.push(core.variableDeclaration(s.iterator, s.collection.start));
      for (let i = s.collection.start; i < s.collection.end; i++) {
        block.push(core.assignment(s.iterator, i));
        block.push(...s.body);
      }
      return block;
    }
    // console.log(s.collection?.kind);
    return s;
  },
  ForRangeStatement(s) {
    s.init = optimize(s.init);
    s.test = optimize(s.test);
    if (s.test === false) {
      return [];
    }
    s.update = optimize(s.update);
    s.body = s.body.flatMap(optimize);
    return s;
  },
  Conditional(e) {
    e.test = optimize(e.test);
    e.consequent = optimize(e.consequent);
    e.alternate = optimize(e.alternate);
    if (e.test.constructor === Boolean) {
      return e.test ? e.consequent : e.alternate;
    }
    return e;
  },
  BinaryExpression(e) {
    e.op = optimize(e.op);
    e.left = optimize(e.left);
    e.right = optimize(e.right);
    if (e.op === "??") {
      // Coalesce Empty Optional Unwraps
      if (e.left?.kind === "EmptyOptional") {
        return e.right;
      }
    } else if (e.op === "&&") {
      // Optimize boolean constants in && and ||
      if (e.left === true) return e.right;
      else if (e.right === true) return e.left;
    } else if (e.op === "||") {
      if (e.left === false) return e.right;
      else if (e.right === false) return e.left;
    } else if ([Number, BigInt].includes(e.left.constructor)) {
      // Numeric constant folding when left operand is constant
      if ([Number, BigInt].includes(e.right.constructor)) {
        if (e.op === "+") return e.left + e.right;
        else if (e.op === "-") return e.left - e.right;
        else if (e.op === "*") return e.left * e.right;
        else if (e.op === "/") return e.left / e.right;
        else if (e.op === "**") return e.left ** e.right;
        else if (e.op === "<") return e.left < e.right;
        else if (e.op === "<=") return e.left <= e.right;
        else if (e.op === "==") return e.left === e.right;
        else if (e.op === "!=") return e.left !== e.right;
        else if (e.op === ">=") return e.left >= e.right;
        else if (e.op === ">") return e.left > e.right;
      } else if (e.left === 0 && e.op === "+") return e.right;
      else if (e.left === 1 && e.op === "*") return e.right;
      else if (e.left === 0 && e.op === "-") return core.unary("-", e.right);
      else if (e.left === 1 && e.op === "**") return 1;
      else if (e.left === 0 && ["*", "/"].includes(e.op)) return 0;
    } else if ([Number, BigInt].includes(e.right.constructor)) {
      // Numeric constant folding when right operand is constant
      if (["+", "-"].includes(e.op) && e.right === 0) return e.left;
      else if (["*", "/"].includes(e.op) && e.right === 1) return e.left;
      else if (e.op === "*" && e.right === 0) return 0;
      else if (e.op === "**" && e.right === 0) return 1;
    }
    return e;
  },
  UnaryExpression(e) {
    e.op = optimize(e.op);
    e.operand = optimize(e.operand);
    if (e.operand.constructor === Number) {
      if (e.op === "-") {
        return -e.operand;
      }
    }
    return e;
  },
  SubscriptExpression(e) {
    e.array = optimize(e.array);
    e.index = optimize(e.index);
    return e;
  },
  ArrayExpression(e) {
    e.elements = e.elements.map(optimize);
    return e;
  },
  FunctionCall(c) {
    c.callee = optimize(c.callee);
    c.args = c.args.map(optimize);
    return c;
  },
  RangeArray(r) {
    if (r.end <= r.start) {
      return core.emptyArray();
    }
    return r;
  },
};
