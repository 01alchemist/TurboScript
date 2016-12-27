(function(__declare, __exports) {
    class Vector3 {
        constructor(x = 0, y = 0, z = 0) {
            this.y = y;
            this.x = x;
            this.z = z;
        }
        
        add(b) {
            let c = new Vector3();
            c.x = this.x + b.x;
            c.y = this.y + b.y;
            c.z = this.z + b.z;
            return c;
        }
    }
    __exports.Vector3 = Vector3;
    
    let Base = {};
    Base.NAME = "Base";
    Base.SIZE = 4;
    Base.ALIGN = 4;
    Base.CLSID = 17918;
    unsafe._idToType[Base.CLSID] = Base;
    
    Base.add_impl = function(ptr, b) {
        return 0;
    };
    __exports.Base = Base;
    
    let Vec3 = {};
    Vec3.NAME = "Vec3";
    Vec3.SIZE = 16;
    Vec3.ALIGN = 4;
    Vec3.CLSID = 27991;
    Vec3.BASE = "Base";
    unsafe._idToType[Vec3.CLSID] = Vec3;
    
    Vec3.new = function(x = 0, y = 0, z = 0) {
        let ptr = unsafe.alloc(Vec3.SIZE, Vec3.ALIGN);
        unsafe._mem_i32[ptr >> 2] = Vec3.CLSID;
        Vec3.init_mem(ptr, x, y, z);
        return ptr;
    };
    
    Vec3.init_mem = function(ptr, x, y, z) {
        unsafe._mem_f32[(ptr + 8) >> 2] = x;
        unsafe._mem_f32[(ptr + 12) >> 2] = y;
        unsafe._mem_f32[(ptr + 16) >> 2] = z;
        return ptr;
    };
    
    Vec3.add_impl = function(ptr, b) {
        let c = new Vector3();
        c.x = unsafe._mem_f32[(ptr + 8) >> 2] + unsafe._mem_f32[(b + 8) >> 2];
        c.y = unsafe._mem_f32[(ptr + 12) >> 2] + unsafe._mem_f32[(b + 12) >> 2];
        c.z = unsafe._mem_f32[(ptr + 16) >> 2] + unsafe._mem_f32[(b + 16) >> 2];
        return c;
    };
    
    Vec3.add_vec3 = function(ptr, b) {
        let c = new Vector3();
        c.x = unsafe._mem_f32[(ptr + 8) >> 2] + b.x;
        c.y = unsafe._mem_f32[(ptr + 12) >> 2] + b.y;
        c.z = unsafe._mem_f32[(ptr + 16) >> 2] + b.z;
        return c;
    };
    
    Vec3.toString = function(ptr) {
        let x = unsafe._mem_f32[(ptr + 8) >> 2];
        let y = unsafe._mem_f32[(ptr + 12) >> 2];
        return `{"x":${x},"y":${y}}`;
    };
    __exports.Vec3 = Vec3;
    
    let Shape = {};
    Shape.NAME = "Shape";
    Shape.SIZE = 8;
    Shape.ALIGN = 4;
    Shape.CLSID = 255446;
    unsafe._idToType[Shape.CLSID] = Shape;
    
    Shape.new = function(v1) {
        let ptr = unsafe.alloc(Shape.SIZE, Shape.ALIGN);
        unsafe._mem_i32[ptr >> 2] = Shape.CLSID;
        Shape.init_mem(ptr, v1);
        return ptr;
    };
    
    Shape.init_mem = function(ptr, v1) {
        unsafe._mem_i32[(ptr + 4) >> 2] = v1 === 0 ? Vec3.new() : v1;
        return ptr;
    };
    __exports.Shape = Shape;
    
    let Triangle = {};
    Triangle.NAME = "Triangle";
    Triangle.SIZE = 8;
    Triangle.ALIGN = 4;
    Triangle.CLSID = 182249270;
    unsafe._idToType[Triangle.CLSID] = Triangle;
    
    Triangle.new = function(v1) {
        let ptr = unsafe.alloc(Triangle.SIZE, Triangle.ALIGN);
        unsafe._mem_i32[ptr >> 2] = Triangle.CLSID;
        Triangle.init_mem(ptr, v1);
        return ptr;
    };
    
    Triangle.init_mem = function(ptr, v1) {
        unsafe._mem_i32[(ptr + 4) >> 2] = v1 === 0 ? Vec3.new() : v1;
        return ptr;
    };
    
    Triangle.normal = function(ptr) {
        let b = Vec3.new();
        let c = Vec3.add(unsafe._mem_i32[(ptr + 4) >> 2] , b);
        return c;
    };
    
    Triangle.toString = function(ptr) {
        let str = Vec3.toString(unsafe._mem_i32[(ptr + 4) >> 2]);
        return `{"v1":${str}}`;
    };
    __exports.Triangle = Triangle;
    
    //FIXME: Virtuals should emit next to base class virtual function
    
    Base.add = function (ptr,b) {
        switch (unsafe._mem_i32[ptr >> 2]) {
            case Base.CLSID:
                return Base.add_impl(ptr,b);
            case Vec3.CLSID:
                return Vec3.add_impl(ptr,b);
            default:
                throw unsafe._badType(ptr);
        }
    };
}(
    typeof global !== 'undefined' ? global : this,
    typeof exports !== 'undefined' ? exports : turbo
));
    