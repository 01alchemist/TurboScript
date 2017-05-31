import { CompileTarget } from "../compiler/compiler";

const TURBO_LIBRARY_PATH = TURBO_PATH + "/src/library";

function readLibraryFile(path: string): string {
    return stdlib.IO_readTextFile(TURBO_LIBRARY_PATH + path);
}

export class Library {
    static get(target: CompileTarget) {
        let lib;

        switch (target) {
            case CompileTarget.JAVASCRIPT:
                lib = readLibraryFile("/turbo/types.tbs") + "\n";
                break;
            case CompileTarget.WEBASSEMBLY:
                lib = [
                    readLibraryFile("/common/types.tbs"),
                    readLibraryFile("/webassembly/initializer.tbs"),
                    readLibraryFile("/webassembly/builtins.tbs"),
                    readLibraryFile("/common/math.tbs"),
                    readLibraryFile("/common/malloc.tbs"),
                    readLibraryFile("/common/array.tbs")
                ].join('\n');
                break;
        }

        return lib;
    }

    static getRuntime(target): string {
        switch (target) {
            case CompileTarget.JAVASCRIPT:
                return readLibraryFile("/turbo/runtime.js") + "\n";
            default:
                return "";
        }
    }

    static getWrapper(target): string {
        switch (target) {
            case CompileTarget.JAVASCRIPT:
                return readLibraryFile("/turbo/wrapper.js") + "\n";
            default:
                return "";
        }
    }
}
