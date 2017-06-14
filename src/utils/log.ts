import {Token} from "../compiler/scanner/scanner";
import {Node} from "../compiler/core/node";
import {StringBuilder} from "./stringbuilder";
import {Color} from "./color";
import {assert} from "./assert";
import {Terminal} from "./terminal";

export class LineColumn {
    line: int32; // 0-based
    column: int32; // 0-based
}

export class Source {
    name: string;
    contents: string;

    // These are for internal use by the compiler
    prev: Source;
    next: Source;
    isLibrary: boolean;
    firstToken: Token;
    file: Node;

    indexToLineColumn(index: int32): LineColumn {
        let contents = this.contents;
        let column = 0;
        let line = 0;
        let i = 0;

        // Just count the number of lines from the beginning of the file for now
        while (i < index) {
            let c = contents.charCodeAt(i);

            if (c == '\n'.charCodeAt(0)) {
                line = line + 1;
                column = 0;
            }

            // Ignore low surrogates
            else if (c < 0xDC00 || c > 0xDFFF) {
                column = column + 1;
            }

            i = i + 1;
        }

        let location = new LineColumn();
        location.line = line;
        location.column = column;
        return location;
    }
}

export class SourceRange {
    source: Source;
    start: int32;
    end: int32;

    toString(): string {
        return this.source.contents.slice(this.start, this.end);
    }

    equals(other: SourceRange): boolean {
        return this.source == other.source && this.start == other.start && this.end == other.end;
    }

    enclosingLine(): SourceRange {
        let contents = this.source.contents;
        let start = this.start;
        let end = this.start;

        while (start > 0 && contents[start - 1] != '\n') {
            start = start - 1;
        }

        let length = contents.length;
        while (end < length && contents[end] != '\n') {
            end = end + 1;
        }

        return createRange(this.source, start, end);
    }

    rangeAtEnd(): SourceRange {
        return createRange(this.source, this.end, this.end);
    }
}

export function createRange(source: Source, start: int32, end: int32): SourceRange {
    assert(start <= end);
    let range = new SourceRange();
    range.source = source;
    range.start = start;
    range.end = end;
    return range;
}

export function spanRanges(left: SourceRange, right: SourceRange): SourceRange {
    assert(left.source == right.source);
    assert(left.start <= right.start);
    assert(left.end <= right.end);
    return createRange(left.source, left.start, right.end);
}

export enum DiagnosticKind {
    ERROR,
    WARNING,
}

export class Diagnostic {
    range: SourceRange;
    message: string;
    kind: DiagnosticKind;
    next: Diagnostic;

    sourceName(location: LineColumn): string {
        return `${this.range.source.name}:${location.line + 1}:${location.column + 1}: `;
    }

    lineContents(): string {
        let range = this.range.enclosingLine();
        return range.source.contents.slice(range.start, range.end) + "\n";
    }

    sourceRange(location: LineColumn): string {
        let range = this.range;
        let column = location.column;
        let contents = range.source.contents;
        let rangeStr = "";
        // Whitespace
        while (column > 0) {
            rangeStr += ' ';
            column = column - 1;
        }

        // Single character
        if (range.end - range.start <= 1) {
            rangeStr += '^';
        }

        // Multiple characters
        else {
            let i = range.start;
            while (i < range.end && contents[i] != '\n') {
                rangeStr += '~';
                i = i + 1;
            }
        }

        return rangeStr + '\n';
    }
}

export class Log {
    first: Diagnostic;
    last: Diagnostic;

    error(range: SourceRange, message: string): void {
        this.append(range, message, DiagnosticKind.ERROR);
    }

    warning(range: SourceRange, message: string): void {
        this.append(range, message, DiagnosticKind.WARNING);
    }

    append(range: SourceRange, message: string, kind: DiagnosticKind): void {
        let diagnostic = new Diagnostic();
        diagnostic.range = range;
        diagnostic.message = message;
        diagnostic.kind = kind;

        if (this.first == null) this.first = diagnostic;
        else this.last.next = diagnostic;
        this.last = diagnostic;
    }

    toString(): string {
        let str = "";
        let diagnostic = this.first;

        while (diagnostic != null) {
            let location = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);
            str += diagnostic.sourceName(location);
            str += diagnostic.kind == DiagnosticKind.ERROR ? "ERROR: " : "WARN: ";
            str += diagnostic.message + "\n";
            str += diagnostic.lineContents();
            str += diagnostic.sourceRange(location);
            diagnostic = diagnostic.next;
        }

        return str;
    }

    hasErrors(): boolean {
        let diagnostic = this.first;

        while (diagnostic != null) {
            if (diagnostic.kind == DiagnosticKind.ERROR) {
                return true;
            }
            diagnostic = diagnostic.next;
        }

        return false;
    }
}

export function writeLogToTerminal(log: Log): void {
    let diagnostic = log.first;

    while (diagnostic != null) {
        if (diagnostic.range !== undefined) {
            let location = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);

            // Source
            let diagnosticMessage = diagnostic.sourceName(location);
            Terminal.setBoldText();
            Terminal.write(diagnosticMessage);

            // Kind
            diagnosticMessage = diagnostic.kind == DiagnosticKind.ERROR ? "ERROR: " : "WARN: ";
            Terminal.setTextColor(diagnostic.kind == DiagnosticKind.ERROR ? Color.RED : Color.ORANGE);
            Terminal.write(diagnosticMessage);

            // Message
            Terminal.setBoldText();
            Terminal.write(diagnostic.message + "\n");

            // Line contents
            Terminal.clearColor();
            Terminal.write(diagnostic.lineContents());

            // SourceRange
            diagnosticMessage = diagnostic.sourceRange(location);
            Terminal.setTextColor(Color.GREEN);
            Terminal.write(diagnosticMessage);

        } else {
            Terminal.setTextColor(Color.RED);
            Terminal.write(diagnostic.message + "\n");
        }

        diagnostic = diagnostic.next;
    }

    Terminal.clearColor();
}
