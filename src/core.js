export function program(statements) {
  return { kind: "Program", statements };
}

export function variableDeclaration(name, initializer) {
  return { kind: "VariableDeclaration", name, initializer };
}

export function variable(name, readOnly, type) {
  return { kind: "Variable", name, readOnly, type };
}

export function field(name, type) {
  return { kind: "Field", name, type };
}

export function functionDeclaration(name, fun, params, body) {
  return { kind: "FunctionDeclaration", name, fun, params, body };
}

export function classDeclaration(name, fields, methods) {
  return { kind: "ClassDeclaration", name, fields, methods };
}

export function objectConstructor(name, fields, type) {
  return { kind: "ObjectConstructor", name, fields, type };
}

export function fun(name, type) {
  return { kind: "Function", name, type };
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

export const breakStatement = { kind: "BreakStatement" };

export function returnStatement(expression) {
  return { kind: "ReturnStatement", expression };
}

export function shortReturnStatement() {
  return { kind: "ShortReturnStatement" };
}

export function ifStatement(test, consequent, alternate) {
  return { kind: "IfStatement", test, consequent, alternate };
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

export function emptyOptional(baseType) {
  return { kind: "EmptyOptional", baseType, type: optionalType(baseType) };
}

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

export function constructorCall(callee, args) {
  return { kind: "ConstructorCall", callee, args, type: callee };
}

export function pythForStatement(iterator, low, high, body) {
  return { kind: "ForStatement", iterator, low, high, body };
}

export const continueStatement = { kind: "ContinueStatement" };

export function forStatement(init, test, update, body) {
  return { kind: "ForStatement", init, test, update, body };
}
export function throwStatement(argument) {
  return { kind: "ThrowStatement", argument };
}

export function tryStatement(block, catchClauses, finallyBlock) {
  return { kind: "TryStatement", block, catchClauses, finallyBlock };
}

export function catchClause(errorType, name, body) {
  return { kind: "CatchClause", errorType, name, body };
}

export function finallyBlock(block) {
  return { kind: "Finally", block };
}

export function errorStatement(type, message) {
  return { kind: "ErrorStatement", type, message };
}

// the following code is taken from Professor Ray Toal's lecture notes: https://cs.lmu.edu/~ray/notes/howtowriteacompiler/
// all code is taken with permission from the author

export const boolType = { kind: "BoolType" };
export const intType = { kind: "IntType" };
export const floatType = { kind: "FloatType" };
export const stringType = { kind: "StringType" };
export const voidType = { kind: "VoidType" };
export const anyType = { kind: "AnyType" };

const floatToFloatType = functionType([floatType], floatType);
const floatFloatToFloatType = functionType([floatType, floatType], floatType);
const stringToIntsType = functionType([stringType], arrayType(intType));
const anyToVoidType = functionType([anyType], voidType);
const anyToIntType = functionType([anyType], intType);

export const standardLibrary = Object.freeze({
  int: intType,
  float: floatType,
  boolean: boolType,
  string: stringType,
  void: voidType,
  any: anyType,
  π: variable("π", true, floatType),
  serve: fun("serve", anyToVoidType),
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
