import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmFunction} from "../../core/wasm-function";
/**
 * Created by 01 on 2017-06-17.
 */
export class FunctionDeclarationSection extends WasmSectionBinary {
    functions:WasmFunction[];
    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Function,
            payload.length,
            null, null,
            payload
        );
        this.functions = [];
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
