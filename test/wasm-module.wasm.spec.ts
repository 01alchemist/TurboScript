import * as path from "path";
import * as fs from "fs";
import { getWasmInstanceSync } from "./utils/utils";
import {WasmModule} from "../src/backends/webassembly/wasm/wasm-module";
import {ByteArray} from "../src/utils/bytearray";

test('wasm-module', () => {

    // let wasmBinary = fs.readFileSync(path.resolve(__dirname, "../src/library/common/malloc/build/malloc.wasm"));
    let wasmBinary = fs.readFileSync(path.resolve(__dirname, "./addtwo.wasm"));
    let wasmModule = new WasmModule(wasmBinary);
    expect(wasmModule).toBeTruthy();
});
