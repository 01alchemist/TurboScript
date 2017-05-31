import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

const instance:WebAssembly.Instance = getWasmInstanceSync(path.join(__dirname, 'global-variable.tbs'));

test('global variable get_i32', () => {
    expect(instance.exports.get_i32()).toBe(87349);
});

test('global variable get_i64', () => {
    expect(instance.exports.get_i64()).toBe(9364582);
});

test('global variable get_f32', () => {
    expect(instance.exports.get_f32()).toBeCloseTo(763.9872340, 4);
});

test('global variable get_f64', () => {
    expect(instance.exports.get_f64()).toBeCloseTo(1763.9872340, 4);
});

test('global variable get_evaluated_i32', () => {
    expect(instance.exports.get_evaluated_i32()).toBe(10 + 87349);
});

test('global variable get_evaluated_i64', () => {
    expect(instance.exports.get_evaluated_i64()).toBe(100 + 9364582);
});

test('global variable get_evaluated_f32', () => {
    expect(instance.exports.get_evaluated_f32()).toBeCloseTo(10.5 + 763.9872340, 4);
});

test('global variable get_evaluated_f64', () => {
    expect(instance.exports.get_evaluated_f64()).toBeCloseTo(10.5 + 1763.9872340, 4);
});
