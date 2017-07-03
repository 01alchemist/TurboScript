import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('it should add two numbers', async () => {
    const instance:WebAssembly.Instance = await getWasmInstance(path.join(__dirname, 'string.tbs'));
    expect(instance.exports.test()).toBeTruthy();
});
