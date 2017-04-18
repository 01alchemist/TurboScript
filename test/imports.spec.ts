import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

let instance: WebAssembly.Instance;
const TwoPI = 2 * Math.PI;
const precision = 10; // Number of digits of precision for toBeCloseTo
const precisionValue = parseFloat(`1.0e-${precision}`);

test("it should compile without error", () => {
    instance = getWasmInstanceSync(
        path.join(__dirname, 'imports.tbs'),
        { Math: Math }
    );
    expect(instance).toBeDefined();
})

test("precision", () => {
    const value: number = Math.random() * TwoPI;
    const expected: number = Math.sin(value);
    const expectedFail: number = expected + precisionValue;

    const result: number = instance.exports.sin(value);
    expect(result).toBeCloseTo(expected, precision);
    expect(result).not.toBeCloseTo(expectedFail, precision);
});

test("it should import sin function from javascript", () => {
    const value: number = Math.random() * TwoPI;
    const expected: number = Math.sin(value);

    const result: number = instance.exports.sin(value);
    expect(result).toBeCloseTo(expected, precision);
});

test("it should import cos function from javascript", () => {
    const value: number = Math.random() * TwoPI;
    const expected: number = Math.cos(value);

    const result: number = instance.exports.cos(value);
    expect(result).toBeCloseTo(expected, precision);
});

test("it should import tan function from javascript", () => {
    const value: number = Math.random() * TwoPI;
    const expected: number = Math.tan(value);

    const result: number = instance.exports.tan(value);
    expect(result).toBeCloseTo(expected, precision);
});

test("it should import abs function from javascript", () => {
    const value: number = Math.random();
    const expected: number = Math.fround(Math.abs(value)); //WASM abs is 32bit float

    const result: number = instance.exports.abs(value);
    expect(result).toBeCloseTo(expected, precision);
});
