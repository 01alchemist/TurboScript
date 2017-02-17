function TurboModule(stdlib, foreign, buffer) {
    "use asm";
    //##################################
    //#            RUNTIME             #
    //##################################
    var HEAP8 = new stdlib.Int8Array(buffer);
    var HEAP16 = new stdlib.Int16Array(buffer);
    var HEAP32 = new stdlib.Int32Array(buffer);
    var HEAPU8 = new stdlib.Uint8Array(buffer);
    var HEAPU16 = new stdlib.Uint16Array(buffer);
    var HEAPU32 = new stdlib.Uint32Array(buffer);
    var HEAPF32 = new stdlib.Float32Array(buffer);
    var HEAPF64 = new stdlib.Float64Array(buffer);
    
    var NULL = 0;
    var fround = stdlib.Math.fround;
    
    //##################################
    //#            IMPORTS             #
    //##################################
    var foreign_random = foreign.random;
    var foreign_sort = foreign.sort;
    var Math_abs = stdlib.Math.abs;
    var Math_acos = stdlib.Math.acos;
    var Math_asin = stdlib.Math.asin;
    var Math_atan = stdlib.Math.atan;
    var Math_atan2 = stdlib.Math.atan2;
    var Math_ceil = stdlib.Math.ceil;
    var Math_cos = stdlib.Math.cos;
    var Math_exp = stdlib.Math.exp;
    var Math_floor = stdlib.Math.floor;
    var Math_log = stdlib.Math.log;
    var Math_max = stdlib.Math.max;
    var Math_min = stdlib.Math.min;
    var Math_pow = stdlib.Math.pow;
    var Math_sin = stdlib.Math.sin;
    var Math_sqrt = stdlib.Math.sqrt;
    var Math_tan = stdlib.Math.tan;
    var Math_imul = stdlib.Math.imul;
    
    //##################################
    //#       MEMORY INITIALIZER       #
    //##################################
    function initMemory() {
        HEAPU8[8] = 219; HEAPU8[9] = 15; HEAPU8[10] = 73; HEAPU8[11] = 64; 
        HEAPU8[12] = 56; HEAPU8[13] = 0; HEAPU8[14] = 0; HEAPU8[15] = 0; 
        HEAPU8[16] = 56; HEAPU8[17] = 0; HEAPU8[18] = 0; HEAPU8[19] = 0; 
        HEAPU8[20] = 0; HEAPU8[21] = 0; HEAPU8[22] = 0; HEAPU8[23] = 0; 
        HEAPU8[24] = 0; HEAPU8[25] = 0; HEAPU8[26] = 0; HEAPU8[27] = 0; 
        HEAPU8[28] = 0; HEAPU8[29] = 0; HEAPU8[30] = 0; HEAPU8[31] = 0; 
        HEAPU8[32] = 0; HEAPU8[33] = 0; HEAPU8[34] = 0; HEAPU8[35] = 0; 
        HEAPU8[36] = 0; HEAPU8[37] = 0; HEAPU8[38] = 0; HEAPU8[39] = 0; 
        HEAPU8[40] = 0; HEAPU8[41] = 0; HEAPU8[42] = 0; HEAPU8[43] = 0; 
        HEAPU8[44] = 0; HEAPU8[45] = 0; HEAPU8[46] = 0; HEAPU8[47] = 0; 
        HEAPU8[48] = 0; HEAPU8[49] = 0; HEAPU8[50] = 0; HEAPU8[51] = 0; 
    }
    
    //##################################
    //#             CODE               #
    //##################################
    
    function malloc(nbytes) {
        nbytes = nbytes|0;
        var alignment = 8;
        var chunkSize = 0;
        var freeChunk = 0;
        var offset = 0;
        var top = 0;
        var ptr = 0;
        nbytes = ((((((nbytes|0) + ((((alignment|0) - (1|0))|0))|0)|0)|0 & (~(alignment - (1|0)) | 0))|0)|0)|0;
        chunkSize = ((nbytes|0) + (8|0))|0;
        freeChunk = (getFreeChunk((chunkSize|0))|0);
        
        if ((((freeChunk|0) | 0) > (0|0))|0) {
            return (freeChunk)|0;
        }
        
        offset = (HEAP32[(16) >> 2]|0) | 0;
        offset = ((((offset|0) + (7|0))|0)|0)|0;
        offset = ((((offset|0) & (-8|0))|0)|0)|0;
        top = ((offset|0) + (chunkSize|0))|0;
        ptr = ((offset|0) + (4|0))|0;
        setHeadSize((ptr|0), (chunkSize|0));
        setInuse(((ptr|0) + (4|0))|0);
        setFoot((ptr|0), (chunkSize|0));
        HEAP32[(16) >> 2] = ((top|0) + (4|0))|0;
        offset = ((((offset|0) + (8|0))|0)|0)|0;
        ptr = ((offset|0))|0;
        
        while ((((ptr|0) | 0) < ((top|0) | 0))|0) {
            HEAP32[(ptr ) >> 2] = 0;
            ptr = ((((ptr|0) + (4|0))|0)|0)|0;
        }
        return (offset)|0;
    }
    
    
    function free(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        var tmp1 = 0;
        chunkptr = 0;
        clearInuse((ptr|0));
        
        if ((((HEAP32[(28) >> 2]|0) == (0|0))|0)) {
            HEAP32[(28) >> 2] = (ptr|0) | 0;
        }
        
        tmp1 = ((HEAP32[(20) >> 2]|0) | 0)|0;
        tmp1 = ((((tmp1|0) + ((getChunkSize((ptr|0))|0) | 0))|0)|0)|0;
        HEAP32[(20) >> 2] = (tmp1|0) | 0;
        chunkptr = ((((ptr|0) + (4|0))|0)|0)|0;
        
        if (((HEAP32[(32) >> 2]|0) > (0|0))|0) {
            HEAP32[(chunkptr ) >> 2] = (HEAP32[(32) >> 2]|0);
            HEAP32[((HEAP32[(32) >> 2]|0) ) >> 2] = (ptr|0) | 0;
        }
        
        else {
            HEAP32[(chunkptr ) >> 2] = 0;
        }
        
        HEAP32[(ptr ) >> 2] = 0;
        HEAP32[(32) >> 2] = (ptr|0) | 0;
        HEAP32[(24) >> 2] = ((HEAP32[(24) >> 2]|0) + (1|0))|0;
    }
    
    
    function getFreeChunk(nbytes) {
        nbytes = nbytes|0;
        var freeChunk = 0;
        var tmp1 = 0;
        var tmp2 = 0;
        var tmp3 = 0;
        var tmp4 = 0;
        freeChunk = 0;
        tmp1 = ((HEAP32[(28) >> 2]|0))|0;
        tmp2 = ((HEAP32[(32) >> 2]|0))|0;
        tmp3 = ((HEAP32[(20) >> 2]|0))|0;
        
        if (((HEAP32[(24) >> 2]|0) > (0|0))|0) {
            freeChunk = ((findChunk((nbytes|0))|0))|0;
            
            if ((((freeChunk|0) | 0) > (0|0))|0) {
                if (((((freeChunk|0) | 0) == (tmp1|0))|0)) {
                    HEAP32[(28) >> 2] = (nextFree((freeChunk|0))|0) | 0;
                }
                
                if (((((freeChunk|0) | 0) == (tmp2|0))|0)) {
                    HEAP32[(32) >> 2] = 0;
                }
                
                HEAP32[(24) >> 2] = ((HEAP32[(24) >> 2]|0) - (1|0))|0;
                setInuse((freeChunk|0));
                tmp4 = ((getChunkSize((freeChunk|0))|0))|0;
                tmp3 = ((((tmp3|0) - (tmp4|0))|0)|0)|0;
                HEAP32[(20) >> 2] = (tmp3|0);
                return (freeChunk)|0;
            }
        }
        return 0;
    }
    
    
    function findChunk(nbytes) {
        nbytes = nbytes|0;
        var chunk = 0;
        var tmp1 = 0;
        chunk = 0;
        chunk = ((HEAP32[(28) >> 2]|0))|0;
        
        while (((chunk|0) != 0)|0) {
            tmp1 = ((getChunkSize((chunk|0))|0))|0;
            
            if ((((tmp1|0) == (nbytes|0))|0)) {
                return (chunk)|0;
            }
            
            chunk = ((HEAP32[(chunk ) >> 2]|0))|0;
        }
        return 0;
    }
    
    
    function getHeapPtr() {
        return ((HEAP32[(16) >> 2]|0) | 0)|0;
    }
    
    
    function getFreeMemory() {
        return ((HEAP32[(20) >> 2]|0))|0;
    }
    
    
    function getOriginalHeapPtr() {
        return ((HEAP32[(12) >> 2]|0) | 0)|0;
    }
    
    
    function nextFree(ptr) {
        ptr = ptr|0;
        return ((HEAP32[(ptr ) >> 2]|0) | 0)|0;
    }
    
    
    function setHeadSize(ptr, s) {
        ptr = ptr|0;
        s = s|0;
        HEAP32[(ptr ) >> 2] = ((((HEAP32[(ptr ) >> 2]|0) & (7|0))|0)|0 | (s|0))|0;
    }
    
    
    function setFoot(ptr, s) {
        ptr = ptr|0;
        s = s|0;
        var chunkptr = 0;
        var size = 0;
        size = ((HEAP32[(ptr ) >> 2]|0))|0;
        chunkptr = (((((ptr|0) | 0) + (size|0))|0)|0)|0;
        HEAP32[(chunkptr ) >> 2] = (s|0);
    }
    
    
    function setInuse(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        chunkptr = (((((ptr|0) | 0) - (4|0))|0)|0)|0;
        HEAP32[(chunkptr ) >> 2] = ((HEAP32[(chunkptr ) >> 2]|0) | (1|0))|0;
    }
    
    
    function clearInuse(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        chunkptr = (((((ptr|0) | 0) - (4|0))|0)|0)|0;
        HEAP32[(chunkptr ) >> 2] = ((HEAP32[(chunkptr ) >> 2]|0) & (-2|0))|0;
    }
    
    
    function getChunkSize(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        chunkptr = (((((ptr|0) | 0) - (4|0))|0)|0)|0;
        return ((HEAP32[(chunkptr ) >> 2]|0) & (-2|0))|0;
    }
    
    
    function Array_new(bytesLength, elementSize) {
        bytesLength = bytesLength|0;
        elementSize = elementSize|0;
        var ptr = 0;
        ptr = malloc((8 + bytesLength)|0)|0;
        HEAP32[(ptr ) >> 2] = (bytesLength|0);
        HEAP32[(ptr + (4|0)) >> 2] = (elementSize|0);
        return (ptr)|0;
    }
    
    
    function Array_length(ptr) {
        ptr = ptr|0;
        return (((HEAP32[(ptr ) >> 2]|0) / (HEAP32[(ptr + (4|0) ) >> 2]|0))|0)|0;
    }
    
    
    function Array_op_get(ptr, index) {
        ptr = ptr|0;
        index = index|0;
        if (((index|0) < (((HEAP32[(ptr ) >> 2]|0) / (HEAP32[(ptr + (4|0) ) >> 2]|0))|0)|0)|0) {
            return ((HEAP32[((ptr + (8|0))|0 + ((index << (2|0)))|0 ) >> 2]|0))|0;
        }
        return 0;
    }
    
    
    function Array_op_set(ptr, index, value) {
        ptr = ptr|0;
        index = index|0;
        value = value|0;
        HEAP32[((ptr + (8|0))|0 + ((index << (2|0)))|0 ) >> 2] = (value|0);
    }
    
    
    function Float64Array_new(elementSize) {
        elementSize = elementSize|0;
        var ptr = 0;
        ptr = malloc((8 + elementSize << 8)|0)|0;
        HEAP32[(ptr ) >> 2] = (elementSize|0);
        HEAP32[(ptr + (4|0)) >> 2] = elementSize << (3|0);
        return (ptr)|0;
    }
    
    
    function Float64Array_op_get(ptr, index) {
        ptr = ptr|0;
        index = index|0;
        if (((index|0) < (HEAP32[(ptr ) >> 2]|0))|0) {
            return +((++HEAPF64[((ptr + (8|0))|0 + ((index << (3|0)))|0 ) >> 3]));
        }
        return +(fround(0));
    }
    
    
    function Float64Array_op_set(ptr, index, value) {
        ptr = ptr|0;
        index = index|0;
        value = +value;
        HEAPF64[((ptr + (8|0))|0 + ((index << (3|0)))|0 ) >> 3] = (+value);
    }
    
    
    function Data_new(id) {
        id = id|0;
        var ptr = 0;
        ptr = malloc(16)|0;
        HEAP32[(ptr ) >> 2] = (id|0);
        return (ptr)|0;
    }
    
    
    function Data_set(ptr, v1, v2, v3) {
        ptr = ptr|0;
        v1 = fround(v1);
        v2 = fround(v2);
        v3 = fround(v3);
        HEAPF32[(ptr + (4|0)) >> 2] = fround(v1);
        HEAPF32[(ptr + (8|0)) >> 2] = fround(v2);
        HEAPF32[(ptr + (12|0)) >> 2] = fround(v3);
    }
    
    
    
    function test(num) {
        num = num|0;
        var i = 0;
        HEAP32[(40) >> 2] = Array_new(0|0, 4|0)|0;
        
        while (((i|0) < (10|0))|0) {
            Array_op_set((HEAP32[(40) >> 2]|0) , (i|0), Data_new((i|0))|0);
            i = ((((i|0) + (1|0))|0)|0)|0;
        }
        return ((HEAP32[(40) >> 2]|0))|0;
    }
    
    
    function getArrayByteLength(value) {
        value = value|0;
        return ((HEAP32[(value ) >> 2]|0))|0;
    }
    
    
    function getArrayElementSize(value) {
        value = value|0;
        return ((HEAP32[(value + (4|0) ) >> 2]|0))|0;
    }
    
    
    function getData(index) {
        index = index|0;
        return (Array_op_get((HEAP32[(40) >> 2]|0) , (index|0))|0);
    }
    
    
    return {
       initMemory:initMemory,
       malloc:malloc,
       free:free,
       getHeapPtr:getHeapPtr,
       getFreeMemory:getFreeMemory,
       getOriginalHeapPtr:getOriginalHeapPtr,
       Array_new:Array_new,
       Array_length:Array_length,
       Array_op_get:Array_op_get,
       Array_op_set:Array_op_set,
       Float64Array_new:Float64Array_new,
       Float64Array_op_get:Float64Array_op_get,
       Float64Array_op_set:Float64Array_op_set,
       Data_new:Data_new,
       Data_set:Data_set,
       test:test,
       getArrayByteLength:getArrayByteLength,
       getArrayElementSize:getArrayElementSize,
       getData:getData
    }
}
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


function initTurbo(bytes) {
    var buffer = new ArrayBuffer(bytes);

    if (buffer.byteLength < 16) {
        throw new Error("The memory is too small even for metadata");
    }

    return TurboWrapper(TurboModule(
        typeof stdlib !== 'undefined' ? stdlib : window,
        typeof foreign !== 'undefined' ? foreign : {random: Math.random},
        buffer
    ), buffer);
}
