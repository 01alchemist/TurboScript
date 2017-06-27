///<reference path="../declarations.d.ts" />
import {CheckContext, CheckMode, initialize, resolve} from "./analyzer/type-checker";
import {Node, NODE_FLAG_LIBRARY, NodeKind} from "./core/node";
import {ByteArray} from "../utils/bytearray";
import {Log, Source} from "../utils/log";
import {Preprocessor} from "./preprocessor/preprocessor";
import {Scope} from "./core/scope";
import {tokenize} from "./scanner/scanner";
import {parse} from "./parser/parser";
import {treeShaking} from "./optimizer/shaking";
import {wasmEmit} from "../backends/webassembly/webassembly";
import {Bitness} from "../backends/bitness";
import {Library} from "../library/library";
import {preparse} from "./parser/preparser";
import {CompileTarget} from "./compile-target";
import {assert} from "../utils/assert";
import {Terminal} from "../utils/terminal";
import {WasmBinary} from "../backends/webassembly/wasm/wasm-binary";
/**
 * Author: Nidin Vinayakan
 */

export class Compiler {
    log: Log;
    global: Node;
    firstSource: Source;
    lastSource: Source;
    preprocessor: Preprocessor;
    target: CompileTarget;
    context: CheckContext;
    librarySource: Source;
    runtimeSource: string;
    wrapperSource: string;
    outputName: string;
    outputWASM: ByteArray;
    outputWAST: string;
    outputJS: string;
    outputCPP: string;
    outputH: string;
    options: {[key: string]: any};

    static mallocRequired: boolean = false;
    static debug:boolean = false;
    static binaryImports: WasmBinary[];

    initialize(target: CompileTarget, outputName: string, options: {[key: string]: any} = {}): void {
        assert(this.log == null);
        this.log = new Log();
        this.preprocessor = new Preprocessor();
        Compiler.binaryImports = [];
        this.target = target;
        this.options = options;
        this.outputName = outputName;
        this.librarySource = this.addInput("<native>", Library.get(target));
        this.librarySource.isLibrary = true;
        this.runtimeSource = Library.getRuntime(target);
        this.wrapperSource = Library.getWrapper(target);
        this.createGlobals();

        if (target == CompileTarget.CPP) {
            this.preprocessor.define("CPP", true);
        }

        else if (target == CompileTarget.JAVASCRIPT) {
            this.preprocessor.define("JS", true);
        }

        else if (target == CompileTarget.WEBASSEMBLY) {
            this.preprocessor.define("WASM", true);
        }
    }

    createGlobals(): void {
        let context = new CheckContext();
        context.log = this.log;
        context.target = this.target;
        context.pointerByteSize = 4; // Assume 32-bit code generation for now

        let global = new Node();
        global.kind = NodeKind.GLOBAL;

        let scope = new Scope();
        global.scope = scope;

        // Hard-coded types
        context.anyType = scope.defineNativeType(context.log, "any");
        context.errorType = scope.defineNativeType(context.log, "<error>");
        context.nullType = scope.defineNativeType(context.log, "null");
        context.undefinedType = scope.defineNativeType(context.log, "undefined");
        context.voidType = scope.defineNativeType(context.log, "void");

        this.context = context;
        this.global = global;
    }

    addInput(name: string, contents: string): Source {
        let source = new Source();
        source.name = name;
        source.contents = contents;

        if (this.firstSource == null) this.firstSource = source;
        else {
            source.prev = this.lastSource;
            this.lastSource.next = source;
        }
        this.lastSource = source;

        return source;
    }

    addInputBefore(name: string, contents: string, nextSource: Source): Source {
        let source = new Source();
        source.name = name;
        source.contents = contents;

        nextSource.prev.next = source;
        source.prev = nextSource.prev;
        nextSource.prev = source;
        source.next = nextSource;

        return source;
    }

    finish(): boolean {
        Terminal.time("pre-parsing");

        let source = this.firstSource;
        while (source != null) {
            if (!preparse(source, this, this.log)) {
                return false;
            }
            source = source.next;
        }
        Terminal.timeEnd("pre-parsing");

        Terminal.time("scanning");

        source = this.firstSource;
        while (source != null) {
            source.firstToken = tokenize(source, this.log);
            source = source.next;
        }

        Terminal.timeEnd("scanning");
        Terminal.time("pre-processing");

        source = this.firstSource;
        while (source != null) {
            this.preprocessor.run(source, this.log);
            source = source.next;
        }

        Terminal.timeEnd("pre-processing");
        Terminal.time("parsing");

        source = this.firstSource;
        while (source != null) {
            if (source.firstToken != null) {
                source.file = parse(source.firstToken, this.log);
            }
            source = source.next;
        }

        Terminal.timeEnd("parsing");
        Terminal.time("type-checking");

        let global = this.global;
        let context = this.context;
        let fullResolve = true;

        source = this.firstSource;
        while (source != null) {
            let file = source.file;

            if (file != null) {
                if (source.isLibrary) {
                    file.flags |= NODE_FLAG_LIBRARY;
                    initialize(context, file, global.scope, CheckMode.INITIALIZE);
                    resolve(context, file, global.scope);
                } else {
                    initialize(context, file, global.scope, CheckMode.NORMAL);
                }

                while (file.firstChild != null) {
                    let child = file.firstChild;
                    child.remove();
                    global.appendChild(child);
                }
            }

            // Stop if the library code has errors because it's highly likely that everything is broken
            if (source.isLibrary && this.log.hasErrors()) {
                fullResolve = false;
                break;
            }

            source = source.next;
        }

        if (fullResolve) {
            resolve(context, global, global.scope);
        }

        Terminal.timeEnd("type-checking");

        if (this.log.hasErrors()) {
            return false;
        }

        Terminal.time("optimizing");

        treeShaking(global);

        Terminal.timeEnd("optimizing");
        Terminal.time("emitting");

        // if (this.target == CompileTarget.C) {
        //     cEmit(this);
        // }

        // else if (this.target == CompileTarget.JAVASCRIPT) {
        //     jsEmit(this);
        // } else

        if (this.target == CompileTarget.WEBASSEMBLY) {
            const { longPtr, optimize } = this.options;
            wasmEmit(this, longPtr ? Bitness.x64 : Bitness.x32, optimize);
        }

        Terminal.timeEnd("emitting");

        Terminal.write("Done!");

        return true;
    }
}

export function replaceFileExtension(path: string, extension: string): string {
    let dot = path.lastIndexOf(".");
    let forward = path.lastIndexOf("/");
    let backward = path.lastIndexOf("\\");

    // Make sure that there's a non-empty file name that the dot is a part of
    if (dot > 0 && dot > forward && dot > backward) {
        path = path.slice(0, dot);
    }

    return path + extension;
}
