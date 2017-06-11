/**
 * Created by n.vinayakan on 11.06.17.
 */
let importObject = {
    Math: Math,
    global: {
        printf64: function (value) {
            console.log(value);
        },
        modf32: function (a, b) {
            return a % b;
        },
        modf64: function (a, b) {
            return a % b;
        }
    }
};

WebAssembly.instantiate(Module.turboWasmBinary, importObject).then(result => {
    "use strict";
    self.turbo = result.instance.exports;
    turbo.memory.grow(15625);
    window.HEAPU8 = new Uint8Array(turbo.memory.buffer);
    window.HEAP8 = new Int8Array(turbo.memory.buffer);
    window.HEAPU16 = new Uint16Array(turbo.memory.buffer);
    window.HEAP16 = new Int16Array(turbo.memory.buffer);
    window.HEAPU32 = new Uint32Array(turbo.memory.buffer);
    window.HEAP32 = new Int32Array(turbo.memory.buffer);
    window.HEAPF32 = new Float32Array(turbo.memory.buffer);
    window.HEAPF64 = new Float64Array(turbo.memory.buffer);
    script.dispatchEvent(doneEvent);
});
