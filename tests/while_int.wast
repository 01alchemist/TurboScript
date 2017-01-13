(module
  (type (;0;) (func (param f32) (result f32)))
  (func (;0;) (type 0) (param f32) (result f32)
    (local f32)
    f32.const 0
    set_local 1
    block  ;; label = @1
      loop  ;; label = @2
        get_local 0
        get_local 1
        f32.gt_s
        f32.eqz
        br_if 1 (;@1;)
        get_local 1
        f32.const 1
        f32.add
        set_local 1
        br 0 (;@2;)
      end
    end
    get_local 1
    return)
  (export "test" (func 0)))
