import {ByteArray} from "../../../utils/bytearray";
/**
 * Created by n.vinayakan on 17.06.17.
 */
export class WasmOptimizer {

    static instance: WasmOptimizer = null;

    static optimize(inputWASM: ByteArray | Uint8Array, level: int32 = 1) {
        if (WasmOptimizer.instance === null) {
            WasmOptimizer.instance = new WasmOptimizer();
        }

        WasmOptimizer.instance.initialize(inputWASM);
        switch (level) {
            case 1:
                WasmOptimizer.instance.optimizeLevel_1();
                break;
            case 2:
                WasmOptimizer.instance.optimizeLevel_2();
                break;
            case 3:
                WasmOptimizer.instance.optimizeLevel_3();
                break;
        }
    }

    inputWASM: ByteArray;
    outputWASM: ByteArray;

    constructor() {
    }

    initialize(inputWASM: ByteArray | Uint8Array) {
        this.inputWASM = inputWASM instanceof Uint8Array ? new ByteArray(inputWASM.buffer) : inputWASM;
    }

    optimizeLevel_1() {

    }

    optimizeLevel_2() {

    }

    optimizeLevel_3() {

    }
}
