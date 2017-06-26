import {toHex} from "../../../utils/utils";
import {ByteArray} from "../../../utils/bytearray";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export function log(array: ByteArray, offset = 0, value?:number, msg:string = "") {
    array.log += (value != null ? `${toHex(offset + array.position)}: ${toHex(value, 2)}                    ; ` : "") + (msg != null ? `${msg}\n` : "\n");
}
export function logData(array: ByteArray, offset = 0, value:number, addPosition = true) {
    array.log += (addPosition ? `${toHex(offset + array.position)}: ${toHex(value, 2)}` : ` ${toHex(value, 2)}`);
}