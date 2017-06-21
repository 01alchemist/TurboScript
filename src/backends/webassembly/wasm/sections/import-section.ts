import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmImport} from "../../core/wasm-import";
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

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
