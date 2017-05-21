import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('it should compile "fallthru.tbs" correctly', async () => {
    const instance: WebAssembly.Instance = await getWasmInstance(path.join(__dirname, 'fallthru.tbs'));
    expect(instance.exports.test()).toBeTruthy();
});
