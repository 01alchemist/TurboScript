(module
  (type (;0;) (func (param i32 f32) (result i32)))
  (func (;0;) (type 0) (param i32 f32) (result i32)
    get_local 0
    i32.const 0
    i32.eq
    if i32  ;; label = @1
      i32.const 100
    else
      get_local 1
      f32.const 0x1p-1 (;=0.5;)
      f32.eq
      if i32  ;; label = @2
        i32.const 200
      else
        i32.const 300
      end
    end
    return)
  (memory (;0;) 255)
  (export "test" (func 0)))
