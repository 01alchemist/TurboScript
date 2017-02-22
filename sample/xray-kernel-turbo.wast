(module
  (type (;0;) (func (result i32)))
  (type (;1;) (func (param i32) (result i32)))
  (type (;2;) (func (param i32)))
  (type (;3;) (func (param i32 i32)))
  (type (;4;) (func (param f64) (result f64)))
  (type (;5;) (func (param f32) (result f32)))
  (type (;6;) (func (param f64 f64) (result f64)))
  (type (;7;) (func (param f32 f32) (result f32)))
  (type (;8;) (func (param i32 i32) (result i32)))
  (type (;9;) (func (param i32 i32 i32)))
  (type (;10;) (func (param i32 i32 i32) (result i32)))
  (type (;11;) (func (param i32 i32) (result f64)))
  (type (;12;) (func (param i32 i32 f64)))
  (type (;13;) (func (result f32)))
  (type (;14;) (func (result f64)))
  (type (;15;) (func (param i32 f32 f32 f32) (result i32)))
  (type (;16;) (func (param i32) (result f32)))
  (type (;17;) (func (param i32 f32) (result f32)))
  (type (;18;) (func (param i32 i32) (result f32)))
  (type (;19;) (func (param i32 f32 i32) (result i32)))
  (type (;20;) (func (param i32 i32 f32 f32 i32) (result i32)))
  (type (;21;) (func (param i32 i32 f32 f32) (result f32)))
  (type (;22;) (func (param i32 f64 f64 f64) (result i32)))
  (type (;23;) (func (param i32 f64 i32) (result i32)))
  (type (;24;) (func (param i32) (result f64)))
  (type (;25;) (func (param i32 i32 f64 i32) (result i32)))
  (type (;26;) (func (param i32 i32 i32 i32) (result i32)))
  (import "foreign" "random" (func (;0;) (type 0)))
  (import "Math" "abs" (func (;1;) (type 4)))
  (import "Math" "floor" (func (;2;) (type 5)))
  (import "Math" "max" (func (;3;) (type 6)))
  (import "Math" "min" (func (;4;) (type 6)))
  (import "Math" "pow" (func (;5;) (type 6)))
  (import "Math" "sqrt" (func (;6;) (type 4)))
  (func (;7;) (type 1) (param i32) (result i32)
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
    call 9
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
    call 15
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
  (func (;8;) (type 2) (param i32)
    (local i32)
    get_local 0
    call 16
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
    call 17
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
  (func (;9;) (type 1) (param i32) (result i32)
    (local i32)
    i32.const 0
    i32.load offset=20
    i32.const 0
    i32.gt_u
    if  ;; label = @1
      block  ;; label = @2
        get_local 0
        call 10
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
            call 15
            i32.const 0
            i32.const 0
            i32.load offset=16
            get_local 1
            call 17
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
  (func (;10;) (type 1) (param i32) (result i32)
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
        call 17
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
  (func (;11;) (type 0) (result i32)
    i32.const 0
    i32.load offset=12
    return)
  (func (;12;) (type 1) (param i32) (result i32)
    get_local 0
    i32.load
    return)
  (func (;13;) (type 3) (param i32 i32)
    get_local 0
    get_local 0
    i32.load
    i32.const 7
    i32.and
    get_local 1
    i32.or
    i32.store)
  (func (;14;) (type 3) (param i32 i32)
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
  (func (;15;) (type 2) (param i32)
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
  (func (;16;) (type 2) (param i32)
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
  (func (;17;) (type 1) (param i32) (result i32)
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
  (func (;18;) (type 5) (param f32) (result f32)
    get_local 0
    f64.promote/f32
    call 1
    f32.demote/f64
    return)
  (func (;19;) (type 5) (param f32) (result f32)
    get_local 0
    f64.promote/f32
    call 6
    f32.demote/f64
    return)
  (func (;20;) (type 7) (param f32 f32) (result f32)
    get_local 0
    f64.promote/f32
    get_local 1
    f64.promote/f32
    call 5
    f32.demote/f64
    return)
  (func (;21;) (type 7) (param f32 f32) (result f32)
    get_local 0
    f64.promote/f32
    get_local 1
    f64.promote/f32
    call 4
    f32.demote/f64
    return)
  (func (;22;) (type 7) (param f32 f32) (result f32)
    get_local 0
    f64.promote/f32
    get_local 1
    f64.promote/f32
    call 3
    f32.demote/f64
    return)
  (func (;23;) (type 8) (param i32 i32) (result i32)
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
  (func (;24;) (type 9) (param i32 i32 i32)
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
  (func (;25;) (type 10) (param i32 i32 i32) (result i32)
    get_local 0
    get_local 1
    i32.store
    get_local 0
    get_local 2
    i32.store offset=4
    get_local 0
    return)
  (func (;26;) (type 1) (param i32) (result i32)
    get_local 0
    i32.load
    get_local 0
    i32.load offset=4
    i32.div_s
    return)
  (func (;27;) (type 8) (param i32 i32) (result i32)
    get_local 0
    get_local 1
    i32.store
    get_local 0
    get_local 1
    i32.const 3
    i32.shl
    i32.store offset=4
    get_local 0
    return)
  (func (;28;) (type 11) (param i32 i32) (result f64)
    get_local 1
    get_local 0
    i32.load
    i32.lt_s
    if  ;; label = @1
      block  ;; label = @2
        get_local 0
        i32.const 32
        i32.add
        get_local 1
        i32.const 3
        i32.shl
        i32.const 2
        i32.shl
        i32.add
        f64.load
        return
      end
    end
    f64.const 0x0p+0 (;=0;)
    return)
  (func (;29;) (type 12) (param i32 i32 f64)
    get_local 0
    i32.const 32
    i32.add
    get_local 1
    i32.const 3
    i32.shl
    i32.const 2
    i32.shl
    i32.add
    get_local 2
    f64.store)
  (func (;30;) (type 13) (result f32)
    call 0
    i32.const 0
    i32.load offset=32
    i32.div_s
    f32.convert_s/i32
    return)
  (func (;31;) (type 14) (result f64)
    call 0
    f64.convert_s/i32
    return)
  (func (;32;) (type 15) (param i32 f32 f32 f32) (result i32)
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
  (func (;33;) (type 8) (param i32 i32) (result i32)
    get_local 0
    f32.load
    get_local 1
    f32.load
    f32.eq
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=4
    f32.eq
    i32.and
    i32.const 1
    i32.eq
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=8
    f32.eq
    i32.and
    i32.const 1
    i32.eq
    return)
  (func (;34;) (type 1) (param i32) (result i32)
    (local i32)
    get_local 0
    f32.load
    f32.const 0x0p+0 (;=0;)
    f32.eq
    get_local 0
    f32.load offset=4
    f32.const 0x0p+0 (;=0;)
    f32.eq
    i32.and
    i32.const 1
    i32.eq
    get_local 0
    f32.load offset=8
    f32.const 0x0p+0 (;=0;)
    f32.eq
    i32.and
    i32.const 1
    i32.eq
    set_local 1
    get_local 1
    return)
  (func (;35;) (type 15) (param i32 f32 f32 f32) (result i32)
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
  (func (;36;) (type 8) (param i32 i32) (result i32)
    get_local 0
    get_local 1
    f32.load
    f32.store
    get_local 0
    get_local 1
    f32.load offset=4
    f32.store offset=4
    get_local 0
    get_local 1
    f32.load offset=8
    f32.store offset=8
    get_local 0
    return)
  (func (;37;) (type 1) (param i32) (result i32)
    i32.const 12
    call 7
    get_local 0
    f32.load
    get_local 0
    f32.load offset=4
    get_local 0
    f32.load offset=8
    call 32
    return)
  (func (;38;) (type 16) (param i32) (result f32)
    get_local 0
    f32.load
    get_local 0
    f32.load
    f32.mul
    get_local 0
    f32.load offset=4
    get_local 0
    f32.load offset=4
    f32.mul
    f32.add
    get_local 0
    f32.load offset=8
    get_local 0
    f32.load offset=8
    f32.mul
    f32.add
    call 19
    return)
  (func (;39;) (type 17) (param i32 f32) (result f32)
    (local i32 f32 f32 f32 f32 f32)
    get_local 1
    f32.const 0x1p+1 (;=2;)
    f32.eq
    if  ;; label = @1
      block  ;; label = @2
        get_local 0
        call 38
        return
      end
    end
    get_local 0
    i32.const 0
    call 43
    set_local 2
    get_local 2
    f32.load
    get_local 1
    call 20
    set_local 3
    get_local 2
    f32.load offset=4
    get_local 1
    call 20
    set_local 4
    get_local 2
    f32.load offset=8
    get_local 1
    call 20
    set_local 5
    get_local 3
    get_local 4
    f32.add
    get_local 5
    f32.add
    set_local 6
    get_local 6
    f32.const 0x1p+0 (;=1;)
    get_local 1
    f32.div
    call 20
    set_local 7
    get_local 2
    call 8
    get_local 7
    return)
  (func (;40;) (type 18) (param i32 i32) (result f32)
    get_local 0
    f32.load
    get_local 1
    f32.load
    f32.mul
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=4
    f32.mul
    f32.add
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=8
    f32.mul
    f32.add
    return)
  (func (;41;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=8
    f32.mul
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=4
    f32.mul
    f32.sub
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load
    f32.mul
    get_local 0
    f32.load
    get_local 1
    f32.load offset=8
    f32.mul
    f32.sub
    get_local 0
    f32.load
    get_local 1
    f32.load offset=4
    f32.mul
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load
    f32.mul
    f32.sub
    call 35
    return)
  (func (;42;) (type 8) (param i32 i32) (result i32)
    (local f32)
    get_local 1
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 1
    else
      i32.const 12
      call 7
    end
    set_local 1
    get_local 0
    call 38
    set_local 2
    get_local 1
    get_local 0
    f32.load
    get_local 2
    f32.div
    get_local 0
    f32.load offset=4
    get_local 2
    f32.div
    get_local 0
    f32.load offset=8
    get_local 2
    f32.div
    call 35
    return)
  (func (;43;) (type 8) (param i32 i32) (result i32)
    get_local 1
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 1
    else
      i32.const 12
      call 7
    end
    set_local 1
    get_local 1
    get_local 0
    f32.load
    call 18
    get_local 0
    f32.load offset=4
    call 18
    get_local 0
    f32.load offset=8
    call 18
    call 35
    return)
  (func (;44;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
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
    call 35
    return)
  (func (;45;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    f32.load
    f32.sub
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=4
    f32.sub
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=8
    f32.sub
    call 35
    return)
  (func (;46;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    f32.load
    f32.mul
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=4
    f32.mul
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=8
    f32.mul
    call 35
    return)
  (func (;47;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    f32.load
    f32.div
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=4
    f32.div
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=8
    f32.div
    call 35
    return)
  (func (;48;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    f32.load
    get_local 0
    f32.load
    get_local 1
    f32.load
    f32.div
    call 2
    f32.mul
    f32.sub
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=4
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=4
    f32.div
    call 2
    f32.mul
    f32.sub
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=8
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=8
    f32.div
    call 2
    f32.mul
    f32.sub
    call 35
    return)
  (func (;49;) (type 19) (param i32 f32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    f32.add
    get_local 0
    f32.load offset=4
    get_local 1
    f32.add
    get_local 0
    f32.load offset=8
    get_local 1
    f32.add
    call 35
    return)
  (func (;50;) (type 19) (param i32 f32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    f32.sub
    get_local 0
    f32.load offset=4
    get_local 1
    f32.sub
    get_local 0
    f32.load offset=8
    get_local 1
    f32.sub
    call 35
    return)
  (func (;51;) (type 19) (param i32 f32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    f32.mul
    get_local 0
    f32.load offset=4
    get_local 1
    f32.mul
    get_local 0
    f32.load offset=8
    get_local 1
    f32.mul
    call 35
    return)
  (func (;52;) (type 19) (param i32 f32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    f32.div
    get_local 0
    f32.load offset=4
    get_local 1
    f32.div
    get_local 0
    f32.load offset=8
    get_local 1
    f32.div
    call 35
    return)
  (func (;53;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    f32.load
    call 21
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=4
    call 21
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=8
    call 21
    call 35
    return)
  (func (;54;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    f32.load
    call 22
    get_local 0
    f32.load offset=4
    get_local 1
    f32.load offset=4
    call 22
    get_local 0
    f32.load offset=8
    get_local 1
    f32.load offset=8
    call 22
    call 35
    return)
  (func (;55;) (type 10) (param i32 i32 i32) (result i32)
    (local f32 f32 f32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 0
    f32.load
    call 18
    set_local 3
    get_local 0
    f32.load offset=4
    call 18
    set_local 4
    get_local 0
    f32.load offset=8
    call 18
    set_local 5
    get_local 3
    get_local 4
    f32.le
    get_local 3
    get_local 5
    f32.le
    i32.and
    i32.const 1
    i32.eq
    if  ;; label = @1
      block  ;; label = @2
        get_local 2
        f32.const 0x1p+0 (;=1;)
        f32.const 0x0p+0 (;=0;)
        f32.const 0x0p+0 (;=0;)
        call 35
        return
      end
    else
      block  ;; label = @2
        get_local 4
        get_local 3
        f32.le
        get_local 4
        get_local 5
        f32.le
        i32.and
        i32.const 1
        i32.eq
        if  ;; label = @3
          block  ;; label = @4
            get_local 2
            f32.const 0x0p+0 (;=0;)
            f32.const 0x1p+0 (;=1;)
            f32.const 0x0p+0 (;=0;)
            call 35
            return
          end
        end
      end
    end
    get_local 2
    f32.const 0x0p+0 (;=0;)
    f32.const 0x0p+0 (;=0;)
    f32.const 0x1p+0 (;=1;)
    call 35
    return)
  (func (;56;) (type 18) (param i32 i32) (result f32)
    get_local 0
    f32.load
    get_local 0
    f32.load offset=4
    call 21
    get_local 0
    f32.load offset=8
    call 21
    return)
  (func (;57;) (type 18) (param i32 i32) (result f32)
    get_local 0
    f32.load
    get_local 0
    f32.load offset=4
    call 22
    get_local 0
    f32.load offset=8
    call 22
    return)
  (func (;58;) (type 10) (param i32 i32 i32) (result i32)
    get_local 0
    f32.const 0x1p+1 (;=2;)
    get_local 0
    get_local 1
    call 40
    f32.mul
    get_local 2
    call 51
    set_local 2
    get_local 1
    get_local 2
    get_local 2
    call 45
    return)
  (func (;59;) (type 20) (param i32 i32 f32 f32 i32) (result i32)
    (local f32 f32 f32 f32 i32)
    get_local 4
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 4
    else
      i32.const 12
      call 7
    end
    set_local 4
    get_local 2
    get_local 3
    f32.div
    set_local 5
    f32.const 0x0p+0 (;=0;)
    unreachable
    unreachable
    unreachable
    unreachable
    get_local 0
    get_local 1
    call 40
    f32.sub
    set_local 6
    get_local 5
    get_local 5
    f32.mul
    f32.const 0x1p+0 (;=1;)
    get_local 6
    get_local 6
    f32.mul
    f32.sub
    f32.mul
    set_local 7
    get_local 7
    f32.const 0x1p+0 (;=1;)
    f32.gt
    if  ;; label = @1
      block  ;; label = @2
        get_local 4
        f32.const 0x0p+0 (;=0;)
        f32.const 0x0p+0 (;=0;)
        f32.const 0x0p+0 (;=0;)
        call 35
        return
      end
    end
    f32.const 0x1p+0 (;=1;)
    get_local 7
    f32.sub
    call 19
    set_local 8
    get_local 1
    get_local 5
    get_local 4
    call 51
    get_local 0
    get_local 5
    get_local 6
    get_local 8
    f32.sub
    f32.mul
    i32.const 0
    call 51
    set_local 9
    get_local 4
    get_local 9
    get_local 4
    call 44
    get_local 9
    call 8
    get_local 4
    return)
  (func (;60;) (type 21) (param i32 i32 f32 f32) (result f32)
    (local f32 f32 f32 f32 f32 f32)
    get_local 2
    get_local 3
    f32.div
    set_local 4
    f32.const 0x0p+0 (;=0;)
    unreachable
    unreachable
    unreachable
    unreachable
    get_local 0
    get_local 1
    call 40
    f32.sub
    set_local 5
    get_local 4
    get_local 4
    f32.mul
    f32.const 0x1p+0 (;=1;)
    get_local 5
    get_local 5
    f32.mul
    f32.sub
    f32.mul
    set_local 6
    get_local 6
    f32.const 0x1p+0 (;=1;)
    f32.gt
    if  ;; label = @1
      block  ;; label = @2
        f32.const 0x1p+0 (;=1;)
        return
      end
    end
    f32.const 0x1p+0 (;=1;)
    get_local 6
    f32.sub
    call 19
    set_local 7
    get_local 2
    get_local 5
    f32.mul
    get_local 3
    get_local 7
    f32.mul
    f32.sub
    get_local 2
    get_local 5
    f32.mul
    get_local 3
    get_local 7
    f32.mul
    f32.add
    f32.div
    set_local 8
    get_local 3
    get_local 5
    f32.mul
    get_local 2
    get_local 7
    f32.mul
    f32.sub
    get_local 3
    get_local 5
    f32.mul
    get_local 2
    get_local 7
    f32.mul
    f32.add
    f32.div
    set_local 9
    get_local 8
    get_local 8
    f32.mul
    get_local 9
    get_local 9
    f32.mul
    f32.add
    f32.const 0x1p+1 (;=2;)
    f32.div
    return)
  (func (;61;) (type 19) (param i32 f32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 12
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f32.load
    get_local 1
    call 20
    get_local 0
    f32.load offset=4
    get_local 1
    call 20
    get_local 0
    f32.load offset=8
    get_local 1
    call 20
    call 35
    return)
  (func (;62;) (type 1) (param i32) (result i32)
    (local f32 f32 f32)
    call 30
    f32.const 0x1p+1 (;=2;)
    f32.mul
    f32.const 0x1p+0 (;=1;)
    f32.sub
    set_local 1
    call 30
    f32.const 0x1p+1 (;=2;)
    f32.mul
    f32.const 0x1p+0 (;=1;)
    f32.sub
    set_local 2
    call 30
    f32.const 0x1p+1 (;=2;)
    f32.mul
    f32.const 0x1p+0 (;=1;)
    f32.sub
    set_local 3
    block  ;; label = @1
      loop  ;; label = @2
        get_local 1
        get_local 1
        f32.mul
        get_local 2
        get_local 2
        f32.mul
        f32.add
        get_local 3
        get_local 3
        f32.mul
        f32.add
        f32.const 0x1p+0 (;=1;)
        f32.gt
        i32.eqz
        br_if 1 (;@1;)
        call 30
        f32.const 0x1p+1 (;=2;)
        f32.mul
        f32.const 0x1p+0 (;=1;)
        f32.sub
        set_local 1
        call 30
        f32.const 0x1p+1 (;=2;)
        f32.mul
        f32.const 0x1p+0 (;=1;)
        f32.sub
        set_local 2
        call 30
        f32.const 0x1p+1 (;=2;)
        f32.mul
        f32.const 0x1p+0 (;=1;)
        f32.sub
        set_local 3
        br 0 (;@2;)
      end
    end
    get_local 0
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 0
    else
      i32.const 12
      call 7
    end
    set_local 0
    get_local 0
    get_local 1
    get_local 2
    get_local 3
    call 35
    get_local 0
    get_local 0
    call 42
    return)
  (func (;63;) (type 22) (param i32 f64 f64 f64) (result i32)
    get_local 0
    get_local 1
    f64.store
    get_local 0
    get_local 2
    f64.store offset=8
    get_local 0
    get_local 3
    f64.store offset=16
    get_local 0
    return)
  (func (;64;) (type 22) (param i32 f64 f64 f64) (result i32)
    get_local 0
    get_local 1
    f64.store
    get_local 0
    get_local 2
    f64.store offset=8
    get_local 0
    get_local 3
    f64.store offset=16
    get_local 0
    return)
  (func (;65;) (type 8) (param i32 i32) (result i32)
    (local i32 i32 i32 i32)
    get_local 1
    i32.const 16
    i32.shr_s
    i32.const 255
    i32.and
    i32.const 255
    i32.div_s
    set_local 2
    get_local 1
    i32.const 8
    i32.shr_s
    i32.const 255
    i32.and
    i32.const 255
    i32.div_s
    set_local 3
    get_local 1
    i32.const 255
    i32.and
    i32.const 255
    i32.div_s
    set_local 4
    i32.const 24
    call 7
    get_local 2
    f64.convert_s/i32
    get_local 3
    f64.convert_s/i32
    get_local 4
    f64.convert_s/i32
    call 63
    set_local 5
    get_local 5
    f64.const 0x1.199999999999ap+1 (;=2.2;)
    get_local 5
    call 76
    return)
  (func (;66;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 24
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f64.load
    get_local 1
    f64.load
    f64.add
    get_local 0
    f64.load offset=8
    get_local 1
    f64.load offset=8
    f64.add
    get_local 0
    f64.load offset=16
    get_local 1
    f64.load offset=16
    f64.add
    call 64
    return)
  (func (;67;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 24
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f64.load
    get_local 1
    f64.load
    f64.sub
    get_local 0
    f64.load offset=8
    get_local 1
    f64.load offset=8
    f64.sub
    get_local 0
    f64.load offset=16
    get_local 1
    f64.load offset=16
    f64.sub
    call 64
    return)
  (func (;68;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 24
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f64.load
    get_local 1
    f64.load
    f64.mul
    get_local 0
    f64.load offset=8
    get_local 1
    f64.load offset=8
    f64.mul
    get_local 0
    f64.load offset=16
    get_local 1
    f64.load offset=16
    f64.mul
    call 64
    return)
  (func (;69;) (type 23) (param i32 f64 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 24
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f64.load
    get_local 1
    f64.mul
    get_local 0
    f64.load offset=8
    get_local 1
    f64.mul
    get_local 0
    f64.load offset=16
    get_local 1
    f64.mul
    call 64
    return)
  (func (;70;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 24
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f64.load
    get_local 1
    f64.load
    f64.div
    get_local 0
    f64.load offset=8
    get_local 1
    f64.load offset=8
    f64.div
    get_local 0
    f64.load offset=16
    get_local 1
    f64.load offset=16
    f64.div
    call 64
    return)
  (func (;71;) (type 23) (param i32 f64 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 24
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f64.load
    get_local 1
    f64.div
    get_local 0
    f64.load offset=8
    get_local 1
    f64.div
    get_local 0
    f64.load offset=16
    get_local 1
    f64.div
    call 64
    return)
  (func (;72;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 24
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f64.load
    get_local 1
    f64.load
    call 4
    get_local 0
    f64.load offset=8
    get_local 1
    f64.load offset=8
    call 4
    get_local 0
    f64.load offset=16
    get_local 1
    f64.load offset=16
    call 4
    call 64
    return)
  (func (;73;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 24
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f64.load
    get_local 1
    f64.load
    call 3
    get_local 0
    f64.load offset=8
    get_local 1
    f64.load offset=8
    call 3
    get_local 0
    f64.load offset=16
    get_local 1
    f64.load offset=16
    call 3
    call 64
    return)
  (func (;74;) (type 24) (param i32) (result f64)
    get_local 0
    f64.load
    get_local 0
    f64.load offset=8
    call 4
    get_local 0
    f64.load offset=16
    call 4
    return)
  (func (;75;) (type 24) (param i32) (result f64)
    get_local 0
    f64.load
    get_local 0
    f64.load offset=8
    call 3
    get_local 0
    f64.load offset=16
    call 3
    return)
  (func (;76;) (type 23) (param i32 f64 i32) (result i32)
    get_local 2
    i32.const 0
    i32.ne
    if i32  ;; label = @1
      get_local 2
    else
      i32.const 24
      call 7
    end
    set_local 2
    get_local 2
    get_local 0
    f64.load
    get_local 1
    call 5
    get_local 0
    f64.load offset=8
    get_local 1
    call 5
    get_local 0
    f64.load offset=16
    get_local 1
    call 5
    call 64
    return)
  (func (;77;) (type 25) (param i32 i32 f64 i32) (result i32)
    (local i32)
    get_local 0
    f64.const 0x1p+0 (;=1;)
    get_local 2
    f64.sub
    get_local 3
    call 69
    set_local 3
    get_local 1
    get_local 2
    i32.const 0
    call 69
    set_local 4
    get_local 3
    get_local 4
    get_local 3
    call 66
    set_local 3
    get_local 4
    call 8
    get_local 3
    return)
  (func (;78;) (type 26) (param i32 i32 i32 i32) (result i32)
    (local i32)
    get_local 0
    get_local 1
    i32.store
    get_local 0
    get_local 2
    i32.store offset=4
    get_local 0
    get_local 3
    i32.store8 offset=8
    get_local 1
    get_local 2
    i32.mul
    i32.const 2
    i32.shl
    set_local 4
    get_local 0
    i32.const 8
    call 7
    i32.store offset=16
    get_local 0
    return)
  (func (;79;) (type 10) (param i32 i32 i32) (result i32)
    get_local 2
    get_local 0
    i32.load
    i32.const 2
    i32.shl
    i32.mul
    get_local 1
    i32.const 2
    i32.shl
    i32.add
    return)
  (func (;80;) (type 3) (param i32 i32)
    (local i32)
    i32.const 0
    set_local 2
    block  ;; label = @1
      loop  ;; label = @2
        get_local 2
        get_local 1
        call 26
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        get_local 0
        i32.load offset=16
        get_local 2
        get_local 1
        get_local 2
        call 23
        call 24
        get_local 2
        i32.const 1
        i32.add
        set_local 2
        br 0 (;@2;)
      end
    end)
  (memory (;0;) 1)
  (export "memory" (memory 0))
  (export "malloc" (func 7))
  (export "free" (func 8))
  (export "getHeapPtr" (func 11))
  (export "Array_op_get" (func 23))
  (export "Array_op_set" (func 24))
  (export "Array__set" (func 25))
  (export "Array_length" (func 26))
  (export "Float64Array__set" (func 27))
  (export "Float64Array_op_get" (func 28))
  (export "Float64Array_op_set" (func 29))
  (export "randomFloat32" (func 30))
  (export "randomFloat64" (func 31))
  (export "Vector3__set" (func 32))
  (export "Vector3_isEqual" (func 33))
  (export "Vector3_isZero" (func 34))
  (export "Vector3_set" (func 35))
  (export "Vector3_copy" (func 36))
  (export "Vector3_clone" (func 37))
  (export "Vector3_length" (func 38))
  (export "Vector3_lengthN" (func 39))
  (export "Vector3_dot" (func 40))
  (export "Vector3_cross" (func 41))
  (export "Vector3_normalize" (func 42))
  (export "Vector3_abs" (func 43))
  (export "Vector3_add" (func 44))
  (export "Vector3_sub" (func 45))
  (export "Vector3_mul" (func 46))
  (export "Vector3_div" (func 47))
  (export "Vector3_mod" (func 48))
  (export "Vector3_addScalar" (func 49))
  (export "Vector3_subScalar" (func 50))
  (export "Vector3_mulScalar" (func 51))
  (export "Vector3_divScalar" (func 52))
  (export "Vector3_min" (func 53))
  (export "Vector3_max" (func 54))
  (export "Vector3_minAxis" (func 55))
  (export "Vector3_minComponent" (func 56))
  (export "Vector3_maxComponent" (func 57))
  (export "Vector3_reflect" (func 58))
  (export "Vector3_refract" (func 59))
  (export "Vector3_reflectance" (func 60))
  (export "Vector3_pow" (func 61))
  (export "randomUnitVector3" (func 62))
  (export "Color__set" (func 63))
  (export "Color_set" (func 64))
  (export "Color_hexColor" (func 65))
  (export "Color_add" (func 66))
  (export "Color_sub" (func 67))
  (export "Color_mul" (func 68))
  (export "Color_mulScalar" (func 69))
  (export "Color_div" (func 70))
  (export "Color_divScalar" (func 71))
  (export "Color_min" (func 72))
  (export "Color_max" (func 73))
  (export "Color_minComponent" (func 74))
  (export "Color_maxComponent" (func 75))
  (export "Color_pow" (func 76))
  (export "Color_mix" (func 77))
  (export "Image__set" (func 78))
  (export "Image_pixOffset" (func 79))
  (export "Image_setRaw" (func 80))
  (data (i32.const 8) "8\00\00\008\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\ff\ff\ff\ff\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"))
