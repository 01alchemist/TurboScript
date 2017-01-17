(module
  (type (;0;) (func (param i32 i32) (result i32)))
  (func (;0;) (type 0) (param i32 i32) (result i32)
    get_local 0
    i32.const 1
    i32.eq
    get_local 1                                   
    i32.const 0
    i32.eq
    i32.and
    i32.const 1                                   
    i32.eq                                                                                                                                            
    if  ;; label = @1
      block  ;; label = @2
        i32.const 150
        return
      end
    end
    get_local 0)
  (memory (;0;) 256)
  (export "test" (func 0)))
