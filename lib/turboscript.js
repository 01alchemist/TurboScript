(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["turboscript"] = factory();
	else
		root["turboscript"] = factory();
})(this, function() {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
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
var CompileTarget;
(function (CompileTarget) {
    CompileTarget[CompileTarget["NONE"] = 0] = "NONE";
    CompileTarget[CompileTarget["AUTO"] = 1] = "AUTO";
    CompileTarget[CompileTarget["CPP"] = 2] = "CPP";
    CompileTarget[CompileTarget["JAVASCRIPT"] = 3] = "JAVASCRIPT";
    CompileTarget[CompileTarget["WEBASSEMBLY"] = 4] = "WEBASSEMBLY";
})(CompileTarget = exports.CompileTarget || (exports.CompileTarget = {}));


/***/ }),
/* 1 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: Typescript emitted no output for C:\\Users\\01\\workspace\\TurboScript\\src\\turboscript.ts.\n    at Object.loader (C:\\Users\\01\\workspace\\TurboScript\\node_modules\\ts-loader\\dist\\index.js:32:15)");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var color_1 = __webpack_require__(5);
var assert_1 = __webpack_require__(4);
var terminal_1 = __webpack_require__(6);
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
            var location = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);
            str += diagnostic.sourceName(location);
            str += diagnostic.kind == DiagnosticKind.ERROR ? "ERROR: " : "WARN: ";
            str += diagnostic.message + "\n";
            str += diagnostic.lineContents();
            str += diagnostic.sourceRange(location);
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
            var location = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);
            // Source
            var diagnosticMessage = diagnostic.sourceName(location);
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
            diagnosticMessage = diagnostic.sourceRange(location);
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

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(1));
__export(__webpack_require__(0));
__export(__webpack_require__(2));


/***/ }),
/* 4 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: Typescript emitted no output for C:\\Users\\01\\workspace\\TurboScript\\src\\utils\\assert.ts.\n    at Object.loader (C:\\Users\\01\\workspace\\TurboScript\\node_modules\\ts-loader\\dist\\index.js:32:15)");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: Typescript emitted no output for C:\\Users\\01\\workspace\\TurboScript\\src\\utils\\color.ts.\n    at Object.loader (C:\\Users\\01\\workspace\\TurboScript\\node_modules\\ts-loader\\dist\\index.js:32:15)");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: Typescript emitted no output for C:\\Users\\01\\workspace\\TurboScript\\src\\utils\\terminal.ts.\n    at Object.loader (C:\\Users\\01\\workspace\\TurboScript\\node_modules\\ts-loader\\dist\\index.js:32:15)");

/***/ })
/******/ ]);
});
//# sourceMappingURL=turboscript.js.map