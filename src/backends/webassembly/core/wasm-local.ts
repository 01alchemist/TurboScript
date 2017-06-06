import {Symbol} from "../../../compiler/core/symbol";
import {WasmType} from "./wasm-type";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmLocal {
    type:WasmType;
    symbol: Symbol;
    next: WasmLocal;
}