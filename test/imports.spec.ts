import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

let instance: WebAssembly.Instance;
const TwoPI = 2 * Math.PI;

// As per [Wikipedia](https://en.wikipedia.org/wiki/IEEE_floating_point)
// the following define the number of decimal digits of precision for
// float64(15.95) and float32(7.22) reduced by 2 for rounding.
const float64Precision = 13;
const float64PrecisionValue = parseFloat(`1.0e-${float64Precision}`);
const float32Precision = 5;
const float32PrecisionValue = parseFloat(`1.0e-${float32Precision}`);

test("it should compile without error", () => {
    instance = getWasmInstanceSync(
        path.join(__dirname, 'imports.tbs'),
        { Math: Math }
    );
    expect(instance).toBeDefined();
});

test("of float64Precision", () => {
    const value: number = Math.random() * TwoPI;
    const expected: number = Math.sin(value);
    const expectedFail: number = expected + float64PrecisionValue;

    const result: number = instance.exports.sin(value);
    expect(result).toBeCloseTo(expected, float64Precision);
    expect(result).not.toBeCloseTo(expectedFail, float64Precision);
});

test("of float32Precision", () => {
    const value: number = Math.random();
    const expected: number = Math.fround(Math.abs(value)); //WASM abs is 32bit float
    const expectedFail: number = expected + float32PrecisionValue;

    const result: number = instance.exports.abs(value);
    expect(result).toBeCloseTo(expected, float32Precision);
    expect(result).not.toBeCloseTo(expectedFail, float32Precision);
});

test("it should import sin function from javascript", () => {
    const value: number = Math.random() * TwoPI;
    const expected: number = Math.sin(value);

    const result: number = instance.exports.sin(value);
    expect(result).toBeCloseTo(expected, float64Precision);
});

test("it should import cos function from javascript", () => {
    const value: number = Math.random() * TwoPI;
    const expected: number = Math.cos(value);

    const result: number = instance.exports.cos(value);
    expect(result).toBeCloseTo(expected, float64Precision);
});

test("it should import tan function from javascript", () => {
    const value: number = Math.random() * TwoPI;
    const expected: number = Math.tan(value);

    const result: number = instance.exports.tan(value);
    expect(result).toBeCloseTo(expected, float64Precision);
});

test("it should import abs function from javascript", () => {
    const value: number = Math.random();
    const expected: number = Math.fround(Math.abs(value)); //WASM abs is 32bit float

    const result: number = instance.exports.abs(value);
    expect(result).toBeCloseTo(expected, float32Precision);
});
