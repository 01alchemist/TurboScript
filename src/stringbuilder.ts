import {ushort, int32} from "./primitives";
var stringBuilderPool: StringBuilder = null;

// Remove an object from the pool or allocate a new object if the pool is empty
export function StringBuilder_new(): StringBuilder {
    var sb = stringBuilderPool;
    if (sb != null) stringBuilderPool = sb.next;
    else sb = new StringBuilder();
    sb.clear();
    return sb;
}

export function StringBuilder_appendQuoted(sb: StringBuilder, text: string): void {
    var end = 0;
    var limit = text.length;
    var start = end;

    sb.appendChar('"');

    while (end < limit) {
        var c = text[end];

        if (c == '"') sb.appendSlice(text, start, end).append("\\\"");
        else if (c == '\0') sb.appendSlice(text, start, end).append("\\0");
        else if (c == '\t') sb.appendSlice(text, start, end).append("\\t");
        else if (c == '\r') sb.appendSlice(text, start, end).append("\\r");
        else if (c == '\n') sb.appendSlice(text, start, end).append("\\n");
        else if (c == '\\') sb.appendSlice(text, start, end).append("\\\\");
        else {
            end = end + 1;
            continue;
        }

        end = end + 1;
        start = end;
    }

    sb.appendSlice(text, start, end).appendChar('"');
}

declare function StringBuilder_appendChar(a: string, b: string): string;
declare function StringBuilder_append(a: string, b: string): string;

export class StringBuilder {
    next: StringBuilder;
    _text: string;

    clear(): void {
        this._text = "";
    }

    appendChar(c: string): StringBuilder {
        this._text = StringBuilder_appendChar(this._text, c);
        return this;
    }

    appendSlice(text: string, start: int32, end: int32): StringBuilder {
        this._text = StringBuilder_append(this._text, text.slice(start, end));
        return this;
    }

    append(text: string): StringBuilder {
        this._text = StringBuilder_append(this._text, text);
        return this;
    }

    // This also "frees" this object (puts it back in the pool)
    finish(): string {
        this.next = stringBuilderPool;
        stringBuilderPool = this;
        return this._text;
    }
}