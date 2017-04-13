import {getTurboInstance} from "./utils/utils";
/**
 * Created by Nidin Vinayakan on 11/04/17.
 */
const fs = require('fs-extra');
let turbo;
// function init() {
//     let wasmBytes = fs.readFileSync('./bin/addTwo.wasm');
//     try {
//         WebAssembly.compile(wasmBytes).then(function (compiled) {
//             turbo = new WebAssembly.Instance(compiled);
//
//             console.log("TurboScript WASM");
//             console.log("----------------");
//             console.log(`turbo.exports.addTwo1(-2,1) => ${turbo.exports.addTwo1(-2, 1)}`);
//             console.log(`turbo.exports.addTwo2(2,1) => ${turbo.exports.addTwo2(2, 1)}`);
//             console.log(`turbo.exports.addTwo3(2.5,5) => ${turbo.exports.addTwo3(2.5, 5)}`);
//             console.log(`turbo.exports.addTwo4(2.5,5) => ${turbo.exports.addTwo4(2.5, 5)}`);
//             console.log("\n");
//         })
//
//     } catch (e) {
//         console.error(e);
//     }
// }
const instance = getTurboInstance('addTwo.tbs');
console.log(instance);
// init();