import {WasmType} from "../core/wasm-type";
/**
 * Created by n.vinayakan on 03.06.17.
 */
export class WasmRuntimeProperty {
    value: number;
    constructor(public type: WasmType, public name?:string) {

    }
}