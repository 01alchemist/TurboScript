type byte = number;
type ubyte = number;
type shirt = number;
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

declare var TURBO_PATH:string;