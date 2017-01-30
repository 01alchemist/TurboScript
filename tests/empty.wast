(module
  (type (;0;) (func))
  (type (;1;) (func (param i32) (result i32)))
  (type (;2;) (func (result i32)))
  (type (;3;) (func (param i32 i32)))
  (type (;4;) (func (param i32)))
  (func (;0;) (type 0)
    i32.const 0
    i32.load offset=10
    i32.const 0
    i32.store
    i32.const 0
    i32.const 0
    i32.store offset=11
    i32.const 0
    i32.const 0
    i32.store offset=12)
  (func (;1;) (type 1) (param i32) (result i32)
    (local i32 i32 i32 i32 i32)
    i32.const 8
    set_local 1
    i32.const 0
    i32.load offset=8
    get_local 1
    i32.const 1
    i32.sub
    i32.add
    i32.const -1
    get_local 1
    i32.const 1
    i32.sub
    i32.xor
    i32.and
    set_local 2
    get_local 0
    get_local 1
    i32.const 1
    i32.sub
    i32.add
    i32.const -1
    get_local 1
    i32.const 1
    i32.sub
    i32.xor
    i32.and
    set_local 0
    get_local 0
    i32.const 8
    i32.add
    set_local 3
    get_local 2
    get_local 3
    i32.add
    set_local 4
    get_local 2
    i32.const 4
    i32.add
    set_local 5
    get_local 5
    get_local 3
    call 6
    get_local 5
    i32.const 4
    i32.add
    call 9
    get_local 5
    get_local 3
    call 7
    i32.const 0
    get_local 4
    i32.store offset=8
    get_local 2
    i32.const 8
    i32.add
    set_local 2
    get_local 2
    set_local 5
    block  ;; label = @1
      loop  ;; label = @2
        get_local 5
        get_local 4
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        get_local 5
        i32.const 0
        i32.store
        get_local 5
        i32.const 4
        i32.add
        set_local 5
        br 0 (;@2;)
      end
    end
    get_local 2
    return)
  (func (;2;) (type 1) (param i32) (result i32)
    get_local 0
    call 11
    i32.const 0
    i32.load offset=8
    return)
  (func (;3;) (type 2) (result i32)
    i32.const 0
    i32.load offset=10
    return)
  (func (;4;) (type 2) (result i32)
    i32.const 0
    i32.load offset=11
    return)
  (func (;5;) (type 2) (result i32)
    i32.const 0
    i32.load offset=11
    return)
  (func (;6;) (type 3) (param i32 i32)
    get_local 0
    get_local 0
    i32.load
    i32.const 7
    i32.and
    get_local 1
    i32.or
    i32.store)
  (func (;7;) (type 3) (param i32 i32)
    (local i32 i32)
    get_local 0
    i32.load
    set_local 2
    get_local 0
    get_local 2
    i32.add
    set_local 3
    get_local 3
    get_local 1
    i32.store)
  (func (;8;) (type 1) (param i32) (result i32)
    (local i32)
    get_local 0
    i32.const 8
    i32.sub
    set_local 1
    get_local 1
    i32.load
    i32.const 1
    i32.and
    return)
  (func (;9;) (type 1) (param i32) (result i32)
    (local i32)
    get_local 0
    i32.const 4
    i32.sub
    set_local 1
    get_local 1
    get_local 1
    i32.load
    i32.const 1
    i32.or
    i32.store
    get_local 1
    i32.load
    return)
  (func (;10;) (type 1) (param i32) (result i32)
    (local i32)
    get_local 0
    i32.const 4
    i32.sub
    set_local 1
    get_local 1
    i32.load
    i32.const 1
    i32.and
    return)
  (func (;11;) (type 4) (param i32)
    (local i32)
    get_local 0
    i32.const 4
    i32.sub
    set_local 1
    get_local 1
    get_local 1
    i32.load
    i32.const -2
    i32.and
    i32.store)
  (func (;12;) (type 1) (param i32) (result i32)
    (local i32)
    get_local 0
    i32.const 4
    i32.sub
    set_local 1
    get_local 1
    i32.load
    i32.const -2
    i32.and
    return)
  (memory (;0;) 1)
  (export "memory" (memory 0))
  (export "malloc" (func 1))
  (export "free" (func 2))
  (export "getNumFreeChunks" (func 3))
  (export "getFirstFree" (func 4))
  (export "getLastFree" (func 5))
  (export "getPrevInuse" (func 8))
  (export "setInuse" (func 9))
  (export "getInuse" (func 10))
  (export "clearInuse" (func 11))
  (export "chunksize" (func 12))
  (start 0)
  (data (i32.const 8) " \00\00\00 \00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"))
