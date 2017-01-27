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