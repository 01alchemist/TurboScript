import * as path from "path";
import {getWasmInstance} from "./utils/utils";

let instance:WebAssembly.Instance;

test('string compare same instances', async () => {
    instance = await getWasmInstance(path.join(__dirname, 'string.tbs'));
    // expect(instance.exports.test()).toBeTruthy();
    let s1 = instance.exports.newStr();
    expect(instance.exports.cmpStr(s1, s1)).toBeTruthy();
});

test('string compare same instance', async () => {
    let s1 = instance.exports.newStr();
    let s2 = instance.exports.newStr();
    expect(instance.exports.cmpStr(s1, s2)).toBeTruthy();
});

test('string compare same content', async () => {
    let s1 = instance.exports.newStr();
    let s2 = instance.exports.newStr3();
    expect(instance.exports.cmpStr(s1, s2)).toBeTruthy();
});

test('string compare different content', async () => {
    let s1 = instance.exports.newStr();
    let s2 = instance.exports.newStr2();
    expect(instance.exports.cmpStr(s1, s2)).toBeFalsy();
});

test('string internal compare same content', async () => {
    expect(instance.exports.cmpStrInternal()).toBeTruthy();
});

test('string internal compare different content', async () => {
    expect(instance.exports.cmpStrInternal2()).toBeFalsy();
});
