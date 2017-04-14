import {getTurboInstance} from "./utils/utils";
function sum(a, b) {
    return a + b;
}

let instance:WebAssembly.Instance = getTurboInstance('addTwo.tbs');

test('it should add two numbers', () => {

    if (!instance) {
        instance = getTurboInstance('addTwo.tbs');
    }

    expect(instance.exports.addTwo1(1, 2)).toBe(3);
});
