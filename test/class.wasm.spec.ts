import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

let instance: WebAssembly.Instance;

test('it should compile "variable-assign.tbs" correctly', () => {
    instance = getWasmInstanceSync(path.join(__dirname, 'variable-assign.tbs'))
});

test('assign variables by default value', () => {
    expect(instance.exports.assignByDefault()).toBe(0);
});
