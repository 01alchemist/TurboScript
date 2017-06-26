import * as path from "path";
import {getWasmInstanceSync, compileWasmSync} from "./utils/utils";

test('wasm-module', () => {
    let importInstance = getWasmInstanceSync(path.join(__dirname, 'wasm-module.tbs'));
    let instance = getWasmInstanceSync(path.join(__dirname, 'wasm-module-import.tbs'), {internal: importInstance.exports});
    expect(instance.exports.test(100)).toBe(100);
});
