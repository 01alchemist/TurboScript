(function(__declare, __extern) {
  var ShapeType;
  (function (ShapeType) {
    ShapeType[ShapeType['TRIANGLE'] = 0] = 'TRIANGLE';
    ShapeType[ShapeType['MESH'] = 1] = 'MESH';
  })(ShapeType || (ShapeType = {}));

  var Vector = {};
  Vector.NAME = 'Vector';
  Vector.internal_init = function(ptr) {
    unsafe._mem_i32[ptr >> 2] = 0;
    unsafe._mem_i32[ptr >> 2] = 0;
    unsafe._mem_i32[ptr >> 2] = 0;
    unsafe._mem_i32[ptr >> 2] = 0;
  };

  Vector.new = function(x, y, z) {
    let ptr = unsafe.alloc();
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = 0;
    return ptr;
  };

  var newVector = __extern.newVector = function(x, y, z) {
    var v = new Vector();
    v.x = x;
    v.y = y;
    v.z = z;

    return v;
  };
}(
  typeof global !== 'undefined' ? global : this,
  typeof exports !== 'undefined' ? exports : this
));
