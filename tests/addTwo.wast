(module
  (type (;0;) (func (param i32 i32) (result i32)))
  (type (;1;) (func (param f32 f32) (result f32)))
  (func (;0;) (type 0) (param i32 i32) (result i32)
    get_local 0
    get_local 1
    i32.add)
  (func (;1;) (type 1) (param f32 f32) (result f32)
    get_local 0
    get_local 1
    f32.add)
  (export "addTwo" (func 0))
  (export "addTwoF" (func 1)))
