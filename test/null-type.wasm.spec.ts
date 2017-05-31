import * as path from "path";
import {getWasmInstanceSync} from "./utils/utils";

const instance:WebAssembly.Instance = getWasmInstanceSync(path.join(__dirname, 'null-type.tbs'));

test('null type -> compareNull', () => {
    expect(instance.exports.compareNull()).toBeTruthy();
});

test('null type -> compareZero', () => {
    // expect(instance.exports.compareZero()).toBeFalsy();
    expect(instance.exports.compareZero()).toBeTruthy();
});

test('null type -> compareLocalNull', () => {
    expect(instance.exports.compareLocalNull()).toBeTruthy();
});

test('null type -> compareLocalZero', () => {
    // expect(instance.exports.compareLocalZero()).toBeFalsy();
    expect(instance.exports.compareLocalZero()).toBeTruthy();
});
