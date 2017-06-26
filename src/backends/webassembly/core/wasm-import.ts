import {WasmSignature} from "./wasm-signature";
import {WasmExternalKind} from "./wasm-external-kind";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmImport {
    constructor(public namespace: string,
                public name: string,
                public type: WasmExternalKind,
                public signatureIndex: int32,
                public signature?: WasmSignature) {

    }
}