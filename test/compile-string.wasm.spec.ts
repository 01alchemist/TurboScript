import * as path from "path";
import {getWasmInstance, getWasmInstanceFromString} from "./utils/utils";

test('it should compile from string', async () => {
    let source = `
    export function test():int32 {
        return 100;
    }`;
    const instance:WebAssembly.Instance = await getWasmInstanceFromString(source);
    expect(instance.exports.test()).toBe(100);
});
