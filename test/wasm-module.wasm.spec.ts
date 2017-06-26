import * as path from "path";
import * as fs from "fs";
import {compileWasmSync} from "./utils/utils";
import {WasmModule} from "../src/backends/webassembly/wasm/wasm-module";

test('wasm-module', () => {
    compileWasmSync(path.join(__dirname, 'wasm-module.tbs'));
    let wasmBinary = fs.readFileSync(path.resolve(__dirname, "./bin/wasm-module.wasm"));
    let wasmModule = new WasmModule(wasmBinary);
    expect(wasmModule).toBeTruthy();
});
