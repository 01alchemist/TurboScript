/**
 * Created by nidin on 2017-01-12.
 */
export const WasmOpcode  = {
    // Control flow operators
    UNREACHABLE :  0x00,
    NOP :  0x01,
    BLOCK :  0x02,
    LOOP :  0x03,
    IF :  0x04,
    IF_ELSE :  0x05,
    END :  0x0b,
    BR :  0x0c,
    BR_IF :  0x0d,
    BR_TABLE :  0x0e,
    RETURN :  0x0f,

    // Call operators
    CALL :  0x10,
    CALL_INDIRECT :  0x11,

    //Parametric operators
    DROP :  0x1a,
    SELECT :  0x1b,

    //Variable access
    GET_LOCAL :  0x20,
    SET_LOCAL :  0x21,
    TEE_LOCAL :  0x22,
    GET_GLOBAL :  0x23,
    SET_GLOBAL :  0x24,

    // Memory-related operators
    I32_LOAD :  0x28,
    I64_LOAD :  0x29,
    F32_LOAD :  0x2a,
    F64_LOAD :  0x2b,

    I32_LOAD8_S :  0x2c,
    I32_LOAD8_U :  0x2d,
    I32_LOAD16_S :  0x2e,
    I32_LOAD16_U :  0x2f,

    I64_LOAD8_S :  0x30,
    I64_LOAD8_U :  0x31,
    I64_LOAD16_S :  0x32,
    I64_LOAD16_U :  0x33,
    I64_LOAD32_S :  0x34,
    I64_LOAD32_U :  0x35,

    I32_STORE :  0x36,
    I64_STORE :  0x37,
    F32_STORE :  0x38,
    F64_STORE :  0x39,

    I32_STORE8 :  0x3a,
    I32_STORE16 :  0x3b,
    I64_STORE8 :  0x3c,
    I64_STORE16 :  0x3d,
    I64_STORE32 :  0x3e,
    MEMORY_SIZE :  0x3f, //query the size of memory
    GROW_MEMORY :  0x40,

    // Constants
    I32_CONST :  0x41,
    I64_CONST :  0x42,
    F32_CONST :  0x43,
    F64_CONST :  0x44,

    //Comparison operators
    I32_EQZ :  0x45,
    I32_EQ :  0x46,
    I32_NE :  0x47,
    I32_LT_S :  0x48,
    I32_LT_U :  0x49,
    I32_GT_S :  0x4a,
    I32_GT_U :  0x4b,
    I32_LE_S :  0x4c,
    I32_LE_U :  0x4d,
    I32_GE_S :  0x4e,
    I32_GE_U :  0x4f,

    I64_EQZ :  0x50,
    I64_EQ :  0x51,
    I64_NE :  0x52,
    I64_LT_S :  0x53,
    I64_LT_U :  0x54,
    I64_GT_S :  0x55,
    I64_GT_U :  0x56,
    I64_LE_S :  0x57,
    I64_LE_U :  0x58,
    I64_GE_S :  0x59,
    I64_GE_U :  0x5a,

    F32_EQ :  0x5b,
    F32_NE :  0x5c,
    F32_LT :  0x5d,
    F32_GT :  0x5e,
    F32_LE :  0x5f,
    F32_GE :  0x60,

    F64_EQ :  0x61,
    F64_NE :  0x62,
    F64_LT :  0x63,
    F64_GT :  0x64,
    F64_LE :  0x65,
    F64_GE :  0x66,

    //Numeric operators
    I32_CLZ :  0x67,
    I32_CTZ :  0x68,
    I32_POPCNT :  0x69,
    I32_ADD :  0x6a,
    I32_SUB :  0x6b,
    I32_MUL :  0x6c,
    I32_DIV_S :  0x6d,
    I32_DIV_U :  0x6e,
    I32_REM_S :  0x6f,
    I32_REM_U :  0x70,
    I32_AND :  0x71,
    I32_OR :  0x72,
    I32_XOR :  0x73,
    I32_SHL :  0x74,
    I32_SHR_S :  0x75,
    I32_SHR_U :  0x76,
    I32_ROTL :  0x77,
    I32_ROTR :  0x78,

    I64_CLZ :  0x79,
    I64_CTZ :  0x7a,
    I64_POPCNT :  0x7b,
    I64_ADD :  0x7c,
    I64_SUB :  0x7d,
    I64_MUL :  0x7e,
    I64_DIV_S :  0x7f,
    I64_DIV_U :  0x80,
    I64_REM_S :  0x81,
    I64_REM_U :  0x82,
    I64_AND :  0x83,
    I64_OR :  0x84,
    I64_XOR :  0x85,
    I64_SHL :  0x86,
    I64_SHR_S :  0x87,
    I64_SHR_U :  0x88,
    I64_ROTL :  0x89,
    I64_ROTR :  0x8a,

    F32_ABS :  0x8b,
    F32_NEG :  0x8c,
    F32_CEIL :  0x8d,
    F32_FLOOR :  0x8e,
    F32_TRUNC :  0x8f,
    F32_NEAREST :  0x90,
    F32_SQRT :  0x91,
    F32_ADD :  0x92,
    F32_SUB :  0x93,
    F32_MUL :  0x94,
    F32_DIV :  0x95,
    F32_MIN :  0x96,
    F32_MAX :  0x97,
    F32_COPYSIGN :  0x98,

    F64_ABS :  0x99,
    F64_NEG :  0x9a,
    F64_CEIL :  0x9b,
    F64_FLOOR :  0x9c,
    F64_TRUNC :  0x9d,
    F64_NEAREST :  0x9e,
    F64_SQRT :  0x9f,
    F64_ADD :  0xa0,
    F64_SUB :  0xa1,
    F64_MUL :  0xa2,
    F64_DIV :  0xa3,
    F64_MIN :  0xa4,
    F64_MAX :  0xa5,
    F64_COPYSIGN :  0xa6,

    //Conversions
    I32_WRAP_I64 :  0xa7,
    I32_TRUNC_S_F32 :  0xa8,
    I32_TRUNC_U_F32 :  0xa9,
    I32_TRUNC_S_F64 :  0xaa,
    I32_TRUNC_U_F64 :  0xab,

    I64_EXTEND_S_I32 :  0xac,
    I64_EXTEND_U_I32 :  0xad,
    I64_TRUNC_S_F32 :  0xae,
    I64_TRUNC_U_F32 :  0xaf,
    I64_TRUNC_S_F64 :  0xb0,
    I64_TRUNC_U_F64 :  0xb1,

    F32_CONVERT_S_I32 :  0xb2,
    F32_CONVERT_U_I32 :  0xb3,
    F32_CONVERT_S_I64 :  0xb4,
    F32_CONVERT_U_I64 :  0xb5,
    F32_DEMOTE_F64 :  0xb6,

    F64_CONVERT_S_I32 :  0xb7,
    F64_CONVERT_U_I32 :  0xb8,
    F64_CONVERT_S_I64 :  0xb9,
    F64_CONVERT_U_I64 :  0xba,
    F64_PROMOTE_F32 :  0xbb,

    //Reinterpretations
    I32_REINTERPRET_F32 :  0xbc,
    I64_REINTERPRET_F64 :  0xbd,
    F32_REINTERPRET_I32 :  0xbe,
    F64_REINTERPRET_I64 :  0xbf,
};

WasmOpcode[WasmOpcode.UNREACHABLE] = "unreachable";
WasmOpcode[WasmOpcode.NOP] = "nop";
WasmOpcode[WasmOpcode.BLOCK] = "block";
WasmOpcode[WasmOpcode.LOOP] = "loop";
WasmOpcode[WasmOpcode.IF] = "if";
WasmOpcode[WasmOpcode.IF_ELSE] = "else";
WasmOpcode[WasmOpcode.END] = "end";
WasmOpcode[WasmOpcode.BR] = "br";
WasmOpcode[WasmOpcode.BR_IF] = "br_if";
WasmOpcode[WasmOpcode.BR_TABLE] = "br_table";
WasmOpcode[WasmOpcode.RETURN] = "return";

    // Call operators
WasmOpcode[WasmOpcode.CALL] = "call";
WasmOpcode[WasmOpcode.CALL_INDIRECT] = "call_indirect";

    //Parametric operators
WasmOpcode[WasmOpcode.DROP] = "drop";
WasmOpcode[WasmOpcode.SELECT] = "select";

    //Variable access
WasmOpcode[WasmOpcode.GET_LOCAL] = "get_local";
WasmOpcode[WasmOpcode.SET_LOCAL] = "set_local";
WasmOpcode[WasmOpcode.TEE_LOCAL] = "tee_local";
WasmOpcode[WasmOpcode.GET_GLOBAL] = "get_global";
WasmOpcode[WasmOpcode.SET_GLOBAL] = "set_global";

    // Memory-related operators
WasmOpcode[WasmOpcode.I32_LOAD] = "i32.load";
WasmOpcode[WasmOpcode.I64_LOAD] = "i64.load";
WasmOpcode[WasmOpcode.F32_LOAD] = "f32.load";
WasmOpcode[WasmOpcode.F64_LOAD] = "f64.load";

WasmOpcode[WasmOpcode.I32_LOAD8_S] = "i32.load8_s";
WasmOpcode[WasmOpcode.I32_LOAD8_U] = "i32_load8_u";
WasmOpcode[WasmOpcode.I32_LOAD16_S] = "i32_load16_s";
WasmOpcode[WasmOpcode.I32_LOAD16_U] = "i32_load16_u";

WasmOpcode[WasmOpcode.I64_LOAD8_S] = "i64.load8_s";
WasmOpcode[WasmOpcode.I64_LOAD8_U] = "i64.load8_u";
WasmOpcode[WasmOpcode.I64_LOAD16_S] = "i64.load16_s";
WasmOpcode[WasmOpcode.I64_LOAD16_U] = "i64.load16_u";
WasmOpcode[WasmOpcode.I64_LOAD32_S] = "i64.load32_s";
WasmOpcode[WasmOpcode.I64_LOAD32_U] = "i64.load32_u";

WasmOpcode[WasmOpcode.I32_STORE] = "i32.store";
WasmOpcode[WasmOpcode.I64_STORE] = "i64.store";
WasmOpcode[WasmOpcode.F32_STORE] = "f32.store";
WasmOpcode[WasmOpcode.F64_STORE] = "f64.store";

WasmOpcode[WasmOpcode.I32_STORE8] = "i32.store8";
WasmOpcode[WasmOpcode.I32_STORE16] = "i32.store16";
WasmOpcode[WasmOpcode.I64_STORE8] = "i64.store8";
WasmOpcode[WasmOpcode.I64_STORE16] = "i64.store16";
WasmOpcode[WasmOpcode.I64_STORE32] = "i64.store32";
WasmOpcode[WasmOpcode.MEMORY_SIZE] = "current_memory";
WasmOpcode[WasmOpcode.GROW_MEMORY] = "grow_memory";

    // Constants
WasmOpcode[WasmOpcode.I32_CONST] = "i32.const";
WasmOpcode[WasmOpcode.I64_CONST] = "i64.const";
WasmOpcode[WasmOpcode.F32_CONST] = "f32.const";
WasmOpcode[WasmOpcode.F64_CONST] = "f64.const";

    //Comparison operators
WasmOpcode[WasmOpcode.I32_EQZ] = "i32.eqz";
WasmOpcode[WasmOpcode.I32_EQ] = "i32.eq";
WasmOpcode[WasmOpcode.I32_NE] = "i32.ne";
WasmOpcode[WasmOpcode.I32_LT_S] = "i32.lt_s";
WasmOpcode[WasmOpcode.I32_LT_U] = "i32.lt_u";
WasmOpcode[WasmOpcode.I32_GT_S] = "i32.gt_s";
WasmOpcode[WasmOpcode.I32_GT_U] = "i32.gt_u";
WasmOpcode[WasmOpcode.I32_LE_S] = "i32.le_s";
WasmOpcode[WasmOpcode.I32_LE_U] = "i32.le_u";
WasmOpcode[WasmOpcode.I32_GE_S] = "i32.ge_s";
WasmOpcode[WasmOpcode.I32_GE_U] = "i32.ge_u";

WasmOpcode[WasmOpcode.I64_EQZ] = "i64.eqz";
WasmOpcode[WasmOpcode.I64_EQ] = "i64.eq";
WasmOpcode[WasmOpcode.I64_NE] = "i64.ne";
WasmOpcode[WasmOpcode.I64_LT_S] = "i64.lt_s";
WasmOpcode[WasmOpcode.I64_LT_U] = "i64.lt_u";
WasmOpcode[WasmOpcode.I64_GT_S] = "i64.gt_s";
WasmOpcode[WasmOpcode.I64_GT_U] = "i64.gt_u";
WasmOpcode[WasmOpcode.I64_LE_S] = "i64.le_s";
WasmOpcode[WasmOpcode.I64_LE_U] = "i64.le_u";
WasmOpcode[WasmOpcode.I64_GE_S] = "i64.ge_s";
WasmOpcode[WasmOpcode.I64_GE_U] = "i64.ge_u";

WasmOpcode[WasmOpcode.F32_EQ] = "f32.eq";
WasmOpcode[WasmOpcode.F32_NE] = "f32.ne";
WasmOpcode[WasmOpcode.F32_LT] = "f32.lt";
WasmOpcode[WasmOpcode.F32_GT] = "f32.gt";
WasmOpcode[WasmOpcode.F32_LE] = "f32.le";
WasmOpcode[WasmOpcode.F32_GE] = "f32.ge";

WasmOpcode[WasmOpcode.F64_EQ] = "f64.eq";
WasmOpcode[WasmOpcode.F64_NE] = "f64.ne";
WasmOpcode[WasmOpcode.F64_LT] = "f64.lt";
WasmOpcode[WasmOpcode.F64_GT] = "f64.gt";
WasmOpcode[WasmOpcode.F64_LE] = "f64.le";
WasmOpcode[WasmOpcode.F64_GE] = "f64.ge";

    //Numeric operators
WasmOpcode[WasmOpcode.I32_CLZ] = "i32.clz";
WasmOpcode[WasmOpcode.I32_CTZ] = "i32.ctz";
WasmOpcode[WasmOpcode.I32_POPCNT] = "i32.popcnt";
WasmOpcode[WasmOpcode.I32_ADD] = "i32.add";
WasmOpcode[WasmOpcode.I32_SUB] = "i32.sub";
WasmOpcode[WasmOpcode.I32_MUL] = "i32.mul";
WasmOpcode[WasmOpcode.I32_DIV_S] = "i32.div_s";
WasmOpcode[WasmOpcode.I32_DIV_U] = "i32.div_u";
WasmOpcode[WasmOpcode.I32_REM_S] = "i32.rem_s";
WasmOpcode[WasmOpcode.I32_REM_U] = "i32.rem_u";
WasmOpcode[WasmOpcode.I32_AND] = "i32.and";
WasmOpcode[WasmOpcode.I32_OR] = "i32.or";
WasmOpcode[WasmOpcode.I32_XOR] = "i32.xor";
WasmOpcode[WasmOpcode.I32_SHL] = "i32.shl";
WasmOpcode[WasmOpcode.I32_SHR_S] = "i32.shr_s";
WasmOpcode[WasmOpcode.I32_SHR_U] = "i32.shr_u";
WasmOpcode[WasmOpcode.I32_ROTL] = "i32.rotl";
WasmOpcode[WasmOpcode.I32_ROTR] = "i32.rotr";

WasmOpcode[WasmOpcode.I64_CLZ] = "i64.clz";
WasmOpcode[WasmOpcode.I64_CTZ] = "i64.ctz";
WasmOpcode[WasmOpcode.I64_POPCNT] = "i64.popcnt";
WasmOpcode[WasmOpcode.I64_ADD] = "i64.add";
WasmOpcode[WasmOpcode.I64_SUB] = "i64.sub";
WasmOpcode[WasmOpcode.I64_MUL] = "i64.mul";
WasmOpcode[WasmOpcode.I64_DIV_S] = "i64.div_s";
WasmOpcode[WasmOpcode.I64_DIV_U] = "i64.div_u";
WasmOpcode[WasmOpcode.I64_REM_S] = "i64.rem_s";
WasmOpcode[WasmOpcode.I64_REM_U] = "i64.rem_u";
WasmOpcode[WasmOpcode.I64_AND] = "i64.and";
WasmOpcode[WasmOpcode.I64_OR] = "i64.or";
WasmOpcode[WasmOpcode.I64_XOR] = "i64.xor";
WasmOpcode[WasmOpcode.I64_SHL] = "i64.shl";
WasmOpcode[WasmOpcode.I64_SHR_S] = "i64.shr_s";
WasmOpcode[WasmOpcode.I64_SHR_U] = "i64.shr_u";
WasmOpcode[WasmOpcode.I64_ROTL] = "i64.rotl";
WasmOpcode[WasmOpcode.I64_ROTR] = "i64.rotr";

WasmOpcode[WasmOpcode.F32_ABS] = "f32.abs";
WasmOpcode[WasmOpcode.F32_NEG] = "f32.neg";
WasmOpcode[WasmOpcode.F32_CEIL] = "f32.ceil";
WasmOpcode[WasmOpcode.F32_FLOOR] = "f32.floor";
WasmOpcode[WasmOpcode.F32_TRUNC] = "f32.trunc";
WasmOpcode[WasmOpcode.F32_NEAREST] = "f32.nearest";
WasmOpcode[WasmOpcode.F32_SQRT] = "f32.sqrt";
WasmOpcode[WasmOpcode.F32_ADD] = "f32.add";
WasmOpcode[WasmOpcode.F32_SUB] = "f32.sub";
WasmOpcode[WasmOpcode.F32_MUL] = "f32.mul";
WasmOpcode[WasmOpcode.F32_DIV] = "f32.div";
WasmOpcode[WasmOpcode.F32_MIN] = "f32.min";
WasmOpcode[WasmOpcode.F32_MAX] = "f32.max";
WasmOpcode[WasmOpcode.F32_COPYSIGN] = "f32.copysign";

WasmOpcode[WasmOpcode.F64_ABS] = "f64.abs";
WasmOpcode[WasmOpcode.F64_NEG] = "f64.neg";
WasmOpcode[WasmOpcode.F64_CEIL] = "f64.ceil";
WasmOpcode[WasmOpcode.F64_FLOOR] = "f64.floor";
WasmOpcode[WasmOpcode.F64_TRUNC] = "f64.trunc";
WasmOpcode[WasmOpcode.F64_NEAREST] = "f64.nearest";
WasmOpcode[WasmOpcode.F64_SQRT] = "f64.sqrt";
WasmOpcode[WasmOpcode.F64_ADD] = "f64.add";
WasmOpcode[WasmOpcode.F64_SUB] = "f64.sub";
WasmOpcode[WasmOpcode.F64_MUL] = "f64.mul";
WasmOpcode[WasmOpcode.F64_DIV] = "f64.div";
WasmOpcode[WasmOpcode.F64_MIN] = "f64.min";
WasmOpcode[WasmOpcode.F64_MAX] = "f64.max";
WasmOpcode[WasmOpcode.F64_COPYSIGN] = "f64.copysign";

    //Conversions
WasmOpcode[WasmOpcode.I32_WRAP_I64] = "i32.wrap/i64";
WasmOpcode[WasmOpcode.I32_TRUNC_S_F32] = "i32.trunc_s/f32";
WasmOpcode[WasmOpcode.I32_TRUNC_U_F32] = "i32.trunc_u/f32";
WasmOpcode[WasmOpcode.I32_TRUNC_S_F64] = "i32.trunc_s/f64";
WasmOpcode[WasmOpcode.I32_TRUNC_U_F64] = "i32.trunc_u/f64";

WasmOpcode[WasmOpcode.I64_EXTEND_S_I32] = "i64.extend_s/i32";
WasmOpcode[WasmOpcode.I64_EXTEND_U_I32] = "i64.extend_u/i32";
WasmOpcode[WasmOpcode.I64_TRUNC_S_F32] = "i64.trunc_s/f32";
WasmOpcode[WasmOpcode.I64_TRUNC_U_F32] = "i64.trunc_u/f32";
WasmOpcode[WasmOpcode.I64_TRUNC_S_F64] = "i64.trunc_s/f64";
WasmOpcode[WasmOpcode.I64_TRUNC_U_F64] = "i64.trunc_u/f64";

WasmOpcode[WasmOpcode.F32_CONVERT_S_I32] = "f32.convert_s/i32";
WasmOpcode[WasmOpcode.F32_CONVERT_U_I32] = "f32.convert_u/i32";
WasmOpcode[WasmOpcode.F32_CONVERT_S_I64] = "f32.convert_s/i64";
WasmOpcode[WasmOpcode.F32_CONVERT_U_I64] = "f32.convert_u/i64";
WasmOpcode[WasmOpcode.F32_DEMOTE_F64] = "f32.demote/f64";

WasmOpcode[WasmOpcode.F64_CONVERT_S_I32] = "f64.convert_s/i32";
WasmOpcode[WasmOpcode.F64_CONVERT_U_I32] = "f64.convert_u/i32";
WasmOpcode[WasmOpcode.F64_CONVERT_S_I64] = "f64.convert_s/i64";
WasmOpcode[WasmOpcode.F64_CONVERT_U_I64] = "f64.convert_u/i64";
WasmOpcode[WasmOpcode.F64_PROMOTE_F32] = "f64.promote/f32";

    //Reinterpretations
WasmOpcode[WasmOpcode.I32_REINTERPRET_F32] = "i32.reinterpret/f32";
WasmOpcode[WasmOpcode.I64_REINTERPRET_F64] = "i64.reinterpret/f64";
WasmOpcode[WasmOpcode.F32_REINTERPRET_I32] = "f32.reinterpret/i32";
WasmOpcode[WasmOpcode.F64_REINTERPRET_I64] = "f64.reinterpret/i64";

Object.freeze(WasmOpcode);
