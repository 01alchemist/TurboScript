import {ByteArray} from "../../../utils/bytearray";
import {log} from "../utils/logger";
import {StringBuilder} from "../../../utils/stringbuilder";

/**
 * Created by n.vinayakan on 17.06.17.
 */

export class WasmSectionBinary {

    code: StringBuilder;

    constructor(public id: uint8, // section code
                public payload_len: uint32, // size of this section in bytes
                public name_len: uint32 = -1, // length of name in bytes, present if id == 0
                public name: string = "", // section name: valid UTF-8 byte sequence, present if id == 0
                public payload: ByteArray = new ByteArray() // content of this section, of length payload_len - sizeof(name) - sizeof(name_len)
    ) {
        this.code = new StringBuilder(2);
        this.code.indent = 1;
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
        data.copy(this.payload);
        data.log += this.payload.log;
    }

    read() {

    }
}
