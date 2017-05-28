import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('it should add two numbers', async () => {
    const instance:WebAssembly.Instance = await getWasmInstance(path.join(__dirname, 'casting.tbs'));
    expect(instance.exports.cast_i32_to_i64()).toBeTruthy();
    expect(instance.exports.cast_i32_to_f32()).toBeTruthy();
    expect(instance.exports.cast_i32_to_f64()).toBeTruthy();
});
