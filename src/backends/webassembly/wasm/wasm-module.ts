import {WasmBinary} from "./wasm-binary";
import {WasmFunction} from "../core/wasm-function";
import {WasmImport} from "../core/wasm-import";
import {wasmAreSignaturesEqual, WasmSignature} from "../core/wasm-signature";
import {WasmGlobal, WasmGlobalEntry} from "../core/wasm-global";
import {WasmMemory} from "../core/wasm-memory";
import {WasmExport} from "../core/wasm-export";
import {WasmFunctionDeclaration} from "../core/wasm-declaration";
import {WasmTable} from "../core/wasm-table";
import {WasmElement} from "../core/wasm-element";
import {WasmData} from "../core/wasm-data";
import {ByteArray} from "../../../utils/bytearray";
import {Bitness} from "../../bitness";
import {Symbol} from "../../../compiler/core/symbol";
import {symbolToWasmType} from "../utils/index";
import {WasmType} from "../core/wasm-type";
import {assert} from "../../../utils/assert";
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
    dataSegments: WasmData[];
    dataSegmentMap: Map<string, int32>;

    // Memories
    memories: WasmMemory[];
    memoryMap: Map<string, int32>;

    // Exports
    exports: WasmExport[];
    exportMap: Map<string, int32>;

    constructor(binary?: Uint8Array | ByteArray | WasmBinary) {
        this.reset();
        if (binary !== undefined) {
            this.read(binary);
        } else {
            this.binary = new WasmBinary();
        }
    }

    reset(): void {
        this.imports = [];
        this.globals = [];
        this.tables = [];
        this.elements = [];
        this.signatures = [];
        this.declarations = [];
        this.functions = [];
        this.dataSegments = [];
        this.memories = [];
        this.exports = [];
    }

    read(binary: Uint8Array | ByteArray | WasmBinary): void {
        if (binary instanceof WasmBinary) {
            this.binary = binary;
        }
        else {
            this.binary = new WasmBinary(binary);
        }
    }

    publish(): void {

    }

    allocateGlobal(symbol: Symbol, bitness: Bitness): WasmGlobal {
        let global = new WasmGlobal(
            symbolToWasmType(symbol, bitness),
            false,
            symbol.internalName,
            symbol
        );
        symbol.offset = this.globals.length;

        this.globals.push(global);
        return global;
    }

    allocateSignature(argumentTypes: WasmType[], returnType: WasmType): int32 {
        assert(returnType != null);

        let signature = new WasmSignature();
        signature.argumentTypes = argumentTypes;
        signature.returnType = returnType;
        let signatureIndex: int32 = -1;
        this.signatures.some((check, index) => {
            if (wasmAreSignaturesEqual(signature, check)) {
                signatureIndex = index;
                return true;
            }
            return false;
        });

        if (signatureIndex > -1) {
            return signatureIndex;
        }

        return this.signatures.push(signature) - 1;
    }

    allocateImport(signatureIndex: int32, namespace: string, name: string): WasmImport {
        let _import = new WasmImport();
        _import.signatureIndex = signatureIndex;
        _import.namespace = namespace;
        _import.name = name;
        this.imports.push(_import);
        return _import;
    }

    allocateFunction(symbol: Symbol, signatureIndex: int32): WasmFunction {
        let _function = new WasmFunction(
            symbol.internalName,
            symbol
        );
        _function.signatureIndex = signatureIndex;
        this.functions.push(_function);
        return _function;
    }
}