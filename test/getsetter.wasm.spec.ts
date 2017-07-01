import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('get setter test', async () => {
    const instance:WebAssembly.Instance = await getWasmInstance(path.join(__dirname, 'getsetter.tbs'));
    let foo = instance.exports.create();
    instance.exports.setValue(foo, 2);
    expect(instance.exports.getValue(foo)).toBe(2);
    expect(instance.exports.createAndSetGet()).toBe(10);
});
