import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmFunction} from "../../core/wasm-function";
import {WasmLocal} from "../../core/wasm-local";
/**
 * Created by 01 on 2017-06-17.
 */
export class CodeSection extends WasmSectionBinary {

    functions: WasmFunction[];

    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Code,
            payload.length,
            null, null,
            payload
        )
    }

    read(): void {
        this.functions = [];
        let length = this.payload.readU32LEB();

        for (let i = 0; i < length; i++) {
            let _function = new WasmFunction("<anonymous>");
            let bodyLength = this.payload.readU32LEB();
            // let localVariables: WasmLocal[] = []
            // let localVariableCount = this.payload.readU32LEB();
            // for (let j = 0; j < localVariableCount; j++) {
            //     let typeCount = this.payload.readU8LEB();
            //     for (let k = 0; k < typeCount; k++) {
            //         let local = new WasmLocal(this.payload.readU8LEB(), "");
            //         localVariables.push(local);
            //     }
            // }
            // _function.localVariables = localVariables;
            // console.log("localVariables:" + localVariables.length);
            // let opcode = this.readUnsignedByte();
            // let blockCount = 0;
            // while (opcode !== WasmOpcode.END && blockCount === 0) {
            //     if (opcode === WasmOpcode.END) {
            //         blockCount--;
            //     }
            //     opcode = this.readUnsignedByte();
            //     if (opcode === WasmOpcode.BLOCK || opcode === WasmOpcode.IF || opcode === WasmOpcode.LOOP) {
            //         blockCount++;
            //     }
            // }
            //skip content
            _function.body = this.payload.readBytes(null, this.payload.position, bodyLength);
            this.functions.push(_function);
        }
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
