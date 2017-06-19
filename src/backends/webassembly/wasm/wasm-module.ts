import {WasmBinary} from "./wasm-binary";
import {WasmFunction} from "../core/wasm-function";
import {WasmImport} from "../core/wasm-import";
import {WasmSignature} from "../core/wasm-signature";
import {WasmGlobal} from "../core/wasm-global";
import {WasmMemory} from "../core/wasm-memory";
import {WasmExport} from "../core/wasm-export";
import {WasmFunctionDeclaration} from "../core/wasm-declaration";
import {WasmTable} from "../core/wasm-table";
import {WasmElement} from "../core/wasm-element";
import {WasmData} from "../core/wasm-data";
/**
 * Created by 01 on 2017-06-19.
 */
export class WasmModule {

    binary: WasmBinary;
    text: string;

    // Imports
    imports: WasmImport[];
    importMap: Map<string, int32>;

    // Globals
    globals: WasmGlobal[];
    globalMap: Map<string, int32>;

    // Tables
    tables: WasmTable[];
    tableMap: Map<string, int32>;

    // Elements
    elements: WasmElement[];
    elementMap: Map<string, int32>;

    // Signatures
    signatures: WasmSignature[];
    signatureMap: Map<string, int32>;

    // Function declarations
    declarations: WasmFunctionDeclaration[];
    declarationMap: Map<string, int32>;

    // Functions
    functions: WasmFunction[];
    functionMap: Map<string, int32>;

    // Data
    dataList: WasmData[];
    dataMap: Map<string, int32>;

    // Memories
    memories: WasmMemory[];
    memoryMap: Map<string, int32>;

    // Exports
    exports: WasmExport[];
    exportMap: Map<string, int32>;

    constructor(binary?: Uint8Array | ByteArray | WasmBinary) {
        if(binary !== undefined) {
            this.read(binary);
        }
    }

    read(binary: Uint8Array | ByteArray | WasmBinary):void {
        if(binary instanceof WasmBinary) {
            this.binary = binary;
        }
        else {
            this.binary = new WasmBinary(binary);
        }
    }
}