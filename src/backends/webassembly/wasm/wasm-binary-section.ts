import {ByteArray} from "../../../utils/bytearray";
import {log} from "../utils/logger";

/**
 * Created by n.vinayakan on 17.06.17.
 */
export class WasmSectionBinary {
    constructor(public id: uint8, // section code
                public payload_len: uint32, // size of this section in bytes
                public name_len: uint32 = null, // length of name in bytes, present if id == 0
                public name: string = null, // section name: valid UTF-8 byte sequence, present if id == 0
                public payload?: ByteArray // content of this section, of length payload_len - sizeof(name) - sizeof(name_len)
    ) {

    }

    publish(data: ByteArray): void {
        data.writeUnsignedLEB128(this.id);//section code
        if (this.id == 0) {
            let strData: ByteArray = new ByteArray();
            strData.writeWasmString(this.name);
            log(data, 0, this.payload.length, "section size");
            data.writeUnsignedLEB128(this.payload.length + strData.length);//size of this section in bytes
            data.copy(strData);
        } else {
            log(data, 0, this.payload.length, "section size");
            data.writeUnsignedLEB128(this.payload.length);//size of this section in bytes
        }
    }
}
