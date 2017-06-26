import {ByteArray} from "../../../utils/bytearray";
import {StringBuilder} from "../../../utils/stringbuilder";
/**
 * Created by 01 on 2017-06-23.
 */
export class WasmFunctionChunk {
    constructor(public payload: ByteArray = new ByteArray(),
                public code: StringBuilder = new StringBuilder(2)) {
        this.code.emitIndent(2);
    }
}