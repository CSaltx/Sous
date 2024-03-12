#! /usr/bin/env node

import * as fs from "node:fs/promises";
import process from "node:process";
import compile from "./compiler.js";
// import { Program } from "./core.js";
import stringify from "graph-stringify";
import util from "node:util";
import parse from "./parser.js";
import analyze from "./analyzer.js";

const help = `Sous compiler

Syntax: sous <filename> <outputType>

Prints to stdout according to <outputType>, which must be one of:

  parsed     a message that the program was matched ok by the grammar
  analyzed   the statically analyzed representation
  optimized  the optimized semantically analyzed representation
  js         the translation to JavaScript
`;

async function compileFromFile(filename, outputType) {
  try {
    const buffer = await fs.readFile(filename);
    const compiled = compile(buffer.toString(), outputType);
    console.log(stringify(compiled, "kind") || compiled);
  } catch (e) {
    console.error(`\u001b[31m${e}\u001b[39m`);
    process.exitCode = 1;
  }
}

if (process.argv.length !== 4) {
  console.log(help);
} else {
  compileFromFile(process.argv[2], process.argv[3]);
}
