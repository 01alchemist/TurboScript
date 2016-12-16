(function(__declare, __exports) {
    __exports = __exports.turbo;
    var Vector3 = {
        x : 0,
        y : 0,
    }
    __exports.Vector3 = Vector3;
    
    Vector3.prototype = function(x, y) {
        this.y = y;
        this.x = x;
    };
    
    var Vector = {};
    Vector.NAME = "Vector";
    Vector.SIZE = "12";
    Vector.ALIGN = "4";
    Vector.CLSID = "1266219";
    unsafe._idToType[1266219] = Vector;
    Vector.internal_init = function(ptr) {
        unsafe._mem_i32[ptr >> 2] = 1266219;
        unsafe._mem_f32[(ptr + 4) >> 2] = 0;
        unsafe._mem_f32[(ptr + 8) >> 2] = 0;
        return ptr;
    };
    __exports.Vector = Vector;
    
    Vector.new = function(x, y) {
        let ptr = unsafe.alloc(Vector.SIZE, Vector.ALIGN);
        Vector.internal_init(ptr);
        unsafe._mem_f32[(ptr + 8) >> 2] = y;
        unsafe._mem_f32[(ptr + 4) >> 2] = x;
        return ptr;
    };
    
    Vector.add = function(ptr, b) {
        var c = new Vector3();
        c.x = unsafe._mem_f32[(ptr + 4) >> 2] + b.x;
        c.y = unsafe._mem_f32[(ptr + 8) >> 2] + b.y;
        
        return c;
    };
    
    Vector.toJSON = function(ptr) {
        var x = unsafe._mem_f32[(ptr + 4) >> 2];
        var y = unsafe._mem_f32[(ptr + 8) >> 2];
        
        return `{x:${x},y:${y}}`;
    };
    
    var Triangle = {};
    Triangle.NAME = "Triangle";
    Triangle.SIZE = "8";
    Triangle.ALIGN = "4";
    Triangle.CLSID = "182249270";
    unsafe._idToType[182249270] = Triangle;
    Triangle.internal_init = function(ptr) {
        unsafe._mem_i32[ptr >> 2] = 182249270;
        unsafe._mem_i32[(ptr + 4) >> 2] = 0;
        return ptr;
    };
    __exports.Triangle = Triangle;
    
    Triangle.new = function(v1) {
        let ptr = unsafe.alloc(Triangle.SIZE, Triangle.ALIGN);
        Triangle.internal_init(ptr);
        unsafe._mem_i32[(ptr + 4) >> 2] = v1 === 0 ? Vector.new() : v1;
        return ptr;
    };
    
    var Mesh = {};
    Mesh.NAME = "Mesh";
    Mesh.SIZE = "8";
    Mesh.ALIGN = "4";
    Mesh.CLSID = "24257";
    unsafe._idToType[24257] = Mesh;
    Mesh.internal_init = function(ptr) {
        unsafe._mem_i32[ptr >> 2] = 24257;
        unsafe._mem_i32[(ptr + 4) >> 2] = 0;
        return ptr;
    };
    __exports.Mesh = Mesh;
    
    Mesh.new = function(data) {
        let ptr = unsafe.alloc(Mesh.SIZE, Mesh.ALIGN);
        Mesh.internal_init(ptr);
        unsafe._mem_i32[(ptr + 4) >> 2] = data;
        return ptr;
    };
}(
   typeof global !== 'undefined' ? global : this,
   typeof exports !== 'undefined' ? exports : this
));
