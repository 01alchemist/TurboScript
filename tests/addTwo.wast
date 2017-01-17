(module
  (type (;0;) (func (param i32 i32) (result i32)))
  (type (;1;) (func (param f32 f32) (result f32)))
  (type (;2;) (func (param f64 f64) (result f64)))
  (type (;3;) (func (param i64 i64) (result i64)))
  (func (;0;) (type 0) (param i32 i32) (result i32)
    get_local 0
    get_local 1
    i32.add
    return)
  (func (;1;) (type 0) (param i32 i32) (result i32)
    get_local 0
    get_local 1
    i32.add
    return)
  (func (;2;) (type 1) (param f32 f32) (result f32)
    get_local 0
    get_local 1
    f32.add
    return)
  (func (;3;) (type 2) (param f64 f64) (result f64)
    get_local 0
    get_local 1
    f64.add
    return)
  (func (;4;) (type 3) (param i64 i64) (result i64)
    get_local 0
    get_local 1
    i64.add
    return)
  (func (;5;) (type 3) (param i64 i64) (result i64)
    get_local 0
    get_local 1
    i64.add
    return)
  (memory (;0;) 255)
  (export "addTwo1" (func 0))
  (export "addTwo2" (func 1))
  (export "addTwo3" (func 2))
  (export "addTwo4" (func 3))
  (export "addTwo5" (func 4))
  (export "addTwo6" (func 5)))
