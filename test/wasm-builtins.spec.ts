import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

const instance: WebAssembly.Instance = getWasmInstanceSync(path.join(__dirname, 'wasm-builtins.tbs'));

test('wasm builtins i32 sign-agnostic rotate left', async () => {
    expect(instance.exports.native_I32_ROTL(10, 2)).toBe(40);
});
test('wasm builtins i64 sign-agnostic rotate left', async () => {
    expect(instance.exports.native_I64_ROTL(10, 2)).toBe(40);
});

test('wasm builtins i32 sign-agnostic rotate right', async () => {
    expect(instance.exports.native_I32_ROTR(10, 2)).toBe(-2147483646);
});

test('wasm builtins i64 sign-agnostic rotate right', async () => {
    expect(instance.exports.native_I64_ROTR(10, 2)).toBe(2);
});

test('wasm builtins i32 sign-agnostic count leading zero bits', async () => {
    expect(instance.exports.native_I32_CLZ(3)).toBe(30);
});

test('wasm builtins i64 sign-agnostic count leading zero bits', async () => {
    expect(instance.exports.native_I64_CLZ(15)).toBe(60);
});

test('wasm builtins i32 sign-agnostic count trailing zero bits', async () => {
    expect(instance.exports.native_I32_CTZ(4)).toBe(2);
});

test('wasm builtins i64 sign-agnostic count trailing zero bits', async () => {
    expect(instance.exports.native_I64_CTZ(16)).toBe(4);
});

test('wasm builtins i32 sign-agnostic count number of one bits', async () => {
    expect(instance.exports.native_I32_POPCNT(344458372)).toBe(7);
});

test('wasm builtins i64 sign-agnostic count number of one bits', async () => {
    //255 <- this value written inside tbs
    expect(instance.exports.native_I64_POPCNT()).toBe(8);
});

test('wasm builtins f32 abs', async () => {
    expect(instance.exports.native_F32_ABS(-1.2340)).toBeCloseTo(1.2340);
});

test('wasm builtins f64 abs', async () => {
    expect(instance.exports.native_F64_ABS(-528398.873492)).toBeCloseTo(528398.873492);
});

test('wasm builtins f32 ceil', async () => {
    expect(instance.exports.native_F32_CEIL(-1.2340)).toBe(-1);
});

test('wasm builtins f64 ceil', async () => {
    expect(instance.exports.native_F64_CEIL(-528398.873492)).toBe(-528398);
});

test('wasm builtins f32 floor', async () => {
    expect(instance.exports.native_F32_FLOOR(-1.2340)).toBe(-2);
});

test('wasm builtins f64 floor', async () => {
    expect(instance.exports.native_F64_FLOOR(-528398.873492)).toBe(-528399);
});

test('wasm builtins f32 sqrt', async () => {
    expect(instance.exports.native_F32_SQRT(44 * 44)).toBe(44);
});

test('wasm builtins f64 sqrt', async () => {
    expect(instance.exports.native_F64_SQRT(6789 * 6789)).toBe(6789);
});

test('wasm builtins f32 trunc', async () => {
    expect(instance.exports.native_F32_TRUNC(-1.2340)).toBe(-1);
});

test('wasm builtins f64 trunc', async () => {
    expect(instance.exports.native_F64_TRUNC    (-528398.873492)).toBe(-528398);
});

test('wasm builtins f32 nearest', async () => {
    expect(instance.exports.native_F32_NEAREST(-1.2340)).toBe(-1);
});

test('wasm builtins f64 nearest', async () => {
    expect(instance.exports.native_F64_NEAREST(-528398.873492)).toBe(-528399);
});

test('wasm builtins f32 min', async () => {
    expect(instance.exports.native_F32_MIN(-1.2340, 2.9871)).toBeCloseTo(-1.2340, 4);
});

test('wasm builtins f64 min', async () => {
    expect(instance.exports.native_F64_MIN(-528398.873492, 9629.8091)).toBeCloseTo(-528398.873492, 4);
});

test('wasm builtins f32 max', async () => {
    expect(instance.exports.native_F32_MAX(-1.2340, 2.9871)).toBeCloseTo(2.9871, 4);
});

test('wasm builtins f64 max', async () => {
    expect(instance.exports.native_F64_MAX(-528398.873492, 9629.8091)).toBeCloseTo(9629.8091, 4);
});

test('wasm builtins f32 copysign', async () => {
    expect(instance.exports.native_F32_COPYSIGN(1.2340, -1)).toBeCloseTo(-1.2340, 4);
});

test('wasm builtins f64 copysign', async () => {
    expect(instance.exports.native_F64_COPYSIGN(528.87349, -1)).toBeCloseTo(-528.87349, 4);
});
