(module
  (type (;0;) (func (param i32) (result i32)))
  (type (;1;) (func (param i32 i32 i32)))
  (type (;2;) (func (param i32 i32 i32) (result i32)))
  (func (;0;) (type 0) (param i32) (result i32)
    (local i32 i32 i32)
    i32.const 0
    i32.load offset=8
    i32.const 7
    i32.add
    i32.const -8
    i32.and
    set_local 1
    get_local 0
    i32.const 7
    i32.add
    i32.const -8
    i32.and
    set_local 0
    get_local 1
    get_local 0
    i32.add
    set_local 2
    i32.const 0
    get_local 2
    i32.store offset=8
    i32.const 0
    set_local 3
    block  ;; label = @1
      loop  ;; label = @2
        get_local 3
        get_local 2
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        get_local 3
        i32.const 0
        i32.store
        get_local 3
        i32.const 4
        i32.add
        set_local 3
        br 0 (;@2;)
      end
    end
    get_local 1
    return)
  (func (;1;) (type 1) (param i32 i32 i32)
    (local i32 i32)
    get_local 1
    i32.const 0
    i32.eq
    get_local 0
    i32.const 0
    i32.eq
    i32.or
    i32.const 1
    i32.eq
    if  ;; label = @1
      block  ;; label = @2
        return
      end
    end
    get_local 2
    i32.const 16
    i32.ge_u
    get_local 1
    i32.const 3
    i32.and
    get_local 0
    i32.const 3
    i32.and
    i32.eq
    i32.and
    i32.const 1
    i32.eq
    if  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          loop  ;; label = @4
            get_local 0
            i32.const 3
            i32.and
            i32.const 0
            i32.ne
            i32.eqz
            br_if 1 (;@3;)
            get_local 0
            get_local 1
            i32.load8_u
            i32.store8
            get_local 0
            i32.const 1
            i32.add
            set_local 0
            get_local 1
            i32.const 1
            i32.add
            set_local 1
            get_local 2
            i32.const 1
            i32.sub
            set_local 2
            br 0 (;@4;)
          end
        end
        block  ;; label = @3
          loop  ;; label = @4
            get_local 2
            i32.const 3
            i32.and
            i32.const 0
            i32.ne
            i32.eqz
            br_if 1 (;@3;)
            get_local 2
            i32.const 1
            i32.sub
            set_local 2
            get_local 0
            get_local 2
            i32.add
            get_local 1
            get_local 2
            i32.add
            i32.load8_u
            i32.store8
            br 0 (;@4;)
          end
        end
        get_local 0
        get_local 2
        i32.add
        set_local 3
        block  ;; label = @3
          loop  ;; label = @4
            get_local 0
            get_local 3
            i32.lt_s
            i32.eqz
            br_if 1 (;@3;)
            get_local 0
            get_local 1
            i32.load
            i32.store
            get_local 0
            i32.const 4
            i32.add
            set_local 0
            get_local 1
            i32.const 4
            i32.add
            set_local 1
            br 0 (;@4;)
          end
        end
      end
    else
      block  ;; label = @2
        get_local 0
        get_local 2
        i32.add
        set_local 4
        block  ;; label = @3
          loop  ;; label = @4
            get_local 0
            get_local 4
            i32.lt_s
            i32.eqz
            br_if 1 (;@3;)
            get_local 0
            get_local 1
            i32.load8_u
            i32.store8
            get_local 0
            i32.const 1
            i32.add
            set_local 0
            get_local 1
            i32.const 1
            i32.add
            set_local 1
            br 0 (;@4;)
          end
        end
      end
    end)
  (func (;2;) (type 2) (param i32 i32 i32) (result i32)
    (local i32)
    get_local 0
    i32.const 0
    i32.eq
    get_local 1
    i32.const 0
    i32.eq
    i32.or
    i32.const 1
    i32.eq
    if  ;; label = @1
      block  ;; label = @2
        i32.const 0
        return
      end
    end
    block  ;; label = @1
      loop  ;; label = @2
        get_local 2
        i32.const 0
        i32.gt_u
        i32.eqz
        br_if 1 (;@1;)
        get_local 0
        i32.load8_u
        get_local 1
        i32.load8_u
        i32.sub
        set_local 3
        get_local 3
        i32.const 0
        i32.ne
        if  ;; label = @3
          block  ;; label = @4
            get_local 3
            return
          end
        end
        get_local 0
        i32.const 1
        i32.add
        set_local 0
        get_local 1
        i32.const 1
        i32.add
        set_local 1
        get_local 2
        i32.const 1
        i32.sub
        set_local 2
        br 0 (;@2;)
      end
    end
    i32.const 0
    return)
  (func (;3;) (type 0) (param i32) (result i32)
    (local i32)
    block  ;; label = @1
      get_local 0
      i32.const 1
      i32.shl
      i32.const 4
      i32.add
      call 0
      set_local 1
      get_local 1
      get_local 0
      i32.store
      get_local 1
      return
    end)
  (memory (;0;) 255)
  (export "malloc" (func 0))
  (export "string_new" (func 3)))
