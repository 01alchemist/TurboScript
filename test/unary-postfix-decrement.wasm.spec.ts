import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

const instance:WebAssembly.Instance = getWasmInstanceSync(path.join(__dirname, 'unary-postfix-decrement.tbs'));

test('unary postfix decrement i32', () => {
    expect(instance.exports.testi32()).toBe(0);
});

test('unary postfix decrement i64', () => {
    expect(instance.exports.testi64()).toBe(99);
});

test('unary postfix decrement f32', () => {
    expect(instance.exports.testf32()).toBeCloseTo(0.16589, 5);
});

test('unary postfix decrement f64', () => {
    expect(instance.exports.testf64()).toBeCloseTo(0.68651, 5);
});

test('unary postfix decrement testReturn', () => {
    expect(instance.exports.testReturn(1)).toBe(1);
});

test('unary postfix decrement testAssignToVariableDeclaration', () => {
    expect(instance.exports.testAssignToVariableDeclaration(1)).toBe(1);
});

test('unary postfix decrement testAssign', () => {
    expect(instance.exports.testAssign(1)).toBe(1);
});
