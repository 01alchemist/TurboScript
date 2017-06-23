import {WasmType} from "./wasm-type";
import {assert} from "../../../utils/assert";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmSignature {
    argumentTypes: WasmType[];
    returnType: WasmType;

    constructor() {
        this.argumentTypes = [];
        this.returnType = WasmType.VOID; // Default return type
    }
}

export function wasmAreSignaturesEqual(a: WasmSignature, b: WasmSignature): boolean {
    assert(a.returnType != null);
    assert(b.returnType != null);

    let x = a.argumentTypes;
    let y = b.argumentTypes;
    if(x.length !== y.length){
        return false;
    }
    let equal = true;
    x.some((x_id, index) => {
        if (x_id !== y[index]) {
            equal = false;
            return true;
        }
        return false;
    });

    if (a.returnType != b.returnType) {
        return false;
    }

    return equal;
}
