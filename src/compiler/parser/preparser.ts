import {createRange, Log, Source} from "../../utils/log";
import {Compiler} from "../compiler";
import {isAlpha, isNumber, TokenKind} from "../scanner/scanner";
import {printError} from "../../utils/log";
import {StringBuilder_new} from "../../utils/stringbuilder";

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

        else if (c == '/') {

            // Single-line comments
            if (i < limit && contents[i] == '/') {
                i = i + 1;

                while (i < limit && contents[i] != '\n') {
                    i = i + 1;
                }

                continue;
            }

            // Multi-line comments
            if (i < limit && contents[i] == '*') {
                i = i + 1;
                let foundEnd = false;

                while (i < limit) {
                    let next = contents[i];

                    if (next == '*' && i + 1 < limit && contents[i + 1] == '/') {
                        foundEnd = true;
                        i = i + 2;
                        break;
                    }

                    i = i + 1;
                }

                if (!foundEnd) {
                    log.error(createRange(source, start, start + 2), "Unterminated multi-line comment");
                    return null;
                }
            }
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
                        //FIXME: If the import already resolved don't add it again.
                        let importContent = resolveImport(basePath + pathSeparator + text, text);
                        if (importContent) {
                            compiler.addInputBefore(text, importContent, source);
                        } else {
                            return false;
                        }
                        kind = c == '\'' ? TokenKind.CHARACTER : TokenKind.STRING;
                        break;
                    }
                }
            }
        }
    }

    return true;
}

function resolveImport(importPath: string, original:string): string {
    let contents = null;
    if (original === "javascript") {
        contents = stdlib.IO_readTextFile(TURBO_PATH + "/src/extras/javascript.tbs");
    }else {
        contents = stdlib.IO_readTextFile(importPath);
    }
    if (contents == null) {
        printError(StringBuilder_new().append("Cannot read from ").append(importPath).finish());
        return null;
    }
    return contents;
}