(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("fs"));
	else if(typeof define === 'function' && define.amd)
		define(["fs"], factory);
	else if(typeof exports === 'object')
		exports["turboscript"] = factory(require("fs"));
	else
		root["turboscript"] = factory(root["fs"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_55__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 52);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var terminal_1 = __webpack_require__(1);
/**
 * Created by n.vinayakan on 06.06.17.
 */
function assert(truth) {
    if (!truth) {
        debugger;
        terminal_1.Terminal.error('Assertion failed');
        if (typeof process !== "undefined") {
            process.exit(1);
        }
        else {
            throw 'Assertion failed';
        }
    }
}
exports.assert = assert;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var env_1 = __webpack_require__(21);
var color_1 = __webpack_require__(20);
/**
 * Created by n.vinayakan on 06.06.17.
 */
var Terminal = (function () {
    function Terminal() {
    }
    Terminal.write = function (text) {
        Terminal.history += text;
        if (Terminal.silent) {
            return;
        }
        if (env_1.isNode) {
            process.stdout.write(text);
        }
        else {
            console.log("%c" + text, "background: " + Terminal.browserStyles.background + ";" +
                ("color: " + Terminal.browserStyles.text + ";") +
                ("font-weight: " + (Terminal.browserStyles.bold ? "700" : "100") + ";"));
        }
    };
    Terminal.time = function (name) {
        if (!Terminal.silent) {
            console.time(name);
        }
    };
    Terminal.timeEnd = function (name) {
        if (!Terminal.silent) {
            console.timeEnd(name);
        }
    };
    Terminal.setBGColor = function (color) {
        if (env_1.isNode) {
            if (process.stdout.isTTY) {
                process.stdout.write("\u001B[48;5;" + (color === null ? "" : color) + "m");
            }
        }
        else {
            Terminal.browserStyles.background = color_1.HexColor[color];
        }
    };
    Terminal.setTextColor = function (color) {
        if (env_1.isNode) {
            if (process.stdout.isTTY) {
                process.stdout.write("\u001B[38;5;" + color + "m");
            }
        }
        else {
            Terminal.browserStyles.text = color_1.HexColor[color];
        }
    };
    Terminal.setBoldText = function () {
        if (env_1.isNode) {
            if (process.stdout.isTTY) {
                process.stdout.write("\u001B[38;1m");
            }
        }
        else {
            Terminal.browserStyles.bold = true;
        }
    };
    Terminal.clearColor = function () {
        if (env_1.isNode) {
            if (process.stdout.isTTY) {
                process.stdout.write("\u001B[0m");
            }
        }
        else {
            Terminal.browserStyles.text = color_1.HexColor[color_1.Color.DEFAULT_TEXT];
            Terminal.browserStyles.background = color_1.HexColor[color_1.Color.DEFAULT_BG];
            Terminal.browserStyles.bold = false;
        }
    };
    Terminal.error = function (text) {
        Terminal.setBGColor(color_1.Color.RED);
        Terminal.setTextColor(color_1.Color.WHITE);
        Terminal.write(" ERROR ");
        Terminal.clearColor();
        Terminal.setTextColor(color_1.Color.RED);
        Terminal.write(" ");
        Terminal.write(text);
        Terminal.write("\n");
        Terminal.clearColor();
    };
    Terminal.warn = function (text) {
        Terminal.setBGColor(color_1.Color.ORANGE);
        Terminal.setTextColor(color_1.Color.WHITE);
        Terminal.write(" WARN ");
        Terminal.clearColor();
        Terminal.setTextColor(color_1.Color.ORANGE);
        Terminal.write(" ");
        Terminal.write(text);
        Terminal.write("\n");
        Terminal.clearColor();
    };
    return Terminal;
}());
Terminal.silent = false;
Terminal.history = "";
Terminal.browserStyles = {
    text: color_1.HexColor[color_1.Color.DEFAULT_TEXT],
    background: color_1.HexColor[color_1.Color.DEFAULT_BG],
    bold: false
};
exports.Terminal = Terminal;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var color_1 = __webpack_require__(20);
var assert_1 = __webpack_require__(0);
var terminal_1 = __webpack_require__(1);
var LineColumn = (function () {
    function LineColumn() {
    }
    return LineColumn;
}());
exports.LineColumn = LineColumn;
var Source = (function () {
    function Source() {
    }
    Source.prototype.indexToLineColumn = function (index) {
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
    };
    return Source;
}());
exports.Source = Source;
var SourceRange = (function () {
    function SourceRange() {
    }
    SourceRange.prototype.toString = function () {
        return this.source.contents.slice(this.start, this.end);
    };
    SourceRange.prototype.equals = function (other) {
        return this.source == other.source && this.start == other.start && this.end == other.end;
    };
    SourceRange.prototype.enclosingLine = function () {
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
    };
    SourceRange.prototype.rangeAtEnd = function () {
        return createRange(this.source, this.end, this.end);
    };
    return SourceRange;
}());
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
var Diagnostic = (function () {
    function Diagnostic() {
    }
    Diagnostic.prototype.sourceName = function (location) {
        return this.range.source.name + ":" + (location.line + 1) + ":" + (location.column + 1) + ": ";
    };
    Diagnostic.prototype.lineContents = function () {
        var range = this.range.enclosingLine();
        return range.source.contents.slice(range.start, range.end) + "\n";
    };
    Diagnostic.prototype.sourceRange = function (location) {
        var range = this.range;
        var column = location.column;
        var contents = range.source.contents;
        var rangeStr = "";
        // Whitespace
        while (column > 0) {
            rangeStr += ' ';
            column = column - 1;
        }
        // Single character
        if (range.end - range.start <= 1) {
            rangeStr += '^';
        }
        else {
            var i = range.start;
            while (i < range.end && contents[i] != '\n') {
                rangeStr += '~';
                i = i + 1;
            }
        }
        return rangeStr + '\n';
    };
    return Diagnostic;
}());
exports.Diagnostic = Diagnostic;
var Log = (function () {
    function Log() {
    }
    Log.prototype.error = function (range, message) {
        this.append(range, message, DiagnosticKind.ERROR);
    };
    Log.prototype.warning = function (range, message) {
        this.append(range, message, DiagnosticKind.WARNING);
    };
    Log.prototype.append = function (range, message, kind) {
        var diagnostic = new Diagnostic();
        diagnostic.range = range;
        diagnostic.message = message;
        diagnostic.kind = kind;
        if (this.first == null)
            this.first = diagnostic;
        else
            this.last.next = diagnostic;
        this.last = diagnostic;
    };
    Log.prototype.toString = function () {
        var str = "";
        var diagnostic = this.first;
        while (diagnostic != null) {
            var location_1 = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);
            str += diagnostic.sourceName(location_1);
            str += diagnostic.kind == DiagnosticKind.ERROR ? "ERROR: " : "WARN: ";
            str += diagnostic.message + "\n";
            str += diagnostic.lineContents();
            str += diagnostic.sourceRange(location_1);
            diagnostic = diagnostic.next;
        }
        return str;
    };
    Log.prototype.hasErrors = function () {
        var diagnostic = this.first;
        while (diagnostic != null) {
            if (diagnostic.kind == DiagnosticKind.ERROR) {
                return true;
            }
            diagnostic = diagnostic.next;
        }
        return false;
    };
    return Log;
}());
exports.Log = Log;
function writeLogToTerminal(log) {
    var diagnostic = log.first;
    while (diagnostic != null) {
        if (diagnostic.range !== undefined) {
            var location_2 = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);
            // Source
            var diagnosticMessage = diagnostic.sourceName(location_2);
            terminal_1.Terminal.setBoldText();
            terminal_1.Terminal.write(diagnosticMessage);
            // Kind
            diagnosticMessage = diagnostic.kind == DiagnosticKind.ERROR ? "ERROR: " : "WARN: ";
            terminal_1.Terminal.setTextColor(diagnostic.kind == DiagnosticKind.ERROR ? color_1.Color.RED : color_1.Color.ORANGE);
            terminal_1.Terminal.write(diagnosticMessage);
            // Message
            terminal_1.Terminal.setBoldText();
            terminal_1.Terminal.write(diagnostic.message + "\n");
            // Line contents
            terminal_1.Terminal.clearColor();
            terminal_1.Terminal.write(diagnostic.lineContents());
            // SourceRange
            diagnosticMessage = diagnostic.sourceRange(location_2);
            terminal_1.Terminal.setTextColor(color_1.Color.RED);
            terminal_1.Terminal.write(diagnosticMessage);
        }
        else {
            terminal_1.Terminal.setTextColor(color_1.Color.RED);
            terminal_1.Terminal.write(diagnostic.message + "\n");
        }
        diagnostic = diagnostic.next;
    }
    terminal_1.Terminal.clearColor();
}
exports.writeLogToTerminal = writeLogToTerminal;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = __webpack_require__(5);
var utils_1 = __webpack_require__(6);
var assert_1 = __webpack_require__(0);
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
var Symbol = (function () {
    function Symbol() {
        this.state = SymbolState.UNINITIALIZED;
        this.byteSize = 0;
        this.maxAlignment = 0;
    }
    Object.defineProperty(Symbol.prototype, "internalName", {
        get: function () {
            return this.rename != null ? this.rename : this.name;
        },
        enumerable: true,
        configurable: true
    });
    Symbol.prototype.clone = function () {
        var symbol = new Symbol();
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
    };
    Symbol.prototype.isEnumValue = function () {
        return this.node.parent.kind == node_1.NodeKind.ENUM;
    };
    Symbol.prototype.isUnsafe = function () {
        return this.node != null && this.node.isUnsafe();
    };
    Symbol.prototype.isGetter = function () {
        return this.node.isGet();
    };
    Symbol.prototype.isSetter = function () {
        return this.node.isSet();
    };
    Symbol.prototype.isBinaryOperator = function () {
        return (this.flags & exports.SYMBOL_FLAG_IS_BINARY_OPERATOR) != 0;
    };
    Symbol.prototype.isUnaryOperator = function () {
        return (this.flags & exports.SYMBOL_FLAG_IS_UNARY_OPERATOR) != 0;
    };
    Symbol.prototype.shouldConvertInstanceToGlobal = function () {
        return (this.flags & exports.SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL) != 0;
    };
    Symbol.prototype.isUsed = function () {
        return (this.flags & exports.SYMBOL_FLAG_USED) != 0;
    };
    Symbol.prototype.parent = function () {
        var parent = this.node.parent;
        return parent.kind == node_1.NodeKind.CLASS ? parent.symbol : null;
    };
    Symbol.prototype.resolvedTypeUnderlyingIfEnumValue = function (context) {
        return this.isEnumValue() ? this.resolvedType.underlyingType(context) : this.resolvedType;
    };
    Symbol.prototype.determineClassLayout = function (context) {
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
    };
    return Symbol;
}());
exports.Symbol = Symbol;


/***/ }),
/* 4 */
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var symbol_1 = __webpack_require__(3);
var assert_1 = __webpack_require__(0);
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
    NodeKind[NodeKind["POINTER_INDEX"] = 34] = "POINTER_INDEX";
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
var NodeFlag = (function () {
    function NodeFlag() {
    }
    return NodeFlag;
}());
exports.NodeFlag = NodeFlag;
function appendFlag(first, flag, range) {
    var link = new NodeFlag();
    link.flag = flag;
    link.range = range;
    // Is the list empty?
    if (first == null) {
        return link;
    }
    // Append the flag to the end of the list
    var secondToLast = first;
    while (secondToLast.next != null) {
        secondToLast = secondToLast.next;
    }
    secondToLast.next = link;
    return first;
}
exports.appendFlag = appendFlag;
function allFlags(link) {
    var all = 0;
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
var Node = (function () {
    function Node() {
    }
    Object.defineProperty(Node.prototype, "hasValue", {
        get: function () {
            return this._hasValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "rawValue", {
        get: function () {
            if (this._hasStringValue) {
                return "\"" + this._rawValue + "\"";
            }
            else {
                return this._rawValue;
            }
        },
        set: function (newValue) {
            this._hasValue = true;
            this._rawValue = newValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "__internal_rawValue", {
        get: function () {
            return this._rawValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "intValue", {
        get: function () {
            var n = this._rawValue;
            if (Number(n) === n && n % 1 === 0) {
                return this._rawValue;
            }
            return null;
        },
        set: function (newValue) {
            this._hasValue = true;
            this._rawValue = newValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "longValue", {
        get: function () {
            //TODO: Implement Int64
            return this._rawValue;
        },
        set: function (newValue) {
            //TODO: Implement Int64
            this._hasValue = true;
            this._rawValue = newValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "floatValue", {
        get: function () {
            return this._rawValue;
        },
        set: function (newValue) {
            this._hasValue = true;
            this._rawValue = newValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "doubleValue", {
        get: function () {
            return this._rawValue;
        },
        set: function (newValue) {
            this._hasValue = true;
            this._rawValue = newValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "stringValue", {
        get: function () {
            return this._rawValue;
        },
        set: function (newValue) {
            this._hasValue = true;
            this._hasStringValue = true;
            this._rawValue = newValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "referenceValue", {
        get: function () {
            return this._rawValue;
        },
        set: function (newValue) {
            this._hasValue = true;
            this._rawValue = newValue;
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.becomeTypeOf = function (node, context) {
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
    };
    Node.prototype.becomeValueTypeOf = function (symbol, context) {
        // let resolvedSymbol = symbol.resolvedType.pointerTo ? symbol.resolvedType.pointerTo.symbol : symbol.resolvedType.symbol;
        var resolvedSymbol = symbol.resolvedType.symbol;
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
    };
    Node.prototype.clone = function () {
        var node = new Node();
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
    };
    Node.prototype.becomeSymbolReference = function (symbol) {
        this.kind = NodeKind.NAME;
        this.symbol = symbol;
        this.referenceValue = symbol.name;
        this.resolvedType = symbol.resolvedType;
        this.removeChildren();
    };
    Node.prototype.becomeIntegerConstant = function (value) {
        this.kind = NodeKind.INT32;
        this.symbol = null;
        this.intValue = value;
        this.removeChildren();
    };
    Node.prototype.becomeLongConstant = function (value) {
        this.kind = NodeKind.INT64;
        this.symbol = null;
        this.longValue = value;
        this.removeChildren();
    };
    Node.prototype.becomeFloatConstant = function (value) {
        this.kind = NodeKind.FLOAT32;
        this.symbol = null;
        this.floatValue = value;
        this.removeChildren();
    };
    Node.prototype.becomeDoubleConstant = function (value) {
        this.kind = NodeKind.FLOAT64;
        this.symbol = null;
        this.doubleValue = value;
        this.removeChildren();
    };
    Node.prototype.becomeBooleanConstant = function (value) {
        this.kind = NodeKind.BOOLEAN;
        this.symbol = null;
        this.intValue = value ? 1 : 0;
        this.removeChildren();
    };
    Node.prototype.isNegativeInteger = function () {
        return this.kind == NodeKind.INT32 && this.intValue < 0;
    };
    Node.prototype.isNonNegativeInteger = function () {
        return this.kind == NodeKind.INT32 && this.intValue >= 0;
    };
    Node.prototype.isDeclare = function () {
        return (this.flags & exports.NODE_FLAG_DECLARE) != 0;
    };
    Node.prototype.isLibrary = function () {
        return (this.flags & exports.NODE_FLAG_LIBRARY) != 0;
    };
    Node.prototype.isVirtual = function () {
        return (this.flags & exports.NODE_FLAG_VIRTUAL) != 0;
    };
    Node.prototype.isExport = function () {
        return (this.flags & exports.NODE_FLAG_EXPORT) != 0;
    };
    Node.prototype.isImport = function () {
        return (this.flags & exports.NODE_FLAG_IMPORT) != 0;
    };
    Node.prototype.isExternalImport = function () {
        return this.isDeclare() && !this.isLibrary();
    };
    Node.prototype.isStart = function () {
        return (this.flags & exports.NODE_FLAG_START) != 0;
    };
    Node.prototype.isJavaScript = function () {
        return (this.flags & exports.NODE_FLAG_JAVASCRIPT) != 0;
    };
    Node.prototype.isStatic = function () {
        return (this.flags & exports.NODE_FLAG_STATIC) != 0;
    };
    Node.prototype.isAnyfunc = function () {
        return (this.flags & exports.NODE_FLAG_ANYFUNC) != 0;
    };
    Node.prototype.isDeclareOrJavaScript = function () {
        return (this.flags & (exports.NODE_FLAG_DECLARE | exports.NODE_FLAG_JAVASCRIPT)) != 0;
    };
    Node.prototype.isDeclareOrExport = function () {
        return (this.flags & (exports.NODE_FLAG_DECLARE | exports.NODE_FLAG_EXPORT)) != 0;
    };
    Node.prototype.isGet = function () {
        return (this.flags & exports.NODE_FLAG_GET) != 0;
    };
    Node.prototype.isSet = function () {
        return (this.flags & exports.NODE_FLAG_SET) != 0;
    };
    Node.prototype.isOperator = function () {
        return (this.flags & exports.NODE_FLAG_OPERATOR) != 0;
    };
    Node.prototype.isPositive = function () {
        return (this.flags & exports.NODE_FLAG_POSITIVE) != 0;
    };
    Node.prototype.isPrivate = function () {
        return (this.flags & exports.NODE_FLAG_PRIVATE) != 0;
    };
    Node.prototype.isUnsafe = function () {
        return (this.flags & exports.NODE_FLAG_UNSAFE) != 0;
    };
    Node.prototype.isGeneric = function () {
        return (this.flags & exports.NODE_FLAG_GENERIC) != 0;
    };
    Node.prototype.isTemplate = function () {
        return this.symbol && (this.symbol.flags & symbol_1.SYMBOL_FLAG_IS_TEMPLATE) != 0;
    };
    Node.prototype.isUnsignedOperator = function () {
        return (this.flags & exports.NODE_FLAG_UNSIGNED_OPERATOR) != 0;
    };
    Node.prototype.childCount = function () {
        var count = 0;
        var child = this.firstChild;
        while (child != null) {
            count = count + 1;
            child = child.nextSibling;
        }
        return count;
    };
    Node.prototype.parameterCount = function () {
        var count = 0;
        var child = this.firstChild;
        if (child.kind == NodeKind.PARAMETERS) {
            child = child.firstChild;
            while (child != null) {
                count = count + 1;
                child = child.nextSibling;
            }
        }
        return count;
    };
    Node.prototype.hasParameters = function () {
        if (this.firstChild) {
            var child = this.firstChild;
            if (child.kind == NodeKind.PARAMETERS) {
                return child.childCount() > 0;
            }
        }
        return false;
    };
    Node.prototype.appendChild = function (child) {
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
    };
    Node.prototype.insertChildBefore = function (after, before) {
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
    };
    Node.prototype.insertChildAfter = function (before, after) {
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
    };
    Node.prototype.remove = function () {
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
    };
    Node.prototype.removeChildren = function () {
        while (this.lastChild != null) {
            this.lastChild.remove();
        }
    };
    Node.prototype.replaceWith = function (node) {
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
    };
    Node.prototype.isType = function () {
        return this.kind == NodeKind.TYPE || this.kind == NodeKind.POINTER_TYPE || this.symbol != null && symbol_1.isType(this.symbol.kind);
    };
    Node.prototype.isCallValue = function () {
        return this.parent.kind == NodeKind.CALL && this == this.parent.callValue();
    };
    Node.prototype.isAssignTarget = function () {
        return this.parent.kind == NodeKind.ASSIGN && this == this.parent.binaryLeft();
    };
    Node.prototype.withRange = function (range) {
        this.range = range;
        return this;
    };
    Node.prototype.withInternalRange = function (range) {
        this.internalRange = range;
        return this;
    };
    Node.prototype.functionFirstArgument = function () {
        assert_1.assert(this.kind == NodeKind.FUNCTION);
        assert_1.assert(this.childCount() >= 2);
        var child = this.firstChild;
        if (child.kind == NodeKind.PARAMETERS) {
            child = child.nextSibling;
        }
        return child;
    };
    Node.prototype.functionLastArgument = function () {
        assert_1.assert(this.kind == NodeKind.FUNCTION);
        assert_1.assert(this.childCount() >= 2);
        var child = this.firstChild;
        if (child.kind == NodeKind.PARAMETERS) {
            child = child.nextSibling;
        }
        var lastArgument = null;
        while (child != null) {
            var nextChild = child.nextSibling;
            if (nextChild.kind !== NodeKind.VARIABLE) {
                lastArgument = child;
                child = null;
            }
            else {
                child = nextChild;
            }
        }
        return lastArgument;
    };
    Node.prototype.functionFirstArgumentIgnoringThis = function () {
        assert_1.assert(this.kind == NodeKind.FUNCTION);
        assert_1.assert(this.childCount() >= 2);
        assert_1.assert(this.symbol != null);
        var child = this.functionFirstArgument();
        if (this.symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE) {
            child = child.nextSibling;
        }
        return child;
    };
    Node.prototype.functionReturnType = function () {
        assert_1.assert(this.kind == NodeKind.FUNCTION);
        assert_1.assert(this.childCount() >= 2);
        assert_1.assert(isExpression(this.lastChild.previousSibling));
        return this.lastChild.previousSibling;
    };
    Node.prototype.constructorNode = function () {
        assert_1.assert(this.kind == NodeKind.NEW);
        assert_1.assert(this.childCount() > 0);
        assert_1.assert(this.resolvedType.symbol.node.kind == NodeKind.CLASS);
        return this.resolvedType.symbol.node.constructorFunctionNode;
    };
    Node.prototype.functionBody = function () {
        assert_1.assert(this.kind == NodeKind.FUNCTION);
        assert_1.assert(this.childCount() >= 2);
        assert_1.assert(this.lastChild.kind == NodeKind.BLOCK || this.lastChild.kind == NodeKind.EMPTY);
        var body = this.lastChild;
        return body.kind == NodeKind.BLOCK ? body : null;
    };
    Node.prototype.newType = function () {
        assert_1.assert(this.kind == NodeKind.NEW);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.deleteType = function () {
        assert_1.assert(this.kind == NodeKind.DELETE);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.callValue = function () {
        assert_1.assert(this.kind == NodeKind.CALL);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.castValue = function () {
        assert_1.assert(this.kind == NodeKind.CAST);
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.castType = function () {
        assert_1.assert(this.kind == NodeKind.CAST);
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(isExpression(this.lastChild));
        return this.lastChild;
    };
    Node.prototype.alignOfType = function () {
        assert_1.assert(this.kind == NodeKind.ALIGN_OF);
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.sizeOfType = function () {
        assert_1.assert(this.kind == NodeKind.SIZE_OF);
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.dotTarget = function () {
        assert_1.assert(this.kind == NodeKind.DOT);
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.returnValue = function () {
        assert_1.assert(this.kind == NodeKind.RETURN);
        assert_1.assert(this.childCount() <= 1);
        assert_1.assert(this.firstChild == null || isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.ifReturnNode = function () {
        assert_1.assert(this.kind == NodeKind.IF);
        assert_1.assert(this.firstChild !== null);
        assert_1.assert(this.firstChild.nextSibling !== null);
        return this.firstChild.nextSibling.returnNode || null;
    };
    Node.prototype.deleteValue = function () {
        assert_1.assert(this.kind == NodeKind.DELETE);
        assert_1.assert(this.childCount() <= 1);
        assert_1.assert(this.firstChild == null || isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.extendsType = function () {
        assert_1.assert(this.kind == NodeKind.EXTENDS);
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.firstGenericType = function () {
        assert_1.assert(this.firstChild.kind == NodeKind.PARAMETERS);
        assert_1.assert(this.firstChild.childCount() > 0);
        return this.firstChild.firstChild;
    };
    Node.prototype.variableType = function () {
        assert_1.assert(this.kind == NodeKind.VARIABLE);
        assert_1.assert(this.childCount() <= 2);
        assert_1.assert(isExpression(this.firstChild) || this.firstChild.kind == NodeKind.EMPTY);
        var type = this.firstChild;
        return type.kind != NodeKind.EMPTY ? type : null;
    };
    Node.prototype.variableValue = function () {
        assert_1.assert(this.kind == NodeKind.VARIABLE);
        assert_1.assert(this.childCount() <= 2);
        assert_1.assert(this.firstChild.nextSibling == null || isExpression(this.firstChild.nextSibling));
        return this.firstChild.nextSibling;
    };
    Node.prototype.hasVariableValue = function () {
        assert_1.assert(this.kind == NodeKind.VARIABLE);
        return this.firstChild != undefined && this.firstChild.nextSibling != undefined;
    };
    Node.prototype.expressionValue = function () {
        assert_1.assert(this.kind == NodeKind.EXPRESSION);
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.binaryLeft = function () {
        assert_1.assert(isBinary(this.kind));
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.binaryRight = function () {
        assert_1.assert(isBinary(this.kind));
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(isExpression(this.lastChild));
        return this.lastChild;
    };
    Node.prototype.unaryValue = function () {
        assert_1.assert(isUnary(this.kind));
        assert_1.assert(this.childCount() == 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.pointer = function () {
        assert_1.assert(this.kind == NodeKind.POINTER_INDEX);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.pointerOffset = function () {
        assert_1.assert(this.firstChild);
        assert_1.assert(this.firstChild.nextSibling);
        return this.firstChild.nextSibling.intValue;
    };
    Node.prototype.whileValue = function () {
        assert_1.assert(this.kind == NodeKind.WHILE);
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.whileBody = function () {
        assert_1.assert(this.kind == NodeKind.WHILE);
        assert_1.assert(this.childCount() == 2);
        assert_1.assert(this.lastChild.kind == NodeKind.BLOCK);
        return this.lastChild;
    };
    Node.prototype.hookValue = function () {
        assert_1.assert(this.kind == NodeKind.HOOK);
        assert_1.assert(this.childCount() == 3);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.hookTrue = function () {
        assert_1.assert(this.kind == NodeKind.HOOK);
        assert_1.assert(this.childCount() == 3);
        assert_1.assert(isExpression(this.firstChild.nextSibling));
        return this.firstChild.nextSibling;
    };
    Node.prototype.hookFalse = function () {
        assert_1.assert(this.kind == NodeKind.HOOK);
        assert_1.assert(this.childCount() == 3);
        assert_1.assert(isExpression(this.lastChild));
        return this.lastChild;
    };
    Node.prototype.indexTarget = function () {
        assert_1.assert(this.kind == NodeKind.INDEX);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.ifValue = function () {
        assert_1.assert(this.kind == NodeKind.IF);
        assert_1.assert(this.childCount() == 2 || this.childCount() == 3);
        assert_1.assert(isExpression(this.firstChild));
        return this.firstChild;
    };
    Node.prototype.ifTrue = function () {
        assert_1.assert(this.kind == NodeKind.IF);
        assert_1.assert(this.childCount() == 2 || this.childCount() == 3);
        assert_1.assert(this.firstChild.nextSibling.kind == NodeKind.BLOCK);
        return this.firstChild.nextSibling;
    };
    Node.prototype.ifFalse = function () {
        assert_1.assert(this.kind == NodeKind.IF);
        assert_1.assert(this.childCount() == 2 || this.childCount() == 3);
        assert_1.assert(this.firstChild.nextSibling.nextSibling == null || this.firstChild.nextSibling.nextSibling.kind == NodeKind.BLOCK);
        return this.firstChild.nextSibling.nextSibling || null;
    };
    Node.prototype.expandCallIntoOperatorTree = function () {
        if (this.kind != NodeKind.CALL) {
            return false;
        }
        var value = this.callValue();
        var symbol = value.symbol;
        if (value.kind == NodeKind.DOT && symbol.node.isOperator() && symbol.node.isDeclare()) {
            var binaryKind = NodeKind.NULL;
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
                var target = createIndex(value.remove().dotTarget().remove());
                target.appendChild(this.firstChild.remove());
                this.insertChildBefore(this.firstChild, target);
                return true;
            }
        }
        return false;
    };
    Node.prototype.arrayLength = function () {
        assert_1.assert(this.kind == NodeKind.NEW);
        assert_1.assert(this.childCount() >= 1);
        assert_1.assert(isExpression(this.firstChild));
        assert_1.assert(this.firstChild.resolvedType.isArray());
        return this.firstChild.nextSibling;
    };
    return Node;
}());
exports.Node = Node;
function createNew(type) {
    assert_1.assert(isExpression(type));
    var node = new Node();
    node.kind = NodeKind.NEW;
    node.appendChild(type);
    return node;
}
exports.createNew = createNew;
function createDelete(value) {
    assert_1.assert(value == null || isExpression(value));
    var node = new Node();
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
    var node = new Node();
    node.kind = NodeKind.HOOK;
    node.appendChild(test);
    node.appendChild(primary);
    node.appendChild(secondary);
    return node;
}
exports.createHook = createHook;
function createIndex(target) {
    assert_1.assert(isExpression(target));
    var node = new Node();
    node.kind = NodeKind.INDEX;
    node.appendChild(target);
    return node;
}
exports.createIndex = createIndex;
function createNull() {
    var node = new Node();
    node.kind = NodeKind.NULL;
    return node;
}
exports.createNull = createNull;
function createUndefined() {
    var node = new Node();
    node.kind = NodeKind.UNDEFINED;
    return node;
}
exports.createUndefined = createUndefined;
function createThis() {
    var node = new Node();
    node.kind = NodeKind.THIS;
    return node;
}
exports.createThis = createThis;
function createAddressOf(value) {
    assert_1.assert(isExpression(value));
    var node = new Node();
    node.kind = NodeKind.ADDRESS_OF;
    node.appendChild(value);
    return node;
}
exports.createAddressOf = createAddressOf;
function createDereference(value) {
    assert_1.assert(isExpression(value));
    var node = new Node();
    node.kind = NodeKind.DEREFERENCE;
    node.appendChild(value);
    return node;
}
exports.createDereference = createDereference;
function createAlignOf(type) {
    assert_1.assert(isExpression(type));
    var node = new Node();
    node.kind = NodeKind.ALIGN_OF;
    node.appendChild(type);
    return node;
}
exports.createAlignOf = createAlignOf;
function createSizeOf(type) {
    assert_1.assert(isExpression(type));
    var node = new Node();
    node.kind = NodeKind.SIZE_OF;
    node.appendChild(type);
    return node;
}
exports.createSizeOf = createSizeOf;
function createboolean(value) {
    var node = new Node();
    node.kind = NodeKind.BOOLEAN;
    node.intValue = value ? 1 : 0;
    return node;
}
exports.createboolean = createboolean;
function createInt(value) {
    var node = new Node();
    node.kind = NodeKind.INT32;
    node.intValue = value;
    return node;
}
exports.createInt = createInt;
function createLong(value) {
    var node = new Node();
    node.kind = NodeKind.INT64;
    node.longValue = value;
    return node;
}
exports.createLong = createLong;
function createFloat(value) {
    var node = new Node();
    node.kind = NodeKind.FLOAT32;
    node.floatValue = value;
    return node;
}
exports.createFloat = createFloat;
function createDouble(value) {
    var node = new Node();
    node.kind = NodeKind.FLOAT64;
    node.doubleValue = value;
    return node;
}
exports.createDouble = createDouble;
function createString(value) {
    var node = new Node();
    node.kind = NodeKind.STRING;
    node.stringValue = value;
    return node;
}
exports.createString = createString;
function createArray(type) {
    var node = new Node();
    node.kind = NodeKind.ARRAY;
    node.resolvedType = type;
    return node;
}
exports.createArray = createArray;
function createName(value) {
    var node = new Node();
    node.kind = NodeKind.NAME;
    node.referenceValue = value;
    return node;
}
exports.createName = createName;
function createType(type) {
    assert_1.assert(type != null);
    var node = new Node();
    node.kind = NodeKind.TYPE;
    node.resolvedType = type;
    return node;
}
exports.createType = createType;
function createAny() {
    var node = new Node();
    node.kind = NodeKind.ANY;
    return node;
}
exports.createAny = createAny;
function createEmpty() {
    var node = new Node();
    node.kind = NodeKind.EMPTY;
    return node;
}
exports.createEmpty = createEmpty;
function createExpression(value) {
    assert_1.assert(isExpression(value));
    var node = new Node();
    node.kind = NodeKind.EXPRESSION;
    node.appendChild(value);
    return node;
}
exports.createExpression = createExpression;
function createBlock() {
    var node = new Node();
    node.kind = NodeKind.BLOCK;
    return node;
}
exports.createBlock = createBlock;
function createModule(name) {
    var node = new Node();
    node.kind = NodeKind.MODULE;
    node.stringValue = name;
    return node;
}
exports.createModule = createModule;
function createClass(name) {
    var node = new Node();
    node.kind = NodeKind.CLASS;
    node.stringValue = name;
    return node;
}
exports.createClass = createClass;
function createEnum(name) {
    var node = new Node();
    node.kind = NodeKind.ENUM;
    node.stringValue = name;
    return node;
}
exports.createEnum = createEnum;
function createIf(value, trueBranch, falseBranch) {
    assert_1.assert(isExpression(value));
    assert_1.assert(trueBranch.kind == NodeKind.BLOCK);
    assert_1.assert(falseBranch == null || falseBranch.kind == NodeKind.BLOCK);
    var node = new Node();
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
    var node = new Node();
    node.kind = NodeKind.WHILE;
    node.appendChild(value);
    node.appendChild(body);
    return node;
}
exports.createWhile = createWhile;
function createReturn(value) {
    assert_1.assert(value == null || isExpression(value));
    var node = new Node();
    node.kind = NodeKind.RETURN;
    if (value != null) {
        node.appendChild(value);
    }
    return node;
}
exports.createReturn = createReturn;
function createImports() {
    var node = new Node();
    node.kind = NodeKind.IMPORTS;
    return node;
}
exports.createImports = createImports;
function createImport(name) {
    var node = new Node();
    node.kind = NodeKind.IMPORT;
    node.stringValue = name;
    return node;
}
exports.createImport = createImport;
function createImportFrom(name) {
    var node = new Node();
    node.kind = NodeKind.IMPORT_FROM;
    node.stringValue = name;
    return node;
}
exports.createImportFrom = createImportFrom;
function createVariables() {
    var node = new Node();
    node.kind = NodeKind.VARIABLES;
    return node;
}
exports.createVariables = createVariables;
function createConstants() {
    var node = new Node();
    node.kind = NodeKind.CONSTANTS;
    return node;
}
exports.createConstants = createConstants;
function createParameters() {
    var node = new Node();
    node.kind = NodeKind.PARAMETERS;
    return node;
}
exports.createParameters = createParameters;
function createExtends(type) {
    assert_1.assert(isExpression(type));
    var node = new Node();
    node.kind = NodeKind.EXTENDS;
    node.appendChild(type);
    return node;
}
exports.createExtends = createExtends;
function createImplements() {
    var node = new Node();
    node.kind = NodeKind.IMPLEMENTS;
    return node;
}
exports.createImplements = createImplements;
function createParameter(name) {
    var node = new Node();
    node.kind = NodeKind.PARAMETER;
    node.stringValue = name;
    return node;
}
exports.createParameter = createParameter;
function createVariable(name, type, value) {
    assert_1.assert(type == null || isExpression(type));
    assert_1.assert(value == null || isExpression(value));
    var node = new Node();
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
    var node = new Node();
    node.kind = NodeKind.FUNCTION;
    node.stringValue = name;
    return node;
}
exports.createFunction = createFunction;
function createUnary(kind, value) {
    assert_1.assert(isUnary(kind));
    assert_1.assert(isExpression(value));
    var node = new Node();
    node.kind = kind;
    node.appendChild(value);
    return node;
}
exports.createUnary = createUnary;
function createBinary(kind, left, right) {
    assert_1.assert(isBinary(kind));
    assert_1.assert(isExpression(left));
    assert_1.assert(isExpression(right));
    var node = new Node();
    node.kind = kind;
    node.appendChild(left);
    node.appendChild(right);
    return node;
}
exports.createBinary = createBinary;
function createCall(value) {
    assert_1.assert(isExpression(value));
    var node = new Node();
    node.kind = NodeKind.CALL;
    node.appendChild(value);
    return node;
}
exports.createCall = createCall;
function createCast(value, type) {
    assert_1.assert(isExpression(value));
    assert_1.assert(isExpression(type));
    var node = new Node();
    node.kind = NodeKind.CAST;
    node.appendChild(value);
    node.appendChild(type);
    return node;
}
exports.createCast = createCast;
function createDot(value, name) {
    assert_1.assert(isExpression(value));
    var node = new Node();
    node.kind = NodeKind.DOT;
    node.stringValue = name;
    node.appendChild(value);
    return node;
}
exports.createDot = createDot;
function createSymbolReference(symbol) {
    var node = createName(symbol.name);
    node.symbol = symbol;
    node.resolvedType = symbol.resolvedType;
    return node;
}
exports.createSymbolReference = createSymbolReference;
function createMemberReference(value, symbol) {
    var node = createDot(value, symbol.name);
    node.symbol = symbol;
    node.resolvedType = symbol.resolvedType;
    return node;
}
exports.createMemberReference = createMemberReference;
function createParseError() {
    var node = new Node();
    node.kind = NodeKind.PARSE_ERROR;
    return node;
}
exports.createParseError = createParseError;
//JavaScript
function createJSNumber() {
    var node = new Node();
    node.kind = NodeKind.JS_NUMBER;
    return node;
}
exports.createJSNumber = createJSNumber;
function createJSObject() {
    var node = new Node();
    node.kind = NodeKind.JS_OBJECT;
    return node;
}
exports.createJSObject = createJSObject;
function createJSString() {
    var node = new Node();
    node.kind = NodeKind.JS_STRING;
    return node;
}
exports.createJSString = createJSString;
function createJSArray() {
    var node = new Node();
    node.kind = NodeKind.JS_ARRAY;
    return node;
}
exports.createJSArray = createJSArray;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __webpack_require__(0);
/**
 * Created by Nidin Vinayakan on 17/01/17.
 */
function toHex(value, size) {
    if (size === void 0) { size = 7; }
    if (value == undefined || value == null) {
        return "";
    }
    var hex = value.toString(16);
    var zero = [];
    for (var i = 0; i < size; i++) {
        zero.push("0");
    }
    var str = hex.split("");
    str.forEach(function (s) {
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
/* 7 */
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
var WasmWrappedType = (function () {
    function WasmWrappedType() {
    }
    return WasmWrappedType;
}());
exports.WasmWrappedType = WasmWrappedType;
var idTostring = {};
idTostring[WasmType.VOID] = "void";
idTostring[WasmType.I32] = "i32";
idTostring[WasmType.I64] = "i64";
idTostring[WasmType.F32] = "f32";
idTostring[WasmType.F64] = "f64";
exports.WasmTypeToString = idTostring;


/***/ }),
/* 8 */
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = __webpack_require__(2);
var assert_1 = __webpack_require__(0);
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
var Token = (function () {
    function Token() {
    }
    return Token;
}());
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
            var isFloat = false;
            var isDouble = false;
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
                var floatFound = false;
                var exponentFound = false;
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
                    log.error(log_1.createRange(source, start, i), "Invalid " + (isFloat ? "float" : "integer") + " literal: '" + contents.slice(start, i) + "'");
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
                var errorMessage = "Invalid preprocessor token '" + text + "'";
                // Check for #if typos
                if (text == "#ifdef") {
                    errorMessage += ", did you mean '#if'?";
                    kind = TokenKind.PREPROCESSOR_IF;
                }
                else if (text == "#elsif" || text == "#elseif") {
                    errorMessage += ", did you mean '#elif'?";
                    kind = TokenKind.PREPROCESSOR_ELIF;
                }
                else if (text == "#end") {
                    errorMessage += ", did you mean '#endif'?";
                    kind = TokenKind.PREPROCESSOR_ENDIF;
                }
                log.error(log_1.createRange(source, start, i), errorMessage);
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
                    log.error(log_1.createRange(source, start, i), "Expected newline before " + tokenToString(kind));
                }
            }
            needsPreprocessor = true;
            wantNewline = true;
        }
        var range = log_1.createRange(source, start, i);
        if (kind == TokenKind.END_OF_FILE) {
            log.error(range, "Syntax error: '" + contents.slice(start, start + 1) + "'");
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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __webpack_require__(6);
/**
 * Created by n.vinayakan on 02.06.17.
 */
function log(array, offset, value, msg) {
    if (offset === void 0) { offset = 0; }
    if (value === void 0) { value = null; }
    if (msg === void 0) { msg = null; }
    array.log += (value != null ? utils_1.toHex(offset + array.position) + ": " + utils_1.toHex(value, 2) + "                    ; " : "") + (msg != null ? msg + "\n" : "\n");
}
exports.log = log;
function logData(array, offset, value, addPosition) {
    if (offset === void 0) { offset = 0; }
    if (addPosition === void 0) { addPosition = true; }
    array.log += (addPosition ? utils_1.toHex(offset + array.position) + ": " + utils_1.toHex(value, 2) : " " + utils_1.toHex(value, 2));
}
exports.logData = logData;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="../declarations.d.ts" />
var type_checker_1 = __webpack_require__(46);
var node_1 = __webpack_require__(5);
var log_1 = __webpack_require__(2);
var preprocessor_1 = __webpack_require__(51);
var scope_1 = __webpack_require__(17);
var scanner_1 = __webpack_require__(9);
var parser_1 = __webpack_require__(19);
var shaking_1 = __webpack_require__(49);
var webassembly_1 = __webpack_require__(45);
var library_1 = __webpack_require__(53);
var preparser_1 = __webpack_require__(50);
var compile_target_1 = __webpack_require__(4);
var assert_1 = __webpack_require__(0);
var terminal_1 = __webpack_require__(1);
/**
 * Author: Nidin Vinayakan
 */
var Compiler = (function () {
    function Compiler() {
    }
    Compiler.prototype.initialize = function (target, outputName) {
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
    };
    Compiler.prototype.createGlobals = function () {
        var context = new type_checker_1.CheckContext();
        context.log = this.log;
        context.target = this.target;
        context.pointerByteSize = 4; // Assume 32-bit code generation for now
        var global = new node_1.Node();
        global.kind = node_1.NodeKind.GLOBAL;
        var scope = new scope_1.Scope();
        global.scope = scope;
        // Hard-coded types
        context.anyType = scope.defineNativeType(context.log, "any");
        context.errorType = scope.defineNativeType(context.log, "<error>");
        context.nullType = scope.defineNativeType(context.log, "null");
        context.undefinedType = scope.defineNativeType(context.log, "undefined");
        context.voidType = scope.defineNativeType(context.log, "void");
        this.context = context;
        this.global = global;
    };
    Compiler.prototype.addInput = function (name, contents) {
        var source = new log_1.Source();
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
    };
    Compiler.prototype.addInputBefore = function (name, contents, nextSource) {
        var source = new log_1.Source();
        source.name = name;
        source.contents = contents;
        nextSource.prev.next = source;
        source.prev = nextSource.prev;
        nextSource.prev = source;
        source.next = nextSource;
        return source;
    };
    Compiler.prototype.finish = function () {
        terminal_1.Terminal.time("pre-parsing");
        var source = this.firstSource;
        while (source != null) {
            if (!preparser_1.preparse(source, this, this.log)) {
                return false;
            }
            source = source.next;
        }
        terminal_1.Terminal.timeEnd("pre-parsing");
        terminal_1.Terminal.time("scanning");
        source = this.firstSource;
        while (source != null) {
            source.firstToken = scanner_1.tokenize(source, this.log);
            source = source.next;
        }
        terminal_1.Terminal.timeEnd("scanning");
        terminal_1.Terminal.time("pre-processing");
        source = this.firstSource;
        while (source != null) {
            this.preprocessor.run(source, this.log);
            source = source.next;
        }
        terminal_1.Terminal.timeEnd("pre-processing");
        terminal_1.Terminal.time("parsing");
        source = this.firstSource;
        while (source != null) {
            if (source.firstToken != null) {
                source.file = parser_1.parse(source.firstToken, this.log);
            }
            source = source.next;
        }
        terminal_1.Terminal.timeEnd("parsing");
        terminal_1.Terminal.time("type-checking");
        var global = this.global;
        var context = this.context;
        var fullResolve = true;
        source = this.firstSource;
        while (source != null) {
            var file = source.file;
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
                    var child = file.firstChild;
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
        terminal_1.Terminal.timeEnd("type-checking");
        if (this.log.hasErrors()) {
            return false;
        }
        terminal_1.Terminal.time("optimizing");
        shaking_1.treeShaking(global);
        terminal_1.Terminal.timeEnd("optimizing");
        terminal_1.Terminal.time("emitting");
        // if (this.target == CompileTarget.C) {
        //     cEmit(this);
        // }
        // else if (this.target == CompileTarget.JAVASCRIPT) {
        //     jsEmit(this);
        // } else
        if (this.target == compile_target_1.CompileTarget.WEBASSEMBLY) {
            webassembly_1.wasmEmit(this);
        }
        terminal_1.Terminal.timeEnd("emitting");
        terminal_1.Terminal.write("Done!");
        return true;
    };
    return Compiler;
}());
Compiler.mallocRequired = false;
Compiler.debug = false;
exports.Compiler = Compiler;
function replaceFileExtension(path, extension) {
    var dot = path.lastIndexOf(".");
    var forward = path.lastIndexOf("/");
    var backward = path.lastIndexOf("\\");
    // Make sure that there's a non-empty file name that the dot is a part of
    if (dot > 0 && dot > forward && dot > backward) {
        path = path.slice(0, dot);
    }
    return path + extension;
}
exports.replaceFileExtension = replaceFileExtension;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __webpack_require__(0);
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
var ByteArray = (function () {
    function ByteArray(buffer, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
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
    Object.defineProperty(ByteArray.prototype, "array", {
        get: function () {
            return this._array.subarray(0, this.length);
        },
        enumerable: true,
        configurable: true
    });
    ;
    ByteArray.prototype.get = function (index) {
        // assert((index) < (this._length));
        return this._array[index];
    };
    ByteArray.prototype.set = function (index, value) {
        //assert((index) < (this._length));
        this._array[index] = value;
    };
    ByteArray.prototype.append = function (value) {
        var index = this.position;
        this.resize(index + 1);
        this._array[index] = value;
        this.position++;
    };
    ByteArray.prototype.resize = function (length) {
        if (length > this.data.byteLength) {
            var pos = this.position;
            var len = this.length;
            var capacity = length * 2;
            var data = new Uint8Array(capacity);
            data.set(this.array);
            this.setArray(data);
            this._position = pos;
            this.write_position = len;
        }
        return this;
    };
    ByteArray.prototype.copy = function (source, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        offset = offset > 0 ? offset : this.length;
        if (offset + source.length > this._array.length) {
            this.resize(offset + source.length);
        }
        this._array.set(source.array, offset);
        this.position = offset + source.length;
        return this;
    };
    Object.defineProperty(ByteArray.prototype, "buffer", {
        // getter setter
        get: function () {
            return this.data.buffer;
        },
        set: function (value) {
            this.data = new DataView(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "dataView", {
        get: function () {
            return this.data;
        },
        set: function (value) {
            this.data = value;
            this.write_position = value.byteLength;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "phyPosition", {
        get: function () {
            return this._position + this.data.byteOffset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "bufferOffset", {
        get: function () {
            return this.data.byteOffset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            if (this._position < value) {
                if (!this.validate(this._position - value)) {
                    return;
                }
            }
            this._position = value;
            this.write_position = value > this.write_position ? value : this.write_position;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "length", {
        get: function () {
            return this.write_position;
        },
        set: function (value) {
            this.validateBuffer(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
        get: function () {
            return this.data.byteLength - this._position;
        },
        enumerable: true,
        configurable: true
    });
    //end
    ByteArray.prototype.clear = function () {
        this._position = 0;
    };
    ByteArray.prototype.setArray = function (array) {
        this._array = array;
        this.setBuffer(array.buffer, array.byteOffset, array.byteLength);
    };
    ByteArray.prototype.setBuffer = function (buffer, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        if (buffer) {
            this.data = new DataView(buffer, offset, length > 0 ? length : buffer.byteLength);
        }
        else {
        }
    };
    /**
     * Write unsigned Little Endian Base 128
     */
    ByteArray.prototype.writeUnsignedLEB128 = function (value) {
        var b = 0;
        value |= 0;
        do {
            b = value & 0x7F;
            value >>>= 7;
            if (value)
                b |= 0x80;
            this.append(b);
        } while (value);
    };
    /**
     * Write signed Little Endian Base 128
     */
    ByteArray.prototype.writeLEB128 = function (value) {
        var b;
        value |= 0;
        do {
            b = value & 0x7F;
            value >>= 7;
            var signBit = (b & 0x40) !== 0;
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
    };
    /**
     * Write WASM String
     */
    ByteArray.prototype.writeWasmString = function (value) {
        var length = value.length;
        this.writeUnsignedLEB128(length);
        var index = this.length;
        this.resize(index + length);
        var i = 0;
        while (i < length) {
            this.set(index + i, value.charCodeAt(i));
            i = i + 1;
        }
        this.position = index + length;
    };
    /**
     * Reads a Boolean value from the byte stream. A single byte is read,
     * and true is returned if the byte is nonzero,
     * false otherwise.
     * @return    Returns true if the byte is nonzero, false otherwise.
     */
    ByteArray.prototype.readBoolean = function () {
        if (!this.validate(ByteArray.SIZE_OF_BOOLEAN))
            return null;
        return this.data.getUint8(this.position++) != 0;
    };
    /**
     * Reads a signed byte from the byte stream.
     * The returned value is in the range -128 to 127.
     * @return    An integer between -128 and 127.
     */
    ByteArray.prototype.readByte = function () {
        if (!this.validate(ByteArray.SIZE_OF_INT8))
            return null;
        return this.data.getInt8(this.position++);
    };
    /**
     * Reads the number of data bytes, specified by the length parameter, from the byte stream.
     * The bytes are read into the ByteArray object specified by the bytes parameter,
     * and the bytes are written into the destination ByteArray starting at the _position specified by offset.
     * @param    bytes    The ByteArray object to read data into.
     * @param    offset    The offset (_position) in bytes at which the read data should be written.
     * @param    length    The number of bytes to read.  The default value of 0 causes all available data to be read.
     */
    ByteArray.prototype.readBytes = function (_bytes, offset, length, createNewBuffer) {
        if (_bytes === void 0) { _bytes = null; }
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        if (createNewBuffer === void 0) { createNewBuffer = false; }
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
    };
    /**
     * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
     * @return    A double-precision (64-bit) floating-point number.
     */
    ByteArray.prototype.readDouble = function () {
        if (!this.validate(ByteArray.SIZE_OF_FLOAT64))
            return null;
        var value = this.data.getFloat64(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT64;
        return value;
    };
    /**
     * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
     * @return    A single-precision (32-bit) floating-point number.
     */
    ByteArray.prototype.readFloat = function () {
        if (!this.validate(ByteArray.SIZE_OF_FLOAT32))
            return null;
        var value = this.data.getFloat32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT32;
        return value;
    };
    /**
     * Reads a signed 32-bit integer from the byte stream.
     *
     *   The returned value is in the range -2147483648 to 2147483647.
     * @return    A 32-bit signed integer between -2147483648 and 2147483647.
     */
    ByteArray.prototype.readInt = function () {
        if (!this.validate(ByteArray.SIZE_OF_INT32))
            return null;
        var value = this.data.getInt32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT32;
        return value;
    };
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
    ByteArray.prototype.readMultiByte = function (length, charSet) {
        if (!this.validate(length))
            return null;
        return "";
    };
    /**
     * Reads a signed 16-bit integer from the byte stream.
     *
     *   The returned value is in the range -32768 to 32767.
     * @return    A 16-bit signed integer between -32768 and 32767.
     */
    ByteArray.prototype.readShort = function () {
        if (!this.validate(ByteArray.SIZE_OF_INT16))
            return null;
        var value = this.data.getInt16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT16;
        return value;
    };
    /**
     * Reads an unsigned byte from the byte stream.
     *
     *   The returned value is in the range 0 to 255.
     * @return    A 32-bit unsigned integer between 0 and 255.
     */
    ByteArray.prototype.readUnsignedByte = function () {
        if (!this.validate(ByteArray.SIZE_OF_UINT8))
            return null;
        return this.data.getUint8(this.position++);
    };
    /**
     * Reads an unsigned 32-bit integer from the byte stream.
     *
     *   The returned value is in the range 0 to 4294967295.
     * @return    A 32-bit unsigned integer between 0 and 4294967295.
     */
    ByteArray.prototype.readUnsignedInt = function () {
        if (!this.validate(ByteArray.SIZE_OF_UINT32))
            return null;
        var value = this.data.getUint32(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT32;
        return value;
    };
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
    ByteArray.prototype.readVariableSizedUnsignedInt = function () {
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
    };
    /**
     * Fast read for WebGL since only Uint16 numbers are expected
     */
    ByteArray.prototype.readU16VX = function () {
        return (this.readUnsignedByte() << 8) | this.readUnsignedByte();
    };
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
    ByteArray.prototype.readUnsignedShort = function () {
        if (!this.validate(ByteArray.SIZE_OF_UINT16))
            return null;
        var value = this.data.getUint16(this.position, this.endian == ByteArray.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;
        return value;
    };
    /**
     * Reads a UTF-8 string from the byte stream.  The string
     * is assumed to be prefixed with an unsigned int16 indicating
     * the length in bytes.
     * @return    UTF-8 encoded  string.
     */
    ByteArray.prototype.readUTF = function () {
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
    };
    /**
     * Reads a sequence of UTF-8 bytes specified by the length
     * parameter from the byte stream and returns a string.
     * @param    length    An unsigned int16 indicating the length of the UTF-8 bytes.
     * @return    A string composed of the UTF-8 bytes of the specified length.
     */
    ByteArray.prototype.readUTFBytes = function (length) {
        if (!this.validate(length))
            return null;
        var _bytes = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
        this.position += length;
        /*var _bytes: Uint8Array = new Uint8Array(new ArrayBuffer(length));
         for (var i = 0; i < length; i++) {
         _bytes[i] = this.data.getUint8(this.position++);
         }*/
        return this.decodeUTF8(_bytes);
    };
    ByteArray.prototype.readStandardString = function (length) {
        if (!this.validate(length))
            return null;
        var str = "";
        for (var i = 0; i < length; i++) {
            str += String.fromCharCode(this.data.getUint8(this.position++));
        }
        return str;
    };
    ByteArray.prototype.readStringTillNull = function (keepEvenByte) {
        if (keepEvenByte === void 0) { keepEvenByte = true; }
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
    };
    /**
     * Writes a Boolean value. A single byte is written according to the value parameter,
     * either 1 if true or 0 if false.
     * @param    value    A Boolean value determining which byte is written. If the parameter is true,
     *           the method writes a 1; if false, the method writes a 0.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeBoolean = function (value, offset) {
        if (offset === void 0) { offset = null; }
        offset = offset ? offset : this.position++;
        this.validateBuffer(ByteArray.SIZE_OF_BOOLEAN, offset);
        this.data.setUint8(offset, value ? 1 : 0);
    };
    /**
     * Writes a byte to the byte stream.
     * The low 8 bits of the
     * parameter are used. The high 24 bits are ignored.
     * @param    value    A 32-bit integer. The low 8 bits are written to the byte stream.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeByte = function (value, offset) {
        if (offset === void 0) { offset = null; }
        offset = offset ? offset : this.position++;
        this.validateBuffer(ByteArray.SIZE_OF_INT8, offset);
        this.data.setInt8(offset, value);
    };
    ByteArray.prototype.writeUnsignedByte = function (value, offset) {
        if (offset === void 0) { offset = null; }
        offset = offset ? offset : this.position++;
        this.validateBuffer(ByteArray.SIZE_OF_UINT8, offset);
        this.data.setUint8(offset, value);
    };
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
    ByteArray.prototype.writeBytes = function (_bytes, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        this.copy(_bytes);
        // this.validateBuffer(length);
        // var tmp_data = new DataView(_bytes.buffer);
        // for (var i = 0; i < _bytes.length; i++) {
        //     this.data.setUint8(this.position++, tmp_data.getUint8(i));
        // }
    };
    /**
     * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
     * @param    value    A double-precision (64-bit) floating-point number.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeDouble = function (value, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(ByteArray.SIZE_OF_FLOAT64, position);
        this.data.setFloat64(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
        if (!offset) {
            this.position += ByteArray.SIZE_OF_FLOAT64;
        }
    };
    /**
     * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
     * @param    value    A single-precision (32-bit) floating-point number.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeFloat = function (value, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(ByteArray.SIZE_OF_FLOAT32, position);
        this.data.setFloat32(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
        if (!offset) {
            this.position += ByteArray.SIZE_OF_FLOAT32;
        }
    };
    /**
     * Writes a 32-bit signed integer to the byte stream.
     * @param    value    An integer to write to the byte stream.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeInt = function (value, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(ByteArray.SIZE_OF_INT32, position);
        this.data.setInt32(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
        if (!offset) {
            this.position += ByteArray.SIZE_OF_INT32;
        }
    };
    /**
     * Writes a multibyte string to the byte stream using the specified character set.
     * @param    value    The string value to be written.
     * @param    charSet    The string denoting the character set to use. Possible character set strings
     *   include "shift-jis", "cn-gb", "iso-8859-1", and others.
     *   For a complete list, see Supported Character Sets.
     */
    ByteArray.prototype.writeMultiByte = function (value, charSet) {
    };
    /**
     * Writes a 16-bit integer to the byte stream. The low 16 bits of the parameter are used.
     * The high 16 bits are ignored.
     * @param    value    32-bit integer, whose low 16 bits are written to the byte stream.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeShort = function (value, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(ByteArray.SIZE_OF_INT16, position);
        this.data.setInt16(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
        if (!offset) {
            this.position += ByteArray.SIZE_OF_INT16;
        }
    };
    ByteArray.prototype.writeUnsignedShort = function (value, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(ByteArray.SIZE_OF_UINT16, position);
        this.data.setUint16(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
        if (!offset) {
            this.position += ByteArray.SIZE_OF_UINT16;
        }
    };
    /**
     * Writes a 32-bit unsigned integer to the byte stream.
     * @param    value    An unsigned integer to write to the byte stream.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeUnsignedInt = function (value, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(ByteArray.SIZE_OF_UINT32, position);
        this.data.setUint32(position, value, this.endian == ByteArray.LITTLE_ENDIAN);
        if (!offset) {
            this.position += ByteArray.SIZE_OF_UINT32;
        }
    };
    /**
     * Writes a UTF-8 string to the byte stream. The length of the UTF-8 string in bytes
     * is written first, as a 16-bit integer, followed by the bytes representing the
     * characters of the string.
     * @param    value    The string value to be written.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeUTF = function (value, offset) {
        if (offset === void 0) { offset = null; }
        var utf8bytes = this.encodeUTF8(value);
        var length = utf8bytes.length;
        var position = offset != null ? offset : this.position;
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
    };
    /**
     * Writes a UTF-8 string to the byte stream. Similar to the writeUTF() method,
     * but writeUTFBytes() does not prefix the string with a 16-bit length word.
     * @param    value    The string value to be written.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeUTFBytes = function (value, offset) {
        if (offset === void 0) { offset = null; }
        this.writeUint8Array(this.encodeUTF8(value), offset);
    };
    ByteArray.prototype.toString = function () {
        return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
    };
    /****************************/
    /* EXTRA JAVASCRIPT APIs    */
    /****************************/
    /**
     * Writes a Uint8Array to the byte stream.
     * @param    _bytes    The Uint8Array to be written.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeUint8Array = function (_bytes, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(_bytes.length, position);
        this._array.set(_bytes, position);
        if (!offset) {
            this.position += _bytes.length;
        }
        return this;
    };
    /**
     * Writes a Uint16Array to the byte stream.
     * @param    _bytes    The Uint16Array to be written.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeUint16Array = function (_bytes, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(_bytes.length * ByteArray.SIZE_OF_UINT16, position);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setUint16(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
            position += ByteArray.SIZE_OF_UINT16;
        }
        if (!offset) {
            this.position = position;
        }
    };
    /**
     * Writes a Uint32Array to the byte stream.
     * @param    _bytes    The Uint32Array to be written.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeUint32Array = function (_bytes, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(_bytes.length * ByteArray.SIZE_OF_UINT32, position);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setUint32(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
            position += ByteArray.SIZE_OF_UINT32;
        }
        if (!offset) {
            this.position = position;
        }
    };
    /**
     * Writes a Int8Array to the byte stream.
     * @param    _bytes    The Int8Array to be written.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeInt8Array = function (_bytes, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(_bytes.length, position);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setInt8(position++, _bytes[i]);
        }
        if (!offset) {
            this.position = position;
        }
    };
    /**
     * Writes a Int16Array to the byte stream.
     * @param    _bytes    The Int16Array to be written.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeInt16Array = function (_bytes, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(_bytes.length * ByteArray.SIZE_OF_INT16, position);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setInt16(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
            position += ByteArray.SIZE_OF_INT16;
        }
        if (!offset) {
            this.position = position;
        }
    };
    /**
     * Writes a Int32Array to the byte stream.
     * @param    _bytes    The Int32Array to be written.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeInt32Array = function (_bytes, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(_bytes.length * ByteArray.SIZE_OF_INT32, position);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setInt32(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
            position += ByteArray.SIZE_OF_INT32;
        }
        if (!offset) {
            this.position = position;
        }
    };
    /**
     * Writes a Float32Array to the byte stream.
     * @param    _bytes    The Float32Array to be written.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeFloat32Array = function (_bytes, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(_bytes.length * ByteArray.SIZE_OF_FLOAT32, position);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setFloat32(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
            position += ByteArray.SIZE_OF_FLOAT32;
        }
        if (!offset) {
            this.position = position;
        }
    };
    /**
     * Writes a Float64Array to the byte stream.
     * @param    _bytes    The Float64Array to be written.
     * @param    offset   optional start position to write
     */
    ByteArray.prototype.writeFloat64Array = function (_bytes, offset) {
        if (offset === void 0) { offset = null; }
        var position = offset != null ? offset : this.position;
        this.validateBuffer(_bytes.length, position);
        for (var i = 0; i < _bytes.length; i++) {
            this.data.setFloat64(position, _bytes[i], this.endian === ByteArray.LITTLE_ENDIAN);
            position += ByteArray.SIZE_OF_FLOAT64;
        }
        if (!offset) {
            this.position = position;
        }
    };
    /**
     * Read a Uint8Array from the byte stream.
     * @param    length An unsigned int16 indicating the length of the Uint8Array.
     */
    ByteArray.prototype.readUint8Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
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
    };
    /**
     * Read a Uint16Array from the byte stream.
     * @param    length An unsigned int16 indicating the length of the Uint16Array.
     */
    ByteArray.prototype.readUint16Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
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
    };
    /**
     * Read a Uint32Array from the byte stream.
     * @param    length An unsigned int16 indicating the length of the Uint32Array.
     */
    ByteArray.prototype.readUint32Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
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
    };
    /**
     * Read a Int8Array from the byte stream.
     * @param    length An unsigned int16 indicating the length of the Int8Array.
     */
    ByteArray.prototype.readInt8Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
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
    };
    /**
     * Read a Int16Array from the byte stream.
     * @param    length An unsigned int16 indicating the length of the Int16Array.
     */
    ByteArray.prototype.readInt16Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
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
    };
    /**
     * Read a Int32Array from the byte stream.
     * @param    length An unsigned int16 indicating the length of the Int32Array.
     */
    ByteArray.prototype.readInt32Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
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
    };
    /**
     * Read a Float32Array from the byte stream.
     * @param    length An unsigned int16 indicating the length of the Float32Array.
     */
    ByteArray.prototype.readFloat32Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
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
    };
    /**
     * Read a Float64Array from the byte stream.
     * @param    length An unsigned int16 indicating the length of the Float64Array.
     */
    ByteArray.prototype.readFloat64Array = function (length, createNewBuffer) {
        if (createNewBuffer === void 0) { createNewBuffer = true; }
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
    };
    ByteArray.prototype.validate = function (len) {
        //len += this.data.byteOffset;
        if (this.data.byteLength > 0 && this._position + len <= this.data.byteLength) {
            return true;
        }
        else {
            throw 'Error #2030: End of file was encountered.';
        }
    };
    /**********************/
    /*  PRIVATE METHODS   */
    /**********************/
    ByteArray.prototype.validateBuffer = function (size, offset) {
        if (offset === void 0) { offset = 0; }
        var length = offset + size;
        this.resize(length);
    };
    /**
     * UTF-8 Encoding/Decoding
     */
    ByteArray.prototype.encodeUTF8 = function (str) {
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
    };
    ByteArray.prototype.decodeUTF8 = function (data) {
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
    };
    ByteArray.prototype.encoderError = function (code_point) {
        throw 'EncodingError! The code point ' + code_point + ' could not be encoded.';
    };
    ByteArray.prototype.decoderError = function (fatal, opt_code_point) {
        if (fatal) {
            throw 'DecodingError';
        }
        return opt_code_point || 0xFFFD;
    };
    ByteArray.prototype.inRange = function (a, min, max) {
        return min <= a && a <= max;
    };
    ByteArray.prototype.div = function (n, d) {
        return Math.floor(n / d);
    };
    ByteArray.prototype.stringToCodePoints = function (string) {
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
    };
    return ByteArray;
}());
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
/* 13 */
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
 * Created by n.vinayakan on 03.06.17.
 */
var WasmRuntimeProperty = (function () {
    function WasmRuntimeProperty(type, name) {
        this.type = type;
        this.name = name;
    }
    return WasmRuntimeProperty;
}());
exports.WasmRuntimeProperty = WasmRuntimeProperty;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var bitness_1 = __webpack_require__(13);
var wasm_type_1 = __webpack_require__(7);
var assert_1 = __webpack_require__(0);
var symbol_1 = __webpack_require__(3);
/**
 * Created by n.vinayakan on 17.06.17.
 */
function getWasmFunctionName(symbol) {
    var moduleName = symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE ? symbol.parent().internalName : "";
    return (moduleName == "" ? "" : moduleName + "_") + symbol.internalName;
}
exports.getWasmFunctionName = getWasmFunctionName;
function wasmWrapType(id) {
    assert_1.assert(id == wasm_type_1.WasmType.VOID || id == wasm_type_1.WasmType.I32 || id == wasm_type_1.WasmType.I64 || id == wasm_type_1.WasmType.F32 || id == wasm_type_1.WasmType.F64);
    var type = new wasm_type_1.WasmWrappedType();
    type.id = id;
    return type;
}
exports.wasmWrapType = wasmWrapType;
function symbolToValueType(symbol, bitness) {
    var type = symbol.resolvedType;
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
exports.symbolToValueType = symbolToValueType;
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
exports.typeToDataType = typeToDataType;
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
exports.getTypedArrayElementSize = getTypedArrayElementSize;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var symbol_1 = __webpack_require__(3);
var type_1 = __webpack_require__(18);
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
var Scope = (function () {
    function Scope() {
    }
    Scope.prototype.findLocal = function (name, hint) {
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
    };
    Scope.prototype.findNested = function (name, hint, mode) {
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
    };
    Scope.prototype.define = function (log, symbol, hint) {
        var existing = this.findLocal(symbol.name, hint);
        if (existing != null) {
            if (symbol.name == "this") {
                log.warning(symbol.range, "Duplicate 'this' symbol");
                return true;
            }
            else {
                log.error(symbol.range, "Duplicate symbol '" + symbol.name + "'");
                return false;
            }
        }
        if (this.firstSymbol == null)
            this.firstSymbol = symbol;
        else
            this.lastSymbol.next = symbol;
        this.lastSymbol = symbol;
        return true;
    };
    Scope.prototype.defineNativeType = function (log, name) {
        var symbol = new symbol_1.Symbol();
        symbol.kind = symbol_1.SymbolKind.TYPE_NATIVE;
        symbol.name = name;
        symbol.resolvedType = new type_1.Type();
        symbol.resolvedType.symbol = symbol;
        symbol.state = symbol_1.SymbolState.INITIALIZED;
        this.define(log, symbol, ScopeHint.NORMAL);
        return symbol.resolvedType;
    };
    return Scope;
}());
exports.Scope = Scope;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var symbol_1 = __webpack_require__(3);
var ConversionKind;
(function (ConversionKind) {
    ConversionKind[ConversionKind["IMPLICIT"] = 0] = "IMPLICIT";
    ConversionKind[ConversionKind["EXPLICIT"] = 1] = "EXPLICIT";
})(ConversionKind = exports.ConversionKind || (exports.ConversionKind = {}));
var Type = (function () {
    function Type() {
    }
    Type.prototype.isClass = function () {
        return this.symbol != null && this.symbol.kind == symbol_1.SymbolKind.TYPE_CLASS;
    };
    Type.prototype.isGeneric = function () {
        var symbol = this.symbol || this.pointerTo.symbol;
        return symbol != null && symbol.kind == symbol_1.SymbolKind.TYPE_GENERIC;
    };
    Type.prototype.isTemplate = function () {
        var symbol = this.symbol || this.pointerTo.symbol;
        return symbol != null && symbol.kind == symbol_1.SymbolKind.TYPE_TEMPLATE;
    };
    Type.prototype.isEnum = function () {
        return this.symbol != null && this.symbol.kind == symbol_1.SymbolKind.TYPE_ENUM;
    };
    Type.prototype.isInteger = function () {
        return this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_NATIVE_INTEGER) != 0 || this.isEnum();
    };
    Type.prototype.isLong = function () {
        return this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_NATIVE_LONG) != 0;
    };
    Type.prototype.isUnsigned = function () {
        return this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_IS_UNSIGNED) != 0;
    };
    Type.prototype.isFloat = function () {
        return this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_NATIVE_FLOAT) != 0;
    };
    Type.prototype.isDouble = function () {
        return this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_NATIVE_DOUBLE) != 0;
    };
    Type.prototype.isArray = function () {
        // return this.symbol != null && (this.symbol.flags & SYMBOL_FLAG_IS_ARRAY) != 0;
        return this.symbol != null && this.symbol.name.indexOf("Array<") >= 0;
    };
    Type.prototype.isTypedArray = function () {
        return this.symbol != null &&
            (this.symbol.name == "Float32Array" || this.symbol.name == "Float64Array" ||
                this.symbol.name == "Int8Array" || this.symbol.name == "Int16Array" || this.symbol.name == "Int32Array" ||
                this.symbol.name == "Uint8Array" || this.symbol.name == "Uint16Array" || this.symbol.name == "Uint32Array");
    };
    Type.prototype.isReference = function () {
        return this.pointerTo != null || this.symbol != null && (this.symbol.flags & symbol_1.SYMBOL_FLAG_IS_REFERENCE) != 0;
    };
    Type.prototype.underlyingType = function (context) {
        return this.isEnum() ? context.int32Type : this.pointerTo != null ? context.uint32Type : this;
    };
    Type.prototype.integerBitCount = function (context) {
        return this.symbol != null ? this.symbol.byteSize * 8 : 0;
    };
    Type.prototype.integerBitMask = function (context) {
        return ~0 >> (32 - this.integerBitCount(context));
    };
    Type.prototype.allocationSizeOf = function (context) {
        return this.symbol == null ? context.pointerByteSize : this.symbol.byteSize;
    };
    Type.prototype.allocationAlignmentOf = function (context) {
        return this.allocationSizeOf(context); // This is true right now
    };
    Type.prototype.variableSizeOf = function (context) {
        return this.isReference() ? context.pointerByteSize : this.symbol.byteSize;
    };
    Type.prototype.variableAlignmentOf = function (context) {
        return this.variableSizeOf(context); // This is true right now
    };
    Type.prototype.pointerType = function () {
        var type = this.cachedPointerType;
        if (type == null) {
            type = new Type();
            type.pointerTo = this;
            this.cachedPointerType = type;
        }
        return type;
    };
    Type.prototype.toString = function () {
        if (this.cachedToString == null) {
            this.cachedToString =
                this.pointerTo != null ? "*" + this.pointerTo.toString() :
                    this.symbol.name;
        }
        return this.cachedToString;
    };
    Type.prototype.findMember = function (name, hint) {
        var symbol = this.symbol;
        return symbol != null && symbol.scope != null ? symbol.scope.findLocal(name, hint) : null;
    };
    Type.prototype.hasInstanceMembers = function () {
        var symbol = this.symbol;
        return symbol != null && (symbol.kind == symbol_1.SymbolKind.TYPE_TEMPLATE || symbol.kind == symbol_1.SymbolKind.TYPE_CLASS || symbol.kind == symbol_1.SymbolKind.TYPE_NATIVE);
    };
    return Type;
}());
exports.Type = Type;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var scanner_1 = __webpack_require__(9);
var log_1 = __webpack_require__(2);
var node_1 = __webpack_require__(5);
var assert_1 = __webpack_require__(0);
var terminal_1 = __webpack_require__(1);
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
var ParserContext = (function () {
    function ParserContext() {
    }
    ParserContext.prototype.peek = function (kind) {
        return this.current.kind == kind;
    };
    ParserContext.prototype.eat = function (kind) {
        if (this.peek(kind)) {
            this.advance();
            return true;
        }
        return false;
    };
    ParserContext.prototype.advance = function () {
        if (!this.peek(scanner_1.TokenKind.END_OF_FILE)) {
            this.previous = this.current;
            this.current = this.current.next;
        }
    };
    ParserContext.prototype.unexpectedToken = function () {
        if (this.lastError != this.current) {
            this.lastError = this.current;
            this.log.error(this.current.range, "Unexpected " + scanner_1.tokenToString(this.current.kind));
        }
    };
    ParserContext.prototype.expect = function (kind) {
        if (!this.peek(kind)) {
            if (this.lastError != this.current) {
                this.lastError = this.current;
                var previousLine = this.previous.range.enclosingLine();
                var currentLine = this.current.range.enclosingLine();
                // Show missing token errors on the previous line for clarity
                if (kind != scanner_1.TokenKind.IDENTIFIER && !previousLine.equals(currentLine)) {
                    this.log.error(previousLine.rangeAtEnd(), "Expected " + scanner_1.tokenToString(kind));
                }
                else {
                    this.log.error(this.current.range, "Expected " + scanner_1.tokenToString(kind) + " but found " + scanner_1.tokenToString(this.current.kind));
                }
            }
            return false;
        }
        this.advance();
        return true;
    };
    ParserContext.prototype.parseUnaryPrefix = function (kind, mode) {
        assert_1.assert(node_1.isUnary(kind));
        var token = this.current;
        this.advance();
        var value = this.parseExpression(Precedence.UNARY_PREFIX, mode);
        if (value == null) {
            return null;
        }
        return node_1.createUnary(kind, value).withRange(log_1.spanRanges(token.range, value.range)).withInternalRange(token.range);
    };
    ParserContext.prototype.parseBinary = function (kind, left, localPrecedence, operatorPrecedence) {
        if (localPrecedence >= operatorPrecedence) {
            return left;
        }
        var token = this.current;
        this.advance();
        // Reduce the precedence for right-associative operators
        var precedence = isRightAssociative(operatorPrecedence) ? (operatorPrecedence - 1) : operatorPrecedence;
        var right = this.parseExpression(precedence, ParseKind.EXPRESSION);
        if (right == null) {
            return null;
        }
        return node_1.createBinary(kind, left, right).withRange(log_1.spanRanges(left.range, right.range)).withInternalRange(token.range);
    };
    ParserContext.prototype.parseUnaryPostfix = function (kind, value, localPrecedence) {
        if (localPrecedence >= Precedence.UNARY_POSTFIX) {
            return value;
        }
        var token = this.current;
        this.advance();
        return node_1.createUnary(kind, value).withRange(log_1.spanRanges(value.range, token.range)).withInternalRange(token.range);
    };
    ParserContext.prototype.parseQuotedString = function (range) {
        assert_1.assert(range.end - range.start >= 2);
        var text = range.source.contents;
        var end = range.start + 1;
        var limit = range.end - 1;
        var start = end;
        var quotedString = "";
        while (end < limit) {
            var c = text[end];
            if (c == '\\') {
                quotedString += text.slice(start, end);
                end = end + 1;
                start = end + 1;
                c = text[end];
                if (c == '0')
                    quotedString += '\0';
                else if (c == 't')
                    quotedString += '\t';
                else if (c == 'n')
                    quotedString += '\n';
                else if (c == 'r')
                    quotedString += '\r';
                else if (c == '"' || c == '\'' || c == '`' || c == '\n' || c == '\\')
                    start = end;
                else {
                    var escape = log_1.createRange(range.source, range.start + end - 1, range.start + end + 1);
                    this.log.error(escape, "Invalid escape code '" + escape.toString() + "'");
                    return null;
                }
            }
            end = end + 1;
        }
        return quotedString + text.slice(start, end);
    };
    ParserContext.prototype.parsePrefix = function (mode) {
        var token = this.current;
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
                var text = this.parseQuotedString(token.range);
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
                var text = this.parseQuotedString(token.range);
                if (text == null) {
                    return null;
                }
                this.advance();
                return node_1.createString(text).withRange(token.range);
            }
            if (this.peek(scanner_1.TokenKind.INT32)) {
                var value = node_1.createInt(0);
                if (!this.parseInt(token.range, value)) {
                    value = node_1.createParseError();
                }
                this.advance();
                return value.withRange(token.range);
            }
            if (this.peek(scanner_1.TokenKind.FLOAT32)) {
                var value = node_1.createFloat(0);
                if (!this.parseFloat(token.range, value)) {
                    value = node_1.createParseError();
                }
                this.advance();
                return value.withRange(token.range);
            }
            if (this.peek(scanner_1.TokenKind.FLOAT64)) {
                var value = node_1.createDouble(0);
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
                var type = this.parseType();
                if (type == null) {
                    return null;
                }
                if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
                    var parameters = this.parseParameters();
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
                var type = this.parseType();
                var close_1 = this.current;
                if (type == null || !this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                    return null;
                }
                return node_1.createAlignOf(type).withRange(log_1.spanRanges(token.range, close_1.range));
            }
            if (this.eat(scanner_1.TokenKind.SIZEOF)) {
                if (!this.expect(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
                    return null;
                }
                var type = this.parseType();
                var close_2 = this.current;
                if (type == null || !this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                    return null;
                }
                return node_1.createSizeOf(type).withRange(log_1.spanRanges(token.range, close_2.range));
            }
            if (this.eat(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
                var value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                var close_3 = this.current;
                if (value == null || !this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                    return null;
                }
                return value.withRange(log_1.spanRanges(token.range, close_3.range));
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
            terminal_1.Terminal.write("Check if its JS");
        }
        this.unexpectedToken();
        return null;
    };
    ParserContext.prototype.parseInfix = function (precedence, node, mode) {
        var token = this.current.range;
        // Dot
        if (this.peek(scanner_1.TokenKind.DOT) && precedence < Precedence.MEMBER) {
            this.advance();
            var name_1 = this.current;
            var range = name_1.range;
            // Allow contextual keywords
            if (scanner_1.isKeyword(name_1.kind)) {
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
                var type = this.parseType();
                if (type == null) {
                    return null;
                }
                return node_1.createCast(node, type).withRange(log_1.spanRanges(node.range, type.range)).withInternalRange(token);
            }
            // Call or index
            var isIndex = this.peek(scanner_1.TokenKind.LEFT_BRACKET);
            if ((isIndex || this.peek(scanner_1.TokenKind.LEFT_PARENTHESIS)) && precedence < Precedence.UNARY_POSTFIX) {
                return this.parseArgumentList(node.range, isIndex ? node_1.createIndex(node) : node_1.createCall(node));
            }
            // Hook
            if (this.peek(scanner_1.TokenKind.QUESTION_MARK) && precedence < Precedence.ASSIGN) {
                this.advance();
                var middle = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (middle == null || !this.expect(scanner_1.TokenKind.COLON)) {
                    return null;
                }
                var right = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (right == null) {
                    return null;
                }
                return node_1.createHook(node, middle, right).withRange(log_1.spanRanges(node.range, right.range));
            }
        }
        return node;
    };
    ParserContext.prototype.parseDelete = function () {
        var token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.DELETE);
        this.advance();
        var value = null;
        if (!this.peek(scanner_1.TokenKind.SEMICOLON)) {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null) {
                return null;
            }
        }
        var semicolon = this.current;
        this.expect(scanner_1.TokenKind.SEMICOLON);
        return node_1.createDelete(value).withRange(log_1.spanRanges(token.range, semicolon.range));
    };
    ParserContext.prototype.parseArgumentList = function (start, node) {
        var open = this.current.range;
        var isIndex = node.kind == node_1.NodeKind.INDEX;
        var left = isIndex ? scanner_1.TokenKind.LEFT_BRACKET : scanner_1.TokenKind.LEFT_PARENTHESIS;
        var right = isIndex ? scanner_1.TokenKind.RIGHT_BRACKET : scanner_1.TokenKind.RIGHT_PARENTHESIS;
        if (!this.expect(left)) {
            return null;
        }
        if (!this.peek(right)) {
            while (true) {
                var value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (value == null) {
                    return null;
                }
                node.appendChild(value);
                if (!this.eat(scanner_1.TokenKind.COMMA)) {
                    break;
                }
            }
        }
        var close = this.current.range;
        if (!this.expect(right)) {
            return null;
        }
        return node.withRange(log_1.spanRanges(start, close)).withInternalRange(log_1.spanRanges(open, close));
    };
    ParserContext.prototype.parseExpression = function (precedence, mode) {
        // Prefix
        var node = this.parsePrefix(mode);
        if (node == null) {
            return null;
        }
        assert_1.assert(node.range != null);
        // Infix
        while (true) {
            var result = this.parseInfix(precedence, node, mode);
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
    };
    ParserContext.prototype.parseType = function () {
        return this.parseExpression(Precedence.UNARY_POSTFIX, ParseKind.TYPE);
    };
    ParserContext.prototype.parseIf = function () {
        var token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.IF);
        this.advance();
        if (!this.expect(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
            return null;
        }
        var value;
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
        var trueBranch = this.parseBody();
        if (trueBranch == null) {
            return null;
        }
        var falseBranch = null;
        if (this.eat(scanner_1.TokenKind.ELSE)) {
            falseBranch = this.parseBody();
            if (falseBranch == null) {
                return null;
            }
        }
        return node_1.createIf(value, trueBranch, falseBranch).withRange(log_1.spanRanges(token.range, (falseBranch != null ? falseBranch : trueBranch).range));
    };
    ParserContext.prototype.parseWhile = function () {
        var token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.WHILE);
        this.advance();
        if (!this.expect(scanner_1.TokenKind.LEFT_PARENTHESIS)) {
            return null;
        }
        var value;
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
        var body = this.parseBody();
        if (body == null) {
            return null;
        }
        return node_1.createWhile(value, body).withRange(log_1.spanRanges(token.range, body.range));
    };
    ParserContext.prototype.parseBody = function () {
        var node = this.parseStatement(StatementMode.NORMAL);
        if (node == null) {
            return null;
        }
        if (node.kind == node_1.NodeKind.BLOCK) {
            return node;
        }
        var block = node_1.createBlock();
        block.appendChild(node);
        return block.withRange(node.range);
    };
    ParserContext.prototype.parseBlock = function () {
        var open = this.current;
        if (!this.expect(scanner_1.TokenKind.LEFT_BRACE)) {
            return null;
        }
        var block = node_1.createBlock();
        if (!this.parseStatements(block)) {
            return null;
        }
        var close = this.current;
        if (!this.expect(scanner_1.TokenKind.RIGHT_BRACE)) {
            return null;
        }
        return block.withRange(log_1.spanRanges(open.range, close.range));
    };
    // parseObject():Node {
    //
    // }
    ParserContext.prototype.parseReturn = function () {
        var token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.RETURN);
        this.advance();
        var value = null;
        if (!this.peek(scanner_1.TokenKind.SEMICOLON)) {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null) {
                return null;
            }
        }
        var semicolon = this.current;
        this.expect(scanner_1.TokenKind.SEMICOLON);
        return node_1.createReturn(value).withRange(log_1.spanRanges(token.range, semicolon.range));
    };
    ParserContext.prototype.parseEmpty = function () {
        var token = this.current;
        this.advance();
        return node_1.createEmpty().withRange(token.range);
    };
    ParserContext.prototype.parseEnum = function (firstFlag) {
        var token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.ENUM);
        this.advance();
        var name = this.current;
        if (!this.expect(scanner_1.TokenKind.IDENTIFIER) || !this.expect(scanner_1.TokenKind.LEFT_BRACE)) {
            return null;
        }
        var text = name.range.toString();
        var node = node_1.createEnum(text);
        node.firstFlag = firstFlag;
        node.flags = node_1.allFlags(firstFlag);
        while (!this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.peek(scanner_1.TokenKind.RIGHT_BRACE)) {
            var member = this.current.range;
            var value = null;
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                return null;
            }
            if (this.eat(scanner_1.TokenKind.ASSIGN)) {
                value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (value == null) {
                    return null;
                }
            }
            var variable = node_1.createVariable(member.toString(), node_1.createName(text), value);
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
        var close = this.current;
        if (!this.expect(scanner_1.TokenKind.RIGHT_BRACE)) {
            return null;
        }
        return node.withRange(log_1.spanRanges(token.range, close.range)).withInternalRange(name.range);
    };
    ParserContext.prototype.parseParameters = function () {
        var node = node_1.createParameters();
        var open = this.current;
        var close;
        assert_1.assert(open.kind == scanner_1.TokenKind.LESS_THAN);
        this.advance();
        while (true) {
            var name_2 = this.current;
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                close = this.current;
                if (this.eat(scanner_1.TokenKind.GREATER_THAN)) {
                    break;
                }
                return null;
            }
            node.appendChild(node_1.createParameter(name_2.range.toString()).withRange(name_2.range));
            if (!this.eat(scanner_1.TokenKind.COMMA)) {
                close = this.current;
                if (!this.expect(scanner_1.TokenKind.GREATER_THAN)) {
                    return null;
                }
                break;
            }
        }
        return node.withRange(log_1.spanRanges(open.range, close.range));
    };
    ParserContext.prototype.parseImports = function () {
        var token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.IMPORT);
        this.advance();
        var node = node_1.createImports();
        node.flags = node.flags | scanner_1.TokenKind.IMPORT;
        if (this.peek(scanner_1.TokenKind.MULTIPLY)) {
            this.log.error(this.current.range, "wildcard '*' import not supported");
            assert_1.assert(this.eat(scanner_1.TokenKind.MULTIPLY));
            assert_1.assert(this.eat(scanner_1.TokenKind.AS));
            var importName = this.current;
            var range = importName.range;
            var _import = node_1.createImport(importName.range.toString());
            node.appendChild(_import.withRange(range).withInternalRange(importName.range));
            this.advance();
        }
        else {
            if (!this.expect(scanner_1.TokenKind.LEFT_BRACE)) {
                return null;
            }
            while (!this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.peek(scanner_1.TokenKind.RIGHT_BRACE)) {
                var importName = this.current;
                var range = importName.range;
                var _import = node_1.createImport(importName.range.toString());
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
        var importFrom = this.current;
        var _from = node_1.createImportFrom(importFrom.range.toString());
        node.appendChild(_from.withRange(importFrom.range).withInternalRange(importFrom.range));
        this.advance();
        var semicolon = this.current;
        this.expect(scanner_1.TokenKind.SEMICOLON);
        return node.withRange(log_1.spanRanges(token.range, semicolon.range));
    };
    ParserContext.prototype.parseModule = function (firstFlag) {
        var token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.MODULE);
        this.advance();
        var name = this.current;
        if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
            return null;
        }
        var node = node_1.createModule(name.range.toString());
        node.firstFlag = firstFlag;
        node.flags = node_1.allFlags(firstFlag);
        // Type parameters
        if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
            var parameters = this.parseParameters();
            if (parameters == null) {
                return null;
            }
            node.appendChild(parameters);
        }
        if (!this.expect(scanner_1.TokenKind.LEFT_BRACE)) {
            return null;
        }
        while (!this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.peek(scanner_1.TokenKind.RIGHT_BRACE)) {
            var childFlags = this.parseFlags();
            var childName = this.current;
            var oldKind = childName.kind;
            // Support contextual keywords
            if (scanner_1.isKeyword(childName.kind)) {
                childName.kind = scanner_1.TokenKind.IDENTIFIER;
                this.advance();
            }
            // The identifier must come first without any keyword
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                return null;
            }
            var text = childName.range.toString();
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
                var isGet = text == "get";
                var isSet = text == "set";
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
                    this.log.error(childName.range, "Instance variables don't need the '" + childName.range.toString() + "' keyword");
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
        var close = this.current;
        if (!this.expect(scanner_1.TokenKind.RIGHT_BRACE)) {
            return null;
        }
        return node.withRange(log_1.spanRanges(token.range, close.range)).withInternalRange(name.range);
    };
    ParserContext.prototype.parseClass = function (firstFlag) {
        var token = this.current;
        assert_1.assert(token.kind == scanner_1.TokenKind.CLASS);
        this.advance();
        var name = this.current;
        if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
            return null;
        }
        var node = node_1.createClass(name.range.toString());
        node.firstFlag = firstFlag;
        node.flags = node_1.allFlags(firstFlag);
        // Type parameters
        if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
            var parameters = this.parseParameters();
            if (parameters == null) {
                return null;
            }
            node.appendChild(parameters);
        }
        // "extends" clause
        var extendsToken = this.current;
        if (this.eat(scanner_1.TokenKind.EXTENDS)) {
            var type = void 0;
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
        var implementsToken = this.current;
        if (this.eat(scanner_1.TokenKind.IMPLEMENTS)) {
            var list = node_1.createImplements();
            var type = null;
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
            var childFlags = this.parseFlags();
            var childName = this.current;
            var oldKind = childName.kind;
            // Support contextual keywords
            if (scanner_1.isKeyword(childName.kind)) {
                childName.kind = scanner_1.TokenKind.IDENTIFIER;
                this.advance();
            }
            // The identifier must come first without any keyword
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                return null;
            }
            var text = childName.range.toString();
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
                var isGet = text == "get";
                var isSet = text == "set";
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
                    this.log.error(childName.range, "Instance variables don't need the '" + childName.range.toString() + "' keyword");
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
        var close = this.current;
        if (!this.expect(scanner_1.TokenKind.RIGHT_BRACE)) {
            return null;
        }
        return node.withRange(log_1.spanRanges(token.range, close.range)).withInternalRange(name.range);
    };
    ParserContext.prototype.parseFunction = function (firstFlag, parent) {
        var isOperator = false;
        var token = this.current;
        var nameRange;
        var name;
        // Support custom operators
        if (parent != null && this.eat(scanner_1.TokenKind.OPERATOR)) {
            var end = this.current;
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
                this.log.error(nameRange, "The operator '" + name + "' cannot be implemented " + (end.kind == scanner_1.TokenKind.NOT_EQUAL ? "(it is automatically derived from '==')" :
                    end.kind == scanner_1.TokenKind.LESS_THAN_EQUAL ? "(it is automatically derived from '>')" :
                        end.kind == scanner_1.TokenKind.GREATER_THAN_EQUAL ? "(it is automatically derived from '<')" :
                            ""));
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
        var node = node_1.createFunction(name);
        node.firstFlag = firstFlag;
        node.flags = node_1.allFlags(firstFlag);
        if (isOperator) {
            node.flags = node.flags | node_1.NODE_FLAG_OPERATOR;
        }
        // Type parameters
        if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
            var parameters = this.parseParameters();
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
                var firstArgumentFlag = this.parseFlags();
                var argument = this.current;
                ;
                if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                    return null;
                }
                var type = void 0;
                var value = null;
                var range = argument.range;
                if (this.expect(scanner_1.TokenKind.COLON)) {
                    type = this.parseType();
                    if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
                        var parameters = this.parseParameters();
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
                var firstType = type;
                //Type alias
                while (this.eat(scanner_1.TokenKind.BITWISE_OR)) {
                    var aliasType = this.parseType();
                    if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
                        var parameters = this.parseParameters();
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
                var variable = node_1.createVariable(argument.range.toString(), firstType, value);
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
        var returnType;
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
                    var parameters = this.parseParameters();
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
                var firstType = returnType;
                //Type alias
                while (this.eat(scanner_1.TokenKind.BITWISE_OR)) {
                    var aliasType = this.parseType();
                    if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
                        var parameters = this.parseParameters();
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
        var block = null;
        // Is this an import?
        var semicolon = this.current;
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
    };
    ParserContext.prototype.parseVariables = function (firstFlag, parent) {
        var token = this.current;
        // Variables inside class declarations don't use "var"
        if (parent == null) {
            assert_1.assert(token.kind == scanner_1.TokenKind.CONST || token.kind == scanner_1.TokenKind.LET || token.kind == scanner_1.TokenKind.VAR);
            this.advance();
        }
        var node = token.kind == scanner_1.TokenKind.CONST ? node_1.createConstants() : node_1.createVariables();
        node.firstFlag = firstFlag;
        while (true) {
            var name_3 = this.current;
            if (!this.expect(scanner_1.TokenKind.IDENTIFIER)) {
                return null;
            }
            var type = null;
            if (this.eat(scanner_1.TokenKind.COLON)) {
                type = this.parseType();
                if (this.peek(scanner_1.TokenKind.LESS_THAN)) {
                    var parameters = this.parseParameters();
                    if (parameters == null) {
                        return null;
                    }
                    type.appendChild(parameters);
                }
                if (type == null) {
                    return null;
                }
            }
            var value = null;
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
            var range = value != null ? log_1.spanRanges(name_3.range, value.range) :
                type != null ? log_1.spanRanges(name_3.range, type.range) :
                    name_3.range;
            var variable = node_1.createVariable(name_3.range.toString(), type, value);
            variable.firstFlag = firstFlag;
            variable.flags = node_1.allFlags(firstFlag);
            (parent != null ? parent : node).appendChild(variable.withRange(range).withInternalRange(name_3.range));
            if (!this.eat(scanner_1.TokenKind.COMMA)) {
                break;
            }
        }
        var semicolon = this.current;
        this.expect(scanner_1.TokenKind.SEMICOLON);
        return node.withRange(log_1.spanRanges(token.range, semicolon.range));
    };
    ParserContext.prototype.parseLoopJump = function (kind) {
        var token = this.current;
        this.advance();
        this.expect(scanner_1.TokenKind.SEMICOLON);
        var node = new node_1.Node();
        node.kind = kind;
        return node.withRange(token.range);
    };
    ParserContext.prototype.parseFlags = function () {
        var firstFlag = null;
        var lastFlag = null;
        while (true) {
            var token = this.current;
            var flag = void 0;
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
            var link = new node_1.NodeFlag();
            link.flag = flag;
            link.range = token.range;
            if (firstFlag == null)
                firstFlag = link;
            else
                lastFlag.next = link;
            lastFlag = link;
        }
    };
    ParserContext.prototype.parseUnsafe = function () {
        var token = this.current;
        this.advance();
        var node = this.parseBlock();
        if (node == null) {
            return null;
        }
        node.flags = node.flags | node_1.NODE_FLAG_UNSAFE;
        return node.withRange(log_1.spanRanges(token.range, node.range));
    };
    ParserContext.prototype.parseJavaScript = function () {
        var token = this.current;
        this.advance();
        var node = this.parseBlock();
        if (node == null) {
            return null;
        }
        node.flags = node.flags | node_1.NODE_FLAG_JAVASCRIPT;
        return node.withRange(log_1.spanRanges(token.range, node.range));
    };
    ParserContext.prototype.parseStart = function () {
        var token = this.current;
        this.advance();
        var node = this.parseBlock();
        if (node == null) {
            return null;
        }
        node.flags = node.flags | node_1.NODE_FLAG_START;
        return node.withRange(log_1.spanRanges(token.range, node.range));
    };
    ParserContext.prototype.parseVirtual = function (firstFlag) {
        var token = this.current;
        this.advance();
        var node = this.parseFunction(firstFlag, null);
        if (node == null) {
            return null;
        }
        node.flags = node.flags | node_1.NODE_FLAG_VIRTUAL;
        return node.withRange(log_1.spanRanges(token.range, node.range));
    };
    ParserContext.prototype.parseStatement = function (mode) {
        var firstFlag = mode == StatementMode.FILE ? this.parseFlags() : null;
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
        var value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
        if (value == null) {
            return null;
        }
        var semicolon = this.current;
        this.expect(scanner_1.TokenKind.SEMICOLON);
        return node_1.createExpression(value).withRange(log_1.spanRanges(value.range, semicolon.range));
    };
    ParserContext.prototype.parseStatements = function (parent) {
        while (!this.peek(scanner_1.TokenKind.END_OF_FILE) && !this.peek(scanner_1.TokenKind.RIGHT_BRACE)) {
            var child = this.parseStatement(parent.kind == node_1.NodeKind.FILE ? StatementMode.FILE : StatementMode.NORMAL);
            if (child == null) {
                return false;
            }
            if (child.kind === node_1.NodeKind.RETURN) {
                parent.returnNode = child;
            }
            parent.appendChild(child);
        }
        return true;
    };
    ParserContext.prototype.parseInt = function (range, node) {
        var source = range.source;
        var contents = source.contents;
        node.intValue = parseInt(contents.substring(range.start, range.end));
        node.flags = node_1.NODE_FLAG_POSITIVE;
        return true;
    };
    ParserContext.prototype.parseFloat = function (range, node) {
        var source = range.source;
        var contents = source.contents;
        node.floatValue = parseFloat(contents.substring(range.start, range.end));
        node.flags = node_1.NODE_FLAG_POSITIVE;
        return true;
    };
    ParserContext.prototype.parseDouble = function (range, node) {
        var source = range.source;
        var contents = source.contents;
        node.doubleValue = parseFloat(contents.substring(range.start, range.end));
        node.flags = node_1.NODE_FLAG_POSITIVE;
        return true;
    };
    return ParserContext;
}());
function parse(firstToken, log) {
    var context = new ParserContext();
    context.current = firstToken;
    context.log = log;
    var file = new node_1.Node();
    file.kind = node_1.NodeKind.FILE;
    if (!context.parseStatements(file)) {
        return null;
    }
    return file;
}
exports.parse = parse;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 06.06.17.
 */
exports.Color = {
    DEFAULT_TEXT: 12,
    DEFAULT_BG: 8,
    BLACK: 0,
    WHITE: 255,
    BOLD: 1,
    RED: 1,
    GREEN: 2,
    YELLOW: 3,
    BLUE: 4,
    MAGENTA: 5,
    ORANGE: 208,
};
var hexColor = {};
hexColor[exports.Color.DEFAULT_TEXT] = "#000000";
hexColor[exports.Color.DEFAULT_BG] = "#FFFFFF";
hexColor[exports.Color.BLACK] = "#000000";
hexColor[exports.Color.WHITE] = "#FFFFFF";
hexColor[exports.Color.BOLD] = "";
hexColor[exports.Color.RED] = "#FF0000";
hexColor[exports.Color.GREEN] = "#00FF00";
hexColor[exports.Color.BLUE] = "#0000FF";
hexColor[exports.Color.YELLOW] = "#FFF600";
hexColor[exports.Color.MAGENTA] = "#FF00FF";
hexColor[exports.Color.ORANGE] = "#FF8C00";
exports.HexColor = hexColor;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 06.06.17.
 */
exports.isBrowser = new Function("try {return this===window;}catch(e){ return false;}")();
exports.isNode = new Function("try {return this===global;}catch(e){return false;}")();


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var env_1 = __webpack_require__(21);
var terminal_1 = __webpack_require__(1);
/**
 * Created by n.vinayakan on 06.06.17.
 */
if (typeof Map === "undefined") {
    var Map = function () {
        var _this = this;
        this.get = function (key) { return _this[key]; };
        this.set = function (key, value) { return _this[key] = value; };
    };
}
var fs = null;
var virtualFileSystem = {
    fileMap: new Map(),
    readFileSync: function (path, options) {
        return fs.fileMap.get(path);
    },
    writeFileSync: function (path, data, options) {
        return fs.fileMap.set(path, data);
    }
};
if (env_1.isBrowser) {
    // Terminal.write("----> Browser environment");
    fs = virtualFileSystem;
    window["Buffer"] = (function () {
        function NodeBuffer(array) {
            this.array = array;
        }
        return NodeBuffer;
    }());
}
else if (env_1.isNode) {
    // Terminal.write("----> NodeJS environment");
    fs = __webpack_require__(55);
}
else {
    terminal_1.Terminal.error("----> Unknown host environment!!!. Where are we?");
}
var FileSystem = (function () {
    function FileSystem() {
    }
    FileSystem.readTextFile = function (path) {
        try {
            return fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
        }
        catch (e) {
            var virtualFile = virtualFileSystem.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
            return virtualFile === undefined ? null : virtualFile;
        }
    };
    FileSystem.writeTextFile = function (path, contents, virtual) {
        if (virtual === void 0) { virtual = false; }
        try {
            if (virtual) {
                virtualFileSystem.writeFileSync(path, contents);
            }
            else {
                fs.writeFileSync(path, contents);
            }
            return true;
        }
        catch (e) {
            return false;
        }
    };
    FileSystem.readBinaryFile = function (path) {
        try {
            return fs.readFileSync(path);
        }
        catch (e) {
            var virtualFile = virtualFileSystem.readFileSync(path);
            return virtualFile === undefined ? null : virtualFile;
        }
    };
    FileSystem.writeBinaryFile = function (path, contents, virtual) {
        if (virtual === void 0) { virtual = false; }
        try {
            if (virtual) {
                virtualFileSystem.writeFileSync(path, new Buffer(contents.array.subarray(0, contents.length)));
            }
            else {
                fs.writeFileSync(path, new Buffer(contents.array.subarray(0, contents.length)));
            }
            return true;
        }
        catch (e) {
            return false;
        }
    };
    return FileSystem;
}());
exports.FileSystem = FileSystem;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="declarations.d.ts" />
var log_1 = __webpack_require__(2);
var compiler_1 = __webpack_require__(11);
var compile_target_1 = __webpack_require__(4);
var terminal_1 = __webpack_require__(1);
var filesystem_1 = __webpack_require__(22);
var compiler_options_1 = __webpack_require__(47);
/**
 * TurboScript compiler main entry
 */
var CommandLineArgument = (function () {
    function CommandLineArgument() {
    }
    return CommandLineArgument;
}());
exports.CommandLineArgument = CommandLineArgument;
var firstArgument;
var lastArgument;
function main_addArgument(text) {
    var argument = new CommandLineArgument();
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
    terminal_1.Terminal.write("\nUsage: tc [FLAGS] [INPUTS]\n\n  --help           Print this message.\n  --out [PATH]     Emit code to PATH (the target format is the file extension).\n    --wasm         Explicit webassembly output \n  --define [NAME]  Define the flag NAME in all input files.\n\nExamples:\n\n  tc src/*.tbs --out main.wasm\n");
}
exports.printUsage = printUsage;
function main_entry() {
    var target = compile_target_1.CompileTarget.NONE;
    var argument = firstArgument;
    var inputCount = 0;
    var output;
    // Print usage by default
    if (firstArgument == null) {
        printUsage();
        return 1;
    }
    // Initial pass over the argument list
    while (argument != null) {
        var text = argument.text;
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
                terminal_1.Terminal.error("Invalid flag: " + text);
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
        terminal_1.Terminal.error("No input files");
        return 1;
    }
    // Must have an output
    if (output == null) {
        terminal_1.Terminal.error("Missing an output file (use the --out flag)");
        return 1;
    }
    // Automatically set the target based on the file extension
    //C emitter and vanilla javascript emitter is disabled due to outdated code base.
    if (target == compile_target_1.CompileTarget.NONE) {
        if (output.endsWith(".wasm"))
            target = compile_target_1.CompileTarget.WEBASSEMBLY;
        else {
            // Terminal.error("Missing a target (use either --c, --js, --asmjs or --wasm)");
            terminal_1.Terminal.error("Missing a target (use either --asmjs or --wasm)");
            return 1;
        }
    }
    // Start the compilation
    var compiler = new compiler_1.Compiler();
    compiler.initialize(target, output);
    // Second pass over the argument list
    argument = firstArgument;
    while (argument != null) {
        var text = argument.text;
        if (text == "--define") {
            argument = argument.next;
            compiler.preprocessor.define(argument.text, true);
        }
        else if (text == "--out") {
            argument = argument.next;
        }
        else if (!text.startsWith("-")) {
            var contents = filesystem_1.FileSystem.readTextFile(text);
            if (contents == null) {
                terminal_1.Terminal.error("Cannot read from " + text);
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
                filesystem_1.FileSystem.writeTextFile(compiler_1.replaceFileExtension(output, ".wast"), compiler.outputWAST) &&
                filesystem_1.FileSystem.writeTextFile(output + ".log", compiler.outputWASM.log)) {
            terminal_1.Terminal.write("\n");
            return 0;
        }
        terminal_1.Terminal.error("Cannot write to " + output);
    }
    terminal_1.Terminal.write("\n");
    return 1;
}
exports.main_entry = main_entry;
exports.main = {
    addArgument: main_addArgument,
    reset: main_reset,
    entry: main_entry
};
function compileString(source, options) {
    if (options === void 0) { options = compiler_options_1.defaultCompilerOptions; }
    terminal_1.Terminal.silent = options.silent;
    var input = "/virtual/inline.tbs";
    var output = "/virtual/inline.wasm";
    filesystem_1.FileSystem.writeTextFile(input, source, true);
    var compiler = new compiler_1.Compiler();
    compiler.initialize(options.target, output);
    compiler.addInput(input, source);
    compiler.finish();
    terminal_1.Terminal.silent = false;
    if (!compiler.log.hasErrors()) {
        return {
            success: true,
            wasm: compiler.outputWASM.array,
            wast: "WebAssembly text format output is not yet supported!\nPlease check wasm binary data."
        };
    }
    else {
        if (!options.silent || options.logError) {
            log_1.writeLogToTerminal(compiler.log);
        }
        return {
            success: false,
            log: compiler.log
        };
    }
}
exports.compileString = compileString;
exports.version = "1.0.0-beta";
exports.default = {
    version: exports.version,
    main: exports.main,
    compileString: compileString
};


/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = "declare class Math {\n    static abs(x: float32): float32;\n    static acos(x: float64): float64;\n    static asin(x: float64): float64;\n    static atan(x: float64): float64;\n    static atan2(y: float64, x: float64): float64;\n    static ceil(x: float32): float32;\n    static cos(x: float64): float64;\n    static exp(x: float64): float64;\n    static floor(x: float32): float32;\n    static log(x: float64): float64;\n    // static max(...values: float64[]): float64;\n    static max(a: float64, b:float64): float64;\n    // static min(...values: float64[]): float64;\n    static min(a: float64, b:float64): float64;\n    static pow(x: float64, y: float64): float64;\n    static random(): float64; // 'random' is not a standard Math builtin\n    // static round(x: float64): float64; //'round' is not a standard Math builtin\n    static sin(x: float64): float64;\n    static sqrt(x: float32): float32;\n    static tan(x: float64): float64;\n    static imul(a: int32, b:int32): int32;\n}\n\nfunction absf32(x:float32):float32{\n    return Math.abs(x) as float32;\n}\n\nfunction sqrtf32(x:float32):float32{\n    return Math.sqrt(x);\n}\n\nfunction powf32(x:float32, y:float32):float32{\n    return Math.pow(x as float64, y as float64) as float32;\n}\n\nfunction minf32(x:float32, y:float32):float32{\n    return Math.min(x as float64, y as float64) as float32;\n}\nfunction maxf32(x:float32, y:float32):float32{\n    return Math.max(x as float64, y as float64) as float32;\n}\n\ndeclare function modf32(a:float32, b:float32):float32;\ndeclare function modf64(a:float64, b:float64):float64;\n"

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = "class Array<T> {\n\n    bytesLength: int32;\n    elementSize: int32;\n\n    constructor(bytesLength: int32, elementSize: int32) {\n        this.bytesLength = bytesLength;\n        this.elementSize = elementSize;\n    }\n\n    operator [] (index: int32): T {\n        let stripe = index * this.elementSize;\n        if (stripe >= 0 && stripe < this.bytesLength) {\n            return *((this as *uint8 + 8 + stripe) as *T);\n        }\n        return null as T;\n    }\n\n    operator []= (index: int32, value: T): void {\n        let stripe = index * this.elementSize;\n        if (stripe >= 0 && stripe < this.bytesLength) {\n            *((this as *uint8 + 8 + stripe) as *T) = value;\n        }\n    }\n\n    get length(): int32 {\n        return this.bytesLength / this.elementSize;\n    }\n}\n\n//declare type Int32Array   = Array< int32 >\n//declare type Uint32Array  = Array< uint32 >\n//declare type Int64Array   = Array< int64 >\n//declare type Uint64Array  = Array< uint64 >\n//declare type Float32Array = Array< float32 >\n//declare type Float64Array = Array< float64 >\n"

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = "var originalHeapPointer: *uint8 = null;\nvar currentHeapPointer: *uint8 = null;\n\nvar freeMemory: int32 = 0;\nvar numFreeChunks: int32 = 0;\nvar firstFree: int32 = 0;\nvar lastFree: int32 = 0;\n\nconst PREV_INUSE:int32 = 1;\nconst IS_MMAPPED:int32 = 2;\nconst NON_MAIN_ARENA:int32 = 4;\nconst SIZE_BITS:int32 = PREV_INUSE|IS_MMAPPED|NON_MAIN_ARENA;\n\n//An allocated chunk looks like this:\n/*\n    chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Size of previous chunk, if allocated            | |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Size of chunk, in bytes                         |P|\n      mem-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             User data starts here...                          .\n            .                                                               .\n            .             (malloc_usable_size() bytes)                      .\n            .                                                               |\nnextchunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Size of chunk                                     |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n*/\n//Free chunks are stored in circular doubly-linked lists, and look like this:\n/*\n    chunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Size of previous chunk                            |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n    `head:' |             Size of chunk, in bytes                         |P|\n      mem-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Forward pointer to next chunk in list             |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Back pointer to previous chunk in list            |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n            |             Unused space (may be 0 bytes long)                .\n            .                                                               .\n            .                                                               |\nnextchunk-> +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n    `foot:' |             Size of chunk, in bytes                           |\n            +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n*/\n\n// function init_malloc():void{\n//     numFreeChunks = 0;\n//     firstFree = 0;\n//     lastFree = 0;\n//     originalHeapPointer = 40 as *uint8;//this will override by compiler\n//     currentHeapPointer  = 40 as *uint8;//this will override by compiler\n// }\n\nexport function malloc(size: int32): *uint8 {\n\n    //All loc variable should declare here before assigning named value\n    var alignment:int32 = 8;\n\n    size = (size + (alignment - 1)) & ~(alignment - 1) as int32;\n    var chunkSize = size + 8;\n\n    var freeChunk = getFreeChunk(chunkSize);\n     if(freeChunk as int32 > 0){\n        return freeChunk;\n    }\n\n    var offset:int32 = currentHeapPointer as int32;\n    offset = offset + 7;\n    offset = offset & ~7;\n    // offset = ((currentHeapPointer as int32 + 7) & ~(7) as int32) as *uint8;\n\n    var top = offset + chunkSize;\n\n    var ptr = (offset + 4) as *uint8; //skip prev size\n    setHeadSize(ptr, chunkSize);\n    setInuse((ptr + 4) as *uint8);\n    setFoot(ptr, chunkSize);\n\n    currentHeapPointer = (top + 4) as *uint8;\n\n    offset = offset + 8;\n\n    // Make sure the memory starts off at zero\n    ptr = offset as *uint8;\n    while ((ptr as int32) < (top as int32)) {\n      *(ptr as *int32) = 0;\n      ptr = ptr + 4;\n    }\n\n    return offset as *uint8;\n}\nexport function free(ptr:*uint8):void{\n\n    var chunkptr:*uint8 = null;\n    var tmp1:int32 = 0;\n\n    clearInuse(ptr);\n    if(firstFree == 0){\n        firstFree = ptr as int32;\n    }\n\n    tmp1 = freeMemory as int32;\n    tmp1 = tmp1 + getChunkSize(ptr) as int32;\n    freeMemory = tmp1 as int32;\n\n    chunkptr = ptr + 4;\n    if(lastFree > 0){\n        *(chunkptr as *int32) = lastFree;//backward pointer to prev chunk\n        *(lastFree as *int32) = ptr as int32;//forward pointer to next chunk of prev chunk\n    }else{\n        *(chunkptr as *int32) = 0;//no backward pointer, this is the first free chunk\n    }\n\n    *(ptr as *int32) = 0;//no forward pointer\n\n    lastFree = ptr as int32;\n    numFreeChunks = numFreeChunks + 1;\n}\n/*export*/function getFreeChunk(size: int32):*uint8{\n\n    var freeChunk:*uint8 = null;\n    var tmp1:int32 = 0;\n    var tmp2:int32 = 0;\n    var tmp3:int32 = 0;\n    var tmp4:int32 = 0;\n\n    tmp1 = firstFree;\n    tmp2 = lastFree;\n    tmp3 = freeMemory;\n\n    if(numFreeChunks > 0){\n        freeChunk = findChunk(size);\n        if(freeChunk as int32 > 0){\n            if(freeChunk as int32 == tmp1){\n                firstFree = nextFree(freeChunk) as int32;\n            }\n            if(freeChunk as int32 == tmp2){\n                lastFree = 0;\n            }\n            numFreeChunks = numFreeChunks - 1;\n            setInuse(freeChunk);\n            tmp4 = getChunkSize(freeChunk);\n            tmp3 = tmp3 - tmp4;\n            freeMemory = tmp3;\n        }\n    }\n    return freeChunk;\n}\n/*export*/function findChunk(size: int32):*uint8{\n    var chunk:*uint8 = null;\n    var tmp1:int32 = 0;\n\n    chunk = firstFree as *uint8;\n    while(chunk != null){\n        tmp1= getChunkSize(chunk);\n        if(tmp1 == size){\n            return chunk;\n        }\n        chunk = *(chunk as *int32) as *uint8;\n    }\n    return null;\n}\n/*export*/ function getHeapPtr(): int32 {\n    return currentHeapPointer as int32;\n}\n/*export*/ function getFreeMemory(): int32 {\n    return freeMemory;\n}\n/*export*/ function getOriginalHeapPtr(): int32 {\n    return originalHeapPointer as int32;\n}\nfunction getNumFreeChunks():int32{\n    return numFreeChunks as int32;\n}\n/*export*/function getFirstFree():int32{\n    return firstFree;\n}\n/*export*/function getLastFree():int32{\n    return lastFree;\n}\n/*export*/function prevFree(ptr:*uint8):int32{\n    return  *(ptr as *int32 + 4) as int32;\n}\n/*export*/function nextFree(ptr:*uint8):int32{\n    return *(ptr as *int32) as int32;\n}\n/* Set size at head, without disturbing its use bit */\nfunction setHeadSize(ptr:*uint8, s:int32):void  {\n    *(ptr as *int32) = (*(ptr as *int32) & SIZE_BITS) | s;\n}\n\n/* Set size/use field */\nfunction setHead(ptr:*uint8, s:int32):void {\n   *(ptr as *int32) = s;\n}\n\n/* Set size at footer (only when chunk is not in use) */\nfunction setFoot(ptr:*uint8, s:int32):void {\n    var chunkptr:int32 = 0;\n    var size:int32 = 0;\n    size = *(ptr as *int32);\n    chunkptr = (ptr as int32) + size;\n    *(chunkptr as *int32) = s;\n}\n\n/*export*/function getPrevInuse(ptr:*uint8):int32 {\n    var chunkptr:int32 = 0;\n    chunkptr = (ptr as int32) - 8;\n    return *(chunkptr as *int32) & (PREV_INUSE);\n}\n/*export*/function setInuse(ptr:*uint8):void{\n    var chunkptr:int32 = 0;\n    chunkptr = (ptr as int32) - 4;\n    *(chunkptr as *int32) =  *(chunkptr as *int32) | PREV_INUSE;\n}\n/*export*/function getInuse(ptr:*uint8):int32{\n    var chunkptr:int32 = 0;\n    chunkptr = (ptr as int32) - 4;\n    return *(chunkptr as *int32) & (PREV_INUSE);\n}\n/*export*/function clearInuse(ptr:*uint8):void{\n    var chunkptr:int32 = 0;\n    chunkptr = (ptr as int32) - 4;\n    *(chunkptr as *int32) = *(chunkptr as *int32) & ~(PREV_INUSE);\n}\n/*export*/function getChunkSize(ptr:*uint8):int32{\n    var chunkptr:int32 = 0;\n    chunkptr = (ptr as int32) - 4;\n    return *(chunkptr as *int32) & ~(PREV_INUSE) as int32;\n}\n/* malloc */\n// var SIZE_SZ:int32 = 4;\n// var MALLOC_ALIGNMENT:int32 = 8;//2 * SIZE_SZ;\n// var MALLOC_ALIGN_MASK:int32 = MALLOC_ALIGNMENT - 1;\n//\n// var PREV_INUSE:int32 = 0x1;\n// var IS_MMAPPED:int32 = 0x2;\n// var NON_MAIN_ARENA:int32 = 0x4;\n// var SIZE_BITS:int32 = PREV_INUSE|IS_MMAPPED|NON_MAIN_ARENA;\n//\n// class chunk{\n//     prevSize:int32;\n//     size:int32;\n//     forward:int32;\n//     backward:int32;\n//     forwardLarge:int32;\n//     backwardLarge:int32;\n// }\n// function prev_inuse(p:*chunk):int32 {\n//     return (p as chunk).size & PREV_INUSE;\n// }\n// function chunksize(p:*chunk):int32 {\n//     return (p as chunk).size & ~(SIZE_BITS);\n// }\n// /* Ptr to next physical malloc_chunk. */\n// function next_chunk(p:*chunk):*chunk {\n//     ((*p as int32) + (p as chunk).size & ~(SIZE_BITS)) as *chunk;\n// }\n//\n// /* Ptr to previous physical malloc_chunk */\n// function prev_chunk(p:*chunk):*chunk {\n//     ((*p as int32) - (p as chunk).prevSize) as *chunk;\n// }\n//\n// /* Treat space at ptr + offset as a chunk */\n// function chunk_at_offset(p:*chunk, s:int32):*chunk{\n//     return ((*p as int32) + s) as *chunk;\n// }\n//\n// /* extract p's inuse bit */\n// function inuse(p:*chunk):int32{\n//  return ((*p as int32) + (((p as chunk).size & ~SIZE_BITS) as chunk).size) & PREV_INUSE;\n// }\n//\n// /* set/clear chunk as being inuse without otherwise disturbing */\n// function set_inuse(p:*chunk):int32{\n//  return ((*p as int32) + (((p as chunk).size & ~SIZE_BITS) as chunk).size) = ((*p as int32) + (((p as chunk).size & ~SIZE_BITS) as chunk).size) | PREV_INUSE;\n// }\n//\n// function clear_inuse(p:*chunk):int32{\n//  return ((*p as int32) + (((p as chunk).size & ~SIZE_BITS) as chunk).size) = ((*p as int32) + (((p as chunk).size & ~SIZE_BITS) as chunk).size) & ~(PREV_INUSE);\n// }\n\nfunction memcpy(target: *uint8, source: *uint8, length: int32): void {\n    // No-op if either of the inputs are null\n    if (source == null || target == null) {\n      return;\n    }\n\n    // Optimized aligned copy\n    if (length >= 16 && (source as int32) % 4 == (target as int32) % 4) {\n      // Pick off the beginning\n      while ((target as int32) % 4 != 0) {\n        *target = *source;\n        target = target + 1;\n        source = source + 1;\n        length = length - 1;\n      }\n\n      // Pick off the end\n      while (length % 4 != 0) {\n        length = length - 1;\n        *(target + length) = *(source + length);\n      }\n\n      // Zip over the middle\n      var end = target + length;\n      while (target < end) {\n        *(target as *int32) = *(source as *int32);\n        target = target + 4;\n        source = source + 4;\n      }\n    }\n\n    // Slow unaligned copy\n    else {\n      var end = target + length;\n      while (target < end) {\n        *target = *source;\n        target = target + 1;\n        source = source + 1;\n      }\n    }\n}\n\nfunction memcmp(a: *uint8, b: *uint8, length: int32): int32 {\n    // No-op if either of the inputs are null\n    if (a == null || b == null) {\n      return 0;\n    }\n\n    // Return the first non-zero difference\n    while (length > 0) {\n      var delta = *a as int32 - *b as int32;\n      if (delta != 0) {\n        return delta;\n      }\n      a = a + 1;\n      b = b + 1;\n      length = length - 1;\n    }\n\n    // Both inputs are identical\n    return 0;\n}"

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = "const PI:float64 = 3.141592653589793;\n\nconst MAX_UNSIGNED_INTEGER_32:uint32 = 4294967295;\n\nconst MIN_INTEGER_32:int32 = -2147483648;\nconst MAX_INTEGER_32:int32 = 2147483647;\n\nconst MAX_UNSIGNED_INTEGER_64:int32 = 18446744073709551615;\n\n// −(2^63) to 2^63 − 1\n// const MIN_INTEGER_64:int32 = -powi64(2, 63);\n// const MAX_INTEGER_64:int32 = powi64(2, 63) - 1;\n\n// float remainder\n\n // export function modf64(x:float64, y:float64):float64{\n //\n //         let ir:int32,iy:int32;\n //         let r:float64,w:float64;\n //\n //         if (y == 0 || isNaN(y) || !isFinite(x)) {\n //             return (x * y) / (x * y);\n //         }\n //\n //         r = abs(x);\n //         y = abs(y);\n //         (void)frexp(y,&iy);\n //         while (r >= y) {\n //             (void)frexp(r,&ir);\n //             w = ldexp(y,ir-iy);\n //             r -= w <= r ? w : w*(double)0.5;\n //         }\n //         return x >= (double)0 ? r : -r;\n //     }\n // }"

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = "// Native types\nconst NaN:      float64 = 0.0 / 0.0;\nconst Infinity: float64 = 1.0 / 0.0;\n\nfunction isNaN(value: float32): boolean {\n    return value != value;\n}\n\nfunction isFinite(value: float32): boolean {\n    return !isNaN(value) && value != Infinity && value != -Infinity;\n}\n\ndeclare class boolean {\n    toString(): string;\n}\n\ndeclare class int8 {\n    toString(): string;\n}\n\ndeclare class uint8 {\n    toString(): string;\n}\n\ndeclare class int16 {\n    toString(): string;\n}\n\ndeclare class uint16 {\n    toString(): string;\n}\n\ndeclare class int32 {\n    toString(): string;\n}\n\ndeclare class uint32 {\n    toString(): string;\n}\n\ndeclare class int64 {\n    toString(): string;\n}\n\ndeclare class uint64 {\n    toString(): string;\n}\n\ndeclare class float32 {\n    toString(): string;\n}\n\ndeclare class float64 {\n    toString(): string;\n}\n\ndeclare class string {\n    charAt(index: int32): string;\n\n    charCodeAt(index: int32): uint16;\n\n    get length(): int32;\n\n    indexOf(text: string): int32;\n\n    lastIndexOf(text: string): int32;\n\n    operator == (other: string):boolean;\n    operator [] (index: int32): uint16 { return this.charCodeAt(index); }\n    slice(start: int32, end: int32): string;\n\n    // startsWith(text: string): boolean { return this.slice(0, text.length) == text; }\n    // endsWith(text: string): boolean { return this.slice(-text.length, this.length) == text; }\n}\n"

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = "//part of asm module, we have global, foreign, buffer somewhere above this code\n\nvar HEAP8 = new global.Int8Array(buffer);\nvar HEAP16 = new global.Int16Array(buffer);\nvar HEAP32 = new global.Int32Array(buffer);\nvar HEAPU8 = new global.Uint8Array(buffer);\nvar HEAPU16 = new global.Uint16Array(buffer);\nvar HEAPU32 = new global.Uint32Array(buffer);\nvar HEAPF32 = new global.Float32Array(buffer);\nvar HEAPF64 = new global.Float64Array(buffer);\n\nvar NULL = 0;\nvar STACKTOP=env.STACKTOP|0;\nvar STACK_MAX=env.STACK_MAX|0;\n\n// var PREV_INUSE = 0x1;\n// var PREV_INUSE = 0x1;\n// var IS_MMAPPED = 0x2;\n// var NON_MAIN_ARENA = 0x4;\n// var SIZE_BITS = 0x7;//(PREV_INUSE|IS_MMAPPED|NON_MAIN_ARENA) | 0;\n// var firstFreeChunk = 0;\n// var lastFreeChunk = 0;\n// var numFreeChunks = 0;\n// var freeMemory = 0;\n//var internal_alloc = 0;\n\n// var _now = (typeof global.performance != 'undefined' && typeof global.performance.now == 'function' ?\n//     global.performance.now.bind(global.performance) :\n//     global.Date.now.bind(global.Date));\n// var _now = global.performance;\n// Map of class type IDs to type objects.\n// var _idToType = 8;\n\n// function init() {\n//     HEAP32[2 >> 2] = buffer.byteLength | 0;\n\n    // if (global.isShared) {\n    //     internal_alloc = alloc_sab;\n    //     global.Atomics.store(HEAP32, 1 | 0, 16 | 0);\n    // }\n    // else {\n    //     internal_alloc = alloc_ab;\n    //     HEAP32[1>>2] = 16 | 0;\n    // }\n// }\n\n\n// function malloc(nbytes, alignment) {\n//     nbytes |= 0;\n//     alignment |= 0;\n//     var ptr = alloc_sab(nbytes, alignment);\n//     if (ptr == 0)\n//         throw new Error(\"Out of memory\");\n//     return ptr|0;\n// }\n// function free(ptr) {\n//     ptr |= 0;\n//     clearInuse(ptr);\n//     if (firstFreeChunk == 0) {\n//         firstFreeChunk = ptr;\n//     }\n//\n//     freeMemory = freeMemory + getChunkSize(ptr);\n//\n//     var chunkptr = ptr + 4;\n//     if (lastFreeChunk > 0) {\n//         HEAPU32[chunkptr>>2] = lastFreeChunk;//backward pointer to prev chunk\n//         HEAPU32[lastFreeChunk>>2] = ptr;//forward pointer to next chunk of prev chunk\n//     } else {\n//         HEAPU32[chunkptr>>2] = 0;//no backward pointer, this is the first free chunk\n//     }\n//\n//     HEAPU32[ptr>>2] = 0;//no forward pointer\n//\n//     lastFreeChunk = ptr;\n//     numFreeChunks = numFreeChunks + 1;\n// }\n// function identify(ptr) {\n//     if (ptr == 0)\n//         return 0;\n//     return _idToType[HEAP32[ptr >> 2]];\n// }\n// function _badType(self) {\n//     var t = identify(self);\n//     return new global.Error(\"Observed type: \" + (t ? t.NAME : \"*invalid*\") + \", address=\" + self);\n// }\n// Synchronic layout is 8 bytes (2 x int32) of metadata followed by\n// the type-specific payload.  The two int32 words are the number\n// of waiters and the wait word (generation count).\n//\n// In the following:\n//\n// self is the base address for the Synchronic.\n// mem is the array to use for the value\n// idx is the index in mem of the value: (ptr+8)>>log2(mem.BYTES_PER_ELEMENT)\n//\n// _synchronicLoad is just Atomics.load, expand it in-line.\n/*function _synchronicStore(self, mem, idx, value) {\n    global.Atomics.store(mem, idx, value);\n    _notify(self);\n    return value;\n}\nfunction _synchronicCompareExchange(self, mem, idx, oldval, newval) {\n    var v = global.Atomics.compareExchange(mem, idx, oldval, newval);\n    if (v == oldval)\n        _notify(self);\n    return v;\n}\nfunction _synchronicAdd(self, mem, idx, value) {\n    var v = global.Atomics.add(mem, idx, value);\n    _notify(self);\n    return v;\n}\nfunction _synchronicSub(self, mem, idx, value) {\n    var v = global.Atomics.sub(mem, idx, value);\n    _notify(self);\n    return v;\n}\nfunction _synchronicAnd(self, mem, idx, value) {\n    var v = global.Atomics.and(mem, idx, value);\n    _notify(self);\n    return v;\n}\nfunction _synchronicOr(self, mem, idx, value) {\n    var v = global.Atomics.or(mem, idx, value);\n    _notify(self);\n    return v;\n}\nfunction _synchronicXor(self, mem, idx, value) {\n    var v = global.Atomics.xor(mem, idx, value);\n    _notify(self);\n    return v;\n}\nfunction _synchronicLoadWhenNotEqual(self, mem, idx, value) {\n    for (; ;) {\n        var tag = global.Atomics.load(HEAP32, (self + 4) >> 2);\n        var v = global.Atomics.load(mem, idx);\n        if (v !== value)\n            break;\n        _waitForUpdate(self, tag, Number.POSITIVE_INFINITY);\n    }\n    return v;\n}\n\nfunction _synchronicLoadWhenEqual(self, mem, idx, value) {\n    for (; ;) {\n        var tag = global.Atomics.load(HEAP32, (self + 4) >> 2);\n        var v = global.Atomics.load(mem, idx);\n        if (v === value)\n            break;\n        _waitForUpdate(self, tag, Number.POSITIVE_INFINITY);\n    }\n    return v;\n}\nfunction _synchronicExpectUpdate(self, mem, idx, value, timeout) {\n    var now = global.performance();\n    var limit = now + timeout;\n    for (; ;) {\n        var tag = global.Atomics.load(HEAP32, (self + 4) >> 2);\n        var v = global.Atomics.load(mem, idx);\n        if (v !== value || now >= limit)\n            break;\n        _waitForUpdate(self, tag, limit - now);\n        now = global.performance();\n    }\n}\nfunction _waitForUpdate(self, tag, timeout) {\n    // Spin for a int16 time before going into the futexWait.\n    //\n    // Hard to know what a good count should be - it is machine\n    // dependent, for sure, and \"typical\" applications should\n    // influence the choice.  If the count is high without\n    // hindering an eventual drop into futexWait then it will just\n    // decrease performance.  If the count is low it is pointless.\n    // (This is why Synchronic really wants a native implementation.)\n    //\n    // data points from a 2.6GHz i7 MacBook Pro:\n    //\n    // - the simple send-integer benchmark (test-sendint.html),\n    //   which is the very simplest case we can really imagine,\n    //   gets noisy timings with an iteration count below 4000\n    //\n    // - the simple send-object benchmark (test-sendmsg.html)\n    //   gets a boost when the count is at least 10000\n    //\n    // 10000 is perhaps 5us (CPI=1, naive) and seems like a\n    // reasonable cutoff, for now - but note, it is reasonable FOR\n    // THIS SYSTEM ONLY, which is a big flaw.\n    //\n    // The better fix might well be to add some kind of spin/nanosleep\n    // functionality to futexWait, see https://bugzil.la/1134973.\n    // That functionality can be platform-dependent and even\n    // adaptive, with JIT support.\n    var i = 10000;\n    do {\n        // May want this to be a relaxed load, though on x86 it won't matter.\n        if (global.Atomics.load(HEAP32, (self + 4) >> 2) != tag)\n            return;\n    } while (--i > 0);\n    global.Atomics.add(HEAP32, self >> 2, 1);\n    global.Atomics.wait(HEAP32, (self + 4) >> 2, tag, timeout);\n    global.Atomics.sub(HEAP32, self >> 2, 1);\n}\nfunction _notify(self) {\n    global.Atomics.add(HEAP32, (self + 4) >> 2, 1);\n    // Would it be appropriate & better to wake n waiters, where n\n    // is the number loaded in the load()?  I almost think so,\n    // since our futexes are fair.\n    if (global.Atomics.load(HEAP32, self >> 2) > 0)\n        global.Atomics.wake(HEAP32, (self + 4) >> 2, Number.POSITIVE_INFINITY);\n}*/\n\n// function getFreeChunk(nbytes) {\n//     nbytes = nbytes | 0;\n//     if (numFreeChunks > (0 | 0)) {\n//         var freeChunk = findChunk(nbytes);\n//         if (freeChunk > (0 | 0)) {\n//             if (freeChunk == firstFreeChunk) {\n//                 firstFreeChunk = nextFree(freeChunk);\n//             }\n//             if (freeChunk == lastFreeChunk) {\n//                 lastFreeChunk = (0 | 0);\n//             }\n//             numFreeChunks = numFreeChunks - (1 | 0);\n//             setInuse(freeChunk);\n//             freeMemory = freeMemory - getChunkSize(freeChunk);\n//             return freeChunk;\n//         }\n//     }\n//     return 0 | 0;\n// }\n// function findChunk(nbytes) {\n//     nbytes = nbytes | 0;\n//     var chunk = firstFreeChunk;\n//     while (chunk != 0) {\n//         if (getChunkSize(chunk) == nbytes) {\n//             return chunk;\n//         }\n//         chunk = HEAPU32[chunk>>2];\n//     }\n//     return 0;\n// }\n// function prevFree(ptr) {\n//     return HEAPU32[(ptr + 4)>>2];\n// }\n// function nextFree(ptr) {\n//     return HEAPU32[ptr>>2];\n// }\n// /* Set size at head, without disturbing its use bit */\n// function setHeadSize(ptr, s) {\n//     HEAPU32[ptr>>2] = (HEAPU32[ptr>>2] & SIZE_BITS) | s;\n// }\n//\n// /* Set size/use field */\n// function setHead(ptr, s) {\n//     HEAPU32[ptr>>2] = s;\n// }\n//\n// /* Set size at footer (only when chunk is not in use) */\n// function setFoot(ptr, s) {\n//     HEAPU32[(ptr + s)>>2] = s;\n// }\n//\n// function getPrevInuse(ptr) {\n//     return HEAPU32[(ptr - 8)>>2] & (PREV_INUSE);\n// }\n// function setInuse(ptr) {\n//     HEAPU32[(ptr - 4)>>2] |= PREV_INUSE;\n// }\n// function getInuse(ptr) {\n//     return HEAPU32[(ptr - 4)>>2] & PREV_INUSE;\n// }\n// function clearInuse(ptr) {\n//     HEAPU32[(ptr - 4)>>2] &= ~PREV_INUSE;\n// }\n// function getChunkSize(ptr) {\n//     return HEAPU32[(ptr - 4)>>2] & ~(PREV_INUSE);\n// }\n//\n// function alloc_sab(nbytes, alignment) {\n//     nbytes = nbytes | 0;\n//     alignment = alignment | 0;\n//     if (numFreeChunks > 0) {\n//         var chunk = getFreeChunk(nbytes);\n//         if (chunk > (0 | 0)) {\n//             return chunk;\n//         }\n//     }\n//\n//     do {\n//         var ptr = global.Atomics.load(HEAP32, 1);\n//         var q = (ptr + (alignment - 1)) & ~(alignment - 1);\n//         var top = q + nbytes;\n//         if (top >= HEAP32[2>>2])\n//             return 0;\n//     } while (global.Atomics.compareExchange(HEAP32, 1, ptr, top) != ptr);\n//\n//     return q;\n// }\n// function alloc_ab(nbytes, alignment) {\n//     nbytes = nbytes | 0;\n//     alignment = alignment | 0;\n//\n//     var ptr = HEAP32[1>>2] | 0;\n//     ptr = ((ptr + (alignment - 1)) & ~(alignment - 1)) | 0;\n//     var top = (ptr + nbytes) | 0;\n//     if (top >= HEAP32[2>>2])\n//         return 0 | 0;\n//     HEAP32[1>>2] = top | 0;\n//     return ptr | 0;\n// }"

/***/ }),
/* 30 */
/***/ (function(module, exports) {

module.exports = "declare class boolean {\n    toString(): string;\n}\n\ndeclare class int8 {\n    toString(): string;\n}\n\ndeclare class uint8 {\n    toString(): string;\n}\n\ndeclare class int16 {\n    toString(): string;\n}\n\ndeclare class uint16 {\n    toString(): string;\n}\n\ndeclare class int32 {\n    toString(): string;\n}\n\ndeclare class uint32 {\n    toString(): string;\n}\n\ndeclare class int64 {\n    toString(): string;\n}\n\ndeclare class uint64 {\n    toString(): string;\n}\n\ndeclare class float32 {\n    toString(): string;\n}\n\ndeclare class float64 {\n    toString(): string;\n}\n\ndeclare class string {\n    charAt(index: int32): string;\n    charCodeAt(index: int32): uint16;\n    get length(): int32;\n    indexOf(text: string): int32;\n    lastIndexOf(text: string): int32;\n    operator == (other: string): boolean;\n    operator [] (index: int32): uint16 { return this.charCodeAt(index); }\n    slice(start: int32, end: int32): string;\n\n    startsWith(text: string): boolean { return this.slice(0, text.length) == text; }\n    endsWith(text: string): boolean { return this.slice(-text.length, this.length) == text; }\n}"

/***/ }),
/* 31 */
/***/ (function(module, exports) {

module.exports = "function TurboWrapper(exports, buffer) {\n\n    var HEAP8 = new Int8Array(buffer);\n    var HEAP16 = new Int16Array(buffer);\n    var HEAP32 = new Int32Array(buffer);\n    var HEAPU8 = new Uint8Array(buffer);\n    var HEAPU16 = new Uint16Array(buffer);\n    var HEAPU32 = new Uint32Array(buffer);\n    var HEAPF32 = new Float32Array(buffer);\n    var HEAPF64 = new Float64Array(buffer);\n\n    return {\n        exports: exports,\n        RAW_MEMORY: buffer,\n\n        getMemoryUsage: function () {\n            const top = Atomics.load(HEAP32, 2);\n            // top -= freeMemory;\n            return Math.fround(top / (1024 * 1024));\n        }\n    }\n}\nfunction initTurbo(MB) {\n    var buffer = new SharedArrayBuffer(MB * 1024 * 1024);\n\n    if (buffer.byteLength < 16) {\n        throw new Error(\"The memory is too small even for metadata\");\n    }\n\n    return TurboWrapper(TurboModule(\n        typeof global !== 'undefined' ? global : window,\n        typeof env !== 'undefined' ? env : {\n            STACKTOP: 8,\n            STACK_MAX: 8\n        },\n        buffer\n    ), buffer);\n}"

/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = "// WebAssembly builtin functions\ndeclare function rotl(value: int64, shift: int64): int64;\ndeclare function rotl32(value: int32, shift: int32): int32;\ndeclare function rotr(value: int64, shift: int64): int64;\ndeclare function rotr32(value: int32, shift: int32): int32;\ndeclare function clz(value: int64): int64;\ndeclare function clz32(value: int32): int32;\ndeclare function ctz(value: int64): int64;\ndeclare function ctz32(value: int32): int32;\ndeclare function popcnt(value: int64): int64;\ndeclare function popcnt32(value: int32): int32;\ndeclare function abs(value: float64): float64;\ndeclare function abs32(value: float32): float32;\ndeclare function ceil(value: float64): float64;\ndeclare function ceil32(value: float32): float32;\ndeclare function floor(value: float64): float64;\ndeclare function floor32(value: float32): float32;\ndeclare function sqrt(value: float64): float64;\ndeclare function sqrt32(value: float32): float32;\ndeclare function trunc(value: float64): float64;\ndeclare function trunc32(value: float32): float32;\ndeclare function nearest(value: float64): float64;\ndeclare function nearest32(value: float32): float32;\ndeclare function min(left: float64, right: float64): float64;\ndeclare function min32(left: float32, right: float32): float32;\ndeclare function max(left: float64, right: float64): float64;\ndeclare function max32(left: float32, right: float32): float32;\ndeclare function copysign(left: float64, right: float64): float64;\ndeclare function copysign32(left: float32, right: float32): float32;\ndeclare function reinterpret_i32(value: float32): int32;\ndeclare function reinterpret_i64(value: float64): int64;\ndeclare function reinterpret_f32(value: int32): float32;\ndeclare function reinterpret_f64(value: int64): float64;\ndeclare function current_memory(): int32;\ndeclare function grow_memory(value: int32): int32;\n"

/***/ }),
/* 33 */
/***/ (function(module, exports) {

module.exports = "/**\n * Created by n.vinayakan on 30.05.17.\n * WebAssembly start function where global variable expressions initializer\n */\n@start\nfunction __WASM_INITIALIZER(): void {\n    // 🔥 WARNING 🔥\n    // DON'T RETURN ANYTHING FROM THIS FUNCTION\n    // Global variable initialization expressions will be appended to this function\n    numFreeChunks = 0;\n    firstFree = 0;\n    lastFree = 0;\n    //     originalHeapPointer = 40 as *uint8;//this will override by compiler\n    //     currentHeapPointer  = 40 as *uint8;//this will override by compiler\n}\n"

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var wasm_stack_tracer_1 = __webpack_require__(44);
var utils_1 = __webpack_require__(6);
var opcode_1 = __webpack_require__(8);
var section_buffer_1 = __webpack_require__(35);
var logger_1 = __webpack_require__(10);
var wasm_section_1 = __webpack_require__(14);
var wasm_runtime_local_1 = __webpack_require__(15);
var wasm_type_1 = __webpack_require__(7);
var terminal_1 = __webpack_require__(1);
var index_1 = __webpack_require__(16);
/**
 * Created by n.vinayakan on 02.06.17.
 */
var WasmAssembler = (function () {
    function WasmAssembler() {
        this.sectionList = [];
        this.importList = [];
        this.functionList = [];
        this.currentSection = null;
        this.currentFunction = null;
        this.stackTracer = new wasm_stack_tracer_1.WasmStackTracer();
        this.textOutput = ";; Experimental wast emitter\n(module\n";
    }
    WasmAssembler.prototype.sealFunctions = function () {
        var runtimeFunctions = [];
        this.importList.forEach(function (_import) {
            var fn = new wasm_stack_tracer_1.WasmRuntimeFunction();
            fn.module = _import.module;
            fn.name = _import.name;
            fn.signature = _import.signature;
            fn.isImport = true;
            runtimeFunctions.push(fn);
        });
        this.functionList.forEach(function (_wasmFunc) {
            var fn = new wasm_stack_tracer_1.WasmRuntimeFunction();
            fn.name = index_1.getWasmFunctionName(_wasmFunc.symbol);
            fn.signature = _wasmFunc.signature;
            fn.isImport = false;
            fn.locals = [];
            _wasmFunc.localEntries.forEach(function (local) {
                fn.locals.push(new wasm_runtime_local_1.WasmRuntimeProperty(local.type, local.name));
            });
            runtimeFunctions.push(fn);
        });
        this.stackTracer.functions = runtimeFunctions;
    };
    WasmAssembler.prototype.startSection = function (array, id, name) {
        var section = new section_buffer_1.SectionBuffer(id, name);
        section.offset = array.length;
        logger_1.log(array, 0, null, " - section: " + wasm_section_1.WasmSection[id] + " [0x" + utils_1.toHex(id, 2) + "]");
        this.currentSection = section;
        this.sectionList.push(section);
        return section;
    };
    WasmAssembler.prototype.endSection = function (array, section) {
        this.currentSection = null;
        section.publish(array);
    };
    WasmAssembler.prototype.dropStack = function (array, max) {
        if (max === void 0) { max = 1; }
        if (this.stackTracer.context.stack.length > 0) {
            terminal_1.Terminal.warn("Dropping stack items, '" + this.stackTracer.context.fn.name + "' func stack contains " + this.stackTracer.context.stack.length + " items");
            var item = this.stackTracer.context.stack.pop(true);
            while (item !== undefined && max > 0) {
                terminal_1.Terminal.warn(wasm_type_1.WasmType[item.type]);
                array.append(opcode_1.WasmOpcode.DROP);
                this.currentSection.code.append("drop\n");
                item = this.stackTracer.context.stack.pop(true);
                max--;
            }
        }
    };
    WasmAssembler.prototype.appendOpcode = function (array, offset, opcode, inline_value, skip) {
        if (offset === void 0) { offset = 0; }
        if (skip === void 0) { skip = false; }
        logOpcode(array, offset, opcode, inline_value);
        array.append(opcode);
        var opcodeWithoutOperand = this.stackTracer.pushOpcode(opcode);
        if (opcodeWithoutOperand !== null && !skip) {
            var isEnd = opcode === opcode_1.WasmOpcode.END;
            var indent = this.isBlock(opcode) ? 1 : (isEnd ? -1 : 0);
            if (isEnd) {
                this.currentSection.code.clearIndent(1);
            }
            this.currentSection.code.append(opcodeWithoutOperand + "\n", indent);
        }
    };
    WasmAssembler.prototype.isBlock = function (opcode) {
        return opcode === opcode_1.WasmOpcode.BLOCK ||
            opcode === opcode_1.WasmOpcode.LOOP ||
            opcode === opcode_1.WasmOpcode.IF ||
            opcode === opcode_1.WasmOpcode.IF_ELSE;
    };
    WasmAssembler.prototype.writeUnsignedLEB128 = function (array, value) {
        array.writeUnsignedLEB128(value);
        var opcodeAndOperand = this.stackTracer.pushValue(value);
        if (opcodeAndOperand !== null) {
            this.currentSection.code.append(opcodeAndOperand + "\n");
        }
    };
    WasmAssembler.prototype.writeLEB128 = function (array, value) {
        array.writeLEB128(value);
        var opcodeAndOperand = this.stackTracer.pushValue(value);
        if (opcodeAndOperand !== null) {
            this.currentSection.code.append(opcodeAndOperand + "\n");
        }
    };
    WasmAssembler.prototype.writeFloat = function (array, value) {
        array.writeFloat(value);
        var opcodeAndOperand = this.stackTracer.pushValue(value);
        if (opcodeAndOperand !== null) {
            this.currentSection.code.append(opcodeAndOperand + "\n");
        }
    };
    WasmAssembler.prototype.writeDouble = function (array, value) {
        array.writeDouble(value);
        var opcodeAndOperand = this.stackTracer.pushValue(value);
        if (opcodeAndOperand !== null) {
            this.currentSection.code.append(opcodeAndOperand + "\n");
        }
    };
    WasmAssembler.prototype.writeWasmString = function (array, value) {
        array.writeWasmString(value);
    };
    WasmAssembler.prototype.finish = function () {
        var _this = this;
        this.textOutput += "  ";
        this.sectionList.forEach(function (section) {
            _this.textOutput += section.code.finish();
        });
        this.textOutput += ")\n";
    };
    return WasmAssembler;
}());
exports.WasmAssembler = WasmAssembler;
function append(array, offset, value, msg) {
    if (offset === void 0) { offset = 0; }
    if (value === void 0) { value = null; }
    if (msg === void 0) { msg = null; }
    array.log += (value != null ? utils_1.toHex(offset + array.position) + ": " + utils_1.toHex(value, 2) + "                    ; " : "") + (msg != null ? msg + "\n" : "\n");
    if (value) {
        array.append(value);
    }
}
exports.append = append;
function logOpcode(array, offset, opcode, inline_value) {
    if (offset === void 0) { offset = 0; }
    array.log += utils_1.toHex(offset + array.position) + ": " + utils_1.toHex(opcode, 2) + "                    ; " + opcode_1.WasmOpcode[opcode] + " " + (inline_value ? inline_value : "") + "\n";
}
exports.logOpcode = logOpcode;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __webpack_require__(10);
var bytearray_1 = __webpack_require__(12);
var stringbuilder_1 = __webpack_require__(54);
/**
 * Created by n.vinayakan on 02.06.17.
 */
var SectionBuffer = (function () {
    function SectionBuffer(id, name) {
        this.id = id;
        this.name = name;
        this.data = new bytearray_1.ByteArray();
        this.code = new stringbuilder_1.StringBuilder(2);
        this.code.indent = 1;
    }
    SectionBuffer.prototype.publish = function (array) {
        logger_1.log(array, 0, this.id, "section code");
        array.writeUnsignedLEB128(this.id); //section code
        if (this.id == 0) {
            var strData = new bytearray_1.ByteArray();
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
    };
    return SectionBuffer;
}());
exports.SectionBuffer = SectionBuffer;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var opcode_1 = __webpack_require__(8);
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
/* 37 */
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
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
var WasmFunction = (function () {
    function WasmFunction() {
        this.localCount = 0;
        this.localVariables = [];
    }
    return WasmFunction;
}());
exports.WasmFunction = WasmFunction;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
var WasmGlobalEntry = (function () {
    function WasmGlobalEntry(type, immutable, name) {
        this.type = type;
        this.immutable = immutable;
        this.name = name;
    }
    return WasmGlobalEntry;
}());
exports.WasmGlobalEntry = WasmGlobalEntry;
var WasmGlobal = (function () {
    function WasmGlobal() {
    }
    return WasmGlobal;
}());
exports.WasmGlobal = WasmGlobal;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
var WasmImport = (function () {
    function WasmImport() {
    }
    return WasmImport;
}());
exports.WasmImport = WasmImport;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
var WasmLocalEntry = (function () {
    function WasmLocalEntry(type, name, isArgument) {
        if (isArgument === void 0) { isArgument = false; }
        this.type = type;
        this.name = name;
        this.isArgument = isArgument;
    }
    return WasmLocalEntry;
}());
exports.WasmLocalEntry = WasmLocalEntry;
var WasmLocal = (function () {
    function WasmLocal() {
    }
    return WasmLocal;
}());
exports.WasmLocal = WasmLocal;


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by n.vinayakan on 02.06.17.
 */
var WasmSharedOffset = (function () {
    function WasmSharedOffset() {
        this.nextLocalOffset = 0;
        this.localCount = 0;
    }
    return WasmSharedOffset;
}());
exports.WasmSharedOffset = WasmSharedOffset;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __webpack_require__(0);
/**
 * Created by n.vinayakan on 02.06.17.
 */
var WasmSignature = (function () {
    function WasmSignature() {
    }
    return WasmSignature;
}());
exports.WasmSignature = WasmSignature;
function wasmAreSignaturesEqual(a, b) {
    assert_1.assert(a.returnType != null);
    assert_1.assert(b.returnType != null);
    assert_1.assert(a.returnType.next == null);
    assert_1.assert(b.returnType.next == null);
    var x = a.argumentTypes;
    var y = b.argumentTypes;
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
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var wasm_type_1 = __webpack_require__(7);
var opcode_1 = __webpack_require__(8);
var wasm_runtime_local_1 = __webpack_require__(15);
var bytearray_1 = __webpack_require__(12);
var terminal_1 = __webpack_require__(1);
/**
 * Created by n.vinayakan on 02.06.17.
 */
var clz32 = Math["clz32"] || function (value) { };
var WasmStackItem = (function () {
    function WasmStackItem(type, value) {
        this.type = type;
        this.value = value;
    }
    return WasmStackItem;
}());
exports.WasmStackItem = WasmStackItem;
var WasmStack = (function () {
    function WasmStack() {
        this.list = [];
    }
    Object.defineProperty(WasmStack.prototype, "length", {
        get: function () {
            return this.list.length;
        },
        enumerable: true,
        configurable: true
    });
    WasmStack.prototype.push = function (item) {
        this.list.push(item);
    };
    WasmStack.prototype.pop = function (silent) {
        if (silent === void 0) { silent = false; }
        if (this.list.length === 0) {
            if (!silent) {
                var error = "Stack is empty";
                terminal_1.Terminal.warn(error);
                // throw error;
            }
        }
        return this.list.pop();
    };
    WasmStack.prototype.clear = function () {
        this.list = [];
    };
    return WasmStack;
}());
exports.WasmStack = WasmStack;
var WasmRuntimeFunction = (function () {
    function WasmRuntimeFunction() {
    }
    Object.defineProperty(WasmRuntimeFunction.prototype, "returnType", {
        get: function () {
            return this.signature.returnType.id;
        },
        enumerable: true,
        configurable: true
    });
    WasmRuntimeFunction.prototype.execute = function () {
        var param = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            param[_i] = arguments[_i];
        }
        throw "Wasm runtime function execution not implemented!";
    };
    return WasmRuntimeFunction;
}());
exports.WasmRuntimeFunction = WasmRuntimeFunction;
var WasmStackContext = (function () {
    function WasmStackContext(fn) {
        this.fn = fn;
        this.stack = new WasmStack();
        this.opcodes = [];
    }
    return WasmStackContext;
}());
exports.WasmStackContext = WasmStackContext;
/**
 * Wasm stack tracer, this is not a stack machine. this will not execute functions
 * instead trace state of stack while emitting function body.
 */
var WasmStackTracer = (function () {
    function WasmStackTracer() {
        this.context = null;
        this.memory = new bytearray_1.ByteArray();
    }
    WasmStackTracer.prototype.setGlobals = function (globalEntries) {
        var _this = this;
        this.globals = [];
        globalEntries.forEach(function (globalEntry) {
            _this.globals.push(new wasm_runtime_local_1.WasmRuntimeProperty(globalEntry.type, globalEntry.name));
        });
    };
    WasmStackTracer.prototype.startFunction = function (index) {
        this.context = new WasmStackContext(this.functions[index]);
    };
    WasmStackTracer.prototype.endFunction = function () {
        if (this.context.stack.length > 0) {
            if (this.context.fn.returnType === wasm_type_1.WasmType.VOID) {
                var error = "Function '" + this.context.fn.name + "' does not return anything but stack is not empty. Stack contains " + this.context.stack.length + " items";
                terminal_1.Terminal.error(error);
                // throw error;
            }
        }
        this.context = null;
    };
    WasmStackTracer.prototype.callFunction = function (index) {
        var fn = this.functions[index];
        if (fn === undefined) {
            throw "Function not defined at index " + index;
        }
        var returnType = fn.returnType;
        for (var i = 0; i < fn.signature.argumentCount; i++) {
            this.context.stack.pop();
        }
        if (returnType !== wasm_type_1.WasmType.VOID) {
            this.context.stack.push(new WasmStackItem(returnType, undefined));
        }
    };
    WasmStackTracer.prototype.pushOpcode = function (opcode) {
        if (this.context !== null) {
            this.context.opcodes.push(opcode);
            this.context.lastOpcode = opcode;
            return this.updateStack(opcode);
        }
        return null;
    };
    WasmStackTracer.prototype.pushValue = function (value) {
        if (this.context !== null) {
            return this.updateStack(this.context.lastOpcode, value);
        }
        return null;
    };
    WasmStackTracer.prototype.updateStack = function (opcode, value) {
        var type = null;
        if (opcode !== undefined && opcode !== null) {
            type = getOprandType(opcode);
        }
        switch (opcode) {
            case opcode_1.WasmOpcode.CALL:
                if (value !== undefined) {
                    this.callFunction(value);
                    var fn = this.functions[value];
                    return "call $" + fn.name;
                }
                break;
            case opcode_1.WasmOpcode.END:
                this.context.stack.clear();
                return "end";
            case opcode_1.WasmOpcode.RETURN:
                if (this.context.stack.length == 0) {
                    terminal_1.Terminal.warn("Empty stack on return in function " + this.context.fn.name);
                }
                return "return";
            case opcode_1.WasmOpcode.I32_CONST:
            case opcode_1.WasmOpcode.I64_CONST:
            case opcode_1.WasmOpcode.F32_CONST:
            case opcode_1.WasmOpcode.F64_CONST:
                if (value !== undefined) {
                    this.context.stack.push(new WasmStackItem(type, value));
                    return opcode_1.WasmOpcode[opcode] + " " + value;
                }
                break;
            case opcode_1.WasmOpcode.SET_LOCAL:
                if (value !== undefined) {
                    if (this.context.fn.locals.length <= value) {
                        var errorMsg = "Local index " + value + " out of range " + this.context.fn.locals.length + " in function " + this.context.fn.name;
                        terminal_1.Terminal.error(errorMsg);
                        throw errorMsg;
                    }
                    else {
                        var a = this.context.stack.pop();
                        var local = this.context.fn.locals[value];
                        this.context.fn.locals[value].value = a.value;
                        return opcode_1.WasmOpcode[opcode] + " $" + local.name;
                    }
                }
                break;
            case opcode_1.WasmOpcode.GET_LOCAL:
                if (value !== undefined) {
                    var a = this.context.fn.locals[value];
                    this.context.stack.push(new WasmStackItem(a.type, a.value));
                    return opcode_1.WasmOpcode[opcode] + " $" + a.name;
                }
            // break;
            case opcode_1.WasmOpcode.SET_GLOBAL:
                if (value !== undefined) {
                    if (this.globals.length <= value) {
                        var errorMsg = "Global index " + value + " out of range " + this.globals.length;
                        terminal_1.Terminal.error(errorMsg);
                        throw errorMsg;
                    }
                    else {
                        var a = this.context.stack.pop();
                        this.globals[value].value = a.value;
                        return opcode_1.WasmOpcode[opcode] + " " + value;
                    }
                }
                break;
            case opcode_1.WasmOpcode.GET_GLOBAL:
                if (value !== undefined) {
                    var a = this.globals[value];
                    this.context.stack.push(new WasmStackItem(a.type, a.value));
                    return opcode_1.WasmOpcode[opcode] + " " + value;
                }
                break;
            // ADD
            case opcode_1.WasmOpcode.I32_ADD:
            case opcode_1.WasmOpcode.I64_ADD:
            case opcode_1.WasmOpcode.F32_ADD:
            case opcode_1.WasmOpcode.F64_ADD: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value + b.value));
                return opcode_1.WasmOpcode[opcode];
            }
            //SUB
            case opcode_1.WasmOpcode.I32_SUB:
            case opcode_1.WasmOpcode.I64_SUB:
            case opcode_1.WasmOpcode.F32_SUB:
            case opcode_1.WasmOpcode.F64_SUB: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value - b.value));
                return opcode_1.WasmOpcode[opcode];
            }
            //MUL
            case opcode_1.WasmOpcode.I32_MUL:
            case opcode_1.WasmOpcode.I64_MUL:
            case opcode_1.WasmOpcode.F32_MUL:
            case opcode_1.WasmOpcode.F64_MUL: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value * b.value));
                return opcode_1.WasmOpcode[opcode];
            }
            //DIV
            case opcode_1.WasmOpcode.I32_DIV_S:
            case opcode_1.WasmOpcode.I32_DIV_U:
            case opcode_1.WasmOpcode.I64_DIV_S:
            case opcode_1.WasmOpcode.I64_DIV_U:
            case opcode_1.WasmOpcode.F32_DIV:
            case opcode_1.WasmOpcode.F64_DIV: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value / b.value));
                break;
            }
            //REM
            case opcode_1.WasmOpcode.I32_REM_S:
            case opcode_1.WasmOpcode.I32_REM_U:
            case opcode_1.WasmOpcode.I64_REM_S:
            case opcode_1.WasmOpcode.I64_REM_U: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value % b.value));
                return opcode_1.WasmOpcode[opcode];
            }
            //GT
            case opcode_1.WasmOpcode.I32_GT_S:
            case opcode_1.WasmOpcode.I32_GT_U:
            case opcode_1.WasmOpcode.I64_GT_S:
            case opcode_1.WasmOpcode.I64_GT_U:
            case opcode_1.WasmOpcode.F32_GT:
            case opcode_1.WasmOpcode.F64_GT: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value > b.value ? 1 : 0));
                return opcode_1.WasmOpcode[opcode];
            }
            //GE
            case opcode_1.WasmOpcode.I32_GE_S:
            case opcode_1.WasmOpcode.I32_GE_U:
            case opcode_1.WasmOpcode.I64_GE_S:
            case opcode_1.WasmOpcode.I64_GE_U:
            case opcode_1.WasmOpcode.F32_GE:
            case opcode_1.WasmOpcode.F64_GE: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value >= b.value ? 1 : 0));
                return opcode_1.WasmOpcode[opcode];
            }
            //LT
            case opcode_1.WasmOpcode.I32_LT_S:
            case opcode_1.WasmOpcode.I32_LT_U:
            case opcode_1.WasmOpcode.I64_LT_S:
            case opcode_1.WasmOpcode.I64_LT_U:
            case opcode_1.WasmOpcode.F32_LT:
            case opcode_1.WasmOpcode.F64_LT: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value < b.value ? 1 : 0));
                return opcode_1.WasmOpcode[opcode];
            }
            //LE
            case opcode_1.WasmOpcode.I32_LE_S:
            case opcode_1.WasmOpcode.I32_LE_U:
            case opcode_1.WasmOpcode.I64_LE_S:
            case opcode_1.WasmOpcode.I64_LE_U:
            case opcode_1.WasmOpcode.F32_LE:
            case opcode_1.WasmOpcode.F64_LE: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value <= b.value ? 1 : 0));
                return opcode_1.WasmOpcode[opcode];
            }
            //EQ
            case opcode_1.WasmOpcode.I32_EQ:
            case opcode_1.WasmOpcode.I64_EQ:
            case opcode_1.WasmOpcode.F32_EQ:
            case opcode_1.WasmOpcode.F64_EQ: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value === b.value ? 1 : 0));
                return opcode_1.WasmOpcode[opcode];
            }
            //NE
            case opcode_1.WasmOpcode.I32_NE:
            case opcode_1.WasmOpcode.I64_NE:
            case opcode_1.WasmOpcode.F32_NE:
            case opcode_1.WasmOpcode.F64_NE: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value !== b.value ? 1 : 0));
                return opcode_1.WasmOpcode[opcode];
            }
            //EQZ
            case opcode_1.WasmOpcode.I32_EQZ:
            case opcode_1.WasmOpcode.I64_EQZ: {
                var a = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value === 0 ? 1 : 0));
                return opcode_1.WasmOpcode[opcode];
            }
            //AND
            case opcode_1.WasmOpcode.I32_AND:
            case opcode_1.WasmOpcode.I64_AND: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value & b.value));
                return opcode_1.WasmOpcode[opcode];
            }
            //OR
            case opcode_1.WasmOpcode.I32_OR:
            case opcode_1.WasmOpcode.I64_OR: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value | b.value));
                return opcode_1.WasmOpcode[opcode];
            }
            //XOR
            case opcode_1.WasmOpcode.I32_XOR:
            case opcode_1.WasmOpcode.I64_XOR: {
                var a = this.context.stack.pop();
                var b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value ^ b.value));
                return opcode_1.WasmOpcode[opcode];
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
                var a = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, clz32(a.value)));
                return opcode_1.WasmOpcode[opcode];
            }
            //CLZ
            case opcode_1.WasmOpcode.I32_ROTL:
            case opcode_1.WasmOpcode.I64_ROTL: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, rotl(a.value)));
                return opcode_1.WasmOpcode[opcode];
            }
            //SHR
            case opcode_1.WasmOpcode.I32_SHR_S:
            case opcode_1.WasmOpcode.I32_SHR_U:
            case opcode_1.WasmOpcode.I64_SHR_S:
            case opcode_1.WasmOpcode.I64_SHR_U: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, shr(a.value)));
                return opcode_1.WasmOpcode[opcode];
            }
            //SHR
            case opcode_1.WasmOpcode.I32_SHL:
            case opcode_1.WasmOpcode.I64_SHL: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, shl(a.value)));
                return opcode_1.WasmOpcode[opcode];
            }
            //POPCNT
            case opcode_1.WasmOpcode.I32_POPCNT:
            case opcode_1.WasmOpcode.I64_POPCNT: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, popcnt(a.value)));
                return opcode_1.WasmOpcode[opcode];
            }
            case opcode_1.WasmOpcode.F32_SQRT:
            case opcode_1.WasmOpcode.F64_SQRT: {
                var a = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(a.type, Math.sqrt(a.value)));
                return opcode_1.WasmOpcode[opcode];
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
                return opcode_1.WasmOpcode[opcode];
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
                var a = this.context.stack.pop(); // address
                var b = this.context.stack.pop(); // offset
                this.context.lastOpcode = null;
                return opcode_1.WasmOpcode[opcode];
            }
            case opcode_1.WasmOpcode.IF: {
                var a = this.context.stack.pop();
                this.context.lastOpcode = null;
                return opcode_1.WasmOpcode[opcode];
            }
            case opcode_1.WasmOpcode.BR_IF:
                if (value !== undefined) {
                    var a = this.context.stack.pop();
                    this.context.lastOpcode = null;
                    return opcode_1.WasmOpcode[opcode] + " " + value;
                }
                break;
            case opcode_1.WasmOpcode.IF_ELSE:
            case opcode_1.WasmOpcode.BLOCK:
            case opcode_1.WasmOpcode.LOOP:
                //ignore
                return opcode_1.WasmOpcode[opcode];
            case opcode_1.WasmOpcode.BR:
                if (value !== undefined) {
                    return opcode_1.WasmOpcode[opcode] + " " + value;
                }
                break;
            case opcode_1.WasmOpcode.I32_WRAP_I64:
            case opcode_1.WasmOpcode.I32_TRUNC_S_F32:
            case opcode_1.WasmOpcode.I32_TRUNC_U_F32:
            case opcode_1.WasmOpcode.I32_TRUNC_S_F64:
            case opcode_1.WasmOpcode.I32_TRUNC_U_F64:
            case opcode_1.WasmOpcode.I32_REINTERPRET_F32:
            case opcode_1.WasmOpcode.I64_TRUNC_S_F32:
            case opcode_1.WasmOpcode.I64_TRUNC_U_F32:
            case opcode_1.WasmOpcode.I64_TRUNC_S_F64:
            case opcode_1.WasmOpcode.I64_TRUNC_U_F64:
            case opcode_1.WasmOpcode.I64_EXTEND_S_I32:
            case opcode_1.WasmOpcode.I64_EXTEND_U_I32:
            case opcode_1.WasmOpcode.F32_DEMOTE_F64:
            case opcode_1.WasmOpcode.F32_TRUNC:
            case opcode_1.WasmOpcode.F32_REINTERPRET_I32:
            case opcode_1.WasmOpcode.F32_CONVERT_S_I32:
            case opcode_1.WasmOpcode.F32_CONVERT_U_I32:
            case opcode_1.WasmOpcode.F32_CONVERT_S_I64:
            case opcode_1.WasmOpcode.F32_CONVERT_U_I64:
            case opcode_1.WasmOpcode.F64_PROMOTE_F32:
            case opcode_1.WasmOpcode.F64_TRUNC:
            case opcode_1.WasmOpcode.F64_REINTERPRET_I64:
            case opcode_1.WasmOpcode.F64_CONVERT_S_I32:
            case opcode_1.WasmOpcode.F64_CONVERT_U_I32:
            case opcode_1.WasmOpcode.F64_CONVERT_S_I64:
            case opcode_1.WasmOpcode.F64_CONVERT_U_I64:
                //ignore  > pop > push
                return opcode_1.WasmOpcode[opcode];
            case null:
            case undefined:
                //ignore
                break;
            default:
                terminal_1.Terminal.warn("Unhandled Opcode " + opcode + " => " + opcode_1.WasmOpcode[opcode]);
                break;
        }
        return null;
    };
    return WasmStackTracer;
}());
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
            terminal_1.Terminal.warn("Unhandled Opcode " + opcode + " => " + opcode_1.WasmOpcode[opcode]);
            break;
    }
    return null;
}


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var symbol_1 = __webpack_require__(3);
var bytearray_1 = __webpack_require__(12);
var utils_1 = __webpack_require__(6);
var node_1 = __webpack_require__(5);
var opcode_1 = __webpack_require__(8);
var builtins_helper_1 = __webpack_require__(36);
var assert_1 = __webpack_require__(0);
var wasm_type_1 = __webpack_require__(7);
var logger_1 = __webpack_require__(10);
var wasm_signature_1 = __webpack_require__(43);
var bitness_1 = __webpack_require__(13);
var wasm_section_1 = __webpack_require__(14);
var wasm_external_kind_1 = __webpack_require__(37);
var wasm_global_1 = __webpack_require__(39);
var wasm_function_1 = __webpack_require__(38);
var wasm_import_1 = __webpack_require__(40);
var wasm_local_1 = __webpack_require__(41);
var wasm_shared_offset_1 = __webpack_require__(42);
var wasm_assembler_1 = __webpack_require__(34);
var terminal_1 = __webpack_require__(1);
var index_1 = __webpack_require__(16);
var WASM_MAGIC = 0x6d736100; //'\0' | 'a' << 8 | 's' << 16 | 'm' << 24;
var WASM_VERSION = 0x1;
var WASM_SIZE_IN_PAGES = 1;
var WASM_SET_MAX_MEMORY = false;
var WASM_MAX_MEMORY = 1024 * 1024 * 1024;
var WASM_MEMORY_INITIALIZER_BASE = 8; // Leave space for "null"
var WasmModule = (function () {
    function WasmModule(bitness) {
        this.bitness = bitness;
        this.importCount = 0;
        this.globalCount = 0;
        this.functionCount = 0;
        this.signatureCount = 0;
        this.assembler = new wasm_assembler_1.WasmAssembler();
    }
    WasmModule.prototype.growMemoryInitializer = function () {
        var array = this.memoryInitializer;
        var current = array.length;
        var length = this.context.nextGlobalVariableOffset;
        while (current < length) {
            array.append(0);
            current = current + 1;
        }
    };
    WasmModule.prototype.allocateImport = function (signatureIndex, mod, name) {
        var result = new wasm_import_1.WasmImport();
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
    };
    WasmModule.prototype.allocateGlobal = function (symbol, bitness) {
        var global = new wasm_global_1.WasmGlobal();
        global.type = index_1.symbolToValueType(symbol, bitness);
        global.symbol = symbol;
        symbol.offset = this.globalCount;
        if (this.firstGlobal == null) {
            this.firstGlobal = global;
            this.globalEntries = [];
        }
        else
            this.lastGlobal.next = global;
        this.lastGlobal = global;
        this.globalEntries.push(new wasm_global_1.WasmGlobalEntry(global.type, false, symbol.name));
        this.globalCount = this.globalCount + 1;
        return global;
    };
    WasmModule.prototype.allocateFunction = function (symbol, signatureIndex) {
        var fn = new wasm_function_1.WasmFunction();
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
    };
    WasmModule.prototype.allocateSignature = function (argumentTypes, returnType, argumentCount) {
        assert_1.assert(returnType != null);
        assert_1.assert(returnType.next == null);
        var signature = new wasm_signature_1.WasmSignature();
        signature.argumentCount = argumentCount;
        signature.argumentTypes = argumentTypes;
        signature.returnType = returnType;
        var check = this.firstSignature;
        var i = 0;
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
    };
    WasmModule.prototype.emitModule = function (array) {
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
        // this.emitNames(array);
        this.assembler.finish();
    };
    WasmModule.prototype.emitSignatures = function (array) {
        if (!this.firstSignature) {
            return;
        }
        var section = this.assembler.startSection(array, wasm_section_1.WasmSection.Type, "signatures");
        this.assembler.writeUnsignedLEB128(section.data, this.signatureCount);
        var signature = this.firstSignature;
        var sigCount = 0;
        while (signature != null) {
            var count = 0;
            var type = signature.argumentTypes;
            while (type != null) {
                count = count + 1;
                type = type.next;
            }
            section.code.append("(type (;" + sigCount + ";) (func");
            logger_1.log(section.data, array.position, wasm_type_1.WasmType.func, "func sig " + sigCount++);
            this.assembler.writeUnsignedLEB128(section.data, wasm_type_1.WasmType.func); //form, the value for the func type constructor
            logger_1.log(section.data, array.position, count, "num params");
            this.assembler.writeUnsignedLEB128(section.data, count); //param_count, the number of parameters to the function
            type = signature.argumentTypes;
            if (count > 0) {
                section.code.append(" (param");
            }
            while (type != null) {
                logger_1.log(section.data, array.position, type.id, wasm_type_1.WasmType[type.id]);
                this.assembler.writeUnsignedLEB128(section.data, type.id); //value_type, the parameter types of the function
                section.code.append(" " + wasm_type_1.WasmTypeToString[type.id]);
                type = type.next;
            }
            if (count > 0) {
                section.code.append(")");
            }
            var returnTypeId = signature.returnType.id;
            if (returnTypeId > 0) {
                logger_1.log(section.data, array.position, "01", "num results");
                this.assembler.writeUnsignedLEB128(section.data, 1); //return_count, the number of results from the function
                logger_1.log(section.data, array.position, signature.returnType.id, wasm_type_1.WasmType[signature.returnType.id]);
                this.assembler.writeUnsignedLEB128(section.data, signature.returnType.id);
                section.code.append(" (result " + wasm_type_1.WasmTypeToString[signature.returnType.id] + ")");
            }
            else {
                this.assembler.writeUnsignedLEB128(section.data, 0);
            }
            section.code.append("))\n");
            signature = signature.next;
        }
        this.assembler.endSection(array, section);
    };
    WasmModule.prototype.emitImportTable = function (array) {
        if (!this.firstImport) {
            return;
        }
        var section = this.assembler.startSection(array, wasm_section_1.WasmSection.Import, "import_table");
        logger_1.log(section.data, array.position, this.importCount, "num imports");
        this.assembler.writeUnsignedLEB128(section.data, this.importCount);
        var current = this.firstImport;
        var count = 0;
        while (current != null) {
            logger_1.log(section.data, array.position, null, "import func (" + count + ") " + current.module + " " + current.name);
            this.assembler.currentSection.code.append("(import \"" + current.module + "\" \"" + current.name + "\" (func (;" + count + ";) (type " + current.signatureIndex + ")))\n");
            this.assembler.writeWasmString(section.data, current.module);
            this.assembler.writeWasmString(section.data, current.name);
            this.assembler.writeUnsignedLEB128(section.data, wasm_external_kind_1.WasmExternalKind.Function);
            this.assembler.writeUnsignedLEB128(section.data, current.signatureIndex);
            current = current.next;
            count++;
        }
        this.assembler.endSection(array, section);
    };
    WasmModule.prototype.emitFunctionDeclarations = function (array) {
        if (!this.firstFunction) {
            return;
        }
        var section = this.assembler.startSection(array, wasm_section_1.WasmSection.Function, "function_declarations");
        logger_1.log(section.data, array.position, this.functionCount, "num functions");
        this.assembler.writeUnsignedLEB128(section.data, this.functionCount);
        var fn = this.firstFunction;
        var count = this.importCount;
        while (fn != null) {
            logger_1.log(section.data, array.position, fn.signatureIndex, "func " + count + " sig " + index_1.getWasmFunctionName(fn.symbol));
            this.assembler.writeUnsignedLEB128(section.data, fn.signatureIndex);
            fn = fn.next;
            count++;
        }
        this.assembler.endSection(array, section);
    };
    WasmModule.prototype.emitTables = function (array) {
        //TODO
    };
    WasmModule.prototype.emitMemory = function (array) {
        var section = this.assembler.startSection(array, wasm_section_1.WasmSection.Memory, "memory");
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
        section.code.append("(memory (;0;) 1)\n");
        this.assembler.endSection(array, section);
    };
    WasmModule.prototype.emitGlobalDeclarations = function (array) {
        if (!this.firstGlobal) {
            return;
        }
        var section = this.assembler.startSection(array, wasm_section_1.WasmSection.Global, "global");
        this.assembler.writeUnsignedLEB128(section.data, this.globalCount);
        this.assembler.stackTracer.setGlobals(this.globalEntries);
        var global = this.firstGlobal;
        var count = 0;
        while (global) {
            var dataType = index_1.typeToDataType(global.symbol.resolvedType, this.bitness);
            var value = global.symbol.node.variableValue();
            section.data.append(wasm_type_1.WasmType[dataType]); //content_type
            this.assembler.writeUnsignedLEB128(section.data, 1); //mutability, 0 if immutable, 1 if mutable. MVP only support immutable global variables
            var rawValue = 0;
            if (value) {
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
            }
            this.assembler.appendOpcode(section.data, array.position, opcode_1.WasmOpcode[dataType + "_CONST"], rawValue);
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
            var wasmTypeStr = wasm_type_1.WasmTypeToString[wasm_type_1.WasmType[dataType]];
            section.code.append("(global (;" + count++ + ";) (mut " + wasmTypeStr + ") (" + wasmTypeStr + ".const " + rawValue + "))\n");
            this.assembler.appendOpcode(section.data, array.position, opcode_1.WasmOpcode.END);
            global = global.next;
        }
        this.assembler.endSection(array, section);
    };
    WasmModule.prototype.addGlobalToStartFunction = function (global) {
        var value = global.symbol.node.variableValue();
        var startFn = this.startFunction;
        this.emitNode(startFn.body, 0, value);
        this.assembler.appendOpcode(startFn.body, 0, opcode_1.WasmOpcode.SET_GLOBAL);
        this.assembler.writeUnsignedLEB128(startFn.body, global.symbol.offset);
    };
    WasmModule.prototype.emitExportTable = function (array) {
        var exportedCount = 0;
        var fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                exportedCount = exportedCount + 1;
            }
            fn = fn.next;
        }
        if (exportedCount == 0) {
            return;
        }
        var section = this.assembler.startSection(array, wasm_section_1.WasmSection.Export, "export_table");
        logger_1.log(section.data, array.position, exportedCount, "num exports");
        this.assembler.writeUnsignedLEB128(section.data, exportedCount + 1);
        //Export main memory
        var memoryName = "memory";
        logger_1.log(section.data, array.position, memoryName.length, "export name length");
        logger_1.log(section.data, null, null, utils_1.toHex(section.data.position + array.position + 4) + ": " + memoryName + " // export name");
        this.assembler.writeWasmString(section.data, memoryName);
        logger_1.log(section.data, array.position, wasm_external_kind_1.WasmExternalKind.Function, "export kind");
        this.assembler.writeUnsignedLEB128(section.data, wasm_external_kind_1.WasmExternalKind.Memory);
        logger_1.log(section.data, array.position, 0, "export memory index");
        this.assembler.writeUnsignedLEB128(section.data, 0);
        section.code.append("(export \"memory\" (memory 0))\n");
        var i = this.importCount;
        fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                var fnName = index_1.getWasmFunctionName(fn.symbol);
                logger_1.log(section.data, array.position, fnName.length, "export name length");
                logger_1.log(section.data, null, null, utils_1.toHex(section.data.position + array.position + 4) + ": " + fnName + " // export name");
                this.assembler.writeWasmString(section.data, fnName);
                logger_1.log(section.data, array.position, wasm_external_kind_1.WasmExternalKind.Function, "export kind");
                this.assembler.writeUnsignedLEB128(section.data, wasm_external_kind_1.WasmExternalKind.Function);
                logger_1.log(section.data, array.position, i, "export func index");
                this.assembler.writeUnsignedLEB128(section.data, i);
                section.code.append("(export \"" + fnName + "\" (func $" + fnName + "))\n");
            }
            fn = fn.next;
            i = i + 1;
        }
        this.assembler.endSection(array, section);
    };
    WasmModule.prototype.emitStartFunctionDeclaration = function (array) {
        if (this.startFunctionIndex != -1) {
            var section = this.assembler.startSection(array, wasm_section_1.WasmSection.Start, "start_function");
            logger_1.log(section.data, array.position, this.startFunctionIndex, "start function index");
            section.code.append("(start " + (this.importCount + this.startFunctionIndex) + ")\n");
            this.assembler.writeUnsignedLEB128(section.data, this.importCount + this.startFunctionIndex);
            this.assembler.endSection(array, section);
        }
    };
    WasmModule.prototype.emitElements = function (array) {
        //TODO
    };
    WasmModule.prototype.emitFunctionBodies = function (array) {
        if (!this.firstFunction) {
            return;
        }
        var offset = array.position;
        var section = this.assembler.startSection(array, wasm_section_1.WasmSection.Code, "function_bodies");
        logger_1.log(section.data, offset, this.functionCount, "num functions");
        this.assembler.writeUnsignedLEB128(section.data, this.functionCount);
        var count = 0;
        var fn = this.firstFunction;
        var _loop_1 = function () {
            this_1.currentFunction = fn;
            var sectionOffset = offset + section.data.position;
            var wasmFunctionName = index_1.getWasmFunctionName(fn.symbol);
            var bodyData = new bytearray_1.ByteArray();
            logger_1.log(bodyData, sectionOffset, fn.localCount ? fn.localCount : 0, "local var count");
            this_1.assembler.stackTracer.startFunction(this_1.importCount + count);
            /* wasm text format */
            section.code.append("(func $" + wasmFunctionName + " (type " + fn.signatureIndex + ")");
            fn.argumentEntries.forEach(function (argumentEntry) {
                section.code.append(" (param $" + argumentEntry.name + " " + wasm_type_1.WasmTypeToString[argumentEntry.type] + ") ");
            });
            if (fn.signature.returnType.id !== wasm_type_1.WasmType.VOID) {
                section.code.append("(result " + wasm_type_1.WasmTypeToString[fn.signature.returnType.id] + ")");
            }
            section.code.append("\n", 1);
            if (fn.localVariables.length > 0) {
                bodyData.writeUnsignedLEB128(fn.localVariables.length); //local_count
                // TODO: Optimize local declarations
                fn.localVariables.forEach(function (localVariableEntry) {
                    logger_1.log(bodyData, sectionOffset, 1, "local index");
                    bodyData.writeUnsignedLEB128(1); //count
                    logger_1.log(bodyData, sectionOffset, localVariableEntry.type, wasm_type_1.WasmType[localVariableEntry.type]);
                    bodyData.append(localVariableEntry.type); //value_type
                    section.code.append("(local $" + localVariableEntry.name + " " + wasm_type_1.WasmTypeToString[localVariableEntry.type] + ") ");
                });
                section.code.append("\n");
            }
            else {
                bodyData.writeUnsignedLEB128(0);
            }
            var lastChild = void 0;
            if (fn.isConstructor) {
                // this is <CLASS>__ctr function
                this_1.emitConstructor(bodyData, sectionOffset, fn);
            }
            var child = fn.symbol.node.functionBody().firstChild;
            while (child != null) {
                lastChild = child;
                this_1.emitNode(bodyData, sectionOffset, child);
                child = child.nextSibling;
            }
            if (fn.body) {
                bodyData.copy(fn.body);
            }
            else {
                if (lastChild && lastChild.kind !== node_1.NodeKind.RETURN && fn.returnType != wasm_type_1.WasmType.VOID) {
                    this_1.assembler.appendOpcode(bodyData, sectionOffset, opcode_1.WasmOpcode.RETURN);
                }
            }
            if (fn.returnType === wasm_type_1.WasmType.VOID) {
                // Drop stack if not empty
                this_1.assembler.dropStack(bodyData);
            }
            this_1.assembler.appendOpcode(bodyData, sectionOffset, opcode_1.WasmOpcode.END, null, true); //end, 0x0b, indicating the end of the body
            this_1.assembler.stackTracer.endFunction();
            //Copy and finish body
            section.data.writeUnsignedLEB128(bodyData.length);
            logger_1.log(section.data, offset, null, " - func body " + (this_1.importCount + (count++)) + " (" + wasmFunctionName + ")");
            logger_1.log(section.data, offset, bodyData.length, "func body size");
            section.data.log += bodyData.log;
            section.data.copy(bodyData);
            section.code.indent -= 1;
            section.code.removeLastLinebreak();
            section.code.append(")\n");
            fn = fn.next;
        };
        var this_1 = this;
        while (fn != null) {
            _loop_1();
        }
        this
            .assembler
            .endSection(array, section);
    };
    WasmModule.prototype.emitDataSegments = function (array) {
        this.growMemoryInitializer();
        var memoryInitializer = this.memoryInitializer;
        var initializerLength = memoryInitializer.length;
        var initialHeapPointer = utils_1.alignToNextMultipleOf(WASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);
        // Pass the initial heap pointer to the "malloc" function
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.originalHeapPointer);
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.currentHeapPointer);
        var section = this.assembler.startSection(array, wasm_section_1.WasmSection.Data, "data_segments");
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
        section.code.append("(data (i32.const " + WASM_MEMORY_INITIALIZER_BASE + ") \"  ");
        var i = 0;
        var value;
        while (i < initializerLength) {
            for (var j = 0; j < 16; j++) {
                if (i + j < initializerLength) {
                    value = memoryInitializer.get(i + j);
                    section.data.append(value);
                    section.code.append("\\" + utils_1.toHex(value, 2));
                    logger_1.logData(section.data, array.position, value, j == 0);
                }
            }
            section.data.log += "\n";
            i = i + 16;
        }
        section.code.append('")\n');
        // section.data.copy(memoryInitializer, initializerLength);
        this.assembler.endSection(array, section);
    };
    // Custom section for debug names
    //
    WasmModule.prototype.emitNames = function (array) {
        var _this = this;
        var section = this.assembler.startSection(array, 0, "name");
        var subsectionFunc = new bytearray_1.ByteArray();
        var subsectionLocal = new bytearray_1.ByteArray();
        this.assembler.writeUnsignedLEB128(subsectionFunc, this.functionCount);
        this.assembler.writeUnsignedLEB128(subsectionLocal, this.functionCount);
        var fn = this.firstFunction;
        while (fn != null) {
            var fnIndex = this.importCount + fn.symbol.offset;
            var name_1 = index_1.getWasmFunctionName(fn.symbol);
            this.assembler.writeUnsignedLEB128(subsectionFunc, fnIndex);
            this.assembler.writeWasmString(subsectionFunc, name_1);
            this.assembler.writeUnsignedLEB128(subsectionLocal, fnIndex);
            this.assembler.writeUnsignedLEB128(subsectionLocal, fn.localEntries.length);
            fn.localEntries.forEach(function (local, index) {
                _this.assembler.writeUnsignedLEB128(subsectionLocal, index);
                _this.assembler.writeWasmString(subsectionLocal, local.name);
            });
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
    };
    WasmModule.prototype.prepareToEmit = function (node) {
        if (node.kind == node_1.NodeKind.STRING) {
            var text = node.stringValue;
            var length_1 = text.length;
            var offset = this.context.allocateGlobalVariableOffset(length_1 * 2 + 4, 4);
            node.intValue = offset;
            this.growMemoryInitializer();
            var memoryInitializer = this.memoryInitializer;
            // Emit a length-prefixed string
            bytearray_1.ByteArray_set32(memoryInitializer, offset, length_1);
            bytearray_1.ByteArray_setString(memoryInitializer, offset + 4, text);
        }
        else if (node.kind == node_1.NodeKind.VARIABLE) {
            var symbol = node.symbol;
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
                var global_1 = this.allocateGlobal(symbol, this.bitness);
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
            var returnType = node.functionReturnType();
            var wasmReturnType = this.getWasmType(returnType.resolvedType);
            var shared = new wasm_shared_offset_1.WasmSharedOffset();
            var argumentTypesFirst = null;
            var argumentTypesLast = null;
            var symbol = node.symbol;
            var isConstructor = symbol.name == "constructor";
            var wasmFunctionName = index_1.getWasmFunctionName(symbol);
            // Make sure to include the implicit "this" variable as a normal argument
            var argument = node.isExternalImport() ? node.functionFirstArgumentIgnoringThis() : node.functionFirstArgument();
            var argumentCount = 0;
            var argumentList = [];
            while (argument != returnType) {
                var wasmType = this.getWasmType(argument.variableType().resolvedType);
                argumentList.push(new wasm_local_1.WasmLocalEntry(wasmType, argument.symbol.name, true));
                var type = index_1.wasmWrapType(wasmType);
                if (argumentTypesFirst == null)
                    argumentTypesFirst = type;
                else
                    argumentTypesLast.next = type;
                argumentTypesLast = type;
                shared.nextLocalOffset = shared.nextLocalOffset + 1;
                argumentCount++;
                argument = argument.nextSibling;
            }
            var signatureIndex = this.allocateSignature(argumentTypesFirst, index_1.wasmWrapType(wasmReturnType), argumentCount);
            var body = node.functionBody();
            // Functions without bodies are imports
            if (body == null) {
                if (!builtins_helper_1.isBuiltin(wasmFunctionName)) {
                    var moduleName = symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE ? symbol.parent().name : "global";
                    symbol.offset = this.importCount;
                    this.allocateImport(signatureIndex, moduleName, symbol.name);
                }
                node = node.nextSibling;
                return;
            }
            else {
                symbol.offset = this.functionCount;
            }
            var fn = this.allocateFunction(symbol, signatureIndex);
            fn.argumentEntries = argumentList;
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
            fn.localEntries = argumentList.concat(fn.localVariables);
            fn.localCount = shared.localCount;
        }
        var child = node.firstChild;
        while (child != null) {
            this.prepareToEmit(child);
            child = child.nextSibling;
        }
    };
    WasmModule.prototype.emitBinaryExpression = function (array, byteOffset, node, opcode) {
        this.emitNode(array, byteOffset, node.binaryLeft());
        this.emitNode(array, byteOffset, node.binaryRight());
        this.assembler.appendOpcode(array, byteOffset, opcode);
    };
    WasmModule.prototype.emitLoadFromMemory = function (array, byteOffset, type, relativeBase, offset) {
        var opcode;
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
        var sizeOf = type.variableSizeOf(this.context);
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
    };
    WasmModule.prototype.emitStoreToMemory = function (array, byteOffset, type, relativeBase, offset, value) {
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
        var sizeOf = type.variableSizeOf(this.context);
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
    };
    /**
     * Emit instance
     * @param array
     * @param byteOffset
     * @param node
     */
    WasmModule.prototype.emitInstance = function (array, byteOffset, node) {
        var constructorNode = node.constructorNode();
        var callSymbol = constructorNode.symbol;
        var type = node.newType();
        var size;
        if (type.resolvedType.isArray()) {
            /**
             * If the new type if an array append total byte length and element size
             **/
            var elementNode = type.firstGenericType();
            var elementType = elementNode.resolvedType;
            var isClassElement = elementType.isClass();
            //ignore 64 bit pointer
            size = isClassElement ? 4 : elementType.allocationSizeOf(this.context);
            assert_1.assert(size > 0);
            var lengthNode = node.arrayLength();
            if (lengthNode.kind == node_1.NodeKind.INT32) {
                var length_2 = size * lengthNode.intValue;
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, length_2);
                this.assembler.writeLEB128(array, length_2); //array byteLength
            }
            else {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, size);
                this.assembler.writeLEB128(array, size);
                this.emitNode(array, byteOffset, lengthNode);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_MUL); //array byteLength
            }
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(array, size); // array element size
            var callIndex = this.getWasmFunctionCallIndex(callSymbol);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL);
            logger_1.log(array, byteOffset, callIndex, "call func index (" + callIndex + ")");
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
            var child = node.firstChild.nextSibling;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }
            var callIndex = this.getWasmFunctionCallIndex(callSymbol);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL, callIndex);
            this.assembler.writeUnsignedLEB128(array, callIndex);
        }
    };
    /**
     * Emit constructor function where malloc happens
     * @param array
     * @param byteOffset
     * @param fn
     */
    WasmModule.prototype.emitConstructor = function (array, byteOffset, fn) {
        var constructorNode = fn.symbol.node;
        var type = constructorNode.parent.symbol;
        var size = type.resolvedType.allocationSizeOf(this.context);
        assert_1.assert(size > 0);
        if (type.resolvedType.isArray()) {
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.GET_LOCAL, 0);
            this.assembler.writeUnsignedLEB128(array, 0); // array parameter byteLength
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(array, size); // size of array class, default is 8 bytes
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_ADD);
        }
        else if (type.resolvedType.isTypedArray()) {
            var elementSize = index_1.getTypedArrayElementSize(type.resolvedType.symbol.name);
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
        var mallocIndex = this.calculateWasmFunctionIndex(this.mallocFunctionIndex);
        this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL, mallocIndex);
        this.assembler.writeUnsignedLEB128(array, mallocIndex);
        this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL, fn.signature.argumentCount);
        this.assembler.writeUnsignedLEB128(array, fn.signature.argumentCount);
        // Set self pointer to first local variable which is immediate after the argument variable
    };
    WasmModule.prototype.emitNode = function (array, byteOffset, node) {
        // Assert
        assert_1.assert(!node_1.isExpression(node) || node.resolvedType != null);
        if (node.kind == node_1.NodeKind.BLOCK) {
            /**
             * Skip emitting block if parent is 'if' or 'loop' since it is already a block
             */
            var skipBlock = node.parent.kind === node_1.NodeKind.IF;
            if (!skipBlock) {
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.BLOCK);
                if (node.returnNode !== undefined) {
                    logger_1.log(array, byteOffset, this.currentFunction.returnType, wasm_type_1.WasmType[this.currentFunction.returnType]);
                    array.append(this.currentFunction.returnType);
                    this.assembler.currentSection.code.removeLastLinebreak();
                    this.assembler.currentSection.code.append(" (result " + wasm_type_1.WasmTypeToString[this.currentFunction.returnType] + ")\n", 1);
                }
                else {
                    logger_1.log(array, byteOffset, wasm_type_1.WasmType.block_type, wasm_type_1.WasmType[wasm_type_1.WasmType.block_type]);
                    array.append(wasm_type_1.WasmType.block_type);
                }
            }
            var child = node.firstChild;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }
            if (!skipBlock) {
                this.assembler.currentSection.code.clearIndent(1);
                this.assembler.currentSection.code.indent -= 1;
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END);
            }
        }
        else if (node.kind == node_1.NodeKind.WHILE) {
            var value = node.whileValue();
            var body = node.whileBody();
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
            var child = body.firstChild;
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
            var label = 0;
            var parent_1 = node.parent;
            while (parent_1 != null && parent_1.kind != node_1.NodeKind.WHILE) {
                if (parent_1.kind == node_1.NodeKind.BLOCK) {
                    label = label + 1;
                }
                parent_1 = parent_1.parent;
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
            var value = node.returnValue();
            if (value != null) {
                this.emitNode(array, byteOffset, value);
            }
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.RETURN);
        }
        else if (node.kind == node_1.NodeKind.VARIABLES) {
            var count = 0;
            var child = node.firstChild;
            while (child != null) {
                assert_1.assert(child.kind == node_1.NodeKind.VARIABLE);
                count = count + this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }
            return count;
        }
        else if (node.kind == node_1.NodeKind.IF) {
            var branch = node.ifFalse();
            this.emitNode(array, byteOffset, node.ifValue());
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF);
            var returnNode = node.ifReturnNode();
            var needEmptyElse = false;
            if (returnNode == null && branch === null) {
                wasm_assembler_1.append(array, 0, wasm_type_1.WasmType.block_type, wasm_type_1.WasmType[wasm_type_1.WasmType.block_type]);
            }
            else {
                if (returnNode !== null) {
                    var returnType = index_1.symbolToValueType(returnNode.resolvedType.symbol);
                    wasm_assembler_1.append(array, 0, returnType, wasm_type_1.WasmType[returnType]);
                    this.assembler.currentSection.code.removeLastLinebreak();
                    this.assembler.currentSection.code.append(" (result " + wasm_type_1.WasmTypeToString[returnType] + ")\n");
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
                this.assembler.currentSection.code.indent -= 1;
                this.assembler.currentSection.code.clearIndent(1);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF_ELSE);
                this.emitNode(array, byteOffset, branch);
            }
            else if (needEmptyElse) {
                this.assembler.currentSection.code.indent -= 1;
                this.assembler.currentSection.code.clearIndent(1);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF_ELSE);
                var dataType = index_1.typeToDataType(returnNode.resolvedType, this.bitness);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode[dataType + "_CONST"]);
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
            var trueValue = node.hookTrue();
            var trueValueType = index_1.symbolToValueType(trueValue.resolvedType.symbol);
            wasm_assembler_1.append(array, 0, trueValueType, wasm_type_1.WasmType[trueValueType]);
            this.emitNode(array, byteOffset, trueValue);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.IF_ELSE);
            this.emitNode(array, byteOffset, node.hookFalse());
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.END);
        }
        else if (node.kind == node_1.NodeKind.VARIABLE) {
            var value = node.variableValue();
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
                var skipSetLocal = value && node_1.isUnaryPostfix(value.kind);
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
            var symbol = node.symbol;
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
        else if (node.kind == node_1.NodeKind.POINTER_INDEX) {
            this.emitLoadFromMemory(array, byteOffset, node.resolvedType.underlyingType(this.context), node.pointer(), node.pointerOffset());
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
            var value = WASM_MEMORY_INITIALIZER_BASE + node.intValue;
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, value);
            this.assembler.writeLEB128(array, value);
        }
        else if (node.kind == node_1.NodeKind.CALL) {
            var value = node.callValue();
            var symbol = value.symbol;
            assert_1.assert(symbol_1.isFunction(symbol.kind));
            // Write out the implicit "this" argument
            if (!symbol.node.isExternalImport() && symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE) {
                var dotTarget = value.dotTarget();
                this.emitNode(array, byteOffset, dotTarget);
                if (dotTarget.kind == node_1.NodeKind.NEW) {
                    this.emitInstance(array, byteOffset, dotTarget);
                }
            }
            var child = value.nextSibling;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }
            var wasmFunctionName = index_1.getWasmFunctionName(symbol);
            if (builtins_helper_1.isBuiltin(wasmFunctionName)) {
                this.assembler.appendOpcode(array, byteOffset, builtins_helper_1.getBuiltinOpcode(symbol.name));
            }
            else {
                var callIndex = this.getWasmFunctionCallIndex(symbol);
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL, callIndex);
                this.assembler.writeUnsignedLEB128(array, callIndex);
            }
        }
        else if (node.kind == node_1.NodeKind.NEW) {
            this.emitInstance(array, byteOffset, node);
        }
        else if (node.kind == node_1.NodeKind.DELETE) {
            var value = node.deleteValue();
            this.emitNode(array, byteOffset, value);
            var freeIndex = this.calculateWasmFunctionIndex(this.freeFunctionIndex);
            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.CALL, freeIndex);
            this.assembler.writeUnsignedLEB128(array, freeIndex);
        }
        else if (node.kind == node_1.NodeKind.POSITIVE) {
            this.emitNode(array, byteOffset, node.unaryValue());
        }
        else if (node.kind == node_1.NodeKind.NEGATIVE) {
            var resolvedType = node.unaryValue().resolvedType;
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
            var value = node.castValue();
            var context = this.context;
            var from = value.resolvedType.underlyingType(context);
            var type = node.resolvedType.underlyingType(context);
            var fromSize = from.variableSizeOf(context);
            var typeSize = type.variableSizeOf(context);
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
            if ((from == context.nullType || from == context.booleanType || from == context.int32Type || from == context.uint32Type) &&
                (type == context.int64Type || type == context.uint64Type)) {
                if (value.kind == node_1.NodeKind.NULL) {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, 0);
                    this.assembler.writeLEB128(array, 0);
                }
                else if (value.kind == node_1.NodeKind.BOOLEAN) {
                    var intValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, intValue);
                    this.assembler.writeLEB128(array, intValue);
                }
                else if (value.kind == node_1.NodeKind.INT32) {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, value.longValue);
                    this.assembler.writeLEB128(array, value.longValue);
                }
                else {
                    var isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I64_EXTEND_U_I32 : opcode_1.WasmOpcode.I64_EXTEND_S_I32);
                }
            }
            else if ((from == context.nullType || from == context.booleanType || from == context.int32Type || from == context.uint32Type) &&
                type == context.float32Type) {
                if (value.kind == node_1.NodeKind.NULL) {
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, 0);
                    this.assembler.writeFloat(array, 0);
                }
                else if (value.kind == node_1.NodeKind.BOOLEAN) {
                    var floatValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(array, floatValue);
                }
                else if (value.kind == node_1.NodeKind.INT32) {
                    var floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(array, floatValue);
                }
                else {
                    var isUnsigned = value.resolvedType.isUnsigned();
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
                else if (value.kind == node_1.NodeKind.BOOLEAN) {
                    var doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(array, doubleValue);
                }
                else if (value.kind == node_1.NodeKind.INT32) {
                    var doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(array, doubleValue);
                }
                else {
                    var isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F64_CONVERT_U_I32 : opcode_1.WasmOpcode.F64_CONVERT_S_I32);
                }
            }
            else if ((from == context.int64Type || from == context.uint64Type) &&
                (type == context.int32Type || type == context.uint32Type)) {
                if (value.kind == node_1.NodeKind.INT64) {
                    var intValue = value.intValue || 0;
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
                    var floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(array, floatValue);
                }
                else {
                    var isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F32_CONVERT_U_I64 : opcode_1.WasmOpcode.F32_CONVERT_S_I64);
                }
            }
            else if ((from == context.int64Type || from == context.uint64Type) &&
                type == context.float64Type) {
                if (value.kind == node_1.NodeKind.INT64) {
                    var doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(array, doubleValue);
                }
                else {
                    var isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.F64_CONVERT_U_I64 : opcode_1.WasmOpcode.F64_CONVERT_S_I64);
                }
            }
            else if (from == context.float32Type &&
                (type == context.uint8Type || type == context.int8Type ||
                    type == context.uint16Type || type == context.int16Type ||
                    type == context.uint32Type || type == context.int32Type)) {
                if (value.kind == node_1.NodeKind.FLOAT32) {
                    var intValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(array, intValue);
                }
                else {
                    var isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I32_TRUNC_U_F32 : opcode_1.WasmOpcode.I32_TRUNC_S_F32);
                }
            }
            else if (from == context.float32Type &&
                (type == context.int64Type || type == context.uint64Type)) {
                if (value.kind == node_1.NodeKind.FLOAT32) {
                    var longValue = value.longValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, longValue);
                    this.assembler.writeLEB128(array, longValue);
                }
                else {
                    var isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I64_TRUNC_U_F32 : opcode_1.WasmOpcode.I64_TRUNC_S_F32);
                }
            }
            else if (from == context.float32Type && type == context.float64Type) {
                if (value.kind == node_1.NodeKind.FLOAT32) {
                    var doubleValue = value.doubleValue || 0;
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
                    var intValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(array, intValue);
                }
                else {
                    var isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I32_TRUNC_U_F64 : opcode_1.WasmOpcode.I32_TRUNC_S_F64);
                }
            }
            else if (from == context.float64Type &&
                (type == context.int64Type || type == context.uint64Type)) {
                if (value.kind == node_1.NodeKind.FLOAT64) {
                    var longValue = value.longValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I64_CONST, longValue);
                    this.assembler.writeLEB128(array, longValue);
                }
                else {
                    var isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? opcode_1.WasmOpcode.I64_TRUNC_U_F64 : opcode_1.WasmOpcode.I64_TRUNC_S_F64);
                }
            }
            else if (from == context.float64Type && type == context.float32Type) {
                if (value.kind == node_1.NodeKind.FLOAT64) {
                    var floatValue = value.floatValue || 0;
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
            var symbol = node.symbol;
            if (symbol.kind == symbol_1.SymbolKind.VARIABLE_INSTANCE) {
                this.emitLoadFromMemory(array, byteOffset, symbol.resolvedType, node.dotTarget(), symbol.offset);
            }
            else {
                assert_1.assert(false);
            }
        }
        else if (node.kind == node_1.NodeKind.ASSIGN) {
            var left = node.binaryLeft();
            var right = node.binaryRight();
            var symbol = left.symbol;
            if (left.kind == node_1.NodeKind.DEREFERENCE) {
                this.emitStoreToMemory(array, byteOffset, left.resolvedType.underlyingType(this.context), left.unaryValue(), 0, right);
            }
            else if (left.kind == node_1.NodeKind.POINTER_INDEX) {
                this.emitStoreToMemory(array, byteOffset, left.resolvedType.underlyingType(this.context), left.pointer(), left.pointerOffset(), right);
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
            var kind = node.kind;
            if (kind == node_1.NodeKind.POSTFIX_INCREMENT || kind == node_1.NodeKind.POSTFIX_DECREMENT) {
                var value = node.unaryValue();
                var dataType = index_1.typeToDataType(value.resolvedType, this.bitness);
                //TODO handle instance variable
                if (node.parent.kind == node_1.NodeKind.VARIABLE) {
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL, node.parent.symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, node.parent.symbol.offset);
                }
                else if (node.parent.kind == node_1.NodeKind.ASSIGN) {
                    this.emitNode(array, byteOffset, value);
                    var left = node.parent.binaryLeft();
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.SET_LOCAL, left.symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, left.symbol.offset);
                }
                this.emitNode(array, byteOffset, value);
                if (node.parent.kind != node_1.NodeKind.RETURN) {
                    assert_1.assert(value.resolvedType.isInteger() || value.resolvedType.isLong() ||
                        value.resolvedType.isFloat() || value.resolvedType.isDouble());
                    var size = value.resolvedType.pointerTo ?
                        value.resolvedType.pointerTo.allocationSizeOf(this.context) :
                        value.resolvedType.allocationSizeOf(this.context);
                    if (size == 1 || size == 2) {
                        if (value.kind == node_1.NodeKind.INT32 || value.resolvedType.isInteger()) {
                            this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode.I32_CONST, 1);
                            this.assembler.writeLEB128(array, 1);
                        }
                        else {
                            terminal_1.Terminal.error("Wrong type");
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
                            terminal_1.Terminal.error("Wrong type");
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
                            terminal_1.Terminal.error("Wrong type");
                        }
                    }
                    //TODO extend to other operations
                    var operation = kind == node_1.NodeKind.POSTFIX_INCREMENT ? "ADD" : "SUB";
                    this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode[dataType + "_" + operation]);
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
            var isUnsigned = node.isUnsignedOperator();
            var left = node.binaryLeft();
            var right = node.binaryRight();
            var isFloat = left.resolvedType.isFloat() || right.resolvedType.isFloat();
            var isDouble = left.resolvedType.isDouble() || right.resolvedType.isDouble();
            var dataTypeLeft = index_1.typeToDataType(left.resolvedType, this.bitness);
            var dataTypeRight = index_1.typeToDataType(right.resolvedType, this.bitness);
            if (node.kind == node_1.NodeKind.ADD) {
                this.emitNode(array, byteOffset, left);
                if (left.resolvedType.pointerTo == null) {
                    this.emitNode(array, byteOffset, right);
                }
                else {
                    assert_1.assert(right.resolvedType.isInteger() || right.resolvedType.isLong() ||
                        right.resolvedType.isFloat() || right.resolvedType.isDouble());
                    var size = left.resolvedType.pointerTo.allocationSizeOf(this.context);
                    if (size == 2) {
                        if (right.kind == node_1.NodeKind.INT32) {
                            var _value = right.intValue << 1;
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
                            var _value = right.intValue << 2;
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
                this.assembler.appendOpcode(array, byteOffset, opcode_1.WasmOpcode[dataTypeLeft + "_ADD"]);
            }
            else if (node.kind == node_1.NodeKind.BITWISE_AND) {
                if (isFloat || isDouble) {
                    throw "Cannot do bitwise operations on floating point number";
                }
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[dataTypeLeft + "_AND"]);
            }
            else if (node.kind == node_1.NodeKind.BITWISE_OR) {
                if (isFloat || isDouble) {
                    throw "Cannot do bitwise operations on floating point number";
                }
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[dataTypeLeft + "_OR"]);
            }
            else if (node.kind == node_1.NodeKind.BITWISE_XOR) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[dataTypeLeft + "_XOR"]);
            }
            else if (node.kind == node_1.NodeKind.EQUAL) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[dataTypeLeft + "_EQ"]);
            }
            else if (node.kind == node_1.NodeKind.MULTIPLY) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[dataTypeLeft + "_MUL"]);
            }
            else if (node.kind == node_1.NodeKind.NOT_EQUAL) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[dataTypeLeft + "_NE"]);
            }
            else if (node.kind == node_1.NodeKind.SHIFT_LEFT) {
                if (isFloat || isDouble) {
                    throw "Cannot do bitwise operations on floating point number";
                }
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[dataTypeLeft + "_SHL"]);
            }
            else if (node.kind == node_1.NodeKind.SUBTRACT) {
                this.emitBinaryExpression(array, byteOffset, node, opcode_1.WasmOpcode[dataTypeLeft + "_SUB"]);
            }
            else if (node.kind == node_1.NodeKind.DIVIDE) {
                var opcode = (isFloat || isDouble) ?
                    opcode_1.WasmOpcode[dataTypeLeft + "_DIV"] :
                    (isUnsigned ? opcode_1.WasmOpcode[dataTypeLeft + "_DIV_U"] : opcode_1.WasmOpcode[dataTypeLeft + "_DIV_S"]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }
            else if (node.kind == node_1.NodeKind.GREATER_THAN) {
                var opcode = (isFloat || isDouble) ?
                    opcode_1.WasmOpcode[dataTypeLeft + "_GT"] :
                    (isUnsigned ? opcode_1.WasmOpcode[dataTypeLeft + "_GT_U"] : opcode_1.WasmOpcode[dataTypeLeft + "_GT_S"]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }
            else if (node.kind == node_1.NodeKind.GREATER_THAN_EQUAL) {
                var opcode = (isFloat || isDouble) ?
                    opcode_1.WasmOpcode[dataTypeLeft + "_GE"] :
                    (isUnsigned ? opcode_1.WasmOpcode[dataTypeLeft + "_GE_U"] : opcode_1.WasmOpcode[dataTypeLeft + "_GE_S"]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }
            else if (node.kind == node_1.NodeKind.LESS_THAN) {
                var opcode = (isFloat || isDouble) ?
                    opcode_1.WasmOpcode[dataTypeLeft + "_LT"] :
                    (isUnsigned ? opcode_1.WasmOpcode[dataTypeLeft + "_LT_U"] : opcode_1.WasmOpcode[dataTypeLeft + "_LT_S"]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }
            else if (node.kind == node_1.NodeKind.LESS_THAN_EQUAL) {
                var opcode = (isFloat || isDouble) ?
                    opcode_1.WasmOpcode[dataTypeLeft + "_LE"] :
                    (isUnsigned ? opcode_1.WasmOpcode[dataTypeLeft + "_LE_U"] : opcode_1.WasmOpcode[dataTypeLeft + "_LE_S"]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }
            else if (node.kind == node_1.NodeKind.REMAINDER) {
                if (isFloat || isDouble) {
                    throw "Floating point remainder is not yet supported in WebAssembly. Please import javascript function to handle this";
                }
                this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                    opcode_1.WasmOpcode[dataTypeLeft + "_REM_U"] : opcode_1.WasmOpcode[dataTypeLeft + "_REM_S"]);
            }
            else if (node.kind == node_1.NodeKind.SHIFT_RIGHT) {
                if (isFloat || isDouble) {
                    throw "Cannot do bitwise operations on floating point number";
                }
                this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                    opcode_1.WasmOpcode[dataTypeLeft + "_SHR_U"] : opcode_1.WasmOpcode[dataTypeLeft + "_SHR_S"]);
            }
            else {
                assert_1.assert(false);
            }
        }
        return 1;
    };
    WasmModule.prototype.calculateWasmFunctionIndex = function (index) {
        return this.importCount + index;
    };
    WasmModule.prototype.getWasmFunctionCallIndex = function (symbol) {
        return symbol.node.isExternalImport() ? symbol.offset : this.importCount + symbol.offset;
    };
    WasmModule.prototype.getWasmType = function (type) {
        var context = this.context;
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
    };
    return WasmModule;
}());
function wasmAssignLocalVariableOffsets(fn, node, shared, bitness) {
    if (node.kind == node_1.NodeKind.VARIABLE) {
        assert_1.assert(node.symbol.kind == symbol_1.SymbolKind.VARIABLE_LOCAL);
        // node.symbol.offset = shared.nextLocalOffset;
        shared.nextLocalOffset = shared.nextLocalOffset + 1;
        shared.localCount = shared.localCount + 1;
        var local = new wasm_local_1.WasmLocal();
        local.symbol = node.symbol;
        local.type = index_1.symbolToValueType(local.symbol, bitness);
        if (fn.firstLocal == null)
            fn.firstLocal = local;
        else
            fn.lastLocal.next = local;
        fn.lastLocal = local;
        node.symbol.offset = fn.argumentEntries.length + fn.localVariables.length;
        fn.localVariables.push(new wasm_local_1.WasmLocalEntry(local.type, local.symbol.name));
    }
    var child = node.firstChild;
    while (child != null) {
        wasmAssignLocalVariableOffsets(fn, child, shared, bitness);
        child = child.nextSibling;
    }
}
function wasmEmit(compiler, bitness) {
    if (bitness === void 0) { bitness = bitness_1.Bitness.x32; }
    var module = new WasmModule(bitness);
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
    compiler.outputWAST = module.assembler.textOutput;
}
exports.wasmEmit = wasmEmit;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var symbol_1 = __webpack_require__(3);
var type_1 = __webpack_require__(18);
var node_1 = __webpack_require__(5);
var compile_target_1 = __webpack_require__(4);
var log_1 = __webpack_require__(2);
var scope_1 = __webpack_require__(17);
var utils_1 = __webpack_require__(6);
var const_1 = __webpack_require__(48);
var assert_1 = __webpack_require__(0);
var compiler_1 = __webpack_require__(11);
var terminal_1 = __webpack_require__(1);
/**
 * Author : Nidin Vinayakan
 */
var CheckContext = (function () {
    function CheckContext() {
    }
    CheckContext.prototype.allocateGlobalVariableOffset = function (sizeOf, alignmentOf) {
        var offset = utils_1.alignToNextMultipleOf(this.nextGlobalVariableOffset, alignmentOf);
        this.nextGlobalVariableOffset = offset + sizeOf;
        return offset;
    };
    return CheckContext;
}());
exports.CheckContext = CheckContext;
function addScopeToSymbol(symbol, parentScope) {
    var scope = new scope_1.Scope();
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
    var kind = node.kind;
    if (node.parent != null) {
        var parentKind = node.parent.kind;
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
        var symbol = new symbol_1.Symbol();
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
        var symbol = new symbol_1.Symbol();
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
            var genericType = node.firstGenericType();
            var genericSymbol = new symbol_1.Symbol();
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
        var symbol = new symbol_1.Symbol();
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
            var parent_1 = symbol.parent();
            initializeSymbol(context, parent_1);
            if (symbol.name == "constructor") {
                var body = node.functionBody();
                if (body !== null) {
                    var variablesNode = body.firstChild;
                    if (variablesNode.kind !== node_1.NodeKind.VARIABLES) {
                        var _variablesNode = node_1.createVariables();
                        body.insertChildBefore(variablesNode, _variablesNode);
                        variablesNode = _variablesNode;
                    }
                    var firstVariable = variablesNode.firstChild;
                    if (firstVariable !== undefined) {
                        if (firstVariable.stringValue !== "this") {
                            variablesNode.insertChildBefore(firstVariable, node_1.createVariable("this", node_1.createType(parent_1.resolvedType), null));
                        }
                        else if (firstVariable.stringValue === "this" && firstVariable.firstChild.resolvedType === undefined) {
                            firstVariable.firstChild.resolvedType = parent_1.resolvedType;
                        }
                    }
                    else {
                        variablesNode.appendChild(node_1.createVariable("this", node_1.createType(parent_1.resolvedType), null));
                    }
                    // All constructors have special return "this" type
                    var returnNode = node_1.createReturn(node_1.createName("this"));
                    if (node.lastChild.lastChild && node.lastChild.lastChild.kind == node_1.NodeKind.RETURN) {
                        node.lastChild.lastChild.remove();
                    }
                    node.lastChild.appendChild(returnNode);
                }
            }
            else {
                var firstArgument = node.functionFirstArgument();
                if (firstArgument.stringValue !== "this") {
                    node.insertChildBefore(firstArgument, node_1.createVariable("this", node_1.createType(parent_1.resolvedType), null));
                }
                else if (firstArgument.stringValue === "this" && firstArgument.firstChild.resolvedType === undefined) {
                    firstArgument.firstChild.resolvedType = parent_1.resolvedType;
                }
            }
        }
    }
    else if (kind == node_1.NodeKind.VARIABLE) {
        assert_1.assert(node.symbol == null);
        var symbol = new symbol_1.Symbol();
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
            var scope = new scope_1.Scope();
            scope.parent = parentScope;
            parentScope = scope;
        }
        node.scope = parentScope;
    }
    // Children
    var child = node.firstChild;
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
    }
}
exports.initialize = initialize;
function prepareNativeType(type, byteSizeAndMaxAlignment, flags) {
    var symbol = type.symbol;
    symbol.kind = symbol_1.SymbolKind.TYPE_NATIVE;
    symbol.byteSize = byteSizeAndMaxAlignment;
    symbol.maxAlignment = byteSizeAndMaxAlignment;
    symbol.flags = flags;
}
function forbidFlag(context, node, flag, text) {
    if ((node.flags & flag) != 0) {
        var range = node_1.rangeForFlag(node.firstFlag, flag);
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
    var node = symbol.node;
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
        var underlyingSymbol = symbol.resolvedType.underlyingType(context).symbol;
        symbol.byteSize = underlyingSymbol.byteSize;
        symbol.maxAlignment = underlyingSymbol.maxAlignment;
    }
    else if (symbol_1.isFunction(symbol.kind)) {
        var body = node.functionBody();
        var returnType = node.functionReturnType();
        var oldUnsafeAllowed = context.isUnsafeAllowed;
        context.isUnsafeAllowed = node.isUnsafe();
        resolveAsType(context, returnType, symbol.scope.parent);
        if (returnType.resolvedType.isClass() && returnType.hasParameters() && node.parent != returnType.resolvedType.symbol.node) {
            deriveConcreteClass(context, returnType, [returnType.firstChild.firstChild], returnType.resolvedType.symbol.scope);
        }
        var argumentCount = 0;
        var child = node.functionFirstArgument();
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
            symbol.rename = "set_" + symbol.name;
            // Validate argument count including "this"
            if (argumentCount != 2) {
                context.log.error(symbol.range, "Setters must have exactly one argument");
            }
        }
        else if (node.isOperator()) {
            if (symbol.name == "~" || symbol.name == "++" || symbol.name == "--") {
                if (argumentCount != 1) {
                    context.log.error(symbol.range, "Operator '" + symbol.name + "' must not have any arguments");
                }
            }
            else if (symbol.name == "+" || symbol.name == "-") {
                if (argumentCount > 2) {
                    context.log.error(symbol.range, "Operator '" + symbol.name + "' must have at most one argument");
                }
            }
            else if (symbol.name == "[]=") {
                if (argumentCount < 2) {
                    context.log.error(symbol.range, "Operator '[]=' must have at least one argument");
                }
            }
            else if (argumentCount != 2) {
                context.log.error(symbol.range, "Operator '" + symbol.name + "' must have exactly one argument");
            }
        }
        symbol.resolvedType = new type_1.Type();
        symbol.resolvedType.symbol = symbol;
        if (symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE) {
            var parent_2 = symbol.parent();
            var shouldConvertInstanceToGlobal = false;
            forbidFlag(context, node, node_1.NODE_FLAG_EXPORT, "Cannot use 'export' on an instance function");
            forbidFlag(context, node, node_1.NODE_FLAG_DECLARE, "Cannot use 'declare' on an instance function");
            // Functions inside declared classes are automatically declared
            if (parent_2.node.isDeclare()) {
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
                if (parent_2.node.isExport()) {
                    node.flags = node.flags | node_1.NODE_FLAG_EXPORT;
                }
            }
            // Rewrite this symbol as a global function instead of an instance function
            if (shouldConvertInstanceToGlobal) {
                symbol.kind = symbol_1.SymbolKind.FUNCTION_GLOBAL;
                symbol.flags = symbol.flags | symbol_1.SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL;
                symbol.rename = parent_2.name + "_" + (symbol.rename != null ? symbol.rename : symbol.name);
                var argument = node.functionFirstArgument();
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
        var type = node.variableType();
        var value = node.variableValue();
        var oldUnsafeAllowed = context.isUnsafeAllowed;
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
            context.log.error(node.internalRange, "Cannot create a variable with type '" + symbol.resolvedType.toString() + "'");
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
                    var previousSymbol = node.previousSibling.symbol;
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
            var scope = symbol.scope.parent;
            while (scope != null) {
                var shadowed = scope.findLocal(symbol.name, scope_1.ScopeHint.NORMAL);
                if (shadowed != null) {
                    context.log.error(node.internalRange, "The symbol '" + symbol.name + "' shadows another symbol with the same name in a parent scope");
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
    var templateNode = type.resolvedType.pointerTo ? type.resolvedType.pointerTo.symbol.node : type.resolvedType.symbol.node;
    var templateName = templateNode.stringValue;
    var typeName = templateNode.stringValue + ("<" + parameters[0].stringValue + ">");
    var rename = templateNode.stringValue + ("_" + parameters[0].stringValue);
    var symbol = scope.parent.findNested(typeName, scope_1.ScopeHint.NORMAL, scope_1.FindNested.NORMAL);
    if (symbol) {
        // resolve(context, type.firstChild.firstChild, scope.parent);
        var genericSymbol = scope.parent.findNested(type.firstChild.firstChild.stringValue, scope_1.ScopeHint.NORMAL, scope_1.FindNested.NORMAL);
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
    var node = templateNode.clone();
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
        var prevNode = templateNode.derivedNodes[templateNode.derivedNodes.length - 1];
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
    var firstChildNode = null;
    var lastChildNode = null;
    while (child) {
        if (child.stringValue == "this" && child.parent.symbol &&
            child.parent.symbol.kind == symbol_1.SymbolKind.FUNCTION_INSTANCE && child.kind == node_1.NodeKind.TYPE) {
            child = child.nextSibling;
            continue;
        }
        var childNode = void 0;
        if (child.kind == node_1.NodeKind.PARAMETERS || child.kind == node_1.NodeKind.PARAMETER) {
            child = child.nextSibling;
            continue;
        }
        if (child.isGeneric()) {
            var offset = child.offset;
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
                terminal_1.Terminal.write("Generic type escaped!");
                terminal_1.Terminal.write(child);
            }
            childNode = child.clone();
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
    var child = node.firstChild;
    while (child != null) {
        resolve(context, child, parentScope);
        assert_1.assert(child.resolvedType != null);
        child = child.nextSibling;
    }
}
exports.resolveChildren = resolveChildren;
function resolveChildrenAsExpressions(context, node, parentScope) {
    var child = node.firstChild;
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
    var from = node.resolvedType;
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
    else if (from == context.booleanType) {
        return true;
    }
    else if (from.isInteger() && to.isInteger()) {
        var mask = to.integerBitMask(context);
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
        context.log.error(node.range, "Cannot convert from type '" + node.resolvedType.toString() + "' to type '" + to.toString() + "' " + (kind == type_1.ConversionKind.IMPLICIT &&
            canConvert(context, node, to, type_1.ConversionKind.EXPLICIT) ? "without a cast" : ""));
        node.resolvedType = context.errorType;
    }
}
exports.checkConversion = checkConversion;
function checkStorage(context, target) {
    assert_1.assert(node_1.isExpression(target));
    if (target.resolvedType != context.errorType &&
        target.kind != node_1.NodeKind.INDEX &&
        target.kind != node_1.NodeKind.POINTER_INDEX &&
        target.kind != node_1.NodeKind.DEREFERENCE &&
        (target.kind != node_1.NodeKind.NAME &&
            target.kind != node_1.NodeKind.DOT ||
            target.symbol != null &&
                (!symbol_1.isVariable(target.symbol.kind) ||
                    target.symbol.kind == symbol_1.SymbolKind.VARIABLE_CONSTANT))) {
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
    if (type.isGeneric()) {
        return node_1.createNull();
    }
    assert_1.assert(type.isReference());
    return node_1.createNull();
}
exports.createDefaultValueForType = createDefaultValueForType;
function simplifyBinary(node) {
    var left = node.binaryLeft();
    var right = node.binaryRight();
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
        var shift = -1;
        var value = right.intValue;
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
    var left = node.binaryLeft();
    var right = node.binaryRight();
    var leftType = left.resolvedType;
    var rightType = right.resolvedType;
    return leftType.isUnsigned() && rightType.isUnsigned() || leftType.isUnsigned() && right.isNonNegativeInteger() ||
        left.isNonNegativeInteger() && rightType.isUnsigned();
}
exports.binaryHasUnsignedArguments = binaryHasUnsignedArguments;
function isBinaryLong(node) {
    var left = node.binaryLeft();
    var right = node.binaryRight();
    var leftType = left.resolvedType;
    var rightType = right.resolvedType;
    return leftType.isLong() || rightType.isLong();
}
exports.isBinaryLong = isBinaryLong;
function isBinaryDouble(node) {
    var left = node.binaryLeft();
    var right = node.binaryRight();
    var leftType = left.resolvedType;
    var rightType = right.resolvedType;
    return leftType.isDouble() || rightType.isDouble();
}
exports.isBinaryDouble = isBinaryDouble;
function isSymbolAccessAllowed(context, symbol, node, range) {
    if (symbol.isUnsafe() && !context.isUnsafeAllowed) {
        context.log.error(range, "Cannot use symbol '" + symbol.name + "' outside an 'unsafe' block");
        return false;
    }
    if (symbol.node != null && symbol.node.isPrivate()) {
        var parent_3 = symbol.parent();
        if (parent_3 != null && context.enclosingClass != parent_3) {
            context.log.error(range, "Cannot access private symbol '" + symbol.name + "' here");
            return false;
        }
    }
    if (symbol_1.isFunction(symbol.kind) && (symbol.isSetter() ? !node.isAssignTarget() : !node.isCallValue())) {
        if (symbol.isSetter()) {
            context.log.error(range, "Cannot use setter '" + symbol.name + "' here");
        }
        else {
            context.log.error(range, "Must call function '" + symbol.name + "'");
        }
        return false;
    }
    return true;
}
exports.isSymbolAccessAllowed = isSymbolAccessAllowed;
function resolve(context, node, parentScope) {
    var kind = node.kind;
    assert_1.assert(kind == node_1.NodeKind.FILE || parentScope != null);
    if (node.resolvedType != null) {
        return;
    }
    node.resolvedType = context.errorType;
    if (kind == node_1.NodeKind.FILE || kind == node_1.NodeKind.GLOBAL) {
        resolveChildren(context, node, parentScope);
    }
    else if (kind == node_1.NodeKind.MODULE) {
        var oldEnclosingModule = context.enclosingModule;
        initializeSymbol(context, node.symbol);
        context.enclosingModule = node.symbol;
        resolveChildren(context, node, node.scope);
        context.enclosingModule = oldEnclosingModule;
    }
    else if (kind == node_1.NodeKind.IMPORT || kind == node_1.NodeKind.IMPORT_FROM) {
        //ignore imports
    }
    else if (kind == node_1.NodeKind.CLASS) {
        var oldEnclosingClass = context.enclosingClass;
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
        var body = node.functionBody();
        initializeSymbol(context, node.symbol);
        if (node.stringValue == "constructor" && node.parent.kind == node_1.NodeKind.CLASS) {
            node.parent.constructorFunctionNode = node;
        }
        if (body != null) {
            var oldReturnType = context.currentReturnType;
            var oldUnsafeAllowed = context.isUnsafeAllowed;
            var returnType = node.functionReturnType();
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
        var symbol = node.symbol;
    }
    else if (kind == node_1.NodeKind.VARIABLE) {
        var symbol = node.symbol;
        initializeSymbol(context, symbol);
        var oldUnsafeAllowed = context.isUnsafeAllowed;
        context.isUnsafeAllowed = context.isUnsafeAllowed || node.isUnsafe();
        var value = node.variableValue();
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
        var found = false;
        var n = node;
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
        var oldUnsafeAllowed = context.isUnsafeAllowed;
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
        var target = node.indexTarget();
        var type = target.resolvedType;
        if (type != context.errorType) {
            var symbol = type.hasInstanceMembers() ? type.findMember("[]", scope_1.ScopeHint.NORMAL) : null;
            if (symbol == null) {
                if (target.resolvedType.pointerTo !== undefined) {
                    // convert index to pinter index
                    node.kind = node_1.NodeKind.POINTER_INDEX;
                    node.resolvedType = target.resolvedType.pointerTo.symbol.resolvedType;
                }
                else {
                    context.log.error(node.internalRange, "Cannot index into type '" + target.resolvedType.toString() + "'");
                }
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
        var type = node.alignOfType();
        resolveAsType(context, type, parentScope);
        node.resolvedType = context.int32Type;
        if (type.resolvedType != context.errorType) {
            node.becomeIntegerConstant(type.resolvedType.allocationAlignmentOf(context));
        }
    }
    else if (kind == node_1.NodeKind.SIZE_OF) {
        var type = node.sizeOfType();
        resolveAsType(context, type, parentScope);
        node.resolvedType = context.int32Type;
        if (type.resolvedType != context.errorType) {
            node.becomeIntegerConstant(type.resolvedType.allocationSizeOf(context));
        }
    }
    else if (kind == node_1.NodeKind.THIS) {
        var symbol = parentScope.findNested("this", scope_1.ScopeHint.NORMAL, scope_1.FindNested.NORMAL);
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
        var name_1 = node.stringValue;
        var symbol = parentScope.findNested(name_1, scope_1.ScopeHint.NORMAL, scope_1.FindNested.NORMAL);
        if (symbol == null) {
            var errorMessage = "No symbol named '" + name_1 + "' here";
            // In JavaScript, "this." before instance symbols is required
            symbol = parentScope.findNested(name_1, scope_1.ScopeHint.NORMAL, scope_1.FindNested.ALLOW_INSTANCE_ERRORS);
            if (symbol != null) {
                errorMessage += ", did you mean 'this." + symbol.name + "'?";
            }
            else if (name_1 == "number") {
                // TODO: convert to float64 automatically
                errorMessage += ", you cannot use generic number type from TypeScript!";
            }
            else if (name_1 == "bool") {
                errorMessage += ", did you mean 'boolean'?";
            }
            context.log.error(node.range, errorMessage);
        }
        else if (symbol.state == symbol_1.SymbolState.INITIALIZING) {
            context.log.error(node.range, "Cyclic reference to symbol '" + name_1 + "' here");
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
        var value = node.castValue();
        var type = node.castType();
        resolveAsExpression(context, value, parentScope);
        resolveAsType(context, type, parentScope);
        var castedType = type.resolvedType;
        checkConversion(context, value, castedType, type_1.ConversionKind.EXPLICIT);
        node.resolvedType = castedType;
        // Automatically fold constants
        if (value.kind == node_1.NodeKind.INT32 && castedType.isInteger()) {
            var result = value.intValue;
            var shift = 32 - castedType.integerBitCount(context);
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
        var target = node.dotTarget();
        resolve(context, target, parentScope);
        if (target.resolvedType != context.errorType) {
            if (target.isType() && (target.resolvedType.isEnum() || target.resolvedType.hasInstanceMembers()) ||
                !target.isType() && target.resolvedType.hasInstanceMembers()) {
                var name_2 = node.stringValue;
                // Empty names are left over from parse errors that have already been reported
                if (name_2.length > 0) {
                    var symbol = target.resolvedType.findMember(name_2, node.isAssignTarget() ? scope_1.ScopeHint.PREFER_SETTER : scope_1.ScopeHint.PREFER_GETTER);
                    if (symbol == null) {
                        context.log.error(node.internalRange, "No member named '" + name_2 + "' on type '" + target.resolvedType.toString() + "'");
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
                context.log.error(node.internalRange, "The type '" + target.resolvedType.toString() + "' has no members");
            }
        }
    }
    else if (kind == node_1.NodeKind.CALL) {
        var value = node.callValue();
        resolveAsExpression(context, value, parentScope);
        if (value.resolvedType != context.errorType) {
            var symbol = value.symbol;
            // Only functions are callable
            if (symbol == null || !symbol_1.isFunction(symbol.kind)) {
                context.log.error(value.range, "Cannot call value of type '" + value.resolvedType.toString() + "'");
            }
            else {
                initializeSymbol(context, symbol);
                if (symbol.shouldConvertInstanceToGlobal()) {
                    var name_3 = node_1.createSymbolReference(symbol);
                    node.insertChildBefore(value, name_3.withRange(value.internalRange));
                    node.insertChildBefore(value, value.dotTarget().remove());
                    value.remove();
                    value = name_3;
                }
                var returnType = symbol.node.functionReturnType();
                var argumentVariable = symbol.node.functionFirstArgumentIgnoringThis();
                var argumentValue = value.nextSibling;
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
                        context.log.error(node.internalRange, "Not enough arguments for function '" + symbol.name + "'");
                    }
                    else if (argumentValue != null) {
                        while (argumentValue != null) {
                            resolveAsExpression(context, argumentValue, parentScope);
                            argumentValue = argumentValue.nextSibling;
                        }
                        context.log.error(node.internalRange, "Too many arguments for function '" + symbol.name + "'");
                    }
                }
                if (returnType.resolvedType.isArray()) {
                    terminal_1.Terminal.write(returnType);
                }
                // Pass the return type along
                node.resolvedType = returnType.resolvedType;
            }
        }
    }
    else if (kind == node_1.NodeKind.DELETE) {
        var value = node.deleteType();
        if (value != null) {
            resolveAsExpression(context, value, parentScope);
            if (value.resolvedType == null || value.resolvedType == context.voidType) {
                context.log.error(value.range, "Unexpected delete value 'void'");
            }
        }
        else {
            context.log.error(node.range, "Expected delete value '" + context.currentReturnType.toString() + "'");
        }
    }
    else if (kind == node_1.NodeKind.RETURN) {
        var value = node.returnValue();
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
            context.log.error(node.range, "Expected return value in function returning '" + context.currentReturnType.toString() + "'");
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
        var child = node.firstChild;
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
        var value = node.whileValue();
        var body = node.whileBody();
        resolveAsExpression(context, value, parentScope);
        checkConversion(context, value, context.booleanType, type_1.ConversionKind.IMPLICIT);
        resolve(context, body, parentScope);
    }
    else if (kind == node_1.NodeKind.IF) {
        var value = node.ifValue();
        var yes = node.ifTrue();
        var no = node.ifFalse();
        resolveAsExpression(context, value, parentScope);
        checkConversion(context, value, context.booleanType, type_1.ConversionKind.IMPLICIT);
        resolve(context, yes, parentScope);
        if (no != null) {
            resolve(context, no, parentScope);
        }
    }
    else if (kind == node_1.NodeKind.HOOK) {
        var value = node.hookValue();
        var yes = node.hookTrue();
        var no = node.hookFalse();
        resolveAsExpression(context, value, parentScope);
        checkConversion(context, value, context.booleanType, type_1.ConversionKind.IMPLICIT);
        resolve(context, yes, parentScope);
        resolve(context, no, parentScope);
        checkConversion(context, yes, no.resolvedType, type_1.ConversionKind.IMPLICIT);
        var commonType = (yes.resolvedType == context.nullType ? no : yes).resolvedType;
        if (yes.resolvedType != commonType && (yes.resolvedType != context.nullType || !commonType.isReference()) &&
            no.resolvedType != commonType && (no.resolvedType != context.nullType || !commonType.isReference())) {
            context.log.error(log_1.spanRanges(yes.range, no.range), "Type '" + yes.resolvedType.toString() + "' is not the same as type '" + no.resolvedType.toString() + "'");
        }
        node.resolvedType = commonType;
    }
    else if (kind == node_1.NodeKind.ASSIGN) {
        var left = node.binaryLeft();
        var right = node.binaryRight();
        if (left.kind == node_1.NodeKind.INDEX) {
            resolveChildrenAsExpressions(context, left, parentScope);
            var target = left.indexTarget();
            var type = target.resolvedType;
            if (type != context.errorType) {
                var symbol = type.hasInstanceMembers() ? type.findMember("[]=", scope_1.ScopeHint.NORMAL) : null;
                if (symbol == null) {
                    if (target.resolvedType.pointerTo != undefined) {
                        left.kind = node_1.NodeKind.POINTER_INDEX;
                        left.resolvedType = target.resolvedType.pointerTo.symbol.resolvedType;
                    }
                    else {
                        context.log.error(left.internalRange, "Cannot index into type '" + target.resolvedType.toString() + "'");
                    }
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
        if (!left.resolvedType) {
            resolveAsExpression(context, left, parentScope);
        }
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
        var type = node.newType();
        resolveAsType(context, type, parentScope);
        if (type.resolvedType.isTemplate() && type.hasParameters() && node.parent != type.resolvedType.symbol.node) {
            deriveConcreteClass(context, type, [type.firstChild.firstChild], type.resolvedType.symbol.scope);
        }
        if (type.resolvedType != context.errorType) {
            if (!type.resolvedType.isClass()) {
                context.log.error(type.range, "Cannot construct type '" + type.resolvedType.toString() + "'");
            }
            else {
                node.resolvedType = type.resolvedType;
            }
        }
        //Constructors arguments
        var child = type.nextSibling;
        var constructorNode = node.constructorNode();
        var argumentVariable = constructorNode.functionFirstArgument();
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
        var value = node.unaryValue();
        resolveAsType(context, value, parentScope);
        if (context.target == compile_target_1.CompileTarget.JAVASCRIPT) {
            context.log.error(node.internalRange, "Cannot use pointers when compiling to JavaScript");
        }
        else {
            var type = value.resolvedType;
            if (type != context.errorType) {
                node.resolvedType = type.pointerType();
            }
        }
    }
    else if (kind == node_1.NodeKind.POINTER_INDEX) {
        debugger;
    }
    else if (kind == node_1.NodeKind.DEREFERENCE) {
        var value = node.unaryValue();
        resolveAsExpression(context, value, parentScope);
        var type = value.resolvedType;
        if (type != context.errorType) {
            if (type.pointerTo == null) {
                context.log.error(node.internalRange, "Cannot dereference type '" + type.toString() + "'");
            }
            else {
                node.resolvedType = type.pointerTo;
            }
        }
    }
    else if (kind == node_1.NodeKind.ADDRESS_OF) {
        var value = node.unaryValue();
        resolveAsExpression(context, value, parentScope);
        context.log.error(node.internalRange, "The address-of operator is not supported");
    }
    else if (node_1.isUnary(kind)) {
        var value = node.unaryValue();
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
                var input = value.longValue;
                var output = input;
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
                var input = value.intValue;
                var output = input;
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
                var input = value.doubleValue;
                var output = input;
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
                var input = value.floatValue;
                var output = input;
                if (kind == node_1.NodeKind.COMPLEMENT)
                    output = ~input;
                else if (kind == node_1.NodeKind.NEGATIVE)
                    output = -input;
                node.becomeFloatConstant(output);
            }
        }
        else if (value.resolvedType != context.errorType) {
            var name_4 = node.internalRange.toString();
            var symbol = value.resolvedType.findMember(name_4, scope_1.ScopeHint.NOT_BINARY);
            // Automatically call the function
            if (symbol != null) {
                node.appendChild(node_1.createMemberReference(value.remove(), symbol).withRange(node.range).withInternalRange(node.internalRange));
                node.kind = node_1.NodeKind.CALL;
                node.resolvedType = null;
                resolveAsExpression(context, node, parentScope);
            }
            else {
                context.log.error(node.internalRange, "Cannot use unary operator '" + name_4 + "' with type '" + value.resolvedType.toString() + "'");
            }
        }
    }
    else if (node_1.isBinary(kind)) {
        var left = node.binaryLeft();
        var right = node.binaryRight();
        resolveAsExpression(context, left, parentScope);
        resolveAsExpression(context, right, parentScope);
        var leftType = left.resolvedType;
        if ((leftType.isDouble() && right.resolvedType.isFloat()) ||
            (leftType.isLong() && right.resolvedType.isInteger())) {
            right.becomeTypeOf(left, context);
        }
        var rightType = right.resolvedType;
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
                context.log.error(node.internalRange, "Cannot compare type '" + leftType.toString() + "' with type '" + rightType.toString() + "'");
            }
        }
        else if ((leftType.isInteger() || leftType.isLong() ||
            leftType.isFloat() || leftType.isDouble() ||
            (leftType.isGeneric() && rightType.isGeneric())) &&
            kind != node_1.NodeKind.EQUAL && kind != node_1.NodeKind.NOT_EQUAL) {
            var isFloat = false;
            var isFloat64 = false;
            if (leftType.isFloat() || leftType.isDouble()) {
                isFloat = true;
                isFloat64 = leftType.isDouble();
            }
            var isUnsigned = binaryHasUnsignedArguments(node);
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
                var isLong = isBinaryLong(node);
                var commonType = void 0;
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
                    var inputLeft = left.intValue;
                    var inputRight = right.intValue;
                    var output = 0;
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
                    var inputLeft = left.floatValue;
                    var inputRight = right.floatValue;
                    var output = 0;
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
                var expectedType = isFloat ? (isFloat64 ? context.float64Type : context.float32Type) : (isUnsigned ? context.uint32Type : context.int32Type);
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
            var name_5 = node.internalRange.toString();
            var symbol = leftType.findMember(kind == node_1.NodeKind.NOT_EQUAL ? "==" :
                kind == node_1.NodeKind.LESS_THAN_EQUAL ? ">" :
                    kind == node_1.NodeKind.GREATER_THAN_EQUAL ? "<" :
                        name_5, scope_1.ScopeHint.NOT_UNARY);
            // Automatically call the function
            if (symbol != null) {
                left = node_1.createMemberReference(left.remove(), symbol).withRange(node.range).withInternalRange(node.internalRange);
                right.remove();
                if (kind == node_1.NodeKind.NOT_EQUAL ||
                    kind == node_1.NodeKind.LESS_THAN_EQUAL ||
                    kind == node_1.NodeKind.GREATER_THAN_EQUAL) {
                    var call = node_1.createCall(left);
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
                if (leftType != context.errorType &&
                    rightType != context.errorType &&
                    leftType != rightType &&
                    !canConvert(context, right, leftType, type_1.ConversionKind.IMPLICIT) &&
                    !canConvert(context, left, rightType, type_1.ConversionKind.IMPLICIT)) {
                    context.log.error(node.internalRange, "Cannot compare type '" + leftType.toString() + "' with type '" + rightType.toString() + "'");
                }
            }
            else {
                context.log.error(node.internalRange, "Cannot use binary operator '" + name_5 + "' with type '" + leftType.toString() + "'");
            }
        }
    }
    else if (kind == node_1.NodeKind.TYPE) {
        //ignore types
    }
    else {
        terminal_1.Terminal.error("Unexpected kind: " + node_1.NodeKind[kind]);
        assert_1.assert(false);
    }
}
exports.resolve = resolve;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var compile_target_1 = __webpack_require__(4);
exports.defaultCompilerOptions = {
    target: compile_target_1.CompileTarget.WEBASSEMBLY,
    silent: true,
    logError: true
};


/***/ }),
/* 48 */
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
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var symbol_1 = __webpack_require__(3);
var node_1 = __webpack_require__(5);
var compiler_1 = __webpack_require__(11);
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
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = __webpack_require__(2);
var scanner_1 = __webpack_require__(9);
var filesystem_1 = __webpack_require__(22);
var terminal_1 = __webpack_require__(1);
var javascript = __webpack_require__(24);
function preparse(source, compiler, log) {
    var contents = source.contents;
    var limit = contents.length;
    var pathSeparator = source.name.indexOf("/") > -1 ? "/" : (source.name.indexOf("\\") > -1 ? "\\" : "/");
    var basePath = source.name.substring(0, source.name.lastIndexOf(pathSeparator));
    var wantNewline = false;
    var captureImportFrom = false;
    var captureImportPath = false;
    var i = 0;
    while (i < limit) {
        var start = i;
        var c = contents[i];
        i = i + 1;
        if (c == ' ' || c == '\t' || c == '\r') {
            continue;
        }
        var kind = scanner_1.TokenKind.END_OF_FILE;
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
            }
        }
        else if (scanner_1.isAlpha(c)) {
            while (i < limit && (scanner_1.isAlpha(contents[i]) || scanner_1.isNumber(contents[i]))) {
                i = i + 1;
            }
            // Keywords
            var length_1 = i - start;
            if (length_1 >= 2 && length_1 <= 10) {
                var text = contents.slice(start, i);
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
                        var text = contents.slice(start + 1, i - 1);
                        //FIXME: If the import already resolved don't add it again.
                        var importContent = resolveImport(basePath + pathSeparator + text, text);
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
    var contents = null;
    if (original === "javascript") {
        contents = javascript;
    }
    else {
        contents = filesystem_1.FileSystem.readTextFile(importPath);
    }
    if (contents == null) {
        terminal_1.Terminal.error("Cannot read from " + importPath);
        return null;
    }
    return contents;
}


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = __webpack_require__(2);
var scanner_1 = __webpack_require__(9);
var parser_1 = __webpack_require__(19);
var PreprocessorValue;
(function (PreprocessorValue) {
    PreprocessorValue[PreprocessorValue["FALSE"] = 0] = "FALSE";
    PreprocessorValue[PreprocessorValue["TRUE"] = 1] = "TRUE";
    PreprocessorValue[PreprocessorValue["ERROR"] = 2] = "ERROR";
})(PreprocessorValue = exports.PreprocessorValue || (exports.PreprocessorValue = {}));
var PreprocessorFlag = (function () {
    function PreprocessorFlag() {
    }
    return PreprocessorFlag;
}());
exports.PreprocessorFlag = PreprocessorFlag;
// This preprocessor implements the flag-only conditional behavior from C#.
// There are two scopes for flags: global-level and file-level. This is stored
// using an ever-growing linked list of PreprocessorFlag objects that turn a
// flag either on or off. That way file-level state can just reference the
// memory of the global-level state and the global-level state can easily be
// restored after parsing a file just by restoring the pointer.
var Preprocessor = (function () {
    function Preprocessor() {
    }
    Preprocessor.prototype.peek = function (kind) {
        return this.current.kind == kind;
    };
    Preprocessor.prototype.eat = function (kind) {
        if (this.peek(kind)) {
            this.advance();
            return true;
        }
        return false;
    };
    Preprocessor.prototype.advance = function () {
        if (!this.peek(scanner_1.TokenKind.END_OF_FILE)) {
            this.previous = this.current;
            this.current = this.current.next;
        }
    };
    Preprocessor.prototype.unexpectedToken = function () {
        this.log.error(this.current.range, "Unexpected " + scanner_1.tokenToString(this.current.kind));
    };
    Preprocessor.prototype.expect = function (kind) {
        if (!this.peek(kind)) {
            this.log.error(this.current.range, "Expected " + scanner_1.tokenToString(kind) + " but found " + scanner_1.tokenToString(this.current.kind));
            return false;
        }
        this.advance();
        return true;
    };
    Preprocessor.prototype.removeTokensFrom = function (before) {
        before.next = this.current;
        this.previous = before;
    };
    Preprocessor.prototype.isDefined = function (name) {
        var flag = this.firstFlag;
        while (flag != null) {
            if (flag.name == name) {
                return flag.isDefined;
            }
            flag = flag.next;
        }
        return false;
    };
    Preprocessor.prototype.define = function (name, isDefined) {
        var flag = new PreprocessorFlag();
        flag.isDefined = isDefined;
        flag.name = name;
        flag.next = this.firstFlag;
        this.firstFlag = flag;
    };
    Preprocessor.prototype.run = function (source, log) {
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
    };
    // Scan over the next reachable tokens, evaluate #define/#undef directives,
    // and fold #if/#else chains. Stop on #elif/#else/#endif. Return false on
    // failure. Takes a booleanean flag for whether or not control flow is live in
    // this block.
    Preprocessor.prototype.scan = function (isParentLive) {
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
    };
    Preprocessor.prototype.parsePrefix = function () {
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
            var value_1 = this.parseExpression(parser_1.Precedence.LOWEST);
            if (value_1 == PreprocessorValue.ERROR || !this.expect(scanner_1.TokenKind.RIGHT_PARENTHESIS)) {
                return PreprocessorValue.ERROR;
            }
            // Recover from a C-style define operator
            if (isDefinedOperator) {
                var errorMessage = "There is no 'defined' operator";
                if (first.kind == scanner_1.TokenKind.IDENTIFIER && this.previous == first.next) {
                    errorMessage += " (just use '" + first.range.toString() + "' instead)";
                }
                this.log.error(log_1.spanRanges(start.range, this.previous.range), errorMessage);
            }
            return value_1;
        }
        // Recover from a C-style boolean
        if (this.eat(scanner_1.TokenKind.INT32)) {
            var isTrue_1 = this.previous.range.toString() != "0";
            this.log.error(this.previous.range, "Unexpected integer (did you mean ' " + (isTrue_1 ? "true" : "false") + "')?");
            return isTrue_1 ? PreprocessorValue.TRUE : PreprocessorValue.FALSE;
        }
        this.unexpectedToken();
        return PreprocessorValue.ERROR;
    };
    Preprocessor.prototype.parseInfix = function (precedence, left) {
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
    };
    Preprocessor.prototype.parseExpression = function (precedence) {
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
    };
    return Preprocessor;
}());
exports.Preprocessor = Preprocessor;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(23));
__export(__webpack_require__(4));
__export(__webpack_require__(2));


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var compile_target_1 = __webpack_require__(4);
// library files
var math = __webpack_require__(27);
var types = __webpack_require__(28);
var array = __webpack_require__(25);
var jstypes = __webpack_require__(30);
var runtime = __webpack_require__(29);
var wrapper = __webpack_require__(31);
var malloc = __webpack_require__(26);
var builtins = __webpack_require__(32);
var initializer = __webpack_require__(33);
var Library = (function () {
    function Library() {
    }
    Library.get = function (target) {
        var lib;
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
    };
    Library.getRuntime = function (target) {
        switch (target) {
            case compile_target_1.CompileTarget.JAVASCRIPT:
                return runtime + "\n";
            default:
                return "";
        }
    };
    Library.getWrapper = function (target) {
        switch (target) {
            case compile_target_1.CompileTarget.JAVASCRIPT:
                return wrapper + "\n";
            default:
                return "";
        }
    };
    return Library;
}());
exports.Library = Library;


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var stringBuilderPool = null;
// Remove an object from the pool or allocate a new object if the pool is empty
function StringBuilder_new() {
    var sb = stringBuilderPool;
    if (sb != null)
        stringBuilderPool = sb.next;
    else
        sb = new StringBuilder();
    sb.clear();
    return sb;
}
exports.StringBuilder_new = StringBuilder_new;
function StringBuilder_appendQuoted(sb, text) {
    var end = 0;
    var limit = text.length;
    var start = end;
    sb.appendChar('"');
    while (end < limit) {
        var c = text[end];
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
var StringBuilder = (function () {
    function StringBuilder(indentSize) {
        if (indentSize === void 0) { indentSize = 4; }
        this.indent = 0;
        this.chunks = [];
        this.indentSize = indentSize;
        this._text = "";
    }
    Object.defineProperty(StringBuilder.prototype, "indentSize", {
        get: function () {
            return this._indentSize;
        },
        set: function (value) {
            this._indentSize = value;
            this.indentStr = "";
            for (var i = 0; i < value; i++) {
                this.indentStr += " ";
            }
        },
        enumerable: true,
        configurable: true
    });
    StringBuilder.prototype.clear = function () {
        this._text = "";
    };
    StringBuilder.prototype.clearIndent = function (delta) {
        if (delta === void 0) { delta = 0; }
        this._text = this._text.substr(0, this._text.length - (delta * this.indentSize));
    };
    StringBuilder.prototype.emitIndent = function (delta) {
        if (delta === void 0) { delta = 0; }
        if (delta < 0) {
            this._text = this._text.substr(0, this._text.length + (delta * this.indentSize));
        }
        this.indent += delta;
        var i = this.indent;
        while (i > 0) {
            this._text += this.indentStr;
            i = i - 1;
        }
    };
    StringBuilder.prototype.appendChar = function (c) {
        // this._text = StringBuilder_appendChar(this._text, c);
        this._text += c;
        return this;
    };
    StringBuilder.prototype.appendSlice = function (text, start, end) {
        // this._text = StringBuilder_append(this._text, text.slice(start, end));
        this._text += text.slice(start, end);
        return this;
    };
    StringBuilder.prototype.breakChunk = function () {
        this.chunks.push(this._text);
        this._text = "";
        return this.chunks.length - 1;
    };
    StringBuilder.prototype.appendLine = function (text, indent) {
        if (indent === void 0) { indent = 0; }
        this.indent += indent;
        this.emitIndent();
        this._text += text + "\n";
        return this;
    };
    StringBuilder.prototype.appendRaw = function (text) {
        this._text += text + "\n";
        return this;
    };
    StringBuilder.prototype.append = function (text, indent) {
        var _this = this;
        if (indent === void 0) { indent = 0; }
        this.indent += indent;
        var lines = text.split("\n");
        lines.forEach(function (line, i) {
            if (i > 0) {
                _this._text += "\n";
                _this.emitIndent();
            }
            _this._text += line;
        });
        return this;
    };
    StringBuilder.prototype.removeLastChar = function () {
        this._text = this._text.substring(0, this._text.length - 1);
    };
    StringBuilder.prototype.removeLastLinebreak = function () {
        this._text = this._text.substring(0, this._text.lastIndexOf("\n"));
    };
    // This also "frees" this object (puts it back in the pool)
    StringBuilder.prototype.finish = function () {
        this.next = stringBuilderPool;
        stringBuilderPool = this;
        if (this.chunks.length > 0) {
            var code_1 = "";
            this.chunks.forEach(function (chunk) {
                code_1 += chunk;
            });
            return code_1 + this._text;
        }
        else {
            return this._text;
        }
    };
    return StringBuilder;
}());
exports.StringBuilder = StringBuilder;


/***/ }),
/* 55 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ })
/******/ ]);
});
//# sourceMappingURL=turboscript.js.map