import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

const instance: WebAssembly.Instance = getWasmInstanceSync(path.join(__dirname, 'casting.tbs'));

test('it should cast i32 -> i64 properly', async () => {
    expect(instance.exports.cast_i32_to_i64()).toBe(428364);
});

test('it should cast i32 -> ui64 properly', async () => {
    expect(instance.exports.cast_i32_to_ui64()).toBe(428364);
});

test('it should cast i32 -> f32 properly', async () => {
    expect(instance.exports.cast_i32_to_f32()).toBe(428364);
});

test('it should cast i32 -> f64 properly', async () => {
    expect(instance.exports.cast_i32_to_f64()).toBe(428364);
});

// FIXME: all cast from i64 is broken
// test('it should cast i64 -> i32 properly', async () => {
//     expect(instance.exports.cast_i64_to_i32()).toBe(123);
// });
//
// test('it should cast i64 -> f32 properly', async () => {
//     expect(instance.exports.cast_i64_to_f32()).toBe(123);
// });
//
// test('it should cast i64 -> f64 properly', async () => {
//     expect(instance.exports.cast_i64_to_f64()).toBe(123);
// });

test('it should cast f32 -> i32 properly', async () => {
    expect(instance.exports.cast_f32_to_i32()).toBe(16384);
});

test('it should cast f32 -> i64 properly', async () => {
    expect(instance.exports.cast_f32_to_i64()).toBe(16384);
});

test('it should cast f32 -> f64 properly', async () => {
    expect(instance.exports.cast_f32_to_f64()).toBeCloseTo(16384.888);
});

test('it should cast f64 -> i32 properly', async () => {
    expect(instance.exports.cast_f64_to_i32()).toBe(857);
});

test('it should cast f64 -> i64 properly', async () => {
    expect(instance.exports.cast_f64_to_i64()).toBe(857);
});

test('it should cast f64 -> f32 properly', async () => {
    expect(instance.exports.cast_f64_to_f32()).toBeCloseTo(857.1239);
});
