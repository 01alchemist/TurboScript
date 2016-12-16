// export declare function assert(truth: boolean): void;
// export declare function Profiler_begin(): void;
// export declare function Profiler_end(text: string): void;

// export var assert = assert;
// export var Profiler_begin = Profiler_begin;
// export var Profiler_end = Profiler_end;

export function isPositivePowerOf2(value: int32): boolean {
    return value > 0 && (value & (value - 1)) == 0;
}

export function alignToNextMultipleOf(offset: int32, alignment: int32): int32 {
    assert(isPositivePowerOf2(alignment));
    return (offset + alignment - 1) & -alignment;
}
