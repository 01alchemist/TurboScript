import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

const imports = {
    global: {
        modf32: (a, b) => {
            return a % b;
        },
        modf64: (a, b) => {
            return a % b;
        }
    }
};

const instance: WebAssembly.Instance = getWasmInstanceSync(path.join(__dirname, 'remainder.tbs'), imports);

test('remainder i32.u', () => {
    expect(instance.exports.test_i32_u(4, 2)).toBe(0);
});

test('remainder i32.s', () => {
    expect(instance.exports.test_i32_s(-5, 2)).toBe(-1);
    expect(instance.exports.test_i32_s(5, -2)).toBe(1);
});

test('remainder i64.u', () => {
    expect(instance.exports.test_i64_u(4, 2)).toBe(0);
    expect(instance.exports.test_i64_u(-5, 2)).toBe(1);
    // expect(instance.exports.test_i64_u(5, -2)).toBe(1);
});

test('remainder i64.s', () => {
    expect(instance.exports.test_i64_s(-5, 2)).toBe(-1);
    expect(instance.exports.test_i64_s(5, -2)).toBe(1);
});

test('remainder f32', () => {
    expect(instance.exports.test_f32(5.5, 2)).toBe(1.5);
});

test('remainder f64', () => {
    expect(instance.exports.test_f64(5.5, 2)).toBe(1.5);
});
