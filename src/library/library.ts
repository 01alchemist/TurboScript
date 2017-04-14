import { CompileTarget } from "../compiler";

const TURBO_LIBRARY_PATH = TURBO_PATH + "/src/library";

function readLibraryFile(path: string): string {
    return stdlib.IO_readTextFile(TURBO_LIBRARY_PATH + path);
}

export class Library {
    static get(target: CompileTarget) {
        let lib;

        switch (target) {
            case CompileTarget.TURBO_JAVASCRIPT:
                lib = readLibraryFile("/turbo/types.tbs") + "\n";
                break;
            case CompileTarget.WEBASSEMBLY:
            case CompileTarget.ASMJS:
                lib = [
                    readLibraryFile("/common/types.tbs"),
                    readLibraryFile("/common/foreign.tbs"),
                    readLibraryFile("/common/math.tbs"),
                    readLibraryFile("/common/malloc.tbs"),
                    readLibraryFile("/common/array.tbs"),
                    readLibraryFile("/common/typedarray/float64array.tbs")
                ].join('\n');
                break;
        }

        return lib;
    }

    static getRuntime(target): string {
        switch (target) {
            case CompileTarget.TURBO_JAVASCRIPT:
                return readLibraryFile("/turbo/runtime.js") + "\n";
            case CompileTarget.ASMJS:
                return readLibraryFile("/asmjs/runtime.js") + "\n";
            default:
                return "";
        }
    }

    static getWrapper(target): string {
        switch (target) {
            case CompileTarget.TURBO_JAVASCRIPT:
                return readLibraryFile("/turbo/wrapper.js") + "\n";
            case CompileTarget.ASMJS:
                return readLibraryFile("/asmjs/wrapper.js") + "\n";
            default:
                return "";
        }
    }
}
