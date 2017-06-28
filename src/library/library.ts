import {CompileTarget} from "../compiler/compile-target";
import {FileSystem} from "../utils/filesystem";
// library files
const math = require('./common/math.tbs');
const types = require('./common/types.tbs');
const array = require('./common/array.tbs');
const jstypes = require('./turbo/types.tbs');
const runtime = require('raw-loader!./turbo/runtime.tjs');
const wrapper = require('raw-loader!./turbo/wrapper.tjs');
const wasmWrapper = require('raw-loader!./webassembly/wrapper.tjs');
const malloc = require('./common/dlmalloc.tbs');
const dlmallocBin = require('./common/malloc/build/malloc.wasm');
const builtins = require('./webassembly/builtins.tbs');
const initializer = require('./webassembly/initializer.tbs');

FileSystem.writeBinaryFile("/library/dlmalloc.wasm", dlmallocBin, true);

export class Library {

    static get binary(): Uint8Array {
        return dlmallocBin;
    }

    static get(target: CompileTarget) {
        let lib;

        switch (target) {
            case CompileTarget.JAVASCRIPT:
                lib = jstypes + "\n";
                break;
            case CompileTarget.WEBASSEMBLY:
                lib = [
                    types,
                    initializer,
                    builtins,
                    math,
                    malloc,
                    array
                ].join('\n');
                break;
        }

        return lib;
    }

    static getRuntime(target): string {
        switch (target) {
            case CompileTarget.JAVASCRIPT:
                return runtime + "\n";
            default:
                return "";
        }
    }

    static getWrapper(target:CompileTarget): string {
        switch (target) {
            case CompileTarget.JAVASCRIPT:
                return wrapper + "\n";
            case CompileTarget.WEBASSEMBLY:
                return wasmWrapper + "\n";
            default:
                return "";
        }
    }
}
