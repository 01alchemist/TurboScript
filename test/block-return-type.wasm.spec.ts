import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('block return type', async () => {
    const instance:WebAssembly.Instance = await getWasmInstance(path.join(__dirname, 'block-return-type.tbs'));
    expect(instance.exports.test()).toBe(1);
});
