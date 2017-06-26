import {WasmSectionBinary} from "./wasm-binary-section";
import {ByteArray} from "../../../utils/bytearray";
import {Terminal} from "../../../utils/terminal";
import {WasmSection} from "../core/wasm-section";
import {createSection, parseSection} from "./wasm-parser";
import {SignatureSection} from "./sections/signature-section";
import {ImportSection} from "./sections/import-section";
import {FunctionSection} from "./sections/function-section";
import {TableSection} from "./sections/table-section";
import {MemorySection} from "./sections/memory-section";
import {GlobalSection} from "./sections/global-section";
import {ExportSection} from "./sections/export-section";
import {StartSection} from "./sections/start-section";
import {ElementSection} from "./sections/element-section";
import {CodeSection} from "./sections/code-section";
import {DataSection} from "./sections/data-section";
import {CustomSection} from "./sections/name-section";
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
                Terminal.error(`Found unknown WASM magic number ${magic} instead of ${WasmBinary.MAGIC}`);
            }
            this.readNextSection();
        }
    }

    readNextSection() {
        if (this.data.bytesAvailable > 0) {
            let section = parseSection(this.data);
            if(section !== null) {
                this.sectionMap.set(section.id, this.sections.push(section) - 1);
            }
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

    getSection(id: WasmSection, name?:string): WasmSectionBinary {
        let index = this.sectionMap.get(id);
        if (index !== undefined) {
            return this.sections[index];
        } else {
            let section = createSection(id, name);
            this.appendSection(section);
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

    copySections(binary: WasmBinary) {
        binary.sections.forEach(importedSection => {
            switch (importedSection.id){
                case WasmSection.Signature: {
                    let section: SignatureSection = this.getSection(importedSection.id) as SignatureSection;
                    section.signatures = section.signatures.concat((importedSection as SignatureSection).signatures);
                    break;
                }
                case WasmSection.Import: {
                    let section: ImportSection = this.getSection(importedSection.id) as ImportSection;
                    section.imports = section.imports.concat((importedSection as ImportSection).imports);
                    break;
                }
                case WasmSection.Function: {
                    let section: FunctionSection = this.getSection(importedSection.id) as FunctionSection;
                    section.functions = section.functions.concat((importedSection as FunctionSection).functions);
                    break;
                }
                case WasmSection.Table: {
                    let section: TableSection = this.getSection(importedSection.id) as TableSection;
                    section.tables = section.tables.concat((importedSection as TableSection).tables);
                    break;
                }
                case WasmSection.Memory: {
                    let section: MemorySection = this.getSection(importedSection.id) as MemorySection;
                    section.memory = section.memory.concat((importedSection as MemorySection).memory);
                    break;
                }
                case WasmSection.Global: {
                    let section: GlobalSection = this.getSection(importedSection.id) as GlobalSection;
                    section.globals = section.globals.concat((importedSection as GlobalSection).globals);
                    break;
                }
                case WasmSection.Export: {
                    let section: ExportSection = this.getSection(importedSection.id) as ExportSection;
                    section.exports = section.exports.concat((importedSection as ExportSection).exports);
                    break;
                }
                case WasmSection.Start: {
                    let section: StartSection = this.getSection(importedSection.id) as StartSection;
                    if(section.startFunctionIndex === -1){
                        section.startFunctionIndex = (importedSection as StartSection).startFunctionIndex;
                    }
                    break;
                }
                case WasmSection.Element: {
                    let section: ElementSection = this.getSection(importedSection.id) as ElementSection;
                    section.elements = section.elements.concat((importedSection as ElementSection).elements);
                    break;
                }
                case WasmSection.Code: {
                    let section: CodeSection = this.getSection(importedSection.id) as CodeSection;
                    section.functions = section.functions.concat((importedSection as CodeSection).functions);
                    break;
                }
                case WasmSection.Data: {
                    let section: DataSection = this.getSection(importedSection.id) as DataSection;
                    section.data = section.data.concat((importedSection as DataSection).data);
                    break;
                }
                case WasmSection.Custom: {
                    let section: CustomSection = this.getSection(importedSection.id) as CustomSection;
                    section.names = section.names.concat((importedSection as CustomSection).names);
                    break;
                }
            }
        });
    }
}
