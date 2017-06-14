import {isFunction, Symbol, SymbolKind} from "../../compiler/core/symbol";
import {ByteArray, ByteArray_set32, ByteArray_setString} from "../../utils/bytearray";
import {CheckContext} from "../../compiler/analyzer/type-checker";
import {alignToNextMultipleOf, toHex} from "../../utils/utils";
import {isExpression, isUnary, isUnaryPostfix, Node, NodeKind} from "../../compiler/core/node";
import {Type} from "../../compiler/core/type";
import {Compiler} from "../../compiler/compiler";
import {WasmOpcode} from "./opcode";
import {getBuiltinOpcode, isBuiltin} from "./builtins-helper";
import {assert} from "../../utils/assert";
import {WasmType, WasmWrappedType} from "./core/wasm-type";
import {log, logData} from "./utils/logger";
import {wasmAreSignaturesEqual, WasmSignature} from "./core/wasm-signature";
import {Bitness} from "../bitness";
import {WasmSection} from "./core/wasm-section";
import {WasmExternalKind} from "./core/wasm-external-kind";
import {WasmGlobal} from "./core/wasm-global";
import {WasmFunction} from "./core/wasm-function";
import {WasmImport} from "./core/wasm-import";
import {WasmLocal, WasmLocalEntry} from "./core/wasm-local";
import {WasmSharedOffset} from "./core/wasm-shared-offset";
import {append, WasmAssembler} from "./assembler/wasm-assembler";
import {Terminal} from "../../utils/terminal";

const WASM_MAGIC = 0x6d736100; //'\0' | 'a' << 8 | 's' << 16 | 'm' << 24;
const WASM_VERSION = 0x1;
const WASM_SIZE_IN_PAGES = 1;
const WASM_SET_MAX_MEMORY = false;
const WASM_MAX_MEMORY = 1024 * 1024 * 1024;
const WASM_MEMORY_INITIALIZER_BASE = 8; // Leave space for "null"

class WasmModule {

    firstImport: WasmImport;
    lastImport: WasmImport;
    importCount: int32 = 0;
    globalCount: int32 = 0;
    firstGlobal: WasmGlobal;
    lastGlobal: WasmGlobal;
    globalEntries: WasmType[];

    firstFunction: WasmFunction;
    lastFunction: WasmFunction;
    functionCount: int32 = 0;

    signatures: WasmSignature[];
    firstSignature: WasmSignature;
    lastSignature: WasmSignature;
    signatureCount: int32 = 0;

    memoryInitializer: ByteArray;
    currentHeapPointer: int32;
    originalHeapPointer: int32;
    mallocFunctionIndex: int32;
    freeFunctionIndex: int32;
    startFunctionIndex: int32;
    context: CheckContext;
    startFunction: WasmFunction;
    currentFunction: WasmFunction;
    assembler: WasmAssembler;

    constructor(public bitness: Bitness) {
        this.assembler = new WasmAssembler();
    }

    growMemoryInitializer(): void {
        let array = this.memoryInitializer;
        let current = array.length;
        let length = this.context.nextGlobalVariableOffset;

        while (current < length) {
            array.append(0);
            current = current + 1;
        }
    }

    allocateImport(signatureIndex: int32, mod: string, name: string): WasmImport {
        let result = new WasmImport();
        result.signatureIndex = signatureIndex;
        result.signature = this.signatures[signatureIndex];
        result.module = mod;
        result.name = name;

        if (this.firstImport == null) this.firstImport = result;
        else this.lastImport.next = result;
        this.lastImport = result;
        this.assembler.importList.push(result);
        this.importCount = this.importCount + 1;
        return result;
    }

    allocateGlobal(symbol: Symbol, bitness: Bitness): WasmGlobal {
        let global = new WasmGlobal();
        global.type = symbolToValueType(symbol, bitness);
        global.symbol = symbol;
        symbol.offset = this.globalCount;

        if (this.firstGlobal == null) {
            this.firstGlobal = global;
            this.globalEntries = [];
        }
        else this.lastGlobal.next = global;
        this.lastGlobal = global;
        this.globalEntries.push(global.type);
        this.globalCount = this.globalCount + 1;
        return global;
    }

    allocateFunction(symbol: Symbol, signatureIndex: int32): WasmFunction {
        let fn = new WasmFunction();
        fn.symbol = symbol;
        fn.signatureIndex = signatureIndex;
        fn.signature = this.signatures[signatureIndex];

        if (this.firstFunction == null) this.firstFunction = fn;
        else this.lastFunction.next = fn;
        this.lastFunction = fn;
        this.assembler.functionList.push(fn);

        this.functionCount = this.functionCount + 1;
        return fn;
    }

    allocateSignature(argumentTypes: WasmWrappedType, returnType: WasmWrappedType, argumentCount: int32): int32 {
        assert(returnType != null);
        assert(returnType.next == null);

        let signature = new WasmSignature();
        signature.argumentCount = argumentCount;
        signature.argumentTypes = argumentTypes;
        signature.returnType = returnType;
        let check = this.firstSignature;
        let i = 0;

        while (check != null) {
            if (wasmAreSignaturesEqual(signature, check)) {
                return i;
            }

            check = check.next;
            i = i + 1;
        }

        if (this.firstSignature == null) {
            this.signatures = [];
            this.firstSignature = signature;
        }
        else this.lastSignature.next = signature;
        this.lastSignature = signature;
        this.signatures.push(signature);

        this.signatureCount = this.signatureCount + 1;
        return i;
    }

    emitModule(array: ByteArray): void {
        array.log = "";
        array.writeUnsignedInt(WASM_MAGIC);
        array.writeUnsignedInt(WASM_VERSION);
        array.log += '0000000: 0061 736d             ; WASM_BINARY_MAGIC\n';
        array.log += '0000004: 0100 0000             ; WASM_BINARY_VERSION\n';

        this.emitSignatures(array);
        this.emitImportTable(array);
        this.emitFunctionDeclarations(array);
        // this.emitTables(array);
        this.emitMemory(array);
        this.emitGlobalDeclarations(array);
        this.emitExportTable(array);
        this.emitStartFunctionDeclaration(array);
        this.emitElements(array);
        this.emitFunctionBodies(array);
        this.emitDataSegments(array);
        this.emitNames(array);
    }

    emitSignatures(array: ByteArray): void {

        if (!this.firstSignature) {
            return;
        }

        let section = this.assembler.startSection(array, WasmSection.Type, "signatures");
        this.assembler.writeUnsignedLEB128(section.data, this.signatureCount);

        let signature = this.firstSignature;
        let sigCount = 0;
        while (signature != null) {
            let count = 0;
            let type = signature.argumentTypes;

            while (type != null) {
                count = count + 1;
                type = type.next;
            }

            log(section.data, array.position, WasmType.func, "func sig " + sigCount++);
            this.assembler.writeUnsignedLEB128(section.data, WasmType.func); //form, the value for the func type constructor
            log(section.data, array.position, count, "num params");
            this.assembler.writeUnsignedLEB128(section.data, count); //param_count, the number of parameters to the function
            type = signature.argumentTypes;
            while (type != null) {
                log(section.data, array.position, type.id, WasmType[type.id]);
                this.assembler.writeUnsignedLEB128(section.data, type.id); //value_type, the parameter types of the function
                type = type.next;
            }
            let returnTypeId = signature.returnType.id;
            if (returnTypeId > 0) {
                log(section.data, array.position, "01", "num results");
                this.assembler.writeUnsignedLEB128(section.data, 1); //return_count, the number of results from the function
                log(section.data, array.position, signature.returnType.id, WasmType[signature.returnType.id]);
                this.assembler.writeUnsignedLEB128(section.data, signature.returnType.id);
            } else {
                this.assembler.writeUnsignedLEB128(section.data, 0);
            }

            signature = signature.next;
        }

        this.assembler.endSection(array, section);
    }

    emitImportTable(array: ByteArray): void {
        if (!this.firstImport) {
            return;
        }

        let section = this.assembler.startSection(array, WasmSection.Import, "import_table");
        log(section.data, array.position, this.importCount, "num imports");
        this.assembler.writeUnsignedLEB128(section.data, this.importCount);

        let current = this.firstImport;
        let count = 0;
        while (current != null) {
            log(section.data, array.position, null, `import func (${count}) ${current.module} ${current.name}`);
            this.assembler.writeWasmString(section.data, current.module);
            this.assembler.writeWasmString(section.data, current.name);
            this.assembler.writeUnsignedLEB128(section.data, WasmExternalKind.Function);
            this.assembler.writeUnsignedLEB128(section.data, current.signatureIndex);
            current = current.next;
            count++;
        }

        this.assembler.endSection(array, section);
    }

    emitFunctionDeclarations(array: ByteArray): void {
        if (!this.firstFunction) {
            return;
        }

        let section = this.assembler.startSection(array, WasmSection.Function, "function_declarations");
        log(section.data, array.position, this.functionCount, "num functions");
        this.assembler.writeUnsignedLEB128(section.data, this.functionCount);

        let fn = this.firstFunction;
        let count = this.importCount;
        while (fn != null) {
            log(section.data, array.position, fn.signatureIndex, `func ${count} sig ${getWasmFunctionName(fn.symbol)}`);
            this.assembler.writeUnsignedLEB128(section.data, fn.signatureIndex);
            fn = fn.next;
            count++;
        }

        this.assembler.endSection(array, section);
    }

    emitTables(array: ByteArray): void {
        //TODO
    }

    emitMemory(array: ByteArray): void {
        let section = this.assembler.startSection(array, WasmSection.Memory, "memory");
        log(section.data, array.position, "01", "num memories");
        this.assembler.writeUnsignedLEB128(section.data, 1); //indicating the number of memories defined by the module, In the MVP, the number of memories must be no more than 1.
        //resizable_limits
        log(section.data, array.position, "00", "memory flags");
        this.assembler.writeUnsignedLEB128(section.data, WASM_SET_MAX_MEMORY ? 0x1 : 0); //flags, bit 0x1 is set if the maximum field is present
        log(section.data, array.position, WASM_SIZE_IN_PAGES, "memory initial pages");
        this.assembler.writeUnsignedLEB128(section.data, WASM_SIZE_IN_PAGES); //initial length (in units of table elements or wasm pages)
        if (WASM_SET_MAX_MEMORY) {
            log(section.data, array.position, WASM_MAX_MEMORY, "maximum memory");
            this.assembler.writeUnsignedLEB128(section.data, WASM_MAX_MEMORY);// maximum, only present if specified by flags
        }
        this.assembler.endSection(array, section);
    }

    emitGlobalDeclarations(array: ByteArray): void {

        if (!this.firstGlobal) {
            return;
        }

        let section = this.assembler.startSection(array, WasmSection.Global, "global");
        this.assembler.writeUnsignedLEB128(section.data, this.globalCount);

        this.assembler.stackTracer.setGlobals(this.globalEntries);

        let global = this.firstGlobal;
        while (global) {
            let dataType: string = typeToDataType(global.symbol.resolvedType, this.bitness);
            let value = global.symbol.node.variableValue();
            section.data.append(WasmType[dataType]); //content_type
            this.assembler.writeUnsignedLEB128(section.data, 1); //mutability, 0 if immutable, 1 if mutable. MVP only support immutable global variables
            let rawValue = 0;
            if (value) {
                if (value.kind === NodeKind.NULL || value.kind === NodeKind.UNDEFINED) {
                    rawValue = 0;
                }
                else if (value.rawValue !== undefined) {
                    rawValue = value.rawValue;
                } else {
                    // Emit evaluation to start function
                    this.addGlobalToStartFunction(global);
                }
            }

            this.assembler.appendOpcode(section.data, array.position, WasmOpcode[`${dataType}_CONST`], rawValue);
            switch (dataType) {
                case "I32":
                    this.assembler.writeUnsignedLEB128(section.data, rawValue);
                    break;
                case "I64":
                    this.assembler.writeUnsignedLEB128(section.data, rawValue);
                    break;
                case "F32":
                    this.assembler.writeFloat(section.data, rawValue);
                    break;
                case "F64":
                    this.assembler.writeDouble(section.data, rawValue);
                    break;
            }

            this.assembler.appendOpcode(section.data, array.position, WasmOpcode.END);

            global = global.next;
        }

        this.assembler.endSection(array, section);
    }

    addGlobalToStartFunction(global: WasmGlobal): void {
        let value = global.symbol.node.variableValue();
        let startFn = this.startFunction;

        this.emitNode(startFn.body, 0, value);
        this.assembler.appendOpcode(startFn.body, 0, WasmOpcode.SET_GLOBAL);
        this.assembler.writeUnsignedLEB128(startFn.body, global.symbol.offset);
    }

    emitExportTable(array: ByteArray): void {
        let exportedCount = 0;
        let fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                exportedCount = exportedCount + 1;
            }
            fn = fn.next;
        }
        if (exportedCount == 0) {
            return;
        }

        let section = this.assembler.startSection(array, WasmSection.Export, "export_table");
        log(section.data, array.position, exportedCount, "num exports");
        this.assembler.writeUnsignedLEB128(section.data, exportedCount + 1);

        //Export main memory
        let memoryName: string = "memory";
        log(section.data, array.position, memoryName.length, "export name length");
        log(section.data, null, null, `${toHex(section.data.position + array.position + 4)}: ${memoryName} // export name`);
        this.assembler.writeWasmString(section.data, memoryName);
        log(section.data, array.position, WasmExternalKind.Function, "export kind");
        this.assembler.writeUnsignedLEB128(section.data, WasmExternalKind.Memory);
        log(section.data, array.position, 0, "export memory index");
        this.assembler.writeUnsignedLEB128(section.data, 0);

        let i = this.importCount;
        fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                let fnName: string = getWasmFunctionName(fn.symbol);
                log(section.data, array.position, fnName.length, "export name length");
                log(section.data, null, null, `${toHex(section.data.position + array.position + 4)}: ${fnName} // export name`);
                this.assembler.writeWasmString(section.data, fnName);
                log(section.data, array.position, WasmExternalKind.Function, "export kind");
                this.assembler.writeUnsignedLEB128(section.data, WasmExternalKind.Function);
                log(section.data, array.position, i, "export func index");
                this.assembler.writeUnsignedLEB128(section.data, i);
            }
            fn = fn.next;
            i = i + 1;
        }

        this.assembler.endSection(array, section);
    }

    emitStartFunctionDeclaration(array: ByteArray): void {
        if (this.startFunctionIndex != -1) {
            let section = this.assembler.startSection(array, WasmSection.Start, "start_function");
            log(section.data, array.position, this.startFunctionIndex, "start function index");
            this.assembler.writeUnsignedLEB128(section.data, this.importCount + this.startFunctionIndex);
            this.assembler.endSection(array, section);
        }
    }

    emitElements(array: ByteArray): void {
        //TODO
    }

    emitFunctionBodies(array: ByteArray): void {
        if (!this.firstFunction) {
            return;
        }
        let offset = array.position;
        let section = this.assembler.startSection(array, WasmSection.Code, "function_bodies");
        log(section.data, offset, this.functionCount, "num functions");
        this.assembler.writeUnsignedLEB128(section.data, this.functionCount);
        let count = 0;
        let fn = this.firstFunction;
        while (fn != null) {
            this.currentFunction = fn;
            let sectionOffset = offset + section.data.position;
            let wasmFunctionName = getWasmFunctionName(fn.symbol);
            let bodyData = new ByteArray();
            log(bodyData, sectionOffset, fn.localCount ? fn.localCount : 0, "local var count");

            this.assembler.stackTracer.startFunction(this.importCount + count);

            if (fn.localCount > 0) {
                bodyData.writeUnsignedLEB128(fn.localCount); //local_count

                // TODO: Optimize local declarations
                //local_entry
                let local = fn.firstLocal;
                while (local) {
                    log(bodyData, sectionOffset, 1, "local index");
                    bodyData.writeUnsignedLEB128(1); //count
                    log(bodyData, sectionOffset, local.type, WasmType[local.type]);
                    bodyData.append(local.type); //value_type
                    local = local.next;
                }

            } else {
                bodyData.writeUnsignedLEB128(0);
            }

            let lastChild;
            if (fn.isConstructor) {
                // this is <CLASS>__ctr function
                this.emitConstructor(bodyData, sectionOffset, fn)
            }

            let child = fn.symbol.node.functionBody().firstChild;
            while (child != null) {
                lastChild = child;
                this.emitNode(bodyData, sectionOffset, child);
                child = child.nextSibling;
            }

            if (fn.body) {
                bodyData.copy(fn.body);
            } else {
                if (lastChild && lastChild.kind !== NodeKind.RETURN && fn.returnType != WasmType.VOID) {
                    this.assembler.appendOpcode(bodyData, sectionOffset, WasmOpcode.RETURN);
                }
            }

            if (fn.returnType === WasmType.VOID) {
                // Drop stack if not empty
                this.assembler.dropStack(bodyData);
            }

            this.assembler.appendOpcode(bodyData, sectionOffset, WasmOpcode.END); //end, 0x0b, indicating the end of the body

            this.assembler.stackTracer.endFunction();

            //Copy and finish body
            section.data.writeUnsignedLEB128(bodyData.length);
            log(section.data, offset, null, ` - func body ${this.importCount + (count++)} (${wasmFunctionName})`);
            log(section.data, offset, bodyData.length, "func body size");
            section.data.log += bodyData.log;
            section.data.copy(bodyData);

            fn = fn.next;
        }

        this.assembler.endSection(array, section);
    }

    emitDataSegments(array: ByteArray): void {
        this.growMemoryInitializer();
        let memoryInitializer = this.memoryInitializer;
        let initializerLength = memoryInitializer.length;
        let initialHeapPointer = alignToNextMultipleOf(WASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);

        // Pass the initial heap pointer to the "malloc" function
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.originalHeapPointer);
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.currentHeapPointer);

        let section = this.assembler.startSection(array, WasmSection.Data, "data_segments");

        // This only writes one single section containing everything
        log(section.data, array.position, 1, "num data segments");
        this.assembler.writeUnsignedLEB128(section.data, 1);

        //data_segment
        log(section.data, array.position, null, " - data segment header 0");
        log(section.data, array.position, 0, "memory index");
        this.assembler.writeUnsignedLEB128(section.data, 0); //index, the linear memory index (0 in the MVP)

        //offset, an i32 initializer expression that computes the offset at which to place the data
        this.assembler.appendOpcode(section.data, array.position, WasmOpcode.I32_CONST);
        log(section.data, array.position, WASM_MEMORY_INITIALIZER_BASE, "i32 literal");
        this.assembler.writeUnsignedLEB128(section.data, WASM_MEMORY_INITIALIZER_BASE); //const value
        this.assembler.appendOpcode(section.data, array.position, WasmOpcode.END);

        log(section.data, array.position, initializerLength, "data segment size");
        this.assembler.writeUnsignedLEB128(section.data, initializerLength); //size, size of data (in bytes)

        log(section.data, array.position, null, " - data segment data 0");
        //data, sequence of size bytes
        // Copy the entire memory initializer (also includes zero-initialized data for now)
        let i = 0;
        let value;
        while (i < initializerLength) {
            for (let j = 0; j < 16; j++) {
                if (i + j < initializerLength) {
                    value = memoryInitializer.get(i + j);
                    section.data.append(value);
                    logData(section.data, array.position, value, j == 0);
                }
            }
            section.data.log += "\n";
            i = i + 16;
        }

        // section.data.copy(memoryInitializer, initializerLength);

        this.assembler.endSection(array, section);
    }

    // Custom section for debug names
    //
    emitNames(array: ByteArray): void {
        let section = this.assembler.startSection(array, 0, "name");

        let subsectionFunc: ByteArray = new ByteArray();
        let subsectionLocal: ByteArray = new ByteArray();

        this.assembler.writeUnsignedLEB128(subsectionFunc, this.functionCount);
        this.assembler.writeUnsignedLEB128(subsectionLocal, this.functionCount);
        let fn = this.firstFunction;
        while (fn != null) {
            let fnIndex = this.importCount + fn.symbol.offset;
            let name = getWasmFunctionName(fn.symbol);
            this.assembler.writeUnsignedLEB128(subsectionFunc, fnIndex);
            this.assembler.writeWasmString(subsectionFunc, name);
            this.assembler.writeUnsignedLEB128(subsectionLocal, fnIndex);
            this.assembler.writeUnsignedLEB128(subsectionLocal, fn.localEntries.length);

            fn.localEntries.forEach((local, index) => {
                this.assembler.writeUnsignedLEB128(subsectionLocal, index);
                this.assembler.writeWasmString(subsectionLocal, local.name);
            });

            fn = fn.next;
        }

        //subsection for function names
        this.assembler.writeUnsignedLEB128(section.data, 1); // name_type
        this.assembler.writeUnsignedLEB128(section.data, subsectionFunc.length); // name_payload_len
        section.data.copy(subsectionFunc); // name_payload_data

        //subsection for local names
        this.assembler.writeUnsignedLEB128(section.data, 2); // name_type
        this.assembler.writeUnsignedLEB128(section.data, subsectionLocal.length); // name_payload_len
        section.data.copy(subsectionLocal); // name_payload_data

        this.assembler.endSection(array, section);
    }

    prepareToEmit(node: Node): void {
        if (node.kind == NodeKind.STRING) {
            let text = node.stringValue;
            let length = text.length;
            let offset = this.context.allocateGlobalVariableOffset(length * 2 + 4, 4);
            node.intValue = offset;
            this.growMemoryInitializer();
            let memoryInitializer = this.memoryInitializer;

            // Emit a length-prefixed string
            ByteArray_set32(memoryInitializer, offset, length);
            ByteArray_setString(memoryInitializer, offset + 4, text);
        }

        else if (node.kind == NodeKind.VARIABLE) {
            let symbol = node.symbol;

            /*if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
             let sizeOf = symbol.resolvedType.variableSizeOf(this.context);
             let value = symbol.node.variableValue();
             let memoryInitializer = this.memoryInitializer;

             // Copy the initial value into the memory initializer
             this.growMemoryInitializer();

             let offset = symbol.offset;

             if (sizeOf == 1) {
             if (symbol.resolvedType.isUnsigned()) {
             memoryInitializer.writeUnsignedByte(value.intValue, offset);
             } else {
             memoryInitializer.writeByte(value.intValue, offset);
             }
             }
             else if (sizeOf == 2) {
             if (symbol.resolvedType.isUnsigned()) {
             memoryInitializer.writeUnsignedShort(value.intValue, offset);
             } else {
             memoryInitializer.writeShort(value.intValue, offset);
             }
             }
             else if (sizeOf == 4) {
             if (symbol.resolvedType.isFloat()) {
             memoryInitializer.writeFloat(value.floatValue, offset);
             } else {
             if (symbol.resolvedType.isUnsigned()) {
             memoryInitializer.writeUnsignedInt(value.intValue, offset);
             } else {
             memoryInitializer.writeInt(value.intValue, offset);
             }
             }
             }
             else if (sizeOf == 8) {
             if (symbol.resolvedType.isDouble()) {
             memoryInitializer.writeDouble(value.rawValue, offset);
             } else {
             //TODO Implement Int64 write
             if (symbol.resolvedType.isUnsigned()) {
             //memoryInitializer.writeUnsignedInt64(value.rawValue, offset);
             } else {
             //memoryInitializer.writeInt64(value.rawValue, offset);
             }
             }
             }
             else assert(false);*/

            if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {

                let global = this.allocateGlobal(symbol, this.bitness);

                // Make sure the heap offset is tracked
                if (symbol.name == "currentHeapPointer") {
                    assert(this.currentHeapPointer == -1);
                    this.currentHeapPointer = symbol.offset;
                }

                // Make sure the heap offset is tracked
                else if (symbol.name == "originalHeapPointer") {
                    assert(this.originalHeapPointer == -1);
                    this.originalHeapPointer = symbol.offset;
                }
            }
        }

        else if (node.kind == NodeKind.FUNCTION &&
            (node.symbol.kind != SymbolKind.FUNCTION_INSTANCE ||
            node.symbol.kind == SymbolKind.FUNCTION_INSTANCE && !node.parent.isTemplate())) {

            let returnType = node.functionReturnType();
            let wasmReturnType = this.getWasmType(returnType.resolvedType);
            let shared = new WasmSharedOffset();
            let argumentTypesFirst: WasmWrappedType = null;
            let argumentTypesLast: WasmWrappedType = null;
            let symbol = node.symbol;
            let isConstructor: boolean = symbol.name == "constructor";

            // Make sure to include the implicit "this" variable as a normal argument
            let argument = node.isExternalImport() ? node.functionFirstArgumentIgnoringThis() : node.functionFirstArgument();
            let argumentCount = 0;
            let argumentList: WasmLocalEntry[] = [];
            while (argument != returnType) {
                let wasmType = this.getWasmType(argument.variableType().resolvedType);
                argumentList.push(new WasmLocalEntry(wasmType, argument.symbol.name));

                let type = wasmWrapType(wasmType);

                if (argumentTypesFirst == null) argumentTypesFirst = type;
                else argumentTypesLast.next = type;
                argumentTypesLast = type;

                shared.nextLocalOffset = shared.nextLocalOffset + 1;
                argumentCount++;
                argument = argument.nextSibling;
            }

            let signatureIndex = this.allocateSignature(argumentTypesFirst, wasmWrapType(wasmReturnType), argumentCount);

            let body = node.functionBody();

            // Functions without bodies are imports
            if (body == null) {
                let wasmFunctionName: string = getWasmFunctionName(symbol);
                if (!isBuiltin(wasmFunctionName)) {
                    let moduleName = symbol.kind == SymbolKind.FUNCTION_INSTANCE ? symbol.parent().name : "global";
                    symbol.offset = this.importCount;
                    this.allocateImport(signatureIndex, moduleName, symbol.name);
                }
                node = node.nextSibling;
                return;
            } else {
                symbol.offset = this.functionCount;
            }

            let fn = this.allocateFunction(symbol, signatureIndex);
            fn.localEntries = argumentList.concat(fn.localEntries);
            fn.isConstructor = isConstructor;
            fn.returnType = wasmReturnType;

            // Make sure "malloc" is tracked
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.name == "malloc") {
                assert(this.mallocFunctionIndex == -1);
                this.mallocFunctionIndex = symbol.offset;
            }
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.name == "free") {
                assert(this.freeFunctionIndex == -1);
                this.freeFunctionIndex = symbol.offset;
            }

            // Make "__WASM_INITIALIZER" as start function
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.name == "__WASM_INITIALIZER") {
                assert(this.startFunctionIndex == -1);
                this.startFunctionIndex = symbol.offset;
                this.startFunction = fn;
                this.startFunction.body = new ByteArray();
            }

            if (node.isExport()) {
                fn.isExported = true;
            }

            wasmAssignLocalVariableOffsets(fn, body, shared, this.bitness);
            fn.localCount = shared.localCount;
        }

        let child = node.firstChild;
        while (child != null) {
            this.prepareToEmit(child);
            child = child.nextSibling;
        }
    }

    emitBinaryExpression(array: ByteArray, byteOffset: int32, node: Node, opcode: uint8): void {
        this.emitNode(array, byteOffset, node.binaryLeft());
        this.emitNode(array, byteOffset, node.binaryRight());
        this.assembler.appendOpcode(array, byteOffset, opcode);
    }

    emitLoadFromMemory(array: ByteArray, byteOffset: int32, type: Type, relativeBase: Node, offset: int32): void {
        let opcode;
        // Relative address
        if (relativeBase != null) {
            this.emitNode(array, byteOffset, relativeBase);
        }
        // Absolute address
        else {
            opcode = WasmOpcode.I32_CONST;
            this.assembler.appendOpcode(array, byteOffset, opcode);
            log(array, byteOffset, 0, "i32 literal");
            this.assembler.writeUnsignedLEB128(array, 0);
        }

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            opcode = type.isUnsigned() ? WasmOpcode.I32_LOAD8_U : WasmOpcode.I32_LOAD8_S;
            this.assembler.appendOpcode(array, byteOffset, opcode);
            log(array, byteOffset, 0, "alignment");
            this.assembler.writeUnsignedLEB128(array, 0);
        }

        else if (sizeOf == 2) {
            opcode = type.isUnsigned() ? WasmOpcode.I32_LOAD16_U : WasmOpcode.I32_LOAD16_S;
            this.assembler.appendOpcode(array, byteOffset, opcode);
            log(array, byteOffset, 1, "alignment");
            this.assembler.writeUnsignedLEB128(array, 1);
        }

        else if (sizeOf == 4 || type.isClass()) {

            if (type.isFloat()) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_LOAD);
            }

            else {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_LOAD);
            }
            log(array, byteOffset, 2, "alignment");
            this.assembler.writeUnsignedLEB128(array, 2);
        }

        else if (sizeOf == 8) {

            if (type.isDouble()) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_LOAD);
            }

            else {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_LOAD);
            }
            log(array, byteOffset, 3, "alignment");
            this.assembler.writeUnsignedLEB128(array, 3);
        }

        else {
            assert(false);
        }

        log(array, byteOffset, offset, "load offset");
        this.assembler.writeUnsignedLEB128(array, offset);

    }

    emitStoreToMemory(array: ByteArray, byteOffset: int32, type: Type, relativeBase: Node, offset: int32, value: Node): void {
        // Relative address
        if (relativeBase != null) {
            this.emitNode(array, byteOffset, relativeBase);
        }
        // Absolute address
        else {
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            log(array, byteOffset, 0, "i32 literal");
            this.assembler.writeUnsignedLEB128(array, 0);
        }

        this.emitNode(array, byteOffset, value);

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_STORE8);
            log(array, byteOffset, 0, "alignment");
            this.assembler.writeUnsignedLEB128(array, 0);
        }

        else if (sizeOf == 2) {
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_STORE16);
            log(array, byteOffset, 1, "alignment");
            this.assembler.writeUnsignedLEB128(array, 1);
        }

        else if (sizeOf == 4 || type.isClass()) {

            if (type.isFloat()) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_STORE);
            }

            else {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_STORE);
            }
            log(array, byteOffset, 2, "alignment");
            this.assembler.writeUnsignedLEB128(array, 2);
        }

        else if (sizeOf == 8) {

            if (type.isDouble()) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_STORE);
            }

            else if (type.isLong()) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_STORE);
            }

            log(array, byteOffset, 3, "alignment");
            this.assembler.writeUnsignedLEB128(array, 3);
        }

        else {
            assert(false);
        }

        log(array, byteOffset, offset, "load offset");
        this.assembler.writeUnsignedLEB128(array, offset);
    }

    /**
     * Emit instance
     * @param array
     * @param byteOffset
     * @param node
     */
    emitInstance(array: ByteArray, byteOffset: int32, node: Node): void {
        let constructorNode = node.constructorNode();
        let callSymbol = constructorNode.symbol;

        let type = node.newType();
        let size;

        if (type.resolvedType.isArray()) {
            /**
             * If the new type if an array append total byte length and element size
             **/
            let elementNode = type.firstGenericType();
            let elementType = elementNode.resolvedType;
            let isClassElement = elementType.isClass();
            //ignore 64 bit pointer
            size = isClassElement ? 4 : elementType.allocationSizeOf(this.context);
            assert(size > 0);
            let lengthNode = node.arrayLength();

            if (lengthNode.kind == NodeKind.INT32) {
                let length = size * lengthNode.intValue;
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, length);
                this.assembler.writeLEB128(array, length); //array byteLength
            } else {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, size);
                this.assembler.writeLEB128(array, size);
                this.emitNode(array, byteOffset, lengthNode);
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_MUL); //array byteLength
            }

            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(array, size); // array element size

            let callIndex: int32 = this.getWasmFunctionCallIndex(callSymbol);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.CALL);
            log(array, byteOffset, callIndex, `call func index (${callIndex})`);
            this.assembler.writeUnsignedLEB128(array, callIndex);
        }
        else if (type.resolvedType.isTypedArray()) {
            // let elementSize = getTypedArrayElementSize(type.resolvedType.symbol.name);
            // this.assembler.appendOpcode(array, byteOffset, WasmOpcode.GET_LOCAL);
            // this.assembler.writeLEB128(array, 0);
            // this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            // this.assembler.writeLEB128(array, elementSize);
            // this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
            // this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            // this.assembler.writeLEB128(array, size);
            // this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_ADD);
        }
        else {

            // Emit constructor arguments
            let child = node.firstChild.nextSibling;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }

            let callIndex: int32 = this.getWasmFunctionCallIndex(callSymbol);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.CALL, callIndex);
            this.assembler.writeUnsignedLEB128(array, callIndex);
        }
    }

    /**
     * Emit constructor function where malloc happens
     * @param array
     * @param byteOffset
     * @param fn
     */
    emitConstructor(array: ByteArray, byteOffset: int32, fn: WasmFunction): void {
        let constructorNode: Node = fn.symbol.node;
        let type = constructorNode.parent.symbol;
        let size = type.resolvedType.allocationSizeOf(this.context);
        assert(size > 0);

        if (type.resolvedType.isArray()) {
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.GET_LOCAL, 0);
            this.assembler.writeUnsignedLEB128(array, 0); // array parameter byteLength
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(array, size); // size of array class, default is 8 bytes
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_ADD);

        }
        else if (type.resolvedType.isTypedArray()) {
            let elementSize = getTypedArrayElementSize(type.resolvedType.symbol.name);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.GET_LOCAL, 0);
            this.assembler.writeUnsignedLEB128(array, 0);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, elementSize);
            this.assembler.writeLEB128(array, elementSize);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(array, size);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_ADD);
        }
        else {
            // Pass the object size as the first argument
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(array, size);
        }

        // Allocate memory
        let mallocIndex = this.calculateWasmFunctionIndex(this.mallocFunctionIndex);
        this.assembler.appendOpcode(array, byteOffset, WasmOpcode.CALL, mallocIndex);
        this.assembler.writeUnsignedLEB128(array, mallocIndex);
        this.assembler.appendOpcode(array, byteOffset, WasmOpcode.SET_LOCAL, fn.signature.argumentCount);
        this.assembler.writeUnsignedLEB128(array, fn.signature.argumentCount);// Set self pointer to first local variable which is immediate after the argument variable
    }

    emitNode(array: ByteArray, byteOffset: int32, node: Node): int32 {
        // Assert
        assert(!isExpression(node) || node.resolvedType != null);

        if (node.kind == NodeKind.BLOCK) {
            /**
             * Skip emitting block if parent is 'if' or 'loop' since it is already a block
             */
            let skipBlock = node.parent.kind === NodeKind.IF;

            if (!skipBlock) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.BLOCK);
                if (node.returnNode !== undefined) {
                    log(array, byteOffset, this.currentFunction.returnType, WasmType[this.currentFunction.returnType]);
                    array.append(this.currentFunction.returnType);
                } else {
                    log(array, byteOffset, WasmType.block_type, WasmType[WasmType.block_type]);
                    array.append(WasmType.block_type);
                }
            }

            let child = node.firstChild;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }

            if (!skipBlock) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.END);
            }
        }

        else if (node.kind == NodeKind.WHILE) {
            let value = node.whileValue();
            let body = node.whileBody();

            // Ignore "while (false) { ... }"
            if (value.kind == NodeKind.BOOLEAN && value.intValue == 0) {
                return 0;
            }

            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.BLOCK);
            log(array, 0, WasmType.block_type, WasmType[WasmType.block_type]);
            array.append(WasmType.block_type);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.LOOP);
            log(array, 0, WasmType.block_type, WasmType[WasmType.block_type]);
            array.append(WasmType.block_type);

            if (value.kind != NodeKind.BOOLEAN) {
                this.emitNode(array, byteOffset, value);
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_EQZ);
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.BR_IF);
                this.assembler.writeUnsignedLEB128(array, 1); // Break out of the immediately enclosing loop
            }

            let child = body.firstChild;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }

            // Jump back to the top (this doesn't happen automatically)
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.BR);
            this.assembler.writeUnsignedLEB128(array, 0); // Continue back to the immediately enclosing loop

            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.END); // end inner block
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.END); // end outer block
        }

        else if (node.kind == NodeKind.BREAK || node.kind == NodeKind.CONTINUE) {
            let label = 0;
            let parent = node.parent;

            while (parent != null && parent.kind != NodeKind.WHILE) {
                if (parent.kind == NodeKind.BLOCK) {
                    label = label + 1;
                }
                parent = parent.parent;
            }

            assert(label > 0);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.BR);
            this.assembler.writeUnsignedLEB128(array, label - (node.kind == NodeKind.BREAK ? 0 : 1));
        }

        else if (node.kind == NodeKind.EMPTY) {
            return 0;
        }

        else if (node.kind == NodeKind.EXPRESSION) {
            this.emitNode(array, byteOffset, node.expressionValue());
        }

        else if (node.kind == NodeKind.RETURN) {
            let value = node.returnValue();
            if (value != null) {
                this.emitNode(array, byteOffset, value);
            }
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.RETURN);
        }

        else if (node.kind == NodeKind.VARIABLES) {
            let count = 0;
            let child = node.firstChild;
            while (child != null) {
                assert(child.kind == NodeKind.VARIABLE);
                count = count + this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }
            return count;
        }

        else if (node.kind == NodeKind.IF) {
            let branch = node.ifFalse();

            this.emitNode(array, byteOffset, node.ifValue());
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.IF);

            let returnNode = node.ifReturnNode();
            let needEmptyElse = false;
            if (returnNode == null && branch === null) {
                append(array, 0, WasmType.block_type, WasmType[WasmType.block_type]);
            } else {
                if (returnNode !== null) {
                    let returnType: WasmType = symbolToValueType(returnNode.resolvedType.symbol);
                    append(array, 0, returnType, WasmType[returnType]);
                    if (branch == null) {
                        needEmptyElse = true;
                    }
                } else {
                    append(array, 0, WasmType.block_type, WasmType[WasmType.block_type]);
                }
            }

            this.emitNode(array, byteOffset, node.ifTrue());

            if (branch != null) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.IF_ELSE);
                this.emitNode(array, byteOffset, branch);
            } else if (needEmptyElse) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.IF_ELSE);
                let dataType: string = typeToDataType(returnNode.resolvedType, this.bitness);
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode[`${dataType}_CONST`]);
                if (dataType === "I32" || dataType === "I64") {
                    this.assembler.writeUnsignedLEB128(array, 0);
                } else if (dataType === "F32") {
                    this.assembler.writeFloat(array, 0);
                } else if (dataType === "F64") {
                    this.assembler.writeDouble(array, 0);
                }
            }

            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.END);
        }

        else if (node.kind == NodeKind.HOOK) {
            this.emitNode(array, byteOffset, node.hookValue());
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.IF);
            let trueValue = node.hookTrue();
            let trueValueType = symbolToValueType(trueValue.resolvedType.symbol);
            append(array, 0, trueValueType, WasmType[trueValueType]);
            this.emitNode(array, byteOffset, trueValue);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.IF_ELSE);
            this.emitNode(array, byteOffset, node.hookFalse());
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.END);
        }

        else if (node.kind == NodeKind.VARIABLE) {
            let value = node.variableValue();

            if (node.symbol.name == "this" && this.currentFunction.symbol.name == "constructor") {
                // skip this
            }
            else if (node.symbol.kind == SymbolKind.VARIABLE_LOCAL) {

                if (value &&
                    value.kind != NodeKind.NAME &&
                    value.kind != NodeKind.CALL &&
                    value.kind != NodeKind.NEW &&
                    value.kind != NodeKind.DOT &&
                    value.rawValue) {
                    if (node.symbol.resolvedType.isFloat()) {
                        this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_CONST, value.floatValue);
                        this.assembler.writeFloat(array, value.floatValue);

                    }

                    else if (node.symbol.resolvedType.isDouble()) {
                        this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_CONST, value.doubleValue);
                        this.assembler.writeDouble(array, value.doubleValue);
                    }

                    else if (node.symbol.resolvedType.isLong()) {
                        this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, value.longValue);
                        this.assembler.writeLEB128(array, value.longValue);
                    }

                    else {
                        this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, value.intValue);
                        this.assembler.writeLEB128(array, value.intValue);
                    }

                } else {
                    if (value != null) {
                        this.emitNode(array, byteOffset, value);
                    } else {
                        // Default value
                        if (node.symbol.resolvedType.isFloat()) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_CONST, 0);
                            this.assembler.writeFloat(array, 0);
                        }

                        else if (node.symbol.resolvedType.isDouble()) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_CONST, 0);
                            this.assembler.writeDouble(array, 0);
                        }

                        else if (node.symbol.resolvedType.isLong()) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, 0);
                            this.assembler.writeLEB128(array, 0);
                        }

                        else {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, 0);
                            this.assembler.writeLEB128(array, 0);
                        }
                    }
                }

                let skipSetLocal = value && isUnaryPostfix(value.kind);

                if (skipSetLocal == false) {
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.SET_LOCAL, node.symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, node.symbol.offset);
                }
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.NAME) {
            let symbol = node.symbol;

            if (symbol.kind == SymbolKind.VARIABLE_ARGUMENT || symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                // FIXME This should handle in checker.
                if (symbol.name === "this" && this.currentFunction.symbol.name === "constructor") {
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.GET_LOCAL, this.currentFunction.signature.argumentCount);
                    this.assembler.writeUnsignedLEB128(array, this.currentFunction.signature.argumentCount);
                } else {
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.GET_LOCAL, symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, symbol.offset);
                }
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                // FIXME: Final spec allow immutable global variables
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.GET_GLOBAL, symbol.offset);
                this.assembler.writeUnsignedLEB128(array, symbol.offset);
                // this.emitLoadFromMemory(array, byteOffset, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.DEREFERENCE) {
            this.emitLoadFromMemory(array, byteOffset, node.resolvedType.underlyingType(this.context), node.unaryValue(), 0);
        }

        else if (node.kind == NodeKind.POINTER_INDEX) {
            this.emitLoadFromMemory(array, byteOffset, node.resolvedType.underlyingType(this.context), node.pointer(), node.pointerOffset());
        }

        else if (node.kind == NodeKind.NULL) {
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, 0);
            this.assembler.writeLEB128(array, 0);
        }

        else if (node.kind == NodeKind.INT32 || node.kind == NodeKind.BOOLEAN) {
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, node.intValue);
            this.assembler.writeLEB128(array, node.intValue || 0);
        }

        else if (node.kind == NodeKind.INT64) {
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, node.longValue);
            this.assembler.writeLEB128(array, node.longValue);
        }

        else if (node.kind == NodeKind.FLOAT32) {
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_CONST, node.floatValue);
            this.assembler.writeFloat(array, node.floatValue);
        }

        else if (node.kind == NodeKind.FLOAT64) {
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_CONST, node.doubleValue);
            this.assembler.writeDouble(array, node.doubleValue);
        }

        else if (node.kind == NodeKind.STRING) {
            let value = WASM_MEMORY_INITIALIZER_BASE + node.intValue;
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, value);
            this.assembler.writeLEB128(array, value);
        }

        else if (node.kind == NodeKind.CALL) {
            let value = node.callValue();
            let symbol = value.symbol;
            assert(isFunction(symbol.kind));

            // Write out the implicit "this" argument
            if (!symbol.node.isExternalImport() && symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
                let dotTarget = value.dotTarget();
                this.emitNode(array, byteOffset, dotTarget);
                if (dotTarget.kind == NodeKind.NEW) {
                    this.emitInstance(array, byteOffset, dotTarget);
                }
            }

            let child = value.nextSibling;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }

            let wasmFunctionName: string = getWasmFunctionName(symbol);
            if (isBuiltin(wasmFunctionName)) {
                this.assembler.appendOpcode(array, byteOffset, getBuiltinOpcode(symbol.name));
            }
            else {
                let callIndex: int32 = this.getWasmFunctionCallIndex(symbol);
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.CALL, callIndex);
                this.assembler.writeUnsignedLEB128(array, callIndex);
            }
        }

        else if (node.kind == NodeKind.NEW) {
            this.emitInstance(array, byteOffset, node);
        }

        else if (node.kind == NodeKind.DELETE) {
            let value = node.deleteValue();

            this.emitNode(array, byteOffset, value);

            let freeIndex = this.calculateWasmFunctionIndex(this.freeFunctionIndex);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.CALL, freeIndex);
            this.assembler.writeUnsignedLEB128(array, freeIndex);
        }

        else if (node.kind == NodeKind.POSITIVE) {
            this.emitNode(array, byteOffset, node.unaryValue());
        }

        else if (node.kind == NodeKind.NEGATIVE) {
            let resolvedType = node.unaryValue().resolvedType;
            if (resolvedType.isFloat()) {
                this.emitNode(array, byteOffset, node.unaryValue());
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_NEG);
            }

            else if (resolvedType.isDouble()) {
                this.emitNode(array, byteOffset, node.unaryValue());
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_NEG);
            }

            else if (resolvedType.isInteger()) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, 0);
                this.assembler.writeLEB128(array, 0);
                this.emitNode(array, byteOffset, node.unaryValue());
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_SUB);
            }

            else if (resolvedType.isLong()) {
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, 0);
                this.assembler.writeLEB128(array, 0);
                this.emitNode(array, byteOffset, node.unaryValue());
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_SUB);
            }

        }

        else if (node.kind == NodeKind.COMPLEMENT) {
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, ~0);
            this.assembler.writeLEB128(array, ~0);
            this.emitNode(array, byteOffset, node.unaryValue());
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_XOR);
        }

        else if (node.kind == NodeKind.NOT) {
            this.emitNode(array, byteOffset, node.unaryValue());
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_EQZ);
        }

        else if (node.kind == NodeKind.CAST) {
            let value = node.castValue();
            let context = this.context;
            let from = value.resolvedType.underlyingType(context);
            let type = node.resolvedType.underlyingType(context);
            let fromSize = from.variableSizeOf(context);
            let typeSize = type.variableSizeOf(context);

            //FIXME: Handle 8,16 bit integer to float casting
            // Sign-extend
            // if (
            //     from == context.int32Type &&
            //     type == context.int8Type || type == context.int16Type
            // ) {
            //     let shift = 32 - typeSize * 8;
            //     this.emitNode(array, byteOffset, value);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            //     log(array, byteOffset, shift, "i32 literal");
            //     this.assembler.writeLEB128(array, shift);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_SHR_S);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            //     log(array, byteOffset, shift, "i32 literal");
            //     this.assembler.writeLEB128(array, shift);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
            // }
            //
            // // Mask
            // else if (
            //     from == context.int32Type || from == context.uint32Type &&
            //     type == context.uint8Type || type == context.uint16Type
            // ) {
            //     this.emitNode(array, byteOffset, value);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            //     let _value = type.integerBitMask(this.context);
            //     log(array, byteOffset, _value, "i32 literal");
            //     this.assembler.writeLEB128(array, _value);
            //     this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_AND);
            // }

            // --- 32 bit Integer casting ---
            // i32 > i64
            if (
                (from == context.nullType || from == context.booleanType || from == context.int32Type || from == context.uint32Type ) &&
                (type == context.int64Type || type == context.uint64Type)
            ) {
                if (value.kind == NodeKind.NULL) {
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, 0);
                    this.assembler.writeLEB128(array, 0);
                }
                else if (value.kind == NodeKind.BOOLEAN) {
                    let intValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, intValue);
                    this.assembler.writeLEB128(array, intValue);
                } else if (value.kind == NodeKind.INT32) {
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, value.longValue);
                    this.assembler.writeLEB128(array, value.longValue);
                } else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? WasmOpcode.I64_EXTEND_U_I32 : WasmOpcode.I64_EXTEND_S_I32);
                }
            }

            // i32 > f32
            else if (
                (from == context.nullType || from == context.booleanType  || from == context.int32Type || from == context.uint32Type) &&
                type == context.float32Type
            ) {
                if (value.kind == NodeKind.NULL) {
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_CONST, 0);
                    this.assembler.writeFloat(array, 0);
                }
                else if (value.kind == NodeKind.BOOLEAN) {
                    let floatValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(array, floatValue);
                }
                else if (value.kind == NodeKind.INT32) {
                    let floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(array, floatValue);
                } else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? WasmOpcode.F32_CONVERT_U_I32 : WasmOpcode.F32_CONVERT_S_I32);
                }
            }

            // i32 > f64
            else if (
                (from == context.nullType || from == context.int32Type || from == context.uint32Type) &&
                type == context.float64Type
            ) {
                if (value.kind == NodeKind.NULL) {
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_CONST, 0);
                    this.assembler.writeDouble(array, 0);
                }
                else if (value.kind == NodeKind.BOOLEAN) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(array, doubleValue);
                }
                else if (value.kind == NodeKind.INT32) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(array, doubleValue);
                } else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? WasmOpcode.F64_CONVERT_U_I32 : WasmOpcode.F64_CONVERT_S_I32);
                }
            }
            //-----

            // --- 64 bit Integer casting ---
            // i64 > i32
            else if (
                (from == context.int64Type || from == context.uint64Type ) &&
                (type == context.int32Type || type == context.uint32Type)
            ) {
                if (value.kind == NodeKind.INT64) {
                    let intValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(array, intValue);
                } else {
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_WRAP_I64);
                }
            }

            // i64 > f32
            else if (
                (from == context.int64Type || from == context.uint64Type) &&
                type == context.float32Type
            ) {
                if (value.kind == NodeKind.INT32) {
                    let floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(array, floatValue);
                } else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? WasmOpcode.F32_CONVERT_U_I64 : WasmOpcode.F32_CONVERT_S_I64);
                }
            }

            // i64 > f64
            else if (
                (from == context.int64Type || from == context.uint64Type) &&
                type == context.float64Type) {

                if (value.kind == NodeKind.INT64) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(array, doubleValue);
                } else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? WasmOpcode.F64_CONVERT_U_I64 : WasmOpcode.F64_CONVERT_S_I64);
                }
            }
            //------

            // --- 32 bit float casting ---
            // f32 > i32
            else if (
                from == context.float32Type &&
                (type == context.uint8Type || type == context.int8Type ||
                type == context.uint16Type || type == context.int16Type ||
                type == context.uint32Type || type == context.int32Type)
            ) {
                if (value.kind == NodeKind.FLOAT32) {
                    let intValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(array, intValue);
                } else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? WasmOpcode.I32_TRUNC_U_F32 : WasmOpcode.I32_TRUNC_S_F32);
                }
            }

            // f32 > i64
            else if (
                from == context.float32Type &&
                (type == context.int64Type || type == context.uint64Type)
            ) {
                if (value.kind == NodeKind.FLOAT32) {
                    let longValue = value.longValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, longValue);
                    this.assembler.writeLEB128(array, longValue);
                } else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? WasmOpcode.I64_TRUNC_U_F32 : WasmOpcode.I64_TRUNC_S_F32);
                }
            }

            // f32 > f64
            else if (from == context.float32Type && type == context.float64Type) {

                if (value.kind == NodeKind.FLOAT32) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(array, doubleValue);
                } else {
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_PROMOTE_F32);
                }
            }
            //----

            // --- 64 bit float casting ---
            // f64 > i32
            else if (
                from == context.float64Type &&
                (type == context.uint8Type || type == context.int8Type ||
                type == context.uint16Type || type == context.int16Type ||
                type == context.uint32Type || type == context.int32Type)
            ) {

                if (value.kind == NodeKind.FLOAT64) {
                    let intValue = value.intValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(array, intValue);
                } else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? WasmOpcode.I32_TRUNC_U_F64 : WasmOpcode.I32_TRUNC_S_F64);
                }
            }

            // f64 > i64
            else if (
                from == context.float64Type &&
                (type == context.int64Type || type == context.uint64Type)
            ) {

                if (value.kind == NodeKind.FLOAT64) {
                    let longValue = value.longValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, longValue);
                    this.assembler.writeLEB128(array, longValue);
                } else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, isUnsigned ? WasmOpcode.I64_TRUNC_U_F64 : WasmOpcode.I64_TRUNC_S_F64);
                }
            }

            // f64 > f32
            else if (from == context.float64Type && type == context.float32Type) {

                if (value.kind == NodeKind.FLOAT64) {
                    let floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(array, floatValue);
                } else {
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_DEMOTE_F64);
                }
            }

            // No cast needed
            else {
                this.emitNode(array, byteOffset, value);
            }
        }

        else if (node.kind == NodeKind.DOT) {
            let symbol = node.symbol;

            if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitLoadFromMemory(array, byteOffset, symbol.resolvedType, node.dotTarget(), symbol.offset);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.ASSIGN) {
            let left = node.binaryLeft();
            let right = node.binaryRight();
            let symbol = left.symbol;

            if (left.kind == NodeKind.DEREFERENCE) {
                this.emitStoreToMemory(array, byteOffset, left.resolvedType.underlyingType(this.context), left.unaryValue(), 0, right);
            }

            else if (left.kind == NodeKind.POINTER_INDEX) {
                this.emitStoreToMemory(array, byteOffset, left.resolvedType.underlyingType(this.context), left.pointer(), left.pointerOffset(), right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitStoreToMemory(array, byteOffset, symbol.resolvedType, left.dotTarget(), symbol.offset, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                this.emitNode(array, byteOffset, right);
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode.SET_GLOBAL);
                this.assembler.writeUnsignedLEB128(array, symbol.offset);
                // this.emitStoreToMemory(array, byteOffset, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_ARGUMENT || symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                this.emitNode(array, byteOffset, right);
                if (!isUnaryPostfix(right.kind)) {
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.SET_LOCAL, symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, symbol.offset);
                }
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.LOGICAL_AND) {
            this.emitNode(array, byteOffset, node.binaryLeft());
            this.emitNode(array, byteOffset, node.binaryRight());
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_AND);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, 1);
            this.assembler.writeLEB128(array, 1);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_EQ);
        }

        else if (node.kind == NodeKind.LOGICAL_OR) {
            this.emitNode(array, byteOffset, node.binaryLeft());
            this.emitNode(array, byteOffset, node.binaryRight());
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_OR);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            log(array, byteOffset, 1, "i32 literal");
            this.assembler.writeLEB128(array, 1);
            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_EQ);
        }

        else if (isUnary(node.kind)) {
            let kind = node.kind;

            if (kind == NodeKind.POSTFIX_INCREMENT || kind == NodeKind.POSTFIX_DECREMENT) {

                let value = node.unaryValue();
                let dataType: string = typeToDataType(value.resolvedType, this.bitness);

                //TODO handle instance variable
                if (node.parent.kind == NodeKind.VARIABLE) {
                    this.emitNode(array, byteOffset, value);
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.SET_LOCAL, node.parent.symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, node.parent.symbol.offset);
                }
                else if (node.parent.kind == NodeKind.ASSIGN) {
                    this.emitNode(array, byteOffset, value);
                    let left = node.parent.binaryLeft();
                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode.SET_LOCAL, left.symbol.offset);
                    this.assembler.writeUnsignedLEB128(array, left.symbol.offset);
                }

                this.emitNode(array, byteOffset, value);

                if (node.parent.kind != NodeKind.RETURN) {
                    assert(
                        value.resolvedType.isInteger() || value.resolvedType.isLong() ||
                        value.resolvedType.isFloat() || value.resolvedType.isDouble()
                    );
                    let size = value.resolvedType.pointerTo ?
                        value.resolvedType.pointerTo.allocationSizeOf(this.context) :
                        value.resolvedType.allocationSizeOf(this.context);

                    if (size == 1 || size == 2) {
                        if (value.kind == NodeKind.INT32 || value.resolvedType.isInteger()) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, 1);
                            this.assembler.writeLEB128(array, 1);
                        }

                        else {
                            Terminal.error("Wrong type");
                        }
                    }

                    else if (size == 4) {
                        if (value.kind == NodeKind.INT32 || value.resolvedType.isInteger()) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, 1);
                            this.assembler.writeLEB128(array, 1);
                        }

                        else if (value.kind == NodeKind.FLOAT32 || value.resolvedType.isFloat()) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_CONST, 1.0);
                            this.assembler.writeFloat(array, 1);
                        }

                        else {
                            Terminal.error("Wrong type");
                        }
                    }

                    else if (size == 8) {

                        if (value.kind == NodeKind.INT64 || value.resolvedType.isLong()) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, 1);
                            this.assembler.writeLEB128(array, 1);
                        }

                        else if (value.kind == NodeKind.FLOAT64 || value.resolvedType.isDouble()) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_CONST, 1.0);
                            this.assembler.writeDouble(array, 1);
                        }

                        else {
                            Terminal.error("Wrong type");
                        }
                    }

                    //TODO extend to other operations
                    let operation = kind == NodeKind.POSTFIX_INCREMENT ? "ADD" : "SUB";

                    this.assembler.appendOpcode(array, byteOffset, WasmOpcode[`${dataType}_${operation}`]);

                    if (value.symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                        this.assembler.appendOpcode(array, byteOffset, WasmOpcode.SET_GLOBAL, value.symbol.offset);
                        this.assembler.writeLEB128(array, value.symbol.offset);
                    }
                    else if (value.symbol.kind == SymbolKind.VARIABLE_LOCAL || value.symbol.kind == SymbolKind.VARIABLE_ARGUMENT) {
                        this.assembler.appendOpcode(array, byteOffset, WasmOpcode.SET_LOCAL, value.symbol.offset);
                        this.assembler.writeLEB128(array, value.symbol.offset);
                    }
                    else if (value.symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                        //FIXME
                        //this.emitStoreToMemory(array, byteOffset, value.symbol.resolvedType, value.dotTarget(), value.symbol.offset, node);
                    }
                }
            }
        }
        else {
            let isUnsigned = node.isUnsignedOperator();
            let left = node.binaryLeft();
            let right = node.binaryRight();
            let isFloat: boolean = left.resolvedType.isFloat() || right.resolvedType.isFloat();
            let isDouble: boolean = left.resolvedType.isDouble() || right.resolvedType.isDouble();

            let dataTypeLeft: string = typeToDataType(left.resolvedType, this.bitness);
            let dataTypeRight: string = typeToDataType(right.resolvedType, this.bitness);

            if (node.kind == NodeKind.ADD) {

                this.emitNode(array, byteOffset, left);

                if (left.resolvedType.pointerTo == null) {
                    this.emitNode(array, byteOffset, right);
                }

                // Need to multiply the right by the size of the pointer target
                else {
                    assert(
                        right.resolvedType.isInteger() || right.resolvedType.isLong() ||
                        right.resolvedType.isFloat() || right.resolvedType.isDouble()
                    );
                    let size = left.resolvedType.pointerTo.allocationSizeOf(this.context);

                    if (size == 2) {
                        if (right.kind == NodeKind.INT32) {
                            let _value = right.intValue << 1;
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, _value);
                            this.assembler.writeLEB128(array, _value);
                        }

                        else {
                            this.emitNode(array, byteOffset, right);
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, 1);
                            this.assembler.writeLEB128(array, 1);
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
                        }
                    }

                    else if (size == 4) {
                        if (right.kind == NodeKind.INT32) {
                            let _value = right.intValue << 2;
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, _value);
                            this.assembler.writeLEB128(array, _value);
                        }

                        else if (right.kind == NodeKind.FLOAT32) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F32_CONST, right.floatValue);
                            this.assembler.writeFloat(array, right.floatValue);
                        }

                        else {
                            this.emitNode(array, byteOffset, right);
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_CONST, 2);
                            this.assembler.writeLEB128(array, 2);
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
                        }
                    }

                    else if (size == 8) {

                        if (right.kind == NodeKind.INT64) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.I64_CONST, right.longValue);
                            this.assembler.writeLEB128(array, right.longValue);
                        }

                        else if (right.kind == NodeKind.FLOAT64) {
                            this.assembler.appendOpcode(array, byteOffset, WasmOpcode.F64_CONST, right.doubleValue);
                            this.assembler.writeDouble(array, right.doubleValue);
                        }
                    }

                    else {
                        this.emitNode(array, byteOffset, right);
                    }
                }
                this.assembler.appendOpcode(array, byteOffset, WasmOpcode[`${dataTypeLeft}_ADD`]);
            }

            else if (node.kind == NodeKind.BITWISE_AND) {
                if (isFloat || isDouble) {
                    throw "Cannot do bitwise operations on floating point number";
                }
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_AND`]);
            }

            else if (node.kind == NodeKind.BITWISE_OR) {
                if (isFloat || isDouble) {
                    throw "Cannot do bitwise operations on floating point number";
                }
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_OR`]);
            }

            else if (node.kind == NodeKind.BITWISE_XOR) {
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_XOR`]);
            }

            else if (node.kind == NodeKind.EQUAL) {
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_EQ`]);
            }

            else if (node.kind == NodeKind.MULTIPLY) {
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_MUL`]);
            }

            else if (node.kind == NodeKind.NOT_EQUAL) {
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_NE`]);
            }

            else if (node.kind == NodeKind.SHIFT_LEFT) {
                if (isFloat || isDouble) {
                    throw "Cannot do bitwise operations on floating point number";
                }
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_SHL`]);
            }

            else if (node.kind == NodeKind.SUBTRACT) {
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_SUB`]);
            }

            else if (node.kind == NodeKind.DIVIDE) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_DIV`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_DIV_U`] : WasmOpcode[`${dataTypeLeft}_DIV_S`]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }

            else if (node.kind == NodeKind.GREATER_THAN) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_GT`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_GT_U`] : WasmOpcode[`${dataTypeLeft}_GT_S`]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }

            else if (node.kind == NodeKind.GREATER_THAN_EQUAL) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_GE`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_GE_U`] : WasmOpcode[`${dataTypeLeft}_GE_S`]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }

            else if (node.kind == NodeKind.LESS_THAN) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_LT`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_LT_U`] : WasmOpcode[`${dataTypeLeft}_LT_S`]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }

            else if (node.kind == NodeKind.LESS_THAN_EQUAL) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_LE`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_LE_U`] : WasmOpcode[`${dataTypeLeft}_LE_S`]);
                this.emitBinaryExpression(array, byteOffset, node, opcode);
            }

            else if (node.kind == NodeKind.REMAINDER) {
                if (isFloat || isDouble) {
                    throw "Floating point remainder is not yet supported in WebAssembly. Please import javascript function to handle this";
                }
                this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                    WasmOpcode[`${dataTypeLeft}_REM_U`] : WasmOpcode[`${dataTypeLeft}_REM_S`]);
            }

            else if (node.kind == NodeKind.SHIFT_RIGHT) {
                if (isFloat || isDouble) {
                    throw "Cannot do bitwise operations on floating point number";
                }
                this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                    WasmOpcode[`${dataTypeLeft}_SHR_U`] : WasmOpcode[`${dataTypeLeft}_SHR_S`]);
            }

            else {
                assert(false);
            }
        }

        return 1;
    }

    calculateWasmFunctionIndex(index: int32): int32 {
        return this.importCount + index;
    }

    getWasmFunctionCallIndex(symbol: Symbol): int32 {
        return symbol.node.isExternalImport() ? symbol.offset : this.importCount + symbol.offset;
    }

    getWasmType(type: Type): WasmType {
        let context = this.context;

        if (type == context.booleanType || type.isClass() || type.isInteger() || (this.bitness == Bitness.x32 && type.isReference())) {
            return WasmType.I32;
        }

        else if (type.isLong() || (this.bitness == Bitness.x64 && type.isReference())) {
            return WasmType.I64;
        }

        else if (type.isDouble()) {
            return WasmType.F64;
        }

        else if (type.isFloat()) {
            return WasmType.F32;
        }

        if (type == context.voidType) {
            return WasmType.VOID;
        }

        assert(false);
        return WasmType.VOID;
    }
}

function getWasmFunctionName(symbol: Symbol): string {
    let moduleName = symbol.kind == SymbolKind.FUNCTION_INSTANCE ? symbol.parent().internalName : "";
    return (moduleName == "" ? "" : moduleName + "_") + symbol.internalName;
}

function wasmWrapType(id: WasmType): WasmWrappedType {
    assert(id == WasmType.VOID || id == WasmType.I32 || id == WasmType.I64 || id == WasmType.F32 || id == WasmType.F64);
    let type = new WasmWrappedType();
    type.id = id;
    return type;
}

function symbolToValueType(symbol: Symbol, bitness?: Bitness): WasmType {
    let type = symbol.resolvedType;
    if (type.isFloat()) {
        return WasmType.F32;
    }
    else if (type.isDouble()) {
        return WasmType.F64;
    }
    else if (type.isInteger() || (bitness == Bitness.x32 && type.pointerTo)) {
        return WasmType.I32;
    }
    else if (type.isLong() || (bitness == Bitness.x64 && type.pointerTo)) {
        return WasmType.I64;
    } else {
        return WasmType.I32;
    }
}

function typeToDataType(type: Type, bitness?: Bitness): string {
    if (type.isFloat()) {
        return "F32";
    }
    else if (type.isDouble()) {
        return "F64";
    }
    else if (type.isInteger() || (bitness == Bitness.x32 && type.pointerTo)) {
        return "I32";
    }
    else if (type.isLong() || (bitness == Bitness.x64 && type.pointerTo)) {
        return "I64";
    }
    else {
        return "I32";
    }
}

function getTypedArrayElementSize(name: string): int32 {
    switch (name) {
        case "Uint8ClampedArray":
        case "Uint8Array":
        case "Int8Array":
            return 1;
        case "Uint16Array":
        case "Int16Array":
            return 2;
        case "Uint32Array":
        case "Int32Array":
        case "Float32Array":
            return 4;
        case "Float64Array":
            return 8;
        default :
            throw "unknown typed array";
    }
}

function wasmAssignLocalVariableOffsets(fn: WasmFunction, node: Node, shared: WasmSharedOffset, bitness: Bitness): void {
    if (node.kind == NodeKind.VARIABLE) {
        assert(node.symbol.kind == SymbolKind.VARIABLE_LOCAL);
        node.symbol.offset = shared.nextLocalOffset;
        shared.nextLocalOffset = shared.nextLocalOffset + 1;
        shared.localCount = shared.localCount + 1;

        let local = new WasmLocal();
        local.symbol = node.symbol;
        local.type = symbolToValueType(local.symbol, bitness);
        if (fn.firstLocal == null) fn.firstLocal = local;
        else fn.lastLocal.next = local;
        fn.lastLocal = local;
        fn.localEntries.push(new WasmLocalEntry(local.type, local.symbol.name));
    }

    let child = node.firstChild;
    while (child != null) {
        wasmAssignLocalVariableOffsets(fn, child, shared, bitness);
        child = child.nextSibling;
    }
}

export function wasmEmit(compiler: Compiler, bitness: Bitness = Bitness.x32): void {
    let module = new WasmModule(bitness);
    module.context = compiler.context;
    module.memoryInitializer = new ByteArray();

    // Set these to invalid values since "0" is valid
    module.startFunctionIndex = -1;
    module.mallocFunctionIndex = -1;
    module.freeFunctionIndex = -1;
    module.currentHeapPointer = -1;
    module.originalHeapPointer = -1;

    // Emission requires two passes
    module.prepareToEmit(compiler.global);
    module.assembler.sealFunctions();

    // The standard library must be included
    // assert(module.mallocFunctionIndex != -1);
    // assert(module.freeFunctionIndex != -1);
    // assert(module.currentHeapPointer != -1);
    // assert(module.originalHeapPointer != -1);

    // module.mallocFunctionIndex += module.importCount;
    // module.freeFunctionIndex += module.importCount;

    compiler.outputWASM = new ByteArray();
    module.emitModule(compiler.outputWASM);
}
