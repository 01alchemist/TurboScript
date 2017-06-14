import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('pointer', async () => {
    const instance: WebAssembly.Instance = await getWasmInstance(path.join(__dirname, 'pointer.tbs'));
    let block = instance.exports.initialize();
    let HEAPU8 = new Uint8Array(instance.exports.memory.buffer);
    expect(HEAPU8[block]).toBe(1);
    expect(HEAPU8[block + 1]).toBe(2);
    expect(HEAPU8[block + 2]).toBe(3);
    expect(HEAPU8[block + 3]).toBe(4);
});
