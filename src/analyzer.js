import * as core from "./core.js";

// A few declarations to save typing
const INT = core.intType;
const FLOAT = core.floatType;
const STRING = core.stringType;
const BOOLEAN = core.boolType;
const ANY = core.anyType;
const VOID = core.voidType;

class Context {
  constructor({
    parent = null,
    locals = new Map(),
    inLoop = false,
    function: f = null,
  }) {
    Object.assign(this, { parent, locals, inLoop, function: f });
  }
  add(name, entity) {
    this.locals.set(name, entity);
  }
  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name);
  }
  static root() {
    return new Context({
      locals: new Map(Object.entries(core.standardLibrary)),
    });
  }
  newChildContext(props) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() });
  }
}

export default function analyze(match) {
  let context = Context.root();

  function must(condition, message, errorLocation) {
    if (!condition) {
      const prefix = errorLocation.at.source.getLineAndColumnMessage();
      throw new Error(`${prefix}${message}`);
    }
  }

  function mustNotAlreadyBeDeclared(name, at) {
    must(
      !context.lookup(name),
      `Ingredient ${name} is already declared you IDIOT SANDWICH`,
      at
    );
  }

  function mustHaveBeenFound(entity, name, at) {
    must(
      entity,
      `Ingredient ${name} is so raw, it doesn't even have a value in it!`,
      at
    );
  }

  function mustHaveNumericType(e, at) {
    must(
      [INT, FLOAT].includes(e.type),
      "Does this look like a NUMBER to you? SEND IT BACK!",
      at
    );
  }

  function mustHaveValidMember(e, name, at) {
    must(e, `Member ${name} is so bland, it doesn't even exist!`, at);
  }

  function mustHaveNumericOrStringType(e, at) {
    must(
      [INT, FLOAT, STRING].includes(e.type),
      "Expected a number or string, but what is this? It's like asking for a steak and getting a rubber boot instead!",
      at
    );
  }

  function mustBeAClass(e, at) {
    must(
      e?.kind === "ClassType",
      "Expected a Dish, but this is like asking for a cake and getting a candle instead!",
      at
    );
  }

  function mustHaveBooleanType(e, at) {
    must(
      e.type === BOOLEAN,
      "Expected a boolean, but this is like flipping a coin and it landing on its edge. Make a decision!",
      at
    );
  }

  function mustHaveIntegerType(e, at) {
    must(
      e.type === INT,
      "Expected an integer, but this is as far from a whole number as a soup is from a sandwich. Get it together!",
      at
    );
  }

  function mustHaveAnArrayType(e, at) {
    must(
      e.type?.kind === "ArrayType",
      "Expected an array, but this is like expecting a full course meal and only getting a plate. Where's the entree?",
      at
    );
  }

  function mustHaveAnOptionalType(e, at) {
    must(
      e.type?.kind === "OptionalType",
      "Expected an optional, but this is not optional. Make up your mind or get out of the kitchen.",
      at
    );
  }

  function mustBothHaveTheSameType(e1, e2, at) {
    must(
      equivalent(e1.type, e2.type),
      "Expected equality, Does this look like lamb sauce and lamb? No, get out of my kitchen!",
      at
    );
  }

  function mustAllHaveSameType(expressions, at) {
    // Used to check the elements of an array expression, and the two
    // arms of a conditional expression, among other scenarios.
    must(
      expressions
        .slice(1)
        .every((e) => equivalent(e.type, expressions[0].type)),
      "These don't have the same type, stop trying to mix savory with sweet!",
      at
    );
  }

  function mustBeAType(e, at) {
    // This is a rather ugly hack
    must(
      e?.kind.endsWith("Type"),
      "You didn't provide a type, this is looking like a very bad menu!",
      at
    );
  }

  function mustBeAnArrayType(t, at) {
    must(
      t?.kind === "ArrayType",
      "Must be an array type, you gave me a slice of cake? Where's the rest...",
      at
    );
  }
  function mustNotBePrivate(e, at) {
    must(e.sourceString[0] !== "_", "Cannot access private member", at);
  }

  //   function includesAsField(structType, type) {
  //     // Whether the struct type has a field of type type, directly or indirectly
  //     return structType.fields.some(
  //       (field) =>
  //         field.type === type ||
  //         (field.type?.kind === "StructType" && includesAsField(field.type, type))
  //     );
  //   }

  //   function mustNotBeSelfContaining(structType, at) {
  //     const containsSelf = includesAsField(structType, structType);
  //     must(!containsSelf, "Struct type must not be self-containing", at);
  //   }

  //   function mustBeCallable(entity, at) {
  //     must(
  //       entity.kind === "Function" || entity.kind === "ClassDeclaration",
  //       `Expected a recipe or a dish but found ${entity.kind.toLowerCase()}`,
  //       at
  //     );
  //   }

  function equivalent(t1, t2) {
    return (
      t1 === t2 ||
      (t1?.kind === "OptionalType" &&
        t2?.kind === "OptionalType" &&
        equivalent(t1.baseType, t2.baseType)) ||
      (t1?.kind === "ArrayType" &&
        t2?.kind === "ArrayType" &&
        equivalent(t1.baseType, t2.baseType)) ||
      (t1?.kind === "FunctionType" &&
        t2?.kind === "FunctionType" &&
        equivalent(t1.returnType, t2.returnType) &&
        t1.paramTypes.length === t2.paramTypes.length &&
        t1.paramTypes.every((t, i) => equivalent(t, t2.paramTypes[i])))
    );
  }

  function mustHaveConstString(modifier, at) {
    must(modifier === "const", "cannot have section without modifier", at);
  }

  function assignable(fromType, toType) {
    return (
      toType == ANY ||
      equivalent(fromType, toType) ||
      (fromType?.kind === "FunctionType" &&
        toType?.kind === "FunctionType" &&
        // covariant in return types
        assignable(fromType.returnType, toType.returnType) &&
        fromType.paramTypes.length === toType.paramTypes.length &&
        // contravariant in parameter types
        toType.paramTypes.every((t, i) =>
          assignable(t, fromType.paramTypes[i])
        ))
    );
  }

  function typeDescription(type) {
    switch (type.kind) {
      case "IntType":
        return "int";
      case "FloatType":
        return "float";
      case "StringType":
        return "string";
      case "BoolType":
        return "boolean";
      case "VoidType":
        return "void";
      case "AnyType":
        return "any";
      case "FunctionType":
        const paramTypes = type.paramTypes.map(typeDescription).join(", ");
        const returnType = typeDescription(type.returnType);
        return `(${paramTypes})->${returnType}`;
      case "ArrayType":
        return `[${typeDescription(type.baseType)}]`;
      case "OptionalType":
        return `${typeDescription(type.baseType)}?`;
    }
  }

  function mustBeAssignable(e, { toType: type }, at) {
    const message = `Cannot assign a ${typeDescription(
      e.type
    )} to a ${typeDescription(
      type
    )}. It's like putting ketchup on a creme brulee. Stick to the recipe!`;
    must(assignable(e.type, type), message, at);
  }

  function mustNotBeReadOnly(e, at) {
    must(
      !e.readOnly,
      `You are assigning to a constant ${e.name}, get your head right and stick to the ingredients!`,
      at
    );
  }

  //TODO: FIX ERROR MSGS AFTER THIS
  //   function mustHaveDistinctFields(fields, at) {
  //     const fieldNames = new Set(fields.map((f) => f.name));
  //     must(fieldNames.size === fields.length, "Fields must be distinct", at);
  //   }

  function mustBeInLoop(at) {
    must(context.inLoop, "Break can only appear in a loop", at);
  }

  //   function mustBeInClass(at) {
  //     must(context.inClass, "This can only appear in a class", at);
  //   }

  function mustBeInAFunction(at) {
    must(
      context.function,
      "This is like asparagus and milk, return can only appear in a function",
      at
    );
  }

  function mustBeCallable(e, at) {
    const callable = e.type?.kind === "FunctionType";
    must(
      callable,
      "You're calling a non-function or non-constructor, you donut!",
      at
    );
  }

  function mustNotReturnAnything(f, at) {
    must(f.type.returnType === VOID, "Something should be returned", at);
  }

  function mustReturnSomething(f, at) {
    must(
      f.type.returnType !== VOID,
      "Cannot return a value from this function",
      at
    );
  }

  function mustBeReturnable(e, { from: f }, at) {
    mustBeAssignable(e, { toType: f.type.returnType }, at);
  }

  function mustBeValidErrorType(e, at) {
    const errors = [
      "TypeError",
      "ValueError",
      "KeyError",
      "IndexError",
      "RuntimeError",
      "Exception",
    ];
    must(
      errors.includes(e.sourceString),
      "Does this look like a valid error? Cereal is harder to cook than this!",
      at
    );
  }

  function mustHaveCorrectArgumentCount(argCount, paramCount, at) {
    const message = `${paramCount} ingredient(s) required but ${argCount} passed`;
    must(argCount === paramCount, message, at);
  }

  function mustBeSameClass(id1, id2, at) {
    must(
      id1.sourceString === id2.sourceString,
      "Class Names must match, you think you'll be a MasterChef at this rate!",
      at
    );
  }

  function mustBeAMethod(method, id, at) {
    must(
      method,
      `Did you just try and call method ${id.sourceString} when it doesn't exist! GO GET ME SOME OREGANO FROM MARS, YOU DONUT!`,
      at
    );
  }

  const analyzer = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(statements) {
      return core.program(statements.children.map((s) => s.rep()));
    },

    VarDecl_list(_ingredient, declarations, _semi) {
      const declarationList = declarations.asIteration().children;
      const variableDeclarations = [];

      for (const declaration of declarationList) {
        const varDecl = declaration.rep();
        const variableName = varDecl.variable.name;
        const initializer = varDecl.initializer;

        context.add(variableName, varDecl.variable);

        variableDeclarations.push(
          core.variableDeclaration(varDecl.variable, initializer)
        );
      }

      return core.variableList(variableDeclarations);
    },

    // WORKING
    VarDecl_without_init(
      _ingredient,
      id,
      _colon,
      type,
      _semi,
      _section,
      modifier
    ) {
      const variableName = id.sourceString;
      const variableType = type.rep();
      if (_section.sourceString === "|") {
        mustHaveConstString(modifier, { at: _section });
      }
      const readOnly = modifier.sourceString === "const";
      mustNotAlreadyBeDeclared(variableName, { at: id });
      const initializer =
        variableType === INT
          ? 0n
          : variableType === FLOAT
          ? 0.0
          : variableType === STRING
          ? ""
          : variableType === BOOLEAN
          ? false
          : null;
      const variable = core.variable(variableName, readOnly, variableType);
      context.add(variableName, variable);
      return core.variableDeclaration(variable, initializer);
    },

    // WORKING
    VarInit(id, _colon_equals, exp, _section, modifier) {
      // true declaration, not just initialization
      const initializer = exp.rep();
      const readOnly = modifier.sourceString === "const";
      const variable = core.variable(
        id.sourceString,
        readOnly,
        initializer.type
      );
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, variable);
      return core.variableDeclaration(variable, initializer);
    },

    Field(_ingredient, id, _colon, type, _semi) {
      const field = core.field(id.sourceString, type.rep());
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, field);
      return field;
    },

    Stmt_assign(variable, _eq, expression, _semicolon) {
      const source = expression.rep();
      const target = variable.rep();
      mustHaveBeenFound(target, variable.sourceString, variable);
      let toType = target.type;
      if (toType.kind === "OptionalType") {
        toType = toType.baseType;
      }
      mustBeAssignable(source, { toType: toType }, { at: variable });
      mustNotBeReadOnly(target, { at: variable });
      return core.assignment(target, source);
    },

    IfStmt_with_else(_if, _open, exp, _close, block1, _else, block2) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext();
      const consequent = block1.rep();
      context = context.parent;
      context = context.newChildContext();
      const alternate = block2.rep();
      context = context.parent;
      return core.ifStatement(test, consequent, alternate);
    },

    IfStmt_nested_if(
      _if,
      _open,
      exp,
      _close,
      block,
      _else,
      trailingIfStatement
    ) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext();
      const consequent = block.rep();
      // Do NOT make a new context for the alternate!
      const alternate = trailingIfStatement.rep();
      return core.ifStatement(test, consequent, alternate);
    },

    IfStmt_plain_if(_if, _open, exp, _closed, block) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext();
      const consequent = block.rep();
      context = context.parent;
      return core.shortIfStatement(test, consequent);
    },

    Stmt_returnstmt(returnKeyword, exp, _semi) {
      mustBeInAFunction({ at: returnKeyword });
      mustReturnSomething(context.function, { at: returnKeyword });
      const returnExpression = exp.rep();
      mustBeReturnable(
        returnExpression,
        { from: context.function },
        { at: exp }
      );
      return core.returnStatement(returnExpression);
    },

    Stmt_shortreturn(returnKeyword, _semicolon) {
      mustBeInAFunction({ at: returnKeyword });
      mustNotReturnAnything(context.function, { at: returnKeyword });
      return core.shortReturnStatement();
    },

    Stmt_bump(operator, exp, _semicolon) {
      const variable = exp.rep();
      mustHaveIntegerType(variable, { at: exp });
      return operator.sourceString === "++"
        ? core.increment(variable)
        : core.decrement(variable);
    },

    Stmt_breakstmt(breakKeyword, _semicolon) {
      mustBeInLoop({ at: breakKeyword });
      return core.breakStatement();
    },

    ContinueStmt(_continue, _semi) {
      mustBeInLoop({ at: _continue });
      return new core.continueStatement();
    },

    WhileStmt(_while, _open, exp, _closed, block) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      context = context.newChildContext({ inLoop: true });
      const body = block.rep();
      context = context.parent;
      return core.whileStatement(test, body);
    },

    ForStmt_norm(_for, _open, init, exp, _semi, update, _close, block) {
      const initialization = init.rep();

      const condition = exp.rep();
      mustHaveBooleanType(condition, { at: exp });

      const updateExpression = update.rep();

      context = context.newChildContext({ inLoop: true });
      const body = block.rep();
      context = context.parent;
      return core.forStatement(
        initialization,
        condition,
        updateExpression,
        body
      );
    },

    ForStmt_collection(_for, _open, id, _in, exp, _closed, block) {
      const collection = exp.rep();
      mustHaveAnArrayType(collection, { at: exp });
      const iterator = core.variable(
        id.sourceString,
        true,
        collection.type.baseType
      );
      context = context.newChildContext({ inLoop: true });
      context.add(iterator.name, iterator);
      const body = block.rep();
      context = context.parent;
      return core.forCollectionStmt(iterator, collection, body);
    },

    PythForStmt(_f, id, _r, id1, id2, block) {
      const lowerBoundVar = context.lookup(id1.sourceString);
      const upperBoundVar = context.lookup(id2.sourceString);

      mustHaveBeenFound(lowerBoundVar, id1.sourceString, {
        at: id1,
      });
      mustHaveBeenFound(upperBoundVar, id2.sourceString, {
        at: id2,
      });

      mustHaveIntegerType(lowerBoundVar, { at: id1 });
      mustHaveIntegerType(upperBoundVar, { at: id2 });

      const iteratorName = id.sourceString;
      mustNotAlreadyBeDeclared(iteratorName, { at: id });

      context = context.newChildContext({ inLoop: true });
      context.add(iteratorName, core.variable(iteratorName, false, INT));

      const bodyStatements = block.rep();

      context = context.parent;

      return core.pythForStatement(
        iteratorName,
        lowerBoundVar,
        upperBoundVar,
        bodyStatements
      );
    },

    // FunDecl = recipe id "(" Params ")" (":" Type)? Block
    FunDecl(_recipe, id, _open, parameters, _closed, _colons, type, block) {
      const fun = core.fun(id.sourceString);
      mustNotAlreadyBeDeclared(id.sourceString, { at: id });
      context.add(id.sourceString, fun);

      context = context.newChildContext({ inLoop: false, function: fun });
      const params = parameters.rep();

      const paramTypes = params.map((param) => param.type);
      const returnType = type.children?.[0]?.rep() ?? VOID;
      fun.type = core.functionType(paramTypes, returnType);

      const body = block.rep();

      context = context.parent;
      return core.functionDeclaration(id.sourceString, fun, params, body);
    },

    Stmt_call(call, _semicolon) {
      return call.rep();
    },

    Stmt_methodcall(memberCall, _semicolon) {
      return memberCall.rep();
    },

    Params(paramList) {
      // Returns a list of variable nodes
      return paramList.asIteration().children.map((p) => p.rep());
    },

    Param(_ingredient, id, _colon, type) {
      const param = core.variable(id.sourceString, false, type.rep());
      mustNotAlreadyBeDeclared(param.name, { at: id });
      context.add(param.name, param);
      return param;
    },

    Block(_open, statements, _close) {
      return statements.children.map((s) => s.rep());
    },

    // WORKING
    ClassDecl(_dish, id, _open, varDecls, funDecls, _closed) {
      const className = id.sourceString;
      mustNotAlreadyBeDeclared(className, id);
      const type = core.classType(className, [], []);
      context.add(className, type);
      context = context.newChildContext({ inClass: true });
      const fields = varDecls.children.map((varDecl) => varDecl.rep());
      const methods = funDecls.children.map((funDecl) => funDecl.rep());

      context = context.parent;
      type.fields = fields;
      type.methods = methods;

      const classDeclaration = core.classDeclaration(type);
      //   context.add(className, classDeclaration);
      // TODO: ENSURE THAT MUSTHAVEDISTINCTFIELDS() IS NOT REQUIRED, SHOULD B FINE BUT IM GETTING ERROR WHEN NON-DISTINCT FIELDS
      return classDeclaration;
    },

    //TODO: Check this with Prof. bc idk if it will work well enough
    ObjDecl(
      classId1,
      objName,
      _assign,
      _new,
      classId2,
      _openParen,
      args,
      _closeParen,
      _semi
    ) {
      mustBeSameClass(classId1, classId2, { at: classId2 });

      const classEntity = context.lookup(classId1.sourceString);
      mustHaveBeenFound(classEntity, classId1.sourceString, { at: classId1 });
      mustBeAClass(classEntity, { at: classId1 });
      mustNotAlreadyBeDeclared(objName.sourceString, { at: objName });
      const actualArgs = args.asIteration().children.map((arg) => arg.rep());

      const expectedFields = classEntity.fields;
      must(
        actualArgs.length === expectedFields.length,
        `Expected ${expectedFields.length} argument(s), but got ${actualArgs.length}`,
        { at: args }
      );
      actualArgs.forEach((arg, i) => {
        mustBothHaveTheSameType(expectedFields[i], arg, { at: args });
      });

      const newObj = core.objectConstructor(
        objName.sourceString,
        actualArgs,
        classEntity
      );
      context.add(objName.sourceString, newObj);

      return newObj;
    },

    TryStmt(_try, block, catchClauses, finallyPart) {
      const tryBlock = block.rep();
      const catchClause = catchClauses.children.map((clause) => clause.rep());
      const finallyStatement = finallyPart?.children[0]?.rep() ?? null;
      return core.tryStatement(tryBlock, catchClause, finallyStatement);
    },

    // FIXME: HOW TO CONNECT ERROR VALUES TO ERROR VARIABLES SUCH THAT AN ERROR VARIABLE
    // IS AN OBJECT CONTAINING E.MSG AND E.TYPE FOR THE MSG AND ERROR TYPE PASSED, WORK WITH ERRORSTMT TO FIX
    // TODO: FIX THIS SOON
    Catch(_catch, _open, error, id, _close, block) {
      mustBeValidErrorType(error);
      const errorType = error.sourceString;
      const errorName = id.sourceString;
      mustNotAlreadyBeDeclared(errorName, { at: id });
      context = context.newChildContext();
      //   const error = core.error(errorType); FIXME: THIS NEEDS TO BE REWORKED AND CORE ERROR MUST BE CREATED TO ACCOUNT FOR MSG
      context.add(errorName, errorType);
      const body = block.rep();
      context = context.parent;
      return core.catchClause(errorType, errorName, body);
    },

    Finally(_finally, block) {
      const finallyBlock = block.rep();
      return core.finallyBlock(finallyBlock);
    },

    // working: eightysix('message', ExceptionType);
    ErrorStmt(
      _eightysix,
      _open,
      errorMessage,
      _comma,
      errorType,
      _closed,
      _semi
    ) {
      const error = errorType.sourceString;
      const message = errorMessage.sourceString;
      mustBeValidErrorType(errorType, { at: errorType });
      return new core.errorStatement(error, message);
    },

    Exp_conditional(exp, _questionMark, exp1, colon, exp2) {
      const test = exp.rep();
      mustHaveBooleanType(test, { at: exp });
      const [consequent, alternate] = [exp1.rep(), exp2.rep()];
      mustBothHaveTheSameType(consequent, alternate, { at: colon });
      return core.conditional(test, consequent, alternate, consequent.type);
    },

    Exp1_unwrapelse(exp1, elseOp, exp2) {
      const [optional, op, alternate] = [
        exp1.rep(),
        elseOp.sourceString,
        exp2.rep(),
      ];
      mustHaveAnOptionalType(optional, { at: exp1 });
      mustBeAssignable(
        alternate,
        { toType: optional.type.baseType },
        { at: exp2 }
      );
      return core.binary(op, optional, alternate, optional.type);
    },
    Exp2_or(exp, _ops, exps) {
      let left = exp.rep();
      mustHaveBooleanType(left, { at: exp });
      for (let e of exps.children) {
        let right = e.rep();
        mustHaveBooleanType(right, { at: e });
        left = core.binary("||", left, right, BOOLEAN);
      }
      return left;
    },

    Exp2_and(exp, _ops, exps) {
      let left = exp.rep();
      mustHaveBooleanType(left, { at: exp });
      for (let e of exps.children) {
        let right = e.rep();
        mustHaveBooleanType(right, { at: e });
        left = core.binary("&&", left, right, BOOLEAN);
      }
      return left;
    },

    Exp3_bitor(exp, _ops, exps) {
      let left = exp.rep();
      mustHaveIntegerType(left, { at: exp });
      for (let e of exps.children) {
        let right = e.rep();
        mustHaveIntegerType(right, { at: e });
        left = core.binary("|", left, right, INT);
      }
      return left;
    },

    Exp3_bitxor(exp, xorOps, exps) {
      let left = exp.rep();
      mustHaveIntegerType(left, { at: exp });
      for (let e of exps.children) {
        let right = e.rep();
        mustHaveIntegerType(right, { at: e });
        left = core.binary("^", left, right, INT);
      }
      return left;
    },

    Exp3_bitand(exp, andOps, exps) {
      let left = exp.rep();
      mustHaveIntegerType(left, { at: exp });
      for (let e of exps.children) {
        let right = e.rep();
        mustHaveIntegerType(right, { at: e });
        left = core.binary("&", left, right, INT);
      }
      return left;
    },

    Exp4_compare(exp1, relop, exp2) {
      const [left, op, right] = [exp1.rep(), relop.sourceString, exp2.rep()];
      // == and != can have any operand types as long as they are the same
      // But inequality operators can only be applied to numbers and strings
      if (["<", "<=", ">", ">="].includes(op)) {
        mustHaveNumericOrStringType(left, { at: exp1 });
      }
      mustBothHaveTheSameType(left, right, { at: relop });
      return core.binary(op, left, right, BOOLEAN);
    },

    Exp5_shift(exp1, shiftOp, exp2) {
      const [left, op, right] = [exp1.rep(), shiftOp.sourceString, exp2.rep()];
      mustHaveIntegerType(left, { at: exp1 });
      mustHaveIntegerType(right, { at: exp2 });
      return core.binary(op, left, right, INT);
    },

    Exp6_add(exp1, addOp, exp2) {
      const [left, op, right] = [exp1.rep(), addOp.sourceString, exp2.rep()];
      if (op === "+") {
        mustHaveNumericOrStringType(left, { at: exp1 });
      } else {
        mustHaveNumericType(left, { at: exp1 });
      }
      mustBothHaveTheSameType(left, right, { at: addOp });
      return core.binary(op, left, right, left.type);
    },

    Exp6_bump(operator, exp) {
      const variable = exp.rep();
      mustHaveIntegerType(variable, { at: exp });
      return operator.sourceString === "++"
        ? core.increment(variable)
        : core.decrement(variable);
    },

    Exp7_multiply(exp1, mulOp, exp2) {
      const [left, op, right] = [exp1.rep(), mulOp.sourceString, exp2.rep()];
      mustHaveNumericType(left, { at: exp1 });
      mustBothHaveTheSameType(left, right, { at: mulOp });
      return core.binary(op, left, right, left.type);
    },

    Exp8_power(exp1, powerOp, exp2) {
      const [left, op, right] = [exp1.rep(), powerOp.sourceString, exp2.rep()];
      mustHaveNumericType(left, { at: exp1 });
      mustBothHaveTheSameType(left, right, { at: powerOp });
      return core.binary(op, left, right, left.type);
    },

    Exp8_unary(unaryOp, exp) {
      const [op, operand] = [unaryOp.sourceString, exp.rep()];
      let type;
      if (op === "-") {
        mustHaveNumericType(operand, { at: exp });
        type = operand.type;
      } else if (op === "!") {
        mustHaveBooleanType(operand, { at: exp });
        type = BOOLEAN;
      } else if (op === "poached") {
        type = core.optionalType(operand.type);
      } else if (op === "random") {
        mustHaveAnArrayType(operand, { at: exp });
        type = operand.type.baseType;
      }
      return core.unary(op, operand, type);
    },

    Exp9_emptyarray(ty, _open, _close) {
      const type = ty.rep();
      mustBeAnArrayType(type, { at: ty });
      return core.emptyArray(type);
    },

    Exp9_arrayexp(_open, args, _close) {
      const elements = args.asIteration().children.map((e) => e.rep());
      mustAllHaveSameType(elements, { at: args });
      return core.arrayExpression(elements);
    },

    Exp9_emptyopt(_raw, type) {
      return core.emptyOptional(type.rep());
    },

    Exp9_parens(_open, expression, _close) {
      return expression.rep();
    },

    Exp9_subscript(exp1, _open, exp2, _close) {
      const [array, subscript] = [exp1.rep(), exp2.rep()];
      mustHaveAnArrayType(array, { at: exp1 });
      mustHaveIntegerType(subscript, { at: exp2 });
      return core.subscript(array, subscript);
    },

    // working!
    Exp9_methodCall(objectId, _dot, methodId, _open, expList, _closed) {
      const object = objectId.rep();
      mustBeAClass(context.lookup(object.type.name), { at: objectId });
      const classContext = context.lookup(object.type.name);
      const method = classContext.methods.find(
        (m) => m.name === methodId.sourceString
      );
      mustBeAMethod(method, methodId, { at: methodId });
      const methodDecl = method["fun"];
      const exps = expList.asIteration().children;
      const args = exps.map((exp) => {
        return exp.rep();
      });
      //   mustBeCallable(methodDecl, { at: methodId });
      const targetTypes = methodDecl.type.paramTypes;
      mustHaveCorrectArgumentCount(args.length, targetTypes.length, {
        at: objectId,
      });
      return core.methodCall(object, methodDecl, args);
    },

    Exp9_member(exp, dot, id) {
      const object = exp.rep();
      let classType;
      if (dot.sourceString === "?.") {
        // mustHaveAnOptionalStructType(object, { at: exp }); TODO: Reimplement this
        classType = object.type.baseType;
      } else {
        classType = object.type;
      }
      mustBeAClass(context.lookup(object.type.name), { at: exp });
      const classContext = context.lookup(object.type.name);
      mustHaveBeenFound(object, object.sourceString, { at: exp });
      mustNotBePrivate(id, {
        at: id,
      });

      const field = classContext.fields.find((f) => f.name === id.sourceString);
      mustHaveValidMember(field, id.sourceString, { at: id });
      return core.memberExpression(object, dot.sourceString, field);
    },

    Exp9_call(exp, open, expList, _close) {
      const callee = exp.rep();
      mustBeCallable(callee, { at: exp });

      // Handle calls to "serve" differently by not checking argument types
      if (callee.name === "serve") {
        const args = expList.asIteration().children.map((exp) => exp.rep());
        return core.functionCall(callee, args);
      }

      // For all other functions, perform regular argument type checks
      const exps = expList.asIteration().children;
      const targetTypes = callee.type.paramTypes;
      mustHaveCorrectArgumentCount(exps.length, targetTypes.length, {
        at: open,
      });

      const args = exps.map((exp, i) => {
        const arg = exp.rep();
        mustBeAssignable(arg, { toType: targetTypes[i] }, { at: exp });
        return arg;
      });

      return core.functionCall(callee, args);
    },

    Exp9_id(id) {
      // When an id appears in an expression, it had better have been declared
      const entity = context.lookup(id.sourceString);
      mustHaveBeenFound(entity, id.sourceString, { at: id });
      return entity;
    },

    Type_optional(baseType, _questionMark) {
      return core.optionalType(baseType.rep());
    },

    Type_array(_left, baseType, _right) {
      return core.arrayType(baseType.rep());
    },

    Type_function(_left, types, _right, _arrow, type) {
      const paramTypes = types.asIteration().children.map((t) => t.rep());
      const returnType = type.rep();
      return core.functionType(paramTypes, returnType);
    },

    Type_id(id) {
      const entity = context.lookup(id.sourceString);
      mustHaveBeenFound(entity, id.sourceString, { at: id });
      mustBeAType(entity, { at: id });
      return entity;
    },

    true(_) {
      return true;
    },

    false(_) {
      return false;
    },

    intlit(_digits) {
      return BigInt(this.sourceString);
    },

    floatlit(_whole, _point, _fraction, _e, _sign, _exponent) {
      return Number(this.sourceString);
    },

    stringlit(_openQuote, _chars, _closeQuote) {
      return this.sourceString;
    },
  });

  return analyzer(match).rep();
}
