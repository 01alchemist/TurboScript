#!/usr/bin/env bash
node tc.js $1 $2 $3 $4.wasm
wasm2wast $4.wasm -o $4.wast -v