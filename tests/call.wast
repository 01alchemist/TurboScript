(module
  (type (;0;) (func (param i32 f32) (result i32)))
  (func (;0;) (type 0) (param i32 f32) (result i32)
    get_local 1
    f32.const 0x1p-1 (;=0.5;)
    f32.eq
    if i32  ;; label = @1
      i32.const 100
    else
      get_local 0
    end
    return)
  (func (;1;) (type 0) (param i32 f32) (result i32)
    (local i32 i32)
    get_local 0
    i32.const 1
    i32.add
    set_local 2
    get_local 2
    get_local 1
    call 0
    set_local 3
    get_local 3
    i32.const 1000
    i32.add
    return)
  (memory (;0;) 255)
  (export "test" (func 1)))
