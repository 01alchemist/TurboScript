(module
  (global i32 (i32.const 25))
  (func $test (result i32)
    get_global 0)
  (export "test" (func $test)))
