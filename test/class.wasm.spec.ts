import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

let instance: WebAssembly.Instance;

test('it should compile "class.tbs" correctly', () => {
    instance = getWasmInstanceSync(path.join(__dirname, 'class.tbs'))
});

test('test should instantiate class "Child" with parameter value and return same value', () => {
    expect(instance.exports.test(1.56)).toBe(1.56);
});
