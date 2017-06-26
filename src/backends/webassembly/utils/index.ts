import {Bitness} from "../../bitness";
import {Type} from "../../../compiler/core/type";
import {WasmType, WasmWrappedType} from "../core/wasm-type";
import {assert} from "../../../utils/assert";
import {SymbolKind, Symbol} from "../../../compiler/core/symbol";
/**
 * Created by n.vinayakan on 17.06.17.
 */
export function getWasmFunctionName(symbol: Symbol): string {
    if (symbol === undefined || symbol === null) return "";
    let moduleName = symbol.kind == SymbolKind.FUNCTION_INSTANCE ? symbol.parent().internalName : "";
    return (moduleName == "" ? "" : moduleName + "_") + symbol.internalName;
}

export function symbolToWasmType(symbol: Symbol, bitness?: Bitness): WasmType {
    let type = symbol.resolvedType;
    if (type.isFloat()) {
        return WasmType.F32;
    }
    else if (type.isDouble()) {
        return WasmType.F64;
    }
    else if (type.isInteger() || (bitness == Bitness.x32 && type.pointerTo)) {
        return WasmType.I32;
    }
    else if (type.isLong() || (bitness == Bitness.x64 && type.pointerTo)) {
        return WasmType.I64;
    } else {
        return WasmType.I32;
    }
}

export function wasmToTurboType(type: WasmType): string {
    switch (type) {
        case WasmType.VOID:
            return "void";
        case WasmType.I32:
            return "int32";
        case WasmType.I64:
            return "int64";
        case WasmType.F32:
            return "float32";
        case WasmType.F64:
            return "float64";
    }
}

export function typeToDataType(type: Type, bitness?: Bitness): string {
    if (type.isFloat()) {
        return "F32";
    }
    else if (type.isDouble()) {
        return "F64";
    }
    else if (type.isInteger() || (bitness == Bitness.x32 && type.pointerTo)) {
        return "I32";
    }
    else if (type.isLong() || (bitness == Bitness.x64 && type.pointerTo)) {
        return "I64";
    }
    else {
        return "I32";
    }
}

export function getTypedArrayElementSize(name: string): int32 {
    switch (name) {
        case "Uint8ClampedArray":
        case "Uint8Array":
        case "Int8Array":
            return 1;
        case "Uint16Array":
        case "Int16Array":
            return 2;
        case "Uint32Array":
        case "Int32Array":
        case "Float32Array":
            return 4;
        case "Float64Array":
            return 8;
        default :
            throw "unknown typed array";
    }
}