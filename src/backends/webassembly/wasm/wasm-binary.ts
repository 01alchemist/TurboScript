import {WasmSectionBinary} from "./wasm-binary-section";
import {ByteArray} from "../../../utils/bytearray";
import {Terminal} from "../../../utils/terminal";
import {WasmSection} from "../core/wasm-section";
import {createSection, parseSection} from "./wasm-parser";
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

    constructor(data?: Uint8Array | ByteArray | Buffer) {
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

    read(data: Uint8Array | ByteArray | Buffer) {
        if (data !== null && data !== undefined) {
            this.data = new ByteArray(data.buffer, data.byteOffset, data.byteLength);
            this.data.endian = ByteArray.LITTLE_ENDIAN;
            // Check magic number
            let magic = this.data.readUnsignedInt();
            let version = this.data.readUnsignedInt();

            if (magic !== WasmBinary.MAGIC) {
                console.log(`Got unknown WASM magic number ${magic} instead of ${WasmBinary.MAGIC}`);
            } else {
                console.log("WASM Version:" + version);
            }
            this.readNextSection();
        }
    }

    readNextSection() {
        if (this.data.bytesAvailable > 0) {
            let section = parseSection(this.data);
            this.sectionMap.set(section.id, this.sections.push(section) - 1);
            this.readNextSection();
        } else {
            Terminal.log(`${this.sections.length} Sections parsed!`);
        }
    }

    reset() {
        this.sections = null;
        this.sections = [];
        this.sectionMap = null;
        this.sectionMap = new Map<WasmSection, int32>();
        this.data = new ByteArray();
        this.data.log = "";
        this.data.writeUnsignedInt(WasmBinary.MAGIC);
        this.data.writeUnsignedInt(WasmBinary.VERSION);
        this.data.log += '0000000: 0061 736d             ; WASM_BINARY_MAGIC\n';
        this.data.log += '0000004: 0100 0000             ; WASM_BINARY_VERSION\n';
    }

    appendSection(section: WasmSectionBinary) {
        this.sectionMap.set(section.id, this.sections.push(section) - 1);
    }

    getSection(id: WasmSection): WasmSectionBinary {
        let index = this.sectionMap.get(id);
        if (index !== undefined) {
            return this.sections[index];
        } else {
            let section = createSection(id);
            let warn = `Section ${WasmSection[id]} created! Reason: Requested section not found in the imported wasm module`;
            Terminal.warn(warn);
            return section;
        }
    }

    initializeSections() {
        this.appendSection(createSection(WasmSection.Signature));
        this.appendSection(createSection(WasmSection.Import));
        this.appendSection(createSection(WasmSection.Function));
        this.appendSection(createSection(WasmSection.Table));
        this.appendSection(createSection(WasmSection.Memory));
        this.appendSection(createSection(WasmSection.Global));
        this.appendSection(createSection(WasmSection.Export));
        this.appendSection(createSection(WasmSection.Start));
        this.appendSection(createSection(WasmSection.Element));
        this.appendSection(createSection(WasmSection.Code));
        this.appendSection(createSection(WasmSection.Data));
        this.appendSection(createSection(WasmSection.Custom, "name"));
    }
}
