///<reference path="declarations.d.ts" />
import {Log, DiagnosticKind} from "./log";
import {StringBuilder_new} from "./stringbuilder";
import {CompileTarget, Compiler, replaceFileExtension} from "./compiler";

/**
 * TurboScript compiler main entry
 *
 */

export enum Color {
    DEFAULT,
    BOLD,
    RED,
    GREEN,
    MAGENTA,
}

export function writeLogToTerminal(log: Log): void {
    let diagnostic = log.first;

    while (diagnostic != null) {
        if (diagnostic.range !== undefined) {
            let location = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);

            // Source
            let builder = StringBuilder_new();
            diagnostic.appendSourceName(builder, location);
            stdlib.Terminal_setColor(Color.BOLD);
            stdlib.Terminal_write(builder.finish());

            // Kind
            builder = StringBuilder_new();
            diagnostic.appendKind(builder);
            stdlib.Terminal_setColor(diagnostic.kind == DiagnosticKind.ERROR ? Color.RED : Color.MAGENTA);
            stdlib.Terminal_write(builder.finish());

            // Message
            builder = StringBuilder_new();
            diagnostic.appendMessage(builder);
            stdlib.Terminal_setColor(Color.BOLD);
            stdlib.Terminal_write(builder.finish());

            // Line contents
            builder = StringBuilder_new();
            diagnostic.appendLineContents(builder, location);
            stdlib.Terminal_setColor(Color.DEFAULT);
            stdlib.Terminal_write(builder.finish());

            // Range
            builder = StringBuilder_new();
            diagnostic.appendRange(builder, location);
            stdlib.Terminal_setColor(Color.GREEN);
            stdlib.Terminal_write(builder.finish());

        } else {
            stdlib.Terminal_setColor(Color.RED);
            stdlib.Terminal_write(diagnostic.message + "\n");
        }

        diagnostic = diagnostic.next;
    }

    stdlib.Terminal_setColor(Color.DEFAULT);
}

export function printError(text: string): void {
    stdlib.Terminal_setColor(Color.RED);
    stdlib.Terminal_write("error: ");
    stdlib.Terminal_setColor(Color.BOLD);
    stdlib.Terminal_write(text);
    stdlib.Terminal_write("\n");
    stdlib.Terminal_setColor(Color.DEFAULT);
}

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
    stdlib.Terminal_write(`
Usage: tc [FLAGS] [INPUTS]

  --help           Print this message.
  --out [PATH]     Emit code to PATH (the target format is the file extension).
    --asmjs        Explicit asmjs output
    --wasm         Explicit webassembly output 
  --define [NAME]  Define the flag NAME in all input files.

Examples:

  tc main.tbs --out main.asm.js
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
            } else if (text == "--c") {
                target = CompileTarget.C;
            } else if (text == "--js") {
                target = CompileTarget.JAVASCRIPT;
            } else if (text == "--turbo-js") {
                target = CompileTarget.TURBO_JAVASCRIPT;
            } else if (text == "--asmjs") {
                target = CompileTarget.ASMJS;
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
        else if (output.endsWith(".asm.js")) target = CompileTarget.ASMJS;
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
            let contents = stdlib.IO_readTextFile(text);
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
        if (target == CompileTarget.C && stdlib.IO_writeTextFile(output, compiler.outputC) &&
            stdlib.IO_writeTextFile(replaceFileExtension(output, ".h"), compiler.outputH) ||
            target == CompileTarget.JAVASCRIPT && stdlib.IO_writeTextFile(output, compiler.outputJS) ||
            target == CompileTarget.TURBO_JAVASCRIPT && stdlib.IO_writeTextFile(output, compiler.outputJS) ||
            target == CompileTarget.ASMJS && stdlib.IO_writeTextFile(output, compiler.outputJS) ||
            target == CompileTarget.WEBASSEMBLY && stdlib.IO_writeBinaryFile(output, compiler.outputWASM) &&
            stdlib.IO_writeTextFile(output + ".log", compiler.outputWASM.log)) {
            return 0;
        }

        printError(StringBuilder_new().append("Cannot write to ").append(output).finish());
    }

    return 1;
}

export var main = {
    addArgument: main_addArgument,
    reset: main_reset,
    entry: main_entry
};