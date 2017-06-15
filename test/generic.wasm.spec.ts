import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

test('it should create generic class', () => {
    const instance: WebAssembly.Instance = getWasmInstanceSync(
        path.join(__dirname, 'generic.tbs')
    );

    expect(instance.exports.testI32(10)).toBe(10);

});