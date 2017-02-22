(module
  (type (;0;) (func (param i32) (result i32)))
  (type (;1;) (func (param i32)))
  (type (;2;) (func (result i32)))
  (type (;3;) (func (param i32 i32)))
  (type (;4;) (func (param i32 i32 i32) (result i32)))
  (type (;5;) (func (param i32 i32) (result i32)))
  (type (;6;) (func (param i32 i32 i32)))
  (type (;7;) (func))
  (func (;0;) (type 0) (param i32) (result i32)
    (local i32 i32 i32 i32 i32 i32)
    i32.const 8
    set_local 1
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
    set_local 2
    get_local 2
    call 2
    set_local 3
    get_local 3
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      block  ;; label = @2
        get_local 3
        return
      end
    end
    i32.const 0
    i32.load offset=16
    set_local 4
    get_local 4
    i32.const 7
    i32.add
    set_local 4
    get_local 4
    i32.const -8
    i32.and
    set_local 4
    get_local 4
    get_local 2
    i32.add
    set_local 5
    get_local 4
    i32.const 4
    i32.add
    set_local 6
    get_local 6
    get_local 2
    call 8
    get_local 6
    i32.const 4
    i32.add
    call 10
    get_local 6
    get_local 2
    call 9
    i32.const 0
    get_local 5
    i32.const 4
    i32.add
    i32.store offset=16
    get_local 4
    i32.const 8
    i32.add
    set_local 4
    get_local 4
    set_local 6
    block  ;; label = @1
      loop  ;; label = @2
        get_local 6
        get_local 5
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        get_local 6
        i32.const 0
        i32.store
        get_local 6
        i32.const 4
        i32.add
        set_local 6
        br 0 (;@2;)
      end
    end
    get_local 4
    return)
  (func (;1;) (type 1) (param i32)
    (local i32 i32)
    i32.const 0
    set_local 1
    i32.const 0
    set_local 2
    get_local 0
    call 11
    i32.const 0
    i32.load offset=28
    i32.const 0
    i32.eq
    if  ;; label = @1
      block  ;; label = @2
        i32.const 0
        get_local 0
        i32.store offset=28
      end
    end
    i32.const 0
    i32.load offset=20
    set_local 2
    get_local 2
    get_local 0
    call 12
    i32.add
    set_local 2
    i32.const 0
    get_local 2
    i32.store offset=20
    get_local 0
    i32.const 4
    i32.add
    set_local 1
    i32.const 0
    i32.load offset=32
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      block  ;; label = @2
        get_local 1
        i32.const 0
        i32.load offset=32
        i32.store
        i32.const 0
        i32.load offset=32
        get_local 0
        i32.store
      end
    else
      block  ;; label = @2
        get_local 1
        i32.const 0
        i32.store
      end
    end
    get_local 0
    i32.const 0
    i32.store
    i32.const 0
    get_local 0
    i32.store offset=32
    i32.const 0
    i32.const 0
    i32.load offset=24
    i32.const 1
    i32.add
    i32.store offset=24)
  (func (;2;) (type 0) (param i32) (result i32)
    (local i32 i32 i32 i32 i32)
    i32.const 0
    set_local 1
    i32.const 0
    set_local 2
    i32.const 0
    set_local 3
    i32.const 0
    set_local 4
    i32.const 0
    set_local 5
    i32.const 0
    i32.load offset=28
    set_local 2
    i32.const 0
    i32.load offset=32
    set_local 3
    i32.const 0
    i32.load offset=20
    set_local 4
    i32.const 0
    i32.load offset=24
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      block  ;; label = @2
        get_local 0
        call 3
        set_local 1
        get_local 1
        i32.const 0
        i32.gt_s
        if  ;; label = @3
          block  ;; label = @4
            get_local 1
            get_local 2
            i32.eq
            if  ;; label = @5
              block  ;; label = @6
                i32.const 0
                get_local 1
                call 7
                i32.store offset=28
              end
            end
            get_local 1
            get_local 3
            i32.eq
            if  ;; label = @5
              block  ;; label = @6
                i32.const 0
                i32.const 0
                i32.store offset=32
              end
            end
            i32.const 0
            i32.const 0
            i32.load offset=24
            i32.const 1
            i32.sub
            i32.store offset=24
            get_local 1
            call 10
            get_local 1
            call 12
            set_local 5
            get_local 4
            get_local 5
            i32.sub
            set_local 4
            i32.const 0
            get_local 4
            i32.store offset=20
            get_local 1
            return
          end
        end
      end
    end
    i32.const 0
    return)
  (func (;3;) (type 0) (param i32) (result i32)
    (local i32 i32)
    i32.const 0
    set_local 1
    i32.const 0
    set_local 2
    i32.const 0
    i32.load offset=28
    set_local 1
    block  ;; label = @1
      loop  ;; label = @2
        get_local 1
        i32.const 0
        i32.ne
        i32.eqz
        br_if 1 (;@1;)
        get_local 1
        call 12
        set_local 2
        get_local 2
        get_local 0
        i32.eq
        if  ;; label = @3
          block  ;; label = @4
            get_local 1
            return
          end
        end
        get_local 1
        i32.load
        set_local 1
        br 0 (;@2;)
      end
    end
    i32.const 0
    return)
  (func (;4;) (type 2) (result i32)
    i32.const 0
    i32.load offset=16
    return)
  (func (;5;) (type 2) (result i32)
    i32.const 0
    i32.load offset=20
    return)
  (func (;6;) (type 2) (result i32)
    i32.const 0
    i32.load offset=12
    return)
  (func (;7;) (type 0) (param i32) (result i32)
    get_local 0
    i32.load
    return)
  (func (;8;) (type 3) (param i32 i32)
    get_local 0
    get_local 0
    i32.load
    i32.const 7
    i32.and
    get_local 1
    i32.or
    i32.store)
  (func (;9;) (type 3) (param i32 i32)
    (local i32 i32)
    i32.const 0
    set_local 2
    i32.const 0
    set_local 3
    get_local 0
    i32.load
    set_local 3
    get_local 0
    get_local 3
    i32.add
    set_local 2
    get_local 2
    get_local 1
    i32.store)
  (func (;10;) (type 1) (param i32)
    (local i32)
    i32.const 0
    set_local 1
    get_local 0
    i32.const 4
    i32.sub
    set_local 1
    get_local 1
    get_local 1
    i32.load
    i32.const 1
    i32.or
    i32.store)
  (func (;11;) (type 1) (param i32)
    (local i32)
    i32.const 0
    set_local 1
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
  (func (;12;) (type 0) (param i32) (result i32)
    (local i32)
    i32.const 0
    set_local 1
    get_local 0
    i32.const 4
    i32.sub
    set_local 1
    get_local 1
    i32.load
    i32.const -2
    i32.and
    return)
  (func (;13;) (type 4) (param i32 i32 i32) (result i32)
    get_local 0
    get_local 1
    i32.store
    get_local 0
    get_local 2
    i32.store offset=4
    get_local 0
    return)
  (func (;14;) (type 5) (param i32 i32) (result i32)
    get_local 0
    i32.const 8
    i32.add
    call 0
    get_local 0
    get_local 1
    call 13)
  (func (;15;) (type 0) (param i32) (result i32)
    get_local 0
    i32.load
    get_local 0
    i32.load offset=4
    i32.div_s
    return)
  (func (;16;) (type 5) (param i32 i32) (result i32)
    get_local 1
    get_local 0
    i32.load
    get_local 0
    i32.load offset=4
    i32.div_s
    i32.lt_s
    if  ;; label = @1
      block  ;; label = @2
        get_local 0
        i32.const 32
        i32.add
        get_local 1
        i32.const 2
        i32.shl
        i32.const 2
        i32.shl
        i32.add
        i32.load
        return
      end
    end
    i32.const 0
    return)
  (func (;17;) (type 6) (param i32 i32 i32)
    get_local 0
    i32.const 32
    i32.add
    get_local 1
    i32.const 2
    i32.shl
    i32.const 2
    i32.shl
    i32.add
    get_local 2
    i32.store)
  (func (;18;) (type 7)
    (local i32)
    i32.const 400
    call 0
    i32.const 100
    i32.const 4
    call 13
    set_local 0)
  (memory (;0;) 1)
  (export "memory" (memory 0))
  (export "malloc" (func 0))
  (export "free" (func 1))
  (export "getHeapPtr" (func 4))
  (export "getFreeMemory" (func 5))
  (export "getOriginalHeapPtr" (func 6))
  (export "Array__set" (func 13))
  (export "Array_new" (func 14))
  (export "Array_length" (func 15))
  (export "Array_op_get" (func 16))
  (export "Array_op_set" (func 17))
  (export "test_1" (func 18))
  (data (i32.const 8) "\db\0fI@(\00\00\00(\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"))
