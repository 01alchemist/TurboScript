type byte = number;
type ubyte = number;
type short = number;
type ushort = number;
type int8 = number;
type int16 = number;
type int32 = number;
type int64 = number;
type uint8 = number;
type uint16 = number;
type uint32 = number;
type uint64 = number;
type float32 = number;
type float64 = number;

interface String {
    startsWith(str: string): boolean;
    endsWith(str: string): boolean;
}

interface Math {
    imul(a: number, b: number): number
    log2(a: number): number
}
declare class ByteArray {
}

declare var assert:Function;
declare var TURBO_PATH:string;

declare namespace stdlib {
    var assert;

    function Profiler_begin(name: string);

    function Profiler_end(name: string);

    function StringBuilder_append(a, b);

    function StringBuilder_appendChar(a, b);

    function Uint8Array_new(x);

    function Terminal_setColor(color: any): void;

    function Terminal_write(text: string): void;

    function IO_readTextFile(path: string): string;

    function IO_writeTextFile(path: string, contents: string): boolean;

    function IO_writeBinaryFile(path: string, contents: ByteArray): boolean;
}