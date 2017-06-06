import {SourceRange, createRange, Source, Log} from "../../utils/log";
import {StringBuilder_new} from "../../utils/stringbuilder";
import {assert} from "../../utils/assert";
/**
 * Author: Nidin Vinayakan
 */
export enum TokenKind {
    END_OF_FILE,
        // Literals
    CHARACTER,
    IDENTIFIER,
    INT32,
    INT64,
    FLOAT32,
    FLOAT64,
    STRING,
    ARRAY,

        // Punctuation
    ASSIGN,
    BITWISE_AND,
    BITWISE_OR,
    BITWISE_XOR,
    COLON,
    COMMA,
    COMPLEMENT,
    DIVIDE,
    DOT,
    EQUAL,
    EXPONENT,
    GREATER_THAN,
    GREATER_THAN_EQUAL,
    LEFT_BRACE,
    LEFT_BRACKET,
    LEFT_PARENTHESIS,
    LESS_THAN,
    LESS_THAN_EQUAL,
    LOGICAL_AND,
    LOGICAL_OR,
    MINUS,
    MINUS_MINUS,
    MULTIPLY,
    NOT,
    NOT_EQUAL,
    PLUS,
    PLUS_PLUS,
    QUESTION_MARK,
    REMAINDER,
    RIGHT_BRACE,
    RIGHT_BRACKET,
    RIGHT_PARENTHESIS,
    SEMICOLON,
    FROM,
    SHIFT_LEFT,
    SHIFT_RIGHT,

        // Keywords
    ALIGNOF,
    AS,
    BREAK,
    MODULE,
    CLASS,
    CONST,
    CONTINUE,
    DECLARE,
    ELSE,
    ENUM,
    EXPORT,
    EXTENDS,
    FALSE,
    FUNCTION,
    ANYFUNC,
    IF,
    IMPLEMENTS,
    IMPORT,
    LET,
    NEW,
    DELETE,
    NULL,
    UNDEFINED,
    OPERATOR,
    PRIVATE,
    PROTECTED,
    PUBLIC,
    RETURN,
    SIZEOF,
    STATIC,
    THIS,
    TRUE,
    UNSAFE,
    JAVASCRIPT,
    START,
    VIRTUAL,
    VAR,
    WHILE,

        // Preprocessor
    PREPROCESSOR_DEFINE,
    PREPROCESSOR_ELIF,
    PREPROCESSOR_ELSE,
    PREPROCESSOR_ENDIF,
    PREPROCESSOR_ERROR,
    PREPROCESSOR_IF,
    PREPROCESSOR_NEEDED,
    PREPROCESSOR_NEWLINE,
    PREPROCESSOR_UNDEF,
    PREPROCESSOR_WARNING,
}

export function isKeyword(kind: TokenKind): boolean {
    return kind >= TokenKind.ALIGNOF && kind <= TokenKind.WHILE;
}

export class Token {
    kind: TokenKind;
    range: SourceRange;
    next: Token;
}

export function splitToken(first: Token, firstKind: TokenKind, secondKind: TokenKind): void {
    var range = first.range;
    assert(range.end - range.start >= 2);

    var second = new Token();
    second.kind = secondKind;
    second.range = createRange(range.source, range.start + 1, range.end);
    second.next = first.next;

    first.kind = firstKind;
    first.next = second;
    range.end = range.start + 1;
}

export function tokenToString(token: TokenKind): string {
    if (token == TokenKind.END_OF_FILE) return "end of file";

    // Literals
    if (token == TokenKind.CHARACTER) return "character literal";
    if (token == TokenKind.IDENTIFIER) return "identifier";
    if (token == TokenKind.INT32) return "integer32 literal";
    if (token == TokenKind.INT64) return "integer64 literal";
    if (token == TokenKind.FLOAT32) return "float32 literal";
    if (token == TokenKind.FLOAT64) return "float64 literal";
    if (token == TokenKind.STRING) return "string literal";
    if (token == TokenKind.ARRAY) return "array literal";

    // Punctuation
    if (token == TokenKind.ASSIGN) return "'='";
    if (token == TokenKind.BITWISE_AND) return "'&'";
    if (token == TokenKind.BITWISE_OR) return "'|'";
    if (token == TokenKind.BITWISE_XOR) return "'^'";
    if (token == TokenKind.COLON) return "':'";
    if (token == TokenKind.COMMA) return "','";
    if (token == TokenKind.COMPLEMENT) return "'~'";
    if (token == TokenKind.DIVIDE) return "'/'";
    if (token == TokenKind.DOT) return "'.'";
    if (token == TokenKind.EQUAL) return "'=='";
    if (token == TokenKind.EXPONENT) return "'**'";
    if (token == TokenKind.GREATER_THAN) return "'>'";
    if (token == TokenKind.GREATER_THAN_EQUAL) return "'>='";
    if (token == TokenKind.LEFT_BRACE) return "'{'";
    if (token == TokenKind.LEFT_BRACKET) return "'['";
    if (token == TokenKind.LEFT_PARENTHESIS) return "'('";
    if (token == TokenKind.LESS_THAN) return "'<'";
    if (token == TokenKind.LESS_THAN_EQUAL) return "'<='";
    if (token == TokenKind.LOGICAL_AND) return "'&&'";
    if (token == TokenKind.LOGICAL_OR) return "'||'";
    if (token == TokenKind.MINUS) return "'-'";
    if (token == TokenKind.MINUS_MINUS) return "'--'";
    if (token == TokenKind.MULTIPLY) return "'*'";
    if (token == TokenKind.NOT) return "'!'";
    if (token == TokenKind.NOT_EQUAL) return "'!='";
    if (token == TokenKind.PLUS) return "'+'";
    if (token == TokenKind.PLUS_PLUS) return "'++'";
    if (token == TokenKind.QUESTION_MARK) return "'?'";
    if (token == TokenKind.REMAINDER) return "'%'";
    if (token == TokenKind.RIGHT_BRACE) return "'}'";
    if (token == TokenKind.RIGHT_BRACKET) return "']'";
    if (token == TokenKind.RIGHT_PARENTHESIS) return "')'";
    if (token == TokenKind.SEMICOLON) return "';'";
    if (token == TokenKind.SHIFT_LEFT) return "'<<'";
    if (token == TokenKind.SHIFT_RIGHT) return "'>>'";

    // Keywords
    if (token == TokenKind.FROM) return "'from'";
    if (token == TokenKind.ALIGNOF) return "'alignof'";
    if (token == TokenKind.AS) return "'as'";
    if (token == TokenKind.BREAK) return "'break'";
    if (token == TokenKind.MODULE) return "'module'";
    if (token == TokenKind.CLASS) return "'class'";
    if (token == TokenKind.CONST) return "'const'";
    if (token == TokenKind.CONTINUE) return "'continue'";
    if (token == TokenKind.DECLARE) return "'declare'";
    if (token == TokenKind.ELSE) return "'else'";
    if (token == TokenKind.ENUM) return "'enum'";
    if (token == TokenKind.EXPORT) return "'export'";
    if (token == TokenKind.EXTENDS) return "'extends'";
    if (token == TokenKind.FALSE) return "'false'";
    if (token == TokenKind.FUNCTION) return "'function'";
    if (token == TokenKind.ANYFUNC) return "'anyfunc'";
    if (token == TokenKind.IF) return "'if'";
    if (token == TokenKind.IMPLEMENTS) return "'implements'";
    if (token == TokenKind.IMPORT) return "'import'";
    if (token == TokenKind.LET) return "'let'";
    if (token == TokenKind.NEW) return "'new'";
    if (token == TokenKind.DELETE) return "'delete'";
    if (token == TokenKind.NULL) return "'null'";
    if (token == TokenKind.UNDEFINED) return "'undefined'";
    if (token == TokenKind.OPERATOR) return "'operator'";
    if (token == TokenKind.PRIVATE) return "'private'";
    if (token == TokenKind.PROTECTED) return "'protected'";
    if (token == TokenKind.PUBLIC) return "'public'";
    if (token == TokenKind.RETURN) return "'return'";
    if (token == TokenKind.SIZEOF) return "'sizeof'";
    if (token == TokenKind.STATIC) return "'static'";
    if (token == TokenKind.THIS) return "'this'";
    if (token == TokenKind.TRUE) return "'true'";
    if (token == TokenKind.UNSAFE) return "'unsafe'";
    if (token == TokenKind.JAVASCRIPT) return "'@JS'";
    if (token == TokenKind.START) return "'@start'";
    if (token == TokenKind.VIRTUAL) return "'@virtual'";
    if (token == TokenKind.VAR) return "'var'";
    if (token == TokenKind.WHILE) return "'while'";

    // Preprocessor
    if (token == TokenKind.PREPROCESSOR_DEFINE) return "'#define'";
    if (token == TokenKind.PREPROCESSOR_ELIF) return "'#elif'";
    if (token == TokenKind.PREPROCESSOR_ELSE) return "'#else'";
    if (token == TokenKind.PREPROCESSOR_ENDIF) return "'#endif'";
    if (token == TokenKind.PREPROCESSOR_ERROR) return "'#error'";
    if (token == TokenKind.PREPROCESSOR_IF) return "'#if'";
    if (token == TokenKind.PREPROCESSOR_NEWLINE) return "newline";
    if (token == TokenKind.PREPROCESSOR_UNDEF) return "'#undef'";
    if (token == TokenKind.PREPROCESSOR_WARNING) return "'#warning'";

    assert(false);
    return null;
}

export function isAlpha(c: string): boolean {
    return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c == '_';
}

export function isASCII(c: uint16): boolean {
    return c >= 0x20 && c <= 0x7E;
}

export function isNumber(c: string): boolean {
    return c >= '0' && c <= '9';
}

export function isDigit(c: any, base: uint8): boolean {
    if (c.trim() == "") return false;
    if (base == 16) {
        return isNumber(c) || c >= 'A' && c <= 'F' || c >= 'a' && c <= 'f';
    }
    //return c >= '0' && c < '0' + base;
    return !isNaN(c);
}

export function tokenize(source: Source, log: Log): Token {
    var first: Token = null;
    var last: Token = null;
    var contents = source.contents;
    var limit = contents.length;
    var needsPreprocessor = false;
    var wantNewline = false;
    var i = 0;

    while (i < limit) {
        var start = i;
        var c = contents[i];
        i = i + 1;

        if (c == ' ' || c == '\t' || c == '\r') {
            continue;
        }

        var kind = TokenKind.END_OF_FILE;

        // Newline
        if (c == '\n') {
            if (!wantNewline) {
                continue;
            }

            // Preprocessor commands all end in a newline
            kind = TokenKind.PREPROCESSOR_NEWLINE;
            wantNewline = false;
        }

        // Identifier
        else if (isAlpha(c) || c == "@") {
            kind = TokenKind.IDENTIFIER;

            while (i < limit && (isAlpha(contents[i]) || isNumber(contents[i]))) {
                i = i + 1;
            }

            // Keywords
            var length = i - start;
            if (length >= 2 && length <= 10) {
                var text = contents.slice(start, i);

                if (length == 2) {
                    if (text == "as") kind = TokenKind.AS;
                    else if (text == "if") kind = TokenKind.IF;
                }

                else if (length == 3) {
                    if (text == "let") kind = TokenKind.LET;
                    else if (text == "new") kind = TokenKind.NEW;
                    else if (text == "var") kind = TokenKind.VAR;
                    else if (text == "@JS") kind = TokenKind.JAVASCRIPT;
                }

                else if (length == 4) {
                    if (text == "else") kind = TokenKind.ELSE;
                    else if (text == "enum") kind = TokenKind.ENUM;
                    else if (text == "null") kind = TokenKind.NULL;
                    else if (text == "this") kind = TokenKind.THIS;
                    else if (text == "true") kind = TokenKind.TRUE;
                    else if (text == "from") kind = TokenKind.FROM;
                }

                else if (length == 5) {
                    if (text == "break") kind = TokenKind.BREAK;
                    else if (text == "class") kind = TokenKind.CLASS;
                    else if (text == "const") kind = TokenKind.CONST;
                    else if (text == "false") kind = TokenKind.FALSE;
                    else if (text == "while") kind = TokenKind.WHILE;
                }

                else if (length == 6) {
                    if (text == "export") kind = TokenKind.EXPORT;
                    else if (text == "module") kind = TokenKind.MODULE;
                    else if (text == "import") kind = TokenKind.IMPORT;
                    else if (text == "public") kind = TokenKind.PUBLIC;
                    else if (text == "return") kind = TokenKind.RETURN;
                    else if (text == "sizeof") kind = TokenKind.SIZEOF;
                    else if (text == "static") kind = TokenKind.STATIC;
                    else if (text == "unsafe") kind = TokenKind.UNSAFE;
                    else if (text == "@start") kind = TokenKind.START;
                    else if (text == "delete") kind = TokenKind.DELETE;
                }

                else if (length == 7) {
                    if (text == "alignof") kind = TokenKind.ALIGNOF;
                    else if (text == "declare") kind = TokenKind.DECLARE;
                    else if (text == "extends") kind = TokenKind.EXTENDS;
                    else if (text == "private") kind = TokenKind.PRIVATE;
                    else if (text == "anyfunc") kind = TokenKind.ANYFUNC;
                }

                else {
                    if (text == "continue") kind = TokenKind.CONTINUE;
                    else if (text == "@virtual") kind = TokenKind.VIRTUAL;
                    else if (text == "function") kind = TokenKind.FUNCTION;
                    else if (text == "implements") kind = TokenKind.IMPLEMENTS;
                    else if (text == "protected") kind = TokenKind.PROTECTED;
                }
            }
        }

        // Integer or Float
        else if (isNumber(c)) {

            let isFloat: boolean = false;
            let isDouble: boolean = false;

            //kind = TokenKind.INT32;

            if (i < limit) {
                var next = contents[i];
                var base: uint8 = 10;

                // Handle binary, octal, and hexadecimal prefixes
                if (c == '0' && i + 1 < limit) {
                    if (next == 'b' || next == 'B') base = 2;
                    else if (next == 'o' || next == 'O') base = 8;
                    else if (next == 'x' || next == 'X') base = 16;
                    if (base != 10) {
                        if (isDigit(contents[i + 1], base)) i = i + 2;
                        else base = 10;
                    }
                }

                let floatFound: boolean = false;
                let exponentFound: boolean = false;
                // Scan the payload
                while (i < limit && (isDigit(contents[i], base) ||
                    (exponentFound = contents[i] === "e") ||
                    (floatFound = contents[i] === ".")))
                {
                    i = i + 1;

                    if (exponentFound) {
                        isFloat = true;
                        if(contents[i] === "+" || contents[i] === "-"){
                            i = i + 1;
                        }
                    }

                    if (floatFound) {
                        isFloat = true;
                    }
                }

                if (contents[i] === "f") {
                    kind = TokenKind.FLOAT32;
                    i = i + 1;
                } else {
                    kind = isFloat ? TokenKind.FLOAT64 : TokenKind.INT32;
                }

                // Extra letters after the end is an error
                if (i < limit && (isAlpha(contents[i]) || isNumber(contents[i]))) {
                    i = i + 1;

                    while (i < limit && (isAlpha(contents[i]) || isNumber(contents[i]))) {
                        i = i + 1;
                    }

                    log.error(createRange(source, start, i), StringBuilder_new()
                        .append(`Invalid ${isFloat ? "float" : "integer"} literal: '`)
                        .appendSlice(contents, start, i)
                        .appendChar('\'')
                        .finish());
                    return null;
                }
            }
        }

        // Character or string
        else if (c == '"' || c == '\'' || c == '`') {
            while (i < limit) {
                var next = contents[i];

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
                        kind = c == '\'' ? TokenKind.CHARACTER : TokenKind.STRING;
                        break;
                    }
                }
            }

            // It's an error if we didn't find a matching quote character
            if (kind == TokenKind.END_OF_FILE) {
                log.error(createRange(source, start, i),
                    c == '\'' ? "Unterminated character literal" :
                        c == '`' ? "Unterminated template literal" :
                            "Unterminated string literal");
                return null;
            }
        }

        // Operators
        else if (c == '%') kind = TokenKind.REMAINDER;
        else if (c == '(') kind = TokenKind.LEFT_PARENTHESIS;
        else if (c == ')') kind = TokenKind.RIGHT_PARENTHESIS;
        else if (c == ',') kind = TokenKind.COMMA;
        else if (c == '.') kind = TokenKind.DOT;
        else if (c == ':') kind = TokenKind.COLON;
        else if (c == ';') kind = TokenKind.SEMICOLON;
        else if (c == '?') kind = TokenKind.QUESTION_MARK;
        else if (c == '[') kind = TokenKind.LEFT_BRACKET;
        else if (c == ']') kind = TokenKind.RIGHT_BRACKET;
        else if (c == '^') kind = TokenKind.BITWISE_XOR;
        else if (c == '{') kind = TokenKind.LEFT_BRACE;
        else if (c == '}') kind = TokenKind.RIGHT_BRACE;
        else if (c == '~') kind = TokenKind.COMPLEMENT;

        // * or **
        else if (c == '*') {
            kind = TokenKind.MULTIPLY;

            if (i < limit && contents[i] == '*') {
                kind = TokenKind.EXPONENT;
                i = i + 1;
            }
        }

        // / or // or /*
        else if (c == '/') {
            kind = TokenKind.DIVIDE;

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
                var foundEnd = false;

                while (i < limit) {
                    var next = contents[i];

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

                continue;
            }
        }

        // ! or !=
        else if (c == '!') {
            kind = TokenKind.NOT;

            if (i < limit && contents[i] == '=') {
                kind = TokenKind.NOT_EQUAL;
                i = i + 1;

                // Recover from !==
                if (i < limit && contents[i] == '=') {
                    i = i + 1;
                    log.error(createRange(source, start, i), "Use '!=' instead of '!=='");
                }
            }
        }

        // = or ==
        else if (c == '=') {
            kind = TokenKind.ASSIGN;

            if (i < limit && contents[i] == '=') {
                kind = TokenKind.EQUAL;
                i = i + 1;

                // Recover from ===
                if (i < limit && contents[i] == '=') {
                    i = i + 1;
                    log.error(createRange(source, start, i), "Use '==' instead of '==='");
                }
            }
        }

        // + or ++
        else if (c == '+') {
            kind = TokenKind.PLUS;

            if (i < limit && contents[i] == '+') {
                kind = TokenKind.PLUS_PLUS;
                i = i + 1;
            }
        }

        // - or --
        else if (c == '-') {
            kind = TokenKind.MINUS;

            if (i < limit && contents[i] == '-') {
                kind = TokenKind.MINUS_MINUS;
                i = i + 1;
            }
        }

        // & or &&
        else if (c == '&') {
            kind = TokenKind.BITWISE_AND;

            if (i < limit && contents[i] == '&') {
                kind = TokenKind.LOGICAL_AND;
                i = i + 1;
            }
        }

        // | or ||
        else if (c == '|') {
            kind = TokenKind.BITWISE_OR;

            if (i < limit && contents[i] == '|') {
                kind = TokenKind.LOGICAL_OR;
                i = i + 1;
            }
        }

        // < or << or <=
        else if (c == '<') {
            kind = TokenKind.LESS_THAN;

            if (i < limit) {
                c = contents[i];

                if (c == '<') {
                    kind = TokenKind.SHIFT_LEFT;
                    i = i + 1;
                }

                else if (c == '=') {
                    kind = TokenKind.LESS_THAN_EQUAL;
                    i = i + 1;
                }
            }
        }

        // > or >> or >=
        else if (c == '>') {
            kind = TokenKind.GREATER_THAN;

            if (i < limit) {
                c = contents[i];

                if (c == '>') {
                    kind = TokenKind.SHIFT_RIGHT;
                    i = i + 1;
                }

                else if (c == '=') {
                    kind = TokenKind.GREATER_THAN_EQUAL;
                    i = i + 1;
                }
            }
        }

        else if (c == '#') {
            while (i < limit && (isAlpha(contents[i]) || isNumber(contents[i]))) {
                i = i + 1;
            }

            var text = contents.slice(start, i);

            if (text == "#define") kind = TokenKind.PREPROCESSOR_DEFINE;
            else if (text == "#elif") kind = TokenKind.PREPROCESSOR_ELIF;
            else if (text == "#else") kind = TokenKind.PREPROCESSOR_ELSE;
            else if (text == "#endif") kind = TokenKind.PREPROCESSOR_ENDIF;
            else if (text == "#error") kind = TokenKind.PREPROCESSOR_ERROR;
            else if (text == "#if") kind = TokenKind.PREPROCESSOR_IF;
            else if (text == "#undef") kind = TokenKind.PREPROCESSOR_UNDEF;
            else if (text == "#warning") kind = TokenKind.PREPROCESSOR_WARNING;

            // Allow a shebang at the start of the file
            else if (start == 0 && text == "#" && i < limit && contents[i] == '!') {
                while (i < limit && contents[i] != '\n') {
                    i = i + 1;
                }
                continue;
            }

            else {
                var builder = StringBuilder_new().append("Invalid preprocessor token '").append(text).appendChar('\'');

                // Check for #if typos
                if (text == "#ifdef") {
                    builder.append(", did you mean '#if'?");
                    kind = TokenKind.PREPROCESSOR_IF;
                }

                // Check for #elif typos
                else if (text == "#elsif" || text == "#elseif") {
                    builder.append(", did you mean '#elif'?");
                    kind = TokenKind.PREPROCESSOR_ELIF;
                }

                // Check for #endif typos
                else if (text == "#end") {
                    builder.append(", did you mean '#endif'?");
                    kind = TokenKind.PREPROCESSOR_ENDIF;
                }

                log.error(createRange(source, start, i), builder.finish());
            }

            // All preprocessor directives must be on a line by themselves
            if (last != null && last.kind != TokenKind.PREPROCESSOR_NEWLINE) {
                var end = last.range.end;
                var j = i - 1;
                while (j >= end) {
                    if (contents[j] == '\n') {
                        break;
                    }
                    j = j - 1;
                }
                if (j < end) {
                    log.error(createRange(source, start, i), StringBuilder_new()
                        .append("Expected newline before ")
                        .append(tokenToString(kind))
                        .finish());
                }
            }

            needsPreprocessor = true;
            wantNewline = true;
        }

        var range = createRange(source, start, i);

        if (kind == TokenKind.END_OF_FILE) {
            log.error(range, StringBuilder_new()
                .append("Syntax error: '")
                .appendSlice(contents, start, start + 1)
                .appendChar('\'')
                .finish());
            return null;
        }

        var token = new Token();
        token.kind = kind;
        token.range = range;

        if (first == null) first = token;
        else last.next = token;
        last = token;
    }

    var eof = new Token();
    eof.kind = TokenKind.END_OF_FILE;
    eof.range = createRange(source, limit, limit);

    if (first == null) first = eof;
    else last.next = eof;
    last = eof;

    // Pass a "flag" for whether the preprocessor is needed back to the caller
    if (needsPreprocessor) {
        var token = new Token();
        token.kind = TokenKind.PREPROCESSOR_NEEDED;
        token.next = first;
        return token;
    }

    return first;
}
