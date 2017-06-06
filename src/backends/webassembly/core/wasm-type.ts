/**
 * Created by n.vinayakan on 02.06.17.
 */
export enum WasmType {
    VOID = 0,
    I32 = 0x7f,
    I64 = 0x7e,
    F32 = 0x7d,
    F64 = 0x7c,
    anyfunc = 0x70,
    func = 0x60,
    block_type = 0x40, //pseudo type for representing an empty block_type
}

export class WasmWrappedType {
    id: WasmType;
    next: WasmWrappedType;
}
