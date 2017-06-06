import {WasmWrappedType} from "./wasm-type";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmSignature {
    argumentCount:int32;
    argumentTypes: WasmWrappedType;
    returnType: WasmWrappedType;
    next: WasmSignature;
}

export function wasmAreSignaturesEqual(a: WasmSignature, b: WasmSignature): boolean {
    assert(a.returnType != null);
    assert(b.returnType != null);
    assert(a.returnType.next == null);
    assert(b.returnType.next == null);

    let x = a.argumentTypes;
    let y = b.argumentTypes;

    while (x != null && y != null) {
        if (x.id != y.id) {
            return false;
        }

        x = x.next;
        y = y.next;
    }

    if (x != null || y != null) {
        return false;
    }

    if (a.returnType.id != b.returnType.id) {
        return false;
    }

    return true;
}
