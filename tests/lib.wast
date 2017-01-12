(module
  (type (;0;) (func (param i32) (result i32)))
  (func (;0;) (type 0) (param i32) (result i32)
    (local i32 i32)
    get_global 0
    i32.const 7
    i32.add
    i32.const -8
    i32.and
    set_local 0
    get_local 0
    i32.const 7
    i32.add
    i32.const -8
    i32.and
    set_local 0
    get_local 0
    get_local 0
    i32.add
    set_local 1
    get_global 0
    return)
  (global (;0;) i32 (i32.const 0))
  (global (;1;) i32 (i32.const 0))
  (export "malloc" (func 0)))
