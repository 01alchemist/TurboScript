import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

const testFile: string = "array";

test('it should create an array', () => {
    const instance: WebAssembly.Instance = getWasmInstanceSync(
        path.join(__dirname, `${testFile}.tbs`),
        path.join(__dirname, `bin/${testFile}.wasm`)
    );
    const HEAPF32 = new Float32Array(instance.exports.memory.buffer);
    let testData = [];

    for (let i = 0; i < 10; i++) {
        testData.push({
            v1: Math.fround(Math.random()),
            v2: Math.fround(Math.random()),
            v3: Math.fround(Math.random())
        });
    }

    let dataArray = instance.exports.test(testData.length);

    for (let i = 0; i < testData.length; i++) {
        let data = testData[i];
        let d1 = instance.exports.getData(i);
        instance.exports.Data_set(d1, data.v1, data.v2, data.v3);
    }

    for (let i = 0; i < testData.length; i++) {
        let d1 = instance.exports.getData(i);

        expect(data_to_json(d1)).toEqual(testData[i]);
    }

    function data_to_json(ptr) {
        return {
            v1: HEAPF32[(ptr + 4) >> 2],
            v2: HEAPF32[(ptr + 8) >> 2],
            v3: HEAPF32[(ptr + 12) >> 2]
        }
    }

});
