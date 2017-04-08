System.register("stringbuilder", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    // Remove an object from the pool or allocate a new object if the pool is empty
    function StringBuilder_new() {
        let sb = stringBuilderPool;
        if (sb != null)
            stringBuilderPool = sb.next;
        else
            sb = new StringBuilder();
        sb.clear();
        return sb;
    }
    exports_1("StringBuilder_new", StringBuilder_new);
    function StringBuilder_appendQuoted(sb, text) {
        let end = 0;
        let limit = text.length;
        let start = end;
        sb.appendChar('"');
        while (end < limit) {
            let c = text[end];
            if (c == '"')
                sb.appendSlice(text, start, end).append("\\\"");
            else if (c == '\0')
                sb.appendSlice(text, start, end).append("\\0");
            else if (c == '\t')
                sb.appendSlice(text, start, end).append("\\t");
            else if (c == '\r')
                sb.appendSlice(text, start, end).append("\\r");
            else if (c == '\n')
                sb.appendSlice(text, start, end).append("\\n");
            else if (c == '\\')
                sb.appendSlice(text, start, end).append("\\\\");
            else {
                end = end + 1;
                continue;
            }
            end = end + 1;
            start = end;
        }
        sb.appendSlice(text, start, end).appendChar('"');
    }
    exports_1("StringBuilder_appendQuoted", StringBuilder_appendQuoted);
    var stringBuilderPool, StringBuilder;
    return {
        setters: [],
        execute: function () {
            stringBuilderPool = null;
            StringBuilder = class StringBuilder {
                constructor() {
                    this.indent = 0;
                    this.chunks = [];
                }
                clear() {
                    this._text = "";
                }
                clearIndent(delta = 0) {
                    this._text = this._text.substr(0, this._text.length - (delta * 4));
                }
                emitIndent(delta = 0) {
                    if (delta < 0) {
                        this._text = this._text.substr(0, this._text.length + (delta * 4));
                    }
                    this.indent += delta;
                    let i = this.indent;
                    while (i > 0) {
                        this._text += "    ";
                        i = i - 1;
                    }
                }
                appendChar(c) {
                    // this._text = StringBuilder_appendChar(this._text, c);
                    this._text += c;
                    return this;
                }
                appendSlice(text, start, end) {
                    // this._text = StringBuilder_append(this._text, text.slice(start, end));
                    this._text += text.slice(start, end);
                    return this;
                }
                breakChunk() {
                    this.chunks.push(this._text);
                    this._text = "";
                    return this.chunks.length - 1;
                }
                appendLine(text, indent = 0) {
                    this.indent += indent;
                    this.emitIndent();
                    this._text += text + "\n";
                    return this;
                }
                appendRaw(text) {
                    this._text += text + "\n";
                    return this;
                }
                append(text, indent = 0) {
                    this.indent += indent;
                    let lines = text.split("\n");
                    lines.forEach((line, i) => {
                        if (i > 0) {
                            this._text += "\n";
                            this.emitIndent();
                        }
                        this._text += line;
                    });
                    return this;
                }
                // This also "frees" this object (puts it back in the pool)
                finish() {
                    this.next = stringBuilderPool;
                    stringBuilderPool = this;
                    if (this.chunks.length > 0) {
                        let code = "";
                        this.chunks.forEach((chunk) => {
                            code += chunk;
                        });
                        return code + this._text;
                    }
                    else {
                        return this._text;
                    }
                }
            };
            exports_1("StringBuilder", StringBuilder);
        }
    };
});
System.register("lexer", ["log", "stringbuilder"], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    function isKeyword(kind) {
        return kind >= TokenKind.ALIGNOF && kind <= TokenKind.WHILE;
    }
    exports_2("isKeyword", isKeyword);
    function splitToken(first, firstKind, secondKind) {
        var range = first.range;
        assert(range.end - range.start >= 2);
        var second = new Token();
        second.kind = secondKind;
        second.range = log_1.createRange(range.source, range.start + 1, range.end);
        second.next = first.next;
        first.kind = firstKind;
        first.next = second;
        range.end = range.start + 1;
    }
    exports_2("splitToken", splitToken);
    function tokenToString(token) {
        if (token == TokenKind.END_OF_FILE)
            return "end of file";
        // Literals
        if (token == TokenKind.CHARACTER)
            return "character literal";
        if (token == TokenKind.IDENTIFIER)
            return "identifier";
        if (token == TokenKind.INT32)
            return "integer32 literal";
        if (token == TokenKind.INT64)
            return "integer64 literal";
        if (token == TokenKind.FLOAT32)
            return "float32 literal";
        if (token == TokenKind.FLOAT64)
            return "float64 literal";
        if (token == TokenKind.STRING)
            return "string literal";
        if (token == TokenKind.ARRAY)
            return "array literal";
        // Punctuation
        if (token == TokenKind.ASSIGN)
            return "'='";
        if (token == TokenKind.BITWISE_AND)
            return "'&'";
        if (token == TokenKind.BITWISE_OR)
            return "'|'";
        if (token == TokenKind.BITWISE_XOR)
            return "'^'";
        if (token == TokenKind.COLON)
            return "':'";
        if (token == TokenKind.COMMA)
            return "','";
        if (token == TokenKind.COMPLEMENT)
            return "'~'";
        if (token == TokenKind.DIVIDE)
            return "'/'";
        if (token == TokenKind.DOT)
            return "'.'";
        if (token == TokenKind.EQUAL)
            return "'=='";
        if (token == TokenKind.EXPONENT)
            return "'**'";
        if (token == TokenKind.GREATER_THAN)
            return "'>'";
        if (token == TokenKind.GREATER_THAN_EQUAL)
            return "'>='";
        if (token == TokenKind.LEFT_BRACE)
            return "'{'";
        if (token == TokenKind.LEFT_BRACKET)
            return "'['";
        if (token == TokenKind.LEFT_PARENTHESIS)
            return "'('";
        if (token == TokenKind.LESS_THAN)
            return "'<'";
        if (token == TokenKind.LESS_THAN_EQUAL)
            return "'<='";
        if (token == TokenKind.LOGICAL_AND)
            return "'&&'";
        if (token == TokenKind.LOGICAL_OR)
            return "'||'";
        if (token == TokenKind.MINUS)
            return "'-'";
        if (token == TokenKind.MINUS_MINUS)
            return "'--'";
        if (token == TokenKind.MULTIPLY)
            return "'*'";
        if (token == TokenKind.NOT)
            return "'!'";
        if (token == TokenKind.NOT_EQUAL)
            return "'!='";
        if (token == TokenKind.PLUS)
            return "'+'";
        if (token == TokenKind.PLUS_PLUS)
            return "'++'";
        if (token == TokenKind.QUESTION_MARK)
            return "'?'";
        if (token == TokenKind.REMAINDER)
            return "'%'";
        if (token == TokenKind.RIGHT_BRACE)
            return "'}'";
        if (token == TokenKind.RIGHT_BRACKET)
            return "']'";
        if (token == TokenKind.RIGHT_PARENTHESIS)
            return "')'";
        if (token == TokenKind.SEMICOLON)
            return "';'";
        if (token == TokenKind.SHIFT_LEFT)
            return "'<<'";
        if (token == TokenKind.SHIFT_RIGHT)
            return "'>>'";
        // Keywords
        if (token == TokenKind.FROM)
            return "'from'";
        if (token == TokenKind.ALIGNOF)
            return "'alignof'";
        if (token == TokenKind.AS)
            return "'as'";
        if (token == TokenKind.BREAK)
            return "'break'";
        if (token == TokenKind.MODULE)
            return "'module'";
        if (token == TokenKind.CLASS)
            return "'class'";
        if (token == TokenKind.CONST)
            return "'const'";
        if (token == TokenKind.CONTINUE)
            return "'continue'";
        if (token == TokenKind.DECLARE)
            return "'declare'";
        if (token == TokenKind.ELSE)
            return "'else'";
        if (token == TokenKind.ENUM)
            return "'enum'";
        if (token == TokenKind.EXPORT)
            return "'export'";
        if (token == TokenKind.EXTENDS)
            return "'extends'";
        if (token == TokenKind.FALSE)
            return "'false'";
        if (token == TokenKind.FUNCTION)
            return "'function'";
        if (token == TokenKind.ANYFUNC)
            return "'anyfunc'";
        if (token == TokenKind.IF)
            return "'if'";
        if (token == TokenKind.IMPLEMENTS)
            return "'implements'";
        if (token == TokenKind.INTERNAL_IMPORT)
            return "'import'";
        if (token == TokenKind.EXTERNAL_IMPORT)
            return "'@import'";
        if (token == TokenKind.LET)
            return "'let'";
        if (token == TokenKind.NEW)
            return "'new'";
        if (token == TokenKind.DELETE)
            return "'delete'";
        if (token == TokenKind.NULL)
            return "'null'";
        if (token == TokenKind.UNDEFINED)
            return "'undefined'";
        if (token == TokenKind.OPERATOR)
            return "'operator'";
        if (token == TokenKind.PRIVATE)
            return "'private'";
        if (token == TokenKind.PROTECTED)
            return "'protected'";
        if (token == TokenKind.PUBLIC)
            return "'public'";
        if (token == TokenKind.RETURN)
            return "'return'";
        if (token == TokenKind.SIZEOF)
            return "'sizeof'";
        if (token == TokenKind.STATIC)
            return "'static'";
        if (token == TokenKind.THIS)
            return "'this'";
        if (token == TokenKind.TRUE)
            return "'true'";
        if (token == TokenKind.UNSAFE)
            return "'unsafe'";
        if (token == TokenKind.JAVASCRIPT)
            return "'@JS'";
        if (token == TokenKind.START)
            return "'@start'";
        if (token == TokenKind.VIRTUAL)
            return "'@virtual'";
        if (token == TokenKind.VAR)
            return "'var'";
        if (token == TokenKind.WHILE)
            return "'while'";
        // Preprocessor
        if (token == TokenKind.PREPROCESSOR_DEFINE)
            return "'#define'";
        if (token == TokenKind.PREPROCESSOR_ELIF)
            return "'#elif'";
        if (token == TokenKind.PREPROCESSOR_ELSE)
            return "'#else'";
        if (token == TokenKind.PREPROCESSOR_ENDIF)
            return "'#endif'";
        if (token == TokenKind.PREPROCESSOR_ERROR)
            return "'#error'";
        if (token == TokenKind.PREPROCESSOR_IF)
            return "'#if'";
        if (token == TokenKind.PREPROCESSOR_NEWLINE)
            return "newline";
        if (token == TokenKind.PREPROCESSOR_UNDEF)
            return "'#undef'";
        if (token == TokenKind.PREPROCESSOR_WARNING)
            return "'#warning'";
        assert(false);
        return null;
    }
    exports_2("tokenToString", tokenToString);
    function isAlpha(c) {
        return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c == '_';
    }
    exports_2("isAlpha", isAlpha);
    function isASCII(c) {
        return c >= 0x20 && c <= 0x7E;
    }
    exports_2("isASCII", isASCII);
    function isNumber(c) {
        return c >= '0' && c <= '9';
    }
    exports_2("isNumber", isNumber);
    function isDigit(c, base) {
        if (c.trim() == "")
            return false;
        if (base == 16) {
            return isNumber(c) || c >= 'A' && c <= 'F' || c >= 'a' && c <= 'f';
        }
        //return c >= '0' && c < '0' + base;
        return !isNaN(c);
    }
    exports_2("isDigit", isDigit);
    function tokenize(source, log) {
        var first = null;
        var last = null;
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
                        if (text == "as")
                            kind = TokenKind.AS;
                        else if (text == "if")
                            kind = TokenKind.IF;
                    }
                    else if (length == 3) {
                        if (text == "let")
                            kind = TokenKind.LET;
                        else if (text == "new")
                            kind = TokenKind.NEW;
                        else if (text == "var")
                            kind = TokenKind.VAR;
                        else if (text == "@JS")
                            kind = TokenKind.JAVASCRIPT;
                    }
                    else if (length == 4) {
                        if (text == "else")
                            kind = TokenKind.ELSE;
                        else if (text == "enum")
                            kind = TokenKind.ENUM;
                        else if (text == "null")
                            kind = TokenKind.NULL;
                        else if (text == "this")
                            kind = TokenKind.THIS;
                        else if (text == "true")
                            kind = TokenKind.TRUE;
                        else if (text == "from")
                            kind = TokenKind.FROM;
                    }
                    else if (length == 5) {
                        if (text == "break")
                            kind = TokenKind.BREAK;
                        else if (text == "class")
                            kind = TokenKind.CLASS;
                        else if (text == "const")
                            kind = TokenKind.CONST;
                        else if (text == "false")
                            kind = TokenKind.FALSE;
                        else if (text == "while")
                            kind = TokenKind.WHILE;
                    }
                    else if (length == 6) {
                        if (text == "export")
                            kind = TokenKind.EXPORT;
                        else if (text == "module")
                            kind = TokenKind.MODULE;
                        else if (text == "import")
                            kind = TokenKind.INTERNAL_IMPORT;
                        else if (text == "public")
                            kind = TokenKind.PUBLIC;
                        else if (text == "return")
                            kind = TokenKind.RETURN;
                        else if (text == "sizeof")
                            kind = TokenKind.SIZEOF;
                        else if (text == "static")
                            kind = TokenKind.STATIC;
                        else if (text == "unsafe")
                            kind = TokenKind.UNSAFE;
                        else if (text == "@start")
                            kind = TokenKind.START;
                        else if (text == "delete")
                            kind = TokenKind.DELETE;
                    }
                    else if (length == 7) {
                        if (text == "alignof")
                            kind = TokenKind.ALIGNOF;
                        else if (text == "declare")
                            kind = TokenKind.DECLARE;
                        else if (text == "extends")
                            kind = TokenKind.EXTENDS;
                        else if (text == "private")
                            kind = TokenKind.PRIVATE;
                        else if (text == "@import")
                            kind = TokenKind.EXTERNAL_IMPORT;
                        else if (text == "anyfunc")
                            kind = TokenKind.ANYFUNC;
                    }
                    else {
                        if (text == "continue")
                            kind = TokenKind.CONTINUE;
                        else if (text == "@virtual")
                            kind = TokenKind.VIRTUAL;
                        else if (text == "function")
                            kind = TokenKind.FUNCTION;
                        else if (text == "implements")
                            kind = TokenKind.IMPLEMENTS;
                        else if (text == "protected")
                            kind = TokenKind.PROTECTED;
                    }
                }
            }
            else if (isNumber(c)) {
                let isFloat = false;
                let isDouble = false;
                //kind = TokenKind.INT32;
                if (i < limit) {
                    var next = contents[i];
                    var base = 10;
                    // Handle binary, octal, and hexadecimal prefixes
                    if (c == '0' && i + 1 < limit) {
                        if (next == 'b' || next == 'B')
                            base = 2;
                        else if (next == 'o' || next == 'O')
                            base = 8;
                        else if (next == 'x' || next == 'X')
                            base = 16;
                        if (base != 10) {
                            if (isDigit(contents[i + 1], base))
                                i = i + 2;
                            else
                                base = 10;
                        }
                    }
                    let floatFound = false;
                    // Scan the payload
                    while (i < limit && (isDigit(contents[i], base) || (floatFound = contents[i] === "."))) {
                        i = i + 1;
                        if (floatFound) {
                            isFloat = true;
                        }
                    }
                    if (contents[i] === "d") {
                        kind = TokenKind.FLOAT64;
                        i = i + 1;
                    }
                    else {
                        kind = isFloat ? TokenKind.FLOAT32 : TokenKind.INT32;
                    }
                    // Extra letters after the end is an error
                    if (i < limit && (isAlpha(contents[i]) || isNumber(contents[i]))) {
                        i = i + 1;
                        while (i < limit && (isAlpha(contents[i]) || isNumber(contents[i]))) {
                            i = i + 1;
                        }
                        log.error(log_1.createRange(source, start, i), stringbuilder_1.StringBuilder_new()
                            .append(`Invalid ${isFloat ? "float" : "integer"} literal: '`)
                            .appendSlice(contents, start, i)
                            .appendChar('\'')
                            .finish());
                        return null;
                    }
                }
            }
            else if (c == '"' || c == '\'' || c == '`') {
                while (i < limit) {
                    var next = contents[i];
                    // Escape any character including newlines
                    if (i + 1 < limit && next == '\\') {
                        i = i + 2;
                    }
                    else if (next == '\n' && c != '`') {
                        break;
                    }
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
                    log.error(log_1.createRange(source, start, i), c == '\'' ? "Unterminated character literal" :
                        c == '`' ? "Unterminated template literal" :
                            "Unterminated string literal");
                    return null;
                }
            }
            else if (c == '%')
                kind = TokenKind.REMAINDER;
            else if (c == '(')
                kind = TokenKind.LEFT_PARENTHESIS;
            else if (c == ')')
                kind = TokenKind.RIGHT_PARENTHESIS;
            else if (c == ',')
                kind = TokenKind.COMMA;
            else if (c == '.')
                kind = TokenKind.DOT;
            else if (c == ':')
                kind = TokenKind.COLON;
            else if (c == ';')
                kind = TokenKind.SEMICOLON;
            else if (c == '?')
                kind = TokenKind.QUESTION_MARK;
            else if (c == '[')
                kind = TokenKind.LEFT_BRACKET;
            else if (c == ']')
                kind = TokenKind.RIGHT_BRACKET;
            else if (c == '^')
                kind = TokenKind.BITWISE_XOR;
            else if (c == '{')
                kind = TokenKind.LEFT_BRACE;
            else if (c == '}')
                kind = TokenKind.RIGHT_BRACE;
            else if (c == '~')
                kind = TokenKind.COMPLEMENT;
            else if (c == '*') {
                kind = TokenKind.MULTIPLY;
                if (i < limit && contents[i] == '*') {
                    kind = TokenKind.EXPONENT;
                    i = i + 1;
                }
            }
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
                        log.error(log_1.createRange(source, start, start + 2), "Unterminated multi-line comment");
                        return null;
                    }
                    continue;
                }
            }
            else if (c == '!') {
                kind = TokenKind.NOT;
                if (i < limit && contents[i] == '=') {
                    kind = TokenKind.NOT_EQUAL;
                    i = i + 1;
                    // Recover from !==
                    if (i < limit && contents[i] == '=') {
                        i = i + 1;
                        log.error(log_1.createRange(source, start, i), "Use '!=' instead of '!=='");
                    }
                }
            }
            else if (c == '=') {
                kind = TokenKind.ASSIGN;
                if (i < limit && contents[i] == '=') {
                    kind = TokenKind.EQUAL;
                    i = i + 1;
                    // Recover from ===
                    if (i < limit && contents[i] == '=') {
                        i = i + 1;
                        log.error(log_1.createRange(source, start, i), "Use '==' instead of '==='");
                    }
                }
            }
            else if (c == '+') {
                kind = TokenKind.PLUS;
                if (i < limit && contents[i] == '+') {
                    kind = TokenKind.PLUS_PLUS;
                    i = i + 1;
                }
            }
            else if (c == '-') {
                kind = TokenKind.MINUS;
                if (i < limit && contents[i] == '-') {
                    kind = TokenKind.MINUS_MINUS;
                    i = i + 1;
                }
            }
            else if (c == '&') {
                kind = TokenKind.BITWISE_AND;
                if (i < limit && contents[i] == '&') {
                    kind = TokenKind.LOGICAL_AND;
                    i = i + 1;
                }
            }
            else if (c == '|') {
                kind = TokenKind.BITWISE_OR;
                if (i < limit && contents[i] == '|') {
                    kind = TokenKind.LOGICAL_OR;
                    i = i + 1;
                }
            }
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
                if (text == "#define")
                    kind = TokenKind.PREPROCESSOR_DEFINE;
                else if (text == "#elif")
                    kind = TokenKind.PREPROCESSOR_ELIF;
                else if (text == "#else")
                    kind = TokenKind.PREPROCESSOR_ELSE;
                else if (text == "#endif")
                    kind = TokenKind.PREPROCESSOR_ENDIF;
                else if (text == "#error")
                    kind = TokenKind.PREPROCESSOR_ERROR;
                else if (text == "#if")
                    kind = TokenKind.PREPROCESSOR_IF;
                else if (text == "#undef")
                    kind = TokenKind.PREPROCESSOR_UNDEF;
                else if (text == "#warning")
                    kind = TokenKind.PREPROCESSOR_WARNING;
                else if (start == 0 && text == "#" && i < limit && contents[i] == '!') {
                    while (i < limit && contents[i] != '\n') {
                        i = i + 1;
                    }
                    continue;
                }
                else {
                    var builder = stringbuilder_1.StringBuilder_new().append("Invalid preprocessor token '").append(text).appendChar('\'');
                    // Check for #if typos
                    if (text == "#ifdef") {
                        builder.append(", did you mean '#if'?");
                        kind = TokenKind.PREPROCESSOR_IF;
                    }
                    else if (text == "#elsif" || text == "#elseif") {
                        builder.append(", did you mean '#elif'?");
                        kind = TokenKind.PREPROCESSOR_ELIF;
                    }
                    else if (text == "#end") {
                        builder.append(", did you mean '#endif'?");
                        kind = TokenKind.PREPROCESSOR_ENDIF;
                    }
                    log.error(log_1.createRange(source, start, i), builder.finish());
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
                        log.error(log_1.createRange(source, start, i), stringbuilder_1.StringBuilder_new()
                            .append("Expected newline before ")
                            .append(tokenToString(kind))
                            .finish());
                    }
                }
                needsPreprocessor = true;
                wantNewline = true;
            }
            var range = log_1.createRange(source, start, i);
            if (kind == TokenKind.END_OF_FILE) {
                log.error(range, stringbuilder_1.StringBuilder_new()
                    .append("Syntax error: '")
                    .appendSlice(contents, start, start + 1)
                    .appendChar('\'')
                    .finish());
                return null;
            }
            var token = new Token();
            token.kind = kind;
            token.range = range;
            if (first == null)
                first = token;
            else
                last.next = token;
            last = token;
        }
        var eof = new Token();
        eof.kind = TokenKind.END_OF_FILE;
        eof.range = log_1.createRange(source, limit, limit);
        if (first == null)
            first = eof;
        else
            last.next = eof;
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
    exports_2("tokenize", tokenize);
    var log_1, stringbuilder_1, TokenKind, Token;
    return {
        setters: [
            function (log_1_1) {
                log_1 = log_1_1;
            },
            function (stringbuilder_1_1) {
                stringbuilder_1 = stringbuilder_1_1;
            }
        ],
        execute: function () {
            /**
             * Author: Nidin Vinayakan
             */
            (function (TokenKind) {
                TokenKind[TokenKind["END_OF_FILE"] = 0] = "END_OF_FILE";
                // Literals
                TokenKind[TokenKind["CHARACTER"] = 1] = "CHARACTER";
                TokenKind[TokenKind["IDENTIFIER"] = 2] = "IDENTIFIER";
                TokenKind[TokenKind["INT32"] = 3] = "INT32";
                TokenKind[TokenKind["INT64"] = 4] = "INT64";
                TokenKind[TokenKind["FLOAT32"] = 5] = "FLOAT32";
                TokenKind[TokenKind["FLOAT64"] = 6] = "FLOAT64";
                TokenKind[TokenKind["STRING"] = 7] = "STRING";
                TokenKind[TokenKind["ARRAY"] = 8] = "ARRAY";
                // Punctuation
                TokenKind[TokenKind["ASSIGN"] = 9] = "ASSIGN";
                TokenKind[TokenKind["BITWISE_AND"] = 10] = "BITWISE_AND";
                TokenKind[TokenKind["BITWISE_OR"] = 11] = "BITWISE_OR";
                TokenKind[TokenKind["BITWISE_XOR"] = 12] = "BITWISE_XOR";
                TokenKind[TokenKind["COLON"] = 13] = "COLON";
                TokenKind[TokenKind["COMMA"] = 14] = "COMMA";
                TokenKind[TokenKind["COMPLEMENT"] = 15] = "COMPLEMENT";
                TokenKind[TokenKind["DIVIDE"] = 16] = "DIVIDE";
                TokenKind[TokenKind["DOT"] = 17] = "DOT";
                TokenKind[TokenKind["EQUAL"] = 18] = "EQUAL";
                TokenKind[TokenKind["EXPONENT"] = 19] = "EXPONENT";
                TokenKind[TokenKind["GREATER_THAN"] = 20] = "GREATER_THAN";
                TokenKind[TokenKind["GREATER_THAN_EQUAL"] = 21] = "GREATER_THAN_EQUAL";
                TokenKind[TokenKind["LEFT_BRACE"] = 22] = "LEFT_BRACE";
                TokenKind[TokenKind["LEFT_BRACKET"] = 23] = "LEFT_BRACKET";
                TokenKind[TokenKind["LEFT_PARENTHESIS"] = 24] = "LEFT_PARENTHESIS";
                TokenKind[TokenKind["LESS_THAN"] = 25] = "LESS_THAN";
                TokenKind[TokenKind["LESS_THAN_EQUAL"] = 26] = "LESS_THAN_EQUAL";
                TokenKind[TokenKind["LOGICAL_AND"] = 27] = "LOGICAL_AND";
                TokenKind[TokenKind["LOGICAL_OR"] = 28] = "LOGICAL_OR";
                TokenKind[TokenKind["MINUS"] = 29] = "MINUS";
                TokenKind[TokenKind["MINUS_MINUS"] = 30] = "MINUS_MINUS";
                TokenKind[TokenKind["MULTIPLY"] = 31] = "MULTIPLY";
                TokenKind[TokenKind["NOT"] = 32] = "NOT";
                TokenKind[TokenKind["NOT_EQUAL"] = 33] = "NOT_EQUAL";
                TokenKind[TokenKind["PLUS"] = 34] = "PLUS";
                TokenKind[TokenKind["PLUS_PLUS"] = 35] = "PLUS_PLUS";
                TokenKind[TokenKind["QUESTION_MARK"] = 36] = "QUESTION_MARK";
                TokenKind[TokenKind["REMAINDER"] = 37] = "REMAINDER";
                TokenKind[TokenKind["RIGHT_BRACE"] = 38] = "RIGHT_BRACE";
                TokenKind[TokenKind["RIGHT_BRACKET"] = 39] = "RIGHT_BRACKET";
                TokenKind[TokenKind["RIGHT_PARENTHESIS"] = 40] = "RIGHT_PARENTHESIS";
                TokenKind[TokenKind["SEMICOLON"] = 41] = "SEMICOLON";
                TokenKind[TokenKind["FROM"] = 42] = "FROM";
                TokenKind[TokenKind["SHIFT_LEFT"] = 43] = "SHIFT_LEFT";
                TokenKind[TokenKind["SHIFT_RIGHT"] = 44] = "SHIFT_RIGHT";
                // Keywords
                TokenKind[TokenKind["ALIGNOF"] = 45] = "ALIGNOF";
                TokenKind[TokenKind["AS"] = 46] = "AS";
                TokenKind[TokenKind["BREAK"] = 47] = "BREAK";
                TokenKind[TokenKind["MODULE"] = 48] = "MODULE";
                TokenKind[TokenKind["CLASS"] = 49] = "CLASS";
                TokenKind[TokenKind["CONST"] = 50] = "CONST";
                TokenKind[TokenKind["CONTINUE"] = 51] = "CONTINUE";
                TokenKind[TokenKind["DECLARE"] = 52] = "DECLARE";
                TokenKind[TokenKind["ELSE"] = 53] = "ELSE";
                TokenKind[TokenKind["ENUM"] = 54] = "ENUM";
                TokenKind[TokenKind["EXPORT"] = 55] = "EXPORT";
                TokenKind[TokenKind["EXTENDS"] = 56] = "EXTENDS";
                TokenKind[TokenKind["FALSE"] = 57] = "FALSE";
                TokenKind[TokenKind["FUNCTION"] = 58] = "FUNCTION";
                TokenKind[TokenKind["ANYFUNC"] = 59] = "ANYFUNC";
                TokenKind[TokenKind["IF"] = 60] = "IF";
                TokenKind[TokenKind["IMPLEMENTS"] = 61] = "IMPLEMENTS";
                TokenKind[TokenKind["INTERNAL_IMPORT"] = 62] = "INTERNAL_IMPORT";
                TokenKind[TokenKind["EXTERNAL_IMPORT"] = 63] = "EXTERNAL_IMPORT";
                TokenKind[TokenKind["LET"] = 64] = "LET";
                TokenKind[TokenKind["NEW"] = 65] = "NEW";
                TokenKind[TokenKind["DELETE"] = 66] = "DELETE";
                TokenKind[TokenKind["NULL"] = 67] = "NULL";
                TokenKind[TokenKind["UNDEFINED"] = 68] = "UNDEFINED";
                TokenKind[TokenKind["OPERATOR"] = 69] = "OPERATOR";
                TokenKind[TokenKind["PRIVATE"] = 70] = "PRIVATE";
                TokenKind[TokenKind["PROTECTED"] = 71] = "PROTECTED";
                TokenKind[TokenKind["PUBLIC"] = 72] = "PUBLIC";
                TokenKind[TokenKind["RETURN"] = 73] = "RETURN";
                TokenKind[TokenKind["SIZEOF"] = 74] = "SIZEOF";
                TokenKind[TokenKind["STATIC"] = 75] = "STATIC";
                TokenKind[TokenKind["THIS"] = 76] = "THIS";
                TokenKind[TokenKind["TRUE"] = 77] = "TRUE";
                TokenKind[TokenKind["UNSAFE"] = 78] = "UNSAFE";
                TokenKind[TokenKind["JAVASCRIPT"] = 79] = "JAVASCRIPT";
                TokenKind[TokenKind["START"] = 80] = "START";
                TokenKind[TokenKind["VIRTUAL"] = 81] = "VIRTUAL";
                TokenKind[TokenKind["VAR"] = 82] = "VAR";
                TokenKind[TokenKind["WHILE"] = 83] = "WHILE";
                // Preprocessor
                TokenKind[TokenKind["PREPROCESSOR_DEFINE"] = 84] = "PREPROCESSOR_DEFINE";
                TokenKind[TokenKind["PREPROCESSOR_ELIF"] = 85] = "PREPROCESSOR_ELIF";
                TokenKind[TokenKind["PREPROCESSOR_ELSE"] = 86] = "PREPROCESSOR_ELSE";
                TokenKind[TokenKind["PREPROCESSOR_ENDIF"] = 87] = "PREPROCESSOR_ENDIF";
                TokenKind[TokenKind["PREPROCESSOR_ERROR"] = 88] = "PREPROCESSOR_ERROR";
                TokenKind[TokenKind["PREPROCESSOR_IF"] = 89] = "PREPROCESSOR_IF";
                TokenKind[TokenKind["PREPROCESSOR_NEEDED"] = 90] = "PREPROCESSOR_NEEDED";
                TokenKind[TokenKind["PREPROCESSOR_NEWLINE"] = 91] = "PREPROCESSOR_NEWLINE";
                TokenKind[TokenKind["PREPROCESSOR_UNDEF"] = 92] = "PREPROCESSOR_UNDEF";
                TokenKind[TokenKind["PREPROCESSOR_WARNING"] = 93] = "PREPROCESSOR_WARNING";
            })(TokenKind || (TokenKind = {}));
            exports_2("TokenKind", TokenKind);
            Token = class Token {
            };
            exports_2("Token", Token);
        }
    };
});
System.register("bytearray", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    function ByteArray_set16(array, index, value) {
        array.set(index, value);
        array.set(index + 1, (value >> 8));
    }
    exports_3("ByteArray_set16", ByteArray_set16);
    function ByteArray_set32(array, index, value) {
        array.set(index, value);
        array.set(index + 1, (value >> 8));
        array.set(index + 2, (value >> 16));
        array.set(index + 3, (value >> 24));
    }
    exports_3("ByteArray_set32", ByteArray_set32);
    function ByteArray_append32(array, value) {
        array.append(value);
        array.append((value >> 8));
        array.append((value >> 16));
        array.append((value >> 24));
    }
    exports_3("ByteArray_append32", ByteArray_append32);
    //
    // export function ByteArray_append64(array: ByteArray, value: int64): void {
    //     array.append(value);
    //     array.append((value >> 8));
    //     array.append((value >> 16));
    //     array.append((value >> 24));
    //     array.append((value >> 32));
    //     array.append((value >> 40));
    //     array.append((value >> 48));
    //     array.append((value >> 56));
    // }
    //
    // declare function Uint8Array_new(length: number): Uint8Array;
    //
    function ByteArray_setString(data, index, text) {
        var length = text.length;
        assert(index >= 0 && index + length * 2 <= data.length);
        var array = data.array;
        var i = 0;
        while (i < length) {
            var c = text.charCodeAt(i);
            array[index] = c;
            array[index + 1] = (c >> 8);
            index = index + 2;
            i = i + 1;
        }
    }
    exports_3("ByteArray_setString", ByteArray_setString);
    var ByteArray;
    return {
        setters: [],
        execute: function () {
            /**
             * JavaScript ByteArray
             * version : 0.2
             * @author Nidin Vinayakan | nidinthb@gmail.com
             *
             * ActionScript3 ByteArray implementation in JavaScript
             * limitation : size of ByteArray cannot be changed
             *
             */
            ByteArray = class ByteArray {
                constructor(buffer, offset = 0, length = 0) {
                    this.BUFFER_EXT_SIZE = 1024; //Buffer expansion size
                    this._array = null;
                    this.log = "";
                    this.EOF_byte = -1;
                    this.EOF_code_point = -1;
                    if (buffer == undefined) {
                        buffer = new ArrayBuffer(this.BUFFER_EXT_SIZE);
                        this.write_position = 0;
                    }
                    else if (buffer == null) {
                        this.write_position = 0;
                    }
                    else {
                        this.write_position = length > 0 ? length : buffer.byteLength;
                    }
                    if (buffer) {
                        this.data = new DataView(buffer, offset, length > 0 ? length : buffer.byteLength);
                        this._array = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength);
                    }
                    this._position = 0;
                    this.endian = ByteArray.LITTLE_ENDIAN;
                }
                get array() {
                    return this._array.subarray(0, this.length);
                }
                ;
                get(index) {
                    // assert((index) < (this._length));
                    return this._array[index];
                }
                set(index, value) {
                    //assert((index) < (this._length));
                    this._array[index] = value;
                }
                append(value) {
                    let index = this.position;
                    this.resize(index + 1);
                    this._array[index] = value;
                    this.position++;
                }
                resize(length) {
                    if (length > this.data.byteLength) {
                        let pos = this.position;
                        let len = this.length;
                        let capacity = length * 2;
                        let data = new Uint8Array(capacity);
                        data.set(this.array);
                        this.setArray(data);
                        this._position = pos;
                        this.write_position = len;
                    }
                    return this;
                }
                copy(source, offset = 0, length = 0) {
                    offset = offset > 0 ? offset : this.length;
                    if (offset + source.length > this._array.length) {
                        this.resize(offset + source.length);
                    }
                    this._array.set(source.array, offset);
                    this.position = offset + source.length;
                    return this;
                }
                // getter setter
                get buffer() {
                    return this.data.buffer;
                }
                set buffer(value) {
                    this.data = new DataView(value);
                }
                get dataView() {
                    return this.data;
                }
                set dataView(value) {
                    this.data = value;
                    this.write_position = value.byteLength;
                }
                get phyPosition() {
                    return this._position + this.data.byteOffset;
                }
                get bufferOffset() {
                    return this.data.byteOffset;
                }
                get position() {
                    return this._position;
                }
                set position(value) {
                    if (this._position < value) {
                        if (!this.validate(this._position - value)) {
                            return;
                        }
                    }
                    this._position = value;
                    this.write_position = value > this.write_position ? value : this.write_position;
                }
                get length() {
                    return this.write_position;
                }
                set length(value) {
                    this.validateBuffer(value);
                }
                get bytesAvailable() {
                    return this.data.byteLength - this._position;
                }
                //end
                clear() {
                    this._position = 0;
                }
                setArray(array) {
                    this._array = array;
                    this.setBuffer(array.buffer, array.byteOffset, array.byteLength);
                }
                setBuffer(buffer, offset = 0, length = 0) {
                    if (buffer) {
                        this.data = new DataView(buffer, offset, length > 0 ? length : buffer.byteLength);
                    }
                    else {
                    }
                }
                /**
                 * Write unsigned Little Endian Base 128
                 */
                writeUnsignedLEB128(value) {
                    let b = 0;
                    value |= 0;
                    do {
                        b = value & 0x7F;
                        value >>>= 7;
                        if (value)
                            b |= 0x80;
                        this.append(b);
                    } while (value);
                }
                /**
                 * Write signed Little Endian Base 128
                 */
                writeLEB128(value) {
                    let b;
                    value |= 0;
                    do {
                        b = value & 0x7F;
                        value >>= 7;
                        let signBit = (b & 0x40) !== 0;
                        if (((value === 0) && !signBit) ||
                            ((value === -1) && signBit)) {
                            this.append(b);
                            break;
                        }
                        else {
                            b |= 0x80;
                            this.append(b);
                        }
                    } while (true);
                }
                /**
                 * Write WASM String
                 */
                writeWasmString(value) {
                    let length = value.length;
                    this.writeUnsignedLEB128(length);
                    let index = this.length;
                    this.resize(index + length);
                    let i = 0;
                    while (i < length) {
                        this.set(index + i, value.charCodeAt(i));
                        i = i + 1;
                    }
                    this.position = index + length;
                }
                /**
                 * Reads a Boolean value from the byte stream. A single byte is read,
                 * and true is returned if the byte is nonzero,
                 * false otherwise.
                 * @return    Returns true if the byte is nonzero, false otherwise.
                 */
                readBoolean() {
                    if (!this.validate(ByteArray.SIZE_OF_BOOLEAN))
                        return null;
                    return this.data.getUint8(this.position++) != 0;
                }
                /**
                 * Reads a signed byte from the byte stream.
                 * The returned value is in the range -128 to 127.
                 * @return    An integer between -128 and 127.
                 */
                readByte() {
                    if (!this.validate(ByteArray.SIZE_OF_INT8))
                        return null;
                    return this.data.getInt8(this.position++);
                }
                /**
                 * Reads the number of data bytes, specified by the length parameter, from the byte stream.
                 * The bytes are read into the ByteArray object specified by the bytes parameter,
                 * and the bytes are written into the destination ByteArray starting at the _position specified by offset.
                 * @param    bytes    The ByteArray object to read data into.
                 * @param    offset    The offset (_position) in bytes at which the read data should be written.
                 * @param    length    The number of bytes to read.  The default value of 0 causes all available data to be read.
                 */
                readBytes(_bytes = null, offset = 0, length = 0, createNewBuffer = false) {
                    if (length == 0) {
                        length = this.bytesAvailable;
                    }
                    else if (!this.validate(length))
                        return null;
                    if (createNewBuffer) {
                        _bytes = _bytes == null ? new ByteArray(new ArrayBuffer(length)) : _bytes;
                        //This method is expensive
                        for (var i = 0; i < length; i++) {
                            _bytes.data.setUint8(i + offset, this.data.getUint8(this.position++));
                        }
                    }
                    else {
                        //Offset argument ignored
                        _bytes = _bytes == null ? new ByteArray(null) : _bytes;
                        _bytes.dataView = new DataView(this.data.buffer, this.bufferOffset + this.position, length);
                        this.position += length;
                    }
                    return _bytes;
                }
                /**
                 * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
                 * @return    A double-precision (64-bit) floating-point number.
                 */
                readDouble() {
                    if (!this.validate(ByteArray.SIZE_OF_FLOAT64))
                        return null;
                    var value = this.data.getFloat64(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_FLOAT64;
                    return value;
                }
                /**
                 * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
                 * @return    A single-precision (32-bit) floating-point number.
                 */
                readFloat() {
                    if (!this.validate(ByteArray.SIZE_OF_FLOAT32))
                        return null;
                    var value = this.data.getFloat32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_FLOAT32;
                    return value;
                }
                /**
                 * Reads a signed 32-bit integer from the byte stream.
                 *
                 *   The returned value is in the range -2147483648 to 2147483647.
                 * @return    A 32-bit signed integer between -2147483648 and 2147483647.
                 */
                readInt() {
                    if (!this.validate(ByteArray.SIZE_OF_INT32))
                        return null;
                    var value = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_INT32;
                    return value;
                }
                /**
                 * Reads a signed 64-bit integer from the byte stream.
                 *
                 *   The returned value is in the range −(2^63) to 2^63 − 1
                 * @return    A 64-bit signed integer between −(2^63) to 2^63 − 1
                 */
                // public readInt64(): Int64 {
                //     if (!this.validate(ByteArray.SIZE_OF_UINT32)) return null;
                //
                //     var low = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                //     this.position += ByteArray.SIZE_OF_INT32;
                //     var high = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                //     this.position += ByteArray.SIZE_OF_INT32;
                //     return new Int64(low, high);
                // }
                /**
                 * Reads a multibyte string of specified length from the byte stream using the
                 * specified character set.
                 * @param    length    The number of bytes from the byte stream to read.
                 * @param    charSet    The string denoting the character set to use to interpret the bytes.
                 *   Possible character set strings include "shift-jis", "cn-gb",
                 *   "iso-8859-1", and others.
                 *   For a complete list, see Supported Character Sets.
                 *   Note: If the value for the charSet parameter
                 *   is not recognized by the current system, the application uses the system's default
                 *   code page as the character set. For example, a value for the charSet parameter,
                 *   as in myTest.readMultiByte(22, "iso-8859-01") that uses 01 instead of
                 *   1 might work on your development system, but not on another system.
                 *   On the other system, the application will use the system's default code page.
                 * @return    UTF-8 encoded string.
                 */
                readMultiByte(length, charSet) {
                    if (!this.validate(length))
                        return null;
                    return "";
                }
                /**
                 * Reads a signed 16-bit integer from the byte stream.
                 *
                 *   The returned value is in the range -32768 to 32767.
                 * @return    A 16-bit signed integer between -32768 and 32767.
                 */
                readShort() {
                    if (!this.validate(ByteArray.SIZE_OF_INT16))
                        return null;
                    var value = this.data.getInt16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_INT16;
                    return value;
                }
                /**
                 * Reads an unsigned byte from the byte stream.
                 *
                 *   The returned value is in the range 0 to 255.
                 * @return    A 32-bit unsigned integer between 0 and 255.
                 */
                readUnsignedByte() {
                    if (!this.validate(ByteArray.SIZE_OF_UINT8))
                        return null;
                    return this.data.getUint8(this.position++);
                }
                /**
                 * Reads an unsigned 32-bit integer from the byte stream.
                 *
                 *   The returned value is in the range 0 to 4294967295.
                 * @return    A 32-bit unsigned integer between 0 and 4294967295.
                 */
                readUnsignedInt() {
                    if (!this.validate(ByteArray.SIZE_OF_UINT32))
                        return null;
                    var value = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT32;
                    return value;
                }
                /**
                 * Reads a variable sized unsigned integer (VX -> 16-bit or 32-bit) from the byte stream.
                 *
                 *   A VX is written as a variable length 2- or 4-byte element. If the index value is less than 65,280 (0xFF00),
                 *   then the index is written as an unsigned two-byte integer. Otherwise the index is written as an unsigned
                 *   four byte integer with bits 24-31 set. When reading an index, if the first byte encountered is 255 (0xFF),
                 *   then the four-byte form is being used and the first byte should be discarded or masked out.
                 *
                 *   The returned value is in the range  0 to 65279 or 0 to 2147483647.
                 * @return    A VX 16-bit or 32-bit unsigned integer between 0 to 65279 or 0 and 2147483647.
                 */
                readVariableSizedUnsignedInt() {
                    var value;
                    var c = this.readUnsignedByte();
                    if (c != 0xFF) {
                        value = c << 8;
                        c = this.readUnsignedByte();
                        value |= c;
                    }
                    else {
                        c = this.readUnsignedByte();
                        value = c << 16;
                        c = this.readUnsignedByte();
                        value |= c << 8;
                        c = this.readUnsignedByte();
                        value |= c;
                    }
                    return value;
                }
                /**
                 * Fast read for WebGL since only Uint16 numbers are expected
                 */
                readU16VX() {
                    return (this.readUnsignedByte() << 8) | this.readUnsignedByte();
                }
                /**
                 * Reads an unsigned 64-bit integer from the byte stream.
                 *
                 *   The returned value is in the range 0 to 2^64 − 1.
                 * @return    A 64-bit unsigned integer between 0 and 2^64 − 1
                 */
                // public readUnsignedInt64(): UInt64 {
                //     if (!this.validate(ByteArray.SIZE_OF_UINT32)) return null;
                //
                //     var low = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                //     this.position += ByteArray.SIZE_OF_UINT32;
                //     var high = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                //     this.position += ByteArray.SIZE_OF_UINT32;
                //     return new UInt64(low, high);
                // }
                /**
                 * Reads an unsigned 16-bit integer from the byte stream.
                 *
                 *   The returned value is in the range 0 to 65535.
                 * @return    A 16-bit unsigned integer between 0 and 65535.
                 */
                readUnsignedShort() {
                    if (!this.validate(ByteArray.SIZE_OF_UINT16))
                        return null;
                    var value = this.data.getUint16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT16;
                    return value;
                }
                /**
                 * Reads a UTF-8 string from the byte stream.  The string
                 * is assumed to be prefixed with an unsigned int16 indicating
                 * the length in bytes.
                 * @return    UTF-8 encoded  string.
                 */
                readUTF() {
                    if (!this.validate(ByteArray.SIZE_OF_UINT16))
                        return null;
                    var length = this.data.getUint16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
                    this.position += ByteArray.SIZE_OF_UINT16;
                    if (length > 0) {
                        return this.readUTFBytes(length);
                    }
                    else {
                        return "";
                    }
                }
                /**
                 * Reads a sequence of UTF-8 bytes specified by the length
                 * parameter from the byte stream and returns a string.
                 * @param    length    An unsigned int16 indicating the length of the UTF-8 bytes.
                 * @return    A string composed of the UTF-8 bytes of the specified length.
                 */
                readUTFBytes(length) {
                    if (!this.validate(length))
                        return null;
                    var _bytes = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
                    this.position += length;
                    /*var _bytes: Uint8Array = new Uint8Array(new ArrayBuffer(length));
                     for (var i = 0; i < length; i++) {
                     _bytes[i] = this.data.getUint8(this.position++);
                     }*/
                    return this.decodeUTF8(_bytes);
                }
                readStandardString(length) {
                    if (!this.validate(length))
                        return null;
                    var str = "";
                    for (var i = 0; i < length; i++) {
                        str += String.fromCharCode(this.data.getUint8(this.position++));
                    }
                    return str;
                }
                readStringTillNull(keepEvenByte = true) {
                    var str = "";
                    var num = 0;
                    while (this.bytesAvailable > 0) {
                        var _byte = this.data.getUint8(this.position++);
                        num++;
                        if (_byte != 0) {
                            str += String.fromCharCode(_byte);
                        }
                        else {
                            if (keepEvenByte && num % 2 != 0) {
                                this.position++;
                            }
                            break;
                        }
                    }
                    return str;
                }
                /**
                 * Writes a Boolean value. A single byte is written according to the value parameter,
                 * either 1 if true or 0 if false.
                 * @param    value    A Boolean value determining which byte is written. If the parameter is true,
                 *           the method writes a 1; if false, the method writes a 0.
                 * @param    offset   optional start position to write
                 */
                writeBoolean(value, offset = null) {
                    offset = offset ? offset : this.position++;
                    this.validateBuffer(ByteArray.SIZE_OF_BOOLEAN, offset);
                    this.data.setUint8(offset, value ? 1 : 0);
                }
                /**
                 * Writes a byte to the byte stream.
                 * The low 8 bits of the
                 * parameter are used. The high 24 bits are ignored.
                 * @param    value    A 32-bit integer. The low 8 bits are written to the byte stream.
                 * @param    offset   optional start position to write
                 */
                writeByte(value, offset = null) {
                    offset = offset ? offset : this.position++;
                    this.validateBuffer(ByteArray.SIZE_OF_INT8, offset);
                    this.data.setInt8(offset, value);
                }
                writeUnsignedByte(value, offset = null) {
                    offset = offset ? offset : this.position++;
                    this.validateBuffer(ByteArray.SIZE_OF_UINT8, offset);
                    this.data.setUint8(offset, value);
                }
                /**
                 * Writes a sequence of length bytes from the
                 * specified byte array, bytes,
                 * starting offset(zero-based index) bytes
                 * into the byte stream.
                 *
                 *   If the length parameter is omitted, the default
                 * length of 0 is used; the method writes the entire buffer starting at
                 * offset.
                 * If the offset parameter is also omitted, the entire buffer is
                 * written. If offset or length
                 * is out of range, they are clamped to the beginning and end
                 * of the bytes array.
                 * @param    _bytes    The ByteArray object.
                 * @param    offset    A zero-based index indicating the _position into the array to begin writing.
                 * @param    length    An unsigned integer indicating how far into the buffer to write.
                 */
                writeBytes(_bytes, offset = 0, length = 0) {
                    this.copy(_bytes);
                    // this.validateBuffer(length);
                    // var tmp_data = new DataView(_bytes.buffer);
                    // for (var i = 0; i < _bytes.length; i++) {
                    //     this.data.setUint8(this.position++, tmp_data.getUint8(i));
                    // }
                }
                /**
                 * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
                 * @param    value    A double-precision (64-bit) floating-point number.
                 * @param    offset   optional start position to write
                 */
                writeDouble(value, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(ByteArray.SIZE_OF_FLOAT64, position);
                    this.data.setFloat64(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                    if (!offset) {
                        this.position += ByteArray.SIZE_OF_FLOAT64;
                    }
                }
                /**
                 * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
                 * @param    value    A single-precision (32-bit) floating-point number.
                 * @param    offset   optional start position to write
                 */
                writeFloat(value, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(ByteArray.SIZE_OF_FLOAT32, position);
                    this.data.setFloat32(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                    if (!offset) {
                        this.position += ByteArray.SIZE_OF_FLOAT32;
                    }
                }
                /**
                 * Writes a 32-bit signed integer to the byte stream.
                 * @param    value    An integer to write to the byte stream.
                 * @param    offset   optional start position to write
                 */
                writeInt(value, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(ByteArray.SIZE_OF_INT32, position);
                    this.data.setInt32(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                    if (!offset) {
                        this.position += ByteArray.SIZE_OF_INT32;
                    }
                }
                /**
                 * Writes a multibyte string to the byte stream using the specified character set.
                 * @param    value    The string value to be written.
                 * @param    charSet    The string denoting the character set to use. Possible character set strings
                 *   include "shift-jis", "cn-gb", "iso-8859-1", and others.
                 *   For a complete list, see Supported Character Sets.
                 */
                writeMultiByte(value, charSet) {
                }
                /**
                 * Writes a 16-bit integer to the byte stream. The low 16 bits of the parameter are used.
                 * The high 16 bits are ignored.
                 * @param    value    32-bit integer, whose low 16 bits are written to the byte stream.
                 * @param    offset   optional start position to write
                 */
                writeShort(value, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(ByteArray.SIZE_OF_INT16, position);
                    this.data.setInt16(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                    if (!offset) {
                        this.position += ByteArray.SIZE_OF_INT16;
                    }
                }
                writeUnsignedShort(value, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(ByteArray.SIZE_OF_UINT16, position);
                    this.data.setUint16(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                    if (!offset) {
                        this.position += ByteArray.SIZE_OF_UINT16;
                    }
                }
                /**
                 * Writes a 32-bit unsigned integer to the byte stream.
                 * @param    value    An unsigned integer to write to the byte stream.
                 * @param    offset   optional start position to write
                 */
                writeUnsignedInt(value, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(ByteArray.SIZE_OF_UINT32, position);
                    this.data.setUint32(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
                    if (!offset) {
                        this.position += ByteArray.SIZE_OF_UINT32;
                    }
                }
                /**
                 * Writes a UTF-8 string to the byte stream. The length of the UTF-8 string in bytes
                 * is written first, as a 16-bit integer, followed by the bytes representing the
                 * characters of the string.
                 * @param    value    The string value to be written.
                 * @param    offset   optional start position to write
                 */
                writeUTF(value, offset = null) {
                    let utf8bytes = this.encodeUTF8(value);
                    let length = utf8bytes.length;
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(ByteArray.SIZE_OF_UINT16 + length, position);
                    this.data.setUint16(position, length, this.endian === ByteArray.LITTLE_ENDIAN);
                    if (!offset) {
                        this.position += ByteArray.SIZE_OF_UINT16;
                        this.writeUint8Array(utf8bytes);
                    }
                    else {
                        offset += ByteArray.SIZE_OF_UINT16;
                        this.writeUint8Array(utf8bytes, offset);
                    }
                }
                /**
                 * Writes a UTF-8 string to the byte stream. Similar to the writeUTF() method,
                 * but writeUTFBytes() does not prefix the string with a 16-bit length word.
                 * @param    value    The string value to be written.
                 * @param    offset   optional start position to write
                 */
                writeUTFBytes(value, offset = null) {
                    this.writeUint8Array(this.encodeUTF8(value), offset);
                }
                toString() {
                    return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
                }
                /****************************/
                /* EXTRA JAVASCRIPT APIs    */
                /****************************/
                /**
                 * Writes a Uint8Array to the byte stream.
                 * @param    _bytes    The Uint8Array to be written.
                 * @param    offset   optional start position to write
                 */
                writeUint8Array(_bytes, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(_bytes.length, position);
                    this._array.set(_bytes, position);
                    if (!offset) {
                        this.position += _bytes.length;
                    }
                    return this;
                }
                /**
                 * Writes a Uint16Array to the byte stream.
                 * @param    _bytes    The Uint16Array to be written.
                 * @param    offset   optional start position to write
                 */
                writeUint16Array(_bytes, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(_bytes.length * ByteArray.SIZE_OF_UINT16, position);
                    for (let i = 0; i < _bytes.length; i++) {
                        this.data.setUint16(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                        position += ByteArray.SIZE_OF_UINT16;
                    }
                    if (!offset) {
                        this.position = position;
                    }
                }
                /**
                 * Writes a Uint32Array to the byte stream.
                 * @param    _bytes    The Uint32Array to be written.
                 * @param    offset   optional start position to write
                 */
                writeUint32Array(_bytes, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(_bytes.length * ByteArray.SIZE_OF_UINT32, position);
                    for (let i = 0; i < _bytes.length; i++) {
                        this.data.setUint32(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                        position += ByteArray.SIZE_OF_UINT32;
                    }
                    if (!offset) {
                        this.position = position;
                    }
                }
                /**
                 * Writes a Int8Array to the byte stream.
                 * @param    _bytes    The Int8Array to be written.
                 * @param    offset   optional start position to write
                 */
                writeInt8Array(_bytes, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(_bytes.length, position);
                    for (let i = 0; i < _bytes.length; i++) {
                        this.data.setInt8(position++, _bytes[i]);
                    }
                    if (!offset) {
                        this.position = position;
                    }
                }
                /**
                 * Writes a Int16Array to the byte stream.
                 * @param    _bytes    The Int16Array to be written.
                 * @param    offset   optional start position to write
                 */
                writeInt16Array(_bytes, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(_bytes.length * ByteArray.SIZE_OF_INT16, position);
                    for (let i = 0; i < _bytes.length; i++) {
                        this.data.setInt16(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                        position += ByteArray.SIZE_OF_INT16;
                    }
                    if (!offset) {
                        this.position = position;
                    }
                }
                /**
                 * Writes a Int32Array to the byte stream.
                 * @param    _bytes    The Int32Array to be written.
                 * @param    offset   optional start position to write
                 */
                writeInt32Array(_bytes, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(_bytes.length * ByteArray.SIZE_OF_INT32, position);
                    for (let i = 0; i < _bytes.length; i++) {
                        this.data.setInt32(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                        position += ByteArray.SIZE_OF_INT32;
                    }
                    if (!offset) {
                        this.position = position;
                    }
                }
                /**
                 * Writes a Float32Array to the byte stream.
                 * @param    _bytes    The Float32Array to be written.
                 * @param    offset   optional start position to write
                 */
                writeFloat32Array(_bytes, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(_bytes.length * ByteArray.SIZE_OF_FLOAT32, position);
                    for (let i = 0; i < _bytes.length; i++) {
                        this.data.setFloat32(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                        position += ByteArray.SIZE_OF_FLOAT32;
                    }
                    if (!offset) {
                        this.position = position;
                    }
                }
                /**
                 * Writes a Float64Array to the byte stream.
                 * @param    _bytes    The Float64Array to be written.
                 * @param    offset   optional start position to write
                 */
                writeFloat64Array(_bytes, offset = null) {
                    let position = offset != null ? offset : this.position;
                    this.validateBuffer(_bytes.length, position);
                    for (let i = 0; i < _bytes.length; i++) {
                        this.data.setFloat64(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
                        position += ByteArray.SIZE_OF_FLOAT64;
                    }
                    if (!offset) {
                        this.position = position;
                    }
                }
                /**
                 * Read a Uint8Array from the byte stream.
                 * @param    length An unsigned int16 indicating the length of the Uint8Array.
                 */
                readUint8Array(length, createNewBuffer = true) {
                    if (!this.validate(length))
                        return null;
                    if (!createNewBuffer) {
                        var result = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
                        this.position += length;
                    }
                    else {
                        result = new Uint8Array(new ArrayBuffer(length));
                        for (var i = 0; i < length; i++) {
                            result[i] = this.data.getUint8(this.position);
                            this.position += ByteArray.SIZE_OF_UINT8;
                        }
                    }
                    return result;
                }
                /**
                 * Read a Uint16Array from the byte stream.
                 * @param    length An unsigned int16 indicating the length of the Uint16Array.
                 */
                readUint16Array(length, createNewBuffer = true) {
                    var size = length * ByteArray.SIZE_OF_UINT16;
                    if (!this.validate(size))
                        return null;
                    if (!createNewBuffer) {
                        var result = new Uint16Array(this.buffer, this.bufferOffset + this.position, length);
                        this.position += size;
                    }
                    else {
                        result = new Uint16Array(new ArrayBuffer(size));
                        for (var i = 0; i < length; i++) {
                            result[i] = this.data.getUint16(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                            this.position += ByteArray.SIZE_OF_UINT16;
                        }
                    }
                    return result;
                }
                /**
                 * Read a Uint32Array from the byte stream.
                 * @param    length An unsigned int16 indicating the length of the Uint32Array.
                 */
                readUint32Array(length, createNewBuffer = true) {
                    var size = length * ByteArray.SIZE_OF_UINT32;
                    if (!this.validate(size))
                        return null;
                    if (!createNewBuffer) {
                        var result = new Uint32Array(this.buffer, this.bufferOffset + this.position, length);
                        this.position += size;
                    }
                    else {
                        result = new Uint32Array(new ArrayBuffer(size));
                        for (var i = 0; i < length; i++) {
                            result[i] = this.data.getUint32(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                            this.position += ByteArray.SIZE_OF_UINT32;
                        }
                    }
                    return result;
                }
                /**
                 * Read a Int8Array from the byte stream.
                 * @param    length An unsigned int16 indicating the length of the Int8Array.
                 */
                readInt8Array(length, createNewBuffer = true) {
                    if (!this.validate(length))
                        return null;
                    if (!createNewBuffer) {
                        var result = new Int8Array(this.buffer, this.bufferOffset + this.position, length);
                        this.position += length;
                    }
                    else {
                        result = new Int8Array(new ArrayBuffer(length));
                        for (var i = 0; i < length; i++) {
                            result[i] = this.data.getInt8(this.position);
                            this.position += ByteArray.SIZE_OF_INT8;
                        }
                    }
                    return result;
                }
                /**
                 * Read a Int16Array from the byte stream.
                 * @param    length An unsigned int16 indicating the length of the Int16Array.
                 */
                readInt16Array(length, createNewBuffer = true) {
                    var size = length * ByteArray.SIZE_OF_INT16;
                    if (!this.validate(size))
                        return null;
                    if (!createNewBuffer) {
                        var result = new Int16Array(this.buffer, this.bufferOffset + this.position, length);
                        this.position += size;
                    }
                    else {
                        result = new Int16Array(new ArrayBuffer(size));
                        for (var i = 0; i < length; i++) {
                            result[i] = this.data.getInt16(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                            this.position += ByteArray.SIZE_OF_INT16;
                        }
                    }
                    return result;
                }
                /**
                 * Read a Int32Array from the byte stream.
                 * @param    length An unsigned int16 indicating the length of the Int32Array.
                 */
                readInt32Array(length, createNewBuffer = true) {
                    var size = length * ByteArray.SIZE_OF_INT32;
                    if (!this.validate(size))
                        return null;
                    if (!createNewBuffer) {
                        if ((this.bufferOffset + this.position) % 4 == 0) {
                            var result = new Int32Array(this.buffer, this.bufferOffset + this.position, length);
                            this.position += size;
                        }
                        else {
                            var tmp = new Uint8Array(new ArrayBuffer(size));
                            for (var i = 0; i < size; i++) {
                                tmp[i] = this.data.getUint8(this.position);
                                this.position += ByteArray.SIZE_OF_UINT8;
                            }
                            result = new Int32Array(tmp.buffer);
                        }
                    }
                    else {
                        result = new Int32Array(new ArrayBuffer(size));
                        for (var i = 0; i < length; i++) {
                            result[i] = this.data.getInt32(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                            this.position += ByteArray.SIZE_OF_INT32;
                        }
                    }
                    return result;
                }
                /**
                 * Read a Float32Array from the byte stream.
                 * @param    length An unsigned int16 indicating the length of the Float32Array.
                 */
                readFloat32Array(length, createNewBuffer = true) {
                    var size = length * ByteArray.SIZE_OF_FLOAT32;
                    if (!this.validate(size))
                        return null;
                    if (!createNewBuffer) {
                        if ((this.bufferOffset + this.position) % 4 == 0) {
                            var result = new Float32Array(this.buffer, this.bufferOffset + this.position, length);
                            this.position += size;
                        }
                        else {
                            var tmp = new Uint8Array(new ArrayBuffer(size));
                            for (var i = 0; i < size; i++) {
                                tmp[i] = this.data.getUint8(this.position);
                                this.position += ByteArray.SIZE_OF_UINT8;
                            }
                            result = new Float32Array(tmp.buffer);
                        }
                    }
                    else {
                        result = new Float32Array(new ArrayBuffer(size));
                        for (var i = 0; i < length; i++) {
                            result[i] = this.data.getFloat32(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                            this.position += ByteArray.SIZE_OF_FLOAT32;
                        }
                    }
                    return result;
                }
                /**
                 * Read a Float64Array from the byte stream.
                 * @param    length An unsigned int16 indicating the length of the Float64Array.
                 */
                readFloat64Array(length, createNewBuffer = true) {
                    var size = length * ByteArray.SIZE_OF_FLOAT64;
                    if (!this.validate(size))
                        return null;
                    if (!createNewBuffer) {
                        var result = new Float64Array(this.buffer, this.position, length);
                        this.position += size;
                    }
                    else {
                        result = new Float64Array(new ArrayBuffer(size));
                        for (var i = 0; i < length; i++) {
                            result[i] = this.data.getFloat64(this.position, this.endian === ByteArray.LITTLE_ENDIAN);
                            this.position += ByteArray.SIZE_OF_FLOAT64;
                        }
                    }
                    return result;
                }
                validate(len) {
                    //len += this.data.byteOffset;
                    if (this.data.byteLength > 0 && this._position + len <= this.data.byteLength) {
                        return true;
                    }
                    else {
                        throw 'Error #2030: End of file was encountered.';
                    }
                }
                /**********************/
                /*  PRIVATE METHODS   */
                /**********************/
                validateBuffer(size, offset = 0) {
                    let length = offset + size;
                    this.resize(length);
                }
                /**
                 * UTF-8 Encoding/Decoding
                 */
                encodeUTF8(str) {
                    var pos = 0;
                    var codePoints = this.stringToCodePoints(str);
                    var outputBytes = [];
                    while (codePoints.length > pos) {
                        var code_point = codePoints[pos++];
                        if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                            this.encoderError(code_point);
                        }
                        else if (this.inRange(code_point, 0x0000, 0x007f)) {
                            outputBytes.push(code_point);
                        }
                        else {
                            var count, offset;
                            if (this.inRange(code_point, 0x0080, 0x07FF)) {
                                count = 1;
                                offset = 0xC0;
                            }
                            else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                                count = 2;
                                offset = 0xE0;
                            }
                            else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                                count = 3;
                                offset = 0xF0;
                            }
                            outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                            while (count > 0) {
                                var temp = this.div(code_point, Math.pow(64, count - 1));
                                outputBytes.push(0x80 + (temp % 64));
                                count -= 1;
                            }
                        }
                    }
                    return new Uint8Array(outputBytes);
                }
                decodeUTF8(data) {
                    var fatal = false;
                    var pos = 0;
                    var result = "";
                    var code_point;
                    var utf8_code_point = 0;
                    var utf8_bytes_needed = 0;
                    var utf8_bytes_seen = 0;
                    var utf8_lower_boundary = 0;
                    while (data.length > pos) {
                        var _byte = data[pos++];
                        if (_byte === this.EOF_byte) {
                            if (utf8_bytes_needed !== 0) {
                                code_point = this.decoderError(fatal);
                            }
                            else {
                                code_point = this.EOF_code_point;
                            }
                        }
                        else {
                            if (utf8_bytes_needed === 0) {
                                if (this.inRange(_byte, 0x00, 0x7F)) {
                                    code_point = _byte;
                                }
                                else {
                                    if (this.inRange(_byte, 0xC2, 0xDF)) {
                                        utf8_bytes_needed = 1;
                                        utf8_lower_boundary = 0x80;
                                        utf8_code_point = _byte - 0xC0;
                                    }
                                    else if (this.inRange(_byte, 0xE0, 0xEF)) {
                                        utf8_bytes_needed = 2;
                                        utf8_lower_boundary = 0x800;
                                        utf8_code_point = _byte - 0xE0;
                                    }
                                    else if (this.inRange(_byte, 0xF0, 0xF4)) {
                                        utf8_bytes_needed = 3;
                                        utf8_lower_boundary = 0x10000;
                                        utf8_code_point = _byte - 0xF0;
                                    }
                                    else {
                                        this.decoderError(fatal);
                                    }
                                    utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                                    code_point = null;
                                }
                            }
                            else if (!this.inRange(_byte, 0x80, 0xBF)) {
                                utf8_code_point = 0;
                                utf8_bytes_needed = 0;
                                utf8_bytes_seen = 0;
                                utf8_lower_boundary = 0;
                                pos--;
                                code_point = this.decoderError(fatal, _byte);
                            }
                            else {
                                utf8_bytes_seen += 1;
                                utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                                if (utf8_bytes_seen !== utf8_bytes_needed) {
                                    code_point = null;
                                }
                                else {
                                    var cp = utf8_code_point;
                                    var lower_boundary = utf8_lower_boundary;
                                    utf8_code_point = 0;
                                    utf8_bytes_needed = 0;
                                    utf8_bytes_seen = 0;
                                    utf8_lower_boundary = 0;
                                    if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                                        code_point = cp;
                                    }
                                    else {
                                        code_point = this.decoderError(fatal, _byte);
                                    }
                                }
                            }
                        }
                        //Decode string
                        if (code_point !== null && code_point !== this.EOF_code_point) {
                            if (code_point <= 0xFFFF) {
                                if (code_point > 0)
                                    result += String.fromCharCode(code_point);
                            }
                            else {
                                code_point -= 0x10000;
                                result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                                result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                            }
                        }
                    }
                    return result;
                }
                encoderError(code_point) {
                    throw 'EncodingError! The code point ' + code_point + ' could not be encoded.';
                }
                decoderError(fatal, opt_code_point) {
                    if (fatal) {
                        throw 'DecodingError';
                    }
                    return opt_code_point || 0xFFFD;
                }
                inRange(a, min, max) {
                    return min <= a && a <= max;
                }
                div(n, d) {
                    return Math.floor(n / d);
                }
                stringToCodePoints(string) {
                    /** @type {Array.<number>} */
                    var cps = [];
                    // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
                    var i = 0, n = string.length;
                    while (i < string.length) {
                        var c = string.charCodeAt(i);
                        if (!this.inRange(c, 0xD800, 0xDFFF)) {
                            cps.push(c);
                        }
                        else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                            cps.push(0xFFFD);
                        }
                        else {
                            if (i === n - 1) {
                                cps.push(0xFFFD);
                            }
                            else {
                                var d = string.charCodeAt(i + 1);
                                if (this.inRange(d, 0xDC00, 0xDFFF)) {
                                    var a = c & 0x3FF;
                                    var b = d & 0x3FF;
                                    i += 1;
                                    cps.push(0x10000 + (a << 10) + b);
                                }
                                else {
                                    cps.push(0xFFFD);
                                }
                            }
                        }
                        i += 1;
                    }
                    return cps;
                }
            };
            ByteArray.BIG_ENDIAN = "bigEndian";
            ByteArray.LITTLE_ENDIAN = "littleEndian";
            ByteArray.SIZE_OF_BOOLEAN = 1;
            ByteArray.SIZE_OF_INT8 = 1;
            ByteArray.SIZE_OF_INT16 = 2;
            ByteArray.SIZE_OF_INT32 = 4;
            ByteArray.SIZE_OF_INT64 = 8;
            ByteArray.SIZE_OF_UINT8 = 1;
            ByteArray.SIZE_OF_UINT16 = 2;
            ByteArray.SIZE_OF_UINT32 = 4;
            ByteArray.SIZE_OF_UINT64 = 8;
            ByteArray.SIZE_OF_FLOAT32 = 4;
            ByteArray.SIZE_OF_FLOAT64 = 8;
            exports_3("ByteArray", ByteArray);
        }
    };
});
System.register("parser", ["lexer", "log", "stringbuilder", "node"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    function isRightAssociative(precedence) {
        return precedence == Precedence.ASSIGN || precedence == Precedence.EXPONENT;
    }
    function parse(firstToken, log) {
        let context = new ParserContext();
        context.current = firstToken;
        context.log = log;
        let file = new node_1.Node();
        file.kind = node_1.NodeKind.FILE;
        if (!context.parseStatements(file)) {
            return null;
        }
        return file;
    }
    exports_4("parse", parse);
    var lexer_1, log_2, stringbuilder_2, node_1, Precedence, ParseKind, StatementMode, ParserContext;
    return {
        setters: [
            function (lexer_1_1) {
                lexer_1 = lexer_1_1;
            },
            function (log_2_1) {
                log_2 = log_2_1;
            },
            function (stringbuilder_2_1) {
                stringbuilder_2 = stringbuilder_2_1;
            },
            function (node_1_1) {
                node_1 = node_1_1;
            }
        ],
        execute: function () {
            (function (Precedence) {
                Precedence[Precedence["LOWEST"] = 0] = "LOWEST";
                Precedence[Precedence["ASSIGN"] = 1] = "ASSIGN";
                Precedence[Precedence["LOGICAL_OR"] = 2] = "LOGICAL_OR";
                Precedence[Precedence["LOGICAL_AND"] = 3] = "LOGICAL_AND";
                Precedence[Precedence["BITWISE_OR"] = 4] = "BITWISE_OR";
                Precedence[Precedence["BITWISE_XOR"] = 5] = "BITWISE_XOR";
                Precedence[Precedence["BITWISE_AND"] = 6] = "BITWISE_AND";
                Precedence[Precedence["EQUAL"] = 7] = "EQUAL";
                Precedence[Precedence["COMPARE"] = 8] = "COMPARE";
                Precedence[Precedence["SHIFT"] = 9] = "SHIFT";
                Precedence[Precedence["ADD"] = 10] = "ADD";
                Precedence[Precedence["MULTIPLY"] = 11] = "MULTIPLY";
                Precedence[Precedence["EXPONENT"] = 12] = "EXPONENT";
                Precedence[Precedence["UNARY_PREFIX"] = 13] = "UNARY_PREFIX";
                Precedence[Precedence["UNARY_POSTFIX"] = 14] = "UNARY_POSTFIX";
                Precedence[Precedence["MEMBER"] = 15] = "MEMBER";
            })(Precedence || (Precedence = {}));
            exports_4("Precedence", Precedence);
            (function (ParseKind) {
                ParseKind[ParseKind["EXPRESSION"] = 0] = "EXPRESSION";
                ParseKind[ParseKind["TYPE"] = 1] = "TYPE";
            })(ParseKind || (ParseKind = {}));
            (function (StatementMode) {
                StatementMode[StatementMode["NORMAL"] = 0] = "NORMAL";
                StatementMode[StatementMode["FILE"] = 1] = "FILE";
            })(StatementMode || (StatementMode = {}));
            ParserContext = class ParserContext {
                peek(kind) {
                    return this.current.kind == kind;
                }
                eat(kind) {
                    if (this.peek(kind)) {
                        this.advance();
                        return true;
                    }
                    return false;
                }
                advance() {
                    if (!this.peek(lexer_1.TokenKind.END_OF_FILE)) {
                        this.previous = this.current;
                        this.current = this.current.next;
                    }
                }
                unexpectedToken() {
                    if (this.lastError != this.current) {
                        this.lastError = this.current;
                        this.log.error(this.current.range, stringbuilder_2.StringBuilder_new()
                            .append("Unexpected ")
                            .append(lexer_1.tokenToString(this.current.kind))
                            .finish());
                    }
                }
                expect(kind) {
                    if (!this.peek(kind)) {
                        if (this.lastError != this.current) {
                            this.lastError = this.current;
                            let previousLine = this.previous.range.enclosingLine();
                            let currentLine = this.current.range.enclosingLine();
                            // Show missing token errors on the previous line for clarity
                            if (kind != lexer_1.TokenKind.IDENTIFIER && !previousLine.equals(currentLine)) {
                                this.log.error(previousLine.rangeAtEnd(), stringbuilder_2.StringBuilder_new()
                                    .append("Expected ")
                                    .append(lexer_1.tokenToString(kind))
                                    .finish());
                            }
                            else {
                                this.log.error(this.current.range, stringbuilder_2.StringBuilder_new()
                                    .append("Expected ")
                                    .append(lexer_1.tokenToString(kind))
                                    .append(" but found ")
                                    .append(lexer_1.tokenToString(this.current.kind))
                                    .finish());
                            }
                        }
                        return false;
                    }
                    this.advance();
                    return true;
                }
                parseUnaryPrefix(kind, mode) {
                    assert(node_1.isUnary(kind));
                    let token = this.current;
                    this.advance();
                    let value = this.parseExpression(Precedence.UNARY_PREFIX, mode);
                    if (value == null) {
                        return null;
                    }
                    return node_1.createUnary(kind, value).withRange(log_2.spanRanges(token.range, value.range)).withInternalRange(token.range);
                }
                parseBinary(kind, left, localPrecedence, operatorPrecedence) {
                    if (localPrecedence >= operatorPrecedence) {
                        return left;
                    }
                    let token = this.current;
                    this.advance();
                    // Reduce the precedence for right-associative operators
                    let precedence = isRightAssociative(operatorPrecedence) ? (operatorPrecedence - 1) : operatorPrecedence;
                    let right = this.parseExpression(precedence, ParseKind.EXPRESSION);
                    if (right == null) {
                        return null;
                    }
                    return node_1.createBinary(kind, left, right).withRange(log_2.spanRanges(left.range, right.range)).withInternalRange(token.range);
                }
                parseUnaryPostfix(kind, value, localPrecedence) {
                    if (localPrecedence >= Precedence.UNARY_POSTFIX) {
                        return value;
                    }
                    let token = this.current;
                    this.advance();
                    return node_1.createUnary(kind, value).withRange(log_2.spanRanges(value.range, token.range)).withInternalRange(token.range);
                }
                parseQuotedString(range) {
                    assert(range.end - range.start >= 2);
                    let text = range.source.contents;
                    let end = range.start + 1;
                    let limit = range.end - 1;
                    let start = end;
                    let builder = stringbuilder_2.StringBuilder_new();
                    while (end < limit) {
                        let c = text[end];
                        if (c == '\\') {
                            builder.appendSlice(text, start, end);
                            end = end + 1;
                            start = end + 1;
                            c = text[end];
                            if (c == '0')
                                builder.appendChar('\0');
                            else if (c == 't')
                                builder.appendChar('\t');
                            else if (c == 'n')
                                builder.appendChar('\n');
                            else if (c == 'r')
                                builder.appendChar('\r');
                            else if (c == '"' || c == '\'' || c == '`' || c == '\n' || c == '\\')
                                start = end;
                            else {
                                let escape = log_2.createRange(range.source, range.start + end - 1, range.start + end + 1);
                                this.log.error(escape, stringbuilder_2.StringBuilder_new()
                                    .append("Invalid escape code '")
                                    .append(escape.toString())
                                    .appendChar('\'')
                                    .finish());
                                return null;
                            }
                        }
                        end = end + 1;
                    }
                    return builder.appendSlice(text, start, end).finish();
                }
                parsePrefix(mode) {
                    let token = this.current;
                    if (this.peek(lexer_1.TokenKind.IDENTIFIER)) {
                        this.advance();
                        return node_1.createName(token.range.toString()).withRange(token.range);
                    }
                    // if (this.peek(TokenKind.ARRAY)) {
                    //     this.advance();
                    //     return createArray(token.range.toString()).withRange(token.range);
                    // }
                    if (this.peek(lexer_1.TokenKind.EXPONENT)) {
                        lexer_1.splitToken(this.current, lexer_1.TokenKind.MULTIPLY, lexer_1.TokenKind.MULTIPLY);
                    }
                    if (this.peek(lexer_1.TokenKind.MULTIPLY)) {
                        return this.parseUnaryPrefix(mode == ParseKind.TYPE ? node_1.NodeKind.POINTER_TYPE : node_1.NodeKind.DEREFERENCE, mode);
                    }
                    if (mode == ParseKind.EXPRESSION) {
                        if (this.eat(lexer_1.TokenKind.NULL)) {
                            return node_1.createNull().withRange(token.range);
                        }
                        if (this.eat(lexer_1.TokenKind.UNDEFINED)) {
                            return node_1.createUndefined().withRange(token.range);
                        }
                        if (this.eat(lexer_1.TokenKind.THIS)) {
                            return node_1.createThis().withRange(token.range);
                        }
                        if (this.peek(lexer_1.TokenKind.CHARACTER)) {
                            let text = this.parseQuotedString(token.range);
                            if (text == null) {
                                return null;
                            }
                            this.advance();
                            if (text.length != 1) {
                                this.log.error(token.range, "Invalid character literal (strings use double quotes)");
                                return node_1.createParseError().withRange(token.range);
                            }
                            return node_1.createInt(text.charCodeAt(0)).withRange(token.range);
                        }
                        if (this.peek(lexer_1.TokenKind.STRING)) {
                            let text = this.parseQuotedString(token.range);
                            if (text == null) {
                                return null;
                            }
                            this.advance();
                            return node_1.createString(text).withRange(token.range);
                        }
                        if (this.peek(lexer_1.TokenKind.INT32)) {
                            let value = node_1.createInt(0);
                            if (!this.parseInt(token.range, value)) {
                                value = node_1.createParseError();
                            }
                            this.advance();
                            return value.withRange(token.range);
                        }
                        if (this.peek(lexer_1.TokenKind.FLOAT32)) {
                            let value = node_1.createFloat(0);
                            if (!this.parseFloat(token.range, value)) {
                                value = node_1.createParseError();
                            }
                            this.advance();
                            return value.withRange(token.range);
                        }
                        if (this.peek(lexer_1.TokenKind.FLOAT64)) {
                            let value = node_1.createDouble(0);
                            if (!this.parseDouble(token.range, value)) {
                                value = node_1.createParseError();
                            }
                            this.advance();
                            return value.withRange(token.range);
                        }
                        if (this.eat(lexer_1.TokenKind.TRUE)) {
                            return node_1.createboolean(true).withRange(token.range);
                        }
                        if (this.eat(lexer_1.TokenKind.FALSE)) {
                            return node_1.createboolean(false).withRange(token.range);
                        }
                        if (this.eat(lexer_1.TokenKind.NEW)) {
                            let type = this.parseType();
                            if (type == null) {
                                return null;
                            }
                            if (this.peek(lexer_1.TokenKind.LESS_THAN)) {
                                let parameters = this.parseParameters();
                                if (parameters == null) {
                                    return null;
                                }
                                type.appendChild(parameters);
                            }
                            return this.parseArgumentList(token.range, node_1.createNew(type));
                        }
                        if (this.eat(lexer_1.TokenKind.ALIGNOF)) {
                            if (!this.expect(lexer_1.TokenKind.LEFT_PARENTHESIS)) {
                                return null;
                            }
                            let type = this.parseType();
                            let close = this.current;
                            if (type == null || !this.expect(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                                return null;
                            }
                            return node_1.createAlignOf(type).withRange(log_2.spanRanges(token.range, close.range));
                        }
                        if (this.eat(lexer_1.TokenKind.SIZEOF)) {
                            if (!this.expect(lexer_1.TokenKind.LEFT_PARENTHESIS)) {
                                return null;
                            }
                            let type = this.parseType();
                            let close = this.current;
                            if (type == null || !this.expect(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                                return null;
                            }
                            return node_1.createSizeOf(type).withRange(log_2.spanRanges(token.range, close.range));
                        }
                        if (this.eat(lexer_1.TokenKind.LEFT_PARENTHESIS)) {
                            let value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                            let close = this.current;
                            if (value == null || !this.expect(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                                return null;
                            }
                            return value.withRange(log_2.spanRanges(token.range, close.range));
                        }
                        // Unary prefix
                        if (this.peek(lexer_1.TokenKind.BITWISE_AND))
                            return this.parseUnaryPrefix(node_1.NodeKind.ADDRESS_OF, ParseKind.EXPRESSION);
                        if (this.peek(lexer_1.TokenKind.COMPLEMENT))
                            return this.parseUnaryPrefix(node_1.NodeKind.COMPLEMENT, ParseKind.EXPRESSION);
                        if (this.peek(lexer_1.TokenKind.MINUS))
                            return this.parseUnaryPrefix(node_1.NodeKind.NEGATIVE, ParseKind.EXPRESSION);
                        if (this.peek(lexer_1.TokenKind.MINUS_MINUS))
                            return this.parseUnaryPrefix(node_1.NodeKind.PREFIX_DECREMENT, ParseKind.EXPRESSION);
                        if (this.peek(lexer_1.TokenKind.NOT))
                            return this.parseUnaryPrefix(node_1.NodeKind.NOT, ParseKind.EXPRESSION);
                        if (this.peek(lexer_1.TokenKind.PLUS))
                            return this.parseUnaryPrefix(node_1.NodeKind.POSITIVE, ParseKind.EXPRESSION);
                        if (this.peek(lexer_1.TokenKind.PLUS_PLUS))
                            return this.parseUnaryPrefix(node_1.NodeKind.PREFIX_INCREMENT, ParseKind.EXPRESSION);
                    }
                    if (this.peek(lexer_1.TokenKind.LEFT_BRACE)) {
                        console.log("Check if its JS");
                    }
                    this.unexpectedToken();
                    return null;
                }
                parseInfix(precedence, node, mode) {
                    let token = this.current.range;
                    // Dot
                    if (this.peek(lexer_1.TokenKind.DOT) && precedence < Precedence.MEMBER) {
                        this.advance();
                        let name = this.current;
                        let range = name.range;
                        // Allow contextual keywords
                        if (lexer_1.isKeyword(name.kind)) {
                            this.advance();
                        }
                        else if (!this.expect(lexer_1.TokenKind.IDENTIFIER)) {
                            range = log_2.createRange(range.source, token.end, token.end);
                        }
                        return node_1.createDot(node, range.toString()).withRange(log_2.spanRanges(node.range, range)).withInternalRange(range);
                    }
                    if (mode == ParseKind.EXPRESSION) {
                        // Binary
                        if (this.peek(lexer_1.TokenKind.ASSIGN))
                            return this.parseBinary(node_1.NodeKind.ASSIGN, node, precedence, Precedence.ASSIGN);
                        if (this.peek(lexer_1.TokenKind.BITWISE_AND))
                            return this.parseBinary(node_1.NodeKind.BITWISE_AND, node, precedence, Precedence.BITWISE_AND);
                        if (this.peek(lexer_1.TokenKind.BITWISE_OR))
                            return this.parseBinary(node_1.NodeKind.BITWISE_OR, node, precedence, Precedence.BITWISE_OR);
                        if (this.peek(lexer_1.TokenKind.BITWISE_XOR))
                            return this.parseBinary(node_1.NodeKind.BITWISE_XOR, node, precedence, Precedence.BITWISE_XOR);
                        if (this.peek(lexer_1.TokenKind.DIVIDE))
                            return this.parseBinary(node_1.NodeKind.DIVIDE, node, precedence, Precedence.MULTIPLY);
                        if (this.peek(lexer_1.TokenKind.EQUAL))
                            return this.parseBinary(node_1.NodeKind.EQUAL, node, precedence, Precedence.EQUAL);
                        if (this.peek(lexer_1.TokenKind.EXPONENT))
                            return this.parseBinary(node_1.NodeKind.EXPONENT, node, precedence, Precedence.EXPONENT);
                        if (this.peek(lexer_1.TokenKind.GREATER_THAN))
                            return this.parseBinary(node_1.NodeKind.GREATER_THAN, node, precedence, Precedence.COMPARE);
                        if (this.peek(lexer_1.TokenKind.GREATER_THAN_EQUAL))
                            return this.parseBinary(node_1.NodeKind.GREATER_THAN_EQUAL, node, precedence, Precedence.COMPARE);
                        if (this.peek(lexer_1.TokenKind.LESS_THAN))
                            return this.parseBinary(node_1.NodeKind.LESS_THAN, node, precedence, Precedence.COMPARE);
                        if (this.peek(lexer_1.TokenKind.LESS_THAN_EQUAL))
                            return this.parseBinary(node_1.NodeKind.LESS_THAN_EQUAL, node, precedence, Precedence.COMPARE);
                        if (this.peek(lexer_1.TokenKind.LOGICAL_AND))
                            return this.parseBinary(node_1.NodeKind.LOGICAL_AND, node, precedence, Precedence.LOGICAL_AND);
                        if (this.peek(lexer_1.TokenKind.LOGICAL_OR))
                            return this.parseBinary(node_1.NodeKind.LOGICAL_OR, node, precedence, Precedence.LOGICAL_OR);
                        if (this.peek(lexer_1.TokenKind.MINUS))
                            return this.parseBinary(node_1.NodeKind.SUBTRACT, node, precedence, Precedence.ADD);
                        if (this.peek(lexer_1.TokenKind.MULTIPLY))
                            return this.parseBinary(node_1.NodeKind.MULTIPLY, node, precedence, Precedence.MULTIPLY);
                        if (this.peek(lexer_1.TokenKind.NOT_EQUAL))
                            return this.parseBinary(node_1.NodeKind.NOT_EQUAL, node, precedence, Precedence.EQUAL);
                        if (this.peek(lexer_1.TokenKind.PLUS))
                            return this.parseBinary(node_1.NodeKind.ADD, node, precedence, Precedence.ADD);
                        if (this.peek(lexer_1.TokenKind.REMAINDER))
                            return this.parseBinary(node_1.NodeKind.REMAINDER, node, precedence, Precedence.MULTIPLY);
                        if (this.peek(lexer_1.TokenKind.SHIFT_LEFT))
                            return this.parseBinary(node_1.NodeKind.SHIFT_LEFT, node, precedence, Precedence.SHIFT);
                        if (this.peek(lexer_1.TokenKind.SHIFT_RIGHT))
                            return this.parseBinary(node_1.NodeKind.SHIFT_RIGHT, node, precedence, Precedence.SHIFT);
                        // Unary postfix
                        if (this.peek(lexer_1.TokenKind.PLUS_PLUS))
                            return this.parseUnaryPostfix(node_1.NodeKind.POSTFIX_INCREMENT, node, precedence);
                        if (this.peek(lexer_1.TokenKind.MINUS_MINUS))
                            return this.parseUnaryPostfix(node_1.NodeKind.POSTFIX_DECREMENT, node, precedence);
                        // Cast
                        if (this.peek(lexer_1.TokenKind.AS) && precedence < Precedence.UNARY_PREFIX) {
                            this.advance();
                            let type = this.parseType();
                            if (type == null) {
                                return null;
                            }
                            return node_1.createCast(node, type).withRange(log_2.spanRanges(node.range, type.range)).withInternalRange(token);
                        }
                        // Call or index
                        let isIndex = this.peek(lexer_1.TokenKind.LEFT_BRACKET);
                        if ((isIndex || this.peek(lexer_1.TokenKind.LEFT_PARENTHESIS)) && precedence < Precedence.UNARY_POSTFIX) {
                            return this.parseArgumentList(node.range, isIndex ? node_1.createIndex(node) : node_1.createCall(node));
                        }
                        // Hook
                        if (this.peek(lexer_1.TokenKind.QUESTION_MARK) && precedence < Precedence.ASSIGN) {
                            this.advance();
                            let middle = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                            if (middle == null || !this.expect(lexer_1.TokenKind.COLON)) {
                                return null;
                            }
                            let right = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                            if (right == null) {
                                return null;
                            }
                            return node_1.createHook(node, middle, right).withRange(log_2.spanRanges(node.range, right.range));
                        }
                    }
                    return node;
                }
                parseDelete() {
                    let token = this.current;
                    assert(token.kind == lexer_1.TokenKind.DELETE);
                    this.advance();
                    let value = null;
                    if (!this.peek(lexer_1.TokenKind.SEMICOLON)) {
                        value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                        if (value == null) {
                            return null;
                        }
                    }
                    let semicolon = this.current;
                    this.expect(lexer_1.TokenKind.SEMICOLON);
                    return node_1.createDelete(value).withRange(log_2.spanRanges(token.range, semicolon.range));
                }
                parseArgumentList(start, node) {
                    let open = this.current.range;
                    let isIndex = node.kind == node_1.NodeKind.INDEX;
                    let left = isIndex ? lexer_1.TokenKind.LEFT_BRACKET : lexer_1.TokenKind.LEFT_PARENTHESIS;
                    let right = isIndex ? lexer_1.TokenKind.RIGHT_BRACKET : lexer_1.TokenKind.RIGHT_PARENTHESIS;
                    if (!this.expect(left)) {
                        return null;
                    }
                    if (!this.peek(right)) {
                        while (true) {
                            let value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                            if (value == null) {
                                return null;
                            }
                            node.appendChild(value);
                            if (!this.eat(lexer_1.TokenKind.COMMA)) {
                                break;
                            }
                        }
                    }
                    let close = this.current.range;
                    if (!this.expect(right)) {
                        return null;
                    }
                    return node.withRange(log_2.spanRanges(start, close)).withInternalRange(log_2.spanRanges(open, close));
                }
                parseExpression(precedence, mode) {
                    // Prefix
                    let node = this.parsePrefix(mode);
                    if (node == null) {
                        return null;
                    }
                    assert(node.range != null);
                    // Infix
                    while (true) {
                        let result = this.parseInfix(precedence, node, mode);
                        if (result == null) {
                            return null;
                        }
                        if (result == node) {
                            break;
                        }
                        node = result;
                        assert(node.range != null);
                    }
                    return node;
                }
                parseType() {
                    return this.parseExpression(Precedence.UNARY_POSTFIX, ParseKind.TYPE);
                }
                parseIf() {
                    let token = this.current;
                    assert(token.kind == lexer_1.TokenKind.IF);
                    this.advance();
                    if (!this.expect(lexer_1.TokenKind.LEFT_PARENTHESIS)) {
                        return null;
                    }
                    let value;
                    // Recover from a missing value
                    if (this.peek(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                        this.unexpectedToken();
                        this.advance();
                        value = node_1.createParseError();
                    }
                    else {
                        value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                        if (value == null || !this.expect(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                            return null;
                        }
                    }
                    let trueBranch = this.parseBody();
                    if (trueBranch == null) {
                        return null;
                    }
                    let falseBranch = null;
                    if (this.eat(lexer_1.TokenKind.ELSE)) {
                        falseBranch = this.parseBody();
                        if (falseBranch == null) {
                            return null;
                        }
                    }
                    return node_1.createIf(value, trueBranch, falseBranch).withRange(log_2.spanRanges(token.range, (falseBranch != null ? falseBranch : trueBranch).range));
                }
                parseWhile() {
                    let token = this.current;
                    assert(token.kind == lexer_1.TokenKind.WHILE);
                    this.advance();
                    if (!this.expect(lexer_1.TokenKind.LEFT_PARENTHESIS)) {
                        return null;
                    }
                    let value;
                    // Recover from a missing value
                    if (this.peek(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                        this.unexpectedToken();
                        this.advance();
                        value = node_1.createParseError();
                    }
                    else {
                        value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                        if (value == null || !this.expect(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                            return null;
                        }
                    }
                    let body = this.parseBody();
                    if (body == null) {
                        return null;
                    }
                    return node_1.createWhile(value, body).withRange(log_2.spanRanges(token.range, body.range));
                }
                parseBody() {
                    let node = this.parseStatement(StatementMode.NORMAL);
                    if (node == null) {
                        return null;
                    }
                    if (node.kind == node_1.NodeKind.BLOCK) {
                        return node;
                    }
                    let block = node_1.createBlock();
                    block.appendChild(node);
                    return block.withRange(node.range);
                }
                parseBlock() {
                    let open = this.current;
                    if (!this.expect(lexer_1.TokenKind.LEFT_BRACE)) {
                        return null;
                    }
                    let block = node_1.createBlock();
                    if (!this.parseStatements(block)) {
                        return null;
                    }
                    let close = this.current;
                    if (!this.expect(lexer_1.TokenKind.RIGHT_BRACE)) {
                        return null;
                    }
                    return block.withRange(log_2.spanRanges(open.range, close.range));
                }
                // parseObject():Node {
                //
                // }
                parseReturn() {
                    let token = this.current;
                    assert(token.kind == lexer_1.TokenKind.RETURN);
                    this.advance();
                    let value = null;
                    if (!this.peek(lexer_1.TokenKind.SEMICOLON)) {
                        value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                        if (value == null) {
                            return null;
                        }
                    }
                    let semicolon = this.current;
                    this.expect(lexer_1.TokenKind.SEMICOLON);
                    return node_1.createReturn(value).withRange(log_2.spanRanges(token.range, semicolon.range));
                }
                parseEmpty() {
                    let token = this.current;
                    this.advance();
                    return node_1.createEmpty().withRange(token.range);
                }
                parseEnum(firstFlag) {
                    let token = this.current;
                    assert(token.kind == lexer_1.TokenKind.ENUM);
                    this.advance();
                    let name = this.current;
                    if (!this.expect(lexer_1.TokenKind.IDENTIFIER) || !this.expect(lexer_1.TokenKind.LEFT_BRACE)) {
                        return null;
                    }
                    let text = name.range.toString();
                    let node = node_1.createEnum(text);
                    node.firstFlag = firstFlag;
                    node.flags = node_1.allFlags(firstFlag);
                    while (!this.peek(lexer_1.TokenKind.END_OF_FILE) && !this.peek(lexer_1.TokenKind.RIGHT_BRACE)) {
                        let member = this.current.range;
                        let value = null;
                        if (!this.expect(lexer_1.TokenKind.IDENTIFIER)) {
                            return null;
                        }
                        if (this.eat(lexer_1.TokenKind.ASSIGN)) {
                            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                            if (value == null) {
                                return null;
                            }
                        }
                        let variable = node_1.createVariable(member.toString(), node_1.createName(text), value);
                        node.appendChild(variable.withRange(value != null ? log_2.spanRanges(member, value.range) : member).withInternalRange(member));
                        // Recover from a terminating semicolon
                        if (this.peek(lexer_1.TokenKind.SEMICOLON)) {
                            this.expect(lexer_1.TokenKind.COMMA);
                            this.advance();
                        }
                        else if (this.peek(lexer_1.TokenKind.IDENTIFIER)) {
                            this.expect(lexer_1.TokenKind.COMMA);
                        }
                        else if (!this.eat(lexer_1.TokenKind.COMMA)) {
                            break;
                        }
                    }
                    let close = this.current;
                    if (!this.expect(lexer_1.TokenKind.RIGHT_BRACE)) {
                        return null;
                    }
                    return node.withRange(log_2.spanRanges(token.range, close.range)).withInternalRange(name.range);
                }
                parseParameters() {
                    let node = node_1.createParameters();
                    let open = this.current;
                    let close;
                    assert(open.kind == lexer_1.TokenKind.LESS_THAN);
                    this.advance();
                    while (true) {
                        let name = this.current;
                        if (!this.expect(lexer_1.TokenKind.IDENTIFIER)) {
                            close = this.current;
                            if (this.eat(lexer_1.TokenKind.GREATER_THAN)) {
                                break;
                            }
                            return null;
                        }
                        node.appendChild(node_1.createParameter(name.range.toString()).withRange(name.range));
                        if (!this.eat(lexer_1.TokenKind.COMMA)) {
                            close = this.current;
                            if (!this.expect(lexer_1.TokenKind.GREATER_THAN)) {
                                return null;
                            }
                            break;
                        }
                    }
                    return node.withRange(log_2.spanRanges(open.range, close.range));
                }
                parseInternalImports() {
                    let token = this.current;
                    assert(token.kind == lexer_1.TokenKind.INTERNAL_IMPORT);
                    this.advance();
                    let node = node_1.createImports();
                    node.flags = node.flags | node_1.NODE_FLAG_INTERNAL_IMPORT;
                    if (this.peek(lexer_1.TokenKind.MULTIPLY)) {
                        this.log.error(this.current.range, "wildcard '*' import not supported");
                        assert(this.eat(lexer_1.TokenKind.MULTIPLY));
                        assert(this.eat(lexer_1.TokenKind.AS));
                        let importName = this.current;
                        let range = importName.range;
                        let _import = node_1.createInternalImport(importName.range.toString());
                        node.appendChild(_import.withRange(range).withInternalRange(importName.range));
                        this.advance();
                    }
                    else {
                        if (!this.expect(lexer_1.TokenKind.LEFT_BRACE)) {
                            return null;
                        }
                        while (!this.peek(lexer_1.TokenKind.END_OF_FILE) && !this.peek(lexer_1.TokenKind.RIGHT_BRACE)) {
                            let importName = this.current;
                            let range = importName.range;
                            let _import = node_1.createInternalImport(importName.range.toString());
                            node.appendChild(_import.withRange(range).withInternalRange(importName.range));
                            if (!this.eat(lexer_1.TokenKind.COMMA)) {
                                break;
                            }
                        }
                        this.advance();
                        assert(this.expect(lexer_1.TokenKind.RIGHT_BRACE));
                    }
                    this.expect(lexer_1.TokenKind.FROM);
                    let importFrom = this.current;
                    let _from = node_1.createInternalImportFrom(importFrom.range.toString());
                    node.appendChild(_from.withRange(importFrom.range).withInternalRange(importFrom.range));
                    this.advance();
                    let semicolon = this.current;
                    this.expect(lexer_1.TokenKind.SEMICOLON);
                    return node.withRange(log_2.spanRanges(token.range, semicolon.range));
                }
                parseModule(firstFlag) {
                    let token = this.current;
                    assert(token.kind == lexer_1.TokenKind.MODULE);
                    this.advance();
                    let name = this.current;
                    if (!this.expect(lexer_1.TokenKind.IDENTIFIER)) {
                        return null;
                    }
                    let node = node_1.createModule(name.range.toString());
                    node.firstFlag = firstFlag;
                    node.flags = node_1.allFlags(firstFlag);
                    // Type parameters
                    if (this.peek(lexer_1.TokenKind.LESS_THAN)) {
                        let parameters = this.parseParameters();
                        if (parameters == null) {
                            return null;
                        }
                        node.appendChild(parameters);
                    }
                    if (!this.expect(lexer_1.TokenKind.LEFT_BRACE)) {
                        return null;
                    }
                    while (!this.peek(lexer_1.TokenKind.END_OF_FILE) && !this.peek(lexer_1.TokenKind.RIGHT_BRACE)) {
                        let childFlags = this.parseFlags();
                        let childName = this.current;
                        let oldKind = childName.kind;
                        // Support contextual keywords
                        if (lexer_1.isKeyword(childName.kind)) {
                            childName.kind = lexer_1.TokenKind.IDENTIFIER;
                            this.advance();
                        }
                        // The identifier must come first without any keyword
                        if (!this.expect(lexer_1.TokenKind.IDENTIFIER)) {
                            return null;
                        }
                        let text = childName.range.toString();
                        // Support operator definitions
                        if (text == "operator" && !this.peek(lexer_1.TokenKind.LEFT_PARENTHESIS) && !this.peek(lexer_1.TokenKind.IDENTIFIER)) {
                            childName.kind = lexer_1.TokenKind.OPERATOR;
                            this.current = childName;
                            if (this.parseFunction(childFlags, node) == null) {
                                return null;
                            }
                            continue;
                        }
                        else if (this.peek(lexer_1.TokenKind.IDENTIFIER)) {
                            let isGet = text == "get";
                            let isSet = text == "set";
                            // The "get" and "set" flags are contextual
                            if (isGet || isSet) {
                                childFlags = node_1.appendFlag(childFlags, isGet ? node_1.NODE_FLAG_GET : node_1.NODE_FLAG_SET, childName.range);
                                // Get the real identifier
                                childName = this.current;
                                this.advance();
                            }
                            else if (oldKind == lexer_1.TokenKind.FUNCTION) {
                                this.log.error(childName.range, "Instance functions don't need the 'function' keyword");
                                // Get the real identifier
                                childName = this.current;
                                this.advance();
                            }
                            else if (oldKind == lexer_1.TokenKind.CONST || oldKind == lexer_1.TokenKind.LET || oldKind == lexer_1.TokenKind.VAR) {
                                this.log.error(childName.range, stringbuilder_2.StringBuilder_new()
                                    .append("Instance variables don't need the '")
                                    .append(childName.range.toString())
                                    .append("' keyword")
                                    .finish());
                                // Get the real identifier
                                childName = this.current;
                                this.advance();
                            }
                        }
                        // Function
                        if (this.peek(lexer_1.TokenKind.LEFT_PARENTHESIS) || this.peek(lexer_1.TokenKind.LESS_THAN)) {
                            this.current = childName;
                            if (this.parseFunction(childFlags, node) == null) {
                                return null;
                            }
                        }
                        else {
                            this.current = childName;
                            if (this.parseVariables(childFlags, node) == null) {
                                return null;
                            }
                        }
                    }
                    let close = this.current;
                    if (!this.expect(lexer_1.TokenKind.RIGHT_BRACE)) {
                        return null;
                    }
                    return node.withRange(log_2.spanRanges(token.range, close.range)).withInternalRange(name.range);
                }
                parseClass(firstFlag) {
                    let token = this.current;
                    assert(token.kind == lexer_1.TokenKind.CLASS);
                    this.advance();
                    let name = this.current;
                    if (!this.expect(lexer_1.TokenKind.IDENTIFIER)) {
                        return null;
                    }
                    let node = node_1.createClass(name.range.toString());
                    node.firstFlag = firstFlag;
                    node.flags = node_1.allFlags(firstFlag);
                    // Type parameters
                    if (this.peek(lexer_1.TokenKind.LESS_THAN)) {
                        let parameters = this.parseParameters();
                        if (parameters == null) {
                            return null;
                        }
                        node.appendChild(parameters);
                    }
                    // "extends" clause
                    let extendsToken = this.current;
                    if (this.eat(lexer_1.TokenKind.EXTENDS)) {
                        let type;
                        // Recover from a missing type
                        if (this.peek(lexer_1.TokenKind.LEFT_BRACE) || this.peek(lexer_1.TokenKind.IMPLEMENTS)) {
                            this.unexpectedToken();
                            type = node_1.createParseError();
                        }
                        else {
                            type = this.parseType();
                            if (type == null) {
                                return null;
                            }
                        }
                        node.appendChild(node_1.createExtends(type).withRange(type.range != null ? log_2.spanRanges(extendsToken.range, type.range) : extendsToken.range));
                    }
                    // "implements" clause
                    let implementsToken = this.current;
                    if (this.eat(lexer_1.TokenKind.IMPLEMENTS)) {
                        let list = node_1.createImplements();
                        let type = null;
                        while (true) {
                            // Recover from a missing type
                            if (this.peek(lexer_1.TokenKind.LEFT_BRACE)) {
                                this.unexpectedToken();
                                break;
                            }
                            type = this.parseType();
                            if (type == null) {
                                return null;
                            }
                            list.appendChild(type);
                            if (!this.eat(lexer_1.TokenKind.COMMA)) {
                                break;
                            }
                        }
                        node.appendChild(list.withRange(type != null ? log_2.spanRanges(implementsToken.range, type.range) : implementsToken.range));
                    }
                    if (!this.expect(lexer_1.TokenKind.LEFT_BRACE)) {
                        return null;
                    }
                    while (!this.peek(lexer_1.TokenKind.END_OF_FILE) && !this.peek(lexer_1.TokenKind.RIGHT_BRACE)) {
                        let childFlags = this.parseFlags();
                        let childName = this.current;
                        let oldKind = childName.kind;
                        // Support contextual keywords
                        if (lexer_1.isKeyword(childName.kind)) {
                            childName.kind = lexer_1.TokenKind.IDENTIFIER;
                            this.advance();
                        }
                        // The identifier must come first without any keyword
                        if (!this.expect(lexer_1.TokenKind.IDENTIFIER)) {
                            return null;
                        }
                        let text = childName.range.toString();
                        // Support operator definitions
                        if (text == "operator" && !this.peek(lexer_1.TokenKind.LEFT_PARENTHESIS) && !this.peek(lexer_1.TokenKind.IDENTIFIER)) {
                            childName.kind = lexer_1.TokenKind.OPERATOR;
                            this.current = childName;
                            if (this.parseFunction(childFlags, node) == null) {
                                return null;
                            }
                            continue;
                        }
                        else if (this.peek(lexer_1.TokenKind.IDENTIFIER)) {
                            let isGet = text == "get";
                            let isSet = text == "set";
                            // The "get" and "set" flags are contextual
                            if (isGet || isSet) {
                                childFlags = node_1.appendFlag(childFlags, isGet ? node_1.NODE_FLAG_GET : node_1.NODE_FLAG_SET, childName.range);
                                // Get the real identifier
                                childName = this.current;
                                this.advance();
                            }
                            else if (oldKind == lexer_1.TokenKind.FUNCTION) {
                                this.log.error(childName.range, "Instance functions don't need the 'function' keyword");
                                // Get the real identifier
                                childName = this.current;
                                this.advance();
                            }
                            else if (oldKind == lexer_1.TokenKind.CONST || oldKind == lexer_1.TokenKind.LET || oldKind == lexer_1.TokenKind.VAR) {
                                this.log.error(childName.range, stringbuilder_2.StringBuilder_new()
                                    .append("Instance variables don't need the '")
                                    .append(childName.range.toString())
                                    .append("' keyword")
                                    .finish());
                                // Get the real identifier
                                childName = this.current;
                                this.advance();
                            }
                        }
                        // Function
                        if (this.peek(lexer_1.TokenKind.LEFT_PARENTHESIS) || this.peek(lexer_1.TokenKind.LESS_THAN)) {
                            this.current = childName;
                            if (this.parseFunction(childFlags, node) == null) {
                                return null;
                            }
                        }
                        else {
                            this.current = childName;
                            if (this.parseVariables(childFlags, node) == null) {
                                return null;
                            }
                        }
                    }
                    let close = this.current;
                    if (!this.expect(lexer_1.TokenKind.RIGHT_BRACE)) {
                        return null;
                    }
                    return node.withRange(log_2.spanRanges(token.range, close.range)).withInternalRange(name.range);
                }
                parseFunction(firstFlag, parent) {
                    let isOperator = false;
                    let token = this.current;
                    let nameRange;
                    let name;
                    // Support custom operators
                    if (parent != null && this.eat(lexer_1.TokenKind.OPERATOR)) {
                        let end = this.current;
                        if (this.eat(lexer_1.TokenKind.LEFT_BRACKET)) {
                            if (!this.expect(lexer_1.TokenKind.RIGHT_BRACKET)) {
                                return null;
                            }
                            if (this.peek(lexer_1.TokenKind.ASSIGN)) {
                                nameRange = log_2.spanRanges(token.range, this.current.range);
                                name = "[]=";
                                this.advance();
                            }
                            else {
                                nameRange = log_2.spanRanges(token.range, end.range);
                                name = "[]";
                            }
                            isOperator = true;
                        }
                        else if (this.eat(lexer_1.TokenKind.BITWISE_AND) ||
                            this.eat(lexer_1.TokenKind.BITWISE_OR) ||
                            this.eat(lexer_1.TokenKind.BITWISE_XOR) ||
                            this.eat(lexer_1.TokenKind.COMPLEMENT) ||
                            this.eat(lexer_1.TokenKind.DIVIDE) ||
                            this.eat(lexer_1.TokenKind.EQUAL) ||
                            this.eat(lexer_1.TokenKind.EXPONENT) ||
                            this.eat(lexer_1.TokenKind.LESS_THAN) ||
                            this.eat(lexer_1.TokenKind.GREATER_THAN) ||
                            this.eat(lexer_1.TokenKind.MINUS) ||
                            this.eat(lexer_1.TokenKind.MINUS_MINUS) ||
                            this.eat(lexer_1.TokenKind.MULTIPLY) ||
                            this.eat(lexer_1.TokenKind.PLUS) ||
                            this.eat(lexer_1.TokenKind.PLUS_PLUS) ||
                            this.eat(lexer_1.TokenKind.REMAINDER) ||
                            this.eat(lexer_1.TokenKind.SHIFT_LEFT) ||
                            this.eat(lexer_1.TokenKind.SHIFT_RIGHT)) {
                            nameRange = end.range;
                            name = nameRange.toString();
                            isOperator = true;
                        }
                        else if (this.eat(lexer_1.TokenKind.ASSIGN) ||
                            this.eat(lexer_1.TokenKind.GREATER_THAN_EQUAL) ||
                            this.eat(lexer_1.TokenKind.LESS_THAN_EQUAL) ||
                            this.eat(lexer_1.TokenKind.LOGICAL_AND) ||
                            this.eat(lexer_1.TokenKind.LOGICAL_OR) ||
                            this.eat(lexer_1.TokenKind.NOT) ||
                            this.eat(lexer_1.TokenKind.NOT_EQUAL)) {
                            nameRange = end.range;
                            name = nameRange.toString();
                            // Recover from an invalid operator name
                            this.log.error(nameRange, stringbuilder_2.StringBuilder_new()
                                .append("The operator '")
                                .append(name)
                                .append("' cannot be implemented")
                                .append(end.kind == lexer_1.TokenKind.NOT_EQUAL ? " (it is automatically derived from '==')" :
                                end.kind == lexer_1.TokenKind.LESS_THAN_EQUAL ? " (it is automatically derived from '>')" :
                                    end.kind == lexer_1.TokenKind.GREATER_THAN_EQUAL ? " (it is automatically derived from '<')" :
                                        "")
                                .finish());
                        }
                        else {
                            this.unexpectedToken();
                        }
                    }
                    else {
                        // Functions inside class declarations don't use "function"
                        if (parent == null) {
                            assert(token.kind == lexer_1.TokenKind.FUNCTION);
                            this.advance();
                        }
                        // Remember where the name is for the symbol later
                        nameRange = this.current.range;
                        if (!this.expect(lexer_1.TokenKind.IDENTIFIER)) {
                            return null;
                        }
                        name = nameRange.toString();
                    }
                    let node = node_1.createFunction(name);
                    node.firstFlag = firstFlag;
                    node.flags = node_1.allFlags(firstFlag);
                    if (isOperator) {
                        node.flags = node.flags | node_1.NODE_FLAG_OPERATOR;
                    }
                    // Type parameters
                    if (this.peek(lexer_1.TokenKind.LESS_THAN)) {
                        let parameters = this.parseParameters();
                        if (parameters == null) {
                            return null;
                        }
                        node.appendChild(parameters);
                    }
                    if (!this.expect(lexer_1.TokenKind.LEFT_PARENTHESIS)) {
                        return null;
                    }
                    if (!this.peek(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                        while (true) {
                            let firstArgumentFlag = this.parseFlags();
                            let argument = this.current;
                            ;
                            if (!this.expect(lexer_1.TokenKind.IDENTIFIER)) {
                                return null;
                            }
                            let type;
                            let value = null;
                            let range = argument.range;
                            if (this.expect(lexer_1.TokenKind.COLON)) {
                                type = this.parseType();
                                if (this.peek(lexer_1.TokenKind.LESS_THAN)) {
                                    let parameters = this.parseParameters();
                                    if (parameters == null) {
                                        return null;
                                    }
                                    type.appendChild(parameters);
                                }
                                if (type != null) {
                                    range = log_2.spanRanges(range, type.range);
                                }
                                else if (this.peek(lexer_1.TokenKind.COMMA) || this.peek(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                                    type = node_1.createParseError();
                                }
                                else {
                                    return null;
                                }
                            }
                            else if (this.peek(lexer_1.TokenKind.COMMA) || this.peek(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                                type = node_1.createParseError();
                            }
                            let firstType = type;
                            //Type alias
                            while (this.eat(lexer_1.TokenKind.BITWISE_OR)) {
                                let aliasType = this.parseType();
                                if (this.peek(lexer_1.TokenKind.LESS_THAN)) {
                                    let parameters = this.parseParameters();
                                    if (parameters == null) {
                                        return null;
                                    }
                                    aliasType.appendChild(parameters);
                                }
                                if (aliasType != null) {
                                    range = log_2.spanRanges(range, aliasType.range);
                                }
                                else if (this.peek(lexer_1.TokenKind.COMMA) || this.peek(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                                    aliasType = node_1.createParseError();
                                }
                                else {
                                    return null;
                                }
                                type.appendChild(aliasType);
                                type = aliasType;
                            }
                            if (this.eat(lexer_1.TokenKind.ASSIGN)) {
                                value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                            }
                            let variable = node_1.createVariable(argument.range.toString(), firstType, value);
                            variable.firstFlag = firstArgumentFlag;
                            variable.flags = node_1.allFlags(firstArgumentFlag);
                            node.appendChild(variable.withRange(range).withInternalRange(argument.range));
                            if (!this.eat(lexer_1.TokenKind.COMMA)) {
                                break;
                            }
                        }
                    }
                    if (!this.expect(lexer_1.TokenKind.RIGHT_PARENTHESIS)) {
                        return null;
                    }
                    let returnType;
                    if (node.isAnyfunc()) {
                        returnType = node_1.createAny();
                    }
                    else {
                        if (node.stringValue == "constructor") {
                            returnType = new node_1.Node();
                            returnType.kind = node_1.NodeKind.NAME;
                            returnType.stringValue = parent.stringValue;
                        }
                        else if (this.expect(lexer_1.TokenKind.COLON)) {
                            returnType = this.parseType();
                            if (this.peek(lexer_1.TokenKind.LESS_THAN)) {
                                let parameters = this.parseParameters();
                                if (parameters == null) {
                                    return null;
                                }
                                returnType.appendChild(parameters);
                            }
                            if (returnType == null) {
                                // Recover from a missing return type
                                if (this.peek(lexer_1.TokenKind.SEMICOLON) || this.peek(lexer_1.TokenKind.LEFT_BRACE)) {
                                    returnType = node_1.createParseError();
                                }
                                else {
                                    return null;
                                }
                            }
                            let firstType = returnType;
                            //Type alias
                            while (this.eat(lexer_1.TokenKind.BITWISE_OR)) {
                                let aliasType = this.parseType();
                                if (this.peek(lexer_1.TokenKind.LESS_THAN)) {
                                    let parameters = this.parseParameters();
                                    if (parameters == null) {
                                        return null;
                                    }
                                    aliasType.appendChild(parameters);
                                }
                                if (aliasType == null) {
                                    // Recover from a missing return type
                                    if (this.peek(lexer_1.TokenKind.SEMICOLON) || this.peek(lexer_1.TokenKind.LEFT_BRACE)) {
                                        aliasType = node_1.createParseError();
                                    }
                                    else {
                                        return null;
                                    }
                                }
                                firstType.appendChild(aliasType);
                                firstType = aliasType;
                            }
                        }
                        else if (this.peek(lexer_1.TokenKind.SEMICOLON) || this.peek(lexer_1.TokenKind.LEFT_BRACE)) {
                            returnType = node_1.createParseError();
                        }
                        else {
                            return null;
                        }
                    }
                    node.appendChild(returnType);
                    let block = null;
                    // Is this an import?
                    let semicolon = this.current;
                    if (this.eat(lexer_1.TokenKind.SEMICOLON)) {
                        block = node_1.createEmpty().withRange(semicolon.range);
                    }
                    else {
                        block = this.parseBlock();
                        if (block == null) {
                            return null;
                        }
                    }
                    // Add this to the enclosing class
                    if (parent != null) {
                        parent.appendChild(node);
                    }
                    node.appendChild(block);
                    return node.withRange(log_2.spanRanges(token.range, block.range)).withInternalRange(nameRange);
                }
                parseVariables(firstFlag, parent) {
                    let token = this.current;
                    // Variables inside class declarations don't use "var"
                    if (parent == null) {
                        assert(token.kind == lexer_1.TokenKind.CONST || token.kind == lexer_1.TokenKind.LET || token.kind == lexer_1.TokenKind.VAR);
                        this.advance();
                    }
                    let node = token.kind == lexer_1.TokenKind.CONST ? node_1.createConstants() : node_1.createVariables();
                    node.firstFlag = firstFlag;
                    while (true) {
                        let name = this.current;
                        if (!this.expect(lexer_1.TokenKind.IDENTIFIER)) {
                            return null;
                        }
                        let type = null;
                        if (this.eat(lexer_1.TokenKind.COLON)) {
                            type = this.parseType();
                            if (this.peek(lexer_1.TokenKind.LESS_THAN)) {
                                let parameters = this.parseParameters();
                                if (parameters == null) {
                                    return null;
                                }
                                type.appendChild(parameters);
                            }
                            if (type == null) {
                                return null;
                            }
                        }
                        let value = null;
                        if (this.eat(lexer_1.TokenKind.ASSIGN)) {
                            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                            if (value == null) {
                                return null;
                            }
                            // TODO: Implement constructors
                            if (parent != null) {
                                //this.log.error(value.range, "Inline initialization of instance variables is not supported yet");
                            }
                        }
                        let range = value != null ? log_2.spanRanges(name.range, value.range) :
                            type != null ? log_2.spanRanges(name.range, type.range) :
                                name.range;
                        let variable = node_1.createVariable(name.range.toString(), type, value);
                        variable.firstFlag = firstFlag;
                        variable.flags = node_1.allFlags(firstFlag);
                        (parent != null ? parent : node).appendChild(variable.withRange(range).withInternalRange(name.range));
                        if (!this.eat(lexer_1.TokenKind.COMMA)) {
                            break;
                        }
                    }
                    let semicolon = this.current;
                    this.expect(lexer_1.TokenKind.SEMICOLON);
                    return node.withRange(log_2.spanRanges(token.range, semicolon.range));
                }
                parseLoopJump(kind) {
                    let token = this.current;
                    this.advance();
                    this.expect(lexer_1.TokenKind.SEMICOLON);
                    let node = new node_1.Node();
                    node.kind = kind;
                    return node.withRange(token.range);
                }
                parseFlags() {
                    let firstFlag = null;
                    let lastFlag = null;
                    while (true) {
                        let token = this.current;
                        let flag;
                        if (this.eat(lexer_1.TokenKind.EXTERNAL_IMPORT))
                            flag = node_1.NODE_FLAG_EXTERNAL_IMPORT;
                        else if (this.eat(lexer_1.TokenKind.DECLARE))
                            flag = node_1.NODE_FLAG_DECLARE;
                        else if (this.eat(lexer_1.TokenKind.EXPORT))
                            flag = node_1.NODE_FLAG_EXPORT;
                        else if (this.eat(lexer_1.TokenKind.PRIVATE))
                            flag = node_1.NODE_FLAG_PRIVATE;
                        else if (this.eat(lexer_1.TokenKind.PROTECTED))
                            flag = node_1.NODE_FLAG_PROTECTED;
                        else if (this.eat(lexer_1.TokenKind.PUBLIC))
                            flag = node_1.NODE_FLAG_PUBLIC;
                        else if (this.eat(lexer_1.TokenKind.STATIC))
                            flag = node_1.NODE_FLAG_STATIC;
                        else if (this.eat(lexer_1.TokenKind.ANYFUNC))
                            flag = node_1.NODE_FLAG_ANYFUNC;
                        else if (this.eat(lexer_1.TokenKind.UNSAFE))
                            flag = node_1.NODE_FLAG_UNSAFE;
                        else if (this.eat(lexer_1.TokenKind.JAVASCRIPT))
                            flag = node_1.NODE_FLAG_JAVASCRIPT;
                        else if (this.eat(lexer_1.TokenKind.START))
                            flag = node_1.NODE_FLAG_START;
                        else if (this.eat(lexer_1.TokenKind.VIRTUAL))
                            flag = node_1.NODE_FLAG_VIRTUAL;
                        else
                            return firstFlag;
                        let link = new node_1.NodeFlag();
                        link.flag = flag;
                        link.range = token.range;
                        if (firstFlag == null)
                            firstFlag = link;
                        else
                            lastFlag.next = link;
                        lastFlag = link;
                    }
                }
                parseUnsafe() {
                    let token = this.current;
                    this.advance();
                    let node = this.parseBlock();
                    if (node == null) {
                        return null;
                    }
                    node.flags = node.flags | node_1.NODE_FLAG_UNSAFE;
                    return node.withRange(log_2.spanRanges(token.range, node.range));
                }
                parseJavaScript() {
                    let token = this.current;
                    this.advance();
                    let node = this.parseBlock();
                    if (node == null) {
                        return null;
                    }
                    node.flags = node.flags | node_1.NODE_FLAG_JAVASCRIPT;
                    return node.withRange(log_2.spanRanges(token.range, node.range));
                }
                parseStart() {
                    let token = this.current;
                    this.advance();
                    let node = this.parseBlock();
                    if (node == null) {
                        return null;
                    }
                    node.flags = node.flags | node_1.NODE_FLAG_START;
                    return node.withRange(log_2.spanRanges(token.range, node.range));
                }
                parseVirtual(firstFlag) {
                    let token = this.current;
                    this.advance();
                    let node = this.parseFunction(firstFlag, null);
                    if (node == null) {
                        return null;
                    }
                    node.flags = node.flags | node_1.NODE_FLAG_VIRTUAL;
                    return node.withRange(log_2.spanRanges(token.range, node.range));
                }
                parseStatement(mode) {
                    let firstFlag = mode == StatementMode.FILE ? this.parseFlags() : null;
                    // if (this.peek(TokenKind.UNSAFE) && firstFlag == null) return this.parseUnsafe(); //disabled for now
                    if (this.peek(lexer_1.TokenKind.INTERNAL_IMPORT) && firstFlag == null)
                        return this.parseInternalImports(); // This should handle before parsing
                    if (this.peek(lexer_1.TokenKind.JAVASCRIPT) && firstFlag == null)
                        return this.parseJavaScript();
                    if (this.peek(lexer_1.TokenKind.START) && firstFlag == null)
                        return this.parseStart();
                    if (this.peek(lexer_1.TokenKind.CONST) || this.peek(lexer_1.TokenKind.LET) || this.peek(lexer_1.TokenKind.VAR))
                        return this.parseVariables(firstFlag, null);
                    if (this.peek(lexer_1.TokenKind.FUNCTION))
                        return this.parseFunction(firstFlag, null);
                    if (this.peek(lexer_1.TokenKind.VIRTUAL))
                        return this.parseVirtual(firstFlag);
                    if (this.peek(lexer_1.TokenKind.MODULE))
                        return this.parseModule(firstFlag);
                    if (this.peek(lexer_1.TokenKind.CLASS))
                        return this.parseClass(firstFlag);
                    if (this.peek(lexer_1.TokenKind.ENUM))
                        return this.parseEnum(firstFlag);
                    // Definition modifiers need to be attached to a definition
                    if (firstFlag != null) {
                        this.unexpectedToken();
                        return null;
                    }
                    if (this.peek(lexer_1.TokenKind.LEFT_BRACE))
                        return this.parseBlock();
                    if (this.peek(lexer_1.TokenKind.BREAK))
                        return this.parseLoopJump(node_1.NodeKind.BREAK);
                    if (this.peek(lexer_1.TokenKind.CONTINUE))
                        return this.parseLoopJump(node_1.NodeKind.CONTINUE);
                    if (this.peek(lexer_1.TokenKind.IF))
                        return this.parseIf();
                    if (this.peek(lexer_1.TokenKind.WHILE))
                        return this.parseWhile();
                    if (this.peek(lexer_1.TokenKind.DELETE))
                        return this.parseDelete();
                    if (this.peek(lexer_1.TokenKind.RETURN))
                        return this.parseReturn();
                    if (this.peek(lexer_1.TokenKind.SEMICOLON))
                        return this.parseEmpty();
                    // Parse an expression statement
                    let value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                    if (value == null) {
                        return null;
                    }
                    let semicolon = this.current;
                    this.expect(lexer_1.TokenKind.SEMICOLON);
                    return node_1.createExpression(value).withRange(log_2.spanRanges(value.range, semicolon.range));
                }
                parseStatements(parent) {
                    while (!this.peek(lexer_1.TokenKind.END_OF_FILE) && !this.peek(lexer_1.TokenKind.RIGHT_BRACE)) {
                        let child = this.parseStatement(parent.kind == node_1.NodeKind.FILE ? StatementMode.FILE : StatementMode.NORMAL);
                        if (child == null) {
                            return false;
                        }
                        parent.appendChild(child);
                    }
                    return true;
                }
                parseInt(range, node) {
                    let source = range.source;
                    let contents = source.contents;
                    let i = range.start;
                    let limit = range.end;
                    let value = 0;
                    let base = 10;
                    // Handle binary, octal, and hexadecimal prefixes
                    if (contents[i] == '0' && i + 1 < limit) {
                        let c = contents[i + 1];
                        if (c == 'b' || c == 'B')
                            base = 2;
                        else if (c == 'o' || c == 'O')
                            base = 8;
                        else if (c == 'x' || c == 'X')
                            base = 16;
                        // else {
                        //     this.log.error(range, "Use the '0o' prefix for octal integers");
                        //     return false;
                        // }
                        if (base != 10)
                            i = i + 2;
                    }
                    while (i < limit) {
                        let c = contents[i];
                        let digit = (c >= 'A' && c <= 'F' ? c.charCodeAt(0) + (10 - 'A'.charCodeAt(0)) :
                            c >= 'a' && c <= 'f' ? c.charCodeAt(0) + (10 - 'a'.charCodeAt(0)) :
                                c.charCodeAt(0) - '0'.charCodeAt(0));
                        let baseValue = Math.imul(value, base) >>> 0;
                        // Check for overflow (unsigned integer overflow supposedly doesn't result in undefined behavior)
                        // if (baseValue / base >>> 0 !== value || baseValue > 4294967295 - digit >>> 0) {
                        //     this.log.error(range, "Integer literal is too big to fit in 32 bits");
                        //     return false;
                        // }
                        value = baseValue + digit;
                        i = i + 1;
                    }
                    node.intValue = value;
                    node.flags = node_1.NODE_FLAG_POSITIVE;
                    return true;
                }
                parseFloat(range, node) {
                    let source = range.source;
                    let contents = source.contents;
                    node.floatValue = parseFloat(contents.substring(range.start, range.end));
                    node.flags = node_1.NODE_FLAG_POSITIVE;
                    return true;
                }
                parseDouble(range, node) {
                    let source = range.source;
                    let contents = source.contents;
                    node.doubleValue = parseFloat(contents.substring(range.start, range.end));
                    node.flags = node_1.NODE_FLAG_POSITIVE;
                    return true;
                }
            };
        }
    };
});
System.register("preprocessor", ["log", "stringbuilder", "lexer", "parser"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var log_3, stringbuilder_3, lexer_2, parser_1, PreprocessorValue, PreprocessorFlag, Preprocessor;
    return {
        setters: [
            function (log_3_1) {
                log_3 = log_3_1;
            },
            function (stringbuilder_3_1) {
                stringbuilder_3 = stringbuilder_3_1;
            },
            function (lexer_2_1) {
                lexer_2 = lexer_2_1;
            },
            function (parser_1_1) {
                parser_1 = parser_1_1;
            }
        ],
        execute: function () {
            (function (PreprocessorValue) {
                PreprocessorValue[PreprocessorValue["FALSE"] = 0] = "FALSE";
                PreprocessorValue[PreprocessorValue["TRUE"] = 1] = "TRUE";
                PreprocessorValue[PreprocessorValue["ERROR"] = 2] = "ERROR";
            })(PreprocessorValue || (PreprocessorValue = {}));
            exports_5("PreprocessorValue", PreprocessorValue);
            PreprocessorFlag = class PreprocessorFlag {
            };
            exports_5("PreprocessorFlag", PreprocessorFlag);
            // This preprocessor implements the flag-only conditional behavior from C#.
            // There are two scopes for flags: global-level and file-level. This is stored
            // using an ever-growing linked list of PreprocessorFlag objects that turn a
            // flag either on or off. That way file-level state can just reference the
            // memory of the global-level state and the global-level state can easily be
            // restored after parsing a file just by restoring the pointer.
            Preprocessor = class Preprocessor {
                peek(kind) {
                    return this.current.kind == kind;
                }
                eat(kind) {
                    if (this.peek(kind)) {
                        this.advance();
                        return true;
                    }
                    return false;
                }
                advance() {
                    if (!this.peek(lexer_2.TokenKind.END_OF_FILE)) {
                        this.previous = this.current;
                        this.current = this.current.next;
                    }
                }
                unexpectedToken() {
                    this.log.error(this.current.range, stringbuilder_3.StringBuilder_new()
                        .append("Unexpected ")
                        .append(lexer_2.tokenToString(this.current.kind))
                        .finish());
                }
                expect(kind) {
                    if (!this.peek(kind)) {
                        this.log.error(this.current.range, stringbuilder_3.StringBuilder_new()
                            .append("Expected ")
                            .append(lexer_2.tokenToString(kind))
                            .append(" but found ")
                            .append(lexer_2.tokenToString(this.current.kind))
                            .finish());
                        return false;
                    }
                    this.advance();
                    return true;
                }
                removeTokensFrom(before) {
                    before.next = this.current;
                    this.previous = before;
                }
                isDefined(name) {
                    var flag = this.firstFlag;
                    while (flag != null) {
                        if (flag.name == name) {
                            return flag.isDefined;
                        }
                        flag = flag.next;
                    }
                    return false;
                }
                define(name, isDefined) {
                    var flag = new PreprocessorFlag();
                    flag.isDefined = isDefined;
                    flag.name = name;
                    flag.next = this.firstFlag;
                    this.firstFlag = flag;
                }
                run(source, log) {
                    var firstToken = source.firstToken;
                    if (firstToken != null && firstToken.kind == lexer_2.TokenKind.PREPROCESSOR_NEEDED) {
                        var firstFlag = this.firstFlag;
                        // Initialize
                        this.isDefineAndUndefAllowed = true;
                        this.previous = firstToken;
                        this.current = firstToken.next;
                        this.log = log;
                        // Don't parse this file if preprocessing failed
                        if (!this.scan(true)) {
                            source.firstToken = null;
                            return;
                        }
                        // Make sure blocks are balanced
                        if (!this.peek(lexer_2.TokenKind.END_OF_FILE)) {
                            this.unexpectedToken();
                        }
                        // Restore the global-level state instead of letting the file-level state
                        // leak over into the next file that the preprocessor is run on
                        this.firstFlag = firstFlag;
                        // Skip over the PREPROCESSOR_NEEDED token so the parser doesn't see it
                        source.firstToken = source.firstToken.next;
                    }
                }
                // Scan over the next reachable tokens, evaluate #define/#undef directives,
                // and fold #if/#else chains. Stop on #elif/#else/#endif. Return false on
                // failure. Takes a booleanean flag for whether or not control flow is live in
                // this block.
                scan(isParentLive) {
                    while (!this.peek(lexer_2.TokenKind.END_OF_FILE) &&
                        !this.peek(lexer_2.TokenKind.PREPROCESSOR_ELIF) &&
                        !this.peek(lexer_2.TokenKind.PREPROCESSOR_ELSE) &&
                        !this.peek(lexer_2.TokenKind.PREPROCESSOR_ENDIF)) {
                        var previous = this.previous;
                        var current = this.current;
                        // #define or #undef
                        if (this.eat(lexer_2.TokenKind.PREPROCESSOR_DEFINE) || this.eat(lexer_2.TokenKind.PREPROCESSOR_UNDEF)) {
                            // Only process the directive if control flow is live at this point
                            if (this.expect(lexer_2.TokenKind.IDENTIFIER) && isParentLive) {
                                this.define(this.previous.range.toString(), current.kind == lexer_2.TokenKind.PREPROCESSOR_DEFINE);
                            }
                            // Help out people trying to use this like C
                            if (this.eat(lexer_2.TokenKind.FALSE) || this.eat(lexer_2.TokenKind.INT32) && this.previous.range.toString() == "0") {
                                this.log.error(this.previous.range, "Use '#undef' to turn a preprocessor flag off");
                            }
                            // Scan up to the next newline
                            if (!this.peek(lexer_2.TokenKind.END_OF_FILE) && !this.expect(lexer_2.TokenKind.PREPROCESSOR_NEWLINE)) {
                                while (!this.eat(lexer_2.TokenKind.PREPROCESSOR_NEWLINE) && !this.eat(lexer_2.TokenKind.END_OF_FILE)) {
                                    this.advance();
                                }
                            }
                            // These statements are only valid at the top of the file
                            if (!this.isDefineAndUndefAllowed) {
                                this.log.error(log_3.spanRanges(current.range, this.previous.range), "All '#define' and '#undef' directives must be at the top of the file");
                            }
                            // Remove all of these tokens
                            this.removeTokensFrom(previous);
                        }
                        else if (this.eat(lexer_2.TokenKind.PREPROCESSOR_WARNING) || this.eat(lexer_2.TokenKind.PREPROCESSOR_ERROR)) {
                            var next = this.current;
                            // Scan up to the next newline
                            while (!this.peek(lexer_2.TokenKind.PREPROCESSOR_NEWLINE) && !this.peek(lexer_2.TokenKind.END_OF_FILE)) {
                                this.advance();
                            }
                            // Only process the directive if control flow is live at this point
                            if (isParentLive) {
                                var range = this.current == next ? current.range : log_3.spanRanges(next.range, this.previous.range);
                                this.log.append(range, range.toString(), current.kind == lexer_2.TokenKind.PREPROCESSOR_WARNING ? log_3.DiagnosticKind.WARNING : log_3.DiagnosticKind.ERROR);
                            }
                            // Remove all of these tokens
                            this.eat(lexer_2.TokenKind.PREPROCESSOR_NEWLINE);
                            this.removeTokensFrom(previous);
                        }
                        else if (this.eat(lexer_2.TokenKind.PREPROCESSOR_IF)) {
                            var isLive = isParentLive;
                            // Scan over the entire if-else chain
                            while (true) {
                                var condition = this.parseExpression(parser_1.Precedence.LOWEST);
                                // Reject if the condition is missing
                                if (condition == PreprocessorValue.ERROR || !this.expect(lexer_2.TokenKind.PREPROCESSOR_NEWLINE)) {
                                    return false;
                                }
                                // Remove the #if/#elif header
                                this.removeTokensFrom(previous);
                                // Scan to the next #elif, #else, or #endif
                                if (!this.scan(isLive && condition == PreprocessorValue.TRUE)) {
                                    return false;
                                }
                                // Remove these tokens?
                                if (!isLive || condition == PreprocessorValue.FALSE) {
                                    this.removeTokensFrom(previous);
                                }
                                else {
                                    isLive = false;
                                }
                                // Update the previous pointer so we remove from here next
                                previous = this.previous;
                                // #elif
                                if (this.eat(lexer_2.TokenKind.PREPROCESSOR_ELIF)) {
                                    continue;
                                }
                                // #else
                                if (this.eat(lexer_2.TokenKind.PREPROCESSOR_ELSE)) {
                                    if (!this.expect(lexer_2.TokenKind.PREPROCESSOR_NEWLINE)) {
                                        return false;
                                    }
                                    // Remove the #else
                                    this.removeTokensFrom(previous);
                                    // Scan to the #endif
                                    if (!this.scan(isLive)) {
                                        return false;
                                    }
                                    // Remove these tokens?
                                    if (!isLive) {
                                        this.removeTokensFrom(previous);
                                    }
                                }
                                // #endif
                                break;
                            }
                            // All if-else chains end with an #endif
                            previous = this.previous;
                            if (!this.expect(lexer_2.TokenKind.PREPROCESSOR_ENDIF) || !this.peek(lexer_2.TokenKind.END_OF_FILE) && !this.expect(lexer_2.TokenKind.PREPROCESSOR_NEWLINE)) {
                                return false;
                            }
                            this.removeTokensFrom(previous);
                        }
                        else {
                            this.isDefineAndUndefAllowed = false;
                            this.advance();
                        }
                    }
                    return true;
                }
                parsePrefix() {
                    var isDefinedOperator = false;
                    var start = this.current;
                    // true or false
                    if (this.eat(lexer_2.TokenKind.TRUE))
                        return PreprocessorValue.TRUE;
                    if (this.eat(lexer_2.TokenKind.FALSE))
                        return PreprocessorValue.FALSE;
                    // Identifier
                    if (this.eat(lexer_2.TokenKind.IDENTIFIER)) {
                        var name = this.previous.range.toString();
                        // Recover from a C-style define operator
                        if (this.peek(lexer_2.TokenKind.LEFT_PARENTHESIS) && name == "defined") {
                            isDefinedOperator = true;
                        }
                        else {
                            var isTrue = this.isDefined(name);
                            return isTrue ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
                        }
                    }
                    // !
                    if (this.eat(lexer_2.TokenKind.NOT)) {
                        var value = this.parseExpression(parser_1.Precedence.UNARY_PREFIX);
                        if (value == PreprocessorValue.ERROR)
                            return PreprocessorValue.ERROR;
                        return value == PreprocessorValue.TRUE ? PreprocessorValue.FALSE : PreprocessorValue.TRUE;
                    }
                    // Group
                    if (this.eat(lexer_2.TokenKind.LEFT_PARENTHESIS)) {
                        var first = this.current;
                        var value = this.parseExpression(parser_1.Precedence.LOWEST);
                        if (value == PreprocessorValue.ERROR || !this.expect(lexer_2.TokenKind.RIGHT_PARENTHESIS)) {
                            return PreprocessorValue.ERROR;
                        }
                        // Recover from a C-style define operator
                        if (isDefinedOperator) {
                            var builder = stringbuilder_3.StringBuilder_new().append("There is no 'defined' operator");
                            if (first.kind == lexer_2.TokenKind.IDENTIFIER && this.previous == first.next) {
                                builder.append(" (just use '").append(first.range.toString()).append("' instead)");
                            }
                            this.log.error(log_3.spanRanges(start.range, this.previous.range), builder.finish());
                        }
                        return value;
                    }
                    // Recover from a C-style booleanean
                    if (this.eat(lexer_2.TokenKind.INT32)) {
                        var isTrue = this.previous.range.toString() != "0";
                        this.log.error(this.previous.range, stringbuilder_3.StringBuilder_new()
                            .append("Unexpected integer (did you mean '")
                            .append(isTrue ? "true" : "false")
                            .append("')?")
                            .finish());
                        return isTrue ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
                    }
                    this.unexpectedToken();
                    return PreprocessorValue.ERROR;
                }
                parseInfix(precedence, left) {
                    var operator = this.current.kind;
                    // == or !=
                    if (precedence < parser_1.Precedence.EQUAL && (this.eat(lexer_2.TokenKind.EQUAL) || this.eat(lexer_2.TokenKind.NOT_EQUAL))) {
                        var right = this.parseExpression(parser_1.Precedence.EQUAL);
                        if (right == PreprocessorValue.ERROR)
                            return PreprocessorValue.ERROR;
                        return (operator == lexer_2.TokenKind.EQUAL) == (left == right) ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
                    }
                    // &&
                    if (precedence < parser_1.Precedence.LOGICAL_AND && this.eat(lexer_2.TokenKind.LOGICAL_AND)) {
                        var right = this.parseExpression(parser_1.Precedence.LOGICAL_AND);
                        if (right == PreprocessorValue.ERROR)
                            return PreprocessorValue.ERROR;
                        return (left == PreprocessorValue.TRUE && right == PreprocessorValue.TRUE) ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
                    }
                    // ||
                    if (precedence < parser_1.Precedence.LOGICAL_OR && this.eat(lexer_2.TokenKind.LOGICAL_OR)) {
                        var right = this.parseExpression(parser_1.Precedence.LOGICAL_OR);
                        if (right == PreprocessorValue.ERROR)
                            return PreprocessorValue.ERROR;
                        return (left == PreprocessorValue.TRUE || right == PreprocessorValue.TRUE) ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
                    }
                    // Hook
                    if (precedence == parser_1.Precedence.LOWEST && this.eat(lexer_2.TokenKind.QUESTION_MARK)) {
                        var middle = this.parseExpression(parser_1.Precedence.LOWEST);
                        if (middle == PreprocessorValue.ERROR || !this.expect(lexer_2.TokenKind.COLON)) {
                            return PreprocessorValue.ERROR;
                        }
                        var right = this.parseExpression(parser_1.Precedence.LOWEST);
                        if (right == PreprocessorValue.ERROR) {
                            return PreprocessorValue.ERROR;
                        }
                        return left == PreprocessorValue.TRUE ? middle : right;
                    }
                    return left;
                }
                parseExpression(precedence) {
                    // Prefix
                    var value = this.parsePrefix();
                    if (value == PreprocessorValue.ERROR) {
                        return PreprocessorValue.ERROR;
                    }
                    // Infix
                    while (true) {
                        var current = this.current;
                        value = this.parseInfix(precedence, value);
                        if (value == PreprocessorValue.ERROR)
                            return PreprocessorValue.ERROR;
                        if (this.current == current)
                            break;
                    }
                    return value;
                }
            };
            exports_5("Preprocessor", Preprocessor);
        }
    };
});
System.register("scope", ["symbol", "stringbuilder", "type"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var symbol_1, stringbuilder_4, type_1, FindNested, ScopeHint, Scope;
    return {
        setters: [
            function (symbol_1_1) {
                symbol_1 = symbol_1_1;
            },
            function (stringbuilder_4_1) {
                stringbuilder_4 = stringbuilder_4_1;
            },
            function (type_1_1) {
                type_1 = type_1_1;
            }
        ],
        execute: function () {
            (function (FindNested) {
                FindNested[FindNested["NORMAL"] = 0] = "NORMAL";
                FindNested[FindNested["ALLOW_INSTANCE_ERRORS"] = 1] = "ALLOW_INSTANCE_ERRORS";
            })(FindNested || (FindNested = {}));
            exports_6("FindNested", FindNested);
            (function (ScopeHint) {
                ScopeHint[ScopeHint["NORMAL"] = 0] = "NORMAL";
                ScopeHint[ScopeHint["NOT_BINARY"] = 1] = "NOT_BINARY";
                ScopeHint[ScopeHint["NOT_GETTER"] = 2] = "NOT_GETTER";
                ScopeHint[ScopeHint["NOT_SETTER"] = 3] = "NOT_SETTER";
                ScopeHint[ScopeHint["NOT_UNARY"] = 4] = "NOT_UNARY";
                ScopeHint[ScopeHint["PREFER_GETTER"] = 5] = "PREFER_GETTER";
                ScopeHint[ScopeHint["PREFER_SETTER"] = 6] = "PREFER_SETTER";
            })(ScopeHint || (ScopeHint = {}));
            exports_6("ScopeHint", ScopeHint);
            Scope = class Scope {
                findLocal(name, hint) {
                    var symbol = this.firstSymbol;
                    var fallback = null;
                    while (symbol != null) {
                        if (symbol.name == name) {
                            if (hint == ScopeHint.PREFER_GETTER && symbol.isSetter() ||
                                hint == ScopeHint.PREFER_SETTER && symbol.isGetter()) {
                                fallback = symbol;
                            }
                            else if ((hint != ScopeHint.NOT_GETTER || !symbol.isGetter()) &&
                                (hint != ScopeHint.NOT_SETTER || !symbol.isSetter()) &&
                                (hint != ScopeHint.NOT_BINARY || !symbol.isBinaryOperator()) &&
                                (hint != ScopeHint.NOT_UNARY || !symbol.isUnaryOperator())) {
                                return symbol;
                            }
                        }
                        symbol = symbol.next;
                    }
                    return fallback;
                }
                findNested(name, hint, mode) {
                    var scope = this;
                    while (scope != null) {
                        if (scope.symbol == null || scope.symbol.kind != symbol_1.SymbolKind.TYPE_CLASS ||
                            mode == FindNested.ALLOW_INSTANCE_ERRORS || scope.symbol.node.hasParameters()) {
                            var local = scope.findLocal(name, hint);
                            if (local != null) {
                                return local;
                            }
                        }
                        scope = scope.parent;
                    }
                    return null;
                }
                define(log, symbol, hint) {
                    var existing = this.findLocal(symbol.name, hint);
                    if (existing != null) {
                        log.error(symbol.range, stringbuilder_4.StringBuilder_new()
                            .append("Duplicate symbol '")
                            .append(symbol.name)
                            .append("'")
                            .finish());
                        return false;
                    }
                    if (this.firstSymbol == null)
                        this.firstSymbol = symbol;
                    else
                        this.lastSymbol.next = symbol;
                    this.lastSymbol = symbol;
                    return true;
                }
                defineNativeType(log, name) {
                    var symbol = new symbol_1.Symbol();
                    symbol.kind = symbol_1.SymbolKind.TYPE_NATIVE;
                    symbol.name = name;
                    symbol.resolvedType = new type_1.Type();
                    symbol.resolvedType.symbol = symbol;
                    symbol.state = symbol_1.SymbolState.INITIALIZED;
                    this.define(log, symbol, ScopeHint.NORMAL);
                    return symbol.resolvedType;
                }
            };
            exports_6("Scope", Scope);
        }
    };
});
System.register("shaking", ["symbol", "node"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    function treeShakingMarkAllUsed(node) {
        var symbol = node.symbol;
        if (symbol != null && !symbol.isUsed() && symbol_2.isFunction(symbol.kind) && symbol.node != null) {
            symbol.flags = symbol.flags | symbol_2.SYMBOL_FLAG_USED;
            treeShakingMarkAllUsed(symbol.node);
            if (node == symbol.node)
                return;
        }
        if (node.kind == node_2.NodeKind.NEW) {
            var type = node.newType().resolvedType;
            if (type.symbol != null) {
                type.symbol.flags |= symbol_2.SYMBOL_FLAG_USED;
                type.symbol.node.constructorFunctionNode.symbol.flags = symbol_2.SYMBOL_FLAG_USED;
            }
        }
        var child = node.firstChild;
        while (child != null) {
            treeShakingMarkAllUsed(child);
            child = child.nextSibling;
        }
    }
    exports_7("treeShakingMarkAllUsed", treeShakingMarkAllUsed);
    function treeShakingSearchForUsed(node) {
        if (node.kind == node_2.NodeKind.FUNCTION && (node.isExport() || node.isStart())) {
            treeShakingMarkAllUsed(node);
        }
        else if (node.kind == node_2.NodeKind.GLOBAL || node.kind == node_2.NodeKind.CLASS) {
            var child = node.firstChild;
            while (child != null) {
                treeShakingSearchForUsed(child);
                child = child.nextSibling;
            }
            if (node.kind == node_2.NodeKind.CLASS && node.isExport()) {
                node.symbol.flags = node.symbol.flags | symbol_2.SYMBOL_FLAG_USED;
            }
        }
    }
    exports_7("treeShakingSearchForUsed", treeShakingSearchForUsed);
    function treeShakingRemoveUnused(node) {
        if (node.kind == node_2.NodeKind.FUNCTION && !node.symbol.isUsed() && node.range.source.isLibrary) {
            // if (node.symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
            //     if (!node.parent.symbol.isUsed()) {
            //         node.remove();
            //     }
            // } else {
            node.remove();
            // }
        }
        else if (node.kind == node_2.NodeKind.GLOBAL || node.kind == node_2.NodeKind.CLASS) {
            var child = node.firstChild;
            while (child != null) {
                var next = child.nextSibling;
                treeShakingRemoveUnused(child);
                child = next;
            }
            if (node.kind == node_2.NodeKind.CLASS && !node.symbol.isUsed() && !node.isDeclare() && node.range.source.isLibrary) {
                node.remove();
            }
        }
    }
    exports_7("treeShakingRemoveUnused", treeShakingRemoveUnused);
    function treeShaking(node) {
        treeShakingSearchForUsed(node);
        treeShakingRemoveUnused(node);
    }
    exports_7("treeShaking", treeShaking);
    var symbol_2, node_2;
    return {
        setters: [
            function (symbol_2_1) {
                symbol_2 = symbol_2_1;
            },
            function (node_2_1) {
                node_2 = node_2_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("c", ["stringbuilder", "compiler", "node", "parser", "symbol", "lexer"], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    function cEmitCharacter(builder, c) {
        if (lexer_3.isASCII(c.charCodeAt(0))) {
            builder.append('\'');
            if (c == '\\' || c == '\'') {
                builder.append('\\');
            }
            builder.append(c);
            builder.append('\'');
        }
        else if (c == '\0')
            builder.append("\'\\0\'");
        else if (c == '\r')
            builder.append("\'\\r\'");
        else if (c == '\n')
            builder.append("\'\\n\'");
        else if (c == '\t')
            builder.append("\'\\t\'");
        else
            builder.append(c.toString());
    }
    exports_8("cEmitCharacter", cEmitCharacter);
    function cEmit(compiler) {
        var child = compiler.global.firstChild;
        var temporaryCode = stringbuilder_5.StringBuilder_new();
        var headerCode = stringbuilder_5.StringBuilder_new();
        var implementationCode = stringbuilder_5.StringBuilder_new();
        var result = new CResult();
        result.context = compiler.context;
        result.code = temporaryCode;
        result.codePrefix = implementationCode;
        result.headerName = compiler_1.replaceFileExtension(compiler.outputName, ".h");
        if (child != null) {
            // Emit implementation
            result.emitIncludes(implementationCode, SourceMode.IMPLEMENTATION);
            result.emitNewlineAfter(child);
            result.emitTypeDeclarations(child, SourceMode.IMPLEMENTATION);
            result.emitNewlineAfter(child);
            result.emitTypeDefinitions(child, SourceMode.IMPLEMENTATION);
            result.emitNewlineAfter(child);
            result.emitFunctionDeclarations(child, SourceMode.IMPLEMENTATION);
            result.emitNewlineAfter(child);
            result.emitGlobalVariables(child, SourceMode.IMPLEMENTATION);
            result.emitNewlineAfter(child);
            result.emitFunctionDefinitions(child);
            result.finishImplementation();
            implementationCode.append(temporaryCode.finish());
            // Emit header
            result.code = headerCode;
            result.emitIncludes(headerCode, SourceMode.HEADER);
            result.emitNewlineAfter(child);
            result.emitTypeDeclarations(child, SourceMode.HEADER);
            result.emitNewlineAfter(child);
            result.emitTypeDefinitions(child, SourceMode.HEADER);
            result.emitNewlineAfter(child);
            result.emitFunctionDeclarations(child, SourceMode.HEADER);
            result.emitNewlineAfter(child);
            result.emitGlobalVariables(child, SourceMode.HEADER);
            result.emitNewlineAfter(child);
        }
        compiler.outputC = implementationCode.finish();
        compiler.outputH = headerCode.finish();
    }
    exports_8("cEmit", cEmit);
    var stringbuilder_5, compiler_1, node_3, parser_2, symbol_3, lexer_3, TypeMode, SourceMode, CResult;
    return {
        setters: [
            function (stringbuilder_5_1) {
                stringbuilder_5 = stringbuilder_5_1;
            },
            function (compiler_1_1) {
                compiler_1 = compiler_1_1;
            },
            function (node_3_1) {
                node_3 = node_3_1;
            },
            function (parser_2_1) {
                parser_2 = parser_2_1;
            },
            function (symbol_3_1) {
                symbol_3 = symbol_3_1;
            },
            function (lexer_3_1) {
                lexer_3 = lexer_3_1;
            }
        ],
        execute: function () {
            (function (TypeMode) {
                TypeMode[TypeMode["NORMAL"] = 0] = "NORMAL";
                TypeMode[TypeMode["DECLARATION"] = 1] = "DECLARATION";
                TypeMode[TypeMode["BARE"] = 2] = "BARE";
            })(TypeMode || (TypeMode = {}));
            exports_8("TypeMode", TypeMode);
            (function (SourceMode) {
                SourceMode[SourceMode["HEADER"] = 0] = "HEADER";
                SourceMode[SourceMode["IMPLEMENTATION"] = 1] = "IMPLEMENTATION";
            })(SourceMode || (SourceMode = {}));
            exports_8("SourceMode", SourceMode);
            CResult = class CResult {
                emitIndent() {
                    var i = this.indent;
                    while (i > 0) {
                        this.code.append("  ");
                        i = i - 1;
                    }
                }
                emitNewlineBefore(node) {
                    if (this.previousNode != null && (!node_3.isCompactNodeKind(this.previousNode.kind) || !node_3.isCompactNodeKind(node.kind))) {
                        this.code.append('\n');
                    }
                    this.previousNode = null;
                }
                emitNewlineAfter(node) {
                    this.previousNode = node;
                }
                emitStatements(node) {
                    while (node != null) {
                        this.emitStatement(node);
                        node = node.nextSibling;
                    }
                }
                emitBlock(node) {
                    this.previousNode = null;
                    this.code.append("{\n");
                    this.indent = this.indent + 1;
                    this.emitStatements(node.firstChild);
                    this.indent = this.indent - 1;
                    this.emitIndent();
                    this.code.append('}');
                    this.previousNode = null;
                }
                emitUnary(node, parentPrecedence, operator) {
                    var isPostfix = node_3.isUnaryPostfix(node.kind);
                    var operatorPrecedence = isPostfix ? parser_2.Precedence.UNARY_POSTFIX : parser_2.Precedence.UNARY_PREFIX;
                    var code = this.code;
                    if (parentPrecedence > operatorPrecedence) {
                        code.append('(');
                    }
                    if (!isPostfix) {
                        code.append(operator);
                    }
                    this.emitExpression(node.unaryValue(), operatorPrecedence);
                    if (isPostfix) {
                        code.append(operator);
                    }
                    if (parentPrecedence > operatorPrecedence) {
                        code.append(')');
                    }
                }
                emitBinary(node, parentPrecedence, operator, operatorPrecedence) {
                    var kind = node.kind;
                    var isRightAssociative = kind == node_3.NodeKind.ASSIGN;
                    var needsParentheses = parentPrecedence > operatorPrecedence;
                    var parentKind = node.parent.kind;
                    var code = this.code;
                    // Try to avoid warnings from Clang and GCC
                    if (parentKind == node_3.NodeKind.LOGICAL_OR && kind == node_3.NodeKind.LOGICAL_AND ||
                        parentKind == node_3.NodeKind.BITWISE_OR && kind == node_3.NodeKind.BITWISE_AND ||
                        (parentKind == node_3.NodeKind.EQUAL || parentKind == node_3.NodeKind.NOT_EQUAL) && (kind == node_3.NodeKind.EQUAL || kind == node_3.NodeKind.NOT_EQUAL) ||
                        (kind == node_3.NodeKind.ADD || kind == node_3.NodeKind.SUBTRACT) && (parentKind == node_3.NodeKind.BITWISE_AND || parentKind == node_3.NodeKind.BITWISE_OR || parentKind == node_3.NodeKind.BITWISE_XOR ||
                            parentKind == node_3.NodeKind.SHIFT_LEFT || parentKind == node_3.NodeKind.SHIFT_RIGHT)) {
                        needsParentheses = true;
                    }
                    if (needsParentheses) {
                        code.append('(');
                    }
                    this.emitExpression(node.binaryLeft(), isRightAssociative ? (operatorPrecedence + 1) : operatorPrecedence);
                    code.append(operator);
                    this.emitExpression(node.binaryRight(), isRightAssociative ? operatorPrecedence : (operatorPrecedence + 1));
                    if (needsParentheses) {
                        code.append(')');
                    }
                }
                emitCommaSeparatedExpressions(start, stop) {
                    while (start != stop) {
                        this.emitExpression(start, parser_2.Precedence.LOWEST);
                        start = start.nextSibling;
                        if (start != stop) {
                            this.code.append(", ");
                        }
                    }
                }
                emitSymbolName(symbol) {
                    if (symbol.kind == symbol_3.SymbolKind.FUNCTION_INSTANCE) {
                        this.code.append(symbol.parent().name).append('_');
                    }
                    this.code.append(symbol.rename != null ? symbol.rename : symbol.name);
                }
                emitExpression(node, parentPrecedence) {
                    var code = this.code;
                    assert(node.resolvedType != null);
                    if (node.kind == node_3.NodeKind.NAME) {
                        this.emitSymbolName(node.symbol);
                    }
                    else if (node.kind == node_3.NodeKind.NULL) {
                        code.append("NULL");
                    }
                    else if (node.kind == node_3.NodeKind.BOOLEAN) {
                        code.append(node.intValue != 0 ? '1' : '0');
                    }
                    else if (node.kind == node_3.NodeKind.INT32) {
                        code.append(node.resolvedType.isUnsigned()
                            ? (node.intValue).toString()
                            : node.intValue.toString());
                    }
                    else if (node.kind == node_3.NodeKind.FLOAT32) {
                        code.append(node.floatValue.toString());
                    }
                    else if (node.kind == node_3.NodeKind.STRING) {
                        var id = this.nextStringLiteral;
                        var builder = stringbuilder_5.StringBuilder_new();
                        builder.append("__string_").append(id.toString());
                        var value = node.stringValue;
                        var codePrefix = this.codePrefix;
                        var length = value.length;
                        var i = 0;
                        if (!this.hasStrings) {
                            codePrefix.append(`
#ifdef TURBOSCRIPT_BIG_ENDIAN
  #define S(a, b) (((a) << 16) | (b))
#else
  #define S(a, b) ((a) | ((b) << 16))
#endif

`);
                            this.hasStrings = true;
                        }
                        var underscore = true;
                        i = 0;
                        while (i < length && i < 32) {
                            var c = value[i];
                            if (lexer_3.isAlpha(c) || lexer_3.isNumber(c)) {
                                if (underscore) {
                                    builder.append('_');
                                    underscore = false;
                                }
                                builder.append(c);
                            }
                            else {
                                underscore = true;
                            }
                            i = i + 1;
                        }
                        var name = builder.finish();
                        codePrefix.append("static const uint32_t ").append(name).append("[] = {").append(length.toString());
                        i = 0;
                        while (i < length) {
                            codePrefix.append(", S(");
                            cEmitCharacter(codePrefix, value[i]);
                            if (i + 1 < length) {
                                codePrefix.append(i % 32 == 20 ? ",\n  " : ", ");
                                cEmitCharacter(codePrefix, value[i + 1]);
                                codePrefix.append(')');
                            }
                            else {
                                codePrefix.append(", 0)");
                            }
                            i = i + 2;
                        }
                        codePrefix.append("};\n");
                        this.nextStringLiteral = this.nextStringLiteral + 1;
                        code.append("(const uint16_t *)").append(name);
                    }
                    else if (node.kind == node_3.NodeKind.CAST) {
                        if (parentPrecedence > parser_2.Precedence.UNARY_PREFIX) {
                            code.append('(');
                        }
                        code.append('(');
                        this.emitType(node.resolvedType, TypeMode.NORMAL);
                        code.append(')');
                        this.emitExpression(node.castValue(), parser_2.Precedence.UNARY_PREFIX);
                        if (parentPrecedence > parser_2.Precedence.UNARY_PREFIX) {
                            code.append(')');
                        }
                    }
                    else if (node.kind == node_3.NodeKind.DOT) {
                        var target = node.dotTarget();
                        this.emitExpression(target, parser_2.Precedence.MEMBER);
                        code.append(target.resolvedType.isReference() ? "->" : ".");
                        this.emitSymbolName(node.symbol);
                    }
                    else if (node.kind == node_3.NodeKind.HOOK) {
                        if (parentPrecedence > parser_2.Precedence.ASSIGN) {
                            code.append('(');
                        }
                        this.emitExpression(node.hookValue(), parser_2.Precedence.LOGICAL_OR);
                        code.append(" ? ");
                        this.emitExpression(node.hookTrue(), parser_2.Precedence.ASSIGN);
                        code.append(" : ");
                        this.emitExpression(node.hookFalse(), parser_2.Precedence.ASSIGN);
                        if (parentPrecedence > parser_2.Precedence.ASSIGN) {
                            code.append(')');
                        }
                    }
                    else if (node.kind == node_3.NodeKind.CALL) {
                        let value = node.callValue();
                        this.emitSymbolName(value.symbol);
                        code.append('(');
                        // Make sure to emit "this"
                        if (value.kind == node_3.NodeKind.DOT) {
                            this.emitExpression(value.dotTarget(), parser_2.Precedence.LOWEST);
                            if (value.nextSibling != null) {
                                code.append(", ");
                            }
                        }
                        this.emitCommaSeparatedExpressions(value.nextSibling, null);
                        code.append(')');
                    }
                    else if (node.kind == node_3.NodeKind.NEW) {
                        code.append("calloc(1, sizeof(");
                        this.emitType(node.resolvedType, TypeMode.BARE);
                        code.append("))");
                    }
                    else if (node.kind == node_3.NodeKind.COMPLEMENT)
                        this.emitUnary(node, parentPrecedence, "~");
                    else if (node.kind == node_3.NodeKind.DEREFERENCE)
                        this.emitUnary(node, parentPrecedence, "*");
                    else if (node.kind == node_3.NodeKind.NEGATIVE)
                        this.emitUnary(node, parentPrecedence, "-");
                    else if (node.kind == node_3.NodeKind.NOT)
                        this.emitUnary(node, parentPrecedence, "!");
                    else if (node.kind == node_3.NodeKind.POSITIVE)
                        this.emitUnary(node, parentPrecedence, "+");
                    else if (node.kind == node_3.NodeKind.POSTFIX_DECREMENT)
                        this.emitUnary(node, parentPrecedence, "--");
                    else if (node.kind == node_3.NodeKind.POSTFIX_INCREMENT)
                        this.emitUnary(node, parentPrecedence, "++");
                    else if (node.kind == node_3.NodeKind.PREFIX_DECREMENT)
                        this.emitUnary(node, parentPrecedence, "--");
                    else if (node.kind == node_3.NodeKind.PREFIX_INCREMENT)
                        this.emitUnary(node, parentPrecedence, "++");
                    else if (node.kind == node_3.NodeKind.ADD)
                        this.emitBinary(node, parentPrecedence, " + ", parser_2.Precedence.ADD);
                    else if (node.kind == node_3.NodeKind.ASSIGN)
                        this.emitBinary(node, parentPrecedence, " = ", parser_2.Precedence.ASSIGN);
                    else if (node.kind == node_3.NodeKind.BITWISE_AND)
                        this.emitBinary(node, parentPrecedence, " & ", parser_2.Precedence.BITWISE_AND);
                    else if (node.kind == node_3.NodeKind.BITWISE_OR)
                        this.emitBinary(node, parentPrecedence, " | ", parser_2.Precedence.BITWISE_OR);
                    else if (node.kind == node_3.NodeKind.BITWISE_XOR)
                        this.emitBinary(node, parentPrecedence, " ^ ", parser_2.Precedence.BITWISE_XOR);
                    else if (node.kind == node_3.NodeKind.DIVIDE)
                        this.emitBinary(node, parentPrecedence, " / ", parser_2.Precedence.MULTIPLY);
                    else if (node.kind == node_3.NodeKind.EQUAL)
                        this.emitBinary(node, parentPrecedence, " == ", parser_2.Precedence.EQUAL);
                    else if (node.kind == node_3.NodeKind.GREATER_THAN)
                        this.emitBinary(node, parentPrecedence, " > ", parser_2.Precedence.COMPARE);
                    else if (node.kind == node_3.NodeKind.GREATER_THAN_EQUAL)
                        this.emitBinary(node, parentPrecedence, " >= ", parser_2.Precedence.COMPARE);
                    else if (node.kind == node_3.NodeKind.LESS_THAN)
                        this.emitBinary(node, parentPrecedence, " < ", parser_2.Precedence.COMPARE);
                    else if (node.kind == node_3.NodeKind.LESS_THAN_EQUAL)
                        this.emitBinary(node, parentPrecedence, " <= ", parser_2.Precedence.COMPARE);
                    else if (node.kind == node_3.NodeKind.LOGICAL_AND)
                        this.emitBinary(node, parentPrecedence, " && ", parser_2.Precedence.LOGICAL_AND);
                    else if (node.kind == node_3.NodeKind.LOGICAL_OR)
                        this.emitBinary(node, parentPrecedence, " || ", parser_2.Precedence.LOGICAL_OR);
                    else if (node.kind == node_3.NodeKind.MULTIPLY)
                        this.emitBinary(node, parentPrecedence, " * ", parser_2.Precedence.MULTIPLY);
                    else if (node.kind == node_3.NodeKind.NOT_EQUAL)
                        this.emitBinary(node, parentPrecedence, " != ", parser_2.Precedence.EQUAL);
                    else if (node.kind == node_3.NodeKind.REMAINDER)
                        this.emitBinary(node, parentPrecedence, " % ", parser_2.Precedence.MULTIPLY);
                    else if (node.kind == node_3.NodeKind.SHIFT_LEFT)
                        this.emitBinary(node, parentPrecedence, " << ", parser_2.Precedence.SHIFT);
                    else if (node.kind == node_3.NodeKind.SHIFT_RIGHT)
                        this.emitBinary(node, parentPrecedence, " >> ", parser_2.Precedence.SHIFT);
                    else if (node.kind == node_3.NodeKind.SUBTRACT)
                        this.emitBinary(node, parentPrecedence, " - ", parser_2.Precedence.ADD);
                    else {
                        assert(false);
                    }
                }
                shouldEmitClass(node) {
                    assert(node.kind == node_3.NodeKind.CLASS);
                    return node.symbol.kind == symbol_3.SymbolKind.TYPE_CLASS && node.symbol != this.context.stringType.symbol;
                }
                emitType(originalType, mode) {
                    var context = this.context;
                    var code = this.code;
                    var type = originalType;
                    if (type.isEnum()) {
                        type = type.underlyingType(this.context);
                    }
                    else {
                        while (type.pointerTo != null) {
                            type = type.pointerTo;
                        }
                    }
                    if (type.isClass()) {
                        code.append("struct ");
                    }
                    if (type == context.booleanType || type == context.uint8Type)
                        code.append("uint8_t");
                    else if (type == context.int8Type)
                        code.append("int8_t");
                    else if (type == context.int32Type)
                        code.append("int32_t");
                    else if (type == context.int64Type)
                        code.append("int64_t");
                    else if (type == context.int16Type)
                        code.append("int16_t");
                    else if (type == context.stringType)
                        code.append("const uint16_t");
                    else if (type == context.uint32Type)
                        code.append("uint32_t");
                    else if (type == context.uint16Type)
                        code.append("uint16_t");
                    else if (type == context.float32Type)
                        code.append("float");
                    else
                        this.emitSymbolName(type.symbol);
                    if (originalType.pointerTo != null) {
                        code.append(' ');
                        while (originalType.pointerTo != null) {
                            code.append('*');
                            originalType = originalType.pointerTo;
                        }
                    }
                    else if (mode != TypeMode.BARE) {
                        if (type.isReference())
                            code.append(" *");
                        else if (mode == TypeMode.DECLARATION)
                            code.append(' ');
                    }
                }
                emitStatement(node) {
                    var code = this.code;
                    if (node.kind == node_3.NodeKind.IF) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        while (true) {
                            code.append("if (");
                            this.emitExpression(node.ifValue(), parser_2.Precedence.LOWEST);
                            code.append(") ");
                            this.emitBlock(node.ifTrue());
                            var no = node.ifFalse();
                            if (no == null) {
                                code.append('\n');
                                break;
                            }
                            code.append("\n\n");
                            this.emitIndent();
                            code.append("else ");
                            if (no.firstChild == null || no.firstChild != no.lastChild || no.firstChild.kind != node_3.NodeKind.IF) {
                                this.emitBlock(no);
                                code.append('\n');
                                break;
                            }
                            node = no.firstChild;
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_3.NodeKind.WHILE) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        code.append("while (");
                        this.emitExpression(node.whileValue(), parser_2.Precedence.LOWEST);
                        code.append(") ");
                        this.emitBlock(node.whileBody());
                        code.append('\n');
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_3.NodeKind.BREAK) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        code.append("break;\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_3.NodeKind.CONTINUE) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        code.append("continue;\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_3.NodeKind.EXPRESSION) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        this.emitExpression(node.expressionValue(), parser_2.Precedence.LOWEST);
                        code.append(";\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_3.NodeKind.EMPTY) {
                    }
                    else if (node.kind == node_3.NodeKind.RETURN) {
                        var value = node.returnValue();
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        if (value != null) {
                            code.append("return ");
                            this.emitExpression(value, parser_2.Precedence.LOWEST);
                            code.append(";\n");
                        }
                        else {
                            code.append("return;\n");
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_3.NodeKind.BLOCK) {
                        if (node.parent.kind == node_3.NodeKind.BLOCK) {
                            this.emitStatements(node.firstChild);
                        }
                        else {
                            this.emitNewlineBefore(node);
                            this.emitIndent();
                            this.emitBlock(node);
                            code.append('\n');
                            this.emitNewlineAfter(node);
                        }
                    }
                    else if (node.kind == node_3.NodeKind.VARIABLES) {
                        this.emitNewlineBefore(node);
                        var child = node.firstChild;
                        while (child != null) {
                            var value = child.variableValue();
                            this.emitIndent();
                            this.emitType(child.symbol.resolvedType, TypeMode.DECLARATION);
                            this.emitSymbolName(child.symbol);
                            assert(value != null);
                            code.append(" = ");
                            this.emitExpression(value, parser_2.Precedence.LOWEST);
                            code.append(";\n");
                            child = child.nextSibling;
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_3.NodeKind.CONSTANTS || node.kind == node_3.NodeKind.ENUM) {
                    }
                    else {
                        assert(false);
                    }
                }
                emitIncludes(code, mode) {
                    if (mode == SourceMode.HEADER) {
                        code.append("#include <stdint.h>\n"); // Need "int32_t" and friends
                    }
                    else {
                        code.append("#include \"").append(this.headerName).append("\"\n");
                        code.append("#include <stdlib.h>\n"); // Need "NULL" and "calloc"
                        code.append("#include <string.h>\n"); // Need "memcpy" and "memcmp"
                    }
                }
                emitTypeDeclarations(node, mode) {
                    var code = this.code;
                    while (node != null) {
                        if (node.kind == node_3.NodeKind.CLASS) {
                            if (this.shouldEmitClass(node) && (node.isDeclareOrExport() ? mode == SourceMode.HEADER : mode == SourceMode.IMPLEMENTATION)) {
                                this.emitNewlineBefore(node);
                                code.append("struct ").append(node.symbol.name).append(";\n");
                            }
                        }
                        node = node.nextSibling;
                    }
                }
                emitTypeDefinitions(node, mode) {
                    var code = this.code;
                    while (node != null) {
                        if (node.kind == node_3.NodeKind.CLASS) {
                            if (this.shouldEmitClass(node) && mode != SourceMode.HEADER) {
                                this.emitNewlineBefore(node);
                                code.append("struct ");
                                this.emitSymbolName(node.symbol);
                                code.append(" {\n");
                                this.indent = this.indent + 1;
                                // Emit member variables
                                var child = node.firstChild;
                                while (child != null) {
                                    if (child.kind == node_3.NodeKind.VARIABLE) {
                                        this.emitIndent();
                                        this.emitType(child.symbol.resolvedType, TypeMode.DECLARATION);
                                        this.emitSymbolName(child.symbol);
                                        code.append(";\n");
                                    }
                                    child = child.nextSibling;
                                }
                                this.indent = this.indent - 1;
                                code.append("};\n");
                                this.emitNewlineAfter(node);
                            }
                        }
                        else if (node.kind == node_3.NodeKind.ENUM) {
                            if (mode == SourceMode.HEADER && node.isExport()) {
                                this.emitNewlineBefore(node);
                                code.append("enum {\n");
                                this.indent = this.indent + 1;
                                // Emit enum values
                                var child = node.firstChild;
                                while (child != null) {
                                    assert(child.kind == node_3.NodeKind.VARIABLE);
                                    this.emitIndent();
                                    this.emitSymbolName(node.symbol);
                                    code.append("_");
                                    this.emitSymbolName(child.symbol);
                                    code.append(" = ");
                                    code.append(child.symbol.offset.toString());
                                    child = child.nextSibling;
                                    code.append(child != null ? ",\n" : "\n");
                                }
                                this.indent = this.indent - 1;
                                this.emitIndent();
                                code.append("};\n");
                                this.emitNewlineAfter(node);
                            }
                        }
                        node = node.nextSibling;
                    }
                }
                shouldEmitFunction(symbol) {
                    return symbol.kind != symbol_3.SymbolKind.FUNCTION_GLOBAL || symbol.name != "malloc" && symbol.name != "memcpy" && symbol.name != "memcmp";
                }
                emitFunctionDeclarations(node, mode) {
                    var code = this.code;
                    while (node != null) {
                        if (node.kind == node_3.NodeKind.FUNCTION && (mode != SourceMode.HEADER || node.isDeclareOrExport())) {
                            var symbol = node.symbol;
                            if (this.shouldEmitFunction(symbol)) {
                                var returnType = node.functionReturnType();
                                var child = node.functionFirstArgument();
                                this.emitNewlineBefore(node);
                                if (!node.isDeclareOrExport()) {
                                    code.append("static ");
                                }
                                this.emitType(returnType.resolvedType, TypeMode.DECLARATION);
                                this.emitSymbolName(symbol);
                                code.append('(');
                                if (symbol.kind == symbol_3.SymbolKind.FUNCTION_INSTANCE) {
                                    child.symbol.rename = "__this";
                                }
                                while (child != returnType) {
                                    assert(child.kind == node_3.NodeKind.VARIABLE);
                                    this.emitType(child.symbol.resolvedType, TypeMode.DECLARATION);
                                    this.emitSymbolName(child.symbol);
                                    child = child.nextSibling;
                                    if (child != returnType) {
                                        code.append(", ");
                                    }
                                }
                                code.append(");\n");
                            }
                        }
                        else if (node.kind == node_3.NodeKind.CLASS) {
                            this.emitFunctionDeclarations(node.firstChild, mode);
                        }
                        node = node.nextSibling;
                    }
                }
                emitGlobalVariables(node, mode) {
                    var code = this.code;
                    while (node != null) {
                        if (node.kind == node_3.NodeKind.VARIABLE && (mode != SourceMode.HEADER || node.isExport())) {
                            var value = node.variableValue();
                            this.emitNewlineBefore(node);
                            if (!node.isDeclareOrExport()) {
                                code.append("static ");
                            }
                            this.emitType(node.symbol.resolvedType, TypeMode.DECLARATION);
                            this.emitSymbolName(node.symbol);
                            code.append(" = ");
                            this.emitExpression(value, parser_2.Precedence.LOWEST);
                            code.append(";\n");
                        }
                        else if (node.kind == node_3.NodeKind.VARIABLES) {
                            this.emitGlobalVariables(node.firstChild, mode);
                        }
                        node = node.nextSibling;
                    }
                }
                emitFunctionDefinitions(node) {
                    var code = this.code;
                    while (node != null) {
                        if (node.kind == node_3.NodeKind.FUNCTION) {
                            var body = node.functionBody();
                            var symbol = node.symbol;
                            if (body != null && this.shouldEmitFunction(symbol)) {
                                var returnType = node.functionReturnType();
                                var child = node.firstChild;
                                this.emitNewlineBefore(node);
                                if (!node.isDeclareOrExport()) {
                                    code.append("static ");
                                }
                                this.emitType(returnType.resolvedType, TypeMode.DECLARATION);
                                this.emitSymbolName(symbol);
                                code.append('(');
                                while (child != returnType) {
                                    assert(child.kind == node_3.NodeKind.VARIABLE);
                                    this.emitType(child.symbol.resolvedType, TypeMode.DECLARATION);
                                    this.emitSymbolName(child.symbol);
                                    child = child.nextSibling;
                                    if (child != returnType) {
                                        code.append(", ");
                                    }
                                }
                                code.append(") ");
                                this.emitBlock(node.functionBody());
                                code.append('\n');
                                this.emitNewlineAfter(node);
                            }
                        }
                        else if (node.kind == node_3.NodeKind.CLASS) {
                            this.emitFunctionDefinitions(node.firstChild);
                        }
                        node = node.nextSibling;
                    }
                }
                finishImplementation() {
                    if (this.hasStrings) {
                        this.codePrefix.append("\n#undef S\n");
                    }
                }
            };
            exports_8("CResult", CResult);
        }
    };
});
System.register("js", ["stringbuilder", "symbol", "node", "parser"], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    function jsKindCastsOperandsToInt(kind) {
        return kind == node_4.NodeKind.SHIFT_LEFT || kind == node_4.NodeKind.SHIFT_RIGHT ||
            kind == node_4.NodeKind.BITWISE_OR || kind == node_4.NodeKind.BITWISE_AND || kind == node_4.NodeKind.BITWISE_XOR;
    }
    exports_9("jsKindCastsOperandsToInt", jsKindCastsOperandsToInt);
    function jsEmit(compiler) {
        var code = stringbuilder_6.StringBuilder_new();
        var result = new JsResult();
        result.context = compiler.context;
        result.code = code;
        code.append("(function(__declare, __exports) {\n");
        result.indent = 1;
        result.emitStatements(compiler.global.firstChild);
        if (result.foundMultiply) {
            code.append('\n');
            result.emitIndent();
            code.append("var __imul = Math.imul || function(a, b) {\n");
            result.indent = 2;
            result.emitIndent();
            code.append("return (a * (b >>> 16) << 16) + a * (b & 65535) | 0;\n");
            result.indent = 1;
            result.emitIndent();
            code.append("};\n");
        }
        code.append("}(\n");
        result.emitIndent();
        code.append("typeof global !== 'undefined' ? global : this,\n");
        result.emitIndent();
        code.append("typeof exports !== 'undefined' ? exports : this\n");
        code.append("));\n");
        compiler.outputJS = code.finish();
    }
    exports_9("jsEmit", jsEmit);
    var stringbuilder_6, symbol_4, node_4, parser_3, EmitBinary, JsResult;
    return {
        setters: [
            function (stringbuilder_6_1) {
                stringbuilder_6 = stringbuilder_6_1;
            },
            function (symbol_4_1) {
                symbol_4 = symbol_4_1;
            },
            function (node_4_1) {
                node_4 = node_4_1;
            },
            function (parser_3_1) {
                parser_3 = parser_3_1;
            }
        ],
        execute: function () {
            (function (EmitBinary) {
                EmitBinary[EmitBinary["NORMAL"] = 0] = "NORMAL";
                EmitBinary[EmitBinary["CAST_TO_INT"] = 1] = "CAST_TO_INT";
                EmitBinary[EmitBinary["CAST_TO_FLOAT"] = 2] = "CAST_TO_FLOAT";
                EmitBinary[EmitBinary["CAST_TO_DOUBLE"] = 3] = "CAST_TO_DOUBLE";
            })(EmitBinary || (EmitBinary = {}));
            exports_9("EmitBinary", EmitBinary);
            JsResult = class JsResult {
                emitIndent() {
                    var i = this.indent;
                    while (i > 0) {
                        this.code.append("  ");
                        i = i - 1;
                    }
                }
                emitNewlineBefore(node) {
                    if (this.previousNode != null && (!node_4.isCompactNodeKind(this.previousNode.kind) || !node_4.isCompactNodeKind(node.kind))) {
                        this.code.append('\n');
                    }
                    this.previousNode = null;
                }
                emitNewlineAfter(node) {
                    this.previousNode = node;
                }
                emitStatements(node) {
                    while (node != null) {
                        this.emitStatement(node);
                        node = node.nextSibling;
                    }
                }
                emitBlock(node) {
                    this.previousNode = null;
                    this.code.append("{\n");
                    this.indent = this.indent + 1;
                    this.emitStatements(node.firstChild);
                    this.indent = this.indent - 1;
                    this.emitIndent();
                    this.code.append('}');
                    this.previousNode = null;
                }
                emitUnary(node, parentPrecedence, operator) {
                    var isPostfix = node_4.isUnaryPostfix(node.kind);
                    var shouldCastToInt = node.kind == node_4.NodeKind.NEGATIVE && !jsKindCastsOperandsToInt(node.parent.kind);
                    var isUnsigned = node.isUnsignedOperator();
                    var operatorPrecedence = shouldCastToInt ? isUnsigned ? parser_3.Precedence.SHIFT : parser_3.Precedence.BITWISE_OR : isPostfix ? parser_3.Precedence.UNARY_POSTFIX : parser_3.Precedence.UNARY_PREFIX;
                    var code = this.code;
                    if (parentPrecedence > operatorPrecedence) {
                        code.append('(');
                    }
                    if (!isPostfix) {
                        code.append(operator);
                    }
                    this.emitExpression(node.unaryValue(), operatorPrecedence);
                    if (isPostfix) {
                        code.append(operator);
                    }
                    if (shouldCastToInt) {
                        code.append(isUnsigned ? " >>> 0" : " | 0");
                    }
                    if (parentPrecedence > operatorPrecedence) {
                        code.append(')');
                    }
                }
                emitBinary(node, parentPrecedence, operator, operatorPrecedence, mode) {
                    var isRightAssociative = node.kind == node_4.NodeKind.ASSIGN;
                    var isUnsigned = node.isUnsignedOperator();
                    var code = this.code;
                    // Avoid casting when the parent operator already does a cast
                    var shouldCastToInt = mode == EmitBinary.CAST_TO_INT && (isUnsigned || !jsKindCastsOperandsToInt(node.parent.kind));
                    var selfPrecedence = shouldCastToInt ? isUnsigned ? parser_3.Precedence.SHIFT : parser_3.Precedence.BITWISE_OR : parentPrecedence;
                    if (parentPrecedence > selfPrecedence) {
                        code.append('(');
                    }
                    if (selfPrecedence > operatorPrecedence) {
                        code.append('(');
                    }
                    this.emitExpression(node.binaryLeft(), isRightAssociative ? (operatorPrecedence + 1) : operatorPrecedence);
                    code.append(operator);
                    this.emitExpression(node.binaryRight(), isRightAssociative ? operatorPrecedence : (operatorPrecedence + 1));
                    if (selfPrecedence > operatorPrecedence) {
                        code.append(')');
                    }
                    if (shouldCastToInt) {
                        code.append(isUnsigned ? " >>> 0" : " | 0");
                    }
                    if (parentPrecedence > selfPrecedence) {
                        code.append(')');
                    }
                }
                emitCommaSeparatedExpressions(start, stop) {
                    while (start != stop) {
                        this.emitExpression(start, parser_3.Precedence.LOWEST);
                        start = start.nextSibling;
                        if (start != stop) {
                            this.code.append(", ");
                        }
                    }
                }
                emitExpression(node, parentPrecedence) {
                    var code = this.code;
                    if (node.kind == node_4.NodeKind.NAME) {
                        var symbol = node.symbol;
                        if (symbol.kind == symbol_4.SymbolKind.FUNCTION_GLOBAL && symbol.node.isDeclare()) {
                            code.append("__declare.");
                        }
                        this.emitSymbolName(symbol);
                    }
                    else if (node.kind == node_4.NodeKind.NULL) {
                        code.append("null");
                    }
                    else if (node.kind == node_4.NodeKind.BOOLEAN) {
                        code.append(node.intValue != 0 ? "true" : "false");
                    }
                    else if (node.kind == node_4.NodeKind.INT32) {
                        if (parentPrecedence == parser_3.Precedence.MEMBER) {
                            code.append('(');
                        }
                        code.append(node.resolvedType.isUnsigned()
                            ? (node.intValue).toString()
                            : node.intValue.toString());
                        if (parentPrecedence == parser_3.Precedence.MEMBER) {
                            code.append(')');
                        }
                    }
                    else if (node.kind == node_4.NodeKind.STRING) {
                        this.code.append(`\`${node.stringValue}\``);
                        // StringBuilder_appendQuoted(code, node.stringValue);
                    }
                    else if (node.kind == node_4.NodeKind.CAST) {
                        var context = this.context;
                        var value = node.castValue();
                        var from = value.resolvedType.underlyingType(context);
                        var type = node.resolvedType.underlyingType(context);
                        var fromSize = from.variableSizeOf(context);
                        var typeSize = type.variableSizeOf(context);
                        // The cast isn't needed if it's to a wider integer type
                        if (from == type || fromSize < typeSize) {
                            this.emitExpression(value, parentPrecedence);
                        }
                        else {
                            // Sign-extend
                            if (type == context.int8Type || type == context.int16Type) {
                                if (parentPrecedence > parser_3.Precedence.SHIFT) {
                                    code.append('(');
                                }
                                var shift = (32 - typeSize * 8).toString();
                                this.emitExpression(value, parser_3.Precedence.SHIFT);
                                code.append(" << ");
                                code.append(shift);
                                code.append(" >> ");
                                code.append(shift);
                                if (parentPrecedence > parser_3.Precedence.SHIFT) {
                                    code.append(')');
                                }
                            }
                            else if (type == context.uint8Type || type == context.uint16Type) {
                                if (parentPrecedence > parser_3.Precedence.BITWISE_AND) {
                                    code.append('(');
                                }
                                this.emitExpression(value, parser_3.Precedence.BITWISE_AND);
                                code.append(" & ");
                                code.append(type.integerBitMask(context).toString());
                                if (parentPrecedence > parser_3.Precedence.BITWISE_AND) {
                                    code.append(')');
                                }
                            }
                            else if (type == context.int32Type) {
                                if (parentPrecedence > parser_3.Precedence.BITWISE_OR) {
                                    code.append('(');
                                }
                                this.emitExpression(value, parser_3.Precedence.BITWISE_OR);
                                code.append(" | 0");
                                if (parentPrecedence > parser_3.Precedence.BITWISE_OR) {
                                    code.append(')');
                                }
                            }
                            else if (type == context.uint32Type) {
                                if (parentPrecedence > parser_3.Precedence.SHIFT) {
                                    code.append('(');
                                }
                                this.emitExpression(value, parser_3.Precedence.SHIFT);
                                code.append(" >>> 0");
                                if (parentPrecedence > parser_3.Precedence.SHIFT) {
                                    code.append(')');
                                }
                            }
                            else {
                                this.emitExpression(value, parentPrecedence);
                            }
                        }
                    }
                    else if (node.kind == node_4.NodeKind.DOT) {
                        this.emitExpression(node.dotTarget(), parser_3.Precedence.MEMBER);
                        code.append('.');
                        this.emitSymbolName(node.symbol);
                    }
                    else if (node.kind == node_4.NodeKind.HOOK) {
                        if (parentPrecedence > parser_3.Precedence.ASSIGN) {
                            code.append('(');
                        }
                        this.emitExpression(node.hookValue(), parser_3.Precedence.LOGICAL_OR);
                        code.append(" ? ");
                        this.emitExpression(node.hookTrue(), parser_3.Precedence.ASSIGN);
                        code.append(" : ");
                        this.emitExpression(node.hookFalse(), parser_3.Precedence.ASSIGN);
                        if (parentPrecedence > parser_3.Precedence.ASSIGN) {
                            code.append(')');
                        }
                    }
                    else if (node.kind == node_4.NodeKind.INDEX) {
                        var value = node.indexTarget();
                        this.emitExpression(value, parser_3.Precedence.UNARY_POSTFIX);
                        code.append('[');
                        this.emitCommaSeparatedExpressions(value.nextSibling, null);
                        code.append(']');
                    }
                    else if (node.kind == node_4.NodeKind.CALL) {
                        if (node.expandCallIntoOperatorTree()) {
                            this.emitExpression(node, parentPrecedence);
                        }
                        else {
                            var value = node.callValue();
                            this.emitExpression(value, parser_3.Precedence.UNARY_POSTFIX);
                            if (value.symbol == null || !value.symbol.isGetter()) {
                                code.append('(');
                                this.emitCommaSeparatedExpressions(value.nextSibling, null);
                                code.append(')');
                            }
                        }
                    }
                    else if (node.kind == node_4.NodeKind.NEW) {
                        code.append("new ");
                        this.emitExpression(node.newType(), parser_3.Precedence.UNARY_POSTFIX);
                        code.append("()");
                    }
                    else if (node.kind == node_4.NodeKind.NOT) {
                        var value = node.unaryValue();
                        // Automatically invert operators for readability
                        value.expandCallIntoOperatorTree();
                        var invertedKind = node_4.invertedBinaryKind(value.kind);
                        if (invertedKind != value.kind) {
                            value.kind = invertedKind;
                            this.emitExpression(value, parentPrecedence);
                        }
                        else {
                            this.emitUnary(node, parentPrecedence, "!");
                        }
                    }
                    else if (node.kind == node_4.NodeKind.COMPLEMENT)
                        this.emitUnary(node, parentPrecedence, "~");
                    else if (node.kind == node_4.NodeKind.NEGATIVE)
                        this.emitUnary(node, parentPrecedence, "-");
                    else if (node.kind == node_4.NodeKind.POSITIVE)
                        this.emitUnary(node, parentPrecedence, "+");
                    else if (node.kind == node_4.NodeKind.PREFIX_INCREMENT)
                        this.emitUnary(node, parentPrecedence, "++");
                    else if (node.kind == node_4.NodeKind.PREFIX_DECREMENT)
                        this.emitUnary(node, parentPrecedence, "--");
                    else if (node.kind == node_4.NodeKind.POSTFIX_INCREMENT)
                        this.emitUnary(node, parentPrecedence, "++");
                    else if (node.kind == node_4.NodeKind.POSTFIX_DECREMENT)
                        this.emitUnary(node, parentPrecedence, "--");
                    else if (node.kind == node_4.NodeKind.ADD)
                        this.emitBinary(node, parentPrecedence, " + ", parser_3.Precedence.ADD, EmitBinary.CAST_TO_INT);
                    else if (node.kind == node_4.NodeKind.ASSIGN)
                        this.emitBinary(node, parentPrecedence, " = ", parser_3.Precedence.ASSIGN, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.BITWISE_AND)
                        this.emitBinary(node, parentPrecedence, " & ", parser_3.Precedence.BITWISE_AND, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.BITWISE_OR)
                        this.emitBinary(node, parentPrecedence, " | ", parser_3.Precedence.BITWISE_OR, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.BITWISE_XOR)
                        this.emitBinary(node, parentPrecedence, " ^ ", parser_3.Precedence.BITWISE_XOR, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.DIVIDE)
                        this.emitBinary(node, parentPrecedence, " / ", parser_3.Precedence.MULTIPLY, EmitBinary.CAST_TO_INT);
                    else if (node.kind == node_4.NodeKind.EQUAL)
                        this.emitBinary(node, parentPrecedence, " === ", parser_3.Precedence.EQUAL, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.GREATER_THAN)
                        this.emitBinary(node, parentPrecedence, " > ", parser_3.Precedence.COMPARE, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.GREATER_THAN_EQUAL)
                        this.emitBinary(node, parentPrecedence, " >= ", parser_3.Precedence.COMPARE, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.LESS_THAN)
                        this.emitBinary(node, parentPrecedence, " < ", parser_3.Precedence.COMPARE, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.LESS_THAN_EQUAL)
                        this.emitBinary(node, parentPrecedence, " <= ", parser_3.Precedence.COMPARE, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.LOGICAL_AND)
                        this.emitBinary(node, parentPrecedence, " && ", parser_3.Precedence.LOGICAL_AND, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.LOGICAL_OR)
                        this.emitBinary(node, parentPrecedence, " || ", parser_3.Precedence.LOGICAL_OR, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.NOT_EQUAL)
                        this.emitBinary(node, parentPrecedence, " !== ", parser_3.Precedence.EQUAL, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.REMAINDER)
                        this.emitBinary(node, parentPrecedence, " % ", parser_3.Precedence.MULTIPLY, EmitBinary.CAST_TO_INT);
                    else if (node.kind == node_4.NodeKind.SHIFT_LEFT)
                        this.emitBinary(node, parentPrecedence, " << ", parser_3.Precedence.SHIFT, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.SHIFT_RIGHT)
                        this.emitBinary(node, parentPrecedence, node.isUnsignedOperator() ? " >>> " : " >> ", parser_3.Precedence.SHIFT, EmitBinary.NORMAL);
                    else if (node.kind == node_4.NodeKind.SUBTRACT)
                        this.emitBinary(node, parentPrecedence, " - ", parser_3.Precedence.ADD, EmitBinary.CAST_TO_INT);
                    else if (node.kind == node_4.NodeKind.MULTIPLY) {
                        var left = node.binaryLeft();
                        var right = node.binaryRight();
                        var isUnsigned = node.isUnsignedOperator();
                        if (isUnsigned && parentPrecedence > parser_3.Precedence.SHIFT) {
                            code.append('(');
                        }
                        code.append("__imul(");
                        this.emitExpression(left, parser_3.Precedence.LOWEST);
                        code.append(", ");
                        this.emitExpression(right, parser_3.Precedence.LOWEST);
                        code.append(')');
                        this.foundMultiply = true;
                        if (isUnsigned) {
                            code.append(" >>> 0");
                            if (parentPrecedence > parser_3.Precedence.SHIFT) {
                                code.append(')');
                            }
                        }
                    }
                    else {
                        assert(false);
                    }
                }
                emitSymbolName(symbol) {
                    this.code.append(symbol.rename != null ? symbol.rename : symbol.name);
                }
                emitStatement(node) {
                    var code = this.code;
                    if (node.kind == node_4.NodeKind.FUNCTION) {
                        var body = node.functionBody();
                        if (body == null) {
                            return;
                        }
                        var symbol = node.symbol;
                        var needsSemicolon = false;
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        if (symbol.kind == symbol_4.SymbolKind.FUNCTION_INSTANCE) {
                            this.emitSymbolName(symbol.parent());
                            code.append(".prototype.");
                            this.emitSymbolName(symbol);
                            code.append(" = function");
                            needsSemicolon = true;
                        }
                        else if (node.isExport()) {
                            code.append("var ");
                            this.emitSymbolName(symbol);
                            code.append(" = __exports.");
                            this.emitSymbolName(symbol);
                            code.append(" = function");
                            needsSemicolon = true;
                        }
                        else {
                            code.append("function ");
                            this.emitSymbolName(symbol);
                        }
                        code.append('(');
                        var returnType = node.functionReturnType();
                        var child = node.functionFirstArgumentIgnoringThis();
                        while (child != returnType) {
                            assert(child.kind == node_4.NodeKind.VARIABLE);
                            this.emitSymbolName(child.symbol);
                            child = child.nextSibling;
                            if (child != returnType) {
                                code.append(", ");
                            }
                        }
                        code.append(") ");
                        this.emitBlock(node.functionBody());
                        code.append(needsSemicolon ? ";\n" : "\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_4.NodeKind.IF) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        while (true) {
                            code.append("if (");
                            this.emitExpression(node.ifValue(), parser_3.Precedence.LOWEST);
                            code.append(") ");
                            this.emitBlock(node.ifTrue());
                            var no = node.ifFalse();
                            if (no == null) {
                                code.append('\n');
                                break;
                            }
                            code.append("\n\n");
                            this.emitIndent();
                            code.append("else ");
                            if (no.firstChild == null || no.firstChild != no.lastChild || no.firstChild.kind != node_4.NodeKind.IF) {
                                this.emitBlock(no);
                                code.append('\n');
                                break;
                            }
                            node = no.firstChild;
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_4.NodeKind.WHILE) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        code.append("while (");
                        this.emitExpression(node.whileValue(), parser_3.Precedence.LOWEST);
                        code.append(") ");
                        this.emitBlock(node.whileBody());
                        code.append('\n');
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_4.NodeKind.BREAK) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        code.append("break;\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_4.NodeKind.CONTINUE) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        code.append("continue;\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_4.NodeKind.EXPRESSION) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        this.emitExpression(node.expressionValue(), parser_3.Precedence.LOWEST);
                        code.append(";\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_4.NodeKind.EMPTY) {
                    }
                    else if (node.kind == node_4.NodeKind.RETURN) {
                        var value = node.returnValue();
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        if (value != null) {
                            code.append("return ");
                            this.emitExpression(value, parser_3.Precedence.LOWEST);
                            code.append(";\n");
                        }
                        else {
                            code.append("return;\n");
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_4.NodeKind.BLOCK) {
                        if (node.parent.kind == node_4.NodeKind.BLOCK) {
                            this.emitStatements(node.firstChild);
                        }
                        else {
                            this.emitNewlineBefore(node);
                            this.emitIndent();
                            this.emitBlock(node);
                            code.append('\n');
                            this.emitNewlineAfter(node);
                        }
                    }
                    else if (node.kind == node_4.NodeKind.VARIABLES) {
                        this.emitNewlineBefore(node);
                        this.emitIndent();
                        code.append("var ");
                        var child = node.firstChild;
                        while (child != null) {
                            var value = child.variableValue();
                            this.emitSymbolName(child.symbol);
                            child = child.nextSibling;
                            if (child != null) {
                                code.append(", ");
                            }
                            assert(value != null);
                            code.append(" = ");
                            this.emitExpression(value, parser_3.Precedence.LOWEST);
                        }
                        code.append(";\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_4.NodeKind.CLASS) {
                        // Emit constructor
                        if (!node.isDeclare()) {
                            this.emitNewlineBefore(node);
                            this.emitIndent();
                            code.append("function ");
                            this.emitSymbolName(node.symbol);
                            code.append("() {\n");
                            this.indent = this.indent + 1;
                            var argument = node.firstChild;
                            while (argument != null) {
                                if (argument.kind == node_4.NodeKind.VARIABLE) {
                                    this.emitIndent();
                                    code.append("this.");
                                    this.emitSymbolName(argument.symbol);
                                    code.append(" = ");
                                    this.emitExpression(argument.variableValue(), parser_3.Precedence.LOWEST);
                                    code.append(";\n");
                                }
                                argument = argument.nextSibling;
                            }
                            this.indent = this.indent - 1;
                            this.emitIndent();
                            code.append("}\n");
                            this.emitNewlineAfter(node);
                        }
                        // Emit instance functions
                        var child = node.firstChild;
                        while (child != null) {
                            if (child.kind == node_4.NodeKind.FUNCTION) {
                                this.emitStatement(child);
                            }
                            child = child.nextSibling;
                        }
                    }
                    else if (node.kind == node_4.NodeKind.ENUM) {
                        if (node.isExport()) {
                            this.emitNewlineBefore(node);
                            this.emitIndent();
                            code.append("__exports.");
                            this.emitSymbolName(node.symbol);
                            code.append(" = {\n");
                            this.indent = this.indent + 1;
                            // Emit enum values
                            var child = node.firstChild;
                            while (child != null) {
                                assert(child.kind == node_4.NodeKind.VARIABLE);
                                this.emitIndent();
                                this.emitSymbolName(child.symbol);
                                code.append(": ");
                                code.append(child.symbol.offset.toString());
                                child = child.nextSibling;
                                code.append(child != null ? ",\n" : "\n");
                            }
                            this.indent = this.indent - 1;
                            this.emitIndent();
                            code.append("};\n");
                            this.emitNewlineAfter(node);
                        }
                    }
                    else if (node.kind == node_4.NodeKind.CONSTANTS) {
                    }
                    else {
                        assert(false);
                    }
                }
            };
            exports_9("JsResult", JsResult);
        }
    };
});
System.register("turbojs", ["stringbuilder", "node", "parser", "js", "symbol"], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    // function jsKindCastsOperandsToInt(kind: NodeKind): boolean {
    //   return
    //     kind == NodeKind.SHIFT_LEFT || kind == NodeKind.SHIFT_RIGHT ||
    //     kind == NodeKind.BITWISE_OR || kind == NodeKind.BITWISE_AND || kind == NodeKind.BITWISE_XOR;
    // }
    function turboJsEmit(compiler) {
        let code = stringbuilder_7.StringBuilder_new();
        let result = new TurboJsResult();
        result.context = compiler.context;
        result.code = code;
        code.append("function TurboModule(global, env, buffer) {\n");
        code.emitIndent(1);
        code.append(compiler.runtimeSource);
        result.emitStatements(compiler.global.firstChild);
        result.emitVirtuals();
        if (result.foundMultiply) {
            code.append("\n");
            code.append("let __imul = Math.imul || function(a, b) {\n");
            code.append("return (a * (b >>> 16) << 16) + a * (b & 65535) | 0;\n");
            code.append("};\n");
        }
        code.append("return {\n");
        code.append(`   getMemoryUsage:getMemoryUsage${exportedFunctions.length > 0 ? "," : ""}\n`);
        exportedFunctions.forEach((name, index) => {
            code.append(`   ${name}:${name}${index < exportedFunctions.length - 1 ? "," : ""}\n`);
        });
        code.append("}\n");
        code.indent -= 1;
        code.clearIndent(1);
        code.append("}\n");
        code.append(compiler.wrapperSource);
        compiler.outputJS = code.finish();
    }
    exports_10("turboJsEmit", turboJsEmit);
    var stringbuilder_7, node_5, parser_4, js_1, symbol_5, optimization, classMap, virtualMap, currentClass, turboTargetPointer, namespace, exportedFunctions, TurboJsResult;
    return {
        setters: [
            function (stringbuilder_7_1) {
                stringbuilder_7 = stringbuilder_7_1;
            },
            function (node_5_1) {
                node_5 = node_5_1;
            },
            function (parser_4_1) {
                parser_4 = parser_4_1;
            },
            function (js_1_1) {
                js_1 = js_1_1;
            },
            function (symbol_5_1) {
                symbol_5 = symbol_5_1;
            }
        ],
        execute: function () {
            optimization = 0;
            classMap = new Map();
            virtualMap = new Map();
            namespace = "";
            exportedFunctions = [];
            TurboJsResult = class TurboJsResult {
                emitNewlineBefore(node) {
                    if (this.previousNode != null && (!node_5.isCompactNodeKind(this.previousNode.kind) || !node_5.isCompactNodeKind(node.kind))) {
                        this.code.append("\n");
                    }
                    this.previousNode = null;
                }
                emitNewlineAfter(node) {
                    this.previousNode = node;
                }
                emitStatements(node) {
                    while (node != null) {
                        this.emitStatement(node);
                        node = node.nextSibling;
                    }
                }
                emitBlock(node, needBraces) {
                    this.previousNode = null;
                    if (needBraces) {
                        this.code.append("{\n", 1);
                    }
                    this.emitStatements(node.firstChild);
                    if (needBraces) {
                        this.code.clearIndent(1);
                        this.code.append("}");
                        this.code.indent -= 1;
                    }
                    this.previousNode = null;
                }
                emitUnary(node, parentPrecedence, operator) {
                    let isPostfix = node_5.isUnaryPostfix(node.kind);
                    let shouldCastToInt = !node.resolvedType.isFloat() && node.kind == node_5.NodeKind.NEGATIVE && !js_1.jsKindCastsOperandsToInt(node.parent.kind);
                    let isUnsigned = node.isUnsignedOperator();
                    let operatorPrecedence = shouldCastToInt ? isUnsigned ? parser_4.Precedence.SHIFT : parser_4.Precedence.BITWISE_OR : isPostfix ? parser_4.Precedence.UNARY_POSTFIX : parser_4.Precedence.UNARY_PREFIX;
                    if (parentPrecedence > operatorPrecedence) {
                        this.code.append("(");
                    }
                    if (!isPostfix) {
                        this.code.append(operator);
                    }
                    this.emitExpression(node.unaryValue(), operatorPrecedence);
                    if (isPostfix) {
                        this.code.append(operator);
                    }
                    if (shouldCastToInt) {
                        this.code.append(isUnsigned ? " >>> 0" : " | 0");
                    }
                    if (parentPrecedence > operatorPrecedence) {
                        this.code.append(")");
                    }
                }
                emitBinary(node, parentPrecedence, operator, operatorPrecedence, mode) {
                    let isRightAssociative = node.kind == node_5.NodeKind.ASSIGN;
                    let isUnsigned = node.isUnsignedOperator();
                    // Avoid casting when the parent operator already does a cast
                    let shouldCastToInt = mode == js_1.EmitBinary.CAST_TO_INT && (isUnsigned || !js_1.jsKindCastsOperandsToInt(node.parent.kind));
                    let selfPrecedence = shouldCastToInt ? isUnsigned ? parser_4.Precedence.SHIFT : parser_4.Precedence.BITWISE_OR : parentPrecedence;
                    if (parentPrecedence > selfPrecedence) {
                        this.code.append("(");
                    }
                    if (selfPrecedence > operatorPrecedence) {
                        this.code.append("(");
                    }
                    this.emitExpression(node.binaryLeft(), isRightAssociative ? (operatorPrecedence + 1) : operatorPrecedence);
                    this.code.append(operator);
                    this.emitExpression(node.binaryRight(), isRightAssociative ? operatorPrecedence : (operatorPrecedence + 1));
                    if (selfPrecedence > operatorPrecedence) {
                        this.code.append(")");
                    }
                    if (shouldCastToInt) {
                        this.code.append(isUnsigned ? " >>> 0" : " | 0");
                    }
                    if (parentPrecedence > selfPrecedence) {
                        this.code.append(")");
                    }
                }
                emitCommaSeparatedExpressions(start, stop, needComma = false) {
                    while (start != stop) {
                        if (needComma) {
                            this.code.append(" , ");
                            needComma = false;
                        }
                        this.emitExpression(start, parser_4.Precedence.LOWEST);
                        start = start.nextSibling;
                        if (start != stop) {
                            this.code.append(", ");
                        }
                    }
                }
                emitExpression(node, parentPrecedence) {
                    if (node.kind == node_5.NodeKind.NAME) {
                        let symbol = node.symbol;
                        if (symbol.kind == symbol_5.SymbolKind.FUNCTION_GLOBAL && symbol.node.isDeclare()) {
                            this.code.append("global.");
                        }
                        this.emitSymbolName(symbol);
                    }
                    else if (node.kind == node_5.NodeKind.NULL) {
                        this.code.append("0");
                    }
                    else if (node.kind == node_5.NodeKind.UNDEFINED) {
                        this.code.append("undefined");
                    }
                    else if (node.kind == node_5.NodeKind.BOOLEAN) {
                        this.code.append(node.intValue != 0 ? "true" : "false");
                    }
                    else if (node.kind == node_5.NodeKind.INT32) {
                        if (parentPrecedence == parser_4.Precedence.MEMBER) {
                            this.code.append("(");
                        }
                        this.code.append(node.resolvedType.isUnsigned() ? (node.intValue).toString() : node.intValue.toString());
                        if (parentPrecedence == parser_4.Precedence.MEMBER) {
                            this.code.append(")");
                        }
                    }
                    else if (node.kind == node_5.NodeKind.FLOAT32) {
                        if (parentPrecedence == parser_4.Precedence.MEMBER) {
                            this.code.append("(");
                        }
                        this.code.append(node.floatValue.toString());
                        if (parentPrecedence == parser_4.Precedence.MEMBER) {
                            this.code.append(")");
                        }
                    }
                    else if (node.kind == node_5.NodeKind.STRING) {
                        this.code.append(`\`${node.stringValue}\``);
                    }
                    else if (node.kind == node_5.NodeKind.CAST) {
                        let context = this.context;
                        let value = node.castValue();
                        let from = value.resolvedType.underlyingType(context);
                        let type = node.resolvedType.underlyingType(context);
                        let fromSize = from.variableSizeOf(context);
                        let typeSize = type.variableSizeOf(context);
                        // The cast isn't needed if it's to a wider integer type
                        if (from == type || fromSize < typeSize) {
                            this.emitExpression(value, parentPrecedence);
                        }
                        else {
                            // Sign-extend
                            if (type == context.int8Type || type == context.int16Type) {
                                if (parentPrecedence > parser_4.Precedence.SHIFT) {
                                    this.code.append("(");
                                }
                                let shift = (32 - typeSize * 8).toString();
                                this.emitExpression(value, parser_4.Precedence.SHIFT);
                                this.code.append(" << ");
                                this.code.append(shift);
                                this.code.append(" >> ");
                                this.code.append(shift);
                                if (parentPrecedence > parser_4.Precedence.SHIFT) {
                                    this.code.append(")");
                                }
                            }
                            else if (type == context.uint8Type || type == context.uint16Type) {
                                if (parentPrecedence > parser_4.Precedence.BITWISE_AND) {
                                    this.code.append("(");
                                }
                                this.emitExpression(value, parser_4.Precedence.BITWISE_AND);
                                this.code.append(" & ");
                                this.code.append(type.integerBitMask(context).toString());
                                if (parentPrecedence > parser_4.Precedence.BITWISE_AND) {
                                    this.code.append(")");
                                }
                            }
                            else if (type == context.int32Type) {
                                if (parentPrecedence > parser_4.Precedence.BITWISE_OR) {
                                    this.code.append("(");
                                }
                                this.emitExpression(value, parser_4.Precedence.BITWISE_OR);
                                this.code.append(" | 0");
                                if (parentPrecedence > parser_4.Precedence.BITWISE_OR) {
                                    this.code.append(")");
                                }
                            }
                            else if (type == context.uint32Type) {
                                if (parentPrecedence > parser_4.Precedence.SHIFT) {
                                    this.code.append("(");
                                }
                                this.emitExpression(value, parser_4.Precedence.SHIFT);
                                this.code.append(" >>> 0");
                                if (parentPrecedence > parser_4.Precedence.SHIFT) {
                                    this.code.append(")");
                                }
                            }
                            else {
                                this.emitExpression(value, parentPrecedence);
                            }
                        }
                    }
                    else if (node.kind == node_5.NodeKind.DOT) {
                        let dotTarget = node.dotTarget();
                        let resolvedTargetNode = dotTarget.resolvedType.symbol.node;
                        let targetSymbolName;
                        if (dotTarget.symbol) {
                            targetSymbolName = dotTarget.symbol.name;
                        }
                        else {
                            targetSymbolName = "(::unknown::)";
                        }
                        let resolvedNode = null;
                        if (node.resolvedType.pointerTo) {
                            resolvedNode = node.resolvedType.pointerTo.symbol.node;
                        }
                        else {
                            resolvedNode = node.resolvedType.symbol.node;
                        }
                        if (resolvedTargetNode.isJavaScript()) {
                            this.emitExpression(node.dotTarget(), parser_4.Precedence.MEMBER);
                            this.code.append(".");
                            this.emitSymbolName(node.symbol);
                        }
                        else {
                            let ref = targetSymbolName == "this" ? "ptr" : targetSymbolName;
                            if (node.symbol.kind == symbol_5.SymbolKind.VARIABLE_INSTANCE) {
                                let memory = classMap.get(currentClass).members[node.symbol.name].memory;
                                let offset = classMap.get(currentClass).members[node.symbol.name].offset;
                                let shift = classMap.get(currentClass).members[node.symbol.name].shift;
                                //check if
                                if (node.parent.kind == node_5.NodeKind.DOT) {
                                    //store the variable pointer, we need to move it as function argument
                                    turboTargetPointer = `${namespace}${memory}[(${ref} + ${offset}) >> ${shift}]`;
                                    //emit class name for static call
                                    this.code.append(`${resolvedNode.symbol.name}`);
                                }
                                else {
                                    this.code.append(`${namespace}${memory}[(${ref} + ${offset}) >> ${shift}]`);
                                }
                            }
                            else if (node.symbol.kind == symbol_5.SymbolKind.FUNCTION_INSTANCE) {
                                turboTargetPointer = ref;
                                this.code.append(resolvedTargetNode.stringValue);
                                this.code.append(".");
                                this.emitSymbolName(node.symbol);
                            }
                            else {
                                this.emitExpression(dotTarget, parser_4.Precedence.MEMBER);
                                this.code.append(".");
                                this.emitSymbolName(node.symbol);
                            }
                        }
                    }
                    else if (node.kind == node_5.NodeKind.HOOK) {
                        if (parentPrecedence > parser_4.Precedence.ASSIGN) {
                            this.code.append("(");
                        }
                        this.emitExpression(node.hookValue(), parser_4.Precedence.LOGICAL_OR);
                        this.code.append(" ? ");
                        this.emitExpression(node.hookTrue(), parser_4.Precedence.ASSIGN);
                        this.code.append(" : ");
                        this.emitExpression(node.hookFalse(), parser_4.Precedence.ASSIGN);
                        if (parentPrecedence > parser_4.Precedence.ASSIGN) {
                            this.code.append(")");
                        }
                    }
                    else if (node.kind == node_5.NodeKind.INDEX) {
                        let value = node.indexTarget();
                        this.emitExpression(value, parser_4.Precedence.UNARY_POSTFIX);
                        this.code.append("[");
                        this.emitCommaSeparatedExpressions(value.nextSibling, null);
                        this.code.append("]");
                    }
                    else if (node.kind == node_5.NodeKind.CALL) {
                        if (node.expandCallIntoOperatorTree()) {
                            this.emitExpression(node, parentPrecedence);
                        }
                        else {
                            let value = node.callValue();
                            this.emitExpression(value, parser_4.Precedence.UNARY_POSTFIX);
                            if (value.symbol == null || !value.symbol.isGetter()) {
                                this.code.append("(");
                                let needComma = false;
                                if (node.firstChild) {
                                    let firstNode = node.firstChild.resolvedType.symbol.node;
                                    if (!firstNode.isDeclare() && turboTargetPointer) {
                                        this.code.append(`${turboTargetPointer}`);
                                        needComma = true;
                                    }
                                }
                                this.emitCommaSeparatedExpressions(value.nextSibling, null, needComma);
                                this.code.append(")");
                            }
                        }
                    }
                    else if (node.kind == node_5.NodeKind.NEW) {
                        let resolvedNode = node.resolvedType.symbol.node;
                        let type = node.newType();
                        if (resolvedNode.isJavaScript()) {
                            this.code.append("new ");
                            this.emitExpression(type, parser_4.Precedence.UNARY_POSTFIX);
                        }
                        else {
                            this.emitExpression(type, parser_4.Precedence.UNARY_POSTFIX);
                            this.code.append("_new");
                        }
                        this.code.append("(");
                        let valueNode = type.nextSibling;
                        while (valueNode) {
                            this.code.append(`${valueNode.rawValue}`);
                            if (valueNode.nextSibling) {
                                this.code.append(",");
                                valueNode = valueNode.nextSibling;
                            }
                            else {
                                valueNode = null;
                            }
                        }
                        this.code.append(")");
                    }
                    else if (node.kind == node_5.NodeKind.NOT) {
                        let value = node.unaryValue();
                        // Automatically invert operators for readability
                        value.expandCallIntoOperatorTree();
                        let invertedKind = node_5.invertedBinaryKind(value.kind);
                        if (invertedKind != value.kind) {
                            value.kind = invertedKind;
                            this.emitExpression(value, parentPrecedence);
                        }
                        else {
                            this.emitUnary(node, parentPrecedence, "!");
                        }
                    }
                    else if (node.kind == node_5.NodeKind.COMPLEMENT)
                        this.emitUnary(node, parentPrecedence, "~");
                    else if (node.kind == node_5.NodeKind.NEGATIVE)
                        this.emitUnary(node, parentPrecedence, "-");
                    else if (node.kind == node_5.NodeKind.POSITIVE)
                        this.emitUnary(node, parentPrecedence, "+");
                    else if (node.kind == node_5.NodeKind.PREFIX_INCREMENT)
                        this.emitUnary(node, parentPrecedence, "++");
                    else if (node.kind == node_5.NodeKind.PREFIX_DECREMENT)
                        this.emitUnary(node, parentPrecedence, "--");
                    else if (node.kind == node_5.NodeKind.POSTFIX_INCREMENT)
                        this.emitUnary(node, parentPrecedence, "++");
                    else if (node.kind == node_5.NodeKind.POSTFIX_DECREMENT)
                        this.emitUnary(node, parentPrecedence, "--");
                    else if (node.kind == node_5.NodeKind.ADD) {
                        this.emitBinary(node, parentPrecedence, " + ", parser_4.Precedence.ADD, node.parent.kind == node_5.NodeKind.INT32 ? js_1.EmitBinary.CAST_TO_INT : js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.ASSIGN) {
                        this.emitBinary(node, parentPrecedence, " = ", parser_4.Precedence.ASSIGN, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.BITWISE_AND) {
                        this.emitBinary(node, parentPrecedence, " & ", parser_4.Precedence.BITWISE_AND, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.BITWISE_OR) {
                        this.emitBinary(node, parentPrecedence, " | ", parser_4.Precedence.BITWISE_OR, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.BITWISE_XOR) {
                        this.emitBinary(node, parentPrecedence, " ^ ", parser_4.Precedence.BITWISE_XOR, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.DIVIDE) {
                        this.emitBinary(node, parentPrecedence, " / ", parser_4.Precedence.MULTIPLY, node.parent.kind == node_5.NodeKind.INT32 ? js_1.EmitBinary.CAST_TO_INT : js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.EQUAL) {
                        this.emitBinary(node, parentPrecedence, " === ", parser_4.Precedence.EQUAL, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.GREATER_THAN) {
                        this.emitBinary(node, parentPrecedence, " > ", parser_4.Precedence.COMPARE, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.GREATER_THAN_EQUAL) {
                        this.emitBinary(node, parentPrecedence, " >= ", parser_4.Precedence.COMPARE, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.LESS_THAN) {
                        this.emitBinary(node, parentPrecedence, " < ", parser_4.Precedence.COMPARE, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.LESS_THAN_EQUAL) {
                        this.emitBinary(node, parentPrecedence, " <= ", parser_4.Precedence.COMPARE, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.LOGICAL_AND) {
                        this.emitBinary(node, parentPrecedence, " && ", parser_4.Precedence.LOGICAL_AND, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.LOGICAL_OR) {
                        this.emitBinary(node, parentPrecedence, " || ", parser_4.Precedence.LOGICAL_OR, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.NOT_EQUAL) {
                        this.emitBinary(node, parentPrecedence, " !== ", parser_4.Precedence.EQUAL, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.REMAINDER) {
                        this.emitBinary(node, parentPrecedence, " % ", parser_4.Precedence.MULTIPLY, node.parent.kind == node_5.NodeKind.INT32 ? js_1.EmitBinary.CAST_TO_INT : js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.SHIFT_LEFT) {
                        this.emitBinary(node, parentPrecedence, " << ", parser_4.Precedence.SHIFT, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.SHIFT_RIGHT) {
                        this.emitBinary(node, parentPrecedence, node.isUnsignedOperator() ? " >>> " : " >> ", parser_4.Precedence.SHIFT, js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.SUBTRACT) {
                        this.emitBinary(node, parentPrecedence, " - ", parser_4.Precedence.ADD, node.parent.kind == node_5.NodeKind.INT32 ? js_1.EmitBinary.CAST_TO_INT : js_1.EmitBinary.NORMAL);
                    }
                    else if (node.kind == node_5.NodeKind.MULTIPLY) {
                        let left = node.binaryLeft();
                        let right = node.binaryRight();
                        let isUnsigned = node.isUnsignedOperator();
                        if (isUnsigned && parentPrecedence > parser_4.Precedence.SHIFT) {
                            this.code.append("(");
                        }
                        if (left.intValue && right.intValue) {
                            this.code.append("__imul(");
                            this.emitExpression(left, parser_4.Precedence.LOWEST);
                            this.code.append(", ");
                            this.emitExpression(right, parser_4.Precedence.LOWEST);
                            this.code.append(")");
                            if (isUnsigned) {
                                this.code.append(" >>> 0");
                                if (parentPrecedence > parser_4.Precedence.SHIFT) {
                                    this.code.append(")");
                                }
                            }
                        }
                        else {
                            this.emitExpression(left, parser_4.Precedence.LOWEST);
                            this.code.append(" * ");
                            this.emitExpression(right, parser_4.Precedence.LOWEST);
                        }
                        this.foundMultiply = true;
                    }
                    else {
                        assert(false);
                    }
                }
                emitSymbolName(symbol) {
                    let name = symbol.rename != null ? symbol.rename : symbol.name;
                    this.code.append(name);
                    return name;
                }
                emitStatement(node) {
                    if (node.kind == node_5.NodeKind.EXTENDS) {
                        console.log("Extends found");
                        this.code.append(" /*extends*/ ");
                    }
                    else if (node.kind == node_5.NodeKind.MODULE) {
                    }
                    else if (node.kind == node_5.NodeKind.CLASS) {
                        currentClass = node.symbol.name;
                        let classDef = this.getClassDef(node);
                        let isTurbo = !node.isJavaScript();
                        // Emit constructor
                        if (!node.isDeclare()) {
                            this.emitNewlineBefore(node);
                            if (isTurbo) {
                                //Emit class object
                                // this.code.append(`let ${classDef.name} = {};\n`);
                                // this.code.append(`var ${classDef.name}_NAME = "${classDef.name}";\n`);
                                this.code.append(`var ${classDef.name}_SIZE = ${classDef.size};\n`);
                                this.code.append(`var ${classDef.name}_ALIGN = ${classDef.align};\n`);
                                this.code.append(`var ${classDef.name}_CLSID = ${classDef.clsid};\n`);
                                if (classDef.base) {
                                    // this.code.append(`var ${classDef.name}_BASE = "${classDef.base}";\n`);
                                }
                                // this.code.append(`${namespace}_idToType[${classDef.name}.CLSID] = ${classDef.name};\n`);
                            }
                            else {
                                this.code.append(`class ${classDef.name} {`);
                            }
                            this.emitNewlineAfter(node);
                        }
                        // Emit instance functions
                        let child = node.firstChild;
                        while (child != null) {
                            if (child.kind == node_5.NodeKind.FUNCTION) {
                                if (!isTurbo)
                                    this.code.indent += 1;
                                this.emitStatement(child);
                                if (!isTurbo)
                                    this.code.indent -= 1;
                            }
                            child = child.nextSibling;
                        }
                        if (!node.isDeclare() && !isTurbo) {
                            this.code.clearIndent(1);
                            this.code.append("}\n");
                        }
                        if (node.isExport()) {
                            // this.code.append(`${classDef.name} = ${classDef.name};\n`);
                            exportedFunctions.push(classDef.name);
                        }
                    }
                    else if (node.kind == node_5.NodeKind.FUNCTION) {
                        let body = node.functionBody();
                        if (body == null) {
                            return;
                        }
                        let symbol = node.symbol;
                        let needsSemicolon = false;
                        this.emitNewlineBefore(node);
                        let isConstructor = symbol.name == "constructor";
                        let isTurbo = !node.parent.isJavaScript();
                        if (symbol.kind == symbol_5.SymbolKind.FUNCTION_INSTANCE) {
                            if (isConstructor && isTurbo) {
                                this.code.append("function ");
                                this.emitSymbolName(symbol.parent());
                                this.code.append("_new");
                                needsSemicolon = false;
                            }
                            else {
                                if (isTurbo) {
                                    this.code.append("function ");
                                    this.emitSymbolName(symbol.parent());
                                    this.code.append("_");
                                    if (node.isVirtual()) {
                                        this.code.append(symbol.name + "_impl");
                                    }
                                    else {
                                        this.emitSymbolName(symbol);
                                    }
                                    needsSemicolon = false;
                                }
                                else {
                                    if (node.isStatic()) {
                                        this.code.append("static ");
                                    }
                                    this.emitSymbolName(symbol);
                                }
                            }
                        }
                        else if (node.isExport()) {
                            this.code.append("let ");
                            this.emitSymbolName(symbol);
                            this.code.append(" = function ");
                            this.emitSymbolName(symbol);
                            needsSemicolon = true;
                        }
                        else {
                            this.code.append("function ");
                            this.emitSymbolName(symbol);
                        }
                        this.code.append("(");
                        let returnType = node.functionReturnType();
                        let child = node.functionFirstArgumentIgnoringThis();
                        let needComma = false;
                        let signature = "";
                        if (!isConstructor && isTurbo && !node.isStatic()) {
                            this.code.append("ptr");
                            signature += "ptr";
                            needComma = true;
                        }
                        while (child != returnType) {
                            assert(child.kind == node_5.NodeKind.VARIABLE);
                            if (needComma) {
                                this.code.append(", ");
                                signature += ",";
                                needComma = false;
                            }
                            this.emitSymbolName(child.symbol);
                            if (child.firstChild != child.lastChild && child.lastChild.hasValue) {
                                this.code.append(` = ${child.lastChild.rawValue}`);
                            }
                            signature += child.symbol.name;
                            child = child.nextSibling;
                            if (child != returnType) {
                                this.code.append(", ");
                                signature += ", ";
                            }
                        }
                        this.code.append(") ");
                        let parent = symbol.parent();
                        let parentName = parent ? parent.name : "";
                        let classDef = classMap.get(parentName);
                        if (isConstructor && isTurbo) {
                            this.code.append("{\n", 1);
                            this.code.append(`let ptr = ${namespace}malloc(${parentName}.SIZE, ${parentName}.ALIGN);\n`);
                            this.code.append(`${namespace}HEAP32[ptr >> 2] = ${classDef.name}.CLSID;\n`);
                            this.code.append(`${parentName}_init_mem(ptr, `);
                            this.code.append(`${signature});\n`);
                            this.code.append("return ptr;\n", -1);
                            this.code.append("}\n\n");
                            this.code.append(`function ${classDef.name}_init_mem(ptr, `);
                            this.code.append(`${signature}) {\n`, 1);
                        }
                        if (node.isVirtual()) {
                            let chunkIndex = this.code.breakChunk();
                            this.updateVirtualTable(node, chunkIndex, classDef.base, signature);
                        }
                        this.emitBlock(node.functionBody(), !isConstructor || !isTurbo);
                        if (node.isVirtual()) {
                            this.code.breakChunk();
                        }
                        if (isConstructor && isTurbo) {
                            this.code.append(`return ptr;\n`);
                            this.code.clearIndent(1);
                            this.code.append("}");
                            this.code.indent -= 1;
                        }
                        // this.code.append(needsSemicolon ? ";\n" : "\n");
                        if (node.isExport()) {
                            exportedFunctions.push(this.emitSymbolName(symbol));
                            this.code.append(" = ");
                            this.emitSymbolName(symbol);
                            this.code.append(";\n");
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_5.NodeKind.IF) {
                        this.emitNewlineBefore(node);
                        while (true) {
                            this.code.append("if (");
                            this.emitExpression(node.ifValue(), parser_4.Precedence.LOWEST);
                            this.code.append(") ");
                            this.emitBlock(node.ifTrue(), true);
                            let no = node.ifFalse();
                            if (no == null) {
                                this.code.append("\n");
                                break;
                            }
                            this.code.append("\n\n");
                            this.code.append("else ");
                            if (no.firstChild == null || no.firstChild != no.lastChild || no.firstChild.kind != node_5.NodeKind.IF) {
                                this.emitBlock(no, true);
                                this.code.append("\n");
                                break;
                            }
                            node = no.firstChild;
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_5.NodeKind.WHILE) {
                        this.emitNewlineBefore(node);
                        this.code.append("while (");
                        this.emitExpression(node.whileValue(), parser_4.Precedence.LOWEST);
                        this.code.append(") ");
                        this.emitBlock(node.whileBody(), true);
                        this.code.append("\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_5.NodeKind.BREAK) {
                        this.emitNewlineBefore(node);
                        this.code.append("break;\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_5.NodeKind.CONTINUE) {
                        this.emitNewlineBefore(node);
                        this.code.append("continue;\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_5.NodeKind.EXPRESSION) {
                        this.emitNewlineBefore(node);
                        this.emitExpression(node.expressionValue(), parser_4.Precedence.LOWEST);
                        this.code.append(";\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_5.NodeKind.EMPTY) {
                    }
                    else if (node.kind == node_5.NodeKind.RETURN) {
                        let value = node.returnValue();
                        //this.emitNewlineBefore(node);
                        if (value != null) {
                            this.code.append("return ");
                            this.emitExpression(value, parser_4.Precedence.LOWEST);
                            this.code.append(";\n");
                        }
                        else {
                            this.code.append("return;\n");
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_5.NodeKind.BLOCK) {
                        if (node.parent.kind == node_5.NodeKind.BLOCK) {
                            this.emitStatements(node.firstChild);
                        }
                        else {
                            this.emitNewlineBefore(node);
                            this.emitBlock(node, true);
                            this.code.append("\n");
                            this.emitNewlineAfter(node);
                        }
                    }
                    else if (node.kind == node_5.NodeKind.VARIABLES) {
                        this.emitNewlineBefore(node);
                        this.code.append("let ");
                        let child = node.firstChild;
                        while (child != null) {
                            let value = child.variableValue();
                            this.emitSymbolName(child.symbol);
                            child = child.nextSibling;
                            if (child != null) {
                                this.code.append(", ");
                            }
                            assert(value != null);
                            this.code.append(" = ");
                            this.emitExpression(value, parser_4.Precedence.LOWEST);
                        }
                        this.code.append(";\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_5.NodeKind.ENUM) {
                        if (node.isExport()) {
                            this.emitNewlineBefore(node);
                            exportedFunctions.push(this.emitSymbolName(node.symbol));
                            this.code.append(" = {\n");
                            this.code.indent += 1;
                            // Emit enum values
                            let child = node.firstChild;
                            while (child != null) {
                                assert(child.kind == node_5.NodeKind.VARIABLE);
                                // this.code.emitIndent();
                                this.emitSymbolName(child.symbol);
                                this.code.append(": ");
                                this.code.append(child.symbol.offset.toString());
                                child = child.nextSibling;
                                this.code.append(child != null ? ",\n" : "\n");
                            }
                            this.code.clearIndent(1);
                            this.code.append("};\n");
                            this.emitNewlineAfter(node);
                        }
                        else if (optimization == 0) {
                            this.emitNewlineBefore(node);
                            // this.code.emitIndent();
                            this.code.append("let ");
                            this.emitSymbolName(node.symbol);
                            this.code.append(";\n");
                            // this.code.emitIndent();
                            this.code.append("(function (");
                            this.emitSymbolName(node.symbol);
                            this.code.append(") {\n");
                            this.code.indent += 1;
                            // Emit enum values
                            let child = node.firstChild;
                            while (child != null) {
                                assert(child.kind == node_5.NodeKind.VARIABLE);
                                // this.code.emitIndent();
                                this.emitSymbolName(node.symbol);
                                this.code.append("[");
                                this.emitSymbolName(node.symbol);
                                this.code.append("['");
                                this.emitSymbolName(child.symbol);
                                this.code.append("'] = ");
                                this.code.append(child.symbol.offset.toString());
                                this.code.append("] = ");
                                this.code.append("'");
                                this.emitSymbolName(child.symbol);
                                this.code.append("'");
                                child = child.nextSibling;
                                this.code.append(";\n");
                            }
                            this.code.clearIndent(1);
                            this.code.append("})(");
                            this.emitSymbolName(node.symbol);
                            this.code.append(" || (");
                            this.emitSymbolName(node.symbol);
                            this.code.append(" = {}));\n");
                            this.emitNewlineAfter(node);
                        }
                    }
                    else if (node.kind == node_5.NodeKind.CONSTANTS) {
                    }
                    else {
                        assert(false);
                    }
                }
                emitVirtuals() {
                    this.code.append("\n");
                    this.code.append("//FIXME: Virtuals should emit next to base class virtual function\n");
                    virtualMap.forEach((virtual, virtualName) => {
                        this.code.append("\n");
                        this.code.append(`function ${virtual.name}(${virtual.signature}) {\n`, 1);
                        this.code.append(`switch (${namespace}HEAP32[ptr >> 2]) {\n`, 1);
                        for (let impl of virtual.functions) {
                            this.code.append(`case ${impl.parent}_CLSID:\n`, 1);
                            this.code.append(`return ${impl.parent}_${impl.name}_impl(${virtual.signature});\n`);
                            this.code.clearIndent(1);
                            this.code.indent -= 1;
                        }
                        this.code.append("default:\n", 1);
                        this.code.append(`throw ${namespace}_badType(ptr);\n`);
                        this.code.indent -= 2;
                        this.code.clearIndent(2);
                        this.code.append("}\n");
                        this.code.indent -= 1;
                        this.code.clearIndent(1);
                        this.code.append("}\n");
                        // for (let virtual of vtable) {
                        //     let signature = virtual.signature;
                        //     this.code.append(`${virtual.name} = function (ptr, ${signature}) {\n`);
                        //     this.code.append("        switch (${namespace}HEAP32[ptr >> 2]) {\n");
                        //     let kv = virtual.reverseCases.keysValues();
                        //     for (let [name,cases]=kv.next(); name; [name, cases] = kv.next()) {
                        //         for (let c of cases) {
                        //             this.code.append(`      case ${c}:`);
                        //         }
                        //         this.code.append(`      return ${name}(ptr ${signature});`);
                        //     }
                        //     this.code.append("      default:");
                        //     this.code.append("      " + (virtual.default_ ?
                        //             `return ${virtual.default_}(ptr ${signature})` :
                        //             "throw ${namespace}_badType(ptr)") + ";");
                        //     this.code.append("  }");
                        //     this.code.append("}");
                        // }
                    });
                }
                updateVirtualTable(node, chunkIndex, baseClassName, signature) {
                    let virtualName = baseClassName ? `${baseClassName}_${node.stringValue}` : `${node.parent.stringValue}_${node.stringValue}`;
                    let virtual = virtualMap.get(virtualName);
                    if (!virtual) {
                        virtual = {
                            name: virtualName,
                            signature: signature,
                            functions: [
                                {
                                    chunkIndex: chunkIndex,
                                    parent: node.parent.stringValue,
                                    name: node.stringValue,
                                    base: baseClassName || null,
                                    signature: signature
                                }
                            ]
                        };
                        virtualMap.set(virtualName, virtual);
                    }
                    else {
                        virtual.functions.push({
                            chunkIndex: chunkIndex,
                            parent: node.parent.stringValue,
                            name: node.stringValue,
                            base: baseClassName || null,
                            signature: signature
                        });
                    }
                }
                getClassDef(node) {
                    let def = classMap.get(node.symbol.name);
                    if (def) {
                        return def;
                    }
                    def = {
                        name: node.symbol.name,
                        size: 4,
                        align: 4,
                        clsid: this.computeClassId(node.symbol.name),
                        members: {},
                        code: ""
                    };
                    if (node.firstChild && node.firstChild.kind == node_5.NodeKind.EXTENDS) {
                        def.base = node.firstChild.firstChild.stringValue;
                    }
                    let argument = node.firstChild;
                    while (argument != null) {
                        if (argument.kind == node_5.NodeKind.VARIABLE) {
                            let typeSize;
                            let memory;
                            let offset;
                            let shift;
                            let resolvedType = argument.symbol.resolvedType;
                            if (resolvedType.pointerTo) {
                                typeSize = 4;
                                memory = `HEAP32`;
                                offset = 4 + (argument.offset * typeSize);
                                shift = Math.log2(typeSize);
                            }
                            else if (resolvedType.symbol.kind == symbol_5.SymbolKind.TYPE_CLASS) {
                                typeSize = 4;
                                memory = `HEAP32`;
                                offset = 4 + (argument.offset * typeSize);
                                shift = Math.log2(typeSize);
                            }
                            else {
                                typeSize = resolvedType.symbol.byteSize;
                                memory = `_mem_${this.getMemoryType(argument.firstChild.stringValue)}`;
                                offset = 4 + (argument.offset * typeSize);
                                shift = Math.log2(typeSize);
                            }
                            def.members[argument.symbol.name] = {
                                memory: memory,
                                size: typeSize,
                                offset: offset,
                                shift: shift,
                                value: argument.variableValue()
                            };
                            def.size += typeSize;
                        }
                        argument = argument.nextSibling;
                    }
                    classMap.set(node.symbol.name, def);
                    return def;
                }
                computeClassId(name) {
                    let n = name.length;
                    for (let i = 0; i < name.length; i++) {
                        let c = name.charAt(i);
                        let v = 0;
                        if (c >= 'A' && c <= 'Z')
                            v = c.charCodeAt(0) - 'A'.charCodeAt(0);
                        else if (c >= 'a' && c <= 'z')
                            v = c.charCodeAt(0) - 'a'.charCodeAt(0) + 26;
                        else if (c >= '0' && c <= '9')
                            v = c.charCodeAt(0) - '0'.charCodeAt(0) + 52;
                        else if (c == '_')
                            v = 62;
                        else if (c == '>')
                            v = 63;
                        else
                            throw "Bad character in class name: " + c;
                        n = (((n & 0x1FFFFFF) << 3) | (n >>> 25)) ^ v;
                    }
                    return n;
                }
                getMemoryType(name) {
                    if (name == "int32") {
                        return "i32";
                    }
                    else if (name == "int16") {
                        return "i16";
                    }
                    else if (name == "int8") {
                        return "i8";
                    }
                    else if (name == "uint32") {
                        return "u32";
                    }
                    else if (name == "uint16") {
                        return "u16";
                    }
                    else if (name == "uint8") {
                        return "u8";
                    }
                    else if (name == "float32") {
                        return "f32";
                    }
                    else if (name == "float64") {
                        return "f64";
                    }
                    //Pointer object
                    return "i32";
                }
            };
            exports_10("TurboJsResult", TurboJsResult);
        }
    };
});
// export declare function assert(truth: boolean): void;
// export declare function stdlib.Profiler_begin(): void;
// export declare function stdlib.Profiler_end(text: string): void;
System.register("imports", [], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    // export var assert = assert;
    // export var stdlib.Profiler_begin = stdlib.Profiler_begin;
    // export var stdlib.Profiler_end = stdlib.Profiler_end;
    function isPositivePowerOf2(value) {
        return value > 0 && (value & (value - 1)) == 0;
    }
    exports_11("isPositivePowerOf2", isPositivePowerOf2);
    function alignToNextMultipleOf(offset, alignment) {
        assert(isPositivePowerOf2(alignment));
        return (offset + alignment - 1) & -alignment;
    }
    exports_11("alignToNextMultipleOf", alignToNextMultipleOf);
    return {
        setters: [],
        execute: function () {// export declare function assert(truth: boolean): void;
            // export declare function stdlib.Profiler_begin(): void;
            // export declare function stdlib.Profiler_end(text: string): void;
        }
    };
});
System.register("wasm/opcode", [], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    var WasmOpcode;
    return {
        setters: [],
        execute: function () {
            /**
             * Created by nidin on 2017-01-12.
             */
            exports_12("WasmOpcode", WasmOpcode = {
                // Control flow operators
                UNREACHABLE: 0x00,
                NOP: 0x01,
                BLOCK: 0x02,
                LOOP: 0x03,
                IF: 0x04,
                IF_ELSE: 0x05,
                END: 0x0b,
                BR: 0x0c,
                BR_IF: 0x0d,
                BR_TABLE: 0x0e,
                RETURN: 0x0f,
                // Call operators
                CALL: 0x10,
                CALL_INDIRECT: 0x11,
                //Parametric operators
                DROP: 0x1a,
                SELECT: 0x1b,
                //Variable access
                GET_LOCAL: 0x20,
                SET_LOCAL: 0x21,
                TEE_LOCAL: 0x22,
                GET_GLOBAL: 0x23,
                SET_GLOBAL: 0x24,
                // Memory-related operators
                I32_LOAD: 0x28,
                I64_LOAD: 0x29,
                F32_LOAD: 0x2a,
                F64_LOAD: 0x2b,
                I32_LOAD8_S: 0x2c,
                I32_LOAD8_U: 0x2d,
                I32_LOAD16_S: 0x2e,
                I32_LOAD16_U: 0x2f,
                I64_LOAD8_S: 0x30,
                I64_LOAD8_U: 0x31,
                I64_LOAD16_S: 0x32,
                I64_LOAD16_U: 0x33,
                I64_LOAD32_S: 0x34,
                I64_LOAD32_U: 0x35,
                I32_STORE: 0x36,
                I64_STORE: 0x37,
                F32_STORE: 0x38,
                F64_STORE: 0x39,
                I32_STORE8: 0x3a,
                I32_STORE16: 0x3b,
                I64_STORE8: 0x3c,
                I64_STORE16: 0x3d,
                I64_STORE32: 0x3e,
                MEMORY_SIZE: 0x3f,
                GROW_MEMORY: 0x40,
                // Constants
                I32_CONST: 0x41,
                I64_CONST: 0x42,
                F32_CONST: 0x43,
                F64_CONST: 0x44,
                //Comparison operators
                I32_EQZ: 0x45,
                I32_EQ: 0x46,
                I32_NE: 0x47,
                I32_LT_S: 0x48,
                I32_LT_U: 0x49,
                I32_GT_S: 0x4a,
                I32_GT_U: 0x4b,
                I32_LE_S: 0x4c,
                I32_LE_U: 0x4d,
                I32_GE_S: 0x4e,
                I32_GE_U: 0x4f,
                I64_EQZ: 0x50,
                I64_EQ: 0x51,
                I64_NE: 0x52,
                I64_LT_S: 0x53,
                I64_LT_U: 0x54,
                I64_GT_S: 0x55,
                I64_GT_U: 0x56,
                I64_LE_S: 0x57,
                I64_LE_U: 0x58,
                I64_GE_S: 0x59,
                I64_GE_U: 0x5a,
                F32_EQ: 0x5b,
                F32_NE: 0x5c,
                F32_LT: 0x5d,
                F32_GT: 0x5e,
                F32_LE: 0x5f,
                F32_GE: 0x60,
                F64_EQ: 0x61,
                F64_NE: 0x62,
                F64_LT: 0x63,
                F64_GT: 0x64,
                F64_LE: 0x65,
                F64_GE: 0x66,
                //Numeric operators
                I32_CLZ: 0x67,
                I32_CTZ: 0x68,
                I32_POPCNT: 0x69,
                I32_ADD: 0x6a,
                I32_SUB: 0x6b,
                I32_MUL: 0x6c,
                I32_DIV_S: 0x6d,
                I32_DIV_U: 0x6e,
                I32_REM_S: 0x6f,
                I32_REM_U: 0x70,
                I32_AND: 0x71,
                I32_OR: 0x72,
                I32_XOR: 0x73,
                I32_SHL: 0x74,
                I32_SHR_S: 0x75,
                I32_SHR_U: 0x76,
                I32_ROTL: 0x77,
                I32_ROTR: 0x78,
                I64_CLZ: 0x79,
                I64_CTZ: 0x7a,
                I64_POPCNT: 0x7b,
                I64_ADD: 0x7c,
                I64_SUB: 0x7d,
                I64_MUL: 0x7e,
                I64_DIV_S: 0x7f,
                I64_DIV_U: 0x80,
                I64_REM_S: 0x81,
                I64_REM_U: 0x82,
                I64_AND: 0x83,
                I64_OR: 0x84,
                I64_XOR: 0x85,
                I64_SHL: 0x86,
                I64_SHR_S: 0x87,
                I64_SHR_U: 0x88,
                I64_ROTL: 0x89,
                I64_ROTR: 0x8a,
                F32_ABS: 0x8b,
                F32_NEG: 0x8c,
                F32_CEIL: 0x8d,
                F32_FLOOR: 0x8e,
                F32_TRUNC: 0x8f,
                F32_NEAREST: 0x90,
                F32_SQRT: 0x91,
                F32_ADD: 0x92,
                F32_SUB: 0x93,
                F32_MUL: 0x94,
                F32_DIV: 0x95,
                F32_MIN: 0x96,
                F32_MAX: 0x97,
                F32_COPYSIGN: 0x98,
                F64_ABS: 0x99,
                F64_NEG: 0x9a,
                F64_CEIL: 0x9b,
                F64_FLOOR: 0x9c,
                F64_TRUNC: 0x9d,
                F64_NEAREST: 0x9e,
                F64_SQRT: 0x9f,
                F64_ADD: 0xa0,
                F64_SUB: 0xa1,
                F64_MUL: 0xa2,
                F64_DIV: 0xa3,
                F64_MIN: 0xa4,
                F64_MAX: 0xa5,
                F64_COPYSIGN: 0xa6,
                //Conversions
                I32_WRAP_I64: 0xa7,
                I32_TRUNC_S_F32: 0xa8,
                I32_TRUNC_U_F32: 0xa9,
                I32_TRUNC_S_F64: 0xaa,
                I32_TRUNC_U_F64: 0xab,
                I64_EXTEND_S_I32: 0xac,
                I64_EXTEND_U_I32: 0xad,
                I64_TRUNC_S_F32: 0xae,
                I64_TRUNC_U_F32: 0xaf,
                I64_TRUNC_S_F64: 0xb0,
                I64_TRUNC_U_F64: 0xb1,
                F32_CONVERT_S_I32: 0xb2,
                F32_CONVERT_U_I32: 0xb3,
                F32_CONVERT_S_I64: 0xb4,
                F32_CONVERT_U_I64: 0xb5,
                F32_DEMOTE_F64: 0xb6,
                F64_CONVERT_S_I32: 0xb7,
                F64_CONVERT_U_I32: 0xb8,
                F64_CONVERT_S_I64: 0xb9,
                F64_CONVERT_U_I64: 0xba,
                F64_PROMOTE_F32: 0xbb,
                //Reinterpretations
                I32_REINTERPRET_F32: 0xbc,
                I64_REINTERPRET_F64: 0xbd,
                F32_REINTERPRET_I32: 0xbe,
                F64_REINTERPRET_I64: 0xbf,
            });
            WasmOpcode[WasmOpcode.UNREACHABLE] = "unreachable";
            WasmOpcode[WasmOpcode.NOP] = "nop";
            WasmOpcode[WasmOpcode.BLOCK] = "block";
            WasmOpcode[WasmOpcode.LOOP] = "loop";
            WasmOpcode[WasmOpcode.IF] = "if";
            WasmOpcode[WasmOpcode.IF_ELSE] = "else";
            WasmOpcode[WasmOpcode.END] = "end";
            WasmOpcode[WasmOpcode.BR] = "br";
            WasmOpcode[WasmOpcode.BR_IF] = "br_if";
            WasmOpcode[WasmOpcode.BR_TABLE] = "br_table";
            WasmOpcode[WasmOpcode.RETURN] = "return";
            // Call operators
            WasmOpcode[WasmOpcode.CALL] = "call";
            WasmOpcode[WasmOpcode.CALL_INDIRECT] = "call_indirect";
            //Parametric operators
            WasmOpcode[WasmOpcode.DROP] = "drop";
            WasmOpcode[WasmOpcode.SELECT] = "select";
            //Variable access
            WasmOpcode[WasmOpcode.GET_LOCAL] = "get_local";
            WasmOpcode[WasmOpcode.SET_LOCAL] = "set_local";
            WasmOpcode[WasmOpcode.TEE_LOCAL] = "tee_local";
            WasmOpcode[WasmOpcode.GET_GLOBAL] = "get_global";
            WasmOpcode[WasmOpcode.SET_GLOBAL] = "set_global";
            // Memory-related operators
            WasmOpcode[WasmOpcode.I32_LOAD] = "i32.load";
            WasmOpcode[WasmOpcode.I64_LOAD] = "i64.load";
            WasmOpcode[WasmOpcode.F32_LOAD] = "f32.load";
            WasmOpcode[WasmOpcode.F64_LOAD] = "f64.load";
            WasmOpcode[WasmOpcode.I32_LOAD8_S] = "i32.load8_s";
            WasmOpcode[WasmOpcode.I32_LOAD8_U] = "i32_load8_u";
            WasmOpcode[WasmOpcode.I32_LOAD16_S] = "i32_load16_s";
            WasmOpcode[WasmOpcode.I32_LOAD16_U] = "i32_load16_u";
            WasmOpcode[WasmOpcode.I64_LOAD8_S] = "i64.load8_s";
            WasmOpcode[WasmOpcode.I64_LOAD8_U] = "i64.load8_u";
            WasmOpcode[WasmOpcode.I64_LOAD16_S] = "i64.load16_s";
            WasmOpcode[WasmOpcode.I64_LOAD16_U] = "i64.load16_u";
            WasmOpcode[WasmOpcode.I64_LOAD32_S] = "i64.load32_s";
            WasmOpcode[WasmOpcode.I64_LOAD32_U] = "i64.load32_u";
            WasmOpcode[WasmOpcode.I32_STORE] = "i32.store";
            WasmOpcode[WasmOpcode.I64_STORE] = "i64.store";
            WasmOpcode[WasmOpcode.F32_STORE] = "f32.store";
            WasmOpcode[WasmOpcode.F64_STORE] = "f64.store";
            WasmOpcode[WasmOpcode.I32_STORE8] = "i32.store8";
            WasmOpcode[WasmOpcode.I32_STORE16] = "i32.store16";
            WasmOpcode[WasmOpcode.I64_STORE8] = "i64.store8";
            WasmOpcode[WasmOpcode.I64_STORE16] = "i64.store16";
            WasmOpcode[WasmOpcode.I64_STORE32] = "i64.store32";
            WasmOpcode[WasmOpcode.MEMORY_SIZE] = "current_memory";
            WasmOpcode[WasmOpcode.GROW_MEMORY] = "grow_memory";
            // Constants
            WasmOpcode[WasmOpcode.I32_CONST] = "i32.const";
            WasmOpcode[WasmOpcode.I64_CONST] = "i64.const";
            WasmOpcode[WasmOpcode.F32_CONST] = "f32.const";
            WasmOpcode[WasmOpcode.F64_CONST] = "f64.const";
            //Comparison operators
            WasmOpcode[WasmOpcode.I32_EQZ] = "i32.eqz";
            WasmOpcode[WasmOpcode.I32_EQ] = "i32.eq";
            WasmOpcode[WasmOpcode.I32_NE] = "i32.ne";
            WasmOpcode[WasmOpcode.I32_LT_S] = "i32.lt_s";
            WasmOpcode[WasmOpcode.I32_LT_U] = "i32.lt_u";
            WasmOpcode[WasmOpcode.I32_GT_S] = "i32.gt_s";
            WasmOpcode[WasmOpcode.I32_GT_U] = "i32.gt_u";
            WasmOpcode[WasmOpcode.I32_LE_S] = "i32.le_s";
            WasmOpcode[WasmOpcode.I32_LE_U] = "i32.le_u";
            WasmOpcode[WasmOpcode.I32_GE_S] = "i32.ge_s";
            WasmOpcode[WasmOpcode.I32_GE_U] = "i32.ge_u";
            WasmOpcode[WasmOpcode.I64_EQZ] = "i64.eqz";
            WasmOpcode[WasmOpcode.I64_EQ] = "i64.eq";
            WasmOpcode[WasmOpcode.I64_NE] = "i64.ne";
            WasmOpcode[WasmOpcode.I64_LT_S] = "i64.lt_s";
            WasmOpcode[WasmOpcode.I64_LT_U] = "i64.lt_u";
            WasmOpcode[WasmOpcode.I64_GT_S] = "i64.gt_s";
            WasmOpcode[WasmOpcode.I64_GT_U] = "i64.gt_u";
            WasmOpcode[WasmOpcode.I64_LE_S] = "i64.le_s";
            WasmOpcode[WasmOpcode.I64_LE_U] = "i64.le_u";
            WasmOpcode[WasmOpcode.I64_GE_S] = "i64.ge_s";
            WasmOpcode[WasmOpcode.I64_GE_U] = "i64.ge_u";
            WasmOpcode[WasmOpcode.F32_EQ] = "f32.eq";
            WasmOpcode[WasmOpcode.F32_NE] = "f32.ne";
            WasmOpcode[WasmOpcode.F32_LT] = "f32.lt";
            WasmOpcode[WasmOpcode.F32_GT] = "f32.gt";
            WasmOpcode[WasmOpcode.F32_LE] = "f32.le";
            WasmOpcode[WasmOpcode.F32_GE] = "f32.ge";
            WasmOpcode[WasmOpcode.F64_EQ] = "f64.eq";
            WasmOpcode[WasmOpcode.F64_NE] = "f64.ne";
            WasmOpcode[WasmOpcode.F64_LT] = "f64.lt";
            WasmOpcode[WasmOpcode.F64_GT] = "f64.gt";
            WasmOpcode[WasmOpcode.F64_LE] = "f64.le";
            WasmOpcode[WasmOpcode.F64_GE] = "f64.ge";
            //Numeric operators
            WasmOpcode[WasmOpcode.I32_CLZ] = "i32.clz";
            WasmOpcode[WasmOpcode.I32_CTZ] = "i32.ctz";
            WasmOpcode[WasmOpcode.I32_POPCNT] = "i32.popcnt";
            WasmOpcode[WasmOpcode.I32_ADD] = "i32.add";
            WasmOpcode[WasmOpcode.I32_SUB] = "i32.sub";
            WasmOpcode[WasmOpcode.I32_MUL] = "i32.mul";
            WasmOpcode[WasmOpcode.I32_DIV_S] = "i32.div_s";
            WasmOpcode[WasmOpcode.I32_DIV_U] = "i32.div_u";
            WasmOpcode[WasmOpcode.I32_REM_S] = "i32.rem_s";
            WasmOpcode[WasmOpcode.I32_REM_U] = "i32.rem_u";
            WasmOpcode[WasmOpcode.I32_AND] = "i32.and";
            WasmOpcode[WasmOpcode.I32_OR] = "i32.or";
            WasmOpcode[WasmOpcode.I32_XOR] = "i32.xor";
            WasmOpcode[WasmOpcode.I32_SHL] = "i32.shl";
            WasmOpcode[WasmOpcode.I32_SHR_S] = "i32.shr_s";
            WasmOpcode[WasmOpcode.I32_SHR_U] = "i32.shr_u";
            WasmOpcode[WasmOpcode.I32_ROTL] = "i32.rotl";
            WasmOpcode[WasmOpcode.I32_ROTR] = "i32.rotr";
            WasmOpcode[WasmOpcode.I64_CLZ] = "i64.clz";
            WasmOpcode[WasmOpcode.I64_CTZ] = "i64.ctz";
            WasmOpcode[WasmOpcode.I64_POPCNT] = "i64.popcnt";
            WasmOpcode[WasmOpcode.I64_ADD] = "i64.add";
            WasmOpcode[WasmOpcode.I64_SUB] = "i64.sub";
            WasmOpcode[WasmOpcode.I64_MUL] = "i64.mul";
            WasmOpcode[WasmOpcode.I64_DIV_S] = "i64.div_s";
            WasmOpcode[WasmOpcode.I64_DIV_U] = "i64.div_u";
            WasmOpcode[WasmOpcode.I64_REM_S] = "i64.rem_s";
            WasmOpcode[WasmOpcode.I64_REM_U] = "i64.rem_u";
            WasmOpcode[WasmOpcode.I64_AND] = "i64.and";
            WasmOpcode[WasmOpcode.I64_OR] = "i64.or";
            WasmOpcode[WasmOpcode.I64_XOR] = "i64.xor";
            WasmOpcode[WasmOpcode.I64_SHL] = "i64.shl";
            WasmOpcode[WasmOpcode.I64_SHR_S] = "i64.shr_s";
            WasmOpcode[WasmOpcode.I64_SHR_U] = "i64.shr_u";
            WasmOpcode[WasmOpcode.I64_ROTL] = "i64.rotl";
            WasmOpcode[WasmOpcode.I64_ROTR] = "i64.rotr";
            WasmOpcode[WasmOpcode.F32_ABS] = "f32.abs";
            WasmOpcode[WasmOpcode.F32_NEG] = "f32.neg";
            WasmOpcode[WasmOpcode.F32_CEIL] = "f32.ceil";
            WasmOpcode[WasmOpcode.F32_FLOOR] = "f32.floor";
            WasmOpcode[WasmOpcode.F32_TRUNC] = "f32.trunc";
            WasmOpcode[WasmOpcode.F32_NEAREST] = "f32.nearest";
            WasmOpcode[WasmOpcode.F32_SQRT] = "f32.sqrt";
            WasmOpcode[WasmOpcode.F32_ADD] = "f32.add";
            WasmOpcode[WasmOpcode.F32_SUB] = "f32.sub";
            WasmOpcode[WasmOpcode.F32_MUL] = "f32.mul";
            WasmOpcode[WasmOpcode.F32_DIV] = "f32.div";
            WasmOpcode[WasmOpcode.F32_MIN] = "f32.min";
            WasmOpcode[WasmOpcode.F32_MAX] = "f32.max";
            WasmOpcode[WasmOpcode.F32_COPYSIGN] = "f32.copysign";
            WasmOpcode[WasmOpcode.F64_ABS] = "f64.abs";
            WasmOpcode[WasmOpcode.F64_NEG] = "f64.neg";
            WasmOpcode[WasmOpcode.F64_CEIL] = "f64.ceil";
            WasmOpcode[WasmOpcode.F64_FLOOR] = "f64.floor";
            WasmOpcode[WasmOpcode.F64_TRUNC] = "f64.trunc";
            WasmOpcode[WasmOpcode.F64_NEAREST] = "f64.nearest";
            WasmOpcode[WasmOpcode.F64_SQRT] = "f64.sqrt";
            WasmOpcode[WasmOpcode.F64_ADD] = "f64.add";
            WasmOpcode[WasmOpcode.F64_SUB] = "f64.sub";
            WasmOpcode[WasmOpcode.F64_MUL] = "f64.mul";
            WasmOpcode[WasmOpcode.F64_DIV] = "f64.div";
            WasmOpcode[WasmOpcode.F64_MIN] = "f64.min";
            WasmOpcode[WasmOpcode.F64_MAX] = "f64.max";
            WasmOpcode[WasmOpcode.F64_COPYSIGN] = "f64.copysign";
            //Conversions
            WasmOpcode[WasmOpcode.I32_WRAP_I64] = "i32.wrap/i64";
            WasmOpcode[WasmOpcode.I32_TRUNC_S_F32] = "i32.trunc_s/f32";
            WasmOpcode[WasmOpcode.I32_TRUNC_U_F32] = "i32.trunc_u/f32";
            WasmOpcode[WasmOpcode.I32_TRUNC_S_F64] = "i32.trunc_s/f64";
            WasmOpcode[WasmOpcode.I32_TRUNC_U_F64] = "i32.trunc_u/f64";
            WasmOpcode[WasmOpcode.I64_EXTEND_S_I32] = "i64.extend_s/i32";
            WasmOpcode[WasmOpcode.I64_EXTEND_U_I32] = "i64.extend_u/i32";
            WasmOpcode[WasmOpcode.I64_TRUNC_S_F32] = "i64.trunc_s/f32";
            WasmOpcode[WasmOpcode.I64_TRUNC_U_F32] = "i64.trunc_u/f32";
            WasmOpcode[WasmOpcode.I64_TRUNC_S_F64] = "i64.trunc_s/f64";
            WasmOpcode[WasmOpcode.I64_TRUNC_U_F64] = "i64.trunc_u/f64";
            WasmOpcode[WasmOpcode.F32_CONVERT_S_I32] = "f32.convert_s/i32";
            WasmOpcode[WasmOpcode.F32_CONVERT_U_I32] = "f32.convert_u/i32";
            WasmOpcode[WasmOpcode.F32_CONVERT_S_I64] = "f32.convert_s/i64";
            WasmOpcode[WasmOpcode.F32_CONVERT_U_I64] = "f32.convert_u/i64";
            WasmOpcode[WasmOpcode.F32_DEMOTE_F64] = "f32.demote/f64";
            WasmOpcode[WasmOpcode.F64_CONVERT_S_I32] = "f64.convert_s/i32";
            WasmOpcode[WasmOpcode.F64_CONVERT_U_I32] = "f64.convert_u/i32";
            WasmOpcode[WasmOpcode.F64_CONVERT_S_I64] = "f64.convert_s/i64";
            WasmOpcode[WasmOpcode.F64_CONVERT_U_I64] = "f64.convert_u/i64";
            WasmOpcode[WasmOpcode.F64_PROMOTE_F32] = "f64.promote/f32";
            //Reinterpretations
            WasmOpcode[WasmOpcode.I32_REINTERPRET_F32] = "i32.reinterpret/f32";
            WasmOpcode[WasmOpcode.I64_REINTERPRET_F64] = "i64.reinterpret/f64";
            WasmOpcode[WasmOpcode.F32_REINTERPRET_I32] = "f32.reinterpret/i32";
            WasmOpcode[WasmOpcode.F64_REINTERPRET_I64] = "f64.reinterpret/i64";
            Object.freeze(WasmOpcode);
        }
    };
});
System.register("utils", [], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    /**
     * Created by Nidin Vinayakan on 17/01/17.
     */
    function toHex(value, size = 7) {
        let hex = value.toString(16);
        let zero = [];
        for (let i = 0; i < size; i++) {
            zero.push("0");
        }
        let str = hex.split("");
        str.forEach((s) => {
            zero.shift();
            zero.push(s);
        });
        return zero.join("");
    }
    exports_13("toHex", toHex);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("wasm", ["symbol", "bytearray", "imports", "node", "wasm/opcode", "utils"], function (exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    function wasmAreSignaturesEqual(a, b) {
        assert(a.returnType != null);
        assert(b.returnType != null);
        assert(a.returnType.next == null);
        assert(b.returnType.next == null);
        let x = a.argumentTypes;
        let y = b.argumentTypes;
        while (x != null && y != null) {
            if (x.id != y.id) {
                return false;
            }
            x = x.next;
            y = y.next;
        }
        if (x != null || y != null) {
            return false;
        }
        if (a.returnType.id != b.returnType.id) {
            return false;
        }
        return true;
    }
    function getWasmFunctionName(fn) {
        let symbol = fn.symbol;
        let moduleName = symbol.kind == symbol_6.SymbolKind.FUNCTION_INSTANCE ? symbol.parent().internalName : "";
        return (moduleName == "" ? "" : moduleName + "_") + (fn.isConstructor ? "new" : symbol.internalName);
    }
    function wasmStartSection(array, id, name) {
        let section = new SectionBuffer(id, name);
        section.offset = array.length;
        log(array, 0, null, ` - section: ${WasmSection[id]} [0x${utils_1.toHex(id, 2)}]`);
        return section;
    }
    function wasmFinishSection(array, section) {
        section.publish(array);
    }
    function wasmWrapType(id) {
        assert(id == WasmType.VOID || id == WasmType.I32 || id == WasmType.I64 || id == WasmType.F32 || id == WasmType.F64);
        let type = new WasmWrappedType();
        type.id = id;
        return type;
    }
    function symbolToValueType(symbol, bitness) {
        let type = symbol.resolvedType;
        if (type.isFloat()) {
            return WasmType.F32;
        }
        else if (type.isDouble()) {
            return WasmType.F64;
        }
        else if (type.isInteger() || (bitness == Bitness.x32 && type.pointerTo)) {
            return WasmType.I32;
        }
        else if (type.isLong() || (bitness == Bitness.x64 && type.pointerTo)) {
            return WasmType.I64;
        }
        else {
            return WasmType.I32;
        }
    }
    function typeToDataType(type, bitness) {
        if (type.isFloat()) {
            return "F32";
        }
        else if (type.isDouble()) {
            return "F64";
        }
        else if (type.isInteger() || (bitness == Bitness.x32 && type.pointerTo)) {
            return "I32";
        }
        else if (type.isLong() || (bitness == Bitness.x64 && type.pointerTo)) {
            return "I64";
        }
        else {
            return "I32";
        }
    }
    function getTypedArrayElementSize(name) {
        switch (name) {
            case "Uint8ClampedArray":
            case "Uint8Array":
            case "Int8Array":
                return 1;
            case "Uint16Array":
            case "Int16Array":
                return 2;
            case "Uint32Array":
            case "Int32Array":
            case "Float32Array":
                return 4;
            case "Float64Array":
                return 8;
            default:
                throw "unknown typed array";
        }
    }
    function wasmAssignLocalVariableOffsets(fn, node, shared) {
        if (node.kind == node_6.NodeKind.VARIABLE) {
            assert(node.symbol.kind == symbol_6.SymbolKind.VARIABLE_LOCAL);
            node.symbol.offset = shared.nextLocalOffset;
            shared.nextLocalOffset = shared.nextLocalOffset + 1;
            shared.localCount = shared.localCount + 1;
            let local = new WasmLocal();
            local.symbol = node.symbol;
            if (fn.firstLocal == null)
                fn.firstLocal = local;
            else
                fn.lastLocal.next = local;
            fn.lastLocal = local;
        }
        let child = node.firstChild;
        while (child != null) {
            wasmAssignLocalVariableOffsets(fn, child, shared);
            child = child.nextSibling;
        }
    }
    function append(array, offset = 0, value = null, msg = null) {
        if (debug) {
            array.log += (value != null ? `${utils_1.toHex(offset + array.position)}: ${utils_1.toHex(value, 2)}                    ; ` : "") + (msg != null ? `${msg}\n` : "\n");
        }
        if (value) {
            array.append(value);
        }
    }
    function log(array, offset = 0, value = null, msg = null) {
        if (debug) {
            array.log += (value != null ? `${utils_1.toHex(offset + array.position)}: ${utils_1.toHex(value, 2)}                    ; ` : "") + (msg != null ? `${msg}\n` : "\n");
        }
    }
    function logData(array, offset = 0, value, addPosition = true) {
        if (debug) {
            array.log += (addPosition ? `${utils_1.toHex(offset + array.position)}: ${utils_1.toHex(value, 2)}` : ` ${utils_1.toHex(value, 2)}`);
        }
    }
    function appendOpcode(array, offset = 0, opcode) {
        if (debug) {
            logOpcode(array, offset, opcode);
        }
        array.append(opcode);
    }
    function logOpcode(array, offset = 0, opcode) {
        if (debug) {
            array.log += `${utils_1.toHex(offset + array.position)}: ${utils_1.toHex(opcode, 2)}                    ; ${opcode_1.WasmOpcode[opcode]}\n`;
        }
    }
    function wasmEmit(compiler, bitness = Bitness.x32) {
        let module = new WasmModule(bitness);
        module.context = compiler.context;
        module.memoryInitializer = new bytearray_1.ByteArray();
        // Set these to invalid values since "0" is valid
        module.startFunctionIndex = -1;
        module.mallocFunctionIndex = -1;
        module.freeFunctionIndex = -1;
        module.currentHeapPointer = -1;
        module.originalHeapPointer = -1;
        // Emission requires two passes
        module.prepareToEmit(compiler.global);
        // The standard library must be included
        // assert(module.mallocFunctionIndex != -1);
        // assert(module.freeFunctionIndex != -1);
        // assert(module.currentHeapPointer != -1);
        // assert(module.originalHeapPointer != -1);
        module.mallocFunctionIndex += module.importCount;
        module.freeFunctionIndex += module.importCount;
        compiler.outputWASM = new bytearray_1.ByteArray();
        module.emitModule(compiler.outputWASM);
    }
    exports_14("wasmEmit", wasmEmit);
    var symbol_6, bytearray_1, imports_1, node_6, opcode_1, utils_1, WASM_MAGIC, WASM_VERSION, WASM_SIZE_IN_PAGES, WASM_SET_MAX_MEMORY, WASM_MAX_MEMORY, WASM_MEMORY_INITIALIZER_BASE, debug, Bitness, WasmType, WasmSection, WasmExternalKind, WasmWrappedType, WasmSignature, SectionBuffer, WasmGlobal, WasmLocal, WasmFunction, WasmImport, WasmModule, WasmSharedOffset;
    return {
        setters: [
            function (symbol_6_1) {
                symbol_6 = symbol_6_1;
            },
            function (bytearray_1_1) {
                bytearray_1 = bytearray_1_1;
            },
            function (imports_1_1) {
                imports_1 = imports_1_1;
            },
            function (node_6_1) {
                node_6 = node_6_1;
            },
            function (opcode_1_1) {
                opcode_1 = opcode_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }
        ],
        execute: function () {
            WASM_MAGIC = 0x6d736100; //'\0' | 'a' << 8 | 's' << 16 | 'm' << 24;
            WASM_VERSION = 0x1;
            WASM_SIZE_IN_PAGES = 1;
            WASM_SET_MAX_MEMORY = false;
            WASM_MAX_MEMORY = 1024 * 1024 * 1024;
            WASM_MEMORY_INITIALIZER_BASE = 8; // Leave space for "null"
            debug = true;
            (function (Bitness) {
                Bitness[Bitness["x32"] = 0] = "x32";
                Bitness[Bitness["x64"] = 1] = "x64";
            })(Bitness || (Bitness = {}));
            (function (WasmType) {
                WasmType[WasmType["VOID"] = 0] = "VOID";
                WasmType[WasmType["I32"] = 127] = "I32";
                WasmType[WasmType["I64"] = 126] = "I64";
                WasmType[WasmType["F32"] = 125] = "F32";
                WasmType[WasmType["F64"] = 124] = "F64";
                WasmType[WasmType["anyfunc"] = 112] = "anyfunc";
                WasmType[WasmType["func"] = 96] = "func";
                WasmType[WasmType["block_type"] = 64] = "block_type";
            })(WasmType || (WasmType = {}));
            (function (WasmSection) {
                WasmSection[WasmSection["Name"] = 0] = "Name";
                WasmSection[WasmSection["Type"] = 1] = "Type";
                WasmSection[WasmSection["Import"] = 2] = "Import";
                WasmSection[WasmSection["Function"] = 3] = "Function";
                WasmSection[WasmSection["Table"] = 4] = "Table";
                WasmSection[WasmSection["Memory"] = 5] = "Memory";
                WasmSection[WasmSection["Global"] = 6] = "Global";
                WasmSection[WasmSection["Export"] = 7] = "Export";
                WasmSection[WasmSection["Start"] = 8] = "Start";
                WasmSection[WasmSection["Element"] = 9] = "Element";
                WasmSection[WasmSection["Code"] = 10] = "Code";
                WasmSection[WasmSection["Data"] = 11] = "Data";
            })(WasmSection || (WasmSection = {}));
            (function (WasmExternalKind) {
                WasmExternalKind[WasmExternalKind["Function"] = 0] = "Function";
                WasmExternalKind[WasmExternalKind["Table"] = 1] = "Table";
                WasmExternalKind[WasmExternalKind["Memory"] = 2] = "Memory";
                WasmExternalKind[WasmExternalKind["Global"] = 3] = "Global";
            })(WasmExternalKind || (WasmExternalKind = {}));
            WasmWrappedType = class WasmWrappedType {
            };
            WasmSignature = class WasmSignature {
            };
            SectionBuffer = class SectionBuffer {
                constructor(id, name) {
                    this.id = id;
                    this.name = name;
                    this.data = new bytearray_1.ByteArray();
                }
                publish(array) {
                    log(array, 0, this.id, "section code");
                    array.writeUnsignedLEB128(this.id); //section code
                    log(array, 0, this.data.length, "section size");
                    array.writeUnsignedLEB128(this.data.length); //size of this section in bytes
                    if (this.id == 0) {
                        array.writeWasmString(this.name);
                    }
                    array.log += this.data.log;
                    array.copy(this.data);
                }
            };
            WasmGlobal = class WasmGlobal {
            };
            WasmLocal = class WasmLocal {
            };
            WasmFunction = class WasmFunction {
                constructor() {
                    this.localCount = 0;
                }
            };
            WasmImport = class WasmImport {
            };
            WasmModule = class WasmModule {
                constructor(bitness) {
                    this.bitness = bitness;
                    this.importCount = 0;
                    this.globalCount = 0;
                    this.functionCount = 0;
                    this.signatureCount = 0;
                }
                growMemoryInitializer() {
                    let array = this.memoryInitializer;
                    let current = array.length;
                    let length = this.context.nextGlobalVariableOffset;
                    while (current < length) {
                        array.append(0);
                        current = current + 1;
                    }
                }
                allocateImport(signatureIndex, mod, name) {
                    let result = new WasmImport();
                    result.signatureIndex = signatureIndex;
                    result.module = mod;
                    result.name = name;
                    if (this.firstImport == null)
                        this.firstImport = result;
                    else
                        this.lastImport.next = result;
                    this.lastImport = result;
                    this.importCount = this.importCount + 1;
                    return result;
                }
                allocateGlobal(symbol) {
                    let global = new WasmGlobal();
                    global.symbol = symbol;
                    symbol.offset = this.globalCount;
                    if (this.firstGlobal == null)
                        this.firstGlobal = global;
                    else
                        this.lastGlobal.next = global;
                    this.lastGlobal = global;
                    this.globalCount = this.globalCount + 1;
                    return global;
                }
                allocateFunction(symbol, signatureIndex) {
                    let fn = new WasmFunction();
                    fn.symbol = symbol;
                    fn.signatureIndex = signatureIndex;
                    if (this.firstFunction == null)
                        this.firstFunction = fn;
                    else
                        this.lastFunction.next = fn;
                    this.lastFunction = fn;
                    this.functionCount = this.functionCount + 1;
                    return fn;
                }
                allocateSignature(argumentTypes, returnType) {
                    assert(returnType != null);
                    assert(returnType.next == null);
                    let signature = new WasmSignature();
                    signature.argumentTypes = argumentTypes;
                    signature.returnType = returnType;
                    let check = this.firstSignature;
                    let i = 0;
                    while (check != null) {
                        if (wasmAreSignaturesEqual(signature, check)) {
                            return i;
                        }
                        check = check.next;
                        i = i + 1;
                    }
                    if (this.firstSignature == null)
                        this.firstSignature = signature;
                    else
                        this.lastSignature.next = signature;
                    this.lastSignature = signature;
                    this.signatureCount = this.signatureCount + 1;
                    return i;
                }
                emitModule(array) {
                    array.log = "";
                    array.writeUnsignedInt(WASM_MAGIC);
                    array.writeUnsignedInt(WASM_VERSION);
                    array.log += '0000000: 0061 736d             ; WASM_BINARY_MAGIC\n';
                    array.log += '0000004: 0100 0000             ; WASM_BINARY_VERSION\n';
                    this.emitSignatures(array);
                    this.emitImportTable(array);
                    this.emitFunctionDeclarations(array);
                    // this.emitTables(array);
                    this.emitMemory(array);
                    // this.emitGlobalDeclarations(array); // Since global variables are immutable in MVP, avoiding it for now.
                    this.emitExportTable(array);
                    this.emitStartFunctionDeclaration(array);
                    this.emitElements(array);
                    this.emitFunctionBodies(array);
                    this.emitDataSegments(array);
                    // this.emitNames(array);
                }
                emitSignatures(array) {
                    if (!this.firstSignature) {
                        return;
                    }
                    let section = wasmStartSection(array, WasmSection.Type, "signatures");
                    section.data.writeUnsignedLEB128(this.signatureCount);
                    let signature = this.firstSignature;
                    let sigCount = 0;
                    while (signature != null) {
                        let count = 0;
                        let type = signature.argumentTypes;
                        while (type != null) {
                            count = count + 1;
                            type = type.next;
                        }
                        log(section.data, array.position, WasmType.func, "func sig " + sigCount++);
                        section.data.writeUnsignedLEB128(WasmType.func); //form, the value for the func type constructor
                        log(section.data, array.position, count, "num params");
                        section.data.writeUnsignedLEB128(count); //param_count, the number of parameters to the function
                        type = signature.argumentTypes;
                        while (type != null) {
                            log(section.data, array.position, type.id, WasmType[type.id]);
                            section.data.writeUnsignedLEB128(type.id); //value_type, the parameter types of the function
                            type = type.next;
                        }
                        let returnTypeId = signature.returnType.id;
                        if (returnTypeId > 0) {
                            log(section.data, array.position, "01", "num results");
                            section.data.writeUnsignedLEB128(1); //return_count, the number of results from the function
                            log(section.data, array.position, signature.returnType.id, WasmType[signature.returnType.id]);
                            section.data.writeUnsignedLEB128(signature.returnType.id);
                        }
                        else {
                            section.data.writeUnsignedLEB128(0);
                        }
                        signature = signature.next;
                    }
                    wasmFinishSection(array, section);
                }
                emitImportTable(array) {
                    if (!this.firstImport) {
                        return;
                    }
                    let section = wasmStartSection(array, WasmSection.Import, "import_table");
                    log(section.data, array.position, this.importCount, "num imports");
                    section.data.writeUnsignedLEB128(this.importCount);
                    let current = this.firstImport;
                    let count = 0;
                    while (current != null) {
                        log(section.data, array.position, null, `import func (${count}) ${current.module} ${current.name}`);
                        section.data.writeWasmString(current.module);
                        section.data.writeWasmString(current.name);
                        section.data.writeUnsignedLEB128(WasmExternalKind.Function);
                        section.data.writeUnsignedLEB128(current.signatureIndex);
                        current = current.next;
                        count++;
                    }
                    wasmFinishSection(array, section);
                }
                emitFunctionDeclarations(array) {
                    if (!this.firstFunction) {
                        return;
                    }
                    let section = wasmStartSection(array, WasmSection.Function, "function_declarations");
                    log(section.data, array.position, this.functionCount, "num functions");
                    section.data.writeUnsignedLEB128(this.functionCount);
                    let fn = this.firstFunction;
                    let count = this.importCount;
                    while (fn != null) {
                        log(section.data, array.position, fn.signatureIndex, `func ${count} sig ${getWasmFunctionName(fn)}`);
                        section.data.writeUnsignedLEB128(fn.signatureIndex);
                        fn = fn.next;
                        count++;
                    }
                    wasmFinishSection(array, section);
                }
                emitTables(array) {
                    //TODO
                }
                emitMemory(array) {
                    let section = wasmStartSection(array, WasmSection.Memory, "memory");
                    log(section.data, array.position, "01", "num memories");
                    section.data.writeUnsignedLEB128(1); //indicating the number of memories defined by the module, In the MVP, the number of memories must be no more than 1.
                    //resizable_limits
                    log(section.data, array.position, "00", "memory flags");
                    section.data.writeUnsignedLEB128(WASM_SET_MAX_MEMORY ? 0x1 : 0); //flags, bit 0x1 is set if the maximum field is present
                    log(section.data, array.position, WASM_SIZE_IN_PAGES, "memory initial pages");
                    section.data.writeUnsignedLEB128(WASM_SIZE_IN_PAGES); //initial length (in units of table elements or wasm pages)
                    if (WASM_SET_MAX_MEMORY) {
                        log(section.data, array.position, WASM_MAX_MEMORY, "maximum memory");
                        section.data.writeUnsignedLEB128(WASM_MAX_MEMORY); // maximum, only present if specified by flags
                    }
                    wasmFinishSection(array, section);
                }
                emitGlobalDeclarations(array) {
                    if (!this.firstGlobal) {
                        return;
                    }
                    let section = wasmStartSection(array, WasmSection.Global, "global");
                    section.data.writeUnsignedLEB128(this.globalCount);
                    let global = this.firstGlobal;
                    while (global) {
                        let dataType = typeToDataType(global.symbol.resolvedType, this.bitness);
                        let value = global.symbol.node.variableValue();
                        // if(value.resolvedType != global.symbol.resolvedType){
                        //     value.becomeTypeOf();
                        // }
                        section.data.append(WasmType[dataType]); //content_type
                        section.data.writeUnsignedLEB128(0); //mutability, 0 if immutable, 1 if mutable. MVP only support immutable global variables
                        if (value) {
                            if (value.rawValue) {
                                section.data.writeUnsignedLEB128(opcode_1.WasmOpcode[`${dataType}_CONST`]);
                                switch (dataType) {
                                    case "I32":
                                        section.data.writeUnsignedLEB128(value.rawValue);
                                        break;
                                    case "F32":
                                        section.data.writeFloat(value.rawValue);
                                        break;
                                    case "F64":
                                        section.data.writeDouble(value.rawValue);
                                        break;
                                } //const value
                            }
                            else {
                                this.emitNode(section.data, array.position, value); //const value
                            }
                        }
                        else {
                            section.data.writeUnsignedLEB128(opcode_1.WasmOpcode[`${dataType}_CONST`]);
                            section.data.writeUnsignedLEB128(0); //const value
                        }
                        section.data.writeUnsignedLEB128(opcode_1.WasmOpcode.END);
                        global = global.next;
                    }
                    wasmFinishSection(array, section);
                }
                emitExportTable(array) {
                    let exportedCount = 0;
                    let fn = this.firstFunction;
                    while (fn != null) {
                        if (fn.isExported) {
                            exportedCount = exportedCount + 1;
                        }
                        fn = fn.next;
                    }
                    if (exportedCount == 0) {
                        return;
                    }
                    let section = wasmStartSection(array, WasmSection.Export, "export_table");
                    log(section.data, array.position, exportedCount, "num exports");
                    section.data.writeUnsignedLEB128(exportedCount + 1);
                    //Export main memory
                    let memoryName = "memory";
                    log(section.data, array.position, memoryName.length, "export name length");
                    log(section.data, null, null, `${utils_1.toHex(section.data.position + array.position + 4)}: ${memoryName} // export name`);
                    section.data.writeWasmString(memoryName);
                    log(section.data, array.position, WasmExternalKind.Function, "export kind");
                    section.data.writeUnsignedLEB128(WasmExternalKind.Memory);
                    log(section.data, array.position, 0, "export memory index");
                    section.data.writeUnsignedLEB128(0);
                    let i = this.importCount;
                    fn = this.firstFunction;
                    while (fn != null) {
                        if (fn.isExported) {
                            let fnName = getWasmFunctionName(fn);
                            log(section.data, array.position, fnName.length, "export name length");
                            log(section.data, null, null, `${utils_1.toHex(section.data.position + array.position + 4)}: ${fnName} // export name`);
                            section.data.writeWasmString(fnName);
                            log(section.data, array.position, WasmExternalKind.Function, "export kind");
                            section.data.writeUnsignedLEB128(WasmExternalKind.Function);
                            log(section.data, array.position, i, "export func index");
                            section.data.writeUnsignedLEB128(i);
                        }
                        fn = fn.next;
                        i = i + 1;
                    }
                    wasmFinishSection(array, section);
                }
                emitStartFunctionDeclaration(array) {
                    if (this.startFunctionIndex != -1) {
                        let section = wasmStartSection(array, WasmSection.Start, "start_function");
                        log(section.data, array.position, this.startFunctionIndex, "start function index");
                        section.data.writeUnsignedLEB128(this.startFunctionIndex);
                        wasmFinishSection(array, section);
                    }
                }
                emitElements(array) {
                    //TODO
                }
                emitFunctionBodies(array) {
                    if (!this.firstFunction) {
                        return;
                    }
                    let offset = array.position;
                    let section = wasmStartSection(array, WasmSection.Code, "function_bodies");
                    log(section.data, offset, this.functionCount, "num functions");
                    section.data.writeUnsignedLEB128(this.functionCount);
                    let count = 0;
                    let fn = this.firstFunction;
                    while (fn != null) {
                        let sectionOffset = offset + section.data.position;
                        let bodyData = new bytearray_1.ByteArray();
                        log(bodyData, sectionOffset, fn.localCount ? fn.localCount : 0, "local var count");
                        if (fn.localCount > 0) {
                            bodyData.writeUnsignedLEB128(fn.localCount); //local_count
                            //let localBlock = new ByteArray(); TODO: Optimize local declarations
                            //local_entry
                            let local = fn.firstLocal;
                            while (local) {
                                log(bodyData, sectionOffset, 1, "local index");
                                bodyData.writeUnsignedLEB128(1); //count
                                let wasmType = symbolToValueType(local.symbol, this.bitness);
                                log(bodyData, sectionOffset, wasmType, WasmType[wasmType]);
                                bodyData.append(wasmType); //value_type
                                local = local.next;
                            }
                        }
                        else {
                            bodyData.writeUnsignedLEB128(0);
                        }
                        if (fn.isConstructor) {
                            this.emitInstantiator(bodyData, sectionOffset, fn.symbol.node);
                        }
                        else {
                            let child = fn.symbol.node.functionBody().firstChild;
                            while (child != null) {
                                this.emitNode(bodyData, sectionOffset, child);
                                child = child.nextSibling;
                            }
                        }
                        appendOpcode(bodyData, sectionOffset, opcode_1.WasmOpcode.END); //end, 0x0b, indicating the end of the body
                        //Copy and finish body
                        section.data.writeUnsignedLEB128(bodyData.length);
                        log(section.data, offset, null, ` - func body ${count++} (${getWasmFunctionName(fn)})`);
                        log(section.data, offset, bodyData.length, "func body size");
                        section.data.log += bodyData.log;
                        section.data.copy(bodyData);
                        fn = fn.next;
                    }
                    wasmFinishSection(array, section);
                }
                emitDataSegments(array) {
                    this.growMemoryInitializer();
                    let memoryInitializer = this.memoryInitializer;
                    let initializerLength = memoryInitializer.length;
                    let initialHeapPointer = imports_1.alignToNextMultipleOf(WASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);
                    // Pass the initial heap pointer to the "malloc" function
                    memoryInitializer.writeUnsignedInt(initialHeapPointer, this.originalHeapPointer);
                    memoryInitializer.writeUnsignedInt(initialHeapPointer, this.currentHeapPointer);
                    let section = wasmStartSection(array, WasmSection.Data, "data_segments");
                    // This only writes one single section containing everything
                    log(section.data, array.position, 1, "num data segments");
                    section.data.writeUnsignedLEB128(1);
                    //data_segment
                    log(section.data, array.position, null, " - data segment header 0");
                    log(section.data, array.position, 0, "memory index");
                    section.data.writeUnsignedLEB128(0); //index, the linear memory index (0 in the MVP)
                    //offset, an i32 initializer expression that computes the offset at which to place the data
                    //FIXME: This could be wrong
                    appendOpcode(section.data, array.position, opcode_1.WasmOpcode.I32_CONST);
                    log(section.data, array.position, WASM_MEMORY_INITIALIZER_BASE, "i32 literal");
                    section.data.writeUnsignedLEB128(WASM_MEMORY_INITIALIZER_BASE); //const value
                    appendOpcode(section.data, array.position, opcode_1.WasmOpcode.END);
                    log(section.data, array.position, initializerLength, "data segment size");
                    section.data.writeUnsignedLEB128(initializerLength); //size, size of data (in bytes)
                    log(section.data, array.position, null, " - data segment data 0");
                    //data, sequence of size bytes
                    // Copy the entire memory initializer (also includes zero-initialized data for now)
                    let i = 0;
                    let value;
                    while (i < initializerLength) {
                        for (let j = 0; j < 16; j++) {
                            if (i + j < initializerLength) {
                                value = memoryInitializer.get(i + j);
                                section.data.append(value);
                                logData(section.data, array.position, value, j == 0);
                            }
                        }
                        section.data.log += "\n";
                        i = i + 16;
                    }
                    // section.data.copy(memoryInitializer, initializerLength);
                    wasmFinishSection(array, section);
                }
                emitNames(array) {
                    let section = wasmStartSection(array, 0, "names");
                    array.writeUnsignedLEB128(this.functionCount);
                    let fn = this.firstFunction;
                    while (fn != null) {
                        let name = getWasmFunctionName(fn);
                        array.writeWasmString(name);
                        array.writeUnsignedLEB128(0); // No local variables for now
                        fn = fn.next;
                    }
                    wasmFinishSection(array, section);
                }
                prepareToEmit(node) {
                    if (node.kind == node_6.NodeKind.STRING) {
                        let text = node.stringValue;
                        let length = text.length;
                        let offset = this.context.allocateGlobalVariableOffset(length * 2 + 4, 4);
                        node.intValue = offset;
                        this.growMemoryInitializer();
                        let memoryInitializer = this.memoryInitializer;
                        // Emit a length-prefixed string
                        bytearray_1.ByteArray_set32(memoryInitializer, offset, length);
                        bytearray_1.ByteArray_setString(memoryInitializer, offset + 4, text);
                    }
                    else if (node.kind == node_6.NodeKind.VARIABLE) {
                        let symbol = node.symbol;
                        if (symbol.kind == symbol_6.SymbolKind.VARIABLE_GLOBAL) {
                            let sizeOf = symbol.resolvedType.variableSizeOf(this.context);
                            let value = symbol.node.variableValue();
                            let memoryInitializer = this.memoryInitializer;
                            // Copy the initial value into the memory initializer
                            this.growMemoryInitializer();
                            let offset = symbol.offset;
                            if (sizeOf == 1) {
                                if (symbol.resolvedType.isUnsigned()) {
                                    memoryInitializer.writeUnsignedByte(value.intValue, offset);
                                }
                                else {
                                    memoryInitializer.writeByte(value.intValue, offset);
                                }
                            }
                            else if (sizeOf == 2) {
                                if (symbol.resolvedType.isUnsigned()) {
                                    memoryInitializer.writeUnsignedShort(value.intValue, offset);
                                }
                                else {
                                    memoryInitializer.writeShort(value.intValue, offset);
                                }
                            }
                            else if (sizeOf == 4) {
                                if (symbol.resolvedType.isFloat()) {
                                    memoryInitializer.writeFloat(value.floatValue, offset);
                                }
                                else {
                                    if (symbol.resolvedType.isUnsigned()) {
                                        memoryInitializer.writeUnsignedInt(value.intValue, offset);
                                    }
                                    else {
                                        memoryInitializer.writeInt(value.intValue, offset);
                                    }
                                }
                            }
                            else if (sizeOf == 8) {
                                if (symbol.resolvedType.isDouble()) {
                                    memoryInitializer.writeDouble(value.rawValue, offset);
                                }
                                else {
                                    //TODO Implement Int64 write
                                    if (symbol.resolvedType.isUnsigned()) {
                                        //memoryInitializer.writeUnsignedInt64(value.rawValue, offset);
                                    }
                                    else {
                                        //memoryInitializer.writeInt64(value.rawValue, offset);
                                    }
                                }
                            }
                            else
                                assert(false);
                            //let global = this.allocateGlobal(symbol);// Since
                            // Make sure the heap offset is tracked
                            if (symbol.name == "currentHeapPointer") {
                                assert(this.currentHeapPointer == -1);
                                this.currentHeapPointer = symbol.offset;
                            }
                            else if (symbol.name == "originalHeapPointer") {
                                assert(this.originalHeapPointer == -1);
                                this.originalHeapPointer = symbol.offset;
                            }
                        }
                    }
                    else if (node.kind == node_6.NodeKind.FUNCTION) {
                        let returnType = node.functionReturnType();
                        let shared = new WasmSharedOffset();
                        let argumentTypesFirst = null;
                        let argumentTypesLast = null;
                        let symbol = node.symbol;
                        let isConstructor = symbol.name == "constructor";
                        // Make sure to include the implicit "this" variable as a normal argument
                        let argument = node.isExternalImport() ? node.functionFirstArgumentIgnoringThis() : node.functionFirstArgument();
                        while (argument != returnType) {
                            let type = wasmWrapType(this.getWasmType(argument.variableType().resolvedType));
                            if (argumentTypesFirst == null)
                                argumentTypesFirst = type;
                            else
                                argumentTypesLast.next = type;
                            argumentTypesLast = type;
                            shared.nextLocalOffset = shared.nextLocalOffset + 1;
                            argument = argument.nextSibling;
                        }
                        let signatureIndex = this.allocateSignature(argumentTypesFirst, wasmWrapType(this.getWasmType(returnType.resolvedType)));
                        let body = node.functionBody();
                        // Functions without bodies are imports
                        if (body == null) {
                            let moduleName = symbol.kind == symbol_6.SymbolKind.FUNCTION_INSTANCE ? symbol.parent().name : "global";
                            symbol.offset = this.importCount;
                            this.allocateImport(signatureIndex, moduleName, symbol.name);
                            node = node.nextSibling;
                            return;
                        }
                        else {
                            symbol.offset = this.functionCount;
                        }
                        let fn = this.allocateFunction(symbol, signatureIndex);
                        // Make sure "malloc" is tracked
                        if (symbol.kind == symbol_6.SymbolKind.FUNCTION_GLOBAL && symbol.name == "malloc") {
                            assert(this.mallocFunctionIndex == -1);
                            this.mallocFunctionIndex = symbol.offset;
                        }
                        if (symbol.kind == symbol_6.SymbolKind.FUNCTION_GLOBAL && symbol.name == "free") {
                            assert(this.freeFunctionIndex == -1);
                            this.freeFunctionIndex = symbol.offset;
                        }
                        // Make "init_malloc" as start function
                        if (symbol.kind == symbol_6.SymbolKind.FUNCTION_GLOBAL && symbol.name == "init_malloc") {
                            assert(this.startFunctionIndex == -1);
                            this.startFunctionIndex = symbol.offset;
                        }
                        if (node.isExport()) {
                            fn.isExported = true;
                        }
                        // Assign local variable offsets
                        wasmAssignLocalVariableOffsets(fn, body, shared);
                        fn.localCount = shared.localCount;
                        if (isConstructor) {
                            let ctrSignatureIndex = this.allocateSignature(argumentTypesFirst.next, wasmWrapType(this.getWasmType(returnType.resolvedType)));
                            let fn = this.allocateFunction(symbol, ctrSignatureIndex);
                            fn.isExported = true;
                            fn.isConstructor = true;
                            wasmAssignLocalVariableOffsets(fn, body, shared);
                            fn.localCount = shared.localCount;
                        }
                    }
                    let child = node.firstChild;
                    while (child != null) {
                        this.prepareToEmit(child);
                        child = child.nextSibling;
                    }
                }
                emitBinaryExpression(array, byteOffset, node, opcode) {
                    this.emitNode(array, byteOffset, node.binaryLeft());
                    this.emitNode(array, byteOffset, node.binaryRight());
                    appendOpcode(array, byteOffset, opcode);
                }
                emitLoadFromMemory(array, byteOffset, type, relativeBase, offset) {
                    let opcode;
                    // Relative address
                    if (relativeBase != null) {
                        this.emitNode(array, byteOffset, relativeBase);
                    }
                    else {
                        opcode = opcode_1.WasmOpcode.I32_CONST;
                        appendOpcode(array, byteOffset, opcode);
                        log(array, byteOffset, 0, "i32 literal");
                        array.writeUnsignedLEB128(0);
                    }
                    let sizeOf = type.variableSizeOf(this.context);
                    if (sizeOf == 1) {
                        opcode = type.isUnsigned() ? opcode_1.WasmOpcode.I32_LOAD8_U : opcode_1.WasmOpcode.I32_LOAD8_S;
                        appendOpcode(array, byteOffset, opcode);
                        log(array, byteOffset, 0, "alignment");
                        array.writeUnsignedLEB128(0);
                    }
                    else if (sizeOf == 2) {
                        opcode = type.isUnsigned() ? opcode_1.WasmOpcode.I32_LOAD16_U : opcode_1.WasmOpcode.I32_LOAD16_S;
                        appendOpcode(array, byteOffset, opcode);
                        log(array, byteOffset, 1, "alignment");
                        array.writeUnsignedLEB128(1);
                    }
                    else if (sizeOf == 4 || type.isClass()) {
                        if (type.isFloat()) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_LOAD);
                        }
                        else {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_LOAD);
                        }
                        log(array, byteOffset, 2, "alignment");
                        array.writeUnsignedLEB128(2);
                    }
                    else if (sizeOf == 8) {
                        if (type.isDouble()) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_LOAD);
                        }
                        else {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_LOAD);
                        }
                        log(array, byteOffset, 3, "alignment");
                        array.writeUnsignedLEB128(3);
                    }
                    else {
                        assert(false);
                    }
                    log(array, byteOffset, offset, "load offset");
                    array.writeUnsignedLEB128(offset);
                }
                emitStoreToMemory(array, byteOffset, type, relativeBase, offset, value) {
                    let opcode;
                    // Relative address
                    if (relativeBase != null) {
                        this.emitNode(array, byteOffset, relativeBase);
                    }
                    else {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, 0, "i32 literal");
                        array.writeUnsignedLEB128(0);
                    }
                    this.emitNode(array, byteOffset, value);
                    let sizeOf = type.variableSizeOf(this.context);
                    if (sizeOf == 1) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_STORE8);
                        log(array, byteOffset, 0, "alignment");
                        array.writeUnsignedLEB128(0);
                    }
                    else if (sizeOf == 2) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_STORE16);
                        log(array, byteOffset, 1, "alignment");
                        array.writeUnsignedLEB128(1);
                    }
                    else if (sizeOf == 4 || type.isClass()) {
                        if (type.isFloat()) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_STORE);
                        }
                        else {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_STORE);
                        }
                        log(array, byteOffset, 2, "alignment");
                        array.writeUnsignedLEB128(2);
                    }
                    else if (sizeOf == 8) {
                        if (type.isDouble()) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_STORE);
                        }
                        else if (type.isLong()) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_STORE);
                        }
                        log(array, byteOffset, 3, "alignment");
                        array.writeUnsignedLEB128(3);
                    }
                    else {
                        assert(false);
                    }
                    log(array, byteOffset, offset, "load offset");
                    array.writeUnsignedLEB128(offset);
                }
                emitConstructor(array, byteOffset, node) {
                    let constructorNode = node.constructorNode();
                    let callSymbol = constructorNode.symbol;
                    let child = node.firstChild.nextSibling;
                    while (child != null) {
                        this.emitNode(array, byteOffset, child);
                        child = child.nextSibling;
                    }
                    let type = node.newType();
                    let size;
                    if (type.resolvedType.isArray()) {
                        let elementType = type.firstChild.firstChild.resolvedType;
                        //ignore 64 bit pointer
                        size = elementType.isClass() ? 4 : elementType.allocationSizeOf(this.context);
                        assert(size > 0);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, size, "i32 literal");
                        array.writeLEB128(size);
                    }
                    let callIndex = this.getWasmFunctionCallIndex(callSymbol);
                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL);
                    log(array, byteOffset, callIndex, `call func index (${callIndex})`);
                    array.writeUnsignedLEB128(callIndex);
                }
                //emit constructor function for javascript
                emitInstantiator(array, byteOffset, constructorNode) {
                    let callSymbol = constructorNode.symbol;
                    let type = constructorNode.parent.symbol;
                    let size = type.resolvedType.allocationSizeOf(this.context);
                    assert(size > 0);
                    if (type.resolvedType.isArray()) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.GET_LOCAL);
                        array.writeUnsignedLEB128(0);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, size, "i32 literal");
                        array.writeLEB128(size);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_ADD);
                    }
                    else if (type.resolvedType.isTypedArray()) {
                        let elementSize = getTypedArrayElementSize(type.resolvedType.symbol.name);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.GET_LOCAL);
                        array.writeUnsignedLEB128(0);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, elementSize, "i32 literal");
                        array.writeLEB128(elementSize);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_SHL);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, size, "i32 literal");
                        array.writeLEB128(size);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_ADD);
                    }
                    else {
                        // Pass the object size as the first argument
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, size, "i32 literal");
                        array.writeLEB128(size);
                    }
                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL);
                    log(array, byteOffset, this.mallocFunctionIndex, `call func index (${this.mallocFunctionIndex})`);
                    array.writeUnsignedLEB128(this.mallocFunctionIndex);
                    let child = constructorNode.firstChild.nextSibling; //ignore this pointer argument
                    while (child != null) {
                        if (child.kind == node_6.NodeKind.VARIABLE) {
                            let symbol = child.symbol;
                            let offset = symbol.offset - 1; //ignore this pointer argument
                            if (symbol.kind == symbol_6.SymbolKind.VARIABLE_ARGUMENT) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.GET_LOCAL);
                                log(array, byteOffset, offset, "local index");
                                array.writeUnsignedLEB128(offset);
                            }
                        }
                        child = child.nextSibling;
                    }
                    let callIndex = this.getWasmFunctionCallIndex(callSymbol);
                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL);
                    log(array, byteOffset, callIndex, `call func index (${callIndex})`);
                    array.writeUnsignedLEB128(callIndex);
                }
                emitNode(array, byteOffset, node) {
                    assert(!node_6.isExpression(node) || node.resolvedType != null);
                    if (node.kind == node_6.NodeKind.BLOCK) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BLOCK);
                        log(array, byteOffset, WasmType.block_type, WasmType[WasmType.block_type]);
                        array.append(WasmType.block_type);
                        let child = node.firstChild;
                        while (child != null) {
                            this.emitNode(array, byteOffset, child);
                            child = child.nextSibling;
                        }
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END);
                    }
                    else if (node.kind == node_6.NodeKind.WHILE) {
                        let value = node.whileValue();
                        let body = node.whileBody();
                        // Ignore "while (false) { ... }"
                        if (value.kind == node_6.NodeKind.BOOLEAN && value.intValue == 0) {
                            return 0;
                        }
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BLOCK);
                        log(array, 0, WasmType.block_type, WasmType[WasmType.block_type]);
                        array.append(WasmType.block_type);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.LOOP);
                        log(array, 0, WasmType.block_type, WasmType[WasmType.block_type]);
                        array.append(WasmType.block_type);
                        if (value.kind != node_6.NodeKind.BOOLEAN) {
                            this.emitNode(array, byteOffset, value);
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_EQZ);
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BR_IF);
                            array.writeUnsignedLEB128(1); // Break out of the immediately enclosing loop
                        }
                        let child = body.firstChild;
                        while (child != null) {
                            this.emitNode(array, byteOffset, child);
                            child = child.nextSibling;
                        }
                        // Jump back to the top (this doesn't happen automatically)
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BR);
                        array.writeUnsignedLEB128(0); // Continue back to the immediately enclosing loop
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END);
                    }
                    else if (node.kind == node_6.NodeKind.BREAK || node.kind == node_6.NodeKind.CONTINUE) {
                        let label = 0;
                        let parent = node.parent;
                        while (parent != null && parent.kind != node_6.NodeKind.WHILE) {
                            if (parent.kind == node_6.NodeKind.BLOCK) {
                                label = label + 1;
                            }
                            parent = parent.parent;
                        }
                        assert(label > 0);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BR);
                        array.writeUnsignedLEB128(label - (node.kind == node_6.NodeKind.BREAK ? 0 : 1));
                    }
                    else if (node.kind == node_6.NodeKind.EMPTY) {
                        return 0;
                    }
                    else if (node.kind == node_6.NodeKind.EXPRESSION) {
                        this.emitNode(array, byteOffset, node.expressionValue());
                    }
                    else if (node.kind == node_6.NodeKind.RETURN) {
                        let value = node.returnValue();
                        if (value != null) {
                            this.emitNode(array, byteOffset, value);
                            if (value.kind == node_6.NodeKind.NEW) {
                                this.emitConstructor(array, byteOffset, value);
                            }
                        }
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.RETURN);
                    }
                    else if (node.kind == node_6.NodeKind.VARIABLES) {
                        let count = 0;
                        let child = node.firstChild;
                        while (child != null) {
                            assert(child.kind == node_6.NodeKind.VARIABLE);
                            count = count + this.emitNode(array, byteOffset, child);
                            child = child.nextSibling;
                        }
                        return count;
                    }
                    else if (node.kind == node_6.NodeKind.IF) {
                        let branch = node.ifFalse();
                        this.emitNode(array, byteOffset, node.ifValue());
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF);
                        append(array, 0, WasmType.block_type, WasmType[WasmType.block_type]);
                        this.emitNode(array, byteOffset, node.ifTrue());
                        if (branch != null) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF_ELSE);
                            this.emitNode(array, byteOffset, branch);
                        }
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END);
                    }
                    else if (node.kind == node_6.NodeKind.HOOK) {
                        this.emitNode(array, byteOffset, node.hookValue());
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF);
                        let trueValue = node.hookTrue();
                        let trueValueType = symbolToValueType(trueValue.resolvedType.symbol);
                        append(array, 0, trueValueType, WasmType[trueValueType]);
                        this.emitNode(array, byteOffset, trueValue);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF_ELSE);
                        this.emitNode(array, byteOffset, node.hookFalse());
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END);
                    }
                    else if (node.kind == node_6.NodeKind.VARIABLE) {
                        let value = node.variableValue();
                        if (node.symbol.kind == symbol_6.SymbolKind.VARIABLE_LOCAL) {
                            if (value && value.kind != node_6.NodeKind.NAME && value.rawValue) {
                                if (node.symbol.resolvedType.isFloat()) {
                                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST);
                                    log(array, byteOffset, value.floatValue, "f32 literal");
                                    array.writeFloat(value.floatValue);
                                }
                                else if (node.symbol.resolvedType.isDouble()) {
                                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST);
                                    log(array, byteOffset, value.doubleValue, "f64 literal");
                                    array.writeDouble(value.doubleValue);
                                }
                                else if (node.symbol.resolvedType.isLong()) {
                                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST);
                                    log(array, byteOffset, value.longValue, "i64 literal");
                                    array.writeUnsignedLEB128(value.longValue);
                                }
                                else {
                                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                    log(array, byteOffset, value.intValue, "i32 literal");
                                    array.writeUnsignedLEB128(value.intValue);
                                }
                            }
                            else {
                                if (value != null) {
                                    this.emitNode(array, byteOffset, value);
                                }
                                else {
                                    // Default value
                                    if (node.symbol.resolvedType.isFloat()) {
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST);
                                        log(array, byteOffset, 0, "f32 literal");
                                        array.writeFloat(0);
                                    }
                                    else if (node.symbol.resolvedType.isDouble()) {
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST);
                                        log(array, byteOffset, 0, "f64 literal");
                                        array.writeDouble(0);
                                    }
                                    else if (node.symbol.resolvedType.isLong()) {
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST);
                                        log(array, byteOffset, 0, "i64 literal");
                                        array.writeUnsignedLEB128(0);
                                    }
                                    else {
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                        log(array, byteOffset, 0, "i32 literal");
                                        array.writeUnsignedLEB128(0);
                                    }
                                }
                            }
                            if (value.kind == node_6.NodeKind.NEW) {
                                this.emitConstructor(array, byteOffset, value);
                            }
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL);
                            log(array, byteOffset, node.symbol.offset, "local index");
                            array.writeUnsignedLEB128(node.symbol.offset);
                        }
                        else {
                            assert(false);
                        }
                    }
                    else if (node.kind == node_6.NodeKind.NAME) {
                        let symbol = node.symbol;
                        if (symbol.kind == symbol_6.SymbolKind.VARIABLE_ARGUMENT || symbol.kind == symbol_6.SymbolKind.VARIABLE_LOCAL) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.GET_LOCAL);
                            log(array, byteOffset, symbol.offset, "local index");
                            array.writeUnsignedLEB128(symbol.offset);
                        }
                        else if (symbol.kind == symbol_6.SymbolKind.VARIABLE_GLOBAL) {
                            //Global variables are immutable so we need to store then in memory
                            //appendOpcode(array, byteOffset, WasmOpcode.GET_GLOBAL);
                            //array.writeUnsignedLEB128(symbol.offset);
                            this.emitLoadFromMemory(array, byteOffset, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset);
                        }
                        else {
                            assert(false);
                        }
                    }
                    else if (node.kind == node_6.NodeKind.DEREFERENCE) {
                        this.emitLoadFromMemory(array, byteOffset, node.resolvedType.underlyingType(this.context), node.unaryValue(), 0);
                    }
                    else if (node.kind == node_6.NodeKind.NULL) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, 0, "i32 literal");
                        array.writeLEB128(0);
                    }
                    else if (node.kind == node_6.NodeKind.INT32 || node.kind == node_6.NodeKind.BOOLEAN) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, node.intValue, "i32 literal");
                        array.writeLEB128(node.intValue || 0);
                    }
                    else if (node.kind == node_6.NodeKind.INT64) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST);
                        log(array, byteOffset, node.longValue, "i64 literal");
                        array.writeLEB128(node.longValue || 0);
                    }
                    else if (node.kind == node_6.NodeKind.FLOAT32) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST);
                        log(array, byteOffset, node.floatValue, "f32 literal");
                        array.writeFloat(node.floatValue || 0);
                    }
                    else if (node.kind == node_6.NodeKind.FLOAT64) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST);
                        log(array, byteOffset, node.doubleValue, "f64 literal");
                        array.writeDouble(node.doubleValue || 0);
                    }
                    else if (node.kind == node_6.NodeKind.STRING) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        let value = WASM_MEMORY_INITIALIZER_BASE + node.intValue;
                        log(array, byteOffset, value, "i32 literal");
                        array.writeLEB128(value);
                    }
                    else if (node.kind == node_6.NodeKind.CALL) {
                        let value = node.callValue();
                        let symbol = value.symbol;
                        assert(symbol_6.isFunction(symbol.kind));
                        // Write out the implicit "this" argument
                        if (!symbol.node.isExternalImport() && symbol.kind == symbol_6.SymbolKind.FUNCTION_INSTANCE) {
                            this.emitNode(array, byteOffset, value.dotTarget());
                        }
                        let child = value.nextSibling;
                        while (child != null) {
                            this.emitNode(array, byteOffset, child);
                            child = child.nextSibling;
                        }
                        let callIndex = this.getWasmFunctionCallIndex(symbol);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL);
                        log(array, byteOffset, callIndex, `call func index (${callIndex})`);
                        array.writeUnsignedLEB128(callIndex);
                    }
                    else if (node.kind == node_6.NodeKind.NEW) {
                        let type = node.newType();
                        let size;
                        if (type.resolvedType.isArray()) {
                            let elementType = type.resolvedType;
                            let isClassElement = elementType.isClass();
                            //ignore 64 bit pointer
                            size = isClassElement ? 4 : elementType.allocationSizeOf(this.context);
                            assert(size > 0);
                            let lengthNode = node.arrayLength();
                            if (lengthNode.kind == node_6.NodeKind.INT32) {
                                size = size * lengthNode.intValue;
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                array.writeLEB128(size);
                                log(array, byteOffset, size, "i32 literal");
                            }
                            else {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                array.writeLEB128(size);
                                log(array, byteOffset, size, "i32 literal");
                                this.emitNode(array, byteOffset, lengthNode);
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_MUL);
                            }
                            if (isClassElement) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                array.writeLEB128(size);
                                let callIndex = this.getWasmFunctionCallIndex(elementType.symbol.node.constructorFunctionNode.symbol) + 1;
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL);
                                log(array, byteOffset, callIndex, `call func index (${callIndex})`);
                                array.writeUnsignedLEB128(callIndex);
                            }
                            else {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL);
                                log(array, byteOffset, this.mallocFunctionIndex, `call func index (${this.mallocFunctionIndex})`);
                                array.writeUnsignedLEB128(this.mallocFunctionIndex);
                            }
                        }
                        else if (type.resolvedType.isTypedArray()) {
                            // let elementSize = getTypedArrayElementSize(type.resolvedType.symbol.name);
                            // appendOpcode(array, byteOffset, WasmOpcode.GET_LOCAL);
                            // array.writeLEB128(0);
                            // appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                            // array.writeLEB128(elementSize);
                            // appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
                            // appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                            // array.writeLEB128(size);
                            // appendOpcode(array, byteOffset, WasmOpcode.I32_ADD);
                        }
                        else {
                            let size = type.resolvedType.allocationSizeOf(this.context);
                            assert(size > 0);
                            // Pass the object size as the first argument
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                            log(array, byteOffset, size, "i32 literal");
                            array.writeLEB128(size);
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL);
                            log(array, byteOffset, this.mallocFunctionIndex, `call func index (${this.mallocFunctionIndex})`);
                            array.writeUnsignedLEB128(this.mallocFunctionIndex);
                        }
                    }
                    else if (node.kind == node_6.NodeKind.DELETE) {
                        let value = node.deleteValue();
                        this.emitNode(array, byteOffset, value);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL);
                        log(array, byteOffset, this.freeFunctionIndex, `call func index (${this.freeFunctionIndex})`);
                        array.writeUnsignedLEB128(this.freeFunctionIndex);
                    }
                    else if (node.kind == node_6.NodeKind.POSITIVE) {
                        this.emitNode(array, byteOffset, node.unaryValue());
                    }
                    else if (node.kind == node_6.NodeKind.NEGATIVE) {
                        let resolvedType = node.unaryValue().resolvedType;
                        if (resolvedType.isFloat()) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST);
                            log(array, byteOffset, 0, "f32 literal");
                            array.writeDouble(0);
                            this.emitNode(array, byteOffset, node.unaryValue());
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_SUB);
                        }
                        else if (resolvedType.isDouble()) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST);
                            log(array, byteOffset, 0, "f64 literal");
                            array.writeDouble(0);
                            this.emitNode(array, byteOffset, node.unaryValue());
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_SUB);
                        }
                        else if (resolvedType.isInteger()) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                            log(array, byteOffset, 0, "i32 literal");
                            array.writeLEB128(0);
                            this.emitNode(array, byteOffset, node.unaryValue());
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_SUB);
                        }
                        else if (resolvedType.isLong()) {
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST);
                            log(array, byteOffset, 0, "i64 literal");
                            array.writeLEB128(0);
                            this.emitNode(array, byteOffset, node.unaryValue());
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_SUB);
                        }
                    }
                    else if (node.kind == node_6.NodeKind.COMPLEMENT) {
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, ~0, "i32 literal");
                        array.writeLEB128(~0);
                        this.emitNode(array, byteOffset, node.unaryValue());
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_XOR);
                    }
                    else if (node.kind == node_6.NodeKind.NOT) {
                        this.emitNode(array, byteOffset, node.unaryValue());
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_EQZ);
                    }
                    else if (node.kind == node_6.NodeKind.CAST) {
                        let value = node.castValue();
                        let context = this.context;
                        let from = value.resolvedType.underlyingType(context);
                        let type = node.resolvedType.underlyingType(context);
                        let fromSize = from.variableSizeOf(context);
                        let typeSize = type.variableSizeOf(context);
                        // The cast isn't needed if it's to a wider integer type
                        // if (from != context.float32Type && from != context.float64Type && (from == type || fromSize < typeSize)) {
                        //     this.emitNode(array, byteOffset, value);
                        // }
                        //
                        // else {
                        // Sign-extend
                        // if (from == context.int32Type && type == context.int8Type || type == context.int16Type) {
                        //     let shift = 32 - typeSize * 8;
                        //     this.emitNode(array, byteOffset, value);
                        //     appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                        //     log(array, byteOffset, shift, "i32 literal");
                        //     array.writeLEB128(shift);
                        //     appendOpcode(array, byteOffset, WasmOpcode.I32_SHR_S);
                        //     appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                        //     log(array, byteOffset, shift, "i32 literal");
                        //     array.writeLEB128(shift);
                        //     appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
                        // }
                        //
                        // // Mask
                        // else if (type == context.uint8Type || type == context.uint16Type) {
                        //     this.emitNode(array, byteOffset, value);
                        //     appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                        //     let _value = type.integerBitMask(this.context);
                        //     log(array, byteOffset, _value, "i32 literal");
                        //     array.writeLEB128(_value);
                        //     appendOpcode(array, byteOffset, WasmOpcode.I32_AND);
                        // }
                        // i32 > i64
                        if ((from == context.int32Type || from == context.uint32Type) &&
                            (type == context.int64Type || type == context.uint64Type)) {
                            if (value.kind == node_6.NodeKind.INT32) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST);
                                log(array, byteOffset, value.longValue, "i64 literal");
                                array.writeLEB128(value.longValue || 0); //TODO: implement i64 write
                            }
                            else {
                                let isUnsigned = value.resolvedType.isUnsigned();
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I64_EXTEND_U_I32 : opcode_1.WasmOpcode.I64_EXTEND_S_I32);
                            }
                        }
                        else if ((from == context.int32Type || from == context.uint32Type) &&
                            type == context.float32Type) {
                            if (value.kind == node_6.NodeKind.INT32) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST);
                                log(array, byteOffset, value.floatValue, "f32 literal");
                                array.writeFloat(value.floatValue || 0);
                            }
                            else {
                                let isUnsigned = value.resolvedType.isUnsigned();
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F32_CONVERT_U_I32 : opcode_1.WasmOpcode.F32_CONVERT_S_I32);
                            }
                        }
                        else if ((from == context.int32Type || from == context.uint32Type) &&
                            type == context.float64Type) {
                            if (value.kind == node_6.NodeKind.INT32) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST);
                                log(array, byteOffset, value.doubleValue, "f64 literal");
                                array.writeDouble(value.doubleValue || 0);
                            }
                            else {
                                let isUnsigned = value.resolvedType.isUnsigned();
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F64_CONVERT_U_I32 : opcode_1.WasmOpcode.F64_CONVERT_S_I32);
                            }
                        }
                        else if ((from == context.int64Type || from == context.uint64Type) &&
                            (type == context.int32Type || type == context.uint32Type)) {
                            if (value.kind == node_6.NodeKind.INT64) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                log(array, byteOffset, value.intValue, "i32 literal");
                                array.writeLEB128(value.intValue || 0);
                            }
                            else {
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_WRAP_I64);
                            }
                        }
                        else if ((from == context.int64Type || from == context.uint64Type) &&
                            type == context.float32Type) {
                            if (value.kind == node_6.NodeKind.INT32) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST);
                                log(array, byteOffset, value.floatValue, "f32 literal");
                                array.writeFloat(value.floatValue || 0);
                            }
                            else {
                                let isUnsigned = value.resolvedType.isUnsigned();
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F32_CONVERT_U_I64 : opcode_1.WasmOpcode.F32_CONVERT_S_I64);
                            }
                        }
                        else if (from == context.int64Type && type == context.float64Type) {
                            if (value.kind == node_6.NodeKind.INT64) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST);
                                log(array, byteOffset, value.doubleValue, "f64 literal");
                                array.writeDouble(value.doubleValue || 0);
                            }
                            else {
                                let isUnsigned = value.resolvedType.isUnsigned();
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F64_CONVERT_U_I64 : opcode_1.WasmOpcode.F64_CONVERT_S_I64);
                            }
                        }
                        else if (from == context.float32Type &&
                            (type == context.uint8Type || type == context.int8Type ||
                                type == context.uint16Type || type == context.int16Type ||
                                type == context.uint32Type || type == context.int32Type)) {
                            if (value.kind == node_6.NodeKind.FLOAT32) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                log(array, byteOffset, value.intValue, "i32 literal");
                                array.writeLEB128(value.intValue || 0);
                            }
                            else {
                                let isUnsigned = type.isUnsigned();
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I32_TRUNC_U_F32 : opcode_1.WasmOpcode.I32_TRUNC_S_F32);
                            }
                        }
                        else if (from == context.float32Type &&
                            (type == context.int64Type || type == context.uint64Type)) {
                            if (value.kind == node_6.NodeKind.FLOAT32) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST);
                                log(array, byteOffset, value.longValue, "i64 literal");
                                array.writeLEB128(value.longValue || 0);
                            }
                            else {
                                let isUnsigned = type.isUnsigned();
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I64_TRUNC_U_F32 : opcode_1.WasmOpcode.I64_TRUNC_S_F32);
                            }
                        }
                        else if (from == context.float32Type && type == context.float64Type) {
                            if (value.kind == node_6.NodeKind.FLOAT32) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST);
                                log(array, byteOffset, value.doubleValue, "f64 literal");
                                array.writeDouble(value.doubleValue || 0);
                            }
                            else {
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_PROMOTE_F32);
                            }
                        }
                        else if (from == context.float64Type &&
                            (type == context.uint8Type || type == context.int8Type ||
                                type == context.uint16Type || type == context.int16Type ||
                                type == context.uint32Type || type == context.int32Type)) {
                            if (value.kind == node_6.NodeKind.FLOAT64) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                log(array, byteOffset, value.intValue, "i32 literal");
                                array.writeLEB128(value.intValue || 0);
                            }
                            else {
                                let isUnsigned = type.isUnsigned();
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I32_TRUNC_U_F64 : opcode_1.WasmOpcode.I32_TRUNC_S_F64);
                            }
                        }
                        else if (from == context.float64Type &&
                            (type == context.int64Type || type == context.uint64Type)) {
                            if (value.kind == node_6.NodeKind.FLOAT64) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST);
                                log(array, byteOffset, value.longValue, "i64 literal");
                                array.writeLEB128(value.longValue || 0);
                            }
                            else {
                                let isUnsigned = type.isUnsigned();
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I64_TRUNC_U_F64 : opcode_1.WasmOpcode.I64_TRUNC_S_F64);
                            }
                        }
                        else if (from == context.float64Type && type == context.float32Type) {
                            if (value.kind == node_6.NodeKind.FLOAT64) {
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST);
                                log(array, byteOffset, value.floatValue, "f32 literal");
                                array.writeFloat(value.floatValue || 0);
                            }
                            else {
                                this.emitNode(array, byteOffset, value);
                                appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_DEMOTE_F64);
                            }
                        }
                        else {
                            this.emitNode(array, byteOffset, value);
                        }
                        // }
                    }
                    else if (node.kind == node_6.NodeKind.DOT) {
                        let symbol = node.symbol;
                        if (symbol.kind == symbol_6.SymbolKind.VARIABLE_INSTANCE) {
                            this.emitLoadFromMemory(array, byteOffset, symbol.resolvedType, node.dotTarget(), symbol.offset);
                        }
                        else {
                            assert(false);
                        }
                    }
                    else if (node.kind == node_6.NodeKind.ASSIGN) {
                        let left = node.binaryLeft();
                        let right = node.binaryRight();
                        let symbol = left.symbol;
                        if (left.kind == node_6.NodeKind.DEREFERENCE) {
                            this.emitStoreToMemory(array, byteOffset, left.resolvedType.underlyingType(this.context), left.unaryValue(), 0, right);
                        }
                        else if (symbol.kind == symbol_6.SymbolKind.VARIABLE_INSTANCE) {
                            this.emitStoreToMemory(array, byteOffset, symbol.resolvedType, left.dotTarget(), symbol.offset, right);
                        }
                        else if (symbol.kind == symbol_6.SymbolKind.VARIABLE_GLOBAL) {
                            //Global variables are immutable in MVP so we need to store them in memory
                            // this.emitNode(array, byteOffset, right);
                            // appendOpcode(array, byteOffset, WasmOpcode.SET_GLOBAL);
                            // array.writeUnsignedLEB128(symbol.offset);
                            this.emitStoreToMemory(array, byteOffset, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset, right);
                        }
                        else if (symbol.kind == symbol_6.SymbolKind.VARIABLE_ARGUMENT || symbol.kind == symbol_6.SymbolKind.VARIABLE_LOCAL) {
                            this.emitNode(array, byteOffset, right);
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL);
                            log(array, byteOffset, symbol.offset, "local index");
                            array.writeUnsignedLEB128(symbol.offset);
                        }
                        else {
                            assert(false);
                        }
                    }
                    else if (node.kind == node_6.NodeKind.LOGICAL_AND) {
                        this.emitNode(array, byteOffset, node.binaryLeft());
                        this.emitNode(array, byteOffset, node.binaryRight());
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_AND);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, 1, "i32 literal");
                        array.writeLEB128(1);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_EQ);
                    }
                    else if (node.kind == node_6.NodeKind.LOGICAL_OR) {
                        this.emitNode(array, byteOffset, node.binaryLeft());
                        this.emitNode(array, byteOffset, node.binaryRight());
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_OR);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                        log(array, byteOffset, 1, "i32 literal");
                        array.writeLEB128(1);
                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_EQ);
                    }
                    else if (node_6.isUnary(node.kind)) {
                        let kind = node.kind;
                        if (kind == node_6.NodeKind.POSTFIX_INCREMENT) {
                            let value = node.unaryValue();
                            let dataType = typeToDataType(value.resolvedType, this.bitness);
                            this.emitNode(array, byteOffset, value);
                            assert(value.resolvedType.isInteger() || value.resolvedType.isLong() ||
                                value.resolvedType.isFloat() || value.resolvedType.isDouble());
                            let size = value.resolvedType.pointerTo.allocationSizeOf(this.context);
                            if (size == 1 || size == 2) {
                                if (value.kind == node_6.NodeKind.INT32) {
                                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                    log(array, byteOffset, 1, "i32 literal");
                                    array.writeLEB128(1);
                                }
                                else {
                                    console.error("Wrong type");
                                }
                            }
                            else if (size == 4) {
                                if (value.kind == node_6.NodeKind.INT32) {
                                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                    log(array, byteOffset, 1, "i32 literal");
                                    array.writeLEB128(1);
                                }
                                else if (value.kind == node_6.NodeKind.FLOAT32) {
                                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST);
                                    log(array, byteOffset, 1, "f32 literal");
                                    array.writeFloat(1);
                                }
                                else {
                                    console.error("Wrong type");
                                }
                            }
                            else if (size == 8) {
                                if (value.kind == node_6.NodeKind.INT64) {
                                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST);
                                    log(array, byteOffset, 1, "i64 literal");
                                    array.writeLEB128(1);
                                }
                                else if (value.kind == node_6.NodeKind.FLOAT64) {
                                    appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST);
                                    log(array, byteOffset, 1, "f64 literal");
                                    array.writeDouble(1);
                                }
                                else {
                                    console.error("Wrong type");
                                }
                            }
                            // if (value.resolvedType.pointerTo == null) {
                            //     this.emitNode(array, byteOffset, value);
                            // }
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode[`${dataType}_ADD`]);
                        }
                    }
                    else {
                        let isUnsigned = node.isUnsignedOperator();
                        let left = node.binaryLeft();
                        let right = node.binaryRight();
                        let isFloat = left.resolvedType.isFloat() || right.resolvedType.isFloat();
                        let isDouble = left.resolvedType.isDouble() || right.resolvedType.isDouble();
                        let dataTypeLeft = typeToDataType(left.resolvedType, this.bitness);
                        let dataTypeRight = typeToDataType(right.resolvedType, this.bitness);
                        //FIXME: This should handle in checker
                        // if (left.resolvedType.symbol && right.kind != NodeKind.NAME) {
                        //     if (left.resolvedType.symbol.name == "float64") {
                        //         right.kind = NodeKind.FLOAT64;
                        //     }
                        //     else if (left.resolvedType.symbol.name == "int64") {
                        //         right.kind = NodeKind.INT64;
                        //     }
                        // }
                        if (node.kind == node_6.NodeKind.ADD) {
                            this.emitNode(array, byteOffset, left);
                            if (left.resolvedType.pointerTo == null) {
                                this.emitNode(array, byteOffset, right);
                            }
                            else {
                                assert(right.resolvedType.isInteger() || right.resolvedType.isLong() ||
                                    right.resolvedType.isFloat() || right.resolvedType.isDouble());
                                let size = left.resolvedType.pointerTo.allocationSizeOf(this.context);
                                if (size == 2) {
                                    if (right.kind == node_6.NodeKind.INT32) {
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                        let _value = right.intValue << 1;
                                        log(array, byteOffset, _value, "i32 literal");
                                        array.writeLEB128(_value);
                                    }
                                    else {
                                        this.emitNode(array, byteOffset, right);
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                        log(array, byteOffset, 1, "i32 literal");
                                        array.writeLEB128(1);
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_SHL);
                                    }
                                }
                                else if (size == 4) {
                                    if (right.kind == node_6.NodeKind.INT32) {
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                        let _value = right.intValue << 2;
                                        log(array, byteOffset, _value, "i32 literal");
                                        array.writeLEB128(_value);
                                    }
                                    else if (right.kind == node_6.NodeKind.FLOAT32) {
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST);
                                        log(array, byteOffset, right.floatValue, "f32 literal");
                                        array.writeFloat(right.floatValue);
                                    }
                                    else {
                                        this.emitNode(array, byteOffset, right);
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
                                        log(array, byteOffset, 2, "i32 literal");
                                        array.writeLEB128(2);
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_SHL);
                                    }
                                }
                                else if (size == 8) {
                                    if (right.kind == node_6.NodeKind.INT64) {
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST);
                                        log(array, byteOffset, right.longValue, "i64 literal");
                                        array.writeLEB128(right.longValue);
                                    }
                                    else if (right.kind == node_6.NodeKind.FLOAT64) {
                                        appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST);
                                        log(array, byteOffset, right.doubleValue, "f64 literal");
                                        array.writeDouble(right.doubleValue);
                                    }
                                }
                                else {
                                    this.emitNode(array, byteOffset, right);
                                }
                            }
                            appendOpcode(array, byteOffset, opcode_1.WasmOpcode[`${dataTypeLeft}_ADD`]);
                        }
                        else if (node.kind == node_6.NodeKind.BITWISE_AND) {
                            this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_AND`]);
                        }
                        else if (node.kind == node_6.NodeKind.BITWISE_OR) {
                            this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_OR`]);
                        }
                        else if (node.kind == node_6.NodeKind.BITWISE_XOR) {
                            this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_XOR`]);
                        }
                        else if (node.kind == node_6.NodeKind.EQUAL) {
                            this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_EQ`]);
                        }
                        else if (node.kind == node_6.NodeKind.MULTIPLY) {
                            this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_MUL`]);
                        }
                        else if (node.kind == node_6.NodeKind.NOT_EQUAL) {
                            this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_NE`]);
                        }
                        else if (node.kind == node_6.NodeKind.SHIFT_LEFT) {
                            this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_SHL`]);
                        }
                        else if (node.kind == node_6.NodeKind.SUBTRACT) {
                            this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_SUB`]);
                        }
                        else if (node.kind == node_6.NodeKind.DIVIDE) {
                            let opcode = (isFloat || isDouble) ?
                                opcode_1.WasmOpcode[`${dataTypeLeft}_DIV`] :
                                (isUnsigned ? opcode_1.WasmOpcode[`${dataTypeLeft}_DIV_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_DIV_S`]);
                            this.emitBinaryExpression(array, byteOffset, node, opcode);
                        }
                        else if (node.kind == node_6.NodeKind.GREATER_THAN) {
                            let opcode = (isFloat || isDouble) ?
                                opcode_1.WasmOpcode[`${dataTypeLeft}_GT`] :
                                (isUnsigned ? opcode_1.WasmOpcode[`${dataTypeLeft}_GT_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_GT_S`]);
                            this.emitBinaryExpression(array, byteOffset, node, opcode);
                        }
                        else if (node.kind == node_6.NodeKind.GREATER_THAN_EQUAL) {
                            let opcode = (isFloat || isDouble) ?
                                opcode_1.WasmOpcode[`${dataTypeLeft}_GE`] :
                                (isUnsigned ? opcode_1.WasmOpcode[`${dataTypeLeft}_GE_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_GE_S`]);
                            this.emitBinaryExpression(array, byteOffset, node, opcode);
                        }
                        else if (node.kind == node_6.NodeKind.LESS_THAN) {
                            let opcode = (isFloat || isDouble) ?
                                opcode_1.WasmOpcode[`${dataTypeLeft}_LT`] :
                                (isUnsigned ? opcode_1.WasmOpcode[`${dataTypeLeft}_LT_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_LT_S`]);
                            this.emitBinaryExpression(array, byteOffset, node, opcode);
                        }
                        else if (node.kind == node_6.NodeKind.LESS_THAN_EQUAL) {
                            let opcode = (isFloat || isDouble) ?
                                opcode_1.WasmOpcode[`${dataTypeLeft}_LE`] :
                                (isUnsigned ? opcode_1.WasmOpcode[`${dataTypeLeft}_LE_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_LE_S`]);
                            this.emitBinaryExpression(array, byteOffset, node, opcode);
                        }
                        else if (node.kind == node_6.NodeKind.REMAINDER) {
                            this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                                opcode_1.WasmOpcode[`${dataTypeLeft}_REM_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_REM_S`]);
                        }
                        else if (node.kind == node_6.NodeKind.SHIFT_RIGHT) {
                            this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                                opcode_1.WasmOpcode[`${dataTypeLeft}_SHR_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_SHR_S`]);
                        }
                        else {
                            assert(false);
                        }
                    }
                    return 1;
                }
                getWasmFunctionCallIndex(symbol) {
                    return symbol.node.isExternalImport() ? symbol.offset : this.importCount + symbol.offset;
                }
                getWasmType(type) {
                    let context = this.context;
                    if (type == context.booleanType || type.isClass() || type.isInteger() || (this.bitness == Bitness.x32 && type.isReference())) {
                        return WasmType.I32;
                    }
                    else if (type.isLong() || (this.bitness == Bitness.x64 && type.isReference())) {
                        return WasmType.I64;
                    }
                    else if (type.isDouble()) {
                        return WasmType.F64;
                    }
                    else if (type.isFloat()) {
                        return WasmType.F32;
                    }
                    if (type == context.voidType) {
                        return WasmType.VOID;
                    }
                    assert(false);
                    return WasmType.VOID;
                }
            };
            WasmSharedOffset = class WasmSharedOffset {
                constructor() {
                    this.nextLocalOffset = 0;
                    this.localCount = 0;
                }
            };
        }
    };
});
System.register("library/library", ["compiler"], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    var compiler_2, Library;
    return {
        setters: [
            function (compiler_2_1) {
                compiler_2 = compiler_2_1;
            }
        ],
        execute: function () {
            Library = class Library {
                static get(target) {
                    let lib;
                    switch (target) {
                        /*case CompileTarget.WEBASSEMBLY:
                            lib = stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/types.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/foreign.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/malloc.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/math.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/array.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/wasm/typedarray/float64array.tbs") + "\n";
                            return lib;*/
                        case compiler_2.CompileTarget.TURBO_JAVASCRIPT:
                            lib = stdlib.IO_readTextFile(TURBO_PATH + "/src/library/turbo/types.tbs") + "\n";
                            return lib;
                        case compiler_2.CompileTarget.WEBASSEMBLY:
                            lib = stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/types.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/foreign.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/math.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/malloc.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/array.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/typedarray/float64array.tbs") + "\n";
                            return lib;
                        case compiler_2.CompileTarget.ASMJS:
                            lib = stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/types.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/foreign.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/math.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/malloc.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/array.tbs") + "\n";
                            lib += stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/typedarray/float64array.tbs") + "\n";
                            return lib;
                    }
                }
                static getRuntime(target) {
                    switch (target) {
                        case compiler_2.CompileTarget.TURBO_JAVASCRIPT:
                            return stdlib.IO_readTextFile(TURBO_PATH + "/src/library/turbo/runtime.js") + "\n";
                        case compiler_2.CompileTarget.ASMJS:
                            return stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/runtime.js") + "\n";
                        default:
                            return "";
                    }
                }
                static getWrapper(target) {
                    switch (target) {
                        case compiler_2.CompileTarget.TURBO_JAVASCRIPT:
                            return stdlib.IO_readTextFile(TURBO_PATH + "/src/library/turbo/wrapper.js") + "\n";
                        case compiler_2.CompileTarget.ASMJS:
                            return stdlib.IO_readTextFile(TURBO_PATH + "/src/library/asmjs/wrapper.js") + "\n";
                        default:
                            return "";
                    }
                }
            };
            exports_15("Library", Library);
        }
    };
});
System.register("asmjs", ["bytearray", "stringbuilder", "node", "parser", "js", "symbol", "imports"], function (exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    function asmAreSignaturesEqual(a, b) {
        assert(a.returnType != null);
        assert(b.returnType != null);
        assert(a.returnType.next == null);
        assert(b.returnType.next == null);
        let x = a.argumentTypes;
        let y = b.argumentTypes;
        while (x != null && y != null) {
            if (x.id != y.id) {
                return false;
            }
            x = x.next;
            y = y.next;
        }
        if (x != null || y != null) {
            return false;
        }
        if (a.returnType.id != b.returnType.id) {
            return false;
        }
        return true;
    }
    function asmAssignLocalVariableOffsets(fn, node, shared) {
        if (node.kind == node_7.NodeKind.VARIABLE) {
            assert(node.symbol.kind == symbol_7.SymbolKind.VARIABLE_LOCAL);
            node.symbol.offset = shared.nextLocalOffset;
            shared.nextLocalOffset = shared.nextLocalOffset + 1;
            shared.localCount = shared.localCount + 1;
            let local = new AsmLocal();
            local.symbol = node.symbol;
            if (fn.firstLocal == null)
                fn.firstLocal = local;
            else
                fn.lastLocal.next = local;
            fn.lastLocal = local;
        }
        let child = node.firstChild;
        while (child != null) {
            asmAssignLocalVariableOffsets(fn, child, shared);
            child = child.nextSibling;
        }
    }
    function getIdentifier(node, forceCastToType = null, outerBracket = false) {
        let resolvedType = node.resolvedType.pointerTo ? node.resolvedType.pointerTo : node.resolvedType;
        let identifier_1 = "";
        let identifier_2 = "";
        let int = false;
        let float = false;
        let double = false;
        let _isBinary = node_7.isBinary(node.kind);
        if (forceCastToType) {
            return asmTypeToIdentifier(forceCastToType);
        }
        else if (resolvedType.isDouble()) {
            identifier_1 = outerBracket ? "(+" : "+(";
            identifier_2 = ")";
            double = true;
        }
        else if (resolvedType.isFloat()) {
            identifier_1 = "fround(";
            identifier_2 = ")";
            float = true;
        }
        else {
            identifier_1 = _isBinary ? "((" : "(";
            identifier_2 = _isBinary ? ")|0)" : ")|0";
            int = true;
        }
        return {
            left: identifier_1,
            right: identifier_2,
            int: int,
            float: float,
            double: double
        };
    }
    function asmTypeToIdentifier(type, outerBracket = false) {
        let identifier_1 = "";
        let identifier_2 = "";
        let int = false;
        let float = false;
        let double = false;
        if (type == AsmType.FLOAT) {
            identifier_1 = "fround(";
            identifier_2 = ")";
            float = true;
        }
        else if (type == AsmType.DOUBLE) {
            identifier_1 = outerBracket ? "(+" : "+(";
            identifier_2 = ")";
            double = true;
        }
        else if (type == AsmType.INT) {
            identifier_1 = "(";
            identifier_2 = outerBracket ? "|0)" : ")|0";
            int = true;
        }
        else {
            identifier_1 = "(";
            identifier_2 = outerBracket ? "|0)" : ")|0";
            int = true;
        }
        return {
            left: identifier_1,
            right: identifier_2,
            int: int,
            float: float,
            double: double
        };
    }
    function computeClassId(name) {
        let n = name.length;
        for (let i = 0; i < name.length; i++) {
            let c = name.charAt(i);
            let v = 0;
            if (c >= 'A' && c <= 'Z')
                v = c.charCodeAt(0) - 'A'.charCodeAt(0);
            else if (c >= 'a' && c <= 'z')
                v = c.charCodeAt(0) - 'a'.charCodeAt(0) + 26;
            else if (c >= '0' && c <= '9')
                v = c.charCodeAt(0) - '0'.charCodeAt(0) + 52;
            else if (c == '_')
                v = 62;
            else if (c == '>')
                v = 63;
            else
                throw "Bad character in class name: " + c;
            n = (((n & 0x1FFFFFF) << 3) | (n >>> 25)) ^ v;
        }
        return n;
    }
    function getTypedArrayElementSize(name) {
        switch (name) {
            case "Uint8ClampedArray":
            case "Uint8Array":
            case "Int8Array":
                return 1;
            case "Uint16Array":
            case "Int16Array":
                return 2;
            case "Uint32Array":
            case "Int32Array":
            case "Float32Array":
                return 4;
            case "Float64Array":
                return 8;
            default:
                throw "unknown typed array";
        }
    }
    function getMemoryType(name) {
        if (name == "int32") {
            return "32";
        }
        else if (name == "int16") {
            return "16";
        }
        else if (name == "int8") {
            return "8";
        }
        else if (name == "uint32") {
            return "U32";
        }
        else if (name == "uint16") {
            return "U16";
        }
        else if (name == "uint8") {
            return "U8";
        }
        else if (name == "float32") {
            return "F32";
        }
        else if (name == "float64") {
            return "F64";
        }
        //Pointer object
        return "32";
    }
    function symbolToValueType(symbol) {
        let type = symbol.resolvedType;
        if (type.isFloat()) {
            return AsmType.FLOAT;
        }
        else if (type.isDouble()) {
            return AsmType.DOUBLE;
        }
        else if (type.isInteger() || type.isLong() || type.pointerTo) {
            return AsmType.INT;
        }
        else {
            return AsmType.INT;
        }
    }
    function typeToAsmType(type) {
        if (type.isFloat()) {
            return AsmType.FLOAT;
        }
        else if (type.isDouble()) {
            return AsmType.DOUBLE;
        }
        else if (type.isInteger() || type.pointerTo) {
            return AsmType.INT;
        }
        else if (type.isLong() || type.pointerTo) {
            return AsmType.INT;
        }
    }
    function asmWrapType(id) {
        assert(id == AsmType.VOID || id == AsmType.INT || id == AsmType.FLOAT || id == AsmType.DOUBLE);
        let type = new AsmWrappedType();
        type.id = id;
        return type;
    }
    function reset() {
        importMap = new Map();
        classMap = new Map();
        functionMap = new Map();
        jsFunctionMap = new Map();
        signatureMap = new Map();
        virtualMap = new Map();
        currentClass = "";
        namespace = "";
        exportTable = [];
    }
    function asmJsEmit(compiler) {
        reset();
        let code = stringbuilder_8.StringBuilder_new();
        let module = new AsmJsModule();
        module.context = compiler.context;
        module.memoryInitializer = new bytearray_2.ByteArray();
        module.code = code;
        module.prepareToEmit(compiler.global);
        code.append("function TurboModule(stdlib, foreign, buffer) {\n");
        code.emitIndent(1);
        code.append('"use asm";\n');
        code.append('//##################################\n');
        code.append('//#            RUNTIME             #\n');
        code.append('//##################################\n');
        code.append(compiler.runtimeSource);
        code.append('\n');
        code.append('//##################################\n');
        code.append('//#            IMPORTS             #\n');
        code.append('//##################################\n');
        module.emitImports();
        code.append('\n');
        code.append('//##################################\n');
        code.append('//#       MEMORY INITIALIZER       #\n');
        code.append('//##################################\n');
        module.emitDataSegments();
        code.append('\n');
        code.append('//##################################\n');
        code.append('//#             CODE               #\n');
        code.append('//##################################\n');
        module.emitStatements(compiler.global.firstChild);
        module.emitVirtuals();
        // if (module.foundMultiply) {
        //     code.append("\n");
        //     code.append("let __imul = Math.imul || function(a, b) {\n");
        //     code.append("return (a * (b >>> 16) << 16) + a * (b & 65535) | 0;\n");
        //     code.append("};\n");
        // }
        code.append("return {\n");
        exportTable.forEach((name, index) => {
            code.append(`   ${name}:${name}${index < exportTable.length - 1 ? "," : ""}\n`);
        });
        code.append("}\n");
        code.indent -= 1;
        code.clearIndent(1);
        code.append("}\n");
        code.append(compiler.wrapperSource);
        compiler.outputJS = code.finish();
    }
    exports_16("asmJsEmit", asmJsEmit);
    var bytearray_2, stringbuilder_8, node_7, parser_5, js_2, symbol_7, imports_2, ASM_MEMORY_INITIALIZER_BASE, optimization, importMap, classMap, functionMap, jsFunctionMap, signatureMap, virtualMap, currentClass, namespace, exportTable, AsmType, AsmWrappedType, AsmSignature, AsmGlobal, AsmLocal, AsmSharedOffset, AsmFunction, AsmImport, AsmJsModule;
    return {
        setters: [
            function (bytearray_2_1) {
                bytearray_2 = bytearray_2_1;
            },
            function (stringbuilder_8_1) {
                stringbuilder_8 = stringbuilder_8_1;
            },
            function (node_7_1) {
                node_7 = node_7_1;
            },
            function (parser_5_1) {
                parser_5 = parser_5_1;
            },
            function (js_2_1) {
                js_2 = js_2_1;
            },
            function (symbol_7_1) {
                symbol_7 = symbol_7_1;
            },
            function (imports_2_1) {
                imports_2 = imports_2_1;
            }
        ],
        execute: function () {
            ASM_MEMORY_INITIALIZER_BASE = 8; // Leave space for "null"
            optimization = 0;
            importMap = new Map();
            classMap = new Map();
            functionMap = new Map();
            jsFunctionMap = new Map();
            signatureMap = new Map();
            virtualMap = new Map();
            namespace = "";
            exportTable = [];
            (function (AsmType) {
                AsmType[AsmType["VOID"] = 0] = "VOID";
                AsmType[AsmType["DOUBLE"] = 1] = "DOUBLE";
                AsmType[AsmType["SIGNED"] = 2] = "SIGNED";
                AsmType[AsmType["UNSIGNED"] = 3] = "UNSIGNED";
                AsmType[AsmType["INT"] = 4] = "INT";
                AsmType[AsmType["FIXNUM"] = 5] = "FIXNUM";
                AsmType[AsmType["INTISH"] = 6] = "INTISH";
                AsmType[AsmType["DOUBLE_Q"] = 7] = "DOUBLE_Q";
                AsmType[AsmType["FLOAT"] = 8] = "FLOAT";
                AsmType[AsmType["FLOATISH"] = 9] = "FLOATISH";
                AsmType[AsmType["EXTERN"] = 10] = "EXTERN";
            })(AsmType || (AsmType = {}));
            AsmWrappedType = class AsmWrappedType {
            };
            AsmSignature = class AsmSignature {
            };
            AsmGlobal = class AsmGlobal {
            };
            AsmLocal = class AsmLocal {
            };
            AsmSharedOffset = class AsmSharedOffset {
                constructor() {
                    this.nextLocalOffset = 0;
                    this.localCount = 0;
                }
            };
            AsmFunction = class AsmFunction {
                constructor() {
                    this.localCount = 0;
                }
            };
            AsmImport = class AsmImport {
            };
            AsmJsModule = class AsmJsModule {
                constructor() {
                    this.importCount = 0;
                    this.globalCount = 0;
                    this.functionCount = 0;
                    this.signatureCount = 0;
                    this.currentHeapPointer = -1;
                    this.originalHeapPointer = -1;
                    this.mallocFunctionIndex = -1;
                    this.freeFunctionIndex = -1;
                    this.startFunctionIndex = -1;
                }
                growMemoryInitializer() {
                    let array = this.memoryInitializer;
                    let current = array.length;
                    let length = this.context.nextGlobalVariableOffset;
                    while (current < length) {
                        array.append(0);
                        current = current + 1;
                    }
                }
                emitNewlineBefore(node) {
                    if (this.previousNode != null && (!node_7.isCompactNodeKind(this.previousNode.kind) || !node_7.isCompactNodeKind(node.kind))) {
                        this.code.append("\n");
                    }
                    this.previousNode = null;
                }
                emitNewlineAfter(node) {
                    this.previousNode = node;
                }
                // emitGlobalDeclarations(): void {
                //
                //     if (!this.firstGlobal) {
                //         return;
                //     }
                //
                //     let global = this.firstGlobal;
                //     while (global) {
                //         let dataType: AsmType = typeToAsmType(global.symbol.resolvedType);
                //         let value = global.symbol.node.variableValue();
                //         global = global.next;
                //     }
                // }
                emitImports() {
                    if (!this.firstImport) {
                        return;
                    }
                    let _import = this.firstImport;
                    while (_import) {
                        let importName = _import.module + "_" + _import.name;
                        this.code.append(`var ${importName} = ${_import.module == "foreign" ? "" : "stdlib."}${_import.module}.${_import.name};\n`);
                        _import = _import.next;
                    }
                }
                emitStatements(node) {
                    while (node != null) {
                        this.emitStatement(node);
                        node = node.nextSibling;
                    }
                }
                emitBlock(node, needBraces) {
                    this.previousNode = null;
                    if (needBraces) {
                        this.code.append("{\n", 1);
                    }
                    this.emitStatements(node.firstChild);
                    if (needBraces) {
                        this.code.clearIndent(1);
                        this.code.append("}");
                        this.code.indent -= 1;
                    }
                    this.previousNode = null;
                }
                emitUnary(node, parentPrecedence, operator, forceCast = false, forceCastToType = null) {
                    let isPostfix = node_7.isUnaryPostfix(node.kind);
                    let shouldCastToInt = !node.resolvedType.isFloat() && node.kind == node_7.NodeKind.NEGATIVE && !js_2.jsKindCastsOperandsToInt(node.parent.kind);
                    let isUnsigned = node.isUnsignedOperator();
                    let operatorPrecedence = shouldCastToInt ? isUnsigned ? parser_5.Precedence.SHIFT : parser_5.Precedence.BITWISE_OR : isPostfix ? parser_5.Precedence.UNARY_POSTFIX : parser_5.Precedence.UNARY_PREFIX;
                    let identifier = getIdentifier(node, forceCastToType);
                    if (parentPrecedence > operatorPrecedence) {
                        this.code.append("(");
                    }
                    if (forceCast) {
                        this.code.append(identifier.left);
                    }
                    if (!isPostfix) {
                        this.code.append(operator);
                    }
                    this.emitExpression(node.unaryValue(), operatorPrecedence, forceCast, forceCastToType);
                    if (isPostfix) {
                        this.code.append(operator);
                    }
                    if (forceCast) {
                        this.code.append(identifier.right);
                    }
                    if (parentPrecedence > operatorPrecedence) {
                        this.code.append(")");
                    }
                }
                emitBinary(node, parentPrecedence, operator, operatorPrecedence, forceCast = false, forceCastToType = null) {
                    let leftNode = node.binaryLeft();
                    let rightNode = node.binaryRight();
                    let isRightAssociative = node.kind == node_7.NodeKind.ASSIGN;
                    //TODO: Avoid casting when the parent operator already does a cast
                    let childForceCastType = null;
                    let forceCastLeft = false;
                    let forceCastRight = false;
                    let casted = false;
                    if (leftNode.resolvedType != rightNode.resolvedType && (leftNode.resolvedType.isDouble() || rightNode.resolvedType.isDouble())) {
                        childForceCastType = AsmType.DOUBLE;
                        if (!leftNode.resolvedType.isDouble()) {
                            forceCastLeft = true;
                        }
                        if (!rightNode.resolvedType.isDouble()) {
                            forceCastRight = true;
                        }
                    }
                    let identifier = getIdentifier(node, forceCastToType);
                    let idLeft = getIdentifier(leftNode, childForceCastType);
                    let idRight = getIdentifier(rightNode, childForceCastType);
                    if (parentPrecedence > operatorPrecedence) {
                        this.code.append("(");
                    }
                    if (!isRightAssociative && forceCast) {
                        casted = true;
                        this.code.append(identifier.left);
                    }
                    if (node_7.isBinary(leftNode.kind) || forceCastLeft) {
                        casted = true;
                        this.code.append(idLeft.left);
                    }
                    //emit left
                    this.emitExpression(leftNode, isRightAssociative ? (operatorPrecedence + 1) : operatorPrecedence, forceCast && !isRightAssociative, forceCastToType);
                    if (node_7.isBinary(leftNode.kind) || forceCastLeft) {
                        this.code.append(idLeft.right);
                    }
                    this.code.append(operator);
                    if (isRightAssociative && forceCast) {
                        this.code.append(identifier.left);
                    }
                    if (node_7.isBinary(rightNode.kind) || forceCastRight) {
                        this.code.append(idRight.left);
                    }
                    //emit right
                    this.emitExpression(rightNode, isRightAssociative ? operatorPrecedence : (operatorPrecedence + 1), forceCast, forceCastToType);
                    if (node_7.isBinary(rightNode.kind) || forceCastRight) {
                        this.code.append(idRight.right);
                    }
                    if (forceCast) {
                        this.code.append(identifier.right);
                    }
                    if (parentPrecedence > operatorPrecedence) {
                        this.code.append(")");
                    }
                }
                emitCommaSeparatedExpressions(start, stop, needComma = false, firstArgument = null) {
                    while (start != stop) {
                        if (needComma) {
                            this.code.append(" , ");
                            needComma = false;
                        }
                        let forceCastType = null;
                        if (firstArgument) {
                            if (firstArgument.symbol.resolvedType.isDouble()) {
                                forceCastType = AsmType.DOUBLE;
                            }
                        }
                        this.emitExpression(start, parser_5.Precedence.LOWEST, true, forceCastType);
                        start = start.nextSibling;
                        if (firstArgument) {
                            firstArgument = firstArgument.nextSibling;
                        }
                        if (start != stop) {
                            this.code.append(", ");
                        }
                    }
                }
                emitExpression(node, parentPrecedence, forceCast = false, forceCastToType = null) {
                    if (node.kind == node_7.NodeKind.NAME) {
                        let symbol = node.symbol;
                        if (symbol.kind == symbol_7.SymbolKind.FUNCTION_GLOBAL && symbol.node.isDeclare()) {
                            this.code.append("stdlib.");
                        }
                        if (symbol.kind == symbol_7.SymbolKind.VARIABLE_GLOBAL) {
                            this.emitLoadFromMemory(symbol.resolvedType, null, ASM_MEMORY_INITIALIZER_BASE + symbol.offset);
                        }
                        else {
                            if (forceCast) {
                                if (forceCastToType || symbol.resolvedType.isDouble()) {
                                    this.code.append("(+");
                                    this.emitSymbolName(symbol);
                                    this.code.append(")");
                                }
                                else if (symbol.resolvedType.isFloat()) {
                                    this.code.append("fround(");
                                    this.emitSymbolName(symbol);
                                    this.code.append(")");
                                }
                                else {
                                    this.code.append("(");
                                    this.emitSymbolName(symbol);
                                    this.code.append("|0)");
                                }
                            }
                            else {
                                this.code.append(symbol.internalName == "this" ? "ptr" : symbol.internalName);
                                // this.emitSymbolName(symbol);
                            }
                        }
                    }
                    else if (node.kind == node_7.NodeKind.NULL) {
                        this.code.append("0");
                    }
                    else if (node.kind == node_7.NodeKind.UNDEFINED) {
                        this.code.append("undefined");
                    }
                    else if (node.kind == node_7.NodeKind.BOOLEAN) {
                        this.code.append(node.intValue != 0 ? "1" : "0");
                    }
                    else if (node.kind == node_7.NodeKind.INT32 || node.kind == node_7.NodeKind.INT64) {
                        // if (parentPrecedence == Precedence.MEMBER) {
                        //     this.code.append("(");
                        // }
                        if (forceCastToType) {
                            this.code.append(`(+${node.intValue})`);
                        }
                        else if (parentPrecedence != parser_5.Precedence.ASSIGN) {
                            // this.code.append(`(${node.intValue}|0)`);
                            this.code.append(`${node.intValue}`);
                        }
                        else {
                            this.code.append(`${node.intValue}`);
                        }
                        // if (parentPrecedence == Precedence.MEMBER) {
                        //     this.code.append(")");
                        // }
                    }
                    else if (node.kind == node_7.NodeKind.FLOAT32) {
                        if (parentPrecedence == parser_5.Precedence.MEMBER) {
                            this.code.append("(");
                        }
                        if (forceCastToType) {
                            if (node.floatValue - (node.floatValue | 0) == 0) {
                                this.code.append(`${node.floatValue}.0`);
                            }
                            else {
                                this.code.append(`${node.floatValue}`);
                            }
                        }
                        else {
                            this.code.append(`fround(${node.floatValue})`);
                        }
                        if (parentPrecedence == parser_5.Precedence.MEMBER) {
                            this.code.append(")");
                        }
                    }
                    else if (node.kind == node_7.NodeKind.FLOAT64) {
                        if (parentPrecedence == parser_5.Precedence.MEMBER) {
                            this.code.append("(");
                        }
                        if (node.floatValue - (node.floatValue | 0) == 0) {
                            this.code.append(`${node.floatValue}.0`);
                        }
                        else {
                            this.code.append(`${node.floatValue}`);
                        }
                        if (parentPrecedence == parser_5.Precedence.MEMBER) {
                            this.code.append(")");
                        }
                    }
                    else if (node.kind == node_7.NodeKind.STRING) {
                        this.code.append(`\`${node.stringValue}\``);
                    }
                    else if (node.kind == node_7.NodeKind.CAST) {
                        let context = this.context;
                        let value = node.castValue();
                        let from = value.resolvedType.underlyingType(context);
                        let type = node.resolvedType.underlyingType(context);
                        let fromSize = from.variableSizeOf(context);
                        let typeSize = type.variableSizeOf(context);
                        // The cast isn't needed if it's to a wider integer type
                        // if (from == type || fromSize < typeSize) {
                        //     this.emitExpression(value, parentPrecedence);
                        // }
                        //
                        // else {
                        // Sign-extend
                        if (type == context.int8Type || type == context.int16Type) {
                            if (parentPrecedence > parser_5.Precedence.SHIFT) {
                                this.code.append("(");
                            }
                            let shift = (32 - typeSize * 8).toString();
                            this.emitExpression(value, parser_5.Precedence.SHIFT, forceCast);
                            this.code.append(" << ");
                            this.code.append(shift);
                            this.code.append(" >> ");
                            this.code.append(shift);
                            if (parentPrecedence > parser_5.Precedence.SHIFT) {
                                this.code.append(")");
                            }
                        }
                        else if (type == context.uint8Type || type == context.uint16Type) {
                            if (parentPrecedence > parser_5.Precedence.BITWISE_AND) {
                                this.code.append("(");
                            }
                            this.emitExpression(value, parser_5.Precedence.BITWISE_AND, forceCast);
                            this.code.append(" & ");
                            this.code.append(type.integerBitMask(context).toString());
                            if (parentPrecedence > parser_5.Precedence.BITWISE_AND) {
                                this.code.append(")");
                            }
                        }
                        else if (type == context.int32Type) {
                            if (parentPrecedence > parser_5.Precedence.BITWISE_OR) {
                                this.code.append("(");
                            }
                            this.emitExpression(value, parser_5.Precedence.BITWISE_OR, forceCast);
                            this.code.append(" | 0");
                            if (parentPrecedence > parser_5.Precedence.BITWISE_OR) {
                                this.code.append(")");
                            }
                        }
                        else if (type == context.uint32Type) {
                            // if (parentPrecedence > Precedence.SHIFT) {
                            //     this.code.append("(");
                            // }
                            this.emitExpression(value, parser_5.Precedence.SHIFT, forceCast);
                            // this.code.append(" >>> 0");
                            // if (parentPrecedence > Precedence.SHIFT) {
                            //     this.code.append(")");
                            // }
                        }
                        else if (type == context.float32Type) {
                            this.code.append("fround(");
                            this.emitExpression(value, parser_5.Precedence.SHIFT, forceCast);
                            this.code.append(")");
                        }
                        else if (type == context.float64Type) {
                            this.code.append("(+");
                            this.emitExpression(value, parser_5.Precedence.SHIFT, forceCast);
                            this.code.append(")");
                        }
                        else {
                            this.emitExpression(value, parentPrecedence, forceCast);
                        }
                        // }
                    }
                    else if (node.kind == node_7.NodeKind.DOT) {
                        let dotTarget = node.dotTarget();
                        let resolvedTargetNode = dotTarget.resolvedType.symbol.node;
                        if (node.symbol.kind == symbol_7.SymbolKind.VARIABLE_INSTANCE) {
                            this.emitLoadFromMemory(node.symbol.resolvedType, node.dotTarget(), node.symbol.offset);
                        }
                        else if (node.symbol.kind == symbol_7.SymbolKind.FUNCTION_INSTANCE) {
                            this.code.append(resolvedTargetNode.symbol.internalName);
                            this.code.append("_");
                            this.emitSymbolName(node.symbol);
                        }
                        else {
                            this.emitExpression(dotTarget, parser_5.Precedence.MEMBER);
                            this.code.append(".");
                            this.emitSymbolName(node.symbol);
                        }
                    }
                    else if (node.kind == node_7.NodeKind.HOOK) {
                        if (parentPrecedence > parser_5.Precedence.ASSIGN) {
                            this.code.append("(");
                        }
                        this.emitExpression(node.hookValue(), parser_5.Precedence.LOGICAL_OR);
                        this.code.append(" ? ");
                        this.emitExpression(node.hookTrue(), parser_5.Precedence.ASSIGN);
                        this.code.append(" : ");
                        this.emitExpression(node.hookFalse(), parser_5.Precedence.ASSIGN);
                        if (parentPrecedence > parser_5.Precedence.ASSIGN) {
                            this.code.append(")");
                        }
                    }
                    else if (node.kind == node_7.NodeKind.INDEX) {
                        let value = node.indexTarget();
                        this.emitExpression(value, parser_5.Precedence.UNARY_POSTFIX);
                        this.code.append("[");
                        this.emitCommaSeparatedExpressions(value.nextSibling, null);
                        this.code.append("]");
                    }
                    else if (node.kind == node_7.NodeKind.CALL) {
                        if (node.expandCallIntoOperatorTree()) {
                            this.emitExpression(node, parentPrecedence);
                        }
                        else {
                            let value = node.callValue();
                            let namespace = value.symbol.node.parent.symbol ? value.symbol.node.parent.symbol.internalName + "_" : "";
                            let fnName = namespace + value.symbol.internalName;
                            let fn = functionMap.get(fnName);
                            let signature;
                            let isImported = false;
                            let isMath = false;
                            let importedFnName = "";
                            if (value.symbol.node.isDeclare()) {
                                let moduleName = value.symbol.node.parent.symbol.internalName;
                                if (value.symbol.node.parent.isExternalImport() || moduleName == "foreign") {
                                    let fnName = value.symbol.internalName;
                                    isMath = moduleName == "Math";
                                    importedFnName = moduleName + "_" + fnName;
                                    let asmImport = importMap.get(moduleName + "." + fnName);
                                    signature = signatureMap.get(asmImport.signatureIndex);
                                    isImported = true;
                                }
                            }
                            else {
                                signature = signatureMap.get(fn.signatureIndex);
                            }
                            let returnType = signature.returnType;
                            let identifier = null;
                            if (returnType.id != AsmType.VOID) {
                                identifier = asmTypeToIdentifier(returnType.id, true);
                                this.code.append(identifier.left);
                            }
                            if (isImported) {
                                this.code.append(importedFnName);
                            }
                            else {
                                this.emitExpression(value, parser_5.Precedence.UNARY_POSTFIX);
                            }
                            if (value.symbol != null || !value.symbol.isGetter()) {
                                this.code.append("(");
                                let needComma = false;
                                if (node.firstChild) {
                                    let firstNode = node.firstChild.resolvedType.symbol.node;
                                    if (value.kind == node_7.NodeKind.DOT && !value.resolvedType.symbol.node.isDeclare()) {
                                        let dotTarget = value.dotTarget();
                                        if (dotTarget.symbol.kind == symbol_7.SymbolKind.VARIABLE_GLOBAL) {
                                            this.emitExpression(dotTarget, parser_5.Precedence.ASSIGN, true);
                                        }
                                        else {
                                            let ref = dotTarget.symbol.internalName == "this" ? "ptr" : dotTarget.symbol.internalName;
                                            this.code.append(`${ref}`);
                                        }
                                        needComma = true;
                                    }
                                    else if (!firstNode.isDeclare() && node.parent.firstChild.firstChild && node.parent.firstChild.firstChild.kind == node_7.NodeKind.DOT) {
                                        let dotTarget = node.firstChild.firstChild;
                                        if (dotTarget.symbol) {
                                            if (dotTarget.symbol.kind == symbol_7.SymbolKind.VARIABLE_GLOBAL) {
                                                this.emitExpression(dotTarget, parser_5.Precedence.ASSIGN, true);
                                            }
                                            else {
                                                let ref = dotTarget.symbol.internalName == "this" ? "ptr" : dotTarget.symbol.internalName;
                                                this.code.append(`${ref}`);
                                            }
                                            needComma = true;
                                        }
                                    }
                                }
                                this.emitCommaSeparatedExpressions(value.nextSibling, null, needComma, value.symbol.node.functionFirstArgumentIgnoringThis());
                                this.code.append(")");
                                if (identifier) {
                                    this.code.append(identifier.right);
                                }
                            }
                        }
                    }
                    else if (node.kind == node_7.NodeKind.NEW) {
                        this.emitConstructor(node);
                    }
                    else if (node.kind == node_7.NodeKind.NOT) {
                        let value = node.unaryValue();
                        // Automatically invert operators for readability
                        value.expandCallIntoOperatorTree();
                        let invertedKind = node_7.invertedBinaryKind(value.kind);
                        if (invertedKind != value.kind) {
                            value.kind = invertedKind;
                            this.emitExpression(value, parentPrecedence);
                        }
                        else {
                            this.emitUnary(node, parentPrecedence, "!");
                        }
                    }
                    else if (node.kind == node_7.NodeKind.COMPLEMENT)
                        this.emitUnary(node, parentPrecedence, "~");
                    else if (node.kind == node_7.NodeKind.NEGATIVE)
                        this.emitUnary(node, parentPrecedence, "-");
                    else if (node.kind == node_7.NodeKind.POSITIVE)
                        this.emitUnary(node, parentPrecedence, "+");
                    else if (node.kind == node_7.NodeKind.PREFIX_INCREMENT)
                        this.emitUnary(node, parentPrecedence, "++");
                    else if (node.kind == node_7.NodeKind.PREFIX_DECREMENT)
                        this.emitUnary(node, parentPrecedence, "--");
                    else if (node.kind == node_7.NodeKind.POSTFIX_INCREMENT)
                        this.emitUnary(node, parentPrecedence, "++");
                    else if (node.kind == node_7.NodeKind.POSTFIX_DECREMENT)
                        this.emitUnary(node, parentPrecedence, "--");
                    else if (node.kind == node_7.NodeKind.ADD) {
                        this.emitBinary(node, parentPrecedence, " + ", parser_5.Precedence.ADD, forceCast, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.ASSIGN) {
                        let left = node.binaryLeft();
                        let right = node.binaryRight();
                        let symbol = left.symbol;
                        if (left.kind == node_7.NodeKind.DEREFERENCE) {
                            this.emitStoreToMemory(left.resolvedType.underlyingType(this.context), left.unaryValue(), 0, right);
                        }
                        else if (symbol.kind == symbol_7.SymbolKind.VARIABLE_GLOBAL) {
                            this.emitStoreToMemory(symbol.resolvedType, null, ASM_MEMORY_INITIALIZER_BASE + symbol.offset, right);
                        }
                        else if (symbol.kind == symbol_7.SymbolKind.VARIABLE_INSTANCE) {
                            this.emitStoreToMemory(symbol.resolvedType, left.dotTarget(), symbol.offset, right);
                        }
                        else {
                            this.emitBinary(node, parentPrecedence, " = ", parser_5.Precedence.ASSIGN, true, forceCastToType);
                        }
                    }
                    else if (node.kind == node_7.NodeKind.BITWISE_AND) {
                        this.emitBinary(node, parentPrecedence, " & ", parser_5.Precedence.BITWISE_AND, forceCast, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.BITWISE_OR) {
                        this.emitBinary(node, parentPrecedence, " | ", parser_5.Precedence.BITWISE_OR, forceCast, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.BITWISE_XOR) {
                        this.emitBinary(node, parentPrecedence, " ^ ", parser_5.Precedence.BITWISE_XOR, forceCast, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.DIVIDE) {
                        this.emitBinary(node, parentPrecedence, " / ", parser_5.Precedence.MULTIPLY, true, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.EQUAL) {
                        this.emitBinary(node, parentPrecedence, " == ", parser_5.Precedence.EQUAL, true, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.GREATER_THAN) {
                        this.emitBinary(node, parentPrecedence, " > ", parser_5.Precedence.COMPARE, true, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.GREATER_THAN_EQUAL) {
                        this.emitBinary(node, parentPrecedence, " >= ", parser_5.Precedence.COMPARE, true, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.LESS_THAN) {
                        this.emitBinary(node, parentPrecedence, " < ", parser_5.Precedence.COMPARE, true, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.LESS_THAN_EQUAL) {
                        this.emitBinary(node, parentPrecedence, " <= ", parser_5.Precedence.COMPARE, true, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.LOGICAL_AND) {
                        //Notice: asm.js does not support logical and
                        this.emitBinary(node, parentPrecedence, " & ", parser_5.Precedence.LOGICAL_AND, forceCast, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.LOGICAL_OR) {
                        //Notice: asm.js does not support logical or
                        this.emitBinary(node, parentPrecedence, " | ", parser_5.Precedence.LOGICAL_OR, forceCast, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.NOT_EQUAL) {
                        this.emitBinary(node, parentPrecedence, " != ", parser_5.Precedence.EQUAL, true, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.REMAINDER) {
                        this.emitBinary(node, parentPrecedence, " % ", parser_5.Precedence.MULTIPLY, true, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.SHIFT_LEFT) {
                        this.emitBinary(node, parentPrecedence, " << ", parser_5.Precedence.SHIFT);
                    }
                    else if (node.kind == node_7.NodeKind.SHIFT_RIGHT) {
                        this.emitBinary(node, parentPrecedence, node.isUnsignedOperator() ? " >>> " : " >> ", parser_5.Precedence.SHIFT);
                    }
                    else if (node.kind == node_7.NodeKind.SUBTRACT) {
                        this.emitBinary(node, parentPrecedence, " - ", parser_5.Precedence.ADD, forceCast, forceCastToType);
                    }
                    else if (node.kind == node_7.NodeKind.MULTIPLY) {
                        let left = node.binaryLeft();
                        let right = node.binaryRight();
                        let isUnsigned = node.isUnsignedOperator();
                        if (isUnsigned && parentPrecedence > parser_5.Precedence.SHIFT) {
                            this.code.append("(");
                        }
                        let leftIdentifier = { left: "", right: "" };
                        let rightIdentifier = { left: "", right: "" };
                        if (node_7.isBinary(left.kind) || (forceCastToType == AsmType.DOUBLE && left.resolvedType.isFloat())) {
                            leftIdentifier = getIdentifier(left, forceCastToType);
                        }
                        if (node_7.isBinary(right.kind) || (forceCastToType == AsmType.DOUBLE && right.resolvedType.isFloat())) {
                            rightIdentifier = getIdentifier(right, forceCastToType);
                        }
                        if (left.resolvedType.isInteger() && right.resolvedType.isInteger()) {
                            this.code.append("(Math_imul(");
                            this.code.append(leftIdentifier.left);
                            this.emitExpression(left, parser_5.Precedence.LOWEST);
                            this.code.append(leftIdentifier.right);
                            this.code.append(", ");
                            this.code.append(rightIdentifier.left);
                            this.emitExpression(right, parser_5.Precedence.LOWEST);
                            this.code.append(rightIdentifier.right);
                            this.code.append(")|0)");
                            // if (isUnsigned) {
                            //     this.code.append(" >>> 0");
                            //     if (parentPrecedence > Precedence.SHIFT) {
                            //         this.code.append(")");
                            //     }
                            // }
                        }
                        else {
                            // this.code.append(leftIdentifier.left);
                            this.emitExpression(left, parser_5.Precedence.MULTIPLY);
                            // this.code.append(leftIdentifier.right);
                            this.code.append(" * ");
                            // this.code.append(rightIdentifier.left);
                            this.emitExpression(right, parser_5.Precedence.MULTIPLY);
                            // this.code.append(rightIdentifier.right);
                        }
                        this.foundMultiply = true;
                    }
                    else if (node.kind == node_7.NodeKind.DEREFERENCE) {
                        this.emitLoadFromMemory(node.resolvedType.underlyingType(this.context), node.unaryValue(), 0);
                    }
                    else {
                        assert(false);
                    }
                }
                emitLoadFromMemory(type, relativeBase, offset) {
                    let heapType;
                    let sizeOf = type.variableSizeOf(this.context);
                    let idLeft = "";
                    let idRight = "";
                    let shift = 0;
                    if (sizeOf == 1) {
                        idRight = "|0)";
                        heapType = type.isUnsigned() ? "U8" : "8";
                        this.code.append(`(HEAP${heapType}[(`);
                        shift = 0;
                    }
                    else if (sizeOf == 2) {
                        idRight = "|0)";
                        heapType = type.isUnsigned() ? "U16" : "16";
                        this.code.append(`(HEAP${heapType}[(`);
                        shift = 1;
                    }
                    else if (sizeOf == 4 || type.isClass()) {
                        if (type.isFloat()) {
                            idLeft = "fround(";
                            idRight = ")";
                            heapType = "F32";
                        }
                        else {
                            idLeft = "(";
                            idRight = "|0)";
                            heapType = type.isUnsigned() ? "U32" : "32";
                        }
                        this.code.append(`${idLeft}HEAP${heapType}[(`);
                        shift = 2;
                    }
                    else if (sizeOf == 8) {
                        // idLeft = "(+";
                        // idRight = ")";
                        // idLeft = "+";
                        // idRight = "";
                        this.code.append(`${idLeft}HEAPF64[(`);
                        shift = 3;
                    }
                    else {
                        assert(false);
                    }
                    // Relative address
                    if (relativeBase != null) {
                        this.emitExpression(relativeBase, parser_5.Precedence.MEMBER);
                        this.code.append(` ${offset == 0 ? "" : "+ (" + offset + "|0) "}) >> ${shift}]`);
                    }
                    else {
                        this.code.append(`${offset == 0 ? "" : offset}) >> ${shift}]`);
                    }
                    this.code.append(idRight);
                }
                emitStoreToMemory(type, relativeBase, offset, value) {
                    let heapType;
                    let sizeOf = type.variableSizeOf(this.context);
                    let shift = 0;
                    if (sizeOf == 1) {
                        heapType = type.isUnsigned() ? "U8" : "8";
                        this.code.append(`HEAP${heapType}[(`);
                        shift = 0;
                    }
                    else if (sizeOf == 2) {
                        heapType = type.isUnsigned() ? "U16" : "16";
                        this.code.append(`HEAP${heapType}[(`);
                        shift = 1;
                    }
                    else if (sizeOf == 4 || type.isClass()) {
                        if (type.isFloat()) {
                            this.code.append(`HEAPF32[(`);
                        }
                        else {
                            heapType = type.isUnsigned() ? "U32" : "32";
                            this.code.append(`HEAP${heapType}[(`);
                        }
                        shift = 2;
                    }
                    else if (sizeOf == 8) {
                        this.code.append(`HEAPF64[(`);
                        shift = 3;
                    }
                    else {
                        assert(false);
                    }
                    assert(!isNaN(offset));
                    // Relative address
                    if (relativeBase != null) {
                        this.emitExpression(relativeBase, parser_5.Precedence.ASSIGN);
                        this.code.append(` ${offset == 0 ? "" : "+ (" + offset + "|0)"}) >> ${shift}] = `);
                    }
                    else {
                        this.code.append(`${offset == 0 ? "" : offset}) >> ${shift}] = `);
                    }
                    this.emitExpression(value, parser_5.Precedence.ASSIGN, true);
                }
                emitSymbolName(symbol) {
                    let name = symbol.rename != null ? symbol.rename : symbol.name;
                    this.code.append(name);
                    return name;
                }
                emitStatement(node) {
                    if (node.kind == node_7.NodeKind.EXTENDS) {
                        console.log("Extends found");
                        this.code.append(" /*extends*/ ");
                    }
                    else if (node.kind == node_7.NodeKind.MODULE) {
                    }
                    else if (node.kind == node_7.NodeKind.IMPORTS) {
                        // let child = node.firstChild;
                        // while (child) {
                        //     assert(child.kind == NodeKind.EXTERNAL_IMPORT);
                        //     child = child.nextSibling;
                        // }
                    }
                    else if (node.kind == node_7.NodeKind.CLASS) {
                        currentClass = node.symbol.internalName;
                        let classDef = this.getClassDef(node);
                        // Emit instance functions
                        let child = node.firstChild;
                        while (child != null) {
                            if (child.kind == node_7.NodeKind.FUNCTION) {
                                this.emitStatement(child);
                            }
                            child = child.nextSibling;
                        }
                        if (node.isExport()) {
                            // this.code.append(`${classDef.name} = ${classDef.name};\n`);
                            //exportTable.push(classDef.name);
                        }
                    }
                    else if (node.kind == node_7.NodeKind.FUNCTION) {
                        let body = node.functionBody();
                        if (body == null) {
                            return;
                        }
                        let symbol = node.symbol;
                        let needsSemicolon = false;
                        this.emitNewlineBefore(node);
                        let isConstructor = symbol.name == "constructor";
                        if (symbol.kind == symbol_7.SymbolKind.FUNCTION_INSTANCE) {
                            let funcName = "";
                            if (isConstructor) {
                                this.code.append("function ");
                                funcName = this.emitSymbolName(symbol.parent()) + "_new";
                                this.code.append("_new");
                                needsSemicolon = false;
                            }
                            else {
                                this.code.append("function ");
                                funcName = this.emitSymbolName(symbol.parent()) + "_";
                                this.code.append("_");
                                if (node.isVirtual()) {
                                    this.code.append(symbol.internalName + "_impl");
                                    funcName += symbol.internalName + "_impl";
                                }
                                else {
                                    funcName += this.emitSymbolName(symbol);
                                }
                                needsSemicolon = false;
                            }
                            if (node.isExport()) {
                                exportTable.push(funcName);
                            }
                        }
                        else if (node.isExport()) {
                            this.code.append("function ");
                            let name = this.emitSymbolName(symbol);
                            needsSemicolon = false;
                            exportTable.push(name);
                        }
                        else {
                            this.code.append("function ");
                            this.emitSymbolName(symbol);
                        }
                        this.code.append("(");
                        let returnType = node.functionReturnType();
                        let child = node.functionFirstArgumentIgnoringThis();
                        let needComma = false;
                        let signature = "";
                        if (symbol.kind == symbol_7.SymbolKind.FUNCTION_INSTANCE && !isConstructor && !node.isStatic()) {
                            this.code.append("ptr");
                            signature += "ptr";
                            needComma = true;
                        }
                        while (child != returnType) {
                            assert(child.kind == node_7.NodeKind.VARIABLE);
                            if (needComma) {
                                this.code.append(", ");
                                signature += ",";
                                needComma = false;
                            }
                            this.emitSymbolName(child.symbol);
                            if (child.firstChild != child.lastChild && child.lastChild.hasValue) {
                                this.code.append(` = ${child.lastChild.rawValue}`);
                            }
                            signature += child.symbol.internalName;
                            child = child.nextSibling;
                            if (child != returnType) {
                                this.code.append(", ");
                                signature += ", ";
                            }
                        }
                        this.code.append(") ");
                        let parent = symbol.parent();
                        let parentName = parent ? parent.internalName : "";
                        let classDef = classMap.get(parentName);
                        this.code.append("{\n", 1);
                        child = node.functionFirstArgumentIgnoringThis();
                        if (!isConstructor && symbol.kind == symbol_7.SymbolKind.FUNCTION_INSTANCE) {
                            this.code.append(`ptr = ptr|0;\n`);
                        }
                        while (child != returnType) {
                            assert(child.kind == node_7.NodeKind.VARIABLE);
                            if (needComma) {
                                this.code.append(", ");
                                needComma = false;
                            }
                            this.emitSymbolName(child.symbol);
                            this.code.append(` = `);
                            this.emitStatement(child);
                            this.code.append(`;\n`);
                            child = child.nextSibling;
                        }
                        if (isConstructor) {
                            let size = parent.resolvedType.allocationSizeOf(this.context).toString();
                            if (parent.resolvedType.isArray()) {
                                size = `(${size} + bytesLength)|0`;
                            }
                            else if (parent.resolvedType.isTypedArray()) {
                                size = `(${size} + elementSize << ${getTypedArrayElementSize(parent.resolvedType.symbol.internalName)})|0`;
                            }
                            this.code.append(`var ptr = 0;\n`);
                            this.code.append(`ptr = ${namespace}malloc(${size})|0;\n`);
                        }
                        if (node.isVirtual()) {
                            let chunkIndex = this.code.breakChunk();
                            this.updateVirtualTable(node, chunkIndex, classDef.base, signature);
                        }
                        //collect all variables to declare
                        let fnBody = node.functionBody();
                        let vars = this.collectLocalVariables(fnBody);
                        vars.forEach((child) => {
                            //declare vars first
                            this.code.append("var ");
                            let value = child.variableValue();
                            this.emitSymbolName(child.symbol);
                            assert(value != null);
                            if (isNaN(value.rawValue)) {
                                vars.push(child);
                                this.code.append(" = ");
                                this.emitNullInitializer(value);
                                this.code.append(";\n");
                            }
                            else {
                                this.code.append(" = ");
                                this.emitExpression(value, parser_5.Precedence.ASSIGN);
                                this.code.append(";\n");
                            }
                        });
                        this.currentReturnType = returnType;
                        this.emitBlock(fnBody, false);
                        this.currentReturnType = null;
                        this.code.indent--;
                        this.code.clearIndent(1);
                        this.code.append("}\n");
                        if (node.isVirtual()) {
                            this.code.breakChunk();
                        }
                        // if (isConstructor) {
                        //     this.code.append(`return ptr;\n`);
                        //     this.code.clearIndent(1);
                        //     this.code.append("}");
                        //     this.code.indent -= 1;
                        // }
                        this.code.append(needsSemicolon ? ";\n" : "\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_7.NodeKind.IF) {
                        this.emitNewlineBefore(node);
                        while (true) {
                            this.code.append("if (");
                            this.emitExpression(node.ifValue(), parser_5.Precedence.COMPARE, true);
                            this.code.append(") ");
                            this.emitBlock(node.ifTrue(), true);
                            let no = node.ifFalse();
                            if (no == null) {
                                this.code.append("\n");
                                break;
                            }
                            this.code.append("\n\n");
                            this.code.append("else ");
                            if (no.firstChild == null || no.firstChild != no.lastChild || no.firstChild.kind != node_7.NodeKind.IF) {
                                this.emitBlock(no, true);
                                this.code.append("\n");
                                break;
                            }
                            node = no.firstChild;
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_7.NodeKind.DELETE) {
                        let value = node.deleteValue();
                        this.code.append("free((");
                        this.emitExpression(value, parser_5.Precedence.LOWEST);
                        this.code.append(")|0);\n");
                    }
                    else if (node.kind == node_7.NodeKind.WHILE) {
                        this.emitNewlineBefore(node);
                        this.code.append("while (");
                        this.emitExpression(node.whileValue(), parser_5.Precedence.LOWEST, true);
                        this.code.append(") ");
                        this.emitBlock(node.whileBody(), true);
                        this.code.append("\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_7.NodeKind.BREAK) {
                        this.emitNewlineBefore(node);
                        this.code.append("break;\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_7.NodeKind.CONTINUE) {
                        this.emitNewlineBefore(node);
                        this.code.append("continue;\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_7.NodeKind.EXPRESSION) {
                        this.emitNewlineBefore(node);
                        this.emitExpression(node.expressionValue(), parser_5.Precedence.LOWEST);
                        this.code.append(";\n");
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_7.NodeKind.EMPTY) {
                    }
                    else if (node.kind == node_7.NodeKind.RETURN) {
                        let value = node.returnValue();
                        //this.emitNewlineBefore(node);
                        if (value != null) {
                            if (value.kind == node_7.NodeKind.NULL) {
                                this.code.append("return 0;\n");
                            }
                            else {
                                this.code.append("return ");
                                let forceCastType = null;
                                if (this.currentReturnType.resolvedType != value.resolvedType) {
                                    forceCastType = typeToAsmType(this.currentReturnType.resolvedType);
                                }
                                let identifier = getIdentifier(node.lastChild, forceCastType);
                                //Result of a call should always coerced to appropriate type
                                if (value.kind != node_7.NodeKind.NEW && value.kind != node_7.NodeKind.CALL) {
                                    this.code.append(identifier.left);
                                }
                                this.emitExpression(value, parser_5.Precedence.ASSIGN, false);
                                if (value.kind != node_7.NodeKind.NEW && value.kind != node_7.NodeKind.CALL) {
                                    this.code.append(identifier.right);
                                }
                                this.code.append(";\n");
                            }
                        }
                        else {
                            this.code.append("return;\n");
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_7.NodeKind.BLOCK) {
                        if (node.parent.kind == node_7.NodeKind.BLOCK) {
                            this.emitStatements(node.firstChild);
                        }
                        else {
                            this.emitNewlineBefore(node);
                            this.emitBlock(node, true);
                            this.code.append("\n");
                            this.emitNewlineAfter(node);
                        }
                    }
                    else if (node.kind == node_7.NodeKind.VARIABLES) {
                        this.emitNewlineBefore(node);
                        let child = node.firstChild;
                        while (child != null) {
                            if (child.symbol.kind == symbol_7.SymbolKind.VARIABLE_LOCAL) {
                                let value = child.variableValue();
                                assert(value != null);
                                if (isNaN(value.rawValue)) {
                                    this.emitSymbolName(child.symbol);
                                    this.code.append(" = ");
                                    this.emitExpression(value, parser_5.Precedence.ASSIGN, true);
                                    this.code.append(";\n");
                                }
                            }
                            child = child.nextSibling;
                        }
                        this.emitNewlineAfter(node);
                    }
                    else if (node.kind == node_7.NodeKind.VARIABLE) {
                        if (node.symbol.kind == symbol_7.SymbolKind.VARIABLE_ARGUMENT) {
                            // this.emitSymbolName(node.symbol);
                            // this.code.append(" = ");
                            if (node.symbol.resolvedType.isFloat()) {
                                this.code.append("fround(");
                                this.emitSymbolName(node.symbol);
                                this.code.append(")");
                            }
                            else if (node.symbol.resolvedType.isDouble()) {
                                this.code.append("+");
                                this.emitSymbolName(node.symbol);
                            }
                            else {
                                this.emitSymbolName(node.symbol);
                                this.code.append("|0");
                            }
                        }
                        else {
                            assert(false);
                        }
                    }
                    else if (node.kind == node_7.NodeKind.ENUM) {
                        if (node.isExport()) {
                            this.emitNewlineBefore(node);
                            exportTable.push(this.emitSymbolName(node.symbol));
                            this.code.append(" = {\n");
                            this.code.indent += 1;
                            // Emit enum values
                            let child = node.firstChild;
                            while (child != null) {
                                assert(child.kind == node_7.NodeKind.VARIABLE);
                                // this.code.emitIndent();
                                this.emitSymbolName(child.symbol);
                                this.code.append(": ");
                                this.code.append(child.symbol.offset.toString());
                                child = child.nextSibling;
                                this.code.append(child != null ? ",\n" : "\n");
                            }
                            this.code.clearIndent(1);
                            this.code.append("};\n");
                            this.emitNewlineAfter(node);
                        }
                        else if (optimization == 0) {
                            this.emitNewlineBefore(node);
                            // this.code.emitIndent();
                            this.code.append("let ");
                            this.emitSymbolName(node.symbol);
                            this.code.append(";\n");
                            // this.code.emitIndent();
                            this.code.append("(function (");
                            this.emitSymbolName(node.symbol);
                            this.code.append(") {\n");
                            this.code.indent += 1;
                            // Emit enum values
                            let child = node.firstChild;
                            while (child != null) {
                                assert(child.kind == node_7.NodeKind.VARIABLE);
                                // this.code.emitIndent();
                                this.emitSymbolName(node.symbol);
                                this.code.append("[");
                                this.emitSymbolName(node.symbol);
                                this.code.append("['");
                                this.emitSymbolName(child.symbol);
                                this.code.append("'] = ");
                                this.code.append(child.symbol.offset.toString());
                                this.code.append("] = ");
                                this.code.append("'");
                                this.emitSymbolName(child.symbol);
                                this.code.append("'");
                                child = child.nextSibling;
                                this.code.append(";\n");
                            }
                            this.code.clearIndent(1);
                            this.code.append("})(");
                            this.emitSymbolName(node.symbol);
                            this.code.append(" || (");
                            this.emitSymbolName(node.symbol);
                            this.code.append(" = {}));\n");
                            this.emitNewlineAfter(node);
                        }
                    }
                    else if (node.kind == node_7.NodeKind.CONSTANTS) {
                    }
                    else {
                        assert(false);
                    }
                }
                emitConstructor(node) {
                    let type = node.newType();
                    let size;
                    if (type.resolvedType.isArray()) {
                        let elementType = type.resolvedType;
                        //ignore 64 bit pointer
                        size = elementType.isClass() ? 4 : elementType.allocationSizeOf(this.context);
                        assert(size > 0);
                        let constructorNode = node.constructorNode();
                        let callSymbol = constructorNode.symbol;
                        let lengthNode = node.arrayLength();
                        this.code.append(`${callSymbol.parent().internalName}_new(`);
                        assert(lengthNode.resolvedType.isInteger());
                        if (lengthNode.kind == node_7.NodeKind.INT32) {
                            this.code.append(`${size * lengthNode.intValue}|0, ${size}|0`);
                        }
                        else {
                            this.code.append(`imul(${size},`);
                            this.emitExpression(lengthNode, parser_5.Precedence.LOWEST, false, null);
                            this.code.append(`)|0, ${size}|0`);
                        }
                    }
                    else {
                        size = type.resolvedType.allocationSizeOf(this.context);
                        assert(size > 0);
                        let constructorNode = node.constructorNode();
                        let args = constructorNode.functionFirstArgumentIgnoringThis();
                        let callSymbol = constructorNode.symbol;
                        let child = node.firstChild.nextSibling;
                        this.code.append(`${callSymbol.parent().internalName}_new(`);
                        while (child != null) {
                            let forceCastType = null;
                            if (args.symbol.resolvedType.isDouble()) {
                                forceCastType = AsmType.DOUBLE;
                            }
                            this.emitExpression(child, parser_5.Precedence.MEMBER, true, forceCastType);
                            child = child.nextSibling;
                            args = args.nextSibling;
                            if (child) {
                                this.code.append(", ");
                            }
                        }
                    }
                    this.code.append(")|0");
                }
                emitVirtuals() {
                    this.code.append("\n");
                    // this.code.append("//FIXME: Virtuals should emit next to base class virtual function\n");
                    virtualMap.forEach((virtual, virtualName) => {
                        this.code.append("\n");
                        this.code.append(`function ${virtual.name}(${virtual.signature}) {\n`, 1);
                        this.code.append(`switch (${namespace}HEAP32[ptr >> 2]) {\n`, 1);
                        for (let impl of virtual.functions) {
                            this.code.append(`case ${impl.parent}_CLSID:\n`, 1);
                            this.code.append(`return ${impl.parent}_${impl.name}_impl(${virtual.signature});\n`);
                            this.code.clearIndent(1);
                            this.code.indent -= 1;
                        }
                        this.code.append("default:\n", 1);
                        this.code.append(`throw ${namespace}_badType(ptr);\n`);
                        this.code.indent -= 2;
                        this.code.clearIndent(2);
                        this.code.append("}\n");
                        this.code.indent -= 1;
                        this.code.clearIndent(1);
                        this.code.append("}\n");
                        // for (let virtual of vtable) {
                        //     let signature = virtual.signature;
                        //     this.code.append(`${virtual.name} = function (ptr, ${signature}) {\n`);
                        //     this.code.append("        switch (${namespace}HEAP32[ptr >> 2]) {\n");
                        //     let kv = virtual.reverseCases.keysValues();
                        //     for (let [name,cases]=kv.next(); name; [name, cases] = kv.next()) {
                        //         for (let c of cases) {
                        //             this.code.append(`      case ${c}:`);
                        //         }
                        //         this.code.append(`      return ${name}(ptr ${signature});`);
                        //     }
                        //     this.code.append("      default:");
                        //     this.code.append("      " + (virtual.default_ ?
                        //             `return ${virtual.default_}(ptr ${signature})` :
                        //             "throw ${namespace}_badType(ptr)") + ";");
                        //     this.code.append("  }");
                        //     this.code.append("}");
                        // }
                    });
                }
                updateVirtualTable(node, chunkIndex, baseClassName, signature) {
                    let virtualName = baseClassName ? `${baseClassName}_${node.symbol.internalName}` : `${node.parent.symbol.internalName}_${node.symbol.internalName}`;
                    let virtual = virtualMap.get(virtualName);
                    if (!virtual) {
                        virtual = {
                            name: virtualName,
                            signature: signature,
                            functions: [
                                {
                                    chunkIndex: chunkIndex,
                                    parent: node.parent.symbol.internalName,
                                    name: node.symbol.internalName,
                                    base: baseClassName || null,
                                    signature: signature
                                }
                            ]
                        };
                        virtualMap.set(virtualName, virtual);
                    }
                    else {
                        virtual.functions.push({
                            chunkIndex: chunkIndex,
                            parent: node.parent.symbol.internalName,
                            name: node.symbol.internalName,
                            base: baseClassName || null,
                            signature: signature
                        });
                    }
                }
                getClassDef(node) {
                    let def = classMap.get(node.symbol.internalName);
                    if (def) {
                        return def;
                    }
                    def = {
                        name: node.symbol.internalName,
                        size: 4,
                        align: 4,
                        clsid: computeClassId(node.symbol.internalName),
                        members: {},
                        code: ""
                    };
                    if (node.firstChild && node.firstChild.kind == node_7.NodeKind.EXTENDS) {
                        def.base = node.firstChild.firstChild.stringValue;
                    }
                    let argument = node.firstChild;
                    while (argument != null) {
                        if (argument.kind == node_7.NodeKind.VARIABLE) {
                            let typeSize;
                            let memory;
                            let offset;
                            let shift;
                            let resolvedType = argument.symbol.resolvedType;
                            if (resolvedType.pointerTo) {
                                typeSize = 4;
                                memory = `HEAP32`;
                                offset = 4 + (argument.offset * typeSize);
                                shift = Math.log2(typeSize);
                            }
                            else if (resolvedType.symbol.kind == symbol_7.SymbolKind.TYPE_CLASS) {
                                typeSize = 4;
                                memory = `HEAP32`;
                                offset = 4 + (argument.offset * typeSize);
                                shift = Math.log2(typeSize);
                            }
                            else {
                                typeSize = resolvedType.symbol.byteSize;
                                memory = `HEAP${getMemoryType(argument.firstChild.stringValue)}`;
                                offset = 4 + (argument.offset * typeSize);
                                shift = Math.log2(typeSize);
                            }
                            def.members[argument.symbol.internalName] = {
                                memory: memory,
                                size: typeSize,
                                offset: offset,
                                shift: shift,
                                value: argument.variableValue()
                            };
                            def.size += typeSize;
                        }
                        argument = argument.nextSibling;
                    }
                    classMap.set(node.symbol.internalName, def);
                    return def;
                }
                collectLocalVariables(node, vars = []) {
                    if (node.kind == node_7.NodeKind.VARIABLE) {
                        if (node.symbol.kind == symbol_7.SymbolKind.VARIABLE_LOCAL) {
                            vars.push(node);
                        }
                    }
                    let child = node.firstChild;
                    while (child != null) {
                        this.collectLocalVariables(child, vars);
                        child = child.nextSibling;
                    }
                    return vars;
                }
                emitDataSegments() {
                    this.growMemoryInitializer();
                    let memoryInitializer = this.memoryInitializer;
                    let initializerLength = memoryInitializer.length;
                    let initialHeapPointer = imports_2.alignToNextMultipleOf(ASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);
                    // Pass the initial heap pointer to the "malloc" function
                    memoryInitializer.writeUnsignedInt(initialHeapPointer, this.originalHeapPointer);
                    memoryInitializer.writeUnsignedInt(initialHeapPointer, this.currentHeapPointer);
                    // Copy the entire memory initializer (also includes zero-initialized data for now)
                    this.code.append("function initMemory() {\n", 1);
                    let i = 0;
                    let value;
                    let col = 4;
                    while (i < initializerLength) {
                        for (let j = 0; j < col; j++) {
                            let index = (i + j);
                            if (index < initializerLength) {
                                value = memoryInitializer.get(index);
                                this.code.append(`HEAPU8[${ASM_MEMORY_INITIALIZER_BASE + index}] = ${value}; `);
                            }
                        }
                        this.code.append("\n");
                        i = i + col;
                    }
                    this.code.clearIndent(1);
                    this.code.indent -= 1;
                    this.code.append("}\n");
                    exportTable.push("initMemory");
                }
                prepareToEmit(node) {
                    if (node.kind == node_7.NodeKind.STRING) {
                        let text = node.stringValue;
                        let length = text.length;
                        let offset = this.context.allocateGlobalVariableOffset(length * 2 + 4, 4);
                        //TODO: write to initial memory
                    }
                    else if (node.kind == node_7.NodeKind.IMPORTS) {
                        // let child = node.firstChild;
                        // while (child) {
                        //     assert(child.kind == NodeKind.EXTERNAL_IMPORT);
                        //     child = child.nextSibling;
                        // }
                    }
                    else if (node.kind == node_7.NodeKind.VARIABLE) {
                        let symbol = node.symbol;
                        if (symbol.kind == symbol_7.SymbolKind.VARIABLE_GLOBAL) {
                            let sizeOf = symbol.resolvedType.variableSizeOf(this.context);
                            let value = symbol.node.variableValue();
                            let memoryInitializer = this.memoryInitializer;
                            // Copy the initial value into the memory initializer
                            this.growMemoryInitializer();
                            let offset = symbol.offset;
                            if (sizeOf == 1) {
                                if (symbol.resolvedType.isUnsigned()) {
                                    memoryInitializer.writeUnsignedByte(value.intValue, offset);
                                }
                                else {
                                    memoryInitializer.writeByte(value.intValue, offset);
                                }
                            }
                            else if (sizeOf == 2) {
                                if (symbol.resolvedType.isUnsigned()) {
                                    memoryInitializer.writeUnsignedShort(value.intValue, offset);
                                }
                                else {
                                    memoryInitializer.writeShort(value.intValue, offset);
                                }
                            }
                            else if (sizeOf == 4) {
                                if (symbol.resolvedType.isFloat()) {
                                    memoryInitializer.writeFloat(value.floatValue, offset);
                                }
                                else {
                                    if (symbol.resolvedType.isUnsigned()) {
                                        memoryInitializer.writeUnsignedInt(value.intValue, offset);
                                    }
                                    else {
                                        memoryInitializer.writeInt(value.intValue, offset);
                                    }
                                }
                            }
                            else if (sizeOf == 8) {
                                if (symbol.resolvedType.isDouble()) {
                                    memoryInitializer.writeDouble(value.rawValue, offset);
                                }
                                else {
                                    //TODO Implement Int64 write
                                    if (symbol.resolvedType.isUnsigned()) {
                                        //memoryInitializer.writeUnsignedInt64(value.rawValue, offset);
                                    }
                                    else {
                                        //memoryInitializer.writeInt64(value.rawValue, offset);
                                    }
                                }
                            }
                            else if (node.symbol.resolvedType.isClass()) {
                                //NULL pointer
                                memoryInitializer.writeInt(0, offset);
                            }
                            else {
                                assert(false);
                            }
                            // Make sure the heap offset is tracked
                            if (symbol.internalName == "currentHeapPointer") {
                                assert(this.currentHeapPointer == -1);
                                this.currentHeapPointer = symbol.offset;
                            }
                            else if (symbol.internalName == "originalHeapPointer") {
                                assert(this.originalHeapPointer == -1);
                                this.originalHeapPointer = symbol.offset;
                            }
                        }
                    }
                    else if (node.kind == node_7.NodeKind.CLASS) {
                        // if (node.isExternalImport()) {
                        //     console.log(node.symbol.internalName);
                        // }
                    }
                    else if (node.kind == node_7.NodeKind.FUNCTION) {
                        let returnType = node.functionReturnType();
                        let shared = new AsmSharedOffset();
                        let argumentTypesFirst = null;
                        let argumentTypesLast = null;
                        // Make sure to include the implicit "this" variable as a normal argument
                        let argument = node.functionFirstArgument();
                        while (argument != returnType) {
                            let type = asmWrapType(this.getAsmType(argument.variableType().resolvedType));
                            if (argumentTypesFirst == null)
                                argumentTypesFirst = type;
                            else
                                argumentTypesLast.next = type;
                            argumentTypesLast = type;
                            shared.nextLocalOffset = shared.nextLocalOffset + 1;
                            argument = argument.nextSibling;
                        }
                        let signatureIndex = this.allocateSignature(argumentTypesFirst, asmWrapType(this.getAsmType(returnType.resolvedType)));
                        let body = node.functionBody();
                        let symbol = node.symbol;
                        // console.log(symbol.internalName);
                        // Functions without bodies are imports
                        if (body == null) {
                            // if (node.parent.isExternalImport()) {
                            //     let _import = importMap.get(node.parent.symbol.internalName);
                            //     _import[node.symbol.internalName] = `${node.parent.symbol.internalName}.${node.symbol.internalName}`;
                            // }
                            if (node.isExternalImport() || node.parent.isExternalImport()) {
                                let moduleName = symbol.kind == symbol_7.SymbolKind.FUNCTION_INSTANCE ? symbol.parent().internalName : "stdlib";
                                symbol.offset = this.importCount;
                                this.allocateImport(signatureIndex, moduleName, symbol.internalName);
                            }
                            node = node.nextSibling;
                            return;
                        }
                        symbol.offset = this.functionCount;
                        let parent = symbol.parent();
                        let namespace = parent ? parent.internalName + "_" : "";
                        let fn = this.allocateFunction(symbol, namespace, signatureIndex);
                        // Make sure "malloc" is tracked
                        if (symbol.kind == symbol_7.SymbolKind.FUNCTION_GLOBAL && symbol.internalName == "malloc") {
                            assert(this.mallocFunctionIndex == -1);
                            this.mallocFunctionIndex = symbol.offset;
                        }
                        if (symbol.kind == symbol_7.SymbolKind.FUNCTION_GLOBAL && symbol.internalName == "free") {
                            assert(this.freeFunctionIndex == -1);
                            this.freeFunctionIndex = symbol.offset;
                        }
                        // Make "init_malloc" as start function
                        if (symbol.kind == symbol_7.SymbolKind.FUNCTION_GLOBAL && symbol.internalName == "init_malloc") {
                            assert(this.startFunctionIndex == -1);
                            this.startFunctionIndex = symbol.offset;
                        }
                        if (node.isExport()) {
                            fn.isExported = true;
                        }
                        // Assign local variable offsets
                        asmAssignLocalVariableOffsets(fn, body, shared);
                        fn.localCount = shared.localCount;
                    }
                    let child = node.firstChild;
                    while (child != null) {
                        this.prepareToEmit(child);
                        child = child.nextSibling;
                    }
                }
                allocateImport(signatureIndex, mod, name) {
                    let result = new AsmImport();
                    result.signatureIndex = signatureIndex;
                    result.module = mod;
                    result.name = name;
                    if (this.firstImport == null)
                        this.firstImport = result;
                    else
                        this.lastImport.next = result;
                    this.lastImport = result;
                    this.importCount = this.importCount + 1;
                    importMap.set(mod + "." + name, result);
                    return result;
                }
                allocateFunction(symbol, namespace, signatureIndex) {
                    let fn = new AsmFunction();
                    fn.symbol = symbol;
                    fn.signatureIndex = signatureIndex;
                    if (this.firstFunction == null)
                        this.firstFunction = fn;
                    else
                        this.lastFunction.next = fn;
                    this.lastFunction = fn;
                    this.functionCount = this.functionCount + 1;
                    functionMap.set(namespace + symbol.internalName, fn);
                    return fn;
                }
                allocateSignature(argumentTypes, returnType) {
                    assert(returnType != null);
                    assert(returnType.next == null);
                    let signature = new AsmSignature();
                    signature.argumentTypes = argumentTypes;
                    signature.returnType = returnType;
                    let check = this.firstSignature;
                    let i = 0;
                    while (check != null) {
                        if (asmAreSignaturesEqual(signature, check)) {
                            return i;
                        }
                        check = check.next;
                        i = i + 1;
                    }
                    if (this.firstSignature == null)
                        this.firstSignature = signature;
                    else
                        this.lastSignature.next = signature;
                    this.lastSignature = signature;
                    signatureMap.set(i, signature);
                    this.signatureCount = this.signatureCount + 1;
                    return i;
                }
                getAsmType(type) {
                    let context = this.context;
                    if (type == context.booleanType || type.isInteger() || type.isReference()) {
                        return AsmType.INT;
                    }
                    else if (type.isLong() || type.isReference()) {
                        return AsmType.INT; // We don't have native I64 and we will not emulate it.
                    }
                    else if (type.isDouble()) {
                        return AsmType.DOUBLE;
                    }
                    else if (type.isFloat()) {
                        return AsmType.FLOAT;
                    }
                    else if (type.isArray()) {
                        return AsmType.INT;
                    }
                    if (type == context.voidType) {
                        return AsmType.VOID;
                    }
                    if (type == context.anyType) {
                        return AsmType.VOID;
                    }
                    assert(false);
                    return AsmType.VOID;
                }
                emitNullInitializer(node) {
                    let identifier = getIdentifier(node);
                    if (identifier.float) {
                        this.code.append(identifier.left);
                    }
                    this.code.append(`0${identifier.double ? ".0" : ""}`);
                    if (identifier.float) {
                        this.code.append(identifier.right);
                    }
                }
            };
            exports_16("AsmJsModule", AsmJsModule);
        }
    };
});
System.register("preparser", ["lexer", "main", "stringbuilder"], function (exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    function preparse(source, compiler, log) {
        let contents = source.contents;
        let limit = contents.length;
        let pathSeparator = source.name.indexOf("/") > -1 ? "/" : (source.name.indexOf("\\") > -1 ? "\\" : "/");
        let basePath = source.name.substring(0, source.name.lastIndexOf(pathSeparator));
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
            let kind = lexer_4.TokenKind.END_OF_FILE;
            // Newline
            if (c == '\n') {
                if (!wantNewline) {
                    continue;
                }
                // Preprocessor commands all end in a newline
                wantNewline = false;
            }
            else if (lexer_4.isAlpha(c)) {
                while (i < limit && (lexer_4.isAlpha(contents[i]) || lexer_4.isNumber(contents[i]))) {
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
            else if (captureImportPath && (c == '"' || c == '\'' || c == '`')) {
                captureImportPath = false;
                while (i < limit) {
                    let next = contents[i];
                    // Escape any character including newlines
                    if (i + 1 < limit && next == '\\') {
                        i = i + 2;
                    }
                    else if (next == '\n' && c != '`') {
                        break;
                    }
                    else {
                        i = i + 1;
                        // End the string with a matching quote character
                        if (next == c) {
                            let text = contents.slice(start + 1, i - 1);
                            //FIXME: If the import already resolved don't add it again.
                            let importContent = resolveImport(basePath + pathSeparator + text);
                            if (importContent) {
                                compiler.addInputBefore(text, importContent, source);
                            }
                            else {
                                return false;
                            }
                            kind = c == '\'' ? lexer_4.TokenKind.CHARACTER : lexer_4.TokenKind.STRING;
                            break;
                        }
                    }
                }
            }
        }
        return true;
    }
    exports_17("preparse", preparse);
    function resolveImport(importPath) {
        let contents = stdlib.IO_readTextFile(importPath);
        if (contents == null) {
            main_1.printError(stringbuilder_9.StringBuilder_new().append("Cannot read from ").append(importPath).finish());
            return null;
        }
        return contents;
    }
    var lexer_4, main_1, stringbuilder_9;
    return {
        setters: [
            function (lexer_4_1) {
                lexer_4 = lexer_4_1;
            },
            function (main_1_1) {
                main_1 = main_1_1;
            },
            function (stringbuilder_9_1) {
                stringbuilder_9 = stringbuilder_9_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("compiler", ["checker", "node", "log", "preprocessor", "scope", "lexer", "parser", "shaking", "stringbuilder", "wasm", "library/library", "asmjs", "preparser"], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    function replaceFileExtension(path, extension) {
        let builder = stringbuilder_10.StringBuilder_new();
        let dot = path.lastIndexOf(".");
        let forward = path.lastIndexOf("/");
        let backward = path.lastIndexOf("\\");
        // Make sure that there's a non-empty file name that the dot is a part of
        if (dot > 0 && dot > forward && dot > backward) {
            path = path.slice(0, dot);
        }
        return builder.append(path).append(extension).finish();
    }
    exports_18("replaceFileExtension", replaceFileExtension);
    var checker_1, node_8, log_4, preprocessor_1, scope_1, lexer_5, parser_6, shaking_1, stringbuilder_10, wasm_1, library_1, asmjs_1, preparser_1, CompileTarget, Compiler;
    return {
        setters: [
            function (checker_1_1) {
                checker_1 = checker_1_1;
            },
            function (node_8_1) {
                node_8 = node_8_1;
            },
            function (log_4_1) {
                log_4 = log_4_1;
            },
            function (preprocessor_1_1) {
                preprocessor_1 = preprocessor_1_1;
            },
            function (scope_1_1) {
                scope_1 = scope_1_1;
            },
            function (lexer_5_1) {
                lexer_5 = lexer_5_1;
            },
            function (parser_6_1) {
                parser_6 = parser_6_1;
            },
            function (shaking_1_1) {
                shaking_1 = shaking_1_1;
            },
            function (stringbuilder_10_1) {
                stringbuilder_10 = stringbuilder_10_1;
            },
            function (wasm_1_1) {
                wasm_1 = wasm_1_1;
            },
            function (library_1_1) {
                library_1 = library_1_1;
            },
            function (asmjs_1_1) {
                asmjs_1 = asmjs_1_1;
            },
            function (preparser_1_1) {
                preparser_1 = preparser_1_1;
            }
        ],
        execute: function () {
            /**
             * Author: Nidin Vinayakan
             */
            (function (CompileTarget) {
                CompileTarget[CompileTarget["NONE"] = 0] = "NONE";
                CompileTarget[CompileTarget["C"] = 1] = "C";
                CompileTarget[CompileTarget["JAVASCRIPT"] = 2] = "JAVASCRIPT";
                CompileTarget[CompileTarget["TURBO_JAVASCRIPT"] = 3] = "TURBO_JAVASCRIPT";
                CompileTarget[CompileTarget["ASMJS"] = 4] = "ASMJS";
                CompileTarget[CompileTarget["WEBASSEMBLY"] = 5] = "WEBASSEMBLY";
            })(CompileTarget || (CompileTarget = {}));
            exports_18("CompileTarget", CompileTarget);
            Compiler = class Compiler {
                initialize(target, outputName) {
                    assert(this.log == null);
                    this.log = new log_4.Log();
                    this.preprocessor = new preprocessor_1.Preprocessor();
                    this.target = target;
                    this.outputName = outputName;
                    this.librarySource = this.addInput("<native>", library_1.Library.get(target));
                    this.librarySource.isLibrary = true;
                    this.runtimeSource = library_1.Library.getRuntime(target);
                    this.wrapperSource = library_1.Library.getWrapper(target);
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
                    else if (target == CompileTarget.ASMJS) {
                        this.preprocessor.define("ASM_JS", true);
                    }
                    else if (target == CompileTarget.WEBASSEMBLY) {
                        this.preprocessor.define("WASM", true);
                    }
                }
                createGlobals() {
                    let context = new checker_1.CheckContext();
                    context.log = this.log;
                    context.target = this.target;
                    context.pointerByteSize = 4; // Assume 32-bit code generation for now
                    let global = new node_8.Node();
                    global.kind = node_8.NodeKind.GLOBAL;
                    let scope = new scope_1.Scope();
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
                addInput(name, contents) {
                    let source = new log_4.Source();
                    source.name = name;
                    source.contents = contents;
                    if (this.firstSource == null)
                        this.firstSource = source;
                    else {
                        source.prev = this.lastSource;
                        this.lastSource.next = source;
                    }
                    this.lastSource = source;
                    return source;
                }
                addInputBefore(name, contents, nextSource) {
                    let source = new log_4.Source();
                    source.name = name;
                    source.contents = contents;
                    nextSource.prev.next = source;
                    source.prev = nextSource.prev;
                    nextSource.prev = source;
                    source.next = nextSource;
                    return source;
                }
                finish() {
                    stdlib.Profiler_begin("pre-parsing");
                    let source = this.firstSource;
                    while (source != null) {
                        if (!preparser_1.preparse(source, this, this.log)) {
                            return false;
                        }
                        source = source.next;
                    }
                    stdlib.Profiler_end("pre-parsing");
                    stdlib.Profiler_begin("lexing");
                    source = this.firstSource;
                    while (source != null) {
                        source.firstToken = lexer_5.tokenize(source, this.log);
                        source = source.next;
                    }
                    stdlib.Profiler_end("lexing");
                    stdlib.Profiler_begin("preprocessing");
                    source = this.firstSource;
                    while (source != null) {
                        this.preprocessor.run(source, this.log);
                        source = source.next;
                    }
                    stdlib.Profiler_end("preprocessing");
                    stdlib.Profiler_begin("parsing");
                    source = this.firstSource;
                    while (source != null) {
                        if (source.firstToken != null) {
                            source.file = parser_6.parse(source.firstToken, this.log);
                        }
                        source = source.next;
                    }
                    stdlib.Profiler_end("parsing");
                    stdlib.Profiler_begin("checking");
                    let global = this.global;
                    let context = this.context;
                    let fullResolve = true;
                    source = this.firstSource;
                    while (source != null) {
                        let file = source.file;
                        if (file != null) {
                            if (source.isLibrary) {
                                checker_1.initialize(context, file, global.scope, checker_1.CheckMode.INITIALIZE);
                                checker_1.resolve(context, file, global.scope);
                            }
                            else {
                                checker_1.initialize(context, file, global.scope, checker_1.CheckMode.NORMAL);
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
                        checker_1.resolve(context, global, global.scope);
                    }
                    stdlib.Profiler_end("checking");
                    if (this.log.hasErrors()) {
                        return false;
                    }
                    stdlib.Profiler_begin("shaking");
                    shaking_1.treeShaking(global);
                    stdlib.Profiler_end("shaking");
                    stdlib.Profiler_begin("emitting");
                    // if (this.target == CompileTarget.C) {
                    //     cEmit(this);
                    // }
                    // else if (this.target == CompileTarget.JAVASCRIPT) {
                    //     jsEmit(this);
                    // }
                    //
                    // else if (this.target == CompileTarget.TURBO_JAVASCRIPT) {
                    //     turboJsEmit(this);
                    // }
                    if (this.target == CompileTarget.ASMJS) {
                        asmjs_1.asmJsEmit(this);
                    }
                    else if (this.target == CompileTarget.WEBASSEMBLY) {
                        wasm_1.wasmEmit(this);
                    }
                    stdlib.Profiler_end("emitting");
                    console.log("Done!");
                    return true;
                }
            };
            exports_18("Compiler", Compiler);
        }
    };
});
System.register("const", [], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    var MIN_INT32_VALUE, MAX_INT32_VALUE, MIN_UINT32_VALUE, MAX_UINT32_VALUE, MIN_INT64_VALUE, MAX_INT64_VALUE, MIN_UINT64_VALUE, MAX_UINT64_VALUE;
    return {
        setters: [],
        execute: function () {
            /**
             * Created by Nidin Vinayakan on 11/01/17.
             */
            exports_19("MIN_INT32_VALUE", MIN_INT32_VALUE = -Math.pow(2, 31));
            exports_19("MAX_INT32_VALUE", MAX_INT32_VALUE = Math.pow(2, 31) - 1);
            exports_19("MIN_UINT32_VALUE", MIN_UINT32_VALUE = 0);
            exports_19("MAX_UINT32_VALUE", MAX_UINT32_VALUE = Math.pow(2, 32) - 1);
            //FIXME: Cannot represent 64 bit integer in javascript
            exports_19("MIN_INT64_VALUE", MIN_INT64_VALUE = -Math.pow(2, 63));
            exports_19("MAX_INT64_VALUE", MAX_INT64_VALUE = Math.pow(2, 63) - 1);
            exports_19("MIN_UINT64_VALUE", MIN_UINT64_VALUE = 0);
            exports_19("MAX_UINT64_VALUE", MAX_UINT64_VALUE = Math.pow(2, 64) - 1);
        }
    };
});
System.register("checker", ["symbol", "type", "node", "compiler", "log", "scope", "stringbuilder", "imports", "const"], function (exports_20, context_20) {
    "use strict";
    var __moduleName = context_20 && context_20.id;
    function addScopeToSymbol(symbol, parentScope) {
        let scope = new scope_2.Scope();
        scope.parent = parentScope;
        scope.symbol = symbol;
        symbol.scope = scope;
    }
    exports_20("addScopeToSymbol", addScopeToSymbol);
    function linkSymbolToNode(symbol, node) {
        node.symbol = symbol;
        node.scope = symbol.scope;
        symbol.range = node.internalRange != null ? node.internalRange : node.range;
        symbol.node = node;
    }
    exports_20("linkSymbolToNode", linkSymbolToNode);
    function initialize(context, node, parentScope, mode) {
        let kind = node.kind;
        if (node.parent != null) {
            let parentKind = node.parent.kind;
            // Validate node placement
            if (kind != node_9.NodeKind.IMPORTS &&
                kind != node_9.NodeKind.VARIABLE &&
                kind != node_9.NodeKind.VARIABLES &&
                (kind != node_9.NodeKind.FUNCTION || parentKind != node_9.NodeKind.CLASS) &&
                (parentKind == node_9.NodeKind.FILE || parentKind == node_9.NodeKind.GLOBAL) != (parentKind == node_9.NodeKind.MODULE ||
                    kind == node_9.NodeKind.MODULE ||
                    kind == node_9.NodeKind.CLASS ||
                    kind == node_9.NodeKind.ENUM ||
                    kind == node_9.NodeKind.FUNCTION ||
                    kind == node_9.NodeKind.CONSTANTS)) {
                context.log.error(node.range, "This statement is not allowed here");
            }
        }
        // Module
        if (kind == node_9.NodeKind.MODULE) {
            assert(node.symbol == null);
            let symbol = new symbol_8.Symbol();
            symbol.kind = symbol_8.SymbolKind.TYPE_MODULE;
            symbol.name = node.stringValue;
            symbol.resolvedType = new type_2.Type();
            symbol.resolvedType.symbol = symbol;
            symbol.flags = symbol_8.SYMBOL_FLAG_IS_REFERENCE;
            addScopeToSymbol(symbol, parentScope);
            linkSymbolToNode(symbol, node);
            parentScope.define(context.log, symbol, scope_2.ScopeHint.NORMAL);
            parentScope = symbol.scope;
        }
        // Class
        if (kind == node_9.NodeKind.CLASS || kind == node_9.NodeKind.ENUM) {
            assert(node.symbol == null);
            let symbol = new symbol_8.Symbol();
            symbol.kind = kind == node_9.NodeKind.CLASS ? symbol_8.SymbolKind.TYPE_CLASS : symbol_8.SymbolKind.TYPE_ENUM;
            symbol.name = node.stringValue;
            symbol.resolvedType = new type_2.Type();
            symbol.resolvedType.symbol = symbol;
            symbol.flags = symbol_8.SYMBOL_FLAG_IS_REFERENCE;
            addScopeToSymbol(symbol, parentScope);
            linkSymbolToNode(symbol, node);
            parentScope.define(context.log, symbol, scope_2.ScopeHint.NORMAL);
            parentScope = symbol.scope;
            if (node.parameterCount() > 0) {
                //Class has generic parameters. convert it to class template
                symbol.kind = symbol_8.SymbolKind.TYPE_TEMPLATE;
                symbol.flags |= symbol_8.SYMBOL_FLAG_IS_TEMPLATE;
                //TODO: Lift generic parameter limit from 1 to many
                let genericType = node.firstGenericType();
                let genericSymbol = new symbol_8.Symbol();
                genericSymbol.kind = symbol_8.SymbolKind.TYPE_GENERIC;
                genericSymbol.name = genericType.stringValue;
                genericSymbol.resolvedType = new type_2.Type();
                genericSymbol.resolvedType.symbol = genericSymbol;
                genericSymbol.flags = symbol_8.SYMBOL_FLAG_IS_GENERIC;
                genericType.flags = node_9.NODE_FLAG_GENERIC;
                addScopeToSymbol(genericSymbol, parentScope);
                linkSymbolToNode(genericSymbol, genericType);
                parentScope.define(context.log, genericSymbol, scope_2.ScopeHint.NORMAL);
            }
        }
        else if (kind == node_9.NodeKind.FUNCTION) {
            assert(node.symbol == null);
            let symbol = new symbol_8.Symbol();
            symbol.kind =
                node.parent.kind == node_9.NodeKind.CLASS ? symbol_8.SymbolKind.FUNCTION_INSTANCE :
                    symbol_8.SymbolKind.FUNCTION_GLOBAL;
            symbol.name = node.stringValue;
            if (node.isOperator()) {
                if (symbol.name == "+" || symbol.name == "-") {
                    if (node.functionFirstArgument() == node.functionReturnType()) {
                        symbol.flags = symbol_8.SYMBOL_FLAG_IS_UNARY_OPERATOR;
                        symbol.rename = symbol.name == "+" ? "op_positive" : "op_negative";
                    }
                    else {
                        symbol.flags = symbol_8.SYMBOL_FLAG_IS_BINARY_OPERATOR;
                        symbol.rename = symbol.name == "+" ? "op_add" : "op_subtract";
                    }
                }
                else {
                    symbol.rename =
                        symbol.name == "%" ? "op_remainder" :
                            symbol.name == "&" ? "op_and" :
                                symbol.name == "*" ? "op_multiply" :
                                    symbol.name == "**" ? "op_exponent" :
                                        symbol.name == "++" ? "op_increment" :
                                            symbol.name == "--" ? "op_decrement" :
                                                symbol.name == "/" ? "op_divide" :
                                                    symbol.name == "<" ? "op_lessThan" :
                                                        symbol.name == "<<" ? "op_shiftLeft" :
                                                            symbol.name == "==" ? "op_equals" :
                                                                symbol.name == ">" ? "op_greaterThan" :
                                                                    symbol.name == ">>" ? "op_shiftRight" :
                                                                        symbol.name == "[]" ? "op_get" :
                                                                            symbol.name == "[]=" ? "op_set" :
                                                                                symbol.name == "^" ? "op_xor" :
                                                                                    symbol.name == "|" ? "op_or" :
                                                                                        symbol.name == "~" ? "op_complement" :
                                                                                            null;
                }
            }
            if (symbol.name == "constructor") {
                symbol.rename = "_set";
            }
            addScopeToSymbol(symbol, parentScope);
            linkSymbolToNode(symbol, node);
            parentScope.define(context.log, symbol, symbol.isSetter() ? scope_2.ScopeHint.NOT_GETTER :
                symbol.isGetter() ? scope_2.ScopeHint.NOT_SETTER :
                    symbol.isBinaryOperator() ? scope_2.ScopeHint.NOT_UNARY :
                        symbol.isUnaryOperator() ? scope_2.ScopeHint.NOT_BINARY :
                            scope_2.ScopeHint.NORMAL);
            parentScope = symbol.scope;
            // All instance functions have a special "this" type
            if (symbol.kind == symbol_8.SymbolKind.FUNCTION_INSTANCE) {
                let parent = symbol.parent();
                initializeSymbol(context, parent);
                node.insertChildBefore(node.functionFirstArgument(), node_9.createVariable("this", node_9.createType(parent.resolvedType), null));
                //All constructors have special return "this" type
                if (symbol.name == "constructor") {
                    let returnNode = node_9.createReturn(node_9.createThis());
                    if (node.lastChild.lastChild && node.lastChild.lastChild.kind == node_9.NodeKind.RETURN) {
                        node.lastChild.lastChild.remove();
                    }
                    node.lastChild.appendChild(returnNode);
                }
            }
        }
        else if (kind == node_9.NodeKind.VARIABLE) {
            assert(node.symbol == null);
            let symbol = new symbol_8.Symbol();
            symbol.kind =
                node.parent.kind == node_9.NodeKind.CLASS ? symbol_8.SymbolKind.VARIABLE_INSTANCE :
                    node.parent.kind == node_9.NodeKind.FUNCTION ? symbol_8.SymbolKind.VARIABLE_ARGUMENT :
                        node.parent.kind == node_9.NodeKind.CONSTANTS || node.parent.kind == node_9.NodeKind.ENUM ? symbol_8.SymbolKind.VARIABLE_CONSTANT :
                            node.parent.kind == node_9.NodeKind.VARIABLES && node.parent.parent.kind == node_9.NodeKind.FILE ? symbol_8.SymbolKind.VARIABLE_GLOBAL :
                                symbol_8.SymbolKind.VARIABLE_LOCAL;
            symbol.name = node.stringValue;
            symbol.scope = parentScope;
            linkSymbolToNode(symbol, node);
            parentScope.define(context.log, symbol, scope_2.ScopeHint.NORMAL);
        }
        else if (kind == node_9.NodeKind.BLOCK) {
            if (node.parent.kind != node_9.NodeKind.FUNCTION) {
                let scope = new scope_2.Scope();
                scope.parent = parentScope;
                parentScope = scope;
            }
            node.scope = parentScope;
        }
        // Children
        let child = node.firstChild;
        while (child != null) {
            initialize(context, child, parentScope, mode);
            child = child.nextSibling;
        }
        if (kind == node_9.NodeKind.FILE && mode == CheckMode.INITIALIZE) {
            context.booleanType = parentScope.findLocal("boolean", scope_2.ScopeHint.NORMAL).resolvedType;
            context.uint8Type = parentScope.findLocal("uint8", scope_2.ScopeHint.NORMAL).resolvedType;
            context.int32Type = parentScope.findLocal("int32", scope_2.ScopeHint.NORMAL).resolvedType;
            context.int64Type = parentScope.findLocal("int64", scope_2.ScopeHint.NORMAL).resolvedType;
            context.int8Type = parentScope.findLocal("int8", scope_2.ScopeHint.NORMAL).resolvedType;
            context.int16Type = parentScope.findLocal("int16", scope_2.ScopeHint.NORMAL).resolvedType;
            context.stringType = parentScope.findLocal("string", scope_2.ScopeHint.NORMAL).resolvedType;
            context.uint32Type = parentScope.findLocal("uint32", scope_2.ScopeHint.NORMAL).resolvedType;
            context.uint64Type = parentScope.findLocal("uint64", scope_2.ScopeHint.NORMAL).resolvedType;
            context.uint16Type = parentScope.findLocal("uint16", scope_2.ScopeHint.NORMAL).resolvedType;
            context.float32Type = parentScope.findLocal("float32", scope_2.ScopeHint.NORMAL).resolvedType;
            context.float64Type = parentScope.findLocal("float64", scope_2.ScopeHint.NORMAL).resolvedType;
            prepareNativeType(context.booleanType, 1, 0);
            prepareNativeType(context.uint8Type, 1, symbol_8.SYMBOL_FLAG_NATIVE_INTEGER | symbol_8.SYMBOL_FLAG_IS_UNSIGNED);
            prepareNativeType(context.int8Type, 1, symbol_8.SYMBOL_FLAG_NATIVE_INTEGER);
            prepareNativeType(context.int16Type, 2, symbol_8.SYMBOL_FLAG_NATIVE_INTEGER);
            prepareNativeType(context.uint16Type, 2, symbol_8.SYMBOL_FLAG_NATIVE_INTEGER | symbol_8.SYMBOL_FLAG_IS_UNSIGNED);
            prepareNativeType(context.int32Type, 4, symbol_8.SYMBOL_FLAG_NATIVE_INTEGER);
            prepareNativeType(context.int64Type, 8, symbol_8.SYMBOL_FLAG_NATIVE_LONG);
            prepareNativeType(context.uint32Type, 4, symbol_8.SYMBOL_FLAG_NATIVE_INTEGER | symbol_8.SYMBOL_FLAG_IS_UNSIGNED);
            prepareNativeType(context.uint64Type, 8, symbol_8.SYMBOL_FLAG_NATIVE_LONG | symbol_8.SYMBOL_FLAG_IS_UNSIGNED);
            prepareNativeType(context.stringType, 4, symbol_8.SYMBOL_FLAG_IS_REFERENCE);
            prepareNativeType(context.float32Type, 4, symbol_8.SYMBOL_FLAG_NATIVE_FLOAT);
            prepareNativeType(context.float64Type, 8, symbol_8.SYMBOL_FLAG_NATIVE_DOUBLE);
            //Prepare builtin types
            //context.arrayType = parentScope.findLocal("Array", ScopeHint.NORMAL).resolvedType;
            //prepareBuiltinType(context.arrayType, 0, SYMBOL_FLAG_IS_ARRAY); //byteSize will calculate later
        }
    }
    exports_20("initialize", initialize);
    function prepareNativeType(type, byteSizeAndMaxAlignment, flags) {
        let symbol = type.symbol;
        symbol.kind = symbol_8.SymbolKind.TYPE_NATIVE;
        symbol.byteSize = byteSizeAndMaxAlignment;
        symbol.maxAlignment = byteSizeAndMaxAlignment;
        symbol.flags = flags;
    }
    function prepareBuiltinType(type, byteSizeAndMaxAlignment, flags) {
        let symbol = type.symbol;
        symbol.kind = symbol_8.SymbolKind.TYPE_CLASS;
        symbol.byteSize = byteSizeAndMaxAlignment;
        symbol.maxAlignment = byteSizeAndMaxAlignment;
        symbol.flags = flags;
    }
    function forbidFlag(context, node, flag, text) {
        if ((node.flags & flag) != 0) {
            let range = node_9.rangeForFlag(node.firstFlag, flag);
            if (range != null) {
                node.flags = node.flags & ~flag;
                context.log.error(range, text);
            }
        }
    }
    exports_20("forbidFlag", forbidFlag);
    function requireFlag(context, node, flag, text) {
        if ((node.flags & flag) == 0) {
            node.flags = node.flags | flag;
            context.log.error(node.range, text);
        }
    }
    exports_20("requireFlag", requireFlag);
    function initializeSymbol(context, symbol) {
        if (symbol.state == symbol_8.SymbolState.INITIALIZED) {
            assert(symbol.resolvedType != null);
            return;
        }
        assert(symbol.state == symbol_8.SymbolState.UNINITIALIZED);
        symbol.state = symbol_8.SymbolState.INITIALIZING;
        // Most flags aren't supported yet
        let node = symbol.node;
        // forbidFlag(context, node, NODE_FLAG_EXPORT, "Unsupported flag 'export'");
        forbidFlag(context, node, node_9.NODE_FLAG_PROTECTED, "Unsupported flag 'protected'");
        //forbidFlag(context, node, NODE_FLAG_STATIC, "Unsupported flag 'static'");
        // Module
        if (symbol.kind == symbol_8.SymbolKind.TYPE_MODULE) {
            forbidFlag(context, node, node_9.NODE_FLAG_GET, "Cannot use 'get' on a module");
            forbidFlag(context, node, node_9.NODE_FLAG_SET, "Cannot use 'set' on a module");
            forbidFlag(context, node, node_9.NODE_FLAG_PUBLIC, "Cannot use 'public' on a module");
            forbidFlag(context, node, node_9.NODE_FLAG_PRIVATE, "Cannot use 'private' on a module");
        }
        else if (symbol.kind == symbol_8.SymbolKind.TYPE_CLASS || symbol.kind == symbol_8.SymbolKind.TYPE_NATIVE ||
            symbol.kind == symbol_8.SymbolKind.TYPE_GENERIC || symbol.kind == symbol_8.SymbolKind.TYPE_TEMPLATE) {
            forbidFlag(context, node, node_9.NODE_FLAG_GET, "Cannot use 'get' on a class");
            forbidFlag(context, node, node_9.NODE_FLAG_SET, "Cannot use 'set' on a class");
            forbidFlag(context, node, node_9.NODE_FLAG_PUBLIC, "Cannot use 'public' on a class");
            forbidFlag(context, node, node_9.NODE_FLAG_PRIVATE, "Cannot use 'private' on a class");
        }
        else if (symbol.kind == symbol_8.SymbolKind.TYPE_INTERFACE) {
            forbidFlag(context, node, node_9.NODE_FLAG_GET, "Cannot use 'get' on a interface");
            forbidFlag(context, node, node_9.NODE_FLAG_SET, "Cannot use 'set' on a interface");
            forbidFlag(context, node, node_9.NODE_FLAG_PUBLIC, "Cannot use 'public' on a interface");
            forbidFlag(context, node, node_9.NODE_FLAG_PRIVATE, "Cannot use 'private' on a interface");
        }
        else if (symbol.kind == symbol_8.SymbolKind.TYPE_ENUM) {
            forbidFlag(context, node, node_9.NODE_FLAG_GET, "Cannot use 'get' on an enum");
            forbidFlag(context, node, node_9.NODE_FLAG_SET, "Cannot use 'set' on an enum");
            forbidFlag(context, node, node_9.NODE_FLAG_PUBLIC, "Cannot use 'public' on an enum");
            forbidFlag(context, node, node_9.NODE_FLAG_PRIVATE, "Cannot use 'private' on an enum");
            symbol.resolvedType = new type_2.Type();
            symbol.resolvedType.symbol = symbol;
            let underlyingSymbol = symbol.resolvedType.underlyingType(context).symbol;
            symbol.byteSize = underlyingSymbol.byteSize;
            symbol.maxAlignment = underlyingSymbol.maxAlignment;
        }
        else if (symbol_8.isFunction(symbol.kind)) {
            // if (node.firstChild.kind == NodeKind.PARAMETERS) {
            //     resolve(context, node.firstChild, symbol.scope);
            // }
            let body = node.functionBody();
            let returnType = node.functionReturnType();
            let oldUnsafeAllowed = context.isUnsafeAllowed;
            context.isUnsafeAllowed = node.isUnsafe();
            resolveAsType(context, returnType, symbol.scope.parent);
            if (returnType.resolvedType.isClass() && returnType.hasParameters() && node.parent != returnType.resolvedType.symbol.node) {
                deriveConcreteClass(context, returnType, [returnType.firstChild.firstChild], returnType.resolvedType.symbol.scope);
            }
            let argumentCount = 0;
            let child = node.functionFirstArgument();
            while (child != returnType) {
                assert(child.kind == node_9.NodeKind.VARIABLE);
                assert(child.symbol.kind == symbol_8.SymbolKind.VARIABLE_ARGUMENT);
                initializeSymbol(context, child.symbol);
                child.symbol.offset = argumentCount;
                argumentCount = argumentCount + 1;
                child = child.nextSibling;
            }
            if (symbol.kind != symbol_8.SymbolKind.FUNCTION_INSTANCE) {
                forbidFlag(context, node, node_9.NODE_FLAG_GET, "Cannot use 'get' here");
                forbidFlag(context, node, node_9.NODE_FLAG_SET, "Cannot use 'set' here");
                forbidFlag(context, node, node_9.NODE_FLAG_PUBLIC, "Cannot use 'public' here");
                forbidFlag(context, node, node_9.NODE_FLAG_PRIVATE, "Cannot use 'private' here");
            }
            else if (node.isGet()) {
                forbidFlag(context, node, node_9.NODE_FLAG_SET, "Cannot use both 'get' and 'set'");
                // Validate argument count including "this"
                if (argumentCount != 1) {
                    context.log.error(symbol.range, "Getters must not have any arguments");
                }
            }
            else if (node.isSet()) {
                symbol.rename = stringbuilder_11.StringBuilder_new()
                    .append("set_")
                    .append(symbol.name)
                    .finish();
                // Validate argument count including "this"
                if (argumentCount != 2) {
                    context.log.error(symbol.range, "Setters must have exactly one argument");
                }
            }
            else if (node.isOperator()) {
                if (symbol.name == "~" || symbol.name == "++" || symbol.name == "--") {
                    if (argumentCount != 1) {
                        context.log.error(symbol.range, stringbuilder_11.StringBuilder_new()
                            .append("Operator '")
                            .append(symbol.name)
                            .append("' must not have any arguments")
                            .finish());
                    }
                }
                else if (symbol.name == "+" || symbol.name == "-") {
                    if (argumentCount > 2) {
                        context.log.error(symbol.range, stringbuilder_11.StringBuilder_new()
                            .append("Operator '")
                            .append(symbol.name)
                            .append("' must have at most one argument")
                            .finish());
                    }
                }
                else if (symbol.name == "[]=") {
                    if (argumentCount < 2) {
                        context.log.error(symbol.range, "Operator '[]=' must have at least one argument");
                    }
                }
                else if (argumentCount != 2) {
                    context.log.error(symbol.range, stringbuilder_11.StringBuilder_new()
                        .append("Operator '")
                        .append(symbol.name)
                        .append("' must have exactly one argument")
                        .finish());
                }
            }
            symbol.resolvedType = new type_2.Type();
            symbol.resolvedType.symbol = symbol;
            if (symbol.kind == symbol_8.SymbolKind.FUNCTION_INSTANCE) {
                let parent = symbol.parent();
                let shouldConvertInstanceToGlobal = false;
                forbidFlag(context, node, node_9.NODE_FLAG_EXPORT, "Cannot use 'export' on an instance function");
                forbidFlag(context, node, node_9.NODE_FLAG_DECLARE, "Cannot use 'declare' on an instance function");
                // Functions inside declared classes are automatically declared
                if (parent.node.isDeclare()) {
                    if (body == null) {
                        node.flags = node.flags | node_9.NODE_FLAG_DECLARE;
                        if (parent.node.isExternalImport()) {
                            node.flags = node.flags | node_9.NODE_FLAG_EXTERNAL_IMPORT;
                        }
                    }
                    else {
                        shouldConvertInstanceToGlobal = true;
                    }
                }
                else {
                    if (body == null) {
                        context.log.error(node.lastChild.range, "Must implement this function");
                    }
                    // Functions inside export classes are automatically export
                    if (parent.node.isExport()) {
                        node.flags = node.flags | node_9.NODE_FLAG_EXPORT;
                    }
                }
                // Rewrite this symbol as a global function instead of an instance function
                if (shouldConvertInstanceToGlobal) {
                    symbol.kind = symbol_8.SymbolKind.FUNCTION_GLOBAL;
                    symbol.flags = symbol.flags | symbol_8.SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL;
                    symbol.rename = stringbuilder_11.StringBuilder_new()
                        .append(parent.name)
                        .appendChar('_')
                        .append(symbol.rename != null ? symbol.rename : symbol.name)
                        .finish();
                    let argument = node.functionFirstArgument();
                    assert(argument.symbol.name == "this");
                    argument.symbol.rename = "__this";
                }
            }
            else if (body == null) {
                forbidFlag(context, node, node_9.NODE_FLAG_EXPORT, "Cannot use 'export' on an unimplemented function");
                if (!node.parent || !node.parent.isDeclare()) {
                    requireFlag(context, node, node_9.NODE_FLAG_DECLARE, "Declared functions must be prefixed with 'declare'");
                }
            }
            else {
                forbidFlag(context, node, node_9.NODE_FLAG_DECLARE, "Cannot use 'declare' on a function with an implementation");
            }
            context.isUnsafeAllowed = oldUnsafeAllowed;
        }
        else if (symbol_8.isVariable(symbol.kind)) {
            forbidFlag(context, node, node_9.NODE_FLAG_GET, "Cannot use 'get' on a variable");
            forbidFlag(context, node, node_9.NODE_FLAG_SET, "Cannot use 'set' on a variable");
            let type = node.variableType();
            let value = node.variableValue();
            let oldUnsafeAllowed = context.isUnsafeAllowed;
            context.isUnsafeAllowed = context.isUnsafeAllowed || node.isUnsafe();
            if (symbol.kind != symbol_8.SymbolKind.VARIABLE_INSTANCE) {
                forbidFlag(context, node, node_9.NODE_FLAG_PUBLIC, "Cannot use 'public' here");
                forbidFlag(context, node, node_9.NODE_FLAG_PRIVATE, "Cannot use 'private' here");
            }
            if (type != null) {
                resolveAsType(context, type, symbol.scope);
                if (type.resolvedType.isTemplate() && type.hasParameters() && node.parent != type.resolvedType.symbol.node) {
                    deriveConcreteClass(context, type, [type.firstChild.firstChild], type.resolvedType.symbol.scope);
                }
                symbol.resolvedType = type.resolvedType;
            }
            else if (value != null) {
                resolveAsExpression(context, value, symbol.scope);
                if (value.resolvedType.isTemplate() && value.hasParameters() && node.parent != value.resolvedType.symbol.node) {
                    deriveConcreteClass(context, value, [value.firstChild.firstChild], value.resolvedType.symbol.scope);
                }
                symbol.resolvedType = value.resolvedType;
            }
            else {
                context.log.error(node.internalRange, "Cannot create untyped variables");
                symbol.resolvedType = context.errorType;
            }
            // Validate the variable type
            if (symbol.resolvedType == context.voidType || symbol.resolvedType == context.nullType) {
                context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                    .append("Cannot create a variable with type '")
                    .append(symbol.resolvedType.toString())
                    .appendChar('\'')
                    .finish());
                symbol.resolvedType = context.errorType;
            }
            // Resolve constant values at initialization time
            if (symbol.kind == symbol_8.SymbolKind.VARIABLE_CONSTANT) {
                if (value != null) {
                    resolveAsExpression(context, value, symbol.scope);
                    checkConversion(context, value, symbol.resolvedTypeUnderlyingIfEnumValue(context), type_2.ConversionKind.IMPLICIT);
                    //FIXME: Why we need to set offset like this?
                    if (value.kind == node_9.NodeKind.INT32 || value.kind == node_9.NodeKind.INT64 || value.kind == node_9.NodeKind.BOOLEAN) {
                        symbol.offset = value.intValue;
                    }
                    else if (value.kind == node_9.NodeKind.FLOAT32 || value.kind == node_9.NodeKind.FLOAT64) {
                        symbol.offset = value.floatValue;
                    }
                    else if (value.resolvedType != context.errorType) {
                        context.log.error(value.range, "Invalid constant initializer");
                        symbol.resolvedType = context.errorType;
                    }
                }
                else if (symbol.isEnumValue()) {
                    if (node.previousSibling != null) {
                        let previousSymbol = node.previousSibling.symbol;
                        initializeSymbol(context, previousSymbol);
                        symbol.offset = previousSymbol.offset + 1;
                    }
                    else {
                        symbol.offset = 0;
                    }
                }
                else {
                    context.log.error(node.internalRange, "Constants must be initialized");
                }
            }
            // Disallow shadowing at function scope
            if (symbol.scope.symbol == null) {
                let scope = symbol.scope.parent;
                while (scope != null) {
                    let shadowed = scope.findLocal(symbol.name, scope_2.ScopeHint.NORMAL);
                    if (shadowed != null) {
                        context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                            .append("The symbol '")
                            .append(symbol.name)
                            .append("' shadows another symbol with the same name in a parent scope")
                            .finish());
                        break;
                    }
                    // Stop when we pass through a function scope
                    if (scope.symbol != null) {
                        break;
                    }
                    scope = scope.parent;
                }
            }
            context.isUnsafeAllowed = oldUnsafeAllowed;
        }
        else {
            assert(false);
        }
        assert(symbol.resolvedType != null);
        symbol.state = symbol_8.SymbolState.INITIALIZED;
    }
    exports_20("initializeSymbol", initializeSymbol);
    /**
     * Derive a concrete class from class template type
     * @param context
     * @param type
     * @param parameters
     * @param parentScope
     * @returns {Symbol}
     */
    function deriveConcreteClass(context, type, parameters, scope) {
        let templateNode = type.resolvedType.pointerTo ? type.resolvedType.pointerTo.symbol.node : type.resolvedType.symbol.node;
        let templateName = templateNode.stringValue;
        let typeName = templateNode.stringValue + `<${parameters[0].stringValue}>`;
        let rename = templateNode.stringValue + `_${parameters[0].stringValue}`;
        let symbol = scope.parent.findNested(typeName, scope_2.ScopeHint.NORMAL, scope_2.FindNested.NORMAL);
        if (symbol) {
            type.symbol = symbol;
            if (type.resolvedType.pointerTo) {
                type.resolvedType = symbol.resolvedType.pointerType();
            }
            else {
                type.resolvedType = symbol.resolvedType;
            }
            return;
        }
        let node = templateNode.clone();
        // node.parent = templateNode.parent;
        node.stringValue = typeName;
        cloneChildren(templateNode.firstChild.nextSibling, node, parameters, templateName, typeName);
        node.offset = null; //FIXME: we cannot take offset from class template node
        initialize(context, node, scope.parent, CheckMode.NORMAL);
        resolve(context, node, scope.parent);
        node.symbol.flags = symbol_8.SYMBOL_FLAG_USED;
        type.symbol = node.symbol;
        node.symbol.rename = rename;
        if (type.resolvedType.pointerTo) {
            type.resolvedType = node.symbol.resolvedType.pointerType();
        }
        else {
            type.resolvedType = node.symbol.resolvedType;
        }
        if (templateNode.parent) {
            templateNode.replaceWith(node);
        }
        else {
            let prevNode = templateNode.derivedNodes[templateNode.derivedNodes.length - 1];
            prevNode.parent.insertChildAfter(prevNode, node);
        }
        if (templateNode.derivedNodes === undefined) {
            templateNode.derivedNodes = [];
        }
        templateNode.derivedNodes.push(node);
        //Leave the parameter for the emitter to identify the type
        type.firstChild.firstChild.kind = node_9.NodeKind.NAME;
        resolve(context, type.firstChild.firstChild, scope.parent);
        type.stringValue = node.symbol.name;
        return;
    }
    function cloneChildren(child, parentNode, parameters, templateName, typeName) {
        let firstChildNode = null;
        let lastChildNode = null;
        while (child) {
            if (child.stringValue == "this" && child.parent.symbol && child.parent.symbol.kind == symbol_8.SymbolKind.FUNCTION_INSTANCE) {
                child = child.nextSibling;
                continue;
            }
            let childNode;
            if (child.kind == node_9.NodeKind.PARAMETERS || child.kind == node_9.NodeKind.PARAMETER) {
                child = child.nextSibling;
                continue;
            }
            if (child.isGeneric()) {
                let offset = child.offset;
                if (child.resolvedType) {
                    offset = child.resolvedType.pointerTo ? child.resolvedType.pointerTo.symbol.node.offset : child.resolvedType.symbol.node.offset;
                }
                if (child.symbol && symbol_8.isVariable(child.symbol.kind)) {
                    childNode = child.clone();
                }
                else {
                    childNode = parameters[offset].clone();
                }
                childNode.kind = node_9.NodeKind.NAME;
            }
            else {
                if (child.stringValue == "T") {
                    console.log(child);
                }
                childNode = child.clone();
                if (childNode.stringValue == templateName) {
                    childNode.stringValue = typeName;
                }
            }
            childNode.parent = parentNode;
            if (childNode.stringValue == "constructor" && childNode.parent.kind == node_9.NodeKind.CLASS) {
                childNode.parent.constructorFunctionNode = childNode;
            }
            if (!firstChildNode) {
                firstChildNode = childNode;
            }
            if (lastChildNode) {
                lastChildNode.nextSibling = childNode;
                childNode.previousSibling = lastChildNode;
            }
            if (child.firstChild) {
                cloneChildren(child.firstChild, childNode, parameters, templateName, typeName);
            }
            lastChildNode = childNode;
            child = child.nextSibling;
        }
        parentNode.firstChild = firstChildNode;
        parentNode.lastChild = lastChildNode;
    }
    function resolveChildren(context, node, parentScope) {
        let child = node.firstChild;
        while (child != null) {
            resolve(context, child, parentScope);
            assert(child.resolvedType != null);
            child = child.nextSibling;
        }
    }
    exports_20("resolveChildren", resolveChildren);
    function resolveChildrenAsExpressions(context, node, parentScope) {
        let child = node.firstChild;
        while (child != null) {
            resolveAsExpression(context, child, parentScope);
            child = child.nextSibling;
        }
    }
    exports_20("resolveChildrenAsExpressions", resolveChildrenAsExpressions);
    function resolveAsExpression(context, node, parentScope) {
        assert(node_9.isExpression(node));
        resolve(context, node, parentScope);
        assert(node.resolvedType != null);
        if (node.resolvedType != context.errorType) {
            if (node.isType()) {
                context.log.error(node.range, "Expected expression but found type");
                node.resolvedType = context.errorType;
            }
            else if (node.resolvedType == context.voidType && node.parent.kind != node_9.NodeKind.EXPRESSION) {
                context.log.error(node.range, "This expression does not return a value");
                node.resolvedType = context.errorType;
            }
        }
    }
    exports_20("resolveAsExpression", resolveAsExpression);
    function resolveAsType(context, node, parentScope) {
        assert(node_9.isExpression(node));
        resolve(context, node, parentScope);
        assert(node.resolvedType != null);
        if (node.resolvedType != context.errorType && !node.isType()) {
            context.log.error(node.range, "Expected type but found expression");
            node.resolvedType = context.errorType;
        }
    }
    exports_20("resolveAsType", resolveAsType);
    function canConvert(context, node, to, kind) {
        let from = node.resolvedType;
        assert(node_9.isExpression(node));
        assert(from != null);
        assert(to != null);
        //Generic always accept any types
        if (from.isGeneric() || to.isGeneric()) {
            return true;
        }
        // Early-out if the types are identical or errors
        if (from == to || from == context.errorType || to == context.errorType) {
            return true;
        }
        else if (from == context.nullType /* && to.isReference()*/) {
            return true;
        }
        else if ((from.isReference() || to.isReference())) {
            if (kind == type_2.ConversionKind.EXPLICIT) {
                return true;
            }
        }
        else if (from.isInteger() && to.isInteger()) {
            let mask = to.integerBitMask(context);
            if (from.isUnsigned() && to.isUnsigned()) {
                return true;
            }
            // Allow implicit conversions between enums and int32
            if (from.isEnum() && to == from.underlyingType(context)) {
                return true;
            }
            if (!node.intValue) {
                return true;
            }
            // Only allow lossless conversions implicitly
            if (kind == type_2.ConversionKind.EXPLICIT || from.symbol.byteSize < to.symbol.byteSize ||
                node.kind == node_9.NodeKind.INT32 && (to.isUnsigned()
                    ? node.intValue >= 0 && node.intValue <= const_1.MAX_UINT32_VALUE
                    : node.intValue >= const_1.MIN_INT32_VALUE && node.intValue <= const_1.MAX_INT32_VALUE)) {
                return true;
            }
            return false;
        }
        else if (from.isInteger() && to.isLong()) {
            if (kind == type_2.ConversionKind.IMPLICIT) {
                return false;
            }
            return true;
        }
        else if (from.isInteger() && to.isFloat()) {
            if (kind == type_2.ConversionKind.IMPLICIT) {
                return false;
            }
            //TODO Allow only lossless conversions implicitly
            return true;
        }
        else if (from.isInteger() && to.isDouble()) {
            if (kind == type_2.ConversionKind.IMPLICIT) {
                return false;
            }
            //TODO Allow only lossless conversions implicitly
            return true;
        }
        else if (from.isFloat() && to.isInteger()) {
            if (kind == type_2.ConversionKind.IMPLICIT) {
                return false;
            }
            //TODO Allow only lossless conversions implicitly
            return true;
        }
        else if (from.isFloat() && to.isDouble()) {
            return true;
        }
        else if (from.isDouble() && to.isFloat()) {
            if (kind == type_2.ConversionKind.IMPLICIT) {
                return false;
            }
            //TODO Allow only lossless conversions implicitly
            return true;
        }
        else if (from.isDouble() && to.isInteger()) {
            if (kind == type_2.ConversionKind.IMPLICIT) {
                return false;
            }
            //TODO Allow only lossless conversions implicitly
            return true;
        }
        else if (from.isFloat() && to.isFloat()) {
            return true;
        }
        else if (from.isDouble() && to.isDouble()) {
            return true;
        }
        return false;
    }
    exports_20("canConvert", canConvert);
    function checkConversion(context, node, to, kind) {
        if (!canConvert(context, node, to, kind)) {
            context.log.error(node.range, stringbuilder_11.StringBuilder_new()
                .append("Cannot convert from type '")
                .append(node.resolvedType.toString())
                .append("' to type '")
                .append(to.toString())
                .append(kind == type_2.ConversionKind.IMPLICIT && canConvert(context, node, to, type_2.ConversionKind.EXPLICIT) ? "' without a cast" : "'")
                .finish());
            node.resolvedType = context.errorType;
        }
    }
    exports_20("checkConversion", checkConversion);
    function checkStorage(context, target) {
        assert(node_9.isExpression(target));
        if (target.resolvedType != context.errorType && target.kind != node_9.NodeKind.INDEX && target.kind != node_9.NodeKind.DEREFERENCE &&
            (target.kind != node_9.NodeKind.NAME && target.kind != node_9.NodeKind.DOT || target.symbol != null && (!symbol_8.isVariable(target.symbol.kind) || target.symbol.kind == symbol_8.SymbolKind.VARIABLE_CONSTANT))) {
            context.log.error(target.range, "Cannot store to this location");
            target.resolvedType = context.errorType;
        }
    }
    exports_20("checkStorage", checkStorage);
    function createDefaultValueForType(context, type) {
        if (type.isLong()) {
            return node_9.createLong(0);
        }
        else if (type.isInteger()) {
            return node_9.createInt(0);
        }
        else if (type.isDouble()) {
            return node_9.createDouble(0);
        }
        else if (type.isFloat()) {
            return node_9.createFloat(0);
        }
        if (type == context.booleanType) {
            return node_9.createboolean(false);
        }
        if (type.isClass()) {
            return node_9.createNull();
        }
        assert(type.isReference());
        return node_9.createNull();
    }
    exports_20("createDefaultValueForType", createDefaultValueForType);
    function simplifyBinary(node) {
        let left = node.binaryLeft();
        let right = node.binaryRight();
        // Canonicalize commutative operators
        if ((node.kind == node_9.NodeKind.ADD || node.kind == node_9.NodeKind.MULTIPLY ||
            node.kind == node_9.NodeKind.BITWISE_AND || node.kind == node_9.NodeKind.BITWISE_OR || node.kind == node_9.NodeKind.BITWISE_XOR) &&
            left.kind == node_9.NodeKind.INT32 && right.kind != node_9.NodeKind.INT32) {
            node.appendChild(left.remove());
            left = node.binaryLeft();
            right = node.binaryRight();
        }
        // Convert multiplication or division by a power of 2 into a shift
        if ((node.kind == node_9.NodeKind.MULTIPLY || (node.kind == node_9.NodeKind.DIVIDE || node.kind == node_9.NodeKind.REMAINDER) && node.resolvedType.isUnsigned()) &&
            right.kind == node_9.NodeKind.INT32 && imports_3.isPositivePowerOf2(right.intValue)) {
            // Extract the shift from the value
            let shift = -1;
            let value = right.intValue;
            while (value != 0) {
                value = value >> 1;
                shift = shift + 1;
            }
            // "x * 16" => "x << 4"
            if (node.kind == node_9.NodeKind.MULTIPLY) {
                node.kind = node_9.NodeKind.SHIFT_LEFT;
                right.intValue = shift;
            }
            else if (node.kind == node_9.NodeKind.DIVIDE) {
                node.kind = node_9.NodeKind.SHIFT_RIGHT;
                right.intValue = shift;
            }
            else if (node.kind == node_9.NodeKind.REMAINDER) {
                node.kind = node_9.NodeKind.BITWISE_AND;
                right.intValue = right.intValue - 1;
            }
            else {
                assert(false);
            }
        }
        else if (node.kind == node_9.NodeKind.ADD && right.kind == node_9.NodeKind.NEGATIVE) {
            node.kind = node_9.NodeKind.SUBTRACT;
            right.replaceWith(right.unaryValue().remove());
        }
        else if (node.kind == node_9.NodeKind.ADD && right.isNegativeInteger()) {
            node.kind = node_9.NodeKind.SUBTRACT;
            right.intValue = -right.intValue;
        }
    }
    exports_20("simplifyBinary", simplifyBinary);
    function binaryHasUnsignedArguments(node) {
        let left = node.binaryLeft();
        let right = node.binaryRight();
        let leftType = left.resolvedType;
        let rightType = right.resolvedType;
        return leftType.isUnsigned() && rightType.isUnsigned() || leftType.isUnsigned() && right.isNonNegativeInteger() ||
            left.isNonNegativeInteger() && rightType.isUnsigned();
    }
    exports_20("binaryHasUnsignedArguments", binaryHasUnsignedArguments);
    function isBinaryLong(node) {
        let left = node.binaryLeft();
        let right = node.binaryRight();
        let leftType = left.resolvedType;
        let rightType = right.resolvedType;
        return leftType.isLong() || rightType.isLong();
    }
    exports_20("isBinaryLong", isBinaryLong);
    function isBinaryDouble(node) {
        let left = node.binaryLeft();
        let right = node.binaryRight();
        let leftType = left.resolvedType;
        let rightType = right.resolvedType;
        return leftType.isDouble() || rightType.isDouble();
    }
    exports_20("isBinaryDouble", isBinaryDouble);
    function isSymbolAccessAllowed(context, symbol, node, range) {
        if (symbol.isUnsafe() && !context.isUnsafeAllowed) {
            context.log.error(range, stringbuilder_11.StringBuilder_new()
                .append("Cannot use symbol '")
                .append(symbol.name)
                .append("' outside an 'unsafe' block")
                .finish());
            return false;
        }
        if (symbol.node != null && symbol.node.isPrivate()) {
            let parent = symbol.parent();
            if (parent != null && context.enclosingClass != parent) {
                context.log.error(range, stringbuilder_11.StringBuilder_new()
                    .append("Cannot access private symbol '")
                    .append(symbol.name)
                    .append("' here")
                    .finish());
                return false;
            }
        }
        if (symbol_8.isFunction(symbol.kind) && (symbol.isSetter() ? !node.isAssignTarget() : !node.isCallValue())) {
            if (symbol.isSetter()) {
                context.log.error(range, stringbuilder_11.StringBuilder_new()
                    .append("Cannot use setter '")
                    .append(symbol.name)
                    .append("' here")
                    .finish());
            }
            else {
                context.log.error(range, stringbuilder_11.StringBuilder_new()
                    .append("Must call function '")
                    .append(symbol.name)
                    .appendChar('\'')
                    .finish());
            }
            return false;
        }
        return true;
    }
    exports_20("isSymbolAccessAllowed", isSymbolAccessAllowed);
    function resolve(context, node, parentScope) {
        let kind = node.kind;
        assert(kind == node_9.NodeKind.FILE || parentScope != null);
        if (node.resolvedType != null) {
            return;
        }
        node.resolvedType = context.errorType;
        if (kind == node_9.NodeKind.FILE || kind == node_9.NodeKind.GLOBAL) {
            resolveChildren(context, node, parentScope);
        }
        else if (kind == node_9.NodeKind.MODULE) {
            let oldEnclosingModule = context.enclosingModule;
            initializeSymbol(context, node.symbol);
            context.enclosingModule = node.symbol;
            resolveChildren(context, node, node.scope);
            // if (node.symbol.kind == SymbolKind.TYPE_MODULE) {
            //     node.symbol.determineClassLayout(context);
            // }
            context.enclosingModule = oldEnclosingModule;
        }
        else if (kind == node_9.NodeKind.EXTERNAL_IMPORT) {
            let symbol = node.symbol;
        }
        else if (kind == node_9.NodeKind.CLASS) {
            let oldEnclosingClass = context.enclosingClass;
            initializeSymbol(context, node.symbol);
            context.enclosingClass = node.symbol;
            resolveChildren(context, node, node.scope);
            if (node.symbol.kind == symbol_8.SymbolKind.TYPE_CLASS) {
                node.symbol.determineClassLayout(context);
            }
            context.enclosingClass = oldEnclosingClass;
        }
        else if (kind == node_9.NodeKind.ENUM) {
            initializeSymbol(context, node.symbol);
            resolveChildren(context, node, node.scope);
        }
        else if (kind == node_9.NodeKind.FUNCTION) {
            let body = node.functionBody();
            initializeSymbol(context, node.symbol);
            if (node.stringValue == "constructor" && node.parent.kind == node_9.NodeKind.CLASS) {
                node.parent.constructorFunctionNode = node;
            }
            if (body != null) {
                let oldReturnType = context.currentReturnType;
                let oldUnsafeAllowed = context.isUnsafeAllowed;
                let returnType = node.functionReturnType();
                if (returnType.resolvedType.isTemplate() && returnType.hasParameters() && node.parent != returnType.resolvedType.symbol.node) {
                    deriveConcreteClass(context, returnType, [returnType.firstChild.firstChild], returnType.resolvedType.symbol.scope);
                }
                context.currentReturnType = returnType.resolvedType;
                context.isUnsafeAllowed = node.isUnsafe();
                resolveChildren(context, body, node.scope);
                if (oldReturnType && oldReturnType.isTemplate() && returnType.hasParameters() && node.parent != oldReturnType.symbol.node) {
                    deriveConcreteClass(context, returnType, [returnType.firstChild.firstChild], oldReturnType.symbol.scope);
                }
                // if (oldReturnType && oldReturnType.isTemplate() && !oldReturnType.symbol.node.hasParameters()) {
                //     deriveConcreteClass(context, oldReturnType.symbol.node, [oldReturnType.symbol.node.firstChild], oldReturnType.symbol.scope);
                // }
                context.currentReturnType = oldReturnType;
                context.isUnsafeAllowed = oldUnsafeAllowed;
            }
        }
        else if (kind == node_9.NodeKind.PARAMETER) {
            let symbol = node.symbol;
        }
        else if (kind == node_9.NodeKind.VARIABLE) {
            let symbol = node.symbol;
            initializeSymbol(context, symbol);
            let oldUnsafeAllowed = context.isUnsafeAllowed;
            context.isUnsafeAllowed = context.isUnsafeAllowed || node.isUnsafe();
            let value = node.variableValue();
            if (value != null) {
                resolveAsExpression(context, value, parentScope);
                checkConversion(context, value, symbol.resolvedTypeUnderlyingIfEnumValue(context), type_2.ConversionKind.IMPLICIT);
                if (symbol.resolvedType != value.resolvedType) {
                    value.becomeValueTypeOf(symbol, context);
                }
                // Variable initializers must be compile-time constants
                if (symbol.kind == symbol_8.SymbolKind.VARIABLE_GLOBAL && value.kind != node_9.NodeKind.INT32 && value.kind != node_9.NodeKind.BOOLEAN && value.kind != node_9.NodeKind.NULL) {
                    //context.log.error(value.range, "Global initializers must be compile-time constants");
                }
            }
            else if (symbol.resolvedType != context.errorType) {
                value = createDefaultValueForType(context, symbol.resolvedType);
                resolveAsExpression(context, value, parentScope);
                node.appendChild(value);
            }
            // Allocate global variables
            if (symbol.kind == symbol_8.SymbolKind.VARIABLE_GLOBAL && symbol.resolvedType != context.errorType) {
                symbol.offset = context.allocateGlobalVariableOffset(symbol.resolvedType.variableSizeOf(context), symbol.resolvedType.variableAlignmentOf(context));
            }
            context.isUnsafeAllowed = oldUnsafeAllowed;
        }
        else if (kind == node_9.NodeKind.BREAK || kind == node_9.NodeKind.CONTINUE) {
            let found = false;
            let n = node;
            while (n != null) {
                if (n.kind == node_9.NodeKind.WHILE) {
                    found = true;
                    break;
                }
                n = n.parent;
            }
            if (!found) {
                context.log.error(node.range, "Cannot use this statement outside of a loop");
            }
        }
        else if (kind == node_9.NodeKind.BLOCK) {
            let oldUnsafeAllowed = context.isUnsafeAllowed;
            if (node.isUnsafe())
                context.isUnsafeAllowed = true;
            resolveChildren(context, node, node.scope);
            context.isUnsafeAllowed = oldUnsafeAllowed;
        }
        else if (kind == node_9.NodeKind.IMPORTS || kind == node_9.NodeKind.CONSTANTS || kind == node_9.NodeKind.VARIABLES) {
            resolveChildren(context, node, parentScope);
        }
        else if (kind == node_9.NodeKind.ANY) {
            //imported functions have anyType
            node.kind = node_9.NodeKind.TYPE;
            node.resolvedType = context.anyType;
        }
        else if (kind == node_9.NodeKind.INT32) {
            // Use the positive flag to differentiate between -2147483648 and 2147483648
            node.resolvedType = node.intValue < 0 && !node.isPositive() ? context.uint32Type : context.int32Type;
        }
        else if (kind == node_9.NodeKind.INT64) {
            node.resolvedType = node.intValue < 0 && !node.isPositive() ? context.uint64Type : context.int64Type;
        }
        else if (kind == node_9.NodeKind.FLOAT32) {
            node.resolvedType = context.float32Type;
        }
        else if (kind == node_9.NodeKind.FLOAT64) {
            node.resolvedType = context.float64Type;
        }
        else if (kind == node_9.NodeKind.STRING) {
            node.resolvedType = context.stringType;
        }
        else if (kind == node_9.NodeKind.BOOLEAN) {
            node.resolvedType = context.booleanType;
        }
        else if (kind == node_9.NodeKind.NULL) {
            node.resolvedType = context.nullType;
        }
        else if (kind == node_9.NodeKind.INDEX) {
            resolveChildrenAsExpressions(context, node, parentScope);
            let target = node.indexTarget();
            let type = target.resolvedType;
            if (type != context.errorType) {
                let symbol = type.hasInstanceMembers() ? type.findMember("[]", scope_2.ScopeHint.NORMAL) : null;
                if (symbol == null) {
                    context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                        .append("Cannot index into type '")
                        .append(target.resolvedType.toString())
                        .appendChar('\'')
                        .finish());
                }
                else {
                    assert(symbol.kind == symbol_8.SymbolKind.FUNCTION_INSTANCE || symbol.kind == symbol_8.SymbolKind.FUNCTION_GLOBAL && symbol.shouldConvertInstanceToGlobal());
                    // Convert to a regular function call and resolve that instead
                    node.kind = node_9.NodeKind.CALL;
                    target.remove();
                    node.insertChildBefore(node.firstChild, node_9.createMemberReference(target, symbol));
                    node.resolvedType = null;
                    resolveAsExpression(context, node, parentScope);
                }
            }
        }
        else if (kind == node_9.NodeKind.ALIGN_OF) {
            let type = node.alignOfType();
            resolveAsType(context, type, parentScope);
            node.resolvedType = context.int32Type;
            if (type.resolvedType != context.errorType) {
                node.becomeIntegerConstant(type.resolvedType.allocationAlignmentOf(context));
            }
        }
        else if (kind == node_9.NodeKind.SIZE_OF) {
            let type = node.sizeOfType();
            resolveAsType(context, type, parentScope);
            node.resolvedType = context.int32Type;
            if (type.resolvedType != context.errorType) {
                node.becomeIntegerConstant(type.resolvedType.allocationSizeOf(context));
            }
        }
        else if (kind == node_9.NodeKind.THIS) {
            let symbol = parentScope.findNested("this", scope_2.ScopeHint.NORMAL, scope_2.FindNested.NORMAL);
            if (symbol == null) {
                context.log.error(node.range, "Cannot use 'this' here");
            }
            else {
                node.becomeSymbolReference(symbol);
            }
        }
        else if (kind == node_9.NodeKind.PARSE_ERROR) {
            node.resolvedType = context.errorType;
        }
        else if (kind == node_9.NodeKind.NAME) {
            let name = node.stringValue;
            let symbol = parentScope.findNested(name, scope_2.ScopeHint.NORMAL, scope_2.FindNested.NORMAL);
            if (symbol == null) {
                let builder = stringbuilder_11.StringBuilder_new()
                    .append("No symbol named '")
                    .append(name)
                    .append("' here");
                // In JavaScript, "this." before instance symbols is required
                symbol = parentScope.findNested(name, scope_2.ScopeHint.NORMAL, scope_2.FindNested.ALLOW_INSTANCE_ERRORS);
                if (symbol != null) {
                    builder
                        .append(", did you mean 'this.")
                        .append(symbol.name)
                        .append("'?");
                }
                else if (name == "number")
                    builder.append(", you cannot use generic number type from TypeScript!");
                else if (name == "bool")
                    builder.append(", did you mean 'boolean'?");
                context.log.error(node.range, builder.finish());
            }
            else if (symbol.state == symbol_8.SymbolState.INITIALIZING) {
                context.log.error(node.range, stringbuilder_11.StringBuilder_new()
                    .append("Cyclic reference to symbol '")
                    .append(name)
                    .append("' here")
                    .finish());
            }
            else if (isSymbolAccessAllowed(context, symbol, node, node.range)) {
                initializeSymbol(context, symbol);
                node.symbol = symbol;
                node.resolvedType = symbol.resolvedType;
                if (node.resolvedType.isGeneric()) {
                    node.flags |= node_9.NODE_FLAG_GENERIC;
                }
                // Inline constants
                if (symbol.kind == symbol_8.SymbolKind.VARIABLE_CONSTANT) {
                    if (symbol.resolvedType == context.booleanType) {
                        node.becomebooleaneanConstant(symbol.offset != 0);
                    }
                    else if (symbol.resolvedType == context.float32Type) {
                        node.becomeFloatConstant(symbol.offset);
                    }
                    else if (symbol.resolvedType == context.float64Type) {
                        node.becomeDoubleConstant(symbol.offset);
                    }
                    else if (symbol.resolvedType == context.int64Type) {
                        node.becomeLongConstant(symbol.offset);
                    }
                    else {
                        node.becomeIntegerConstant(symbol.offset);
                    }
                }
            }
        }
        else if (kind == node_9.NodeKind.CAST) {
            let value = node.castValue();
            let type = node.castType();
            resolveAsExpression(context, value, parentScope);
            resolveAsType(context, type, parentScope);
            let castedType = type.resolvedType;
            checkConversion(context, value, castedType, type_2.ConversionKind.EXPLICIT);
            node.resolvedType = castedType;
            // Automatically fold constants
            if (value.kind == node_9.NodeKind.INT32 && castedType.isInteger()) {
                let result = value.intValue;
                let shift = 32 - castedType.integerBitCount(context);
                node.becomeIntegerConstant(castedType.isUnsigned()
                    ? castedType.integerBitMask(context) & result
                    : result << shift >> shift);
            }
            else if (value.kind == node_9.NodeKind.INT32 && castedType.isFloat()) {
                node.becomeFloatConstant(value.intValue);
            }
            else if (value.kind == node_9.NodeKind.INT32 && castedType.isDouble()) {
                node.becomeDoubleConstant(value.intValue);
            }
            else if (value.kind == node_9.NodeKind.FLOAT32 && castedType.isInteger()) {
                node.becomeIntegerConstant(Math.round(value.floatValue));
            }
        }
        else if (kind == node_9.NodeKind.DOT) {
            let target = node.dotTarget();
            resolve(context, target, parentScope);
            if (target.resolvedType != context.errorType) {
                if (target.isType() && (target.resolvedType.isEnum() || target.resolvedType.hasInstanceMembers()) ||
                    !target.isType() && target.resolvedType.hasInstanceMembers()) {
                    let name = node.stringValue;
                    // Empty names are left over from parse errors that have already been reported
                    if (name.length > 0) {
                        let symbol = target.resolvedType.findMember(name, node.isAssignTarget() ? scope_2.ScopeHint.PREFER_SETTER : scope_2.ScopeHint.PREFER_GETTER);
                        if (symbol == null) {
                            context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                                .append("No member named '")
                                .append(name)
                                .append("' on type '")
                                .append(target.resolvedType.toString())
                                .appendChar('\'')
                                .finish());
                        }
                        else if (symbol.isGetter()) {
                            node.kind = node_9.NodeKind.CALL;
                            node.appendChild(node_9.createMemberReference(target.remove(), symbol));
                            node.resolvedType = null;
                            resolveAsExpression(context, node, parentScope);
                            return;
                        }
                        else if (isSymbolAccessAllowed(context, symbol, node, node.internalRange)) {
                            initializeSymbol(context, symbol);
                            node.symbol = symbol;
                            node.resolvedType = symbol.resolvedType;
                            // Inline constants
                            if (symbol.kind == symbol_8.SymbolKind.VARIABLE_CONSTANT) {
                                node.becomeIntegerConstant(symbol.offset);
                            }
                        }
                    }
                }
                else {
                    context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                        .append("The type '")
                        .append(target.resolvedType.toString())
                        .append("' has no members")
                        .finish());
                }
            }
        }
        else if (kind == node_9.NodeKind.CALL) {
            let value = node.callValue();
            resolveAsExpression(context, value, parentScope);
            if (value.resolvedType != context.errorType) {
                let symbol = value.symbol;
                // Only functions are callable
                if (symbol == null || !symbol_8.isFunction(symbol.kind)) {
                    context.log.error(value.range, stringbuilder_11.StringBuilder_new()
                        .append("Cannot call value of type '")
                        .append(value.resolvedType.toString())
                        .appendChar('\'')
                        .finish());
                }
                else {
                    initializeSymbol(context, symbol);
                    if (symbol.shouldConvertInstanceToGlobal()) {
                        let name = node_9.createSymbolReference(symbol);
                        node.insertChildBefore(value, name.withRange(value.internalRange));
                        node.insertChildBefore(value, value.dotTarget().remove());
                        value.remove();
                        value = name;
                    }
                    let returnType = symbol.node.functionReturnType();
                    let argumentVariable = symbol.node.functionFirstArgumentIgnoringThis();
                    let argumentValue = value.nextSibling;
                    // Match argument values with variables
                    while (argumentVariable != returnType && argumentValue != null) {
                        resolveAsExpression(context, argumentValue, parentScope);
                        checkConversion(context, argumentValue, argumentVariable.symbol.resolvedType, type_2.ConversionKind.IMPLICIT);
                        argumentVariable = argumentVariable.nextSibling;
                        argumentValue = argumentValue.nextSibling;
                    }
                    // Not enough arguments?
                    if (returnType.resolvedType != context.anyType) {
                        if (argumentVariable != returnType && !argumentVariable.hasVariableValue()) {
                            context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                                .append("Not enough arguments for function '")
                                .append(symbol.name)
                                .appendChar('\'')
                                .finish());
                        }
                        else if (argumentValue != null) {
                            while (argumentValue != null) {
                                resolveAsExpression(context, argumentValue, parentScope);
                                argumentValue = argumentValue.nextSibling;
                            }
                            context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                                .append("Too many arguments for function '")
                                .append(symbol.name)
                                .appendChar('\'')
                                .finish());
                        }
                    }
                    if (returnType.resolvedType.isArray()) {
                        console.log(returnType);
                        //let mappedType = returnType.getMappedGenericType(node.firstChild.firstChild.symbol.name);
                        //if (mappedType) {
                        //returnType = mappedType;
                        //}
                    }
                    // Pass the return type along
                    node.resolvedType = returnType.resolvedType;
                }
            }
        }
        else if (kind == node_9.NodeKind.DELETE) {
            let value = node.deleteType();
            if (value != null) {
                resolveAsExpression(context, value, parentScope);
                if (value.resolvedType == null || value.resolvedType == context.voidType) {
                    context.log.error(value.range, "Unexpected delete value 'void'");
                }
            }
            else {
                context.log.error(node.range, stringbuilder_11.StringBuilder_new()
                    .append("Expected delete value '")
                    .append(context.currentReturnType.toString())
                    .appendChar('\'')
                    .finish());
            }
        }
        else if (kind == node_9.NodeKind.RETURN) {
            let value = node.returnValue();
            if (value != null) {
                resolveAsExpression(context, value, parentScope);
                if (context.currentReturnType != null) {
                    if (context.currentReturnType != context.voidType) {
                        if (value.resolvedType.isTemplate() && value.hasParameters() && node.parent != value.resolvedType.symbol.node) {
                            deriveConcreteClass(context, value, [value.firstChild.firstChild], value.resolvedType.symbol.scope);
                        }
                        checkConversion(context, value, context.currentReturnType, type_2.ConversionKind.IMPLICIT);
                    }
                    else {
                        context.log.error(value.range, "Unexpected return value in function returning 'void'");
                    }
                }
            }
            else if (context.currentReturnType != null && context.currentReturnType != context.voidType) {
                context.log.error(node.range, stringbuilder_11.StringBuilder_new()
                    .append("Expected return value in function returning '")
                    .append(context.currentReturnType.toString())
                    .appendChar('\'')
                    .finish());
            }
        }
        else if (kind == node_9.NodeKind.EMPTY) {
        }
        else if (kind == node_9.NodeKind.PARAMETERS) {
            // resolveAsType(context, node.genericType(), parentScope);
            // resolveAsExpression(context, node.expressionValue(), parentScope);
            // context.log.error(node.range, "Generics are not implemented yet");
        }
        else if (kind == node_9.NodeKind.EXTENDS) {
            resolveAsType(context, node.extendsType(), parentScope);
            //context.log.error(node.range, "Subclassing is not implemented yet");
        }
        else if (kind == node_9.NodeKind.IMPLEMENTS) {
            let child = node.firstChild;
            while (child != null) {
                resolveAsType(context, child, parentScope);
                child = child.nextSibling;
            }
            context.log.error(node.range, "Interfaces are not implemented yet");
        }
        else if (kind == node_9.NodeKind.EXPRESSION) {
            resolveAsExpression(context, node.expressionValue(), parentScope);
        }
        else if (kind == node_9.NodeKind.WHILE) {
            let value = node.whileValue();
            let body = node.whileBody();
            resolveAsExpression(context, value, parentScope);
            checkConversion(context, value, context.booleanType, type_2.ConversionKind.IMPLICIT);
            resolve(context, body, parentScope);
        }
        else if (kind == node_9.NodeKind.IF) {
            let value = node.ifValue();
            let yes = node.ifTrue();
            let no = node.ifFalse();
            resolveAsExpression(context, value, parentScope);
            checkConversion(context, value, context.booleanType, type_2.ConversionKind.IMPLICIT);
            resolve(context, yes, parentScope);
            if (no != null) {
                resolve(context, no, parentScope);
            }
        }
        else if (kind == node_9.NodeKind.HOOK) {
            let value = node.hookValue();
            let yes = node.hookTrue();
            let no = node.hookFalse();
            resolveAsExpression(context, value, parentScope);
            checkConversion(context, value, context.booleanType, type_2.ConversionKind.IMPLICIT);
            resolve(context, yes, parentScope);
            resolve(context, no, parentScope);
            checkConversion(context, yes, no.resolvedType, type_2.ConversionKind.IMPLICIT);
            let commonType = (yes.resolvedType == context.nullType ? no : yes).resolvedType;
            if (yes.resolvedType != commonType && (yes.resolvedType != context.nullType || !commonType.isReference()) &&
                no.resolvedType != commonType && (no.resolvedType != context.nullType || !commonType.isReference())) {
                context.log.error(log_5.spanRanges(yes.range, no.range), stringbuilder_11.StringBuilder_new()
                    .append("Type '")
                    .append(yes.resolvedType.toString())
                    .append("' is not the same as type '")
                    .append(no.resolvedType.toString())
                    .appendChar('\'')
                    .finish());
            }
            node.resolvedType = commonType;
        }
        else if (kind == node_9.NodeKind.ASSIGN) {
            let left = node.binaryLeft();
            let right = node.binaryRight();
            if (left.kind == node_9.NodeKind.INDEX) {
                resolveChildrenAsExpressions(context, left, parentScope);
                let target = left.indexTarget();
                let type = target.resolvedType;
                if (type != context.errorType) {
                    let symbol = type.hasInstanceMembers() ? type.findMember("[]=", scope_2.ScopeHint.NORMAL) : null;
                    if (symbol == null) {
                        context.log.error(left.internalRange, stringbuilder_11.StringBuilder_new()
                            .append("Cannot index into type '")
                            .append(target.resolvedType.toString())
                            .appendChar('\'')
                            .finish());
                    }
                    else {
                        assert(symbol.kind == symbol_8.SymbolKind.FUNCTION_INSTANCE);
                        // Convert to a regular function call and resolve that instead
                        node.kind = node_9.NodeKind.CALL;
                        target.remove();
                        left.remove();
                        while (left.lastChild != null) {
                            node.insertChildBefore(node.firstChild, left.lastChild.remove());
                        }
                        node.insertChildBefore(node.firstChild, node_9.createMemberReference(target, symbol));
                        node.internalRange = log_5.spanRanges(left.internalRange, right.range);
                        node.resolvedType = null;
                        resolveAsExpression(context, node, parentScope);
                        return;
                    }
                }
            }
            resolveAsExpression(context, left, parentScope);
            // Automatically call setters
            if (left.symbol != null && left.symbol.isSetter()) {
                node.kind = node_9.NodeKind.CALL;
                node.internalRange = left.internalRange;
                node.resolvedType = null;
                resolveAsExpression(context, node, parentScope);
                return;
            }
            resolveAsExpression(context, right, parentScope);
            checkConversion(context, right, left.resolvedType, type_2.ConversionKind.IMPLICIT);
            checkStorage(context, left);
            node.resolvedType = left.resolvedType;
        }
        else if (kind == node_9.NodeKind.NEW) {
            let type = node.newType();
            resolveAsType(context, type, parentScope);
            if (type.resolvedType.isTemplate() && type.hasParameters() && node.parent != type.resolvedType.symbol.node) {
                deriveConcreteClass(context, type, [type.firstChild.firstChild], type.resolvedType.symbol.scope);
            }
            if (type.resolvedType != context.errorType) {
                if (!type.resolvedType.isClass()) {
                    context.log.error(type.range, stringbuilder_11.StringBuilder_new()
                        .append("Cannot construct type '")
                        .append(type.resolvedType.toString())
                        .appendChar('\'')
                        .finish());
                }
                else {
                    node.resolvedType = type.resolvedType;
                }
            }
            //Constructors arguments
            let child = type.nextSibling;
            let constructorNode = node.constructorNode();
            let argumentVariable = constructorNode.functionFirstArgumentIgnoringThis();
            while (child != null) {
                resolveAsExpression(context, child, parentScope);
                checkConversion(context, child, argumentVariable.symbol.resolvedType, type_2.ConversionKind.IMPLICIT);
                child = child.nextSibling;
                argumentVariable = argumentVariable.nextSibling;
            }
            // Match argument values with variables
            // while (argumentVariable != returnType && argumentValue != null) {
            //     resolveAsExpression(context, argumentValue, parentScope);
            //     checkConversion(context, argumentValue, argumentVariable.symbol.resolvedType, ConversionKind.IMPLICIT);
            //     argumentVariable = argumentVariable.nextSibling;
            //     argumentValue = argumentValue.nextSibling;
            // }
        }
        else if (kind == node_9.NodeKind.POINTER_TYPE) {
            let value = node.unaryValue();
            resolveAsType(context, value, parentScope);
            if (context.target == compiler_3.CompileTarget.JAVASCRIPT) {
                context.log.error(node.internalRange, "Cannot use pointers when compiling to JavaScript");
            }
            else {
                let type = value.resolvedType;
                if (type != context.errorType) {
                    // if ((!type.isInteger() && !type.symbol.node.isTurbo()) && type.pointerTo == null) {
                    //     context.log.error(node.internalRange, StringBuilder_new()
                    //         .append("Cannot create a pointer to non-integer type '")
                    //         .append(type.toString())
                    //         .appendChar('\'')
                    //         .finish());
                    // }
                    //
                    // else {
                    node.resolvedType = type.pointerType();
                    // }
                }
            }
        }
        else if (kind == node_9.NodeKind.DEREFERENCE) {
            let value = node.unaryValue();
            resolveAsExpression(context, value, parentScope);
            let type = value.resolvedType;
            if (type != context.errorType) {
                if (type.pointerTo == null) {
                    context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                        .append("Cannot dereference type '")
                        .append(type.toString())
                        .appendChar('\'')
                        .finish());
                }
                else {
                    node.resolvedType = type.pointerTo;
                }
            }
        }
        else if (kind == node_9.NodeKind.ADDRESS_OF) {
            let value = node.unaryValue();
            resolveAsExpression(context, value, parentScope);
            context.log.error(node.internalRange, "The address-of operator is not supported");
        }
        else if (node_9.isUnary(kind)) {
            let value = node.unaryValue();
            resolveAsExpression(context, value, parentScope);
            // Operator "!" is hard-coded
            if (kind == node_9.NodeKind.NOT) {
                checkConversion(context, value, context.booleanType, type_2.ConversionKind.IMPLICIT);
                node.resolvedType = context.booleanType;
            }
            else if (value.resolvedType.isInteger()) {
                if (value.resolvedType.isUnsigned()) {
                    node.flags = node.flags | node_9.NODE_FLAG_UNSIGNED_OPERATOR;
                    node.resolvedType = context.uint32Type;
                }
                else {
                    node.resolvedType = context.int32Type;
                }
                // Automatically fold constants
                if (value.kind == node_9.NodeKind.INT32) {
                    let input = value.intValue;
                    let output = input;
                    if (kind == node_9.NodeKind.COMPLEMENT)
                        output = ~input;
                    else if (kind == node_9.NodeKind.NEGATIVE)
                        output = -input;
                    node.becomeIntegerConstant(output);
                }
            }
            else if (value.resolvedType.isDouble()) {
                node.resolvedType = context.float64Type;
                // Automatically fold constants
                if (value.kind == node_9.NodeKind.FLOAT64) {
                    let input = value.doubleValue;
                    let output = input;
                    if (kind == node_9.NodeKind.COMPLEMENT)
                        output = ~input;
                    else if (kind == node_9.NodeKind.NEGATIVE)
                        output = -input;
                    node.becomeDoubleConstant(output);
                }
            }
            else if (value.resolvedType.isFloat()) {
                node.resolvedType = context.float32Type;
                // Automatically fold constants
                if (value.kind == node_9.NodeKind.FLOAT32) {
                    let input = value.floatValue;
                    let output = input;
                    if (kind == node_9.NodeKind.COMPLEMENT)
                        output = ~input;
                    else if (kind == node_9.NodeKind.NEGATIVE)
                        output = -input;
                    node.becomeFloatConstant(output);
                }
            }
            else if (value.resolvedType != context.errorType) {
                let name = node.internalRange.toString();
                let symbol = value.resolvedType.findMember(name, scope_2.ScopeHint.NOT_BINARY);
                // Automatically call the function
                if (symbol != null) {
                    node.appendChild(node_9.createMemberReference(value.remove(), symbol).withRange(node.range).withInternalRange(node.internalRange));
                    node.kind = node_9.NodeKind.CALL;
                    node.resolvedType = null;
                    resolveAsExpression(context, node, parentScope);
                }
                else {
                    context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                        .append("Cannot use unary operator '")
                        .append(name)
                        .append("' with type '")
                        .append(value.resolvedType.toString())
                        .appendChar('\'')
                        .finish());
                }
            }
        }
        else if (node_9.isBinary(kind)) {
            let left = node.binaryLeft();
            let right = node.binaryRight();
            resolveAsExpression(context, left, parentScope);
            resolveAsExpression(context, right, parentScope);
            let leftType = left.resolvedType;
            if ((leftType.isDouble() && right.resolvedType.isFloat()) ||
                (leftType.isLong() && right.resolvedType.isInteger())) {
                right.becomeTypeOf(left, context);
            }
            let rightType = right.resolvedType;
            // Operators "&&" and "||" are hard-coded
            if (kind == node_9.NodeKind.LOGICAL_OR || kind == node_9.NodeKind.LOGICAL_AND) {
                checkConversion(context, left, context.booleanType, type_2.ConversionKind.IMPLICIT);
                checkConversion(context, right, context.booleanType, type_2.ConversionKind.IMPLICIT);
                node.resolvedType = context.booleanType;
            }
            else if (kind == node_9.NodeKind.ADD && leftType.pointerTo != null && rightType.isInteger()) {
                node.resolvedType = leftType;
            }
            else if ((kind == node_9.NodeKind.LESS_THAN || kind == node_9.NodeKind.LESS_THAN_EQUAL ||
                kind == node_9.NodeKind.GREATER_THAN || kind == node_9.NodeKind.GREATER_THAN_EQUAL) && (leftType.pointerTo != null || rightType.pointerTo != null)) {
                node.resolvedType = context.booleanType;
                // Both pointer types must be exactly the same
                if (leftType != rightType) {
                    context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                        .append("Cannot compare type '")
                        .append(leftType.toString())
                        .append("' with type '")
                        .append(rightType.toString())
                        .appendChar('\'')
                        .finish());
                }
            }
            else if ((leftType.isInteger() || leftType.isLong() ||
                leftType.isFloat() || leftType.isDouble() ||
                (leftType.isGeneric() && rightType.isGeneric())) &&
                kind != node_9.NodeKind.EQUAL && kind != node_9.NodeKind.NOT_EQUAL) {
                let isFloat = false;
                let isFloat64 = false;
                if (leftType.isFloat() || leftType.isDouble()) {
                    isFloat = true;
                    isFloat64 = leftType.isDouble();
                }
                let isUnsigned = binaryHasUnsignedArguments(node);
                // Arithmetic operators
                if (kind == node_9.NodeKind.ADD ||
                    kind == node_9.NodeKind.SUBTRACT ||
                    kind == node_9.NodeKind.MULTIPLY ||
                    kind == node_9.NodeKind.DIVIDE ||
                    kind == node_9.NodeKind.REMAINDER ||
                    kind == node_9.NodeKind.BITWISE_AND ||
                    kind == node_9.NodeKind.BITWISE_OR ||
                    kind == node_9.NodeKind.BITWISE_XOR ||
                    kind == node_9.NodeKind.SHIFT_LEFT ||
                    kind == node_9.NodeKind.SHIFT_RIGHT) {
                    let isLong = isBinaryLong(node);
                    let commonType;
                    if (isFloat) {
                        commonType = isBinaryDouble(node) ? context.float64Type : context.float32Type;
                    }
                    else {
                        commonType = isUnsigned ? (isLong ? context.uint64Type : context.uint32Type) : (isLong ? context.int64Type : context.int32Type);
                    }
                    if (isUnsigned) {
                        node.flags = node.flags | node_9.NODE_FLAG_UNSIGNED_OPERATOR;
                    }
                    checkConversion(context, left, commonType, type_2.ConversionKind.IMPLICIT);
                    checkConversion(context, right, commonType, type_2.ConversionKind.IMPLICIT);
                    node.resolvedType = commonType;
                    // Automatically fold constants
                    if ((left.kind == node_9.NodeKind.INT32 || left.kind == node_9.NodeKind.INT64) &&
                        (right.kind == node_9.NodeKind.INT32 || right.kind == node_9.NodeKind.INT64)) {
                        let inputLeft = left.intValue;
                        let inputRight = right.intValue;
                        let output = 0;
                        if (kind == node_9.NodeKind.ADD)
                            output = inputLeft + inputRight;
                        else if (kind == node_9.NodeKind.BITWISE_AND)
                            output = inputLeft & inputRight;
                        else if (kind == node_9.NodeKind.BITWISE_OR)
                            output = inputLeft | inputRight;
                        else if (kind == node_9.NodeKind.BITWISE_XOR)
                            output = inputLeft ^ inputRight;
                        else if (kind == node_9.NodeKind.DIVIDE)
                            output = inputLeft / inputRight;
                        else if (kind == node_9.NodeKind.MULTIPLY)
                            output = inputLeft * inputRight;
                        else if (kind == node_9.NodeKind.REMAINDER)
                            output = inputLeft % inputRight;
                        else if (kind == node_9.NodeKind.SHIFT_LEFT)
                            output = inputLeft << inputRight;
                        else if (kind == node_9.NodeKind.SHIFT_RIGHT)
                            output = isUnsigned ? ((inputLeft) >> (inputRight)) : inputLeft >> inputRight;
                        else if (kind == node_9.NodeKind.SUBTRACT)
                            output = inputLeft - inputRight;
                        else
                            return;
                        if (left.kind == node_9.NodeKind.INT32) {
                            node.becomeIntegerConstant(output);
                        }
                        else {
                            node.becomeLongConstant(output);
                        }
                    }
                    else if ((left.kind == node_9.NodeKind.FLOAT32 || left.kind == node_9.NodeKind.FLOAT64) &&
                        (right.kind == node_9.NodeKind.FLOAT32 || right.kind == node_9.NodeKind.FLOAT64)) {
                        let inputLeft = left.floatValue;
                        let inputRight = right.floatValue;
                        let output = 0;
                        if (kind == node_9.NodeKind.ADD)
                            output = inputLeft + inputRight;
                        else if (kind == node_9.NodeKind.BITWISE_AND)
                            output = inputLeft & inputRight;
                        else if (kind == node_9.NodeKind.BITWISE_OR)
                            output = inputLeft | inputRight;
                        else if (kind == node_9.NodeKind.BITWISE_XOR)
                            output = inputLeft ^ inputRight;
                        else if (kind == node_9.NodeKind.DIVIDE)
                            output = inputLeft / inputRight;
                        else if (kind == node_9.NodeKind.MULTIPLY)
                            output = inputLeft * inputRight;
                        else if (kind == node_9.NodeKind.REMAINDER)
                            output = inputLeft % inputRight;
                        else if (kind == node_9.NodeKind.SHIFT_LEFT)
                            output = inputLeft << inputRight;
                        else if (kind == node_9.NodeKind.SHIFT_RIGHT)
                            output = inputLeft >> inputRight;
                        else if (kind == node_9.NodeKind.SUBTRACT)
                            output = inputLeft - inputRight;
                        else
                            return;
                        if (left.kind == node_9.NodeKind.FLOAT32) {
                            node.becomeFloatConstant(output);
                        }
                        else {
                            node.becomeDoubleConstant(output);
                        }
                    }
                    else {
                        simplifyBinary(node);
                    }
                }
                else if (kind == node_9.NodeKind.LESS_THAN ||
                    kind == node_9.NodeKind.LESS_THAN_EQUAL ||
                    kind == node_9.NodeKind.GREATER_THAN ||
                    kind == node_9.NodeKind.GREATER_THAN_EQUAL) {
                    let expectedType = isFloat ? (isFloat64 ? context.float64Type : context.float32Type) : (isUnsigned ? context.uint32Type : context.int32Type);
                    if (isUnsigned) {
                        node.flags = node.flags | node_9.NODE_FLAG_UNSIGNED_OPERATOR;
                    }
                    if (leftType != rightType) {
                        checkConversion(context, left, expectedType, type_2.ConversionKind.IMPLICIT);
                        checkConversion(context, right, expectedType, type_2.ConversionKind.IMPLICIT);
                    }
                    node.resolvedType = context.booleanType;
                }
                else {
                    context.log.error(node.internalRange, "This operator is not currently supported");
                }
            }
            else if (leftType != context.errorType) {
                let name = node.internalRange.toString();
                let symbol = leftType.findMember(kind == node_9.NodeKind.NOT_EQUAL ? "==" :
                    kind == node_9.NodeKind.LESS_THAN_EQUAL ? ">" :
                        kind == node_9.NodeKind.GREATER_THAN_EQUAL ? "<" :
                            name, scope_2.ScopeHint.NOT_UNARY);
                // Automatically call the function
                if (symbol != null) {
                    left = node_9.createMemberReference(left.remove(), symbol).withRange(node.range).withInternalRange(node.internalRange);
                    right.remove();
                    if (kind == node_9.NodeKind.NOT_EQUAL ||
                        kind == node_9.NodeKind.LESS_THAN_EQUAL ||
                        kind == node_9.NodeKind.GREATER_THAN_EQUAL) {
                        let call = node_9.createCall(left);
                        call.appendChild(right);
                        node.kind = node_9.NodeKind.NOT;
                        node.appendChild(call.withRange(node.range).withInternalRange(node.range));
                    }
                    else {
                        node.appendChild(left);
                        node.appendChild(right);
                        node.kind = node_9.NodeKind.CALL;
                    }
                    node.resolvedType = null;
                    resolveAsExpression(context, node, parentScope);
                }
                else if (kind == node_9.NodeKind.EQUAL || kind == node_9.NodeKind.NOT_EQUAL) {
                    node.resolvedType = context.booleanType;
                    if (leftType != context.errorType && rightType != context.errorType && leftType != rightType && !canConvert(context, right, leftType, type_2.ConversionKind.IMPLICIT) && !canConvert(context, left, rightType, type_2.ConversionKind.IMPLICIT)) {
                        context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                            .append("Cannot compare type '")
                            .append(leftType.toString())
                            .append("' with type '")
                            .append(rightType.toString())
                            .appendChar('\'')
                            .finish());
                    }
                }
                else {
                    context.log.error(node.internalRange, stringbuilder_11.StringBuilder_new()
                        .append("Cannot use binary operator '")
                        .append(name)
                        .append("' with type '")
                        .append(leftType.toString())
                        .appendChar('\'')
                        .finish());
                }
            }
        }
        else if (kind == node_9.NodeKind.INTERNAL_IMPORT || kind == node_9.NodeKind.INTERNAL_IMPORT_FROM) {
            //ignore imports
        }
        else {
            console.error(`Unexpected kind: ${node_9.NodeKind[kind]}`);
            assert(false);
        }
    }
    exports_20("resolve", resolve);
    var symbol_8, type_2, node_9, compiler_3, log_5, scope_2, stringbuilder_11, imports_3, const_1, CheckContext, CheckMode;
    return {
        setters: [
            function (symbol_8_1) {
                symbol_8 = symbol_8_1;
            },
            function (type_2_1) {
                type_2 = type_2_1;
            },
            function (node_9_1) {
                node_9 = node_9_1;
            },
            function (compiler_3_1) {
                compiler_3 = compiler_3_1;
            },
            function (log_5_1) {
                log_5 = log_5_1;
            },
            function (scope_2_1) {
                scope_2 = scope_2_1;
            },
            function (stringbuilder_11_1) {
                stringbuilder_11 = stringbuilder_11_1;
            },
            function (imports_3_1) {
                imports_3 = imports_3_1;
            },
            function (const_1_1) {
                const_1 = const_1_1;
            }
        ],
        execute: function () {
            /**
             * Author : Nidin Vinayakan
             */
            CheckContext = class CheckContext {
                allocateGlobalVariableOffset(sizeOf, alignmentOf) {
                    let offset = imports_3.alignToNextMultipleOf(this.nextGlobalVariableOffset, alignmentOf);
                    this.nextGlobalVariableOffset = offset + sizeOf;
                    return offset;
                }
            };
            exports_20("CheckContext", CheckContext);
            (function (CheckMode) {
                CheckMode[CheckMode["NORMAL"] = 0] = "NORMAL";
                CheckMode[CheckMode["INITIALIZE"] = 1] = "INITIALIZE";
            })(CheckMode || (CheckMode = {}));
            exports_20("CheckMode", CheckMode);
        }
    };
});
System.register("symbol", ["node", "imports"], function (exports_21, context_21) {
    "use strict";
    var __moduleName = context_21 && context_21.id;
    function isModule(kind) {
        return kind == SymbolKind.TYPE_MODULE;
    }
    exports_21("isModule", isModule);
    function isType(kind) {
        return kind >= SymbolKind.TYPE_CLASS && kind <= SymbolKind.TYPE_NATIVE;
    }
    exports_21("isType", isType);
    function isFunction(kind) {
        return kind >= SymbolKind.FUNCTION_INSTANCE && kind <= SymbolKind.FUNCTION_GLOBAL;
    }
    exports_21("isFunction", isFunction);
    function isVariable(kind) {
        return kind >= SymbolKind.VARIABLE_ARGUMENT && kind <= SymbolKind.VARIABLE_LOCAL;
    }
    exports_21("isVariable", isVariable);
    var node_10, imports_4, SymbolKind, SymbolState, SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL, SYMBOL_FLAG_IS_BINARY_OPERATOR, SYMBOL_FLAG_IS_REFERENCE, SYMBOL_FLAG_IS_UNARY_OPERATOR, SYMBOL_FLAG_IS_UNSIGNED, SYMBOL_FLAG_NATIVE_INTEGER, SYMBOL_FLAG_NATIVE_LONG, SYMBOL_FLAG_NATIVE_FLOAT, SYMBOL_FLAG_NATIVE_DOUBLE, SYMBOL_FLAG_USED, SYMBOL_FLAG_IS_ARRAY, SYMBOL_FLAG_IS_GENERIC, SYMBOL_FLAG_IS_TEMPLATE, Symbol;
    return {
        setters: [
            function (node_10_1) {
                node_10 = node_10_1;
            },
            function (imports_4_1) {
                imports_4 = imports_4_1;
            }
        ],
        execute: function () {
            (function (SymbolKind) {
                SymbolKind[SymbolKind["TYPE_MODULE"] = 0] = "TYPE_MODULE";
                SymbolKind[SymbolKind["TYPE_INTERFACE"] = 1] = "TYPE_INTERFACE";
                SymbolKind[SymbolKind["TYPE_CLASS"] = 2] = "TYPE_CLASS";
                SymbolKind[SymbolKind["TYPE_GENERIC"] = 3] = "TYPE_GENERIC";
                SymbolKind[SymbolKind["TYPE_TEMPLATE"] = 4] = "TYPE_TEMPLATE";
                SymbolKind[SymbolKind["TYPE_ENUM"] = 5] = "TYPE_ENUM";
                SymbolKind[SymbolKind["TYPE_GLOBAL"] = 6] = "TYPE_GLOBAL";
                SymbolKind[SymbolKind["TYPE_NATIVE"] = 7] = "TYPE_NATIVE";
                SymbolKind[SymbolKind["FUNCTION_INSTANCE"] = 8] = "FUNCTION_INSTANCE";
                SymbolKind[SymbolKind["FUNCTION_GLOBAL"] = 9] = "FUNCTION_GLOBAL";
                SymbolKind[SymbolKind["VARIABLE_ARGUMENT"] = 10] = "VARIABLE_ARGUMENT";
                SymbolKind[SymbolKind["VARIABLE_CONSTANT"] = 11] = "VARIABLE_CONSTANT";
                SymbolKind[SymbolKind["VARIABLE_GLOBAL"] = 12] = "VARIABLE_GLOBAL";
                SymbolKind[SymbolKind["VARIABLE_INSTANCE"] = 13] = "VARIABLE_INSTANCE";
                SymbolKind[SymbolKind["VARIABLE_LOCAL"] = 14] = "VARIABLE_LOCAL";
            })(SymbolKind || (SymbolKind = {}));
            exports_21("SymbolKind", SymbolKind);
            (function (SymbolState) {
                SymbolState[SymbolState["UNINITIALIZED"] = 0] = "UNINITIALIZED";
                SymbolState[SymbolState["INITIALIZING"] = 1] = "INITIALIZING";
                SymbolState[SymbolState["INITIALIZED"] = 2] = "INITIALIZED";
            })(SymbolState || (SymbolState = {}));
            exports_21("SymbolState", SymbolState);
            exports_21("SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL", SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL = 1 << 0);
            exports_21("SYMBOL_FLAG_IS_BINARY_OPERATOR", SYMBOL_FLAG_IS_BINARY_OPERATOR = 1 << 1);
            exports_21("SYMBOL_FLAG_IS_REFERENCE", SYMBOL_FLAG_IS_REFERENCE = 1 << 2);
            exports_21("SYMBOL_FLAG_IS_UNARY_OPERATOR", SYMBOL_FLAG_IS_UNARY_OPERATOR = 1 << 3);
            exports_21("SYMBOL_FLAG_IS_UNSIGNED", SYMBOL_FLAG_IS_UNSIGNED = 1 << 4);
            exports_21("SYMBOL_FLAG_NATIVE_INTEGER", SYMBOL_FLAG_NATIVE_INTEGER = 1 << 5);
            exports_21("SYMBOL_FLAG_NATIVE_LONG", SYMBOL_FLAG_NATIVE_LONG = 1 << 6);
            exports_21("SYMBOL_FLAG_NATIVE_FLOAT", SYMBOL_FLAG_NATIVE_FLOAT = 1 << 7);
            exports_21("SYMBOL_FLAG_NATIVE_DOUBLE", SYMBOL_FLAG_NATIVE_DOUBLE = 1 << 8);
            exports_21("SYMBOL_FLAG_USED", SYMBOL_FLAG_USED = 1 << 9);
            exports_21("SYMBOL_FLAG_IS_ARRAY", SYMBOL_FLAG_IS_ARRAY = 1 << 10);
            exports_21("SYMBOL_FLAG_IS_GENERIC", SYMBOL_FLAG_IS_GENERIC = 1 << 11);
            exports_21("SYMBOL_FLAG_IS_TEMPLATE", SYMBOL_FLAG_IS_TEMPLATE = 1 << 12);
            Symbol = class Symbol {
                constructor() {
                    this.state = SymbolState.UNINITIALIZED;
                    this.byteSize = 0;
                    this.maxAlignment = 0;
                }
                get internalName() {
                    return this.rename != null ? this.rename : this.name;
                }
                clone() {
                    let symbol = new Symbol();
                    symbol.kind = this.kind;
                    symbol.name = this.name;
                    symbol.node = this.node;
                    symbol.range = this.range;
                    symbol.scope = this.scope;
                    symbol.resolvedType = this.resolvedType;
                    symbol.byteSize = this.byteSize;
                    symbol.state = this.state;
                    symbol.maxAlignment = this.maxAlignment;
                    symbol.flags = this.flags;
                    symbol.rename = this.rename;
                    return symbol;
                }
                isEnumValue() {
                    return this.node.parent.kind == node_10.NodeKind.ENUM;
                }
                isUnsafe() {
                    return this.node != null && this.node.isUnsafe();
                }
                isGetter() {
                    return this.node.isGet();
                }
                isSetter() {
                    return this.node.isSet();
                }
                isBinaryOperator() {
                    return (this.flags & SYMBOL_FLAG_IS_BINARY_OPERATOR) != 0;
                }
                isUnaryOperator() {
                    return (this.flags & SYMBOL_FLAG_IS_UNARY_OPERATOR) != 0;
                }
                shouldConvertInstanceToGlobal() {
                    return (this.flags & SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL) != 0;
                }
                isUsed() {
                    return (this.flags & SYMBOL_FLAG_USED) != 0;
                }
                parent() {
                    var parent = this.node.parent;
                    return parent.kind == node_10.NodeKind.CLASS ? parent.symbol : null;
                }
                resolvedTypeUnderlyingIfEnumValue(context) {
                    return this.isEnumValue() ? this.resolvedType.underlyingType(context) : this.resolvedType;
                }
                determineClassLayout(context) {
                    assert(this.kind == SymbolKind.TYPE_CLASS);
                    // Only determine class layout once
                    if (this.byteSize != 0) {
                        return;
                    }
                    var offset = 0;
                    var child = this.node.firstChild;
                    var maxAlignment = 1;
                    while (child != null) {
                        if (child.kind == node_10.NodeKind.VARIABLE) {
                            var type = child.symbol.resolvedType;
                            // Ignore invalid members
                            if (type != context.errorType) {
                                var alignmentOf = type.variableAlignmentOf(context);
                                // Align the member to the next available slot
                                offset = imports_4.alignToNextMultipleOf(offset, alignmentOf);
                                if (alignmentOf > maxAlignment)
                                    maxAlignment = alignmentOf;
                                // Allocate the member by extending the object
                                child.symbol.offset = offset;
                                offset = offset + type.variableSizeOf(context);
                            }
                        }
                        child = child.nextSibling;
                    }
                    // All objects must have a non-zero size
                    if (offset == 0) {
                        offset = 1;
                    }
                    // The object size must be a multiple of the maximum alignment for arrays to work correctly
                    offset = imports_4.alignToNextMultipleOf(offset, maxAlignment);
                    this.byteSize = offset;
                    this.maxAlignment = maxAlignment;
                }
            };
            exports_21("Symbol", Symbol);
        }
    };
});
System.register("type", ["symbol", "stringbuilder"], function (exports_22, context_22) {
    "use strict";
    var __moduleName = context_22 && context_22.id;
    var symbol_9, stringbuilder_12, ConversionKind, Type;
    return {
        setters: [
            function (symbol_9_1) {
                symbol_9 = symbol_9_1;
            },
            function (stringbuilder_12_1) {
                stringbuilder_12 = stringbuilder_12_1;
            }
        ],
        execute: function () {
            (function (ConversionKind) {
                ConversionKind[ConversionKind["IMPLICIT"] = 0] = "IMPLICIT";
                ConversionKind[ConversionKind["EXPLICIT"] = 1] = "EXPLICIT";
            })(ConversionKind || (ConversionKind = {}));
            exports_22("ConversionKind", ConversionKind);
            Type = class Type {
                isClass() {
                    return this.symbol != null && this.symbol.kind == symbol_9.SymbolKind.TYPE_CLASS;
                }
                isGeneric() {
                    let symbol = this.symbol || this.pointerTo.symbol;
                    return symbol != null && symbol.kind == symbol_9.SymbolKind.TYPE_GENERIC;
                }
                isTemplate() {
                    let symbol = this.symbol || this.pointerTo.symbol;
                    return symbol != null && symbol.kind == symbol_9.SymbolKind.TYPE_TEMPLATE;
                }
                isEnum() {
                    return this.symbol != null && this.symbol.kind == symbol_9.SymbolKind.TYPE_ENUM;
                }
                isInteger() {
                    return this.symbol != null && (this.symbol.flags & symbol_9.SYMBOL_FLAG_NATIVE_INTEGER) != 0 || this.isEnum();
                }
                isLong() {
                    return this.symbol != null && (this.symbol.flags & symbol_9.SYMBOL_FLAG_NATIVE_LONG) != 0;
                }
                isUnsigned() {
                    return this.symbol != null && (this.symbol.flags & symbol_9.SYMBOL_FLAG_IS_UNSIGNED) != 0;
                }
                isFloat() {
                    return this.symbol != null && (this.symbol.flags & symbol_9.SYMBOL_FLAG_NATIVE_FLOAT) != 0;
                }
                isDouble() {
                    return this.symbol != null && (this.symbol.flags & symbol_9.SYMBOL_FLAG_NATIVE_DOUBLE) != 0;
                }
                isArray() {
                    // return this.symbol != null && (this.symbol.flags & SYMBOL_FLAG_IS_ARRAY) != 0;
                    return this.symbol != null && this.symbol.name.indexOf("Array<") >= 0;
                }
                isTypedArray() {
                    return this.symbol != null &&
                        (this.symbol.name == "Float32Array" || this.symbol.name == "Float64Array" ||
                            this.symbol.name == "Int8Array" || this.symbol.name == "Int16Array" || this.symbol.name == "Int32Array" ||
                            this.symbol.name == "Uint8Array" || this.symbol.name == "Uint16Array" || this.symbol.name == "Uint32Array");
                }
                isReference() {
                    return this.pointerTo != null || this.symbol != null && (this.symbol.flags & symbol_9.SYMBOL_FLAG_IS_REFERENCE) != 0;
                }
                underlyingType(context) {
                    return this.isEnum() ? context.int32Type : this.pointerTo != null ? context.uint32Type : this;
                }
                integerBitCount(context) {
                    return this.symbol != null ? this.symbol.byteSize * 8 : 0;
                }
                integerBitMask(context) {
                    return ~0 >> (32 - this.integerBitCount(context));
                }
                allocationSizeOf(context) {
                    return this.symbol == null ? context.pointerByteSize : this.symbol.byteSize;
                }
                allocationAlignmentOf(context) {
                    return this.allocationSizeOf(context); // This is true right now
                }
                variableSizeOf(context) {
                    return this.isReference() ? context.pointerByteSize : this.symbol.byteSize;
                }
                variableAlignmentOf(context) {
                    return this.variableSizeOf(context); // This is true right now
                }
                pointerType() {
                    var type = this.cachedPointerType;
                    if (type == null) {
                        type = new Type();
                        type.pointerTo = this;
                        this.cachedPointerType = type;
                    }
                    return type;
                }
                toString() {
                    if (this.cachedToString == null) {
                        this.cachedToString =
                            this.pointerTo != null ? stringbuilder_12.StringBuilder_new().appendChar('*').append(this.pointerTo.toString()).finish() :
                                this.symbol.name;
                    }
                    return this.cachedToString;
                }
                findMember(name, hint) {
                    var symbol = this.symbol;
                    return symbol != null && symbol.scope != null ? symbol.scope.findLocal(name, hint) : null;
                }
                hasInstanceMembers() {
                    var symbol = this.symbol;
                    return symbol != null && (symbol.kind == symbol_9.SymbolKind.TYPE_TEMPLATE || symbol.kind == symbol_9.SymbolKind.TYPE_CLASS || symbol.kind == symbol_9.SymbolKind.TYPE_NATIVE);
                }
            };
            exports_22("Type", Type);
        }
    };
});
System.register("node", ["symbol"], function (exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    function isUnary(kind) {
        return kind >= NodeKind.ADDRESS_OF && kind <= NodeKind.PREFIX_INCREMENT;
    }
    exports_23("isUnary", isUnary);
    function isUnaryPostfix(kind) {
        return kind >= NodeKind.POSTFIX_DECREMENT && kind <= NodeKind.POSTFIX_INCREMENT;
    }
    exports_23("isUnaryPostfix", isUnaryPostfix);
    function isBinary(kind) {
        return kind >= NodeKind.ADD && kind <= NodeKind.SUBTRACT;
    }
    exports_23("isBinary", isBinary);
    function invertedBinaryKind(kind) {
        if (kind == NodeKind.EQUAL)
            return NodeKind.NOT_EQUAL;
        if (kind == NodeKind.NOT_EQUAL)
            return NodeKind.EQUAL;
        if (kind == NodeKind.GREATER_THAN)
            return NodeKind.LESS_THAN_EQUAL;
        if (kind == NodeKind.GREATER_THAN_EQUAL)
            return NodeKind.LESS_THAN;
        if (kind == NodeKind.LESS_THAN)
            return NodeKind.GREATER_THAN_EQUAL;
        if (kind == NodeKind.LESS_THAN_EQUAL)
            return NodeKind.GREATER_THAN;
        return kind;
    }
    exports_23("invertedBinaryKind", invertedBinaryKind);
    function isExpression(node) {
        return node.kind >= NodeKind.ALIGN_OF && node.kind <= NodeKind.SUBTRACT;
    }
    exports_23("isExpression", isExpression);
    function isCompactNodeKind(kind) {
        return kind == NodeKind.CONSTANTS || kind == NodeKind.EXPRESSION || kind == NodeKind.VARIABLES;
    }
    exports_23("isCompactNodeKind", isCompactNodeKind);
    function appendFlag(first, flag, range) {
        let link = new NodeFlag();
        link.flag = flag;
        link.range = range;
        // Is the list empty?
        if (first == null) {
            return link;
        }
        // Append the flag to the end of the list
        let secondToLast = first;
        while (secondToLast.next != null) {
            secondToLast = secondToLast.next;
        }
        secondToLast.next = link;
        return first;
    }
    exports_23("appendFlag", appendFlag);
    function allFlags(link) {
        let all = 0;
        while (link != null) {
            all = all | link.flag;
            link = link.next;
        }
        return all;
    }
    exports_23("allFlags", allFlags);
    function rangeForFlag(link, flag) {
        while (link != null) {
            if (link.flag == flag) {
                return link.range;
            }
            link = link.next;
        }
        return null;
    }
    exports_23("rangeForFlag", rangeForFlag);
    function createNew(type) {
        assert(isExpression(type));
        let node = new Node();
        node.kind = NodeKind.NEW;
        node.appendChild(type);
        return node;
    }
    exports_23("createNew", createNew);
    function createDelete(value) {
        assert(value == null || isExpression(value));
        let node = new Node();
        node.kind = NodeKind.DELETE;
        if (value != null) {
            node.appendChild(value);
        }
        return node;
    }
    exports_23("createDelete", createDelete);
    function createHook(test, primary, secondary) {
        assert(isExpression(test));
        assert(isExpression(primary));
        assert(isExpression(secondary));
        let node = new Node();
        node.kind = NodeKind.HOOK;
        node.appendChild(test);
        node.appendChild(primary);
        node.appendChild(secondary);
        return node;
    }
    exports_23("createHook", createHook);
    function createIndex(target) {
        assert(isExpression(target));
        let node = new Node();
        node.kind = NodeKind.INDEX;
        node.appendChild(target);
        return node;
    }
    exports_23("createIndex", createIndex);
    function createNull() {
        let node = new Node();
        node.kind = NodeKind.NULL;
        return node;
    }
    exports_23("createNull", createNull);
    function createUndefined() {
        let node = new Node();
        node.kind = NodeKind.UNDEFINED;
        return node;
    }
    exports_23("createUndefined", createUndefined);
    function createThis() {
        let node = new Node();
        node.kind = NodeKind.THIS;
        return node;
    }
    exports_23("createThis", createThis);
    function createAddressOf(value) {
        assert(isExpression(value));
        let node = new Node();
        node.kind = NodeKind.ADDRESS_OF;
        node.appendChild(value);
        return node;
    }
    exports_23("createAddressOf", createAddressOf);
    function createDereference(value) {
        assert(isExpression(value));
        let node = new Node();
        node.kind = NodeKind.DEREFERENCE;
        node.appendChild(value);
        return node;
    }
    exports_23("createDereference", createDereference);
    function createAlignOf(type) {
        assert(isExpression(type));
        let node = new Node();
        node.kind = NodeKind.ALIGN_OF;
        node.appendChild(type);
        return node;
    }
    exports_23("createAlignOf", createAlignOf);
    function createSizeOf(type) {
        assert(isExpression(type));
        let node = new Node();
        node.kind = NodeKind.SIZE_OF;
        node.appendChild(type);
        return node;
    }
    exports_23("createSizeOf", createSizeOf);
    function createboolean(value) {
        let node = new Node();
        node.kind = NodeKind.BOOLEAN;
        node.intValue = value ? 1 : 0;
        return node;
    }
    exports_23("createboolean", createboolean);
    function createInt(value) {
        let node = new Node();
        node.kind = NodeKind.INT32;
        node.intValue = value;
        return node;
    }
    exports_23("createInt", createInt);
    function createLong(value) {
        let node = new Node();
        node.kind = NodeKind.INT64;
        node.longValue = value;
        return node;
    }
    exports_23("createLong", createLong);
    function createFloat(value) {
        let node = new Node();
        node.kind = NodeKind.FLOAT32;
        node.floatValue = value;
        return node;
    }
    exports_23("createFloat", createFloat);
    function createDouble(value) {
        let node = new Node();
        node.kind = NodeKind.FLOAT64;
        node.doubleValue = value;
        return node;
    }
    exports_23("createDouble", createDouble);
    function createString(value) {
        let node = new Node();
        node.kind = NodeKind.STRING;
        node.stringValue = value;
        return node;
    }
    exports_23("createString", createString);
    function createArray(type) {
        let node = new Node();
        node.kind = NodeKind.ARRAY;
        node.resolvedType = type;
        return node;
    }
    exports_23("createArray", createArray);
    function createName(value) {
        let node = new Node();
        node.kind = NodeKind.NAME;
        node.referenceValue = value;
        return node;
    }
    exports_23("createName", createName);
    function createType(type) {
        assert(type != null);
        let node = new Node();
        node.kind = NodeKind.TYPE;
        node.resolvedType = type;
        return node;
    }
    exports_23("createType", createType);
    function createAny() {
        let node = new Node();
        node.kind = NodeKind.ANY;
        return node;
    }
    exports_23("createAny", createAny);
    function createEmpty() {
        let node = new Node();
        node.kind = NodeKind.EMPTY;
        return node;
    }
    exports_23("createEmpty", createEmpty);
    function createExpression(value) {
        assert(isExpression(value));
        let node = new Node();
        node.kind = NodeKind.EXPRESSION;
        node.appendChild(value);
        return node;
    }
    exports_23("createExpression", createExpression);
    function createBlock() {
        let node = new Node();
        node.kind = NodeKind.BLOCK;
        return node;
    }
    exports_23("createBlock", createBlock);
    function createModule(name) {
        let node = new Node();
        node.kind = NodeKind.MODULE;
        node.stringValue = name;
        return node;
    }
    exports_23("createModule", createModule);
    function createClass(name) {
        let node = new Node();
        node.kind = NodeKind.CLASS;
        node.stringValue = name;
        return node;
    }
    exports_23("createClass", createClass);
    function createEnum(name) {
        let node = new Node();
        node.kind = NodeKind.ENUM;
        node.stringValue = name;
        return node;
    }
    exports_23("createEnum", createEnum);
    function createIf(value, trueBranch, falseBranch) {
        assert(isExpression(value));
        assert(trueBranch.kind == NodeKind.BLOCK);
        assert(falseBranch == null || falseBranch.kind == NodeKind.BLOCK);
        let node = new Node();
        node.kind = NodeKind.IF;
        node.appendChild(value);
        node.appendChild(trueBranch);
        if (falseBranch != null) {
            node.appendChild(falseBranch);
        }
        return node;
    }
    exports_23("createIf", createIf);
    function createWhile(value, body) {
        assert(isExpression(value));
        assert(body.kind == NodeKind.BLOCK);
        let node = new Node();
        node.kind = NodeKind.WHILE;
        node.appendChild(value);
        node.appendChild(body);
        return node;
    }
    exports_23("createWhile", createWhile);
    function createReturn(value) {
        assert(value == null || isExpression(value));
        let node = new Node();
        node.kind = NodeKind.RETURN;
        if (value != null) {
            node.appendChild(value);
        }
        return node;
    }
    exports_23("createReturn", createReturn);
    function createImports() {
        let node = new Node();
        node.kind = NodeKind.IMPORTS;
        return node;
    }
    exports_23("createImports", createImports);
    function createInternalImport(name) {
        let node = new Node();
        node.kind = NodeKind.INTERNAL_IMPORT;
        node.stringValue = name;
        return node;
    }
    exports_23("createInternalImport", createInternalImport);
    function createInternalImportFrom(name) {
        let node = new Node();
        node.kind = NodeKind.INTERNAL_IMPORT_FROM;
        node.stringValue = name;
        return node;
    }
    exports_23("createInternalImportFrom", createInternalImportFrom);
    function createExternalImport(name) {
        let node = new Node();
        node.kind = NodeKind.EXTERNAL_IMPORT;
        node.stringValue = name;
        return node;
    }
    exports_23("createExternalImport", createExternalImport);
    function createVariables() {
        let node = new Node();
        node.kind = NodeKind.VARIABLES;
        return node;
    }
    exports_23("createVariables", createVariables);
    function createConstants() {
        let node = new Node();
        node.kind = NodeKind.CONSTANTS;
        return node;
    }
    exports_23("createConstants", createConstants);
    function createParameters() {
        let node = new Node();
        node.kind = NodeKind.PARAMETERS;
        return node;
    }
    exports_23("createParameters", createParameters);
    function createExtends(type) {
        assert(isExpression(type));
        let node = new Node();
        node.kind = NodeKind.EXTENDS;
        node.appendChild(type);
        return node;
    }
    exports_23("createExtends", createExtends);
    function createImplements() {
        let node = new Node();
        node.kind = NodeKind.IMPLEMENTS;
        return node;
    }
    exports_23("createImplements", createImplements);
    function createParameter(name) {
        let node = new Node();
        node.kind = NodeKind.PARAMETER;
        node.stringValue = name;
        return node;
    }
    exports_23("createParameter", createParameter);
    function createVariable(name, type, value) {
        assert(type == null || isExpression(type));
        assert(value == null || isExpression(value));
        let node = new Node();
        node.kind = NodeKind.VARIABLE;
        node.stringValue = name;
        node.appendChild(type != null ? type : createEmpty());
        if (value != null) {
            node.appendChild(value);
        }
        return node;
    }
    exports_23("createVariable", createVariable);
    function createFunction(name) {
        let node = new Node();
        node.kind = NodeKind.FUNCTION;
        node.stringValue = name;
        return node;
    }
    exports_23("createFunction", createFunction);
    function createUnary(kind, value) {
        assert(isUnary(kind));
        assert(isExpression(value));
        let node = new Node();
        node.kind = kind;
        node.appendChild(value);
        return node;
    }
    exports_23("createUnary", createUnary);
    function createBinary(kind, left, right) {
        assert(isBinary(kind));
        assert(isExpression(left));
        assert(isExpression(right));
        let node = new Node();
        node.kind = kind;
        node.appendChild(left);
        node.appendChild(right);
        return node;
    }
    exports_23("createBinary", createBinary);
    function createCall(value) {
        assert(isExpression(value));
        let node = new Node();
        node.kind = NodeKind.CALL;
        node.appendChild(value);
        return node;
    }
    exports_23("createCall", createCall);
    function createCast(value, type) {
        assert(isExpression(value));
        assert(isExpression(type));
        let node = new Node();
        node.kind = NodeKind.CAST;
        node.appendChild(value);
        node.appendChild(type);
        return node;
    }
    exports_23("createCast", createCast);
    function createDot(value, name) {
        assert(isExpression(value));
        let node = new Node();
        node.kind = NodeKind.DOT;
        node.stringValue = name;
        node.appendChild(value);
        return node;
    }
    exports_23("createDot", createDot);
    function createSymbolReference(symbol) {
        let node = createName(symbol.name);
        node.symbol = symbol;
        node.resolvedType = symbol.resolvedType;
        return node;
    }
    exports_23("createSymbolReference", createSymbolReference);
    function createMemberReference(value, symbol) {
        let node = createDot(value, symbol.name);
        node.symbol = symbol;
        node.resolvedType = symbol.resolvedType;
        return node;
    }
    exports_23("createMemberReference", createMemberReference);
    function createParseError() {
        let node = new Node();
        node.kind = NodeKind.PARSE_ERROR;
        return node;
    }
    exports_23("createParseError", createParseError);
    //JavaScript
    function createJSNumber() {
        let node = new Node();
        node.kind = NodeKind.JS_NUMBER;
        return node;
    }
    exports_23("createJSNumber", createJSNumber);
    function createJSObject() {
        let node = new Node();
        node.kind = NodeKind.JS_OBJECT;
        return node;
    }
    exports_23("createJSObject", createJSObject);
    function createJSString() {
        let node = new Node();
        node.kind = NodeKind.JS_STRING;
        return node;
    }
    exports_23("createJSString", createJSString);
    function createJSArray() {
        let node = new Node();
        node.kind = NodeKind.JS_ARRAY;
        return node;
    }
    exports_23("createJSArray", createJSArray);
    var symbol_10, NodeKind, NODE_FLAG_DECLARE, NODE_FLAG_EXPORT, NODE_FLAG_INTERNAL_IMPORT, NODE_FLAG_EXTERNAL_IMPORT, NODE_FLAG_GET, NODE_FLAG_OPERATOR, NODE_FLAG_POSITIVE, NODE_FLAG_PRIVATE, NODE_FLAG_PROTECTED, NODE_FLAG_PUBLIC, NODE_FLAG_SET, NODE_FLAG_STATIC, NODE_FLAG_UNSAFE, NODE_FLAG_JAVASCRIPT, NODE_FLAG_UNSIGNED_OPERATOR, NODE_FLAG_VIRTUAL, NODE_FLAG_START, NODE_FLAG_ANYFUNC, NODE_FLAG_GENERIC, NodeFlag, Node;
    return {
        setters: [
            function (symbol_10_1) {
                symbol_10 = symbol_10_1;
            }
        ],
        execute: function () {
            /**
             * Author: Nidin Vinayakan
             */
            (function (NodeKind) {
                // Other
                NodeKind[NodeKind["EXTENDS"] = 0] = "EXTENDS";
                NodeKind[NodeKind["FILE"] = 1] = "FILE";
                NodeKind[NodeKind["GLOBAL"] = 2] = "GLOBAL";
                NodeKind[NodeKind["IMPLEMENTS"] = 3] = "IMPLEMENTS";
                NodeKind[NodeKind["PARAMETER"] = 4] = "PARAMETER";
                NodeKind[NodeKind["PARAMETERS"] = 5] = "PARAMETERS";
                NodeKind[NodeKind["VARIABLE"] = 6] = "VARIABLE";
                NodeKind[NodeKind["INTERNAL_IMPORT"] = 7] = "INTERNAL_IMPORT";
                NodeKind[NodeKind["INTERNAL_IMPORT_FROM"] = 8] = "INTERNAL_IMPORT_FROM";
                NodeKind[NodeKind["EXTERNAL_IMPORT"] = 9] = "EXTERNAL_IMPORT";
                // Statements
                NodeKind[NodeKind["BLOCK"] = 10] = "BLOCK";
                NodeKind[NodeKind["BREAK"] = 11] = "BREAK";
                NodeKind[NodeKind["MODULE"] = 12] = "MODULE";
                NodeKind[NodeKind["IMPORTS"] = 13] = "IMPORTS";
                NodeKind[NodeKind["CLASS"] = 14] = "CLASS";
                NodeKind[NodeKind["CONSTANTS"] = 15] = "CONSTANTS";
                NodeKind[NodeKind["CONTINUE"] = 16] = "CONTINUE";
                NodeKind[NodeKind["EMPTY"] = 17] = "EMPTY";
                NodeKind[NodeKind["ENUM"] = 18] = "ENUM";
                NodeKind[NodeKind["EXPRESSION"] = 19] = "EXPRESSION";
                NodeKind[NodeKind["FUNCTION"] = 20] = "FUNCTION";
                NodeKind[NodeKind["IF"] = 21] = "IF";
                NodeKind[NodeKind["RETURN"] = 22] = "RETURN";
                NodeKind[NodeKind["UNSAFE"] = 23] = "UNSAFE";
                NodeKind[NodeKind["JAVASCRIPT"] = 24] = "JAVASCRIPT";
                NodeKind[NodeKind["START"] = 25] = "START";
                NodeKind[NodeKind["VARIABLES"] = 26] = "VARIABLES";
                NodeKind[NodeKind["WHILE"] = 27] = "WHILE";
                // Expressions
                NodeKind[NodeKind["ALIGN_OF"] = 28] = "ALIGN_OF";
                NodeKind[NodeKind["BOOLEAN"] = 29] = "BOOLEAN";
                NodeKind[NodeKind["CALL"] = 30] = "CALL";
                NodeKind[NodeKind["CAST"] = 31] = "CAST";
                NodeKind[NodeKind["DOT"] = 32] = "DOT";
                NodeKind[NodeKind["HOOK"] = 33] = "HOOK";
                NodeKind[NodeKind["INDEX"] = 34] = "INDEX";
                NodeKind[NodeKind["ANY"] = 35] = "ANY";
                NodeKind[NodeKind["INT32"] = 36] = "INT32";
                NodeKind[NodeKind["INT64"] = 37] = "INT64";
                NodeKind[NodeKind["FLOAT32"] = 38] = "FLOAT32";
                NodeKind[NodeKind["FLOAT64"] = 39] = "FLOAT64";
                NodeKind[NodeKind["ARRAY"] = 40] = "ARRAY";
                NodeKind[NodeKind["GENERIC"] = 41] = "GENERIC";
                NodeKind[NodeKind["NAME"] = 42] = "NAME";
                NodeKind[NodeKind["NEW"] = 43] = "NEW";
                NodeKind[NodeKind["DELETE"] = 44] = "DELETE";
                NodeKind[NodeKind["NULL"] = 45] = "NULL";
                NodeKind[NodeKind["UNDEFINED"] = 46] = "UNDEFINED";
                NodeKind[NodeKind["PARSE_ERROR"] = 47] = "PARSE_ERROR";
                NodeKind[NodeKind["SIZE_OF"] = 48] = "SIZE_OF";
                NodeKind[NodeKind["STRING"] = 49] = "STRING";
                NodeKind[NodeKind["THIS"] = 50] = "THIS";
                NodeKind[NodeKind["TYPE"] = 51] = "TYPE";
                // Unary expressions
                NodeKind[NodeKind["ADDRESS_OF"] = 52] = "ADDRESS_OF";
                NodeKind[NodeKind["COMPLEMENT"] = 53] = "COMPLEMENT";
                NodeKind[NodeKind["DEREFERENCE"] = 54] = "DEREFERENCE";
                NodeKind[NodeKind["NEGATIVE"] = 55] = "NEGATIVE";
                NodeKind[NodeKind["NOT"] = 56] = "NOT";
                NodeKind[NodeKind["POINTER_TYPE"] = 57] = "POINTER_TYPE";
                NodeKind[NodeKind["POSITIVE"] = 58] = "POSITIVE";
                NodeKind[NodeKind["POSTFIX_DECREMENT"] = 59] = "POSTFIX_DECREMENT";
                NodeKind[NodeKind["POSTFIX_INCREMENT"] = 60] = "POSTFIX_INCREMENT";
                NodeKind[NodeKind["PREFIX_DECREMENT"] = 61] = "PREFIX_DECREMENT";
                NodeKind[NodeKind["PREFIX_INCREMENT"] = 62] = "PREFIX_INCREMENT";
                // Binary expressions
                NodeKind[NodeKind["ADD"] = 63] = "ADD";
                NodeKind[NodeKind["ASSIGN"] = 64] = "ASSIGN";
                NodeKind[NodeKind["BITWISE_AND"] = 65] = "BITWISE_AND";
                NodeKind[NodeKind["BITWISE_OR"] = 66] = "BITWISE_OR";
                NodeKind[NodeKind["BITWISE_XOR"] = 67] = "BITWISE_XOR";
                NodeKind[NodeKind["DIVIDE"] = 68] = "DIVIDE";
                NodeKind[NodeKind["EQUAL"] = 69] = "EQUAL";
                NodeKind[NodeKind["EXPONENT"] = 70] = "EXPONENT";
                NodeKind[NodeKind["GREATER_THAN"] = 71] = "GREATER_THAN";
                NodeKind[NodeKind["GREATER_THAN_EQUAL"] = 72] = "GREATER_THAN_EQUAL";
                NodeKind[NodeKind["LESS_THAN"] = 73] = "LESS_THAN";
                NodeKind[NodeKind["LESS_THAN_EQUAL"] = 74] = "LESS_THAN_EQUAL";
                NodeKind[NodeKind["LOGICAL_AND"] = 75] = "LOGICAL_AND";
                NodeKind[NodeKind["LOGICAL_OR"] = 76] = "LOGICAL_OR";
                NodeKind[NodeKind["MULTIPLY"] = 77] = "MULTIPLY";
                NodeKind[NodeKind["NOT_EQUAL"] = 78] = "NOT_EQUAL";
                NodeKind[NodeKind["REMAINDER"] = 79] = "REMAINDER";
                NodeKind[NodeKind["SHIFT_LEFT"] = 80] = "SHIFT_LEFT";
                NodeKind[NodeKind["SHIFT_RIGHT"] = 81] = "SHIFT_RIGHT";
                NodeKind[NodeKind["SUBTRACT"] = 82] = "SUBTRACT";
                //JavaScript
                NodeKind[NodeKind["JS_NUMBER"] = 83] = "JS_NUMBER";
                NodeKind[NodeKind["JS_OBJECT"] = 84] = "JS_OBJECT";
                NodeKind[NodeKind["JS_STRING"] = 85] = "JS_STRING";
                NodeKind[NodeKind["JS_ARRAY"] = 86] = "JS_ARRAY";
            })(NodeKind || (NodeKind = {}));
            exports_23("NodeKind", NodeKind);
            exports_23("NODE_FLAG_DECLARE", NODE_FLAG_DECLARE = 1 << 0);
            exports_23("NODE_FLAG_EXPORT", NODE_FLAG_EXPORT = 1 << 1);
            exports_23("NODE_FLAG_INTERNAL_IMPORT", NODE_FLAG_INTERNAL_IMPORT = 1 << 2);
            exports_23("NODE_FLAG_EXTERNAL_IMPORT", NODE_FLAG_EXTERNAL_IMPORT = 1 << 3);
            exports_23("NODE_FLAG_GET", NODE_FLAG_GET = 1 << 4);
            exports_23("NODE_FLAG_OPERATOR", NODE_FLAG_OPERATOR = 1 << 5);
            exports_23("NODE_FLAG_POSITIVE", NODE_FLAG_POSITIVE = 1 << 6);
            exports_23("NODE_FLAG_PRIVATE", NODE_FLAG_PRIVATE = 1 << 7);
            exports_23("NODE_FLAG_PROTECTED", NODE_FLAG_PROTECTED = 1 << 8);
            exports_23("NODE_FLAG_PUBLIC", NODE_FLAG_PUBLIC = 1 << 9);
            exports_23("NODE_FLAG_SET", NODE_FLAG_SET = 1 << 10);
            exports_23("NODE_FLAG_STATIC", NODE_FLAG_STATIC = 1 << 11);
            exports_23("NODE_FLAG_UNSAFE", NODE_FLAG_UNSAFE = 1 << 12);
            exports_23("NODE_FLAG_JAVASCRIPT", NODE_FLAG_JAVASCRIPT = 1 << 13);
            exports_23("NODE_FLAG_UNSIGNED_OPERATOR", NODE_FLAG_UNSIGNED_OPERATOR = 1 << 14);
            exports_23("NODE_FLAG_VIRTUAL", NODE_FLAG_VIRTUAL = 1 << 15);
            exports_23("NODE_FLAG_START", NODE_FLAG_START = 1 << 16);
            exports_23("NODE_FLAG_ANYFUNC", NODE_FLAG_ANYFUNC = 1 << 17);
            exports_23("NODE_FLAG_GENERIC", NODE_FLAG_GENERIC = 1 << 18);
            NodeFlag = class NodeFlag {
            };
            exports_23("NodeFlag", NodeFlag);
            Node = class Node {
                get hasValue() {
                    return this._hasValue;
                }
                get rawValue() {
                    if (this._hasStringValue) {
                        return `"${this._rawValue}"`;
                    }
                    else {
                        return this._rawValue;
                    }
                }
                get __internal_rawValue() {
                    return this._rawValue;
                }
                set rawValue(newValue) {
                    this._hasValue = true;
                    this._rawValue = newValue;
                }
                get intValue() {
                    let n = this._rawValue;
                    if (Number(n) === n && n % 1 === 0) {
                        return this._rawValue;
                    }
                    return null;
                }
                set intValue(newValue) {
                    this._hasValue = true;
                    this._rawValue = newValue;
                }
                get longValue() {
                    //TODO: Implement Int64
                    return this._rawValue;
                }
                set longValue(newValue) {
                    //TODO: Implement Int64
                    this._hasValue = true;
                    this._rawValue = newValue;
                }
                get floatValue() {
                    return this._rawValue;
                }
                set floatValue(newValue) {
                    this._hasValue = true;
                    this._rawValue = newValue;
                }
                get doubleValue() {
                    return this._rawValue;
                }
                set doubleValue(newValue) {
                    this._hasValue = true;
                    this._rawValue = newValue;
                }
                get stringValue() {
                    return this._rawValue;
                }
                set stringValue(newValue) {
                    this._hasValue = true;
                    this._hasStringValue = true;
                    this._rawValue = newValue;
                }
                get referenceValue() {
                    return this._rawValue;
                }
                set referenceValue(newValue) {
                    this._hasValue = true;
                    this._rawValue = newValue;
                }
                becomeTypeOf(node, context) {
                    switch (node.resolvedType) {
                        case context.int64Type:
                            if (this.kind != NodeKind.NAME) {
                                this.kind = NodeKind.INT64;
                            }
                            this.resolvedType = context.int64Type;
                            break;
                        case context.float64Type:
                            if (this.kind != NodeKind.NAME) {
                                this.kind = NodeKind.FLOAT64;
                            }
                            this.resolvedType = context.float64Type;
                            break;
                    }
                    if (node.flags) {
                        this.flags = node.flags;
                    }
                }
                becomeValueTypeOf(symbol, context) {
                    // let resolvedSymbol = symbol.resolvedType.pointerTo ? symbol.resolvedType.pointerTo.symbol : symbol.resolvedType.symbol;
                    let resolvedSymbol = symbol.resolvedType.symbol;
                    if (resolvedSymbol) {
                        switch (symbol.resolvedType) {
                            case context.int64Type:
                                this.resolvedType = context.int64Type;
                                if (this.kind == NodeKind.NULL) {
                                    this.longValue = 0;
                                }
                                if (this.kind != NodeKind.NAME) {
                                    this.kind = NodeKind.INT64;
                                }
                                break;
                            case context.float64Type:
                                this.resolvedType = context.float64Type;
                                if (this.kind == NodeKind.NULL) {
                                    this.doubleValue = 0.0;
                                }
                                if (this.kind != NodeKind.NAME) {
                                    this.kind = NodeKind.FLOAT64;
                                }
                                break;
                        }
                    }
                }
                clone() {
                    let node = new Node();
                    node.kind = this.kind;
                    node.offset = this.offset;
                    if (this.flags)
                        node.flags = this.flags;
                    if (this.firstFlag)
                        node.firstFlag = this.firstFlag;
                    // if(this.constructorFunctionNode) node.constructorFunctionNode = this.constructorFunctionNode;
                    if (this.range)
                        node.range = this.range;
                    if (this.internalRange)
                        node.internalRange = this.internalRange;
                    if (this.hasValue)
                        node.rawValue = this.__internal_rawValue;
                    return node;
                }
                becomeSymbolReference(symbol) {
                    this.kind = NodeKind.NAME;
                    this.symbol = symbol;
                    this.referenceValue = symbol.name;
                    this.resolvedType = symbol.resolvedType;
                    this.removeChildren();
                }
                becomeIntegerConstant(value) {
                    this.kind = NodeKind.INT32;
                    this.symbol = null;
                    this.intValue = value;
                    this.removeChildren();
                }
                becomeLongConstant(value) {
                    this.kind = NodeKind.INT64;
                    this.symbol = null;
                    this.longValue = value;
                    this.removeChildren();
                }
                becomeFloatConstant(value) {
                    this.kind = NodeKind.FLOAT32;
                    this.symbol = null;
                    this.floatValue = value;
                    this.removeChildren();
                }
                becomeDoubleConstant(value) {
                    this.kind = NodeKind.FLOAT64;
                    this.symbol = null;
                    this.doubleValue = value;
                    this.removeChildren();
                }
                becomebooleaneanConstant(value) {
                    this.kind = NodeKind.BOOLEAN;
                    this.symbol = null;
                    this.intValue = value ? 1 : 0;
                    this.removeChildren();
                }
                isNegativeInteger() {
                    return this.kind == NodeKind.INT32 && this.intValue < 0;
                }
                isNonNegativeInteger() {
                    return this.kind == NodeKind.INT32 && this.intValue >= 0;
                }
                isDeclare() {
                    return (this.flags & NODE_FLAG_DECLARE) != 0;
                }
                isVirtual() {
                    return (this.flags & NODE_FLAG_VIRTUAL) != 0;
                }
                isExport() {
                    return (this.flags & NODE_FLAG_EXPORT) != 0;
                }
                isExternalImport() {
                    return (this.flags & NODE_FLAG_EXTERNAL_IMPORT) != 0;
                }
                isStart() {
                    return (this.flags & NODE_FLAG_START) != 0;
                }
                isJavaScript() {
                    return (this.flags & NODE_FLAG_JAVASCRIPT) != 0;
                }
                isStatic() {
                    return (this.flags & NODE_FLAG_STATIC) != 0;
                }
                isAnyfunc() {
                    return (this.flags & NODE_FLAG_ANYFUNC) != 0;
                }
                isDeclareOrJavaScript() {
                    return (this.flags & (NODE_FLAG_DECLARE | NODE_FLAG_JAVASCRIPT)) != 0;
                }
                isDeclareOrExport() {
                    return (this.flags & (NODE_FLAG_DECLARE | NODE_FLAG_EXPORT)) != 0;
                }
                isGet() {
                    return (this.flags & NODE_FLAG_GET) != 0;
                }
                isSet() {
                    return (this.flags & NODE_FLAG_SET) != 0;
                }
                isOperator() {
                    return (this.flags & NODE_FLAG_OPERATOR) != 0;
                }
                isPositive() {
                    return (this.flags & NODE_FLAG_POSITIVE) != 0;
                }
                isPrivate() {
                    return (this.flags & NODE_FLAG_PRIVATE) != 0;
                }
                isUnsafe() {
                    return (this.flags & NODE_FLAG_UNSAFE) != 0;
                }
                isGeneric() {
                    return (this.flags & NODE_FLAG_GENERIC) != 0;
                }
                isTemplate() {
                    return this.symbol && (this.symbol.flags & symbol_10.SYMBOL_FLAG_IS_TEMPLATE) != 0;
                }
                isUnsignedOperator() {
                    return (this.flags & NODE_FLAG_UNSIGNED_OPERATOR) != 0;
                }
                childCount() {
                    let count = 0;
                    let child = this.firstChild;
                    while (child != null) {
                        count = count + 1;
                        child = child.nextSibling;
                    }
                    return count;
                }
                parameterCount() {
                    let count = 0;
                    let child = this.firstChild;
                    if (child.kind == NodeKind.PARAMETERS) {
                        child = child.firstChild;
                        while (child != null) {
                            count = count + 1;
                            child = child.nextSibling;
                        }
                    }
                    return count;
                }
                hasParameters() {
                    if (this.firstChild) {
                        let child = this.firstChild;
                        if (child.kind == NodeKind.PARAMETERS) {
                            return child.childCount() > 0;
                        }
                    }
                    return false;
                }
                appendChild(child) {
                    child.parent = this;
                    if (this.firstChild == null) {
                        this.firstChild = child;
                        this.firstChild.offset = 0;
                    }
                    else {
                        child.previousSibling = this.lastChild;
                        this.lastChild.nextSibling = child;
                        child.offset = this.lastChild.offset + 1;
                    }
                    this.lastChild = child;
                }
                insertChildBefore(after, before) {
                    if (before == null) {
                        return;
                    }
                    assert(before != after);
                    assert(before.parent == null);
                    assert(before.previousSibling == null);
                    assert(before.nextSibling == null);
                    assert(after == null || after.parent == this);
                    if (after == null) {
                        this.appendChild(before);
                        return;
                    }
                    before.parent = this;
                    before.previousSibling = after.previousSibling;
                    before.nextSibling = after;
                    if (after.previousSibling != null) {
                        assert(after == after.previousSibling.nextSibling);
                        after.previousSibling.nextSibling = before;
                    }
                    else {
                        assert(after == this.firstChild);
                        this.firstChild = before;
                    }
                    after.previousSibling = before;
                }
                insertChildAfter(before, after) {
                    if (after == null) {
                        return;
                    }
                    assert(before != after);
                    assert(after.parent == null);
                    assert(after.previousSibling == null);
                    assert(after.nextSibling == null);
                    assert(before == null || before.parent == this);
                    if (before == null) {
                        this.appendChild(after);
                        return;
                    }
                    after.parent = this;
                    after.previousSibling = before;
                    after.nextSibling = before.nextSibling;
                    if (before.nextSibling != null) {
                        assert(before == before.nextSibling.previousSibling);
                        before.nextSibling.previousSibling = after;
                    }
                    before.nextSibling = after;
                }
                remove() {
                    assert(this.parent != null);
                    if (this.previousSibling != null) {
                        assert(this.previousSibling.nextSibling == this);
                        this.previousSibling.nextSibling = this.nextSibling;
                    }
                    else {
                        assert(this.parent.firstChild == this);
                        this.parent.firstChild = this.nextSibling;
                    }
                    if (this.nextSibling != null) {
                        assert(this.nextSibling.previousSibling == this);
                        this.nextSibling.previousSibling = this.previousSibling;
                    }
                    else {
                        assert(this.parent.lastChild == this);
                        this.parent.lastChild = this.previousSibling;
                    }
                    this.parent = null;
                    this.previousSibling = null;
                    this.nextSibling = null;
                    return this;
                }
                removeChildren() {
                    while (this.lastChild != null) {
                        this.lastChild.remove();
                    }
                }
                replaceWith(node) {
                    assert(node != this);
                    assert(this.parent != null);
                    assert(node.parent == null);
                    assert(node.previousSibling == null);
                    assert(node.nextSibling == null);
                    node.parent = this.parent;
                    node.previousSibling = this.previousSibling;
                    node.nextSibling = this.nextSibling;
                    if (this.previousSibling != null) {
                        assert(this.previousSibling.nextSibling == this);
                        this.previousSibling.nextSibling = node;
                    }
                    else {
                        assert(this.parent.firstChild == this);
                        this.parent.firstChild = node;
                    }
                    if (this.nextSibling != null) {
                        assert(this.nextSibling.previousSibling == this);
                        this.nextSibling.previousSibling = node;
                    }
                    else {
                        assert(this.parent.lastChild == this);
                        this.parent.lastChild = node;
                    }
                    this.parent = null;
                    this.previousSibling = null;
                    this.nextSibling = null;
                }
                isType() {
                    return this.kind == NodeKind.TYPE || this.kind == NodeKind.POINTER_TYPE || this.symbol != null && symbol_10.isType(this.symbol.kind);
                }
                isCallValue() {
                    return this.parent.kind == NodeKind.CALL && this == this.parent.callValue();
                }
                isAssignTarget() {
                    return this.parent.kind == NodeKind.ASSIGN && this == this.parent.binaryLeft();
                }
                withRange(range) {
                    this.range = range;
                    return this;
                }
                withInternalRange(range) {
                    this.internalRange = range;
                    return this;
                }
                functionFirstArgument() {
                    assert(this.kind == NodeKind.FUNCTION);
                    assert(this.childCount() >= 2);
                    let child = this.firstChild;
                    if (child.kind == NodeKind.PARAMETERS) {
                        child = child.nextSibling;
                    }
                    return child;
                }
                functionFirstArgumentIgnoringThis() {
                    assert(this.kind == NodeKind.FUNCTION);
                    assert(this.childCount() >= 2);
                    assert(this.symbol != null);
                    let child = this.functionFirstArgument();
                    if (this.symbol.kind == symbol_10.SymbolKind.FUNCTION_INSTANCE) {
                        child = child.nextSibling;
                    }
                    return child;
                }
                functionReturnType() {
                    assert(this.kind == NodeKind.FUNCTION);
                    assert(this.childCount() >= 2);
                    assert(isExpression(this.lastChild.previousSibling));
                    return this.lastChild.previousSibling;
                }
                constructorNode() {
                    assert(this.kind == NodeKind.NEW);
                    assert(this.childCount() > 0);
                    assert(this.resolvedType.symbol.node.kind == NodeKind.CLASS);
                    return this.resolvedType.symbol.node.constructorFunctionNode;
                }
                functionBody() {
                    assert(this.kind == NodeKind.FUNCTION);
                    assert(this.childCount() >= 2);
                    assert(this.lastChild.kind == NodeKind.BLOCK || this.lastChild.kind == NodeKind.EMPTY);
                    let body = this.lastChild;
                    return body.kind == NodeKind.BLOCK ? body : null;
                }
                newType() {
                    assert(this.kind == NodeKind.NEW);
                    assert(this.childCount() >= 1);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                deleteType() {
                    assert(this.kind == NodeKind.DELETE);
                    assert(this.childCount() >= 1);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                callValue() {
                    assert(this.kind == NodeKind.CALL);
                    assert(this.childCount() >= 1);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                castValue() {
                    assert(this.kind == NodeKind.CAST);
                    assert(this.childCount() == 2);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                castType() {
                    assert(this.kind == NodeKind.CAST);
                    assert(this.childCount() == 2);
                    assert(isExpression(this.lastChild));
                    return this.lastChild;
                }
                alignOfType() {
                    assert(this.kind == NodeKind.ALIGN_OF);
                    assert(this.childCount() == 1);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                sizeOfType() {
                    assert(this.kind == NodeKind.SIZE_OF);
                    assert(this.childCount() == 1);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                dotTarget() {
                    assert(this.kind == NodeKind.DOT);
                    assert(this.childCount() == 1);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                returnValue() {
                    assert(this.kind == NodeKind.RETURN);
                    assert(this.childCount() <= 1);
                    assert(this.firstChild == null || isExpression(this.firstChild));
                    return this.firstChild;
                }
                deleteValue() {
                    assert(this.kind == NodeKind.DELETE);
                    assert(this.childCount() <= 1);
                    assert(this.firstChild == null || isExpression(this.firstChild));
                    return this.firstChild;
                }
                extendsType() {
                    assert(this.kind == NodeKind.EXTENDS);
                    assert(this.childCount() == 1);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                firstGenericType() {
                    assert(this.firstChild.kind == NodeKind.PARAMETERS);
                    assert(this.firstChild.childCount() > 0);
                    return this.firstChild.firstChild;
                }
                variableType() {
                    assert(this.kind == NodeKind.VARIABLE);
                    assert(this.childCount() <= 2);
                    assert(isExpression(this.firstChild) || this.firstChild.kind == NodeKind.EMPTY);
                    let type = this.firstChild;
                    return type.kind != NodeKind.EMPTY ? type : null;
                }
                variableValue() {
                    assert(this.kind == NodeKind.VARIABLE);
                    assert(this.childCount() <= 2);
                    assert(this.firstChild.nextSibling == null || isExpression(this.firstChild.nextSibling));
                    return this.firstChild.nextSibling;
                }
                hasVariableValue() {
                    assert(this.kind == NodeKind.VARIABLE);
                    return this.firstChild != undefined && this.firstChild.nextSibling != undefined;
                }
                expressionValue() {
                    assert(this.kind == NodeKind.EXPRESSION);
                    assert(this.childCount() == 1);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                binaryLeft() {
                    assert(isBinary(this.kind));
                    assert(this.childCount() == 2);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                binaryRight() {
                    assert(isBinary(this.kind));
                    assert(this.childCount() == 2);
                    assert(isExpression(this.lastChild));
                    return this.lastChild;
                }
                unaryValue() {
                    assert(isUnary(this.kind));
                    assert(this.childCount() == 1);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                whileValue() {
                    assert(this.kind == NodeKind.WHILE);
                    assert(this.childCount() == 2);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                whileBody() {
                    assert(this.kind == NodeKind.WHILE);
                    assert(this.childCount() == 2);
                    assert(this.lastChild.kind == NodeKind.BLOCK);
                    return this.lastChild;
                }
                hookValue() {
                    assert(this.kind == NodeKind.HOOK);
                    assert(this.childCount() == 3);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                hookTrue() {
                    assert(this.kind == NodeKind.HOOK);
                    assert(this.childCount() == 3);
                    assert(isExpression(this.firstChild.nextSibling));
                    return this.firstChild.nextSibling;
                }
                hookFalse() {
                    assert(this.kind == NodeKind.HOOK);
                    assert(this.childCount() == 3);
                    assert(isExpression(this.lastChild));
                    return this.lastChild;
                }
                indexTarget() {
                    assert(this.kind == NodeKind.INDEX);
                    assert(this.childCount() >= 1);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                ifValue() {
                    assert(this.kind == NodeKind.IF);
                    assert(this.childCount() == 2 || this.childCount() == 3);
                    assert(isExpression(this.firstChild));
                    return this.firstChild;
                }
                ifTrue() {
                    assert(this.kind == NodeKind.IF);
                    assert(this.childCount() == 2 || this.childCount() == 3);
                    assert(this.firstChild.nextSibling.kind == NodeKind.BLOCK);
                    return this.firstChild.nextSibling;
                }
                ifFalse() {
                    assert(this.kind == NodeKind.IF);
                    assert(this.childCount() == 2 || this.childCount() == 3);
                    assert(this.firstChild.nextSibling.nextSibling == null || this.firstChild.nextSibling.nextSibling.kind == NodeKind.BLOCK);
                    return this.firstChild.nextSibling.nextSibling;
                }
                expandCallIntoOperatorTree() {
                    if (this.kind != NodeKind.CALL) {
                        return false;
                    }
                    let value = this.callValue();
                    let symbol = value.symbol;
                    if (value.kind == NodeKind.DOT && symbol.node.isOperator() && symbol.node.isDeclare()) {
                        let binaryKind = NodeKind.NULL;
                        if (symbol.name == "%")
                            binaryKind = NodeKind.REMAINDER;
                        else if (symbol.name == "&")
                            binaryKind = NodeKind.BITWISE_AND;
                        else if (symbol.name == "*")
                            binaryKind = NodeKind.MULTIPLY;
                        else if (symbol.name == "**")
                            binaryKind = NodeKind.EXPONENT;
                        else if (symbol.name == "/")
                            binaryKind = NodeKind.DIVIDE;
                        else if (symbol.name == "<")
                            binaryKind = NodeKind.LESS_THAN;
                        else if (symbol.name == "<<")
                            binaryKind = NodeKind.SHIFT_LEFT;
                        else if (symbol.name == "==")
                            binaryKind = NodeKind.EQUAL;
                        else if (symbol.name == ">")
                            binaryKind = NodeKind.GREATER_THAN;
                        else if (symbol.name == ">>")
                            binaryKind = NodeKind.SHIFT_RIGHT;
                        else if (symbol.name == "[]")
                            binaryKind = NodeKind.INDEX;
                        else if (symbol.name == "^")
                            binaryKind = NodeKind.BITWISE_XOR;
                        else if (symbol.name == "|")
                            binaryKind = NodeKind.BITWISE_OR;
                        if (binaryKind != NodeKind.NULL) {
                            this.kind = binaryKind;
                            value.remove();
                            this.insertChildBefore(this.firstChild, value.dotTarget().remove());
                            return true;
                        }
                        else if (symbol.name == "[]=") {
                            this.kind = NodeKind.ASSIGN;
                            let target = createIndex(value.remove().dotTarget().remove());
                            target.appendChild(this.firstChild.remove());
                            this.insertChildBefore(this.firstChild, target);
                            return true;
                        }
                    }
                    return false;
                }
                arrayLength() {
                    assert(this.kind == NodeKind.NEW);
                    assert(this.childCount() >= 1);
                    assert(isExpression(this.firstChild));
                    assert(this.firstChild.resolvedType.isArray());
                    return this.firstChild.nextSibling;
                }
            };
            exports_23("Node", Node);
        }
    };
});
System.register("log", ["stringbuilder"], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    function createRange(source, start, end) {
        assert(start <= end);
        var range = new Range();
        range.source = source;
        range.start = start;
        range.end = end;
        return range;
    }
    exports_24("createRange", createRange);
    function spanRanges(left, right) {
        assert(left.source == right.source);
        assert(left.start <= right.start);
        assert(left.end <= right.end);
        return createRange(left.source, left.start, right.end);
    }
    exports_24("spanRanges", spanRanges);
    var stringbuilder_13, LineColumn, Source, Range, DiagnosticKind, Diagnostic, Log;
    return {
        setters: [
            function (stringbuilder_13_1) {
                stringbuilder_13 = stringbuilder_13_1;
            }
        ],
        execute: function () {
            LineColumn = class LineColumn {
            };
            exports_24("LineColumn", LineColumn);
            Source = class Source {
                indexToLineColumn(index) {
                    var contents = this.contents;
                    var column = 0;
                    var line = 0;
                    var i = 0;
                    // Just count the number of lines from the beginning of the file for now
                    while (i < index) {
                        var c = contents.charCodeAt(i);
                        if (c == '\n'.charCodeAt(0)) {
                            line = line + 1;
                            column = 0;
                        }
                        else if (c < 0xDC00 || c > 0xDFFF) {
                            column = column + 1;
                        }
                        i = i + 1;
                    }
                    var location = new LineColumn();
                    location.line = line;
                    location.column = column;
                    return location;
                }
            };
            exports_24("Source", Source);
            Range = class Range {
                toString() {
                    return this.source.contents.slice(this.start, this.end);
                }
                equals(other) {
                    return this.source == other.source && this.start == other.start && this.end == other.end;
                }
                enclosingLine() {
                    var contents = this.source.contents;
                    var start = this.start;
                    var end = this.start;
                    while (start > 0 && contents[start - 1] != '\n') {
                        start = start - 1;
                    }
                    var length = contents.length;
                    while (end < length && contents[end] != '\n') {
                        end = end + 1;
                    }
                    return createRange(this.source, start, end);
                }
                rangeAtEnd() {
                    return createRange(this.source, this.end, this.end);
                }
            };
            exports_24("Range", Range);
            (function (DiagnosticKind) {
                DiagnosticKind[DiagnosticKind["ERROR"] = 0] = "ERROR";
                DiagnosticKind[DiagnosticKind["WARNING"] = 1] = "WARNING";
            })(DiagnosticKind || (DiagnosticKind = {}));
            exports_24("DiagnosticKind", DiagnosticKind);
            Diagnostic = class Diagnostic {
                appendSourceName(builder, location) {
                    builder
                        .append(this.range.source.name)
                        .append(':')
                        .append((location.line + 1).toString())
                        .append(':')
                        .append((location.column + 1).toString())
                        .append(": ");
                }
                appendKind(builder) {
                    builder.append(this.kind == DiagnosticKind.ERROR ? "error: " : "warning: ");
                }
                appendMessage(builder) {
                    builder.append(this.message).append('\n');
                }
                appendLineContents(builder, location) {
                    var range = this.range.enclosingLine();
                    builder.appendSlice(range.source.contents, range.start, range.end).append('\n');
                }
                appendRange(builder, location) {
                    var range = this.range;
                    var column = location.column;
                    var contents = range.source.contents;
                    // Whitespace
                    while (column > 0) {
                        builder.append(' ');
                        column = column - 1;
                    }
                    // Single character
                    if (range.end - range.start <= 1) {
                        builder.append('^');
                    }
                    else {
                        var i = range.start;
                        while (i < range.end && contents[i] != '\n') {
                            builder.append('~');
                            i = i + 1;
                        }
                    }
                    builder.append('\n');
                }
            };
            exports_24("Diagnostic", Diagnostic);
            Log = class Log {
                error(range, message) {
                    this.append(range, message, DiagnosticKind.ERROR);
                }
                warning(range, message) {
                    this.append(range, message, DiagnosticKind.WARNING);
                }
                append(range, message, kind) {
                    var diagnostic = new Diagnostic();
                    diagnostic.range = range;
                    diagnostic.message = message;
                    diagnostic.kind = kind;
                    if (this.first == null)
                        this.first = diagnostic;
                    else
                        this.last.next = diagnostic;
                    this.last = diagnostic;
                }
                toString() {
                    var builder = stringbuilder_13.StringBuilder_new();
                    var diagnostic = this.first;
                    while (diagnostic != null) {
                        var location = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);
                        diagnostic.appendSourceName(builder, location);
                        diagnostic.appendKind(builder);
                        diagnostic.appendMessage(builder);
                        diagnostic.appendLineContents(builder, location);
                        diagnostic.appendRange(builder, location);
                        diagnostic = diagnostic.next;
                    }
                    return builder.finish();
                }
                hasErrors() {
                    var diagnostic = this.first;
                    while (diagnostic != null) {
                        if (diagnostic.kind == DiagnosticKind.ERROR) {
                            return true;
                        }
                        diagnostic = diagnostic.next;
                    }
                    return false;
                }
            };
            exports_24("Log", Log);
        }
    };
});
System.register("main", ["log", "stringbuilder", "compiler"], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    function writeLogToTerminal(log) {
        let diagnostic = log.first;
        while (diagnostic != null) {
            let location = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);
            // Source
            let builder = stringbuilder_14.StringBuilder_new();
            diagnostic.appendSourceName(builder, location);
            stdlib.Terminal_setColor(Color.BOLD);
            stdlib.Terminal_write(builder.finish());
            // Kind
            builder = stringbuilder_14.StringBuilder_new();
            diagnostic.appendKind(builder);
            stdlib.Terminal_setColor(diagnostic.kind == log_6.DiagnosticKind.ERROR ? Color.RED : Color.MAGENTA);
            stdlib.Terminal_write(builder.finish());
            // Message
            builder = stringbuilder_14.StringBuilder_new();
            diagnostic.appendMessage(builder);
            stdlib.Terminal_setColor(Color.BOLD);
            stdlib.Terminal_write(builder.finish());
            // Line contents
            builder = stringbuilder_14.StringBuilder_new();
            diagnostic.appendLineContents(builder, location);
            stdlib.Terminal_setColor(Color.DEFAULT);
            stdlib.Terminal_write(builder.finish());
            // Range
            builder = stringbuilder_14.StringBuilder_new();
            diagnostic.appendRange(builder, location);
            stdlib.Terminal_setColor(Color.GREEN);
            stdlib.Terminal_write(builder.finish());
            diagnostic = diagnostic.next;
        }
        stdlib.Terminal_setColor(Color.DEFAULT);
    }
    exports_25("writeLogToTerminal", writeLogToTerminal);
    function printError(text) {
        stdlib.Terminal_setColor(Color.RED);
        stdlib.Terminal_write("error: ");
        stdlib.Terminal_setColor(Color.BOLD);
        stdlib.Terminal_write(text);
        stdlib.Terminal_write("\n");
        stdlib.Terminal_setColor(Color.DEFAULT);
    }
    exports_25("printError", printError);
    function main_addArgument(text) {
        let argument = new CommandLineArgument();
        argument.text = text;
        if (firstArgument == null)
            firstArgument = argument;
        else
            lastArgument.next = argument;
        lastArgument = argument;
    }
    exports_25("main_addArgument", main_addArgument);
    function main_reset() {
        firstArgument = null;
        lastArgument = null;
    }
    exports_25("main_reset", main_reset);
    function printUsage() {
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
    exports_25("printUsage", printUsage);
    function main_entry() {
        let target = compiler_4.CompileTarget.NONE;
        let argument = firstArgument;
        let inputCount = 0;
        let output;
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
                }
                else if (text == "--c") {
                    target = compiler_4.CompileTarget.C;
                }
                else if (text == "--js") {
                    target = compiler_4.CompileTarget.JAVASCRIPT;
                }
                else if (text == "--turbo-js") {
                    target = compiler_4.CompileTarget.TURBO_JAVASCRIPT;
                }
                else if (text == "--asmjs") {
                    target = compiler_4.CompileTarget.ASMJS;
                }
                else if (text == "--wasm") {
                    target = compiler_4.CompileTarget.WEBASSEMBLY;
                }
                else if (text == "--define" && argument.next != null) {
                    argument = argument.next;
                }
                else if (text == "--out" && argument.next != null) {
                    argument = argument.next;
                    output = argument.text;
                }
                else {
                    printError(stringbuilder_14.StringBuilder_new().append("Invalid flag: ").append(text).finish());
                    return 1;
                }
            }
            else {
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
        if (target == compiler_4.CompileTarget.NONE) {
            if (output.endsWith(".wasm"))
                target = compiler_4.CompileTarget.WEBASSEMBLY;
            else if (output.endsWith(".asm.js"))
                target = compiler_4.CompileTarget.ASMJS;
            else {
                // printError("Missing a target (use either --c, --js, --asmjs or --wasm)");
                printError("Missing a target (use either --asmjs or --wasm)");
                return 1;
            }
        }
        // Start the compilation
        let compiler = new compiler_4.Compiler();
        compiler.initialize(target, output);
        // Second pass over the argument list
        argument = firstArgument;
        while (argument != null) {
            let text = argument.text;
            if (text == "--define") {
                argument = argument.next;
                compiler.preprocessor.define(argument.text, true);
            }
            else if (text == "--out") {
                argument = argument.next;
            }
            else if (!text.startsWith("-")) {
                let contents = stdlib.IO_readTextFile(text);
                if (contents == null) {
                    printError(stringbuilder_14.StringBuilder_new().append("Cannot read from ").append(text).finish());
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
            if (target == compiler_4.CompileTarget.C && stdlib.IO_writeTextFile(output, compiler.outputC) &&
                stdlib.IO_writeTextFile(compiler_4.replaceFileExtension(output, ".h"), compiler.outputH) ||
                target == compiler_4.CompileTarget.JAVASCRIPT && stdlib.IO_writeTextFile(output, compiler.outputJS) ||
                target == compiler_4.CompileTarget.TURBO_JAVASCRIPT && stdlib.IO_writeTextFile(output, compiler.outputJS) ||
                target == compiler_4.CompileTarget.ASMJS && stdlib.IO_writeTextFile(output, compiler.outputJS) ||
                target == compiler_4.CompileTarget.WEBASSEMBLY && stdlib.IO_writeBinaryFile(output, compiler.outputWASM) &&
                    stdlib.IO_writeTextFile(output + ".log", compiler.outputWASM.log)) {
                return 0;
            }
            printError(stringbuilder_14.StringBuilder_new().append("Cannot write to ").append(output).finish());
        }
        return 1;
    }
    exports_25("main_entry", main_entry);
    var log_6, stringbuilder_14, compiler_4, Color, CommandLineArgument, firstArgument, lastArgument, main;
    return {
        setters: [
            function (log_6_1) {
                log_6 = log_6_1;
            },
            function (stringbuilder_14_1) {
                stringbuilder_14 = stringbuilder_14_1;
            },
            function (compiler_4_1) {
                compiler_4 = compiler_4_1;
            }
        ],
        execute: function () {
            /**
             * TurboScript compiler main entry
             *
             */
            (function (Color) {
                Color[Color["DEFAULT"] = 0] = "DEFAULT";
                Color[Color["BOLD"] = 1] = "BOLD";
                Color[Color["RED"] = 2] = "RED";
                Color[Color["GREEN"] = 3] = "GREEN";
                Color[Color["MAGENTA"] = 4] = "MAGENTA";
            })(Color || (Color = {}));
            exports_25("Color", Color);
            CommandLineArgument = class CommandLineArgument {
            };
            exports_25("CommandLineArgument", CommandLineArgument);
            exports_25("main", main = {
                addArgument: main_addArgument,
                reset: main_reset,
                entry: main_entry
            });
        }
    };
});
//# sourceMappingURL=turbo.js.map