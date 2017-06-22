import {WasmSignature} from "./wasm-signature";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmImport {
    signatureIndex: int32;
    signature: WasmSignature;
    namespace: string;
    name: string;
}