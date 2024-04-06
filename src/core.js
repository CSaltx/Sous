export function program(statements) {
  return { kind: "Program", statements };
}

export function variableDeclaration(variable, initializer) {
  return { kind: "VariableDeclaration", variable, initializer };
}

export function variableList(declarations) {
  return { kind: "VariableList", declarations };
}

export function variable(name, readOnly, type) {
  return { kind: "Variable", name, readOnly, type };
}

export function functionDeclaration(name, fun, params, body) {
  return { kind: "FunctionDeclaration", name, fun, params, body };
}

export function methodDeclaration(name, fun, params, body) {
  return { kind: "MethodDeclaration", name, fun, params, body };
}

export function emptyOptional(baseType) {
  return { kind: "EmptyOptional", baseType, type: optionalType(baseType) };
}

export function classDeclaration(type) {
  return { kind: "ClassDeclaration", type };
}

export function classType(name, fields, methods) {
  return { kind: "ClassType", name, fields, methods };
}

export function objectConstructor(variable, fields, type) {
  return { kind: "ObjectConstructor", variable, fields, type };
}

export function fun(name, type) {
  return { kind: "Function", name, type };
}

export function field(name, type) {
  return { kind: "Field", name, type };
}

export function arrayType(baseType) {
  return { kind: "ArrayType", baseType };
}

export function functionType(paramTypes, returnType) {
  return { kind: "FunctionType", paramTypes, returnType };
}

export function optionalType(baseType) {
  return { kind: "OptionalType", baseType };
}

export function increment(variable) {
  return { kind: "Increment", variable };
}

export function decrement(variable) {
  return { kind: "Decrement", variable };
}

export function assignment(target, source) {
  return { kind: "Assignment", target, source };
}

export function breakStatement() {
  return { kind: "BreakStatement" };
}

export function continueStatement() {
  return { kind: "ContinueStatement" };
}

export function returnStatement(expression) {
  return { kind: "ReturnStatement", expression };
}

export function shortReturnStatement() {
  return { kind: "ShortReturnStatement" };
}

export function ifStatement(test, consequent, alternate) {
  return { kind: "IfStatement", test, consequent, alternate };
}

export function shortIfStatement(test, consequent) {
  return { kind: "ShortIfStatement", test, consequent };
}

export function whileStatement(test, body) {
  return { kind: "WhileStatement", test, body };
}

export function conditional(test, consequent, alternate, type) {
  return { kind: "Conditional", test, consequent, alternate, type };
}

export function binary(op, left, right, type) {
  return { kind: "BinaryExpression", op, left, right, type };
}

export function unary(op, operand, type) {
  return { kind: "UnaryExpression", op, operand, type };
}

// export function emptyOptional(baseType) {
//   return { kind: "EmptyOptional", baseType, type: optionalType(baseType) };
// } //TODO: FIXME: CHECK THIS

export function subscript(array, index) {
  return {
    kind: "SubscriptExpression",
    array,
    index,
    type: array.type.baseType,
  };
}

export function arrayExpression(elements) {
  return {
    kind: "ArrayExpression",
    elements,
    type: arrayType(elements[0].type),
  };
}

export function emptyArray(type) {
  return { kind: "EmptyArray", type };
}

export function memberExpression(object, op, field) {
  return { kind: "MemberExpression", object, op, field, type: field.type };
}

export function functionCall(callee, args) {
  return { kind: "FunctionCall", callee, args, type: callee.type.returnType };
}

// export function constructorCall(callee, args) {
//   return { kind: "ConstructorCall", callee, args, type: callee };
// } TODO: CHECK HERE FIXME: CHECK HERE

export function pythForStatement(iterator, low, high, body) {
  return { kind: "PythForStatement", iterator, low, high, body };
}

export function forStatement(init, test, update, body) {
  return { kind: "ForRangeStatement", init, test, update, body };
}

export function forCollectionStmt(iterator, collection, body) {
  return { kind: "ForStatement", iterator, collection, body };
}

export function tryStatement(body, catchClauses, finallyBlock) {
  return { kind: "TryStatement", body, catchClauses, finallyBlock };
}

export function catchClause(errorType, errorName, body) {
  return { kind: "CatchClause", errorType, errorName, body };
}

export function finallyBlock(body) {
  return { kind: "Finally", body };
}

export function errorStatement(type, message) {
  return { kind: "ErrorStatement", type, message };
}

export function errorObject(type, name) {
  return { kind: "ErrorObject", type, name };
}

export function methodCall(object, method, args) {
  return {
    kind: "MethodCall",
    object,
    method,
    args,
    type: method.type.returnType,
  };
}
// the following code is taken from Professor Ray Toal's lecture notes: https://cs.lmu.edu/~ray/notes/howtowriteacompiler/
// all code is taken with permission from the author

export const boolType = { kind: "BoolType" };
export const intType = { kind: "IntType" };
export const floatType = { kind: "FloatType" };
export const stringType = { kind: "StringType" };
export const voidType = { kind: "VoidType" };
export const anyType = { kind: "AnyType" };
export const Exception = { kind: "Exception" };
export const TypeError = { kind: "TypeError" };
export const ValueError = { kind: "ValueError" };
export const KeyError = { kind: "KeyError" };
export const IndexError = { kind: "IndexError" };
export const RuntimeError = { kind: "RuntimeError" };

const floatToFloatType = functionType([floatType], floatType);
const floatFloatToFloatType = functionType([floatType, floatType], floatType);
const stringToIntsType = functionType([stringType], arrayType(intType));
const anyToVoidType = functionType([anyType], voidType);
const anyToIntType = functionType([anyType], intType);
const anyArrayToVoidType = functionType([arrayType(anyType)], voidType);

export const standardLibrary = Object.freeze({
  int: intType,
  float: floatType,
  boolean: boolType,
  string: stringType,
  void: voidType,
  any: anyType,
  Exception: Exception,
  TypeError: TypeError,
  ValueError: ValueError,
  KeyError: KeyError,
  IndexError: IndexError,
  RuntimeError: RuntimeError,
  π: variable("π", true, floatType),
  serve: fun("serve", anyArrayToVoidType),
  sin: fun("sin", floatToFloatType),
  cos: fun("cos", floatToFloatType),
  exp: fun("exp", floatToFloatType),
  ln: fun("ln", floatToFloatType),
  hypot: fun("hypot", floatFloatToFloatType),
  bytes: fun("bytes", stringToIntsType),
  count: fun("count", anyToIntType),
  codepoints: fun("codepoints", stringToIntsType),
});

String.prototype.type = stringType;
Number.prototype.type = floatType;
BigInt.prototype.type = intType;
Boolean.prototype.type = boolType;
