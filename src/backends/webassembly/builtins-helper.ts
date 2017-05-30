import {WasmOpcode} from "./opcode";
/**
 * Created by n.vinayakan on 28.05.17.
 */
export const builtins = [
    "rotl",
    "rotl32",
    "rotr",
    "rotr32",
    "clz",
    "clz32",
    "ctz",
    "ctz32",
    "popcnt",
    "popcnt32",
    "abs",
    "abs32",
    "ceil",
    "ceil32",
    "floor",
    "floor32",
    "sqrt",
    "sqrt32",
    "trunc",
    "trunc32",
    "nearest",
    "nearest32",
    "min",
    "min32",
    "max",
    "max32",
    "copysign",
    "copysign32",
    "reinterpret_i32",
    "reinterpret_i64",
    "reinterpret_f32",
    "reinterpret_f64",
    "current_memory",
    "grow_memory"
];

export function getBuiltinOpcode(name:string):number {
    switch (name){
        case "rotl": return WasmOpcode.I64_ROTL;
        case "rotl32": return WasmOpcode.I32_ROTL;
        case "rotr": return WasmOpcode.I64_ROTR;
        case "rotr32": return WasmOpcode.I32_ROTR;
        case "clz": return WasmOpcode.I64_CLZ;
        case "clz32": return WasmOpcode.I32_CLZ;
        case "ctz": return WasmOpcode.I64_CTZ;
        case "ctz32": return WasmOpcode.I32_CTZ;
        case "popcnt": return WasmOpcode.I64_POPCNT;
        case "popcnt32": return WasmOpcode.I32_POPCNT;
        case "abs": return WasmOpcode.F64_ABS;
        case "abs32": return WasmOpcode.F32_ABS;
        case "ceil": return WasmOpcode.F64_CEIL;
        case "ceil32": return WasmOpcode.F32_CEIL;
        case "floor": return WasmOpcode.F64_FLOOR;
        case "floor32": return WasmOpcode.F32_FLOOR;
        case "sqrt": return WasmOpcode.F64_SQRT;
        case "sqrt32": return WasmOpcode.F32_SQRT;
        case "trunc": return WasmOpcode.F64_TRUNC;
        case "trunc32": return WasmOpcode.F32_TRUNC;
        case "nearest": return WasmOpcode.F64_NEAREST;
        case "nearest32": return WasmOpcode.F32_NEAREST;
        case "min": return WasmOpcode.F64_MIN;
        case "min32": return WasmOpcode.F32_MIN;
        case "max": return WasmOpcode.F64_MAX;
        case "max32": return WasmOpcode.F32_MAX;
        case "copysign": return WasmOpcode.F64_COPYSIGN;
        case "copysign32": return WasmOpcode.F32_COPYSIGN;
        case "reinterpret_i32": return WasmOpcode.F32_REINTERPRET_I32;
        case "reinterpret_i64": return WasmOpcode.F64_REINTERPRET_I64;
        case "reinterpret_f32": return WasmOpcode.I32_REINTERPRET_F32;
        case "reinterpret_f64": return WasmOpcode.I64_REINTERPRET_F64;
        case "current_memory": return WasmOpcode.MEMORY_SIZE;
        case "grow_memory": return WasmOpcode.GROW_MEMORY;
        default: throw "No builtin function named '"+name+"'";
    }
}

export function isBuiltin(name: string):boolean {
    return builtins.indexOf(name) > -1;
}
