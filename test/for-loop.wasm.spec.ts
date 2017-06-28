import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('for loop', async () => {
    let imports = {
        global: {
            print: (v1, v2) => {
                console.log(v1, v2);
            }
        }
    };
    const instance: WebAssembly.Instance = await getWasmInstance(path.resolve(__dirname, 'for-loop.tbs'), imports);
    expect(instance.exports.test(10)).toBe(10);
});
