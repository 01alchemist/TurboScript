import {WasmBinary} from "./wasm-binary";
import {WasmFunction} from "../core/wasm-function";
import {WasmImport} from "../core/wasm-import";
import {wasmAreSignaturesEqual, WasmSignature} from "../core/wasm-signature";
import {WasmGlobal} from "../core/wasm-global";
import {ByteArray} from "../../../utils/bytearray";
import {Bitness} from "../../bitness";
import {Symbol} from "../../../compiler/core/symbol";
import {symbolToWasmType} from "../utils/index";
import {WasmType} from "../core/wasm-type";
import {assert} from "../../../utils/assert";
import {WasmSection} from "../core/wasm-section";
import {ImportSection} from "./sections/import-section";
import {WasmExport} from "../core/wasm-export";
import {ExportSection} from "./sections/export-section";
import {GlobalSection} from "./sections/global-section";
import {SignatureSection} from "./sections/signature-section";
import {FunctionDeclarationSection} from "./sections/function-section";
import {WasmExternalKind} from "../core/wasm-external-kind";
/**
 * Created by 01 on 2017-06-19.
 */
export class WasmModule {
    imports: WasmImport[]; // Reference to section imports.
    get importCount(): int32 {
        return this.imports.length;
    }

    exports: WasmExport[]; // Reference to section imports.
    get exportCount(): int32 {
        return this.exports.length;
    }

    globals: WasmGlobal[]; // Reference to section globals.
    get globalCount(): int32 {
        return this.globals.length;
    }

    signatures: WasmSignature[]; // Reference to section signatures.
    get signatureCount(): int32 {
        return this.signatures.length;
    }

    functions: WasmFunction[]; // Reference to section functions.
    get functionCount(): int32 {
        return this.functions.length;
    }

    binary: WasmBinary;
    text: string = ";; Experimental wast emitter\n(module";

    constructor(binary?: Uint8Array | ByteArray | WasmBinary) {
        if (binary !== undefined) {
            this.read(binary);
        } else {
            this.binary = new WasmBinary();
            this.binary.initializeSections();
            this.getReferences();
        }
    }

    private getReferences(): void {
        this.imports = (this.binary.getSection(WasmSection.Import) as ImportSection).imports;
        this.exports = (this.binary.getSection(WasmSection.Export) as ExportSection).exports;
        this.globals = (this.binary.getSection(WasmSection.Global) as GlobalSection).globals;
        this.signatures = (this.binary.getSection(WasmSection.Signature) as SignatureSection).signatures;
        this.functions = (this.binary.getSection(WasmSection.Function) as FunctionDeclarationSection).functions;
    }

    reset(): void {
        this.binary.reset();
    }

    read(binary: Uint8Array | ByteArray | WasmBinary): void {
        if (binary instanceof WasmBinary) {
            this.binary = binary;
        }
        else {
            this.binary = new WasmBinary(binary);
        }

        this.getReferences();
    }

    publish(): void {
        this.binary.sections.forEach(section => {
            if (section.payload.length > 0) {
                section.publish(this.binary.data);
                section.code.clearIndent(1);
                // this.text += "\n";
                this.text += section.code.finish();
            }
        });
        this.text += ")\n";
    }

    allocateGlobal(symbol: Symbol, bitness: Bitness): WasmGlobal {
        let global = new WasmGlobal(
            symbolToWasmType(symbol, bitness),
            true,
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

    allocateFunction(symbol: Symbol, signatureIndex: int32, isExported: boolean = false): WasmFunction {
        let _function = new WasmFunction(
            symbol.internalName,
            symbol
        );
        _function.isExported = isExported;
        if (isExported) {
            this.exports.push(new WasmExport(_function.name, WasmExternalKind.Function, this.functions.length - 1));
        }
        _function.signatureIndex = signatureIndex;
        this.functions.push(_function);
        return _function;
    }
}
