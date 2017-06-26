import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmName} from "../../core/wasm-name";
/**
 * Created by 01 on 2017-06-17.
 */
export class CustomSection extends WasmSectionBinary {
    names:WasmName[];
    constructor(name:string, payload = new ByteArray()) {
        super(
            WasmSection.Custom,
            payload.length,
            -1, name,
            payload
        );
        this.names = [];
    }

    read(): void {

    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
