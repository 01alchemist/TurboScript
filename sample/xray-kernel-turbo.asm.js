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
        HEAPU8[36] = 255; HEAPU8[37] = 255; HEAPU8[38] = 255; HEAPU8[39] = 255; 
        HEAPU8[40] = 0; HEAPU8[41] = 0; HEAPU8[42] = 0; HEAPU8[43] = 0; 
        HEAPU8[44] = 0; HEAPU8[45] = 0; HEAPU8[46] = 0; HEAPU8[47] = 0; 
        HEAPU8[48] = 0; HEAPU8[49] = 0; HEAPU8[50] = 0; HEAPU8[51] = 0; 
        HEAPU8[52] = 0; HEAPU8[53] = 0; HEAPU8[54] = 0; HEAPU8[55] = 0; 
    }
    
    //##################################
    //#             CODE               #
    //##################################
    
    function powf32(x, y) {
        x = fround(x);
        y = fround(y);
        return fround(fround((+Math_pow((+fround(x)), (+fround(y))))));
    }
    
    
    function minf32(x, y) {
        x = fround(x);
        y = fround(y);
        return fround(fround((+Math_min((+fround(x)), (+fround(y))))));
    }
    
    
    function maxf32(x, y) {
        x = fround(x);
        y = fround(y);
        return fround(fround((+Math_max((+fround(x)), (+fround(y))))));
    }
    
    
    
    function malloc(nbytes) {
        nbytes = nbytes|0;
        var alignment = 8;
        var chunkSize = 0;
        var freeChunk = 0;
        var offset = 0;
        var top = 0;
        var ptr = 0;
        nbytes = ((((((nbytes|0) + ((((alignment|0) - 1)|0))|0)|0)|0 & (~(alignment - 1) | 0))|0)|0)|0;
        chunkSize = ((nbytes|0) + 8)|0;
        freeChunk = (getFreeChunk((chunkSize|0))|0);
        
        if ((((freeChunk|0) | 0) > 0)|0) {
            return (freeChunk)|0;
        }
        
        offset = (HEAP32[(16) >> 2]|0) | 0;
        offset = ((((offset|0) + 7)|0)|0)|0;
        offset = ((((offset|0) & -8)|0)|0)|0;
        top = ((offset|0) + (chunkSize|0))|0;
        ptr = ((offset|0) + 4)|0;
        setHeadSize((ptr|0), (chunkSize|0));
        setInuse(((ptr|0) + 4)|0);
        setFoot((ptr|0), (chunkSize|0));
        HEAP32[(16) >> 2] = ((top|0) + 4)|0;
        offset = ((((offset|0) + 8)|0)|0)|0;
        ptr = ((offset|0))|0;
        
        while ((((ptr|0) | 0) < ((top|0) | 0))|0) {
            HEAP32[(ptr ) >> 2] = 0;
            ptr = ((((ptr|0) + 4)|0)|0)|0;
        }
        return (offset)|0;
    }
    
    
    function free(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        var tmp1 = 0;
        chunkptr = 0;
        clearInuse((ptr|0));
        
        if ((((HEAP32[(28) >> 2]|0) == 0)|0)) {
            HEAP32[(28) >> 2] = (ptr|0) | 0;
        }
        
        tmp1 = ((HEAP32[(20) >> 2]|0) | 0)|0;
        tmp1 = ((((tmp1|0) + ((getChunkSize((ptr|0))|0) | 0))|0)|0)|0;
        HEAP32[(20) >> 2] = (tmp1|0) | 0;
        chunkptr = ((((ptr|0) + 4)|0)|0)|0;
        
        if (((HEAP32[(32) >> 2]|0) > 0)|0) {
            HEAP32[(chunkptr ) >> 2] = (HEAP32[(32) >> 2]|0);
            HEAP32[((HEAP32[(32) >> 2]|0) ) >> 2] = (ptr|0) | 0;
        }
        
        else {
            HEAP32[(chunkptr ) >> 2] = 0;
        }
        
        HEAP32[(ptr ) >> 2] = 0;
        HEAP32[(32) >> 2] = (ptr|0) | 0;
        HEAP32[(24) >> 2] = ((HEAP32[(24) >> 2]|0) + 1)|0;
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
        
        if (((HEAP32[(24) >> 2]|0) > 0)|0) {
            freeChunk = ((findChunk((nbytes|0))|0))|0;
            
            if ((((freeChunk|0) | 0) > 0)|0) {
                if (((((freeChunk|0) | 0) == (tmp1|0))|0)) {
                    HEAP32[(28) >> 2] = (nextFree((freeChunk|0))|0) | 0;
                }
                
                if (((((freeChunk|0) | 0) == (tmp2|0))|0)) {
                    HEAP32[(32) >> 2] = 0;
                }
                
                HEAP32[(24) >> 2] = ((HEAP32[(24) >> 2]|0) - 1)|0;
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
        HEAP32[(ptr ) >> 2] = ((((HEAP32[(ptr ) >> 2]|0) & 7)|0)|0 | (s|0))|0;
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
        chunkptr = (((((ptr|0) | 0) - 4)|0)|0)|0;
        HEAP32[(chunkptr ) >> 2] = ((HEAP32[(chunkptr ) >> 2]|0) | 1)|0;
    }
    
    
    function clearInuse(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        chunkptr = (((((ptr|0) | 0) - 4)|0)|0)|0;
        HEAP32[(chunkptr ) >> 2] = ((HEAP32[(chunkptr ) >> 2]|0) & -2)|0;
    }
    
    
    function getChunkSize(ptr) {
        ptr = ptr|0;
        var chunkptr = 0;
        chunkptr = (((((ptr|0) | 0) - 4)|0)|0)|0;
        return ((HEAP32[(chunkptr ) >> 2]|0) & -2)|0;
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
            return ((HEAP32[((ptr + 8)|0 + ((index << 2))|0 ) >> 2]|0))|0;
        }
        return 0;
    }
    
    
    function Array_op_set(ptr, index, value) {
        ptr = ptr|0;
        index = index|0;
        value = value|0;
        HEAP32[((ptr + 8)|0 + ((index << 2))|0 ) >> 2] = (value|0);
    }
    
    
    function Float64Array_new(elementSize) {
        elementSize = elementSize|0;
        var ptr = 0;
        ptr = malloc((8 + elementSize << 8)|0)|0;
        HEAP32[(ptr ) >> 2] = (elementSize|0);
        HEAP32[(ptr + (4|0)) >> 2] = elementSize << 3;
        return (ptr)|0;
    }
    
    
    function Float64Array_op_get(ptr, index) {
        ptr = ptr|0;
        index = index|0;
        if (((index|0) < (HEAP32[(ptr ) >> 2]|0))|0) {
            return +((+HEAPF64[((ptr + 8)|0 + ((index << 3))|0 ) >> 3]));
        }
        return +(fround(0));
    }
    
    
    function Float64Array_op_set(ptr, index, value) {
        ptr = ptr|0;
        index = index|0;
        value = +value;
        HEAPF64[((ptr + 8)|0 + ((index << 3))|0 ) >> 3] = (+value);
    }
    
    
    
    function randomFloat32() {
        return fround(fround(((foreign_random()|0) / (HEAP32[(36) >> 2]|0))|0));
    }
    
    
    function randomFloat64() {
        return +((+(foreign_random()|0)));
    }
    
    
    function Vector3_new(x, y, z) {
        x = fround(x);
        y = fround(y);
        z = fround(z);
        var ptr = 0;
        ptr = malloc(12)|0;
        HEAPF32[(ptr ) >> 2] = fround(x);
        HEAPF32[(ptr + (4|0)) >> 2] = fround(y);
        HEAPF32[(ptr + (8|0)) >> 2] = fround(z);
        return (ptr)|0;
    }
    
    
    function Vector3_isEqual(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return ((((fround(HEAPF32[(ptr ) >> 2]) == fround(HEAPF32[(b ) >> 2]))|0)|0 & ((fround(HEAPF32[(ptr + (4|0) ) >> 2]) == fround(HEAPF32[(b + (4|0) ) >> 2]))|0)|0)|0 & ((fround(HEAPF32[(ptr + (8|0) ) >> 2]) == fround(HEAPF32[(b + (8|0) ) >> 2]))|0)|0)|0;
    }
    
    
    function Vector3_isZero(ptr) {
        ptr = ptr|0;
        var r = 0;
        r = (((((fround(HEAPF32[(ptr ) >> 2]) == fround(0))|0)|0 & ((fround(HEAPF32[(ptr + (4|0) ) >> 2]) == fround(0))|0)|0)|0)|0 & ((fround(HEAPF32[(ptr + (8|0) ) >> 2]) == fround(0))|0)|0)|0;
        return (r)|0;
    }
    
    
    function Vector3_set(ptr, x, y, z) {
        ptr = ptr|0;
        x = fround(x);
        y = fround(y);
        z = fround(z);
        HEAPF32[(ptr ) >> 2] = fround(x);
        HEAPF32[(ptr + (4|0)) >> 2] = fround(y);
        HEAPF32[(ptr + (8|0)) >> 2] = fround(z);
        return (ptr)|0;
    }
    
    
    function Vector3_copy(ptr, src) {
        ptr = ptr|0;
        src = src|0;
        HEAPF32[(ptr ) >> 2] = fround(HEAPF32[(src ) >> 2]);
        HEAPF32[(ptr + (4|0)) >> 2] = fround(HEAPF32[(src + (4|0) ) >> 2]);
        HEAPF32[(ptr + (8|0)) >> 2] = fround(HEAPF32[(src + (8|0) ) >> 2]);
        return (ptr)|0;
    }
    
    
    function Vector3_clone(ptr) {
        ptr = ptr|0;
        return Vector3_new(fround(HEAPF32[(ptr ) >> 2]), fround(HEAPF32[(ptr + (4|0) ) >> 2]), fround(HEAPF32[(ptr + (8|0) ) >> 2]))|0;
    }
    
    
    function Vector3_length(ptr) {
        ptr = ptr|0;
        return fround(fround(fround(Math_sqrt(fround(fround(fround(fround(fround(HEAPF32[(ptr ) >> 2]) * fround(HEAPF32[(ptr ) >> 2])) + fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) * fround(HEAPF32[(ptr + (4|0) ) >> 2])))) + fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) * fround(HEAPF32[(ptr + (8|0) ) >> 2])))))));
    }
    
    
    function Vector3_lengthN(ptr, n) {
        ptr = ptr|0;
        n = fround(n);
        var a = 0;
        var p1 = fround(0);
        var p2 = fround(0);
        var p3 = fround(0);
        var xyz = fround(0);
        var length = fround(0);
        if (((fround(n) == fround(2))|0)) {
            return fround(Vector3_length(ptr));
        }
        
        a = (Vector3_abs(ptr , 0)|0);
        p1 = fround(powf32(fround(HEAPF32[(a ) >> 2]), fround(n)));
        p2 = fround(powf32(fround(HEAPF32[(a + (4|0) ) >> 2]), fround(n)));
        p3 = fround(powf32(fround(HEAPF32[(a + (8|0) ) >> 2]), fround(n)));
        xyz = fround(fround(fround(fround(p1) + fround(p2))) + fround(p3));
        length = fround(fround(powf32(fround(xyz), fround(fround(fround(1)) / fround(n)))));
        free((a)|0);
        return fround(length);
    }
    
    
    function Vector3_dot(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return fround(fround(fround(fround(HEAPF32[(ptr ) >> 2]) * fround(HEAPF32[(b ) >> 2])) + fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) * fround(HEAPF32[(b + (4|0) ) >> 2]))) + fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) * fround(HEAPF32[(b + (8|0) ) >> 2])));
    }
    
    
    function Vector3_cross(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) * fround(HEAPF32[(b + (8|0) ) >> 2])) - fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) * fround(HEAPF32[(b + (4|0) ) >> 2]))), fround(fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) * fround(HEAPF32[(b ) >> 2])) - fround(fround(HEAPF32[(ptr ) >> 2]) * fround(HEAPF32[(b + (8|0) ) >> 2]))), fround(fround(fround(HEAPF32[(ptr ) >> 2]) * fround(HEAPF32[(b + (4|0) ) >> 2])) - fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) * fround(HEAPF32[(b ) >> 2]))))|0);
    }
    
    
    function Vector3_normalize(ptr, c) {
        ptr = ptr|0;
        c = c|0;
        var d = fround(0);
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        d = fround(Vector3_length(ptr));
        return (Vector3_set(c , fround(fround(HEAPF32[(ptr ) >> 2]) / fround(d)), fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) / fround(d)), fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) / fround(d)))|0);
    }
    
    
    function Vector3_abs(ptr, c) {
        ptr = ptr|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(Math_abs(fround(HEAPF32[(ptr ) >> 2]))), fround(Math_abs(fround(HEAPF32[(ptr + (4|0) ) >> 2]))), fround(Math_abs(fround(HEAPF32[(ptr + (8|0) ) >> 2]))))|0);
    }
    
    
    function Vector3_add(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(HEAPF32[(ptr ) >> 2]) + fround(HEAPF32[(b ) >> 2])), fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) + fround(HEAPF32[(b + (4|0) ) >> 2])), fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) + fround(HEAPF32[(b + (8|0) ) >> 2])))|0);
    }
    
    
    function Vector3_sub(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(HEAPF32[(ptr ) >> 2]) - fround(HEAPF32[(b ) >> 2])), fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) - fround(HEAPF32[(b + (4|0) ) >> 2])), fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) - fround(HEAPF32[(b + (8|0) ) >> 2])))|0);
    }
    
    
    function Vector3_mul(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(HEAPF32[(ptr ) >> 2]) * fround(HEAPF32[(b ) >> 2])), fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) * fround(HEAPF32[(b + (4|0) ) >> 2])), fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) * fround(HEAPF32[(b + (8|0) ) >> 2])))|0);
    }
    
    
    function Vector3_div(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(HEAPF32[(ptr ) >> 2]) / fround(HEAPF32[(b ) >> 2])), fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) / fround(HEAPF32[(b + (4|0) ) >> 2])), fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) / fround(HEAPF32[(b + (8|0) ) >> 2])))|0);
    }
    
    
    function Vector3_mod(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(HEAPF32[(ptr ) >> 2]) - fround(fround(HEAPF32[(b ) >> 2]) * fround(Math_floor(fround(fround(HEAPF32[(ptr ) >> 2]) / fround(HEAPF32[(b ) >> 2])))))), fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) - fround(fround(HEAPF32[(b + (4|0) ) >> 2]) * fround(Math_floor(fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) / fround(HEAPF32[(b + (4|0) ) >> 2])))))), fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) - fround(fround(HEAPF32[(b + (8|0) ) >> 2]) * fround(Math_floor(fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) / fround(HEAPF32[(b + (8|0) ) >> 2])))))))|0);
    }
    
    
    function Vector3_addScalar(ptr, f, c) {
        ptr = ptr|0;
        f = fround(f);
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(HEAPF32[(ptr ) >> 2]) + fround(f)), fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) + fround(f)), fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) + fround(f)))|0);
    }
    
    
    function Vector3_subScalar(ptr, f, c) {
        ptr = ptr|0;
        f = fround(f);
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(HEAPF32[(ptr ) >> 2]) - fround(f)), fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) - fround(f)), fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) - fround(f)))|0);
    }
    
    
    function Vector3_mulScalar(ptr, f, c) {
        ptr = ptr|0;
        f = fround(f);
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(HEAPF32[(ptr ) >> 2]) * f), fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) * f), fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) * f))|0);
    }
    
    
    function Vector3_divScalar(ptr, f, c) {
        ptr = ptr|0;
        f = fround(f);
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(HEAPF32[(ptr ) >> 2]) / fround(f)), fround(fround(HEAPF32[(ptr + (4|0) ) >> 2]) / fround(f)), fround(fround(HEAPF32[(ptr + (8|0) ) >> 2]) / fround(f)))|0);
    }
    
    
    function Vector3_min(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(minf32(fround(HEAPF32[(ptr ) >> 2]), fround(HEAPF32[(b ) >> 2])))), fround(fround(minf32(fround(HEAPF32[(ptr + (4|0) ) >> 2]), fround(HEAPF32[(b + (4|0) ) >> 2])))), fround(fround(minf32(fround(HEAPF32[(ptr + (8|0) ) >> 2]), fround(HEAPF32[(b + (8|0) ) >> 2])))))|0);
    }
    
    
    function Vector3_max(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(maxf32(fround(HEAPF32[(ptr ) >> 2]), fround(HEAPF32[(b ) >> 2])))), fround(fround(maxf32(fround(HEAPF32[(ptr + (4|0) ) >> 2]), fround(HEAPF32[(b + (4|0) ) >> 2])))), fround(fround(maxf32(fround(HEAPF32[(ptr + (8|0) ) >> 2]), fround(HEAPF32[(b + (8|0) ) >> 2])))))|0);
    }
    
    
    function Vector3_minAxis(ptr, a, c) {
        ptr = ptr|0;
        a = a|0;
        c = c|0;
        var x = fround(0);
        var y = fround(0);
        var z = fround(0);
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        x = fround(Math_abs(fround(HEAPF32[(ptr ) >> 2])));
        y = fround(Math_abs(fround(HEAPF32[(ptr + (4|0) ) >> 2])));
        z = fround(Math_abs(fround(HEAPF32[(ptr + (8|0) ) >> 2])));
        
        if (((((fround(x) <= fround(y))|0)|0 & ((fround(x) <= fround(z))|0)|0)|0)) {
            return (Vector3_set(c , fround(1), fround(0), fround(0))|0);
        }
        
        else if (((((fround(y) <= fround(x))|0)|0 & ((fround(y) <= fround(z))|0)|0)|0)) {
            return (Vector3_set(c , fround(0), fround(1), fround(0))|0);
        }
        return (Vector3_set(c , fround(0), fround(0), fround(1))|0);
    }
    
    
    function Vector3_minComponent(ptr, a) {
        ptr = ptr|0;
        a = a|0;
        return fround(fround(fround(minf32(fround(minf32(fround(HEAPF32[(ptr ) >> 2]), fround(HEAPF32[(ptr + (4|0) ) >> 2]))), fround(HEAPF32[(ptr + (8|0) ) >> 2])))));
    }
    
    
    function Vector3_maxComponent(ptr, a) {
        ptr = ptr|0;
        a = a|0;
        return fround(fround(fround(maxf32(fround(maxf32(fround(HEAPF32[(ptr ) >> 2]), fround(HEAPF32[(ptr + (4|0) ) >> 2]))), fround(HEAPF32[(ptr + (8|0) ) >> 2])))));
    }
    
    
    function Vector3_reflect(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = ((Vector3_mulScalar(ptr , fround(fround(2) * fround(Vector3_dot(ptr , (b|0)))), (c|0))|0))|0;
        return (Vector3_sub(b , (c|0), (c|0))|0);
    }
    
    
    function Vector3_refract(ptr, b, n1, n2, c) {
        ptr = ptr|0;
        b = b|0;
        n1 = fround(n1);
        n2 = fround(n2);
        c = c|0;
        var nr = fround(0);
        var cosI = fround(0);
        var sinT2 = fround(0);
        var cosT = fround(0);
        var tmp1 = 0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        nr = fround(fround(n1) / fround(n2));
        cosI = fround(Vector3_dot(ptr , (b|0)));
        sinT2 = fround(powf32(fround(nr), fround(2)) * (fround(1) - powf32(fround(cosI),fround(2))));
        
        if ((fround(sinT2) > fround(1))|0) {
            return (Vector3_set(c , fround(0), fround(0), fround(0))|0);
        }
        
        cosT = fround(Math_sqrt(fround(fround(1) - fround(sinT2))));
        (Vector3_mulScalar(b , fround(nr), (c|0))|0);
        tmp1 = (Vector3_mulScalar(ptr , nr * (cosI - cosT))|0);
        (Vector3_add(c , (tmp1|0), (c|0))|0);
        free((tmp1)|0);
        return (c)|0;
    }
    
    
    function Vector3_reflectance(ptr, b, n1, n2) {
        ptr = ptr|0;
        b = b|0;
        n1 = fround(n1);
        n2 = fround(n2);
        var nr = fround(0);
        var cosI = fround(0);
        var sinT2 = fround(0);
        var cosT = fround(0);
        var rOrth = fround(0);
        var rPar = fround(0);
        nr = fround(fround(n1) / fround(n2));
        cosI = -fround(Vector3_dot(ptr , (b|0)));
        sinT2 = nr * nr * (fround(1) - fround(cosI * cosI));
        
        if ((fround(sinT2) > fround(1))|0) {
            return fround(fround(1));
        }
        
        cosT = fround(Math_sqrt(fround(fround(1) - fround(sinT2))));
        rOrth = fround(fround((fround(fround(n1 * cosI) - fround(n2 * cosT)))) / fround((fround(fround(n1 * cosI) + fround(n2 * cosT)))));
        rPar = fround(fround((fround(fround(n2 * cosI) - fround(n1 * cosT)))) / fround((fround(fround(n2 * cosI) + fround(n1 * cosT)))));
        return fround(fround(fround((fround(fround(rOrth * rOrth) + fround(rPar * rPar)))) / fround(2)));
    }
    
    
    function Vector3_pow(ptr, f, c) {
        ptr = ptr|0;
        f = fround(f);
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        return (Vector3_set(c , fround(fround(powf32(fround(HEAPF32[(ptr ) >> 2]), fround(f)))), fround(fround(powf32(fround(HEAPF32[(ptr + (4|0) ) >> 2]), fround(f)))), fround(fround(powf32(fround(HEAPF32[(ptr + (8|0) ) >> 2]), fround(f)))))|0);
    }
    
    
    function randomUnitVector3(c) {
        c = c|0;
        var x = fround(0);
        var y = fround(0);
        var z = fround(0);
        x = fround(fround(fround(randomFloat32()) * fround(2)) - fround(1));
        y = fround(fround(fround(randomFloat32()) * fround(2)) - fround(1));
        z = fround(fround(fround(randomFloat32()) * fround(2)) - fround(1));
        
        while ((fround(fround(fround(fround(fround(x * x) + fround(y * y))) + fround(z * z))) > fround(1))|0) {
            x = fround(fround(fround(fround(fround(randomFloat32()) * fround(2)) - fround(1))));
            y = fround(fround(fround(fround(fround(randomFloat32()) * fround(2)) - fround(1))));
            z = fround(fround(fround(fround(fround(randomFloat32()) * fround(2)) - fround(1))));
        }
        
        c = (((c|0) != 0)|0 ? c : Vector3_new((fround(0)), (fround(0)), (fround(0)))|0)|0;
        (Vector3_set(c , fround(x), fround(y), fround(z))|0);
        return (Vector3_normalize(c , (c|0))|0);
    }
    
    
    
    function Color_new(r = 0, g = 0, b = 0) {
        r = +r;
        g = +g;
        b = +b;
        var ptr = 0;
        ptr = malloc(24)|0;
        HEAPF64[(ptr ) >> 3] = (+r);
        HEAPF64[(ptr + (8|0)) >> 3] = (+g);
        HEAPF64[(ptr + (16|0)) >> 3] = (+b);
        return (ptr)|0;
    }
    
    
    function Color_set(ptr, r, g, b) {
        ptr = ptr|0;
        r = +r;
        g = +g;
        b = +b;
        HEAPF64[(ptr ) >> 3] = (+r);
        HEAPF64[(ptr + (8|0)) >> 3] = (+g);
        HEAPF64[(ptr + (16|0)) >> 3] = (+b);
        return (ptr)|0;
    }
    
    
    function Color_hexColor(hex) {
        ptr = ptr|0;
        hex = hex|0;
        var r = 0;
        var g = 0;
        var b = 0;
        var c = 0;
        r = (((((hex >> 16)|0 & 255)|0))|0 / 255)|0;
        g = (((((hex >> 8)|0 & 255)|0))|0 / 255)|0;
        b = (((((hex|0) & 255)|0))|0 / 255)|0;
        c = Color_new((+(r|0)), (+(g|0)), (+(b|0)))|0;
        return (Color_pow(c , 2.2)|0);
    }
    
    
    function Color_add(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Color_new()|0)|0;
        return (Color_set(c , +(HEAPF64[(ptr ) >> 3] + HEAPF64[(b ) >> 3]), +(HEAPF64[(ptr + (8|0) ) >> 3] + HEAPF64[(b + (8|0) ) >> 3]), +(HEAPF64[(ptr + (16|0) ) >> 3] + HEAPF64[(b + (16|0) ) >> 3]))|0);
    }
    
    
    function Color_sub(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Color_new()|0)|0;
        return (Color_set(c , +(HEAPF64[(ptr ) >> 3] - HEAPF64[(b ) >> 3]), +(HEAPF64[(ptr + (8|0) ) >> 3] - HEAPF64[(b + (8|0) ) >> 3]), +(HEAPF64[(ptr + (16|0) ) >> 3] - HEAPF64[(b + (16|0) ) >> 3]))|0);
    }
    
    
    function Color_mul(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Color_new()|0)|0;
        return (Color_set(c , HEAPF64[(ptr ) >> 3] * HEAPF64[(b ) >> 3], HEAPF64[(ptr + (8|0) ) >> 3] * HEAPF64[(b + (8|0) ) >> 3], HEAPF64[(ptr + (16|0) ) >> 3] * HEAPF64[(b + (16|0) ) >> 3])|0);
    }
    
    
    function Color_mulScalar(ptr, f, c) {
        ptr = ptr|0;
        f = +f;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Color_new()|0)|0;
        return (Color_set(c , HEAPF64[(ptr ) >> 3] * f, HEAPF64[(ptr + (8|0) ) >> 3] * f, HEAPF64[(ptr + (16|0) ) >> 3] * f)|0);
    }
    
    
    function Color_div(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Color_new()|0)|0;
        return (Color_set(c , +(HEAPF64[(ptr ) >> 3] / HEAPF64[(b ) >> 3]), +(HEAPF64[(ptr + (8|0) ) >> 3] / HEAPF64[(b + (8|0) ) >> 3]), +(HEAPF64[(ptr + (16|0) ) >> 3] / HEAPF64[(b + (16|0) ) >> 3]))|0);
    }
    
    
    function Color_divScalar(ptr, f, c) {
        ptr = ptr|0;
        f = +f;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Color_new()|0)|0;
        return (Color_set(c , +(HEAPF64[(ptr ) >> 3] / (+f)), +(HEAPF64[(ptr + (8|0) ) >> 3] / (+f)), +(HEAPF64[(ptr + (16|0) ) >> 3] / (+f)))|0);
    }
    
    
    function Color_min(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Color_new()|0)|0;
        return (Color_set(c , (+Math_min(HEAPF64[(ptr ) >> 3], HEAPF64[(b ) >> 3])), (+Math_min(HEAPF64[(ptr + (8|0) ) >> 3], HEAPF64[(b + (8|0) ) >> 3])), (+Math_min(HEAPF64[(ptr + (16|0) ) >> 3], HEAPF64[(b + (16|0) ) >> 3])))|0);
    }
    
    
    function Color_max(ptr, b, c) {
        ptr = ptr|0;
        b = b|0;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Color_new()|0)|0;
        return (Color_set(c , (+Math_max(HEAPF64[(ptr ) >> 3], HEAPF64[(b ) >> 3])), (+Math_max(HEAPF64[(ptr + (8|0) ) >> 3], HEAPF64[(b + (8|0) ) >> 3])), (+Math_max(HEAPF64[(ptr + (16|0) ) >> 3], HEAPF64[(b + (16|0) ) >> 3])))|0);
    }
    
    
    function Color_minComponent(ptr) {
        ptr = ptr|0;
        return (+Math_min((+Math_min(HEAPF64[(ptr ) >> 3], HEAPF64[(ptr + (8|0) ) >> 3])), HEAPF64[(ptr + (16|0) ) >> 3]));
    }
    
    
    function Color_maxComponent(ptr) {
        ptr = ptr|0;
        return (+Math_max((+Math_max(HEAPF64[(ptr ) >> 3], HEAPF64[(ptr + (8|0) ) >> 3])), HEAPF64[(ptr + (16|0) ) >> 3]));
    }
    
    
    function Color_pow(ptr, f, c) {
        ptr = ptr|0;
        f = +f;
        c = c|0;
        c = (((c|0) != 0)|0 ? c : Color_new()|0)|0;
        return (Color_set(c , (+Math_pow(HEAPF64[(ptr ) >> 3], (+f))), (+Math_pow(HEAPF64[(ptr + (8|0) ) >> 3], (+f))), (+Math_pow(HEAPF64[(ptr + (16|0) ) >> 3], (+f))))|0);
    }
    
    
    function Color_mix(ptr, b, pct, c) {
        ptr = ptr|0;
        b = b|0;
        pct = +pct;
        c = c|0;
        var _b = 0;
        c = ((Color_mulScalar(ptr , +(+(1.0) - (+pct)), (c|0))|0))|0;
        _b = (Color_mulScalar(b , (+pct))|0);
        c = ((Color_add(c , (_b|0), (c|0))|0))|0;
        free((_b)|0);
        return (c)|0;
    }
    
    
    function Image_new(width, height, depth = 8) {
        width = width|0;
        height = height|0;
        depth = depth|0;
        var ptr = 0;
        ptr = malloc(24)|0;
        var len = 0;
        HEAP32[(ptr ) >> 2] = (width|0);
        HEAP32[(ptr + (4|0)) >> 2] = (height|0);
        HEAPU8[(ptr + (8|0)) >> 0] = (depth|0);
        len = ((Math_imul(width, height)|0))|0 << 2;
        HEAP32[(ptr + (16|0)) >> 2] = Array_new(0|0, 1|0)|0;
        return (ptr)|0;
    }
    
    
    function Image_pixOffset(ptr, x, y) {
        ptr = ptr|0;
        x = x|0;
        y = y|0;
        return (((Math_imul(y, ((HEAP32[(ptr ) >> 2]|0) << 2)|0)|0))|0 + ((x << 2))|0)|0;
    }
    
    
    function Image_getPixel32(ptr, x, y) {
        ptr = ptr|0;
        x = x|0;
        y = y|0;
        var i = 0;
        i = (Image_pixOffset(ptr , (x|0), (y|0))|0);
        return Color_new((+((Array_op_get(data , (i|0))|0) / 255)|0), (+((Array_op_get(data , ((i|0) + 1)|0)|0) / 255)|0), (+((Array_op_get(data , ((i|0) + 2)|0)|0) / 255)|0))|0;
    }
    
    
    function Image_getPixel64(ptr, x, y) {
        ptr = ptr|0;
        x = x|0;
        y = y|0;
        var i = 0;
        i = (Image_pixOffset(ptr , (x|0), (y|0))|0);
        return Color_new((+((Array_op_get(data , (i|0))|0) / 65535)|0), (+((Array_op_get(data , ((i|0) + 1)|0)|0) / 65535)|0), (+((Array_op_get(data , ((i|0) + 2)|0)|0) / 65535)|0))|0;
    }
    
    
    function Image_setPixel32(ptr, x, y, c) {
        ptr = ptr|0;
        x = x|0;
        y = y|0;
        c = c|0;
        var i = 0;
        i = (Image_pixOffset(ptr , (x|0), (y|0))|0);
        Array_op_set(data , (i|0), HEAPF64[(c ) >> 3] * 255.0);
        Array_op_set(data , ((i|0) + 1)|0, HEAPF64[(c + (8|0) ) >> 3] * 255.0);
        Array_op_set(data , ((i|0) + 2)|0, HEAPF64[(c + (16|0) ) >> 3] * 255.0);
        Array_op_set(data , ((i|0) + 3)|0, fround(255));
    }
    
    
    function Image_setPixel64(ptr, x, y, c) {
        ptr = ptr|0;
        x = x|0;
        y = y|0;
        c = c|0;
        var i = 0;
        i = (Image_pixOffset(ptr , (x|0), (y|0))|0);
        Array_op_set(data , (i|0), HEAPF64[(c ) >> 3] * 65535.0);
        Array_op_set(data , ((i|0) + 1)|0, HEAPF64[(c + (8|0) ) >> 3] * 65535.0);
        Array_op_set(data , ((i|0) + 2)|0, HEAPF64[(c + (16|0) ) >> 3] * 65535.0);
        Array_op_set(data , ((i|0) + 3)|0, fround(65535));
    }
    
    
    function Image_setRaw(ptr, data) {
        ptr = ptr|0;
        data = data|0;
        var i = 0;
        
        while (((i|0) < (Array_length(data)|0))|0) {
            Array_op_set(data , (i|0), (Array_op_get(data , (i|0))|0));
            i = ((((i|0) + 1)|0)|0)|0;
        }
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
       randomFloat32:randomFloat32,
       randomFloat64:randomFloat64,
       Vector3_new:Vector3_new,
       Vector3_isEqual:Vector3_isEqual,
       Vector3_isZero:Vector3_isZero,
       Vector3_set:Vector3_set,
       Vector3_copy:Vector3_copy,
       Vector3_clone:Vector3_clone,
       Vector3_length:Vector3_length,
       Vector3_lengthN:Vector3_lengthN,
       Vector3_dot:Vector3_dot,
       Vector3_cross:Vector3_cross,
       Vector3_normalize:Vector3_normalize,
       Vector3_abs:Vector3_abs,
       Vector3_add:Vector3_add,
       Vector3_sub:Vector3_sub,
       Vector3_mul:Vector3_mul,
       Vector3_div:Vector3_div,
       Vector3_mod:Vector3_mod,
       Vector3_addScalar:Vector3_addScalar,
       Vector3_subScalar:Vector3_subScalar,
       Vector3_mulScalar:Vector3_mulScalar,
       Vector3_divScalar:Vector3_divScalar,
       Vector3_min:Vector3_min,
       Vector3_max:Vector3_max,
       Vector3_minAxis:Vector3_minAxis,
       Vector3_minComponent:Vector3_minComponent,
       Vector3_maxComponent:Vector3_maxComponent,
       Vector3_reflect:Vector3_reflect,
       Vector3_refract:Vector3_refract,
       Vector3_reflectance:Vector3_reflectance,
       Vector3_pow:Vector3_pow,
       randomUnitVector3:randomUnitVector3,
       Color_new:Color_new,
       Color_set:Color_set,
       Color_hexColor:Color_hexColor,
       Color_add:Color_add,
       Color_sub:Color_sub,
       Color_mul:Color_mul,
       Color_mulScalar:Color_mulScalar,
       Color_div:Color_div,
       Color_divScalar:Color_divScalar,
       Color_min:Color_min,
       Color_max:Color_max,
       Color_minComponent:Color_minComponent,
       Color_maxComponent:Color_maxComponent,
       Color_pow:Color_pow,
       Color_mix:Color_mix,
       Image_new:Image_new,
       Image_pixOffset:Image_pixOffset,
       Image_getPixel32:Image_getPixel32,
       Image_getPixel64:Image_getPixel64,
       Image_setPixel32:Image_setPixel32,
       Image_setPixel64:Image_setPixel64,
       Image_setRaw:Image_setRaw
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
        typeof foreign !== 'undefined' ? foreign : {
                random: () => {
                    return Math.random() / Number.MAX_SAFE_INTEGER;
                }
            },
        buffer
    ), buffer);
}
