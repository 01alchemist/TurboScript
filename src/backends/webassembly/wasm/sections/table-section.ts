import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmTable} from "../../core/wasm-table";
/**
 * Created by 01 on 2017-06-17.
 */
export class TableSection extends WasmSectionBinary {
    tables: WasmTable[];

    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Table,
            payload.length,
            null, null,
            payload
        );
        this.tables = [];
    }

    read(): void {

    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
