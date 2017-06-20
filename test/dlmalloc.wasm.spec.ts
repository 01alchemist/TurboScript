import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

test('dlmalloc', () => {
    const instance: WebAssembly.Instance = getWasmInstanceSync(
        path.join(__dirname, 'dlmalloc.tbs')
    );

    let ptr = instance.exports.test();

});
