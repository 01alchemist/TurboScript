import {ByteArray} from "../../../utils/bytearray";

/**
 * Created by n.vinayakan on 17.06.17.
 */
export class WasmSectionBinary {
    constructor(
        public id:uint8, // section code
        public payload_len:uint32, // size of this section in bytes
        public name_len:uint32, // length of name in bytes, present if id == 0
        public name:string, // section name: valid UTF-8 byte sequence, present if id == 0
        public payload_data:ByteArray // content of this section, of length payload_len - sizeof(name) - sizeof(name_len)
    ){

    }
}
