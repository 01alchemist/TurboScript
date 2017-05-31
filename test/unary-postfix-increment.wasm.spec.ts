import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

const instance:WebAssembly.Instance = getWasmInstanceSync(path.join(__dirname, 'unary-postfix-increment.tbs'));

test('unary postfix increment i32', () => {
    expect(instance.exports.testi32()).toBe(1);
});

test('unary postfix increment i64', () => {
    expect(instance.exports.testi64()).toBe(101);
});

test('unary postfix increment f32', () => {
    expect(instance.exports.testf32()).toBeCloseTo(1.16589, 5);
});

test('unary postfix increment f64', () => {
    expect(instance.exports.testf64()).toBeCloseTo(1.68651, 5);
});

test('unary postfix increment testReturn', () => {
    expect(instance.exports.testReturn(1)).toBe(1);
});

test('unary postfix increment testAssignToVariableDeclaration', () => {
    expect(instance.exports.testAssignToVariableDeclaration(1)).toBe(1);
});

test('unary postfix increment testAssign', () => {
    expect(instance.exports.testAssign(1)).toBe(1);
});
