import {WasmSectionBinary} from "../wasm-binary-section";
import {WasmSection} from "../../core/wasm-section";
import {ByteArray} from "../../../../utils/bytearray";
import {WasmSignature} from "../../core/wasm-signature";
import {WasmType} from "../../core/wasm-type";
import {Terminal} from "../../../../utils/terminal";
/**
 * Created by 01 on 2017-06-17.
 */
export class SignatureSection extends WasmSectionBinary {

    signatures: WasmSignature[];

    constructor(payload = new ByteArray()) {
        super(
            WasmSection.Signature,
            payload.length,
            null, null,
            payload
        );
        this.signatures = [];
    }

    read() {
        let signatureCount: int32 = this.payload.readU32LEB();
        for (let i: int32 = 0; i < signatureCount; i++) {
            let signature = new WasmSignature();
            let form = this.payload.readUnsignedByte();
            if (form !== WasmType.func) {
                Terminal.error("Wrong function type");
            }
            let numArguments = this.payload.readU32LEB();
            for (let j: int32 = 0; j < numArguments; j++) {
                let type = this.payload.readU32LEB();
                signature.argumentTypes.push(type);
            }

            let numResults = this.payload.readU8LEB();
            if (numResults > 0) {
                signature.returnType = this.payload.readU32LEB();
            } else {
                signature.returnType = WasmType.VOID;
            }
            this.signatures.push(signature);
        }
    }

    publish(data: ByteArray): void {
        super.publish(data);
    }
}
