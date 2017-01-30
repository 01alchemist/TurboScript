(module
  (type (;0;) (func))
  (type (;1;) (func (param i32) (result i32)))
  (type (;2;) (func (param i32)))
  (type (;3;) (func (result i32)))
  (type (;4;) (func (param i32 i32)))
  (type (;5;) (func (param i32 f32 f32 f32) (result i32)))
  (type (;6;) (func (param i32 i32) (result i32)))
  (type (;7;) (func (param f32 f32 f32) (result i32)))
  (func (;0;) (type 0)
    i32.const 0
    i32.const 0
    i32.store offset=20
    i32.const 0
    i32.const 0
    i32.store offset=24
    i32.const 0
    i32.const 0
    i32.store offset=28)
  (func (;1;) (type 1) (param i32) (result i32)
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
    call 3
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
    i32.load offset=12
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
    call 13
    get_local 6
    i32.const 4
    i32.add
    call 16
    get_local 6
    get_local 2
    call 14
    i32.const 0
    get_local 5
    i32.const 4
    i32.add
    i32.store offset=12
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
  (func (;2;) (type 2) (param i32)
    (local i32)
    get_local 0
    call 18
    i32.const 0
    i32.load offset=24
    i32.const 0
    i32.eq
    if  ;; label = @1
      block  ;; label = @2
        i32.const 0
        get_local 0
        i32.store offset=24
      end
    end
    i32.const 0
    i32.const 0
    i32.load offset=16
    get_local 0
    call 19
    i32.add
    i32.store offset=16
    get_local 0
    i32.const 4
    i32.add
    set_local 1
    i32.const 0
    i32.load offset=28
    i32.const 0
    i32.gt_u
    if  ;; label = @1
      block  ;; label = @2
        get_local 1
        i32.const 0
        i32.load offset=28
        i32.store
        i32.const 0
        i32.load offset=28
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
    i32.store offset=28
    i32.const 0
    i32.const 0
    i32.load offset=20
    i32.const 1
    i32.add
    i32.store offset=20)
  (func (;3;) (type 1) (param i32) (result i32)
    (local i32)
    i32.const 0
    i32.load offset=20
    i32.const 0
    i32.gt_u
    if  ;; label = @1
      block  ;; label = @2
        get_local 0
        call 4
        set_local 1
        get_local 1
        i32.const 0
        i32.gt_s
        if  ;; label = @3
          block  ;; label = @4
            get_local 1
            i32.const 0
            i32.load offset=24
            i32.eq
            if  ;; label = @5
              block  ;; label = @6
                i32.const 0
                get_local 1
                call 12
                i32.store offset=24
              end
            end
            get_local 1
            i32.const 0
            i32.load offset=28
            i32.eq
            if  ;; label = @5
              block  ;; label = @6
                i32.const 0
                i32.const 0
                i32.store offset=28
              end
            end
            i32.const 0
            i32.const 0
            i32.load offset=20
            i32.const 1
            i32.sub
            i32.store offset=20
            get_local 1
            call 16
            i32.const 0
            i32.const 0
            i32.load offset=16
            get_local 1
            call 19
            i32.sub
            i32.store offset=16
            get_local 1
            return
          end
        end
      end
    end
    i32.const 0
    return)
  (func (;4;) (type 1) (param i32) (result i32)
    (local i32)
    i32.const 0
    i32.load offset=24
    set_local 1
    block  ;; label = @1
      loop  ;; label = @2
        get_local 1
        i32.const 0
        i32.ne
        i32.eqz
        br_if 1 (;@1;)
        get_local 1
        call 19
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
  (func (;5;) (type 3) (result i32)
    i32.const 0
    i32.load offset=12
    return)
  (func (;6;) (type 3) (result i32)
    i32.const 0
    i32.load offset=16
    return)
  (func (;7;) (type 3) (result i32)
    i32.const 0
    i32.load offset=8
    return)
  (func (;8;) (type 3) (result i32)
    i32.const 0
    i32.load offset=20
    return)
  (func (;9;) (type 3) (result i32)
    i32.const 0
    i32.load offset=24
    return)
  (func (;10;) (type 3) (result i32)
    i32.const 0
    i32.load offset=28
    return)
  (func (;11;) (type 1) (param i32) (result i32)
    get_local 0
    i32.const 4
    i32.add
    i32.load8_u
    return)
  (func (;12;) (type 1) (param i32) (result i32)
    get_local 0
    i32.load
    return)
  (func (;13;) (type 4) (param i32 i32)
    get_local 0
    get_local 0
    i32.load
    i32.const 7
    i32.and
    get_local 1
    i32.or
    i32.store)
  (func (;14;) (type 4) (param i32 i32)
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
  (func (;15;) (type 1) (param i32) (result i32)
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
  (func (;16;) (type 2) (param i32)
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
    i32.store)
  (func (;17;) (type 1) (param i32) (result i32)
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
  (func (;18;) (type 2) (param i32)
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
  (func (;19;) (type 1) (param i32) (result i32)
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
  (func (;20;) (type 5) (param i32 f32 f32 f32) (result i32)
    get_local 0
    get_local 1
    f32.store
    get_local 0
    get_local 2
    f32.store offset=4
    get_local 0
    get_local 3
    f32.store offset=8
    get_local 0
    return)
  (func (;21;) (type 6) (param i32 i32) (result i32)
    i32.const 12
    call 1
    get_local 0
    f32.load
    get_local 1
    f32.load
    f32.add
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=4
    f32.add
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=8
    f32.add
    call 20
    return)
  (func (;22;) (type 7) (param f32 f32 f32) (result i32)
    i32.const 12
    call 1
    get_local 0
    get_local 1
    get_local 2
    call 20
    return)
  (func (;23;) (type 6) (param i32 i32) (result i32)
    get_local 0
    get_local 1
    call 21
    return)
  (func (;24;) (type 2) (param i32)
    get_local 0
    call 2)
  (func (;25;) (type 0)
    (local i32)
    i32.const 12
    call 1
    f32.const 0x1p+0 (;=1;)
    f32.const 0x1p+0 (;=1;)
    f32.const 0x1p+0 (;=1;)
    call 20
    set_local 0
    get_local 0
    call 2)
  (func (;26;) (type 0)
    (local i32 i32)
    i32.const 0
    set_local 0
    block  ;; label = @1
      loop  ;; label = @2
        get_local 0
        i32.const 1000
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        i32.const 12
        call 1
        f32.const 0x1p+0 (;=1;)
        f32.const 0x1p+0 (;=1;)
        f32.const 0x1p+0 (;=1;)
        call 20
        set_local 1
        get_local 1
        call 2
        get_local 0
        i32.const 1
        i32.add
        set_local 0
        br 0 (;@2;)
      end
    end)
  (memory (;0;) 1)
  (export "memory" (memory 0))
  (export "malloc" (func 1))
  (export "free" (func 2))
  (export "getFreeChunk" (func 3))
  (export "findChunk" (func 4))
  (export "getHeapPtr" (func 5))
  (export "getFreeMemory" (func 6))
  (export "getOriginalHeapPtr" (func 7))
  (export "getNumFreeChunks" (func 8))
  (export "getFirstFree" (func 9))
  (export "getLastFree" (func 10))
  (export "prevFree" (func 11))
  (export "nextFree" (func 12))
  (export "getPrevInuse" (func 15))
  (export "setInuse" (func 16))
  (export "getInuse" (func 17))
  (export "clearInuse" (func 18))
  (export "getChunkSize" (func 19))
  (export "newVec3" (func 22))
  (export "addVec3" (func 23))
  (export "destroyVec3" (func 24))
  (export "destroyTest" (func 25))
  (export "memoryTest" (func 26))
  (start 0)
  (data (i32.const 8) "(\00\00\00(\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"))
