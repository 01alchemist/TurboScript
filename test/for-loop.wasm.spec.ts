import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('for loop', async () => {
    const instance:WebAssembly.Instance = await getWasmInstance(path.resolve(__dirname, 'for-loop.tbs'));
    expect(instance.exports.test(10)).toBe(10);
});
