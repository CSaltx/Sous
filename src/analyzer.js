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

    VarDecl_without_init(_var, id, _semi) {
      return new core.VarDecl(id.rep(), null);
    },

    Assignment(target, _eq, expression, _semi) {
      return new core.Assignment(target.rep(), expression.rep());
    },

    Print(_print, exp, _semi) {
      return new core.PrintStatement(exp.rep());
    },

    IfStmt(_if, exp, block, elsePart) {},
    ElsePart_nested_if(_else, stmt) {},
    ElsePart_else_block(_else, block) {},

    ReturnStatement(_return, exp, _semi) {
      return new core.ReturnStatement(exp.rep());
    },

    //TODO: FIGURE OUT HOW TO DO THE TRY CATCH FINALLY STATEMENTS

    ContinueStmt(_continue, _semi) {
      return new core.ContinueStatement();
    },

    WhileStmt(_while, exp, block) {
      return new core.WhileStatement(exp.rep(), block.rep());
    },

    ForStmt(_for, _open, init, test, _semi, update, _updatesemi, block) {
      return new core.ForStatement(
        init.rep(),
        test.rep(),
        update.rep(),
        block.rep()
      );
    },

    ErrorStmt(_eightysix, Exp, _semi) {
      throw new core.ErrorStatement(Exp);
    },

    pythForStmt(_f, id, _r, id1, id2, body) {
      return new core.PythForStmt(id.rep(), id1.rep(), id2.rep(), body.rep());
    },

    Block(_open, stmts, _close) {
      return statements.children.map((s) => s.rep());
    },
    BreakStmt(_break, _semi) {
      return new core.BreakStatement();
    },

    Exp_negation(op, operand) {
      return new core.UnaryExpression(op.sourceString, operand.rep());
    },

    Exp_binary(test, _if, conseq, _else, alt) {
      return new core.IfStatement(test.rep(), conseq.rep(), alt.rep());
    },
    Exp_incrementing(op, operand) {
      return new core.UnaryExpression(op.sourceString, operand.rep());
    },
    Exp_exp0(exp) {
      return exp.rep();
    },
    Factor_negation(op, operand) {
      return new core.UnaryExpression(op.sourceString, operand.rep());
    },
    Primary_call(id, _open, args, _close) {
      return new core.Call(id.rep(), args.rep());
    },
    Primary_parens(_open, exp, _close) {
      return exp.rep();
    },
    Primary_id(id) {
      return new core.Variable(id.sourceString);
    },
    numeral(_main, _dot, _frac, _e, _sign, _exp) {
      return Number(this.sourceString);
    },
  });

  return analyzer(match).rep();
}
