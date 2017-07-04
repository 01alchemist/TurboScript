import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

test('wasm-module', () => {
    let importInstance = getWasmInstanceSync(path.join(__dirname, 'wasm-module.tbs'), {}, null, ["--no-malloc"]);
    let instance = getWasmInstanceSync(path.join(__dirname, 'wasm-module-import.tbs'), {global: importInstance.exports}, null, ["--no-malloc"]);
    expect(instance.exports.test(100)).toBe(100);
});
