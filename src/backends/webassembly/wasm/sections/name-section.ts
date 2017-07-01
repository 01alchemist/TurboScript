import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
/**
 * Created by 01 on 2017-06-17.
 */
export class NameSection extends WasmSectionBinary {
    funcNameMap: Map<number, string>;
    funcLocalNameMap: Map<number, Map<number, string>>;

    constructor(name: string, payload = new ByteArray()) {
        super(
            WasmSection.Custom,
            payload.length,
            -1, name,
            payload
        );
    }

    read(): void {
        this.funcNameMap = new Map();
        this.funcLocalNameMap = new Map();
        let nameType = this.payload.readU8LEB();
        let nameLength = this.payload.readU32LEB();
        if (nameType === 1) {
            let funcNameCount = this.payload.readU32LEB();

            for (let i: int32 = 0; i < funcNameCount; i++) {
                let funcNameIndex = this.payload.readU32LEB();
                let funcName = this.payload.readWasmString();
                this.funcNameMap.set(funcNameIndex, funcName);
            }

        } else if (nameType === 2) {
            let funcLocalNameCount = this.payload.readU32LEB();

            for (let i: int32 = 0; i < funcLocalNameCount; i++) {
                let funcIndex = this.payload.readU32LEB();
                let localNameMap = new Map();
                let localNameCount = this.payload.readU32LEB();
                for (let j: int32 = 0; j < localNameCount; j++) {
                    let localNameIndex = this.payload.readU32LEB();
                    let localName = this.payload.readWasmString();
                    localNameMap.set(localNameIndex, localName);
                }
                this.funcLocalNameMap.set(funcIndex, localNameMap);
            }
        }
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}