/**
 * Created by n.vinayakan on 06.06.17.
 */
if(exports.turbo === undefined){
    if(typeof global["TURBO_PATH"] === "undefined"){
        global["TURBO_PATH"] = "";
    }
    exports.turbo = require("../lib/turbo.js");
}
console.log("OK compiler initialized");
let sourceString = `
    export function test():int32 {
        return 100;
    }`;
let wasmBinary = exports.turbo.compileString(sourceString);
console.log("OK compiled");
console.log(wasmBinary);
const mod = new WebAssembly.Module(wasmBinary.array);
let instance = new WebAssembly.Instance(mod);
console.log(instance);