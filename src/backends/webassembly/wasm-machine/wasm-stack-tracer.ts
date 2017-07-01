import {WasmType} from "../core/wasm-type";
import {WasmOpcode} from "../opcode";
import {WasmRuntimeProperty} from "./wasm-runtime-local";
import {ByteArray} from "../../../utils/bytearray";
import {WasmSignature} from "../core/wasm-signature";
import {Terminal} from "../../../utils/terminal";
import {WasmGlobal} from "../core/wasm-global";
/**
 * Created by n.vinayakan on 02.06.17.
 */

export class WasmStackItem {
    constructor(public type: WasmType, public value: number) { }
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
                let error = `Stack is empty`;
                Terminal.warn(error);
                // throw error;
            }
        }
        return this.list.pop();
    }

    clear() {
        this.list = [];
    }
}

export class WasmRuntimeFunction {
    module: string;
    name: string;
    isImport: boolean;
    signature: WasmSignature;
    locals: WasmRuntimeProperty[];

    constructor() {

    }

    get returnType(): WasmType {
        return this.signature.returnType;
    }

    execute(...param): WasmStackItem {
        throw "Wasm runtime function execution not implemented!";
    }
}

export class WasmStackContext {
    stack: WasmStack;
    opcodes: number[];
    lastOpcode: number;

    constructor(public fn: WasmRuntimeFunction) {
        if (fn === undefined) {
            Terminal.error("Undefined runtime function")
            debugger;
        }
        this.stack = new WasmStack();
        this.opcodes = [];
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

    setGlobals(globals: WasmGlobal[]) {
        this.globals = [];
        globals.forEach(global => {
            this.globals.push(new WasmRuntimeProperty(global.type, global.name));
        });
    }

    startFunction(index: int32) {
        this.context = new WasmStackContext(this.functions[index]);
    }

    endFunction(skip: boolean = false) {
        if (!skip && this.context.stack.length > 0) {
            if (this.context.fn.returnType === WasmType.VOID) {
                let error = `Function '${this.context.fn.name}' does not return anything but stack is not empty. Stack contains ${this.context.stack.length} items`
                Terminal.error(error);
                // throw error;
            }
        }
        this.context = null;
    }

    callFunction(index: int32) {
        let fn = this.functions[index];
        if (fn === undefined) {
            let error = "Function not defined at index " + index;
            Terminal.error(error);
            throw error;
        }
        let returnType = fn.returnType;
        for (let i: int32 = 0; i < fn.signature.argumentTypes.length; i++) {
            this.context.stack.pop();
        }
        if (returnType !== WasmType.VOID) {
            this.context.stack.push(new WasmStackItem(returnType, undefined));
        }
    }

    pushOpcode(opcode: number): string {
        if (this.context !== null) {
            this.context.opcodes.push(opcode);
            this.context.lastOpcode = opcode;
            return this.updateStack(opcode);
        }
        return null;
    }

    pushValue(value: number): string {
        if (this.context !== null) {
            return this.updateStack(this.context.lastOpcode, value);
        }
        return null;
    }

    private updateStack(opcode: number, value?: number): string {
        let type: WasmType = null;
        if (opcode !== undefined && opcode !== null) {
            type = getOprandType(opcode);
        }

        switch (opcode) {

            case WasmOpcode.CALL:
                if (value !== undefined) {
                    this.callFunction(value);
                    let fn = this.functions[value];
                    return `call ${fn.name ? "$" + fn.name : value}`;
                }
                break;

            case WasmOpcode.END:
                this.context.stack.clear();
                return "end";

            case WasmOpcode.RETURN:
                if (this.context.stack.length == 0) {
                    Terminal.warn(`Empty stack on return in function ${this.context.fn.name}`);
                }
                return "return";

            case WasmOpcode.I32_CONST:
            case WasmOpcode.I64_CONST:
            case WasmOpcode.F32_CONST:
            case WasmOpcode.F64_CONST:
                if (value !== undefined) {
                    this.context.stack.push(new WasmStackItem(type, value));
                    return `${WasmOpcode[opcode]} ${value}`;
                }
                break;

            case WasmOpcode.SET_LOCAL:
                if (value !== undefined) {
                    if (this.context.fn.locals.length <= value) {
                        let errorMsg = `Local index ${value} out of range ${this.context.fn.locals.length} in function ${this.context.fn.name}`;
                        Terminal.error(errorMsg);
                        throw errorMsg;
                    } else {
                        let a = this.context.stack.pop();
                        let local = this.context.fn.locals[value];
                        if (a !== undefined) {
                            this.context.fn.locals[value].value = a.value;
                        }
                        return `${WasmOpcode[opcode]} $${local.name}`;
                    }
                }
                break;

            case WasmOpcode.GET_LOCAL:
                if (value !== undefined) {
                    let a = this.context.fn.locals[value];
                    this.context.stack.push(new WasmStackItem(a.type, a.value));
                    return `${WasmOpcode[opcode]} $${a.name}`;
                }
            // break;

            case WasmOpcode.SET_GLOBAL:
                if (value !== undefined) {
                    if (this.globals.length <= value) {
                        let errorMsg = `Global index ${value} out of range ${this.globals.length}`;
                        Terminal.error(errorMsg);
                        throw errorMsg;
                    } else {
                        let a = this.context.stack.pop();
                        this.globals[value].value = a.value;
                        return `${WasmOpcode[opcode]} ${value}`;
                    }
                }
                break;

            case WasmOpcode.GET_GLOBAL:
                if (value !== undefined) {
                    let a = this.globals[value];
                    this.context.stack.push(new WasmStackItem(a.type, a.value));
                    return `${WasmOpcode[opcode]} ${value}`;
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
                return WasmOpcode[opcode];
            }

            //SUB
            case WasmOpcode.I32_SUB:
            case WasmOpcode.I64_SUB:
            case WasmOpcode.F32_SUB:
            case WasmOpcode.F64_SUB: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value - b.value));
                return WasmOpcode[opcode];
            }

            //MUL
            case WasmOpcode.I32_MUL:
            case WasmOpcode.I64_MUL:
            case WasmOpcode.F32_MUL:
            case WasmOpcode.F64_MUL: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value * b.value));
                return WasmOpcode[opcode];
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
                return WasmOpcode[opcode];
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
                return WasmOpcode[opcode];
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
                return WasmOpcode[opcode];
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
                return WasmOpcode[opcode];
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
                return WasmOpcode[opcode];
            }

            //EQ
            case WasmOpcode.I32_EQ:
            case WasmOpcode.I64_EQ:
            case WasmOpcode.F32_EQ:
            case WasmOpcode.F64_EQ: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value === b.value ? 1 : 0));
                return WasmOpcode[opcode];
            }

            //NE
            case WasmOpcode.I32_NE:
            case WasmOpcode.I64_NE:
            case WasmOpcode.F32_NE:
            case WasmOpcode.F64_NE: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value !== b.value ? 1 : 0));
                return WasmOpcode[opcode];
            }

            //EQZ
            case WasmOpcode.I32_EQZ:
            case WasmOpcode.I64_EQZ: {
                let a = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value === 0 ? 1 : 0));
                return WasmOpcode[opcode];
            }

            //AND
            case WasmOpcode.I32_AND:
            case WasmOpcode.I64_AND: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value & b.value));
                return WasmOpcode[opcode];
            }

            //OR
            case WasmOpcode.I32_OR:
            case WasmOpcode.I64_OR: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value | b.value));
                return WasmOpcode[opcode];
            }

            //XOR
            case WasmOpcode.I32_XOR:
            case WasmOpcode.I64_XOR: {
                let a = this.context.stack.pop();
                let b = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(type, a.value ^ b.value));
                return WasmOpcode[opcode];
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
                return WasmOpcode[opcode];
            }

            //CLZ
            case WasmOpcode.I32_ROTL:
            case WasmOpcode.I64_ROTL: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, rotl(a.value)));
                return WasmOpcode[opcode];
            }

            //SHR
            case WasmOpcode.I32_SHR_S:
            case WasmOpcode.I32_SHR_U:
            case WasmOpcode.I64_SHR_S:
            case WasmOpcode.I64_SHR_U: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, shr(a.value)));
                return WasmOpcode[opcode];
            }

            //SHR
            case WasmOpcode.I32_SHL:
            case WasmOpcode.I64_SHL: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, shl(a.value)));
                return WasmOpcode[opcode];
            }

            //POPCNT
            case WasmOpcode.I32_POPCNT:
            case WasmOpcode.I64_POPCNT: {
                // let a = this.context.stack.pop();
                // this.context.stack.push(new WasmStackItem(type, popcnt(a.value)));
                return WasmOpcode[opcode];
            }

            case WasmOpcode.F32_SQRT:
            case WasmOpcode.F64_SQRT: {
                let a = this.context.stack.pop();
                this.context.stack.push(new WasmStackItem(a.type, Math.sqrt(a.value)));
                return WasmOpcode[opcode];
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
                return WasmOpcode[opcode];
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
                return WasmOpcode[opcode];
            }

            case WasmOpcode.IF: {
                let a = this.context.stack.pop();
                this.context.lastOpcode = null;
                return WasmOpcode[opcode];
            }

            case WasmOpcode.BR_IF:
                if (value !== undefined) {
                    let a = this.context.stack.pop();
                    this.context.lastOpcode = null;
                    return `${WasmOpcode[opcode]} ${value}`;
                }
                break;

            case WasmOpcode.IF_ELSE:
            case WasmOpcode.BLOCK:
            case WasmOpcode.LOOP:
                //ignore
                return WasmOpcode[opcode];

            case WasmOpcode.BR:
                if (value !== undefined) {
                    return `${WasmOpcode[opcode]} ${value}`;
                }
                break;

            case WasmOpcode.I32_WRAP_I64:
            case WasmOpcode.I32_TRUNC_S_F32:
            case WasmOpcode.I32_TRUNC_U_F32:
            case WasmOpcode.I32_TRUNC_S_F64:
            case WasmOpcode.I32_TRUNC_U_F64:
            case WasmOpcode.I32_REINTERPRET_F32:
            case WasmOpcode.I64_TRUNC_S_F32:
            case WasmOpcode.I64_TRUNC_U_F32:
            case WasmOpcode.I64_TRUNC_S_F64:
            case WasmOpcode.I64_TRUNC_U_F64:
            case WasmOpcode.I64_EXTEND_S_I32:
            case WasmOpcode.I64_EXTEND_U_I32:
            case WasmOpcode.F32_DEMOTE_F64:
            case WasmOpcode.F32_TRUNC:
            case WasmOpcode.F32_REINTERPRET_I32:
            case WasmOpcode.F32_CONVERT_S_I32:
            case WasmOpcode.F32_CONVERT_U_I32:
            case WasmOpcode.F32_CONVERT_S_I64:
            case WasmOpcode.F32_CONVERT_U_I64:
            case WasmOpcode.F64_PROMOTE_F32:
            case WasmOpcode.F64_TRUNC:
            case WasmOpcode.F64_REINTERPRET_I64:
            case WasmOpcode.F64_CONVERT_S_I32:
            case WasmOpcode.F64_CONVERT_U_I32:
            case WasmOpcode.F64_CONVERT_S_I64:
            case WasmOpcode.F64_CONVERT_U_I64:
                //ignore  > pop > push
                return WasmOpcode[opcode];

            case null:
            case undefined:
                //ignore
                break;

            default:
                Terminal.warn(`Unhandled Opcode ${opcode} => ${WasmOpcode[opcode]}`);
                break;
        }
        return null;
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
            Terminal.warn(`Unhandled Opcode ${opcode} => ${WasmOpcode[opcode]}`);
            break;
    }
    return null;
}
