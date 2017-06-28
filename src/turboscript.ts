///<reference path="declarations.d.ts" />
import {Log, writeLogToTerminal} from "./utils/log";
import {Compiler, replaceFileExtension} from "./compiler/compiler";
import {CompileTarget} from "./compiler/compile-target";
import {Terminal} from "./utils/terminal";
import {FileSystem} from "./utils/filesystem";
import {CompilerOptions, defaultCompilerOptions} from "./compiler/compiler-options";
import {Color} from "./utils/color";
import {Library} from "./library/library";

/**
 * TurboScript compiler main entry
 */
export class CommandLineArgument {
    text: string;
    next: CommandLineArgument;
}

let firstArgument: CommandLineArgument;
let lastArgument: CommandLineArgument;

export function main_addArgument(text: string): void {
    let argument = new CommandLineArgument();
    argument.text = text;

    if (firstArgument == null) firstArgument = argument;
    else lastArgument.next = argument;
    lastArgument = argument;
}

export function main_reset(): void {
    firstArgument = null;
    lastArgument = null;
}

export function printUsage(): void {
    Terminal.write(`
Usage: tc [FLAGS] [INPUTS]

  --help           Print this message.
  --out [PATH]     Emit code to PATH (the target format is the file extension).
    --wasm         Explicit webassembly output 
  --define [NAME]  Define the flag NAME in all input files.

Examples:

  tc src/*.tbs --out main.wasm
`);
}

export function main_entry(): int32 {
    let target = CompileTarget.NONE;
    let argument = firstArgument;
    let inputCount = 0;
    let output: string;
    let outputName: string;
    let outputPath: string;
    let bundle: boolean = false;

    // Print usage by default
    if (firstArgument == null) {
        printUsage();
        return 1;
    }

    // Initial pass over the argument list
    while (argument != null) {
        let text = argument.text;
        if (text.startsWith("-")) {
            if (text == "-h" || text == "-help" || text == "--help" || text == "/?") {
                printUsage();
                return 0;
            } else if (text == "--cpp") {
                target = CompileTarget.CPP;
            } else if (text == "--js") {
                target = CompileTarget.JAVASCRIPT;
            } else if (text == "--wasm") {
                target = CompileTarget.WEBASSEMBLY;
            } else if (text == "--define" && argument.next != null) {
                argument = argument.next;
            } else if (text == "--out" && argument.next != null) {
                argument = argument.next;
                output = argument.text;
            } else if (text == "--bundle" || text == "-b") {
                argument = argument.next;
                bundle = true;
            } else {
                Terminal.error("Invalid flag: " + text);
                return 1;
            }
        } else {
            inputCount = inputCount + 1;
        }
        argument = argument.next;
    }

    // Must have inputs
    if (inputCount == 0) {
        Terminal.error("No input files");
        return 1;
    }

    // Must have an output
    if (output == null) {
        Terminal.error("Missing an output file (use the --out flag)");
        return 1;
    }

    outputPath = FileSystem.getBasePath(output);
    outputName = FileSystem.getFileName(output);

    // Automatically set the target based on the file extension
    if (target == CompileTarget.NONE) {
        if (output.endsWith(".wasm")) target = CompileTarget.WEBASSEMBLY;
        // else if (output.endsWith(".cpp")) target = CompileTarget.CPP;
        // else if (output.endsWith(".js")) target = CompileTarget.JAVASCRIPT;
        else {
            Terminal.error("Missing a target (use either --js or --wasm)");
            return 1;
        }
    }

    // Start the compilation
    let compiler = new Compiler();
    compiler.initialize(target, output);

    // Second pass over the argument list
    argument = firstArgument;
    while (argument != null) {
        let text = argument.text;
        if (text == "--define") {
            argument = argument.next;
            compiler.preprocessor.define(argument.text, true);
        } else if (text == "--out") {
            argument = argument.next;
        } else if (!text.startsWith("-")) {
            let contents = FileSystem.readTextFile(text);
            if (contents == null) {
                Terminal.error("Cannot read from " + text);
                return 1;
            }
            compiler.addInput(text, contents);
        }
        argument = argument.next;
    }

    // Finish the compilation
    compiler.finish();
    writeLogToTerminal(compiler.log);

    // Only emit the output if the compilation succeeded
    if (!compiler.log.hasErrors()) {
        try {
            switch (target) {
                case CompileTarget.CPP:
                    FileSystem.writeTextFile(output, compiler.outputCPP);
                    FileSystem.writeTextFile(replaceFileExtension(output, ".h"), compiler.outputH);
                    break;
                case CompileTarget.JAVASCRIPT:
                    FileSystem.writeTextFile(output, compiler.outputJS);
                    break;
                case CompileTarget.WEBASSEMBLY:
                    if (compiler.outputWASM !== undefined) {
                        FileSystem.writeBinaryFile(outputPath + "/library.wasm", Library.binary);
                        FileSystem.writeBinaryFile(output, compiler.outputWASM);
                        FileSystem.writeTextFile(replaceFileExtension(output, ".wast"), compiler.outputWAST);
                        FileSystem.writeTextFile(output + ".log", compiler.outputWASM.log);
                        if (bundle) {
                            let wrapper = Library.getWrapper(CompileTarget.WEBASSEMBLY).replace("__TURBO_WASM__", `"${outputName}"`);
                            FileSystem.writeTextFile(replaceFileExtension(output, ".bootstrap.js"), wrapper);
                        }
                    } else {
                        Terminal.error("Compile error!");
                        return 1;
                    }
                    break;
            }
            return 0;
        } catch (e) {
            Terminal.error("Cannot write to " + output);
            console.error(e);
            return 1;
        }
        // if (target == CompileTarget.CPP && FileSystem.writeTextFile(output, compiler.outputCPP) &&
        //     FileSystem.writeTextFile(replaceFileExtension(output, ".h"), compiler.outputH) ||
        //     target == CompileTarget.JAVASCRIPT && FileSystem.writeTextFile(output, compiler.outputJS) ||
        //     target == CompileTarget.WEBASSEMBLY && FileSystem.writeBinaryFile(output, compiler.outputWASM) &&
        //     FileSystem.writeTextFile(replaceFileExtension(output, ".wast"), compiler.outputWAST) &&
        //     FileSystem.writeTextFile(output + ".log", compiler.outputWASM.log)) {
        //     Terminal.write("\n");
        //     return 0;
        // }
        //
        // Terminal.error("Cannot write to " + output);
    }

    Terminal.write("\n");

    return 1;
}

export const main = {
    addArgument: main_addArgument,
    reset: main_reset,
    entry: main_entry
};

export interface CompileResult {
    success: boolean;
    wasm?: Uint8Array;
    wast?: string;
    log?: Log;
}

export function compileString(source: string, options: CompilerOptions = defaultCompilerOptions): CompileResult {
    Terminal.silent = options.silent;
    let input = "/virtual/inline.tbs";
    let output = "/virtual/inline.wasm";
    FileSystem.writeTextFile(input, source, true);
    let compiler = new Compiler();
    compiler.initialize(options.target, output);
    compiler.addInput(input, source);
    compiler.finish();
    Terminal.silent = false;
    if (!compiler.log.hasErrors()) {
        return {
            success: true,
            wasm: compiler.outputWASM.array,
            wast: compiler.outputWAST
        };
    } else {
        if (!options.silent || options.logError) {
            writeLogToTerminal(compiler.log);
        }
        return {
            success: false,
            log: compiler.log
        };
    }
}
declare const VERSION: string;
export const version = VERSION;

Terminal.setTextColor(Color.MAGENTA);
Terminal.write(`~~~~~~~~~~~~~~~~~~~~~~~~~| TurboScript ${version} |~~~~~~~~~~~~~~~~~~~~~~~~~\n`);
Terminal.clearColor();

export default {
    version: version,
    main: main,
    compileString: compileString
}