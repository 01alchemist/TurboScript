import {CheckContext, CheckMode, resolve, initialize} from "./checker";
import {Node, NodeKind} from "./node";
import {ByteArray} from "./bytearray";
import {Log, Source} from "./log";
import {Preprocessor} from "./preprocessor";
import {Scope} from "./scope";
import {tokenize} from "./lexer";
import {parse} from "./parser";
import {treeShaking} from "./shaking";
import {StringBuilder_new} from "./stringbuilder";
import {cEmit} from "./c";
import {jsEmit} from "./js";
import {turboJsEmit} from "./turbojs";
import {wasmEmit} from "./wasm";
import {library} from "./libraryjs";
/**
 * Author: Nidin Vinayakan
 */

export enum CompileTarget {
    NONE,
    C,
    JAVASCRIPT,
    TURBO_JAVASCRIPT,
    WEBASSEMBLY,
}

export class Compiler {
    log: Log;
    global: Node;
    firstSource: Source;
    lastSource: Source;
    preprocessor: Preprocessor;
    target: CompileTarget;
    context: CheckContext;
    librarySource: Source;
    outputName: string;
    outputWASM: ByteArray;
    outputJS: string;
    outputC: string;
    outputH: string;

    initialize(target: CompileTarget, outputName: string): void {
        assert(this.log == null);
        this.log = new Log();
        this.preprocessor = new Preprocessor();
        this.target = target;
        this.outputName = outputName;
        this.librarySource = this.addInput("<native>", library());
        this.librarySource.isLibrary = true;
        this.createGlobals();

        if (target == CompileTarget.C) {
            this.preprocessor.define("C", true);
        }

        else if (target == CompileTarget.JAVASCRIPT) {
            this.preprocessor.define("JS", true);
        }

        else if (target == CompileTarget.TURBO_JAVASCRIPT) {
            this.preprocessor.define("TURBO_JS", true);
        }

        else if (target == CompileTarget.WEBASSEMBLY) {
            this.preprocessor.define("WASM", true);
        }
    }

    createGlobals(): void {
        var context = new CheckContext();
        context.log = this.log;
        context.target = this.target;
        context.pointerByteSize = 4; // Assume 32-bit code generation for now

        var global = new Node();
        global.kind = NodeKind.GLOBAL;

        var scope = new Scope();
        global.scope = scope;

        // Hard-coded types
        context.errorType = scope.defineNativeType(context.log, "<error>");
        context.nullType = scope.defineNativeType(context.log, "null");
        context.undefinedType = scope.defineNativeType(context.log, "undefined");
        context.voidType = scope.defineNativeType(context.log, "void");

        this.context = context;
        this.global = global;
    }

    addInput(name: string, contents: string): Source {
        var source = new Source();
        source.name = name;
        source.contents = contents;

        if (this.firstSource == null) this.firstSource = source;
        else this.lastSource.next = source;
        this.lastSource = source;

        return source;
    }

    finish(): boolean {
        Profiler_begin("lexing");

        var source = this.firstSource;
        while (source != null) {
            source.firstToken = tokenize(source, this.log);
            source = source.next;
        }

        Profiler_end("lexing");
        Profiler_begin("preprocessing");

        source = this.firstSource;
        while (source != null) {
            this.preprocessor.run(source, this.log);
            source = source.next;
        }

        Profiler_end("preprocessing");
        Profiler_begin("parsing");

        source = this.firstSource;
        while (source != null) {
            if (source.firstToken != null) {
                source.file = parse(source.firstToken, this.log);
            }
            source = source.next;
        }

        Profiler_end("parsing");
        Profiler_begin("checking");

        var global = this.global;
        var context = this.context;
        var fullResolve = true;

        source = this.firstSource;
        while (source != null) {
            var file = source.file;

            if (file != null) {
                if (source == this.librarySource) {
                    initialize(context, file, global.scope, CheckMode.INITIALIZE);
                    resolve(context, file, global.scope);
                } else {
                    initialize(context, file, global.scope, CheckMode.NORMAL);
                }

                while (file.firstChild != null) {
                    var child = file.firstChild;
                    child.remove();
                    global.appendChild(child);
                }
            }

            // Stop if the library code has errors because it's highly likely that everything is broken
            if (source == this.librarySource && this.log.hasErrors()) {
                fullResolve = false;
                break;
            }

            source = source.next;
        }

        if (fullResolve) {
            resolve(context, global, global.scope);
        }

        Profiler_end("checking");

        if (this.log.hasErrors()) {
            return false;
        }

        Profiler_begin("shaking");

        treeShaking(global);

        Profiler_end("shaking");
        Profiler_begin("emitting");

        if (this.target == CompileTarget.C) {
            cEmit(this);
        }

        else if (this.target == CompileTarget.JAVASCRIPT) {
            jsEmit(this);
        }

        else if (this.target == CompileTarget.TURBO_JAVASCRIPT) {
            turboJsEmit(this);
        }

        else if (this.target == CompileTarget.WEBASSEMBLY) {
            wasmEmit(this);
        }

        Profiler_end("emitting");

        return true;
    }
}

export function replaceFileExtension(path: string, extension: string): string {
    var builder = StringBuilder_new();
    var dot = path.lastIndexOf(".");
    var forward = path.lastIndexOf("/");
    var backward = path.lastIndexOf("\\");

    // Make sure that there's a non-empty file name that the dot is a part of
    if (dot > 0 && dot > forward && dot > backward) {
        path = path.slice(0, dot);
    }

    return builder.append(path).append(extension).finish();
}
