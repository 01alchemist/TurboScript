(function(__declare, __exports) {
    class Vector3 {
        constructor(x = 0, y = 0, z = 0) {
            this.y = y;
            this.x = x;
            this.z = z;
        }
    }
    __exports.Vector3 = Vector3;
    
    let Vec3 = {};
    Vec3.NAME = "Vec3";
    Vec3.SIZE = 16;
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
    
    Vec3.add = function(ptr, b) {
        let c = new Vector3();
        c.x = unsafe._mem_f32[(ptr + 4) >> 2] + unsafe._mem_f32[(b + 4) >> 2];
        c.y = unsafe._mem_f32[(ptr + 8) >> 2] + unsafe._mem_f32[(b + 8) >> 2];
        c.z = unsafe._mem_f32[(ptr + 12) >> 2] + unsafe._mem_f32[(b + 12) >> 2];
        return c;
    };
    
    Vec3.toString = function(ptr) {
        let x = unsafe._mem_f32[(ptr + 4) >> 2];
        let y = unsafe._mem_f32[(ptr + 8) >> 2];
        return `{"x":${x},"y":${y}}`;
    };
    __exports.Vec3 = Vec3;
    
    let main = function main() {
        let v1 = Vec3.new();
        let v2 = Vec3.new();
        let v3 = new Vector3();
        let v4 = Vec3.add(v1 , v2);
    };
    __exports.main = main;
    
    //FIXME: Virtuals should emit next to base class virtual function
}(
    typeof global !== 'undefined' ? global : this,
    typeof exports !== 'undefined' ? exports : turbo
));
    