import { WasmSectionBinary } from "../wasm-binary-section";
import { WasmSection } from "../../core/wasm-section";
import { ByteArray } from "../../../../utils/bytearray";
import { WasmFunction } from "../../core/wasm-function";
import { WasmOpcode } from "../../opcode"
import {WasmLocal} from "../../core/wasm-local";
import {WasmInstruction} from "../wasm-instruction";
/**
 * Created by 01 on 2017-06-17.
 */
export class CodeSection extends WasmSectionBinary {

    functions: WasmFunction[];
    opcodes:WasmInstruction[];

    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Code,
            payload.length,
            null, null,
            payload
        )
    }

    read(): void {
        if (this.functions === undefined || this.functions === null) {
            this.functions = [];
        }
        let length = this.payload.readU32LEB();
        for (let i = 0; i < length; i++) {
            let _function = this.functions[i];
            if (_function === undefined) {
                _function = new WasmFunction();
                this.functions.push(_function);
            }
            let bodyLength = this.payload.readU32LEB();
            let pos = this.payload.position;
            let localVariables: WasmLocal[] = [];
            let localVariableCount = this.payload.readU32LEB();
            for (let j = 0; j < localVariableCount; j++) {
                let typeCount = this.payload.readU8LEB();
                for (let k = 0; k < typeCount; k++) {
                    let local = new WasmLocal(this.payload.readU8LEB(), "");
                    localVariables.push(local);
                }
            }
            _function.localVariables = localVariables;
            console.log("localVariables:" + localVariables.length);

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
            // _function.body = this.payload.readBytes(null, this.payload.position, bodyLength);
            // let bodyArray = this.payload.array.subarray(this.payload.position, this.payload.position + bodyLength + 1);
            this.payload.position = pos;
            let bodyArray = this.payload.readBytes(null, 0, bodyLength, true).array;
            let lastOpcode = bodyArray[bodyArray.length - 1];
            // console.log(`lastOpcode ${lastOpcode} => ${WasmOpcode[lastOpcode]}`);

            // this.payload.position += bodyLength;
            // console.log(bodyArray);

            _function.body = new ByteArray(bodyArray.buffer, bodyArray.byteOffset, bodyArray.byteLength);
            // console.log("Body parsed length:" + bodyLength);
            // console.log(_function.body.array);
        }
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
