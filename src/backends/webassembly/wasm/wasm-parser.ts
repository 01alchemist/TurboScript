import {WasmSectionBinary} from "./wasm-binary-section";
/**
 * Created by 01 on 2017-06-19.
 */
export class WasmParser {
    constructor() {

    }
}

export function parseSection(data:ByteArray):WasmSectionBinary{
    let sectionBinary = new WasmSectionBinary();
    return sectionBinary;
}