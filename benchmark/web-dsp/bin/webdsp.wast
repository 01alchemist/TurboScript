(module
  (type (;0;) (func))
  (type (;1;) (func (param f32) (result f32)))
  (type (;2;) (func (param i32) (result i32)))
  (type (;3;) (func (param i32)))
  (type (;4;) (func (param i32 i32)))
  (type (;5;) (func (param i32 i32) (result i32)))
  (type (;6;) (func (param i32 i32 i32)))
  (type (;7;) (func (param i32 i32) (result f64)))
  (type (;8;) (func (param i32 i32 f64)))
  (type (;9;) (func (param f64) (result f64)))
  (type (;10;) (func (param f64 f64) (result f64)))
  (type (;11;) (func (result f64)))
  (type (;12;) (func (param f32 f32) (result f32)))
  (type (;13;) (func (result f32)))
  (type (;14;) (func (result i32)))
  (type (;15;) (func (param i32 i32 i32 i32 i32) (result i32)))
  (type (;16;) (func (param i32 i32 i32 i32 i32 i32 i32)))
  (type (;17;) (func (param i32 i32 i32 i32)))
  (type (;18;) (func (param i32 i32 i32 i32 i32 i32 f64 f64 i32)))
  (import "Math" "abs" (func (;0;) (type 1)))
  (import "Math" "acos" (func (;1;) (type 9)))
  (import "Math" "asin" (func (;2;) (type 9)))
  (import "Math" "atan" (func (;3;) (type 9)))
  (import "Math" "atan2" (func (;4;) (type 10)))
  (import "Math" "ceil" (func (;5;) (type 1)))
  (import "Math" "cos" (func (;6;) (type 9)))
  (import "Math" "exp" (func (;7;) (type 9)))
  (import "Math" "floor" (func (;8;) (type 1)))
  (import "Math" "log" (func (;9;) (type 9)))
  (import "Math" "max" (func (;10;) (type 10)))
  (import "Math" "min" (func (;11;) (type 10)))
  (import "Math" "pow" (func (;12;) (type 10)))
  (import "Math" "random" (func (;13;) (type 11)))
  (import "Math" "sin" (func (;14;) (type 9)))
  (import "Math" "sqrt" (func (;15;) (type 1)))
  (import "Math" "tan" (func (;16;) (type 9)))
  (import "Math" "imul" (func (;17;) (type 5)))
  (import "global" "modf32" (func (;18;) (type 12)))
  (import "global" "modf64" (func (;19;) (type 10)))
  (func __WASM_INITIALIZER (type 0)
    i32.const 0
    set_global 3
    i32.const 0
    set_global 4
    i32.const 0
    set_global 5)
  (func malloc (type 2) (param size i32) (result i32)
    (local alignment i32) (local chunkSize i32) (local freeChunk i32) (local offset i32) (local top i32) (local ptr i32)
    i32.const 8
    set_local alignment
    get_local size
    get_local alignment
    i32.const 1
    i32.sub
    i32.add
    i32.const -1
    get_local alignment
    i32.const 1
    i32.sub
    i32.xor
    i32.and
    set_local size
    get_local size
    i32.const 8
    i32.add
    set_local chunkSize
    get_local chunkSize
    call getFreeChunk
    set_local freeChunk
    get_local freeChunk
    i32.const 0
    i32.gt_s
    if i32  ;; label = @1
      get_local freeChunk
      return
    else
      i32.const 0
    end
    get_global 1
    set_local offset
    get_local offset
    i32.const 7
    i32.add
    set_local offset
    get_local offset
    i32.const -8
    i32.and
    set_local offset
    get_local offset
    get_local chunkSize
    i32.add
    set_local top
    get_local offset
    i32.const 4
    i32.add
    set_local ptr
    get_local ptr
    get_local chunkSize
    call setHeadSize
    get_local ptr
    i32.const 4
    i32.add
    call setInuse
    get_local ptr
    get_local chunkSize
    call setFoot
    get_local top
    i32.const 4
    i32.add
    set_global 1
    get_local offset
    i32.const 8
    i32.add
    set_local offset
    get_local offset
    set_local ptr
    block  ;; label = @1
      loop  ;; label = @2
        get_local ptr
        get_local top
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        get_local ptr
        i32.const 0
        i32.store
        get_local ptr
        i32.const 4
        i32.add
        set_local ptr
        br 0 (;@2;)
      end
    end
    get_local offset
    return)
  (func free (type 3) (param ptr i32)
    (local chunkptr i32) (local tmp1 i32)
    i32.const 0
    set_local chunkptr
    i32.const 0
    set_local tmp1
    get_local ptr
    call clearInuse
    get_global 4
    i32.const 0
    i32.eq
    if  ;; label = @1
      get_local ptr
      set_global 4
    end
    get_global 2
    set_local tmp1
    get_local tmp1
    get_local ptr
    call getChunkSize
    i32.add
    set_local tmp1
    get_local tmp1
    set_global 2
    get_local ptr
    i32.const 4
    i32.add
    set_local chunkptr
    get_global 5
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      get_local chunkptr
      get_global 5
      i32.store
      get_global 5
      get_local ptr
      i32.store
    else
      get_local chunkptr
      i32.const 0
      i32.store
    end
    get_local ptr
    i32.const 0
    i32.store
    get_local ptr
    set_global 5
    get_global 3
    i32.const 1
    i32.add
    set_global 3)
  (func getFreeChunk (type 2) (param size i32) (result i32)
    (local freeChunk i32) (local tmp1 i32) (local tmp2 i32) (local tmp3 i32) (local tmp4 i32)
    i32.const 0
    set_local freeChunk
    i32.const 0
    set_local tmp1
    i32.const 0
    set_local tmp2
    i32.const 0
    set_local tmp3
    i32.const 0
    set_local tmp4
    get_global 4
    set_local tmp1
    get_global 5
    set_local tmp2
    get_global 2
    set_local tmp3
    get_global 3
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      get_local size
      call findChunk
      set_local freeChunk
      get_local freeChunk
      i32.const 0
      i32.gt_s
      if  ;; label = @2
        get_local freeChunk
        get_local tmp1
        i32.eq
        if  ;; label = @3
          get_local freeChunk
          call nextFree
          set_global 4
        end
        get_local freeChunk
        get_local tmp2
        i32.eq
        if  ;; label = @3
          i32.const 0
          set_global 5
        end
        get_global 3
        i32.const 1
        i32.sub
        set_global 3
        get_local freeChunk
        call setInuse
        get_local freeChunk
        call getChunkSize
        set_local tmp4
        get_local tmp3
        get_local tmp4
        i32.sub
        set_local tmp3
        get_local tmp3
        set_global 2
      end
    end
    get_local freeChunk
    return)
  (func findChunk (type 2) (param size i32) (result i32)
    (local chunk i32) (local tmp1 i32)
    i32.const 0
    set_local chunk
    i32.const 0
    set_local tmp1
    get_global 4
    set_local chunk
    block  ;; label = @1
      loop  ;; label = @2
        get_local chunk
        i32.const 0
        i32.ne
        i32.eqz
        br_if 1 (;@1;)
        get_local chunk
        call getChunkSize
        set_local tmp1
        get_local tmp1
        get_local size
        i32.eq
        if i32  ;; label = @3
          get_local chunk
          return
        else
          i32.const 0
        end
        get_local chunk
        i32.load
        set_local chunk
        br 0 (;@2;)
      end
    end
    i32.const 0
    return)
  (func nextFree (type 2) (param ptr i32) (result i32)
    get_local ptr
    i32.load
    return)
  (func setHeadSize (type 4) (param ptr i32) (param s i32)
    get_local ptr
    get_local ptr
    i32.load
    i32.const 7
    i32.and
    get_local s
    i32.or
    i32.store)
  (func setFoot (type 4) (param ptr i32) (param s i32)
    (local chunkptr i32) (local size i32)
    i32.const 0
    set_local chunkptr
    i32.const 0
    set_local size
    get_local ptr
    i32.load
    set_local size
    get_local ptr
    get_local size
    i32.add
    set_local chunkptr
    get_local chunkptr
    get_local s
    i32.store)
  (func setInuse (type 3) (param ptr i32)
    (local chunkptr i32)
    i32.const 0
    set_local chunkptr
    get_local ptr
    i32.const 4
    i32.sub
    set_local chunkptr
    get_local chunkptr
    get_local chunkptr
    i32.load
    i32.const 1
    i32.or
    i32.store)
  (func clearInuse (type 3) (param ptr i32)
    (local chunkptr i32)
    i32.const 0
    set_local chunkptr
    get_local ptr
    i32.const 4
    i32.sub
    set_local chunkptr
    get_local chunkptr
    get_local chunkptr
    i32.load
    i32.const -2
    i32.and
    i32.store)
  (func getChunkSize (type 2) (param ptr i32) (result i32)
    (local chunkptr i32)
    i32.const 0
    set_local chunkptr
    get_local ptr
    i32.const 4
    i32.sub
    set_local chunkptr
    get_local chunkptr
    i32.load
    i32.const -2
    i32.and
    return)
  (func Array_int32__ctr (type 5) (param bytesLength i32) (param elementSize i32) (result i32)
    (local this i32)
    get_local bytesLength
    i32.const 8
    i32.add
    call malloc
    set_local this
    get_local this
    get_local bytesLength
    i32.store
    get_local this
    get_local elementSize
    i32.store offset=4
    get_local this
    return)
  (func Array_int32_op_get (type 5) (param this i32) (param index i32) (result i32)
    (local stripe i32)
    get_local index
    get_local this
    i32.load offset=4
    i32.mul
    set_local stripe
    get_local stripe
    i32.const 0
    i32.ge_s
    get_local stripe
    get_local this
    i32.load
    i32.lt_s
    i32.and
    i32.const 1
    i32.eq
    if i32  ;; label = @1
      get_local this
      i32.const 8
      i32.add
      get_local stripe
      i32.add
      i32.load
      return
    else
      i32.const 0
    end
    i32.const 0
    return)
  (func Array_int32_op_set (type 6) (param this i32) (param index i32) (param value i32)
    (local stripe i32)
    get_local index
    get_local this
    i32.load offset=4
    i32.mul
    set_local stripe
    get_local stripe
    i32.const 0
    i32.ge_s
    get_local stripe
    get_local this
    i32.load
    i32.lt_s
    i32.and
    i32.const 1
    i32.eq
    if  ;; label = @1
      get_local this
      i32.const 8
      i32.add
      get_local stripe
      i32.add
      get_local value
      i32.store
    end)
  (func Array_uint8_op_get (type 5) (param this i32) (param index i32) (result i32)
    (local stripe i32)
    get_local index
    get_local this
    i32.load offset=4
    i32.mul
    set_local stripe
    get_local stripe
    i32.const 0
    i32.ge_s
    get_local stripe
    get_local this
    i32.load
    i32.lt_s
    i32.and
    i32.const 1
    i32.eq
    if i32  ;; label = @1
      get_local this
      i32.const 8
      i32.add
      get_local stripe
      i32.add
      i32.load8_u
      return
    else
      i32.const 0
    end
    i32.const 0
    return)
  (func Array_uint8_op_set (type 6) (param this i32) (param index i32) (param value i32)
    (local stripe i32)
    get_local index
    get_local this
    i32.load offset=4
    i32.mul
    set_local stripe
    get_local stripe
    i32.const 0
    i32.ge_s
    get_local stripe
    get_local this
    i32.load
    i32.lt_s
    i32.and
    i32.const 1
    i32.eq
    if  ;; label = @1
      get_local this
      i32.const 8
      i32.add
      get_local stripe
      i32.add
      get_local value
      i32.store8
    end)
  (func Array_float64_op_get (type 7) (param this i32) (param index i32) (result f64)
    (local stripe i32)
    get_local index
    get_local this
    i32.load offset=4
    i32.mul
    set_local stripe
    get_local stripe
    i32.const 0
    i32.ge_s
    get_local stripe
    get_local this
    i32.load
    i32.lt_s
    i32.and
    i32.const 1
    i32.eq
    if i32  ;; label = @1
      get_local this
      i32.const 8
      i32.add
      get_local stripe
      i32.add
      f64.load
      return
    else
      i32.const 0
    end
    f64.const 0x0p+0 (;=0;)
    return)
  (func Array_float64_op_set (type 8) (param this i32) (param index i32) (param value f64)
    (local stripe i32)
    get_local index
    get_local this
    i32.load offset=4
    i32.mul
    set_local stripe
    get_local stripe
    i32.const 0
    i32.ge_s
    get_local stripe
    get_local this
    i32.load
    i32.lt_s
    i32.and
    i32.const 1
    i32.eq
    if  ;; label = @1
      get_local this
      i32.const 8
      i32.add
      get_local stripe
      i32.add
      get_local value
      f64.store
    end)
  (func absf32 (type 1) (param x f32) (result f32)
    get_local x
    call 0
    return)
  (func sqrtf32 (type 1) (param x f32) (result f32)
    get_local x
    call 15
    return)
  (func powf32 (type 12) (param x f32) (param y f32) (result f32)
    get_local x
    f64.promote/f32
    get_local y
    f64.promote/f32
    call 12
    f32.demote/f64
    return)
  (func minf32 (type 12) (param x f32) (param y f32) (result f32)
    get_local x
    f64.promote/f32
    get_local y
    f64.promote/f32
    call 11
    f32.demote/f64
    return)
  (func maxf32 (type 12) (param x f32) (param y f32) (result f32)
    get_local x
    f64.promote/f32
    get_local y
    f64.promote/f32
    call 10
    f32.demote/f64
    return)
  (func randomFloat32 (type 13) (result f32)
    call 13
    f32.demote/f64
    return)
  (func randomFloat64 (type 11) (result f64)
    call 13
    return)
  (func randomInt32 (type 14) (result i32)
    call 13
    f64.const 0x1.fffffffcp+30 (;=2.14748e+09;)
    f64.mul
    i32.trunc_s/f64
    return)
  (func getPixel (type 15) (param x i32) (param y i32) (param arr i32) (param width i32) (param height i32) (result i32)
    get_local x
    i32.const 0
    i32.lt_s
    get_local y
    i32.const 0
    i32.lt_s
    i32.or
    i32.const 1
    i32.eq
    if i32  ;; label = @1
      i32.const 0
      return
    else
      i32.const 0
    end
    get_local x
    get_local width
    i32.ge_s
    get_local y
    get_local height
    i32.ge_s
    i32.or
    i32.const 1
    i32.eq
    if i32  ;; label = @1
      i32.const 0
      return
    else
      i32.const 0
    end
    get_local arr
    get_local width
    get_local y
    i32.mul
    get_local x
    i32.add
    call Array_int32_op_get
    return)
  (func grayScale (type 4) (param data i32) (param len i32)
    (local i i32) (local r i32) (local g i32) (local b i32) (local a i32)
    i32.const 0
    set_local i
    block  ;; label = @1
      loop  ;; label = @2
        get_local i
        get_local len
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        get_local data
        get_local i
        i32.add
        i32.load8_u
        set_local r
        get_local data
        get_local i
        i32.add
        i32.const 1
        i32.add
        i32.load8_u
        set_local g
        get_local data
        get_local i
        i32.add
        i32.const 2
        i32.add
        i32.load8_u
        set_local b
        get_local data
        get_local i
        i32.add
        i32.const 3
        i32.add
        i32.load8_u
        set_local a
        get_local data
        get_local i
        i32.add
        get_local r
        i32.store8
        get_local data
        get_local i
        i32.add
        i32.const 1
        i32.add
        get_local r
        i32.store8
        get_local data
        get_local i
        i32.add
        i32.const 2
        i32.add
        get_local r
        i32.store8
        get_local data
        get_local i
        i32.add
        i32.const 3
        i32.add
        get_local a
        i32.store8
        get_local i
        i32.const 4
        i32.add
        set_local i
        br 0 (;@2;)
      end
    end)
  (func brighten (type 6) (param data i32) (param len i32) (param brightness i32)
    (local i i32)
    i32.const 0
    set_local i
    block  ;; label = @1
      loop  ;; label = @2
        get_local i
        get_local len
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        get_local data
        get_local i
        call Array_uint8_op_get
        get_local brightness
        i32.add
        i32.const 255
        i32.lt_s
        if  ;; label = @3
          get_local data
          get_local i
          get_local data
          get_local i
          call Array_uint8_op_get
          get_local brightness
          i32.add
          call Array_uint8_op_set
        end
        get_local data
        get_local i
        i32.const 1
        i32.add
        call Array_uint8_op_get
        get_local brightness
        i32.add
        i32.const 255
        i32.lt_s
        if  ;; label = @3
          get_local data
          get_local i
          i32.const 1
          i32.add
          get_local data
          get_local i
          i32.const 1
          i32.add
          call Array_uint8_op_get
          get_local brightness
          i32.add
          call Array_uint8_op_set
        end
        get_local data
        get_local i
        i32.const 2
        i32.add
        call Array_uint8_op_get
        get_local brightness
        i32.add
        i32.const 255
        i32.lt_s
        if  ;; label = @3
          get_local data
          get_local i
          i32.const 1
          i32.add
          get_local data
          get_local i
          i32.const 2
          i32.add
          call Array_uint8_op_get
          get_local brightness
          i32.add
          call Array_uint8_op_set
        end
        get_local i
        i32.const 4
        i32.add
        set_local i
        br 0 (;@2;)
      end
    end)
  (func invert (type 4) (param data i32) (param len i32)
    (local i i32)
    i32.const 0
    set_local i
    block  ;; label = @1
      loop  ;; label = @2
        get_local i
        get_local len
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        get_local data
        get_local i
        i32.const 255
        get_local data
        get_local i
        call Array_uint8_op_get
        i32.sub
        call Array_uint8_op_set
        get_local data
        get_local i
        i32.const 1
        i32.add
        i32.const 255
        get_local data
        get_local i
        i32.const 1
        i32.add
        call Array_uint8_op_get
        i32.sub
        call Array_uint8_op_set
        get_local data
        get_local i
        i32.const 2
        i32.add
        i32.const 255
        get_local data
        get_local i
        i32.const 2
        i32.add
        call Array_uint8_op_get
        i32.sub
        call Array_uint8_op_set
        get_local i
        i32.const 4
        i32.add
        set_local i
        br 0 (;@2;)
      end
    end)
  (func noise (type 4) (param data i32) (param len i32)
    (local random f64) (local i i32)
    f64.const 0x0p+0 (;=0;)
    set_local random
    i32.const 0
    set_local i
    block  ;; label = @1
      loop  ;; label = @2
        get_local i
        get_local len
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        call randomFloat64
        f64.const 0x1.18p+6 (;=70;)
        call 19
        f64.const 0x1.18p+5 (;=35;)
        f64.sub
        set_local random
        get_local data
        get_local i
        get_local data
        get_local i
        call Array_float64_op_get
        get_local random
        f64.add
        call Array_float64_op_set
        get_local data
        get_local i
        i32.const 1
        i32.add
        get_local data
        get_local i
        i32.const 1
        i32.add
        call Array_float64_op_get
        get_local random
        f64.add
        call Array_float64_op_set
        get_local data
        get_local i
        i32.const 2
        i32.add
        get_local data
        get_local i
        i32.const 2
        i32.add
        call Array_float64_op_get
        get_local random
        f64.add
        call Array_float64_op_set
        get_local i
        i32.const 4
        i32.add
        set_local i
        br 0 (;@2;)
      end
    end)
  (func multiFilter (type 16) (param data i32) (param len i32) (param width i32) (param filterType i32) (param mag i32) (param mult i32) (param adj i32)
    (local i i32)
    i32.const 0
    set_local i
    block  ;; label = @1
      loop  ;; label = @2
        get_local i
        get_local len
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        get_local i
        i32.const 4
        i32.rem_s
        i32.const 3
        i32.ne
        if  ;; label = @3
          get_local data
          get_local i
          get_local mag
          get_local mult
          get_local data
          get_local i
          call Array_uint8_op_get
          i32.mul
          i32.add
          get_local data
          get_local i
          get_local adj
          i32.add
          call Array_uint8_op_get
          i32.sub
          get_local data
          get_local i
          get_local width
          i32.const 2
          i32.shl
          i32.add
          call Array_uint8_op_get
          i32.sub
          call Array_uint8_op_set
        end
        get_local i
        get_local filterType
        i32.add
        set_local i
        br 0 (;@2;)
      end
    end)
  (func sobelFilter (type 17) (param data i32) (param width i32) (param height i32) (param invert i32)
    (local grayData i32) (local x i32) (local y i32) (local goffset i32) (local r i32) (local g i32) (local b i32) (local avg i32) (local doffset i32) (local newX i32) (local newY i32) (local mag i32) (local offset i32)
    i32.const 4
    get_local width
    get_local height
    i32.mul
    i32.mul
    i32.const 4
    call Array_int32__ctr
    set_local grayData
    i32.const 0
    set_local x
    i32.const 0
    set_local y
    block  ;; label = @1
      loop  ;; label = @2
        get_local y
        get_local height
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        block  ;; label = @3
          loop  ;; label = @4
            get_local x
            get_local width
            i32.lt_s
            i32.eqz
            br_if 1 (;@3;)
            get_local width
            get_local y
            i32.mul
            get_local x
            i32.add
            i32.const 2
            i32.shl
            set_local goffset
            get_local data
            get_local goffset
            call Array_uint8_op_get
            set_local r
            get_local data
            get_local goffset
            i32.const 1
            i32.add
            call Array_uint8_op_get
            set_local g
            get_local data
            get_local goffset
            i32.const 2
            i32.add
            call Array_uint8_op_get
            set_local b
            get_local r
            i32.const 2
            i32.shr_s
            get_local g
            i32.const 1
            i32.shr_s
            i32.add
            get_local b
            i32.const 3
            i32.shr_s
            i32.add
            set_local avg
            get_local grayData
            get_local width
            get_local y
            i32.mul
            get_local x
            i32.add
            get_local avg
            call Array_int32_op_set
            get_local width
            get_local y
            i32.mul
            get_local x
            i32.add
            i32.const 2
            i32.shl
            set_local doffset
            get_local data
            get_local doffset
            get_local avg
            call Array_uint8_op_set
            get_local data
            get_local doffset
            i32.const 1
            i32.add
            get_local avg
            call Array_uint8_op_set
            get_local data
            get_local doffset
            i32.const 2
            i32.add
            get_local avg
            call Array_uint8_op_set
            get_local data
            get_local doffset
            i32.const 3
            i32.add
            i32.const 255
            call Array_uint8_op_set
            get_local x
            i32.const 1
            i32.add
            set_local x
            br 0 (;@4;)
          end
        end
        get_local y
        i32.const 1
        i32.add
        set_local y
        br 0 (;@2;)
      end
    end
    i32.const 0
    set_local x
    i32.const 0
    set_local y
    block  ;; label = @1
      loop  ;; label = @2
        get_local y
        get_local height
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        block  ;; label = @3
          loop  ;; label = @4
            get_local x
            get_local width
            i32.lt_s
            i32.eqz
            br_if 1 (;@3;)
            i32.const 0
            set_local newX
            i32.const 0
            set_local newY
            get_local x
            i32.const 0
            i32.le_s
            get_local x
            get_local width
            i32.const 1
            i32.sub
            i32.ge_s
            i32.or
            i32.const 1
            i32.eq
            get_local y
            i32.const 0
            i32.le_s
            get_local y
            get_local height
            i32.const 1
            i32.sub
            i32.ge_s
            i32.or
            i32.const 1
            i32.eq
            i32.or
            i32.const 1
            i32.eq
            if  ;; label = @5
              i32.const 0
              set_local newX
              i32.const 0
              set_local newY
            else
              get_local x
              i32.const 1
              i32.sub
              get_local y
              i32.const 1
              i32.sub
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.const -1
              i32.mul
              get_local x
              i32.const 1
              i32.add
              get_local y
              i32.const 1
              i32.sub
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.add
              get_local x
              i32.const 1
              i32.sub
              get_local y
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.const 1
              i32.shl
              i32.const -1
              i32.mul
              i32.add
              get_local x
              i32.const 1
              i32.add
              get_local y
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.const 1
              i32.shl
              i32.add
              get_local x
              i32.const 1
              i32.sub
              get_local y
              i32.const 1
              i32.add
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.const -1
              i32.mul
              i32.add
              get_local x
              i32.const 1
              i32.add
              get_local y
              i32.const 1
              i32.add
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.add
              set_local newX
              get_local x
              i32.const 1
              i32.sub
              get_local y
              i32.const 1
              i32.sub
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.const -1
              i32.mul
              get_local x
              get_local y
              i32.const 1
              i32.sub
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.const 1
              i32.shl
              i32.const -1
              i32.mul
              i32.add
              get_local x
              i32.const 1
              i32.add
              get_local y
              i32.const 1
              i32.sub
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.const -1
              i32.mul
              i32.add
              get_local x
              i32.const 1
              i32.sub
              get_local y
              i32.const 1
              i32.add
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.add
              get_local x
              get_local y
              i32.const 1
              i32.add
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.const 1
              i32.shl
              i32.add
              get_local x
              i32.const 1
              i32.add
              get_local y
              i32.const 1
              i32.add
              get_local grayData
              get_local width
              get_local height
              call getPixel
              i32.add
              set_local newY
            end
            get_local newX
            get_local newX
            i32.mul
            get_local newY
            get_local newY
            i32.mul
            i32.add
            f32.convert_s/i32
            f32.sqrt
            i32.trunc_s/f32
            set_local mag
            get_local mag
            i32.const 255
            i32.gt_s
            if  ;; label = @5
              i32.const 255
              set_local mag
            end
            get_local width
            get_local y
            i32.mul
            get_local x
            i32.add
            i32.const 2
            i32.shl
            set_local offset
            get_local invert
            i32.const 1
            i32.eq
            if  ;; label = @5
              i32.const 255
              get_local mag
              i32.sub
              set_local mag
            end
            get_local data
            get_local offset
            get_local mag
            call Array_uint8_op_set
            get_local data
            get_local offset
            i32.const 1
            i32.add
            get_local mag
            call Array_uint8_op_set
            get_local data
            get_local offset
            i32.const 2
            i32.add
            get_local mag
            call Array_uint8_op_set
            get_local data
            get_local offset
            i32.const 3
            i32.add
            i32.const 255
            call Array_uint8_op_set
            br 0 (;@4;)
          end
        end
        br 0 (;@2;)
      end
    end)
  (func convFilter (type 18) (param data i32) (param width i32) (param height i32) (param kern i32) (param kWidth i32) (param kHeight i32) (param divisor f64) (param bias f64) (param count i32)
    (local r f64) (local g f64) (local b f64) (local yy i32) (local xx i32) (local imageOffset i32) (local kernelOffset i32) (local pix i32) (local kCenterY i32) (local kCenterX i32) (local i i32) (local x i32) (local y i32) (local kx i32) (local ky i32)
    f64.const 0x0p+0 (;=0;)
    set_local r
    f64.const 0x0p+0 (;=0;)
    set_local g
    f64.const 0x0p+0 (;=0;)
    set_local b
    i32.const 0
    set_local yy
    i32.const 0
    set_local xx
    i32.const 0
    set_local imageOffset
    i32.const 0
    set_local kernelOffset
    i32.const 0
    set_local pix
    get_local kHeight
    i32.const 2
    i32.div_s
    set_local kCenterY
    get_local kWidth
    i32.const 2
    i32.div_s
    set_local kCenterX
    i32.const 0
    set_local i
    get_local kCenterX
    set_local x
    get_local kCenterY
    set_local y
    block  ;; label = @1
      loop  ;; label = @2
        get_local i
        get_local count
        i32.lt_s
        i32.eqz
        br_if 1 (;@1;)
        block  ;; label = @3
          loop  ;; label = @4
            get_local y
            get_local height
            get_local kCenterY
            i32.sub
            i32.lt_s
            i32.eqz
            br_if 1 (;@3;)
            block  ;; label = @5
              loop  ;; label = @6
                get_local x
                get_local width
                get_local kCenterX
                i32.sub
                i32.lt_s
                i32.eqz
                br_if 1 (;@5;)
                f64.const 0x0p+0 (;=0;)
                set_local r
                f64.const 0x0p+0 (;=0;)
                set_local g
                f64.const 0x0p+0 (;=0;)
                set_local b
                i32.const 0
                set_local kx
                i32.const 0
                set_local ky
                block  ;; label = @7
                  loop  ;; label = @8
                    get_local ky
                    get_local kHeight
                    i32.lt_s
                    i32.eqz
                    br_if 1 (;@7;)
                    get_local ky
                    i32.const 1
                    i32.add
                    set_local ky
                    block  ;; label = @9
                      loop  ;; label = @10
                        get_local kx
                        get_local kWidth
                        i32.lt_s
                        i32.eqz
                        br_if 1 (;@9;)
                        get_local kx
                        i32.const 1
                        i32.add
                        set_local kx
                        get_local width
                        get_local y
                        get_local kCenterY
                        i32.sub
                        get_local ky
                        i32.add
                        i32.mul
                        get_local x
                        get_local kCenterX
                        i32.sub
                        get_local kx
                        i32.add
                        i32.add
                        i32.const 2
                        i32.shl
                        set_local imageOffset
                        get_local kWidth
                        get_local ky
                        i32.mul
                        get_local kx
                        i32.add
                        set_local kernelOffset
                        get_local r
                        get_local data
                        get_local imageOffset
                        i32.const 0
                        i32.add
                        call Array_float64_op_get
                        get_local kern
                        get_local kernelOffset
                        call Array_float64_op_get
                        f64.mul
                        f64.add
                        set_local r
                        get_local g
                        get_local data
                        get_local imageOffset
                        i32.const 1
                        i32.add
                        call Array_float64_op_get
                        get_local kern
                        get_local kernelOffset
                        call Array_float64_op_get
                        f64.mul
                        f64.add
                        set_local g
                        get_local b
                        get_local data
                        get_local imageOffset
                        i32.const 2
                        i32.add
                        call Array_float64_op_get
                        get_local kern
                        get_local kernelOffset
                        call Array_float64_op_get
                        f64.mul
                        f64.add
                        set_local b
                        br 0 (;@10;)
                      end
                    end
                    br 0 (;@8;)
                  end
                end
                get_local width
                get_local y
                i32.mul
                get_local x
                i32.add
                i32.const 2
                i32.shl
                set_local pix
                get_local data
                get_local pix
                i32.const 0
                i32.add
                get_local r
                get_local divisor
                f64.div
                f64.const 0x1.fep+7 (;=255;)
                f64.gt
                if f64  ;; label = @7
                  f64.const 0x1.fep+7 (;=255;)
                else
                  get_local r
                  get_local divisor
                  f64.div
                  f64.const 0x0p+0 (;=0;)
                  f64.lt
                  if f64  ;; label = @8
                    f64.const 0x0p+0 (;=0;)
                  else
                    get_local r
                    get_local divisor
                    f64.div
                  end
                end
                call Array_float64_op_set
                get_local data
                get_local pix
                i32.const 1
                i32.add
                get_local g
                get_local divisor
                f64.div
                f64.const 0x1.fep+7 (;=255;)
                f64.gt
                if f64  ;; label = @7
                  f64.const 0x1.fep+7 (;=255;)
                else
                  get_local g
                  get_local divisor
                  f64.div
                  f64.const 0x0p+0 (;=0;)
                  f64.lt
                  if f64  ;; label = @8
                    f64.const 0x0p+0 (;=0;)
                  else
                    get_local g
                    get_local divisor
                    f64.div
                  end
                end
                call Array_float64_op_set
                get_local data
                get_local pix
                i32.const 2
                i32.add
                get_local b
                get_local divisor
                f64.div
                f64.const 0x1.fep+7 (;=255;)
                f64.gt
                if f64  ;; label = @7
                  f64.const 0x1.fep+7 (;=255;)
                else
                  get_local b
                  get_local divisor
                  f64.div
                  f64.const 0x0p+0 (;=0;)
                  f64.lt
                  if f64  ;; label = @8
                    f64.const 0x0p+0 (;=0;)
                  else
                    get_local b
                    get_local divisor
                    f64.div
                  end
                end
                call Array_float64_op_set
                get_local x
                i32.const 1
                i32.add
                set_local x
                br 0 (;@6;)
              end
            end
            get_local y
            i32.const 1
            i32.add
            set_local y
            br 0 (;@4;)
          end
        end
        get_local i
        i32.const 1
        i32.add
        set_local i
        br 0 (;@2;)
      end
    end)
  (memory (;0;) 1)
  (global (;0;) (mut i32) (i32.const 0))
  (global (;1;) (mut i32) (i32.const 0))
  (global (;2;) (mut i32) (i32.const 0))
  (global (;3;) (mut i32) (i32.const 0))
  (global (;4;) (mut i32) (i32.const 0))
  (global (;5;) (mut i32) (i32.const 0))
  (export "memory" (memory 0))
  (export "malloc" (func malloc))
  (export "free" (func free))
  (export "randomFloat32" (func randomFloat32))
  (export "randomFloat64" (func randomFloat64))
  (export "randomInt32" (func randomInt32))
  (export "getPixel" (func getPixel))
  (export "grayScale" (func grayScale))
  (export "brighten" (func brighten))
  (export "invert" (func invert))
  (export "noise" (func noise))
  (export "multiFilter" (func multiFilter))
  (export "sobelFilter" (func sobelFilter))
  (export "convFilter" (func convFilter))
  (start 20)
  (data (i32.const 8) "  \00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"))
