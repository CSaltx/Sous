export class Program {
  constructor(statements) {
    this.statements = statements;
  }
}

export class VarDecl {
  constructor(name, initializer) {
    Object.assign(this, { name, initializer });
  }
}

export class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source });
  }
}

export class ContinueStatement {
  constructor() {}
}

export class ReturnStatement {
  constructor(argument) {
    this.argument = argument;
  }
}

export class PrintStatement {
  constructor(argument) {
    this.argument = argument;
  }
}

export class IfStatement {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate });
  }
}

export class WhileStatement {
  constructor(test, body) {
    Object.assign(this, { test, body });
  }
}

export class ForStatement {
  constructor(init, test, update, body) {
    Object.assign(this, { init, test, update, body });
  }
}

export class PythForStmt {
  constructor(id1, id2, id3, body) {
    Object.assign(this, { id1, id2, id3, body });
  }
}

export class BreakStatement {
  constructor() {}
}

export class Variable {
  constructor(name) {
    Object.assign(this, { name });
  }
}

export class IntrinsicFunction {
  constructor(name, parameterCount) {
    Object.assign(this, { name, parameterCount });
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args });
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right });
  }
}

export class UnaryExpression {
  constructor(op, argument) {
    Object.assign(this, { op, argument });
  }
}

export class ThrowStatement {
  constructor(argument) {
    this.argument = argument;
  }
}

export class TryStatement {
  constructor(block) {
    Object.assign(this, { block });
  }
}

export class CatchClause {
  constructor(param, body) {
    Object.assign(this, { param, body });
  }
}
