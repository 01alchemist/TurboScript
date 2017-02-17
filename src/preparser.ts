import {Log, Source, createRange} from "./log";
import {Compiler} from "./compiler";
import {isAlpha, isNumber, TokenKind} from "./lexer";
import {printError} from "./main";
import {StringBuilder_new} from "./stringbuilder";

export function preparse(source: Source, compiler: Compiler, log: Log): boolean {

    let contents = source.contents;
    let limit = contents.length;
    let pathSeparator = source.name.indexOf("/") > -1 ? "/" : (source.name.indexOf("\\") > -1 ? "\\" : "/");
    let basePath: string = source.name.substring(0, source.name.lastIndexOf(pathSeparator));
    let wantNewline = false;
    let captureImportFrom = false;
    let captureImportPath = false;
    let i = 0;

    while (i < limit) {
        let start = i;
        let c = contents[i];
        i = i + 1;

        if (c == ' ' || c == '\t' || c == '\r') {
            continue;
        }

        let kind = TokenKind.END_OF_FILE;

        // Newline
        if (c == '\n') {
            if (!wantNewline) {
                continue;
            }

            // Preprocessor commands all end in a newline
            wantNewline = false;
        }

        // Identifier
        else if (isAlpha(c)) {
            while (i < limit && (isAlpha(contents[i]) || isNumber(contents[i]))) {
                i = i + 1;
            }

            // Keywords
            let length = i - start;
            if (length >= 2 && length <= 10) {
                let text = contents.slice(start, i);

                if (text == "import") {
                    captureImportFrom = true;
                }
                else if (text == "from" && captureImportFrom) {
                    captureImportFrom = false;
                    captureImportPath = true;
                }
            }
        }
        // Character or string
        else if (captureImportPath && (c == '"' || c == '\'' || c == '`')) {

            captureImportPath = false;

            while (i < limit) {
                let next = contents[i];

                // Escape any character including newlines
                if (i + 1 < limit && next == '\\') {
                    i = i + 2;
                }

                // Only allow newlines in template literals
                else if (next == '\n' && c != '`') {
                    break;
                }

                // Handle a normal character
                else {
                    i = i + 1;

                    // End the string with a matching quote character
                    if (next == c) {
                        let text = contents.slice(start + 1, i - 1);
                        let importContent = resolveImport(basePath + pathSeparator + text);
                        if (importContent) {
                            compiler.addInput(text, importContent);
                        } else {
                            return false;
                        }
                        console.log(text);
                        kind = c == '\'' ? TokenKind.CHARACTER : TokenKind.STRING;
                        break;
                    }
                }
            }
        }
    }

    return true;
}

function resolveImport(importPath: string): string {
    let contents = stdlib.IO_readTextFile(importPath);
    if (contents == null) {
        printError(StringBuilder_new().append("Cannot read from ").append(importPath).finish());
        return null;
    }
    return contents;
}