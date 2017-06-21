import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmGlobal} from "../../core/wasm-global";
/**
 * Created by 01 on 2017-06-17.
 */
export class GlobalSection extends WasmSectionBinary {
    globals:WasmGlobal[];
    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Global,
            payload.length,
            null, null,
            payload
        );
        this.globals = [];
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
