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

interface String{
    startsWith(str:string):boolean;
    endsWith(str:string):boolean;
}

interface Math{
    imul(a:number, b:number):number
    log2(a:number):number
}

declare var assert;
declare function Profiler_begin(name:string);
declare function Profiler_end(name:string);
declare function StringBuilder_append(a, b);
declare function StringBuilder_appendChar(a, b);
declare function Uint8Array_new(x);