import {Symbol, SymbolKind, isFunction} from "./symbol";
import {ByteArray, ByteArray_append32, ByteArray_set32, ByteArray_setString, ByteArray_set16} from "./bytearray";
import {CheckContext} from "./checker";
import {alignToNextMultipleOf} from "./imports";
import {Node, NodeKind, isExpression, isUnary} from "./node";
import {Type} from "./type";
import {StringBuilder_new, StringBuilder} from "./stringbuilder";
import {Compiler} from "./compiler";
import {WasmOpcode} from "./wasm/opcode";
import {toHex} from "./utils";

const WASM_MAGIC = 0x6d736100; //'\0' | 'a' << 8 | 's' << 16 | 'm' << 24;
const WASM_VERSION = 0x0d;
const WASM_SIZE_IN_PAGES = 1;
const WASM_SET_MAX_MEMORY = false;
const WASM_MAX_MEMORY = 1024 * 1024 * 1024;
const WASM_MEMORY_INITIALIZER_BASE = 8; // Leave space for "null"

const debug: boolean = true;

enum Bitness{
    x32,
    x64
}

enum WasmType {
    VOID = 0,
    I32 = 0x7f,
    I64 = 0x7e,
    F32 = 0x7d,
    F64 = 0x7c,
    anyfunc = 0x70,
    func = 0x60,
    block_type = 0x40, //pseudo type for representing an empty block_type
}

enum WasmSection {
    Type = 1, //Function signature declarations
    Import = 2, //Import declarations
    Function = 3, //Function declarations
    Table = 4, //Indirect function table and other tables
    Memory = 5, //Memory attributes
    Global = 6, //Global declarations
    Export = 7, //Exports
    Start = 8, //Start function declaration
    Element = 9, //Elements section
    Code = 10, //Function bodies (code)
    Data = 11, //Data segments
}

enum WasmExternalKind {
    Function = 0,
    Table = 1,
    Memory = 2,
    Global = 3,
}

class WasmWrappedType {
    id: WasmType;
    next: WasmWrappedType;
}

class WasmSignature {
    argumentTypes: WasmWrappedType;
    returnType: WasmWrappedType;
    next: WasmSignature;
}
class SectionBuffer {

    data: ByteArray;
    offset: number;

    constructor(public id, public name?: string) {
        this.data = new ByteArray();
    }

    publish(array: ByteArray) {
        log(array, 0, this.id, "section code");
        array.writeUnsignedLEB128(this.id);//section code
        log(array, 0, this.data.length, "section size");
        array.writeUnsignedLEB128(this.data.length);//size of this section in bytes
        if (this.id == 0) {
            array.writeWasmString(this.name);
        }
        array.log += this.data.log;
        array.copy(this.data);
    }
}

function wasmAreSignaturesEqual(a: WasmSignature, b: WasmSignature): boolean {
    assert(a.returnType != null);
    assert(b.returnType != null);
    assert(a.returnType.next == null);
    assert(b.returnType.next == null);

    let x = a.argumentTypes;
    let y = b.argumentTypes;

    while (x != null && y != null) {
        if (x.id != y.id) {
            return false;
        }

        x = x.next;
        y = y.next;
    }

    if (x != null || y != null) {
        return false;
    }

    if (a.returnType.id != b.returnType.id) {
        return false;
    }

    return true;
}

class WasmGlobal {
    symbol: Symbol;
    next: WasmGlobal;
}

class WasmLocal {
    symbol: Symbol;
    next: WasmLocal;
}

class WasmFunction {
    symbol: Symbol;
    signatureIndex: int32;
    isExported: boolean;
    firstLocal: WasmLocal;
    lastLocal: WasmLocal;
    localCount: int32 = 0;
    next: WasmFunction;
}

class WasmImport {
    signatureIndex: int32;
    module: string;
    name: string;
    next: WasmImport;
}

class WasmModule {

    firstImport: WasmImport;
    lastImport: WasmImport;
    importCount: int32 = 0;
    globalCount: int32 = 0;
    firstGlobal: WasmGlobal;
    lastGlobal: WasmGlobal;

    firstFunction: WasmFunction;
    lastFunction: WasmFunction;
    functionCount: int32 = 0;

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

    constructor(public bitness: Bitness) {

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
        result.module = mod;
        result.name = name;

        if (this.firstImport == null) this.firstImport = result;
        else this.lastImport.next = result;
        this.lastImport = result;

        this.importCount = this.importCount + 1;
        return result;
    }

    allocateGlobal(symbol: Symbol): WasmGlobal {
        let global = new WasmGlobal();
        global.symbol = symbol;
        symbol.offset = this.globalCount;

        if (this.firstGlobal == null) this.firstGlobal = global;
        else this.lastGlobal.next = global;
        this.lastGlobal = global;

        this.globalCount = this.globalCount + 1;
        return global;
    }

    allocateFunction(symbol: Symbol, signatureIndex: int32): WasmFunction {
        let fn = new WasmFunction();
        fn.symbol = symbol;
        fn.signatureIndex = signatureIndex;

        if (this.firstFunction == null) this.firstFunction = fn;
        else this.lastFunction.next = fn;
        this.lastFunction = fn;

        this.functionCount = this.functionCount + 1;
        return fn;
    }

    allocateSignature(argumentTypes: WasmWrappedType, returnType: WasmWrappedType): int32 {
        assert(returnType != null);
        assert(returnType.next == null);

        let signature = new WasmSignature();
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

        if (this.firstSignature == null) this.firstSignature = signature;
        else this.lastSignature.next = signature;
        this.lastSignature = signature;

        this.signatureCount = this.signatureCount + 1;
        return i;
    }

    emitModule(array: ByteArray): void {
        array.log = "";
        array.writeUnsignedInt(WASM_MAGIC);
        array.writeUnsignedInt(WASM_VERSION);
        array.log += '0000000: 0061 736d             ; WASM_BINARY_MAGIC\n';
        array.log += '0000004: 0d00 0000             ; WASM_BINARY_VERSION\n';

        this.emitSignatures(array);
        this.emitImportTable(array);
        this.emitFunctionDeclarations(array);
        // this.emitTables(array);
        this.emitMemory(array);
        // this.emitGlobalDeclarations(array); // Since global variables are immutable in MVP, avoiding it for now.
        this.emitExportTable(array);
        this.emitStartFunctionDeclaration(array);
        this.emitElements(array);
        this.emitFunctionBodies(array);
        this.emitDataSegments(array);
        // this.emitNames(array);
    }

    emitSignatures(array: ByteArray): void {

        if (!this.firstSignature) {
            return;
        }

        let section = wasmStartSection(array, WasmSection.Type, "signatures");
        section.data.writeUnsignedLEB128(this.signatureCount);

        let signature = this.firstSignature;
        while (signature != null) {
            let count = 0;
            let type = signature.argumentTypes;

            while (type != null) {
                count = count + 1;
                type = type.next;
            }

            log(section.data, array.position, WasmType.func, "func");
            section.data.writeUnsignedLEB128(WasmType.func); //form, the value for the func type constructor
            log(section.data, array.position, count, "num params");
            section.data.writeUnsignedLEB128(count); //param_count, the number of parameters to the function
            type = signature.argumentTypes;
            while (type != null) {
                log(section.data, array.position, type.id, WasmType[type.id]);
                section.data.writeUnsignedLEB128(type.id); //value_type, the parameter types of the function
                type = type.next;
            }
            let returnTypeId = signature.returnType.id;
            if (returnTypeId > 0) {
                log(section.data, array.position, "01", "num results");
                section.data.writeUnsignedLEB128(1); //return_count, the number of results from the function
                log(section.data, array.position, signature.returnType.id, WasmType[signature.returnType.id]);
                section.data.writeUnsignedLEB128(signature.returnType.id);
            } else {
                section.data.writeUnsignedLEB128(0);
            }

            signature = signature.next;
        }

        wasmFinishSection(array, section);
    }

    emitImportTable(array: ByteArray): void {
        if (!this.firstImport) {
            return;
        }

        let section = wasmStartSection(array, WasmSection.Import, "import_table");
        log(section.data, array.position, this.importCount, "num imports");
        array.writeUnsignedLEB128(this.importCount);

        let current = this.firstImport;
        while (current != null) {
            log(section.data, array.position, null, `import ${current.module} ${current.name}`);
            array.writeWasmString(current.module);
            array.writeWasmString(current.name);
            array.writeUnsignedLEB128(WasmType.anyfunc);
            array.writeUnsignedLEB128(current.signatureIndex);
            current = current.next;
        }

        wasmFinishSection(array, section);
    }

    emitFunctionDeclarations(array: ByteArray): void {
        if (!this.firstFunction) {
            return;
        }

        let section = wasmStartSection(array, WasmSection.Function, "function_declarations");
        log(section.data, array.position, this.functionCount, "num functions");
        section.data.writeUnsignedLEB128(this.functionCount);

        let fn = this.firstFunction;
        let count = 0;
        while (fn != null) {
            log(section.data, array.position, fn.signatureIndex, `func ${count} signature index`);
            section.data.writeUnsignedLEB128(fn.signatureIndex);
            fn = fn.next;
            count++;
        }

        wasmFinishSection(array, section);
    }

    emitTables(array: ByteArray): void {
        //TODO
    }

    emitMemory(array: ByteArray): void {
        let section = wasmStartSection(array, WasmSection.Memory, "memory");
        log(section.data, array.position, "01", "num memories");
        section.data.writeUnsignedLEB128(1); //indicating the number of memories defined by the module, In the MVP, the number of memories must be no more than 1.
        //resizable_limits
        log(section.data, array.position, "00", "memory flags");
        section.data.writeUnsignedLEB128(WASM_SET_MAX_MEMORY ? 0x1 : 0); //flags, bit 0x1 is set if the maximum field is present
        log(section.data, array.position, WASM_SIZE_IN_PAGES, "memory initial pages");
        section.data.writeUnsignedLEB128(WASM_SIZE_IN_PAGES); //initial length (in units of table elements or wasm pages)
        if (WASM_SET_MAX_MEMORY) {
            log(section.data, array.position, WASM_MAX_MEMORY, "maximum memory");
            section.data.writeUnsignedLEB128(WASM_MAX_MEMORY);// maximum, only present if specified by flags
        }
        wasmFinishSection(array, section);
    }

    emitGlobalDeclarations(array: ByteArray): void {

        if (!this.firstGlobal) {
            return;
        }

        let section = wasmStartSection(array, WasmSection.Global, "global");
        section.data.writeUnsignedLEB128(this.globalCount);

        let global = this.firstGlobal;
        while (global) {
            let dataType: string = typeToDataType(global.symbol.resolvedType, this.bitness);
            let value = global.symbol.node.variableValue();
            // if(value.resolvedType != global.symbol.resolvedType){
            //     value.becomeTypeOf();
            // }
            section.data.append(WasmType[dataType]); //content_type
            section.data.writeUnsignedLEB128(0); //mutability, 0 if immutable, 1 if mutable. MVP only support immutable global variables
            if (value) {
                if (value.rawValue) {
                    section.data.writeUnsignedLEB128(WasmOpcode[`${dataType}_CONST`]);
                    switch (dataType) {
                        case "I32":
                            section.data.writeUnsignedLEB128(value.rawValue);
                            break;
                        case "F32":
                            section.data.writeFloat(value.rawValue);
                            break;
                        case "F64":
                            section.data.writeDouble(value.rawValue);
                            break;
                    } //const value
                } else {
                    this.emitNode(section.data, array.position, value); //const value
                }
            } else {
                section.data.writeUnsignedLEB128(WasmOpcode[`${dataType}_CONST`]);
                section.data.writeUnsignedLEB128(0); //const value
            }
            section.data.writeUnsignedLEB128(WasmOpcode.END);
            global = global.next;
        }

        wasmFinishSection(array, section);
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

        let section = wasmStartSection(array, WasmSection.Export, "export_table");
        log(section.data, array.position, exportedCount, "num exports");
        section.data.writeUnsignedLEB128(exportedCount + 1);

        //Export main memory
        let memoryName: string = "memory";
        log(section.data, array.position, memoryName.length, "export name length");
        log(section.data, null, null, `${toHex(section.data.position + array.position + 4)}: ${memoryName} // export name`);
        section.data.writeWasmString(memoryName);
        log(section.data, array.position, WasmExternalKind.Function, "export kind");
        section.data.writeUnsignedLEB128(WasmExternalKind.Memory);
        log(section.data, array.position, 0, "export memory index");
        section.data.writeUnsignedLEB128(0);

        let i = 0;
        fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                log(section.data, array.position, fn.symbol.name.length, "export name length");
                log(section.data, null, null, `${toHex(section.data.position + array.position + 4)}: ${fn.symbol.name} // export name`);
                section.data.writeWasmString(fn.symbol.name);
                log(section.data, array.position, WasmExternalKind.Function, "export kind");
                section.data.writeUnsignedLEB128(WasmExternalKind.Function);
                log(section.data, array.position, i, "export func index");
                section.data.writeUnsignedLEB128(i);
            }
            fn = fn.next;
            i = i + 1;
        }

        wasmFinishSection(array, section);
    }

    emitStartFunctionDeclaration(array: ByteArray): void {
        if (this.startFunctionIndex != -1) {
            let section = wasmStartSection(array, WasmSection.Start, "start_function");
            log(section.data, array.position, this.startFunctionIndex, "start function index");
            section.data.writeUnsignedLEB128(this.startFunctionIndex);
            wasmFinishSection(array, section);
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
        let section = wasmStartSection(array, WasmSection.Code, "function_bodies");
        log(section.data, offset, this.functionCount, "num functions");
        section.data.writeUnsignedLEB128(this.functionCount);
        let count = 0;
        let fn = this.firstFunction;
        while (fn != null) {
            let sectionOffset = offset + section.data.position;
            let bodyData: ByteArray = new ByteArray();
            log(bodyData, sectionOffset, fn.localCount ? fn.localCount : 0, "local count");
            if (fn.localCount > 0) {
                bodyData.writeUnsignedLEB128(fn.localCount); //local_count
                //let localBlock = new ByteArray(); TODO: Optimize local declarations
                //local_entry
                let local = fn.firstLocal;
                while (local) {
                    log(bodyData, sectionOffset, 1, "local index");
                    bodyData.writeUnsignedLEB128(1); //count
                    let wasmType: WasmType = symbolToValueType(local.symbol, this.bitness);
                    log(bodyData, sectionOffset, wasmType, WasmType[wasmType]);
                    bodyData.append(wasmType); //value_type
                    local = local.next;
                }

            } else {
                bodyData.writeUnsignedLEB128(0);
            }

            let child = fn.symbol.node.functionBody().firstChild;
            while (child != null) {
                this.emitNode(bodyData, sectionOffset, child);
                child = child.nextSibling;
            }

            appendOpcode(bodyData, sectionOffset, WasmOpcode.END); //end, 0x0b, indicating the end of the body

            //Copy and finish body
            section.data.writeUnsignedLEB128(bodyData.length);
            log(section.data, offset, null, ` - function body ${count++} (${fn.symbol.name})`);
            log(section.data, offset, bodyData.length, "func body size");
            section.data.log += bodyData.log;
            section.data.copy(bodyData);

            fn = fn.next;
        }

        wasmFinishSection(array, section);
    }

    emitDataSegments(array: ByteArray): void {
        this.growMemoryInitializer();
        let memoryInitializer = this.memoryInitializer;
        let initializerLength = memoryInitializer.length;
        let initialHeapPointer = alignToNextMultipleOf(WASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);

        // Pass the initial heap pointer to the "malloc" function
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.originalHeapPointer);
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.currentHeapPointer);

        let section = wasmStartSection(array, WasmSection.Data, "data_segments");

        // This only writes one single section containing everything
        log(section.data, array.position, 1, "num data segments");
        section.data.writeUnsignedLEB128(1);

        //data_segment
        log(section.data, array.position, null, " - data segment header 0");
        log(section.data, array.position, 0, "memory index");
        section.data.writeUnsignedLEB128(0); //index, the linear memory index (0 in the MVP)

        //offset, an i32 initializer expression that computes the offset at which to place the data
        //FIXME: This could be wrong
        appendOpcode(section.data, array.position, WasmOpcode.I32_CONST);
        log(section.data, array.position, WASM_MEMORY_INITIALIZER_BASE, "i32 literal");
        section.data.writeUnsignedLEB128(WASM_MEMORY_INITIALIZER_BASE); //const value
        appendOpcode(section.data, array.position, WasmOpcode.END);

        log(section.data, array.position, initializerLength, "data segment size");
        section.data.writeUnsignedLEB128(initializerLength); //size, size of data (in bytes)

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

        wasmFinishSection(array, section);
    }

    emitNames(array: ByteArray): void {
        let section = wasmStartSection(array, 0, "names");
        array.writeUnsignedLEB128(this.functionCount);

        let fn = this.firstFunction;
        while (fn != null) {
            let name = fn.symbol.name;
            if (fn.symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
                name = StringBuilder_new()
                    .append(fn.symbol.parent().name)
                    .appendChar('.')
                    .append(name)
                    .finish();
            }
            array.writeWasmString(name);
            array.writeUnsignedLEB128(0); // No local variables for now
            fn = fn.next;
        }

        wasmFinishSection(array, section);
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

            if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                let sizeOf = symbol.resolvedType.variableSizeOf(this.context);
                let value = symbol.node.variableValue();
                let memoryInitializer = this.memoryInitializer;

                // Copy the initial value into the memory initializer
                this.growMemoryInitializer();

                let offset = symbol.offset;
                // let offset = this.context.allocateGlobalVariableOffset(sizeOf, symbol.resolvedType.allocationAlignmentOf(this.context));
                // symbol.byteOffset = offset;

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
                else assert(false);

                //let global = this.allocateGlobal(symbol);// Since

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

        else if (node.kind == NodeKind.FUNCTION) {

            let returnType = node.functionReturnType();
            let shared = new WasmSharedOffset();
            let argumentTypesFirst: WasmWrappedType = null;
            let argumentTypesLast: WasmWrappedType = null;

            // Make sure to include the implicit "this" variable as a normal argument
            let argument = node.functionFirstArgument();
            while (argument != returnType) {
                let type = wasmWrapType(this.getWasmType(argument.variableType().resolvedType));

                if (argumentTypesFirst == null) argumentTypesFirst = type;
                else argumentTypesLast.next = type;
                argumentTypesLast = type;

                shared.nextLocalOffset = shared.nextLocalOffset + 1;
                argument = argument.nextSibling;
            }
            let signatureIndex = this.allocateSignature(argumentTypesFirst, wasmWrapType(this.getWasmType(returnType.resolvedType)));
            let body = node.functionBody();
            let symbol = node.symbol;

            // Functions without bodies are imports
            if (body == null) {
                let moduleName = symbol.kind == SymbolKind.FUNCTION_INSTANCE ? symbol.parent().name : "global";
                symbol.offset = this.importCount;
                this.allocateImport(signatureIndex, moduleName, symbol.name);
                node = node.nextSibling;
                return;
            }

            symbol.offset = this.functionCount;
            let fn = this.allocateFunction(symbol, signatureIndex);

            // Make sure "malloc" is tracked
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.name == "malloc") {
                assert(this.mallocFunctionIndex == -1);
                this.mallocFunctionIndex = symbol.offset;
            }
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.name == "free") {
                assert(this.freeFunctionIndex == -1);
                this.freeFunctionIndex = symbol.offset;
            }

            // Make "init_malloc" as start function
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.name == "init_malloc") {
                assert(this.startFunctionIndex == -1);
                this.startFunctionIndex = symbol.offset;
            }

            if (node.isExport()) {
                fn.isExported = true;
            }

            // Assign local variable offsets
            wasmAssignLocalVariableOffsets(fn, body, shared);
            fn.localCount = shared.localCount;
        }

        let child = node.firstChild;
        while (child != null) {
            this.prepareToEmit(child);
            child = child.nextSibling;
        }
    }

    emitBinaryExpression(array: ByteArray, byteOffset: int32, node: Node, opcode: byte): void {
        this.emitNode(array, byteOffset, node.binaryLeft());
        this.emitNode(array, byteOffset, node.binaryRight());
        appendOpcode(array, byteOffset, opcode);
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
            appendOpcode(array, byteOffset, opcode);
            log(array, byteOffset, 0, "i32 literal");
            array.writeUnsignedLEB128(0);
        }

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            opcode = type.isUnsigned() ? WasmOpcode.I32_LOAD8_U : WasmOpcode.I32_LOAD8_S;
            appendOpcode(array, byteOffset, opcode);
            log(array, byteOffset, 0, "alignment");
            array.writeUnsignedLEB128(0);
        }

        else if (sizeOf == 2) {
            opcode = type.isUnsigned() ? WasmOpcode.I32_LOAD16_U : WasmOpcode.I32_LOAD16_S;
            appendOpcode(array, byteOffset, opcode);
            log(array, byteOffset, 1, "alignment");
            array.writeUnsignedLEB128(1);
        }

        else if (sizeOf == 4) {

            if (type.isFloat()) {
                appendOpcode(array, byteOffset, WasmOpcode.F32_LOAD);
            }

            else {
                appendOpcode(array, byteOffset, WasmOpcode.I32_LOAD);
            }
            log(array, byteOffset, 2, "alignment");
            array.writeUnsignedLEB128(2);
        }

        else if (sizeOf == 8) {

            if (type.isDouble()) {
                appendOpcode(array, byteOffset, WasmOpcode.F64_LOAD);
            }

            else {
                appendOpcode(array, byteOffset, WasmOpcode.I64_LOAD);
            }
            log(array, byteOffset, 3, "alignment");
            array.writeUnsignedLEB128(3);
        }

        else {
            assert(false);
        }

        log(array, byteOffset, offset, "load offset");
        array.writeUnsignedLEB128(offset);

    }

    emitStoreToMemory(array: ByteArray, byteOffset: int32, type: Type, relativeBase: Node, offset: int32, value: Node): void {
        let opcode;
        // Relative address
        if (relativeBase != null) {
            this.emitNode(array, byteOffset, relativeBase);
        }
        // Absolute address
        else {
            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            log(array, byteOffset, 0, "i32 literal");
            array.writeUnsignedLEB128(0);
        }

        this.emitNode(array, byteOffset, value);

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            appendOpcode(array, byteOffset, WasmOpcode.I32_STORE8);
            log(array, byteOffset, 0, "alignment");
            array.writeUnsignedLEB128(0);
        }

        else if (sizeOf == 2) {
            appendOpcode(array, byteOffset, WasmOpcode.I32_STORE16);
            log(array, byteOffset, 1, "alignment");
            array.writeUnsignedLEB128(1);
        }

        else if (sizeOf == 4) {

            if (type.isFloat()) {
                appendOpcode(array, byteOffset, WasmOpcode.F32_STORE);
            }

            else {
                appendOpcode(array, byteOffset, WasmOpcode.I32_STORE);
            }
            log(array, byteOffset, 2, "alignment");
            array.writeUnsignedLEB128(2);
        }

        else if (sizeOf == 8) {

            if (type.isDouble()) {
                appendOpcode(array, byteOffset, WasmOpcode.F64_STORE);
            }

            else {
                appendOpcode(array, byteOffset, WasmOpcode.I64_STORE);
            }
            log(array, byteOffset, 3, "alignment");
            array.writeUnsignedLEB128(3);
        }

        else {
            assert(false);
        }

        log(array, byteOffset, offset, "load offset");
        array.writeUnsignedLEB128(offset);
    }

    emitConstructor(array: ByteArray, byteOffset: int32, node: Node): void {
        let constructorNode = node.constructorNode();
        let callSymbol = constructorNode.symbol;
        let child = node.firstChild.nextSibling;
        while (child != null) {
            this.emitNode(array, byteOffset, child);
            child = child.nextSibling;
        }
        appendOpcode(array, byteOffset, WasmOpcode.CALL);
        log(array, byteOffset, callSymbol.offset, `call func index (${callSymbol.offset})`);
        array.writeUnsignedLEB128(callSymbol.offset);
    }

    emitNode(array: ByteArray, byteOffset: int32, node: Node): int32 {
        assert(!isExpression(node) || node.resolvedType != null);
        if (node.kind == NodeKind.BLOCK) {
            appendOpcode(array, byteOffset, WasmOpcode.BLOCK);

            log(array, byteOffset, WasmType.block_type, WasmType[WasmType.block_type]);
            array.append(WasmType.block_type);

            let child = node.firstChild;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }

            appendOpcode(array, byteOffset, WasmOpcode.END);
        }

        else if (node.kind == NodeKind.WHILE) {
            let value = node.whileValue();
            let body = node.whileBody();

            // Ignore "while (false) { ... }"
            if (value.kind == NodeKind.BOOLEAN && value.intValue == 0) {
                return 0;
            }

            appendOpcode(array, byteOffset, WasmOpcode.BLOCK);
            log(array, 0, WasmType.block_type, WasmType[WasmType.block_type]);
            array.append(WasmType.block_type);
            appendOpcode(array, byteOffset, WasmOpcode.LOOP);
            log(array, 0, WasmType.block_type, WasmType[WasmType.block_type]);
            array.append(WasmType.block_type);

            if (value.kind != NodeKind.BOOLEAN) {
                this.emitNode(array, byteOffset, value);
                appendOpcode(array, byteOffset, WasmOpcode.I32_EQZ);
                appendOpcode(array, byteOffset, WasmOpcode.BR_IF);
                array.writeUnsignedLEB128(1); // Break out of the immediately enclosing loop
            }

            let child = body.firstChild;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }

            // Jump back to the top (this doesn't happen automatically)
            appendOpcode(array, byteOffset, WasmOpcode.BR);
            array.writeUnsignedLEB128(0); // Continue back to the immediately enclosing loop

            appendOpcode(array, byteOffset, WasmOpcode.END);
            appendOpcode(array, byteOffset, WasmOpcode.END);
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
            appendOpcode(array, byteOffset, WasmOpcode.BR);
            array.writeUnsignedLEB128(label - (node.kind == NodeKind.BREAK ? 0 : 1));
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

                if (value.kind == NodeKind.NEW) {
                    this.emitConstructor(array, byteOffset, value);
                }
            }
            appendOpcode(array, byteOffset, WasmOpcode.RETURN);
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
            appendOpcode(array, byteOffset, WasmOpcode.IF);
            append(array, 0, WasmType.block_type, WasmType[WasmType.block_type]);

            this.emitNode(array, byteOffset, node.ifTrue());

            if (branch != null) {
                appendOpcode(array, byteOffset, WasmOpcode.IF_ELSE);
                this.emitNode(array, byteOffset, branch);
            }
            appendOpcode(array, byteOffset, WasmOpcode.END);
        }

        else if (node.kind == NodeKind.HOOK) {
            this.emitNode(array, byteOffset, node.hookValue());
            appendOpcode(array, byteOffset, WasmOpcode.IF);
            let trueValue = node.hookTrue();
            let trueValueType = symbolToValueType(trueValue.resolvedType.symbol);
            append(array, 0, trueValueType, WasmType[trueValueType]);
            this.emitNode(array, byteOffset, trueValue);
            appendOpcode(array, byteOffset, WasmOpcode.IF_ELSE);
            this.emitNode(array, byteOffset, node.hookFalse());
            appendOpcode(array, byteOffset, WasmOpcode.END);
        }

        else if (node.kind == NodeKind.VARIABLE) {
            let value = node.variableValue();

            if (node.symbol.kind == SymbolKind.VARIABLE_LOCAL) {

                if (value && value.kind != NodeKind.NAME && value.rawValue) {
                    if (node.symbol.resolvedType.isFloat()) {
                        appendOpcode(array, byteOffset, WasmOpcode.F32_CONST);
                        log(array, byteOffset, value.floatValue, "f32 literal");
                        array.writeFloat(value.floatValue);
                    } else {
                        appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                        log(array, byteOffset, value.intValue, "i32 literal");
                        array.writeUnsignedLEB128(value.intValue);
                    }

                } else {
                    if (value != null) {
                        this.emitNode(array, byteOffset, value);
                    } else {
                        // Default value
                        if (node.symbol.resolvedType.isFloat()) {
                            appendOpcode(array, byteOffset, WasmOpcode.F32_CONST);
                            log(array, byteOffset, 0, "f32 literal");
                            array.writeFloat(0);
                        } else {
                            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                            log(array, byteOffset, 0, "i32 literal");
                            array.writeUnsignedLEB128(0);
                        }
                    }
                }

                if (value.kind == NodeKind.NEW) {
                    this.emitConstructor(array, byteOffset, value);
                }

                appendOpcode(array, byteOffset, WasmOpcode.SET_LOCAL);
                log(array, byteOffset, node.symbol.offset, "local index");
                array.writeUnsignedLEB128(node.symbol.offset);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.NAME) {
            let symbol = node.symbol;

            if (symbol.kind == SymbolKind.VARIABLE_ARGUMENT || symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                appendOpcode(array, byteOffset, WasmOpcode.GET_LOCAL);
                log(array, byteOffset, symbol.offset, "local index");
                array.writeUnsignedLEB128(symbol.offset);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                //Global variables are immutable so we need to store then in memory
                //appendOpcode(array, byteOffset, WasmOpcode.GET_GLOBAL);
                //array.writeUnsignedLEB128(symbol.offset);
                this.emitLoadFromMemory(array, byteOffset, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.DEREFERENCE) {
            this.emitLoadFromMemory(array, byteOffset, node.resolvedType.underlyingType(this.context), node.unaryValue(), 0);
        }

        else if (node.kind == NodeKind.NULL) {
            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            log(array, byteOffset, 0, "i32 literal");
            array.writeLEB128(0);
        }

        else if (node.kind == NodeKind.INT32 || node.kind == NodeKind.BOOLEAN) {
            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            log(array, byteOffset, node.intValue, "i32 literal");
            array.writeLEB128(node.intValue);
        }

        else if (node.kind == NodeKind.INT64) {
            appendOpcode(array, byteOffset, WasmOpcode.I64_CONST);
            log(array, byteOffset, node.longValue, "i64 literal");
            array.writeLEB128(node.longValue);
        }

        else if (node.kind == NodeKind.FLOAT32) {
            appendOpcode(array, byteOffset, WasmOpcode.F32_CONST);
            log(array, byteOffset, node.floatValue, "f32 literal");
            array.writeFloat(node.floatValue);
        }

        else if (node.kind == NodeKind.FLOAT64) {
            appendOpcode(array, byteOffset, WasmOpcode.F64_CONST);
            log(array, byteOffset, node.doubleValue, "f64 literal");
            array.writeDouble(node.doubleValue);
        }

        else if (node.kind == NodeKind.STRING) {
            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            let value = WASM_MEMORY_INITIALIZER_BASE + node.intValue;
            log(array, byteOffset, value, "i32 literal");
            array.writeLEB128(value);
        }

        else if (node.kind == NodeKind.CALL) {
            let value = node.callValue();
            let symbol = value.symbol;
            assert(isFunction(symbol.kind));

            // Write out the implicit "this" argument
            if (symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
                this.emitNode(array, byteOffset, value.dotTarget());
            }

            let child = value.nextSibling;
            while (child != null) {
                this.emitNode(array, byteOffset, child);
                child = child.nextSibling;
            }

            appendOpcode(array, byteOffset, WasmOpcode.CALL);
            log(array, byteOffset, symbol.offset, `call func index (${symbol.offset})`);
            array.writeUnsignedLEB128(symbol.offset);
        }

        else if (node.kind == NodeKind.NEW) {
            let type = node.newType();
            let size = type.resolvedType.allocationSizeOf(this.context);
            assert(size > 0);
            // Pass the object size as the first argument
            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            log(array, byteOffset, size, "i32 literal");
            array.writeLEB128(size);

            appendOpcode(array, byteOffset, WasmOpcode.CALL);
            log(array, byteOffset, this.mallocFunctionIndex, `call func index (${this.mallocFunctionIndex})`);
            array.writeUnsignedLEB128(this.mallocFunctionIndex);
        }

        else if (node.kind == NodeKind.DELETE) {
            let value = node.deleteValue();

            this.emitNode(array, byteOffset, value);

            appendOpcode(array, byteOffset, WasmOpcode.CALL);
            log(array, byteOffset, this.freeFunctionIndex, `call func index (${this.freeFunctionIndex})`);
            array.writeUnsignedLEB128(this.freeFunctionIndex);
        }

        else if (node.kind == NodeKind.POSITIVE) {
            this.emitNode(array, byteOffset, node.unaryValue());
        }

        else if (node.kind == NodeKind.NEGATIVE) {
            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            log(array, byteOffset, 0, "i32 literal");
            array.writeLEB128(0);
            this.emitNode(array, byteOffset, node.unaryValue());
            appendOpcode(array, byteOffset, WasmOpcode.I32_SUB);
        }

        else if (node.kind == NodeKind.COMPLEMENT) {
            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            log(array, byteOffset, ~0, "i32 literal");
            array.writeLEB128(~0);
            this.emitNode(array, byteOffset, node.unaryValue());
            appendOpcode(array, byteOffset, WasmOpcode.I32_XOR);
        }

        else if (node.kind == NodeKind.NOT) {
            this.emitNode(array, byteOffset, node.unaryValue());
            appendOpcode(array, byteOffset, WasmOpcode.I32_EQZ);
        }

        else if (node.kind == NodeKind.CAST) {
            let value = node.castValue();
            let context = this.context;
            let from = value.resolvedType.underlyingType(context);
            let type = node.resolvedType.underlyingType(context);
            let fromSize = from.variableSizeOf(context);
            let typeSize = type.variableSizeOf(context);

            // The cast isn't needed if it's to a wider integer type
            if (from == type || fromSize < typeSize) {
                this.emitNode(array, byteOffset, value);
            }

            else {
                // Sign-extend
                if (type == context.sbyteType || type == context.shortType) {
                    let shift = 32 - typeSize * 8;
                    appendOpcode(array, byteOffset, WasmOpcode.I32_SHR_S);
                    appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
                    this.emitNode(array, byteOffset, value);
                    appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                    log(array, byteOffset, shift, "i32 literal");
                    array.writeLEB128(shift);
                    appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                    log(array, byteOffset, shift, "i32 literal");
                    array.writeLEB128(shift);
                }

                // Mask
                else if (type == context.byteType || type == context.ushortType) {
                    this.emitNode(array, byteOffset, value);
                    appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                    let _value = type.integerBitMask(this.context);
                    log(array, byteOffset, _value, "i32 literal");
                    array.writeLEB128(_value);
                    appendOpcode(array, byteOffset, WasmOpcode.I32_AND);
                }

                // i32 > f32
                else if (from == context.int32Type && type == context.float32Type) {
                    //TODO implement
                    this.emitNode(array, byteOffset, value);
                }

                // f32 > i32
                else if (from == context.float32Type && type == context.int32Type) {
                    //TODO implement
                    this.emitNode(array, byteOffset, value);
                }

                // No cast needed
                else {
                    this.emitNode(array, byteOffset, value);
                }
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

            else if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitStoreToMemory(array, byteOffset, symbol.resolvedType, left.dotTarget(), symbol.offset, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                //Global variables are immutable in MVP so we need to store them in memory
                // this.emitNode(array, byteOffset, right);
                // appendOpcode(array, byteOffset, WasmOpcode.SET_GLOBAL);
                // array.writeUnsignedLEB128(symbol.offset);
                this.emitStoreToMemory(array, byteOffset, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_ARGUMENT || symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                this.emitNode(array, byteOffset, right);
                appendOpcode(array, byteOffset, WasmOpcode.SET_LOCAL);
                log(array, byteOffset, symbol.offset, "local index");
                array.writeUnsignedLEB128(symbol.offset);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.LOGICAL_AND) {
            this.emitNode(array, byteOffset, node.binaryLeft());
            this.emitNode(array, byteOffset, node.binaryRight());
            appendOpcode(array, byteOffset, WasmOpcode.I32_AND);
            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            log(array, byteOffset, 1, "i32 literal");
            array.writeLEB128(1);
            appendOpcode(array, byteOffset, WasmOpcode.I32_EQ);
        }

        else if (node.kind == NodeKind.LOGICAL_OR) {
            this.emitNode(array, byteOffset, node.binaryLeft());
            this.emitNode(array, byteOffset, node.binaryRight());
            appendOpcode(array, byteOffset, WasmOpcode.I32_OR);
            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
            log(array, byteOffset, 1, "i32 literal");
            array.writeLEB128(1);
            appendOpcode(array, byteOffset, WasmOpcode.I32_EQ);
        }

        else if (isUnary(node.kind)) {

            let kind = node.kind;

            if (kind == NodeKind.POSTFIX_INCREMENT) {

                let value = node.unaryValue();
                let dataType: string = typeToDataType(value.resolvedType, this.bitness);

                this.emitNode(array, byteOffset, value);

                assert(
                    value.resolvedType.isInteger() || value.resolvedType.isLong() ||
                    value.resolvedType.isFloat() || value.resolvedType.isDouble()
                );
                let size = value.resolvedType.pointerTo.allocationSizeOf(this.context);

                if (size == 1 || size == 2) {
                    if (value.kind == NodeKind.INT32) {
                        appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                        log(array, byteOffset, 1, "i32 literal");
                        array.writeLEB128(1);
                    }

                    else {
                        console.error("Wrong type");
                    }
                }

                else if (size == 4) {
                    if (value.kind == NodeKind.INT32) {
                        appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                        log(array, byteOffset, 1, "i32 literal");
                        array.writeLEB128(1);
                    }

                    else if (value.kind == NodeKind.FLOAT32) {
                        appendOpcode(array, byteOffset, WasmOpcode.F32_CONST);
                        log(array, byteOffset, 1, "f32 literal");
                        array.writeFloat(1);
                    }

                    else {
                        console.error("Wrong type");
                    }
                }

                else if (size == 8) {

                    if (value.kind == NodeKind.INT64) {
                        appendOpcode(array, byteOffset, WasmOpcode.I64_CONST);
                        log(array, byteOffset, 1, "i64 literal");
                        array.writeLEB128(1);
                    }

                    else if (value.kind == NodeKind.FLOAT64) {
                        appendOpcode(array, byteOffset, WasmOpcode.F64_CONST);
                        log(array, byteOffset, 1, "f64 literal");
                        array.writeDouble(1);
                    }

                    else {
                        console.error("Wrong type");
                    }
                }

                // if (value.resolvedType.pointerTo == null) {
                //     this.emitNode(array, byteOffset, value);
                // }

                appendOpcode(array, byteOffset, WasmOpcode[`${dataType}_ADD`]);
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
            //FIXME: This should handle in checker
            if (left.resolvedType.symbol && right.kind != NodeKind.NAME) {
                if (left.resolvedType.symbol.name == "float64") {
                    right.kind = NodeKind.FLOAT64;
                }
                else if (left.resolvedType.symbol.name == "int64") {
                    right.kind = NodeKind.INT64;
                }
            }

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
                            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                            let _value = right.intValue << 1;
                            log(array, byteOffset, _value, "i32 literal");
                            array.writeLEB128(_value);
                        }

                        else {
                            appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
                            this.emitNode(array, byteOffset, right);
                            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                            log(array, byteOffset, 1, "i32 literal");
                            array.writeLEB128(1);
                        }
                    }

                    else if (size == 4) {
                        if (right.kind == NodeKind.INT32) {
                            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                            let _value = right.intValue << 2;
                            log(array, byteOffset, _value, "i32 literal");
                            array.writeLEB128(_value);
                        }

                        else if (right.kind == NodeKind.FLOAT32) {
                            appendOpcode(array, byteOffset, WasmOpcode.F32_CONST);
                            log(array, byteOffset, right.floatValue, "f32 literal");
                            array.writeFloat(right.floatValue);
                        }

                        else {
                            appendOpcode(array, byteOffset, WasmOpcode.I32_SHL);
                            this.emitNode(array, byteOffset, right);
                            appendOpcode(array, byteOffset, WasmOpcode.I32_CONST);
                            log(array, byteOffset, 2, "i32 literal");
                            array.writeLEB128(2);
                        }
                    }

                    else if (size == 8) {

                        if (right.kind == NodeKind.INT64) {
                            appendOpcode(array, byteOffset, WasmOpcode.I64_CONST);
                            log(array, byteOffset, right.longValue, "i64 literal");
                            array.writeLEB128(right.longValue);
                        }

                        else if (right.kind == NodeKind.FLOAT64) {
                            appendOpcode(array, byteOffset, WasmOpcode.F64_CONST);
                            log(array, byteOffset, right.doubleValue, "f64 literal");
                            array.writeDouble(right.doubleValue);
                        }
                    }

                    else {
                        this.emitNode(array, byteOffset, right);
                    }
                }
                appendOpcode(array, byteOffset, WasmOpcode[`${dataTypeLeft}_ADD`]);
            }

            else if (node.kind == NodeKind.BITWISE_AND) {
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_AND`]);
            }

            else if (node.kind == NodeKind.BITWISE_OR) {
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
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_SHL`]);
            }

            else if (node.kind == NodeKind.SUBTRACT) {
                this.emitBinaryExpression(array, byteOffset, node, WasmOpcode[`${dataTypeLeft}_SUB`]);
            }

            else if (node.kind == NodeKind.DIVIDE) {
                this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                    WasmOpcode[`${dataTypeLeft}_DIV_U`] : WasmOpcode[`${dataTypeLeft}_DIV_S`]);
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
                this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                    WasmOpcode[`${dataTypeLeft}_REM_U`] : WasmOpcode[`${dataTypeLeft}_REM_S`]);
            }

            else if (node.kind == NodeKind.SHIFT_RIGHT) {
                this.emitBinaryExpression(array, byteOffset, node, isUnsigned ?
                    WasmOpcode[`${dataTypeLeft}_SHR_U`] : WasmOpcode[`${dataTypeLeft}_SHR_S`]);
            }

            else {
                assert(false);
            }
        }

        return 1;
    }

    getWasmType(type: Type): WasmType {
        let context = this.context;

        if (type == context.booleanType || type.isInteger() || (this.bitness == Bitness.x32 && type.isReference())) {
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

function wasmStartSection(array: ByteArray, id: int32, name: string): SectionBuffer {
    let section: SectionBuffer = new SectionBuffer(id, name);
    section.offset = array.length;
    log(array, 0, null, ` - section: ${WasmSection[id]} [0x${toHex(id, 2)}]`);
    return section;
}

function wasmFinishSection(array: ByteArray, section: SectionBuffer): void {
    section.publish(array);
}

function wasmWrapType(id: WasmType): WasmWrappedType {
    assert(id == WasmType.VOID || id == WasmType.I32 || id == WasmType.I64 || id == WasmType.F32 || id == WasmType.F64);
    let type = new WasmWrappedType();
    type.id = id;
    return type;
}
function symbolToValueType(symbol: Symbol, bitness?: Bitness) {
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
}

class WasmSharedOffset {
    nextLocalOffset: int32 = 0;
    localCount: int32 = 0;
}

function wasmAssignLocalVariableOffsets(fn: WasmFunction, node: Node, shared: WasmSharedOffset): void {
    if (node.kind == NodeKind.VARIABLE) {
        assert(node.symbol.kind == SymbolKind.VARIABLE_LOCAL);
        node.symbol.offset = shared.nextLocalOffset;
        shared.nextLocalOffset = shared.nextLocalOffset + 1;
        shared.localCount = shared.localCount + 1;

        let local = new WasmLocal();
        local.symbol = node.symbol;
        if (fn.firstLocal == null) fn.firstLocal = local;
        else fn.lastLocal.next = local;
        fn.lastLocal = local;
    }

    let child = node.firstChild;
    while (child != null) {
        wasmAssignLocalVariableOffsets(fn, child, shared);
        child = child.nextSibling;
    }
}
function append(array: ByteArray, offset = 0, value = null, msg = null) {
    if (debug) {
        array.log += (value != null ? `${toHex(offset + array.position)}: ${toHex(value, 2)}                    ; ` : "") + (msg != null ? `${msg}\n` : "\n");
    }
    if (value) {
        array.append(value);
    }
}
function log(array: ByteArray, offset = 0, value = null, msg = null) {
    if (debug) {
        array.log += (value != null ? `${toHex(offset + array.position)}: ${toHex(value, 2)}                    ; ` : "") + (msg != null ? `${msg}\n` : "\n");
    }
}
function logData(array: ByteArray, offset = 0, value, addPosition = true) {
    if (debug) {
        array.log += (addPosition ? `${toHex(offset + array.position)}: ${toHex(value, 2)}` : ` ${toHex(value, 2)}`);
    }
}
function appendOpcode(array: ByteArray, offset = 0, opcode) {
    if (debug) {
        logOpcode(array, offset, opcode);
    }
    array.append(opcode);
}
function logOpcode(array: ByteArray, offset = 0, opcode) {
    if (debug) {
        array.log += `${toHex(offset + array.position)}: ${toHex(opcode, 2)}                    ; ${WasmOpcode[opcode]}\n`;
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

    // The standard library must be included
    // assert(module.mallocFunctionIndex != -1);
    // assert(module.freeFunctionIndex != -1);
    // assert(module.currentHeapPointer != -1);
    // assert(module.originalHeapPointer != -1);

    compiler.outputWASM = new ByteArray();
    module.emitModule(compiler.outputWASM);
}
