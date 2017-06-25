import * as path from "path";
import * as fs from "fs";
import {compileWasmSync, getWasmInstanceSync} from "./utils/utils";

test('dlmalloc', async () => {
    const data = fs.readFileSync(path.resolve(__dirname, '../src/library/common/malloc/build/malloc.wasm'));
    const result: WebAssembly.ResultObject = await WebAssembly.instantiate(data);
    const mallocInstance = result.instance;
    const instance: WebAssembly.Instance = getWasmInstanceSync(
        path.join(__dirname, 'dlmalloc.tbs'),
        {global: mallocInstance.exports}
    );

    let ptr = instance.exports.test();
    console.log(ptr);
    expect(mallocInstance).toBeDefined();

});
