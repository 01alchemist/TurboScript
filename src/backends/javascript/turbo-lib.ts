/**
 * Created by Nidin Vinayakan on 6/13/2016.
 *
 */
declare var SharedArrayBuffer:any;
declare var Atomics:any;

var WORKER_ENV = false;
if (typeof importScripts === 'function') {
    WORKER_ENV = true;
}
function MemoryError(msg) {
    this.message = msg;
}
MemoryError.prototype = new Error("Memory Error");
var RuntimeConstructor = (function () {
    function RuntimeConstructor() {
        this.NULL = 0;
        this.int8 = { SIZE: 1, ALIGN: 1, NAME: "int8" };
        this.uint8 = { SIZE: 1, ALIGN: 1, NAME: "uint8" };
        this.int16 = { SIZE: 2, ALIGN: 2, NAME: "int16" };
        this.uint16 = { SIZE: 2, ALIGN: 2, NAME: "uint16" };
        this.int32 = { SIZE: 4, ALIGN: 4, NAME: "int32" };
        this.uint32 = { SIZE: 4, ALIGN: 4, NAME: "uint32" };
        this.float32 = { SIZE: 4, ALIGN: 4, NAME: "float32" };
        this.float64 = { SIZE: 8, ALIGN: 8, NAME: "float64" };
        this.int32x4 = { SIZE: 16, ALIGN: 16, NAME: "int32x4" };
        this.float32x4 = { SIZE: 16, ALIGN: 16, NAME: "float32x4" };
        this.float64x2 = { SIZE: 16, ALIGN: 16, NAME: "float64x2" };
        this._mem_i8 = null;
        this._mem_u8 = null;
        this._mem_i16 = null;
        this._mem_u16 = null;
        this._mem_i32 = null;
        this._mem_u32 = null;
        this._mem_f32 = null;
        this._mem_f64 = null;
        this.freeList = [];
        this.totalFreeMemory = 0;
        this._now = (typeof 'performance' != 'undefined' && typeof performance.now == 'function' ?
            performance.now.bind(performance) :
            Date.now.bind(Date));
        // Map of class type IDs to type objects.
        this._idToType = {};
    }
    RuntimeConstructor.prototype.init = function (buffer, start, limit, initialize) {
        if (arguments.length < 3) {
            throw new Error("Required argumentVariables: buffer, start, limit");
        }
        if ((start | 0) != start || (limit | 0) != limit) {
            throw new Error("Invalid bounds: " + start + " " + limit);
        }
        start = (start + 7) & ~7;
        limit = (limit & ~7);
        if (start < 0 || limit <= start || limit > buffer.byteLength) {
            throw new Error("Invalid bounds: " + start + " " + limit);
        }
        var len = (limit - start);
        if (len < 16) {
            throw new Error("The memory is too small even for metadata");
        }
        this.RAW_MEMORY = buffer;
        if (buffer instanceof ArrayBuffer) {
            this.internal_alloc = alloc_ab;
        }
        else if (buffer instanceof SharedArrayBuffer) {
            this.internal_alloc = alloc_sab;
        }
        else {
            throw new Error("Turbo can be initialized only on SharedArrayBuffer or ArrayBuffer");
        }
        this._mem_i8 = new Int8Array(buffer, start, len);
        this._mem_u8 = new Uint8Array(buffer, start, len);
        this._mem_i16 = new Int16Array(buffer, start, len / 2);
        this._mem_u16 = new Uint16Array(buffer, start, len / 2);
        this._mem_i32 = new Int32Array(buffer, start, len / 4);
        this._mem_u32 = new Uint32Array(buffer, start, len / 4);
        this._mem_f32 = new Float32Array(buffer, start, len / 4);
        this._mem_f64 = new Float64Array(buffer, start, len / 8);
        if (initialize) {
            this._mem_i32[2] = len;
            if (buffer instanceof ArrayBuffer) {
                this._mem_i32[1] = 16;
            }
            else if (buffer instanceof SharedArrayBuffer) {
                Atomics.store(this._mem_i32, 1, 16);
            }
        }
    };

    RuntimeConstructor.prototype.internal_alloc = function (nbytes, alignment) {
        // Overridden during initialization.
        throw new Error("Not initialized");
    };

    RuntimeConstructor.prototype.alloc = function (nbytes, alignment) {
        var p = this.internal_alloc(nbytes, alignment);
        if (p == 0)
            throw new MemoryError("Out of memory");
        return p;
    };

    RuntimeConstructor.prototype.free = function (p) {
        var type = this._idToType[this._mem_i32[p >> 2]];
        this.totalFreeMemory += type.SIZE;
        this.freeList.push({ ptr: p, size: type.SIZE });
    };

    RuntimeConstructor.prototype.identify = function (p) {
        if (p == 0)
            return null;
        if (this._idToType.hasOwnProperty(this._mem_i32[p >> 2]))
            return this._idToType[this._mem_i32[p >> 2]];
        return null;
    };

    RuntimeConstructor.prototype._badType = function (self) {
        var t = this.identify(self);
        return new Error("Observed type: " + (t ? t.NAME : "*invalid*") + ", address=" + self);
    };

    RuntimeConstructor.prototype._synchronicStore = function (self, mem, idx, value) {
        Atomics.store(mem, idx, value);
        this._notify(self);
        return value;
    };

    RuntimeConstructor.prototype._synchronicCompareExchange = function (self, mem, idx, oldval, newval) {
        var v = Atomics.compareExchange(mem, idx, oldval, newval);
        if (v == oldval)
            this._notify(self);
        return v;
    };

    RuntimeConstructor.prototype._synchronicAdd = function (self, mem, idx, value) {
        var v = Atomics.add(mem, idx, value);
        this._notify(self);
        return v;
    };
    RuntimeConstructor.prototype._synchronicSub = function (self, mem, idx, value) {
        var v = Atomics.sub(mem, idx, value);
        this._notify(self);
        return v;
    };

    RuntimeConstructor.prototype._synchronicAnd = function (self, mem, idx, value) {
        var v = Atomics.and(mem, idx, value);
        this._notify(self);
        return v;
    };

    RuntimeConstructor.prototype._synchronicOr = function (self, mem, idx, value) {
        var v = Atomics.or(mem, idx, value);
        this._notify(self);
        return v;
    };

    RuntimeConstructor.prototype._synchronicXor = function (self, mem, idx, value) {
        var v = Atomics.xor(mem, idx, value);
        this._notify(self);
        return v;
    };

    RuntimeConstructor.prototype._synchronicLoadWhenNotEqual = function (self, mem, idx, value) {
        for (;;) {
            var tag = Atomics.load(this._mem_i32, (self + 4) >> 2);
            var v = Atomics.load(mem, idx);
            if (v !== value)
                break;
            this._waitForUpdate(self, tag, Number.POSITIVE_INFINITY);
        }
        return v;
    };

    RuntimeConstructor.prototype._synchronicLoadWhenEqual = function (self, mem, idx, value) {
        for (;;) {
            var tag = Atomics.load(this._mem_i32, (self + 4) >> 2);
            var v = Atomics.load(mem, idx);
            if (v === value)
                break;
            this._waitForUpdate(self, tag, Number.POSITIVE_INFINITY);
        }
        return v;
    };

    RuntimeConstructor.prototype._synchronicExpectUpdate = function (self, mem, idx, value, timeout) {
        var now = this._now();
        var limit = now + timeout;
        for (;;) {
            var tag = Atomics.load(this._mem_i32, (self + 4) >> 2);
            var v = Atomics.load(mem, idx);
            if (v !== value || now >= limit)
                break;
            this._waitForUpdate(self, tag, limit - now);
            now = this._now();
        }
    };

    RuntimeConstructor.prototype._waitForUpdate = function (self, tag, timeout) {
        var i = 10000;
        do {
            // May want this to be a relaxed load, though on x86 it won't matter.
            if (Atomics.load(this._mem_i32, (self + 4) >> 2) != tag)
                return;
        } while (--i > 0);
        Atomics.add(this._mem_i32, self >> 2, 1);
        Atomics.wait(this._mem_i32, (self + 4) >> 2, tag, timeout);
        Atomics.sub(this._mem_i32, self >> 2, 1);
    };
    RuntimeConstructor.prototype._notify = function (self) {
        Atomics.add(this._mem_i32, (self + 4) >> 2, 1);
        if (Atomics.load(this._mem_i32, self >> 2) > 0)
            Atomics.wake(this._mem_i32, (self + 4) >> 2, Number.POSITIVE_INFINITY);
    };
    return RuntimeConstructor;
}());
var turbo = {
    Runtime: new RuntimeConstructor(),
    IsWorker: WORKER_ENV,
    init: function (MB) {
        var RAW_MEMORY = new SharedArrayBuffer(MB * 1024 * 1024);
        this.Runtime.init(RAW_MEMORY, 0, RAW_MEMORY.byteLength, true);
    },
    getMemoryUsage: function () {
        var top = Atomics.load(this.Runtime._mem_i32, 1);
        top -= this.Runtime.totalFreeMemory;
        var usage = top / (1024 * 1024);
        var mb = Math.round(usage);
        return (mb == 0 ? usage : mb) + "MB";
    }
};
this["turbo"] = turbo;
this["unsafe"] = turbo.Runtime;

function alloc_sab(nbytes, alignment) {
    var _this = this;
    if (this.totalFreeMemory > nbytes) {
        this.freeList.forEach(function (freeMem, index) {
            if (freeMem.size == nbytes) {
                _this.freeList.splice(index, 1);
                return freeMem.ptr;
            }
        });
    }
    do {
        var p = Atomics.load(this._mem_i32, 1);
        var q = (p + (alignment - 1)) & ~(alignment - 1);
        var top = q + nbytes;
        if (top >= this._mem_i32[2])
            return 0;
    } while (Atomics.compareExchange(this._mem_i32, 1, p, top) != p);
    return q;
}
function alloc_ab(nbytes, alignment) {
    var p = this._mem_i32[1];
    p = (p + (alignment - 1)) & ~(alignment - 1);
    var top = p + nbytes;
    if (top >= this._mem_i32[2])
        return 0;
    this._mem_i32[1] = top;
    return p;
}