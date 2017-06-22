import {WasmType} from "./wasm-type";
import {Symbol} from "../../../compiler/core/symbol";
import {WasmLocal} from "./wasm-local";
import {ByteArray} from "../../../utils/bytearray";
import {WasmSignature} from "./wasm-signature";
import {StringBuilder} from "../../../utils/stringbuilder";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmFunction {
    signatureIndex: int32;
    signature: WasmSignature;

    isExported: boolean;
    isConstructor: boolean;

    argumentVariables: WasmLocal[];
    localVariables: WasmLocal[];
    locals: WasmLocal[]; // argumentVariables + local variables

    returnType: WasmType;
    body: ByteArray;
    code: StringBuilder;
    offset: int32;

    constructor(public name: string,
                public symbol?: Symbol) {
        this.localVariables = [];
        this.returnType = WasmType.VOID;
        this.code = new StringBuilder(2);
    }
}
