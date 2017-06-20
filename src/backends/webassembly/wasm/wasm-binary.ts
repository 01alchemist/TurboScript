import {WasmSectionBinary} from "./wasm-binary-section";
import {ByteArray} from "../../../utils/bytearray";
import {Terminal} from "../../../utils/terminal";
import {WasmSection} from "../core/wasm-section";
import {parseSection} from "./wasm-parser";
/**
 * Created by n.vinayakan on 17.06.17.
 */
export class WasmBinary {

    static MAGIC = 0x6d736100; //'\0' | 'a' << 8 | 's' << 16 | 'm' << 24;
    static VERSION = 0x1;
    static SIZE_IN_PAGES = 1;
    static SET_MAX_MEMORY = false;
    static MAX_MEMORY = 1024 * 1024 * 1024;
    static MEMORY_INITIALIZER_BASE = 8; // Leave space for "null"

    data: ByteArray;
    sections: WasmSectionBinary[];
    sectionMap: Map<WasmSection, int32>;

    constructor(data?: Uint8Array | ByteArray) {
        this.sections = [];
        this.sectionMap = new Map<WasmSection, int32>();
        if (data !== undefined) {
            this.read(data);
        } else {
            this.data = new ByteArray();
            this.data.log = "";
            this.data.writeUnsignedInt(WasmBinary.MAGIC);
            this.data.writeUnsignedInt(WasmBinary.VERSION);
            this.data.log += '0000000: 0061 736d             ; WASM_BINARY_MAGIC\n';
            this.data.log += '0000004: 0100 0000             ; WASM_BINARY_VERSION\n';
        }
    }

    read(data: Uint8Array | ByteArray) {
        if (data !== null && data !== undefined) {
            this.data = new ByteArray(data.buffer);
            this.data.endian = ByteArray.LITTLE_ENDIAN;
            console.log("Test1");
            console.log("byteLength:" + data.buffer.byteLength);
            console.log("pos:" + this.data.position);
            // Check magic number
            let magic = this.data.readUnsignedInt();
            let version = this.data.readUnsignedInt();

            if (magic !== WasmBinary.MAGIC) {
                console.log("Unknown WASM magic number", magic, WasmBinary.MAGIC);
            } else {
                console.log("WASM Version:" + version);
            }
            this.readNextSection();
        }
    }

    readNextSection() {
        if (this.data.bytesAvailable > 0) {
            let section = parseSection(this.data);
            this.sections.push(section);
        } else {
            Terminal.write(`${this.sections.length} Sections parsed!`);
        }
    }

    publish():void {
        this.sections.forEach(section => {
            section.publish(this.data);
        })
    }

}