import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
/**
 * Created by 01 on 2017-06-17.
 */
export class StartSection extends WasmSectionBinary {
    startFunctionIndex:int32 = -1;
    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Start,
            payload.length,
            null, null,
            payload
        )
    }

    read(): void {
        this.startFunctionIndex = this.payload.readU32LEB();
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
