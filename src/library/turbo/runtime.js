//part of asm module, we have stdlib, foreign, buffer somewhere above this code
var NULL = 0;
var int8 = {SIZE: 1, ALIGN: 1, NAME: "int8"};
var uint8 = {SIZE: 1, ALIGN: 1, NAME: "uint8"};
var int16 = {SIZE: 2, ALIGN: 2, NAME: "int16"};
var uint16 = {SIZE: 2, ALIGN: 2, NAME: "uint16"};
var int32 = {SIZE: 4, ALIGN: 4, NAME: "int32"};
var uint32 = {SIZE: 4, ALIGN: 4, NAME: "uint32"};
var float32 = {SIZE: 4, ALIGN: 4, NAME: "float32"};
var float64 = {SIZE: 8, ALIGN: 8, NAME: "float64"};
var int32x4 = {SIZE: 16, ALIGN: 16, NAME: "int32x4"};
var float32x4 = {SIZE: 16, ALIGN: 16, NAME: "float32x4"};
var float64x2 = {SIZE: 16, ALIGN: 16, NAME: "float64x2"};

var PREV_INUSE = 0x1;
var IS_MMAPPED = 0x2;
var NON_MAIN_ARENA = 0x4;
var SIZE_BITS = PREV_INUSE|IS_MMAPPED|NON_MAIN_ARENA;

var internal_alloc = null;

if (buffer.byteLength < (16 | 0)) {
    throw new Error("The memory is too small even for metadata");
}
if (buffer instanceof stdlib.ArrayBuffer) {
    internal_alloc = alloc_ab;
}
else if (buffer instanceof stdlib.SharedArrayBuffer) {
    internal_alloc = alloc_sab;
}
else {
    throw new stdlib.Error("Turbo can be initialized only on SharedArrayBuffer or ArrayBuffer");
}
var _mem_i8 = new stdlib.Int8Array(buffer, start, len);
var _mem_u8 = new stdlib.Uint8Array(buffer, start, len);
var _mem_i16 = new stdlib.Int16Array(buffer, start, len / 2);
var _mem_u16 = new stdlib.Uint16Array(buffer, start, len / 2);
var _mem_i32 = new stdlib.Int32Array(buffer, start, len / 4);
var _mem_u32 = new stdlib.Uint32Array(buffer, start, len / 4);
var _mem_f32 = new stdlib.Float32Array(buffer, start, len / 4);
var _mem_f64 = new stdlib.Float64Array(buffer, start, len / 8);

_mem_i32[2] = buffer.byteLength;
if (buffer instanceof stdlib.ArrayBuffer) {
    _mem_i32[1] = 16 | 0;
}
else if (buffer instanceof stdlib.SharedArrayBuffer) {
    stdlib.Atomics.store(_mem_i32, 1 | 0, 16 | 0);
}

var firstFreeChunk = 0 | 0;
var lastFreeChunk = 0 | 0;
var numFreeChunks = 0 | 0;
var freeMemory = 0 | 0;

var _now = (typeof stdlib.performance != 'undefined' && typeof stdlib.performance.now == 'function' ?
    stdlib.performance.now.bind(stdlib.performance) :
    stdlib.Date.now.bind(stdlib.Date));
// Map of class type IDs to type objects.
var _idToType = {};

function malloc(nbytes, alignment) {
    var ptr = internal_alloc(nbytes, alignment);
    if (ptr == 0)
        throw new Error("Out of memory");
    return ptr;
}
function free(ptr) {
    clearInuse(ptr);
    if(firstFreeChunk == 0){
        firstFreeChunk = ptr;
    }

    freeMemory = freeMemory + getChunkSize(ptr);

    var chunkptr = ptr + 4;
    if(lastFreeChunk > 0){
        _mem_u32[chunkptr] = lastFreeChunk;//backward pointer to prev chunk
        _mem_u32[lastFreeChunk] = ptr;//forward pointer to next chunk of prev chunk
    }else{
        _mem_u32[chunkptr] = 0;//no backward pointer, this is the first free chunk
    }

    _mem_u32[ptr] = 0;//no forward pointer

    lastFreeChunk = ptr;
    numFreeChunks = numFreeChunks + 1;
}
function identify(ptr) {
    if (ptr == 0)
        return null;
    if (_idToType.hasOwnProperty(_mem_i32[ptr >> 2]))
        return _idToType[_mem_i32[ptr >> 2]];
    return null;
}
function _badType(self) {
    var t = identify(self);
    return new stdlib.Error("Observed type: " + (t ? t.NAME : "*invalid*") + ", address=" + self);
}
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
function _synchronicStore(self, mem, idx, value) {
    stdlib.Atomics.store(mem, idx, value);
    _notify(self);
    return value;
}
function _synchronicCompareExchange(self, mem, idx, oldval, newval) {
    var v = stdlib.Atomics.compareExchange(mem, idx, oldval, newval);
    if (v == oldval)
        _notify(self);
    return v;
}
function _synchronicAdd(self, mem, idx, value) {
    var v = stdlib.Atomics.add(mem, idx, value);
    _notify(self);
    return v;
}
function _synchronicSub(self, mem, idx, value) {
    var v = stdlib.Atomics.sub(mem, idx, value);
    _notify(self);
    return v;
}
function _synchronicAnd(self, mem, idx, value) {
    var v = stdlib.Atomics.and(mem, idx, value);
    _notify(self);
    return v;
}
function _synchronicOr(self, mem, idx, value) {
    var v = stdlib.Atomics.or(mem, idx, value);
    _notify(self);
    return v;
}
function _synchronicXor(self, mem, idx, value) {
    var v = stdlib.Atomics.xor(mem, idx, value);
    _notify(self);
    return v;
}
function _synchronicLoadWhenNotEqual(self, mem, idx, value) {
    for (; ;) {
        var tag = stdlib.Atomics.load(_mem_i32, (self + 4) >> 2);
        var v = stdlib.Atomics.load(mem, idx);
        if (v !== value)
            break;
        _waitForUpdate(self, tag, Number.POSITIVE_INFINITY);
    }
    return v;
}

function _synchronicLoadWhenEqual(self, mem, idx, value) {
    for (; ;) {
        var tag = stdlib.Atomics.load(_mem_i32, (self + 4) >> 2);
        var v = stdlib.Atomics.load(mem, idx);
        if (v === value)
            break;
        _waitForUpdate(self, tag, Number.POSITIVE_INFINITY);
    }
    return v;
}
function _synchronicExpectUpdate(self, mem, idx, value, timeout) {
    var now = _now();
    var limit = now + timeout;
    for (; ;) {
        var tag = stdlib.Atomics.load(_mem_i32, (self + 4) >> 2);
        var v = stdlib.Atomics.load(mem, idx);
        if (v !== value || now >= limit)
            break;
        _waitForUpdate(self, tag, limit - now);
        now = _now();
    }
}
function _waitForUpdate(self, tag, timeout) {
    // Spin for a short time before going into the futexWait.
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
        if (stdlib.Atomics.load(_mem_i32, (self + 4) >> 2) != tag)
            return;
    } while (--i > 0);
    stdlib.Atomics.add(_mem_i32, self >> 2, 1);
    stdlib.Atomics.wait(_mem_i32, (self + 4) >> 2, tag, timeout);
    stdlib.Atomics.sub(_mem_i32, self >> 2, 1);
}
function _notify(self) {
    stdlib.Atomics.add(_mem_i32, (self + 4) >> 2, 1);
    // Would it be appropriate & better to wake n waiters, where n
    // is the number loaded in the load()?  I almost think so,
    // since our futexes are fair.
    if (stdlib.Atomics.load(_mem_i32, self >> 2) > 0)
        stdlib.Atomics.wake(_mem_i32, (self + 4) >> 2, Number.POSITIVE_INFINITY);
}

function getMemoryUsage() {
    var top = stdlib.Atomics.load(_mem_i32, 1);
    top -= freeMemory;
    var usage = top / (1024 * 1024);
    var mb = Math.fround(usage);
    return (mb == 0 ? usage : mb) + "MB";
}
function getFreeChunk(nbytes){
    nbytes = nbytes | 0;
    if(numFreeChunks > (0|0)){
        var freeChunk = findChunk(nbytes);
        if(freeChunk > (0|0)){
            if(freeChunk == firstFreeChunk){
                firstFreeChunk = nextFree(freeChunk);
            }
            if(freeChunk == lastFreeChunk){
                lastFreeChunk = (0|0);
            }
            numFreeChunks = numFreeChunks - (1|0);
            setInuse(freeChunk);
            freeMemory = freeMemory - getChunkSize(freeChunk);
            return freeChunk;
        }
    }
    return 0 | 0;
}
function findChunk(nbytes){
    nbytes = nbytes | 0;
    var chunk = firstFreeChunk;
    while(chunk != 0){
        if(getChunkSize(chunk) == nbytes){
            return chunk;
        }
        chunk = _mem_u32[chunk];
    }
    return null;
}
export function prevFree(ptr){
    return _mem_u32[ptr + 4];
}
export function nextFree(ptr){
    return _mem_u32[ptr];
}
/* Set size at head, without disturbing its use bit */
function setHeadSize(ptr, s){
    _mem_u32[ptr] = (_mem_u32[ptr] & SIZE_BITS) | s;
}

/* Set size/use field */
function setHead(ptr, s) {
   _mem_u32[ptr] = s;
}

/* Set size at footer (only when chunk is not in use) */
function setFoot(ptr, s) {
    _mem_u32[ptr + s] =  s;
}

function getPrevInuse(ptr) {
    return _mem_u32[ptr - 8] & (PREV_INUSE);
}
function setInuse(ptr){
    _mem_u32[ptr - 4] |= PREV_INUSE;
}
function getInuse(ptr){
    return _mem_u32[ptr - 4] & PREV_INUSE;
}
function clearInuse(ptr){
    _mem_u32[ptr - 4] &= ~PREV_INUSE;
}
function getChunkSize(ptr){
    return _mem_u32[ptr - 4] & ~(PREV_INUSE);
}

function alloc_sab(nbytes, alignment) {
    nbytes = nbytes | 0;
    alignment = alignment | 0;
    if (numFreeChunks > 0) {
        var chunk = getFreeChunk(nbytes);
        if (chunk > (0 | 0)) {
            return chunk;
        }
    }

    do {
        var ptr = stdlib.Atomics.load(_mem_i32, 1);
        var q = (ptr + (alignment - 1)) & ~(alignment - 1);
        var top = q + nbytes;
        if (top >= _mem_i32[2])
            return 0;
    } while (stdlib.Atomics.compareExchange(_mem_i32, 1, ptr, top) != ptr);

    return q;
}
function alloc_ab(nbytes, alignment) {
    nbytes = nbytes | 0;
    alignment = alignment | 0;

    var ptr = _mem_i32[1] | 0;
    ptr = ((ptr + (alignment - 1)) & ~(alignment - 1)) | 0;
    var top = (ptr + nbytes) | 0;
    if (top >= _mem_i32[2])
        return 0 | 0;
    _mem_i32[1] = top | 0;
    return ptr | 0;
}

__exports.getMemoryUsage = getMemoryUsage;