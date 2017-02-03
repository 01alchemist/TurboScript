function TurboModule(global, env, buffer) {
"use asm";
    //##################################
    //#            RUNTIME             #
    //##################################
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
    
    //##################################
    //#            IMPORTS             #
    //##################################
    var Math_abs = global.Math.abs;
    var Math_acos = global.Math.acos;
    var Math_asin = global.Math.asin;
    var Math_atan = global.Math.atan;
    var Math_atan2 = global.Math.atan2;
    var Math_ceil = global.Math.ceil;
    var Math_cos = global.Math.cos;
    var Math_exp = global.Math.exp;
    var Math_floor = global.Math.floor;
    var Math_log = global.Math.log;
    var Math_max = global.Math.max;
    var Math_min = global.Math.min;
    var Math_pow = global.Math.pow;
    var Math_sin = global.Math.sin;
    var Math_sqrt = global.Math.sqrt;
    var Math_tan = global.Math.tan;
    var Math_imul = global.Math.imul;
    
    //##################################
    //#             CODE               #
    //##################################
    
    function init_malloc() {
        HEAPU32[(20) >> 2] = 0;
        HEAPU32[(24) >> 2] = 0;
        HEAPU32[(28) >> 2] = 0;
        HEAP32[(8) >> 2] = (40|0);
        HEAP32[(12) >> 2] = (40|0);
    }
    
    
    function malloc(nbytes) {
        nbytes = nbytes|0;
        var alignment = 8;
        var chunkSize = 0;
        var freeChunk = 0;
        var offset = 0;
        var top = 0;
        var ptr = 0;
        nbytes = ((((((nbytes|0) + ((((alignment|0) - (1|0))|0))|0)|0)|0 & ~(alignment - (1|0)))|0)|0)|0;
        chunkSize = ((nbytes|0) + (8|0))|0;
        freeChunk = (getFreeChunk((chunkSize|0))|0);
        
        if ((((freeChunk|0) | 0) > (0|0))|0) {
            return (freeChunk)|0;
        }
        
        offset = (((((HEAP32[(12) >> 2]|0) + ((((alignment|0) - (1|0))|0))|0)|0)|0 & ~(alignment - (1|0)))|0);
        top = ((offset|0) + (chunkSize|0))|0;
        ptr = ((offset|0) + (4|0))|0;
        setHeadSize((ptr|0), (chunkSize|0));
        setInuse(((ptr|0) + (4|0))|0);
        setFoot((ptr|0), (chunkSize|0));
        HEAP32[(12) >> 2] = ((top|0) + (4|0))|0;
        offset = ((((offset|0) + (8|0))|0)|0)|0;
        ptr = ((offset|0))|0;
        
        while (((ptr|0) < (top|0))|0) {
            HEAPU32[(ptr ) >> 2] = 0;
            ptr = ((((ptr|0) + (4|0))|0)|0)|0;
        }
        return (offset)|0;
    }
    
    
    function free(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        clearInuse((ptr|0));
        
        if ((((HEAPU32[(24) >> 2]|0) == (0|0))|0)) {
            HEAPU32[(24) >> 2] = (ptr|0);
        }
        
        HEAPU32[(16) >> 2] = ((HEAPU32[(16) >> 2]|0) + (getChunkSize((ptr|0))|0))|0;
        chunkptr = ((ptr|0) + (4|0))|0;
        
        if (((HEAPU32[(28) >> 2]|0) > (0|0))|0) {
            HEAPU32[(chunkptr ) >> 2] = (HEAPU32[(28) >> 2]|0);
            HEAPU32[((HEAPU32[(28) >> 2]|0) ) >> 2] = (ptr|0);
        }
        
        else {
            HEAPU32[(chunkptr ) >> 2] = 0;
        }
        
        HEAPU32[(ptr ) >> 2] = 0;
        HEAPU32[(28) >> 2] = (ptr|0);
        HEAPU32[(20) >> 2] = ((HEAPU32[(20) >> 2]|0) + (1|0))|0;
    }
    
    
    function getFreeChunk(nbytes) {
        nbytes = nbytes|0;
        var freeChunk = 0;
        if (((HEAPU32[(20) >> 2]|0) > (0|0))|0) {
            freeChunk = (findChunk((nbytes|0))|0);
            
            if ((((freeChunk|0) | 0) > (0|0))|0) {
                if ((((freeChunk|0) == (HEAPU32[(24) >> 2]|0))|0)) {
                    HEAPU32[(24) >> 2] = (nextFree((freeChunk|0))|0);
                }
                
                if ((((freeChunk|0) == (HEAPU32[(28) >> 2]|0))|0)) {
                    HEAPU32[(28) >> 2] = 0;
                }
                
                HEAPU32[(20) >> 2] = ((HEAPU32[(20) >> 2]|0) - (1|0))|0;
                setInuse((freeChunk|0));
                HEAPU32[(16) >> 2] = ((HEAPU32[(16) >> 2]|0) - (getChunkSize((freeChunk|0))|0))|0;
                return (freeChunk)|0;
            }
        }
        return 0;
    }
    
    
    function findChunk(nbytes) {
        nbytes = nbytes|0;
        var chunk = 0;
        chunk = (HEAPU32[(24) >> 2]|0);
        
        while (((chunk|0) != 0)|0) {
            if ((((getChunkSize((chunk|0))|0) == (nbytes|0))|0)) {
                return (chunk)|0;
            }
            
            chunk = ((HEAPU32[(chunk ) >> 2]|0))|0;
        }
        return 0;
    }
    
    
    function getHeapPtr() {
        return ((HEAP32[(12) >> 2]|0))|0;
    }
    
    
    function getFreeMemory() {
        return ((HEAPU32[(16) >> 2]|0))|0;
    }
    
    
    function getOriginalHeapPtr() {
        return ((HEAP32[(8) >> 2]|0))|0;
    }
    
    
    function getNumFreeChunks() {
        return ((HEAPU32[(20) >> 2]|0))|0;
    }
    
    
    function getFirstFree() {
        return ((HEAPU32[(24) >> 2]|0))|0;
    }
    
    
    function getLastFree() {
        return ((HEAPU32[(28) >> 2]|0))|0;
    }
    
    
    function prevFree(ptr) {
        ptr = ptr|0;
        return ((HEAP32[((ptr + (4|0)) ) >> 2]|0) | 0)|0;
    }
    
    
    function nextFree(ptr) {
        ptr = ptr|0;
        return ((HEAP32[(ptr ) >> 2]|0) | 0)|0;
    }
    
    
    function setHeadSize(ptr, s) {
        ptr = ptr|0;
        s = s|0;
        HEAPU32[(ptr ) >> 2] = ((((HEAPU32[(ptr ) >> 2]|0) & (7|0))|0)|0 | (s|0))|0;
    }
    
    
    function setFoot(ptr, s) {
        ptr = ptr|0;
        s = s|0;
        var size = 0;
        var chunkptr = 0;
        size = (HEAPU32[(ptr ) >> 2]|0);
        chunkptr = ((ptr|0) + (size|0))|0;
        HEAPU32[(chunkptr ) >> 2] = (s|0);
    }
    
    
    function getPrevInuse(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        chunkptr = ((ptr|0) - (8|0))|0;
        return ((HEAPU32[(chunkptr ) >> 2]|0) & (1|0))|0;
    }
    
    
    function setInuse(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        chunkptr = ((ptr|0) - (4|0))|0;
        HEAPU32[(chunkptr ) >> 2] = ((HEAPU32[(chunkptr ) >> 2]|0) | (1|0))|0;
    }
    
    
    function getInuse(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        chunkptr = ((ptr|0) - (4|0))|0;
        return ((HEAPU32[(chunkptr ) >> 2]|0) & (1|0))|0;
    }
    
    
    function clearInuse(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        chunkptr = ((ptr|0) - (4|0))|0;
        HEAPU32[(chunkptr ) >> 2] = ((HEAPU32[(chunkptr ) >> 2]|0) & (-2|0))|0;
    }
    
    
    function getChunkSize(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        chunkptr = ((ptr|0) - (4|0))|0;
        return ((HEAPU32[(chunkptr ) >> 2]|0) & (-2|0))|0;
    }
    
    
    function test() {
        var a = fround(0.1);
        var b = fround(0.1);
        var c = 0.0;
        c = (+Math_sin(+((+b) + (+a))));
    }
    
    
    return {
       init_malloc:init_malloc,
       malloc:malloc,
       free:free,
       getFreeChunk:getFreeChunk,
       findChunk:findChunk,
       getHeapPtr:getHeapPtr,
       getFreeMemory:getFreeMemory,
       getOriginalHeapPtr:getOriginalHeapPtr,
       getNumFreeChunks:getNumFreeChunks,
       getFirstFree:getFirstFree,
       getLastFree:getLastFree,
       prevFree:prevFree,
       nextFree:nextFree,
       getPrevInuse:getPrevInuse,
       setInuse:setInuse,
       getInuse:getInuse,
       clearInuse:clearInuse,
       getChunkSize:getChunkSize
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
