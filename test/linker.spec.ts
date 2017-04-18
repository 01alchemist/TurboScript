import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

let instance: WebAssembly.Instance;
let libInstance: WebAssembly.Instance;

test("it should compile without error", () => {
    libInstance = getWasmInstanceSync(
        path.join(__dirname, 'linker-lib.tbs')
    );
    instance = getWasmInstanceSync(
        path.join(__dirname, 'linker.tbs'),
        { global: libInstance.exports }
    );
    expect(libInstance).toBeDefined();
    expect(instance).toBeDefined();
})

test("it should call linked function externalFn", () => {
    const result1 = libInstance.exports.externalFn(5);
    expect(result1).toBe(1005);

    // const result2 = instance.exports.test(5);
    // expect(result2).toBe(1005);
})
