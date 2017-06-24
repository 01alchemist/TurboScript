import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
/**
 * Created by 01 on 2017-06-17.
 */
export class CustomSection extends WasmSectionBinary {
    constructor(name:string, payload = new ByteArray()) {
        super(
            WasmSection.Custom,
            payload.length,
            -1, name,
            payload
        )
    }

    read(): void {

    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
