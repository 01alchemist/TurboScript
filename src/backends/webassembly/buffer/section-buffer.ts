import {log} from "../utils/logger";
import {ByteArray} from "../../../utils/bytearray";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class SectionBuffer {

    data: ByteArray;
    offset: number;

    constructor(public id, public name?: string) {
        this.data = new ByteArray();
    }

    publish(array: ByteArray) {
        log(array, 0, this.id, "section code");
        array.writeUnsignedLEB128(this.id);//section code


        if (this.id == 0) {
            let strData: ByteArray = new ByteArray();
            strData.writeWasmString(this.name);
            log(array, 0, this.data.length, "section size");
            array.writeUnsignedLEB128(this.data.length + strData.length);//size of this section in bytes
            array.copy(strData);
        } else {
            log(array, 0, this.data.length, "section size");
            array.writeUnsignedLEB128(this.data.length);//size of this section in bytes
        }

        array.log += this.data.log;
        array.copy(this.data);
    }
}
