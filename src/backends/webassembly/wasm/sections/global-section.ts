import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmGlobal} from "../../core/wasm-global";
import {WasmType} from "../../core/wasm-type";
/**
 * Created by 01 on 2017-06-17.
 */
export class GlobalSection extends WasmSectionBinary {
    globals:WasmGlobal[];
    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Global,
            payload.length,
            null, null,
            payload
        );
        this.globals = [];
    }

    read(): void {
        let globalCount: int32 = this.payload.readU32LEB();
        console.log(`WasmGlobal : ${globalCount}`);
        for (let i: int32 = 0; i < globalCount; i++) {
            let _global = new WasmGlobal(
                this.payload.readU8LEB(),
                this.payload.readU8LEB() === 1,
                null, // We don't know have the name of the global yet.
            );
            switch (_global.type) {
                case WasmType.I32:
                    _global.value = this.payload.readS32LEB();
                    break;
                case WasmType.I64:
                    _global.value = this.payload.readS64LEB();
                    break;
                case WasmType.F32:
                    _global.value = this.payload.readFloat();
                    break;
                case WasmType.F64:
                    _global.value = this.payload.readDouble();
                    break;
            }
            this.globals.push(_global);
        }
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
