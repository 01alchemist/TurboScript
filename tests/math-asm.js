function TurboModule(global, env, buffer) {
"use asm";
    //part of asm module, we have global, foreign, buffer somewhere above this code
    
    var HEAP8 = new global.Int8Array(buffer);
    var HEAP16 = new global.Int16Array(buffer);
    var HEAP32 = new global.Int32Array(buffer);
    var HEAPU8 = new global.Uint8Array(buffer);
    var HEAPU16 = new global.Uint16Array(buffer);
    var HEAPU32 = new global.Uint32Array(buffer);
    var HEAPF32 = new global.Float32Array(buffer);
    var HEAPF64 = new global.Float64Array(buffer);
    
    var NULL = 0;
    var STACKTOP=env.STACKTOP|0;
    var STACK_MAX=env.STACK_MAX|0;
    var fround = global.Math.fround;
    
    var Math_sin = global.Math.sin;
    var Math_cos = global.Math.cos;
    
    function test() {
        var a = fround(0.1);
        var b = fround(0.1);
        var c = 0.0;
        c = (+Math_sin(+((+b) + (+a))));
    }
    
    
    //FIXME: Virtuals should emit next to base class virtual function
    return {
    }
}
function TurboWrapper(exports, buffer) {

    exports.init_malloc();

    return {
        exports: exports,
        RAW_MEMORY: buffer,

        getMemoryUsage: function () {
            const top = Atomics.load(HEAP32, 2);
            // top -= freeMemory;
            return Math.fround(top / (1024 * 1024));
        }/*,
        HEAP8: new Int8Array(buffer),
        HEAP16: new Int16Array(buffer),
        HEAP32: new Int32Array(buffer),
        HEAPU8: new Uint8Array(buffer),
        HEAPU16: new Uint16Array(buffer),
        HEAPU32: new Uint32Array(buffer),
        HEAPF32: new Float32Array(buffer),
        HEAPF64: new Float64Array(buffer)*/

    }
}
function initTurbo(bytes) {
    var buffer = new ArrayBuffer(bytes);

    if (buffer.byteLength < 16) {
        throw new Error("The memory is too small even for metadata");
    }

    return TurboWrapper(TurboModule(
        typeof global !== 'undefined' ? global : window,
        typeof env !== 'undefined' ? env : {
            STACKTOP: 8,
            STACK_MAX: 8
        },
        buffer
    ), buffer);
}
