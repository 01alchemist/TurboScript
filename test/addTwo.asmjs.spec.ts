import * as path from "path";
import {getAsmjsInstance} from "./utils/utils";

test('it should add two numbers', async () => {
    const instance:any = await getAsmjsInstance(path.join(__dirname, 'addTwo.tbs'));
    expect(instance.exports.addTwo1(1, 2)).toBe(3);
    expect(instance.exports.addTwo1(11, 20)).toBe(31);
});
