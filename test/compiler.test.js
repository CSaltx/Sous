import * as assert from "node:assert/strict";
import { sous } from "../src/sous.js";

describe("Compiler", () => {
  it("should compile a function", () => {
    assert.equal(sous(), "Welcome to the Sous Compiler!");
  });
});
