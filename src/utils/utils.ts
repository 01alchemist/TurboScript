import {assert} from "./assert";
/**
 * Created by Nidin Vinayakan on 17/01/17.
 */
export function toHex(value: number, size: number = 7): string {
    let hex: string = value.toString(16);
    let zero: string[] = [];
    for (let i = 0; i < size; i++) {
        zero.push("0");
    }
    let str = hex.split("");
    str.forEach((s) => {
        zero.shift();
        zero.push(s);
    });
    return zero.join("");
}

export function isPositivePowerOf2(value: int32): boolean {
    return value > 0 && (value & (value - 1)) == 0;
}

export function alignToNextMultipleOf(offset: int32, alignment: int32): int32 {
    assert(isPositivePowerOf2(alignment));
    return (offset + alignment - 1) & -alignment;
}
