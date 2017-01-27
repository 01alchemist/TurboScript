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