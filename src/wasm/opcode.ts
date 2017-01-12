/**
 * Created by nidin on 2017-01-12.
 */
export class WasmOpcode {
    // Control flow operators
    static UNREACHABLE: byte = 0x00;
    static NOP: byte = 0x01;
    static BLOCK: byte = 0x02;
    static LOOP: byte = 0x03;
    static IF: byte = 0x04;
    static IF_ELSE: byte = 0x05;
    static END: byte = 0x0b;
    static BR: byte = 0x0c;
    static BR_IF: byte = 0x0d;
    static BR_TABLE: byte = 0x0e;
    static RETURN: byte = 0x0f;

    // Call operators
    static CALL: byte = 0x10;
    static CALL_INDIRECT: byte = 0x11;

    //Parametric operators
    static DROP: byte = 0x1a;
    static SELECT: byte = 0x1b;

    //Variable access
    static GET_LOCAL: byte = 0x20;
    static SET_LOCAL: byte = 0x21;
    static TEE_LOCAL: byte = 0x22;
    static GET_GLOBAL: byte = 0x23;
    static SET_GLOBAL: byte = 0x24;

    // Memory-related operators
    static I32_LOAD: byte = 0x28;
    static I64_LOAD: byte = 0x29;
    static F32_LOAD: byte = 0x2a;
    static F64_LOAD: byte = 0x2b;

    static I32_LOAD8_S: byte = 0x2c;
    static I32_LOAD8_U: byte = 0x2d;
    static I32_LOAD16_S: byte = 0x2e;
    static I32_LOAD16_U: byte = 0x2f;

    static I64_LOAD8_S: byte = 0x30;
    static I64_LOAD8_U: byte = 0x31;
    static I64_LOAD16_S: byte = 0x32;
    static I64_LOAD16_U: byte = 0x33;
    static I64_LOAD32_S: byte = 0x34;
    static I64_LOAD32_U: byte = 0x35;

    static I32_STORE: byte = 0x36;
    static I64_STORE: byte = 0x37;
    static F32_STORE: byte = 0x38;
    static F64_STORE: byte = 0x39;

    static I32_STORE8: byte = 0x3a;
    static I32_STORE16: byte = 0x3b;
    static I64_STORE8: byte = 0x3c;
    static I64_STORE16: byte = 0x3d;
    static I64_STORE32: byte = 0x3e;
    static MEMORY_SIZE: byte = 0x3f; //query the size of memory
    static GROW_MEMORY: byte = 0x40;

    // Constants
    static I32_CONST: byte = 0x41;
    static I64_CONST: byte = 0x42;
    static F32_CONST: byte = 0x43;
    static F64_CONST: byte = 0x44;

    //Comparison operators
    static I32_EQZ: byte = 0x45;
    static I32_EQ: byte = 0x46;
    static I32_NE: byte = 0x47;
    static I32_LT_S: byte = 0x48;
    static I32_LT_U: byte = 0x49;
    static I32_GT_S: byte = 0x4a;
    static I32_GT_U: byte = 0x4b;
    static I32_LE_S: byte = 0x4c;
    static I32_LE_U: byte = 0x4d;
    static I32_GE_S: byte = 0x4e;
    static I32_GE_U: byte = 0x4f;

    static I64_EQZ: byte = 0x50;
    static I64_EQ: byte = 0x51;
    static I64_NE: byte = 0x52;
    static I64_LT_S: byte = 0x53;
    static I64_LT_U: byte = 0x54;
    static I64_GT_S: byte = 0x55;
    static I64_GT_U: byte = 0x56;
    static I64_LE_S: byte = 0x57;
    static I64_LE_U: byte = 0x58;
    static I64_GE_S: byte = 0x59;
    static I64_GE_U: byte = 0x5a;

    static F32_EQ: byte = 0x5b;
    static F32_NE: byte = 0x5c;
    static F32_LT: byte = 0x5d;
    static F32_GT: byte = 0x5e;
    static F32_LE: byte = 0x5f;
    static F32_GE: byte = 0x60;

    static F64_EQ: byte = 0x61;
    static F64_NE: byte = 0x62;
    static F64_LT: byte = 0x63;
    static F64_GT: byte = 0x64;
    static F64_LE: byte = 0x65;
    static F64_GE: byte = 0x66;

    //Numeric operators
    static I32_CLZ: byte = 0x67;
    static I32_CTZ: byte = 0x68;
    static I32_POPCNT: byte = 0x69;
    static I32_ADD: byte = 0x6a;
    static I32_SUB: byte = 0x6b;
    static I32_MUL: byte = 0x6c;
    static I32_DIV_S: byte = 0x6d;
    static I32_DIV_U: byte = 0x6e;
    static I32_REM_S: byte = 0x6f;
    static I32_REM_U: byte = 0x70;
    static I32_AND: byte = 0x71;
    static I32_OR: byte = 0x72;
    static I32_XOR: byte = 0x73;
    static I32_SHL: byte = 0x74;
    static I32_SHR_S: byte = 0x75;
    static I32_SHR_U: byte = 0x76;
    static I32_ROTL: byte = 0x77;
    static I32_ROTR: byte = 0x78;

    static I64_CLZ: byte = 0x79;
    static I64_CTZ: byte = 0x7a;
    static I64_POPCNT: byte = 0x7b;
    static I64_ADD: byte = 0x7c;
    static I64_SUB: byte = 0x7d;
    static I64_MUL: byte = 0x7e;
    static I64_DIV_S: byte = 0x7f;
    static I64_DIV_U: byte = 0x80;
    static I64_REM_S: byte = 0x81;
    static I64_REM_U: byte = 0x82;
    static I64_AND: byte = 0x83;
    static I64_OR: byte = 0x84;
    static I64_XOR: byte = 0x85;
    static I64_SHL: byte = 0x86;
    static I64_SHR_S: byte = 0x87;
    static I64_SHR_U: byte = 0x88;
    static I64_ROTL: byte = 0x89;
    static I64_ROTR: byte = 0x8a;

    static F32_ABS: byte = 0x8b;
    static F32_NEG: byte = 0x8c;
    static F32_CEIL: byte = 0x8d;
    static F32_FLOOR: byte = 0x8e;
    static F32_TRUNC: byte = 0x8f;
    static F32_NEAREST: byte = 0x90;
    static F32_SQRT: byte = 0x91;
    static F32_ADD: byte = 0x92;
    static F32_SUB: byte = 0x93;
    static F32_MUL: byte = 0x94;
    static F32_DIV: byte = 0x95;
    static F32_MIN: byte = 0x96;
    static F32_MAX: byte = 0x97;
    static F32_COPYSIGN: byte = 0x98;

    static F64_ABS: byte = 0x99;
    static F64_NEG: byte = 0x9a;
    static F64_CEIL: byte = 0x9b;
    static F64_FLOOR: byte = 0x9c;
    static F64_TRUNC: byte = 0x9d;
    static F64_NEAREST: byte = 0x9e;
    static F64_SQRT: byte = 0x9f;
    static F64_ADD: byte = 0xa0;
    static F64_SUB: byte = 0xa1;
    static F64_MUL: byte = 0xa2;
    static F64_DIV: byte = 0xa3;
    static F64_MIN: byte = 0xa4;
    static F64_MAX: byte = 0xa5;
    static F64_COPYSIGN: byte = 0xa6;

    //Conversions
    static I32_WRAP_I64: byte = 0xa7;
    static I32_TRUNC_S_F32: byte = 0xa8;
    static I32_TRUNC_U_F32: byte = 0xa9;
    static I32_TRUNC_S_F64: byte = 0xaa;
    static I32_TRUNC_U_F64: byte = 0xab;

    static I64_EXTEND_S_I32: byte = 0xac;
    static I64_EXTEND_U_I32: byte = 0xad;
    static I64_TRUNC_S_F32: byte = 0xae;
    static I64_TRUNC_U_F32: byte = 0xaf;
    static I64_TRUNC_S_F64: byte = 0xb0;
    static I64_TRUNC_U_F64: byte = 0xb1;

    static F32_CONVERT_S_I32: byte = 0xb2;
    static F32_CONVERT_U_I32: byte = 0xb3;
    static F32_CONVERT_S_I64: byte = 0xb4;
    static F32_CONVERT_U_I64: byte = 0xb5;
    static F32_DEMOTE_F64: byte = 0xb6;

    static F64_CONVERT_S_I32: byte = 0xb7;
    static F64_CONVERT_U_I32: byte = 0xb8;
    static F64_CONVERT_S_I64: byte = 0xb9;
    static F64_CONVERT_U_I64: byte = 0xba;
    static F64_PROMOTE_F32: byte = 0xbb;

    //Reinterpretations
    static I32_REINTERPRET_F32: byte = 0xbc;
    static I64_REINTERPRET_F64: byte = 0xbd;
    static F32_REINTERPRET_I32: byte = 0xbe;
    static F64_REINTERPRET_I64: byte = 0xbf;
}