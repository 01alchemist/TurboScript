(function(__declare, __exports) {
    __exports = __exports.turbo;
    class Vector3 {
        constructor(x, y, z) {
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
    
    let Vector = {};
    Vector.NAME = "Vector";
    Vector.SIZE = 16;
    Vector.ALIGN = 4;
    Vector.CLSID = 1266219;
    unsafe._idToType[1266219] = Vector;
    Vector.internal_init = function(ptr) {
        unsafe._mem_i32[ptr >> 2] = 1266219;
        unsafe._mem_f32[(ptr + 4) >> 2] = 0;
        unsafe._mem_f32[(ptr + 8) >> 2] = 0;
        unsafe._mem_f32[(ptr + 12) >> 2] = 0;
        return ptr;
    };
        
    Vector.new = function(x, y, z) {
        let ptr = unsafe.alloc(Vector.SIZE, Vector.ALIGN);
        Vector.internal_init(ptr);
        unsafe._mem_f32[(ptr + 4) >> 2] = x;
        unsafe._mem_f32[(ptr + 8) >> 2] = y;
        unsafe._mem_f32[(ptr + 12) >> 2] = z;
        return ptr;
    };
    
    Vector.add = function(ptr, b) {
        let c = new Vector3();
        c.x = unsafe._mem_f32[(ptr + 4) >> 2] + unsafe._mem_f32[(b + 4) >> 2];
        c.y = unsafe._mem_f32[(ptr + 8) >> 2] + unsafe._mem_f32[(b + 8) >> 2];
        c.z = unsafe._mem_f32[(ptr + 12) >> 2] + unsafe._mem_f32[(b + 12) >> 2];
        return c;
    };
    
    Vector.add_vec3 = function(ptr, b) {
        let c = new Vector3();
        c.x = unsafe._mem_f32[(ptr + 4) >> 2] + b.x;
        c.y = unsafe._mem_f32[(ptr + 8) >> 2] + b.y;
        c.z = unsafe._mem_f32[(ptr + 12) >> 2] + b.z;
        return c;
    };
    
    Vector.toString = function(ptr) {
        let x = unsafe._mem_f32[(ptr + 4) >> 2];
        let y = unsafe._mem_f32[(ptr + 8) >> 2];
        return `{"x":${x},"y":${y}}`;
    };
    __exports.Vector = Vector;
    
    let Shape = {};
    Shape.NAME = "Shape";
    Shape.SIZE = 8;
    Shape.ALIGN = 4;
    Shape.CLSID = 255446;
    unsafe._idToType[255446] = Shape;
    Shape.internal_init = function(ptr) {
        unsafe._mem_i32[ptr >> 2] = 255446;
        unsafe._mem_i32[(ptr + 4) >> 2] = 0;
        return ptr;
    };
        
    Shape.new = function(v1) {
        let ptr = unsafe.alloc(Shape.SIZE, Shape.ALIGN);
        Shape.internal_init(ptr);
        unsafe._mem_i32[(ptr + 4) >> 2] = v1 === 0 ? Vector.new() : v1;
        return ptr;
    };
    __exports.Shape = Shape;
    
    let Triangle = {};
    Triangle.NAME = "Triangle";
    Triangle.SIZE = 8;
    Triangle.ALIGN = 4;
    Triangle.CLSID = 182249270;
    unsafe._idToType[182249270] = Triangle;
    Triangle.internal_init = function(ptr) {
        unsafe._mem_i32[ptr >> 2] = 182249270;
        unsafe._mem_i32[(ptr + 4) >> 2] = 0;
        return ptr;
    };
        
    Triangle.new = function(v1) {
        let ptr = unsafe.alloc(Triangle.SIZE, Triangle.ALIGN);
        Triangle.internal_init(ptr);
        unsafe._mem_i32[(ptr + 4) >> 2] = v1 === 0 ? Vector.new() : v1;
        return ptr;
    };
    
    Triangle.normal = function(ptr) {
        let b = Vector.new();
        let c = Vector.add(unsafe._mem_i32[(ptr + 4) >> 2], b);
        return c;
    };
    
    Triangle.toString = function(ptr) {
        let str = Vector.toString(unsafe._mem_i32[(ptr + 4) >> 2], );
        return `{"v1":${str}}`;
    };
    __exports.Triangle = Triangle;
    
    let Mesh = {};
    Mesh.NAME = "Mesh";
    Mesh.SIZE = 8;
    Mesh.ALIGN = 4;
    Mesh.CLSID = 24257;
    unsafe._idToType[24257] = Mesh;
    Mesh.internal_init = function(ptr) {
        unsafe._mem_i32[ptr >> 2] = 24257;
        unsafe._mem_i32[(ptr + 4) >> 2] = 0;
        return ptr;
    };
        
    Mesh.new = function(data) {
        let ptr = unsafe.alloc(Mesh.SIZE, Mesh.ALIGN);
        Mesh.internal_init(ptr);
        unsafe._mem_i32[(ptr + 4) >> 2] = data;
        return ptr;
    };
    
    Mesh.normal = function(ptr) {
        __declare.log(unsafe._mem_i32[(ptr + 4) >> 2]);
    };
    __exports.Mesh = Mesh;
}(
    typeof global !== 'undefined' ? global : this,
    typeof exports !== 'undefined' ? exports : this
));
    