import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('it should add two numbers', () => {
    const instance:WebAssembly.Instance = getWasmInstance(path.join(__dirname, 'addTwo.tbs'), path.join(__dirname, 'bin/addTwo.wasm'));
    expect(instance.exports.addTwo1(1, 2)).toBe(3);
});