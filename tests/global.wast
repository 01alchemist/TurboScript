(module
  (type (;0;) (func (result f64)))
  (func (;0;) (type 0) (result f64)
    i32.const 0
    i32.const 0
    f64.load offset=8
    f64.const 0x1.999999999999ap-4 (;=0.1;)
    f64.add
    f64.store offset=8
    i32.const 0
    f64.load offset=8
    return)
  (func (;1;) (type 0) (result f64)
    i32.const 0
    f64.load offset=8
    return)
  (memory (;0;) 256)
  (export "incrementF64" (func 0))
  (export "getF64Count" (func 1)))
