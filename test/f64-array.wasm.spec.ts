import * as path from "path";
import { getWasmInstanceSync } from "./utils/utils";

test('it should create an array', () => {
    const instance: WebAssembly.Instance = getWasmInstanceSync(
        path.join(__dirname, 'f64-array.tbs')
    );
    const HEAPF64 = new Float64Array(instance.exports.memory.buffer);
    let testData = [];

    for (let i = 0; i < 10; i++) {
        testData.push(Math.random());
    }

    let dataArray = instance.exports.test(testData.length);

    for (let i = 0; i < testData.length; i++) {
        instance.exports.setData(i, testData[i]);
    }

    for (let i = 0; i < testData.length; i++) {
        let d1 = instance.exports.getData(i);

        expect(d1).toEqual(testData[i]);
    }

});
