import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('it should add two numbers', async () => {
    const instance: WebAssembly.Instance = await getWasmInstance(path.join(__dirname, 'native-wasm-sqrt.tbs'));
    expect(instance.exports.nativeSqrt32(44 * 44)).toBe(44);
    expect(instance.exports.nativeSqrt64(6789 * 6789)).toBe(6789);
});
