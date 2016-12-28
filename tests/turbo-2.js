(function(__declare, __exports) {
    let Vec3 = {};
    Vec3.NAME = "Vec3";
    Vec3.SIZE = 28;
    Vec3.ALIGN = 4;
    Vec3.CLSID = 27991;
    unsafe._idToType[Vec3.CLSID] = Vec3;
    
    Vec3.new = function(x = 0, y = 0, z = 0) {
        let ptr = unsafe.alloc(Vec3.SIZE, Vec3.ALIGN);
        unsafe._mem_i32[ptr >> 2] = Vec3.CLSID;
        Vec3.init_mem(ptr, x, y, z);
        return ptr;
    };
    
    Vec3.init_mem = function(ptr, x, y, z) {
        unsafe._mem_f32[(ptr + 4) >> 2] = x;
        unsafe._mem_f32[(ptr + 8) >> 2] = y;
        unsafe._mem_f32[(ptr + 12) >> 2] = z;
        return ptr;
    };
    
    Vec3.toString = function(ptr) {
        let x = unsafe._mem_f32[(ptr + 4) >> 2];
        let y = unsafe._mem_f32[(ptr + 8) >> 2];
        let z = unsafe._mem_f32[(ptr + 12) >> 2];
        return `{ x:${x}, y:${y}, z:${z} }`;
    };
    
    Vec3.length = function(ptr) {
        return Math.sqrt(unsafe._mem_f32[(ptr + 4) >> 2] * unsafe._mem_f32[(ptr + 4) >> 2] + unsafe._mem_f32[(ptr + 8) >> 2] * unsafe._mem_f32[(ptr + 8) >> 2] + unsafe._mem_f32[(ptr + 12) >> 2] * unsafe._mem_f32[(ptr + 12) >> 2]);
    };
    
    Vec3.lengthN = function(a, n) {
        if (n === 2) {
            return Vec3.length(a);
        }
        
        Vec3.abs(a , a);
        return Math.pow(Math.pow(unsafe._mem_f32[(a + 4) >> 2], n) + Math.pow(unsafe._mem_f32[(a + 8) >> 2], n) + Math.pow(unsafe._mem_f32[(a + 12) >> 2], n), 1 / n);
    };
    
    Vec3.dot = function(ptr, b) {
        return unsafe._mem_f32[(ptr + 4) >> 2] * unsafe._mem_f32[(b + 4) >> 2] + unsafe._mem_f32[(ptr + 8) >> 2] * unsafe._mem_f32[(b + 8) >> 2] + unsafe._mem_f32[(ptr + 12) >> 2] * unsafe._mem_f32[(b + 12) >> 2];
    };
    
    Vec3.dot_vector3 = function(ptr, b) {
        return unsafe._mem_f32[(ptr + 4) >> 2] * unsafe._mem_f32[(b + 4) >> 2] + unsafe._mem_f32[(ptr + 8) >> 2] * unsafe._mem_f32[(b + 8) >> 2] + unsafe._mem_f32[(ptr + 12) >> 2] * unsafe._mem_f32[(b + 12) >> 2];
    };
    
    Vec3.cross = function(ptr, b) {
        let x = unsafe._mem_f32[(ptr + 8) >> 2] * unsafe._mem_f32[(b + 12) >> 2] - unsafe._mem_f32[(ptr + 12) >> 2] * unsafe._mem_f32[(b + 8) >> 2];
        let y = unsafe._mem_f32[(ptr + 12) >> 2] * unsafe._mem_f32[(b + 4) >> 2] - unsafe._mem_f32[(ptr + 4) >> 2] * unsafe._mem_f32[(b + 12) >> 2];
        let z = unsafe._mem_f32[(ptr + 4) >> 2] * unsafe._mem_f32[(b + 8) >> 2] - unsafe._mem_f32[(ptr + 8) >> 2] * unsafe._mem_f32[(b + 4) >> 2];
        return Vec3.new(x,y,z);
    };
    
    Vec3.normalize = function(ptr, c) {
        c = c !== 0 ? c : Vec3.new();
        let d = Vec3.length(ptr);
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] / d;
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] / d;
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] / d;
        return c;
    };
    
    Vec3.negate = function(ptr, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = -unsafe._mem_f32[(ptr + 4) >> 2];
        unsafe._mem_f32[(c + 8) >> 2] = -unsafe._mem_f32[(ptr + 8) >> 2];
        unsafe._mem_f32[(c + 12) >> 2] = -unsafe._mem_f32[(ptr + 12) >> 2];
        return c;
    };
    
    Vec3.abs = function(ptr, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = Math.abs(unsafe._mem_f32[(ptr + 4) >> 2]);
        unsafe._mem_f32[(c + 8) >> 2] = Math.abs(unsafe._mem_f32[(ptr + 8) >> 2]);
        unsafe._mem_f32[(c + 12) >> 2] = Math.abs(unsafe._mem_f32[(ptr + 12) >> 2]);
        return c;
    };
    
    Vec3.add = function(ptr, b, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] + unsafe._mem_f32[(b + 4) >> 2];
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] + unsafe._mem_f32[(b + 8) >> 2];
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] + unsafe._mem_f32[(b + 12) >> 2];
        return c;
    };
    
    Vec3.add_vector3 = function(ptr, b) {
        let c = Vector3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] + unsafe._mem_f32[(b + 4) >> 2];
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] + unsafe._mem_f32[(b + 8) >> 2];
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] + unsafe._mem_f32[(b + 12) >> 2];
        return c;
    };
    
    Vec3.addScalar = function(ptr, f, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] + f;
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] + f;
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] + f;
        return c;
    };
    
    Vec3.addScalar_vector3 = function(ptr, f) {
        let c = Vector3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] + f;
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] + f;
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] + f;
        return c;
    };
    
    Vec3.sub = function(ptr, b, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] - unsafe._mem_f32[(b + 4) >> 2];
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] - unsafe._mem_f32[(b + 8) >> 2];
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] - unsafe._mem_f32[(b + 12) >> 2];
        return c;
    };
    
    Vec3.sub_vector3 = function(ptr, b) {
        let c = Vector3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] - unsafe._mem_f32[(b + 4) >> 2];
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] - unsafe._mem_f32[(b + 8) >> 2];
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] - unsafe._mem_f32[(b + 12) >> 2];
        return c;
    };
    
    Vec3.subScalar = function(ptr, f, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] - f;
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] - f;
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] - f;
        return c;
    };
    
    Vec3.subScalar_vector3 = function(ptr, f) {
        let c = Vector3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] - f;
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] - f;
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] - f;
        return c;
    };
    
    Vec3.mul = function(ptr, b, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] * unsafe._mem_f32[(b + 4) >> 2];
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] * unsafe._mem_f32[(b + 8) >> 2];
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] * unsafe._mem_f32[(b + 12) >> 2];
        return c;
    };
    
    Vec3.mul_vector3 = function(ptr, b) {
        let c = Vector3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] * unsafe._mem_f32[(b + 4) >> 2];
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] * unsafe._mem_f32[(b + 8) >> 2];
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] * unsafe._mem_f32[(b + 12) >> 2];
        return c;
    };
    
    Vec3.mulScalar = function(ptr, f, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] * f;
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] * f;
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] * f;
        return c;
    };
    
    Vec3.mulScalar_vector3 = function(ptr, f) {
        let c = Vector3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] * f;
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] * f;
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] * f;
        return c;
    };
    
    Vec3.div = function(ptr, b, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] / unsafe._mem_f32[(b + 4) >> 2];
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] / unsafe._mem_f32[(b + 8) >> 2];
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] / unsafe._mem_f32[(b + 12) >> 2];
        return c;
    };
    
    Vec3.div_vector3 = function(ptr, b) {
        let c = Vector3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] / unsafe._mem_f32[(b + 4) >> 2];
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] / unsafe._mem_f32[(b + 8) >> 2];
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] / unsafe._mem_f32[(b + 12) >> 2];
        return c;
    };
    
    Vec3.divScalar = function(ptr, f, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] / f;
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] / f;
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] / f;
        return c;
    };
    
    Vec3.divScalar_vector3 = function(ptr, f) {
        let c = Vector3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] / f;
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] / f;
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] / f;
        return c;
    };
    
    Vec3.mod = function(ptr, b, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] - unsafe._mem_f32[(b + 4) >> 2] * Math.floor(unsafe._mem_f32[(ptr + 4) >> 2] / unsafe._mem_f32[(b + 4) >> 2]);
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] - unsafe._mem_f32[(b + 8) >> 2] * Math.floor(unsafe._mem_f32[(ptr + 8) >> 2] / unsafe._mem_f32[(b + 8) >> 2]);
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] - unsafe._mem_f32[(b + 12) >> 2] * Math.floor(unsafe._mem_f32[(ptr + 12) >> 2] / unsafe._mem_f32[(b + 12) >> 2]);
        return c;
    };
    
    Vec3.mod_vector3 = function(ptr, b) {
        let c = Vector3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2] - unsafe._mem_f32[(b + 4) >> 2] * Math.floor(unsafe._mem_f32[(ptr + 4) >> 2] / unsafe._mem_f32[(b + 4) >> 2]);
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2] - unsafe._mem_f32[(b + 8) >> 2] * Math.floor(unsafe._mem_f32[(ptr + 8) >> 2] / unsafe._mem_f32[(b + 8) >> 2]);
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2] - unsafe._mem_f32[(b + 12) >> 2] * Math.floor(unsafe._mem_f32[(ptr + 12) >> 2] / unsafe._mem_f32[(b + 12) >> 2]);
        return c;
    };
    
    Vec3.min = function(ptr, b, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = Math.min(unsafe._mem_f32[(ptr + 4) >> 2], unsafe._mem_f32[(b + 4) >> 2]);
        unsafe._mem_f32[(c + 8) >> 2] = Math.min(unsafe._mem_f32[(ptr + 8) >> 2], unsafe._mem_f32[(b + 8) >> 2]);
        unsafe._mem_f32[(c + 12) >> 2] = Math.min(unsafe._mem_f32[(ptr + 12) >> 2], unsafe._mem_f32[(b + 12) >> 2]);
        return c;
    };
    
    Vec3.max = function(ptr, b, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = Math.max(unsafe._mem_f32[(ptr + 4) >> 2], unsafe._mem_f32[(b + 4) >> 2]);
        unsafe._mem_f32[(c + 8) >> 2] = Math.max(unsafe._mem_f32[(ptr + 8) >> 2], unsafe._mem_f32[(b + 8) >> 2]);
        unsafe._mem_f32[(c + 12) >> 2] = Math.max(unsafe._mem_f32[(ptr + 12) >> 2], unsafe._mem_f32[(b + 12) >> 2]);
        return c;
    };
    
    Vec3.minAxis = function(ptr, c) {
        c = c !== 0 ? c : Vec3.new();
        let x = Math.abs(unsafe._mem_f32[(ptr + 4) >> 2]);
        let y = Math.abs(unsafe._mem_f32[(ptr + 8) >> 2]);
        let z = Math.abs(unsafe._mem_f32[(ptr + 12) >> 2]);
        
        if (x <= y && x <= z) {
            unsafe._mem_f32[(c + 4) >> 2] = 1;
            unsafe._mem_f32[(c + 8) >> 2] = 0;
            unsafe._mem_f32[(c + 12) >> 2] = 0;
        }
        
        else if (y <= x && y <= z) {
            unsafe._mem_f32[(c + 4) >> 2] = 0;
            unsafe._mem_f32[(c + 8) >> 2] = 1;
            unsafe._mem_f32[(c + 4) >> 2] = 0;
        }
        
        unsafe._mem_f32[(c + 4) >> 2] = 0;
        unsafe._mem_f32[(c + 8) >> 2] = 0;
        unsafe._mem_f32[(c + 4) >> 2] = 1;
        return c;
    };
    
    Vec3.minComponent = function(ptr) {
        return Math.min(Math.min(unsafe._mem_f32[(ptr + 4) >> 2], unsafe._mem_f32[(ptr + 8) >> 2]), unsafe._mem_f32[(ptr + 12) >> 2]);
    };
    
    Vec3.maxComponent = function(ptr) {
        return Math.max(Math.max(unsafe._mem_f32[(ptr + 4) >> 2], unsafe._mem_f32[(ptr + 8) >> 2]), unsafe._mem_f32[(ptr + 12) >> 2]);
    };
    
    Vec3.reflect = function(ptr, b) {
        return Vector3.sub(Vec3.mulScalar_vector3(ptr , 2 * Vec3.dot_vector3(ptr , b)));
    };
    
    Vec3.refract = function(ptr, b, n1, n2) {
        let nr = n1 / n2;
        let cosI = -Vec3.dot_vector3(ptr , b);
        let sinT2 = nr * nr * 1 - cosI * cosI;
        
        if (sinT2 > 1) {
            return Vector3.new(0,0,0);
        }
        
        let cosT = Math.sqrt(1 - sinT2);
        return Vector3.add(Vec3.mulScalar_vector3(ptr , nr * cosI - cosT));
    };
    
    Vec3.reflectance = function(ptr, b, n1, n2) {
        let nr = n1 / n2;
        let cosI = -Vec3.dot_vector3(ptr , b);
        let sinT2 = nr * nr * 1 - cosI * cosI;
        
        if (sinT2 > 1) {
            return 1;
        }
        
        let cosT = Math.sqrt(1 - sinT2);
        let rOrth = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
        let rPar = (n2 * cosI - n1 * cosT) / (n2 * cosI + n1 * cosT);
        return (rOrth * rOrth + rPar * rPar) / 2;
    };
    
    Vec3.pow = function(ptr, f) {
        return Vector3.new(undefined,undefined,undefined);
    };
    
    Vec3.isEqual = function(ptr, b) {
        return unsafe._mem_f32[(ptr + 4) >> 2] === unsafe._mem_f32[(b + 4) >> 2] && unsafe._mem_f32[(ptr + 8) >> 2] === unsafe._mem_f32[(b + 8) >> 2] && unsafe._mem_f32[(ptr + 12) >> 2] === unsafe._mem_f32[(b + 12) >> 2];
    };
    
    Vec3.isZero = function(ptr) {
        return unsafe._mem_f32[(ptr + 4) >> 2] === 0 && unsafe._mem_f32[(ptr + 8) >> 2] === 0 && unsafe._mem_f32[(ptr + 12) >> 2] === 0;
    };
    
    Vec3.set = function(ptr, x, y, z) {
        unsafe._mem_f32[(ptr + 4) >> 2] = x;
        unsafe._mem_f32[(ptr + 8) >> 2] = y;
        unsafe._mem_f32[(ptr + 12) >> 2] = z;
        return this;
    };
    
    Vec3.setFromJSON = function(ptr, json) {
        unsafe._mem_f32[(ptr + 4) >> 2] = unsafe._mem_f32[(json + 4) >> 2];
        unsafe._mem_f32[(ptr + 8) >> 2] = unsafe._mem_f32[(json + 8) >> 2];
        unsafe._mem_f32[(ptr + 12) >> 2] = unsafe._mem_f32[(json + 12) >> 2];
        return this;
    };
    
    Vec3.copy = function(ptr, b) {
        unsafe._mem_f32[(ptr + 4) >> 2] = unsafe._mem_f32[(b + 4) >> 2];
        unsafe._mem_f32[(ptr + 8) >> 2] = unsafe._mem_f32[(b + 8) >> 2];
        unsafe._mem_f32[(ptr + 12) >> 2] = unsafe._mem_f32[(b + 12) >> 2];
        return this;
    };
    
    Vec3.clone = function(ptr, c) {
        c = c !== 0 ? c : Vec3.new();
        unsafe._mem_f32[(c + 4) >> 2] = unsafe._mem_f32[(ptr + 4) >> 2];
        unsafe._mem_f32[(c + 8) >> 2] = unsafe._mem_f32[(ptr + 8) >> 2];
        unsafe._mem_f32[(c + 12) >> 2] = unsafe._mem_f32[(ptr + 12) >> 2];
        return this;
    };
    
    Vec3.randomUnitVec3 = function() {
        let x = Math.random() * 2 - 1;
        let y = Math.random() * 2 - 1;
        let z = Math.random() * 2 - 1;
        
        while (x * x + y * y + z * z > 1) {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            z = Math.random() * 2 - 1;
        }
        
        let v = Vec3.new(x,y,z);
        return Vec3.normalize(v , v);
    };
    __exports.Vec3 = Vec3;
    
    //FIXME: Virtuals should emit next to base class virtual function
    
    let __imul = Math.imul || function(a, b) {
    return (a * (b >>> 16) << 16) + a * (b & 65535) | 0;
    };
}(
    typeof global !== 'undefined' ? global : this,
    typeof exports !== 'undefined' ? exports : turbo
));
    