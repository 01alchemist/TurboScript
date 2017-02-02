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
    
    
    function Vector3_new(x, y, z) {
        x = +x;
        y = +y;
        z = +z;
        var ptr = 0;
        ptr = malloc(24)|0;
        HEAPF64[(ptr ) >> 3] = (+x);
        HEAPF64[(ptr + (8|0)) >> 3] = (+y);
        HEAPF64[(ptr + (16|0)) >> 3] = (+z);
        return (ptr)|0;
    }
    
    
    function Vector3_length(ptr) {
        ptr = ptr|0;
        return (+Math_sqrt(+(+(+(+(+HEAPF64[(ptr ) >> 3] * +HEAPF64[(ptr ) >> 3]) + +(+HEAPF64[(ptr + (8|0) ) >> 3] * +HEAPF64[(ptr + (8|0) ) >> 3]))) + +(+HEAPF64[(ptr + (16|0) ) >> 3] * +HEAPF64[(ptr + (16|0) ) >> 3]))));
    }
    
    
    function Vector3_lengthN(ptr, n) {
        ptr = ptr|0;
        n = +n;
        var a = 0;
        var p1 = 0.0;
        var p2 = 0.0;
        var p3 = 0.0;
        var xyz = 0.0;
        var length = 0.0;
        if ((((+n) == 2.0)|0)) {
            return (+Vector3_length(ptr));
        }
        
        a = (Vector3_abs(ptr)|0);
        p1 = (+Math_pow(+HEAPF64[(a ) >> 3], (+n)));
        p2 = (+Math_pow(+HEAPF64[(a + (8|0) ) >> 3], (+n)));
        p3 = (+Math_pow(+HEAPF64[(a + (16|0) ) >> 3], (+n)));
        xyz = +(+(+((+p1) + (+p2))) + (+p3));
        length = (+Math_pow((+xyz), +((+fround(1)) / (+n))));
        free((a)|0);
        return +(length);
    }
    
    
    function Vector3_dot(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return +(+(+(+HEAPF64[(ptr ) >> 3] * +HEAPF64[(b ) >> 3]) + +(+HEAPF64[(ptr + (8|0) ) >> 3] * +HEAPF64[(b + (8|0) ) >> 3])) + +(+HEAPF64[(ptr + (16|0) ) >> 3] * +HEAPF64[(b + (16|0) ) >> 3]));
    }
    
    
    function Vector3_cross(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return Vector3_new((+(+(+HEAPF64[(ptr + (8|0) ) >> 3] * +HEAPF64[(b + (16|0) ) >> 3]) - +(+HEAPF64[(ptr + (16|0) ) >> 3] * +HEAPF64[(b + (8|0) ) >> 3]))), (+(+(+HEAPF64[(ptr + (16|0) ) >> 3] * +HEAPF64[(b ) >> 3]) - +(+HEAPF64[(ptr ) >> 3] * +HEAPF64[(b + (16|0) ) >> 3]))), (+(+(+HEAPF64[(ptr ) >> 3] * +HEAPF64[(b + (8|0) ) >> 3]) - +(+HEAPF64[(ptr + (8|0) ) >> 3] * +HEAPF64[(b ) >> 3]))))|0;
    }
    
    
    function Vector3_normalize(ptr) {
        ptr = ptr|0;
        var d = 0.0;
        d = (+Vector3_length(ptr));
        return Vector3_new((+(+HEAPF64[(ptr ) >> 3] / (+d))), (+(+HEAPF64[(ptr + (8|0) ) >> 3] / (+d))), (+(+HEAPF64[(ptr + (16|0) ) >> 3] / (+d))))|0;
    }
    
    
    function Vector3_negate(ptr) {
        ptr = ptr|0;
        return Vector3_new((-+HEAPF64[(ptr ) >> 3]), (-+HEAPF64[(ptr + (8|0) ) >> 3]), (-+HEAPF64[(ptr + (16|0) ) >> 3]))|0;
    }
    
    
    function Vector3_abs(ptr) {
        ptr = ptr|0;
        return Vector3_new((+Math_abs(+HEAPF64[(ptr ) >> 3])), (+Math_abs(+HEAPF64[(ptr + (8|0) ) >> 3])), (+Math_abs(+HEAPF64[(ptr + (16|0) ) >> 3])))|0;
    }
    
    
    function Vector3_add(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return Vector3_new((+(+HEAPF64[(ptr ) >> 3] + +HEAPF64[(b ) >> 3])), (+(+HEAPF64[(ptr + (8|0) ) >> 3] + +HEAPF64[(b + (8|0) ) >> 3])), (+(+HEAPF64[(ptr + (16|0) ) >> 3] + +HEAPF64[(b + (16|0) ) >> 3])))|0;
    }
    
    
    function Vector3_sub(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return Vector3_new((+(+HEAPF64[(ptr ) >> 3] - +HEAPF64[(b ) >> 3])), (+(+HEAPF64[(ptr + (8|0) ) >> 3] - +HEAPF64[(b + (8|0) ) >> 3])), (+(+HEAPF64[(ptr + (16|0) ) >> 3] - +HEAPF64[(b + (16|0) ) >> 3])))|0;
    }
    
    
    function Vector3_mul(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return Vector3_new(+HEAPF64[(ptr ) >> 3] * +HEAPF64[(b ) >> 3], +HEAPF64[(ptr + (8|0) ) >> 3] * +HEAPF64[(b + (8|0) ) >> 3], +HEAPF64[(ptr + (16|0) ) >> 3] * +HEAPF64[(b + (16|0) ) >> 3])|0;
    }
    
    
    function Vector3_div(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return Vector3_new((+(+HEAPF64[(ptr ) >> 3] / +HEAPF64[(b ) >> 3])), (+(+HEAPF64[(ptr + (8|0) ) >> 3] / +HEAPF64[(b + (8|0) ) >> 3])), (+(+HEAPF64[(ptr + (16|0) ) >> 3] / +HEAPF64[(b + (16|0) ) >> 3])))|0;
    }
    
    
    function Vector3_mod(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return Vector3_new((+(+HEAPF64[(ptr ) >> 3] - +(+HEAPF64[(b ) >> 3] * (+Math_floor(+(+HEAPF64[(ptr ) >> 3] / +HEAPF64[(b ) >> 3])))))), (+(+HEAPF64[(ptr + (8|0) ) >> 3] - +(+HEAPF64[(b + (8|0) ) >> 3] * (+Math_floor(+(+HEAPF64[(ptr + (8|0) ) >> 3] / +HEAPF64[(b + (8|0) ) >> 3])))))), (+(+HEAPF64[(ptr + (16|0) ) >> 3] - +(+HEAPF64[(b + (16|0) ) >> 3] * (+Math_floor(+(+HEAPF64[(ptr + (16|0) ) >> 3] / +HEAPF64[(b + (16|0) ) >> 3])))))))|0;
    }
    
    
    function Vector3_addScalar(ptr, f) {
        ptr = ptr|0;
        f = +f;
        return Vector3_new((+(+HEAPF64[(ptr ) >> 3] + (+f))), (+(+HEAPF64[(ptr + (8|0) ) >> 3] + (+f))), (+(+HEAPF64[(ptr + (16|0) ) >> 3] + (+f))))|0;
    }
    
    
    function Vector3_subScalar(ptr, f) {
        ptr = ptr|0;
        f = +f;
        return Vector3_new((+(+HEAPF64[(ptr ) >> 3] - (+f))), (+(+HEAPF64[(ptr + (8|0) ) >> 3] - (+f))), (+(+HEAPF64[(ptr + (16|0) ) >> 3] - (+f))))|0;
    }
    
    
    function Vector3_mulScalar(ptr, f) {
        ptr = ptr|0;
        f = +f;
        return Vector3_new(+HEAPF64[(ptr ) >> 3] * f, +HEAPF64[(ptr + (8|0) ) >> 3] * f, +HEAPF64[(ptr + (16|0) ) >> 3] * f)|0;
    }
    
    
    function Vector3_divScalar(ptr, f) {
        ptr = ptr|0;
        f = +f;
        return Vector3_new((+(+HEAPF64[(ptr ) >> 3] / (+f))), (+(+HEAPF64[(ptr + (8|0) ) >> 3] / (+f))), (+(+HEAPF64[(ptr + (16|0) ) >> 3] / (+f))))|0;
    }
    
    
    function Vector3_min(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return Vector3_new((+Math_min(+HEAPF64[(ptr ) >> 3], +HEAPF64[(b ) >> 3])), (+Math_min(+HEAPF64[(ptr + (8|0) ) >> 3], +HEAPF64[(b + (8|0) ) >> 3])), (+Math_min(+HEAPF64[(ptr + (16|0) ) >> 3], +HEAPF64[(b + (16|0) ) >> 3])))|0;
    }
    
    
    function Vector3_max(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return Vector3_new((+Math_max(+HEAPF64[(ptr ) >> 3], +HEAPF64[(b ) >> 3])), (+Math_max(+HEAPF64[(ptr + (8|0) ) >> 3], +HEAPF64[(b + (8|0) ) >> 3])), (+Math_max(+HEAPF64[(ptr + (16|0) ) >> 3], +HEAPF64[(b + (16|0) ) >> 3])))|0;
    }
    
    
    function Vector3_minAxis(ptr, a) {
        ptr = ptr|0;
        a = a|0;
        var x = 0.0;
        var y = 0.0;
        var z = 0.0;
        x = (+Math_abs(+HEAPF64[(ptr ) >> 3]));
        y = (+Math_abs(+HEAPF64[(ptr + (8|0) ) >> 3]));
        z = (+Math_abs(+HEAPF64[(ptr + (16|0) ) >> 3]));
        
        if ((((((+x) <= (+y))|0)|0 & (((+x) <= (+z))|0)|0)|0)) {
            return Vector3_new((1.0), (0.0), (0.0))|0;
        }
        
        else if ((((((+y) <= (+x))|0)|0 & (((+y) <= (+z))|0)|0)|0)) {
            return Vector3_new((0.0), (1.0), (0.0))|0;
        }
        return Vector3_new((0.0), (0.0), (1.0))|0;
    }
    
    
    function Vector3_minComponent(ptr, a) {
        ptr = ptr|0;
        a = a|0;
        return (+Math_min((+Math_min(+HEAPF64[(ptr ) >> 3], +HEAPF64[(ptr + (8|0) ) >> 3])), +HEAPF64[(ptr + (16|0) ) >> 3]));
    }
    
    
    function Vector3_maxComponent(ptr, a) {
        ptr = ptr|0;
        a = a|0;
        return (+Math_max((+Math_max(+HEAPF64[(ptr ) >> 3], +HEAPF64[(ptr + (8|0) ) >> 3])), +HEAPF64[(ptr + (16|0) ) >> 3]));
    }
    
    
    function Vector3_reflect(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        var tmp1 = 0;
        var tmp2 = 0;
        tmp1 = (Vector3_mulScalar(ptr , +(fround(2)) * (+Vector3_dot(ptr , (b|0))))|0);
        tmp2 = (Vector3_sub(b , (tmp1|0))|0);
        free((tmp1)|0);
        return (tmp2)|0;
    }
    
    
    function Vector3_refract(ptr, b, n1, n2) {
        ptr = ptr|0;
        b = b|0;
        n1 = +n1;
        n2 = +n2;
        var nr = 0.0;
        var cosI = 0.0;
        var sinT2 = 0.0;
        var cosT = 0.0;
        var tmp1 = 0;
        var tmp2 = 0;
        var tmp3 = 0;
        nr = +((+n1) / (+n2));
        cosI = -(+Vector3_dot(ptr , (b|0)));
        sinT2 = +(nr * nr) * +((+(fround(1)) - +(cosI * cosI)));
        
        if (((+sinT2) > 1.0)|0) {
            return Vector3_new((0.0), (0.0), (0.0))|0;
        }
        
        cosT = (+Math_sqrt(+(+(1.0) - (+sinT2))));
        tmp1 = (Vector3_mulScalar(b , (+nr))|0);
        tmp2 = (Vector3_mulScalar(ptr , nr * +((cosI - cosT)))|0);
        tmp3 = (Vector3_add(tmp1 , (tmp2|0))|0);
        free((tmp1)|0);
        free((tmp2)|0);
        return (tmp3)|0;
    }
    
    
    function Vector3_reflectance(ptr, b, n1, n2) {
        ptr = ptr|0;
        b = b|0;
        n1 = +n1;
        n2 = +n2;
        var nr = 0.0;
        var cosI = 0.0;
        var sinT2 = 0.0;
        var cosT = 0.0;
        var rOrth = 0.0;
        var rPar = 0.0;
        nr = +((+n1) / (+n2));
        cosI = -(+Vector3_dot(ptr , (b|0)));
        sinT2 = +(nr * nr) * +((+(fround(1)) - +(cosI * cosI)));
        
        if (((+sinT2) > 1.0)|0) {
            return +(fround(1));
        }
        
        cosT = (+Math_sqrt(+(+(1.0) - (+sinT2))));
        rOrth = +(+((+(+(n1 * cosI) - +(n2 * cosT)))) / +((+(+(n1 * cosI) + +(n2 * cosT)))));
        rPar = +(+((+(+(n2 * cosI) - +(n1 * cosT)))) / +((+(+(n2 * cosI) + +(n1 * cosT)))));
        return +(+(+((+(+(rOrth * rOrth) + +(rPar * rPar)))) / 2.0));
    }
    
    
    function Vector3_pow(ptr, f) {
        ptr = ptr|0;
        f = +f;
        return Vector3_new((+Math_pow(+HEAPF64[(ptr ) >> 3], (+f))), (+Math_pow(+HEAPF64[(ptr + (8|0) ) >> 3], (+f))), (+Math_pow(+HEAPF64[(ptr + (16|0) ) >> 3], (+f))))|0;
    }
    
    
    function Vector3_isEqual(ptr, b) {
        ptr = ptr|0;
        b = b|0;
        return ((((+HEAPF64[(ptr ) >> 3] == +HEAPF64[(b ) >> 3])|0)|0 & ((+HEAPF64[(ptr + (8|0) ) >> 3] == +HEAPF64[(b + (8|0) ) >> 3])|0)|0)|0 & ((+HEAPF64[(ptr + (16|0) ) >> 3] == +HEAPF64[(b + (16|0) ) >> 3])|0)|0)|0;
    }
    
    
    function Vector3_isZero(ptr) {
        ptr = ptr|0;
        var r = 0;
        r = (((((+HEAPF64[(ptr ) >> 3] == 0.0)|0)|0 & ((+HEAPF64[(ptr + (8|0) ) >> 3] == 0.0)|0)|0)|0)|0 & ((+HEAPF64[(ptr + (16|0) ) >> 3] == 0.0)|0)|0)|0;
        return (r)|0;
    }
    
    
    function Vector3_set(ptr, x, y, z) {
        ptr = ptr|0;
        x = +x;
        y = +y;
        z = +z;
        HEAPF64[(ptr ) >> 3] = (+x);
        HEAPF64[(ptr + (8|0)) >> 3] = (+y);
        HEAPF64[(ptr + (16|0)) >> 3] = (+z);
        return (ptr)|0;
    }
    
    
    function Vector3_setFromVector3(ptr, d) {
        ptr = ptr|0;
        d = d|0;
        HEAPF64[(ptr ) >> 3] = +HEAPF64[(d ) >> 3];
        HEAPF64[(ptr + (8|0)) >> 3] = +HEAPF64[(d + (8|0) ) >> 3];
        HEAPF64[(ptr + (16|0)) >> 3] = +HEAPF64[(d + (16|0) ) >> 3];
        return (ptr)|0;
    }
    
    
    function Vector3_copy(ptr, src) {
        ptr = ptr|0;
        src = src|0;
        return (Vector3_set(ptr , +HEAPF64[(src ) >> 3], +HEAPF64[(src + (8|0) ) >> 3], +HEAPF64[(src + (16|0) ) >> 3])|0);
    }
    
    
    function Vector3_clone(ptr) {
        ptr = ptr|0;
        return Vector3_new(+HEAPF64[(ptr ) >> 3], +HEAPF64[(ptr + (8|0) ) >> 3], +HEAPF64[(ptr + (16|0) ) >> 3])|0;
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
       getChunkSize:getChunkSize,
       Vector3_new:Vector3_new,
       Vector3_length:Vector3_length,
       Vector3_lengthN:Vector3_lengthN,
       Vector3_dot:Vector3_dot,
       Vector3_cross:Vector3_cross,
       Vector3_normalize:Vector3_normalize,
       Vector3_negate:Vector3_negate,
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
       Vector3_isEqual:Vector3_isEqual,
       Vector3_isZero:Vector3_isZero,
       Vector3_set:Vector3_set,
       Vector3_setFromVector3:Vector3_setFromVector3,
       Vector3_copy:Vector3_copy,
       Vector3_clone:Vector3_clone
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
