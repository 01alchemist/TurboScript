import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

let instance: WebAssembly.Instance;

test('while loop', () => {
    instance = getWasmInstanceSync(path.join(__dirname, 'while-loop.tbs'));
    expect(instance.exports.test(100)).toBe(100);
});
