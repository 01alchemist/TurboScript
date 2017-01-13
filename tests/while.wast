(module
  (type (;0;) (func (param f32) (result i32)))
  (func (;0;) (type 0) (param f32) (result i32)
    (local f32 i32)
    f32.const 0x1.47ae14p-8 (;=0.005;)
    set_local 1
    i32.const 0
    set_local 2
    block  ;; label = @1
      loop  ;; label = @2
        get_local 0
        get_local 1
        f32.gt
        i32.eqz
        br_if 1 (;@1;)
        get_local 1
        f32.const 0x1.0624dep-10 (;=0.001;)
        f32.add
        set_local 1
        get_local 2
        i32.const 1
        i32.add
        set_local 2
        br 0 (;@2;)
      end
    end
    get_local 2
    return)
  (export "test" (func 0)))
