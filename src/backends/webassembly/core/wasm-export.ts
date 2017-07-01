import {WasmExternalKind} from "./wasm-external-kind";
/**
 * Created by 01 on 2017-06-19.
 */
export class WasmExport {
    constructor(
        public name:string,
        public kind:WasmExternalKind,
        public index:int32,
        public as:string = name
    ){
    }
}
