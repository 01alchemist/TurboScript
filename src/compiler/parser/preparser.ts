import {createRange, Log, Source} from "../../utils/log";
import {Compiler} from "../compiler";
import {isAlpha, isNumber, TokenKind} from "../scanner/scanner";
import {FileSystem} from "../../utils/filesystem";
import {Terminal} from "../../utils/terminal";
import {BinaryImporter} from "../../importer/binary-importer";
import {isNode} from "../../utils/env";

const javascript = require("../../extras/javascript.tbs");
let path;
if (isNode) {
    path = require("path");
}
export function preparse(source: Source, compiler: Compiler, log: Log): boolean {
    if (isNode) {
        source.name = path.resolve(source.name);
    }
    let basePath = FileSystem.getBasePath(source.name);
    let contents = source.contents;
    let limit = contents.length;
    let wantNewline = false;
    let captureImports = false;
    let captureImportFrom = false;
    let captureImportPath = false;
    let imports: string[];
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
                    captureImports = true;
                    captureImportFrom = true;
                }
                else if (text == "from" && captureImportFrom) {
                    captureImportFrom = false;
                    captureImportPath = true;
                }
            }
        }
        else if (captureImports && c == '{') {
            captureImports = false;
            imports = [];
            let nextImportIndex = start;
            while (i < limit) {
                let next = contents[i];
                i = i + 1;
                let end = next === "}";
                // capture all imports
                if (next == "," || end) {
                    let _import = contents.slice(nextImportIndex + 1, i - 1);
                    imports.push(_import);
                    kind = TokenKind.IMPORT;
                    if (end) {
                        break;
                    }
                    nextImportIndex = i;
                }
            }
        }
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
                        let from = contents.slice(start + 1, i - 1);
                        //FIXME: If the import already resolved don't add it again.
                        let importContent = resolveImport(imports, from, basePath + "/" + from);
                        if (importContent) {
                            if (source.isLibrary) {
                                source.contents += importContent;
                            } else {
                                compiler.addInputBefore(from, importContent, source);
                            }
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

function resolveImport(imports: string[], from: string, importPath: string): string {
    let contents = null;
    if (from === "javascript") {
        contents = javascript;
    } else if (from.endsWith(".wasm")) {
        return BinaryImporter.resolveWasmBinaryImport(imports, from, importPath);
    } else {
        contents = FileSystem.readTextFile(importPath);
    }
    if (contents == null) {
        Terminal.error(`Cannot read from ${importPath}`);
        return null;
    }
    return contents;
}
