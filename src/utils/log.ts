import {Token} from "../compiler/scanner/scanner";
import {Node} from "../compiler/core/node";
import {StringBuilder, StringBuilder_new} from "./stringbuilder";

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

            // Ignore low surrogates
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

    rangeAtEnd(): SourceRange {
        return createRange(this.source, this.end, this.end);
    }
}

export function createRange(source: Source, start: int32, end: int32): SourceRange {
    assert(start <= end);
    var range = new SourceRange();
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

    appendSourceName(builder: StringBuilder, location: LineColumn): void {
        builder
            .append(this.range.source.name)
            .append(':')
            .append((location.line + 1).toString())
            .append(':')
            .append((location.column + 1).toString())
            .append(": ");
    }

    appendKind(builder: StringBuilder): void {
        builder.append(this.kind == DiagnosticKind.ERROR ? "error: " : "warning: ");
    }

    appendMessage(builder: StringBuilder): void {
        builder.append(this.message).append('\n');
    }

    appendLineContents(builder: StringBuilder, location: LineColumn): void {
        var range = this.range.enclosingLine();
        builder.appendSlice(range.source.contents, range.start, range.end).append('\n');
    }

    appendRange(builder: StringBuilder, location: LineColumn): void {
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

        // Multiple characters
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
        var diagnostic = new Diagnostic();
        diagnostic.range = range;
        diagnostic.message = message;
        diagnostic.kind = kind;

        if (this.first == null) this.first = diagnostic;
        else this.last.next = diagnostic;
        this.last = diagnostic;
    }

    toString(): string {
        var builder = StringBuilder_new();
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

    hasErrors(): boolean {
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
