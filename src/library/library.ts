import {CompileTarget} from "../compiler";
export class Library {

    static get(target: CompileTarget) {
        let lib;
        switch (target) {
            case CompileTarget.WEBASSEMBLY:
                lib = stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/types.tbs") + "\n";
                lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/foreign.tbs") + "\n";
                lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/malloc.tbs") + "\n";
                lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/math.tbs") + "\n";
                lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/array.tbs") + "\n";
                lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/typedarray/float64array.tbs") + "\n";
                return lib;
            case CompileTarget.TURBO_JAVASCRIPT:
                lib = stdlib.IO_readTextFile(TURBO_PATH + "/src/library/turbo/types.tbs") + "\n";
                return lib;
            case CompileTarget.ASMJS:
                lib = stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/types.tbs") + "\n";
                lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/foreign.tbs") + "\n";
                lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/math.tbs") + "\n";
                lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/malloc.tbs") + "\n";
                lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/array.tbs") + "\n";
                lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/typedarray/float64array.tbs") + "\n";
                return lib;
        }
    }

    static getRuntime(target): string {
        switch (target) {
            case CompileTarget.TURBO_JAVASCRIPT:
                return stdlib.IO_readTextFile(TURBO_PATH + "/src/library/turbo/runtime.js") + "\n";
            case CompileTarget.ASMJS:
                return stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/runtime.js") + "\n";
            default:
                return "";
        }
    }

    static getWrapper(target): string {
        switch (target) {
            case CompileTarget.TURBO_JAVASCRIPT:
                return stdlib.IO_readTextFile(TURBO_PATH + "/src/library/turbo/wrapper.js") + "\n";
            case CompileTarget.ASMJS:
                return stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/wrapper.js") + "\n";
            default:
                return "";
        }
    }

}