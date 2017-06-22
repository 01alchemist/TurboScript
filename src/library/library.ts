import {CompileTarget} from "../compiler/compile-target";
import {Terminal} from "../utils/terminal";
import {Color} from "../utils/color";
// library files
const math = require('./common/math.tbs');
const types = require('./common/types.tbs');
const array = require('./common/array.tbs');
const jstypes = require('./turbo/types.tbs');
const runtime = require('raw-loader!./turbo/runtime.tjs');
const wrapper = require('raw-loader!./turbo/wrapper.tjs');
const malloc = require('./common/malloc.tbs');
const mallocBinary = require('./common/malloc/build/malloc.wasm') as Uint8Array;
const builtins = require('./webassembly/builtins.tbs');
const initializer = require('./webassembly/initializer.tbs');

export class Library {
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

    static getWrapper(target): string {
        switch (target) {
            case CompileTarget.JAVASCRIPT:
                return wrapper + "\n";
            default:
                return "";
        }
    }
}
