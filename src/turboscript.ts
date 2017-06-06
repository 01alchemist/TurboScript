///<reference path="declarations.d.ts" />
import {Log, DiagnosticKind, printError, writeLogToTerminal} from "./utils/log";
import {StringBuilder_new} from "./utils/stringbuilder";
import {Compiler, replaceFileExtension} from "./compiler/compiler";
import {CompileTarget} from "./compiler/compile-target";
import {Terminal} from "./utils/terminal";
import {FileSystem} from "./utils/filesystem";

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
            } else {
                printError(StringBuilder_new().append("Invalid flag: ").append(text).finish());
                return 1;
            }
        } else {
            inputCount = inputCount + 1;
        }
        argument = argument.next;
    }

    // Must have inputs
    if (inputCount == 0) {
        printError("No input files");
        return 1;
    }

    // Must have an output
    if (output == null) {
        printError("Missing an output file (use the --out flag)");
        return 1;
    }

    // Automatically set the target based on the file extension
    //C emitter and vanilla javascript emitter is disabled due to outdated code base.
    if (target == CompileTarget.NONE) {
        if (output.endsWith(".wasm")) target = CompileTarget.WEBASSEMBLY;
        // else if (output.endsWith(".c")) target = CompileTarget.C;
        // else if (output.endsWith(".js")) target = CompileTarget.TURBO_JAVASCRIPT;
        else {
            // printError("Missing a target (use either --c, --js, --asmjs or --wasm)");
            printError("Missing a target (use either --asmjs or --wasm)");
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
                printError(StringBuilder_new().append("Cannot read from ").append(text).finish());
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
        if (target == CompileTarget.CPP && FileSystem.writeTextFile(output, compiler.outputCPP) &&
            FileSystem.writeTextFile(replaceFileExtension(output, ".h"), compiler.outputH) ||
            target == CompileTarget.JAVASCRIPT && FileSystem.writeTextFile(output, compiler.outputJS) ||
            target == CompileTarget.WEBASSEMBLY && FileSystem.writeBinaryFile(output, compiler.outputWASM) &&
            FileSystem.writeTextFile(output + ".log", compiler.outputWASM.log)) {
            return 0;
        }

        printError(StringBuilder_new().append("Cannot write to ").append(output).finish());
    }

    return 1;
}

export const main = {
    addArgument: main_addArgument,
    reset: main_reset,
    entry: main_entry
};

export function compileString(source:string, target:CompileTarget = CompileTarget.WEBASSEMBLY) {
    if(typeof TURBO_PATH === "undefined"){
        TURBO_PATH = "";
    }
    let input = "tmp-string-source.tbs";
    let output = "tmp-string-source.wasm";
    FileSystem.writeTextFile("tmp-string-source.tbs", source);

    let compiler = new Compiler();
    compiler.initialize(target, output);
    compiler.addInput(input, source);
    compiler.finish();
    console.log("finished");
    writeLogToTerminal(compiler.log);
    if (!compiler.log.hasErrors()) {
        return compiler.outputWASM;
    } else {
        return null;
    }
}