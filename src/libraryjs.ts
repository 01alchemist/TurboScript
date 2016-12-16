export function library(): string {
    return `declare class boolean {
    toString(): string;
}

declare class sbyte {
    toString(): string;
}

declare class byte {
    toString(): string;
}

declare class short {
    toString(): string;
}

declare class ushort {
    toString(): string;
}

declare class int32 {
    toString(): string;
}

declare class uint32 {
    toString(): string;
}

declare class int64 {
    toString(): string;
}

declare class uint64 {
    toString(): string;
}

declare class float32 {
    toString(): string;
}

declare class float64 {
    toString(): string;
}

declare class string {
    charAt(index: int32): string;
    charCodeAt(index: int32): ushort;
    get length(): int32;
    indexOf(text: string): int32;
    lastIndexOf(text: string): int32;
    operator == (other: string): boolean;
    operator [] (index: int32): ushort { return this.charCodeAt(index); }
    slice(start: int32, end: int32): string;

    startsWith(text: string): boolean { return this.slice(0, text.length) == text; }
    endsWith(text: string): boolean { return this.slice(-text.length, this.length) == text; }
}`;
}
