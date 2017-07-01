import { WasmBinary } from "./wasm-binary";
import { WasmFunction } from "../core/wasm-function";
import { WasmImport } from "../core/wasm-import";
import { wasmAreSignaturesEqual, WasmSignature } from "../core/wasm-signature";
import { WasmGlobal } from "../core/wasm-global";
import { ByteArray } from "../../../utils/bytearray";
import { Bitness } from "../../bitness";
import { Symbol } from "../../../compiler/core/symbol";
import { symbolToWasmType } from "../utils/index";
import { WasmType } from "../core/wasm-type";
import { assert } from "../../../utils/assert";
import { WasmSection } from "../core/wasm-section";
import { ImportSection } from "./sections/import-section";
import { WasmExport } from "../core/wasm-export";
import { ExportSection } from "./sections/export-section";
import { GlobalSection } from "./sections/global-section";
import { SignatureSection } from "./sections/signature-section";
import { FunctionSection } from "./sections/function-section";
import { WasmExternalKind } from "../core/wasm-external-kind";
import { Library } from "../../../library/library";
import { Terminal } from "../../../utils/terminal";

/**
 * Created by 01 on 2017-06-19.
 */
export class WasmModule {
    get imports(): WasmImport[] {
        return (this.binary.getSection(WasmSection.Import) as ImportSection).imports;
    }
    get importCount(): int32 {
        return this.imports.length;
    }

    get exports(): WasmExport[] { // Reference to section imports.
        return (this.binary.getSection(WasmSection.Export) as ExportSection).exports;
    }
    get exportCount(): int32 {
        return this.exports.length;
    }

    get globals(): WasmGlobal[] {
        return (this.binary.getSection(WasmSection.Global) as GlobalSection).globals;
    }
    get globalCount(): int32 {
        return this.globals.length;
    }

    get signatures(): WasmSignature[] { // Reference to section signatures.
        return (this.binary.getSection(WasmSection.Signature) as SignatureSection).signatures;
    }
    get signatureCount(): int32 {
        return this.signatures.length;
    }

    get functions(): WasmFunction[] {
        return (this.binary.getSection(WasmSection.Function) as FunctionSection).functions;
    }
    get functionCount(): int32 {
        return this.functions.length;
    }

    binary: WasmBinary;
    text: string = ";; Experimental wast emitter\n(module\n";

    constructor(binary?: Uint8Array | ByteArray | WasmBinary) {
        if (binary !== undefined) {
            this.read(binary);
        } else {
            this.binary = new WasmBinary();
            this.binary.initializeSections();
            // this.getReferences();
        }
    }

    // private getReferences(): void {
    // this.importSection = (this.binary.getSection(WasmSection.Import) as ImportSection);
    // this.exportSection = (this.binary.getSection(WasmSection.Export) as ExportSection);
    // this.globalSection = (this.binary.getSection(WasmSection.Global) as GlobalSection);
    // this.signatureSection = (this.binary.getSection(WasmSection.Signature) as SignatureSection);
    // this.functionSection = (this.binary.getSection(WasmSection.Function) as FunctionSection);
    // }

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

        // this.getReferences();
    }

    publish(): void {
        this.text += "  ";
        this.binary.sections.forEach(section => {
            if (section.payload.length > 0) {
                section.publish(this.binary.data);
                this.text += section.code.finish();
            }
        });
        this.text = this.text.substring(0, this.text.lastIndexOf("\n"));
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

    allocateSignature(argumentTypes: WasmType[], returnType: WasmType): [int32, WasmSignature] {
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
            return [signatureIndex, this.signatures[signatureIndex]];
        }

        return [this.signatures.push(signature) - 1, signature];
    }

    allocateImport(signature: WasmSignature, signatureIndex: int32, namespace: string, name: string): [WasmImport, int32] {
        let _import = new WasmImport(
            namespace,
            name,
            WasmExternalKind.Function,
            signatureIndex,
            signature
        );
        return [_import, this.imports.push(_import) - 1];
    }

    allocateExport(name: string, kind: WasmExternalKind, index: int32, as: string = name): void {
        let duplicate = this.exports.find(_export => _export.name === as);
        if (duplicate === undefined) {
            this.exports.push(new WasmExport(name, kind, index, as));
        } else {
            Terminal.error("Error! Duplicate export " + name + " as " + as);
        }
    }

    allocateFunction(name: string, signature: WasmSignature, signatureIndex: int32, symbol: Symbol, isExported: boolean = false): WasmFunction {
        let _function = new WasmFunction(
            name,
            symbol
        );
        let fnIndex = this.functions.push(_function) - 1;
        _function.isExported = isExported;
        if (isExported) {
            this.exports.push(new WasmExport(_function.name, WasmExternalKind.Function, fnIndex));
        }
        _function.signature = signature;
        _function.signatureIndex = signatureIndex;
        return _function;
    }
}
