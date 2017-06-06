/**
 * Created by Nidin Vinayakan on 17/01/17.
 */
export function toHex(value: number, size: number = 7): string {
    if(value == undefined || value == null){
        return "";
    }
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