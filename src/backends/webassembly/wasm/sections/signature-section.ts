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
    }

    read() {
        let signatureCount: int32 = this.payload.readU32LEB();
        console.log(`signatureCount: ${signatureCount}`);
        for (let i: int32 = 0; i < signatureCount; i++) {
            let signature = new WasmSignature();
            let form = this.payload.readUnsignedByte();
            if (form !== WasmType.func) {
                Terminal.error("Wrong function type");
            }
            let numArguments = this.payload.readU32LEB();
            console.log(`numArguments:${numArguments}`);
            for (let j: int32 = 0; j < numArguments; j++) {
                let type = this.payload.readU8LEB();
                console.log(`wasm type:${WasmType[type]}`);
                signature.argumentTypes.push(this.payload.readU8LEB());
            }

            let numResults = this.payload.readU8LEB();
            if (numResults > 0) {
                signature.returnType = this.payload.readU8LEB();
            } else {
                signature.returnType = WasmType.VOID;
            }
            console.log(`numResults:${numResults}`);
        }
    }

    publish(data: ByteArray): void {
        super.publish(data);

        // this.signatures.forEach((signature, index) => {
        //     // Emit signature
        //     section.code.append(`(type (;${index};) (func`);
        //     log(section.data, array.position, WasmType.func, "func sig " + index);
        //     this.assembler.writeUnsignedLEB128(section.data, WasmType.func); //form, the value for the func type constructor
        //     log(section.data, array.position, signature.argumentTypes.length, "num params");
        //     this.assembler.writeUnsignedLEB128(section.data, signature.argumentTypes.length); //param_count, the number of parameters to the function
        //     if (signature.argumentTypes.length > 0) {
        //         section.code.append(` (param`);
        //     }
        //
        //     signature.argumentTypes.forEach(type => {
        //         log(section.data, array.position, type, WasmType[type]);
        //         this.assembler.writeUnsignedLEB128(section.data, type); //value_type, the parameter types of the function
        //         section.code.append(` ${WasmTypeToString[type]}`);
        //     });
        //
        //     if (signature.argumentTypes.length > 0) {
        //         section.code.append(`)`);
        //     }
        //     if (signature.returnType !== WasmType.VOID) {
        //         log(section.data, array.position, "01", "num results");
        //         this.assembler.writeUnsignedLEB128(section.data, 1); //return_count, the number of results from the function
        //         log(section.data, array.position, signature.returnType, WasmType[signature.returnType]);
        //         this.assembler.writeUnsignedLEB128(section.data, signature.returnType);
        //         section.code.append(` (result ${WasmTypeToString[signature.returnType]})`);
        //     } else {
        //         this.assembler.writeUnsignedLEB128(section.data, 0);
        //     }
        //     section.code.append("))\n");
        //
        // });
    }
}
