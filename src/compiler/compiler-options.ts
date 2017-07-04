import {CompileTarget} from "./compile-target";
import {DependencyLinking} from "./dependency-linking";
/**
 * Created by n.vinayakan on 14.06.17.
 */
export class CompilerOptions {

    constructor(public target: CompileTarget = CompileTarget.WEBASSEMBLY,
                public optimize: boolean = false,
                public link: DependencyLinking = DependencyLinking.DYNAMIC,
                public bundle: boolean = false,
                public jsWrapper: boolean = true,
                public silent: boolean = false,
                public logError: boolean = true) {
    }
}
