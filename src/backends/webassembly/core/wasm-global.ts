import {Symbol} from "../../../compiler/core/symbol";
import {WasmType} from "./wasm-type";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmGlobal {
    constructor(public type: WasmType,
                public immutable: boolean,
                public name: string,
                public symbol?: Symbol) {

    }
}