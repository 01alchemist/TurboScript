import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

let instance: WebAssembly.Instance;

test("it should compile without error", () => {
    instance = getWasmInstanceSync(
        path.join(__dirname, 'internal-tbs-imports.tbs')
    );
    expect(instance.exports.test()).toBe(10);
});
