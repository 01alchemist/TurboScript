import {BinaryImport} from "./binary-import";
import {FileSystem} from "../utils/filesystem";
import {WasmBinary} from "../backends/webassembly/wasm/wasm-binary";
/**
 * Created by n.vinayakan on 23.06.17.
 */
export class BinaryImporter {
    static binaries: WasmBinary[] = [];
    static imports: BinaryImport[] = [];

    static reset(): void {
        BinaryImporter.binaries = [];
        BinaryImporter.imports = [];
    }

    static resolve(imports: string[], from: string, importPath: string): string {
        let binary = FileSystem.readBinaryFile(importPath);
        let wasmBinary = new WasmBinary(binary);
        BinaryImporter.binaries.push(wasmBinary);

        return `
    declare function wasmFunction(value:int32):int32;
    `
    }
}
