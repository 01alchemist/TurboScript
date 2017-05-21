import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

let instance: WebAssembly.Instance;

test('it should compile "variable-assign.tbs" correctly', () => {
    instance = getWasmInstanceSync(path.join(__dirname, 'variable-assign.tbs'))
});

test('assign variables by default value', () => {
    expect(instance.exports.assignByDefault()).toBe(0);
});
test('assign variables by value', () => {
    expect(instance.exports.assignByValue()).toBe(1);
});
test('assign variables by function parameter', () => {
    expect(instance.exports.assignByParameter(2)).toBe(2);
});
test('assign variables by function call', () => {
    expect(instance.exports.assignByCall()).toBe(3);
});
test('assign variables by new', () => {
    let value;
    expect(() => {
        value = instance.exports.assignByNew(4);
    }).not.toThrow();
    expect(instance.exports.getValue(value)).toBe(4);
});

test('assign variables by member', () => {
    expect(instance.exports.assignByMember(5)).toBe(5);
});
