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
        console.log(`WasmSignatures : ${importCount}`);
        for (let i: int32 = 0; i < importCount; i++) {
            let _import = new WasmImport();

            _import.namespace = this.payload.readWasmString();
            _import.name = this.payload.readWasmString();
            let type = this.payload.readUnsignedByte();
            assert(type === WasmExternalKind.Function);
            _import.signatureIndex = this.payload.readU32LEB();

        }
        console.log(this.imports);
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
