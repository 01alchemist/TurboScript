import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmExport} from "../../core/wasm-export";
/**
 * Created by 01 on 2017-06-17.
 */
export class ExportSection extends WasmSectionBinary {
    exports:WasmExport[];
    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Export,
            payload.length,
            null, null,
            payload
        );
        this.exports = [];
    }

    read(): void {
        let exportCount: int32 = this.payload.readU32LEB();
        for (let i: int32 = 0; i < exportCount; i++) {

            let _export = new WasmExport(
                this.payload.readWasmString(),
                this.payload.readUnsignedByte(),
                this.payload.readU32LEB()
            );
            this.exports.push(_export);
        }
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
