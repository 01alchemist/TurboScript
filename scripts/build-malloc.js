const util = require("webassembly/cli/util");
const path = require("path");
const fs = require("fs");

const basedir = path.join(__dirname, "..", "src", "library", "common", "malloc");

util.run(path.join(util.bindir, "clang"), [
  "malloc.c",
  "-E",
  "-o", "build/malloc.pre.c"
], { cwd: basedir })

.then(() =>

util.run(path.join(util.bindir, "clang"), [
  "malloc.c",
  "-S",
  "-O",
  "-mlittle-endian",
  "--target=wasm32-unknown-unknown",
  "-nostdinc",
  "-nostdlib",
  "-o", "build/malloc.s"
], { cwd: basedir }))

.then(() =>

util.run(path.join(util.bindir, "s2wasm"), [
  "build/malloc.s",
  "--initial-memory", "65536",
  "--global-base", "64",
  "--validate", "wasm",
  "-o", "build/malloc.wast"
], { cwd: basedir }))

.then(() =>

util.run(path.join(util.bindir, "wasm-opt"), [
  "build/malloc.wast",
  "-g",
  "-Oz",
  "--coalesce-locals-learning",
  "--ignore-implicit-traps",
  "--dce",
  "--duplicate-function-elimination",
  "--inlining",
  "--local-cse",
  "--merge-blocks",
  "--optimize-instructions",
  "--pick-load-signs",
  "--precompute",
  "--remove-unused-brs",
  "--remove-unused-namespace-elements",
  "--reorder-locals",
  "--simplify-locals",
  "--vacuum",
  "-o", "build/malloc.wasm"
], { cwd: basedir }))

.then(() =>

util.run(path.join(util.bindir, "wasm-dis"), [
  "build/malloc.wasm",
  "-o", "build/malloc.wast"
], { cwd: basedir }))

.then(() => console.log("complete"));
