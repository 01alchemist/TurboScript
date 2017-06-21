;; Experimental wast emitter
(module
  (type (;0;) (func))
  (type (;1;) (func (param i32 i32) (result i32)))
  (type (;2;) (func (param f32 f32) (result f32)))
  (type (;3;) (func (param f64 f64) (result f64)))
  (type (;4;) (func (param i64 i64) (result i64)))
  (memory (;0;) 1)
  (global (;0;) (mut i32) (i32.const 0))
  (global (;1;) (mut i32) (i32.const 0))
  (global (;2;) (mut i32) (i32.const 0))
  (global (;3;) (mut i32) (i32.const 0))
  (global (;4;) (mut i32) (i32.const 0))
  (global (;5;) (mut i32) (i32.const 0))
  (export "memory" (memory 0))
  (export "addTwo1" (func $addTwo1))
  (export "addTwo2" (func $addTwo2))
  (export "addTwo3" (func $addTwo3))
  (export "addTwo4" (func $addTwo4))
  (export "addTwo5" (func $addTwo5))
  (export "addTwo6" (func $addTwo6))
  (start 0)
  (func $__WASM_INITIALIZER (type 0)
    i32.const 0
    set_global 3
    i32.const 0
    set_global 4
    i32.const 0
    set_global 5)
  (func $addTwo1 (type 1) (param $a i32)  (param $b i32) (result i32)
    get_local $a
    get_local $b
    i32.add
    return)
  (func $addTwo2 (type 1) (param $a i32)  (param $b i32) (result i32)
    get_local $a
    get_local $b
    i32.add
    return)
  (func $addTwo3 (type 2) (param $a f32)  (param $b f32) (result f32)
    get_local $a
    get_local $b
    f32.add
    return)
  (func $addTwo4 (type 3) (param $a f64)  (param $b f64) (result f64)
    get_local $a
    get_local $b
    f64.add
    return)
  (func $addTwo5 (type 4) (param $a i64)  (param $b i64) (result i64)
    get_local $a
    get_local $b
    i64.add
    return)
  (func $addTwo6 (type 4) (param $a i64)  (param $b i64) (result i64)
    get_local $a
    get_local $b
    i64.add
    return)
  (data (i32.const 8) "  \20\20\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00")
  )
