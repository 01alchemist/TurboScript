import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

test('it should create an array', () => {
    const instance: WebAssembly.Instance = getWasmInstanceSync(
        path.join(__dirname, 'f64-array.tbs')
    );
    const HEAPF64 = new Float64Array(instance.exports.memory.buffer);
    let testData = [];

    for (let i = 0; i < 10; i++) {
        testData.push({
            v1: Math.random(),
            v2: Math.random(),
            v3: Math.random()
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
            v1: HEAPF64[(ptr + 8) >> 3],
            v2: HEAPF64[(ptr + 16) >> 3],
            v3: HEAPF64[(ptr + 24) >> 3]
        }
    }

});
