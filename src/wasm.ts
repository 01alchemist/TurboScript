import {Symbol, SymbolKind, isFunction} from "./symbol";
import {ByteArray, ByteArray_append32, ByteArray_set32, ByteArray_setString, ByteArray_set16} from "./bytearray";
import {CheckContext} from "./checker";
import {alignToNextMultipleOf} from "./imports";
import {Node, NodeKind, isExpression} from "./node";
import {Type} from "./type";
import {StringBuilder_new} from "./stringbuilder";
import {Compiler} from "./compiler";
import {WasmOpcode} from "./wasm/opcode";

const WASM_MAGIC = 0x6d736100; //'\0' | 'a' << 8 | 's' << 16 | 'm' << 24;
const WASM_VERSION = 0x0d;
const WASM_SIZE_IN_PAGES = 256;
const WASM_SET_MAX_MEMORY = false;
const WASM_MAX_MEMORY = 1024 * 1024 * 1024;
const WASM_MEMORY_INITIALIZER_BASE = 8; // Leave space for "null"

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
        array.writeUnsignedLEB128(this.id);//section code
        array.writeUnsignedLEB128(this.data.length);//size of this section in bytes
        if (this.id == 0) {
            array.writeWasmString(this.name);
        }
        array.copy(this.data);
    }
}

function wasmAreSignaturesEqual(a: WasmSignature, b: WasmSignature): boolean {
    assert(a.returnType != null);
    assert(b.returnType != null);
    assert(a.returnType.next == null);
    assert(b.returnType.next == null);

    var x = a.argumentTypes;
    var y = b.argumentTypes;

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
    context: CheckContext;

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
        var result = new WasmImport();
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
        var global = new WasmGlobal();
        global.symbol = symbol;
        symbol.offset = this.globalCount;

        if (this.firstGlobal == null) this.firstGlobal = global;
        else this.lastGlobal.next = global;
        this.lastGlobal = global;

        this.globalCount = this.globalCount + 1;
        return global;
    }

    allocateFunction(symbol: Symbol, signatureIndex: int32): WasmFunction {
        var fn = new WasmFunction();
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

        var signature = new WasmSignature();
        signature.argumentTypes = argumentTypes;
        signature.returnType = returnType;

        var check = this.firstSignature;
        var i = 0;

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
        array.writeUnsignedInt(WASM_MAGIC);
        array.writeUnsignedInt(WASM_VERSION);

        this.emitSignatures(array);
        this.emitImportTable(array);
        this.emitFunctionDeclarations(array);
        // this.emitTables(array);
        this.emitMemory(array);
        this.emitGlobalDeclarations(array);
        this.emitExportTable(array);
        //FIXME Get proper start function index
        // this.emitStartFunctionDeclaration(array, start_fun_index);
        this.emitElements(array);
        this.emitFunctionBodies(array);
        // this.emitDataSegments(array);
        // this.emitNames(array);
    }

    emitSignatures(array: ByteArray): void {

        if (!this.firstSignature) {
            return;
        }

        var section = wasmStartSection(array, WasmSection.Type, "signatures");
        section.data.writeUnsignedLEB128(this.signatureCount);

        var signature = this.firstSignature;
        while (signature != null) {
            var count = 0;
            var type = signature.argumentTypes;

            while (type != null) {
                count = count + 1;
                type = type.next;
            }

            section.data.writeUnsignedLEB128(WasmType.func); //form, the value for the func type constructor
            section.data.writeUnsignedLEB128(count); //param_count, the number of parameters to the function
            type = signature.argumentTypes;
            while (type != null) {
                section.data.writeUnsignedLEB128(type.id); //value_type, the parameter types of the function
                type = type.next;
            }
            var returnTypeId = signature.returnType.id;
            if (returnTypeId > 0) {
                section.data.writeUnsignedLEB128(1); //return_count, the number of results from the function
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

        var section = wasmStartSection(array, WasmSection.Import, "import_table");
        array.writeUnsignedLEB128(this.importCount);

        var current = this.firstImport;
        while (current != null) {
            array.writeUnsignedLEB128(current.signatureIndex);
            array.writeWasmString(current.module);
            array.writeWasmString(current.name);
            current = current.next;
        }

        wasmFinishSection(array, section);
    }

    emitFunctionDeclarations(array: ByteArray): void {
        if (!this.firstFunction) {
            return;
        }

        var section = wasmStartSection(array, WasmSection.Function, "function_declarations");
        section.data.writeUnsignedLEB128(this.functionCount);

        var fn = this.firstFunction;
        while (fn != null) {
            section.data.writeUnsignedLEB128(fn.signatureIndex);
            fn = fn.next;
        }

        wasmFinishSection(array, section);
    }

    emitTables(array: ByteArray): void {
        //TODO
    }

    emitMemory(array: ByteArray): void {
        var section = wasmStartSection(array, WasmSection.Memory, "memory");
        section.data.writeUnsignedLEB128(1); //indicating the number of memories defined by the module, In the MVP, the number of memories must be no more than 1.
        //resizable_limits
        section.data.writeUnsignedLEB128(WASM_SET_MAX_MEMORY ? 0x1 : 0); //flags, bit 0x1 is set if the maximum field is present
        section.data.writeUnsignedLEB128(WASM_SIZE_IN_PAGES); //initial length (in units of table elements or wasm pages)
        if (WASM_SET_MAX_MEMORY) {
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
            let isFloat: boolean = global.symbol.resolvedType.isFloat();
            let value = global.symbol.node.variableValue();
            section.data.append(isFloat ? WasmType.F32 : WasmType.I32); //content_type
            section.data.writeUnsignedLEB128(0); //mutability, 0 if immutable, 1 if mutable. MVP only support immutable global variables
            if (value) {
                if (value.rawValue) {
                    if (isFloat) {
                        section.data.writeUnsignedLEB128(WasmOpcode.F32_CONST);
                        section.data.writeFloat(value.rawValue); //const value
                    } else {
                        section.data.writeUnsignedLEB128(WasmOpcode.I32_CONST);
                        section.data.writeUnsignedLEB128(value.rawValue); //const value
                    }
                } else {
                    this.emitNode(section.data, value); //const value
                }
            } else {
                section.data.writeUnsignedLEB128(isFloat ? WasmOpcode.F32_CONST : WasmOpcode.I32_CONST);
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
        section.data.writeUnsignedLEB128(exportedCount);

        let i = 0;
        fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                section.data.writeWasmString(fn.symbol.name);
                section.data.writeUnsignedLEB128(WasmExternalKind.Function);
                section.data.writeUnsignedLEB128(i);
            }
            fn = fn.next;
            i = i + 1;
        }

        wasmFinishSection(array, section);
    }

    emitStartFunctionDeclaration(array: ByteArray, startIndex: int32): void {
        let section = wasmStartSection(array, WasmSection.Start, "start_function");
        section.data.writeUnsignedLEB128(startIndex);
        wasmFinishSection(array, section);
    }

    emitElements(array: ByteArray): void {
        //TODO
    }

    emitFunctionBodies(array: ByteArray): void {
        if (!this.firstFunction) {
            return;
        }

        let section = wasmStartSection(array, WasmSection.Code, "function_bodies");
        section.data.writeUnsignedLEB128(this.functionCount);

        let fn = this.firstFunction;
        while (fn != null) {
            let bodyData: ByteArray = new ByteArray();

            if (fn.localCount > 0) {
                bodyData.writeUnsignedLEB128(fn.localCount); //local_count
                //let localBlock = new ByteArray(); TODO: Optimize local declarations
                //local_entry
                let local = fn.firstLocal;
                while (local) {
                    bodyData.writeUnsignedLEB128(1); //count
                    bodyData.append(symbolToValueType(local.symbol)); //value_type
                    local = local.next;
                }

            } else {
                bodyData.writeUnsignedLEB128(0);
            }

            let child = fn.symbol.node.functionBody().firstChild;
            while (child != null) {
                this.emitNode(bodyData, child);
                child = child.nextSibling;
            }

            bodyData.writeUnsignedLEB128(WasmOpcode.END); //end, 0x0b, indicating the end of the body

            //Copy and finish body
            section.data.writeUnsignedLEB128(bodyData.length);
            section.data.copy(bodyData);

            fn = fn.next;
        }

        wasmFinishSection(array, section);
    }

    emitDataSegments(array: ByteArray): void {
        this.growMemoryInitializer();
        var memoryInitializer = this.memoryInitializer;
        var initializerLength = memoryInitializer.length;
        var initialHeapPointer = alignToNextMultipleOf(WASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);

        // Pass the initial heap pointer to the "malloc" function
        ByteArray_set32(memoryInitializer, this.currentHeapPointer, initialHeapPointer);
        ByteArray_set32(memoryInitializer, this.originalHeapPointer, initialHeapPointer);

        var section = wasmStartSection(array, WasmSection.Data, "data_segments");

        // This only writes one single section containing everything
        section.data.writeUnsignedLEB128(1);

        //data_segment
        section.data.writeUnsignedLEB128(0); //index, the linear memory index (0 in the MVP)

        //offset, an i32 initializer expression that computes the offset at which to place the data
        //FIXME: This could be wrong
        section.data.writeUnsignedLEB128(WasmOpcode.I32_CONST);
        section.data.writeUnsignedLEB128(array.length + 5); //const value
        section.data.writeUnsignedLEB128(WasmOpcode.END); //end opcode

        section.data.writeUnsignedLEB128(initializerLength); //size, size of data (in bytes)

        // Emit the range of the memory initializer
        // array.writeUnsignedLEB128(WASM_MEMORY_INITIALIZER_BASE);
        // array.writeUnsignedLEB128(initializerLength);

        //data, sequence of size bytes
        // Copy the entire memory initializer (also includes zero-initialized data for now)
        var i = 0;
        while (i < initializerLength) {
            section.data.append(memoryInitializer.get(i));
            i = i + 1;
        }

        wasmFinishSection(array, section);
    }

    emitNames(array: ByteArray): void {
        var section = wasmStartSection(array, 0, "names");
        array.writeUnsignedLEB128(this.functionCount);

        var fn = this.firstFunction;
        while (fn != null) {
            var name = fn.symbol.name;
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
            var text = node.stringValue;
            var length = text.length;
            var offset = this.context.allocateGlobalVariableOffset(length * 2 + 4, 4);
            node.intValue = offset;
            this.growMemoryInitializer();
            var memoryInitializer = this.memoryInitializer;

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
                if (sizeOf == 1) {
                    if (symbol.resolvedType.isUnsigned()) {
                        memoryInitializer.writeUnsignedByte(value.intValue, symbol.offset);
                    } else {
                        memoryInitializer.writeByte(value.intValue, symbol.offset);
                    }
                }
                else if (sizeOf == 2) {
                    if (symbol.resolvedType.isUnsigned()) {
                        memoryInitializer.writeUnsignedShort(value.intValue, symbol.offset);
                    } else {
                        memoryInitializer.writeShort(value.intValue, symbol.offset);
                    }
                }
                else if (sizeOf == 4) {
                    if (symbol.resolvedType.isFloat()) {
                        memoryInitializer.writeFloat(value.floatValue, symbol.offset);
                    } else {
                        if (symbol.resolvedType.isUnsigned()) {
                            memoryInitializer.writeUnsignedInt(value.intValue, symbol.offset);
                        } else {
                            memoryInitializer.writeInt(value.intValue, symbol.offset);
                        }
                    }
                }
                else if (sizeOf == 8) {
                    if (symbol.resolvedType.isDouble()) {
                        memoryInitializer.writeDouble(value.rawValue, symbol.offset);
                    } else {
                        //TODO Implement Int64 write
                        if (symbol.resolvedType.isUnsigned()) {
                            //memoryInitializer.writeUnsignedInt64(value.rawValue, symbol.offset);
                        } else {
                            //memoryInitializer.writeInt64(value.rawValue, symbol.offset);
                        }
                    }
                }
                else assert(false);

                let global = this.allocateGlobal(symbol);

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
            var returnType = node.functionReturnType();
            var shared = new WasmSharedOffset();
            var argumentTypesFirst: WasmWrappedType = null;
            var argumentTypesLast: WasmWrappedType = null;

            // Make sure to include the implicit "this" variable as a normal argument
            var argument = node.functionFirstArgument();
            while (argument != returnType) {
                var type = wasmWrapType(this.getWasmType(argument.variableType().resolvedType));

                if (argumentTypesFirst == null) argumentTypesFirst = type;
                else argumentTypesLast.next = type;
                argumentTypesLast = type;

                shared.nextLocalOffset = shared.nextLocalOffset + 1;
                argument = argument.nextSibling;
            }
            var signatureIndex = this.allocateSignature(argumentTypesFirst, wasmWrapType(this.getWasmType(returnType.resolvedType)));
            var body = node.functionBody();
            var symbol = node.symbol;

            // Functions without bodies are imports
            if (body == null) {
                var moduleName = symbol.kind == SymbolKind.FUNCTION_INSTANCE ? symbol.parent().name : "global";
                symbol.offset = this.importCount;
                this.allocateImport(signatureIndex, moduleName, symbol.name);
                node = node.nextSibling;
                return;
            }

            symbol.offset = this.functionCount;
            var fn = this.allocateFunction(symbol, signatureIndex);

            // Make sure "malloc" is tracked
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.name == "malloc") {
                assert(this.mallocFunctionIndex == -1);
                this.mallocFunctionIndex = symbol.offset;
            }

            if (node.isExport()) {
                fn.isExported = true;
            }

            // Assign local variable offsets
            wasmAssignLocalVariableOffsets(fn, body, shared);
            fn.localCount = shared.localCount;
        }

        var child = node.firstChild;
        while (child != null) {
            this.prepareToEmit(child);
            child = child.nextSibling;
        }
    }

    emitBinaryExpression(array: ByteArray, node: Node, opcode: byte): void {
        this.emitNode(array, node.binaryLeft());
        this.emitNode(array, node.binaryRight());
        array.append(opcode);
    }

    emitLoadFromMemory(array: ByteArray, type: Type, relativeBase: Node, offset: int32): void {

        // Relative address
        if (relativeBase != null) {
            this.emitNode(array, relativeBase);
        }
        // Absolute address
        else {
            array.append(WasmOpcode.I32_CONST);
            array.writeUnsignedLEB128(0);
        }

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            array.append(type.isUnsigned() ? WasmOpcode.I32_LOAD8_U : WasmOpcode.I32_LOAD8_S);
            array.writeUnsignedLEB128(0);
        }

        else if (sizeOf == 2) {
            array.append(type.isUnsigned() ? WasmOpcode.I32_LOAD16_U : WasmOpcode.I32_LOAD16_S);
            array.writeUnsignedLEB128(1);
        }

        else if (sizeOf == 4) {

            if (type.isFloat()) {
                array.append(WasmOpcode.F32_LOAD);
            }

            else {
                array.append(WasmOpcode.I32_LOAD);
            }
            array.writeUnsignedLEB128(2);
        }

        else if (sizeOf == 8) {

            if (type.isDouble()) {
                array.append(WasmOpcode.F64_LOAD);
            }

            else {
                array.append(WasmOpcode.I64_LOAD);
            }
            array.writeUnsignedLEB128(4);
        }

        else {
            assert(false);
        }

        array.writeUnsignedLEB128(offset);

    }

    emitStoreToMemory(array: ByteArray, type: Type, relativeBase: Node, offset: int32, value: Node): void {

        // Relative address
        if (relativeBase != null) {
            this.emitNode(array, relativeBase);
        }
        // Absolute address
        else {
            array.append(WasmOpcode.I32_CONST);
            array.writeUnsignedLEB128(0);
        }

        this.emitNode(array, value);

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            array.append(WasmOpcode.I32_STORE8);
            array.writeUnsignedLEB128(0);
        }

        else if (sizeOf == 2) {
            array.append(WasmOpcode.I32_STORE16);
            array.writeUnsignedLEB128(1);
        }

        else if (sizeOf == 4) {

            if (type.isFloat()) {
                array.append(WasmOpcode.F32_STORE);
            }

            else {
                array.append(WasmOpcode.I32_STORE);
            }
            array.writeUnsignedLEB128(2);
        }

        else if (sizeOf == 8) {

            if (type.isDouble()) {
                array.append(WasmOpcode.F64_STORE);
            }

            else {
                array.append(WasmOpcode.I64_STORE);
            }
            array.writeUnsignedLEB128(4);
        }

        else {
            assert(false);
        }

        array.writeUnsignedLEB128(offset);
    }

    emitNode(array: ByteArray, node: Node): int32 {
        assert(!isExpression(node) || node.resolvedType != null);

        if (node.kind == NodeKind.BLOCK) {
            array.append(WasmOpcode.BLOCK);
            array.append(WasmType.block_type);
            let child = node.firstChild;
            while (child != null) {
                this.emitNode(array, child);
                child = child.nextSibling;
            }
            array.append(WasmOpcode.END);
        }

        else if (node.kind == NodeKind.WHILE) {
            let value = node.whileValue();
            let body = node.whileBody();

            // Ignore "while (false) { ... }"
            if (value.kind == NodeKind.BOOLEAN && value.intValue == 0) {
                return 0;
            }

            array.append(WasmOpcode.BLOCK);
            array.append(WasmType.block_type);
            array.append(WasmOpcode.LOOP);
            array.append(WasmType.block_type);

            if (value.kind != NodeKind.BOOLEAN) {
                this.emitNode(array, value);
                array.append(WasmOpcode.I32_EQZ);
                array.append(WasmOpcode.BR_IF);
                array.writeUnsignedLEB128(1); // Break out of the immediately enclosing loop
            }

            let child = body.firstChild;
            while (child != null) {
                this.emitNode(array, child);
                child = child.nextSibling;
            }

            // Jump back to the top (this doesn't happen automatically)
            array.append(WasmOpcode.BR);
            array.writeUnsignedLEB128(0); // Continue back to the immediately enclosing loop

            array.append(WasmOpcode.END);
            array.append(WasmOpcode.END);
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
            array.append(WasmOpcode.BR);
            array.writeUnsignedLEB128(label - (node.kind == NodeKind.BREAK ? 0 : 1));
        }

        else if (node.kind == NodeKind.EMPTY) {
            return 0;
        }

        else if (node.kind == NodeKind.EXPRESSION) {
            this.emitNode(array, node.expressionValue());
        }

        else if (node.kind == NodeKind.RETURN) {
            let value = node.returnValue();
            if (value != null) {
                this.emitNode(array, value);
            }
            array.append(WasmOpcode.RETURN);
        }

        else if (node.kind == NodeKind.VARIABLES) {
            let count = 0;
            let child = node.firstChild;
            while (child != null) {
                assert(child.kind == NodeKind.VARIABLE);
                count = count + this.emitNode(array, child);
                child = child.nextSibling;
            }
            return count;
        }

        else if (node.kind == NodeKind.IF) {
            let branch = node.ifFalse();

            this.emitNode(array, node.ifValue());

            array.append(WasmOpcode.IF);
            array.append(WasmType.block_type);

            this.emitNode(array, node.ifTrue());

            if (branch != null) {
                array.append(WasmOpcode.IF_ELSE);
                this.emitNode(array, branch);
            }

            array.append(WasmOpcode.END);
        }

        else if (node.kind == NodeKind.HOOK) {
            array.append(WasmOpcode.IF_ELSE);
            this.emitNode(array, node.hookValue());
            this.emitNode(array, node.hookTrue());
            this.emitNode(array, node.hookFalse());
        }

        else if (node.kind == NodeKind.VARIABLE) {
            let value = node.variableValue();

            if (node.symbol.kind == SymbolKind.VARIABLE_LOCAL) {

                if (value && value.rawValue) {
                    if (node.symbol.resolvedType.isFloat()) {
                        array.append(WasmOpcode.F32_CONST);
                        array.writeFloat(value.rawValue);
                    } else {
                        array.append(WasmOpcode.I32_CONST);
                        array.writeUnsignedLEB128(value.rawValue);
                    }

                } else {
                    if (value != null) {
                        this.emitNode(array, value);
                    } else {
                        // Default value
                        array.writeUnsignedLEB128(0);
                    }
                }
                array.append(WasmOpcode.SET_LOCAL);
                array.writeUnsignedLEB128(node.symbol.offset);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.NAME) {
            let symbol = node.symbol;

            if (symbol.kind == SymbolKind.VARIABLE_ARGUMENT || symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                array.append(WasmOpcode.GET_LOCAL);
                array.writeUnsignedLEB128(symbol.offset);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                //Global variables are immutable so we need to store then in memory
                //array.append(WasmOpcode.GET_GLOBAL);
                //array.writeUnsignedLEB128(symbol.offset);
                this.emitLoadFromMemory(array, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.DEREFERENCE) {
            this.emitLoadFromMemory(array, node.resolvedType.underlyingType(this.context), node.unaryValue(), 0);
        }

        else if (node.kind == NodeKind.NULL) {
            array.append(WasmOpcode.I32_CONST);
            array.writeLEB128(0);
        }

        else if (node.kind == NodeKind.INT32 || node.kind == NodeKind.BOOLEAN) {
            array.append(WasmOpcode.I32_CONST);
            array.writeLEB128(node.intValue);
        }

        else if (node.kind == NodeKind.INT64) {
            array.append(WasmOpcode.I64_CONST);
            array.writeLEB128(node.intValue);
        }

        else if (node.kind == NodeKind.FLOAT32) {
            array.append(WasmOpcode.F32_CONST);
            array.writeFloat(node.floatValue);
        }

        else if (node.kind == NodeKind.FLOAT64) {
            array.append(WasmOpcode.F64_CONST);
            array.writeFloat(node.doubleValue);
        }

        else if (node.kind == NodeKind.STRING) {
            array.append(WasmOpcode.I32_CONST);
            array.writeLEB128(WASM_MEMORY_INITIALIZER_BASE + node.intValue);
        }

        else if (node.kind == NodeKind.CALL) {
            var value = node.callValue();
            var symbol = value.symbol;
            assert(isFunction(symbol.kind));

            // array.append(symbol.node.functionBody() == null ? WasmOpcode.CALL_IMPORT : WasmOpcode.CALL);
            array.append(WasmOpcode.CALL);
            array.writeUnsignedLEB128(symbol.offset);

            // Write out the implicit "this" argument
            if (symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
                this.emitNode(array, value.dotTarget());
            }

            var child = value.nextSibling;
            while (child != null) {
                this.emitNode(array, child);
                child = child.nextSibling;
            }
        }

        else if (node.kind == NodeKind.NEW) {
            var type = node.newType();
            var size = type.resolvedType.allocationSizeOf(this.context);

            array.append(WasmOpcode.CALL);
            array.writeUnsignedLEB128(this.mallocFunctionIndex);

            // Pass the object size as the first argument
            assert(size > 0);
            array.append(WasmOpcode.I32_CONST);
            array.writeLEB128(size);
        }

        else if (node.kind == NodeKind.POSITIVE) {
            this.emitNode(array, node.unaryValue());
        }

        else if (node.kind == NodeKind.NEGATIVE) {
            array.append(WasmOpcode.I32_SUB);
            array.append(WasmOpcode.I32_CONST);
            array.writeLEB128(0);
            this.emitNode(array, node.unaryValue());
        }

        else if (node.kind == NodeKind.COMPLEMENT) {
            array.append(WasmOpcode.I32_XOR);
            array.append(WasmOpcode.I32_CONST);
            array.writeLEB128(~0);
            this.emitNode(array, node.unaryValue());
        }

        else if (node.kind == NodeKind.NOT) {
            array.append(WasmOpcode.I32_EQZ);
            this.emitNode(array, node.unaryValue());
        }

        else if (node.kind == NodeKind.CAST) {
            var value = node.castValue();
            var context = this.context;
            var from = value.resolvedType.underlyingType(context);
            let type = node.resolvedType.underlyingType(context);
            var fromSize = from.variableSizeOf(context);
            var typeSize = type.variableSizeOf(context);

            // The cast isn't needed if it's to a wider integer type
            if (from == type || fromSize < typeSize) {
                this.emitNode(array, value);
            }

            else {
                // Sign-extend
                if (type == context.sbyteType || type == context.shortType) {
                    var shift = 32 - typeSize * 8;
                    array.append(WasmOpcode.I32_SHR_S);
                    array.append(WasmOpcode.I32_SHL);
                    this.emitNode(array, value);
                    array.append(WasmOpcode.I32_CONST);
                    array.writeLEB128(shift);
                    array.append(WasmOpcode.I32_CONST);
                    array.writeLEB128(shift);
                }

                // Mask
                else if (type == context.byteType || type == context.ushortType) {
                    array.append(WasmOpcode.I32_AND);
                    this.emitNode(array, value);
                    array.append(WasmOpcode.I32_CONST);
                    array.writeLEB128(type.integerBitMask(this.context));
                }

                // No cast needed
                else {
                    this.emitNode(array, value);
                }
            }
        }

        else if (node.kind == NodeKind.DOT) {
            var symbol = node.symbol;

            if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitLoadFromMemory(array, symbol.resolvedType, node.dotTarget(), symbol.offset);
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
                this.emitStoreToMemory(array, left.resolvedType.underlyingType(this.context), left.unaryValue(), 0, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitStoreToMemory(array, symbol.resolvedType, left.dotTarget(), symbol.offset, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                //Global variables are immutable in MVP so we need to store then in memory
                // this.emitNode(array, right);
                // array.append(WasmOpcode.SET_GLOBAL);
                // array.writeUnsignedLEB128(symbol.offset);
                this.emitStoreToMemory(array, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_ARGUMENT || symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                this.emitNode(array, right);
                array.append(WasmOpcode.SET_LOCAL);
                array.writeUnsignedLEB128(symbol.offset);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.LOGICAL_AND) {
            array.append(WasmOpcode.IF_ELSE);
            this.emitNode(array, node.binaryLeft());
            this.emitNode(array, node.binaryRight());
            array.append(WasmOpcode.I32_CONST);
            array.writeLEB128(0);
        }

        else if (node.kind == NodeKind.LOGICAL_OR) {
            array.append(WasmOpcode.IF_ELSE);
            this.emitNode(array, node.binaryLeft());
            array.append(WasmOpcode.I32_CONST);
            array.writeLEB128(1);
            this.emitNode(array, node.binaryRight());
        }

        else {
            let isUnsigned = node.isUnsignedOperator();
            let left = node.binaryLeft();
            let right = node.binaryRight();
            let isFloat: boolean = left.resolvedType.isFloat() || right.resolvedType.isFloat();
            let isDouble: boolean = left.resolvedType.isDouble() || right.resolvedType.isDouble();

            let dataTypeLeft: string = typeToDataType(left.resolvedType);
            //let dataTypeRight: string = typeToDataType(right.resolvedType);

            if (node.kind == NodeKind.ADD) {
                // let left = node.binaryLeft();
                // let right = node.binaryRight();

                this.emitNode(array, left);

                if (left.resolvedType.pointerTo == null) {
                    this.emitNode(array, right);
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
                            array.append(WasmOpcode.I32_CONST);
                            array.writeLEB128(right.intValue << 1);
                        }

                        else {
                            array.append(WasmOpcode.I32_SHL);
                            this.emitNode(array, right);
                            array.append(WasmOpcode.I32_CONST);
                            array.writeLEB128(1);
                        }
                    }

                    else if (size == 4) {
                        if (right.kind == NodeKind.INT32) {
                            array.append(WasmOpcode.I32_CONST);
                            array.writeLEB128(right.intValue << 2);
                        }

                        else if (right.kind == NodeKind.FLOAT32) {
                            array.append(WasmOpcode.F32_CONST);
                            array.writeFloat(right.floatValue);
                        }

                        else {
                            array.append(WasmOpcode.I32_SHL);
                            this.emitNode(array, right);
                            array.append(WasmOpcode.I32_CONST);
                            array.writeLEB128(2);
                        }
                    }

                    else if (size == 8) {

                        if (right.kind == NodeKind.INT64) {
                            array.append(WasmOpcode.I64_CONST);
                            array.writeLEB128(right.longValue);
                        }

                        else if (right.kind == NodeKind.FLOAT64) {
                            array.append(WasmOpcode.F64_CONST);
                            array.writeDouble(right.doubleValue);
                        }
                    }

                    else {
                        this.emitNode(array, right);
                    }
                }

                array.append(WasmOpcode[`${dataTypeLeft}_ADD`]);
            }

            else if (node.kind == NodeKind.BITWISE_AND) {
                this.emitBinaryExpression(array, node, WasmOpcode[`${dataTypeLeft}_AND`]);
            }

            else if (node.kind == NodeKind.BITWISE_OR) {
                this.emitBinaryExpression(array, node, WasmOpcode[`${dataTypeLeft}_OR`]);
            }

            else if (node.kind == NodeKind.BITWISE_XOR) {
                this.emitBinaryExpression(array, node, WasmOpcode[`${dataTypeLeft}_XOR`]);
            }

            else if (node.kind == NodeKind.EQUAL) {
                this.emitBinaryExpression(array, node, WasmOpcode[`${dataTypeLeft}_EQ`]);
            }

            else if (node.kind == NodeKind.MULTIPLY) {
                this.emitBinaryExpression(array, node, WasmOpcode[`${dataTypeLeft}_MUL`]);
            }

            else if (node.kind == NodeKind.NOT_EQUAL) {
                this.emitBinaryExpression(array, node, WasmOpcode[`${dataTypeLeft}_NE`]);
            }

            else if (node.kind == NodeKind.SHIFT_LEFT) {
                this.emitBinaryExpression(array, node, WasmOpcode[`${dataTypeLeft}_SHL`]);
            }

            else if (node.kind == NodeKind.SUBTRACT) {
                this.emitBinaryExpression(array, node, WasmOpcode[`${dataTypeLeft}_SUB`]);
            }

            else if (node.kind == NodeKind.DIVIDE) {
                this.emitBinaryExpression(array, node, isUnsigned ?
                    WasmOpcode[`${dataTypeLeft}_DIV_U`] : WasmOpcode[`${dataTypeLeft}_DIV_S`]);
            }

            else if (node.kind == NodeKind.GREATER_THAN) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_GT`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_GT_U`] : WasmOpcode[`${dataTypeLeft}_GT_S`]);
                this.emitBinaryExpression(array, node, opcode);
            }

            else if (node.kind == NodeKind.GREATER_THAN_EQUAL) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_GE`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_GE_U`] : WasmOpcode[`${dataTypeLeft}_GE_S`]);
                this.emitBinaryExpression(array, node, opcode);
            }

            else if (node.kind == NodeKind.LESS_THAN) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_LT`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_LT_U`] : WasmOpcode[`${dataTypeLeft}_LT_S`]);
                this.emitBinaryExpression(array, node, opcode);
            }

            else if (node.kind == NodeKind.LESS_THAN_EQUAL) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_LE`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_LE_U`] : WasmOpcode[`${dataTypeLeft}_LE_S`]);
                this.emitBinaryExpression(array, node, opcode);
            }

            else if (node.kind == NodeKind.REMAINDER) {
                this.emitBinaryExpression(array, node, isUnsigned ?
                    WasmOpcode[`${dataTypeLeft}_REM_U`] : WasmOpcode[`${dataTypeLeft}_REM_S`]);
            }

            else if (node.kind == NodeKind.SHIFT_RIGHT) {
                this.emitBinaryExpression(array, node, isUnsigned ?
                    WasmOpcode[`${dataTypeLeft}_SHR_U`] : WasmOpcode[`${dataTypeLeft}_SHR_S`]);
            }

            else {
                assert(false);
            }
        }

        return 1;
    }

    getWasmType(type: Type): WasmType {
        var context = this.context;

        if (type == context.booleanType || type.isInteger() || type.isReference()) {
            return WasmType.I32;
        }

        if (type.isFloat()) {
            return WasmType.F32;
        }

        if (type.isDouble()) {
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
    return section;
}

function wasmFinishSection(array: ByteArray, section: SectionBuffer): void {
    section.publish(array);
}

function wasmWrapType(id: WasmType): WasmWrappedType {
    assert(id == WasmType.VOID || id == WasmType.I32 || id == WasmType.F32);
    var type = new WasmWrappedType();
    type.id = id;
    return type;
}
function symbolToValueType(symbol: Symbol) {
    let type = symbol.resolvedType;
    if (type.isFloat()) {
        return WasmType.F32;
    }
    else if (type.isDouble()) {
        return WasmType.F64;
    }
    else if (type.isInteger() || type.pointerTo) {
        return WasmType.I32;
    }
    else if (type.isLong()) {
        return WasmType.I64;
    }
}
function typeToDataType(type: Type): string {
    if (type.isFloat()) {
        return "F32";
    }
    else if (type.isDouble()) {
        return "F64";
    }
    else if (type.isInteger() || type.pointerTo) {
        return "I32";
    }
    else if (type.isLong()) {
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

export function wasmEmit(compiler: Compiler): void {
    var module = new WasmModule();
    module.context = compiler.context;
    module.memoryInitializer = new ByteArray();

    // Set these to invalid values since "0" is valid
    module.mallocFunctionIndex = -1;
    module.currentHeapPointer = -1;
    module.originalHeapPointer = -1;

    // Emission requires two passes
    module.prepareToEmit(compiler.global);

    // The standard library must be included
    // assert(module.mallocFunctionIndex != -1);
    // assert(module.currentHeapPointer != -1);
    // assert(module.originalHeapPointer != -1);

    compiler.outputWASM = new ByteArray();
    module.emitModule(compiler.outputWASM);
}
