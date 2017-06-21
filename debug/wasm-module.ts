/**
 * Created by 01 on 2017-06-21.
 */
import * as path from "path";
import * as fs from "fs";
import {WasmModule} from "../src/backends/webassembly/wasm/wasm-module";

let wasmBinary = fs.readFileSync(path.resolve(__dirname, "../../debug/test-subjects/addtwo.wasm"));
let wasmModule = new WasmModule(wasmBinary);
