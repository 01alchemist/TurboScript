import {CompileTarget} from "../compiler";
export class Library{

    static get(target:CompileTarget){
        switch (target){
            case CompileTarget.WEBASSEMBLY:
                let lib = stdlib.IO_readTextFile("../src/library/wasm/types.tbs") + "\n";
                    lib += stdlib.IO_readTextFile("../src/library/wasm/malloc.tbs") + "\n";
                 return lib;
        }
    }

}