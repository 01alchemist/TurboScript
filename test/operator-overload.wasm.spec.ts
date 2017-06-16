import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

test('operator overload', () => {
    const instance: WebAssembly.Instance = getWasmInstanceSync(
        path.join(__dirname, 'operator-overload.tbs')
    );

    expect(instance.exports.test()).toBeTruthy();
});
