import {getWasmInstanceFromString} from "./utils/utils";

test('it should compile from string two times', async () => {
    let source = `
    export function test():int32 {
        return 100;
    }`;
    const instance1:WebAssembly.Instance = await getWasmInstanceFromString(source);
    const instance2:WebAssembly.Instance = await getWasmInstanceFromString(source);
    expect(instance1.exports.test()).toBe(100);
    expect(instance2.exports.test()).toBe(100);
});
