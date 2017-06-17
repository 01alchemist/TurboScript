let stringBuilderPool: StringBuilder = null;

// Remove an object from the pool or allocate a new object if the pool is empty
export function StringBuilder_new(): StringBuilder {
    let sb = stringBuilderPool;
    if (sb != null) stringBuilderPool = sb.next;
    else sb = new StringBuilder();
    sb.clear();
    return sb;
}

export function StringBuilder_appendQuoted(sb: StringBuilder, text: string): void {
    let end = 0;
    let limit = text.length;
    let start = end;

    sb.appendChar('"');

    while (end < limit) {
        let c = text[end];

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
    indent: int32 = 0;
    private _indentSize: int32;
    private indentStr: string;
    next: StringBuilder;
    _text: string;
    chunks: string[] = [];

    constructor(indentSize: int32 = 4) {
        this.indentSize = indentSize;
        this._text = "";
    }

    get indentSize(): int32 {
        return this._indentSize;
    }

    set indentSize(value: int32) {
        this._indentSize = value;
        this.indentStr = "";
        for (let i: int32 = 0; i < value; i++) {
            this.indentStr += " ";
        }
    }

    clear(): void {
        this._text = "";
    }

    clearIndent(delta: number = 0): void {
        this._text = this._text.substr(0, this._text.length - (delta * this.indentSize));
    }

    emitIndent(delta: number = 0): void {
        if (delta < 0) {
            this._text = this._text.substr(0, this._text.length + (delta * this.indentSize));
        }
        this.indent += delta;
        let i = this.indent;
        while (i > 0) {
            this._text += this.indentStr;
            i = i - 1;
        }
    }

    appendChar(c: string): StringBuilder {
        // this._text = StringBuilder_appendChar(this._text, c);
        this._text += c;
        return this;
    }

    appendSlice(text: string, start: int32, end: int32): StringBuilder {
        // this._text = StringBuilder_append(this._text, text.slice(start, end));
        this._text += text.slice(start, end);
        return this;
    }

    breakChunk(): number {
        this.chunks.push(this._text);
        this._text = "";
        return this.chunks.length - 1;
    }

    appendLine(text: string, indent: number = 0): StringBuilder {
        this.indent += indent;
        this.emitIndent();
        this._text += text + "\n";
        return this;
    }

    appendRaw(text: string): StringBuilder {
        this._text += text + "\n";
        return this;
    }

    append(text: string, indent: number = 0): StringBuilder {
        this.indent += indent;
        let lines: string[] = text.split("\n");
        lines.forEach((line, i) => {
            if (i > 0) {
                this._text += "\n";
                this.emitIndent();
            }
            this._text += line;
        });

        return this;
    }

    removeLastChar() {
        this._text = this._text.substring(0, this._text.length - 1);
    }

    removeLastLinebreak() {
        this._text = this._text.substring(0, this._text.lastIndexOf("\n"));
    }

    // This also "frees" this object (puts it back in the pool)
    finish(): string {
        this.next = stringBuilderPool;
        stringBuilderPool = this;
        if (this.chunks.length > 0) {
            let code = "";
            this.chunks.forEach((chunk: string) => {
                code += chunk;
            });
            return code + this._text;
        } else {
            return this._text;
        }
    }

}