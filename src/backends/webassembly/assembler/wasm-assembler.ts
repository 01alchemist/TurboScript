import {WasmRuntimeFunction, WasmStackTracer} from "../stack-machine/wasm-stack-tracer";
import {WasmFunction} from "../core/wasm-function";
import {toHex} from "../../../utils/utils";
import {ByteArray} from "../../../utils/bytearray";
import {WasmOpcode} from "../opcode";
import {SectionBuffer} from "../buffer/section-buffer";
import {log} from "../utils/logger";
import {WasmSection} from "../core/wasm-section";
import {WasmImport} from "../core/wasm-import";
import {WasmRuntimeLocal} from "../stack-machine/wasm-runtime-local";
import {WasmType} from "../core/wasm-type";
import {WasmLocalEntry} from "../core/wasm-local";
import {Terminal} from "../../../utils/terminal";
/**
 * Created by n.vinayakan on 02.06.17.
 */
export class WasmAssembler {

    binaryOutput: ByteArray;
    textOutput: string;
    stackTracer: WasmStackTracer;
    sectionList: SectionBuffer[] = [];
    importList: WasmImport[] = [];
    functionList: WasmFunction[] = [];
    currentSection: SectionBuffer = null;
    currentFunction: WasmFunction = null;

    constructor() {
        this.stackTracer = new WasmStackTracer();
    }

    sealFunctions() {
        let runtimeFunctions = [];
        this.importList.forEach(_import => {
            let fn = new WasmRuntimeFunction();
            fn.module = _import.module;
            fn.name = _import.name;
            fn.signature = _import.signature;
            fn.isImport = true;
            runtimeFunctions.push(fn);
        });
        this.functionList.forEach((_wasmFunc: WasmFunction) => {
            let fn = new WasmRuntimeFunction();
            fn.name = _wasmFunc.symbol.name;
            fn.signature = _wasmFunc.signature;
            fn.isImport = false;
            fn.locals = [];
            _wasmFunc.localEntries.forEach((local:WasmLocalEntry) => {
                fn.locals.push(new WasmRuntimeLocal(local.type));
            });
            runtimeFunctions.push(fn);
        });
        this.stackTracer.functions = runtimeFunctions;
    }

    startSection(array: ByteArray, id: int32, name: string): SectionBuffer {
        let section: SectionBuffer = new SectionBuffer(id, name);
        section.offset = array.length;
        log(array, 0, null, ` - section: ${WasmSection[id]} [0x${toHex(id, 2)}]`);
        this.sectionList.push(section);
        return section;
    }

    endSection(array: ByteArray, section: SectionBuffer): void {
        section.publish(array);
    }

    dropStack(array: ByteArray, max: number = 1) {
        if (this.stackTracer.context.stack.length > 0) {
            Terminal.warn(`Dropping stack items, '${this.stackTracer.context.fn.name}' func stack contains ${this.stackTracer.context.stack.length} items`);
            let item = this.stackTracer.context.stack.pop(true);

            while (item !== undefined && max > 0) {
                Terminal.warn(WasmType[item.type]);
                array.append(WasmOpcode.DROP);
                item = this.stackTracer.context.stack.pop(true);
                max--;
            }
        }
    }

    appendOpcode(array: ByteArray, offset = 0, opcode: number, inline_value?) {
        if (global["debug"]) {
            logOpcode(array, offset, opcode, inline_value);
        }
        array.append(opcode);
        this.stackTracer.pushOpcode(opcode);
    }

    writeUnsignedLEB128(array: ByteArray, value: number): void {
        array.writeUnsignedLEB128(value);
        this.stackTracer.pushValue(value);
    }

    writeLEB128(array: ByteArray, value: number): void {
        array.writeLEB128(value);
        this.stackTracer.pushValue(value);
    }

    writeFloat(array: ByteArray, value: number): void {
        array.writeFloat(value);
        this.stackTracer.pushValue(value);
    }

    writeDouble(array: ByteArray, value: number): void {
        array.writeDouble(value);
        this.stackTracer.pushValue(value);
    }

    writeWasmString(array: ByteArray, value: string): void {
        array.writeWasmString(value);
    }

}

export function append(array: ByteArray, offset = 0, value = null, msg = null) {
    if (global["debug"]) {
        array.log += (value != null ? `${toHex(offset + array.position)}: ${toHex(value, 2)}                    ; ` : "") + (msg != null ? `${msg}\n` : "\n");
    }
    if (value) {
        array.append(value);
    }
}

export function logOpcode(array: ByteArray, offset = 0, opcode, inline_value?) {
    if (global["debug"]) {
        array.log += `${toHex(offset + array.position)}: ${toHex(opcode, 2)}                    ; ${WasmOpcode[opcode]} ${inline_value ? inline_value : ""}\n`;
    }
}
