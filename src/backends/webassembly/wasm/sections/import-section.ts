import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmImport} from "../../core/wasm-import";
import {WasmType} from "../../core/wasm-type";
import {Terminal} from "../../../../utils/terminal";
import {WasmExternalKind} from "../../core/wasm-external-kind";
import {assert} from "../../../../utils/assert";
/**
 * Created by 01 on 2017-06-17.
 */
export class ImportSection extends WasmSectionBinary {

    imports: WasmImport[];

    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Import,
            payload.length,
            null, null,
            payload
        );
        this.imports = [];
    }

    read(): void {
        let importCount: int32 = this.payload.readU32LEB();
        for (let i: int32 = 0; i < importCount; i++) {
            let namespace = this.payload.readWasmString();
            let name = this.payload.readWasmString();
            let type = this.payload.readUnsignedByte();
            assert(type === WasmExternalKind.Function);
            let signatureIndex = this.payload.readU32LEB();

            let _import = new WasmImport(
                namespace,
                name,
                type,
                signatureIndex
            );
            this.imports.push(_import);
        }
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
