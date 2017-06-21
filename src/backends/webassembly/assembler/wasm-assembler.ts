import {WasmRuntimeFunction, WasmStackTracer} from "../wasm-machine/wasm-stack-tracer";
import {WasmFunction} from "../core/wasm-function";
import {toHex} from "../../../utils/utils";
import {ByteArray} from "../../../utils/bytearray";
import {WasmOpcode} from "../opcode";
import {SectionBuffer} from "../buffer/section-buffer";
import {log} from "../utils/logger";
import {WasmSection} from "../core/wasm-section";
import {WasmImport} from "../core/wasm-import";
import {WasmRuntimeProperty} from "../wasm-machine/wasm-runtime-local";
import {WasmType} from "../core/wasm-type";
import {WasmLocal} from "../core/wasm-local";
import {Terminal} from "../../../utils/terminal";
import {getWasmFunctionName} from "../utils/index";
import {WasmModule} from "../wasm/wasm-module";
import {createSection} from "../wasm/wasm-parser";
import {WasmSectionBinary} from "../wasm/wasm-binary-section";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmAssembler {

    module: WasmModule;
    binaryOutput: ByteArray;
    textOutput: string;
    stackTracer: WasmStackTracer;
    sectionList: SectionBuffer[] = [];
    importList: WasmImport[] = [];
    functionList: WasmFunction[] = [];
    currentSection: WasmSectionBinary = null;
    currentFunction: WasmFunction = null;

    constructor() {
        this.module = new WasmModule();
        this.stackTracer = new WasmStackTracer();
        this.textOutput = ";; Experimental wast emitter\n(namespace\n";
    }

    sealFunctions() {
        let runtimeFunctions = [];
        this.importList.forEach(_import => {
            let fn = new WasmRuntimeFunction();
            fn.module = _import.namespace;
            fn.name = _import.name;
            fn.signature = _import.signature;
            fn.isImport = true;
            runtimeFunctions.push(fn);
        });
        this.functionList.forEach((_wasmFunc: WasmFunction) => {
            let fn = new WasmRuntimeFunction();
            fn.name = getWasmFunctionName(_wasmFunc.symbol);
            fn.signature = _wasmFunc.signature;
            fn.isImport = false;
            fn.locals = [];
            _wasmFunc.locals.forEach((local: WasmLocal) => {
                fn.locals.push(new WasmRuntimeProperty(local.type, local.name));
            });
            runtimeFunctions.push(fn);
        });
        this.stackTracer.functions = runtimeFunctions;
    }

    startSection(id: int32): WasmSectionBinary {
        let section: WasmSectionBinary = this.module.binary.getSection(id);
        log(section.payload, 0, null, ` - section: ${WasmSection[id]} [0x${toHex(id, 2)}]`);
        this.currentSection = section;
        return section;
    }

    endSection(section: WasmSectionBinary): void {
        this.currentSection = null;
    }

    dropStack(max: number = 1) {
        if (this.stackTracer.context.stack.length > 0) {
            Terminal.warn(`Dropping stack items, '${this.stackTracer.context.fn.name}' func stack contains ${this.stackTracer.context.stack.length} items`);
            let item = this.stackTracer.context.stack.pop(true);

            while (item !== undefined && max > 0) {
                Terminal.warn(WasmType[item.type]);
                this.currentSection.payload.append(WasmOpcode.DROP);
                this.currentSection.code.append("drop\n");
                item = this.stackTracer.context.stack.pop(true);
                max--;
            }
        }
    }

    appendOpcode(offset = 0, opcode: number, inline_value?, skip: boolean = false) {
        logOpcode(this.currentSection.payload, offset, opcode, inline_value);
        this.currentSection.payload.append(opcode);
        let opcodeWithoutOperand = this.stackTracer.pushOpcode(opcode);
        if (opcodeWithoutOperand !== null && !skip) {
            let isEnd = opcode === WasmOpcode.END;
            let indent = this.isBlock(opcode) ? 1 : (isEnd ? -1 : 0);
            if (isEnd) {
                this.currentSection.code.clearIndent(1);
            }
            this.currentSection.code.append(opcodeWithoutOperand + "\n", indent);
        }
    }

    private isBlock(opcode: number): boolean {
        return opcode === WasmOpcode.BLOCK ||
            opcode === WasmOpcode.LOOP ||
            opcode === WasmOpcode.IF ||
            opcode === WasmOpcode.IF_ELSE;
    }

    writeUnsignedLEB128(value: number): void {
        this.currentSection.payload.writeUnsignedLEB128(value);
        let opcodeAndOperand = this.stackTracer.pushValue(value);
        if (opcodeAndOperand !== null) {
            this.currentSection.code.append(opcodeAndOperand + "\n");
        }
    }

    writeLEB128(value: number): void {
        this.currentSection.payload.writeLEB128(value);
        let opcodeAndOperand = this.stackTracer.pushValue(value);
        if (opcodeAndOperand !== null) {
            this.currentSection.code.append(opcodeAndOperand + "\n");
        }
    }

    writeFloat(value: number): void {
        this.currentSection.payload.writeFloat(value);
        let opcodeAndOperand = this.stackTracer.pushValue(value);
        if (opcodeAndOperand !== null) {
            this.currentSection.code.append(opcodeAndOperand + "\n");
        }
    }

    writeDouble(value: number): void {
        this.currentSection.payload.writeDouble(value);
        let opcodeAndOperand = this.stackTracer.pushValue(value);
        if (opcodeAndOperand !== null) {
            this.currentSection.code.append(opcodeAndOperand + "\n");
        }
    }

    writeWasmString(value: string): void {
        this.currentSection.payload.writeWasmString(value);
    }

    finish() {
        this.textOutput += "  ";
        this.sectionList.forEach((section) => {
            this.textOutput += section.code.finish();
        });
        this.textOutput += ")\n";
    }
}

export function append(offset = 0, value = null, msg = null) {
    this.currentSection.payload.log += (value != null ? `${toHex(offset + this.currentSection.payload.position)}: ${toHex(value, 2)}                    ; ` : "") + (msg != null ? `${msg}\n` : "\n");
    if (value) {
        this.currentSection.payload.append(value);
    }
}

export function logOpcode(offset = 0, opcode, inline_value?) {
    this.currentSection.payload.log += `${toHex(offset + this.currentSection.payload.position)}: ${toHex(opcode, 2)}                    ; ${WasmOpcode[opcode]} ${inline_value ? inline_value : ""}\n`;
}
