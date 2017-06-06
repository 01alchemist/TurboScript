(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("fs"));
	else if(typeof define === 'function' && define.amd)
		define(["fs"], factory);
	else if(typeof exports === 'object')
		exports["turbo"] = factory(require("fs"));
	else
		root["turbo"] = factory(root["fs"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_52__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 50);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 06.06.17.
 */
function assert(truth) {
    if (!truth) {
        if (global["debug"]) {
            debugger;
        }
        let error = new Error('Assertion failed');
        console.error(error);
        if (typeof process !== "undefined") {
            process.exit(1);
        }
        else {
            throw error;
        }
    }
}
exports.assert = assert;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
let stringBuilderPool = null;
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
exports.StringBuilder_new = StringBuilder_new;
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
exports.StringBuilder_appendQuoted = StringBuilder_appendQuoted;
class StringBuilder {
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
}
exports.StringBuilder = StringBuilder;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const stringbuilder_1 = __webpack_require__(1);
const color_1 = __webpack_require__(51);
const assert_1 = __webpack_require__(0);
const terminal_1 = __webpack_require__(13);
class LineColumn {
}
exports.LineColumn = LineColumn;
class Source {
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
}
exports.Source = Source;
class SourceRange {
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
}
exports.SourceRange = SourceRange;
function createRange(source, start, end) {
    assert_1.assert(start <= end);
    var range = new SourceRange();
    range.source = source;
    range.start = start;
    range.end = end;
    return range;
}
exports.createRange = createRange;
function spanRanges(left, right) {
    assert_1.assert(left.source == right.source);
    assert_1.assert(left.start <= right.start);
    assert_1.assert(left.end <= right.end);
    return createRange(left.source, left.start, right.end);
}
exports.spanRanges = spanRanges;
var DiagnosticKind;
(function (DiagnosticKind) {
    DiagnosticKind[DiagnosticKind["ERROR"] = 0] = "ERROR";
    DiagnosticKind[DiagnosticKind["WARNING"] = 1] = "WARNING";
})(DiagnosticKind = exports.DiagnosticKind || (exports.DiagnosticKind = {}));
class Diagnostic {
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
}
exports.Diagnostic = Diagnostic;
class Log {
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
        var builder = stringbuilder_1.StringBuilder_new();
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
}
exports.Log = Log;
function printError(text) {
    terminal_1.Terminal.setColor(color_1.Color.RED);
    terminal_1.Terminal.write("error: ");
    terminal_1.Terminal.setColor(color_1.Color.BOLD);
    terminal_1.Terminal.write(text);
    terminal_1.Terminal.write("\n");
    terminal_1.Terminal.setColor(color_1.Color.DEFAULT);
}
exports.printError = printError;
function writeLogToTerminal(log) {
    let diagnostic = log.first;
    while (diagnostic != null) {
        if (diagnostic.range !== undefined) {
            let location = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);
            // Source
            let builder = stringbuilder_1.StringBuilder_new();
            diagnostic.appendSourceName(builder, location);
            terminal_1.Terminal.setColor(color_1.Color.BOLD);
            terminal_1.Terminal.write(builder.finish());
            // Kind
            builder = stringbuilder_1.StringBuilder_new();
            diagnostic.appendKind(builder);
            terminal_1.Terminal.setColor(diagnostic.kind == DiagnosticKind.ERROR ? color_1.Color.RED : color_1.Color.MAGENTA);
            terminal_1.Terminal.write(builder.finish());
            // Message
            builder = stringbuilder_1.StringBuilder_new();
            diagnostic.appendMessage(builder);
            terminal_1.Terminal.setColor(color_1.Color.BOLD);
            terminal_1.Terminal.write(builder.finish());
            // Line contents
            builder = stringbuilder_1.StringBuilder_new();
            diagnostic.appendLineContents(builder, location);
            terminal_1.Terminal.setColor(color_1.Color.DEFAULT);
            terminal_1.Terminal.write(builder.finish());
            // SourceRange
            builder = stringbuilder_1.StringBuilder_new();
            diagnostic.appendRange(builder, location);
            terminal_1.Terminal.setColor(color_1.Color.GREEN);
            terminal_1.Terminal.write(builder.finish());
        }
        else {
            terminal_1.Terminal.setColor(color_1.Color.RED);
            terminal_1.Terminal.write(diagnostic.message + "\n");
        }
        diagnostic = diagnostic.next;
    }
    terminal_1.Terminal.setColor(color_1.Color.DEFAULT);
}
exports.writeLogToTerminal = writeLogToTerminal;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const symbol_1 = __webpack_require__(4);
const assert_1 = __webpack_require__(0);
/**
 * Author: Nidin Vinayakan
 */
var NodeKind;
(function (NodeKind) {
    // Other
    NodeKind[NodeKind["EXTENDS"] = 0] = "EXTENDS";
    NodeKind[NodeKind["FILE"] = 1] = "FILE";
    NodeKind[NodeKind["GLOBAL"] = 2] = "GLOBAL";
    NodeKind[NodeKind["IMPLEMENTS"] = 3] = "IMPLEMENTS";
    NodeKind[NodeKind["PARAMETER"] = 4] = "PARAMETER";
    NodeKind[NodeKind["PARAMETERS"] = 5] = "PARAMETERS";
    NodeKind[NodeKind["VARIABLE"] = 6] = "VARIABLE";
    NodeKind[NodeKind["IMPORT"] = 7] = "IMPORT";
    NodeKind[NodeKind["IMPORT_FROM"] = 8] = "IMPORT_FROM";
    // Statements
    NodeKind[NodeKind["BLOCK"] = 9] = "BLOCK";
    NodeKind[NodeKind["BREAK"] = 10] = "BREAK";
    NodeKind[NodeKind["MODULE"] = 11] = "MODULE";
    NodeKind[NodeKind["IMPORTS"] = 12] = "IMPORTS";
    NodeKind[NodeKind["CLASS"] = 13] = "CLASS";
    NodeKind[NodeKind["CONSTANTS"] = 14] = "CONSTANTS";
    NodeKind[NodeKind["CONTINUE"] = 15] = "CONTINUE";
    NodeKind[NodeKind["EMPTY"] = 16] = "EMPTY";
    NodeKind[NodeKind["ENUM"] = 17] = "ENUM";
    NodeKind[NodeKind["EXPRESSION"] = 18] = "EXPRESSION";
    NodeKind[NodeKind["FUNCTION"] = 19] = "FUNCTION";
    NodeKind[NodeKind["IF"] = 20] = "IF";
    NodeKind[NodeKind["RETURN"] = 21] = "RETURN";
    NodeKind[NodeKind["UNSAFE"] = 22] = "UNSAFE";
    NodeKind[NodeKind["JAVASCRIPT"] = 23] = "JAVASCRIPT";
    NodeKind[NodeKind["START"] = 24] = "START";
    NodeKind[NodeKind["VARIABLES"] = 25] = "VARIABLES";
    NodeKind[NodeKind["WHILE"] = 26] = "WHILE";
    // Expressions
    NodeKind[NodeKind["ALIGN_OF"] = 27] = "ALIGN_OF";
    NodeKind[NodeKind["BOOLEAN"] = 28] = "BOOLEAN";
    NodeKind[NodeKind["CALL"] = 29] = "CALL";
    NodeKind[NodeKind["CAST"] = 30] = "CAST";
    NodeKind[NodeKind["DOT"] = 31] = "DOT";
    NodeKind[NodeKind["HOOK"] = 32] = "HOOK";
    NodeKind[NodeKind["INDEX"] = 33] = "INDEX";
    NodeKind[NodeKind["ANY"] = 34] = "ANY";
    NodeKind[NodeKind["INT32"] = 35] = "INT32";
    NodeKind[NodeKind["INT64"] = 36] = "INT64";
    NodeKind[NodeKind["FLOAT32"] = 37] = "FLOAT32";
    NodeKind[NodeKind["FLOAT64"] = 38] = "FLOAT64";
    NodeKind[NodeKind["ARRAY"] = 39] = "ARRAY";
    NodeKind[NodeKind["GENERIC"] = 40] = "GENERIC";
    NodeKind[NodeKind["NAME"] = 41] = "NAME";
    NodeKind[NodeKind["NEW"] = 42] = "NEW";
    NodeKind[NodeKind["DELETE"] = 43] = "DELETE";
    NodeKind[NodeKind["NULL"] = 44] = "NULL";
    NodeKind[NodeKind["UNDEFINED"] = 45] = "UNDEFINED";
    NodeKind[NodeKind["PARSE_ERROR"] = 46] = "PARSE_ERROR";
    NodeKind[NodeKind["SIZE_OF"] = 47] = "SIZE_OF";
    NodeKind[NodeKind["STRING"] = 48] = "STRING";
    NodeKind[NodeKind["THIS"] = 49] = "THIS";
    NodeKind[NodeKind["TYPE"] = 50] = "TYPE";
    // Unary expressions
    NodeKind[NodeKind["ADDRESS_OF"] = 51] = "ADDRESS_OF";
    NodeKind[NodeKind["COMPLEMENT"] = 52] = "COMPLEMENT";
    NodeKind[NodeKind["DEREFERENCE"] = 53] = "DEREFERENCE";
    NodeKind[NodeKind["NEGATIVE"] = 54] = "NEGATIVE";
    NodeKind[NodeKind["NOT"] = 55] = "NOT";
    NodeKind[NodeKind["POINTER_TYPE"] = 56] = "POINTER_TYPE";
    NodeKind[NodeKind["POSITIVE"] = 57] = "POSITIVE";
    NodeKind[NodeKind["POSTFIX_DECREMENT"] = 58] = "POSTFIX_DECREMENT";
    NodeKind[NodeKind["POSTFIX_INCREMENT"] = 59] = "POSTFIX_INCREMENT";
    NodeKind[NodeKind["PREFIX_DECREMENT"] = 60] = "PREFIX_DECREMENT";
    NodeKind[NodeKind["PREFIX_INCREMENT"] = 61] = "PREFIX_INCREMENT";
    // Binary expressions
    NodeKind[NodeKind["ADD"] = 62] = "ADD";
    NodeKind[NodeKind["ASSIGN"] = 63] = "ASSIGN";
    NodeKind[NodeKind["BITWISE_AND"] = 64] = "BITWISE_AND";
    NodeKind[NodeKind["BITWISE_OR"] = 65] = "BITWISE_OR";
    NodeKind[NodeKind["BITWISE_XOR"] = 66] = "BITWISE_XOR";
    NodeKind[NodeKind["DIVIDE"] = 67] = "DIVIDE";
    NodeKind[NodeKind["EQUAL"] = 68] = "EQUAL";
    NodeKind[NodeKind["EXPONENT"] = 69] = "EXPONENT";
    NodeKind[NodeKind["GREATER_THAN"] = 70] = "GREATER_THAN";
    NodeKind[NodeKind["GREATER_THAN_EQUAL"] = 71] = "GREATER_THAN_EQUAL";
    NodeKind[NodeKind["LESS_THAN"] = 72] = "LESS_THAN";
    NodeKind[NodeKind["LESS_THAN_EQUAL"] = 73] = "LESS_THAN_EQUAL";
    NodeKind[NodeKind["LOGICAL_AND"] = 74] = "LOGICAL_AND";
    NodeKind[NodeKind["LOGICAL_OR"] = 75] = "LOGICAL_OR";
    NodeKind[NodeKind["MULTIPLY"] = 76] = "MULTIPLY";
    NodeKind[NodeKind["NOT_EQUAL"] = 77] = "NOT_EQUAL";
    NodeKind[NodeKind["REMAINDER"] = 78] = "REMAINDER";
    NodeKind[NodeKind["SHIFT_LEFT"] = 79] = "SHIFT_LEFT";
    NodeKind[NodeKind["SHIFT_RIGHT"] = 80] = "SHIFT_RIGHT";
    NodeKind[NodeKind["SUBTRACT"] = 81] = "SUBTRACT";
    //JavaScript
    NodeKind[NodeKind["JS_NUMBER"] = 82] = "JS_NUMBER";
    NodeKind[NodeKind["JS_OBJECT"] = 83] = "JS_OBJECT";
    NodeKind[NodeKind["JS_STRING"] = 84] = "JS_STRING";
    NodeKind[NodeKind["JS_ARRAY"] = 85] = "JS_ARRAY";
})(NodeKind = exports.NodeKind || (exports.NodeKind = {}));
function isUnary(kind) {
    return kind >= NodeKind.ADDRESS_OF && kind <= NodeKind.PREFIX_INCREMENT;
}
exports.isUnary = isUnary;
function isUnaryPostfix(kind) {
    return kind >= NodeKind.POSTFIX_DECREMENT && kind <= NodeKind.POSTFIX_INCREMENT;
}
exports.isUnaryPostfix = isUnaryPostfix;
function isBinary(kind) {
    return kind >= NodeKind.ADD && kind <= NodeKind.SUBTRACT;
}
exports.isBinary = isBinary;
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
exports.invertedBinaryKind = invertedBinaryKind;
function isExpression(node) {
    return node.kind >= NodeKind.ALIGN_OF && node.kind <= NodeKind.SUBTRACT;
}
exports.isExpression = isExpression;
function isCompactNodeKind(kind) {
    return kind == NodeKind.CONSTANTS || kind == NodeKind.EXPRESSION || kind == NodeKind.VARIABLES;
}
exports.isCompactNodeKind = isCompactNodeKind;
exports.NODE_FLAG_DECLARE = 1 << 0;
exports.NODE_FLAG_EXPORT = 1 << 1;
exports.NODE_FLAG_IMPORT = 1 << 2;
exports.NODE_FLAG_LIBRARY = 1 << 3;
exports.NODE_FLAG_GET = 1 << 4;
exports.NODE_FLAG_OPERATOR = 1 << 5;
exports.NODE_FLAG_POSITIVE = 1 << 6;
exports.NODE_FLAG_PRIVATE = 1 << 7;
exports.NODE_FLAG_PROTECTED = 1 << 8;
exports.NODE_FLAG_PUBLIC = 1 << 9;
exports.NODE_FLAG_SET = 1 << 10;
exports.NODE_FLAG_STATIC = 1 << 11;
exports.NODE_FLAG_UNSAFE = 1 << 12;
exports.NODE_FLAG_JAVASCRIPT = 1 << 13;
exports.NODE_FLAG_UNSIGNED_OPERATOR = 1 << 14;
exports.NODE_FLAG_VIRTUAL = 1 << 15;
exports.NODE_FLAG_START = 1 << 16;
exports.NODE_FLAG_ANYFUNC = 1 << 17;
exports.NODE_FLAG_GENERIC = 1 << 18;
class NodeFlag {
}
exports.NodeFlag = NodeFlag;
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
exports.appendFlag = appendFlag;
function allFlags(link) {
    let all = 0;
    while (link != null) {
        all = all | link.flag;
        link = link.next;
    }
    return all;
}
exports.allFlags = allFlags;
function rangeForFlag(link, flag) {
    while (link != null) {
        if (link.flag == flag) {
            return link.range;
        }
        link = link.next;
    }
    return null;
}
exports.rangeForFlag = rangeForFlag;
class Node {
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
        if (this.offset !== undefined)
            node.offset = this.offset;
        if (this.flags !== undefined)
            node.flags = this.flags;
        if (this.firstFlag !== undefined)
            node.firstFlag = this.firstFlag;
        // if(this.constructorFunctionNode) node.constructorFunctionNode = this.constructorFunctionNode;
        if (this.range !== undefined)
            node.range = this.range;
        if (this.internalRange !== undefined)
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
    becomeBooleanConstant(value) {
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
        return (this.flags & exports.NODE_FLAG_DECLARE) != 0;
    }
    isLibrary() {
        return (this.flags & exports.NODE_FLAG_LIBRARY) != 0;
    }
    isVirtual() {
        return (this.flags & exports.NODE_FLAG_VIRTUAL) != 0;
    }
    isExport() {
        return (this.flags & exports.NODE_FLAG_EXPORT) != 0;
    }
    isImport() {
        return (this.flags & exports.NODE_FLAG_IMPORT) != 0;
    }
    isExternalImport() {
        return this.isDeclare() && !this.isLibrary();
    }
    isStart() {
        return (this.flags & exports.NODE_FLAG_START) != 0;
    }
    isJavaScript() {
        return (this.flags & exports.NODE_FLAG_JAVASCRIPT) != 0;
    }
    isStatic() {
        return (this.flags & exports.NODE_FLAG_STATIC) != 0;
    }
    isAnyfunc() {
        return (this.flags & exports.NODE_FLAG_ANYFUNC) != 0;
    }
    isDeclareOrJavaScript() {
        return (this.flags & (exports.NODE_FLAG_DECLARE | exports.NODE_FLAG_JAVASCRIPT)) != 0;
    }
    isDeclareOrExport() {
        return (this.flags & (exports.NODE_FLAG_DECLARE | exports.NODE_FLAG_EXPORT)) != 0;
    }
    isGet() {
        return (this.flags & exports.NODE_FLAG_GET) != 0;
    }
    isSet() {
        return (this.flags & exports.NODE_FLAG_SET) != 0;
    }
    isOperator() {
        return (this.flags & exports.NODE_FLAG_OPERATOR) != 0;
    }
    isPositive() {
        return (this.flags & exports.NODE_FLAG_POSITIVE) != 0;
    }
    isPrivate() {
        return (this.flags & exports.NODE_FLAG_PRIVATE) != 0;
    }
    isUnsafe() {
        return (this.flags & exports.NODE_FLAG_UNSAFE) != 0;
    }
    isGeneric() {
        return (this.flags & exports.NODE_FLAG_GENERIC) != 0;
    }
    isTemplate() {
        return this.symbol && (this.symbol.flags & symbol_1.SYMBOL_FLAG_IS_TEMPLATE) != 0;
    }
    isUnsignedOperator() {
        return (this.flags & exports.NODE_FLAG_UNSIGNED_OPERATOR) != 0;
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
        assert_1.assert(before != after);
        assert_1.assert(before.parent == null);
        assert_1.assert(before.previousSibling == null);
        assert_1.assert(before.nextSibling == null);
        assert_1.assert(after == null || after.parent == this);
        if (after == null) {
            this.appendChild(before);
            return;
        }
        before.parent = this;
        before.previousSibling = after.previousSibling;
        before.nextSibling = after;
        if (after.previousSibling != null) {
            assert_1.assert(after == after.previousSibling.nextSibling);
            after.previousSibling.nextSibling = before;
        }
        else {
            assert_1.assert(after == this.firstChild);
            this.firstChild = before;
        }
        after.previousSibling = before;
    }
    insertChildAfter(before, after) {
        if (after == null) {
            return;
        }
        assert_1.assert(before != after);
        assert_1.assert(after.parent == null);
        assert_1.assert(after.previousSibling == null);
        assert_1.assert(after.nextSibling == null);
        assert_1.assert(before == null || before.parent == this);
        if (before == null) {
            this.appendChild(after);
            return;
        }
        after.parent = this;
        after.previousSibling = before;
        after.nextSibling = before.nextSibling;
        if (before.nextSibling != null) {
            assert_1.assert(before == before.nextSibling.previousSibling);
            before.nextSibling.previousSibling = after;
        }
        before.nextSibling = after;
    }
    remove() {
        assert_1.assert(this.parent != null);
        if (this.previousSibling != null) {
            assert_1.assert(this.previousSibling.nextSibling == this);
            this.previousSibling.nextSibling = this.nextSibling;
        }
        else {
            assert_1.assert(this.parent.firstChild == this);
            this.parent.firstChild = this.nextSibling;
        }
        if (this.nextSibling != null) {
            assert_1.assert(this.nextSibling.previousSibling == this);
            this.nextSibling.previousSibling = this.previousSibling;
        }
        else {
            assert_1.assert(this.parent.lastChild == this);
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
        assert_1.assert(node != this);
        assert_1.assert(this.parent != null);
        assert_1.assert(node.parent == null);
        assert_1.assert(node.previousSibling == null);
        assert_1.assert(node.nextSibling == null);
        node.parent = this.parent;
        node.previousSibling = this.previousSibling;
        node.nextSibling = this.nextSibling;
        if (this.previousSibling != null) {
            assert_1.assert(this.previousSibling.nextSibling == this);
            this.previousSibling.nextSibling = node;
        }
        else {
            assert_1.assert(this.parent.firstChild == this);
            this.parent.firstChild = node;
        }
        if (this.nextSibling != null) {
            assert_1.assert(this.nextSibling.previousSibling == this);
            this.nextSibling.previousSibling = node;
        }
        else {
            assert_1.assert(this.parent.lastChild == this);
            this.parent.lastChild = node;
        }
        this.parent = null;
        this.previousSibling = null;
        this.nextSibling = null;
    }
    isType() {
        return this.kind == NodeKind.TYPE || this.kind == NodeKind.POINTER_TYPE || this.symbol != null && symbol_1.isType(this.symbol.kind);
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
        assert_1.assert(this.kind == NodeKind.FUNCTION);
        assert_1.assert(this.childCount() >= 2);
        let child = this.firstChild;
        if (child.kind == NodeKind.PARAMETERS) {
            child = child.nextSibling;
        }
        return child;
    }
    functionLastArgument() {
        assert_1.assert(this.kind == NodeKind.FUNCTION);
        assert_1.assert(this.childCount() >= 2);
        let child = this.firstChild;
        if (child.kind == NodeKind.PARAMETERS) {
            child = child.nextSibling;
        }
        let lastArgument = null;
        while (child != null) {
            let nextChild = child.nextSibling;
            if (nextChild.kind !== NodeKind.VARIABLE) {
                lastArgument = child;
                child = null;
            }
            else {
                child = nextChild;
            }
        }
        return lastArgument;
    }
    functionFirstArgumentIgnoringThis() {
        assert_1.assert(this.kind == NodeKind.FUNCTION);
        assert_1.assert(this.childCount() >= 2);
        assert_1.assert(this.symbol != null);
        let child = this.functionFirstArgument();
        if (this.symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE) {
            child = child.nextSibling;
        }
        return child;
    }
    functionReturnType() {
        assert_1.assert(this.kind == NodeKind.FUNCTION);
        assert_1.assert(this.childCount() >= 2);
        assert_1.assert(isExpression(this.lastChild.previousSibling));
        return this.lastChild.previousSibling;
    }
    constructorNode() {
        assert_1.assert(this.kind == NodeKind.NEW);
        assert_1.assert(this.childCount() > 0);
        assert_1.assert(this.resolvedType.symbol.node.kind == NodeKind.CLASS);
        return this.resolvedType.symbol.node.constructorFunctionNode;
    }
    functionBody() {
        assert_1.assert(this.kind == NodeKind.FUNCTION);
        assert_1.assert(this.childCount() >= 2);
        assert_1.assert(this.lastChild.kind == NodeKind.BLOCK || this.lastChild.kind == NodeKind.EMPTY);
        let body = this.lastChild;
        return body.kind == NodeKind.BLOCK ? body : null;
    }
    newType() {
        assert_1.assert(this.kind == NodeKind.NEW);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    deleteType() {
        assert_1.assert(this.kind == NodeKind.DELETE);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    callValue() {
        assert_1.assert(this.kind == NodeKind.CALL);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    castValue() {
        assert_1.assert(this.kind == NodeKind.CAST);
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    castType() {
        assert_1.assert(this.kind == NodeKind.CAST);
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(isExpression(this.lastChild));
        return this.lastChild;
    }
    alignOfType() {
        assert_1.assert(this.kind == NodeKind.ALIGN_OF);
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    sizeOfType() {
        assert_1.assert(this.kind == NodeKind.SIZE_OF);
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    dotTarget() {
        assert_1.assert(this.kind == NodeKind.DOT);
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    returnValue() {
        assert_1.assert(this.kind == NodeKind.RETURN);
        assert_1.assert(this.childCount() <= 1);
        assert_1.assert(this.firstChild == null || isExpression(this.firstChild));
        return this.firstChild;
    }
    ifReturnNode() {
        assert_1.assert(this.kind == NodeKind.IF);
        assert_1.assert(this.firstChild !== null);
        assert_1.assert(this.firstChild.nextSibling !== null);
        return this.firstChild.nextSibling.returnNode || null;
    }
    deleteValue() {
        assert_1.assert(this.kind == NodeKind.DELETE);
        assert_1.assert(this.childCount() <= 1);
        assert_1.assert(this.firstChild == null || isExpression(this.firstChild));
        return this.firstChild;
    }
    extendsType() {
        assert_1.assert(this.kind == NodeKind.EXTENDS);
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    firstGenericType() {
        assert_1.assert(this.firstChild.kind == NodeKind.PARAMETERS);
        assert_1.assert(this.firstChild.childCount() > 0);
        return this.firstChild.firstChild;
    }
    variableType() {
        assert_1.assert(this.kind == NodeKind.VARIABLE);
        assert_1.assert(this.childCount() <= 2);
        assert_1.assert(isExpression(this.firstChild) || this.firstChild.kind == NodeKind.EMPTY);
        let type = this.firstChild;
        return type.kind != NodeKind.EMPTY ? type : null;
    }
    variableValue() {
        assert_1.assert(this.kind == NodeKind.VARIABLE);
        assert_1.assert(this.childCount() <= 2);
        assert_1.assert(this.firstChild.nextSibling == null || isExpression(this.firstChild.nextSibling));
        return this.firstChild.nextSibling;
    }
    hasVariableValue() {
        assert_1.assert(this.kind == NodeKind.VARIABLE);
        return this.firstChild != undefined && this.firstChild.nextSibling != undefined;
    }
    expressionValue() {
        assert_1.assert(this.kind == NodeKind.EXPRESSION);
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    binaryLeft() {
        assert_1.assert(isBinary(this.kind));
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    binaryRight() {
        assert_1.assert(isBinary(this.kind));
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(isExpression(this.lastChild));
        return this.lastChild;
    }
    unaryValue() {
        assert_1.assert(isUnary(this.kind));
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    whileValue() {
        assert_1.assert(this.kind == NodeKind.WHILE);
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    whileBody() {
        assert_1.assert(this.kind == NodeKind.WHILE);
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(this.lastChild.kind == NodeKind.BLOCK);
        return this.lastChild;
    }
    hookValue() {
        assert_1.assert(this.kind == NodeKind.HOOK);
        assert_1.assert(this.childCount() == 3);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    hookTrue() {
        assert_1.assert(this.kind == NodeKind.HOOK);
        assert_1.assert(this.childCount() == 3);
        assert_1.assert(isExpression(this.firstChild.nextSibling));
        return this.firstChild.nextSibling;
    }
    hookFalse() {
        assert_1.assert(this.kind == NodeKind.HOOK);
        assert_1.assert(this.childCount() == 3);
        assert_1.assert(isExpression(this.lastChild));
        return this.lastChild;
    }
    indexTarget() {
        assert_1.assert(this.kind == NodeKind.INDEX);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    ifValue() {
        assert_1.assert(this.kind == NodeKind.IF);
        assert_1.assert(this.childCount() == 2 || this.childCount() == 3);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    }
    ifTrue() {
        assert_1.assert(this.kind == NodeKind.IF);
        assert_1.assert(this.childCount() == 2 || this.childCount() == 3);
        assert_1.assert(this.firstChild.nextSibling.kind == NodeKind.BLOCK);
        return this.firstChild.nextSibling;
    }
    ifFalse() {
        assert_1.assert(this.kind == NodeKind.IF);
        assert_1.assert(this.childCount() == 2 || this.childCount() == 3);
        assert_1.assert(this.firstChild.nextSibling.nextSibling == null || this.firstChild.nextSibling.nextSibling.kind == NodeKind.BLOCK);
        return this.firstChild.nextSibling.nextSibling || null;
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
        assert_1.assert(this.kind == NodeKind.NEW);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        assert_1.assert(this.firstChild.resolvedType.isArray());
        return this.firstChild.nextSibling;
    }
}
exports.Node = Node;
function createNew(type) {
    assert_1.assert(isExpression(type));
    let node = new Node();
    node.kind = NodeKind.NEW;
    node.appendChild(type);
    return node;
}
exports.createNew = createNew;
function createDelete(value) {
    assert_1.assert(value == null || isExpression(value));
    let node = new Node();
    node.kind = NodeKind.DELETE;
    if (value != null) {
        node.appendChild(value);
    }
    return node;
}
exports.createDelete = createDelete;
function createHook(test, primary, secondary) {
    assert_1.assert(isExpression(test));
    assert_1.assert(isExpression(primary));
    assert_1.assert(isExpression(secondary));
    let node = new Node();
    node.kind = NodeKind.HOOK;
    node.appendChild(test);
    node.appendChild(primary);
    node.appendChild(secondary);
    return node;
}
exports.createHook = createHook;
function createIndex(target) {
    assert_1.assert(isExpression(target));
    let node = new Node();
    node.kind = NodeKind.INDEX;
    node.appendChild(target);
    return node;
}
exports.createIndex = createIndex;
function createNull() {
    let node = new Node();
    node.kind = NodeKind.NULL;
    return node;
}
exports.createNull = createNull;
function createUndefined() {
    let node = new Node();
    node.kind = NodeKind.UNDEFINED;
    return node;
}
exports.createUndefined = createUndefined;
function createThis() {
    let node = new Node();
    node.kind = NodeKind.THIS;
    return node;
}
exports.createThis = createThis;
function createAddressOf(value) {
    assert_1.assert(isExpression(value));
    let node = new Node();
    node.kind = NodeKind.ADDRESS_OF;
    node.appendChild(value);
    return node;
}
exports.createAddressOf = createAddressOf;
function createDereference(value) {
    assert_1.assert(isExpression(value));
    let node = new Node();
    node.kind = NodeKind.DEREFERENCE;
    node.appendChild(value);
    return node;
}
exports.createDereference = createDereference;
function createAlignOf(type) {
    assert_1.assert(isExpression(type));
    let node = new Node();
    node.kind = NodeKind.ALIGN_OF;
    node.appendChild(type);
    return node;
}
exports.createAlignOf = createAlignOf;
function createSizeOf(type) {
    assert_1.assert(isExpression(type));
    let node = new Node();
    node.kind = NodeKind.SIZE_OF;
    node.appendChild(type);
    return node;
}
exports.createSizeOf = createSizeOf;
function createboolean(value) {
    let node = new Node();
    node.kind = NodeKind.BOOLEAN;
    node.intValue = value ? 1 : 0;
    return node;
}
exports.createboolean = createboolean;
function createInt(value) {
    let node = new Node();
    node.kind = NodeKind.INT32;
    node.intValue = value;
    return node;
}
exports.createInt = createInt;
function createLong(value) {
    let node = new Node();
    node.kind = NodeKind.INT64;
    node.longValue = value;
    return node;
}
exports.createLong = createLong;
function createFloat(value) {
    let node = new Node();
    node.kind = NodeKind.FLOAT32;
    node.floatValue = value;
    return node;
}
exports.createFloat = createFloat;
function createDouble(value) {
    let node = new Node();
    node.kind = NodeKind.FLOAT64;
    node.doubleValue = value;
    return node;
}
exports.createDouble = createDouble;
function createString(value) {
    let node = new Node();
    node.kind = NodeKind.STRING;
    node.stringValue = value;
    return node;
}
exports.createString = createString;
function createArray(type) {
    let node = new Node();
    node.kind = NodeKind.ARRAY;
    node.resolvedType = type;
    return node;
}
exports.createArray = createArray;
function createName(value) {
    let node = new Node();
    node.kind = NodeKind.NAME;
    node.referenceValue = value;
    return node;
}
exports.createName = createName;
function createType(type) {
    assert_1.assert(type != null);
    let node = new Node();
    node.kind = NodeKind.TYPE;
    node.resolvedType = type;
    return node;
}
exports.createType = createType;
function createAny() {
    let node = new Node();
    node.kind = NodeKind.ANY;
    return node;
}
exports.createAny = createAny;
function createEmpty() {
    let node = new Node();
    node.kind = NodeKind.EMPTY;
    return node;
}
exports.createEmpty = createEmpty;
function createExpression(value) {
    assert_1.assert(isExpression(value));
    let node = new Node();
    node.kind = NodeKind.EXPRESSION;
    node.appendChild(value);
    return node;
}
exports.createExpression = createExpression;
function createBlock() {
    let node = new Node();
    node.kind = NodeKind.BLOCK;
    return node;
}
exports.createBlock = createBlock;
function createModule(name) {
    let node = new Node();
    node.kind = NodeKind.MODULE;
    node.stringValue = name;
    return node;
}
exports.createModule = createModule;
function createClass(name) {
    let node = new Node();
    node.kind = NodeKind.CLASS;
    node.stringValue = name;
    return node;
}
exports.createClass = createClass;
function createEnum(name) {
    let node = new Node();
    node.kind = NodeKind.ENUM;
    node.stringValue = name;
    return node;
}
exports.createEnum = createEnum;
function createIf(value, trueBranch, falseBranch) {
    assert_1.assert(isExpression(value));
    assert_1.assert(trueBranch.kind == NodeKind.BLOCK);
    assert_1.assert(falseBranch == null || falseBranch.kind == NodeKind.BLOCK);
    let node = new Node();
    node.kind = NodeKind.IF;
    node.appendChild(value);
    node.appendChild(trueBranch);
    if (falseBranch != null) {
        node.appendChild(falseBranch);
    }
    return node;
}
exports.createIf = createIf;
function createWhile(value, body) {
    assert_1.assert(isExpression(value));
    assert_1.assert(body.kind == NodeKind.BLOCK);
    let node = new Node();
    node.kind = NodeKind.WHILE;
    node.appendChild(value);
    node.appendChild(body);
    return node;
}
exports.createWhile = createWhile;
function createReturn(value) {
    assert_1.assert(value == null || isExpression(value));
    let node = new Node();
    node.kind = NodeKind.RETURN;
    if (value != null) {
        node.appendChild(value);
    }
    return node;
}
exports.createReturn = createReturn;
function createImports() {
    let node = new Node();
    node.kind = NodeKind.IMPORTS;
    return node;
}
exports.createImports = createImports;
function createImport(name) {
    let node = new Node();
    node.kind = NodeKind.IMPORT;
    node.stringValue = name;
    return node;
}
exports.createImport = createImport;
function createImportFrom(name) {
    let node = new Node();
    node.kind = NodeKind.IMPORT_FROM;
    node.stringValue = name;
    return node;
}
exports.createImportFrom = createImportFrom;
function createVariables() {
    let node = new Node();
    node.kind = NodeKind.VARIABLES;
    return node;
}
exports.createVariables = createVariables;
function createConstants() {
    let node = new Node();
    node.kind = NodeKind.CONSTANTS;
    return node;
}
exports.createConstants = createConstants;
function createParameters() {
    let node = new Node();
    node.kind = NodeKind.PARAMETERS;
    return node;
}
exports.createParameters = createParameters;
function createExtends(type) {
    assert_1.assert(isExpression(type));
    let node = new Node();
    node.kind = NodeKind.EXTENDS;
    node.appendChild(type);
    return node;
}
exports.createExtends = createExtends;
function createImplements() {
    let node = new Node();
    node.kind = NodeKind.IMPLEMENTS;
    return node;
}
exports.createImplements = createImplements;
function createParameter(name) {
    let node = new Node();
    node.kind = NodeKind.PARAMETER;
    node.stringValue = name;
    return node;
}
exports.createParameter = createParameter;
function createVariable(name, type, value) {
    assert_1.assert(type == null || isExpression(type));
    assert_1.assert(value == null || isExpression(value));
    let node = new Node();
    node.kind = NodeKind.VARIABLE;
    node.stringValue = name;
    node.appendChild(type != null ? type : createEmpty());
    if (value != null) {
        node.appendChild(value);
    }
    return node;
}
exports.createVariable = createVariable;
function createFunction(name) {
    let node = new Node();
    node.kind = NodeKind.FUNCTION;
    node.stringValue = name;
    return node;
}
exports.createFunction = createFunction;
function createUnary(kind, value) {
    assert_1.assert(isUnary(kind));
    assert_1.assert(isExpression(value));
    let node = new Node();
    node.kind = kind;
    node.appendChild(value);
    return node;
}
exports.createUnary = createUnary;
function createBinary(kind, left, right) {
    assert_1.assert(isBinary(kind));
    assert_1.assert(isExpression(left));
    assert_1.assert(isExpression(right));
    let node = new Node();
    node.kind = kind;
    node.appendChild(left);
    node.appendChild(right);
    return node;
}
exports.createBinary = createBinary;
function createCall(value) {
    assert_1.assert(isExpression(value));
    let node = new Node();
    node.kind = NodeKind.CALL;
    node.appendChild(value);
    return node;
}
exports.createCall = createCall;
function createCast(value, type) {
    assert_1.assert(isExpression(value));
    assert_1.assert(isExpression(type));
    let node = new Node();
    node.kind = NodeKind.CAST;
    node.appendChild(value);
    node.appendChild(type);
    return node;
}
exports.createCast = createCast;
function createDot(value, name) {
    assert_1.assert(isExpression(value));
    let node = new Node();
    node.kind = NodeKind.DOT;
    node.stringValue = name;
    node.appendChild(value);
    return node;
}
exports.createDot = createDot;
function createSymbolReference(symbol) {
    let node = createName(symbol.name);
    node.symbol = symbol;
    node.resolvedType = symbol.resolvedType;
    return node;
}
exports.createSymbolReference = createSymbolReference;
function createMemberReference(value, symbol) {
    let node = createDot(value, symbol.name);
    node.symbol = symbol;
    node.resolvedType = symbol.resolvedType;
    return node;
}
exports.createMemberReference = createMemberReference;
function createParseError() {
    let node = new Node();
    node.kind = NodeKind.PARSE_ERROR;
    return node;
}
exports.createParseError = createParseError;
//JavaScript
function createJSNumber() {
    let node = new Node();
    node.kind = NodeKind.JS_NUMBER;
    return node;
}
exports.createJSNumber = createJSNumber;
function createJSObject() {
    let node = new Node();
    node.kind = NodeKind.JS_OBJECT;
    return node;
}
exports.createJSObject = createJSObject;
function createJSString() {
    let node = new Node();
    node.kind = NodeKind.JS_STRING;
    return node;
}
exports.createJSString = createJSString;
function createJSArray() {
    let node = new Node();
    node.kind = NodeKind.JS_ARRAY;
    return node;
}
exports.createJSArray = createJSArray;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = __webpack_require__(3);
const utils_1 = __webpack_require__(5);
const assert_1 = __webpack_require__(0);
var SymbolKind;
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
})(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
function isModule(kind) {
    return kind == SymbolKind.TYPE_MODULE;
}
exports.isModule = isModule;
function isType(kind) {
    return kind >= SymbolKind.TYPE_CLASS && kind <= SymbolKind.TYPE_NATIVE;
}
exports.isType = isType;
function isFunction(kind) {
    return kind >= SymbolKind.FUNCTION_INSTANCE && kind <= SymbolKind.FUNCTION_GLOBAL;
}
exports.isFunction = isFunction;
function isVariable(kind) {
    return kind >= SymbolKind.VARIABLE_ARGUMENT && kind <= SymbolKind.VARIABLE_LOCAL;
}
exports.isVariable = isVariable;
var SymbolState;
(function (SymbolState) {
    SymbolState[SymbolState["UNINITIALIZED"] = 0] = "UNINITIALIZED";
    SymbolState[SymbolState["INITIALIZING"] = 1] = "INITIALIZING";
    SymbolState[SymbolState["INITIALIZED"] = 2] = "INITIALIZED";
})(SymbolState = exports.SymbolState || (exports.SymbolState = {}));
exports.SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL = 1 << 0;
exports.SYMBOL_FLAG_IS_BINARY_OPERATOR = 1 << 1;
exports.SYMBOL_FLAG_IS_REFERENCE = 1 << 2;
exports.SYMBOL_FLAG_IS_UNARY_OPERATOR = 1 << 3;
exports.SYMBOL_FLAG_IS_UNSIGNED = 1 << 4;
exports.SYMBOL_FLAG_NATIVE_INTEGER = 1 << 5;
exports.SYMBOL_FLAG_NATIVE_LONG = 1 << 6;
exports.SYMBOL_FLAG_NATIVE_FLOAT = 1 << 7;
exports.SYMBOL_FLAG_NATIVE_DOUBLE = 1 << 8;
exports.SYMBOL_FLAG_USED = 1 << 9;
exports.SYMBOL_FLAG_IS_ARRAY = 1 << 10;
exports.SYMBOL_FLAG_IS_GENERIC = 1 << 11;
exports.SYMBOL_FLAG_IS_TEMPLATE = 1 << 12;
class Symbol {
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
        return this.node.parent.kind == node_1.NodeKind.ENUM;
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
        return (this.flags & exports.SYMBOL_FLAG_IS_BINARY_OPERATOR) != 0;
    }
    isUnaryOperator() {
        return (this.flags & exports.SYMBOL_FLAG_IS_UNARY_OPERATOR) != 0;
    }
    shouldConvertInstanceToGlobal() {
        return (this.flags & exports.SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL) != 0;
    }
    isUsed() {
        return (this.flags & exports.SYMBOL_FLAG_USED) != 0;
    }
    parent() {
        var parent = this.node.parent;
        return parent.kind == node_1.NodeKind.CLASS ? parent.symbol : null;
    }
    resolvedTypeUnderlyingIfEnumValue(context) {
        return this.isEnumValue() ? this.resolvedType.underlyingType(context) : this.resolvedType;
    }
    determineClassLayout(context) {
        assert_1.assert(this.kind == SymbolKind.TYPE_CLASS);
        // Only determine class layout once
        if (this.byteSize != 0) {
            return;
        }
        var offset = 0;
        var child = this.node.firstChild;
        var maxAlignment = 1;
        while (child != null) {
            if (child.kind == node_1.NodeKind.VARIABLE) {
                var type = child.symbol.resolvedType;
                // Ignore invalid members
                if (type != context.errorType) {
                    var alignmentOf = type.variableAlignmentOf(context);
                    // Align the member to the next available slot
                    offset = utils_1.alignToNextMultipleOf(offset, alignmentOf);
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
        offset = utils_1.alignToNextMultipleOf(offset, maxAlignment);
        this.byteSize = offset;
        this.maxAlignment = maxAlignment;
    }
}
exports.Symbol = Symbol;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __webpack_require__(0);
/**
 * Created by Nidin Vinayakan on 17/01/17.
 */
function toHex(value, size = 7) {
    if (value == undefined || value == null) {
        return "";
    }
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
exports.toHex = toHex;
function isPositivePowerOf2(value) {
    return value > 0 && (value & (value - 1)) == 0;
}
exports.isPositivePowerOf2 = isPositivePowerOf2;
function alignToNextMultipleOf(offset, alignment) {
    assert_1.assert(isPositivePowerOf2(alignment));
    return (offset + alignment - 1) & -alignment;
}
exports.alignToNextMultipleOf = alignToNextMultipleOf;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 06.06.17.
 */
var CompileTarget;
(function (CompileTarget) {
    CompileTarget[CompileTarget["NONE"] = 0] = "NONE";
    CompileTarget[CompileTarget["AUTO"] = 1] = "AUTO";
    CompileTarget[CompileTarget["CPP"] = 2] = "CPP";
    CompileTarget[CompileTarget["JAVASCRIPT"] = 3] = "JAVASCRIPT";
    CompileTarget[CompileTarget["WEBASSEMBLY"] = 4] = "WEBASSEMBLY";
})(CompileTarget = exports.CompileTarget || (exports.CompileTarget = {}));


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by nidin on 2017-01-12.
 */
exports.WasmOpcode = {
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
};
exports.WasmOpcode[exports.WasmOpcode.UNREACHABLE] = "unreachable";
exports.WasmOpcode[exports.WasmOpcode.NOP] = "nop";
exports.WasmOpcode[exports.WasmOpcode.BLOCK] = "block";
exports.WasmOpcode[exports.WasmOpcode.LOOP] = "loop";
exports.WasmOpcode[exports.WasmOpcode.IF] = "if";
exports.WasmOpcode[exports.WasmOpcode.IF_ELSE] = "else";
exports.WasmOpcode[exports.WasmOpcode.END] = "end";
exports.WasmOpcode[exports.WasmOpcode.BR] = "br";
exports.WasmOpcode[exports.WasmOpcode.BR_IF] = "br_if";
exports.WasmOpcode[exports.WasmOpcode.BR_TABLE] = "br_table";
exports.WasmOpcode[exports.WasmOpcode.RETURN] = "return";
// Call operators
exports.WasmOpcode[exports.WasmOpcode.CALL] = "call";
exports.WasmOpcode[exports.WasmOpcode.CALL_INDIRECT] = "call_indirect";
//Parametric operators
exports.WasmOpcode[exports.WasmOpcode.DROP] = "drop";
exports.WasmOpcode[exports.WasmOpcode.SELECT] = "select";
//Variable access
exports.WasmOpcode[exports.WasmOpcode.GET_LOCAL] = "get_local";
exports.WasmOpcode[exports.WasmOpcode.SET_LOCAL] = "set_local";
exports.WasmOpcode[exports.WasmOpcode.TEE_LOCAL] = "tee_local";
exports.WasmOpcode[exports.WasmOpcode.GET_GLOBAL] = "get_global";
exports.WasmOpcode[exports.WasmOpcode.SET_GLOBAL] = "set_global";
// Memory-related operators
exports.WasmOpcode[exports.WasmOpcode.I32_LOAD] = "i32.load";
exports.WasmOpcode[exports.WasmOpcode.I64_LOAD] = "i64.load";
exports.WasmOpcode[exports.WasmOpcode.F32_LOAD] = "f32.load";
exports.WasmOpcode[exports.WasmOpcode.F64_LOAD] = "f64.load";
exports.WasmOpcode[exports.WasmOpcode.I32_LOAD8_S] = "i32.load8_s";
exports.WasmOpcode[exports.WasmOpcode.I32_LOAD8_U] = "i32_load8_u";
exports.WasmOpcode[exports.WasmOpcode.I32_LOAD16_S] = "i32_load16_s";
exports.WasmOpcode[exports.WasmOpcode.I32_LOAD16_U] = "i32_load16_u";
exports.WasmOpcode[exports.WasmOpcode.I64_LOAD8_S] = "i64.load8_s";
exports.WasmOpcode[exports.WasmOpcode.I64_LOAD8_U] = "i64.load8_u";
exports.WasmOpcode[exports.WasmOpcode.I64_LOAD16_S] = "i64.load16_s";
exports.WasmOpcode[exports.WasmOpcode.I64_LOAD16_U] = "i64.load16_u";
exports.WasmOpcode[exports.WasmOpcode.I64_LOAD32_S] = "i64.load32_s";
exports.WasmOpcode[exports.WasmOpcode.I64_LOAD32_U] = "i64.load32_u";
exports.WasmOpcode[exports.WasmOpcode.I32_STORE] = "i32.store";
exports.WasmOpcode[exports.WasmOpcode.I64_STORE] = "i64.store";
exports.WasmOpcode[exports.WasmOpcode.F32_STORE] = "f32.store";
exports.WasmOpcode[exports.WasmOpcode.F64_STORE] = "f64.store";
exports.WasmOpcode[exports.WasmOpcode.I32_STORE8] = "i32.store8";
exports.WasmOpcode[exports.WasmOpcode.I32_STORE16] = "i32.store16";
exports.WasmOpcode[exports.WasmOpcode.I64_STORE8] = "i64.store8";
exports.WasmOpcode[exports.WasmOpcode.I64_STORE16] = "i64.store16";
exports.WasmOpcode[exports.WasmOpcode.I64_STORE32] = "i64.store32";
exports.WasmOpcode[exports.WasmOpcode.MEMORY_SIZE] = "current_memory";
exports.WasmOpcode[exports.WasmOpcode.GROW_MEMORY] = "grow_memory";
// Constants
exports.WasmOpcode[exports.WasmOpcode.I32_CONST] = "i32.const";
exports.WasmOpcode[exports.WasmOpcode.I64_CONST] = "i64.const";
exports.WasmOpcode[exports.WasmOpcode.F32_CONST] = "f32.const";
exports.WasmOpcode[exports.WasmOpcode.F64_CONST] = "f64.const";
//Comparison operators
exports.WasmOpcode[exports.WasmOpcode.I32_EQZ] = "i32.eqz";
exports.WasmOpcode[exports.WasmOpcode.I32_EQ] = "i32.eq";
exports.WasmOpcode[exports.WasmOpcode.I32_NE] = "i32.ne";
exports.WasmOpcode[exports.WasmOpcode.I32_LT_S] = "i32.lt_s";
exports.WasmOpcode[exports.WasmOpcode.I32_LT_U] = "i32.lt_u";
exports.WasmOpcode[exports.WasmOpcode.I32_GT_S] = "i32.gt_s";
exports.WasmOpcode[exports.WasmOpcode.I32_GT_U] = "i32.gt_u";
exports.WasmOpcode[exports.WasmOpcode.I32_LE_S] = "i32.le_s";
exports.WasmOpcode[exports.WasmOpcode.I32_LE_U] = "i32.le_u";
exports.WasmOpcode[exports.WasmOpcode.I32_GE_S] = "i32.ge_s";
exports.WasmOpcode[exports.WasmOpcode.I32_GE_U] = "i32.ge_u";
exports.WasmOpcode[exports.WasmOpcode.I64_EQZ] = "i64.eqz";
exports.WasmOpcode[exports.WasmOpcode.I64_EQ] = "i64.eq";
exports.WasmOpcode[exports.WasmOpcode.I64_NE] = "i64.ne";
exports.WasmOpcode[exports.WasmOpcode.I64_LT_S] = "i64.lt_s";
exports.WasmOpcode[exports.WasmOpcode.I64_LT_U] = "i64.lt_u";
exports.WasmOpcode[exports.WasmOpcode.I64_GT_S] = "i64.gt_s";
exports.WasmOpcode[exports.WasmOpcode.I64_GT_U] = "i64.gt_u";
exports.WasmOpcode[exports.WasmOpcode.I64_LE_S] = "i64.le_s";
exports.WasmOpcode[exports.WasmOpcode.I64_LE_U] = "i64.le_u";
exports.WasmOpcode[exports.WasmOpcode.I64_GE_S] = "i64.ge_s";
exports.WasmOpcode[exports.WasmOpcode.I64_GE_U] = "i64.ge_u";
exports.WasmOpcode[exports.WasmOpcode.F32_EQ] = "f32.eq";
exports.WasmOpcode[exports.WasmOpcode.F32_NE] = "f32.ne";
exports.WasmOpcode[exports.WasmOpcode.F32_LT] = "f32.lt";
exports.WasmOpcode[exports.WasmOpcode.F32_GT] = "f32.gt";
exports.WasmOpcode[exports.WasmOpcode.F32_LE] = "f32.le";
exports.WasmOpcode[exports.WasmOpcode.F32_GE] = "f32.ge";
exports.WasmOpcode[exports.WasmOpcode.F64_EQ] = "f64.eq";
exports.WasmOpcode[exports.WasmOpcode.F64_NE] = "f64.ne";
exports.WasmOpcode[exports.WasmOpcode.F64_LT] = "f64.lt";
exports.WasmOpcode[exports.WasmOpcode.F64_GT] = "f64.gt";
exports.WasmOpcode[exports.WasmOpcode.F64_LE] = "f64.le";
exports.WasmOpcode[exports.WasmOpcode.F64_GE] = "f64.ge";
//Numeric operators
exports.WasmOpcode[exports.WasmOpcode.I32_CLZ] = "i32.clz";
exports.WasmOpcode[exports.WasmOpcode.I32_CTZ] = "i32.ctz";
exports.WasmOpcode[exports.WasmOpcode.I32_POPCNT] = "i32.popcnt";
exports.WasmOpcode[exports.WasmOpcode.I32_ADD] = "i32.add";
exports.WasmOpcode[exports.WasmOpcode.I32_SUB] = "i32.sub";
exports.WasmOpcode[exports.WasmOpcode.I32_MUL] = "i32.mul";
exports.WasmOpcode[exports.WasmOpcode.I32_DIV_S] = "i32.div_s";
exports.WasmOpcode[exports.WasmOpcode.I32_DIV_U] = "i32.div_u";
exports.WasmOpcode[exports.WasmOpcode.I32_REM_S] = "i32.rem_s";
exports.WasmOpcode[exports.WasmOpcode.I32_REM_U] = "i32.rem_u";
exports.WasmOpcode[exports.WasmOpcode.I32_AND] = "i32.and";
exports.WasmOpcode[exports.WasmOpcode.I32_OR] = "i32.or";
exports.WasmOpcode[exports.WasmOpcode.I32_XOR] = "i32.xor";
exports.WasmOpcode[exports.WasmOpcode.I32_SHL] = "i32.shl";
exports.WasmOpcode[exports.WasmOpcode.I32_SHR_S] = "i32.shr_s";
exports.WasmOpcode[exports.WasmOpcode.I32_SHR_U] = "i32.shr_u";
exports.WasmOpcode[exports.WasmOpcode.I32_ROTL] = "i32.rotl";
exports.WasmOpcode[exports.WasmOpcode.I32_ROTR] = "i32.rotr";
exports.WasmOpcode[exports.WasmOpcode.I64_CLZ] = "i64.clz";
exports.WasmOpcode[exports.WasmOpcode.I64_CTZ] = "i64.ctz";
exports.WasmOpcode[exports.WasmOpcode.I64_POPCNT] = "i64.popcnt";
exports.WasmOpcode[exports.WasmOpcode.I64_ADD] = "i64.add";
exports.WasmOpcode[exports.WasmOpcode.I64_SUB] = "i64.sub";
exports.WasmOpcode[exports.WasmOpcode.I64_MUL] = "i64.mul";
exports.WasmOpcode[exports.WasmOpcode.I64_DIV_S] = "i64.div_s";
exports.WasmOpcode[exports.WasmOpcode.I64_DIV_U] = "i64.div_u";
exports.WasmOpcode[exports.WasmOpcode.I64_REM_S] = "i64.rem_s";
exports.WasmOpcode[exports.WasmOpcode.I64_REM_U] = "i64.rem_u";
exports.WasmOpcode[exports.WasmOpcode.I64_AND] = "i64.and";
exports.WasmOpcode[exports.WasmOpcode.I64_OR] = "i64.or";
exports.WasmOpcode[exports.WasmOpcode.I64_XOR] = "i64.xor";
exports.WasmOpcode[exports.WasmOpcode.I64_SHL] = "i64.shl";
exports.WasmOpcode[exports.WasmOpcode.I64_SHR_S] = "i64.shr_s";
exports.WasmOpcode[exports.WasmOpcode.I64_SHR_U] = "i64.shr_u";
exports.WasmOpcode[exports.WasmOpcode.I64_ROTL] = "i64.rotl";
exports.WasmOpcode[exports.WasmOpcode.I64_ROTR] = "i64.rotr";
exports.WasmOpcode[exports.WasmOpcode.F32_ABS] = "f32.abs";
exports.WasmOpcode[exports.WasmOpcode.F32_NEG] = "f32.neg";
exports.WasmOpcode[exports.WasmOpcode.F32_CEIL] = "f32.ceil";
exports.WasmOpcode[exports.WasmOpcode.F32_FLOOR] = "f32.floor";
exports.WasmOpcode[exports.WasmOpcode.F32_TRUNC] = "f32.trunc";
exports.WasmOpcode[exports.WasmOpcode.F32_NEAREST] = "f32.nearest";
exports.WasmOpcode[exports.WasmOpcode.F32_SQRT] = "f32.sqrt";
exports.WasmOpcode[exports.WasmOpcode.F32_ADD] = "f32.add";
exports.WasmOpcode[exports.WasmOpcode.F32_SUB] = "f32.sub";
exports.WasmOpcode[exports.WasmOpcode.F32_MUL] = "f32.mul";
exports.WasmOpcode[exports.WasmOpcode.F32_DIV] = "f32.div";
exports.WasmOpcode[exports.WasmOpcode.F32_MIN] = "f32.min";
exports.WasmOpcode[exports.WasmOpcode.F32_MAX] = "f32.max";
exports.WasmOpcode[exports.WasmOpcode.F32_COPYSIGN] = "f32.copysign";
exports.WasmOpcode[exports.WasmOpcode.F64_ABS] = "f64.abs";
exports.WasmOpcode[exports.WasmOpcode.F64_NEG] = "f64.neg";
exports.WasmOpcode[exports.WasmOpcode.F64_CEIL] = "f64.ceil";
exports.WasmOpcode[exports.WasmOpcode.F64_FLOOR] = "f64.floor";
exports.WasmOpcode[exports.WasmOpcode.F64_TRUNC] = "f64.trunc";
exports.WasmOpcode[exports.WasmOpcode.F64_NEAREST] = "f64.nearest";
exports.WasmOpcode[exports.WasmOpcode.F64_SQRT] = "f64.sqrt";
exports.WasmOpcode[exports.WasmOpcode.F64_ADD] = "f64.add";
exports.WasmOpcode[exports.WasmOpcode.F64_SUB] = "f64.sub";
exports.WasmOpcode[exports.WasmOpcode.F64_MUL] = "f64.mul";
exports.WasmOpcode[exports.WasmOpcode.F64_DIV] = "f64.div";
exports.WasmOpcode[exports.WasmOpcode.F64_MIN] = "f64.min";
exports.WasmOpcode[exports.WasmOpcode.F64_MAX] = "f64.max";
exports.WasmOpcode[exports.WasmOpcode.F64_COPYSIGN] = "f64.copysign";
//Conversions
exports.WasmOpcode[exports.WasmOpcode.I32_WRAP_I64] = "i32.wrap/i64";
exports.WasmOpcode[exports.WasmOpcode.I32_TRUNC_S_F32] = "i32.trunc_s/f32";
exports.WasmOpcode[exports.WasmOpcode.I32_TRUNC_U_F32] = "i32.trunc_u/f32";
exports.WasmOpcode[exports.WasmOpcode.I32_TRUNC_S_F64] = "i32.trunc_s/f64";
exports.WasmOpcode[exports.WasmOpcode.I32_TRUNC_U_F64] = "i32.trunc_u/f64";
exports.WasmOpcode[exports.WasmOpcode.I64_EXTEND_S_I32] = "i64.extend_s/i32";
exports.WasmOpcode[exports.WasmOpcode.I64_EXTEND_U_I32] = "i64.extend_u/i32";
exports.WasmOpcode[exports.WasmOpcode.I64_TRUNC_S_F32] = "i64.trunc_s/f32";
exports.WasmOpcode[exports.WasmOpcode.I64_TRUNC_U_F32] = "i64.trunc_u/f32";
exports.WasmOpcode[exports.WasmOpcode.I64_TRUNC_S_F64] = "i64.trunc_s/f64";
exports.WasmOpcode[exports.WasmOpcode.I64_TRUNC_U_F64] = "i64.trunc_u/f64";
exports.WasmOpcode[exports.WasmOpcode.F32_CONVERT_S_I32] = "f32.convert_s/i32";
exports.WasmOpcode[exports.WasmOpcode.F32_CONVERT_U_I32] = "f32.convert_u/i32";
exports.WasmOpcode[exports.WasmOpcode.F32_CONVERT_S_I64] = "f32.convert_s/i64";
exports.WasmOpcode[exports.WasmOpcode.F32_CONVERT_U_I64] = "f32.convert_u/i64";
exports.WasmOpcode[exports.WasmOpcode.F32_DEMOTE_F64] = "f32.demote/f64";
exports.WasmOpcode[exports.WasmOpcode.F64_CONVERT_S_I32] = "f64.convert_s/i32";
exports.WasmOpcode[exports.WasmOpcode.F64_CONVERT_U_I32] = "f64.convert_u/i32";
exports.WasmOpcode[exports.WasmOpcode.F64_CONVERT_S_I64] = "f64.convert_s/i64";
exports.WasmOpcode[exports.WasmOpcode.F64_CONVERT_U_I64] = "f64.convert_u/i64";
exports.WasmOpcode[exports.WasmOpcode.F64_PROMOTE_F32] = "f64.promote/f32";
//Reinterpretations
exports.WasmOpcode[exports.WasmOpcode.I32_REINTERPRET_F32] = "i32.reinterpret/f32";
exports.WasmOpcode[exports.WasmOpcode.I64_REINTERPRET_F64] = "i64.reinterpret/f64";
exports.WasmOpcode[exports.WasmOpcode.F32_REINTERPRET_I32] = "f32.reinterpret/i32";
exports.WasmOpcode[exports.WasmOpcode.F64_REINTERPRET_I64] = "f64.reinterpret/i64";
Object.freeze(exports.WasmOpcode);


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = __webpack_require__(2);
const stringbuilder_1 = __webpack_require__(1);
const assert_1 = __webpack_require__(0);
/**
 * Author: Nidin Vinayakan
 */
var TokenKind;
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
    TokenKind[TokenKind["IMPORT"] = 62] = "IMPORT";
    TokenKind[TokenKind["LET"] = 63] = "LET";
    TokenKind[TokenKind["NEW"] = 64] = "NEW";
    TokenKind[TokenKind["DELETE"] = 65] = "DELETE";
    TokenKind[TokenKind["NULL"] = 66] = "NULL";
    TokenKind[TokenKind["UNDEFINED"] = 67] = "UNDEFINED";
    TokenKind[TokenKind["OPERATOR"] = 68] = "OPERATOR";
    TokenKind[TokenKind["PRIVATE"] = 69] = "PRIVATE";
    TokenKind[TokenKind["PROTECTED"] = 70] = "PROTECTED";
    TokenKind[TokenKind["PUBLIC"] = 71] = "PUBLIC";
    TokenKind[TokenKind["RETURN"] = 72] = "RETURN";
    TokenKind[TokenKind["SIZEOF"] = 73] = "SIZEOF";
    TokenKind[TokenKind["STATIC"] = 74] = "STATIC";
    TokenKind[TokenKind["THIS"] = 75] = "THIS";
    TokenKind[TokenKind["TRUE"] = 76] = "TRUE";
    TokenKind[TokenKind["UNSAFE"] = 77] = "UNSAFE";
    TokenKind[TokenKind["JAVASCRIPT"] = 78] = "JAVASCRIPT";
    TokenKind[TokenKind["START"] = 79] = "START";
    TokenKind[TokenKind["VIRTUAL"] = 80] = "VIRTUAL";
    TokenKind[TokenKind["VAR"] = 81] = "VAR";
    TokenKind[TokenKind["WHILE"] = 82] = "WHILE";
    // Preprocessor
    TokenKind[TokenKind["PREPROCESSOR_DEFINE"] = 83] = "PREPROCESSOR_DEFINE";
    TokenKind[TokenKind["PREPROCESSOR_ELIF"] = 84] = "PREPROCESSOR_ELIF";
    TokenKind[TokenKind["PREPROCESSOR_ELSE"] = 85] = "PREPROCESSOR_ELSE";
    TokenKind[TokenKind["PREPROCESSOR_ENDIF"] = 86] = "PREPROCESSOR_ENDIF";
    TokenKind[TokenKind["PREPROCESSOR_ERROR"] = 87] = "PREPROCESSOR_ERROR";
    TokenKind[TokenKind["PREPROCESSOR_IF"] = 88] = "PREPROCESSOR_IF";
    TokenKind[TokenKind["PREPROCESSOR_NEEDED"] = 89] = "PREPROCESSOR_NEEDED";
    TokenKind[TokenKind["PREPROCESSOR_NEWLINE"] = 90] = "PREPROCESSOR_NEWLINE";
    TokenKind[TokenKind["PREPROCESSOR_UNDEF"] = 91] = "PREPROCESSOR_UNDEF";
    TokenKind[TokenKind["PREPROCESSOR_WARNING"] = 92] = "PREPROCESSOR_WARNING";
})(TokenKind = exports.TokenKind || (exports.TokenKind = {}));
function isKeyword(kind) {
    return kind >= TokenKind.ALIGNOF && kind <= TokenKind.WHILE;
}
exports.isKeyword = isKeyword;
class Token {
}
exports.Token = Token;
function splitToken(first, firstKind, secondKind) {
    var range = first.range;
    assert_1.assert(range.end - range.start >= 2);
    var second = new Token();
    second.kind = secondKind;
    second.range = log_1.createRange(range.source, range.start + 1, range.end);
    second.next = first.next;
    first.kind = firstKind;
    first.next = second;
    range.end = range.start + 1;
}
exports.splitToken = splitToken;
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
    if (token == TokenKind.IMPORT)
        return "'import'";
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
    assert_1.assert(false);
    return null;
}
exports.tokenToString = tokenToString;
function isAlpha(c) {
    return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c == '_';
}
exports.isAlpha = isAlpha;
function isASCII(c) {
    return c >= 0x20 && c <= 0x7E;
}
exports.isASCII = isASCII;
function isNumber(c) {
    return c >= '0' && c <= '9';
}
exports.isNumber = isNumber;
function isDigit(c, base) {
    if (c.trim() == "")
        return false;
    if (base == 16) {
        return isNumber(c) || c >= 'A' && c <= 'F' || c >= 'a' && c <= 'f';
    }
    //return c >= '0' && c < '0' + base;
    return !isNaN(c);
}
exports.isDigit = isDigit;
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
                        kind = TokenKind.IMPORT;
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
                let exponentFound = false;
                // Scan the payload
                while (i < limit && (isDigit(contents[i], base) ||
                    (exponentFound = contents[i] === "e") ||
                    (floatFound = contents[i] === "."))) {
                    i = i + 1;
                    if (exponentFound) {
                        isFloat = true;
                        if (contents[i] === "+" || contents[i] === "-") {
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
                }
                else {
                    kind = isFloat ? TokenKind.FLOAT64 : TokenKind.INT32;
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
exports.tokenize = tokenize;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="../declarations.d.ts" />
const type_checker_1 = __webpack_require__(44);
const node_1 = __webpack_require__(3);
const log_1 = __webpack_require__(2);
const preprocessor_1 = __webpack_require__(48);
const scope_1 = __webpack_require__(16);
const scanner_1 = __webpack_require__(8);
const parser_1 = __webpack_require__(18);
const shaking_1 = __webpack_require__(46);
const stringbuilder_1 = __webpack_require__(1);
const webassembly_1 = __webpack_require__(43);
const library_1 = __webpack_require__(49);
const preparser_1 = __webpack_require__(47);
const compile_target_1 = __webpack_require__(6);
const assert_1 = __webpack_require__(0);
/**
 * Author: Nidin Vinayakan
 */
class Compiler {
    initialize(target, outputName) {
        assert_1.assert(this.log == null);
        this.log = new log_1.Log();
        this.preprocessor = new preprocessor_1.Preprocessor();
        this.target = target;
        this.outputName = outputName;
        this.librarySource = this.addInput("<native>", library_1.Library.get(target));
        this.librarySource.isLibrary = true;
        this.runtimeSource = library_1.Library.getRuntime(target);
        this.wrapperSource = library_1.Library.getWrapper(target);
        this.createGlobals();
        if (target == compile_target_1.CompileTarget.CPP) {
            this.preprocessor.define("CPP", true);
        }
        else if (target == compile_target_1.CompileTarget.JAVASCRIPT) {
            this.preprocessor.define("JS", true);
        }
        else if (target == compile_target_1.CompileTarget.WEBASSEMBLY) {
            this.preprocessor.define("WASM", true);
        }
    }
    createGlobals() {
        let context = new type_checker_1.CheckContext();
        context.log = this.log;
        context.target = this.target;
        context.pointerByteSize = 4; // Assume 32-bit code generation for now
        let global = new node_1.Node();
        global.kind = node_1.NodeKind.GLOBAL;
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
        let source = new log_1.Source();
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
        let source = new log_1.Source();
        source.name = name;
        source.contents = contents;
        nextSource.prev.next = source;
        source.prev = nextSource.prev;
        nextSource.prev = source;
        source.next = nextSource;
        return source;
    }
    finish() {
        console.time("pre-parsing");
        let source = this.firstSource;
        while (source != null) {
            if (!preparser_1.preparse(source, this, this.log)) {
                return false;
            }
            source = source.next;
        }
        console.timeEnd("pre-parsing");
        console.time("scanning");
        source = this.firstSource;
        while (source != null) {
            source.firstToken = scanner_1.tokenize(source, this.log);
            source = source.next;
        }
        console.timeEnd("scanning");
        console.time("pre-processing");
        source = this.firstSource;
        while (source != null) {
            this.preprocessor.run(source, this.log);
            source = source.next;
        }
        console.timeEnd("pre-processing");
        console.time("parsing");
        source = this.firstSource;
        while (source != null) {
            if (source.firstToken != null) {
                source.file = parser_1.parse(source.firstToken, this.log);
            }
            source = source.next;
        }
        console.timeEnd("parsing");
        console.time("type-checking");
        let global = this.global;
        let context = this.context;
        let fullResolve = true;
        source = this.firstSource;
        while (source != null) {
            let file = source.file;
            if (file != null) {
                if (source.isLibrary) {
                    file.flags |= node_1.NODE_FLAG_LIBRARY;
                    type_checker_1.initialize(context, file, global.scope, type_checker_1.CheckMode.INITIALIZE);
                    type_checker_1.resolve(context, file, global.scope);
                }
                else {
                    type_checker_1.initialize(context, file, global.scope, type_checker_1.CheckMode.NORMAL);
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
            type_checker_1.resolve(context, global, global.scope);
        }
        console.timeEnd("type-checking");
        if (this.log.hasErrors()) {
            return false;
        }
        console.time("optimizing");
        shaking_1.treeShaking(global);
        console.timeEnd("optimizing");
        console.time("emitting");
        // if (this.target == CompileTarget.C) {
        //     cEmit(this);
        // }
        // else if (this.target == CompileTarget.JAVASCRIPT) {
        //     jsEmit(this);
        // } else
        if (this.target == compile_target_1.CompileTarget.WEBASSEMBLY) {
            webassembly_1.wasmEmit(this);
        }
        console.timeEnd("emitting");
        console.log("Done!");
        return true;
    }
}
Compiler.mallocRequired = false;
exports.Compiler = Compiler;
function replaceFileExtension(path, extension) {
    let builder = stringbuilder_1.StringBuilder_new();
    let dot = path.lastIndexOf(".");
    let forward = path.lastIndexOf("/");
    let backward = path.lastIndexOf("\\");
    // Make sure that there's a non-empty file name that the dot is a part of
    if (dot > 0 && dot > forward && dot > backward) {
        path = path.slice(0, dot);
    }
    return builder.append(path).append(extension).finish();
}
exports.replaceFileExtension = replaceFileExtension;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(5);
/**
 * Created by n.vinayakan on 02.06.17.
 */
function log(array, offset = 0, value = null, msg = null) {
    if (global["debug"]) {
        array.log += (value != null ? `${utils_1.toHex(offset + array.position)}: ${utils_1.toHex(value, 2)}                    ; ` : "") + (msg != null ? `${msg}\n` : "\n");
    }
}
exports.log = log;
function logData(array, offset = 0, value, addPosition = true) {
    if (global["debug"]) {
        array.log += (addPosition ? `${utils_1.toHex(offset + array.position)}: ${utils_1.toHex(value, 2)}` : ` ${utils_1.toHex(value, 2)}`);
    }
}
exports.logData = logData;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __webpack_require__(0);
function ByteArray_set16(array, index, value) {
    array.set(index, value);
    array.set(index + 1, (value >> 8));
}
exports.ByteArray_set16 = ByteArray_set16;
function ByteArray_set32(array, index, value) {
    array.set(index, value);
    array.set(index + 1, (value >> 8));
    array.set(index + 2, (value >> 16));
    array.set(index + 3, (value >> 24));
}
exports.ByteArray_set32 = ByteArray_set32;
function ByteArray_append32(array, value) {
    array.append(value);
    array.append((value >> 8));
    array.append((value >> 16));
    array.append((value >> 24));
}
exports.ByteArray_append32 = ByteArray_append32;
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
    assert_1.assert(index >= 0 && index + length * 2 <= data.length);
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
exports.ByteArray_setString = ByteArray_setString;
/**
 * JavaScript ByteArray
 * version : 0.2
 * @author Nidin Vinayakan | nidinthb@gmail.com
 *
 * ActionScript3 ByteArray implementation in JavaScript
 * limitation : size of ByteArray cannot be changed
 *
 */
class ByteArray {
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
}
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
exports.ByteArray = ByteArray;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __webpack_require__(19);
/**
 * Created by n.vinayakan on 06.06.17.
 */
let fs = null;
if (env_1.isBrowser) {
    console.log("----> Browser environment");
    fs = {
        fileMap: new Map(),
        readFileSync: (path, options) => {
            return fs.fileMap.get(path);
        },
        writeFileSync: (path, data, options) => {
            return fs.fileMap.set(path, data);
        }
    };
    window["Buffer"] = class NodeBuffer {
        constructor(array) {
            this.array = array;
        }
    };
}
else if (env_1.isNode) {
    console.log("----> NodeJS environment");
    fs = __webpack_require__(52);
}
else {
    console.error("----> Unknown host environment!!!. Where are we?");
}
class FileSystem {
    static readTextFile(path) {
        try {
            return fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
        }
        catch (e) {
            return null;
        }
    }
    static writeTextFile(path, contents) {
        try {
            fs.writeFileSync(path, contents);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    static readBinaryFile(path) {
        try {
            return fs.readFileSync(path);
        }
        catch (e) {
            return null;
        }
    }
    static writeBinaryFile(path, contents) {
        try {
            fs.writeFileSync(path, new Buffer(contents.array.subarray(0, contents.length)));
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
exports.FileSystem = FileSystem;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __webpack_require__(19);
/**
 * Created by n.vinayakan on 06.06.17.
 */
class Terminal {
    static write(text) {
        if (env_1.isNode) {
            process.stdout.write(text);
        }
        else {
            console.log(text);
        }
    }
    static setColor(color) {
        if (env_1.isNode) {
            if (process.stdout.isTTY) {
                process.stdout.write('\x1B[0;' + color + 'm');
            }
        }
        else {
        }
    }
}
exports.Terminal = Terminal;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
var WasmSection;
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
})(WasmSection = exports.WasmSection || (exports.WasmSection = {}));


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
var WasmType;
(function (WasmType) {
    WasmType[WasmType["VOID"] = 0] = "VOID";
    WasmType[WasmType["I32"] = 127] = "I32";
    WasmType[WasmType["I64"] = 126] = "I64";
    WasmType[WasmType["F32"] = 125] = "F32";
    WasmType[WasmType["F64"] = 124] = "F64";
    WasmType[WasmType["anyfunc"] = 112] = "anyfunc";
    WasmType[WasmType["func"] = 96] = "func";
    WasmType[WasmType["block_type"] = 64] = "block_type";
})(WasmType = exports.WasmType || (exports.WasmType = {}));
class WasmWrappedType {
}
exports.WasmWrappedType = WasmWrappedType;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const symbol_1 = __webpack_require__(4);
const stringbuilder_1 = __webpack_require__(1);
const type_1 = __webpack_require__(17);
var FindNested;
(function (FindNested) {
    FindNested[FindNested["NORMAL"] = 0] = "NORMAL";
    FindNested[FindNested["ALLOW_INSTANCE_ERRORS"] = 1] = "ALLOW_INSTANCE_ERRORS";
})(FindNested = exports.FindNested || (exports.FindNested = {}));
var ScopeHint;
(function (ScopeHint) {
    ScopeHint[ScopeHint["NORMAL"] = 0] = "NORMAL";
    ScopeHint[ScopeHint["NOT_BINARY"] = 1] = "NOT_BINARY";
    ScopeHint[ScopeHint["NOT_GETTER"] = 2] = "NOT_GETTER";
    ScopeHint[ScopeHint["NOT_SETTER"] = 3] = "NOT_SETTER";
    ScopeHint[ScopeHint["NOT_UNARY"] = 4] = "NOT_UNARY";
    ScopeHint[ScopeHint["PREFER_GETTER"] = 5] = "PREFER_GETTER";
    ScopeHint[ScopeHint["PREFER_SETTER"] = 6] = "PREFER_SETTER";
})(ScopeHint = exports.ScopeHint || (exports.ScopeHint = {}));
class Scope {
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
            if (symbol.name == "this") {
                log.warning(symbol.range, stringbuilder_1.StringBuilder_new()
                    .append("Duplicate 'this' symbol")
                    .finish());
                return true;
            }
            else {
                log.error(symbol.range, stringbuilder_1.StringBuilder_new()
                    .append("Duplicate symbol '")
                    .append(symbol.name)
                    .append("'")
                    .finish());
                return false;
            }
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
}
exports.Scope = Scope;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const symbol_1 = __webpack_require__(4);
const stringbuilder_1 = __webpack_require__(1);
var ConversionKind;
(function (ConversionKind) {
    ConversionKind[ConversionKind["IMPLICIT"] = 0] = "IMPLICIT";
    ConversionKind[ConversionKind["EXPLICIT"] = 1] = "EXPLICIT";
})(ConversionKind = exports.ConversionKind || (exports.ConversionKind = {}));
class Type {
    isClass() {
        return this.symbol != null && this.symbol.kind == symbol_1.SymbolKind.TYPE_CLASS;
    }
    isGeneric() {
        let symbol = this.symbol || this.pointerTo.symbol;
        return symbol != null && symbol.kind == symbol_1.SymbolKind.TYPE_GENERIC;
    }
    isTemplate() {
        let symbol = this.symbol || this.pointerTo.symbol;
        return symbol != null && symbol.kind == symbol_1.SymbolKind.TYPE_TEMPLATE;
    }
    isEnum() {
        return this.symbol != null && this.symbol.kind == symbol_1.SymbolKind.TYPE_ENUM;
    }
    isInteger() {
        return this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_NATIVE_INTEGER) != 0 || this.isEnum();
    }
    isLong() {
        return this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_NATIVE_LONG) != 0;
    }
    isUnsigned() {
        return this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_IS_UNSIGNED) != 0;
    }
    isFloat() {
        return this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_NATIVE_FLOAT) != 0;
    }
    isDouble() {
        return this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_NATIVE_DOUBLE) != 0;
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
        return this.pointerTo != null || this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_IS_REFERENCE) != 0;
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
                this.pointerTo != null ? stringbuilder_1.StringBuilder_new().appendChar('*').append(this.pointerTo.toString()).finish() :
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
        return symbol != null && (symbol.kind == symbol_1.SymbolKind.TYPE_TEMPLATE || symbol.kind == symbol_1.SymbolKind.TYPE_CLASS || symbol.kind == symbol_1.SymbolKind.TYPE_NATIVE);
    }
}
exports.Type = Type;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const scanner_1 = __webpack_require__(8);
const log_1 = __webpack_require__(2);
const stringbuilder_1 = __webpack_require__(1);
const node_1 = __webpack_require__(3);
const assert_1 = __webpack_require__(0);
var Precedence;
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
})(Precedence = exports.Precedence || (exports.Precedence = {}));
function isRightAssociative(precedence) {
    return precedence == Precedence.ASSIGN || precedence == Precedence.EXPONENT;
}
var ParseKind;
(function (ParseKind) {
    ParseKind[ParseKind["EXPRESSION"] = 0] = "EXPRESSION";
    ParseKind[ParseKind["TYPE"] = 1] = "TYPE";
})(ParseKind || (ParseKind = {}));
var StatementMode;
(function (StatementMode) {
    StatementMode[StatementMode["NORMAL"] = 0] = "NORMAL";
    StatementMode[StatementMode["FILE"] = 1] = "FILE";
})(StatementMode || (StatementMode = {}));
class ParserContext {
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
        if (!this.peek(scanner_1.TokenKind.END_OF_FILE)) {
            this.previous = this.current;
            this.current = this.current.next;
        }
    }
    unexpectedToken() {
        if (this.lastError != this.current) {
            this.lastError = this.current;
            this.log.error(this.current.range, stringbuilder_1.StringBuilder_new()
                .append("Unexpected ")
                .append(scanner_1.tokenToString(this.current.kind))
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
                if (kind != scanner_1.TokenKind.IDENTIFIER && !previousLine.equals(currentLine)) {
                    this.log.error(previousLine.rangeAtEnd(), stringbuilder_1.StringBuilder_new()
                        .append("Expected ")
                        .append(scanner_1.tokenToString(kind))
                        .finish());
                }
                else {
                    this.log.error(this.current.range, stringbuilder_1.StringBuilder_new()
                        .append("Expected ")
                        .append(scanner_1.tokenToString(kind))
                        .append(" but found ")
                        .append(scanner_1.tokenToString(this.current.kind))
                        .finish());
                }
            }
            return false;
        }
        this.advance();
        return true;
    }
    parseUnaryPrefix(kind, mode) {
        assert_1.assert(node_1.isUnary(kind));
        let token = this.current;
        this.advance();
        let value = this.parseExpression(Precedence.UNARY_PREFIX, mode);
        if (value == null) {
            return null;
        }
        return node_1.createUnary(kind, value).withRange(log_1.spanRanges(token.range, value.range)).withInternalRange(token.range);
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
        return node_1.createBinary(kind, left, right).withRange(log_1.spanRanges(left.range, right.range)).withInternalRange(token.range);
    }
    parseUnaryPostfix(kind, value, localPrecedence) {
        if (localPrecedence >= Precedence.UNARY_POSTFIX) {
            return value;
        }
        let token = this.current;
        this.advance();
        return node_1.createUnary(kind, value).withRange(log_1.spanRanges(value.range, token.range)).withInternalRange(token.range);
    }
    parseQuotedString(range) {
        assert_1.assert(range.end - range.start >= 2);
        let text = range.source.contents;
        let end = range.start + 1;
        let limit = range.end - 1;
        let start = end;
        let builder = stringbuilder_1.StringBuilder_new();
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
                    let escape = log_1.createRange(range.source, range.start + end - 1, range.start + end + 1);
                    this.log.error(escape, stringbuilder_1.StringBuilder_new()
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
        if (this.peek(scanner_1.TokenKind.IDENTIFIER)) {
            this.advance();
            return node_1.createName(token.range.toString()).withRange(token.range);
        }
        // if (this.peek(TokenKind.ARRAY)) {
        //     this.advance();
        //     return createArray(token.range.toString()).withRange(token.range);
        // }
        if (this.peek(scanner_1.TokenKind.EXPONENT)) {
            scanner_1.splitToken(this.current, scanner_1.TokenKind.MULTIPLY, scanner_1.TokenKind.MULTIPLY);
        }
        if (this.peek(scanner_1.TokenKind.MULTIPLY)) {
            return this.parseUnaryPrefix(mode == ParseKind.TYPE ? node_1.NodeKind.POINTER_TYPE : node_1.NodeKind.DEREFERENCE, mode);
        }
        if (mode == ParseKind.EXPRESSION) {
            if (this.eat(scanner_1.TokenKind.NULL)) {
                return node_1.createNull().withRange(token.range);
            }
            if (this.eat(scanner_1.TokenKind.UNDEFINED)) {
                return node_1.createUndefined().withRange(token.range);
            }
            if (this.eat(scanner_1.TokenKind.THIS)) {
                return node_1.createThis().withRange(token.range);
            }
            if (this.peek(scanner_1.TokenKind.CHARACTER)) {
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
            if (this.peek(scanner_1.TokenKind.STRING)) {
                let text = this.parseQuotedString(token.range);
                if (text == null) {
                    return null;
                }
                this.advance();
                return node_1.createString(text).withRange(token.range);
            }
            if (this.peek(scanner_1.TokenKind.INT32)) {
                let value = node_1.createInt(0);
                if (!this.parseInt(token.range, value)) {
                    value = node_1.createParseError();
                }
                this.advance();
                return value.withRange(token.range);
            }
            if (this.peek(scanner_1.TokenKind.FLOAT32)) {
                let value = node_1.createFloat(0);
                if (!this.parseFloat(token.range, value)) {
                    value = node_1.createParseError();
                }
                this.advance();
                return value.withRange(token.range);
            }
            if (this.peek(scanner_1.TokenKind.FLOAT64)) {
                let value = node_1.createDouble(0);
                if (!this.parseDouble(token.range, value)) {
                    value = node_1.createParseError();
                }
                this.advance();
                return value.withRange(token.range);
            }
            if (this.eat(scanner_1.TokenKind.TRUE)) {
                return node_1.createboolean(true).withRange(token.range);
            }
            if (this.eat(scanner_1.TokenKind.FALSE)) {
                return node_1.createboolean(false).withRange(token.range);
            }
            if (this.eat(scanner_1.TokenKind.NEW)) {
                let type = this.parseType();
                if (type == null) {
                    return null;
                }
                if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
                    let parameters = this.parseParameters();
                    if (parameters == null) {
                        return null;
                    }
                    type.appendChild(parameters);
                }
                return this.parseArgumentList(token.range, node_1.createNew(type));
            }
            if (this.eat(scanner_1.TokenKind.ALIGNOF)) {
                if (!this.expect(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
                    return null;
                }
                let type = this.parseType();
                let close = this.current;
                if (type == null || !this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                    return null;
                }
                return node_1.createAlignOf(type).withRange(log_1.spanRanges(token.range, close.range));
            }
            if (this.eat(scanner_1.TokenKind.SIZEOF)) {
                if (!this.expect(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
                    return null;
                }
                let type = this.parseType();
                let close = this.current;
                if (type == null || !this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                    return null;
                }
                return node_1.createSizeOf(type).withRange(log_1.spanRanges(token.range, close.range));
            }
            if (this.eat(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
                let value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                let close = this.current;
                if (value == null || !this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                    return null;
                }
                return value.withRange(log_1.spanRanges(token.range, close.range));
            }
            // Unary prefix
            if (this.peek(scanner_1.TokenKind.BITWISE_AND))
                return this.parseUnaryPrefix(node_1.NodeKind.ADDRESS_OF, ParseKind.EXPRESSION);
            if (this.peek(scanner_1.TokenKind.COMPLEMENT))
                return this.parseUnaryPrefix(node_1.NodeKind.COMPLEMENT, ParseKind.EXPRESSION);
            if (this.peek(scanner_1.TokenKind.MINUS))
                return this.parseUnaryPrefix(node_1.NodeKind.NEGATIVE, ParseKind.EXPRESSION);
            if (this.peek(scanner_1.TokenKind.MINUS_MINUS))
                return this.parseUnaryPrefix(node_1.NodeKind.PREFIX_DECREMENT, ParseKind.EXPRESSION);
            if (this.peek(scanner_1.TokenKind.NOT))
                return this.parseUnaryPrefix(node_1.NodeKind.NOT, ParseKind.EXPRESSION);
            if (this.peek(scanner_1.TokenKind.PLUS))
                return this.parseUnaryPrefix(node_1.NodeKind.POSITIVE, ParseKind.EXPRESSION);
            if (this.peek(scanner_1.TokenKind.PLUS_PLUS))
                return this.parseUnaryPrefix(node_1.NodeKind.PREFIX_INCREMENT, ParseKind.EXPRESSION);
        }
        if (this.peek(scanner_1.TokenKind.LEFT_BRACE)) {
            console.log("Check if its JS");
        }
        this.unexpectedToken();
        return null;
    }
    parseInfix(precedence, node, mode) {
        let token = this.current.range;
        // Dot
        if (this.peek(scanner_1.TokenKind.DOT) && precedence < Precedence.MEMBER) {
            this.advance();
            let name = this.current;
            let range = name.range;
            // Allow contextual keywords
            if (scanner_1.isKeyword(name.kind)) {
                this.advance();
            }
            else if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                range = log_1.createRange(range.source, token.end, token.end);
            }
            return node_1.createDot(node, range.toString()).withRange(log_1.spanRanges(node.range, range)).withInternalRange(range);
        }
        if (mode == ParseKind.EXPRESSION) {
            // Binary
            if (this.peek(scanner_1.TokenKind.ASSIGN))
                return this.parseBinary(node_1.NodeKind.ASSIGN, node, precedence, Precedence.ASSIGN);
            if (this.peek(scanner_1.TokenKind.BITWISE_AND))
                return this.parseBinary(node_1.NodeKind.BITWISE_AND, node, precedence, Precedence.BITWISE_AND);
            if (this.peek(scanner_1.TokenKind.BITWISE_OR))
                return this.parseBinary(node_1.NodeKind.BITWISE_OR, node, precedence, Precedence.BITWISE_OR);
            if (this.peek(scanner_1.TokenKind.BITWISE_XOR))
                return this.parseBinary(node_1.NodeKind.BITWISE_XOR, node, precedence, Precedence.BITWISE_XOR);
            if (this.peek(scanner_1.TokenKind.DIVIDE))
                return this.parseBinary(node_1.NodeKind.DIVIDE, node, precedence, Precedence.MULTIPLY);
            if (this.peek(scanner_1.TokenKind.EQUAL))
                return this.parseBinary(node_1.NodeKind.EQUAL, node, precedence, Precedence.EQUAL);
            if (this.peek(scanner_1.TokenKind.EXPONENT))
                return this.parseBinary(node_1.NodeKind.EXPONENT, node, precedence, Precedence.EXPONENT);
            if (this.peek(scanner_1.TokenKind.GREATER_THAN))
                return this.parseBinary(node_1.NodeKind.GREATER_THAN, node, precedence, Precedence.COMPARE);
            if (this.peek(scanner_1.TokenKind.GREATER_THAN_EQUAL))
                return this.parseBinary(node_1.NodeKind.GREATER_THAN_EQUAL, node, precedence, Precedence.COMPARE);
            if (this.peek(scanner_1.TokenKind.LESS_THAN))
                return this.parseBinary(node_1.NodeKind.LESS_THAN, node, precedence, Precedence.COMPARE);
            if (this.peek(scanner_1.TokenKind.LESS_THAN_EQUAL))
                return this.parseBinary(node_1.NodeKind.LESS_THAN_EQUAL, node, precedence, Precedence.COMPARE);
            if (this.peek(scanner_1.TokenKind.LOGICAL_AND))
                return this.parseBinary(node_1.NodeKind.LOGICAL_AND, node, precedence, Precedence.LOGICAL_AND);
            if (this.peek(scanner_1.TokenKind.LOGICAL_OR))
                return this.parseBinary(node_1.NodeKind.LOGICAL_OR, node, precedence, Precedence.LOGICAL_OR);
            if (this.peek(scanner_1.TokenKind.MINUS))
                return this.parseBinary(node_1.NodeKind.SUBTRACT, node, precedence, Precedence.ADD);
            if (this.peek(scanner_1.TokenKind.MULTIPLY))
                return this.parseBinary(node_1.NodeKind.MULTIPLY, node, precedence, Precedence.MULTIPLY);
            if (this.peek(scanner_1.TokenKind.NOT_EQUAL))
                return this.parseBinary(node_1.NodeKind.NOT_EQUAL, node, precedence, Precedence.EQUAL);
            if (this.peek(scanner_1.TokenKind.PLUS))
                return this.parseBinary(node_1.NodeKind.ADD, node, precedence, Precedence.ADD);
            if (this.peek(scanner_1.TokenKind.REMAINDER))
                return this.parseBinary(node_1.NodeKind.REMAINDER, node, precedence, Precedence.MULTIPLY);
            if (this.peek(scanner_1.TokenKind.SHIFT_LEFT))
                return this.parseBinary(node_1.NodeKind.SHIFT_LEFT, node, precedence, Precedence.SHIFT);
            if (this.peek(scanner_1.TokenKind.SHIFT_RIGHT))
                return this.parseBinary(node_1.NodeKind.SHIFT_RIGHT, node, precedence, Precedence.SHIFT);
            // Unary postfix
            if (this.peek(scanner_1.TokenKind.PLUS_PLUS))
                return this.parseUnaryPostfix(node_1.NodeKind.POSTFIX_INCREMENT, node, precedence);
            if (this.peek(scanner_1.TokenKind.MINUS_MINUS))
                return this.parseUnaryPostfix(node_1.NodeKind.POSTFIX_DECREMENT, node, precedence);
            // Cast
            if (this.peek(scanner_1.TokenKind.AS) && precedence < Precedence.UNARY_PREFIX) {
                this.advance();
                let type = this.parseType();
                if (type == null) {
                    return null;
                }
                return node_1.createCast(node, type).withRange(log_1.spanRanges(node.range, type.range)).withInternalRange(token);
            }
            // Call or index
            let isIndex = this.peek(scanner_1.TokenKind.LEFT_BRACKET);
            if ((isIndex || this.peek(scanner_1.TokenKind.LEFT_PARENTHESIS)) && precedence < Precedence.UNARY_POSTFIX) {
                return this.parseArgumentList(node.range, isIndex ? node_1.createIndex(node) : node_1.createCall(node));
            }
            // Hook
            if (this.peek(scanner_1.TokenKind.QUESTION_MARK) && precedence < Precedence.ASSIGN) {
                this.advance();
                let middle = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (middle == null || !this.expect(scanner_1.TokenKind.COLON)) {
                    return null;
                }
                let right = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (right == null) {
                    return null;
                }
                return node_1.createHook(node, middle, right).withRange(log_1.spanRanges(node.range, right.range));
            }
        }
        return node;
    }
    parseDelete() {
        let token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.DELETE);
        this.advance();
        let value = null;
        if (!this.peek(scanner_1.TokenKind.SEMICOLON)) {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null) {
                return null;
            }
        }
        let semicolon = this.current;
        this.expect(scanner_1.TokenKind.SEMICOLON);
        return node_1.createDelete(value).withRange(log_1.spanRanges(token.range, semicolon.range));
    }
    parseArgumentList(start, node) {
        let open = this.current.range;
        let isIndex = node.kind == node_1.NodeKind.INDEX;
        let left = isIndex ? scanner_1.TokenKind.LEFT_BRACKET : scanner_1.TokenKind.LEFT_PARENTHESIS;
        let right = isIndex ? scanner_1.TokenKind.RIGHT_BRACKET : scanner_1.TokenKind.RIGHT_PARENTHESIS;
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
                if (!this.eat(scanner_1.TokenKind.COMMA)) {
                    break;
                }
            }
        }
        let close = this.current.range;
        if (!this.expect(right)) {
            return null;
        }
        return node.withRange(log_1.spanRanges(start, close)).withInternalRange(log_1.spanRanges(open, close));
    }
    parseExpression(precedence, mode) {
        // Prefix
        let node = this.parsePrefix(mode);
        if (node == null) {
            return null;
        }
        assert_1.assert(node.range != null);
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
            assert_1.assert(node.range != null);
        }
        return node;
    }
    parseType() {
        return this.parseExpression(Precedence.UNARY_POSTFIX, ParseKind.TYPE);
    }
    parseIf() {
        let token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.IF);
        this.advance();
        if (!this.expect(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
            return null;
        }
        let value;
        // Recover from a missing value
        if (this.peek(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
            this.unexpectedToken();
            this.advance();
            value = node_1.createParseError();
        }
        else {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null || !this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                return null;
            }
        }
        let trueBranch = this.parseBody();
        if (trueBranch == null) {
            return null;
        }
        let falseBranch = null;
        if (this.eat(scanner_1.TokenKind.ELSE)) {
            falseBranch = this.parseBody();
            if (falseBranch == null) {
                return null;
            }
        }
        return node_1.createIf(value, trueBranch, falseBranch).withRange(log_1.spanRanges(token.range, (falseBranch != null ? falseBranch : trueBranch).range));
    }
    parseWhile() {
        let token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.WHILE);
        this.advance();
        if (!this.expect(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
            return null;
        }
        let value;
        // Recover from a missing value
        if (this.peek(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
            this.unexpectedToken();
            this.advance();
            value = node_1.createParseError();
        }
        else {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null || !this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                return null;
            }
        }
        let body = this.parseBody();
        if (body == null) {
            return null;
        }
        return node_1.createWhile(value, body).withRange(log_1.spanRanges(token.range, body.range));
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
        if (!this.expect(scanner_1.TokenKind.LEFT_BRACE)) {
            return null;
        }
        let block = node_1.createBlock();
        if (!this.parseStatements(block)) {
            return null;
        }
        let close = this.current;
        if (!this.expect(scanner_1.TokenKind.RIGHT_BRACE)) {
            return null;
        }
        return block.withRange(log_1.spanRanges(open.range, close.range));
    }
    // parseObject():Node {
    //
    // }
    parseReturn() {
        let token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.RETURN);
        this.advance();
        let value = null;
        if (!this.peek(scanner_1.TokenKind.SEMICOLON)) {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null) {
                return null;
            }
        }
        let semicolon = this.current;
        this.expect(scanner_1.TokenKind.SEMICOLON);
        return node_1.createReturn(value).withRange(log_1.spanRanges(token.range, semicolon.range));
    }
    parseEmpty() {
        let token = this.current;
        this.advance();
        return node_1.createEmpty().withRange(token.range);
    }
    parseEnum(firstFlag) {
        let token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.ENUM);
        this.advance();
        let name = this.current;
        if (!this.expect(scanner_1.TokenKind.IDENTIFIER) || !this.expect(scanner_1.TokenKind.LEFT_BRACE)) {
            return null;
        }
        let text = name.range.toString();
        let node = node_1.createEnum(text);
        node.firstFlag = firstFlag;
        node.flags = node_1.allFlags(firstFlag);
        while (!this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.peek(scanner_1.TokenKind.RIGHT_BRACE)) {
            let member = this.current.range;
            let value = null;
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                return null;
            }
            if (this.eat(scanner_1.TokenKind.ASSIGN)) {
                value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (value == null) {
                    return null;
                }
            }
            let variable = node_1.createVariable(member.toString(), node_1.createName(text), value);
            node.appendChild(variable.withRange(value != null ? log_1.spanRanges(member, value.range) : member).withInternalRange(member));
            // Recover from a terminating semicolon
            if (this.peek(scanner_1.TokenKind.SEMICOLON)) {
                this.expect(scanner_1.TokenKind.COMMA);
                this.advance();
            }
            else if (this.peek(scanner_1.TokenKind.IDENTIFIER)) {
                this.expect(scanner_1.TokenKind.COMMA);
            }
            else if (!this.eat(scanner_1.TokenKind.COMMA)) {
                break;
            }
        }
        let close = this.current;
        if (!this.expect(scanner_1.TokenKind.RIGHT_BRACE)) {
            return null;
        }
        return node.withRange(log_1.spanRanges(token.range, close.range)).withInternalRange(name.range);
    }
    parseParameters() {
        let node = node_1.createParameters();
        let open = this.current;
        let close;
        assert_1.assert(open.kind == scanner_1.TokenKind.LESS_THAN);
        this.advance();
        while (true) {
            let name = this.current;
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                close = this.current;
                if (this.eat(scanner_1.TokenKind.GREATER_THAN)) {
                    break;
                }
                return null;
            }
            node.appendChild(node_1.createParameter(name.range.toString()).withRange(name.range));
            if (!this.eat(scanner_1.TokenKind.COMMA)) {
                close = this.current;
                if (!this.expect(scanner_1.TokenKind.GREATER_THAN)) {
                    return null;
                }
                break;
            }
        }
        return node.withRange(log_1.spanRanges(open.range, close.range));
    }
    parseImports() {
        let token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.IMPORT);
        this.advance();
        let node = node_1.createImports();
        node.flags = node.flags | scanner_1.TokenKind.IMPORT;
        if (this.peek(scanner_1.TokenKind.MULTIPLY)) {
            this.log.error(this.current.range, "wildcard '*' import not supported");
            assert_1.assert(this.eat(scanner_1.TokenKind.MULTIPLY));
            assert_1.assert(this.eat(scanner_1.TokenKind.AS));
            let importName = this.current;
            let range = importName.range;
            let _import = node_1.createImport(importName.range.toString());
            node.appendChild(_import.withRange(range).withInternalRange(importName.range));
            this.advance();
        }
        else {
            if (!this.expect(scanner_1.TokenKind.LEFT_BRACE)) {
                return null;
            }
            while (!this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.peek(scanner_1.TokenKind.RIGHT_BRACE)) {
                let importName = this.current;
                let range = importName.range;
                let _import = node_1.createImport(importName.range.toString());
                node.appendChild(_import.withRange(range).withInternalRange(importName.range));
                this.advance();
                if (!this.eat(scanner_1.TokenKind.COMMA)) {
                    break;
                }
            }
            // this.advance();
            // assert(this.expect(TokenKind.RIGHT_BRACE));
            this.expect(scanner_1.TokenKind.RIGHT_BRACE);
        }
        this.expect(scanner_1.TokenKind.FROM);
        let importFrom = this.current;
        let _from = node_1.createImportFrom(importFrom.range.toString());
        node.appendChild(_from.withRange(importFrom.range).withInternalRange(importFrom.range));
        this.advance();
        let semicolon = this.current;
        this.expect(scanner_1.TokenKind.SEMICOLON);
        return node.withRange(log_1.spanRanges(token.range, semicolon.range));
    }
    parseModule(firstFlag) {
        let token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.MODULE);
        this.advance();
        let name = this.current;
        if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
            return null;
        }
        let node = node_1.createModule(name.range.toString());
        node.firstFlag = firstFlag;
        node.flags = node_1.allFlags(firstFlag);
        // Type parameters
        if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
            let parameters = this.parseParameters();
            if (parameters == null) {
                return null;
            }
            node.appendChild(parameters);
        }
        if (!this.expect(scanner_1.TokenKind.LEFT_BRACE)) {
            return null;
        }
        while (!this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.peek(scanner_1.TokenKind.RIGHT_BRACE)) {
            let childFlags = this.parseFlags();
            let childName = this.current;
            let oldKind = childName.kind;
            // Support contextual keywords
            if (scanner_1.isKeyword(childName.kind)) {
                childName.kind = scanner_1.TokenKind.IDENTIFIER;
                this.advance();
            }
            // The identifier must come first without any keyword
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                return null;
            }
            let text = childName.range.toString();
            // Support operator definitions
            if (text == "operator" && !this.peek(scanner_1.TokenKind.LEFT_PARENTHESIS) && !this.peek(scanner_1.TokenKind.IDENTIFIER)) {
                childName.kind = scanner_1.TokenKind.OPERATOR;
                this.current = childName;
                if (this.parseFunction(childFlags, node) == null) {
                    return null;
                }
                continue;
            }
            else if (this.peek(scanner_1.TokenKind.IDENTIFIER)) {
                let isGet = text == "get";
                let isSet = text == "set";
                // The "get" and "set" flags are contextual
                if (isGet || isSet) {
                    childFlags = node_1.appendFlag(childFlags, isGet ? node_1.NODE_FLAG_GET : node_1.NODE_FLAG_SET, childName.range);
                    // Get the real identifier
                    childName = this.current;
                    this.advance();
                }
                else if (oldKind == scanner_1.TokenKind.FUNCTION) {
                    this.log.error(childName.range, "Instance functions don't need the 'function' keyword");
                    // Get the real identifier
                    childName = this.current;
                    this.advance();
                }
                else if (oldKind == scanner_1.TokenKind.CONST || oldKind == scanner_1.TokenKind.LET || oldKind == scanner_1.TokenKind.VAR) {
                    this.log.error(childName.range, stringbuilder_1.StringBuilder_new()
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
            if (this.peek(scanner_1.TokenKind.LEFT_PARENTHESIS) || this.peek(scanner_1.TokenKind.LESS_THAN)) {
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
        if (!this.expect(scanner_1.TokenKind.RIGHT_BRACE)) {
            return null;
        }
        return node.withRange(log_1.spanRanges(token.range, close.range)).withInternalRange(name.range);
    }
    parseClass(firstFlag) {
        let token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.CLASS);
        this.advance();
        let name = this.current;
        if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
            return null;
        }
        let node = node_1.createClass(name.range.toString());
        node.firstFlag = firstFlag;
        node.flags = node_1.allFlags(firstFlag);
        // Type parameters
        if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
            let parameters = this.parseParameters();
            if (parameters == null) {
                return null;
            }
            node.appendChild(parameters);
        }
        // "extends" clause
        let extendsToken = this.current;
        if (this.eat(scanner_1.TokenKind.EXTENDS)) {
            let type;
            // Recover from a missing type
            if (this.peek(scanner_1.TokenKind.LEFT_BRACE) || this.peek(scanner_1.TokenKind.IMPLEMENTS)) {
                this.unexpectedToken();
                type = node_1.createParseError();
            }
            else {
                type = this.parseType();
                if (type == null) {
                    return null;
                }
            }
            node.appendChild(node_1.createExtends(type).withRange(type.range != null ? log_1.spanRanges(extendsToken.range, type.range) : extendsToken.range));
        }
        // "implements" clause
        let implementsToken = this.current;
        if (this.eat(scanner_1.TokenKind.IMPLEMENTS)) {
            let list = node_1.createImplements();
            let type = null;
            while (true) {
                // Recover from a missing type
                if (this.peek(scanner_1.TokenKind.LEFT_BRACE)) {
                    this.unexpectedToken();
                    break;
                }
                type = this.parseType();
                if (type == null) {
                    return null;
                }
                list.appendChild(type);
                if (!this.eat(scanner_1.TokenKind.COMMA)) {
                    break;
                }
            }
            node.appendChild(list.withRange(type != null ? log_1.spanRanges(implementsToken.range, type.range) : implementsToken.range));
        }
        if (!this.expect(scanner_1.TokenKind.LEFT_BRACE)) {
            return null;
        }
        while (!this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.peek(scanner_1.TokenKind.RIGHT_BRACE)) {
            let childFlags = this.parseFlags();
            let childName = this.current;
            let oldKind = childName.kind;
            // Support contextual keywords
            if (scanner_1.isKeyword(childName.kind)) {
                childName.kind = scanner_1.TokenKind.IDENTIFIER;
                this.advance();
            }
            // The identifier must come first without any keyword
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                return null;
            }
            let text = childName.range.toString();
            // Support operator definitions
            if (text == "operator" && !this.peek(scanner_1.TokenKind.LEFT_PARENTHESIS) && !this.peek(scanner_1.TokenKind.IDENTIFIER)) {
                childName.kind = scanner_1.TokenKind.OPERATOR;
                this.current = childName;
                if (this.parseFunction(childFlags, node) == null) {
                    return null;
                }
                continue;
            }
            else if (this.peek(scanner_1.TokenKind.IDENTIFIER)) {
                let isGet = text == "get";
                let isSet = text == "set";
                // The "get" and "set" flags are contextual
                if (isGet || isSet) {
                    childFlags = node_1.appendFlag(childFlags, isGet ? node_1.NODE_FLAG_GET : node_1.NODE_FLAG_SET, childName.range);
                    // Get the real identifier
                    childName = this.current;
                    this.advance();
                }
                else if (oldKind == scanner_1.TokenKind.FUNCTION) {
                    this.log.error(childName.range, "Instance functions don't need the 'function' keyword");
                    // Get the real identifier
                    childName = this.current;
                    this.advance();
                }
                else if (oldKind == scanner_1.TokenKind.CONST || oldKind == scanner_1.TokenKind.LET || oldKind == scanner_1.TokenKind.VAR) {
                    this.log.error(childName.range, stringbuilder_1.StringBuilder_new()
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
            if (this.peek(scanner_1.TokenKind.LEFT_PARENTHESIS) || this.peek(scanner_1.TokenKind.LESS_THAN)) {
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
        if (!this.expect(scanner_1.TokenKind.RIGHT_BRACE)) {
            return null;
        }
        return node.withRange(log_1.spanRanges(token.range, close.range)).withInternalRange(name.range);
    }
    parseFunction(firstFlag, parent) {
        let isOperator = false;
        let token = this.current;
        let nameRange;
        let name;
        // Support custom operators
        if (parent != null && this.eat(scanner_1.TokenKind.OPERATOR)) {
            let end = this.current;
            if (this.eat(scanner_1.TokenKind.LEFT_BRACKET)) {
                if (!this.expect(scanner_1.TokenKind.RIGHT_BRACKET)) {
                    return null;
                }
                if (this.peek(scanner_1.TokenKind.ASSIGN)) {
                    nameRange = log_1.spanRanges(token.range, this.current.range);
                    name = "[]=";
                    this.advance();
                }
                else {
                    nameRange = log_1.spanRanges(token.range, end.range);
                    name = "[]";
                }
                isOperator = true;
            }
            else if (this.eat(scanner_1.TokenKind.BITWISE_AND) ||
                this.eat(scanner_1.TokenKind.BITWISE_OR) ||
                this.eat(scanner_1.TokenKind.BITWISE_XOR) ||
                this.eat(scanner_1.TokenKind.COMPLEMENT) ||
                this.eat(scanner_1.TokenKind.DIVIDE) ||
                this.eat(scanner_1.TokenKind.EQUAL) ||
                this.eat(scanner_1.TokenKind.EXPONENT) ||
                this.eat(scanner_1.TokenKind.LESS_THAN) ||
                this.eat(scanner_1.TokenKind.GREATER_THAN) ||
                this.eat(scanner_1.TokenKind.MINUS) ||
                this.eat(scanner_1.TokenKind.MINUS_MINUS) ||
                this.eat(scanner_1.TokenKind.MULTIPLY) ||
                this.eat(scanner_1.TokenKind.PLUS) ||
                this.eat(scanner_1.TokenKind.PLUS_PLUS) ||
                this.eat(scanner_1.TokenKind.REMAINDER) ||
                this.eat(scanner_1.TokenKind.SHIFT_LEFT) ||
                this.eat(scanner_1.TokenKind.SHIFT_RIGHT)) {
                nameRange = end.range;
                name = nameRange.toString();
                isOperator = true;
            }
            else if (this.eat(scanner_1.TokenKind.ASSIGN) ||
                this.eat(scanner_1.TokenKind.GREATER_THAN_EQUAL) ||
                this.eat(scanner_1.TokenKind.LESS_THAN_EQUAL) ||
                this.eat(scanner_1.TokenKind.LOGICAL_AND) ||
                this.eat(scanner_1.TokenKind.LOGICAL_OR) ||
                this.eat(scanner_1.TokenKind.NOT) ||
                this.eat(scanner_1.TokenKind.NOT_EQUAL)) {
                nameRange = end.range;
                name = nameRange.toString();
                // Recover from an invalid operator name
                this.log.error(nameRange, stringbuilder_1.StringBuilder_new()
                    .append("The operator '")
                    .append(name)
                    .append("' cannot be implemented")
                    .append(end.kind == scanner_1.TokenKind.NOT_EQUAL ? " (it is automatically derived from '==')" :
                    end.kind == scanner_1.TokenKind.LESS_THAN_EQUAL ? " (it is automatically derived from '>')" :
                        end.kind == scanner_1.TokenKind.GREATER_THAN_EQUAL ? " (it is automatically derived from '<')" :
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
                assert_1.assert(token.kind == scanner_1.TokenKind.FUNCTION);
                this.advance();
            }
            // Remember where the name is for the symbol later
            nameRange = this.current.range;
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
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
        if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
            let parameters = this.parseParameters();
            if (parameters == null) {
                return null;
            }
            node.appendChild(parameters);
        }
        if (!this.expect(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
            return null;
        }
        if (!this.peek(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
            while (true) {
                let firstArgumentFlag = this.parseFlags();
                let argument = this.current;
                ;
                if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                    return null;
                }
                let type;
                let value = null;
                let range = argument.range;
                if (this.expect(scanner_1.TokenKind.COLON)) {
                    type = this.parseType();
                    if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
                        let parameters = this.parseParameters();
                        if (parameters == null) {
                            return null;
                        }
                        type.appendChild(parameters);
                    }
                    if (type != null) {
                        range = log_1.spanRanges(range, type.range);
                    }
                    else if (this.peek(scanner_1.TokenKind.COMMA) || this.peek(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                        type = node_1.createParseError();
                    }
                    else {
                        return null;
                    }
                }
                else if (this.peek(scanner_1.TokenKind.COMMA) || this.peek(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                    type = node_1.createParseError();
                }
                let firstType = type;
                //Type alias
                while (this.eat(scanner_1.TokenKind.BITWISE_OR)) {
                    let aliasType = this.parseType();
                    if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
                        let parameters = this.parseParameters();
                        if (parameters == null) {
                            return null;
                        }
                        aliasType.appendChild(parameters);
                    }
                    if (aliasType != null) {
                        range = log_1.spanRanges(range, aliasType.range);
                    }
                    else if (this.peek(scanner_1.TokenKind.COMMA) || this.peek(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                        aliasType = node_1.createParseError();
                    }
                    else {
                        return null;
                    }
                    type.appendChild(aliasType);
                    type = aliasType;
                }
                if (this.eat(scanner_1.TokenKind.ASSIGN)) {
                    value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                }
                let variable = node_1.createVariable(argument.range.toString(), firstType, value);
                variable.firstFlag = firstArgumentFlag;
                variable.flags = node_1.allFlags(firstArgumentFlag);
                node.appendChild(variable.withRange(range).withInternalRange(argument.range));
                if (!this.eat(scanner_1.TokenKind.COMMA)) {
                    break;
                }
            }
        }
        if (!this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
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
            else if (this.expect(scanner_1.TokenKind.COLON)) {
                returnType = this.parseType();
                if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
                    let parameters = this.parseParameters();
                    if (parameters == null) {
                        return null;
                    }
                    returnType.appendChild(parameters);
                }
                if (returnType == null) {
                    // Recover from a missing return type
                    if (this.peek(scanner_1.TokenKind.SEMICOLON) || this.peek(scanner_1.TokenKind.LEFT_BRACE)) {
                        returnType = node_1.createParseError();
                    }
                    else {
                        return null;
                    }
                }
                let firstType = returnType;
                //Type alias
                while (this.eat(scanner_1.TokenKind.BITWISE_OR)) {
                    let aliasType = this.parseType();
                    if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
                        let parameters = this.parseParameters();
                        if (parameters == null) {
                            return null;
                        }
                        aliasType.appendChild(parameters);
                    }
                    if (aliasType == null) {
                        // Recover from a missing return type
                        if (this.peek(scanner_1.TokenKind.SEMICOLON) || this.peek(scanner_1.TokenKind.LEFT_BRACE)) {
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
            else if (this.peek(scanner_1.TokenKind.SEMICOLON) || this.peek(scanner_1.TokenKind.LEFT_BRACE)) {
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
        if (this.eat(scanner_1.TokenKind.SEMICOLON)) {
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
        return node.withRange(log_1.spanRanges(token.range, block.range)).withInternalRange(nameRange);
    }
    parseVariables(firstFlag, parent) {
        let token = this.current;
        // Variables inside class declarations don't use "var"
        if (parent == null) {
            assert_1.assert(token.kind == scanner_1.TokenKind.CONST || token.kind == scanner_1.TokenKind.LET || token.kind == scanner_1.TokenKind.VAR);
            this.advance();
        }
        let node = token.kind == scanner_1.TokenKind.CONST ? node_1.createConstants() : node_1.createVariables();
        node.firstFlag = firstFlag;
        while (true) {
            let name = this.current;
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                return null;
            }
            let type = null;
            if (this.eat(scanner_1.TokenKind.COLON)) {
                type = this.parseType();
                if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
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
            if (this.eat(scanner_1.TokenKind.ASSIGN)) {
                value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (value == null) {
                    return null;
                }
                // TODO: Implement constructors
                if (parent != null) {
                    //this.log.error(value.range, "Inline initialization of instance variables is not supported yet");
                }
            }
            let range = value != null ? log_1.spanRanges(name.range, value.range) :
                type != null ? log_1.spanRanges(name.range, type.range) :
                    name.range;
            let variable = node_1.createVariable(name.range.toString(), type, value);
            variable.firstFlag = firstFlag;
            variable.flags = node_1.allFlags(firstFlag);
            (parent != null ? parent : node).appendChild(variable.withRange(range).withInternalRange(name.range));
            if (!this.eat(scanner_1.TokenKind.COMMA)) {
                break;
            }
        }
        let semicolon = this.current;
        this.expect(scanner_1.TokenKind.SEMICOLON);
        return node.withRange(log_1.spanRanges(token.range, semicolon.range));
    }
    parseLoopJump(kind) {
        let token = this.current;
        this.advance();
        this.expect(scanner_1.TokenKind.SEMICOLON);
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
            if (this.eat(scanner_1.TokenKind.DECLARE))
                flag = node_1.NODE_FLAG_DECLARE;
            else if (this.eat(scanner_1.TokenKind.EXPORT))
                flag = node_1.NODE_FLAG_EXPORT;
            else if (this.eat(scanner_1.TokenKind.PRIVATE))
                flag = node_1.NODE_FLAG_PRIVATE;
            else if (this.eat(scanner_1.TokenKind.PROTECTED))
                flag = node_1.NODE_FLAG_PROTECTED;
            else if (this.eat(scanner_1.TokenKind.PUBLIC))
                flag = node_1.NODE_FLAG_PUBLIC;
            else if (this.eat(scanner_1.TokenKind.STATIC))
                flag = node_1.NODE_FLAG_STATIC;
            else if (this.eat(scanner_1.TokenKind.ANYFUNC))
                flag = node_1.NODE_FLAG_ANYFUNC;
            else if (this.eat(scanner_1.TokenKind.UNSAFE))
                flag = node_1.NODE_FLAG_UNSAFE;
            else if (this.eat(scanner_1.TokenKind.JAVASCRIPT))
                flag = node_1.NODE_FLAG_JAVASCRIPT;
            else if (this.eat(scanner_1.TokenKind.START))
                flag = node_1.NODE_FLAG_START;
            else if (this.eat(scanner_1.TokenKind.VIRTUAL))
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
        return node.withRange(log_1.spanRanges(token.range, node.range));
    }
    parseJavaScript() {
        let token = this.current;
        this.advance();
        let node = this.parseBlock();
        if (node == null) {
            return null;
        }
        node.flags = node.flags | node_1.NODE_FLAG_JAVASCRIPT;
        return node.withRange(log_1.spanRanges(token.range, node.range));
    }
    parseStart() {
        let token = this.current;
        this.advance();
        let node = this.parseBlock();
        if (node == null) {
            return null;
        }
        node.flags = node.flags | node_1.NODE_FLAG_START;
        return node.withRange(log_1.spanRanges(token.range, node.range));
    }
    parseVirtual(firstFlag) {
        let token = this.current;
        this.advance();
        let node = this.parseFunction(firstFlag, null);
        if (node == null) {
            return null;
        }
        node.flags = node.flags | node_1.NODE_FLAG_VIRTUAL;
        return node.withRange(log_1.spanRanges(token.range, node.range));
    }
    parseStatement(mode) {
        let firstFlag = mode == StatementMode.FILE ? this.parseFlags() : null;
        // if (this.peek(TokenKind.UNSAFE) && firstFlag == null) return this.parseUnsafe(); //disabled for now
        if (this.peek(scanner_1.TokenKind.IMPORT) && firstFlag == null)
            return this.parseImports(); // This should handle before parsing
        if (this.peek(scanner_1.TokenKind.JAVASCRIPT) && firstFlag == null)
            return this.parseJavaScript();
        if (this.peek(scanner_1.TokenKind.START) && firstFlag == null)
            return this.parseStart();
        if (this.peek(scanner_1.TokenKind.CONST) || this.peek(scanner_1.TokenKind.LET) || this.peek(scanner_1.TokenKind.VAR))
            return this.parseVariables(firstFlag, null);
        if (this.peek(scanner_1.TokenKind.FUNCTION))
            return this.parseFunction(firstFlag, null);
        if (this.peek(scanner_1.TokenKind.VIRTUAL))
            return this.parseVirtual(firstFlag);
        if (this.peek(scanner_1.TokenKind.MODULE))
            return this.parseModule(firstFlag);
        if (this.peek(scanner_1.TokenKind.CLASS))
            return this.parseClass(firstFlag);
        if (this.peek(scanner_1.TokenKind.ENUM))
            return this.parseEnum(firstFlag);
        // Definition modifiers need to be attached to a definition
        if (firstFlag != null) {
            this.unexpectedToken();
            return null;
        }
        if (this.peek(scanner_1.TokenKind.LEFT_BRACE))
            return this.parseBlock();
        if (this.peek(scanner_1.TokenKind.BREAK))
            return this.parseLoopJump(node_1.NodeKind.BREAK);
        if (this.peek(scanner_1.TokenKind.CONTINUE))
            return this.parseLoopJump(node_1.NodeKind.CONTINUE);
        if (this.peek(scanner_1.TokenKind.IF))
            return this.parseIf();
        if (this.peek(scanner_1.TokenKind.WHILE))
            return this.parseWhile();
        if (this.peek(scanner_1.TokenKind.DELETE))
            return this.parseDelete();
        if (this.peek(scanner_1.TokenKind.RETURN))
            return this.parseReturn();
        if (this.peek(scanner_1.TokenKind.SEMICOLON))
            return this.parseEmpty();
        // Parse an expression statement
        let value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
        if (value == null) {
            return null;
        }
        let semicolon = this.current;
        this.expect(scanner_1.TokenKind.SEMICOLON);
        return node_1.createExpression(value).withRange(log_1.spanRanges(value.range, semicolon.range));
    }
    parseStatements(parent) {
        while (!this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.peek(scanner_1.TokenKind.RIGHT_BRACE)) {
            let child = this.parseStatement(parent.kind == node_1.NodeKind.FILE ? StatementMode.FILE : StatementMode.NORMAL);
            if (child == null) {
                return false;
            }
            if (child.kind === node_1.NodeKind.RETURN) {
                parent.returnNode = child;
            }
            parent.appendChild(child);
        }
        return true;
    }
    parseInt(range, node) {
        let source = range.source;
        let contents = source.contents;
        node.intValue = parseInt(contents.substring(range.start, range.end));
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
exports.parse = parse;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 06.06.17.
 */
exports.isBrowser = new Function("try {return this===window;}catch(e){ return false;}")();
exports.isNode = new Function("try {return this===global;}catch(e){return false;}")();


/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = "declare class Math {\n    static abs(x: float32): float32;\n    static acos(x: float64): float64;\n    static asin(x: float64): float64;\n    static atan(x: float64): float64;\n    static atan2(y: float64, x: float64): float64;\n    static ceil(x: float32): float32;\n    static cos(x: float64): float64;\n    static exp(x: float64): float64;\n    static floor(x: float32): float32;\n    static log(x: float64): float64;\n    // static max(...values: float64[]): float64;\n    static max(a: float64, b:float64): float64;\n    // static min(...values: float64[]): float64;\n    static min(a: float64, b:float64): float64;\n    static pow(x: float64, y: float64): float64;\n    static random(): float64; // 'random' is not a standard Math builtin\n    // static round(x: float64): float64; //'round' is not a standard Math builtin\n    static sin(x: float64): float64;\n    static sqrt(x: float32): float32;\n    static tan(x: float64): float64;\n    static imul(a: int32, b:int32): int32;\n}\n\nfunction absf32(x:float32):float32{\n    return Math.abs(x) as float32;\n}\n\nfunction sqrtf32(x:float32):float32{\n    return Math.sqrt(x);\n}\n\nfunction powf32(x:float32, y:float32):float32{\n    return Math.pow(x as float64, y as float64) as float32;\n}\n\nfunction minf32(x:float32, y:float32):float32{\n    return Math.min(x as float64, y as float64) as float32;\n}\nfunction maxf32(x:float32, y:float32):float32{\n    return Math.max(x as float64, y as float64) as float32;\n}"

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = "class Array<T> {\n\n    bytesLength: int32;\n    elementSize: int32;\n\n    constructor(bytesLength: int32, elementSize: int32) {\n        this.bytesLength = bytesLength;\n        this.elementSize = elementSize;\n    }\n\n    operator [] (index: int32): T {\n        let stripe = index * this.elementSize;\n        if (stripe >= 0 && stripe < this.bytesLength) {\n            return *((this as *uint8 + 8 + stripe) as *T);\n        }\n        return null as T;\n    }\n\n    operator []= (index: int32, value: T): void {\n        let stripe = index * this.elementSize;\n        if (stripe >= 0 && stripe < this.bytesLength) {\n            *((this as *uint8 + 8 + stripe) as *T) = value;\n        }\n    }\n\n    get length(): int32 {\n        return this.bytesLength / this.elementSize;\n    }\n}\n\n//declare type Int32Array   = Array< int32 >\n//declare type Uint32Array  = Array< uint32 >\n//declare type Int64Array   = Array< int64 >\n//declare type Uint64Array  = Array< uint64 >\n//declare type Float32Array = Array< float32 >\n//declare type Float64Array = Array< float64 >\n"

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = "var originalHeapPointer: *uint8 = null;\nvar currentHeapPointer: *uint8 = null;\n\nvar freeMemory: int32 = 0;\nvar numFreeChunks: int32 = 0;\nvar firstFree: int32 = 0;\nvar lastFree: int32 = 0;\n\nconst PREV_INUSE:int32 = 1;\nconst IS_MMAPPED:int32 = 2;\nconst NON_MAIN_ARENA:int32 = 4;\nconst SIZE_BITS:int32 = PREV_INUSE|IS_MMAPPED|NON_MAIN_ARENA;\n\n//An allocated chunk looks like this:\n/*\n    chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Size of previous chunk, if allocated            | |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Size of chunk, in bytes                         |P|\n      mem-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             User data starts here...                          .\n            .                                                               .\n            .             (malloc_usable_size() bytes)                      .\n            .                                                               |\nnextchunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Size of chunk                                     |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n*/\n//Free chunks are stored in circular doubly-linked lists, and look like this:\n/*\n    chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Size of previous chunk                            |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n    `head:' |             Size of chunk, in bytes                         |P|\n      mem-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Forward pointer to next chunk in list             |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Back pointer to previous chunk in list            |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Unused space (may be 0 bytes long)                .\n            .                                                               .\n            .                                                               |\nnextchunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n    `foot:' |             Size of chunk, in bytes                           |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n*/\n\n// function init_malloc():void{\n//     numFreeChunks = 0;\n//     firstFree = 0;\n//     lastFree = 0;\n//     originalHeapPointer = 40 as *uint8;//this will override by compiler\n//     currentHeapPointer  = 40 as *uint8;//this will override by compiler\n// }\n\nexport function malloc(size: int32): *uint8 {\n\n    //All loc variable should declare here before assigning named value\n    var alignment:int32 = 8;\n\n    size = (size + (alignment - 1)) & ~(alignment - 1) as int32;\n    var chunkSize = size + 8;\n\n    var freeChunk = getFreeChunk(chunkSize);\n     if(freeChunk as int32 > 0){\n        return freeChunk;\n    }\n\n    var offset:int32 = currentHeapPointer as int32;\n    offset = offset + 7;\n    offset = offset & ~7;\n    // offset = ((currentHeapPointer as int32 + 7) & ~(7) as int32) as *uint8;\n\n    var top = offset + chunkSize;\n\n    var ptr = (offset + 4) as *uint8; //skip prev size\n    setHeadSize(ptr, chunkSize);\n    setInuse((ptr + 4) as *uint8);\n    setFoot(ptr, chunkSize);\n\n    currentHeapPointer = (top + 4) as *uint8;\n\n    offset = offset + 8;\n\n    // Make sure the memory starts off at zero\n    ptr = offset as *uint8;\n    while ((ptr as int32) < (top as int32)) {\n      *(ptr as *int32) = 0;\n      ptr = ptr + 4;\n    }\n\n    return offset as *uint8;\n}\nexport function free(ptr:*uint8):void{\n\n    var chunkptr:*uint8 = null;\n    var tmp1:int32 = 0;\n\n    clearInuse(ptr);\n    if(firstFree == 0){\n        firstFree = ptr as int32;\n    }\n\n    tmp1 = freeMemory as int32;\n    tmp1 = tmp1 + getChunkSize(ptr) as int32;\n    freeMemory = tmp1 as int32;\n\n    chunkptr = ptr + 4;\n    if(lastFree > 0){\n        *(chunkptr as *int32) = lastFree;//backward pointer to prev chunk\n        *(lastFree as *int32) = ptr as int32;//forward pointer to next chunk of prev chunk\n    }else{\n        *(chunkptr as *int32) = 0;//no backward pointer, this is the first free chunk\n    }\n\n    *(ptr as *int32) = 0;//no forward pointer\n\n    lastFree = ptr as int32;\n    numFreeChunks = numFreeChunks + 1;\n}\n/*export*/function getFreeChunk(size: int32):*uint8{\n\n    var freeChunk:*uint8 = null;\n    var tmp1:int32 = 0;\n    var tmp2:int32 = 0;\n    var tmp3:int32 = 0;\n    var tmp4:int32 = 0;\n\n    tmp1 = firstFree;\n    tmp2 = lastFree;\n    tmp3 = freeMemory;\n\n    if(numFreeChunks > 0){\n        freeChunk = findChunk(size);\n        if(freeChunk as int32 > 0){\n            if(freeChunk as int32 == tmp1){\n                firstFree = nextFree(freeChunk) as int32;\n            }\n            if(freeChunk as int32 == tmp2){\n                lastFree = 0;\n            }\n            numFreeChunks = numFreeChunks - 1;\n            setInuse(freeChunk);\n            tmp4 = getChunkSize(freeChunk);\n            tmp3 = tmp3 - tmp4;\n            freeMemory = tmp3;\n        }\n    }\n    return freeChunk;\n}\n/*export*/function findChunk(size: int32):*uint8{\n    var chunk:*uint8 = null;\n    var tmp1:int32 = 0;\n\n    chunk = firstFree as *uint8;\n    while(chunk != null){\n        tmp1= getChunkSize(chunk);\n        if(tmp1 == size){\n            return chunk;\n        }\n        chunk = *(chunk as *int32) as *uint8;\n    }\n    return null;\n}\n/*export*/ function getHeapPtr(): int32 {\n    return currentHeapPointer as int32;\n}\n/*export*/ function getFreeMemory(): int32 {\n    return freeMemory;\n}\n/*export*/ function getOriginalHeapPtr(): int32 {\n    return originalHeapPointer as int32;\n}\nfunction getNumFreeChunks():int32{\n    return numFreeChunks as int32;\n}\n/*export*/function getFirstFree():int32{\n    return firstFree;\n}\n/*export*/function getLastFree():int32{\n    return lastFree;\n}\n/*export*/function prevFree(ptr:*uint8):int32{\n    return  *(ptr as *int32 + 4) as int32;\n}\n/*export*/function nextFree(ptr:*uint8):int32{\n    return *(ptr as *int32) as int32;\n}\n/* Set size at head, without disturbing its use bit */\nfunction setHeadSize(ptr:*uint8, s:int32):void  {\n    *(ptr as *int32) = (*(ptr as *int32) & SIZE_BITS) | s;\n}\n\n/* Set size/use field */\nfunction setHead(ptr:*uint8, s:int32):void {\n   *(ptr as *int32) = s;\n}\n\n/* Set size at footer (only when chunk is not in use) */\nfunction setFoot(ptr:*uint8, s:int32):void {\n    var chunkptr:int32 = 0;\n    var size:int32 = 0;\n    size = *(ptr as *int32);\n    chunkptr = (ptr as int32) + size;\n    *(chunkptr as *int32) = s;\n}\n\n/*export*/function getPrevInuse(ptr:*uint8):int32 {\n    var chunkptr:int32 = 0;\n    chunkptr = (ptr as int32) - 8;\n    return *(chunkptr as *int32) & (PREV_INUSE);\n}\n/*export*/function setInuse(ptr:*uint8):void{\n    var chunkptr:int32 = 0;\n    chunkptr = (ptr as int32) - 4;\n    *(chunkptr as *int32) =  *(chunkptr as *int32) | PREV_INUSE;\n}\n/*export*/function getInuse(ptr:*uint8):int32{\n    var chunkptr:int32 = 0;\n    chunkptr = (ptr as int32) - 4;\n    return *(chunkptr as *int32) & (PREV_INUSE);\n}\n/*export*/function clearInuse(ptr:*uint8):void{\n    var chunkptr:int32 = 0;\n    chunkptr = (ptr as int32) - 4;\n    *(chunkptr as *int32) = *(chunkptr as *int32) & ~(PREV_INUSE);\n}\n/*export*/function getChunkSize(ptr:*uint8):int32{\n    var chunkptr:int32 = 0;\n    chunkptr = (ptr as int32) - 4;\n    return *(chunkptr as *int32) & ~(PREV_INUSE) as int32;\n}\n/* malloc */\n// var SIZE_SZ:int32 = 4;\n// var MALLOC_ALIGNMENT:int32 = 8;//2 * SIZE_SZ;\n// var MALLOC_ALIGN_MASK:int32 = MALLOC_ALIGNMENT - 1;\n//\n// var PREV_INUSE:int32 = 0x1;\n// var IS_MMAPPED:int32 = 0x2;\n// var NON_MAIN_ARENA:int32 = 0x4;\n// var SIZE_BITS:int32 = PREV_INUSE|IS_MMAPPED|NON_MAIN_ARENA;\n//\n// class chunk{\n//     prevSize:int32;\n//     size:int32;\n//     forward:int32;\n//     backward:int32;\n//     forwardLarge:int32;\n//     backwardLarge:int32;\n// }\n// function prev_inuse(p:*chunk):int32 {\n//     return (p as chunk).size & PREV_INUSE;\n// }\n// function chunksize(p:*chunk):int32 {\n//     return (p as chunk).size & ~(SIZE_BITS);\n// }\n// /* Ptr to next physical malloc_chunk. */\n// function next_chunk(p:*chunk):*chunk {\n//     ((*p as int32) + (p as chunk).size & ~(SIZE_BITS)) as *chunk;\n// }\n//\n// /* Ptr to previous physical malloc_chunk */\n// function prev_chunk(p:*chunk):*chunk {\n//     ((*p as int32) - (p as chunk).prevSize) as *chunk;\n// }\n//\n// /* Treat space at ptr + offset as a chunk */\n// function chunk_at_offset(p:*chunk, s:int32):*chunk{\n//     return ((*p as int32) + s) as *chunk;\n// }\n//\n// /* extract p's inuse bit */\n// function inuse(p:*chunk):int32{\n//  return ((*p as int32) + (((p as chunk).size & ~SIZE_BITS) as chunk).size) & PREV_INUSE;\n// }\n//\n// /* set/clear chunk as being inuse without otherwise disturbing */\n// function set_inuse(p:*chunk):int32{\n//  return ((*p as int32) + (((p as chunk).size & ~SIZE_BITS) as chunk).size) = ((*p as int32) + (((p as chunk).size & ~SIZE_BITS) as chunk).size) | PREV_INUSE;\n// }\n//\n// function clear_inuse(p:*chunk):int32{\n//  return ((*p as int32) + (((p as chunk).size & ~SIZE_BITS) as chunk).size) = ((*p as int32) + (((p as chunk).size & ~SIZE_BITS) as chunk).size) & ~(PREV_INUSE);\n// }\n\nfunction memcpy(target: *uint8, source: *uint8, length: int32): void {\n    // No-op if either of the inputs are null\n    if (source == null || target == null) {\n      return;\n    }\n\n    // Optimized aligned copy\n    if (length >= 16 && (source as int32) % 4 == (target as int32) % 4) {\n      // Pick off the beginning\n      while ((target as int32) % 4 != 0) {\n        *target = *source;\n        target = target + 1;\n        source = source + 1;\n        length = length - 1;\n      }\n\n      // Pick off the end\n      while (length % 4 != 0) {\n        length = length - 1;\n        *(target + length) = *(source + length);\n      }\n\n      // Zip over the middle\n      var end = target + length;\n      while (target < end) {\n        *(target as *int32) = *(source as *int32);\n        target = target + 4;\n        source = source + 4;\n      }\n    }\n\n    // Slow unaligned copy\n    else {\n      var end = target + length;\n      while (target < end) {\n        *target = *source;\n        target = target + 1;\n        source = source + 1;\n      }\n    }\n}\n\nfunction memcmp(a: *uint8, b: *uint8, length: int32): int32 {\n    // No-op if either of the inputs are null\n    if (a == null || b == null) {\n      return 0;\n    }\n\n    // Return the first non-zero difference\n    while (length > 0) {\n      var delta = *a as int32 - *b as int32;\n      if (delta != 0) {\n        return delta;\n      }\n      a = a + 1;\n      b = b + 1;\n      length = length - 1;\n    }\n\n    // Both inputs are identical\n    return 0;\n}"

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = "const PI:float64 = 3.141592653589793;\n\nconst MAX_UNSIGNED_INTEGER_32:uint32 = 4294967295;\n\nconst MIN_INTEGER_32:int32 = -2147483648;\nconst MAX_INTEGER_32:int32 = 2147483647;\n\nconst MAX_UNSIGNED_INTEGER_64:int32 = 18446744073709551615;\n\n// −(2^63) to 2^63 − 1\n// const MIN_INTEGER_64:int32 = -powi64(2, 63);\n// const MAX_INTEGER_64:int32 = powi64(2, 63) - 1;"

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = "// Native types\nconst NaN:      float64 = 0.0 / 0.0;\nconst Infinity: float64 = 1.0 / 0.0;\n\nfunction isNaN(value: float32): boolean {\n    return value != value;\n}\n\nfunction isFinite(value: float32): boolean {\n    return !isNaN(value) && value != Infinity && value != -Infinity;\n}\n\ndeclare class boolean {\n    toString(): string;\n}\n\ndeclare class int8 {\n    toString(): string;\n}\n\ndeclare class uint8 {\n    toString(): string;\n}\n\ndeclare class int16 {\n    toString(): string;\n}\n\ndeclare class uint16 {\n    toString(): string;\n}\n\ndeclare class int32 {\n    toString(): string;\n}\n\ndeclare class uint32 {\n    toString(): string;\n}\n\ndeclare class int64 {\n    toString(): string;\n}\n\ndeclare class uint64 {\n    toString(): string;\n}\n\ndeclare class float32 {\n    toString(): string;\n}\n\ndeclare class float64 {\n    toString(): string;\n}\n\ndeclare class string {\n    charAt(index: int32): string;\n\n    charCodeAt(index: int32): uint16;\n\n    get length(): int32;\n\n    indexOf(text: string): int32;\n\n    lastIndexOf(text: string): int32;\n\n    operator == (other: string):boolean;\n    operator [] (index: int32): uint16 { return this.charCodeAt(index); }\n    slice(start: int32, end: int32): string;\n\n    // startsWith(text: string): boolean { return this.slice(0, text.length) == text; }\n    // endsWith(text: string): boolean { return this.slice(-text.length, this.length) == text; }\n}\n"

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = "//part of asm module, we have global, foreign, buffer somewhere above this code\n\nvar HEAP8 = new global.Int8Array(buffer);\nvar HEAP16 = new global.Int16Array(buffer);\nvar HEAP32 = new global.Int32Array(buffer);\nvar HEAPU8 = new global.Uint8Array(buffer);\nvar HEAPU16 = new global.Uint16Array(buffer);\nvar HEAPU32 = new global.Uint32Array(buffer);\nvar HEAPF32 = new global.Float32Array(buffer);\nvar HEAPF64 = new global.Float64Array(buffer);\n\nvar NULL = 0;\nvar STACKTOP=env.STACKTOP|0;\nvar STACK_MAX=env.STACK_MAX|0;\n\n// var PREV_INUSE = 0x1;\n// var PREV_INUSE = 0x1;\n// var IS_MMAPPED = 0x2;\n// var NON_MAIN_ARENA = 0x4;\n// var SIZE_BITS = 0x7;//(PREV_INUSE|IS_MMAPPED|NON_MAIN_ARENA) | 0;\n// var firstFreeChunk = 0;\n// var lastFreeChunk = 0;\n// var numFreeChunks = 0;\n// var freeMemory = 0;\n//var internal_alloc = 0;\n\n// var _now = (typeof global.performance != 'undefined' && typeof global.performance.now == 'function' ?\n//     global.performance.now.bind(global.performance) :\n//     global.Date.now.bind(global.Date));\n// var _now = global.performance;\n// Map of class type IDs to type objects.\n// var _idToType = 8;\n\n// function init() {\n//     HEAP32[2 >> 2] = buffer.byteLength | 0;\n\n    // if (global.isShared) {\n    //     internal_alloc = alloc_sab;\n    //     global.Atomics.store(HEAP32, 1 | 0, 16 | 0);\n    // }\n    // else {\n    //     internal_alloc = alloc_ab;\n    //     HEAP32[1>>2] = 16 | 0;\n    // }\n// }\n\n\n// function malloc(nbytes, alignment) {\n//     nbytes |= 0;\n//     alignment |= 0;\n//     var ptr = alloc_sab(nbytes, alignment);\n//     if (ptr == 0)\n//         throw new Error(\"Out of memory\");\n//     return ptr|0;\n// }\n// function free(ptr) {\n//     ptr |= 0;\n//     clearInuse(ptr);\n//     if (firstFreeChunk == 0) {\n//         firstFreeChunk = ptr;\n//     }\n//\n//     freeMemory = freeMemory + getChunkSize(ptr);\n//\n//     var chunkptr = ptr + 4;\n//     if (lastFreeChunk > 0) {\n//         HEAPU32[chunkptr>>2] = lastFreeChunk;//backward pointer to prev chunk\n//         HEAPU32[lastFreeChunk>>2] = ptr;//forward pointer to next chunk of prev chunk\n//     } else {\n//         HEAPU32[chunkptr>>2] = 0;//no backward pointer, this is the first free chunk\n//     }\n//\n//     HEAPU32[ptr>>2] = 0;//no forward pointer\n//\n//     lastFreeChunk = ptr;\n//     numFreeChunks = numFreeChunks + 1;\n// }\n// function identify(ptr) {\n//     if (ptr == 0)\n//         return 0;\n//     return _idToType[HEAP32[ptr >> 2]];\n// }\n// function _badType(self) {\n//     var t = identify(self);\n//     return new global.Error(\"Observed type: \" + (t ? t.NAME : \"*invalid*\") + \", address=\" + self);\n// }\n// Synchronic layout is 8 bytes (2 x int32) of metadata followed by\n// the type-specific payload.  The two int32 words are the number\n// of waiters and the wait word (generation count).\n//\n// In the following:\n//\n// self is the base address for the Synchronic.\n// mem is the array to use for the value\n// idx is the index in mem of the value: (ptr+8)>>log2(mem.BYTES_PER_ELEMENT)\n//\n// _synchronicLoad is just Atomics.load, expand it in-line.\n/*function _synchronicStore(self, mem, idx, value) {\n    global.Atomics.store(mem, idx, value);\n    _notify(self);\n    return value;\n}\nfunction _synchronicCompareExchange(self, mem, idx, oldval, newval) {\n    var v = global.Atomics.compareExchange(mem, idx, oldval, newval);\n    if (v == oldval)\n        _notify(self);\n    return v;\n}\nfunction _synchronicAdd(self, mem, idx, value) {\n    var v = global.Atomics.add(mem, idx, value);\n    _notify(self);\n    return v;\n}\nfunction _synchronicSub(self, mem, idx, value) {\n    var v = global.Atomics.sub(mem, idx, value);\n    _notify(self);\n    return v;\n}\nfunction _synchronicAnd(self, mem, idx, value) {\n    var v = global.Atomics.and(mem, idx, value);\n    _notify(self);\n    return v;\n}\nfunction _synchronicOr(self, mem, idx, value) {\n    var v = global.Atomics.or(mem, idx, value);\n    _notify(self);\n    return v;\n}\nfunction _synchronicXor(self, mem, idx, value) {\n    var v = global.Atomics.xor(mem, idx, value);\n    _notify(self);\n    return v;\n}\nfunction _synchronicLoadWhenNotEqual(self, mem, idx, value) {\n    for (; ;) {\n        var tag = global.Atomics.load(HEAP32, (self + 4) >> 2);\n        var v = global.Atomics.load(mem, idx);\n        if (v !== value)\n            break;\n        _waitForUpdate(self, tag, Number.POSITIVE_INFINITY);\n    }\n    return v;\n}\n\nfunction _synchronicLoadWhenEqual(self, mem, idx, value) {\n    for (; ;) {\n        var tag = global.Atomics.load(HEAP32, (self + 4) >> 2);\n        var v = global.Atomics.load(mem, idx);\n        if (v === value)\n            break;\n        _waitForUpdate(self, tag, Number.POSITIVE_INFINITY);\n    }\n    return v;\n}\nfunction _synchronicExpectUpdate(self, mem, idx, value, timeout) {\n    var now = global.performance();\n    var limit = now + timeout;\n    for (; ;) {\n        var tag = global.Atomics.load(HEAP32, (self + 4) >> 2);\n        var v = global.Atomics.load(mem, idx);\n        if (v !== value || now >= limit)\n            break;\n        _waitForUpdate(self, tag, limit - now);\n        now = global.performance();\n    }\n}\nfunction _waitForUpdate(self, tag, timeout) {\n    // Spin for a int16 time before going into the futexWait.\n    //\n    // Hard to know what a good count should be - it is machine\n    // dependent, for sure, and \"typical\" applications should\n    // influence the choice.  If the count is high without\n    // hindering an eventual drop into futexWait then it will just\n    // decrease performance.  If the count is low it is pointless.\n    // (This is why Synchronic really wants a native implementation.)\n    //\n    // data points from a 2.6GHz i7 MacBook Pro:\n    //\n    // - the simple send-integer benchmark (test-sendint.html),\n    //   which is the very simplest case we can really imagine,\n    //   gets noisy timings with an iteration count below 4000\n    //\n    // - the simple send-object benchmark (test-sendmsg.html)\n    //   gets a boost when the count is at least 10000\n    //\n    // 10000 is perhaps 5us (CPI=1, naive) and seems like a\n    // reasonable cutoff, for now - but note, it is reasonable FOR\n    // THIS SYSTEM ONLY, which is a big flaw.\n    //\n    // The better fix might well be to add some kind of spin/nanosleep\n    // functionality to futexWait, see https://bugzil.la/1134973.\n    // That functionality can be platform-dependent and even\n    // adaptive, with JIT support.\n    var i = 10000;\n    do {\n        // May want this to be a relaxed load, though on x86 it won't matter.\n        if (global.Atomics.load(HEAP32, (self + 4) >> 2) != tag)\n            return;\n    } while (--i > 0);\n    global.Atomics.add(HEAP32, self >> 2, 1);\n    global.Atomics.wait(HEAP32, (self + 4) >> 2, tag, timeout);\n    global.Atomics.sub(HEAP32, self >> 2, 1);\n}\nfunction _notify(self) {\n    global.Atomics.add(HEAP32, (self + 4) >> 2, 1);\n    // Would it be appropriate & better to wake n waiters, where n\n    // is the number loaded in the load()?  I almost think so,\n    // since our futexes are fair.\n    if (global.Atomics.load(HEAP32, self >> 2) > 0)\n        global.Atomics.wake(HEAP32, (self + 4) >> 2, Number.POSITIVE_INFINITY);\n}*/\n\n// function getFreeChunk(nbytes) {\n//     nbytes = nbytes | 0;\n//     if (numFreeChunks > (0 | 0)) {\n//         var freeChunk = findChunk(nbytes);\n//         if (freeChunk > (0 | 0)) {\n//             if (freeChunk == firstFreeChunk) {\n//                 firstFreeChunk = nextFree(freeChunk);\n//             }\n//             if (freeChunk == lastFreeChunk) {\n//                 lastFreeChunk = (0 | 0);\n//             }\n//             numFreeChunks = numFreeChunks - (1 | 0);\n//             setInuse(freeChunk);\n//             freeMemory = freeMemory - getChunkSize(freeChunk);\n//             return freeChunk;\n//         }\n//     }\n//     return 0 | 0;\n// }\n// function findChunk(nbytes) {\n//     nbytes = nbytes | 0;\n//     var chunk = firstFreeChunk;\n//     while (chunk != 0) {\n//         if (getChunkSize(chunk) == nbytes) {\n//             return chunk;\n//         }\n//         chunk = HEAPU32[chunk>>2];\n//     }\n//     return 0;\n// }\n// function prevFree(ptr) {\n//     return HEAPU32[(ptr + 4)>>2];\n// }\n// function nextFree(ptr) {\n//     return HEAPU32[ptr>>2];\n// }\n// /* Set size at head, without disturbing its use bit */\n// function setHeadSize(ptr, s) {\n//     HEAPU32[ptr>>2] = (HEAPU32[ptr>>2] & SIZE_BITS) | s;\n// }\n//\n// /* Set size/use field */\n// function setHead(ptr, s) {\n//     HEAPU32[ptr>>2] = s;\n// }\n//\n// /* Set size at footer (only when chunk is not in use) */\n// function setFoot(ptr, s) {\n//     HEAPU32[(ptr + s)>>2] = s;\n// }\n//\n// function getPrevInuse(ptr) {\n//     return HEAPU32[(ptr - 8)>>2] & (PREV_INUSE);\n// }\n// function setInuse(ptr) {\n//     HEAPU32[(ptr - 4)>>2] |= PREV_INUSE;\n// }\n// function getInuse(ptr) {\n//     return HEAPU32[(ptr - 4)>>2] & PREV_INUSE;\n// }\n// function clearInuse(ptr) {\n//     HEAPU32[(ptr - 4)>>2] &= ~PREV_INUSE;\n// }\n// function getChunkSize(ptr) {\n//     return HEAPU32[(ptr - 4)>>2] & ~(PREV_INUSE);\n// }\n//\n// function alloc_sab(nbytes, alignment) {\n//     nbytes = nbytes | 0;\n//     alignment = alignment | 0;\n//     if (numFreeChunks > 0) {\n//         var chunk = getFreeChunk(nbytes);\n//         if (chunk > (0 | 0)) {\n//             return chunk;\n//         }\n//     }\n//\n//     do {\n//         var ptr = global.Atomics.load(HEAP32, 1);\n//         var q = (ptr + (alignment - 1)) & ~(alignment - 1);\n//         var top = q + nbytes;\n//         if (top >= HEAP32[2>>2])\n//             return 0;\n//     } while (global.Atomics.compareExchange(HEAP32, 1, ptr, top) != ptr);\n//\n//     return q;\n// }\n// function alloc_ab(nbytes, alignment) {\n//     nbytes = nbytes | 0;\n//     alignment = alignment | 0;\n//\n//     var ptr = HEAP32[1>>2] | 0;\n//     ptr = ((ptr + (alignment - 1)) & ~(alignment - 1)) | 0;\n//     var top = (ptr + nbytes) | 0;\n//     if (top >= HEAP32[2>>2])\n//         return 0 | 0;\n//     HEAP32[1>>2] = top | 0;\n//     return ptr | 0;\n// }"

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = "declare class boolean {\n    toString(): string;\n}\n\ndeclare class int8 {\n    toString(): string;\n}\n\ndeclare class uint8 {\n    toString(): string;\n}\n\ndeclare class int16 {\n    toString(): string;\n}\n\ndeclare class uint16 {\n    toString(): string;\n}\n\ndeclare class int32 {\n    toString(): string;\n}\n\ndeclare class uint32 {\n    toString(): string;\n}\n\ndeclare class int64 {\n    toString(): string;\n}\n\ndeclare class uint64 {\n    toString(): string;\n}\n\ndeclare class float32 {\n    toString(): string;\n}\n\ndeclare class float64 {\n    toString(): string;\n}\n\ndeclare class string {\n    charAt(index: int32): string;\n    charCodeAt(index: int32): uint16;\n    get length(): int32;\n    indexOf(text: string): int32;\n    lastIndexOf(text: string): int32;\n    operator == (other: string): boolean;\n    operator [] (index: int32): uint16 { return this.charCodeAt(index); }\n    slice(start: int32, end: int32): string;\n\n    startsWith(text: string): boolean { return this.slice(0, text.length) == text; }\n    endsWith(text: string): boolean { return this.slice(-text.length, this.length) == text; }\n}"

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = "function TurboWrapper(exports, buffer) {\n\n    var HEAP8 = new Int8Array(buffer);\n    var HEAP16 = new Int16Array(buffer);\n    var HEAP32 = new Int32Array(buffer);\n    var HEAPU8 = new Uint8Array(buffer);\n    var HEAPU16 = new Uint16Array(buffer);\n    var HEAPU32 = new Uint32Array(buffer);\n    var HEAPF32 = new Float32Array(buffer);\n    var HEAPF64 = new Float64Array(buffer);\n\n    return {\n        exports: exports,\n        RAW_MEMORY: buffer,\n\n        getMemoryUsage: function () {\n            const top = Atomics.load(HEAP32, 2);\n            // top -= freeMemory;\n            return Math.fround(top / (1024 * 1024));\n        }\n    }\n}\nfunction initTurbo(MB) {\n    var buffer = new SharedArrayBuffer(MB * 1024 * 1024);\n\n    if (buffer.byteLength < 16) {\n        throw new Error(\"The memory is too small even for metadata\");\n    }\n\n    return TurboWrapper(TurboModule(\n        typeof global !== 'undefined' ? global : window,\n        typeof env !== 'undefined' ? env : {\n            STACKTOP: 8,\n            STACK_MAX: 8\n        },\n        buffer\n    ), buffer);\n}"

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = "// WebAssembly builtin functions\ndeclare function rotl(value: int64, shift: int64): int64;\ndeclare function rotl32(value: int32, shift: int32): int32;\ndeclare function rotr(value: int64, shift: int64): int64;\ndeclare function rotr32(value: int32, shift: int32): int32;\ndeclare function clz(value: int64): int64;\ndeclare function clz32(value: int32): int32;\ndeclare function ctz(value: int64): int64;\ndeclare function ctz32(value: int32): int32;\ndeclare function popcnt(value: int64): int64;\ndeclare function popcnt32(value: int32): int32;\ndeclare function abs(value: float64): float64;\ndeclare function abs32(value: float32): float32;\ndeclare function ceil(value: float64): float64;\ndeclare function ceil32(value: float32): float32;\ndeclare function floor(value: float64): float64;\ndeclare function floor32(value: float32): float32;\ndeclare function sqrt(value: float64): float64;\ndeclare function sqrt32(value: float32): float32;\ndeclare function trunc(value: float64): float64;\ndeclare function trunc32(value: float32): float32;\ndeclare function nearest(value: float64): float64;\ndeclare function nearest32(value: float32): float32;\ndeclare function min(left: float64, right: float64): float64;\ndeclare function min32(left: float32, right: float32): float32;\ndeclare function max(left: float64, right: float64): float64;\ndeclare function max32(left: float32, right: float32): float32;\ndeclare function copysign(left: float64, right: float64): float64;\ndeclare function copysign32(left: float32, right: float32): float32;\ndeclare function reinterpret_i32(value: float32): int32;\ndeclare function reinterpret_i64(value: float64): int64;\ndeclare function reinterpret_f32(value: int32): float32;\ndeclare function reinterpret_f64(value: int64): float64;\ndeclare function current_memory(): int32;\ndeclare function grow_memory(value: int32): int32;\n"

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = "/**\n * Created by n.vinayakan on 30.05.17.\n * WebAssembly start function where global variable expressions initializer\n */\n@start\nfunction __WASM_INITIALIZER(): void {\n    // 🔥 WARNING 🔥\n    // DON'T RETURN ANYTHING FROM THIS FUNCTION\n    // Global variable initialization expressions will be appended to this function\n    numFreeChunks = 0;\n    firstFree = 0;\n    lastFree = 0;\n    //     originalHeapPointer = 40 as *uint8;//this will override by compiler\n    //     currentHeapPointer  = 40 as *uint8;//this will override by compiler\n}\n"

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
var Bitness;
(function (Bitness) {
    Bitness[Bitness["x32"] = 0] = "x32";
    Bitness[Bitness["x64"] = 1] = "x64";
})(Bitness = exports.Bitness || (exports.Bitness = {}));


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wasm_stack_tracer_1 = __webpack_require__(42);
const utils_1 = __webpack_require__(5);
const opcode_1 = __webpack_require__(7);
const section_buffer_1 = __webpack_require__(32);
const logger_1 = __webpack_require__(10);
const wasm_section_1 = __webpack_require__(14);
/**
 * Created by n.vinayakan on 02.06.17.
 */
class WasmAssembler {
    constructor() {
        this.sectionList = [];
        this.importList = [];
        this.functionList = [];
        this.currentSection = null;
        this.currentFunction = null;
        this.stackTracer = new wasm_stack_tracer_1.WasmStackTracer();
    }
    sealFunctions() {
        let runtimeFunctions = [];
        this.importList.forEach(_import => {
            let fn = new wasm_stack_tracer_1.WasmRuntimeFunction();
            fn.module = _import.module;
            fn.name = _import.name;
            fn.signature = _import.signature;
            fn.isImport = true;
            runtimeFunctions.push(fn);
        });
        this.functionList.forEach((_wasmFunc) => {
            let fn = new wasm_stack_tracer_1.WasmRuntimeFunction();
            fn.name = _wasmFunc.symbol.name;
            fn.signature = _wasmFunc.signature;
            fn.isImport = false;
            runtimeFunctions.push(fn);
        });
        this.stackTracer.functions = runtimeFunctions;
    }
    startSection(array, id, name) {
        let section = new section_buffer_1.SectionBuffer(id, name);
        section.offset = array.length;
        logger_1.log(array, 0, null, ` - section: ${wasm_section_1.WasmSection[id]} [0x${utils_1.toHex(id, 2)}]`);
        this.sectionList.push(section);
        return section;
    }
    endSection(array, section) {
        section.publish(array);
    }
    dropStack(array, max = 1) {
        let item = this.stackTracer.context.stack.pop(true);
        while (item !== undefined && max > 0) {
            array.append(opcode_1.WasmOpcode.DROP);
            item = this.stackTracer.context.stack.pop(true);
            max--;
        }
    }
    appendOpcode(array, offset = 0, opcode, inline_value) {
        if (global["debug"]) {
            logOpcode(array, offset, opcode, inline_value);
        }
        array.append(opcode);
        this.stackTracer.pushOpcode(opcode);
    }
    writeUnsignedLEB128(array, value) {
        array.writeUnsignedLEB128(value);
        this.stackTracer.pushValue(value);
    }
    writeLEB128(array, value) {
        array.writeLEB128(value);
        this.stackTracer.pushValue(value);
    }
    writeFloat(array, value) {
        array.writeFloat(value);
        this.stackTracer.pushValue(value);
    }
    writeDouble(array, value) {
        array.writeDouble(value);
        this.stackTracer.pushValue(value);
    }
    writeWasmString(array, value) {
        array.writeWasmString(value);
    }
}
exports.WasmAssembler = WasmAssembler;
function append(array, offset = 0, value = null, msg = null) {
    if (global["debug"]) {
        array.log += (value != null ? `${utils_1.toHex(offset + array.position)}: ${utils_1.toHex(value, 2)}                    ; ` : "") + (msg != null ? `${msg}\n` : "\n");
    }
    if (value) {
        array.append(value);
    }
}
exports.append = append;
function logOpcode(array, offset = 0, opcode, inline_value) {
    if (global["debug"]) {
        array.log += `${utils_1.toHex(offset + array.position)}: ${utils_1.toHex(opcode, 2)}                    ; ${opcode_1.WasmOpcode[opcode]} ${inline_value ? inline_value : ""}\n`;
    }
}
exports.logOpcode = logOpcode;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __webpack_require__(10);
const bytearray_1 = __webpack_require__(11);
/**
 * Created by n.vinayakan on 02.06.17.
 */
class SectionBuffer {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.data = new bytearray_1.ByteArray();
    }
    publish(array) {
        logger_1.log(array, 0, this.id, "section code");
        array.writeUnsignedLEB128(this.id); //section code
        if (this.id == 0) {
            let strData = new bytearray_1.ByteArray();
            strData.writeWasmString(this.name);
            logger_1.log(array, 0, this.data.length, "section size");
            array.writeUnsignedLEB128(this.data.length + strData.length); //size of this section in bytes
            array.copy(strData);
        }
        else {
            logger_1.log(array, 0, this.data.length, "section size");
            array.writeUnsignedLEB128(this.data.length); //size of this section in bytes
        }
        array.log += this.data.log;
        array.copy(this.data);
    }
}
exports.SectionBuffer = SectionBuffer;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const opcode_1 = __webpack_require__(7);
/**
 * Created by n.vinayakan on 28.05.17.
 */
exports.builtins = [
    "rotl",
    "rotl32",
    "rotr",
    "rotr32",
    "clz",
    "clz32",
    "ctz",
    "ctz32",
    "popcnt",
    "popcnt32",
    "abs",
    "abs32",
    "ceil",
    "ceil32",
    "floor",
    "floor32",
    "sqrt",
    "sqrt32",
    "trunc",
    "trunc32",
    "nearest",
    "nearest32",
    "min",
    "min32",
    "max",
    "max32",
    "copysign",
    "copysign32",
    "reinterpret_i32",
    "reinterpret_i64",
    "reinterpret_f32",
    "reinterpret_f64",
    "current_memory",
    "grow_memory"
];
function getBuiltinOpcode(name) {
    switch (name) {
        case "rotl": return opcode_1.WasmOpcode.I64_ROTL;
        case "rotl32": return opcode_1.WasmOpcode.I32_ROTL;
        case "rotr": return opcode_1.WasmOpcode.I64_ROTR;
        case "rotr32": return opcode_1.WasmOpcode.I32_ROTR;
        case "clz": return opcode_1.WasmOpcode.I64_CLZ;
        case "clz32": return opcode_1.WasmOpcode.I32_CLZ;
        case "ctz": return opcode_1.WasmOpcode.I64_CTZ;
        case "ctz32": return opcode_1.WasmOpcode.I32_CTZ;
        case "popcnt": return opcode_1.WasmOpcode.I64_POPCNT;
        case "popcnt32": return opcode_1.WasmOpcode.I32_POPCNT;
        case "abs": return opcode_1.WasmOpcode.F64_ABS;
        case "abs32": return opcode_1.WasmOpcode.F32_ABS;
        case "ceil": return opcode_1.WasmOpcode.F64_CEIL;
        case "ceil32": return opcode_1.WasmOpcode.F32_CEIL;
        case "floor": return opcode_1.WasmOpcode.F64_FLOOR;
        case "floor32": return opcode_1.WasmOpcode.F32_FLOOR;
        case "sqrt": return opcode_1.WasmOpcode.F64_SQRT;
        case "sqrt32": return opcode_1.WasmOpcode.F32_SQRT;
        case "trunc": return opcode_1.WasmOpcode.F64_TRUNC;
        case "trunc32": return opcode_1.WasmOpcode.F32_TRUNC;
        case "nearest": return opcode_1.WasmOpcode.F64_NEAREST;
        case "nearest32": return opcode_1.WasmOpcode.F32_NEAREST;
        case "min": return opcode_1.WasmOpcode.F64_MIN;
        case "min32": return opcode_1.WasmOpcode.F32_MIN;
        case "max": return opcode_1.WasmOpcode.F64_MAX;
        case "max32": return opcode_1.WasmOpcode.F32_MAX;
        case "copysign": return opcode_1.WasmOpcode.F64_COPYSIGN;
        case "copysign32": return opcode_1.WasmOpcode.F32_COPYSIGN;
        case "reinterpret_i32": return opcode_1.WasmOpcode.F32_REINTERPRET_I32;
        case "reinterpret_i64": return opcode_1.WasmOpcode.F64_REINTERPRET_I64;
        case "reinterpret_f32": return opcode_1.WasmOpcode.I32_REINTERPRET_F32;
        case "reinterpret_f64": return opcode_1.WasmOpcode.I64_REINTERPRET_F64;
        case "current_memory": return opcode_1.WasmOpcode.MEMORY_SIZE;
        case "grow_memory": return opcode_1.WasmOpcode.GROW_MEMORY;
        default: throw "No builtin function named '" + name + "'";
    }
}
exports.getBuiltinOpcode = getBuiltinOpcode;
function isBuiltin(name) {
    return exports.builtins.indexOf(name) > -1;
}
exports.isBuiltin = isBuiltin;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
var WasmExternalKind;
(function (WasmExternalKind) {
    WasmExternalKind[WasmExternalKind["Function"] = 0] = "Function";
    WasmExternalKind[WasmExternalKind["Table"] = 1] = "Table";
    WasmExternalKind[WasmExternalKind["Memory"] = 2] = "Memory";
    WasmExternalKind[WasmExternalKind["Global"] = 3] = "Global";
})(WasmExternalKind = exports.WasmExternalKind || (exports.WasmExternalKind = {}));


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
class WasmFunction {
    constructor() {
        this.localCount = 0;
        this.localEntries = [];
    }
}
exports.WasmFunction = WasmFunction;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
class WasmGlobal {
}
exports.WasmGlobal = WasmGlobal;


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
class WasmImport {
}
exports.WasmImport = WasmImport;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
class WasmLocal {
}
exports.WasmLocal = WasmLocal;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
class WasmSharedOffset {
    constructor() {
        this.nextLocalOffset = 0;
        this.localCount = 0;
    }
}
exports.WasmSharedOffset = WasmSharedOffset;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __webpack_require__(0);
/**
 * Created by n.vinayakan on 02.06.17.
 */
class WasmSignature {
}
exports.WasmSignature = WasmSignature;
function wasmAreSignaturesEqual(a, b) {
    assert_1.assert(a.returnType != null);
    assert_1.assert(b.returnType != null);
    assert_1.assert(a.returnType.next == null);
    assert_1.assert(b.returnType.next == null);
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
exports.wasmAreSignaturesEqual = wasmAreSignaturesEqual;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 03.06.17.
 */
class WasmRuntimeLocal {
    constructor(type) {
        this.type = type;
    }
}
exports.WasmRuntimeLocal = WasmRuntimeLocal;


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wasm_type_1 = __webpack_require__(15);
const opcode_1 = __webpack_require__(7);
const wasm_runtime_local_1 = __webpack_require__(41);
const bytearray_1 = __webpack_require__(11);
/**
 * Created by n.vinayakan on 02.06.17.
 */
class WasmStackItem {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}
exports.WasmStackItem = WasmStackItem;
class WasmStack {
    constructor() {
        this.list = [];
    }
    get length() {
        return this.list.length;
    }
    push(item) {
        this.list.push(item);
    }
    pop(silent = false) {
        if (this.list.length === 0) {
            if (!silent) {
                throw "Stack is empty";
            }
        }
        return this.list.pop();
    }
}
exports.WasmStack = WasmStack;
class WasmRuntimeFunction {
    constructor() {
    }
    get returnType() {
        return this.signature.returnType.id;
    }
    execute(...param) {
        throw "Wasm runtime function execution not implemented!";
    }
}
exports.WasmRuntimeFunction = WasmRuntimeFunction;
class WasmStackContext {
    constructor(fn) {
        this.fn = fn;
        this.stack = new WasmStack();
        this.opcodes = [];
        this.locals = [];
        fn.localEntries.forEach(localType => {
            this.locals.push(new wasm_runtime_local_1.WasmRuntimeLocal(localType));
        });
    }
}
exports.WasmStackContext = WasmStackContext;
/**
 * Wasm stack tracer, this is not a stack machine. this will not execute functions
 * instead trace state of stack while emitting function body.
 */
class WasmStackTracer {
    constructor() {
        this.context = null;
        this.memory = new bytearray_1.ByteArray();
    }
    setGlobals(globalEntries) {
        this.globals = [];
        globalEntries.forEach(globalType => {
            this.globals.push(new wasm_runtime_local_1.WasmRuntimeLocal(globalType));
        });
    }
    startFunction(fn) {
        this.context = new WasmStackContext(fn);
    }
    endFunction() {
        if (this.context.stack.length > 0) {
            if (this.context.fn.returnType === wasm_type_1.WasmType.VOID) {
                console.error(`Function '${this.context.fn.symbol.name}' does not return anything but stack is not empty. Stack contains ${this.context.stack.length} items`);
                throw `Function '${this.context.fn.symbol.name}' does not return anything but stack is not empty. Stack contains ${this.context.stack.length} items`;
            }
        }
        this.context = null;
    }
    callFunction(index) {
        let fn = this.functions[index];
        if (fn === undefined) {
            throw "Function not defined at index " + index;
        }
        let returnType = fn.returnType;
        for (let i = 0; i < fn.signature.argumentCount; i++) {
            this.context.stack.pop();
        }
        if (returnType !== wasm_type_1.WasmType.VOID) {
            this.context.stack.push(new WasmStackItem(returnType, undefined));
        }
    }
    pushOpcode(opcode) {
        if (this.context !== null) {
            this.context.opcodes.push(opcode);
            this.context.lastOpcode = opcode;
            this.updateStack(opcode);
        }
    }
    pushValue(value) {
        if (this.context !== null) {
            this.updateStack(this.context.lastOpcode, value);
        }
    }
    updateStack(opcode, value) {
        let type = null;
        if (opcode !== null) {
            type = getOprandType(opcode);
        }
        switch (opcode) {
            case opcode_1.WasmOpcode.CALL:
                if (value !== undefined) {
                    this.callFunction(value);
                }
                break;
            case opcode_1.WasmOpcode.END:
                break;
            case opcode_1.WasmOpcode.RETURN:
                if (this.context.stack.length == 0) {
                    console.warn(`Empty stack on return in function ${this.context.fn.symbol.name}`);
                }
                break;
            case opcode_1.WasmOpcode.I32_CONST:
            case opcode_1.WasmOpcode.I64_CONST:
            case opcode_1.WasmOpcode.F32_CONST:
            case opcode_1.WasmOpcode.F64_CONST:
                if (value !== undefined) {
                    this.context.stack.push(new WasmStackItem(type, value));
                }
                break;
            case opcode_1.WasmOpcode.SET_LOCAL:
                if (value !== undefined) {
                    if (this.context.locals.length <= value) {
                        let errorMsg = `Local index ${value} out of range ${this.context.locals.length} in function ${this.context.fn.symbol.name}`;
                        console.error(errorMsg);
                        throw errorMsg;
                    }
                    else {
                        let a = this.context.stack.pop();
                        this.context.locals[value].value = a.value;
                    }
                }
                break;
            case opcode_1.WasmOpcode.GET_LOCAL:
                if (value !== undefined) {
                    let a = this.context.locals[value];
                    this.context.stack.push(new WasmStackItem(a.type, a.value));
                }
                break;
            case opcode_1.WasmOpcode.SET_GLOBAL:
                if (value !== undefined) {
                    if (this.globals.length <= value) {
                        let errorMsg = `Global index ${value} out of range ${this.globals.length}`;
                        console.error(errorMsg);
                        throw errorMsg;
                    }
                    else {
                        let a = this.context.stack.pop();
                        this.globals[value].value = a.value;
                    }
                }
                break;
            case opcode_1.WasmOpcode.GET_GLOBAL:
                if (value !== undefined) {
                    let a = this.globals[value];
                    this.context.stack.push(new WasmStackItem(a.type, a.value));
                }
                break;
            // ADD
            case opcode_1.WasmOpcode.I32_ADD:
            case opcode_1.WasmOpcode.I64_ADD:
            case opcode_1.WasmOpcode.F32_ADD:
            case opcode_1.WasmOpcode.F64_ADD: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value + b.value));
                break;
            }
            //SUB
            case opcode_1.WasmOpcode.I32_SUB:
            case opcode_1.WasmOpcode.I64_SUB:
            case opcode_1.WasmOpcode.F32_SUB:
            case opcode_1.WasmOpcode.F64_SUB: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value - b.value));
                break;
            }
            //MUL
            case opcode_1.WasmOpcode.I32_MUL:
            case opcode_1.WasmOpcode.I64_MUL:
            case opcode_1.WasmOpcode.F32_MUL:
            case opcode_1.WasmOpcode.F64_MUL: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value * b.value));
                break;
            }
            //DIV
            case opcode_1.WasmOpcode.I32_DIV_S:
            case opcode_1.WasmOpcode.I32_DIV_U:
            case opcode_1.WasmOpcode.I64_DIV_S:
            case opcode_1.WasmOpcode.I64_DIV_U:
            case opcode_1.WasmOpcode.F32_DIV:
            case opcode_1.WasmOpcode.F64_DIV: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value / b.value));
                break;
            }
            //REM
            case opcode_1.WasmOpcode.I32_REM_S:
            case opcode_1.WasmOpcode.I32_REM_U:
            case opcode_1.WasmOpcode.I64_REM_S:
            case opcode_1.WasmOpcode.I64_REM_U: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value % b.value));
                break;
            }
            //GT
            case opcode_1.WasmOpcode.I32_GT_S:
            case opcode_1.WasmOpcode.I32_GT_U:
            case opcode_1.WasmOpcode.I64_GT_S:
            case opcode_1.WasmOpcode.I64_GT_U:
            case opcode_1.WasmOpcode.F32_GT:
            case opcode_1.WasmOpcode.F64_GT: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value > b.value ? 1 : 0));
                break;
            }
            //GE
            case opcode_1.WasmOpcode.I32_GE_S:
            case opcode_1.WasmOpcode.I32_GE_U:
            case opcode_1.WasmOpcode.I64_GE_S:
            case opcode_1.WasmOpcode.I64_GE_U:
            case opcode_1.WasmOpcode.F32_GE:
            case opcode_1.WasmOpcode.F64_GE: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value >= b.value ? 1 : 0));
                break;
            }
            //LT
            case opcode_1.WasmOpcode.I32_LT_S:
            case opcode_1.WasmOpcode.I32_LT_U:
            case opcode_1.WasmOpcode.I64_LT_S:
            case opcode_1.WasmOpcode.I64_LT_U:
            case opcode_1.WasmOpcode.F32_LT:
            case opcode_1.WasmOpcode.F64_LT: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value < b.value ? 1 : 0));
                break;
            }
            //LE
            case opcode_1.WasmOpcode.I32_LE_S:
            case opcode_1.WasmOpcode.I32_LE_U:
            case opcode_1.WasmOpcode.I64_LE_S:
            case opcode_1.WasmOpcode.I64_LE_U:
            case opcode_1.WasmOpcode.F32_LE:
            case opcode_1.WasmOpcode.F64_LE: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value <= b.value ? 1 : 0));
                break;
            }
            //EQ
            case opcode_1.WasmOpcode.I32_EQ:
            case opcode_1.WasmOpcode.I64_EQ:
            case opcode_1.WasmOpcode.F32_EQ:
            case opcode_1.WasmOpcode.F64_EQ: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value === b.value ? 1 : 0));
                break;
            }
            //NE
            case opcode_1.WasmOpcode.I32_NE:
            case opcode_1.WasmOpcode.I64_NE:
            case opcode_1.WasmOpcode.F32_NE:
            case opcode_1.WasmOpcode.F64_NE: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value !== b.value ? 1 : 0));
                break;
            }
            //EQZ
            case opcode_1.WasmOpcode.I32_EQZ:
            case opcode_1.WasmOpcode.I64_EQZ: {
                let a = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value === 0 ? 1 : 0));
                break;
            }
            //AND
            case opcode_1.WasmOpcode.I32_AND:
            case opcode_1.WasmOpcode.I64_AND: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value & b.value));
                break;
            }
            //OR
            case opcode_1.WasmOpcode.I32_OR:
            case opcode_1.WasmOpcode.I64_OR: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value | b.value));
                break;
            }
            //XOR
            case opcode_1.WasmOpcode.I32_XOR:
            case opcode_1.WasmOpcode.I64_XOR: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value ^ b.value));
                break;
            }
            //CTZ
            case opcode_1.WasmOpcode.I32_CTZ:
            case opcode_1.WasmOpcode.I64_CTZ: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, ctz(a.value)));
                break;
            }
            //CLZ
            case opcode_1.WasmOpcode.I32_CLZ:
            case opcode_1.WasmOpcode.I64_CLZ: {
                let a = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, Math.clz32(a.value)));
                break;
            }
            //CLZ
            case opcode_1.WasmOpcode.I32_ROTL:
            case opcode_1.WasmOpcode.I64_ROTL: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, rotl(a.value)));
                break;
            }
            //SHR
            case opcode_1.WasmOpcode.I32_SHR_S:
            case opcode_1.WasmOpcode.I32_SHR_U:
            case opcode_1.WasmOpcode.I64_SHR_S:
            case opcode_1.WasmOpcode.I64_SHR_U: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, shr(a.value)));
                break;
            }
            //SHR
            case opcode_1.WasmOpcode.I32_SHL:
            case opcode_1.WasmOpcode.I64_SHL: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, shl(a.value)));
                break;
            }
            //POPCNT
            case opcode_1.WasmOpcode.I32_POPCNT:
            case opcode_1.WasmOpcode.I64_POPCNT: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, popcnt(a.value)));
                break;
            }
            //LOAD
            case opcode_1.WasmOpcode.I32_LOAD:
            case opcode_1.WasmOpcode.I64_LOAD:
            case opcode_1.WasmOpcode.I32_LOAD8_U:
            case opcode_1.WasmOpcode.I32_LOAD8_S:
            case opcode_1.WasmOpcode.I64_LOAD8_U:
            case opcode_1.WasmOpcode.I64_LOAD8_S:
            case opcode_1.WasmOpcode.I32_LOAD16_U:
            case opcode_1.WasmOpcode.I32_LOAD16_S:
            case opcode_1.WasmOpcode.I64_LOAD16_U:
            case opcode_1.WasmOpcode.I64_LOAD16_S:
            case opcode_1.WasmOpcode.F32_LOAD:
            case opcode_1.WasmOpcode.F64_LOAD: {
                this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, 0));
                this.context.lastOpcode = null;
                break;
            }
            //STORE
            case opcode_1.WasmOpcode.I32_STORE:
            case opcode_1.WasmOpcode.I64_STORE:
            case opcode_1.WasmOpcode.I32_STORE8:
            case opcode_1.WasmOpcode.I64_STORE8:
            case opcode_1.WasmOpcode.I32_STORE16:
            case opcode_1.WasmOpcode.I64_STORE16:
            case opcode_1.WasmOpcode.F32_STORE:
            case opcode_1.WasmOpcode.F64_STORE: {
                let a = this.context.stack.pop(); // address
                let b = this.context.stack.pop(); // offset
                this.context.lastOpcode = null;
                break;
            }
            case opcode_1.WasmOpcode.IF:
            case opcode_1.WasmOpcode.BR_IF:
                let a = this.context.stack.pop();
                this.context.lastOpcode = null;
                break;
        }
    }
}
exports.WasmStackTracer = WasmStackTracer;
function getOprandType(opcode) {
    switch (opcode) {
        // Int32
        case opcode_1.WasmOpcode.I32_CONST:
        case opcode_1.WasmOpcode.I32_ADD:
        case opcode_1.WasmOpcode.I32_MUL:
        case opcode_1.WasmOpcode.I32_SUB:
        case opcode_1.WasmOpcode.I32_DIV_S:
        case opcode_1.WasmOpcode.I32_DIV_U:
        case opcode_1.WasmOpcode.I32_REM_S:
        case opcode_1.WasmOpcode.I32_REM_U:
        case opcode_1.WasmOpcode.I32_GE_S:
        case opcode_1.WasmOpcode.I32_GE_U:
        case opcode_1.WasmOpcode.I32_LE_S:
        case opcode_1.WasmOpcode.I32_LE_U:
        case opcode_1.WasmOpcode.I32_GT_S:
        case opcode_1.WasmOpcode.I32_GT_U:
        case opcode_1.WasmOpcode.I32_LT_S:
        case opcode_1.WasmOpcode.I32_LT_U:
        case opcode_1.WasmOpcode.I32_EQ:
        case opcode_1.WasmOpcode.I32_NE:
        case opcode_1.WasmOpcode.I32_EQZ:
        case opcode_1.WasmOpcode.I32_AND:
        case opcode_1.WasmOpcode.I32_OR:
        case opcode_1.WasmOpcode.I32_XOR:
        case opcode_1.WasmOpcode.I32_CTZ:
        case opcode_1.WasmOpcode.I32_CLZ:
        case opcode_1.WasmOpcode.I32_ROTL:
        case opcode_1.WasmOpcode.I32_ROTR:
        case opcode_1.WasmOpcode.I32_SHL:
        case opcode_1.WasmOpcode.I32_SHR_S:
        case opcode_1.WasmOpcode.I32_SHR_U:
        case opcode_1.WasmOpcode.I32_POPCNT:
        case opcode_1.WasmOpcode.I32_LOAD:
        case opcode_1.WasmOpcode.I32_LOAD8_S:
        case opcode_1.WasmOpcode.I32_LOAD8_U:
        case opcode_1.WasmOpcode.I32_LOAD16_S:
        case opcode_1.WasmOpcode.I32_LOAD16_U:
        case opcode_1.WasmOpcode.I32_STORE16:
        case opcode_1.WasmOpcode.I32_STORE8:
        case opcode_1.WasmOpcode.I32_STORE:
        case opcode_1.WasmOpcode.I32_REINTERPRET_F32:
        case opcode_1.WasmOpcode.I32_TRUNC_S_F32:
        case opcode_1.WasmOpcode.I32_TRUNC_U_F32:
        case opcode_1.WasmOpcode.I32_TRUNC_S_F64:
        case opcode_1.WasmOpcode.I32_TRUNC_U_F64:
        case opcode_1.WasmOpcode.I32_WRAP_I64:
            return wasm_type_1.WasmType.I32;
        // Int64
        case opcode_1.WasmOpcode.I64_CONST:
        case opcode_1.WasmOpcode.I64_ADD:
        case opcode_1.WasmOpcode.I64_MUL:
        case opcode_1.WasmOpcode.I64_SUB:
        case opcode_1.WasmOpcode.I64_DIV_S:
        case opcode_1.WasmOpcode.I64_DIV_U:
        case opcode_1.WasmOpcode.I64_CLZ:
        case opcode_1.WasmOpcode.I64_ROTL:
        case opcode_1.WasmOpcode.I64_AND:
        case opcode_1.WasmOpcode.I64_CTZ:
        case opcode_1.WasmOpcode.I64_EQ:
        case opcode_1.WasmOpcode.I64_EQZ:
        case opcode_1.WasmOpcode.I64_GE_S:
        case opcode_1.WasmOpcode.I64_GE_U:
        case opcode_1.WasmOpcode.I64_LE_S:
        case opcode_1.WasmOpcode.I64_LE_U:
        case opcode_1.WasmOpcode.I64_GT_S:
        case opcode_1.WasmOpcode.I64_GT_U:
        case opcode_1.WasmOpcode.I64_LT_S:
        case opcode_1.WasmOpcode.I64_LT_U:
        case opcode_1.WasmOpcode.I64_LOAD:
        case opcode_1.WasmOpcode.I64_LOAD8_S:
        case opcode_1.WasmOpcode.I64_LOAD8_U:
        case opcode_1.WasmOpcode.I64_LOAD16_S:
        case opcode_1.WasmOpcode.I64_LOAD16_U:
        case opcode_1.WasmOpcode.I64_NE:
        case opcode_1.WasmOpcode.I64_XOR:
        case opcode_1.WasmOpcode.I64_STORE16:
        case opcode_1.WasmOpcode.I64_STORE8:
        case opcode_1.WasmOpcode.I64_STORE:
        case opcode_1.WasmOpcode.I64_SHR_S:
        case opcode_1.WasmOpcode.I64_SHR_U:
        case opcode_1.WasmOpcode.I64_SHL:
        case opcode_1.WasmOpcode.I64_ROTR:
        case opcode_1.WasmOpcode.I64_REM_S:
        case opcode_1.WasmOpcode.I64_REM_U:
        case opcode_1.WasmOpcode.I64_POPCNT:
        case opcode_1.WasmOpcode.I64_OR:
        case opcode_1.WasmOpcode.I64_REINTERPRET_F64:
        case opcode_1.WasmOpcode.I64_TRUNC_S_F32:
        case opcode_1.WasmOpcode.I64_TRUNC_U_F32:
        case opcode_1.WasmOpcode.I64_TRUNC_S_F64:
        case opcode_1.WasmOpcode.I64_TRUNC_U_F64:
        case opcode_1.WasmOpcode.I64_EXTEND_S_I32:
        case opcode_1.WasmOpcode.I64_EXTEND_U_I32:
            return wasm_type_1.WasmType.I64;
        // Float32
        case opcode_1.WasmOpcode.F32_CONST:
        case opcode_1.WasmOpcode.F32_ADD:
        case opcode_1.WasmOpcode.F32_SUB:
        case opcode_1.WasmOpcode.F32_MUL:
        case opcode_1.WasmOpcode.F32_DIV:
        case opcode_1.WasmOpcode.F32_SQRT:
        case opcode_1.WasmOpcode.F32_NEG:
        case opcode_1.WasmOpcode.F32_NE:
        case opcode_1.WasmOpcode.F32_ABS:
        case opcode_1.WasmOpcode.F32_CEIL:
        case opcode_1.WasmOpcode.F32_EQ:
        case opcode_1.WasmOpcode.F32_FLOOR:
        case opcode_1.WasmOpcode.F32_NEAREST:
        case opcode_1.WasmOpcode.F32_MIN:
        case opcode_1.WasmOpcode.F32_MAX:
        case opcode_1.WasmOpcode.F32_GE:
        case opcode_1.WasmOpcode.F32_GT:
        case opcode_1.WasmOpcode.F32_LT:
        case opcode_1.WasmOpcode.F32_LE:
        case opcode_1.WasmOpcode.F32_COPYSIGN:
        case opcode_1.WasmOpcode.F32_LOAD:
        case opcode_1.WasmOpcode.F32_STORE:
        case opcode_1.WasmOpcode.F32_TRUNC:
        case opcode_1.WasmOpcode.F32_DEMOTE_F64:
        case opcode_1.WasmOpcode.F32_CONVERT_S_I32:
        case opcode_1.WasmOpcode.F32_CONVERT_U_I32:
        case opcode_1.WasmOpcode.F32_CONVERT_S_I64:
        case opcode_1.WasmOpcode.F32_CONVERT_U_I64:
        case opcode_1.WasmOpcode.F32_REINTERPRET_I32:
            return wasm_type_1.WasmType.F32;
        // Float64
        case opcode_1.WasmOpcode.F64_CONST:
        case opcode_1.WasmOpcode.F64_ADD:
        case opcode_1.WasmOpcode.F64_SUB:
        case opcode_1.WasmOpcode.F64_MUL:
        case opcode_1.WasmOpcode.F64_DIV:
        case opcode_1.WasmOpcode.F64_SQRT:
        case opcode_1.WasmOpcode.F64_NEG:
        case opcode_1.WasmOpcode.F64_NE:
        case opcode_1.WasmOpcode.F64_ABS:
        case opcode_1.WasmOpcode.F64_CEIL:
        case opcode_1.WasmOpcode.F64_EQ:
        case opcode_1.WasmOpcode.F64_FLOOR:
        case opcode_1.WasmOpcode.F64_NEAREST:
        case opcode_1.WasmOpcode.F64_MIN:
        case opcode_1.WasmOpcode.F64_MAX:
        case opcode_1.WasmOpcode.F64_GE:
        case opcode_1.WasmOpcode.F64_GT:
        case opcode_1.WasmOpcode.F64_LT:
        case opcode_1.WasmOpcode.F64_LE:
        case opcode_1.WasmOpcode.F64_COPYSIGN:
        case opcode_1.WasmOpcode.F64_LOAD:
        case opcode_1.WasmOpcode.F64_STORE:
        case opcode_1.WasmOpcode.F64_TRUNC:
        case opcode_1.WasmOpcode.F64_PROMOTE_F32:
        case opcode_1.WasmOpcode.F64_CONVERT_S_I32:
        case opcode_1.WasmOpcode.F64_CONVERT_U_I32:
        case opcode_1.WasmOpcode.F64_CONVERT_S_I64:
        case opcode_1.WasmOpcode.F64_CONVERT_U_I64:
        case opcode_1.WasmOpcode.F64_REINTERPRET_I64:
            return wasm_type_1.WasmType.F64;
        // No types
        case opcode_1.WasmOpcode.CALL:
        case opcode_1.WasmOpcode.END:
        case opcode_1.WasmOpcode.RETURN:
        case opcode_1.WasmOpcode.GET_GLOBAL:
        case opcode_1.WasmOpcode.GET_LOCAL:
        case opcode_1.WasmOpcode.SET_LOCAL:
        case opcode_1.WasmOpcode.SET_GLOBAL:
        case opcode_1.WasmOpcode.BLOCK:
        case opcode_1.WasmOpcode.LOOP:
        case opcode_1.WasmOpcode.IF:
        case opcode_1.WasmOpcode.IF_ELSE:
        case opcode_1.WasmOpcode.BR:
        case opcode_1.WasmOpcode.BR_IF:
        case opcode_1.WasmOpcode.BR_TABLE:
        case opcode_1.WasmOpcode.NOP:
            return null;
        default:
            console.warn("Unhandled Opcode " + opcode_1.WasmOpcode[opcode]);
            break;
    }
}


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const symbol_1 = __webpack_require__(4);
const bytearray_1 = __webpack_require__(11);
const utils_1 = __webpack_require__(5);
const node_1 = __webpack_require__(3);
const opcode_1 = __webpack_require__(7);
const utils_2 = __webpack_require__(5);
const builtins_helper_1 = __webpack_require__(33);
const assert_1 = __webpack_require__(0);
const wasm_type_1 = __webpack_require__(15);
const logger_1 = __webpack_require__(10);
const wasm_signature_1 = __webpack_require__(40);
const bitness_1 = __webpack_require__(30);
const wasm_section_1 = __webpack_require__(14);
const wasm_external_kind_1 = __webpack_require__(34);
const wasm_global_1 = __webpack_require__(36);
const wasm_function_1 = __webpack_require__(35);
const wasm_import_1 = __webpack_require__(37);
const wasm_local_1 = __webpack_require__(38);
const wasm_shared_offset_1 = __webpack_require__(39);
const wasm_assembler_1 = __webpack_require__(31);
const WASM_MAGIC = 0x6d736100; //'\0' | 'a' << 8 | 's' << 16 | 'm' << 24;
const WASM_VERSION = 0x1;
const WASM_SIZE_IN_PAGES = 1;
const WASM_SET_MAX_MEMORY = false;
const WASM_MAX_MEMORY = 1024 * 1024 * 1024;
const WASM_MEMORY_INITIALIZER_BASE = 8; // Leave space for "null"
global["debug"] = true;
class WasmModule {
    constructor(bitness) {
        this.bitness = bitness;
        this.importCount = 0;
        this.globalCount = 0;
        this.functionCount = 0;
        this.signatureCount = 0;
        this.assembler = new wasm_assembler_1.WasmAssembler();
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
        let result = new wasm_import_1.WasmImport();
        result.signatureIndex = signatureIndex;
        result.signature = this.signatures[signatureIndex];
        result.module = mod;
        result.name = name;
        if (this.firstImport == null)
            this.firstImport = result;
        else
            this.lastImport.next = result;
        this.lastImport = result;
        this.assembler.importList.push(result);
        this.importCount = this.importCount + 1;
        return result;
    }
    allocateGlobal(symbol, bitness) {
        let global = new wasm_global_1.WasmGlobal();
        global.type = symbolToValueType(symbol, bitness);
        global.symbol = symbol;
        symbol.offset = this.globalCount;
        if (this.firstGlobal == null) {
            this.firstGlobal = global;
            this.globalEntries = [];
        }
        else
            this.lastGlobal.next = global;
        this.lastGlobal = global;
        this.globalEntries.push(global.type);
        this.globalCount = this.globalCount + 1;
        return global;
    }
    allocateFunction(symbol, signatureIndex) {
        let fn = new wasm_function_1.WasmFunction();
        fn.symbol = symbol;
        fn.signatureIndex = signatureIndex;
        fn.signature = this.signatures[signatureIndex];
        if (this.firstFunction == null)
            this.firstFunction = fn;
        else
            this.lastFunction.next = fn;
        this.lastFunction = fn;
        this.assembler.functionList.push(fn);
        this.functionCount = this.functionCount + 1;
        return fn;
    }
    allocateSignature(argumentTypes, returnType, argumentCount) {
        assert_1.assert(returnType != null);
        assert_1.assert(returnType.next == null);
        let signature = new wasm_signature_1.WasmSignature();
        signature.argumentCount = argumentCount;
        signature.argumentTypes = argumentTypes;
        signature.returnType = returnType;
        let check = this.firstSignature;
        let i = 0;
        while (check != null) {
            if (wasm_signature_1.wasmAreSignaturesEqual(signature, check)) {
                return i;
            }
            check = check.next;
            i = i + 1;
        }
        if (this.firstSignature == null) {
            this.signatures = [];
            this.firstSignature = signature;
        }
        else
            this.lastSignature.next = signature;
        this.lastSignature = signature;
        this.signatures.push(signature);
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
        this.emitGlobalDeclarations(array);
        this.emitExportTable(array);
        this.emitStartFunctionDeclaration(array);
        this.emitElements(array);
        this.emitFunctionBodies(array);
        this.emitDataSegments(array);
        this.emitNames(array);
    }
    emitSignatures(array) {
        if (!this.firstSignature) {
            return;
        }
        let section = this.assembler.startSection(array, wasm_section_1.WasmSection.Type, "signatures");
        this.assembler.writeUnsignedLEB128(section.data, this.signatureCount);
        let signature = this.firstSignature;
        let sigCount = 0;
        while (signature != null) {
            let count = 0;
            let type = signature.argumentTypes;
            while (type != null) {
                count = count + 1;
                type = type.next;
            }
            logger_1.log(section.data, array.position, wasm_type_1.WasmType.func, "func sig " + sigCount++);
            this.assembler.writeUnsignedLEB128(section.data, wasm_type_1.WasmType.func); //form, the value for the func type constructor
            logger_1.log(section.data, array.position, count, "num params");
            this.assembler.writeUnsignedLEB128(section.data, count); //param_count, the number of parameters to the function
            type = signature.argumentTypes;
            while (type != null) {
                logger_1.log(section.data, array.position, type.id, wasm_type_1.WasmType[type.id]);
                this.assembler.writeUnsignedLEB128(section.data, type.id); //value_type, the parameter types of the function
                type = type.next;
            }
            let returnTypeId = signature.returnType.id;
            if (returnTypeId > 0) {
                logger_1.log(section.data, array.position, "01", "num results");
                this.assembler.writeUnsignedLEB128(section.data, 1); //return_count, the number of results from the function
                logger_1.log(section.data, array.position, signature.returnType.id, wasm_type_1.WasmType[signature.returnType.id]);
                this.assembler.writeUnsignedLEB128(section.data, signature.returnType.id);
            }
            else {
                this.assembler.writeUnsignedLEB128(section.data, 0);
            }
            signature = signature.next;
        }
        this.assembler.endSection(array, section);
    }
    emitImportTable(array) {
        if (!this.firstImport) {
            return;
        }
        let section = this.assembler.startSection(array, wasm_section_1.WasmSection.Import, "import_table");
        logger_1.log(section.data, array.position, this.importCount, "num imports");
        this.assembler.writeUnsignedLEB128(section.data, this.importCount);
        let current = this.firstImport;
        let count = 0;
        while (current != null) {
            logger_1.log(section.data, array.position, null, `import func (${count}) ${current.module} ${current.name}`);
            this.assembler.writeWasmString(section.data, current.module);
            this.assembler.writeWasmString(section.data, current.name);
            this.assembler.writeUnsignedLEB128(section.data, wasm_external_kind_1.WasmExternalKind.Function);
            this.assembler.writeUnsignedLEB128(section.data, current.signatureIndex);
            current = current.next;
            count++;
        }
        this.assembler.endSection(array, section);
    }
    emitFunctionDeclarations(array) {
        if (!this.firstFunction) {
            return;
        }
        let section = this.assembler.startSection(array, wasm_section_1.WasmSection.Function, "function_declarations");
        logger_1.log(section.data, array.position, this.functionCount, "num functions");
        this.assembler.writeUnsignedLEB128(section.data, this.functionCount);
        let fn = this.firstFunction;
        let count = this.importCount;
        while (fn != null) {
            logger_1.log(section.data, array.position, fn.signatureIndex, `func ${count} sig ${getWasmFunctionName(fn.symbol)}`);
            this.assembler.writeUnsignedLEB128(section.data, fn.signatureIndex);
            fn = fn.next;
            count++;
        }
        this.assembler.endSection(array, section);
    }
    emitTables(array) {
        //TODO
    }
    emitMemory(array) {
        let section = this.assembler.startSection(array, wasm_section_1.WasmSection.Memory, "memory");
        logger_1.log(section.data, array.position, "01", "num memories");
        this.assembler.writeUnsignedLEB128(section.data, 1); //indicating the number of memories defined by the module, In the MVP, the number of memories must be no more than 1.
        //resizable_limits
        logger_1.log(section.data, array.position, "00", "memory flags");
        this.assembler.writeUnsignedLEB128(section.data, WASM_SET_MAX_MEMORY ? 0x1 : 0); //flags, bit 0x1 is set if the maximum field is present
        logger_1.log(section.data, array.position, WASM_SIZE_IN_PAGES, "memory initial pages");
        this.assembler.writeUnsignedLEB128(section.data, WASM_SIZE_IN_PAGES); //initial length (in units of table elements or wasm pages)
        if (WASM_SET_MAX_MEMORY) {
            logger_1.log(section.data, array.position, WASM_MAX_MEMORY, "maximum memory");
            this.assembler.writeUnsignedLEB128(section.data, WASM_MAX_MEMORY); // maximum, only present if specified by flags
        }
        this.assembler.endSection(array, section);
    }
    emitGlobalDeclarations(array) {
        if (!this.firstGlobal) {
            return;
        }
        let section = this.assembler.startSection(array, wasm_section_1.WasmSection.Global, "global");
        this.assembler.writeUnsignedLEB128(section.data, this.globalCount);
        this.assembler.stackTracer.setGlobals(this.globalEntries);
        let global = this.firstGlobal;
        while (global) {
            let dataType = typeToDataType(global.symbol.resolvedType, this.bitness);
            let value = global.symbol.node.variableValue();
            section.data.append(wasm_type_1.WasmType[dataType]); //content_type
            this.assembler.writeUnsignedLEB128(section.data, 1); //mutability, 0 if immutable, 1 if mutable. MVP only support immutable global variables
            if (value) {
                let rawValue = 0;
                if (value.kind === node_1.NodeKind.NULL || value.kind === node_1.NodeKind.UNDEFINED) {
                    rawValue = 0;
                }
                else if (value.rawValue !== undefined) {
                    rawValue = value.rawValue;
                }
                else {
                    // Emit evaluation to start function
                    this.addGlobalToStartFunction(global);
                }
                this.assembler.appendOpcode(section.data, array.position, opcode_1.WasmOpcode[`${dataType}_CONST`], rawValue);
                switch (dataType) {
                    case "I32":
                        this.assembler.writeUnsignedLEB128(section.data, rawValue);
                        break;
                    case "I64":
                        this.assembler.writeUnsignedLEB128(section.data, rawValue);
                        break;
                    case "F32":
                        this.assembler.writeFloat(section.data, rawValue);
                        break;
                    case "F64":
                        this.assembler.writeDouble(section.data, rawValue);
                        break;
                }
            }
            else {
                this.assembler.appendOpcode(section.data, array.position, opcode_1.WasmOpcode[`${dataType}_CONST`], 0);
                this.assembler.writeUnsignedLEB128(section.data, 0); //const value
            }
            this.assembler.appendOpcode(section.data, array.position, opcode_1.WasmOpcode.END);
            global = global.next;
        }
        this.assembler.endSection(array, section);
    }
    addGlobalToStartFunction(global) {
        let value = global.symbol.node.variableValue();
        let startFn = this.startFunction;
        this.emitNode(startFn.body, 0, value);
        this.assembler.appendOpcode(startFn.body, 0, opcode_1.WasmOpcode.SET_GLOBAL);
        this.assembler.writeUnsignedLEB128(startFn.body, global.symbol.offset);
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
        let section = this.assembler.startSection(array, wasm_section_1.WasmSection.Export, "export_table");
        logger_1.log(section.data, array.position, exportedCount, "num exports");
        this.assembler.writeUnsignedLEB128(section.data, exportedCount + 1);
        //Export main memory
        let memoryName = "memory";
        logger_1.log(section.data, array.position, memoryName.length, "export name length");
        logger_1.log(section.data, null, null, `${utils_2.toHex(section.data.position + array.position + 4)}: ${memoryName} // export name`);
        this.assembler.writeWasmString(section.data, memoryName);
        logger_1.log(section.data, array.position, wasm_external_kind_1.WasmExternalKind.Function, "export kind");
        this.assembler.writeUnsignedLEB128(section.data, wasm_external_kind_1.WasmExternalKind.Memory);
        logger_1.log(section.data, array.position, 0, "export memory index");
        this.assembler.writeUnsignedLEB128(section.data, 0);
        let i = this.importCount;
        fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                let fnName = getWasmFunctionName(fn.symbol);
                logger_1.log(section.data, array.position, fnName.length, "export name length");
                logger_1.log(section.data, null, null, `${utils_2.toHex(section.data.position + array.position + 4)}: ${fnName} // export name`);
                this.assembler.writeWasmString(section.data, fnName);
                logger_1.log(section.data, array.position, wasm_external_kind_1.WasmExternalKind.Function, "export kind");
                this.assembler.writeUnsignedLEB128(section.data, wasm_external_kind_1.WasmExternalKind.Function);
                logger_1.log(section.data, array.position, i, "export func index");
                this.assembler.writeUnsignedLEB128(section.data, i);
            }
            fn = fn.next;
            i = i + 1;
        }
        this.assembler.endSection(array, section);
    }
    emitStartFunctionDeclaration(array) {
        if (this.startFunctionIndex != -1) {
            let section = this.assembler.startSection(array, wasm_section_1.WasmSection.Start, "start_function");
            logger_1.log(section.data, array.position, this.startFunctionIndex, "start function index");
            this.assembler.writeUnsignedLEB128(section.data, this.importCount + this.startFunctionIndex);
            this.assembler.endSection(array, section);
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
        let section = this.assembler.startSection(array, wasm_section_1.WasmSection.Code, "function_bodies");
        logger_1.log(section.data, offset, this.functionCount, "num functions");
        this.assembler.writeUnsignedLEB128(section.data, this.functionCount);
        let count = 0;
        let fn = this.firstFunction;
        while (fn != null) {
            this.currentFunction = fn;
            let sectionOffset = offset + section.data.position;
            let wasmFunctionName = getWasmFunctionName(fn.symbol);
            let bodyData = new bytearray_1.ByteArray();
            logger_1.log(bodyData, sectionOffset, fn.localCount ? fn.localCount : 0, "local var count");
            this.assembler.stackTracer.startFunction(fn);
            if (fn.localCount > 0) {
                bodyData.writeUnsignedLEB128(fn.localCount); //local_count
                // TODO: Optimize local declarations
                //local_entry
                let local = fn.firstLocal;
                while (local) {
                    logger_1.log(bodyData, sectionOffset, 1, "local index");
                    bodyData.writeUnsignedLEB128(1); //count
                    logger_1.log(bodyData, sectionOffset, local.type, wasm_type_1.WasmType[local.type]);
                    bodyData.append(local.type); //value_type
                    local = local.next;
                }
            }
            else {
                bodyData.writeUnsignedLEB128(0);
            }
            let lastChild;
            if (fn.isConstructor) {
                // this is <CLASS>__ctr function
                this.emitConstructor(bodyData, sectionOffset, fn);
            }
            let child = fn.symbol.node.functionBody().firstChild;
            while (child != null) {
                lastChild = child;
                this.emitNode(bodyData, sectionOffset, child);
                child = child.nextSibling;
            }
            if (fn.body) {
                bodyData.copy(fn.body);
            }
            else {
                if (lastChild && lastChild.kind !== node_1.NodeKind.RETURN && fn.returnType != wasm_type_1.WasmType.VOID) {
                    this.assembler.appendOpcode(bodyData, sectionOffset, opcode_1.WasmOpcode.RETURN);
                }
            }
            if (fn.returnType === wasm_type_1.WasmType.VOID) {
                // Drop stack if not empty
                this.assembler.dropStack(bodyData);
            }
            this.assembler.appendOpcode(bodyData, sectionOffset, opcode_1.WasmOpcode.END); //end, 0x0b, indicating the end of the body
            this.assembler.stackTracer.endFunction();
            //Copy and finish body
            section.data.writeUnsignedLEB128(bodyData.length);
            logger_1.log(section.data, offset, null, ` - func body ${this.importCount + (count++)} (${wasmFunctionName})`);
            logger_1.log(section.data, offset, bodyData.length, "func body size");
            section.data.log += bodyData.log;
            section.data.copy(bodyData);
            fn = fn.next;
        }
        this.assembler.endSection(array, section);
    }
    emitDataSegments(array) {
        this.growMemoryInitializer();
        let memoryInitializer = this.memoryInitializer;
        let initializerLength = memoryInitializer.length;
        let initialHeapPointer = utils_1.alignToNextMultipleOf(WASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);
        // Pass the initial heap pointer to the "malloc" function
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.originalHeapPointer);
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.currentHeapPointer);
        let section = this.assembler.startSection(array, wasm_section_1.WasmSection.Data, "data_segments");
        // This only writes one single section containing everything
        logger_1.log(section.data, array.position, 1, "num data segments");
        this.assembler.writeUnsignedLEB128(section.data, 1);
        //data_segment
        logger_1.log(section.data, array.position, null, " - data segment header 0");
        logger_1.log(section.data, array.position, 0, "memory index");
        this.assembler.writeUnsignedLEB128(section.data, 0); //index, the linear memory index (0 in the MVP)
        //offset, an i32 initializer expression that computes the offset at which to place the data
        this.assembler.appendOpcode(section.data, array.position, opcode_1.WasmOpcode.I32_CONST);
        logger_1.log(section.data, array.position, WASM_MEMORY_INITIALIZER_BASE, "i32 literal");
        this.assembler.writeUnsignedLEB128(section.data, WASM_MEMORY_INITIALIZER_BASE); //const value
        this.assembler.appendOpcode(section.data, array.position, opcode_1.WasmOpcode.END);
        logger_1.log(section.data, array.position, initializerLength, "data segment size");
        this.assembler.writeUnsignedLEB128(section.data, initializerLength); //size, size of data (in bytes)
        logger_1.log(section.data, array.position, null, " - data segment data 0");
        //data, sequence of size bytes
        // Copy the entire memory initializer (also includes zero-initialized data for now)
        let i = 0;
        let value;
        while (i < initializerLength) {
            for (let j = 0; j < 16; j++) {
                if (i + j < initializerLength) {
                    value = memoryInitializer.get(i + j);
                    section.data.append(value);
                    logger_1.logData(section.data, array.position, value, j == 0);
                }
            }
            section.data.log += "\n";
            i = i + 16;
        }
        // section.data.copy(memoryInitializer, initializerLength);
        this.assembler.endSection(array, section);
    }
    // Custom section for debug names
    //
    emitNames(array) {
        let section = this.assembler.startSection(array, 0, "name");
        let subsectionFunc = new bytearray_1.ByteArray();
        let subsectionLocal = new bytearray_1.ByteArray();
        this.assembler.writeUnsignedLEB128(subsectionFunc, this.functionCount);
        this.assembler.writeUnsignedLEB128(subsectionLocal, this.functionCount);
        let fn = this.firstFunction;
        while (fn != null) {
            let fnIndex = this.importCount + fn.symbol.offset;
            let name = getWasmFunctionName(fn.symbol);
            this.assembler.writeUnsignedLEB128(subsectionFunc, fnIndex);
            this.assembler.writeWasmString(subsectionFunc, name);
            this.assembler.writeUnsignedLEB128(subsectionLocal, fnIndex);
            this.assembler.writeUnsignedLEB128(subsectionLocal, fn.localCount);
            let local = fn.firstLocal;
            let localIndex = 0;
            while (local != null) {
                this.assembler.writeUnsignedLEB128(subsectionLocal, localIndex++);
                this.assembler.writeWasmString(subsectionLocal, local.symbol.name);
                local = local.next;
            }
            fn = fn.next;
        }
        //subsection for function names
        this.assembler.writeUnsignedLEB128(section.data, 1); // name_type
        this.assembler.writeUnsignedLEB128(section.data, subsectionFunc.length); // name_payload_len
        section.data.copy(subsectionFunc); // name_payload_data
        //subsection for local names
        this.assembler.writeUnsignedLEB128(section.data, 2); // name_type
        this.assembler.writeUnsignedLEB128(section.data, subsectionLocal.length); // name_payload_len
        section.data.copy(subsectionLocal); // name_payload_data
        this.assembler.endSection(array, section);
    }
    prepareToEmit(node) {
        if (node.kind == node_1.NodeKind.STRING) {
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
        else if (node.kind == node_1.NodeKind.VARIABLE) {
            let symbol = node.symbol;
            /*if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
             let sizeOf = symbol.resolvedType.variableSizeOf(this.context);
             let value = symbol.node.variableValue();
             let memoryInitializer = this.memoryInitializer;

             // Copy the initial value into the memory initializer
             this.growMemoryInitializer();

             let offset = symbol.offset;

             if (sizeOf == 1) {
             if (symbol.resolvedType.isUnsigned()) {
             memoryInitializer.writeUnsignedByte(value.intValue, offset);
             } else {
             memoryInitializer.writeByte(value.intValue, offset);
             }
             }
             else if (sizeOf == 2) {
             if (symbol.resolvedType.isUnsigned()) {
             memoryInitializer.writeUnsignedShort(value.intValue, offset);
             } else {
             memoryInitializer.writeShort(value.intValue, offset);
             }
             }
             else if (sizeOf == 4) {
             if (symbol.resolvedType.isFloat()) {
             memoryInitializer.writeFloat(value.floatValue, offset);
             } else {
             if (symbol.resolvedType.isUnsigned()) {
             memoryInitializer.writeUnsignedInt(value.intValue, offset);
             } else {
             memoryInitializer.writeInt(value.intValue, offset);
             }
             }
             }
             else if (sizeOf == 8) {
             if (symbol.resolvedType.isDouble()) {
             memoryInitializer.writeDouble(value.rawValue, offset);
             } else {
             //TODO Implement Int64 write
             if (symbol.resolvedType.isUnsigned()) {
             //memoryInitializer.writeUnsignedInt64(value.rawValue, offset);
             } else {
             //memoryInitializer.writeInt64(value.rawValue, offset);
             }
             }
             }
             else assert(false);*/
            if (symbol.kind == symbol_1.SymbolKind.VARIABLE_GLOBAL) {
                let global = this.allocateGlobal(symbol, this.bitness);
                // Make sure the heap offset is tracked
                if (symbol.name == "currentHeapPointer") {
                    assert_1.assert(this.currentHeapPointer == -1);
                    this.currentHeapPointer = symbol.offset;
                }
                else if (symbol.name == "originalHeapPointer") {
                    assert_1.assert(this.originalHeapPointer == -1);
                    this.originalHeapPointer = symbol.offset;
                }
            }
        }
        else if (node.kind == node_1.NodeKind.FUNCTION &&
            (node.symbol.kind != symbol_1.SymbolKind.FUNCTION_INSTANCE ||
                node.symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE && !node.parent.isTemplate())) {
            let returnType = node.functionReturnType();
            let wasmReturnType = this.getWasmType(returnType.resolvedType);
            let shared = new wasm_shared_offset_1.WasmSharedOffset();
            let argumentTypesFirst = null;
            let argumentTypesLast = null;
            let symbol = node.symbol;
            let isConstructor = symbol.name == "constructor";
            // Make sure to include the implicit "this" variable as a normal argument
            let argument = node.isExternalImport() ? node.functionFirstArgumentIgnoringThis() : node.functionFirstArgument();
            let argumentCount = 0;
            let argumentList = [];
            while (argument != returnType) {
                let wasmType = this.getWasmType(argument.variableType().resolvedType);
                argumentList.push(wasmType);
                let type = wasmWrapType(wasmType);
                if (argumentTypesFirst == null)
                    argumentTypesFirst = type;
                else
                    argumentTypesLast.next = type;
                argumentTypesLast = type;
                shared.nextLocalOffset = shared.nextLocalOffset + 1;
                argumentCount++;
                argument = argument.nextSibling;
            }
            let signatureIndex = this.allocateSignature(argumentTypesFirst, wasmWrapType(wasmReturnType), argumentCount);
            let body = node.functionBody();
            // Functions without bodies are imports
            if (body == null) {
                let wasmFunctionName = getWasmFunctionName(symbol);
                if (!builtins_helper_1.isBuiltin(wasmFunctionName)) {
                    let moduleName = symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE ? symbol.parent().name : "global";
                    symbol.offset = this.importCount;
                    this.allocateImport(signatureIndex, moduleName, symbol.name);
                }
                node = node.nextSibling;
                return;
            }
            else {
                symbol.offset = this.functionCount;
            }
            let fn = this.allocateFunction(symbol, signatureIndex);
            fn.localEntries = argumentList.concat(fn.localEntries);
            fn.isConstructor = isConstructor;
            fn.returnType = wasmReturnType;
            // Make sure "malloc" is tracked
            if (symbol.kind == symbol_1.SymbolKind.FUNCTION_GLOBAL && symbol.name == "malloc") {
                assert_1.assert(this.mallocFunctionIndex == -1);
                this.mallocFunctionIndex = symbol.offset;
            }
            if (symbol.kind == symbol_1.SymbolKind.FUNCTION_GLOBAL && symbol.name == "free") {
                assert_1.assert(this.freeFunctionIndex == -1);
                this.freeFunctionIndex = symbol.offset;
            }
            // Make "__WASM_INITIALIZER" as start function
            if (symbol.kind == symbol_1.SymbolKind.FUNCTION_GLOBAL && symbol.name == "__WASM_INITIALIZER") {
                assert_1.assert(this.startFunctionIndex == -1);
                this.startFunctionIndex = symbol.offset;
                this.startFunction = fn;
                this.startFunction.body = new bytearray_1.ByteArray();
            }
            if (node.isExport()) {
                fn.isExported = true;
            }
            wasmAssignLocalVariableOffsets(fn, body, shared, this.bitness);
            fn.localCount = shared.localCount;
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
        this.assembler.appendOpcode(array, byteOffset, opcode);
    }
    emitLoadFromMemory(array, byteOffset, type, relativeBase, offset) {
        let opcode;
        // Relative address
        if (relativeBase != null) {
            this.emitNode(array, byteOffset, relativeBase);
        }
        else {
            opcode = opcode_1.WasmOpcode.I32_CONST;
            this.assembler.appendOpcode(array, byteOffset, opcode);
            logger_1.log(array, byteOffset, 0, "i32 literal");
            this.assembler.writeUnsignedLEB128(array, 0);
        }
        let sizeOf = type.variableSizeOf(this.context);
        if (sizeOf == 1) {
            opcode = type.isUnsigned() ? opcode_1.WasmOpcode.I32_LOAD8_U : opcode_1.WasmOpcode.I32_LOAD8_S;
            this.assembler.appendOpcode(array, byteOffset, opcode);
            logger_1.log(array, byteOffset, 0, "alignment");
            this.assembler.writeUnsignedLEB128(array, 0);
        }
        else if (sizeOf == 2) {
            opcode = type.isUnsigned() ? opcode_1.WasmOpcode.I32_LOAD16_U : opcode_1.WasmOpcode.I32_LOAD16_S;
            this.assembler.appendOpcode(array, byteOffset, opcode);
            logger_1.log(array, byteOffset, 1, "alignment");
            this.assembler.writeUnsignedLEB128(array, 1);
        }
        else if (sizeOf == 4 || type.isClass()) {
            if (type.isFloat()) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_LOAD);
            }
            else {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_LOAD);
            }
            logger_1.log(array, byteOffset, 2, "alignment");
            this.assembler.writeUnsignedLEB128(array, 2);
        }
        else if (sizeOf == 8) {
            if (type.isDouble()) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_LOAD);
            }
            else {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_LOAD);
            }
            logger_1.log(array, byteOffset, 3, "alignment");
            this.assembler.writeUnsignedLEB128(array, 3);
        }
        else {
            assert_1.assert(false);
        }
        logger_1.log(array, byteOffset, offset, "load offset");
        this.assembler.writeUnsignedLEB128(array, offset);
    }
    emitStoreToMemory(array, byteOffset, type, relativeBase, offset, value) {
        // Relative address
        if (relativeBase != null) {
            this.emitNode(array, byteOffset, relativeBase);
        }
        else {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
            logger_1.log(array, byteOffset, 0, "i32 literal");
            this.assembler.writeUnsignedLEB128(array, 0);
        }
        this.emitNode(array, byteOffset, value);
        let sizeOf = type.variableSizeOf(this.context);
        if (sizeOf == 1) {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_STORE8);
            logger_1.log(array, byteOffset, 0, "alignment");
            this.assembler.writeUnsignedLEB128(array, 0);
        }
        else if (sizeOf == 2) {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_STORE16);
            logger_1.log(array, byteOffset, 1, "alignment");
            this.assembler.writeUnsignedLEB128(array, 1);
        }
        else if (sizeOf == 4 || type.isClass()) {
            if (type.isFloat()) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_STORE);
            }
            else {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_STORE);
            }
            logger_1.log(array, byteOffset, 2, "alignment");
            this.assembler.writeUnsignedLEB128(array, 2);
        }
        else if (sizeOf == 8) {
            if (type.isDouble()) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_STORE);
            }
            else if (type.isLong()) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_STORE);
            }
            logger_1.log(array, byteOffset, 3, "alignment");
            this.assembler.writeUnsignedLEB128(array, 3);
        }
        else {
            assert_1.assert(false);
        }
        logger_1.log(array, byteOffset, offset, "load offset");
        this.assembler.writeUnsignedLEB128(array, offset);
    }
    /**
     * Emit instance
     * @param array
     * @param byteOffset
     * @param node
     */
    emitInstance(array, byteOffset, node) {
        let constructorNode = node.constructorNode();
        let callSymbol = constructorNode.symbol;
        let type = node.newType();
        let size;
        if (type.resolvedType.isArray()) {
            /**
             * If the new type if an array append total byte length and element size
             **/
            let elementNode = type.firstGenericType();
            let elementType = elementNode.resolvedType;
            let isClassElement = elementType.isClass();
            //ignore 64 bit pointer
            size = isClassElement ? 4 : elementType.allocationSizeOf(this.context);
            assert_1.assert(size > 0);
            let lengthNode = node.arrayLength();
            if (lengthNode.kind == node_1.NodeKind.INT32) {
                let length = size * lengthNode.intValue;
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, length);
                this.assembler.writeLEB128(array, length); //array byteLength
            }
            else {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, size);
                this.assembler.writeLEB128(array, size);
                this.emitNode(array, byteOffset, lengthNode);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_MUL); //array byteLength
            }
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(array, size); // array element size
            let callIndex = this.getWasmFunctionCallIndex(callSymbol);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL);
            logger_1.log(array, byteOffset, callIndex, `call func index (${callIndex})`);
            this.assembler.writeUnsignedLEB128(array, callIndex);
        }
        else if (type.resolvedType.isTypedArray()) {
            // let elementSize = getTypedArrayElementSize(type.resolvedType.symbol.name);
            // this.assembler.appendOpcode(array, byteOffset, WasmOpcode.GET_LOCAL);
            // this.assembler.writeLEB128(array, 0);
            // this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            // this.assembler.writeLEB128(array, elementSize);
            // this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
            // this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            // this.assembler.writeLEB128(array, size);
            // this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_ADD);
        }
        else {
            // Emit constructor arguments
            let child = node.firstChild.nextSibling;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }
            let callIndex = this.getWasmFunctionCallIndex(callSymbol);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL, callIndex);
            this.assembler.writeUnsignedLEB128(array, callIndex);
        }
    }
    /**
     * Emit constructor function where malloc happens
     * @param array
     * @param byteOffset
     * @param fn
     */
    emitConstructor(array, byteOffset, fn) {
        let constructorNode = fn.symbol.node;
        let type = constructorNode.parent.symbol;
        let size = type.resolvedType.allocationSizeOf(this.context);
        assert_1.assert(size > 0);
        if (type.resolvedType.isArray()) {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.GET_LOCAL, 0);
            this.assembler.writeUnsignedLEB128(array, 0); // array parameter byteLength
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(array, size); // size of array class, default is 8 bytes
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_ADD);
        }
        else if (type.resolvedType.isTypedArray()) {
            let elementSize = getTypedArrayElementSize(type.resolvedType.symbol.name);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.GET_LOCAL, 0);
            this.assembler.writeUnsignedLEB128(array, 0);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, elementSize);
            this.assembler.writeLEB128(array, elementSize);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_SHL);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(array, size);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_ADD);
        }
        else {
            // Pass the object size as the first argument
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(array, size);
        }
        // Allocate memory
        let mallocIndex = this.calculateWasmFunctionIndex(this.mallocFunctionIndex);
        this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL, mallocIndex);
        this.assembler.writeUnsignedLEB128(array, mallocIndex);
        this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL, fn.signature.argumentCount);
        this.assembler.writeUnsignedLEB128(array, fn.signature.argumentCount); // Set self pointer to first local variable which is immediate after the argument variable
    }
    emitNode(array, byteOffset, node) {
        // Assert
        assert_1.assert(!node_1.isExpression(node) || node.resolvedType != null);
        if (node.kind == node_1.NodeKind.BLOCK) {
            /**
             * Skip emitting block if parent is 'if' or 'loop' since it is already a block
             */
            let skipBlock = node.parent.kind === node_1.NodeKind.IF || node.parent.kind === node_1.NodeKind.WHILE;
            if (!skipBlock) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BLOCK);
                if (node.returnNode !== undefined) {
                    logger_1.log(array, byteOffset, this.currentFunction.returnType, wasm_type_1.WasmType[this.currentFunction.returnType]);
                    array.append(this.currentFunction.returnType);
                }
                else {
                    logger_1.log(array, byteOffset, wasm_type_1.WasmType.block_type, wasm_type_1.WasmType[wasm_type_1.WasmType.block_type]);
                    array.append(wasm_type_1.WasmType.block_type);
                }
            }
            let child = node.firstChild;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }
            if (!skipBlock) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END);
            }
        }
        else if (node.kind == node_1.NodeKind.WHILE) {
            let value = node.whileValue();
            let body = node.whileBody();
            // Ignore "while (false) { ... }"
            if (value.kind == node_1.NodeKind.BOOLEAN && value.intValue == 0) {
                return 0;
            }
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BLOCK);
            logger_1.log(array, 0, wasm_type_1.WasmType.block_type, wasm_type_1.WasmType[wasm_type_1.WasmType.block_type]);
            array.append(wasm_type_1.WasmType.block_type);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.LOOP);
            logger_1.log(array, 0, wasm_type_1.WasmType.block_type, wasm_type_1.WasmType[wasm_type_1.WasmType.block_type]);
            array.append(wasm_type_1.WasmType.block_type);
            if (value.kind != node_1.NodeKind.BOOLEAN) {
                this.emitNode(array, byteOffset, value);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_EQZ);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BR_IF);
                this.assembler.writeUnsignedLEB128(array, 1); // Break out of the immediately enclosing loop
            }
            let child = body.firstChild;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }
            // Jump back to the top (this doesn't happen automatically)
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BR);
            this.assembler.writeUnsignedLEB128(array, 0); // Continue back to the immediately enclosing loop
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END); // end inner block
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END); // end outer block
        }
        else if (node.kind == node_1.NodeKind.BREAK || node.kind == node_1.NodeKind.CONTINUE) {
            let label = 0;
            let parent = node.parent;
            while (parent != null && parent.kind != node_1.NodeKind.WHILE) {
                if (parent.kind == node_1.NodeKind.BLOCK) {
                    label = label + 1;
                }
                parent = parent.parent;
            }
            assert_1.assert(label > 0);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BR);
            this.assembler.writeUnsignedLEB128(array, label - (node.kind == node_1.NodeKind.BREAK ? 0 : 1));
        }
        else if (node.kind == node_1.NodeKind.EMPTY) {
            return 0;
        }
        else if (node.kind == node_1.NodeKind.EXPRESSION) {
            this.emitNode(array, byteOffset, node.expressionValue());
        }
        else if (node.kind == node_1.NodeKind.RETURN) {
            let value = node.returnValue();
            if (value != null) {
                this.emitNode(array, byteOffset, value);
            }
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.RETURN);
        }
        else if (node.kind == node_1.NodeKind.VARIABLES) {
            let count = 0;
            let child = node.firstChild;
            while (child != null) {
                assert_1.assert(child.kind == node_1.NodeKind.VARIABLE);
                count = count + this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }
            return count;
        }
        else if (node.kind == node_1.NodeKind.IF) {
            let branch = node.ifFalse();
            this.emitNode(array, byteOffset, node.ifValue());
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF);
            let returnNode = node.ifReturnNode();
            let needEmptyElse = false;
            if (returnNode == null && branch === null) {
                wasm_assembler_1.append(array, 0, wasm_type_1.WasmType.block_type, wasm_type_1.WasmType[wasm_type_1.WasmType.block_type]);
            }
            else {
                if (returnNode !== null) {
                    let returnType = symbolToValueType(returnNode.resolvedType.symbol);
                    wasm_assembler_1.append(array, 0, returnType, wasm_type_1.WasmType[returnType]);
                    if (branch == null) {
                        needEmptyElse = true;
                    }
                }
                else {
                    wasm_assembler_1.append(array, 0, wasm_type_1.WasmType.block_type, wasm_type_1.WasmType[wasm_type_1.WasmType.block_type]);
                }
            }
            this.emitNode(array, byteOffset, node.ifTrue());
            if (branch != null) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF_ELSE);
                this.emitNode(array, byteOffset, branch);
            }
            else if (needEmptyElse) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF_ELSE);
                let dataType = typeToDataType(returnNode.resolvedType, this.bitness);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode[`${dataType}_CONST`]);
                if (dataType === "I32" || dataType === "I64") {
                    this.assembler.writeUnsignedLEB128(array, 0);
                }
                else if (dataType === "F32") {
                    this.assembler.writeFloat(array, 0);
                }
                else if (dataType === "F64") {
                    this.assembler.writeDouble(array, 0);
                }
            }
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END);
        }
        else if (node.kind == node_1.NodeKind.HOOK) {
            this.emitNode(array, byteOffset, node.hookValue());
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF);
            let trueValue = node.hookTrue();
            let trueValueType = symbolToValueType(trueValue.resolvedType.symbol);
            wasm_assembler_1.append(array, 0, trueValueType, wasm_type_1.WasmType[trueValueType]);
            this.emitNode(array, byteOffset, trueValue);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF_ELSE);
            this.emitNode(array, byteOffset, node.hookFalse());
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END);
        }
        else if (node.kind == node_1.NodeKind.VARIABLE) {
            let value = node.variableValue();
            if (node.symbol.name == "this" && this.currentFunction.symbol.name == "constructor") {
                // skip this
            }
            else if (node.symbol.kind == symbol_1.SymbolKind.VARIABLE_LOCAL) {
                if (value &&
                    value.kind != node_1.NodeKind.NAME &&
                    value.kind != node_1.NodeKind.CALL &&
                    value.kind != node_1.NodeKind.NEW &&
                    value.kind != node_1.NodeKind.DOT &&
                    value.rawValue) {
                    if (node.symbol.resolvedType.isFloat()) {
                        this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, value.floatValue);
                        this.assembler.writeFloat(array, value.floatValue);
                    }
                    else if (node.symbol.resolvedType.isDouble()) {
                        this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, value.doubleValue);
                        this.assembler.writeDouble(array, value.doubleValue);
                    }
                    else if (node.symbol.resolvedType.isLong()) {
                        this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, value.longValue);
                        this.assembler.writeLEB128(array, value.longValue);
                    }
                    else {
                        this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, value.intValue);
                        this.assembler.writeLEB128(array, value.intValue);
                    }
                }
                else {
                    if (value != null) {
                        this.emitNode(array, byteOffset, value);
                    }
                    else {
                        // Default value
                        if (node.symbol.resolvedType.isFloat()) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, 0);
                            this.assembler.writeFloat(array, 0);
                        }
                        else if (node.symbol.resolvedType.isDouble()) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, 0);
                            this.assembler.writeDouble(array, 0);
                        }
                        else if (node.symbol.resolvedType.isLong()) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, 0);
                            this.assembler.writeLEB128(array, 0);
                        }
                        else {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, 0);
                            this.assembler.writeLEB128(array, 0);
                        }
                    }
                }
                let skipSetLocal = value && node_1.isUnaryPostfix(value.kind);
                if (skipSetLocal == false) {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL, node.symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, node.symbol.offset);
                }
            }
            else {
                assert_1.assert(false);
            }
        }
        else if (node.kind == node_1.NodeKind.NAME) {
            let symbol = node.symbol;
            if (symbol.kind == symbol_1.SymbolKind.VARIABLE_ARGUMENT || symbol.kind == symbol_1.SymbolKind.VARIABLE_LOCAL) {
                // FIXME This should handle in checker.
                if (symbol.name === "this" && this.currentFunction.symbol.name === "constructor") {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.GET_LOCAL, this.currentFunction.signature.argumentCount);
                    this.assembler.writeUnsignedLEB128(array, this.currentFunction.signature.argumentCount);
                }
                else {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.GET_LOCAL, symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, symbol.offset);
                }
            }
            else if (symbol.kind == symbol_1.SymbolKind.VARIABLE_GLOBAL) {
                // FIXME: Final spec allow immutable global variables
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.GET_GLOBAL, symbol.offset);
                this.assembler.writeUnsignedLEB128(array, symbol.offset);
                // this.emitLoadFromMemory(array, byteOffset, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset);
            }
            else {
                assert_1.assert(false);
            }
        }
        else if (node.kind == node_1.NodeKind.DEREFERENCE) {
            this.emitLoadFromMemory(array, byteOffset, node.resolvedType.underlyingType(this.context), node.unaryValue(), 0);
        }
        else if (node.kind == node_1.NodeKind.NULL) {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, 0);
            this.assembler.writeLEB128(array, 0);
        }
        else if (node.kind == node_1.NodeKind.INT32 || node.kind == node_1.NodeKind.BOOLEAN) {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, node.intValue);
            this.assembler.writeLEB128(array, node.intValue || 0);
        }
        else if (node.kind == node_1.NodeKind.INT64) {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, node.longValue);
            this.assembler.writeLEB128(array, node.longValue);
        }
        else if (node.kind == node_1.NodeKind.FLOAT32) {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, node.floatValue);
            this.assembler.writeFloat(array, node.floatValue);
        }
        else if (node.kind == node_1.NodeKind.FLOAT64) {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, node.doubleValue);
            this.assembler.writeDouble(array, node.doubleValue);
        }
        else if (node.kind == node_1.NodeKind.STRING) {
            let value = WASM_MEMORY_INITIALIZER_BASE + node.intValue;
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, value);
            this.assembler.writeLEB128(array, value);
        }
        else if (node.kind == node_1.NodeKind.CALL) {
            let value = node.callValue();
            let symbol = value.symbol;
            assert_1.assert(symbol_1.isFunction(symbol.kind));
            // Write out the implicit "this" argument
            if (!symbol.node.isExternalImport() && symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE) {
                let dotTarget = value.dotTarget();
                this.emitNode(array, byteOffset, dotTarget);
                if (dotTarget.kind == node_1.NodeKind.NEW) {
                    this.emitInstance(array, byteOffset, dotTarget);
                }
            }
            let child = value.nextSibling;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }
            let wasmFunctionName = getWasmFunctionName(symbol);
            if (builtins_helper_1.isBuiltin(wasmFunctionName)) {
                this.assembler.appendOpcode(array, byteOffset, builtins_helper_1.getBuiltinOpcode(symbol.name));
            }
            else {
                let callIndex = this.getWasmFunctionCallIndex(symbol);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL, callIndex);
                this.assembler.writeUnsignedLEB128(array, callIndex);
            }
        }
        else if (node.kind == node_1.NodeKind.NEW) {
            this.emitInstance(array, byteOffset, node);
        }
        else if (node.kind == node_1.NodeKind.DELETE) {
            let value = node.deleteValue();
            this.emitNode(array, byteOffset, value);
            let freeIndex = this.calculateWasmFunctionIndex(this.freeFunctionIndex);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL, freeIndex);
            this.assembler.writeUnsignedLEB128(array, freeIndex);
        }
        else if (node.kind == node_1.NodeKind.POSITIVE) {
            this.emitNode(array, byteOffset, node.unaryValue());
        }
        else if (node.kind == node_1.NodeKind.NEGATIVE) {
            let resolvedType = node.unaryValue().resolvedType;
            if (resolvedType.isFloat()) {
                this.emitNode(array, byteOffset, node.unaryValue());
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_NEG);
            }
            else if (resolvedType.isDouble()) {
                this.emitNode(array, byteOffset, node.unaryValue());
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_NEG);
            }
            else if (resolvedType.isInteger()) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, 0);
                this.assembler.writeLEB128(array, 0);
                this.emitNode(array, byteOffset, node.unaryValue());
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_SUB);
            }
            else if (resolvedType.isLong()) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, 0);
                this.assembler.writeLEB128(array, 0);
                this.emitNode(array, byteOffset, node.unaryValue());
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_SUB);
            }
        }
        else if (node.kind == node_1.NodeKind.COMPLEMENT) {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, ~0);
            this.assembler.writeLEB128(array, ~0);
            this.emitNode(array, byteOffset, node.unaryValue());
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_XOR);
        }
        else if (node.kind == node_1.NodeKind.NOT) {
            this.emitNode(array, byteOffset, node.unaryValue());
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_EQZ);
        }
        else if (node.kind == node_1.NodeKind.CAST) {
            let value = node.castValue();
            let context = this.context;
            let from = value.resolvedType.underlyingType(context);
            let type = node.resolvedType.underlyingType(context);
            let fromSize = from.variableSizeOf(context);
            let typeSize = type.variableSizeOf(context);
            //FIXME: Handle 8,16 bit integer to float casting
            // Sign-extend
            // if (
            //     from == context.int32Type &&
            //     type == context.int8Type || type == context.int16Type
            // ) {
            //     let shift = 32 - typeSize * 8;
            //     this.emitNode(array, byteOffset, value);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            //     log(array, byteOffset, shift, "i32 literal");
            //     this.assembler.writeLEB128(array, shift);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_SHR_S);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            //     log(array, byteOffset, shift, "i32 literal");
            //     this.assembler.writeLEB128(array, shift);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
            // }
            //
            // // Mask
            // else if (
            //     from == context.int32Type || from == context.uint32Type &&
            //     type == context.uint8Type || type == context.uint16Type
            // ) {
            //     this.emitNode(array, byteOffset, value);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            //     let _value = type.integerBitMask(this.context);
            //     log(array, byteOffset, _value, "i32 literal");
            //     this.assembler.writeLEB128(array, _value);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_AND);
            // }
            // --- 32 bit Integer casting ---
            // i32 > i64
            if ((from == context.nullType || from == context.int32Type || from == context.uint32Type) &&
                (type == context.int64Type || type == context.uint64Type)) {
                if (value.kind == node_1.NodeKind.NULL) {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, 0);
                    this.assembler.writeLEB128(array, 0);
                }
                else if (value.kind == node_1.NodeKind.INT32) {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, value.longValue);
                    this.assembler.writeLEB128(array, value.longValue);
                }
                else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I64_EXTEND_U_I32 : opcode_1.WasmOpcode.I64_EXTEND_S_I32);
                }
            }
            else if ((from == context.nullType || from == context.int32Type || from == context.uint32Type) &&
                type == context.float32Type) {
                if (value.kind == node_1.NodeKind.NULL) {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, 0);
                    this.assembler.writeFloat(array, 0);
                }
                else if (value.kind == node_1.NodeKind.INT32) {
                    let floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(array, floatValue);
                }
                else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F32_CONVERT_U_I32 : opcode_1.WasmOpcode.F32_CONVERT_S_I32);
                }
            }
            else if ((from == context.nullType || from == context.int32Type || from == context.uint32Type) &&
                type == context.float64Type) {
                if (value.kind == node_1.NodeKind.NULL) {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, 0);
                    this.assembler.writeDouble(array, 0);
                }
                else if (value.kind == node_1.NodeKind.INT32) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(array, doubleValue);
                }
                else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F64_CONVERT_U_I32 : opcode_1.WasmOpcode.F64_CONVERT_S_I32);
                }
            }
            else if ((from == context.int64Type || from == context.uint64Type) &&
                (type == context.int32Type || type == context.uint32Type)) {
                if (value.kind == node_1.NodeKind.INT64) {
                    let intValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(array, intValue);
                }
                else {
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_WRAP_I64);
                }
            }
            else if ((from == context.int64Type || from == context.uint64Type) &&
                type == context.float32Type) {
                if (value.kind == node_1.NodeKind.INT32) {
                    let floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(array, floatValue);
                }
                else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F32_CONVERT_U_I64 : opcode_1.WasmOpcode.F32_CONVERT_S_I64);
                }
            }
            else if ((from == context.int64Type || from == context.uint64Type) &&
                type == context.float64Type) {
                if (value.kind == node_1.NodeKind.INT64) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(array, doubleValue);
                }
                else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F64_CONVERT_U_I64 : opcode_1.WasmOpcode.F64_CONVERT_S_I64);
                }
            }
            else if (from == context.float32Type &&
                (type == context.uint8Type || type == context.int8Type ||
                    type == context.uint16Type || type == context.int16Type ||
                    type == context.uint32Type || type == context.int32Type)) {
                if (value.kind == node_1.NodeKind.FLOAT32) {
                    let intValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(array, intValue);
                }
                else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I32_TRUNC_U_F32 : opcode_1.WasmOpcode.I32_TRUNC_S_F32);
                }
            }
            else if (from == context.float32Type &&
                (type == context.int64Type || type == context.uint64Type)) {
                if (value.kind == node_1.NodeKind.FLOAT32) {
                    let longValue = value.longValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, longValue);
                    this.assembler.writeLEB128(array, longValue);
                }
                else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I64_TRUNC_U_F32 : opcode_1.WasmOpcode.I64_TRUNC_S_F32);
                }
            }
            else if (from == context.float32Type && type == context.float64Type) {
                if (value.kind == node_1.NodeKind.FLOAT32) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(array, doubleValue);
                }
                else {
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_PROMOTE_F32);
                }
            }
            else if (from == context.float64Type &&
                (type == context.uint8Type || type == context.int8Type ||
                    type == context.uint16Type || type == context.int16Type ||
                    type == context.uint32Type || type == context.int32Type)) {
                if (value.kind == node_1.NodeKind.FLOAT64) {
                    let intValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(array, intValue);
                }
                else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I32_TRUNC_U_F64 : opcode_1.WasmOpcode.I32_TRUNC_S_F64);
                }
            }
            else if (from == context.float64Type &&
                (type == context.int64Type || type == context.uint64Type)) {
                if (value.kind == node_1.NodeKind.FLOAT64) {
                    let longValue = value.longValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, longValue);
                    this.assembler.writeLEB128(array, longValue);
                }
                else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I64_TRUNC_U_F64 : opcode_1.WasmOpcode.I64_TRUNC_S_F64);
                }
            }
            else if (from == context.float64Type && type == context.float32Type) {
                if (value.kind == node_1.NodeKind.FLOAT64) {
                    let floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(array, floatValue);
                }
                else {
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_DEMOTE_F64);
                }
            }
            else {
                this.emitNode(array, byteOffset, value);
            }
        }
        else if (node.kind == node_1.NodeKind.DOT) {
            let symbol = node.symbol;
            if (symbol.kind == symbol_1.SymbolKind.VARIABLE_INSTANCE) {
                this.emitLoadFromMemory(array, byteOffset, symbol.resolvedType, node.dotTarget(), symbol.offset);
            }
            else {
                assert_1.assert(false);
            }
        }
        else if (node.kind == node_1.NodeKind.ASSIGN) {
            let left = node.binaryLeft();
            let right = node.binaryRight();
            let symbol = left.symbol;
            if (left.kind == node_1.NodeKind.DEREFERENCE) {
                this.emitStoreToMemory(array, byteOffset, left.resolvedType.underlyingType(this.context), left.unaryValue(), 0, right);
            }
            else if (symbol.kind == symbol_1.SymbolKind.VARIABLE_INSTANCE) {
                this.emitStoreToMemory(array, byteOffset, symbol.resolvedType, left.dotTarget(), symbol.offset, right);
            }
            else if (symbol.kind == symbol_1.SymbolKind.VARIABLE_GLOBAL) {
                this.emitNode(array, byteOffset, right);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_GLOBAL);
                this.assembler.writeUnsignedLEB128(array, symbol.offset);
                // this.emitStoreToMemory(array, byteOffset, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset, right);
            }
            else if (symbol.kind == symbol_1.SymbolKind.VARIABLE_ARGUMENT || symbol.kind == symbol_1.SymbolKind.VARIABLE_LOCAL) {
                this.emitNode(array, byteOffset, right);
                if (!node_1.isUnaryPostfix(right.kind)) {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL, symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, symbol.offset);
                }
            }
            else {
                assert_1.assert(false);
            }
        }
        else if (node.kind == node_1.NodeKind.LOGICAL_AND) {
            this.emitNode(array, byteOffset, node.binaryLeft());
            this.emitNode(array, byteOffset, node.binaryRight());
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_AND);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, 1);
            this.assembler.writeLEB128(array, 1);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_EQ);
        }
        else if (node.kind == node_1.NodeKind.LOGICAL_OR) {
            this.emitNode(array, byteOffset, node.binaryLeft());
            this.emitNode(array, byteOffset, node.binaryRight());
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_OR);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST);
            logger_1.log(array, byteOffset, 1, "i32 literal");
            this.assembler.writeLEB128(array, 1);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_EQ);
        }
        else if (node_1.isUnary(node.kind)) {
            let kind = node.kind;
            if (kind == node_1.NodeKind.POSTFIX_INCREMENT || kind == node_1.NodeKind.POSTFIX_DECREMENT) {
                let value = node.unaryValue();
                let dataType = typeToDataType(value.resolvedType, this.bitness);
                //TODO handle instance variable
                if (node.parent.kind == node_1.NodeKind.VARIABLE) {
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL, node.parent.symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, node.parent.symbol.offset);
                }
                else if (node.parent.kind == node_1.NodeKind.ASSIGN) {
                    this.emitNode(array, byteOffset, value);
                    let left = node.parent.binaryLeft();
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL, left.symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, left.symbol.offset);
                }
                this.emitNode(array, byteOffset, value);
                if (node.parent.kind != node_1.NodeKind.RETURN) {
                    assert_1.assert(value.resolvedType.isInteger() || value.resolvedType.isLong() ||
                        value.resolvedType.isFloat() || value.resolvedType.isDouble());
                    let size = value.resolvedType.pointerTo ?
                        value.resolvedType.pointerTo.allocationSizeOf(this.context) :
                        value.resolvedType.allocationSizeOf(this.context);
                    if (size == 1 || size == 2) {
                        if (value.kind == node_1.NodeKind.INT32 || value.resolvedType.isInteger()) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, 1);
                            this.assembler.writeLEB128(array, 1);
                        }
                        else {
                            console.error("Wrong type");
                        }
                    }
                    else if (size == 4) {
                        if (value.kind == node_1.NodeKind.INT32 || value.resolvedType.isInteger()) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, 1);
                            this.assembler.writeLEB128(array, 1);
                        }
                        else if (value.kind == node_1.NodeKind.FLOAT32 || value.resolvedType.isFloat()) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, 1.0);
                            this.assembler.writeFloat(array, 1);
                        }
                        else {
                            console.error("Wrong type");
                        }
                    }
                    else if (size == 8) {
                        if (value.kind == node_1.NodeKind.INT64 || value.resolvedType.isLong()) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, 1);
                            this.assembler.writeLEB128(array, 1);
                        }
                        else if (value.kind == node_1.NodeKind.FLOAT64 || value.resolvedType.isDouble()) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, 1.0);
                            this.assembler.writeDouble(array, 1);
                        }
                        else {
                            console.error("Wrong type");
                        }
                    }
                    //TODO extend to other operations
                    let operation = kind == node_1.NodeKind.POSTFIX_INCREMENT ? "ADD" : "SUB";
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode[`${dataType}_${operation}`]);
                    if (value.symbol.kind == symbol_1.SymbolKind.VARIABLE_GLOBAL) {
                        this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_GLOBAL, value.symbol.offset);
                        this.assembler.writeLEB128(array, value.symbol.offset);
                    }
                    else if (value.symbol.kind == symbol_1.SymbolKind.VARIABLE_LOCAL || value.symbol.kind == symbol_1.SymbolKind.VARIABLE_ARGUMENT) {
                        this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL, value.symbol.offset);
                        this.assembler.writeLEB128(array, value.symbol.offset);
                    }
                    else if (value.symbol.kind == symbol_1.SymbolKind.VARIABLE_INSTANCE) {
                        //FIXME
                        //this.emitStoreToMemory(array, byteOffset, value.symbol.resolvedType, value.dotTarget(), value.symbol.offset, node);
                    }
                }
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
            if (node.kind == node_1.NodeKind.ADD) {
                this.emitNode(array, byteOffset, left);
                if (left.resolvedType.pointerTo == null) {
                    this.emitNode(array, byteOffset, right);
                }
                else {
                    assert_1.assert(right.resolvedType.isInteger() || right.resolvedType.isLong() ||
                        right.resolvedType.isFloat() || right.resolvedType.isDouble());
                    let size = left.resolvedType.pointerTo.allocationSizeOf(this.context);
                    if (size == 2) {
                        if (right.kind == node_1.NodeKind.INT32) {
                            let _value = right.intValue << 1;
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, _value);
                            this.assembler.writeLEB128(array, _value);
                        }
                        else {
                            this.emitNode(array, byteOffset, right);
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, 1);
                            this.assembler.writeLEB128(array, 1);
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_SHL);
                        }
                    }
                    else if (size == 4) {
                        if (right.kind == node_1.NodeKind.INT32) {
                            let _value = right.intValue << 2;
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, _value);
                            this.assembler.writeLEB128(array, _value);
                        }
                        else if (right.kind == node_1.NodeKind.FLOAT32) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, right.floatValue);
                            this.assembler.writeFloat(array, right.floatValue);
                        }
                        else {
                            this.emitNode(array, byteOffset, right);
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, 2);
                            this.assembler.writeLEB128(array, 2);
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_SHL);
                        }
                    }
                    else if (size == 8) {
                        if (right.kind == node_1.NodeKind.INT64) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, right.longValue);
                            this.assembler.writeLEB128(array, right.longValue);
                        }
                        else if (right.kind == node_1.NodeKind.FLOAT64) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, right.doubleValue);
                            this.assembler.writeDouble(array, right.doubleValue);
                        }
                    }
                    else {
                        this.emitNode(array, byteOffset, right);
                    }
                }
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode[`${dataTypeLeft}_ADD`]);
            }
            else if (node.kind == node_1.NodeKind.BITWISE_AND) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_AND`]);
            }
            else if (node.kind == node_1.NodeKind.BITWISE_OR) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_OR`]);
            }
            else if (node.kind == node_1.NodeKind.BITWISE_XOR) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_XOR`]);
            }
            else if (node.kind == node_1.NodeKind.EQUAL) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_EQ`]);
            }
            else if (node.kind == node_1.NodeKind.MULTIPLY) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_MUL`]);
            }
            else if (node.kind == node_1.NodeKind.NOT_EQUAL) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_NE`]);
            }
            else if (node.kind == node_1.NodeKind.SHIFT_LEFT) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_SHL`]);
            }
            else if (node.kind == node_1.NodeKind.SUBTRACT) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[`${dataTypeLeft}_SUB`]);
            }
            else if (node.kind == node_1.NodeKind.DIVIDE) {
                let opcode = (isFloat || isDouble) ?
                    opcode_1.WasmOpcode[`${dataTypeLeft}_DIV`] :
                    (isUnsigned ? opcode_1.WasmOpcode[`${dataTypeLeft}_DIV_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_DIV_S`]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }
            else if (node.kind == node_1.NodeKind.GREATER_THAN) {
                let opcode = (isFloat || isDouble) ?
                    opcode_1.WasmOpcode[`${dataTypeLeft}_GT`] :
                    (isUnsigned ? opcode_1.WasmOpcode[`${dataTypeLeft}_GT_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_GT_S`]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }
            else if (node.kind == node_1.NodeKind.GREATER_THAN_EQUAL) {
                let opcode = (isFloat || isDouble) ?
                    opcode_1.WasmOpcode[`${dataTypeLeft}_GE`] :
                    (isUnsigned ? opcode_1.WasmOpcode[`${dataTypeLeft}_GE_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_GE_S`]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }
            else if (node.kind == node_1.NodeKind.LESS_THAN) {
                let opcode = (isFloat || isDouble) ?
                    opcode_1.WasmOpcode[`${dataTypeLeft}_LT`] :
                    (isUnsigned ? opcode_1.WasmOpcode[`${dataTypeLeft}_LT_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_LT_S`]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }
            else if (node.kind == node_1.NodeKind.LESS_THAN_EQUAL) {
                let opcode = (isFloat || isDouble) ?
                    opcode_1.WasmOpcode[`${dataTypeLeft}_LE`] :
                    (isUnsigned ? opcode_1.WasmOpcode[`${dataTypeLeft}_LE_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_LE_S`]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }
            else if (node.kind == node_1.NodeKind.REMAINDER) {
                this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                    opcode_1.WasmOpcode[`${dataTypeLeft}_REM_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_REM_S`]);
            }
            else if (node.kind == node_1.NodeKind.SHIFT_RIGHT) {
                this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                    opcode_1.WasmOpcode[`${dataTypeLeft}_SHR_U`] : opcode_1.WasmOpcode[`${dataTypeLeft}_SHR_S`]);
            }
            else {
                assert_1.assert(false);
            }
        }
        return 1;
    }
    calculateWasmFunctionIndex(index) {
        return this.importCount + index;
    }
    getWasmFunctionCallIndex(symbol) {
        return symbol.node.isExternalImport() ? symbol.offset : this.importCount + symbol.offset;
    }
    getWasmType(type) {
        let context = this.context;
        if (type == context.booleanType || type.isClass() || type.isInteger() || (this.bitness == bitness_1.Bitness.x32 && type.isReference())) {
            return wasm_type_1.WasmType.I32;
        }
        else if (type.isLong() || (this.bitness == bitness_1.Bitness.x64 && type.isReference())) {
            return wasm_type_1.WasmType.I64;
        }
        else if (type.isDouble()) {
            return wasm_type_1.WasmType.F64;
        }
        else if (type.isFloat()) {
            return wasm_type_1.WasmType.F32;
        }
        if (type == context.voidType) {
            return wasm_type_1.WasmType.VOID;
        }
        assert_1.assert(false);
        return wasm_type_1.WasmType.VOID;
    }
}
function getWasmFunctionName(symbol) {
    let moduleName = symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE ? symbol.parent().internalName : "";
    return (moduleName == "" ? "" : moduleName + "_") + symbol.internalName;
}
function wasmWrapType(id) {
    assert_1.assert(id == wasm_type_1.WasmType.VOID || id == wasm_type_1.WasmType.I32 || id == wasm_type_1.WasmType.I64 || id == wasm_type_1.WasmType.F32 || id == wasm_type_1.WasmType.F64);
    let type = new wasm_type_1.WasmWrappedType();
    type.id = id;
    return type;
}
function symbolToValueType(symbol, bitness) {
    let type = symbol.resolvedType;
    if (type.isFloat()) {
        return wasm_type_1.WasmType.F32;
    }
    else if (type.isDouble()) {
        return wasm_type_1.WasmType.F64;
    }
    else if (type.isInteger() || (bitness == bitness_1.Bitness.x32 && type.pointerTo)) {
        return wasm_type_1.WasmType.I32;
    }
    else if (type.isLong() || (bitness == bitness_1.Bitness.x64 && type.pointerTo)) {
        return wasm_type_1.WasmType.I64;
    }
    else {
        return wasm_type_1.WasmType.I32;
    }
}
function typeToDataType(type, bitness) {
    if (type.isFloat()) {
        return "F32";
    }
    else if (type.isDouble()) {
        return "F64";
    }
    else if (type.isInteger() || (bitness == bitness_1.Bitness.x32 && type.pointerTo)) {
        return "I32";
    }
    else if (type.isLong() || (bitness == bitness_1.Bitness.x64 && type.pointerTo)) {
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
function wasmAssignLocalVariableOffsets(fn, node, shared, bitness) {
    if (node.kind == node_1.NodeKind.VARIABLE) {
        assert_1.assert(node.symbol.kind == symbol_1.SymbolKind.VARIABLE_LOCAL);
        node.symbol.offset = shared.nextLocalOffset;
        shared.nextLocalOffset = shared.nextLocalOffset + 1;
        shared.localCount = shared.localCount + 1;
        let local = new wasm_local_1.WasmLocal();
        local.symbol = node.symbol;
        local.type = symbolToValueType(local.symbol, bitness);
        if (fn.firstLocal == null)
            fn.firstLocal = local;
        else
            fn.lastLocal.next = local;
        fn.lastLocal = local;
        fn.localEntries.push(local.type);
    }
    let child = node.firstChild;
    while (child != null) {
        wasmAssignLocalVariableOffsets(fn, child, shared, bitness);
        child = child.nextSibling;
    }
}
function wasmEmit(compiler, bitness = bitness_1.Bitness.x32) {
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
    module.assembler.sealFunctions();
    // The standard library must be included
    // assert(module.mallocFunctionIndex != -1);
    // assert(module.freeFunctionIndex != -1);
    // assert(module.currentHeapPointer != -1);
    // assert(module.originalHeapPointer != -1);
    // module.mallocFunctionIndex += module.importCount;
    // module.freeFunctionIndex += module.importCount;
    compiler.outputWASM = new bytearray_1.ByteArray();
    module.emitModule(compiler.outputWASM);
}
exports.wasmEmit = wasmEmit;


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const symbol_1 = __webpack_require__(4);
const type_1 = __webpack_require__(17);
const node_1 = __webpack_require__(3);
const compile_target_1 = __webpack_require__(6);
const log_1 = __webpack_require__(2);
const scope_1 = __webpack_require__(16);
const stringbuilder_1 = __webpack_require__(1);
const utils_1 = __webpack_require__(5);
const const_1 = __webpack_require__(45);
const assert_1 = __webpack_require__(0);
const compiler_1 = __webpack_require__(9);
/**
 * Author : Nidin Vinayakan
 */
class CheckContext {
    allocateGlobalVariableOffset(sizeOf, alignmentOf) {
        let offset = utils_1.alignToNextMultipleOf(this.nextGlobalVariableOffset, alignmentOf);
        this.nextGlobalVariableOffset = offset + sizeOf;
        return offset;
    }
}
exports.CheckContext = CheckContext;
function addScopeToSymbol(symbol, parentScope) {
    let scope = new scope_1.Scope();
    scope.parent = parentScope;
    scope.symbol = symbol;
    symbol.scope = scope;
}
exports.addScopeToSymbol = addScopeToSymbol;
function linkSymbolToNode(symbol, node) {
    node.symbol = symbol;
    node.scope = symbol.scope;
    symbol.range = node.internalRange != null ? node.internalRange : node.range;
    symbol.node = node;
}
exports.linkSymbolToNode = linkSymbolToNode;
var CheckMode;
(function (CheckMode) {
    CheckMode[CheckMode["NORMAL"] = 0] = "NORMAL";
    CheckMode[CheckMode["INITIALIZE"] = 1] = "INITIALIZE";
})(CheckMode = exports.CheckMode || (exports.CheckMode = {}));
function initialize(context, node, parentScope, mode) {
    let kind = node.kind;
    if (node.parent != null) {
        let parentKind = node.parent.kind;
        // Validate node placement
        if (kind != node_1.NodeKind.IMPORTS &&
            kind != node_1.NodeKind.VARIABLE &&
            kind != node_1.NodeKind.VARIABLES &&
            (kind != node_1.NodeKind.FUNCTION || parentKind != node_1.NodeKind.CLASS) &&
            (parentKind == node_1.NodeKind.FILE || parentKind == node_1.NodeKind.GLOBAL) != (parentKind == node_1.NodeKind.MODULE ||
                kind == node_1.NodeKind.MODULE ||
                kind == node_1.NodeKind.CLASS ||
                kind == node_1.NodeKind.ENUM ||
                kind == node_1.NodeKind.FUNCTION ||
                kind == node_1.NodeKind.CONSTANTS)) {
            context.log.error(node.range, "This statement is not allowed here");
        }
    }
    // Module
    if (kind == node_1.NodeKind.MODULE) {
        assert_1.assert(node.symbol == null);
        let symbol = new symbol_1.Symbol();
        symbol.kind = symbol_1.SymbolKind.TYPE_MODULE;
        symbol.name = node.stringValue;
        symbol.resolvedType = new type_1.Type();
        symbol.resolvedType.symbol = symbol;
        symbol.flags = symbol_1.SYMBOL_FLAG_IS_REFERENCE;
        addScopeToSymbol(symbol, parentScope);
        linkSymbolToNode(symbol, node);
        parentScope.define(context.log, symbol, scope_1.ScopeHint.NORMAL);
        parentScope = symbol.scope;
    }
    // Class
    if (kind == node_1.NodeKind.CLASS || kind == node_1.NodeKind.ENUM) {
        assert_1.assert(node.symbol == null);
        let symbol = new symbol_1.Symbol();
        symbol.kind = kind == node_1.NodeKind.CLASS ? symbol_1.SymbolKind.TYPE_CLASS : symbol_1.SymbolKind.TYPE_ENUM;
        symbol.name = node.stringValue;
        symbol.resolvedType = new type_1.Type();
        symbol.resolvedType.symbol = symbol;
        symbol.flags = symbol_1.SYMBOL_FLAG_IS_REFERENCE;
        addScopeToSymbol(symbol, parentScope);
        linkSymbolToNode(symbol, node);
        parentScope.define(context.log, symbol, scope_1.ScopeHint.NORMAL);
        parentScope = symbol.scope;
        if (node.parameterCount() > 0) {
            //Class has generic parameters. convert it to class template
            symbol.kind = symbol_1.SymbolKind.TYPE_TEMPLATE;
            symbol.flags |= symbol_1.SYMBOL_FLAG_IS_TEMPLATE;
            //TODO: Lift generic parameter limit from 1 to many
            let genericType = node.firstGenericType();
            let genericSymbol = new symbol_1.Symbol();
            genericSymbol.kind = symbol_1.SymbolKind.TYPE_GENERIC;
            genericSymbol.name = genericType.stringValue;
            genericSymbol.resolvedType = new type_1.Type();
            genericSymbol.resolvedType.symbol = genericSymbol;
            genericSymbol.flags = symbol_1.SYMBOL_FLAG_IS_GENERIC;
            genericType.flags = node_1.NODE_FLAG_GENERIC;
            addScopeToSymbol(genericSymbol, parentScope);
            linkSymbolToNode(genericSymbol, genericType);
            parentScope.define(context.log, genericSymbol, scope_1.ScopeHint.NORMAL);
        }
    }
    else if (kind == node_1.NodeKind.FUNCTION) {
        assert_1.assert(node.symbol == null);
        let symbol = new symbol_1.Symbol();
        symbol.kind =
            node.parent.kind == node_1.NodeKind.CLASS ? symbol_1.SymbolKind.FUNCTION_INSTANCE :
                symbol_1.SymbolKind.FUNCTION_GLOBAL;
        symbol.name = node.stringValue;
        if (node.isOperator()) {
            if (symbol.name == "+" || symbol.name == "-") {
                if (node.functionFirstArgument() == node.functionReturnType()) {
                    symbol.flags = symbol_1.SYMBOL_FLAG_IS_UNARY_OPERATOR;
                    symbol.rename = symbol.name == "+" ? "op_positive" : "op_negative";
                }
                else {
                    symbol.flags = symbol_1.SYMBOL_FLAG_IS_BINARY_OPERATOR;
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
            symbol.rename = "_ctr";
        }
        addScopeToSymbol(symbol, parentScope);
        linkSymbolToNode(symbol, node);
        parentScope.define(context.log, symbol, symbol.isSetter() ? scope_1.ScopeHint.NOT_GETTER :
            symbol.isGetter() ? scope_1.ScopeHint.NOT_SETTER :
                symbol.isBinaryOperator() ? scope_1.ScopeHint.NOT_UNARY :
                    symbol.isUnaryOperator() ? scope_1.ScopeHint.NOT_BINARY :
                        scope_1.ScopeHint.NORMAL);
        parentScope = symbol.scope;
        // All instance functions have a special "this" type
        if (symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE) {
            let parent = symbol.parent();
            initializeSymbol(context, parent);
            if (symbol.name == "constructor") {
                let body = node.functionBody();
                if (body !== null) {
                    let variablesNode = body.firstChild;
                    if (variablesNode.kind !== node_1.NodeKind.VARIABLES) {
                        let _variablesNode = node_1.createVariables();
                        body.insertChildBefore(variablesNode, _variablesNode);
                        variablesNode = _variablesNode;
                    }
                    let firstVariable = variablesNode.firstChild;
                    if (firstVariable !== undefined) {
                        if (firstVariable.stringValue !== "this") {
                            variablesNode.insertChildBefore(firstVariable, node_1.createVariable("this", node_1.createType(parent.resolvedType), null));
                        }
                        else if (firstVariable.stringValue === "this" && firstVariable.firstChild.resolvedType === undefined) {
                            firstVariable.firstChild.resolvedType = parent.resolvedType;
                        }
                    }
                    else {
                        variablesNode.appendChild(node_1.createVariable("this", node_1.createType(parent.resolvedType), null));
                    }
                    // All constructors have special return "this" type
                    let returnNode = node_1.createReturn(node_1.createName("this"));
                    if (node.lastChild.lastChild && node.lastChild.lastChild.kind == node_1.NodeKind.RETURN) {
                        node.lastChild.lastChild.remove();
                    }
                    node.lastChild.appendChild(returnNode);
                }
            }
            else {
                let firstArgument = node.functionFirstArgument();
                if (firstArgument.stringValue !== "this") {
                    node.insertChildBefore(firstArgument, node_1.createVariable("this", node_1.createType(parent.resolvedType), null));
                }
                else if (firstArgument.stringValue === "this" && firstArgument.firstChild.resolvedType === undefined) {
                    firstArgument.firstChild.resolvedType = parent.resolvedType;
                }
            }
        }
    }
    else if (kind == node_1.NodeKind.VARIABLE) {
        assert_1.assert(node.symbol == null);
        let symbol = new symbol_1.Symbol();
        symbol.kind =
            node.parent.kind == node_1.NodeKind.CLASS ? symbol_1.SymbolKind.VARIABLE_INSTANCE :
                node.parent.kind == node_1.NodeKind.FUNCTION ? symbol_1.SymbolKind.VARIABLE_ARGUMENT :
                    node.parent.kind == node_1.NodeKind.CONSTANTS || node.parent.kind == node_1.NodeKind.ENUM ? symbol_1.SymbolKind.VARIABLE_CONSTANT :
                        node.parent.kind == node_1.NodeKind.VARIABLES && node.parent.parent.kind == node_1.NodeKind.FILE ? symbol_1.SymbolKind.VARIABLE_GLOBAL :
                            symbol_1.SymbolKind.VARIABLE_LOCAL;
        symbol.name = node.stringValue;
        symbol.scope = parentScope;
        linkSymbolToNode(symbol, node);
        parentScope.define(context.log, symbol, scope_1.ScopeHint.NORMAL);
    }
    else if (kind == node_1.NodeKind.BLOCK) {
        if (node.parent.kind != node_1.NodeKind.FUNCTION) {
            let scope = new scope_1.Scope();
            scope.parent = parentScope;
            parentScope = scope;
        }
        node.scope = parentScope;
    }
    // Children
    let child = node.firstChild;
    while (child != null) {
        if (mode == CheckMode.INITIALIZE) {
            child.flags |= node_1.NODE_FLAG_LIBRARY;
        }
        initialize(context, child, parentScope, mode);
        child = child.nextSibling;
    }
    if (kind == node_1.NodeKind.FILE && mode == CheckMode.INITIALIZE) {
        context.booleanType = parentScope.findLocal("boolean", scope_1.ScopeHint.NORMAL).resolvedType;
        context.uint8Type = parentScope.findLocal("uint8", scope_1.ScopeHint.NORMAL).resolvedType;
        context.int32Type = parentScope.findLocal("int32", scope_1.ScopeHint.NORMAL).resolvedType;
        context.int64Type = parentScope.findLocal("int64", scope_1.ScopeHint.NORMAL).resolvedType;
        context.int8Type = parentScope.findLocal("int8", scope_1.ScopeHint.NORMAL).resolvedType;
        context.int16Type = parentScope.findLocal("int16", scope_1.ScopeHint.NORMAL).resolvedType;
        context.stringType = parentScope.findLocal("string", scope_1.ScopeHint.NORMAL).resolvedType;
        context.uint32Type = parentScope.findLocal("uint32", scope_1.ScopeHint.NORMAL).resolvedType;
        context.uint64Type = parentScope.findLocal("uint64", scope_1.ScopeHint.NORMAL).resolvedType;
        context.uint16Type = parentScope.findLocal("uint16", scope_1.ScopeHint.NORMAL).resolvedType;
        context.float32Type = parentScope.findLocal("float32", scope_1.ScopeHint.NORMAL).resolvedType;
        context.float64Type = parentScope.findLocal("float64", scope_1.ScopeHint.NORMAL).resolvedType;
        prepareNativeType(context.booleanType, 1, 0);
        prepareNativeType(context.uint8Type, 1, symbol_1.SYMBOL_FLAG_NATIVE_INTEGER | symbol_1.SYMBOL_FLAG_IS_UNSIGNED);
        prepareNativeType(context.int8Type, 1, symbol_1.SYMBOL_FLAG_NATIVE_INTEGER);
        prepareNativeType(context.int16Type, 2, symbol_1.SYMBOL_FLAG_NATIVE_INTEGER);
        prepareNativeType(context.uint16Type, 2, symbol_1.SYMBOL_FLAG_NATIVE_INTEGER | symbol_1.SYMBOL_FLAG_IS_UNSIGNED);
        prepareNativeType(context.int32Type, 4, symbol_1.SYMBOL_FLAG_NATIVE_INTEGER);
        prepareNativeType(context.int64Type, 8, symbol_1.SYMBOL_FLAG_NATIVE_LONG);
        prepareNativeType(context.uint32Type, 4, symbol_1.SYMBOL_FLAG_NATIVE_INTEGER | symbol_1.SYMBOL_FLAG_IS_UNSIGNED);
        prepareNativeType(context.uint64Type, 8, symbol_1.SYMBOL_FLAG_NATIVE_LONG | symbol_1.SYMBOL_FLAG_IS_UNSIGNED);
        prepareNativeType(context.stringType, 4, symbol_1.SYMBOL_FLAG_IS_REFERENCE);
        prepareNativeType(context.float32Type, 4, symbol_1.SYMBOL_FLAG_NATIVE_FLOAT);
        prepareNativeType(context.float64Type, 8, symbol_1.SYMBOL_FLAG_NATIVE_DOUBLE);
        //Prepare builtin types
        //context.arrayType = parentScope.findLocal("Array", ScopeHint.NORMAL).resolvedType;
        //prepareBuiltinType(context.arrayType, 0, SYMBOL_FLAG_IS_ARRAY); //byteSize will calculate later
    }
}
exports.initialize = initialize;
function prepareNativeType(type, byteSizeAndMaxAlignment, flags) {
    let symbol = type.symbol;
    symbol.kind = symbol_1.SymbolKind.TYPE_NATIVE;
    symbol.byteSize = byteSizeAndMaxAlignment;
    symbol.maxAlignment = byteSizeAndMaxAlignment;
    symbol.flags = flags;
}
function prepareBuiltinType(type, byteSizeAndMaxAlignment, flags) {
    let symbol = type.symbol;
    symbol.kind = symbol_1.SymbolKind.TYPE_CLASS;
    symbol.byteSize = byteSizeAndMaxAlignment;
    symbol.maxAlignment = byteSizeAndMaxAlignment;
    symbol.flags = flags;
}
function forbidFlag(context, node, flag, text) {
    if ((node.flags & flag) != 0) {
        let range = node_1.rangeForFlag(node.firstFlag, flag);
        if (range != null) {
            node.flags = node.flags & ~flag;
            context.log.error(range, text);
        }
    }
}
exports.forbidFlag = forbidFlag;
function requireFlag(context, node, flag, text) {
    if ((node.flags & flag) == 0) {
        node.flags = node.flags | flag;
        context.log.error(node.range, text);
    }
}
exports.requireFlag = requireFlag;
function initializeSymbol(context, symbol) {
    if (symbol.state == symbol_1.SymbolState.INITIALIZED) {
        assert_1.assert(symbol.resolvedType != null);
        return;
    }
    assert_1.assert(symbol.state == symbol_1.SymbolState.UNINITIALIZED);
    symbol.state = symbol_1.SymbolState.INITIALIZING;
    // Most flags aren't supported yet
    let node = symbol.node;
    // forbidFlag(context, node, NODE_FLAG_EXPORT, "Unsupported flag 'export'");
    forbidFlag(context, node, node_1.NODE_FLAG_PROTECTED, "Unsupported flag 'protected'");
    //forbidFlag(context, node, NODE_FLAG_STATIC, "Unsupported flag 'static'");
    // Module
    if (symbol.kind == symbol_1.SymbolKind.TYPE_MODULE) {
        forbidFlag(context, node, node_1.NODE_FLAG_GET, "Cannot use 'get' on a module");
        forbidFlag(context, node, node_1.NODE_FLAG_SET, "Cannot use 'set' on a module");
        forbidFlag(context, node, node_1.NODE_FLAG_PUBLIC, "Cannot use 'public' on a module");
        forbidFlag(context, node, node_1.NODE_FLAG_PRIVATE, "Cannot use 'private' on a module");
    }
    else if (symbol.kind == symbol_1.SymbolKind.TYPE_CLASS || symbol.kind == symbol_1.SymbolKind.TYPE_NATIVE ||
        symbol.kind == symbol_1.SymbolKind.TYPE_GENERIC || symbol.kind == symbol_1.SymbolKind.TYPE_TEMPLATE) {
        forbidFlag(context, node, node_1.NODE_FLAG_GET, "Cannot use 'get' on a class");
        forbidFlag(context, node, node_1.NODE_FLAG_SET, "Cannot use 'set' on a class");
        forbidFlag(context, node, node_1.NODE_FLAG_PUBLIC, "Cannot use 'public' on a class");
        forbidFlag(context, node, node_1.NODE_FLAG_PRIVATE, "Cannot use 'private' on a class");
    }
    else if (symbol.kind == symbol_1.SymbolKind.TYPE_INTERFACE) {
        forbidFlag(context, node, node_1.NODE_FLAG_GET, "Cannot use 'get' on a interface");
        forbidFlag(context, node, node_1.NODE_FLAG_SET, "Cannot use 'set' on a interface");
        forbidFlag(context, node, node_1.NODE_FLAG_PUBLIC, "Cannot use 'public' on a interface");
        forbidFlag(context, node, node_1.NODE_FLAG_PRIVATE, "Cannot use 'private' on a interface");
    }
    else if (symbol.kind == symbol_1.SymbolKind.TYPE_ENUM) {
        forbidFlag(context, node, node_1.NODE_FLAG_GET, "Cannot use 'get' on an enum");
        forbidFlag(context, node, node_1.NODE_FLAG_SET, "Cannot use 'set' on an enum");
        forbidFlag(context, node, node_1.NODE_FLAG_PUBLIC, "Cannot use 'public' on an enum");
        forbidFlag(context, node, node_1.NODE_FLAG_PRIVATE, "Cannot use 'private' on an enum");
        symbol.resolvedType = new type_1.Type();
        symbol.resolvedType.symbol = symbol;
        let underlyingSymbol = symbol.resolvedType.underlyingType(context).symbol;
        symbol.byteSize = underlyingSymbol.byteSize;
        symbol.maxAlignment = underlyingSymbol.maxAlignment;
    }
    else if (symbol_1.isFunction(symbol.kind)) {
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
            assert_1.assert(child.kind == node_1.NodeKind.VARIABLE);
            assert_1.assert(child.symbol.kind == symbol_1.SymbolKind.VARIABLE_ARGUMENT);
            initializeSymbol(context, child.symbol);
            child.symbol.offset = argumentCount;
            argumentCount = argumentCount + 1;
            child = child.nextSibling;
        }
        if (symbol.kind != symbol_1.SymbolKind.FUNCTION_INSTANCE) {
            forbidFlag(context, node, node_1.NODE_FLAG_GET, "Cannot use 'get' here");
            forbidFlag(context, node, node_1.NODE_FLAG_SET, "Cannot use 'set' here");
            forbidFlag(context, node, node_1.NODE_FLAG_PUBLIC, "Cannot use 'public' here");
            forbidFlag(context, node, node_1.NODE_FLAG_PRIVATE, "Cannot use 'private' here");
        }
        else if (node.isGet()) {
            forbidFlag(context, node, node_1.NODE_FLAG_SET, "Cannot use both 'get' and 'set'");
            // Validate argument count including "this"
            if (argumentCount != 1) {
                context.log.error(symbol.range, "Getters must not have any arguments");
            }
        }
        else if (node.isSet()) {
            symbol.rename = stringbuilder_1.StringBuilder_new()
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
                    context.log.error(symbol.range, stringbuilder_1.StringBuilder_new()
                        .append("Operator '")
                        .append(symbol.name)
                        .append("' must not have any arguments")
                        .finish());
                }
            }
            else if (symbol.name == "+" || symbol.name == "-") {
                if (argumentCount > 2) {
                    context.log.error(symbol.range, stringbuilder_1.StringBuilder_new()
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
                context.log.error(symbol.range, stringbuilder_1.StringBuilder_new()
                    .append("Operator '")
                    .append(symbol.name)
                    .append("' must have exactly one argument")
                    .finish());
            }
        }
        symbol.resolvedType = new type_1.Type();
        symbol.resolvedType.symbol = symbol;
        if (symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE) {
            let parent = symbol.parent();
            let shouldConvertInstanceToGlobal = false;
            forbidFlag(context, node, node_1.NODE_FLAG_EXPORT, "Cannot use 'export' on an instance function");
            forbidFlag(context, node, node_1.NODE_FLAG_DECLARE, "Cannot use 'declare' on an instance function");
            // Functions inside declared classes are automatically declared
            if (parent.node.isDeclare()) {
                if (body == null) {
                    node.flags = node.flags | node_1.NODE_FLAG_DECLARE;
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
                    node.flags = node.flags | node_1.NODE_FLAG_EXPORT;
                }
            }
            // Rewrite this symbol as a global function instead of an instance function
            if (shouldConvertInstanceToGlobal) {
                symbol.kind = symbol_1.SymbolKind.FUNCTION_GLOBAL;
                symbol.flags = symbol.flags | symbol_1.SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL;
                symbol.rename = stringbuilder_1.StringBuilder_new()
                    .append(parent.name)
                    .appendChar('_')
                    .append(symbol.rename != null ? symbol.rename : symbol.name)
                    .finish();
                let argument = node.functionFirstArgument();
                assert_1.assert(argument.symbol.name == "this");
                argument.symbol.rename = "__this";
            }
        }
        else if (body == null) {
            forbidFlag(context, node, node_1.NODE_FLAG_EXPORT, "Cannot use 'export' on an unimplemented function");
            if (!node.parent || !node.parent.isDeclare()) {
                requireFlag(context, node, node_1.NODE_FLAG_DECLARE, "Declared functions must be prefixed with 'declare'");
            }
        }
        else {
            forbidFlag(context, node, node_1.NODE_FLAG_DECLARE, "Cannot use 'declare' on a function with an implementation");
        }
        context.isUnsafeAllowed = oldUnsafeAllowed;
    }
    else if (symbol_1.isVariable(symbol.kind)) {
        forbidFlag(context, node, node_1.NODE_FLAG_GET, "Cannot use 'get' on a variable");
        forbidFlag(context, node, node_1.NODE_FLAG_SET, "Cannot use 'set' on a variable");
        let type = node.variableType();
        let value = node.variableValue();
        let oldUnsafeAllowed = context.isUnsafeAllowed;
        context.isUnsafeAllowed = context.isUnsafeAllowed || node.isUnsafe();
        if (symbol.kind != symbol_1.SymbolKind.VARIABLE_INSTANCE) {
            forbidFlag(context, node, node_1.NODE_FLAG_PUBLIC, "Cannot use 'public' here");
            forbidFlag(context, node, node_1.NODE_FLAG_PRIVATE, "Cannot use 'private' here");
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
            context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
                .append("Cannot create a variable with type '")
                .append(symbol.resolvedType.toString())
                .appendChar('\'')
                .finish());
            symbol.resolvedType = context.errorType;
        }
        // Resolve constant values at initialization time
        if (symbol.kind == symbol_1.SymbolKind.VARIABLE_CONSTANT) {
            if (value != null) {
                resolveAsExpression(context, value, symbol.scope);
                checkConversion(context, value, symbol.resolvedTypeUnderlyingIfEnumValue(context), type_1.ConversionKind.IMPLICIT);
                if (value.kind == node_1.NodeKind.INT32 || value.kind == node_1.NodeKind.INT64 || value.kind == node_1.NodeKind.BOOLEAN) {
                    symbol.offset = value.intValue;
                }
                else if (value.kind == node_1.NodeKind.FLOAT32 || value.kind == node_1.NodeKind.FLOAT64) {
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
                let shadowed = scope.findLocal(symbol.name, scope_1.ScopeHint.NORMAL);
                if (shadowed != null) {
                    context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
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
        assert_1.assert(false);
    }
    assert_1.assert(symbol.resolvedType != null);
    symbol.state = symbol_1.SymbolState.INITIALIZED;
}
exports.initializeSymbol = initializeSymbol;
/**
 * Derive a concrete class from class template type
 * @param context
 * @param type
 * @param parameters
 * @param scope
 * @returns {Symbol}
 */
function deriveConcreteClass(context, type, parameters, scope) {
    let templateNode = type.resolvedType.pointerTo ? type.resolvedType.pointerTo.symbol.node : type.resolvedType.symbol.node;
    let templateName = templateNode.stringValue;
    let typeName = templateNode.stringValue + `<${parameters[0].stringValue}>`;
    let rename = templateNode.stringValue + `_${parameters[0].stringValue}`;
    let symbol = scope.parent.findNested(typeName, scope_1.ScopeHint.NORMAL, scope_1.FindNested.NORMAL);
    if (symbol) {
        // resolve(context, type.firstChild.firstChild, scope.parent);
        let genericSymbol = scope.parent.findNested(type.firstChild.firstChild.stringValue, scope_1.ScopeHint.NORMAL, scope_1.FindNested.NORMAL);
        type.firstChild.firstChild.symbol = genericSymbol;
        if (genericSymbol.resolvedType.pointerTo) {
            type.firstChild.firstChild.resolvedType = genericSymbol.resolvedType.pointerType();
        }
        else {
            type.firstChild.firstChild.resolvedType = genericSymbol.resolvedType;
        }
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
    node.symbol.flags |= symbol_1.SYMBOL_FLAG_USED;
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
    type.firstChild.firstChild.kind = node_1.NodeKind.NAME;
    resolve(context, type.firstChild.firstChild, scope.parent);
    type.stringValue = node.symbol.name;
    return;
}
function cloneChildren(child, parentNode, parameters, templateName, typeName) {
    let firstChildNode = null;
    let lastChildNode = null;
    while (child) {
        if (child.stringValue == "this" && child.parent.symbol &&
            child.parent.symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE && child.kind == node_1.NodeKind.TYPE) {
            child = child.nextSibling;
            continue;
        }
        let childNode;
        if (child.kind == node_1.NodeKind.PARAMETERS || child.kind == node_1.NodeKind.PARAMETER) {
            child = child.nextSibling;
            continue;
        }
        if (child.isGeneric()) {
            let offset = child.offset;
            if (child.resolvedType) {
                offset = child.resolvedType.pointerTo ? child.resolvedType.pointerTo.symbol.node.offset : child.resolvedType.symbol.node.offset;
            }
            if (child.symbol && symbol_1.isVariable(child.symbol.kind)) {
                childNode = child.clone();
            }
            else {
                childNode = parameters[offset].clone();
            }
            childNode.kind = node_1.NodeKind.NAME;
        }
        else {
            if (child.stringValue == "T") {
                console.log(child);
            }
            childNode = child.clone();
            //if (child.resolvedType && child.resolvedType.symbol.name === templateName) {
            // console.log("Found template");
            //} else if (child.symbol && child.symbol.resolvedType.symbol.name === templateName) {
            // console.log("Found template");
            //} else {
            //}
            if (childNode.stringValue == templateName) {
                childNode.stringValue = typeName;
            }
        }
        childNode.parent = parentNode;
        if (childNode.stringValue == "constructor" && childNode.parent.kind == node_1.NodeKind.CLASS) {
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
    if (firstChildNode != null)
        parentNode.firstChild = firstChildNode;
    if (lastChildNode != null)
        parentNode.lastChild = lastChildNode;
}
function resolveChildren(context, node, parentScope) {
    let child = node.firstChild;
    while (child != null) {
        resolve(context, child, parentScope);
        assert_1.assert(child.resolvedType != null);
        child = child.nextSibling;
    }
}
exports.resolveChildren = resolveChildren;
function resolveChildrenAsExpressions(context, node, parentScope) {
    let child = node.firstChild;
    while (child != null) {
        resolveAsExpression(context, child, parentScope);
        child = child.nextSibling;
    }
}
exports.resolveChildrenAsExpressions = resolveChildrenAsExpressions;
function resolveAsExpression(context, node, parentScope) {
    assert_1.assert(node_1.isExpression(node));
    resolve(context, node, parentScope);
    assert_1.assert(node.resolvedType != null);
    if (node.resolvedType != context.errorType) {
        if (node.isType()) {
            context.log.error(node.range, "Expected expression but found type");
            node.resolvedType = context.errorType;
        }
        else if (node.resolvedType == context.voidType && node.parent.kind != node_1.NodeKind.EXPRESSION) {
            context.log.error(node.range, "This expression does not return a value");
            node.resolvedType = context.errorType;
        }
    }
}
exports.resolveAsExpression = resolveAsExpression;
function resolveAsType(context, node, parentScope) {
    assert_1.assert(node_1.isExpression(node));
    resolve(context, node, parentScope);
    assert_1.assert(node.resolvedType != null);
    if (node.resolvedType != context.errorType && !node.isType()) {
        context.log.error(node.range, "Expected type but found expression");
        node.resolvedType = context.errorType;
    }
}
exports.resolveAsType = resolveAsType;
function canConvert(context, node, to, kind) {
    let from = node.resolvedType;
    assert_1.assert(node_1.isExpression(node));
    assert_1.assert(from != null);
    assert_1.assert(to != null);
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
        if (kind == type_1.ConversionKind.EXPLICIT) {
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
        if (kind == type_1.ConversionKind.EXPLICIT || from.symbol.byteSize < to.symbol.byteSize ||
            node.kind == node_1.NodeKind.INT32 && (to.isUnsigned()
                ? node.intValue >= 0 && node.intValue <= const_1.MAX_UINT32_VALUE
                : node.intValue >= const_1.MIN_INT32_VALUE && node.intValue <= const_1.MAX_INT32_VALUE)) {
            return true;
        }
        return false;
    }
    else if (from.isInteger() && to.isFloat() ||
        from.isInteger() && to.isDouble() ||
        from.isLong() && to.isInteger() ||
        from.isLong() && to.isFloat() ||
        from.isLong() && to.isDouble() ||
        from.isFloat() && to.isInteger() ||
        from.isFloat() && to.isLong() ||
        from.isDouble() && to.isInteger() ||
        from.isDouble() && to.isLong() ||
        from.isDouble() && to.isFloat()) {
        if (kind == type_1.ConversionKind.IMPLICIT) {
            return false;
        }
        return true;
    }
    else if (from.isInteger() && to.isLong() ||
        from.isFloat() && to.isDouble() ||
        from.isFloat() && to.isFloat() ||
        from.isDouble() && to.isDouble()) {
        return true;
    }
    return false;
}
exports.canConvert = canConvert;
function checkConversion(context, node, to, kind) {
    if (!canConvert(context, node, to, kind)) {
        context.log.error(node.range, stringbuilder_1.StringBuilder_new()
            .append("Cannot convert from type '")
            .append(node.resolvedType.toString())
            .append("' to type '")
            .append(to.toString())
            .append(kind == type_1.ConversionKind.IMPLICIT && canConvert(context, node, to, type_1.ConversionKind.EXPLICIT) ? "' without a cast" : "'")
            .finish());
        node.resolvedType = context.errorType;
    }
}
exports.checkConversion = checkConversion;
function checkStorage(context, target) {
    assert_1.assert(node_1.isExpression(target));
    if (target.resolvedType != context.errorType && target.kind != node_1.NodeKind.INDEX && target.kind != node_1.NodeKind.DEREFERENCE &&
        (target.kind != node_1.NodeKind.NAME && target.kind != node_1.NodeKind.DOT || target.symbol != null && (!symbol_1.isVariable(target.symbol.kind) || target.symbol.kind == symbol_1.SymbolKind.VARIABLE_CONSTANT))) {
        context.log.error(target.range, "Cannot store to this location");
        target.resolvedType = context.errorType;
    }
}
exports.checkStorage = checkStorage;
function createDefaultValueForType(context, type) {
    if (type.isLong()) {
        return node_1.createLong(0);
    }
    else if (type.isInteger()) {
        return node_1.createInt(0);
    }
    else if (type.isDouble()) {
        return node_1.createDouble(0);
    }
    else if (type.isFloat()) {
        return node_1.createFloat(0);
    }
    if (type == context.booleanType) {
        return node_1.createboolean(false);
    }
    if (type.isClass()) {
        return node_1.createNull();
    }
    assert_1.assert(type.isReference());
    return node_1.createNull();
}
exports.createDefaultValueForType = createDefaultValueForType;
function simplifyBinary(node) {
    let left = node.binaryLeft();
    let right = node.binaryRight();
    // Canonicalize commutative operators
    if ((node.kind == node_1.NodeKind.ADD || node.kind == node_1.NodeKind.MULTIPLY ||
        node.kind == node_1.NodeKind.BITWISE_AND || node.kind == node_1.NodeKind.BITWISE_OR || node.kind == node_1.NodeKind.BITWISE_XOR) &&
        left.kind == node_1.NodeKind.INT32 && right.kind != node_1.NodeKind.INT32) {
        node.appendChild(left.remove());
        left = node.binaryLeft();
        right = node.binaryRight();
    }
    // Convert multiplication or division by a power of 2 into a shift
    if ((node.kind == node_1.NodeKind.MULTIPLY || (node.kind == node_1.NodeKind.DIVIDE || node.kind == node_1.NodeKind.REMAINDER) && node.resolvedType.isUnsigned()) &&
        right.kind == node_1.NodeKind.INT32 && utils_1.isPositivePowerOf2(right.intValue)) {
        // Extract the shift from the value
        let shift = -1;
        let value = right.intValue;
        while (value != 0) {
            value = value >> 1;
            shift = shift + 1;
        }
        // "x * 16" => "x << 4"
        if (node.kind == node_1.NodeKind.MULTIPLY) {
            node.kind = node_1.NodeKind.SHIFT_LEFT;
            right.intValue = shift;
        }
        else if (node.kind == node_1.NodeKind.DIVIDE) {
            node.kind = node_1.NodeKind.SHIFT_RIGHT;
            right.intValue = shift;
        }
        else if (node.kind == node_1.NodeKind.REMAINDER) {
            node.kind = node_1.NodeKind.BITWISE_AND;
            right.intValue = right.intValue - 1;
        }
        else {
            assert_1.assert(false);
        }
    }
    else if (node.kind == node_1.NodeKind.ADD && right.kind == node_1.NodeKind.NEGATIVE) {
        node.kind = node_1.NodeKind.SUBTRACT;
        right.replaceWith(right.unaryValue().remove());
    }
    else if (node.kind == node_1.NodeKind.ADD && right.isNegativeInteger()) {
        node.kind = node_1.NodeKind.SUBTRACT;
        right.intValue = -right.intValue;
    }
}
exports.simplifyBinary = simplifyBinary;
function binaryHasUnsignedArguments(node) {
    let left = node.binaryLeft();
    let right = node.binaryRight();
    let leftType = left.resolvedType;
    let rightType = right.resolvedType;
    return leftType.isUnsigned() && rightType.isUnsigned() || leftType.isUnsigned() && right.isNonNegativeInteger() ||
        left.isNonNegativeInteger() && rightType.isUnsigned();
}
exports.binaryHasUnsignedArguments = binaryHasUnsignedArguments;
function isBinaryLong(node) {
    let left = node.binaryLeft();
    let right = node.binaryRight();
    let leftType = left.resolvedType;
    let rightType = right.resolvedType;
    return leftType.isLong() || rightType.isLong();
}
exports.isBinaryLong = isBinaryLong;
function isBinaryDouble(node) {
    let left = node.binaryLeft();
    let right = node.binaryRight();
    let leftType = left.resolvedType;
    let rightType = right.resolvedType;
    return leftType.isDouble() || rightType.isDouble();
}
exports.isBinaryDouble = isBinaryDouble;
function isSymbolAccessAllowed(context, symbol, node, range) {
    if (symbol.isUnsafe() && !context.isUnsafeAllowed) {
        context.log.error(range, stringbuilder_1.StringBuilder_new()
            .append("Cannot use symbol '")
            .append(symbol.name)
            .append("' outside an 'unsafe' block")
            .finish());
        return false;
    }
    if (symbol.node != null && symbol.node.isPrivate()) {
        let parent = symbol.parent();
        if (parent != null && context.enclosingClass != parent) {
            context.log.error(range, stringbuilder_1.StringBuilder_new()
                .append("Cannot access private symbol '")
                .append(symbol.name)
                .append("' here")
                .finish());
            return false;
        }
    }
    if (symbol_1.isFunction(symbol.kind) && (symbol.isSetter() ? !node.isAssignTarget() : !node.isCallValue())) {
        if (symbol.isSetter()) {
            context.log.error(range, stringbuilder_1.StringBuilder_new()
                .append("Cannot use setter '")
                .append(symbol.name)
                .append("' here")
                .finish());
        }
        else {
            context.log.error(range, stringbuilder_1.StringBuilder_new()
                .append("Must call function '")
                .append(symbol.name)
                .appendChar('\'')
                .finish());
        }
        return false;
    }
    return true;
}
exports.isSymbolAccessAllowed = isSymbolAccessAllowed;
function resolve(context, node, parentScope) {
    let kind = node.kind;
    assert_1.assert(kind == node_1.NodeKind.FILE || parentScope != null);
    if (node.resolvedType != null) {
        return;
    }
    node.resolvedType = context.errorType;
    if (kind == node_1.NodeKind.FILE || kind == node_1.NodeKind.GLOBAL) {
        resolveChildren(context, node, parentScope);
    }
    else if (kind == node_1.NodeKind.MODULE) {
        let oldEnclosingModule = context.enclosingModule;
        initializeSymbol(context, node.symbol);
        context.enclosingModule = node.symbol;
        resolveChildren(context, node, node.scope);
        context.enclosingModule = oldEnclosingModule;
    }
    else if (kind == node_1.NodeKind.IMPORT || kind == node_1.NodeKind.IMPORT_FROM) {
        //ignore imports
    }
    else if (kind == node_1.NodeKind.CLASS) {
        let oldEnclosingClass = context.enclosingClass;
        initializeSymbol(context, node.symbol);
        context.enclosingClass = node.symbol;
        resolveChildren(context, node, node.scope);
        if (node.symbol.kind == symbol_1.SymbolKind.TYPE_CLASS) {
            node.symbol.determineClassLayout(context);
        }
        context.enclosingClass = oldEnclosingClass;
    }
    else if (kind == node_1.NodeKind.ENUM) {
        initializeSymbol(context, node.symbol);
        resolveChildren(context, node, node.scope);
    }
    else if (kind == node_1.NodeKind.FUNCTION) {
        let body = node.functionBody();
        initializeSymbol(context, node.symbol);
        if (node.stringValue == "constructor" && node.parent.kind == node_1.NodeKind.CLASS) {
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
    else if (kind == node_1.NodeKind.PARAMETER) {
        let symbol = node.symbol;
    }
    else if (kind == node_1.NodeKind.VARIABLE) {
        let symbol = node.symbol;
        initializeSymbol(context, symbol);
        let oldUnsafeAllowed = context.isUnsafeAllowed;
        context.isUnsafeAllowed = context.isUnsafeAllowed || node.isUnsafe();
        let value = node.variableValue();
        if (value != null) {
            resolveAsExpression(context, value, parentScope);
            checkConversion(context, value, symbol.resolvedTypeUnderlyingIfEnumValue(context), type_1.ConversionKind.IMPLICIT);
            if (symbol.resolvedType != value.resolvedType) {
                value.becomeValueTypeOf(symbol, context);
            }
            // Variable initializers must be compile-time constants
            if (symbol.kind == symbol_1.SymbolKind.VARIABLE_GLOBAL && value.kind != node_1.NodeKind.INT32 && value.kind != node_1.NodeKind.BOOLEAN && value.kind != node_1.NodeKind.NULL) {
                //context.log.error(value.range, "Global initializers must be compile-time constants");
            }
        }
        else if (symbol.resolvedType != context.errorType) {
            value = createDefaultValueForType(context, symbol.resolvedType);
            resolveAsExpression(context, value, parentScope);
            node.appendChild(value);
        }
        // Allocate global variables
        if (symbol.kind == symbol_1.SymbolKind.VARIABLE_GLOBAL && symbol.resolvedType != context.errorType) {
            symbol.offset = context.allocateGlobalVariableOffset(symbol.resolvedType.variableSizeOf(context), symbol.resolvedType.variableAlignmentOf(context));
        }
        context.isUnsafeAllowed = oldUnsafeAllowed;
    }
    else if (kind == node_1.NodeKind.BREAK || kind == node_1.NodeKind.CONTINUE) {
        let found = false;
        let n = node;
        while (n != null) {
            if (n.kind == node_1.NodeKind.WHILE) {
                found = true;
                break;
            }
            n = n.parent;
        }
        if (!found) {
            context.log.error(node.range, "Cannot use this statement outside of a loop");
        }
    }
    else if (kind == node_1.NodeKind.BLOCK) {
        let oldUnsafeAllowed = context.isUnsafeAllowed;
        if (node.isUnsafe())
            context.isUnsafeAllowed = true;
        resolveChildren(context, node, node.scope);
        context.isUnsafeAllowed = oldUnsafeAllowed;
    }
    else if (kind == node_1.NodeKind.IMPORTS || kind == node_1.NodeKind.CONSTANTS || kind == node_1.NodeKind.VARIABLES) {
        resolveChildren(context, node, parentScope);
    }
    else if (kind == node_1.NodeKind.ANY) {
        //imported functions have anyType
        node.kind = node_1.NodeKind.TYPE;
        node.resolvedType = context.anyType;
    }
    else if (kind == node_1.NodeKind.INT32) {
        // Use the positive flag to differentiate between -2147483648 and 2147483648
        node.resolvedType = node.intValue < 0 && !node.isPositive() ? context.uint32Type : context.int32Type;
    }
    else if (kind == node_1.NodeKind.INT64) {
        node.resolvedType = node.intValue < 0 && !node.isPositive() ? context.uint64Type : context.int64Type;
    }
    else if (kind == node_1.NodeKind.FLOAT32) {
        node.resolvedType = context.float32Type;
    }
    else if (kind == node_1.NodeKind.FLOAT64) {
        node.resolvedType = context.float64Type;
    }
    else if (kind == node_1.NodeKind.STRING) {
        node.resolvedType = context.stringType;
    }
    else if (kind == node_1.NodeKind.BOOLEAN) {
        node.resolvedType = context.booleanType;
    }
    else if (kind == node_1.NodeKind.NULL) {
        node.resolvedType = context.nullType;
    }
    else if (kind == node_1.NodeKind.INDEX) {
        resolveChildrenAsExpressions(context, node, parentScope);
        let target = node.indexTarget();
        let type = target.resolvedType;
        if (type != context.errorType) {
            let symbol = type.hasInstanceMembers() ? type.findMember("[]", scope_1.ScopeHint.NORMAL) : null;
            if (symbol == null) {
                context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
                    .append("Cannot index into type '")
                    .append(target.resolvedType.toString())
                    .appendChar('\'')
                    .finish());
            }
            else {
                assert_1.assert(symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE || symbol.kind == symbol_1.SymbolKind.FUNCTION_GLOBAL && symbol.shouldConvertInstanceToGlobal());
                // Convert to a regular function call and resolve that instead
                node.kind = node_1.NodeKind.CALL;
                target.remove();
                node.insertChildBefore(node.firstChild, node_1.createMemberReference(target, symbol));
                node.resolvedType = null;
                resolveAsExpression(context, node, parentScope);
            }
        }
    }
    else if (kind == node_1.NodeKind.ALIGN_OF) {
        let type = node.alignOfType();
        resolveAsType(context, type, parentScope);
        node.resolvedType = context.int32Type;
        if (type.resolvedType != context.errorType) {
            node.becomeIntegerConstant(type.resolvedType.allocationAlignmentOf(context));
        }
    }
    else if (kind == node_1.NodeKind.SIZE_OF) {
        let type = node.sizeOfType();
        resolveAsType(context, type, parentScope);
        node.resolvedType = context.int32Type;
        if (type.resolvedType != context.errorType) {
            node.becomeIntegerConstant(type.resolvedType.allocationSizeOf(context));
        }
    }
    else if (kind == node_1.NodeKind.THIS) {
        let symbol = parentScope.findNested("this", scope_1.ScopeHint.NORMAL, scope_1.FindNested.NORMAL);
        if (symbol == null) {
            context.log.error(node.range, "Cannot use 'this' here");
        }
        else {
            node.becomeSymbolReference(symbol);
        }
    }
    else if (kind == node_1.NodeKind.PARSE_ERROR) {
        node.resolvedType = context.errorType;
    }
    else if (kind == node_1.NodeKind.NAME) {
        let name = node.stringValue;
        let symbol = parentScope.findNested(name, scope_1.ScopeHint.NORMAL, scope_1.FindNested.NORMAL);
        if (symbol == null) {
            let builder = stringbuilder_1.StringBuilder_new()
                .append("No symbol named '")
                .append(name)
                .append("' here");
            // In JavaScript, "this." before instance symbols is required
            symbol = parentScope.findNested(name, scope_1.ScopeHint.NORMAL, scope_1.FindNested.ALLOW_INSTANCE_ERRORS);
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
        else if (symbol.state == symbol_1.SymbolState.INITIALIZING) {
            context.log.error(node.range, stringbuilder_1.StringBuilder_new()
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
                node.flags |= node_1.NODE_FLAG_GENERIC;
            }
            // Inline constants
            if (symbol.kind == symbol_1.SymbolKind.VARIABLE_CONSTANT) {
                if (symbol.resolvedType == context.booleanType) {
                    node.becomeBooleanConstant(symbol.offset != 0);
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
    else if (kind == node_1.NodeKind.CAST) {
        let value = node.castValue();
        let type = node.castType();
        resolveAsExpression(context, value, parentScope);
        resolveAsType(context, type, parentScope);
        let castedType = type.resolvedType;
        checkConversion(context, value, castedType, type_1.ConversionKind.EXPLICIT);
        node.resolvedType = castedType;
        // Automatically fold constants
        if (value.kind == node_1.NodeKind.INT32 && castedType.isInteger()) {
            let result = value.intValue;
            let shift = 32 - castedType.integerBitCount(context);
            node.becomeIntegerConstant(castedType.isUnsigned()
                ? castedType.integerBitMask(context) & result
                : result << shift >> shift);
        }
        else if (value.kind == node_1.NodeKind.INT32 && castedType.isFloat()) {
            node.becomeFloatConstant(value.intValue);
        }
        else if (value.kind == node_1.NodeKind.INT32 && castedType.isDouble()) {
            node.becomeDoubleConstant(value.intValue);
        }
        else if (value.kind == node_1.NodeKind.FLOAT32 && castedType.isInteger()) {
            node.becomeIntegerConstant(Math.round(value.floatValue));
        }
    }
    else if (kind == node_1.NodeKind.DOT) {
        let target = node.dotTarget();
        resolve(context, target, parentScope);
        if (target.resolvedType != context.errorType) {
            if (target.isType() && (target.resolvedType.isEnum() || target.resolvedType.hasInstanceMembers()) ||
                !target.isType() && target.resolvedType.hasInstanceMembers()) {
                let name = node.stringValue;
                // Empty names are left over from parse errors that have already been reported
                if (name.length > 0) {
                    let symbol = target.resolvedType.findMember(name, node.isAssignTarget() ? scope_1.ScopeHint.PREFER_SETTER : scope_1.ScopeHint.PREFER_GETTER);
                    if (symbol == null) {
                        context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
                            .append("No member named '")
                            .append(name)
                            .append("' on type '")
                            .append(target.resolvedType.toString())
                            .appendChar('\'')
                            .finish());
                    }
                    else if (symbol.isGetter()) {
                        if (node.parent.stringValue === node.stringValue && node.parent.kind === node_1.NodeKind.CALL) {
                            node.parent.resolvedType = null;
                            node.symbol = symbol;
                            node.resolvedType = symbol.resolvedType;
                            resolveAsExpression(context, node.parent, parentScope);
                        }
                        else {
                            node.kind = node_1.NodeKind.CALL;
                            node.appendChild(node_1.createMemberReference(target.remove(), symbol));
                            node.resolvedType = null;
                            resolveAsExpression(context, node, parentScope);
                        }
                        return;
                    }
                    else if (isSymbolAccessAllowed(context, symbol, node, node.internalRange)) {
                        initializeSymbol(context, symbol);
                        node.symbol = symbol;
                        node.resolvedType = symbol.resolvedType;
                        // Inline constants
                        if (symbol.kind == symbol_1.SymbolKind.VARIABLE_CONSTANT) {
                            node.becomeIntegerConstant(symbol.offset);
                        }
                    }
                }
            }
            else {
                context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
                    .append("The type '")
                    .append(target.resolvedType.toString())
                    .append("' has no members")
                    .finish());
            }
        }
    }
    else if (kind == node_1.NodeKind.CALL) {
        let value = node.callValue();
        resolveAsExpression(context, value, parentScope);
        if (value.resolvedType != context.errorType) {
            let symbol = value.symbol;
            // Only functions are callable
            if (symbol == null || !symbol_1.isFunction(symbol.kind)) {
                context.log.error(value.range, stringbuilder_1.StringBuilder_new()
                    .append("Cannot call value of type '")
                    .append(value.resolvedType.toString())
                    .appendChar('\'')
                    .finish());
            }
            else {
                initializeSymbol(context, symbol);
                if (symbol.shouldConvertInstanceToGlobal()) {
                    let name = node_1.createSymbolReference(symbol);
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
                    checkConversion(context, argumentValue, argumentVariable.symbol.resolvedType, type_1.ConversionKind.IMPLICIT);
                    argumentVariable = argumentVariable.nextSibling;
                    argumentValue = argumentValue.nextSibling;
                }
                // Not enough arguments?
                if (returnType.resolvedType != context.anyType) {
                    if (argumentVariable != returnType && !argumentVariable.hasVariableValue()) {
                        context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
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
                        context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
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
    else if (kind == node_1.NodeKind.DELETE) {
        let value = node.deleteType();
        if (value != null) {
            resolveAsExpression(context, value, parentScope);
            if (value.resolvedType == null || value.resolvedType == context.voidType) {
                context.log.error(value.range, "Unexpected delete value 'void'");
            }
        }
        else {
            context.log.error(node.range, stringbuilder_1.StringBuilder_new()
                .append("Expected delete value '")
                .append(context.currentReturnType.toString())
                .appendChar('\'')
                .finish());
        }
    }
    else if (kind == node_1.NodeKind.RETURN) {
        let value = node.returnValue();
        if (value != null) {
            resolveAsExpression(context, value, parentScope);
            if (context.currentReturnType != null) {
                if (context.currentReturnType != context.voidType) {
                    if (value.resolvedType.isTemplate() && value.hasParameters() && node.parent != value.resolvedType.symbol.node) {
                        deriveConcreteClass(context, value, [value.firstChild.firstChild], value.resolvedType.symbol.scope);
                    }
                    checkConversion(context, value, context.currentReturnType, type_1.ConversionKind.IMPLICIT);
                }
                else {
                    context.log.error(value.range, "Unexpected return value in function returning 'void'");
                }
            }
            node.parent.returnNode = node;
        }
        else if (context.currentReturnType != null && context.currentReturnType != context.voidType) {
            context.log.error(node.range, stringbuilder_1.StringBuilder_new()
                .append("Expected return value in function returning '")
                .append(context.currentReturnType.toString())
                .appendChar('\'')
                .finish());
        }
    }
    else if (kind == node_1.NodeKind.EMPTY) {
    }
    else if (kind == node_1.NodeKind.PARAMETERS) {
        // resolveAsType(context, node.genericType(), parentScope);
        // resolveAsExpression(context, node.expressionValue(), parentScope);
        // context.log.error(node.range, "Generics are not implemented yet");
    }
    else if (kind == node_1.NodeKind.EXTENDS) {
        resolveAsType(context, node.extendsType(), parentScope);
        //context.log.error(node.range, "Subclassing is not implemented yet");
    }
    else if (kind == node_1.NodeKind.IMPLEMENTS) {
        let child = node.firstChild;
        while (child != null) {
            resolveAsType(context, child, parentScope);
            child = child.nextSibling;
        }
        context.log.error(node.range, "Interfaces are not implemented yet");
    }
    else if (kind == node_1.NodeKind.EXPRESSION) {
        resolveAsExpression(context, node.expressionValue(), parentScope);
    }
    else if (kind == node_1.NodeKind.WHILE) {
        let value = node.whileValue();
        let body = node.whileBody();
        resolveAsExpression(context, value, parentScope);
        checkConversion(context, value, context.booleanType, type_1.ConversionKind.IMPLICIT);
        resolve(context, body, parentScope);
    }
    else if (kind == node_1.NodeKind.IF) {
        let value = node.ifValue();
        let yes = node.ifTrue();
        let no = node.ifFalse();
        resolveAsExpression(context, value, parentScope);
        checkConversion(context, value, context.booleanType, type_1.ConversionKind.IMPLICIT);
        resolve(context, yes, parentScope);
        if (no != null) {
            resolve(context, no, parentScope);
        }
    }
    else if (kind == node_1.NodeKind.HOOK) {
        let value = node.hookValue();
        let yes = node.hookTrue();
        let no = node.hookFalse();
        resolveAsExpression(context, value, parentScope);
        checkConversion(context, value, context.booleanType, type_1.ConversionKind.IMPLICIT);
        resolve(context, yes, parentScope);
        resolve(context, no, parentScope);
        checkConversion(context, yes, no.resolvedType, type_1.ConversionKind.IMPLICIT);
        let commonType = (yes.resolvedType == context.nullType ? no : yes).resolvedType;
        if (yes.resolvedType != commonType && (yes.resolvedType != context.nullType || !commonType.isReference()) &&
            no.resolvedType != commonType && (no.resolvedType != context.nullType || !commonType.isReference())) {
            context.log.error(log_1.spanRanges(yes.range, no.range), stringbuilder_1.StringBuilder_new()
                .append("Type '")
                .append(yes.resolvedType.toString())
                .append("' is not the same as type '")
                .append(no.resolvedType.toString())
                .appendChar('\'')
                .finish());
        }
        node.resolvedType = commonType;
    }
    else if (kind == node_1.NodeKind.ASSIGN) {
        let left = node.binaryLeft();
        let right = node.binaryRight();
        if (left.kind == node_1.NodeKind.INDEX) {
            resolveChildrenAsExpressions(context, left, parentScope);
            let target = left.indexTarget();
            let type = target.resolvedType;
            if (type != context.errorType) {
                let symbol = type.hasInstanceMembers() ? type.findMember("[]=", scope_1.ScopeHint.NORMAL) : null;
                if (symbol == null) {
                    context.log.error(left.internalRange, stringbuilder_1.StringBuilder_new()
                        .append("Cannot index into type '")
                        .append(target.resolvedType.toString())
                        .appendChar('\'')
                        .finish());
                }
                else {
                    assert_1.assert(symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE);
                    // Convert to a regular function call and resolve that instead
                    node.kind = node_1.NodeKind.CALL;
                    target.remove();
                    left.remove();
                    while (left.lastChild != null) {
                        node.insertChildBefore(node.firstChild, left.lastChild.remove());
                    }
                    node.insertChildBefore(node.firstChild, node_1.createMemberReference(target, symbol));
                    node.internalRange = log_1.spanRanges(left.internalRange, right.range);
                    node.resolvedType = null;
                    resolveAsExpression(context, node, parentScope);
                    return;
                }
            }
        }
        resolveAsExpression(context, left, parentScope);
        // Automatically call setters
        if (left.symbol != null && left.symbol.isSetter()) {
            node.kind = node_1.NodeKind.CALL;
            node.internalRange = left.internalRange;
            node.resolvedType = null;
            resolveAsExpression(context, node, parentScope);
            return;
        }
        resolveAsExpression(context, right, parentScope);
        checkConversion(context, right, left.resolvedType, type_1.ConversionKind.IMPLICIT);
        checkStorage(context, left);
        node.resolvedType = left.resolvedType;
    }
    else if (kind == node_1.NodeKind.NEW) {
        compiler_1.Compiler.mallocRequired = true;
        let type = node.newType();
        resolveAsType(context, type, parentScope);
        if (type.resolvedType.isTemplate() && type.hasParameters() && node.parent != type.resolvedType.symbol.node) {
            deriveConcreteClass(context, type, [type.firstChild.firstChild], type.resolvedType.symbol.scope);
        }
        if (type.resolvedType != context.errorType) {
            if (!type.resolvedType.isClass()) {
                context.log.error(type.range, stringbuilder_1.StringBuilder_new()
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
        let argumentVariable = constructorNode.functionFirstArgument();
        while (child != null) {
            resolveAsExpression(context, child, parentScope);
            checkConversion(context, child, argumentVariable.symbol.resolvedType, type_1.ConversionKind.IMPLICIT);
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
    else if (kind == node_1.NodeKind.POINTER_TYPE) {
        let value = node.unaryValue();
        resolveAsType(context, value, parentScope);
        if (context.target == compile_target_1.CompileTarget.JAVASCRIPT) {
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
    else if (kind == node_1.NodeKind.DEREFERENCE) {
        let value = node.unaryValue();
        resolveAsExpression(context, value, parentScope);
        let type = value.resolvedType;
        if (type != context.errorType) {
            if (type.pointerTo == null) {
                context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
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
    else if (kind == node_1.NodeKind.ADDRESS_OF) {
        let value = node.unaryValue();
        resolveAsExpression(context, value, parentScope);
        context.log.error(node.internalRange, "The address-of operator is not supported");
    }
    else if (node_1.isUnary(kind)) {
        let value = node.unaryValue();
        resolveAsExpression(context, value, parentScope);
        // Operator "!" is hard-coded
        if (kind == node_1.NodeKind.NOT) {
            checkConversion(context, value, context.booleanType, type_1.ConversionKind.IMPLICIT);
            node.resolvedType = context.booleanType;
        }
        else if (value.resolvedType.isLong()) {
            if (value.resolvedType.isUnsigned()) {
                node.flags = node.flags | node_1.NODE_FLAG_UNSIGNED_OPERATOR;
                node.resolvedType = context.uint64Type;
            }
            else {
                node.resolvedType = context.int64Type;
            }
            // Automatically fold constants
            if (value.kind == node_1.NodeKind.INT64) {
                let input = value.longValue;
                let output = input;
                if (kind == node_1.NodeKind.COMPLEMENT)
                    output = ~input;
                else if (kind == node_1.NodeKind.NEGATIVE)
                    output = -input;
                node.becomeLongConstant(output);
            }
        }
        else if (value.resolvedType.isInteger()) {
            if (value.resolvedType.isUnsigned()) {
                node.flags = node.flags | node_1.NODE_FLAG_UNSIGNED_OPERATOR;
                node.resolvedType = context.uint32Type;
            }
            else {
                node.resolvedType = context.int32Type;
            }
            // Automatically fold constants
            if (value.kind == node_1.NodeKind.INT32) {
                let input = value.intValue;
                let output = input;
                if (kind == node_1.NodeKind.COMPLEMENT)
                    output = ~input;
                else if (kind == node_1.NodeKind.NEGATIVE)
                    output = -input;
                node.becomeIntegerConstant(output);
            }
        }
        else if (value.resolvedType.isDouble()) {
            node.resolvedType = context.float64Type;
            // Automatically fold constants
            if (value.kind == node_1.NodeKind.FLOAT64) {
                let input = value.doubleValue;
                let output = input;
                if (kind == node_1.NodeKind.COMPLEMENT)
                    output = ~input;
                else if (kind == node_1.NodeKind.NEGATIVE)
                    output = -input;
                node.becomeDoubleConstant(output);
            }
        }
        else if (value.resolvedType.isFloat()) {
            node.resolvedType = context.float32Type;
            // Automatically fold constants
            if (value.kind == node_1.NodeKind.FLOAT32) {
                let input = value.floatValue;
                let output = input;
                if (kind == node_1.NodeKind.COMPLEMENT)
                    output = ~input;
                else if (kind == node_1.NodeKind.NEGATIVE)
                    output = -input;
                node.becomeFloatConstant(output);
            }
        }
        else if (value.resolvedType != context.errorType) {
            let name = node.internalRange.toString();
            let symbol = value.resolvedType.findMember(name, scope_1.ScopeHint.NOT_BINARY);
            // Automatically call the function
            if (symbol != null) {
                node.appendChild(node_1.createMemberReference(value.remove(), symbol).withRange(node.range).withInternalRange(node.internalRange));
                node.kind = node_1.NodeKind.CALL;
                node.resolvedType = null;
                resolveAsExpression(context, node, parentScope);
            }
            else {
                context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
                    .append("Cannot use unary operator '")
                    .append(name)
                    .append("' with type '")
                    .append(value.resolvedType.toString())
                    .appendChar('\'')
                    .finish());
            }
        }
    }
    else if (node_1.isBinary(kind)) {
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
        if (kind == node_1.NodeKind.LOGICAL_OR || kind == node_1.NodeKind.LOGICAL_AND) {
            checkConversion(context, left, context.booleanType, type_1.ConversionKind.IMPLICIT);
            checkConversion(context, right, context.booleanType, type_1.ConversionKind.IMPLICIT);
            node.resolvedType = context.booleanType;
        }
        else if (kind == node_1.NodeKind.ADD && leftType.pointerTo != null && rightType.isInteger()) {
            node.resolvedType = leftType;
        }
        else if ((kind == node_1.NodeKind.LESS_THAN || kind == node_1.NodeKind.LESS_THAN_EQUAL ||
            kind == node_1.NodeKind.GREATER_THAN || kind == node_1.NodeKind.GREATER_THAN_EQUAL) && (leftType.pointerTo != null || rightType.pointerTo != null)) {
            node.resolvedType = context.booleanType;
            // Both pointer types must be exactly the same
            if (leftType != rightType) {
                context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
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
            kind != node_1.NodeKind.EQUAL && kind != node_1.NodeKind.NOT_EQUAL) {
            let isFloat = false;
            let isFloat64 = false;
            if (leftType.isFloat() || leftType.isDouble()) {
                isFloat = true;
                isFloat64 = leftType.isDouble();
            }
            let isUnsigned = binaryHasUnsignedArguments(node);
            // Arithmetic operators
            if (kind == node_1.NodeKind.ADD ||
                kind == node_1.NodeKind.SUBTRACT ||
                kind == node_1.NodeKind.MULTIPLY ||
                kind == node_1.NodeKind.DIVIDE ||
                kind == node_1.NodeKind.REMAINDER ||
                kind == node_1.NodeKind.BITWISE_AND ||
                kind == node_1.NodeKind.BITWISE_OR ||
                kind == node_1.NodeKind.BITWISE_XOR ||
                kind == node_1.NodeKind.SHIFT_LEFT ||
                kind == node_1.NodeKind.SHIFT_RIGHT) {
                let isLong = isBinaryLong(node);
                let commonType;
                if (isFloat) {
                    commonType = isBinaryDouble(node) ? context.float64Type : context.float32Type;
                }
                else {
                    commonType = isUnsigned ? (isLong ? context.uint64Type : context.uint32Type) : (isLong ? context.int64Type : context.int32Type);
                }
                if (isUnsigned) {
                    node.flags = node.flags | node_1.NODE_FLAG_UNSIGNED_OPERATOR;
                }
                checkConversion(context, left, commonType, type_1.ConversionKind.IMPLICIT);
                checkConversion(context, right, commonType, type_1.ConversionKind.IMPLICIT);
                node.resolvedType = commonType;
                // Type conversion
                if (commonType == context.int64Type) {
                    if (left.kind == node_1.NodeKind.INT32) {
                        left.kind = node_1.NodeKind.INT64;
                        left.resolvedType = context.int64Type;
                    }
                    else if (right.kind == node_1.NodeKind.INT32) {
                        right.kind = node_1.NodeKind.INT64;
                        right.resolvedType = context.int64Type;
                    }
                }
                // Automatically fold constants
                if ((left.kind == node_1.NodeKind.INT32 || left.kind == node_1.NodeKind.INT64) &&
                    (right.kind == node_1.NodeKind.INT32 || right.kind == node_1.NodeKind.INT64)) {
                    let inputLeft = left.intValue;
                    let inputRight = right.intValue;
                    let output = 0;
                    if (kind == node_1.NodeKind.ADD)
                        output = inputLeft + inputRight;
                    else if (kind == node_1.NodeKind.BITWISE_AND)
                        output = inputLeft & inputRight;
                    else if (kind == node_1.NodeKind.BITWISE_OR)
                        output = inputLeft | inputRight;
                    else if (kind == node_1.NodeKind.BITWISE_XOR)
                        output = inputLeft ^ inputRight;
                    else if (kind == node_1.NodeKind.DIVIDE)
                        output = inputLeft / inputRight;
                    else if (kind == node_1.NodeKind.MULTIPLY)
                        output = inputLeft * inputRight;
                    else if (kind == node_1.NodeKind.REMAINDER)
                        output = inputLeft % inputRight;
                    else if (kind == node_1.NodeKind.SHIFT_LEFT)
                        output = inputLeft << inputRight;
                    else if (kind == node_1.NodeKind.SHIFT_RIGHT)
                        output = isUnsigned ? ((inputLeft) >> (inputRight)) : inputLeft >> inputRight;
                    else if (kind == node_1.NodeKind.SUBTRACT)
                        output = inputLeft - inputRight;
                    else
                        return;
                    if (left.kind == node_1.NodeKind.INT32) {
                        node.becomeIntegerConstant(output);
                    }
                    else {
                        node.becomeLongConstant(output);
                    }
                }
                else if ((left.kind == node_1.NodeKind.FLOAT32 || left.kind == node_1.NodeKind.FLOAT64) &&
                    (right.kind == node_1.NodeKind.FLOAT32 || right.kind == node_1.NodeKind.FLOAT64)) {
                    let inputLeft = left.floatValue;
                    let inputRight = right.floatValue;
                    let output = 0;
                    if (kind == node_1.NodeKind.ADD)
                        output = inputLeft + inputRight;
                    else if (kind == node_1.NodeKind.BITWISE_AND)
                        output = inputLeft & inputRight;
                    else if (kind == node_1.NodeKind.BITWISE_OR)
                        output = inputLeft | inputRight;
                    else if (kind == node_1.NodeKind.BITWISE_XOR)
                        output = inputLeft ^ inputRight;
                    else if (kind == node_1.NodeKind.DIVIDE)
                        output = inputLeft / inputRight;
                    else if (kind == node_1.NodeKind.MULTIPLY)
                        output = inputLeft * inputRight;
                    else if (kind == node_1.NodeKind.REMAINDER)
                        output = inputLeft % inputRight;
                    else if (kind == node_1.NodeKind.SHIFT_LEFT)
                        output = inputLeft << inputRight;
                    else if (kind == node_1.NodeKind.SHIFT_RIGHT)
                        output = inputLeft >> inputRight;
                    else if (kind == node_1.NodeKind.SUBTRACT)
                        output = inputLeft - inputRight;
                    else
                        return;
                    if (left.kind == node_1.NodeKind.FLOAT32) {
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
            else if (kind == node_1.NodeKind.LESS_THAN ||
                kind == node_1.NodeKind.LESS_THAN_EQUAL ||
                kind == node_1.NodeKind.GREATER_THAN ||
                kind == node_1.NodeKind.GREATER_THAN_EQUAL) {
                let expectedType = isFloat ? (isFloat64 ? context.float64Type : context.float32Type) : (isUnsigned ? context.uint32Type : context.int32Type);
                if (isUnsigned) {
                    node.flags = node.flags | node_1.NODE_FLAG_UNSIGNED_OPERATOR;
                }
                if (leftType != rightType) {
                    checkConversion(context, left, expectedType, type_1.ConversionKind.IMPLICIT);
                    checkConversion(context, right, expectedType, type_1.ConversionKind.IMPLICIT);
                }
                node.resolvedType = context.booleanType;
            }
            else {
                context.log.error(node.internalRange, "This operator is not currently supported");
            }
        }
        else if (leftType != context.errorType) {
            let name = node.internalRange.toString();
            let symbol = leftType.findMember(kind == node_1.NodeKind.NOT_EQUAL ? "==" :
                kind == node_1.NodeKind.LESS_THAN_EQUAL ? ">" :
                    kind == node_1.NodeKind.GREATER_THAN_EQUAL ? "<" :
                        name, scope_1.ScopeHint.NOT_UNARY);
            // Automatically call the function
            if (symbol != null) {
                left = node_1.createMemberReference(left.remove(), symbol).withRange(node.range).withInternalRange(node.internalRange);
                right.remove();
                if (kind == node_1.NodeKind.NOT_EQUAL ||
                    kind == node_1.NodeKind.LESS_THAN_EQUAL ||
                    kind == node_1.NodeKind.GREATER_THAN_EQUAL) {
                    let call = node_1.createCall(left);
                    call.appendChild(right);
                    node.kind = node_1.NodeKind.NOT;
                    node.appendChild(call.withRange(node.range).withInternalRange(node.range));
                }
                else {
                    node.appendChild(left);
                    node.appendChild(right);
                    node.kind = node_1.NodeKind.CALL;
                }
                node.resolvedType = null;
                resolveAsExpression(context, node, parentScope);
            }
            else if (kind == node_1.NodeKind.EQUAL || kind == node_1.NodeKind.NOT_EQUAL) {
                node.resolvedType = context.booleanType;
                if (leftType != context.errorType && rightType != context.errorType && leftType != rightType && !canConvert(context, right, leftType, type_1.ConversionKind.IMPLICIT) && !canConvert(context, left, rightType, type_1.ConversionKind.IMPLICIT)) {
                    context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
                        .append("Cannot compare type '")
                        .append(leftType.toString())
                        .append("' with type '")
                        .append(rightType.toString())
                        .appendChar('\'')
                        .finish());
                }
            }
            else {
                context.log.error(node.internalRange, stringbuilder_1.StringBuilder_new()
                    .append("Cannot use binary operator '")
                    .append(name)
                    .append("' with type '")
                    .append(leftType.toString())
                    .appendChar('\'')
                    .finish());
            }
        }
    }
    else if (kind == node_1.NodeKind.TYPE) {
        //ignore types
    }
    else {
        console.error(`Unexpected kind: ${node_1.NodeKind[kind]}`);
        assert_1.assert(false);
    }
}
exports.resolve = resolve;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by Nidin Vinayakan on 11/01/17.
 */
exports.MIN_INT32_VALUE = -Math.pow(2, 31);
exports.MAX_INT32_VALUE = Math.pow(2, 31) - 1;
exports.MIN_UINT32_VALUE = 0;
exports.MAX_UINT32_VALUE = Math.pow(2, 32) - 1;
//FIXME: Cannot represent 64 bit integer in javascript
exports.MIN_INT64_VALUE = -Math.pow(2, 63);
exports.MAX_INT64_VALUE = Math.pow(2, 63) - 1;
exports.MIN_UINT64_VALUE = 0;
exports.MAX_UINT64_VALUE = Math.pow(2, 64) - 1;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const symbol_1 = __webpack_require__(4);
const node_1 = __webpack_require__(3);
const compiler_1 = __webpack_require__(9);
function treeShakingMarkAllUsed(node) {
    var symbol = node.symbol;
    if (symbol != null && !symbol.isUsed() && symbol_1.isFunction(symbol.kind) && symbol.node != null) {
        symbol.flags = symbol.flags | symbol_1.SYMBOL_FLAG_USED;
        treeShakingMarkAllUsed(symbol.node);
        if (node == symbol.node)
            return;
    }
    if (node.kind == node_1.NodeKind.NEW) {
        var type = node.newType().resolvedType;
        if (type.symbol != null) {
            type.symbol.flags |= symbol_1.SYMBOL_FLAG_USED;
            type.symbol.node.constructorFunctionNode.symbol.flags = symbol_1.SYMBOL_FLAG_USED;
        }
    }
    var child = node.firstChild;
    while (child != null) {
        treeShakingMarkAllUsed(child);
        child = child.nextSibling;
    }
}
exports.treeShakingMarkAllUsed = treeShakingMarkAllUsed;
function treeShakingSearchForUsed(node) {
    if (node.kind == node_1.NodeKind.FUNCTION && (node.isExport() || node.isStart())) {
        if ((node.symbol.name === "malloc" || node.symbol.name === "free") && !compiler_1.Compiler.mallocRequired) {
            return;
        }
        treeShakingMarkAllUsed(node);
    }
    else if (node.kind == node_1.NodeKind.GLOBAL || node.kind == node_1.NodeKind.CLASS) {
        var child = node.firstChild;
        while (child != null) {
            treeShakingSearchForUsed(child);
            child = child.nextSibling;
        }
        if (node.kind == node_1.NodeKind.CLASS && node.isExport()) {
            node.symbol.flags = node.symbol.flags | symbol_1.SYMBOL_FLAG_USED;
        }
    }
}
exports.treeShakingSearchForUsed = treeShakingSearchForUsed;
function treeShakingRemoveUnused(node) {
    if (node.kind == node_1.NodeKind.FUNCTION && !node.symbol.isUsed() && node.range.source.isLibrary) {
        // if (node.symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
        //     if (!node.parent.symbol.isUsed()) {
        //         node.remove();
        //     }
        // } else {
        node.remove();
        // }
    }
    else if (node.kind == node_1.NodeKind.GLOBAL || node.kind == node_1.NodeKind.CLASS) {
        var child = node.firstChild;
        while (child != null) {
            var next = child.nextSibling;
            treeShakingRemoveUnused(child);
            child = next;
        }
        if (node.kind == node_1.NodeKind.CLASS && !node.symbol.isUsed() && !node.isDeclare() && node.range.source.isLibrary) {
            node.remove();
        }
    }
}
exports.treeShakingRemoveUnused = treeShakingRemoveUnused;
function treeShaking(node) {
    treeShakingSearchForUsed(node);
    treeShakingRemoveUnused(node);
}
exports.treeShaking = treeShaking;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = __webpack_require__(2);
const scanner_1 = __webpack_require__(8);
const log_2 = __webpack_require__(2);
const stringbuilder_1 = __webpack_require__(1);
const filesystem_1 = __webpack_require__(12);
const javascript = __webpack_require__(20);
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
        let kind = scanner_1.TokenKind.END_OF_FILE;
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
                    log.error(log_1.createRange(source, start, start + 2), "Unterminated multi-line comment");
                    return null;
                }
            }
        }
        else if (scanner_1.isAlpha(c)) {
            while (i < limit && (scanner_1.isAlpha(contents[i]) || scanner_1.isNumber(contents[i]))) {
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
                        let importContent = resolveImport(basePath + pathSeparator + text, text);
                        if (importContent) {
                            compiler.addInputBefore(text, importContent, source);
                        }
                        else {
                            return false;
                        }
                        kind = c == '\'' ? scanner_1.TokenKind.CHARACTER : scanner_1.TokenKind.STRING;
                        break;
                    }
                }
            }
        }
    }
    return true;
}
exports.preparse = preparse;
function resolveImport(importPath, original) {
    let contents = null;
    if (original === "javascript") {
        contents = javascript;
    }
    else {
        contents = filesystem_1.FileSystem.readTextFile(importPath);
    }
    if (contents == null) {
        log_2.printError(stringbuilder_1.StringBuilder_new().append("Cannot read from ").append(importPath).finish());
        return null;
    }
    return contents;
}


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = __webpack_require__(2);
const stringbuilder_1 = __webpack_require__(1);
const scanner_1 = __webpack_require__(8);
const parser_1 = __webpack_require__(18);
var PreprocessorValue;
(function (PreprocessorValue) {
    PreprocessorValue[PreprocessorValue["FALSE"] = 0] = "FALSE";
    PreprocessorValue[PreprocessorValue["TRUE"] = 1] = "TRUE";
    PreprocessorValue[PreprocessorValue["ERROR"] = 2] = "ERROR";
})(PreprocessorValue = exports.PreprocessorValue || (exports.PreprocessorValue = {}));
class PreprocessorFlag {
}
exports.PreprocessorFlag = PreprocessorFlag;
// This preprocessor implements the flag-only conditional behavior from C#.
// There are two scopes for flags: global-level and file-level. This is stored
// using an ever-growing linked list of PreprocessorFlag objects that turn a
// flag either on or off. That way file-level state can just reference the
// memory of the global-level state and the global-level state can easily be
// restored after parsing a file just by restoring the pointer.
class Preprocessor {
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
        if (!this.peek(scanner_1.TokenKind.END_OF_FILE)) {
            this.previous = this.current;
            this.current = this.current.next;
        }
    }
    unexpectedToken() {
        this.log.error(this.current.range, stringbuilder_1.StringBuilder_new()
            .append("Unexpected ")
            .append(scanner_1.tokenToString(this.current.kind))
            .finish());
    }
    expect(kind) {
        if (!this.peek(kind)) {
            this.log.error(this.current.range, stringbuilder_1.StringBuilder_new()
                .append("Expected ")
                .append(scanner_1.tokenToString(kind))
                .append(" but found ")
                .append(scanner_1.tokenToString(this.current.kind))
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
        if (firstToken != null && firstToken.kind == scanner_1.TokenKind.PREPROCESSOR_NEEDED) {
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
            if (!this.peek(scanner_1.TokenKind.END_OF_FILE)) {
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
        while (!this.peek(scanner_1.TokenKind.END_OF_FILE) &&
            !this.peek(scanner_1.TokenKind.PREPROCESSOR_ELIF) &&
            !this.peek(scanner_1.TokenKind.PREPROCESSOR_ELSE) &&
            !this.peek(scanner_1.TokenKind.PREPROCESSOR_ENDIF)) {
            var previous = this.previous;
            var current = this.current;
            // #define or #undef
            if (this.eat(scanner_1.TokenKind.PREPROCESSOR_DEFINE) || this.eat(scanner_1.TokenKind.PREPROCESSOR_UNDEF)) {
                // Only process the directive if control flow is live at this point
                if (this.expect(scanner_1.TokenKind.IDENTIFIER) && isParentLive) {
                    this.define(this.previous.range.toString(), current.kind == scanner_1.TokenKind.PREPROCESSOR_DEFINE);
                }
                // Help out people trying to use this like C
                if (this.eat(scanner_1.TokenKind.FALSE) || this.eat(scanner_1.TokenKind.INT32) && this.previous.range.toString() == "0") {
                    this.log.error(this.previous.range, "Use '#undef' to turn a preprocessor flag off");
                }
                // Scan up to the next newline
                if (!this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.expect(scanner_1.TokenKind.PREPROCESSOR_NEWLINE)) {
                    while (!this.eat(scanner_1.TokenKind.PREPROCESSOR_NEWLINE) && !this.eat(scanner_1.TokenKind.END_OF_FILE)) {
                        this.advance();
                    }
                }
                // These statements are only valid at the top of the file
                if (!this.isDefineAndUndefAllowed) {
                    this.log.error(log_1.spanRanges(current.range, this.previous.range), "All '#define' and '#undef' directives must be at the top of the file");
                }
                // Remove all of these tokens
                this.removeTokensFrom(previous);
            }
            else if (this.eat(scanner_1.TokenKind.PREPROCESSOR_WARNING) || this.eat(scanner_1.TokenKind.PREPROCESSOR_ERROR)) {
                var next = this.current;
                // Scan up to the next newline
                while (!this.peek(scanner_1.TokenKind.PREPROCESSOR_NEWLINE) && !this.peek(scanner_1.TokenKind.END_OF_FILE)) {
                    this.advance();
                }
                // Only process the directive if control flow is live at this point
                if (isParentLive) {
                    var range = this.current == next ? current.range : log_1.spanRanges(next.range, this.previous.range);
                    this.log.append(range, range.toString(), current.kind == scanner_1.TokenKind.PREPROCESSOR_WARNING ? log_1.DiagnosticKind.WARNING : log_1.DiagnosticKind.ERROR);
                }
                // Remove all of these tokens
                this.eat(scanner_1.TokenKind.PREPROCESSOR_NEWLINE);
                this.removeTokensFrom(previous);
            }
            else if (this.eat(scanner_1.TokenKind.PREPROCESSOR_IF)) {
                var isLive = isParentLive;
                // Scan over the entire if-else chain
                while (true) {
                    var condition = this.parseExpression(parser_1.Precedence.LOWEST);
                    // Reject if the condition is missing
                    if (condition == PreprocessorValue.ERROR || !this.expect(scanner_1.TokenKind.PREPROCESSOR_NEWLINE)) {
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
                    if (this.eat(scanner_1.TokenKind.PREPROCESSOR_ELIF)) {
                        continue;
                    }
                    // #else
                    if (this.eat(scanner_1.TokenKind.PREPROCESSOR_ELSE)) {
                        if (!this.expect(scanner_1.TokenKind.PREPROCESSOR_NEWLINE)) {
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
                if (!this.expect(scanner_1.TokenKind.PREPROCESSOR_ENDIF) || !this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.expect(scanner_1.TokenKind.PREPROCESSOR_NEWLINE)) {
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
        if (this.eat(scanner_1.TokenKind.TRUE))
            return PreprocessorValue.TRUE;
        if (this.eat(scanner_1.TokenKind.FALSE))
            return PreprocessorValue.FALSE;
        // Identifier
        if (this.eat(scanner_1.TokenKind.IDENTIFIER)) {
            var name = this.previous.range.toString();
            // Recover from a C-style define operator
            if (this.peek(scanner_1.TokenKind.LEFT_PARENTHESIS) && name == "defined") {
                isDefinedOperator = true;
            }
            else {
                var isTrue = this.isDefined(name);
                return isTrue ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
            }
        }
        // !
        if (this.eat(scanner_1.TokenKind.NOT)) {
            var value = this.parseExpression(parser_1.Precedence.UNARY_PREFIX);
            if (value == PreprocessorValue.ERROR)
                return PreprocessorValue.ERROR;
            return value == PreprocessorValue.TRUE ? PreprocessorValue.FALSE : PreprocessorValue.TRUE;
        }
        // Group
        if (this.eat(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
            var first = this.current;
            var value = this.parseExpression(parser_1.Precedence.LOWEST);
            if (value == PreprocessorValue.ERROR || !this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                return PreprocessorValue.ERROR;
            }
            // Recover from a C-style define operator
            if (isDefinedOperator) {
                var builder = stringbuilder_1.StringBuilder_new().append("There is no 'defined' operator");
                if (first.kind == scanner_1.TokenKind.IDENTIFIER && this.previous == first.next) {
                    builder.append(" (just use '").append(first.range.toString()).append("' instead)");
                }
                this.log.error(log_1.spanRanges(start.range, this.previous.range), builder.finish());
            }
            return value;
        }
        // Recover from a C-style booleanean
        if (this.eat(scanner_1.TokenKind.INT32)) {
            var isTrue = this.previous.range.toString() != "0";
            this.log.error(this.previous.range, stringbuilder_1.StringBuilder_new()
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
        if (precedence < parser_1.Precedence.EQUAL && (this.eat(scanner_1.TokenKind.EQUAL) || this.eat(scanner_1.TokenKind.NOT_EQUAL))) {
            var right = this.parseExpression(parser_1.Precedence.EQUAL);
            if (right == PreprocessorValue.ERROR)
                return PreprocessorValue.ERROR;
            return (operator == scanner_1.TokenKind.EQUAL) == (left == right) ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
        }
        // &&
        if (precedence < parser_1.Precedence.LOGICAL_AND && this.eat(scanner_1.TokenKind.LOGICAL_AND)) {
            var right = this.parseExpression(parser_1.Precedence.LOGICAL_AND);
            if (right == PreprocessorValue.ERROR)
                return PreprocessorValue.ERROR;
            return (left == PreprocessorValue.TRUE && right == PreprocessorValue.TRUE) ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
        }
        // ||
        if (precedence < parser_1.Precedence.LOGICAL_OR && this.eat(scanner_1.TokenKind.LOGICAL_OR)) {
            var right = this.parseExpression(parser_1.Precedence.LOGICAL_OR);
            if (right == PreprocessorValue.ERROR)
                return PreprocessorValue.ERROR;
            return (left == PreprocessorValue.TRUE || right == PreprocessorValue.TRUE) ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
        }
        // Hook
        if (precedence == parser_1.Precedence.LOWEST && this.eat(scanner_1.TokenKind.QUESTION_MARK)) {
            var middle = this.parseExpression(parser_1.Precedence.LOWEST);
            if (middle == PreprocessorValue.ERROR || !this.expect(scanner_1.TokenKind.COLON)) {
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
}
exports.Preprocessor = Preprocessor;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const compile_target_1 = __webpack_require__(6);
// library files
const math = __webpack_require__(23);
const types = __webpack_require__(24);
const array = __webpack_require__(21);
const jstypes = __webpack_require__(26);
const runtime = __webpack_require__(25);
const wrapper = __webpack_require__(27);
const malloc = __webpack_require__(22);
const builtins = __webpack_require__(28);
const initializer = __webpack_require__(29);
class Library {
    static get(target) {
        let lib;
        switch (target) {
            case compile_target_1.CompileTarget.JAVASCRIPT:
                lib = jstypes + "\n";
                break;
            case compile_target_1.CompileTarget.WEBASSEMBLY:
                lib = [
                    types,
                    initializer,
                    builtins,
                    math,
                    malloc,
                    array
                ].join('\n');
                break;
        }
        return lib;
    }
    static getRuntime(target) {
        switch (target) {
            case compile_target_1.CompileTarget.JAVASCRIPT:
                return runtime + "\n";
            default:
                return "";
        }
    }
    static getWrapper(target) {
        switch (target) {
            case compile_target_1.CompileTarget.JAVASCRIPT:
                return wrapper + "\n";
            default:
                return "";
        }
    }
}
exports.Library = Library;


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="declarations.d.ts" />
const log_1 = __webpack_require__(2);
const stringbuilder_1 = __webpack_require__(1);
const compiler_1 = __webpack_require__(9);
const compile_target_1 = __webpack_require__(6);
const terminal_1 = __webpack_require__(13);
const filesystem_1 = __webpack_require__(12);
/**
 * TurboScript compiler main entry
 */
class CommandLineArgument {
}
exports.CommandLineArgument = CommandLineArgument;
let firstArgument;
let lastArgument;
function main_addArgument(text) {
    let argument = new CommandLineArgument();
    argument.text = text;
    if (firstArgument == null)
        firstArgument = argument;
    else
        lastArgument.next = argument;
    lastArgument = argument;
}
exports.main_addArgument = main_addArgument;
function main_reset() {
    firstArgument = null;
    lastArgument = null;
}
exports.main_reset = main_reset;
function printUsage() {
    terminal_1.Terminal.write(`
Usage: tc [FLAGS] [INPUTS]

  --help           Print this message.
  --out [PATH]     Emit code to PATH (the target format is the file extension).
    --wasm         Explicit webassembly output 
  --define [NAME]  Define the flag NAME in all input files.

Examples:

  tc src/*.tbs --out main.wasm
`);
}
exports.printUsage = printUsage;
function main_entry() {
    let target = compile_target_1.CompileTarget.NONE;
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
            else if (text == "--cpp") {
                target = compile_target_1.CompileTarget.CPP;
            }
            else if (text == "--js") {
                target = compile_target_1.CompileTarget.JAVASCRIPT;
            }
            else if (text == "--wasm") {
                target = compile_target_1.CompileTarget.WEBASSEMBLY;
            }
            else if (text == "--define" && argument.next != null) {
                argument = argument.next;
            }
            else if (text == "--out" && argument.next != null) {
                argument = argument.next;
                output = argument.text;
            }
            else {
                log_1.printError(stringbuilder_1.StringBuilder_new().append("Invalid flag: ").append(text).finish());
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
        log_1.printError("No input files");
        return 1;
    }
    // Must have an output
    if (output == null) {
        log_1.printError("Missing an output file (use the --out flag)");
        return 1;
    }
    // Automatically set the target based on the file extension
    //C emitter and vanilla javascript emitter is disabled due to outdated code base.
    if (target == compile_target_1.CompileTarget.NONE) {
        if (output.endsWith(".wasm"))
            target = compile_target_1.CompileTarget.WEBASSEMBLY;
        else {
            // printError("Missing a target (use either --c, --js, --asmjs or --wasm)");
            log_1.printError("Missing a target (use either --asmjs or --wasm)");
            return 1;
        }
    }
    // Start the compilation
    let compiler = new compiler_1.Compiler();
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
            let contents = filesystem_1.FileSystem.readTextFile(text);
            if (contents == null) {
                log_1.printError(stringbuilder_1.StringBuilder_new().append("Cannot read from ").append(text).finish());
                return 1;
            }
            compiler.addInput(text, contents);
        }
        argument = argument.next;
    }
    // Finish the compilation
    compiler.finish();
    log_1.writeLogToTerminal(compiler.log);
    // Only emit the output if the compilation succeeded
    if (!compiler.log.hasErrors()) {
        if (target == compile_target_1.CompileTarget.CPP && filesystem_1.FileSystem.writeTextFile(output, compiler.outputCPP) &&
            filesystem_1.FileSystem.writeTextFile(compiler_1.replaceFileExtension(output, ".h"), compiler.outputH) ||
            target == compile_target_1.CompileTarget.JAVASCRIPT && filesystem_1.FileSystem.writeTextFile(output, compiler.outputJS) ||
            target == compile_target_1.CompileTarget.WEBASSEMBLY && filesystem_1.FileSystem.writeBinaryFile(output, compiler.outputWASM) &&
                filesystem_1.FileSystem.writeTextFile(output + ".log", compiler.outputWASM.log)) {
            return 0;
        }
        log_1.printError(stringbuilder_1.StringBuilder_new().append("Cannot write to ").append(output).finish());
    }
    return 1;
}
exports.main_entry = main_entry;
exports.main = {
    addArgument: main_addArgument,
    reset: main_reset,
    entry: main_entry
};
function compileString(source, target = compile_target_1.CompileTarget.WEBASSEMBLY) {
    if (typeof TURBO_PATH === "undefined") {
        TURBO_PATH = "";
    }
    let input = "tmp-string-source.tbs";
    let output = "tmp-string-source.wasm";
    filesystem_1.FileSystem.writeTextFile("tmp-string-source.tbs", source);
    let compiler = new compiler_1.Compiler();
    compiler.initialize(target, output);
    compiler.addInput(input, source);
    compiler.finish();
    console.log("finished");
    log_1.writeLogToTerminal(compiler.log);
    if (!compiler.log.hasErrors()) {
        return compiler.outputWASM;
    }
    else {
        return null;
    }
}
exports.compileString = compileString;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 06.06.17.
 */
exports.Color = {
    DEFAULT: 0,
    BOLD: 1,
    RED: 91,
    GREEN: 92,
    MAGENTA: 95,
};


/***/ }),
/* 52 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })
/******/ ]);
});