import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('pointer', async () => {
    const instance:WebAssembly.Instance = await getWasmInstance(path.join(__dirname, 'pointer.tbs'));
    expect(instance.exports.test()).toBeTruthy();
});
