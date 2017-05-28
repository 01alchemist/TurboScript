import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

test('it should create generic class', () => {
    const instance: WebAssembly.Instance = getWasmInstanceSync(
        path.join(__dirname, 'generic-member-access.tbs')
    );

    expect(instance.exports.test()).toBeTruthy();
    expect(instance.exports.accessTest()).toBeTruthy();

});