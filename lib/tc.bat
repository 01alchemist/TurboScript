@echo off
rem ts-node tc.ts %1 %2 %3 %4.wasm
node tc.js %1 %2 %3 %4.wasm
wasm2wast %4.wasm -o %4.wast -v