import {getWasmInstanceFromString} from "../test/utils/utils";
/**
 * Created by n.vinayakan on 26.06.17.
 */
async function test() {
    let source = `
    export function test():int32 {
        return 100;
    }`;
    const instance: WebAssembly.Instance = await getWasmInstanceFromString(source);
    console.log(instance.exports.test());
}

test();