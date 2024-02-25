import * as core from "./core.js";

export default function analyze(match) {
  const analyzer = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(statements) {
      return new core.Program(statements.children.map((s) => s.rep()));
    },

    // VarDecl = ingredient nonemptyListOf<(VarInit | id), ","> ";" --list
    //       | ingredient id ";" --wihout_init
    // TODO: FIX THIS AND IMPLEMENT
    // VarDecl_list(_var, decls, _semi) {
    //   if (decls.length === 1) {
    //     return new core.VarDecl(decls[0].rep(), null);
    //   } else {
    //     return new core.VarDecl(decls[0].rep(), decls[1].rep());
    //   }
    // },

    VarDecl_list(_ingredient, ids, _semi) {},

    VarDecl_without_init(_ingredient, id, _semi) {
      return new core.VarDecl(id.rep(), null);
    },

    Assignment(target, _eq, expression, _semi) {
      return new core.Assignment(target.rep(), expression.rep());
    },

    PrintStmt(_print, _open, exps, _closed, _semi) {
      return exps
        .asIteration()
        .children.map((exp) => new core.PrintStatement(exp.rep()));
    },

    IfStmt_with_else(_if, _open, exp, _closed, block, _else, else_block) {},
    IfStmt_nested_if(_if, _open, exp, _closed, block, _else, stmt) {},
    IfStmt_plain_if(_if, _open, exp, _closed, block) {},

    ReturnStmt(_return, exp, _semi) {
      return new core.ReturnStatement(exp.rep());
    },

    //TODO: FIGURE OUT HOW TO DO THE TRY CATCH FINALLY STATEMENTS

    ContinueStmt(_continue, _semi) {
      return new core.ContinueStatement();
    },

    WhileStmt(_while, _open, exp, _closed, block) {
      return new core.WhileStatement(exp.rep(), block.rep());
    },

    ForStmt_norm(_for, _open, init, test, _semi, update, _updatesemi, block) {},

    ErrorStmt(_eightysix, _open, exp, _closed, _semi) {
      return new core.ErrorStatement(exp);
    },

    Stmt_pyth_for(statement, Block) {},

    pythForStmt(_f, id, _r, id1, id2) {
      return new core.PythForStmt(id.rep(), id1.rep(), id2.rep());
    },

    FunDecl(_recipe, id, _open, params, _closed, block) {},

    ClassDecl(_dish, id, _open, decls, _closed) {},

    ObjDecl(typeid, id, _equals, _new, classid, _open, args, _closed, _semi) {},

    CallStmt(call, _semi) {},

    Block(_open, stmts, _close) {
      return statements.children.map((s) => s.rep());
    },
    BreakStmt(_break, _semi) {
      return new core.BreakStatement();
    },

    Exp_negation(op, operand) {
      return new core.UnaryExpression(op.sourceString, operand.rep());
    },

    Exp_ternary(test, _if, conseq, _else, alt) {
      return new core.IfStatement(test.rep(), conseq.rep(), alt.rep());
    },
    Exp_incrementing(op, operand) {
      return new core.UnaryExpression(op.sourceString, operand.rep());
    },

    Exp0_or(left, _or, right) {
      return new core.BinaryExpression(left.rep(), "||", right.rep());
    },

    Exp1_and(left, _and, right) {
      return new core.BinaryExpression(left.rep(), "&&", right.rep());
    },

    Exp2_relational(left, relop, right) {
      return new core.BinaryExpression(
        left.rep(),
        _relop.sourceString,
        right.rep()
      );
    },

    Exp3_add(left, op, right) {
      return new core.BinaryExpression(
        left.rep(),
        op.sourceString,
        right.rep()
      );
    },

    Term_multiply(left, op, right) {
      return new core.BinaryExpression(
        left.rep(),
        op.sourceString,
        right.rep()
      );
    },

    Factor_exponentiation(left, op, right) {
      return new core.BinaryExpression(left.rep(), "**", right.rep());
    },

    Primary_array(_open, args, _closed) {},

    Primary_subscript(object, _open, index, _closed) {},

    Primary_member(member, _dot, id) {},

    Primary_parens(_open, exp, _close) {
      return exp.rep();
    },

    Primary_id(id) {
      return new core.Variable(id.sourceString);
    },

    num(_main, _dot, _frac, _e, _sign, _exp) {
      return Number(this.sourceString);
    },

    string(_open, chars, _closed) {
      return this.sourceString;
    },
  });

  return analyzer(match).rep();
}
