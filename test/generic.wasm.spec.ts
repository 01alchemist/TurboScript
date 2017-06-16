import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

test('it should create generic class', () => {
    const instance: WebAssembly.Instance = getWasmInstanceSync(
        path.join(__dirname, 'generic.tbs')
    );

    expect(instance.exports.testI32(10)).toBe(10);
    expect(instance.exports.testI64(1000)).toBe(1000);
    expect(instance.exports.testF32(10.16254)).toBeCloseTo(10.16254, 5);
    expect(instance.exports.testF64(10.16254)).toBeCloseTo(10.16254, 5);
});
