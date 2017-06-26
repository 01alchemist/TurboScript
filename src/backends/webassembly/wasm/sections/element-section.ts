import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmElement} from "../../core/wasm-element";
/**
 * Created by 01 on 2017-06-17.
 */
export class ElementSection extends WasmSectionBinary {
    elements: WasmElement[];

    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Element,
            payload.length,
            null, null,
            payload
        );
        this.elements = [];
    }

    read(): void {

    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
