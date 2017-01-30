(module
  (type (;0;) (func (param i32 f32) (result i32)))
  (func (;0;) (type 0) (param i32 f32) (result i32)
    (local i32)
    i32.const 0
    set_local 2
    get_local 0
    i32.const 1
    i32.eq
    get_local 1
    f32.const 0x1.99999ap-4 (;=0.1;)
    f32.eq
    i32.or
    i32.const 1
    i32.eq
    if  ;; label = @1
      block  ;; label = @2
        i32.const 1
        set_local 2
      end
    else
      block  ;; label = @2
        get_local 0
        i32.const 3
        i32.eq
        if  ;; label = @3
          block  ;; label = @4
            get_local 1
            f32.const 0x1.a8f5c2p+1 (;=3.32;)
            f32.eq
            if  ;; label = @5
              block  ;; label = @6
                i32.const 5
                set_local 2
              end
            end
          end
        else
          block  ;; label = @4
            i32.const 4
            set_local 2
          end
        end
      end
    end
    get_local 2
    return)
  (memory (;0;) 255)
  (export "test" (func 0)))
