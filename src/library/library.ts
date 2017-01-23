import {CompileTarget} from "../compiler";
export class Library {

    static get(target: CompileTarget) {
        let lib;
        switch (target) {
            case CompileTarget.WEBASSEMBLY:
                lib = stdlib.IO_readTextFile("../src/library/wasm/types.tbs") + "\n";
                lib += stdlib.IO_readTextFile("../src/library/wasm/malloc.tbs") + "\n";
                return lib;
            case CompileTarget.TURBO_JAVASCRIPT:
                lib = stdlib.IO_readTextFile("../src/library/turbo/types.tbs") + "\n";
                return lib;
        }
    }

    static getRuntime(target):string{
        switch (target) {
            case CompileTarget.TURBO_JAVASCRIPT:
                return stdlib.IO_readTextFile("../src/library/turbo/runtime.js") + "\n";
            default:
                return "";
        }
    }

}