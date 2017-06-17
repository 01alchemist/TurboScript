import {WasmType} from "./wasm-type";
import {Symbol} from "../../../compiler/core/symbol";
import {WasmLocal, WasmLocalEntry} from "./wasm-local";
import {ByteArray} from "../../../utils/bytearray";
import {WasmSignature} from "./wasm-signature";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmFunction {
    symbol: Symbol;
    signatureIndex: int32;
    signature: WasmSignature;
    isExported: boolean;
    isConstructor: boolean;
    firstLocal: WasmLocal;
    lastLocal: WasmLocal;
    localEntries: WasmLocalEntry[];
    argumentEntries: WasmLocalEntry[];
    localVariables: WasmLocalEntry[];
    localCount: int32 = 0;
    returnType: WasmType;
    body: ByteArray;
    offset: int32;
    next: WasmFunction;

    constructor() {
        this.localVariables = [];
    }
}
