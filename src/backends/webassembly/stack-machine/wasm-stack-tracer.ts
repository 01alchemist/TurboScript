import {WasmType} from "../core/wasm-type";
import {WasmOpcode} from "../opcode";
import {WasmFunction} from "../core/wasm-function";
import {WasmRuntimeLocal} from "./wasm-runtime-local";
import {ByteArray} from "../../../utils/bytearray";
import {WasmSignature} from "../core/wasm-signature";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmStackItem {
    constructor(public type: WasmType, public value: number) {}
}

export class WasmStack {
    list: WasmStackItem[];

    constructor() {
        this.list = [];
    }

    get length(): int32 {
        return this.list.length;
    }

    push(item: WasmStackItem): void {
        this.list.push(item);
    }

    pop(silent: boolean = false): WasmStackItem {
        if (this.list.length === 0) {
            if (!silent) {
                throw "Stack is empty";
            }
        }
        return this.list.pop();
    }
}

export class WasmRuntimeFunction {
    module: string;
    name: string;
    isImport: boolean;
    signature: WasmSignature;

    constructor() {

    }

    get returnType(): WasmType {
        return this.signature.returnType.id;
    }

    execute(...param): WasmStackItem {
        throw "Wasm runtime function execution not implemented!";
    }
}

export class WasmStackContext {
    stack: WasmStack;
    locals: WasmRuntimeLocal[];
    opcodes: number[];
    lastOpcode: number;

    constructor(public fn: WasmFunction) {
        this.stack = new WasmStack();
        this.opcodes = [];
        this.locals = [];
        fn.localEntries.forEach(localType => {
            this.locals.push(new WasmRuntimeLocal(localType));
        })
    }
}

/**
 * Wasm stack tracer, this is not a stack machine. this will not execute functions
 * instead trace state of stack while emitting function body.
 */
export class WasmStackTracer {

    memory: ByteArray;
    globals: WasmStackItem[];
    context: WasmStackContext = null;
    functions: WasmRuntimeFunction[];

    constructor() {
        this.memory = new ByteArray();
    }

    setGlobals(globalEntries: WasmType[]) {
        this.globals = [];
        globalEntries.forEach(globalType => {
            this.globals.push(new WasmRuntimeLocal(globalType));
        });
    }

    startFunction(fn: WasmFunction) {
        this.context = new WasmStackContext(fn);
    }

    endFunction() {
        if (this.context.stack.length > 0) {
            if (this.context.fn.returnType === WasmType.VOID) {
                console.error(`Function '${this.context.fn.symbol.name}' does not return anything but stack is not empty. Stack contains ${this.context.stack.length} items`);
                throw `Function '${this.context.fn.symbol.name}' does not return anything but stack is not empty. Stack contains ${this.context.stack.length} items`;
            }
        }
        this.context = null;
    }

    callFunction(index: int32) {
        let fn = this.functions[index];
        if (fn === undefined) {
            throw "Function not defined at index " + index;
        }
        let returnType = fn.returnType;
        for (let i: int32 = 0; i < fn.signature.argumentCount; i++) {
            this.context.stack.pop();
        }
        if (returnType !== WasmType.VOID) {
            this.context.stack.push(new WasmStackItem(returnType, undefined));
        }
    }

    pushOpcode(opcode: number): void {
        if (this.context !== null) {
            this.context.opcodes.push(opcode);
            this.context.lastOpcode = opcode;
            this.updateStack(opcode);
        }
    }

    pushValue(value: number): void {
        if (this.context !== null) {
            this.updateStack(this.context.lastOpcode, value);
        }
    }

    private updateStack(opcode: number, value?: number) {
        let type: WasmType = null;
        if (opcode !== null) {
            type = getOprandType(opcode);
        }

        switch (opcode) {

            case WasmOpcode.CALL:
                if (value !== undefined) {
                    this.callFunction(value);
                }
                break;

            case WasmOpcode.END:
                break;

            case WasmOpcode.RETURN:
                if (this.context.stack.length == 0) {
                    console.warn(`Empty stack on return in function ${this.context.fn.symbol.name}`);
                }
                break;

            case WasmOpcode.I32_CONST:
            case WasmOpcode.I64_CONST:
            case WasmOpcode.F32_CONST:
            case WasmOpcode.F64_CONST:
                if (value !== undefined) {
                    this.context.stack.push(new WasmStackItem(type, value));
                }
                break;

            case WasmOpcode.SET_LOCAL:
                if (value !== undefined) {
                    if (this.context.locals.length <= value) {
                        let errorMsg = `Local index ${value} out of range ${this.context.locals.length} in function ${this.context.fn.symbol.name}`;
                        console.error(errorMsg);
                        throw errorMsg;
                    } else {
                        let a = this.context.stack.pop();
                        this.context.locals[value].value = a.value;
                    }
                }
                break;

            case WasmOpcode.GET_LOCAL:
                if (value !== undefined) {
                    let a = this.context.locals[value];
                    this.context.stack.push(new WasmStackItem(a.type, a.value));
                }
                break;

            case WasmOpcode.SET_GLOBAL:
                if (value !== undefined) {
                    if (this.globals.length <= value) {
                        let errorMsg = `Global index ${value} out of range ${this.globals.length}`;
                        console.error(errorMsg);
                        throw errorMsg;
                    } else {
                        let a = this.context.stack.pop();
                        this.globals[value].value = a.value;
                    }
                }
                break;

            case WasmOpcode.GET_GLOBAL:
                if (value !== undefined) {
                    let a = this.globals[value];
                    this.context.stack.push(new WasmStackItem(a.type, a.value));
                }
                break;

            // ADD
            case WasmOpcode.I32_ADD:
            case WasmOpcode.I64_ADD:
            case WasmOpcode.F32_ADD:
            case WasmOpcode.F64_ADD: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value + b.value));
                break;
            }

            //SUB
            case WasmOpcode.I32_SUB:
            case WasmOpcode.I64_SUB:
            case WasmOpcode.F32_SUB:
            case WasmOpcode.F64_SUB: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value - b.value));
                break;
            }

            //MUL
            case WasmOpcode.I32_MUL:
            case WasmOpcode.I64_MUL:
            case WasmOpcode.F32_MUL:
            case WasmOpcode.F64_MUL: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value * b.value));
                break;
            }

            //DIV
            case WasmOpcode.I32_DIV_S:
            case WasmOpcode.I32_DIV_U:
            case WasmOpcode.I64_DIV_S:
            case WasmOpcode.I64_DIV_U:
            case WasmOpcode.F32_DIV:
            case WasmOpcode.F64_DIV: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value / b.value));
                break;
            }

            //REM
            case WasmOpcode.I32_REM_S:
            case WasmOpcode.I32_REM_U:
            case WasmOpcode.I64_REM_S:
            case WasmOpcode.I64_REM_U: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value % b.value));
                break;
            }

            //GT
            case WasmOpcode.I32_GT_S:
            case WasmOpcode.I32_GT_U:
            case WasmOpcode.I64_GT_S:
            case WasmOpcode.I64_GT_U:
            case WasmOpcode.F32_GT:
            case WasmOpcode.F64_GT: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value > b.value ? 1 : 0));
                break;
            }

            //GE
            case WasmOpcode.I32_GE_S:
            case WasmOpcode.I32_GE_U:
            case WasmOpcode.I64_GE_S:
            case WasmOpcode.I64_GE_U:
            case WasmOpcode.F32_GE:
            case WasmOpcode.F64_GE: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value >= b.value ? 1 : 0));
                break;
            }

            //LT
            case WasmOpcode.I32_LT_S:
            case WasmOpcode.I32_LT_U:
            case WasmOpcode.I64_LT_S:
            case WasmOpcode.I64_LT_U:
            case WasmOpcode.F32_LT:
            case WasmOpcode.F64_LT: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value < b.value ? 1 : 0));
                break;
            }

            //LE
            case WasmOpcode.I32_LE_S:
            case WasmOpcode.I32_LE_U:
            case WasmOpcode.I64_LE_S:
            case WasmOpcode.I64_LE_U:
            case WasmOpcode.F32_LE:
            case WasmOpcode.F64_LE: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value <= b.value ? 1 : 0));
                break;
            }

            //EQ
            case WasmOpcode.I32_EQ:
            case WasmOpcode.I64_EQ:
            case WasmOpcode.F32_EQ:
            case WasmOpcode.F64_EQ: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value === b.value ? 1 : 0));
                break;
            }

            //NE
            case WasmOpcode.I32_NE:
            case WasmOpcode.I64_NE:
            case WasmOpcode.F32_NE:
            case WasmOpcode.F64_NE: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value !== b.value ? 1 : 0));
                break;
            }

            //EQZ
            case WasmOpcode.I32_EQZ:
            case WasmOpcode.I64_EQZ: {
                let a = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value === 0 ? 1 : 0));
                break;
            }

            //AND
            case WasmOpcode.I32_AND:
            case WasmOpcode.I64_AND: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value & b.value));
                break;
            }

            //OR
            case WasmOpcode.I32_OR:
            case WasmOpcode.I64_OR: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value | b.value));
                break;
            }

            //XOR
            case WasmOpcode.I32_XOR:
            case WasmOpcode.I64_XOR: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value ^ b.value));
                break;
            }

            //CTZ
            case WasmOpcode.I32_CTZ:
            case WasmOpcode.I64_CTZ: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, ctz(a.value)));
                break;
            }

            //CLZ
            case WasmOpcode.I32_CLZ:
            case WasmOpcode.I64_CLZ: {
                let a = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, Math.clz32(a.value)));
                break;
            }

            //CLZ
            case WasmOpcode.I32_ROTL:
            case WasmOpcode.I64_ROTL: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, rotl(a.value)));
                break;
            }

            //SHR
            case WasmOpcode.I32_SHR_S:
            case WasmOpcode.I32_SHR_U:
            case WasmOpcode.I64_SHR_S:
            case WasmOpcode.I64_SHR_U: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, shr(a.value)));
                break;
            }

            //SHR
            case WasmOpcode.I32_SHL:
            case WasmOpcode.I64_SHL: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, shl(a.value)));
                break;
            }

            //POPCNT
            case WasmOpcode.I32_POPCNT:
            case WasmOpcode.I64_POPCNT: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, popcnt(a.value)));
                break;
            }

            //LOAD
            case WasmOpcode.I32_LOAD:
            case WasmOpcode.I64_LOAD:
            case WasmOpcode.I32_LOAD8_U:
            case WasmOpcode.I32_LOAD8_S:
            case WasmOpcode.I64_LOAD8_U:
            case WasmOpcode.I64_LOAD8_S:
            case WasmOpcode.I32_LOAD16_U:
            case WasmOpcode.I32_LOAD16_S:
            case WasmOpcode.I64_LOAD16_U:
            case WasmOpcode.I64_LOAD16_S:
            case WasmOpcode.F32_LOAD:
            case WasmOpcode.F64_LOAD: {
                this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, 0));
                this.context.lastOpcode = null;
                break;
            }

            //STORE
            case WasmOpcode.I32_STORE:
            case WasmOpcode.I64_STORE:
            case WasmOpcode.I32_STORE8:
            case WasmOpcode.I64_STORE8:
            case WasmOpcode.I32_STORE16:
            case WasmOpcode.I64_STORE16:
            case WasmOpcode.F32_STORE:
            case WasmOpcode.F64_STORE: {
                let a = this.context.stack.pop(); // address
                let b = this.context.stack.pop(); // offset
                this.context.lastOpcode = null;
                break;
            }

            case WasmOpcode.IF:
            case WasmOpcode.BR_IF:
                let a = this.context.stack.pop();
                this.context.lastOpcode = null;
                break;
        }
    }
}

function getOprandType(opcode: number): WasmType {
    switch (opcode) {
        // Int32
        case WasmOpcode.I32_CONST:
        case WasmOpcode.I32_ADD:
        case WasmOpcode.I32_MUL:
        case WasmOpcode.I32_SUB:
        case WasmOpcode.I32_DIV_S:
        case WasmOpcode.I32_DIV_U:
        case WasmOpcode.I32_REM_S:
        case WasmOpcode.I32_REM_U:
        case WasmOpcode.I32_GE_S:
        case WasmOpcode.I32_GE_U:
        case WasmOpcode.I32_LE_S:
        case WasmOpcode.I32_LE_U:
        case WasmOpcode.I32_GT_S:
        case WasmOpcode.I32_GT_U:
        case WasmOpcode.I32_LT_S:
        case WasmOpcode.I32_LT_U:
        case WasmOpcode.I32_EQ:
        case WasmOpcode.I32_NE:
        case WasmOpcode.I32_EQZ:
        case WasmOpcode.I32_AND:
        case WasmOpcode.I32_OR:
        case WasmOpcode.I32_XOR:
        case WasmOpcode.I32_CTZ:
        case WasmOpcode.I32_CLZ:
        case WasmOpcode.I32_ROTL:
        case WasmOpcode.I32_ROTR:
        case WasmOpcode.I32_SHL:
        case WasmOpcode.I32_SHR_S:
        case WasmOpcode.I32_SHR_U:
        case WasmOpcode.I32_POPCNT:
        case WasmOpcode.I32_LOAD:
        case WasmOpcode.I32_LOAD8_S:
        case WasmOpcode.I32_LOAD8_U:
        case WasmOpcode.I32_LOAD16_S:
        case WasmOpcode.I32_LOAD16_U:
        case WasmOpcode.I32_STORE16:
        case WasmOpcode.I32_STORE8:
        case WasmOpcode.I32_STORE:
        case WasmOpcode.I32_REINTERPRET_F32:
        case WasmOpcode.I32_TRUNC_S_F32:
        case WasmOpcode.I32_TRUNC_U_F32:
        case WasmOpcode.I32_TRUNC_S_F64:
        case WasmOpcode.I32_TRUNC_U_F64:
        case WasmOpcode.I32_WRAP_I64:
            return WasmType.I32;

        // Int64
        case WasmOpcode.I64_CONST:
        case WasmOpcode.I64_ADD:
        case WasmOpcode.I64_MUL:
        case WasmOpcode.I64_SUB:
        case WasmOpcode.I64_DIV_S:
        case WasmOpcode.I64_DIV_U:
        case WasmOpcode.I64_CLZ:
        case WasmOpcode.I64_ROTL:
        case WasmOpcode.I64_AND:
        case WasmOpcode.I64_CTZ:
        case WasmOpcode.I64_EQ:
        case WasmOpcode.I64_EQZ:
        case WasmOpcode.I64_GE_S:
        case WasmOpcode.I64_GE_U:
        case WasmOpcode.I64_LE_S:
        case WasmOpcode.I64_LE_U:
        case WasmOpcode.I64_GT_S:
        case WasmOpcode.I64_GT_U:
        case WasmOpcode.I64_LT_S:
        case WasmOpcode.I64_LT_U:
        case WasmOpcode.I64_LOAD:
        case WasmOpcode.I64_LOAD8_S:
        case WasmOpcode.I64_LOAD8_U:
        case WasmOpcode.I64_LOAD16_S:
        case WasmOpcode.I64_LOAD16_U:
        case WasmOpcode.I64_NE:
        case WasmOpcode.I64_XOR:
        case WasmOpcode.I64_STORE16:
        case WasmOpcode.I64_STORE8:
        case WasmOpcode.I64_STORE:
        case WasmOpcode.I64_SHR_S:
        case WasmOpcode.I64_SHR_U:
        case WasmOpcode.I64_SHL:
        case WasmOpcode.I64_ROTR:
        case WasmOpcode.I64_REM_S:
        case WasmOpcode.I64_REM_U:
        case WasmOpcode.I64_POPCNT:
        case WasmOpcode.I64_OR:
        case WasmOpcode.I64_REINTERPRET_F64:
        case WasmOpcode.I64_TRUNC_S_F32:
        case WasmOpcode.I64_TRUNC_U_F32:
        case WasmOpcode.I64_TRUNC_S_F64:
        case WasmOpcode.I64_TRUNC_U_F64:
        case WasmOpcode.I64_EXTEND_S_I32:
        case WasmOpcode.I64_EXTEND_U_I32:
            return WasmType.I64;

        // Float32
        case WasmOpcode.F32_CONST:
        case WasmOpcode.F32_ADD:
        case WasmOpcode.F32_SUB:
        case WasmOpcode.F32_MUL:
        case WasmOpcode.F32_DIV:
        case WasmOpcode.F32_SQRT:
        case WasmOpcode.F32_NEG:
        case WasmOpcode.F32_NE:
        case WasmOpcode.F32_ABS:
        case WasmOpcode.F32_CEIL:
        case WasmOpcode.F32_EQ:
        case WasmOpcode.F32_FLOOR:
        case WasmOpcode.F32_NEAREST:
        case WasmOpcode.F32_MIN:
        case WasmOpcode.F32_MAX:
        case WasmOpcode.F32_GE:
        case WasmOpcode.F32_GT:
        case WasmOpcode.F32_LT:
        case WasmOpcode.F32_LE:
        case WasmOpcode.F32_COPYSIGN:
        case WasmOpcode.F32_LOAD:
        case WasmOpcode.F32_STORE:
        case WasmOpcode.F32_TRUNC:
        case WasmOpcode.F32_DEMOTE_F64:
        case WasmOpcode.F32_CONVERT_S_I32:
        case WasmOpcode.F32_CONVERT_U_I32:
        case WasmOpcode.F32_CONVERT_S_I64:
        case WasmOpcode.F32_CONVERT_U_I64:
        case WasmOpcode.F32_REINTERPRET_I32:
            return WasmType.F32;

        // Float64
        case WasmOpcode.F64_CONST:
        case WasmOpcode.F64_ADD:
        case WasmOpcode.F64_SUB:
        case WasmOpcode.F64_MUL:
        case WasmOpcode.F64_DIV:
        case WasmOpcode.F64_SQRT:
        case WasmOpcode.F64_NEG:
        case WasmOpcode.F64_NE:
        case WasmOpcode.F64_ABS:
        case WasmOpcode.F64_CEIL:
        case WasmOpcode.F64_EQ:
        case WasmOpcode.F64_FLOOR:
        case WasmOpcode.F64_NEAREST:
        case WasmOpcode.F64_MIN:
        case WasmOpcode.F64_MAX:
        case WasmOpcode.F64_GE:
        case WasmOpcode.F64_GT:
        case WasmOpcode.F64_LT:
        case WasmOpcode.F64_LE:
        case WasmOpcode.F64_COPYSIGN:
        case WasmOpcode.F64_LOAD:
        case WasmOpcode.F64_STORE:
        case WasmOpcode.F64_TRUNC:
        case WasmOpcode.F64_PROMOTE_F32:
        case WasmOpcode.F64_CONVERT_S_I32:
        case WasmOpcode.F64_CONVERT_U_I32:
        case WasmOpcode.F64_CONVERT_S_I64:
        case WasmOpcode.F64_CONVERT_U_I64:
        case WasmOpcode.F64_REINTERPRET_I64:
            return WasmType.F64;

        // No types
        case WasmOpcode.CALL:
        case WasmOpcode.END:
        case WasmOpcode.RETURN:
        case WasmOpcode.GET_GLOBAL:
        case WasmOpcode.GET_LOCAL:
        case WasmOpcode.SET_LOCAL:
        case WasmOpcode.SET_GLOBAL:
        case WasmOpcode.BLOCK:
        case WasmOpcode.LOOP:
        case WasmOpcode.IF:
        case WasmOpcode.IF_ELSE:
        case WasmOpcode.BR:
        case WasmOpcode.BR_IF:
        case WasmOpcode.BR_TABLE:
        case WasmOpcode.NOP:
            return null;
        default:
            console.warn("Unhandled Opcode " + WasmOpcode[opcode]);
            break;
    }
}
