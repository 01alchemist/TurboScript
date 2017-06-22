import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
/**
 * Created by 01 on 2017-06-17.
 */
export class StartSection extends WasmSectionBinary {
    startFunctionIndex:int32;
    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Start,
            payload.length,
            null, null,
            payload
        )
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
