import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
/**
 * Created by 01 on 2017-06-17.
 */
export class ElementSection extends WasmSectionBinary {
    constructor(){
        super(
            WasmSection.Element,
            0,
            null, null,
            new ByteArray()
        )
    }
}
