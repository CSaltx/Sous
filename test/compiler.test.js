import assert from "node:assert/strict";
import compile from "../src/compiler.js";
import optimize from "../src/optimizer.js";
import generate from "../src/generator.js";

// Note: compiler's lines 14-16 cannot be tested as the analyzer fails first
// and the optimize/generate lines are unreacheable

const sampleProgram = "serve(0);";

describe("The compiler", () => {
  it("throws when the output type is missing", (done) => {
    assert.throws(() => compile(sampleProgram), /Unknown output type/);
    done();
  });
  it("throws when the output type is unknown", (done) => {
    assert.throws(
      () => compile(sampleProgram, "no such type"),
      /Unknown output type/
    );
    done();
  });
  it("accepts the parsed option", (done) => {
    const compiled = compile(sampleProgram, "parsed");
    assert(compiled.startsWith("Syntax is ok"));
    done();
  });

  // it("throws an error with the 'analyzed' option", () => {
  //   assert.throws(() => {
  //     compile(sampleProgram, "analyzed");
  //   });
  // }); //FIXME: ADD IN TEST HERE

  it("throws an error with the 'optimized' option", () => {
    // manually test for non-implementation
    assert.throws(() => {
      optimize(), "Not yet implemented";
    });
  });

  it("throws an error with the 'js' option", () => {
    // manually test for non-implementation
    assert.throws(() => {
      generate(), "Not yet implemented";
    });
  });
});
