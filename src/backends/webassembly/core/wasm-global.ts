import {Symbol} from "../../../compiler/core/symbol";
import {WasmType} from "./wasm-type";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmGlobalEntry {
    constructor(public type: WasmType,
                public immutable: boolean,
                public name: string) {

    }
}
export class WasmGlobal {
    symbol: Symbol;
    type: WasmType;
    next: WasmGlobal;
}