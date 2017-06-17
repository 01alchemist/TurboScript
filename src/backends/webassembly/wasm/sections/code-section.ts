import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
/**
 * Created by 01 on 2017-06-17.
 */
export class CodeSection extends WasmSectionBinary {
    constructor(){
        super(
            WasmSection.Code,
            0,
            null, null,
            new ByteArray()
        )
    }
}
