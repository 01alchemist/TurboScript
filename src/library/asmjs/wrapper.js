function TurboWrapper(exports, buffer) {

    exports.initMemory();

    return {
        exports: exports,
        RAW_MEMORY: buffer,

        getMemoryUsage: function () {
            const top = Atomics.load(HEAP32, 2);
            // top -= freeMemory;
            return Math.fround(top / (1024 * 1024));
        },
        HEAP8: new Int8Array(buffer),
        HEAP16: new Int16Array(buffer),
        HEAP32: new Int32Array(buffer),
        HEAPU8: new Uint8Array(buffer),
        HEAPU16: new Uint16Array(buffer),
        HEAPU32: new Uint32Array(buffer),
        HEAPF32: new Float32Array(buffer),
        HEAPF64: new Float64Array(buffer)

    }
}

//##################################
//#           FOREIGN Fn           #
//##################################

function sort(ptr, length) {

}

const Turbo = {
    Instance: function (bytes, shared) {
        var buffer = shared ? new SharedArrayBuffer(bytes) : new ArrayBuffer(bytes);

        if (buffer.byteLength < 16) {
            throw new Error("The memory is too small even for metadata");
        }

        return TurboWrapper(TurboModule(
            typeof stdlib !== 'undefined' ? stdlib : window,
            typeof foreign !== 'undefined' ? foreign : {
                    random: () => {
                        return Math.random() / Number.MAX_SAFE_INTEGER;
                    }
                },
            buffer
        ), buffer);
    }
};