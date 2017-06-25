import {WasmSignature} from "../../backends/webassembly/core/wasm-signature";
import {wasmToTurboType} from "../../backends/webassembly/utils/index";
/**
 * Created by n.vinayakan on 23.06.17.
 */
export class WasmBinaryImport {
    declaration: string;

    constructor(public name: string,
                public signature: WasmSignature,
                public functionIndex: int32) {
        this.declaration = `declare function ${name}(`;
        signature.argumentTypes.forEach((type, i) => {
            this.declaration += i > 0 ? "," : "";
            this.declaration += `param${i}:${wasmToTurboType(type)}`;
        });
        this.declaration += "):" + wasmToTurboType(signature.returnType) + ";";
    }
}
