import {Symbol, SymbolKind, isFunction} from "./symbol";
import {ByteArray, ByteArray_append32, ByteArray_set32, ByteArray_setString, ByteArray_set16} from "./bytearray";
import {CheckContext} from "./checker";
import {alignToNextMultipleOf} from "./imports";
import {Node, NodeKind, isExpression, isUnary, isCompactNodeKind} from "./node";
import {Type} from "./type";
import {StringBuilder_new, StringBuilder} from "./stringbuilder";
import {Compiler} from "./compiler";
import {AsmOpcode} from "./wasm/opcode";
import {toHex} from "./utils";
import {Precedence} from "./parser";

const ASM_MEMORY_INITIALIZER_BASE = 8; // Leave space for "null"

const debug: boolean = true;

enum AsmType {
    VOID,
    DOUBLE,
    SIGNED,
    UNSIGNED,
    INT,
    FIXNUM,
    INTISH,
    DOUBLE_Q,//double?
    FLOAT,
    FLOATISH,
    EXTERN,
}

enum AsmSection {
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

enum AsmExternalKind {
    Function = 0,
    Table = 1,
    Memory = 2,
    Global = 3,
}

class AsmWrappedType {
    id: AsmType;
    next: AsmWrappedType;
}

class AsmSignature {
    argumentTypes: AsmWrappedType;
    returnType: AsmWrappedType;
    next: AsmSignature;
}
class SectionBuffer {

    data: ByteArray;
    offset: number;

    constructor(public id, public name?: string) {
        this.data = new ByteArray();
    }

    publish(code: StringBuilder) {
        log(code, 0, this.id, "section code");
        array.writeUnsignedLEB128(this.id);//section code
        log(code, 0, this.data.length, "section size");
        array.writeUnsignedLEB128(this.data.length);//size of this section in bytes
        if (this.id == 0) {
            array.writeUTF(this.name);
        }
        array.log += this.data.log;
        array.copy(this.data);
    }
}

function wasmAreSignaturesEqual(a: AsmSignature, b: AsmSignature): boolean {
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

class AsmGlobal {
    symbol: Symbol;
    next: AsmGlobal;
}

class AsmLocal {
    symbol: Symbol;
    next: AsmLocal;
}

class AsmFunction {
    symbol: Symbol;
    signatureIndex: int32;
    isExported: boolean;
    firstLocal: AsmLocal;
    lastLocal: AsmLocal;
    localCount: int32 = 0;
    next: AsmFunction;
}

class AsmImport {
    signatureIndex: int32;
    module: string;
    name: string;
    next: AsmImport;
}

class AsmModule {

    firstImport: AsmImport;
    lastImport: AsmImport;
    importCount: int32 = 0;
    globalCount: int32 = 0;
    firstGlobal: AsmGlobal;
    lastGlobal: AsmGlobal;

    firstFunction: AsmFunction;
    lastFunction: AsmFunction;
    functionCount: int32 = 0;

    firstSignature: AsmSignature;
    lastSignature: AsmSignature;
    signatureCount: int32 = 0;

    memoryInitializer: ByteArray;
    currentHeapPointer: int32;
    originalHeapPointer: int32;
    mallocFunctionIndex: int32;
    freeFunctionIndex: int32;
    startFunctionIndex: int32;
    context: CheckContext;
    previousNode: Node;
    code: StringBuilder;

    constructor() {

    }

    emitNewlineBefore(node: Node): void {
        if (this.previousNode != null && (!isCompactNodeKind(this.previousNode.kind) || !isCompactNodeKind(node.kind))) {
            this.code.append("\n");
        }
        this.previousNode = null;
    }

    emitNewlineAfter(node: Node): void {
        this.previousNode = node;
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

    allocateImport(signatureIndex: int32, mod: string, name: string): AsmImport {
        let result = new AsmImport();
        result.signatureIndex = signatureIndex;
        result.module = mod;
        result.name = name;

        if (this.firstImport == null) this.firstImport = result;
        else this.lastImport.next = result;
        this.lastImport = result;

        this.importCount = this.importCount + 1;
        return result;
    }

    allocateGlobal(symbol: Symbol): AsmGlobal {
        let global = new AsmGlobal();
        global.symbol = symbol;
        symbol.offset = this.globalCount;

        if (this.firstGlobal == null) this.firstGlobal = global;
        else this.lastGlobal.next = global;
        this.lastGlobal = global;

        this.globalCount = this.globalCount + 1;
        return global;
    }

    allocateFunction(symbol: Symbol, signatureIndex: int32): AsmFunction {
        let fn = new AsmFunction();
        fn.symbol = symbol;
        fn.signatureIndex = signatureIndex;

        if (this.firstFunction == null) this.firstFunction = fn;
        else this.lastFunction.next = fn;
        this.lastFunction = fn;

        this.functionCount = this.functionCount + 1;
        return fn;
    }

    allocateSignature(argumentTypes: AsmWrappedType, returnType: AsmWrappedType): int32 {
        assert(returnType != null);
        assert(returnType.next == null);

        let signature = new AsmSignature();
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

    emitModule(): void {

        this.emitGlobalDeclarations(this.code);
        // this.emitTables(array);
        // this.emitSignatures(array);
        // this.emitImportTable(array);
        // this.emitFunctionDeclarations(array);
        // this.emitMemory(array);
        // this.emitExportTable(array);
        // this.emitStartFunctionDeclaration(array);
        // this.emitElements(array);
        // this.emitFunctionBodies(array);
        // this.emitDataSegments(array);
        // this.emitNames(array);
    }

    emitSignatures(code: StringBuilder): void {

        if (!this.firstSignature) {
            return;
        }

        let section = wasmStartSection(code, AsmSection.Type, "signatures");
        section.data.writeUnsignedLEB128(this.signatureCount);

        let signature = this.firstSignature;
        while (signature != null) {
            let count = 0;
            let type = signature.argumentTypes;

            while (type != null) {
                count = count + 1;
                type = type.next;
            }

            log(section.data, array.position, AsmType.func, "func");
            section.data.writeUnsignedLEB128(AsmType.func); //form, the value for the func type constructor
            log(section.data, array.position, count, "num params");
            section.data.writeUnsignedLEB128(count); //param_count, the number of parameters to the function
            type = signature.argumentTypes;
            while (type != null) {
                log(section.data, array.position, type.id, AsmType[type.id]);
                section.data.writeUnsignedLEB128(type.id); //value_type, the parameter types of the function
                type = type.next;
            }
            let returnTypeId = signature.returnType.id;
            if (returnTypeId > 0) {
                log(section.data, array.position, "01", "num results");
                section.data.writeUnsignedLEB128(1); //return_count, the number of results from the function
                log(section.data, array.position, signature.returnType.id, AsmType[signature.returnType.id]);
                section.data.writeUnsignedLEB128(signature.returnType.id);
            } else {
                section.data.writeUnsignedLEB128(0);
            }

            signature = signature.next;
        }

        wasmFinishSection(code, section);
    }

    emitImportTable(code: StringBuilder): void {
        if (!this.firstImport) {
            return;
        }

        let section = wasmStartSection(code, AsmSection.Import, "import_table");
        log(section.data, array.position, this.importCount, "num imports");
        array.writeUnsignedLEB128(this.importCount);

        let current = this.firstImport;
        while (current != null) {
            array.writeUnsignedLEB128(current.signatureIndex);
            array.writeUTF(current.module);
            array.writeUTF(current.name);
            current = current.next;
        }

        wasmFinishSection(code, section);
    }

    emitFunctionDeclarations(code: StringBuilder): void {
        if (!this.firstFunction) {
            return;
        }

        let section = wasmStartSection(code, AsmSection.Function, "function_declarations");
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

        wasmFinishSection(code, section);
    }

    emitTables(code: StringBuilder): void {
        //TODO
    }

    emitMemory(code: StringBuilder): void {
        let section = wasmStartSection(code, AsmSection.Memory, "memory");
        log(section.data, array.position, "01", "num memories");
        section.data.writeUnsignedLEB128(1); //indicating the number of memories defined by the module, In the MVP, the number of memories must be no more than 1.
        //resizable_limits
        log(section.data, array.position, "00", "memory flags");
        section.data.writeUnsignedLEB128(ASM_SET_MAX_MEMORY ? 0x1 : 0); //flags, bit 0x1 is set if the maximum field is present
        log(section.data, array.position, ASM_SIZE_IN_PAGES, "memory initial pages");
        section.data.writeUnsignedLEB128(ASM_SIZE_IN_PAGES); //initial length (in units of table elements or wasm pages)
        if (ASM_SET_MAX_MEMORY) {
            log(section.data, array.position, ASM_MAX_MEMORY, "maximum memory");
            section.data.writeUnsignedLEB128(ASM_MAX_MEMORY);// maximum, only present if specified by flags
        }
        wasmFinishSection(code, section);
    }

    emitGlobalDeclarations(code: StringBuilder): void {

        if (!this.firstGlobal) {
            return;
        }

        let global = this.firstGlobal;
        while (global) {
            let dataType: AsmType = typeToAsmType(global.symbol.resolvedType);
            let value = global.symbol.node.variableValue();

            if (value) {
                if (value.rawValue) {
                    code.append(`var ${global.symbol.name} = `);
                    switch (dataType) {
                        case AsmType.INT:
                            code.append(`${value.rawValue}|0;`);
                            break;
                        case AsmType.FLOAT:
                            code.append(`Math.fround(${value.rawValue});`);
                            break;
                        case AsmType.DOUBLE:
                            code.append(`+${value.rawValue};`);
                            break;
                    } //const value
                } else {
                    this.emitNode(code, value); //const value
                }
            } else {
                section.data.writeUnsignedLEB128(AsmOpcode[`${dataType}_CONST`]);
                section.data.writeUnsignedLEB128(0); //const value
            }
            section.data.writeUnsignedLEB128(AsmOpcode.END);
            global = global.next;
        }

        wasmFinishSection(code, section);
    }

    emitExportTable(code: StringBuilder): void {
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

        let section = wasmStartSection(code, AsmSection.Export, "export_table");
        log(section.data, array.position, exportedCount, "num exports");
        section.data.writeUnsignedLEB128(exportedCount + 1);

        //Export main memory
        let memoryName: string = "memory";
        log(section.data, array.position, memoryName.length, "export name length");
        log(section.data, null, null, `${toHex(section.data.position + array.position + 4)}: ${memoryName} // export name`);
        section.data.writeUTF(memoryName);
        log(section.data, array.position, AsmExternalKind.Function, "export kind");
        section.data.writeUnsignedLEB128(AsmExternalKind.Memory);
        log(section.data, array.position, 0, "export memory index");
        section.data.writeUnsignedLEB128(0);

        let i = 0;
        fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                log(section.data, array.position, fn.symbol.name.length, "export name length");
                log(section.data, null, null, `${toHex(section.data.position + array.position + 4)}: ${fn.symbol.name} // export name`);
                section.data.writeUTF(fn.symbol.name);
                log(section.data, array.position, AsmExternalKind.Function, "export kind");
                section.data.writeUnsignedLEB128(AsmExternalKind.Function);
                log(section.data, array.position, i, "export func index");
                section.data.writeUnsignedLEB128(i);
            }
            fn = fn.next;
            i = i + 1;
        }

        wasmFinishSection(code, section);
    }

    emitStartFunctionDeclaration(code: StringBuilder): void {
        if (this.startFunctionIndex != -1) {
            let section = wasmStartSection(code, AsmSection.Start, "start_function");
            log(section.data, array.position, this.startFunctionIndex, "start function index");
            section.data.writeUnsignedLEB128(this.startFunctionIndex);
            wasmFinishSection(code, section);
        }
    }

    emitElements(code: StringBuilder): void {
        //TODO
    }

    emitFunctionBodies(code: StringBuilder): void {
        if (!this.firstFunction) {
            return;
        }
        let offset = array.position;
        let section = wasmStartSection(code, AsmSection.Code, "function_bodies");
        log(section.data, this.functionCount, "num functions");
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
                    let wasmType: AsmType = symbolToValueType(local.symbol);
                    log(bodyData, sectionOffset, wasmType, AsmType[wasmType]);
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

            appendOpcode(bodyData, sectionOffset, AsmOpcode.END); //end, 0x0b, indicating the end of the body

            //Copy and finish body
            section.data.writeUnsignedLEB128(bodyData.length);
            log(section.data, null, ` - function body ${count++} (${fn.symbol.name})`);
            log(section.data, bodyData.length, "func body size");
            section.data.log += bodyData.log;
            section.data.copy(bodyData);

            fn = fn.next;
        }

        wasmFinishSection(code, section);
    }

    emitDataSegments(code: StringBuilder): void {
        this.growMemoryInitializer();
        let memoryInitializer = this.memoryInitializer;
        let initializerLength = memoryInitializer.length;
        let initialHeapPointer = alignToNextMultipleOf(ASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);

        // Pass the initial heap pointer to the "malloc" function
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.originalHeapPointer);
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.currentHeapPointer);

        let section = wasmStartSection(code, AsmSection.Data, "data_segments");

        // This only writes one single section containing everything
        log(section.data, array.position, 1, "num data segments");
        section.data.writeUnsignedLEB128(1);

        //data_segment
        log(section.data, array.position, null, " - data segment header 0");
        log(section.data, array.position, 0, "memory index");
        section.data.writeUnsignedLEB128(0); //index, the linear memory index (0 in the MVP)

        //an i32 initializer expression that computes the offset at which to place the data
        //FIXME: This could be wrong
        appendOpcode(section.data, array.position, AsmOpcode.I32_CONST);
        log(section.data, array.position, ASM_MEMORY_INITIALIZER_BASE, "i32 literal");
        section.data.writeUnsignedLEB128(ASM_MEMORY_INITIALIZER_BASE); //const value
        appendOpcode(section.data, array.position, AsmOpcode.END);

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

        wasmFinishSection(code, section);
    }

    emitNames(code: StringBuilder): void {
        let section = wasmStartSection(code, 0, "names");
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
            array.writeUTF(name);
            array.writeUnsignedLEB128(0); // No local variables for now
            fn = fn.next;
        }

        wasmFinishSection(code, section);
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
            ByteArray_set32(memoryInitializer, length);
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
            let shared = new AsmSharedOffset();
            let argumentTypesFirst: AsmWrappedType = null;
            let argumentTypesLast: AsmWrappedType = null;

            // Make sure to include the implicit "this" variable as a normal argument
            let argument = node.functionFirstArgument();
            while (argument != returnType) {
                let type = wasmWrapType(this.getAsmType(argument.variableType().resolvedType));

                if (argumentTypesFirst == null) argumentTypesFirst = type;
                else argumentTypesLast.next = type;
                argumentTypesLast = type;

                shared.nextLocalOffset = shared.nextLocalOffset + 1;
                argument = argument.nextSibling;
            }
            let signatureIndex = this.allocateSignature(argumentTypesFirst, wasmWrapType(this.getAsmType(returnType.resolvedType)));
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

    emitBinaryExpression(code: StringBuilder, node: Node, opcode: byte): void {
        this.emitNode(code, node.binaryLeft());
        this.emitNode(code, node.binaryRight());
        appendOpcode(code, opcode);
    }

    emitLoadFromMemory(code: StringBuilder, type: Type, relativeBase: Node, offset: int32): void {
        let heapType;
        let address:string | number = 0;
        // Relative address
        if (relativeBase != null) {
            address = this.emitNode(code, relativeBase);
        }

        address = `address + ${offset}`;

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            heapType =  type.isUnsigned() ? "U8" : "8";
            code.append(`HEAP${heapType}[${address}]`);
        }

        else if (sizeOf == 2) {
            heapType =  type.isUnsigned() ? "U16" : "16";
            code.append(`HEAP${heapType}[${address}]`);
        }

        else if (sizeOf == 4) {

            heapType =  type.isFloat() ? "F32" : (type.isUnsigned() ? "U32":"I32");
            code.append(`HEAP${heapType}[${address}]`);
        }

        else if (sizeOf == 8) {

            code.append(`HEAPF64[${address}]`);
        }

        else {
            assert(false);
        }

    }

    emitStoreToMemory(code: StringBuilder, type: Type, relativeBase: Node, offset: int32, value: Node): void {
        let heapType;
        let address:string | number = 0;
        // Relative address
        if (relativeBase != null) {
            address = this.emitNode(code, relativeBase);
        }

        address = `${address} + ${offset}`;

        let sizeOf = type.variableSizeOf(this.context);

        let valueRef = this.emitNode(code, value);

        if (sizeOf == 1) {
            heapType =  type.isUnsigned() ? "U8" : "8";
            code.append(`HEAP${heapType}[${address}] = ${valueRef}|0`);
        }

        else if (sizeOf == 2) {
            heapType =  type.isUnsigned() ? "U16" : "16";
            code.append(`HEAP${heapType}[${address}] = ${valueRef}|0`);
        }

        else if (sizeOf == 4) {

            if(type.isFloat()){
                code.append(`HEAPF32[${address}] = Math.fround(${valueRef})`);
            }else{
                heapType =  type.isUnsigned() ? "U32":"I32";
                code.append(`HEAP${heapType}[${address}] = ${valueRef}|0`);
            }
        }

        else if (sizeOf == 8) {

            code.append(`HEAPF64[${address}] = +${valueRef}`);
        }

        else {
            assert(false);
        }
    }

    emitConstructor(code: StringBuilder, node: Node): void {
        let constructorNode = node.constructorNode();
        let callSymbol = constructorNode.symbol;
        let child = node.firstChild.nextSibling;
        while (child != null) {
            this.emitNode(code, child);
            child = child.nextSibling;
        }
        appendOpcode(code, AsmOpcode.CALL);
        array.writeUnsignedLEB128(callSymbol.offset);
    }

    emitBlock(code: StringBuilder, node: Node, needBraces: boolean): void {
        this.previousNode = null;
        if (needBraces) {
            code.append("{\n", 1);
        }

        this.emitNode(code, node.firstChild);

        if (needBraces) {
            code.clearIndent(1);
            code.append("}");
            code.indent -= 1;
        }
        this.previousNode = null;
    }
    emitSymbolName(code:StringBuilder, symbol: Symbol): string {
        let name = symbol.rename != null ? symbol.rename : symbol.name;
        code.append(name);
        return name;
    }
    emitNode(code: StringBuilder, node: Node, parentPrecedence?: Precedence): int32 {
        assert(!isExpression(node) || node.resolvedType != null);
        if (node.kind == NodeKind.BLOCK) {

            code.append("{");

            let child = node.firstChild;
            while (child != null) {
                this.emitNode(code, child);
                child = child.nextSibling;
            }
            code.append("}");

        }

        else if (node.kind == NodeKind.WHILE) {
            this.emitNewlineBefore(node);
            code.append("while (");
            this.emitNode(code, node.whileValue());
            code.append(") ");
            this.emitBlock(code, node.whileBody(), true);
            code.append("\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.BREAK || node.kind == NodeKind.CONTINUE) {
            this.emitNewlineBefore(node);
            code.append("break;\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.EMPTY) {
            return 0;
        }

        else if (node.kind == NodeKind.EXPRESSION) {
            this.emitNode(code, node.expressionValue());
        }

        else if (node.kind == NodeKind.RETURN) {
            let value = node.returnValue();
            if (value != null) {
                code.append("return ");
                if (value != null) {
                    this.emitNode(code, value);

                    if (value.kind == NodeKind.NEW) {
                        this.emitConstructor(code, value);
                    }
                }
                code.append(";\n");
            } else {
                code.append("return;\n");
            }
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.VARIABLES) {
            let count = 0;
            let child = node.firstChild;
            while (child != null) {
                assert(child.kind == NodeKind.VARIABLE);
                count = count + this.emitNode(code, child);
                child = child.nextSibling;
            }
            return count;
        }

        else if (node.kind == NodeKind.IF) {
            this.emitNewlineBefore(node);
            while (true) {
                code.append("if (");
                this.emitNode(code, node.ifValue());
                code.append(") ");
                this.emitBlock(code, node.ifTrue(), true);
                let no = node.ifFalse();
                if (no == null) {
                    code.append("\n");
                    break;
                }
                code.append("\n\n");
                code.append("else ");
                if (no.firstChild == null || no.firstChild != no.lastChild || no.firstChild.kind != NodeKind.IF) {
                    this.emitBlock(code, no, true);
                    code.append("\n");
                    break;
                }
                node = no.firstChild;
            }
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.HOOK) {
            if (parentPrecedence > Precedence.ASSIGN) {
                this.code.append("(");
            }

            this.emitNode(code, node.hookValue(), Precedence.LOGICAL_OR);
            this.code.append(" ? ");
            this.emitNode(code, node.hookTrue(), Precedence.ASSIGN);
            this.code.append(" : ");
            this.emitNode(code, node.hookFalse(), Precedence.ASSIGN);

            if (parentPrecedence > Precedence.ASSIGN) {
                this.code.append(")");
            }
        }

        else if (node.kind == NodeKind.VARIABLE) {
            let value = node.variableValue();

            if (node.symbol.kind == SymbolKind.VARIABLE_LOCAL) {

                let resolvedType = node.symbol.resolvedType;

                if (value && value.kind != NodeKind.NAME && value.rawValue) {
                    if (resolvedType.isFloat()) {
                        code.append(`var ${node.symbol.name} = Math.fround(${value.rawValue});`);
                    }

                    else if (resolvedType.isDouble()) {
                        code.append(`var ${node.symbol.name} = +${value.rawValue};`);
                    }

                    else if (resolvedType.isInteger()) {
                        code.append(`var ${node.symbol.name} = ${value.rawValue}|0;`);
                    }

                }

                else {

                    if (value != null) {
                        this.emitNode(code, value);
                    }

                    else {
                        // Default value
                        if (resolvedType.isFloat()) {
                            code.append(`var ${node.symbol.name} = Math.fround(0);`);
                        }

                        else if (resolvedType.isDouble()) {
                            code.append(`var ${node.symbol.name} = +0;`);
                        }

                        else if (resolvedType.isInteger()) {
                            code.append(`var ${node.symbol.name} = 0|0;`);
                        }
                    }
                }

                // if (value.kind == NodeKind.NEW) {
                //     this.emitConstructor(code, value);
                // }
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.NAME) {
            let symbol = node.symbol;
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.node.isDeclare()) {
                code.append("global.");
            }
            this.emitSymbolName(code, symbol);
        }

        else if (node.kind == NodeKind.DEREFERENCE) {
            this.emitLoadFromMemory(code, node.resolvedType.underlyingType(this.context), node.unaryValue(), 0);
        }

        else if (node.kind == NodeKind.NULL) {
            appendOpcode(code, AsmOpcode.I32_CONST);
            log(code, 0, "i32 literal");
            array.writeLEB128(0);
        }

        else if (node.kind == NodeKind.INT32 || node.kind == NodeKind.BOOLEAN) {
            appendOpcode(code, AsmOpcode.I32_CONST);
            log(code, node.intValue, "i32 literal");
            array.writeLEB128(node.intValue);
        }

        else if (node.kind == NodeKind.INT64) {
            appendOpcode(code, AsmOpcode.I64_CONST);
            log(code, node.longValue, "i64 literal");
            array.writeLEB128(node.longValue);
        }

        else if (node.kind == NodeKind.FLOAT32) {
            appendOpcode(code, AsmOpcode.F32_CONST);
            log(code, node.floatValue, "f32 literal");
            array.writeFloat(node.floatValue);
        }

        else if (node.kind == NodeKind.FLOAT64) {
            appendOpcode(code, AsmOpcode.F64_CONST);
            log(code, node.doubleValue, "f64 literal");
            array.writeDouble(node.doubleValue);
        }

        else if (node.kind == NodeKind.STRING) {
            appendOpcode(code, AsmOpcode.I32_CONST);
            let value = ASM_MEMORY_INITIALIZER_BASE + node.intValue;
            log(code, value, "i32 literal");
            array.writeLEB128(value);
        }

        else if (node.kind == NodeKind.CALL) {
            let value = node.callValue();
            let symbol = value.symbol;
            assert(isFunction(symbol.kind));

            // Write out the implicit "this" argument
            if (symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
                this.emitNode(code, value.dotTarget());
            }

            let child = value.nextSibling;
            while (child != null) {
                this.emitNode(code, child);
                child = child.nextSibling;
            }

            appendOpcode(code, AsmOpcode.CALL);
            log(code, symbol.`call func index (${symbol.offset})`);
            array.writeUnsignedLEB128(symbol.offset);
        }

        else if (node.kind == NodeKind.NEW) {
            let type = node.newType();
            let size = type.resolvedType.allocationSizeOf(this.context);
            assert(size > 0);
            // Pass the object size as the first argument
            appendOpcode(code, AsmOpcode.I32_CONST);
            log(code, size, "i32 literal");
            array.writeLEB128(size);

            appendOpcode(code, AsmOpcode.CALL);
            log(code, this.mallocFunctionIndex, `call func index (${this.mallocFunctionIndex})`);
            array.writeUnsignedLEB128(this.mallocFunctionIndex);
        }

        else if (node.kind == NodeKind.DELETE) {
            let value = node.deleteValue();

            this.emitNode(code, value);

            appendOpcode(code, AsmOpcode.CALL);
            log(code, this.freeFunctionIndex, `call func index (${this.freeFunctionIndex})`);
            array.writeUnsignedLEB128(this.freeFunctionIndex);
        }

        else if (node.kind == NodeKind.POSITIVE) {
            this.emitNode(code, node.unaryValue());
        }

        else if (node.kind == NodeKind.NEGATIVE) {
            appendOpcode(code, AsmOpcode.I32_CONST);
            log(code, 0, "i32 literal");
            array.writeLEB128(0);
            this.emitNode(code, node.unaryValue());
            appendOpcode(code, AsmOpcode.I32_SUB);
        }

        else if (node.kind == NodeKind.COMPLEMENT) {
            appendOpcode(code, AsmOpcode.I32_CONST);
            log(code, ~0, "i32 literal");
            array.writeLEB128(~0);
            this.emitNode(code, node.unaryValue());
            appendOpcode(code, AsmOpcode.I32_XOR);
        }

        else if (node.kind == NodeKind.NOT) {
            this.emitNode(code, node.unaryValue());
            appendOpcode(code, AsmOpcode.I32_EQZ);
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
                this.emitNode(code, value);
            }

            else {
                // Sign-extend
                if (type == context.sbyteType || type == context.shortType) {
                    let shift = 32 - typeSize * 8;
                    appendOpcode(code, AsmOpcode.I32_SHR_S);
                    appendOpcode(code, AsmOpcode.I32_SHL);
                    this.emitNode(code, value);
                    appendOpcode(code, AsmOpcode.I32_CONST);
                    log(code, shift, "i32 literal");
                    array.writeLEB128(shift);
                    appendOpcode(code, AsmOpcode.I32_CONST);
                    log(code, shift, "i32 literal");
                    array.writeLEB128(shift);
                }

                // Mask
                else if (type == context.byteType || type == context.ushortType) {
                    this.emitNode(code, value);
                    appendOpcode(code, AsmOpcode.I32_CONST);
                    let _value = type.integerBitMask(this.context);
                    log(code, _value, "i32 literal");
                    array.writeLEB128(_value);
                    appendOpcode(code, AsmOpcode.I32_AND);
                }

                // i32 > f32
                else if (from == context.int32Type && type == context.float32Type) {
                    //TODO implement
                    this.emitNode(code, value);
                }

                // f32 > i32
                else if (from == context.float32Type && type == context.int32Type) {
                    //TODO implement
                    this.emitNode(code, value);
                }

                // No cast needed
                else {
                    this.emitNode(code, value);
                }
            }
        }

        else if (node.kind == NodeKind.DOT) {
            let symbol = node.symbol;

            if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitLoadFromMemory(code, symbol.resolvedType, node.dotTarget(), symbol.offset);
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
                this.emitStoreToMemory(code, left.resolvedType.underlyingType(this.context), left.unaryValue(), 0, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitStoreToMemory(code, symbol.resolvedType, left.dotTarget(), symbol.right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                //Global variables are immutable in MVP so we need to store them in memory
                // this.emitNode(code, right);
                // appendOpcode(code, AsmOpcode.SET_GLOBAL);
                // array.writeUnsignedLEB128(symbol.offset);
                this.emitStoreToMemory(code, symbol.resolvedType, null, ASM_MEMORY_INITIALIZER_BASE + symbol.right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_ARGUMENT || symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                this.emitNode(code, right);
                appendOpcode(code, AsmOpcode.SET_LOCAL);
                log(code, symbol.
                "local index"
            )
                ;
                array.writeUnsignedLEB128(symbol.offset);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.LOGICAL_AND) {
            this.emitNode(code, node.binaryLeft());
            this.emitNode(code, node.binaryRight());
            appendOpcode(code, AsmOpcode.I32_AND);
            appendOpcode(code, AsmOpcode.I32_CONST);
            log(code, 1, "i32 literal");
            array.writeLEB128(1);
            appendOpcode(code, AsmOpcode.I32_EQ);
        }

        else if (node.kind == NodeKind.LOGICAL_OR) {
            this.emitNode(code, node.binaryLeft());
            this.emitNode(code, node.binaryRight());
            appendOpcode(code, AsmOpcode.I32_OR);
            appendOpcode(code, AsmOpcode.I32_CONST);
            log(code, 1, "i32 literal");
            array.writeLEB128(1);
            appendOpcode(code, AsmOpcode.I32_EQ);
        }

        else if (isUnary(node.kind)) {

            let kind = node.kind;

            if (kind == NodeKind.POSTFIX_INCREMENT) {

                let value = node.unaryValue();
                let dataType: string = typeToAsmType(value.resolvedType);

                this.emitNode(code, value);

                assert(
                    value.resolvedType.isInteger() || value.resolvedType.isLong() ||
                    value.resolvedType.isFloat() || value.resolvedType.isDouble()
                );
                let size = value.resolvedType.pointerTo.allocationSizeOf(this.context);

                if (size == 1 || size == 2) {
                    if (value.kind == NodeKind.INT32) {
                        appendOpcode(code, AsmOpcode.I32_CONST);
                        log(code, 1, "i32 literal");
                        array.writeLEB128(1);
                    }

                    else {
                        console.error("Wrong type");
                    }
                }

                else if (size == 4) {
                    if (value.kind == NodeKind.INT32) {
                        appendOpcode(code, AsmOpcode.I32_CONST);
                        log(code, 1, "i32 literal");
                        array.writeLEB128(1);
                    }

                    else if (value.kind == NodeKind.FLOAT32) {
                        appendOpcode(code, AsmOpcode.F32_CONST);
                        log(code, 1, "f32 literal");
                        array.writeFloat(1);
                    }

                    else {
                        console.error("Wrong type");
                    }
                }

                else if (size == 8) {

                    if (value.kind == NodeKind.INT64) {
                        appendOpcode(code, AsmOpcode.I64_CONST);
                        log(code, 1, "i64 literal");
                        array.writeLEB128(1);
                    }

                    else if (value.kind == NodeKind.FLOAT64) {
                        appendOpcode(code, AsmOpcode.F64_CONST);
                        log(code, 1, "f64 literal");
                        array.writeDouble(1);
                    }

                    else {
                        console.error("Wrong type");
                    }
                }

                // if (value.resolvedType.pointerTo == null) {
                //     this.emitNode(code, value);
                // }

                appendOpcode(code, AsmOpcode[`${dataType}_ADD`]);
            }
        }
        else {
            let isUnsigned = node.isUnsignedOperator();
            let left = node.binaryLeft();
            let right = node.binaryRight();
            let isFloat: boolean = left.resolvedType.isFloat() || right.resolvedType.isFloat();
            let isDouble: boolean = left.resolvedType.isDouble() || right.resolvedType.isDouble();

            let dataTypeLeft: string = typeToAsmType(left.resolvedType);
            let dataTypeRight: string = typeToAsmType(right.resolvedType);
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

                this.emitNode(code, left);

                if (left.resolvedType.pointerTo == null) {
                    this.emitNode(code, right);
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
                            appendOpcode(code, AsmOpcode.I32_CONST);
                            let _value = right.intValue << 1;
                            log(code, _value, "i32 literal");
                            array.writeLEB128(_value);
                        }

                        else {
                            appendOpcode(code, AsmOpcode.I32_SHL);
                            this.emitNode(code, right);
                            appendOpcode(code, AsmOpcode.I32_CONST);
                            log(code, 1, "i32 literal");
                            array.writeLEB128(1);
                        }
                    }

                    else if (size == 4) {
                        if (right.kind == NodeKind.INT32) {
                            appendOpcode(code, AsmOpcode.I32_CONST);
                            let _value = right.intValue << 2;
                            log(code, _value, "i32 literal");
                            array.writeLEB128(_value);
                        }

                        else if (right.kind == NodeKind.FLOAT32) {
                            appendOpcode(code, AsmOpcode.F32_CONST);
                            log(code, right.floatValue, "f32 literal");
                            array.writeFloat(right.floatValue);
                        }

                        else {
                            appendOpcode(code, AsmOpcode.I32_SHL);
                            this.emitNode(code, right);
                            appendOpcode(code, AsmOpcode.I32_CONST);
                            log(code, 2, "i32 literal");
                            array.writeLEB128(2);
                        }
                    }

                    else if (size == 8) {

                        if (right.kind == NodeKind.INT64) {
                            appendOpcode(code, AsmOpcode.I64_CONST);
                            log(code, right.longValue, "i64 literal");
                            array.writeLEB128(right.longValue);
                        }

                        else if (right.kind == NodeKind.FLOAT64) {
                            appendOpcode(code, AsmOpcode.F64_CONST);
                            log(code, right.doubleValue, "f64 literal");
                            array.writeDouble(right.doubleValue);
                        }
                    }

                    else {
                        this.emitNode(code, right);
                    }
                }
                appendOpcode(code, AsmOpcode[`${dataTypeLeft}_ADD`]);
            }

            else if (node.kind == NodeKind.BITWISE_AND) {
                this.emitBinaryExpression(code, node, AsmOpcode[`${dataTypeLeft}_AND`]);
            }

            else if (node.kind == NodeKind.BITWISE_OR) {
                this.emitBinaryExpression(code, node, AsmOpcode[`${dataTypeLeft}_OR`]);
            }

            else if (node.kind == NodeKind.BITWISE_XOR) {
                this.emitBinaryExpression(code, node, AsmOpcode[`${dataTypeLeft}_XOR`]);
            }

            else if (node.kind == NodeKind.EQUAL) {
                this.emitBinaryExpression(code, node, AsmOpcode[`${dataTypeLeft}_EQ`]);
            }

            else if (node.kind == NodeKind.MULTIPLY) {
                this.emitBinaryExpression(code, node, AsmOpcode[`${dataTypeLeft}_MUL`]);
            }

            else if (node.kind == NodeKind.NOT_EQUAL) {
                this.emitBinaryExpression(code, node, AsmOpcode[`${dataTypeLeft}_NE`]);
            }

            else if (node.kind == NodeKind.SHIFT_LEFT) {
                this.emitBinaryExpression(code, node, AsmOpcode[`${dataTypeLeft}_SHL`]);
            }

            else if (node.kind == NodeKind.SUBTRACT) {
                this.emitBinaryExpression(code, node, AsmOpcode[`${dataTypeLeft}_SUB`]);
            }

            else if (node.kind == NodeKind.DIVIDE) {
                this.emitBinaryExpression(code, node, isUnsigned ?
                    AsmOpcode[`${dataTypeLeft}_DIV_U`] : AsmOpcode[`${dataTypeLeft}_DIV_S`]);
            }

            else if (node.kind == NodeKind.GREATER_THAN) {
                let opcode = (isFloat || isDouble) ?
                    AsmOpcode[`${dataTypeLeft}_GT`] :
                    (isUnsigned ? AsmOpcode[`${dataTypeLeft}_GT_U`] : AsmOpcode[`${dataTypeLeft}_GT_S`]);
                this.emitBinaryExpression(code, node, opcode);
            }

            else if (node.kind == NodeKind.GREATER_THAN_EQUAL) {
                let opcode = (isFloat || isDouble) ?
                    AsmOpcode[`${dataTypeLeft}_GE`] :
                    (isUnsigned ? AsmOpcode[`${dataTypeLeft}_GE_U`] : AsmOpcode[`${dataTypeLeft}_GE_S`]);
                this.emitBinaryExpression(code, node, opcode);
            }

            else if (node.kind == NodeKind.LESS_THAN) {
                let opcode = (isFloat || isDouble) ?
                    AsmOpcode[`${dataTypeLeft}_LT`] :
                    (isUnsigned ? AsmOpcode[`${dataTypeLeft}_LT_U`] : AsmOpcode[`${dataTypeLeft}_LT_S`]);
                this.emitBinaryExpression(code, node, opcode);
            }

            else if (node.kind == NodeKind.LESS_THAN_EQUAL) {
                let opcode = (isFloat || isDouble) ?
                    AsmOpcode[`${dataTypeLeft}_LE`] :
                    (isUnsigned ? AsmOpcode[`${dataTypeLeft}_LE_U`] : AsmOpcode[`${dataTypeLeft}_LE_S`]);
                this.emitBinaryExpression(code, node, opcode);
            }

            else if (node.kind == NodeKind.REMAINDER) {
                this.emitBinaryExpression(code, node, isUnsigned ?
                    AsmOpcode[`${dataTypeLeft}_REM_U`] : AsmOpcode[`${dataTypeLeft}_REM_S`]);
            }

            else if (node.kind == NodeKind.SHIFT_RIGHT) {
                this.emitBinaryExpression(code, node, isUnsigned ?
                    AsmOpcode[`${dataTypeLeft}_SHR_U`] : AsmOpcode[`${dataTypeLeft}_SHR_S`]);
            }

            else {
                assert(false);
            }
        }

        return 1;
    }

    getAsmType(type: Type): AsmType {
        let context = this.context;

        if (type == context.booleanType || type.isInteger() || (this.bitness == Bitness.x32 && type.isReference())) {
            return AsmType.I32;
        }

        else if (type.isLong() || (this.bitness == Bitness.x64 && type.isReference())) {
            return AsmType.I64;
        }

        else if (type.isDouble()) {
            return AsmType.F64;
        }

        else if (type.isFloat()) {
            return AsmType.F32;
        }

        if (type == context.voidType) {
            return AsmType.VOID;
        }

        assert(false);
        return AsmType.VOID;
    }
}

function wasmStartSection(code: StringBuilder, id: int32, name: string): SectionBuffer {
    let section: SectionBuffer = new SectionBuffer(id, name);
    section.offset = array.length;
    log(code, 0, null, ` - section: ${AsmSection[id]} [0x${toHex(id, 2)}]`);
    return section;
}

function wasmFinishSection(code: StringBuilder, section: SectionBuffer): void {
    section.publish(array);
}

function wasmWrapType(id: AsmType): AsmWrappedType {
    assert(id == AsmType.VOID || id == AsmType.I32 || id == AsmType.I64 || id == AsmType.F32 || id == AsmType.F64);
    let type = new AsmWrappedType();
    type.id = id;
    return type;
}
function symbolToValueType(symbol: Symbol) {
    let type = symbol.resolvedType;
    if (type.isFloat()) {
        return AsmType.FLOAT;
    }
    else if (type.isDouble()) {
        return AsmType.DOUBLE;
    }
    else if (type.isInteger() || type.pointerTo) {
        return AsmType.I32;
    }
    else if (type.isLong() || type.pointerTo) {
        return AsmType.I64;
    } else {
        return AsmType.I32;
    }
}
function typeToAsmType(type: Type): AsmType {
    if (type.isFloat()) {
        return AsmType.FLOAT;
    }
    else if (type.isDouble()) {
        return AsmType.DOUBLE;
    }
    else if (type.isInteger() || type.pointerTo) {
        return AsmType.INT;
    }
    else if (type.isLong() || type.pointerTo) {
        return AsmType.INT;
    }
}

class AsmSharedOffset {
    nextLocalOffset: int32 = 0;
    localCount: int32 = 0;
}

function wasmAssignLocalVariableOffsets(fn: AsmFunction, node: Node, shared: AsmSharedOffset): void {
    if (node.kind == NodeKind.VARIABLE) {
        assert(node.symbol.kind == SymbolKind.VARIABLE_LOCAL);
        node.symbol.offset = shared.nextLocalOffset;
        shared.nextLocalOffset = shared.nextLocalOffset + 1;
        shared.localCount = shared.localCount + 1;

        let local = new AsmLocal();
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
function append(code: StringBuilder, value = null, msg = null) {
    if (value) {
        code.append(value);
    }
}
function appendOpcode(code: StringBuilder, opcode) {
    code.append(opcode);
}
export function wasmEmit(compiler: Compiler): void {
    let code: StringBuilder = StringBuilder_new();
    let module = new AsmModule();
    module.context = compiler.context;
    module.code = code;
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

    module.emitModule();
}
