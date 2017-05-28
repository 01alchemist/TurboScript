import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('it should add two numbers', async () => {
    const instance: WebAssembly.Instance = await getWasmInstance(path.join(__dirname, 'wasm-builtins.tbs'));
    expect(instance.exports.native_F32_SQRT(44 * 44)).toBe(44);
    expect(instance.exports.native_F64_SQRT(6789 * 6789)).toBe(6789);
});

