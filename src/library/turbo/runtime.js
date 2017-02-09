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

// var PREV_INUSE = 0x1;
// var PREV_INUSE = 0x1;
// var IS_MMAPPED = 0x2;
// var NON_MAIN_ARENA = 0x4;
// var SIZE_BITS = 0x7;//(PREV_INUSE|IS_MMAPPED|NON_MAIN_ARENA) | 0;
// var firstFreeChunk = 0;
// var lastFreeChunk = 0;
// var numFreeChunks = 0;
// var freeMemory = 0;
//var internal_alloc = 0;

// var _now = (typeof global.performance != 'undefined' && typeof global.performance.now == 'function' ?
//     global.performance.now.bind(global.performance) :
//     global.Date.now.bind(global.Date));
// var _now = global.performance;
// Map of class type IDs to type objects.
// var _idToType = 8;

// function init() {
//     HEAP32[2 >> 2] = buffer.byteLength | 0;

    // if (global.isShared) {
    //     internal_alloc = alloc_sab;
    //     global.Atomics.store(HEAP32, 1 | 0, 16 | 0);
    // }
    // else {
    //     internal_alloc = alloc_ab;
    //     HEAP32[1>>2] = 16 | 0;
    // }
// }


// function malloc(nbytes, alignment) {
//     nbytes |= 0;
//     alignment |= 0;
//     var ptr = alloc_sab(nbytes, alignment);
//     if (ptr == 0)
//         throw new Error("Out of memory");
//     return ptr|0;
// }
// function free(ptr) {
//     ptr |= 0;
//     clearInuse(ptr);
//     if (firstFreeChunk == 0) {
//         firstFreeChunk = ptr;
//     }
//
//     freeMemory = freeMemory + getChunkSize(ptr);
//
//     var chunkptr = ptr + 4;
//     if (lastFreeChunk > 0) {
//         HEAPU32[chunkptr>>2] = lastFreeChunk;//backward pointer to prev chunk
//         HEAPU32[lastFreeChunk>>2] = ptr;//forward pointer to next chunk of prev chunk
//     } else {
//         HEAPU32[chunkptr>>2] = 0;//no backward pointer, this is the first free chunk
//     }
//
//     HEAPU32[ptr>>2] = 0;//no forward pointer
//
//     lastFreeChunk = ptr;
//     numFreeChunks = numFreeChunks + 1;
// }
// function identify(ptr) {
//     if (ptr == 0)
//         return 0;
//     return _idToType[HEAP32[ptr >> 2]];
// }
// function _badType(self) {
//     var t = identify(self);
//     return new global.Error("Observed type: " + (t ? t.NAME : "*invalid*") + ", address=" + self);
// }
// Synchronic layout is 8 bytes (2 x int32) of metadata followed by
// the type-specific payload.  The two int32 words are the number
// of waiters and the wait word (generation count).
//
// In the following:
//
// self is the base address for the Synchronic.
// mem is the array to use for the value
// idx is the index in mem of the value: (ptr+8)>>log2(mem.BYTES_PER_ELEMENT)
//
// _synchronicLoad is just Atomics.load, expand it in-line.
/*function _synchronicStore(self, mem, idx, value) {
    global.Atomics.store(mem, idx, value);
    _notify(self);
    return value;
}
function _synchronicCompareExchange(self, mem, idx, oldval, newval) {
    var v = global.Atomics.compareExchange(mem, idx, oldval, newval);
    if (v == oldval)
        _notify(self);
    return v;
}
function _synchronicAdd(self, mem, idx, value) {
    var v = global.Atomics.add(mem, idx, value);
    _notify(self);
    return v;
}
function _synchronicSub(self, mem, idx, value) {
    var v = global.Atomics.sub(mem, idx, value);
    _notify(self);
    return v;
}
function _synchronicAnd(self, mem, idx, value) {
    var v = global.Atomics.and(mem, idx, value);
    _notify(self);
    return v;
}
function _synchronicOr(self, mem, idx, value) {
    var v = global.Atomics.or(mem, idx, value);
    _notify(self);
    return v;
}
function _synchronicXor(self, mem, idx, value) {
    var v = global.Atomics.xor(mem, idx, value);
    _notify(self);
    return v;
}
function _synchronicLoadWhenNotEqual(self, mem, idx, value) {
    for (; ;) {
        var tag = global.Atomics.load(HEAP32, (self + 4) >> 2);
        var v = global.Atomics.load(mem, idx);
        if (v !== value)
            break;
        _waitForUpdate(self, tag, Number.POSITIVE_INFINITY);
    }
    return v;
}

function _synchronicLoadWhenEqual(self, mem, idx, value) {
    for (; ;) {
        var tag = global.Atomics.load(HEAP32, (self + 4) >> 2);
        var v = global.Atomics.load(mem, idx);
        if (v === value)
            break;
        _waitForUpdate(self, tag, Number.POSITIVE_INFINITY);
    }
    return v;
}
function _synchronicExpectUpdate(self, mem, idx, value, timeout) {
    var now = global.performance();
    var limit = now + timeout;
    for (; ;) {
        var tag = global.Atomics.load(HEAP32, (self + 4) >> 2);
        var v = global.Atomics.load(mem, idx);
        if (v !== value || now >= limit)
            break;
        _waitForUpdate(self, tag, limit - now);
        now = global.performance();
    }
}
function _waitForUpdate(self, tag, timeout) {
    // Spin for a int16 time before going into the futexWait.
    //
    // Hard to know what a good count should be - it is machine
    // dependent, for sure, and "typical" applications should
    // influence the choice.  If the count is high without
    // hindering an eventual drop into futexWait then it will just
    // decrease performance.  If the count is low it is pointless.
    // (This is why Synchronic really wants a native implementation.)
    //
    // Data points from a 2.6GHz i7 MacBook Pro:
    //
    // - the simple send-integer benchmark (test-sendint.html),
    //   which is the very simplest case we can really imagine,
    //   gets noisy timings with an iteration count below 4000
    //
    // - the simple send-object benchmark (test-sendmsg.html)
    //   gets a boost when the count is at least 10000
    //
    // 10000 is perhaps 5us (CPI=1, naive) and seems like a
    // reasonable cutoff, for now - but note, it is reasonable FOR
    // THIS SYSTEM ONLY, which is a big flaw.
    //
    // The better fix might well be to add some kind of spin/nanosleep
    // functionality to futexWait, see https://bugzil.la/1134973.
    // That functionality can be platform-dependent and even
    // adaptive, with JIT support.
    var i = 10000;
    do {
        // May want this to be a relaxed load, though on x86 it won't matter.
        if (global.Atomics.load(HEAP32, (self + 4) >> 2) != tag)
            return;
    } while (--i > 0);
    global.Atomics.add(HEAP32, self >> 2, 1);
    global.Atomics.wait(HEAP32, (self + 4) >> 2, tag, timeout);
    global.Atomics.sub(HEAP32, self >> 2, 1);
}
function _notify(self) {
    global.Atomics.add(HEAP32, (self + 4) >> 2, 1);
    // Would it be appropriate & better to wake n waiters, where n
    // is the number loaded in the load()?  I almost think so,
    // since our futexes are fair.
    if (global.Atomics.load(HEAP32, self >> 2) > 0)
        global.Atomics.wake(HEAP32, (self + 4) >> 2, Number.POSITIVE_INFINITY);
}*/

// function getFreeChunk(nbytes) {
//     nbytes = nbytes | 0;
//     if (numFreeChunks > (0 | 0)) {
//         var freeChunk = findChunk(nbytes);
//         if (freeChunk > (0 | 0)) {
//             if (freeChunk == firstFreeChunk) {
//                 firstFreeChunk = nextFree(freeChunk);
//             }
//             if (freeChunk == lastFreeChunk) {
//                 lastFreeChunk = (0 | 0);
//             }
//             numFreeChunks = numFreeChunks - (1 | 0);
//             setInuse(freeChunk);
//             freeMemory = freeMemory - getChunkSize(freeChunk);
//             return freeChunk;
//         }
//     }
//     return 0 | 0;
// }
// function findChunk(nbytes) {
//     nbytes = nbytes | 0;
//     var chunk = firstFreeChunk;
//     while (chunk != 0) {
//         if (getChunkSize(chunk) == nbytes) {
//             return chunk;
//         }
//         chunk = HEAPU32[chunk>>2];
//     }
//     return 0;
// }
// function prevFree(ptr) {
//     return HEAPU32[(ptr + 4)>>2];
// }
// function nextFree(ptr) {
//     return HEAPU32[ptr>>2];
// }
// /* Set size at head, without disturbing its use bit */
// function setHeadSize(ptr, s) {
//     HEAPU32[ptr>>2] = (HEAPU32[ptr>>2] & SIZE_BITS) | s;
// }
//
// /* Set size/use field */
// function setHead(ptr, s) {
//     HEAPU32[ptr>>2] = s;
// }
//
// /* Set size at footer (only when chunk is not in use) */
// function setFoot(ptr, s) {
//     HEAPU32[(ptr + s)>>2] = s;
// }
//
// function getPrevInuse(ptr) {
//     return HEAPU32[(ptr - 8)>>2] & (PREV_INUSE);
// }
// function setInuse(ptr) {
//     HEAPU32[(ptr - 4)>>2] |= PREV_INUSE;
// }
// function getInuse(ptr) {
//     return HEAPU32[(ptr - 4)>>2] & PREV_INUSE;
// }
// function clearInuse(ptr) {
//     HEAPU32[(ptr - 4)>>2] &= ~PREV_INUSE;
// }
// function getChunkSize(ptr) {
//     return HEAPU32[(ptr - 4)>>2] & ~(PREV_INUSE);
// }
//
// function alloc_sab(nbytes, alignment) {
//     nbytes = nbytes | 0;
//     alignment = alignment | 0;
//     if (numFreeChunks > 0) {
//         var chunk = getFreeChunk(nbytes);
//         if (chunk > (0 | 0)) {
//             return chunk;
//         }
//     }
//
//     do {
//         var ptr = global.Atomics.load(HEAP32, 1);
//         var q = (ptr + (alignment - 1)) & ~(alignment - 1);
//         var top = q + nbytes;
//         if (top >= HEAP32[2>>2])
//             return 0;
//     } while (global.Atomics.compareExchange(HEAP32, 1, ptr, top) != ptr);
//
//     return q;
// }
// function alloc_ab(nbytes, alignment) {
//     nbytes = nbytes | 0;
//     alignment = alignment | 0;
//
//     var ptr = HEAP32[1>>2] | 0;
//     ptr = ((ptr + (alignment - 1)) & ~(alignment - 1)) | 0;
//     var top = (ptr + nbytes) | 0;
//     if (top >= HEAP32[2>>2])
//         return 0 | 0;
//     HEAP32[1>>2] = top | 0;
//     return ptr | 0;
// }