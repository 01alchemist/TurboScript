(module
  (type (;0;) (func (param i32) (result i32)))
  (func (;0;) (type 0) (param i32) (result i32)
    (local i32)
    set_local 0
    i32.and
    get_global 0
    i32.const 7
    i32.add
    i32.const -8
    get_local 0)
  (global (;0;) i32 (i32.const 0))
  (global (;1;) i32 (i32.const 0))
  (export "malloc" (func 0)))
