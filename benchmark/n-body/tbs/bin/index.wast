(module
  (type (;0;) (func (param f64) (result f64)))
  (type (;1;) (func (param i32) (result i32)))
  (type (;2;) (func (param i32)))
  (type (;3;) (func (param i32 i32)))
  (type (;4;) (func (param i32 i32) (result i32)))
  (type (;5;) (func (param i32 i32 i32)))
  (type (;6;) (func (param f64 f64 f64 f64 f64 f64 f64) (result i32)))
  (type (;7;) (func (param i32 f64 f64 f64) (result i32)))
  (type (;8;) (func (result i32)))
  (type (;9;) (func (param i32 f64)))
  (type (;10;) (func (param i32) (result f64)))
  (func (;0;) (type 1) (param i32) (result i32)
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
    i32.load offset=20
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
    call 5
    get_local 6
    i32.const 4
    i32.add
    call 7
    get_local 6
    get_local 2
    call 6
    i32.const 0
    get_local 5
    i32.const 4
    i32.add
    i32.store offset=20
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
  (func (;1;) (type 2) (param i32)
    (local i32 i32)
    i32.const 0
    set_local 1
    i32.const 0
    set_local 2
    get_local 0
    call 8
    i32.const 0
    i32.load offset=32
    i32.const 0
    i32.eq
    if  ;; label = @1
      block  ;; label = @2
        i32.const 0
        get_local 0
        i32.store offset=32
      end
    end
    i32.const 0
    i32.load offset=24
    set_local 2
    get_local 2
    get_local 0
    call 9
    i32.add
    set_local 2
    i32.const 0
    get_local 2
    i32.store offset=24
    get_local 0
    i32.const 4
    i32.add
    set_local 1
    i32.const 0
    i32.load offset=36
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      block  ;; label = @2
        get_local 1
        i32.const 0
        i32.load offset=36
        i32.store
        i32.const 0
        i32.load offset=36
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
    i32.store offset=36
    i32.const 0
    i32.const 0
    i32.load offset=28
    i32.const 1
    i32.add
    i32.store offset=28
    return)
  (func (;2;) (type 1) (param i32) (result i32)
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
    i32.load offset=32
    set_local 2
    i32.const 0
    i32.load offset=36
    set_local 3
    i32.const 0
    i32.load offset=24
    set_local 4
    i32.const 0
    i32.load offset=28
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
                call 4
                i32.store offset=32
              end
            end
            get_local 1
            get_local 3
            i32.eq
            if  ;; label = @5
              block  ;; label = @6
                i32.const 0
                i32.const 0
                i32.store offset=36
              end
            end
            i32.const 0
            i32.const 0
            i32.load offset=28
            i32.const 1
            i32.sub
            i32.store offset=28
            get_local 1
            call 7
            get_local 1
            call 9
            set_local 5
            get_local 4
            get_local 5
            i32.sub
            set_local 4
            i32.const 0
            get_local 4
            i32.store offset=24
            get_local 1
            return
          end
        end
      end
    end
    i32.const 0
    return)
  (func (;3;) (type 1) (param i32) (result i32)
    (local i32 i32)
    i32.const 0
    set_local 1
    i32.const 0
    set_local 2
    i32.const 0
    i32.load offset=32
    set_local 1
    block  ;; label = @1
      loop  ;; label = @2
        get_local 1
        i32.const 0
        i32.ne
        i32.eqz
        br_if 1 (;@1;)
        get_local 1
        call 9
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
  (func (;4;) (type 1) (param i32) (result i32)
    get_local 0
    i32.load
    return)
  (func (;5;) (type 3) (param i32 i32)
    get_local 0
    get_local 0
    i32.load
    i32.const 7
    i32.and
    get_local 1
    i32.or
    i32.store
    return)
  (func (;6;) (type 3) (param i32 i32)
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
    i32.store
    return)
  (func (;7;) (type 2) (param i32)
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
    i32.store
    return)
  (func (;8;) (type 2) (param i32)
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
    i32.store
    return)
  (func (;9;) (type 1) (param i32) (result i32)
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
  (func (;10;) (type 4) (param i32 i32) (result i32)
    (local i32)
    get_local 0
    i32.const 8
    i32.add
    call 0
    set_local 2
    get_local 2
    get_local 0
    i32.store
    get_local 2
    get_local 1
    i32.store offset=4
    get_local 2
    return)
  (func (;11;) (type 4) (param i32 i32) (result i32)
    (local i32)
    get_local 1
    get_local 0
    i32.load offset=4
    i32.mul
    set_local 2
    get_local 2
    i32.const 0
    i32.ge_s
    get_local 2
    get_local 0
    i32.load
    i32.lt_s
    i32.and
    i32.const 1
    i32.eq
    if  ;; label = @1
      block  ;; label = @2
        get_local 0
        i32.const 8
        i32.add
        get_local 2
        i32.add
        i32.load
        return
      end
    end
    i32.const 0
    return)
  (func (;12;) (type 5) (param i32 i32 i32)
    (local i32)
    get_local 1
    get_local 0
    i32.load offset=4
    i32.mul
    set_local 3
    get_local 3
    i32.const 0
    i32.ge_s
    get_local 3
    get_local 0
    i32.load
    i32.lt_s
    i32.and
    i32.const 1
    i32.eq
    if  ;; label = @1
      block  ;; label = @2
        get_local 0
        i32.const 8
        i32.add
        get_local 3
        i32.add
        get_local 2
        i32.store
      end
    end
    return)
  (func (;13;) (type 1) (param i32) (result i32)
    get_local 0
    i32.load
    get_local 0
    i32.load offset=4
    i32.div_s
    return)
  (func (;14;) (type 6) (param f64 f64 f64 f64 f64 f64 f64) (result i32)
    (local i32)
    i32.const 56
    call 0
    set_local 7
    get_local 7
    get_local 0
    f64.store
    get_local 7
    get_local 1
    f64.store offset=8
    get_local 7
    get_local 2
    f64.store offset=16
    get_local 7
    get_local 3
    f64.store offset=24
    get_local 7
    get_local 4
    f64.store offset=32
    get_local 7
    get_local 5
    f64.store offset=40
    get_local 7
    get_local 6
    f64.store offset=48
    get_local 7
    return)
  (func (;15;) (type 7) (param i32 f64 f64 f64) (result i32)
    get_local 0
    get_local 1
    f64.neg
    i32.const 0
    f64.load offset=40
    f64.div
    f64.store offset=24
    get_local 0
    get_local 2
    f64.neg
    i32.const 0
    f64.load offset=40
    f64.div
    f64.store offset=32
    get_local 0
    get_local 3
    f64.neg
    i32.const 0
    f64.load offset=40
    f64.div
    f64.store offset=40
    get_local 0
    return)
  (func (;16;) (type 8) (result i32)
    f64.const 0x1.35da0343cd92cp+2 (;=4.84143;)
    f64.const -0x1.290abc01fdb7cp+0 (;=-1.16032;)
    f64.const -0x1.a86f96c25ebfp-4 (;=-0.103622;)
    f64.const 0x1.b32ddb8ec9209p-10 (;=0.00166008;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const 0x1.f88ff93f670b6p-8 (;=0.00769901;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const -0x1.2199946debd8p-14 (;=-6.9046e-05;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const 0x1.f49601333c135p-11 (;=0.000954792;)
    i32.const 0
    f64.load offset=40
    f64.mul
    call 14
    return)
  (func (;17;) (type 8) (result i32)
    f64.const 0x1.0afcdc332ca67p+3 (;=8.34337;)
    f64.const 0x1.07fcb31de01bp+2 (;=4.1248;)
    f64.const -0x1.9d353e1eb467cp-2 (;=-0.403523;)
    f64.const -0x1.6abb60a8e1d76p-9 (;=-0.00276743;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const 0x1.47956257578b8p-8 (;=0.00499853;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const 0x1.829379cad4ac2p-16 (;=2.30417e-05;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const 0x1.2bc5eeff5e6f8p-12 (;=0.000285886;)
    i32.const 0
    f64.load offset=40
    f64.mul
    call 14
    return)
  (func (;18;) (type 8) (result i32)
    f64.const 0x1.9c9eacea7d9cfp+3 (;=12.8944;)
    f64.const -0x1.e38e8d626667ep+3 (;=-15.1112;)
    f64.const -0x1.c9557be257dap-3 (;=-0.223308;)
    f64.const 0x1.849383e87d954p-9 (;=0.0029646;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const 0x1.37c044ac0ace1p-9 (;=0.00237847;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const -0x1.f1983fedbfae8p-16 (;=-2.9659e-05;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const 0x1.6e44607a13bd2p-15 (;=4.36624e-05;)
    i32.const 0
    f64.load offset=40
    f64.mul
    call 14
    return)
  (func (;19;) (type 8) (result i32)
    f64.const 0x1.ec267a905572ap+3 (;=15.3797;)
    f64.const -0x1.9eb5833c8a22p+4 (;=-25.9193;)
    f64.const 0x1.6f1f393abe54p-3 (;=0.179259;)
    f64.const 0x1.5f5c9e51b431fp-9 (;=0.00268068;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const 0x1.aad5736999d88p-10 (;=0.00162824;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const -0x1.8f2070b7f976ep-14 (;=-9.51592e-05;)
    i32.const 0
    f64.load offset=48
    f64.mul
    f64.const 0x1.b0213ca2d0ef4p-15 (;=5.15139e-05;)
    i32.const 0
    f64.load offset=40
    f64.mul
    call 14
    return)
  (func (;20;) (type 8) (result i32)
    f64.const 0x0p+0 (;=0;)
    f64.const 0x0p+0 (;=0;)
    f64.const 0x0p+0 (;=0;)
    f64.const 0x0p+0 (;=0;)
    f64.const 0x0p+0 (;=0;)
    f64.const 0x0p+0 (;=0;)
    i32.const 0
    f64.load offset=40
    call 14
    return)
  (func (;21;) (type 1) (param i32) (result i32)
    (local i32 f64 f64 f64 i32 i32 i32 f64)
    i32.const 4
    call 0
    set_local 1
    f64.const 0x0p+0 (;=0;)
    set_local 2
    f64.const 0x0p+0 (;=0;)
    set_local 3
    f64.const 0x0p+0 (;=0;)
    set_local 4
    get_local 0
    call 13
    set_local 5
    i32.const 0
    set_local 6
    block  ;; label = @1
      loop  ;; label = @2
        get_local 6
        get_local 5
        i32.lt_u
        i32.eqz
        br_if 1 (;@1;)
        get_local 0
        get_local 6
        call 11
        set_local 7
        get_local 7
        f64.load offset=48
        set_local 8
        get_local 2
        get_local 7
        f64.load offset=24
        get_local 8
        f64.mul
        f64.add
        set_local 2
        get_local 3
        get_local 7
        f64.load offset=32
        get_local 8
        f64.mul
        f64.add
        set_local 3
        get_local 4
        get_local 7
        f64.load offset=40
        get_local 8
        f64.mul
        f64.add
        set_local 4
        get_local 6
        i32.const 1
        i32.add
        set_local 6
        br 0 (;@2;)
      end
    end
    get_local 1
    get_local 0
    i32.store
    get_local 1
    i32.load
    i32.const 0
    call 11
    get_local 2
    get_local 3
    get_local 4
    call 15
    get_local 1
    return)
  (func (;22;) (type 9) (param i32 f64)
    (local f64 f64 f64 f64 f64 f64 f64 f64 f64 f64 f64 i32 i32 i32 i32 f64 i32 i32 f64 f64 f64)
    f64.const 0x0p+0 (;=0;)
    set_local 2
    f64.const 0x0p+0 (;=0;)
    set_local 3
    f64.const 0x0p+0 (;=0;)
    set_local 4
    f64.const 0x0p+0 (;=0;)
    set_local 5
    f64.const 0x0p+0 (;=0;)
    set_local 6
    f64.const 0x0p+0 (;=0;)
    set_local 7
    f64.const 0x0p+0 (;=0;)
    set_local 8
    f64.const 0x0p+0 (;=0;)
    set_local 9
    f64.const 0x0p+0 (;=0;)
    set_local 10
    f64.const 0x0p+0 (;=0;)
    set_local 11
    f64.const 0x0p+0 (;=0;)
    set_local 12
    get_local 0
    i32.load
    set_local 13
    get_local 13
    call 13
    set_local 14
    i32.const 0
    set_local 15
    block  ;; label = @1
      loop  ;; label = @2
        get_local 15
        get_local 14
        i32.lt_u
        i32.eqz
        br_if 1 (;@1;)
        get_local 13
        get_local 15
        call 11
        set_local 16
        get_local 16
        f64.load
        set_local 5
        get_local 16
        f64.load offset=8
        set_local 6
        get_local 16
        f64.load offset=16
        set_local 7
        get_local 16
        f64.load offset=24
        set_local 8
        get_local 16
        f64.load offset=32
        set_local 9
        get_local 16
        f64.load offset=40
        set_local 10
        get_local 16
        f64.load offset=48
        set_local 17
        get_local 15
        i32.const 1
        i32.add
        set_local 18
        block  ;; label = @3
          loop  ;; label = @4
            get_local 18
            get_local 14
            i32.lt_u
            i32.eqz
            br_if 1 (;@3;)
            get_local 13
            get_local 18
            call 11
            set_local 19
            get_local 5
            get_local 19
            f64.load
            f64.sub
            set_local 2
            get_local 6
            get_local 19
            f64.load offset=8
            f64.sub
            set_local 3
            get_local 7
            get_local 19
            f64.load offset=16
            f64.sub
            set_local 4
            get_local 2
            get_local 2
            f64.mul
            get_local 3
            get_local 3
            f64.mul
            f64.add
            get_local 4
            get_local 4
            f64.mul
            f64.add
            set_local 20
            get_local 20
            f64.sqrt
            set_local 11
            get_local 1
            get_local 20
            get_local 11
            f64.mul
            f64.div
            set_local 12
            get_local 17
            get_local 12
            f64.mul
            set_local 21
            get_local 19
            f64.load offset=48
            get_local 12
            f64.mul
            set_local 22
            get_local 8
            get_local 2
            get_local 22
            f64.mul
            f64.sub
            set_local 8
            get_local 9
            get_local 3
            get_local 22
            f64.mul
            f64.sub
            set_local 9
            get_local 10
            get_local 4
            get_local 22
            f64.mul
            f64.sub
            set_local 10
            get_local 19
            get_local 19
            f64.load offset=24
            get_local 2
            get_local 21
            f64.mul
            f64.add
            f64.store offset=24
            get_local 19
            get_local 19
            f64.load offset=32
            get_local 3
            get_local 21
            f64.mul
            f64.add
            f64.store offset=32
            get_local 19
            get_local 19
            f64.load offset=40
            get_local 4
            get_local 21
            f64.mul
            f64.add
            f64.store offset=40
            get_local 18
            i32.const 1
            i32.add
            set_local 18
            br 0 (;@4;)
          end
        end
        get_local 16
        get_local 8
        f64.store offset=24
        get_local 16
        get_local 9
        f64.store offset=32
        get_local 16
        get_local 10
        f64.store offset=40
        get_local 16
        get_local 16
        f64.load
        get_local 1
        get_local 8
        f64.mul
        f64.add
        f64.store
        get_local 16
        get_local 16
        f64.load offset=8
        get_local 1
        get_local 9
        f64.mul
        f64.add
        f64.store offset=8
        get_local 16
        get_local 16
        f64.load offset=16
        get_local 1
        get_local 10
        f64.mul
        f64.add
        f64.store offset=16
        get_local 15
        i32.const 1
        i32.add
        set_local 15
        br 0 (;@2;)
      end
    end
    return)
  (func (;23;) (type 10) (param i32) (result f64)
    (local f64 f64 f64 f64 f64 f64 f64 f64 f64 f64 f64 f64 i32 i32 i32 i32 i32 i32)
    f64.const 0x0p+0 (;=0;)
    set_local 1
    f64.const 0x0p+0 (;=0;)
    set_local 2
    f64.const 0x0p+0 (;=0;)
    set_local 3
    f64.const 0x0p+0 (;=0;)
    set_local 4
    f64.const 0x0p+0 (;=0;)
    set_local 5
    f64.const 0x0p+0 (;=0;)
    set_local 6
    f64.const 0x0p+0 (;=0;)
    set_local 7
    f64.const 0x0p+0 (;=0;)
    set_local 8
    f64.const 0x0p+0 (;=0;)
    set_local 9
    f64.const 0x0p+0 (;=0;)
    set_local 10
    f64.const 0x0p+0 (;=0;)
    set_local 11
    f64.const 0x0p+0 (;=0;)
    set_local 12
    get_local 0
    i32.load
    set_local 13
    get_local 13
    call 13
    set_local 14
    i32.const 0
    set_local 15
    block  ;; label = @1
      loop  ;; label = @2
        get_local 15
        get_local 14
        i32.lt_u
        i32.eqz
        br_if 1 (;@1;)
        get_local 13
        get_local 15
        call 11
        set_local 16
        get_local 16
        f64.load
        set_local 5
        get_local 16
        f64.load offset=8
        set_local 6
        get_local 16
        f64.load offset=16
        set_local 7
        get_local 16
        f64.load offset=24
        set_local 8
        get_local 16
        f64.load offset=32
        set_local 9
        get_local 16
        f64.load offset=40
        set_local 10
        get_local 16
        f64.load offset=48
        set_local 11
        get_local 12
        f64.const 0x1p-1 (;=0.5;)
        get_local 11
        f64.mul
        get_local 8
        get_local 8
        f64.mul
        get_local 9
        get_local 9
        f64.mul
        f64.add
        get_local 10
        get_local 10
        f64.mul
        f64.add
        f64.mul
        f64.add
        set_local 12
        get_local 15
        i32.const 1
        i32.add
        set_local 17
        block  ;; label = @3
          loop  ;; label = @4
            get_local 17
            get_local 14
            i32.lt_u
            i32.eqz
            br_if 1 (;@3;)
            get_local 13
            get_local 17
            call 11
            set_local 18
            get_local 5
            get_local 18
            f64.load
            f64.sub
            set_local 1
            get_local 6
            get_local 18
            f64.load offset=8
            f64.sub
            set_local 2
            get_local 7
            get_local 18
            f64.load offset=16
            f64.sub
            set_local 3
            get_local 1
            get_local 1
            f64.mul
            get_local 2
            get_local 2
            f64.mul
            f64.add
            get_local 3
            get_local 3
            f64.mul
            f64.add
            f64.sqrt
            set_local 4
            get_local 12
            get_local 11
            get_local 18
            f64.load offset=48
            f64.mul
            get_local 4
            f64.div
            f64.sub
            set_local 12
            get_local 17
            i32.const 1
            i32.add
            set_local 17
            br 0 (;@4;)
          end
        end
        get_local 15
        i32.const 1
        i32.add
        set_local 15
        br 0 (;@2;)
      end
    end
    get_local 12
    return)
  (func (;24;) (type 10) (param i32) (result f64)
    (local i32 i32 i32)
    i32.const 0
    f64.const 0x1p+2 (;=4;)
    i32.const 0
    f64.load offset=8
    f64.mul
    i32.const 0
    f64.load offset=8
    f64.mul
    f64.store offset=40
    i32.const 5
    i32.const 20
    i32.const 4
    call 10
    set_local 1
    get_local 1
    i32.const 0
    call 20
    call 12
    get_local 1
    i32.const 1
    call 16
    call 12
    get_local 1
    i32.const 2
    call 17
    call 12
    get_local 1
    i32.const 3
    call 18
    call 12
    get_local 1
    i32.const 4
    call 19
    call 12
    get_local 1
    call 21
    set_local 2
    i32.const 0
    set_local 3
    block  ;; label = @1
      loop  ;; label = @2
        get_local 3
        get_local 0
        i32.lt_u
        i32.eqz
        br_if 1 (;@1;)
        get_local 2
        f64.const 0x1.47ae147ae147bp-7 (;=0.01;)
        call 22
        get_local 3
        i32.const 1
        i32.add
        set_local 3
        br 0 (;@2;)
      end
    end
    get_local 2
    call 23
    return)
  (memory (;0;) 1)
  (export "memory" (memory 0))
  (export "malloc" (func 0))
  (export "free" (func 1))
  (export "test" (func 24))
  (data (i32.const 8) "\18-DT\fb!\09@@\00\00\00@\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\f8\7f\a4p=\0a\d7\d3v@\00\00\00\00\00\00\00\00"))
