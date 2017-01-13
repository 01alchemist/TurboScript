(module
  (type (;0;) (func (param i32) (result i32)))
  (func (;0;) (type 0) (param i32) (result i32)
    (local i32 i32 i32)
    get_global 0
    i32.const 7
    i32.add
    i32.const -8
    i32.and
    set_local 1
    get_local 0
    i32.const 7
    i32.add
    i32.const -8
    i32.and
    set_local 0
    get_local 1
    get_local 0
    i32.add
    set_local 2
    i32.const 0
    set_local 3
    block  ;; label = @1
      loop  ;; label = @2
        get_local 3
        get_local 2
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        get_local 3
        i32.const 0
        i32.store
        get_local 3
        i32.const 4
        i32.add
        set_local 3
        br 0 (;@2;)
      end
    end
    get_global 0
    return)
  (memory (;0;) 256)
  (global (;0;) i32 (i32.const 0))
  (global (;1;) i32 (i32.const 0))
  (export "malloc" (func 0)))
