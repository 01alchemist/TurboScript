function TurboWrapper(exports, buffer) {
    return {
        exports: exports,
        RAW_MEMORY: buffer
    }
}
function initTurbo(MB) {
    var buffer = new SharedArrayBuffer(MB * 1024 * 1024);

    if (buffer.byteLength < 16) {
        throw new Error("The memory is too small even for metadata");
    }

    return TurboWrapper(TurboModule(
        typeof global !== 'undefined' ? global : window,
        typeof env !== 'undefined' ? env : {
                STACKTOP:8,
                STACK_MAX:8
            },
        buffer
    ), buffer);
}