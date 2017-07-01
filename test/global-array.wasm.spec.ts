import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('global array', async () => {
    const instance: WebAssembly.Instance = await getWasmInstance(path.resolve(__dirname, 'global-array.tbs'));
    expect(instance.exports.test(10)).toBe(10);
});
