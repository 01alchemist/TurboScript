import {Symbol, SymbolKind, isFunction} from "./symbol";
import {ByteArray, ByteArray_append32, ByteArray_set32, ByteArray_setString, ByteArray_set16} from "./bytearray";
import {CheckContext} from "./checker";
import {alignToNextMultipleOf} from "./imports";
import {Node, NodeKind, isExpression} from "./node";
import {Type} from "./type";
import {StringBuilder_new} from "./stringbuilder";
import {Compiler} from "./compiler";

// Control flow operators
const WASM_OPCODE_UNREACHABLE: byte = 0x00;
const WASM_OPCODE_NOP: byte = 0x01;
const WASM_OPCODE_BLOCK: byte = 0x02;
const WASM_OPCODE_LOOP: byte = 0x03;
const WASM_OPCODE_IF: byte = 0x04;
const WASM_OPCODE_IF_ELSE: byte = 0x05;
const WASM_OPCODE_END: byte = 0x0b;
const WASM_OPCODE_BR: byte = 0x0c;
const WASM_OPCODE_BR_IF: byte = 0x0d;
const WASM_OPCODE_BR_TABLE: byte = 0x0e;
const WASM_OPCODE_RETURN: byte = 0x0f;

// Call operators
const WASM_OPCODE_CALL: byte = 0x10;
const WASM_OPCODE_CALL_INDIRECT: byte = 0x11;

//Parametric operators
const WASM_OPCODE_DROP: byte = 0x1a;
const WASM_OPCODE_SELECT: byte = 0x1b;

//Variable access
const WASM_OPCODE_GET_LOCAL: byte = 0x20;
const WASM_OPCODE_SET_LOCAL: byte = 0x21;
const WASM_OPCODE_TEE_LOCAL: byte = 0x22;
const WASM_OPCODE_GET_GLOBAL: byte = 0x23;
const WASM_OPCODE_SET_GLOBAL: byte = 0x24;

// Memory-related operators
const WASM_OPCODE_I32_LOAD: byte = 0x28;
const WASM_OPCODE_I64_LOAD: byte = 0x29;
const WASM_OPCODE_F32_LOAD: byte = 0x2a;
const WASM_OPCODE_F64_LOAD: byte = 0x2b;

const WASM_OPCODE_I32_LOAD8_S: byte = 0x2c;
const WASM_OPCODE_I32_LOAD8_U: byte = 0x2d;
const WASM_OPCODE_I32_LOAD16_S: byte = 0x2e;
const WASM_OPCODE_I32_LOAD16_U: byte = 0x2f;

const WASM_OPCODE_I64_LOAD8_S: byte = 0x30;
const WASM_OPCODE_I64_LOAD8_U: byte = 0x31;
const WASM_OPCODE_I64_LOAD16_S: byte = 0x32;
const WASM_OPCODE_I64_LOAD16_U: byte = 0x33;
const WASM_OPCODE_I64_LOAD32_S: byte = 0x34;
const WASM_OPCODE_I64_LOAD32_U: byte = 0x35;

const WASM_OPCODE_I32_STORE: byte = 0x36;
const WASM_OPCODE_I64_STORE: byte = 0x37;
const WASM_OPCODE_F32_STORE: byte = 0x38;
const WASM_OPCODE_F64_STORE: byte = 0x39;

const WASM_OPCODE_I32_STORE8: byte = 0x3a;
const WASM_OPCODE_I32_STORE16: byte = 0x3b;
const WASM_OPCODE_I64_STORE8: byte = 0x3c;
const WASM_OPCODE_I64_STORE16: byte = 0x3d;
const WASM_OPCODE_I64_STORE32: byte = 0x3e;
const WASM_OPCODE_MEMORY_SIZE: byte = 0x3f; //query the size of memory
const WASM_OPCODE_GROW_MEMORY: byte = 0x40;

// Constants
const WASM_OPCODE_I32_CONST: byte = 0x41;
const WASM_OPCODE_I64_CONST: byte = 0x42;
const WASM_OPCODE_F32_CONST: byte = 0x43;
const WASM_OPCODE_F64_CONST: byte = 0x44;

//Comparison operators
const WASM_OPCODE_I32_EQZ: byte = 0x45;
const WASM_OPCODE_I32_EQ: byte = 0x46;
const WASM_OPCODE_I32_NE: byte = 0x47;
const WASM_OPCODE_I32_LT_S: byte = 0x48;
const WASM_OPCODE_I32_LT_U: byte = 0x49;
const WASM_OPCODE_I32_GT_S: byte = 0x4a;
const WASM_OPCODE_I32_GT_U: byte = 0x4b;
const WASM_OPCODE_I32_LE_S: byte = 0x4c;
const WASM_OPCODE_I32_LE_U: byte = 0x4d;
const WASM_OPCODE_I32_GE_S: byte = 0x4e;
const WASM_OPCODE_I32_GE_U: byte = 0x4f;

const WASM_OPCODE_I64_EQZ: byte = 0x50;
const WASM_OPCODE_I64_EQ: byte = 0x51;
const WASM_OPCODE_I64_NE: byte = 0x52;
const WASM_OPCODE_I64_LT_S: byte = 0x53;
const WASM_OPCODE_I64_LT_U: byte = 0x54;
const WASM_OPCODE_I64_GT_S: byte = 0x55;
const WASM_OPCODE_I64_GT_U: byte = 0x56;
const WASM_OPCODE_I64_LE_S: byte = 0x57;
const WASM_OPCODE_I64_LE_U: byte = 0x58;
const WASM_OPCODE_I64_GE_S: byte = 0x59;
const WASM_OPCODE_I64_GE_U: byte = 0x5a;

const WASM_OPCODE_F32_EQ: byte = 0x5b;
const WASM_OPCODE_F32_NE: byte = 0x5c;
const WASM_OPCODE_F32_LT: byte = 0x5d;
const WASM_OPCODE_F32_GT: byte = 0x5e;
const WASM_OPCODE_F32_LE: byte = 0x5f;
const WASM_OPCODE_F32_GE: byte = 0x60;

const WASM_OPCODE_F64_EQ: byte = 0x61;
const WASM_OPCODE_F64_NE: byte = 0x62;
const WASM_OPCODE_F64_LT: byte = 0x63;
const WASM_OPCODE_F64_GT: byte = 0x64;
const WASM_OPCODE_F64_LE: byte = 0x65;
const WASM_OPCODE_F64_GE: byte = 0x66;

//Numeric operators
const WASM_OPCODE_I32_CLZ: byte = 0x67;
const WASM_OPCODE_I32_CTZ: byte = 0x68;
const WASM_OPCODE_I32_POPCNT: byte = 0x69;
const WASM_OPCODE_I32_ADD: byte = 0x6a;
const WASM_OPCODE_I32_SUB: byte = 0x6b;
const WASM_OPCODE_I32_MUL: byte = 0x6c;
const WASM_OPCODE_I32_DIV_S: byte = 0x6d;
const WASM_OPCODE_I32_DIV_U: byte = 0x6e;
const WASM_OPCODE_I32_REM_S: byte = 0x6f;
const WASM_OPCODE_I32_REM_U: byte = 0x70;
const WASM_OPCODE_I32_AND: byte = 0x71;
const WASM_OPCODE_I32_OR: byte = 0x72;
const WASM_OPCODE_I32_XOR: byte = 0x73;
const WASM_OPCODE_I32_SHL: byte = 0x74;
const WASM_OPCODE_I32_SHR_S: byte = 0x75;
const WASM_OPCODE_I32_SHR_U: byte = 0x76;
const WASM_OPCODE_I32_ROTL: byte = 0x77;
const WASM_OPCODE_I32_ROTR: byte = 0x78;

const WASM_OPCODE_I64_CLZ: byte = 0x79;
const WASM_OPCODE_I64_CTZ: byte = 0x7a;
const WASM_OPCODE_I64_POPCNT: byte = 0x7b;
const WASM_OPCODE_I64_ADD: byte = 0x7c;
const WASM_OPCODE_I64_SUB: byte = 0x7d;
const WASM_OPCODE_I64_MUL: byte = 0x7e;
const WASM_OPCODE_I64_DIV_S: byte = 0x7f;
const WASM_OPCODE_I64_DIV_U: byte = 0x80;
const WASM_OPCODE_I64_REM_S: byte = 0x81;
const WASM_OPCODE_I64_REM_U: byte = 0x82;
const WASM_OPCODE_I64_AND: byte = 0x83;
const WASM_OPCODE_I64_OR: byte = 0x84;
const WASM_OPCODE_I64_XOR: byte = 0x85;
const WASM_OPCODE_I64_SHL: byte = 0x86;
const WASM_OPCODE_I64_SHR_S: byte = 0x87;
const WASM_OPCODE_I64_SHR_U: byte = 0x88;
const WASM_OPCODE_I64_ROTL: byte = 0x89;
const WASM_OPCODE_I64_ROTR: byte = 0x8a;

const WASM_OPCODE_F32_ABS: byte = 0x8b;
const WASM_OPCODE_F32_NEG: byte = 0x8c;
const WASM_OPCODE_F32_CEIL: byte = 0x8d;
const WASM_OPCODE_F32_FLOOR: byte = 0x8e;
const WASM_OPCODE_F32_TRUNC: byte = 0x8f;
const WASM_OPCODE_F32_NEAREST: byte = 0x90;
const WASM_OPCODE_F32_SQRT: byte = 0x91;
const WASM_OPCODE_F32_ADD: byte = 0x92;
const WASM_OPCODE_F32_SUB: byte = 0x93;
const WASM_OPCODE_F32_MUL: byte = 0x94;
const WASM_OPCODE_F32_DIV: byte = 0x95;
const WASM_OPCODE_F32_MIN: byte = 0x96;
const WASM_OPCODE_F32_MAX: byte = 0x97;
const WASM_OPCODE_F32_COPYSIGN: byte = 0x98;

const WASM_OPCODE_F64_ABS: byte = 0x99;
const WASM_OPCODE_F64_NEG: byte = 0x9a;
const WASM_OPCODE_F64_CEIL: byte = 0x9b;
const WASM_OPCODE_F64_FLOOR: byte = 0x9c;
const WASM_OPCODE_F64_TRUNC: byte = 0x9d;
const WASM_OPCODE_F64_NEAREST: byte = 0x9e;
const WASM_OPCODE_F64_SQRT: byte = 0x9f;
const WASM_OPCODE_F64_ADD: byte = 0xa0;
const WASM_OPCODE_F64_SUB: byte = 0xa1;
const WASM_OPCODE_F64_MUL: byte = 0xa2;
const WASM_OPCODE_F64_DIV: byte = 0xa3;
const WASM_OPCODE_F64_MIN: byte = 0xa4;
const WASM_OPCODE_F64_MAX: byte = 0xa5;
const WASM_OPCODE_F64_COPYSIGN: byte = 0xa6;

//Conversions
const WASM_OPCODE_I32_WRAP_I64: byte = 0xa7;
const WASM_OPCODE_I32_TRUNC_S_F32: byte = 0xa8;
const WASM_OPCODE_I32_TRUNC_U_F32: byte = 0xa9;
const WASM_OPCODE_I32_TRUNC_S_F64: byte = 0xaa;
const WASM_OPCODE_I32_TRUNC_U_F64: byte = 0xab;

const WASM_OPCODE_I64_EXTEND_S_I32: byte = 0xac;
const WASM_OPCODE_I64_EXTEND_U_I32: byte = 0xad;
const WASM_OPCODE_I64_TRUNC_S_F32: byte = 0xae;
const WASM_OPCODE_I64_TRUNC_U_F32: byte = 0xaf;
const WASM_OPCODE_I64_TRUNC_S_F64: byte = 0xb0;
const WASM_OPCODE_I64_TRUNC_U_F64: byte = 0xb1;

const WASM_OPCODE_F32_CONVERT_S_I32: byte = 0xb2;
const WASM_OPCODE_F32_CONVERT_U_I32: byte = 0xb3;
const WASM_OPCODE_F32_CONVERT_S_I64: byte = 0xb4;
const WASM_OPCODE_F32_CONVERT_U_I64: byte = 0xb5;
const WASM_OPCODE_F32_DEMOTE_F64: byte = 0xb6;

const WASM_OPCODE_F64_CONVERT_S_I32: byte = 0xb7;
const WASM_OPCODE_F64_CONVERT_U_I32: byte = 0xb8;
const WASM_OPCODE_F64_CONVERT_S_I64: byte = 0xb9;
const WASM_OPCODE_F64_CONVERT_U_I64: byte = 0xba;
const WASM_OPCODE_F64_PROMOTE_F32: byte = 0xbb;

//Reinterpretations
const WASM_OPCODE_I32_REINTERPRET_F32: byte = 0xbc;
const WASM_OPCODE_I64_REINTERPRET_F64: byte = 0xbd;
const WASM_OPCODE_F32_REINTERPRET_I32: byte = 0xbe;
const WASM_OPCODE_F64_REINTERPRET_I64: byte = 0xbf;


const WASM_OPCODE_CALL_IMPORT: byte = 31; //FIXME: Not found in spec

// const WASM_MAGIC = '\0' | 'a' << 8 | 's' << 16 | 'm' << 24;
const WASM_MAGIC = 0x6d736100;
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

class WasmFunction {
    symbol: Symbol;
    signatureIndex: int32;
    isExported: boolean;
    intLocalCount: int32;
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
    importCount: int32;

    firstFunction: WasmFunction;
    lastFunction: WasmFunction;
    functionCount: int32;

    firstSignature: WasmSignature;
    lastSignature: WasmSignature;
    signatureCount: int32;

    memoryInitializer: ByteArray;
    currentHeapPointer: int32;
    originalHeapPointer: int32;
    mallocFunctionIndex: int32;
    context: CheckContext;

    growMemoryInitializer(): void {
        var array = this.memoryInitializer;
        var current = array.length();
        var length = this.context.nextGlobalVariableOffset;

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
        ByteArray_append32(array, WASM_MAGIC);
        ByteArray_append32(array, WASM_VERSION);

        this.emitSignatures(array);
        this.emitImportTable(array);
        this.emitFunctionDeclarations(array);
        this.emitTables(array);
        this.emitMemory(array);
        this.emitGlobalDeclarations(array);
        this.emitExportTable(array);
        //FIXME Get proper start function index
        //this.emitStartFunctionDeclaration(array, start_fun_index);
        this.emitElements(array);
        this.emitFunctionBodies(array);
        this.emitDataSegments(array);
        // this.emitNames(array);
    }

    emitSignatures(array: ByteArray): void {
        var section = wasmStartSection(array, WasmSection.Type, "signatures");
        wasmWriteVarUnsigned(array, this.signatureCount);

        var signature = this.firstSignature;
        while (signature != null) {
            var count = 0;
            var type = signature.argumentTypes;

            while (type != null) {
                count = count + 1;
                type = type.next;
            }

            wasmWriteVarUnsigned(array, WasmType.func); //form, the value for the func type constructor
            wasmWriteVarUnsigned(array, count); //param_count, the number of parameters to the function
            type = signature.argumentTypes;
            while (type != null) {
                wasmWriteVarUnsigned(array, type.id); //value_type, the parameter types of the function
                type = type.next;
            }
            var returnTypeId = signature.returnType.id;
            if (returnTypeId > 0) {
                wasmWriteVarUnsigned(array, 1); //return_count, the number of results from the function
                wasmWriteVarUnsigned(array, signature.returnType.id);
            } else {
                wasmWriteVarUnsigned(array, 0);
            }

            signature = signature.next;
        }

        wasmFinishSection(array, section);
    }

    emitImportTable(array: ByteArray): void {
        if (this.firstImport == null) {
            return;
        }

        var section = wasmStartSection(array, WasmSection.Import, "import_table");
        wasmWriteVarUnsigned(array, this.importCount);

        var current = this.firstImport;
        while (current != null) {
            wasmWriteVarUnsigned(array, current.signatureIndex);
            wasmWriteLengthPrefixedASCII(array, current.module);
            wasmWriteLengthPrefixedASCII(array, current.name);
            current = current.next;
        }

        wasmFinishSection(array, section);
    }

    emitFunctionDeclarations(array: ByteArray): void {
        if (this.firstFunction == null) {
            return;
        }

        var section = wasmStartSection(array, WasmSection.Function, "function_declarations");
        wasmWriteVarUnsigned(array, this.functionCount);

        var fn = this.firstFunction;
        while (fn != null) {
            wasmWriteVarUnsigned(array, fn.signatureIndex);
            fn = fn.next;
        }

        wasmFinishSection(array, section);
    }

    emitTables(array: ByteArray): void {
        //TODO
    }

    emitMemory(array: ByteArray): void {
        var section = wasmStartSection(array, WasmSection.Memory, "memory");
        wasmWriteVarUnsigned(array, 1); //indicating the number of memories defined by the module, In the MVP, the number of memories must be no more than 1.
        //resizable_limits
        wasmWriteVarUnsigned(array, WASM_SET_MAX_MEMORY ? 0x1 : 0); //flags, bit 0x1 is set if the maximum field is present
        wasmWriteVarUnsigned(array, WASM_SIZE_IN_PAGES); //initial length (in units of table elements or wasm pages)
        if (WASM_SET_MAX_MEMORY) {
            wasmWriteVarUnsigned(array, WASM_MAX_MEMORY);// maximum, only present if specified by flags
        }
        wasmFinishSection(array, section);
    }

    emitGlobalDeclarations(array: ByteArray): void {
        //TODO
    }

    emitExportTable(array: ByteArray): void {
        var exportedCount = 0;
        var fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                exportedCount = exportedCount + 1;
            }
            fn = fn.next;
        }
        if (exportedCount == 0) {
            return;
        }

        var section = wasmStartSection(array, WasmSection.Export, "export_table");
        wasmWriteVarUnsigned(array, exportedCount);

        var i = 0;
        fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                wasmWriteLengthPrefixedASCII(array, fn.symbol.name);
                wasmWriteVarUnsigned(array, WasmExternalKind.Function);
                wasmWriteVarUnsigned(array, i);
            }
            fn = fn.next;
            i = i + 1;
        }

        wasmFinishSection(array, section);
    }

    emitStartFunctionDeclaration(array: ByteArray, startIndex: int32): void {
        var section = wasmStartSection(array, WasmSection.Start, "start_function");
        wasmWriteVarUnsigned(array, startIndex);
        wasmFinishSection(array, section);
    }

    emitElements(array: ByteArray): void {
        //TODO
    }

    emitFunctionBodies(array: ByteArray): void {
        if (this.firstFunction == null) {
            return;
        }

        var section = wasmStartSection(array, WasmSection.Code, "function_bodies");
        wasmWriteVarUnsigned(array, this.functionCount);

        var fn = this.firstFunction;
        while (fn != null) {
            var bodyLength = array.length();
            wasmWriteVarUnsigned(array, ~0); // This will be patched later

            /**
             * Looks weird, only 1 local entry and int32 values?
             */
            if (fn.intLocalCount > 0) {
                wasmWriteVarUnsigned(array, 1); //local_count
                //local_entry
                wasmWriteVarUnsigned(array, fn.intLocalCount); //count
                array.append(WasmType.I32); //value_type
            } else {
                wasmWriteVarUnsigned(array, 0);
            }

            var child = fn.symbol.node.functionBody().firstChild;
            while (child != null) {
                this.emitNode(array, child);
                child = child.nextSibling;
            }

            wasmWriteVarUnsigned(array, 0x0b); //end, 0x0b, indicating the end of the body
            wasmPatchVarUnsigned(array, bodyLength, array.length() - bodyLength - 5, ~0);
            fn = fn.next;
        }

        wasmFinishSection(array, section);
    }

    emitDataSegments(array: ByteArray): void {
        this.growMemoryInitializer();
        var memoryInitializer = this.memoryInitializer;
        var initializerLength = memoryInitializer.length();
        var initialHeapPointer = alignToNextMultipleOf(WASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);

        // Pass the initial heap pointer to the "malloc" function
        ByteArray_set32(memoryInitializer, this.currentHeapPointer, initialHeapPointer);
        ByteArray_set32(memoryInitializer, this.originalHeapPointer, initialHeapPointer);

        var section = wasmStartSection(array, WasmSection.Data, "data_segments");

        // This only writes one single section containing everything
        wasmWriteVarUnsigned(array, 1);

        //data_segment
        wasmWriteVarUnsigned(array, 0); //index, the linear memory index (0 in the MVP)

        //offset, an i32 initializer expression that computes the offset at which to place the data
        //FIXME: This could be wrong
        wasmWriteVarUnsigned(array, WASM_OPCODE_I32_CONST);
        wasmWriteVarUnsigned(array, array.length() + 5); //const value
        wasmWriteVarUnsigned(array, 0x0b); //end opcode

        wasmWriteVarUnsigned(array, initializerLength); //size, size of data (in bytes)

        // Emit the range of the memory initializer
        // wasmWriteVarUnsigned(array, WASM_MEMORY_INITIALIZER_BASE);
        // wasmWriteVarUnsigned(array, initializerLength);

        //data, sequence of size bytes
        // Copy the entire memory initializer (also includes zero-initialized data for now)
        var i = 0;
        while (i < initializerLength) {
            array.append(memoryInitializer.get(i));
            i = i + 1;
        }

        wasmFinishSection(array, section);
    }

    emitNames(array: ByteArray): void {
        var section = wasmStartSection(array, 0, "names");
        wasmWriteVarUnsigned(array, this.functionCount);

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
            wasmWriteLengthPrefixedASCII(array, name);
            wasmWriteVarUnsigned(array, 0); // No local variables for now
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
            var symbol = node.symbol;

            if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                var sizeOf = symbol.resolvedType.variableSizeOf(this.context);
                var value = symbol.node.variableValue().intValue;
                var memoryInitializer = this.memoryInitializer;

                // Copy the initial value into the memory initializer
                this.growMemoryInitializer();
                if (sizeOf == 1) memoryInitializer.set(symbol.offset, value);
                else if (sizeOf == 2) ByteArray_set16(memoryInitializer, symbol.offset, value);
                else if (sizeOf == 4) ByteArray_set32(memoryInitializer, symbol.offset, value);
                else assert(false);

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

            // Only export "extern" functions
            if (node.isExtern()) {
                fn.isExported = true;
            }

            // Assign local variable offsets
            wasmAssignLocalVariableOffsets(body, shared);
            fn.intLocalCount = shared.intLocalCount;
        }

        var child = node.firstChild;
        while (child != null) {
            this.prepareToEmit(child);
            child = child.nextSibling;
        }
    }

    emitBinaryExpression(array: ByteArray, node: Node, opcode: byte): void {
        array.append(opcode);
        this.emitNode(array, node.binaryLeft());
        this.emitNode(array, node.binaryRight());
    }

    emitLoadFromMemory(array: ByteArray, type: Type, relativeBase: Node, offset: int32): void {
        var sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            array.append(type.isUnsigned() ? WASM_OPCODE_I32_LOAD8_U : WASM_OPCODE_I32_LOAD8_S);
            wasmWriteVarUnsigned(array, 0);
        }

        else if (sizeOf == 2) {
            array.append(type.isUnsigned() ? WASM_OPCODE_I32_LOAD16_U : WASM_OPCODE_I32_LOAD16_S);
            wasmWriteVarUnsigned(array, 1);
        }

        else if (sizeOf == 4) {
            array.append(WASM_OPCODE_I32_LOAD);
            wasmWriteVarUnsigned(array, 2);
        }

        else {
            assert(false);
        }

        wasmWriteVarUnsigned(array, offset);

        // Relative address
        if (relativeBase != null) {
            this.emitNode(array, relativeBase);
        }

        // Absolute address
        else {
            array.append(WASM_OPCODE_I32_CONST);
            wasmWriteVarUnsigned(array, 0);
        }
    }

    emitStoreToMemory(array: ByteArray, type: Type, relativeBase: Node, offset: int32, value: Node): void {
        var sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            array.append(WASM_OPCODE_I32_STORE8);
            wasmWriteVarUnsigned(array, 0);
        }

        else if (sizeOf == 2) {
            array.append(WASM_OPCODE_I32_STORE16);
            wasmWriteVarUnsigned(array, 1);
        }

        else if (sizeOf == 4) {
            array.append(WASM_OPCODE_I32_STORE);
            wasmWriteVarUnsigned(array, 2);
        }

        else {
            assert(false);
        }

        wasmWriteVarUnsigned(array, offset);

        // Relative address
        if (relativeBase != null) {
            this.emitNode(array, relativeBase);
        }

        // Absolute address
        else {
            array.append(WASM_OPCODE_I32_CONST);
            wasmWriteVarUnsigned(array, 0);
        }

        this.emitNode(array, value);
    }

    emitNode(array: ByteArray, node: Node): int32 {
        assert(!isExpression(node) || node.resolvedType != null);

        if (node.kind == NodeKind.BLOCK) {
            array.append(WASM_OPCODE_BLOCK);
            var offset = array.length();
            wasmWriteVarUnsigned(array, ~0);
            var count = 0;
            var child = node.firstChild;
            while (child != null) {
                count = count + this.emitNode(array, child);
                child = child.nextSibling;
            }
            wasmPatchVarUnsigned(array, offset, count, ~0);
        }

        else if (node.kind == NodeKind.WHILE) {
            var value = node.whileValue();
            var body = node.whileBody();

            // Ignore "while (false) { ... }"
            if (value.kind == NodeKind.BOOLEAN && value.intValue == 0) {
                return 0;
            }

            array.append(WASM_OPCODE_LOOP);
            var offset = array.length();
            wasmWriteVarUnsigned(array, ~0);
            var count = 0;

            // Emit the condition as "loop { if (!condition) break; }" as long as it's not a "while (true)" loop
            if (value.kind != NodeKind.BOOLEAN) {
                array.append(WASM_OPCODE_BR_IF);
                wasmWriteVarUnsigned(array, 1); // Break out of the immediately enclosing loop
                array.append(WASM_OPCODE_NOP); // This is a statement, not an expression
                array.append(WASM_OPCODE_I32_EQZ); // The conditional is flipped
                this.emitNode(array, value);
                count = count + 1;
            }

            var child = body.firstChild;
            while (child != null) {
                count = count + this.emitNode(array, child);
                child = child.nextSibling;
            }

            // Jump back to the top (this doesn't happen automatically)
            array.append(WASM_OPCODE_BR);
            wasmWriteVarUnsigned(array, 0); // Continue back to the immediately enclosing loop
            array.append(WASM_OPCODE_NOP); // This is a statement, not an expression
            count = count + 1;

            wasmPatchVarUnsigned(array, offset, count, ~0);
        }

        else if (node.kind == NodeKind.BREAK || node.kind == NodeKind.CONTINUE) {
            var label = 0;
            var parent = node.parent;

            while (parent != null && parent.kind != NodeKind.WHILE) {
                if (parent.kind == NodeKind.BLOCK) {
                    label = label + 1;
                }
                parent = parent.parent;
            }

            assert(label > 0);
            array.append(WASM_OPCODE_BR);
            wasmWriteVarUnsigned(array, label - (node.kind == NodeKind.BREAK ? 0 : 1));
            array.append(WASM_OPCODE_NOP); // This is a statement, not an expression
        }

        else if (node.kind == NodeKind.EMPTY) {
            return 0;
        }

        else if (node.kind == NodeKind.EXPRESSION) {
            this.emitNode(array, node.expressionValue());
        }

        else if (node.kind == NodeKind.RETURN) {
            var value = node.returnValue();
            array.append(WASM_OPCODE_RETURN);
            if (value != null) {
                this.emitNode(array, value);
            }
        }

        else if (node.kind == NodeKind.VARIABLES) {
            var count = 0;
            var child = node.firstChild;
            while (child != null) {
                assert(child.kind == NodeKind.VARIABLE);
                count = count + this.emitNode(array, child);
                child = child.nextSibling;
            }
            return count;
        }

        else if (node.kind == NodeKind.IF) {
            var branch = node.ifFalse();
            array.append(branch == null ? WASM_OPCODE_IF : WASM_OPCODE_IF_ELSE);
            this.emitNode(array, node.ifValue());
            this.emitNode(array, node.ifTrue());
            if (branch != null) {
                this.emitNode(array, branch);
            }
        }

        else if (node.kind == NodeKind.HOOK) {
            array.append(WASM_OPCODE_IF_ELSE);
            this.emitNode(array, node.hookValue());
            this.emitNode(array, node.hookTrue());
            this.emitNode(array, node.hookFalse());
        }

        else if (node.kind == NodeKind.VARIABLE) {
            var value = node.variableValue();

            if (node.symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                array.append(WASM_OPCODE_SET_LOCAL);
                wasmWriteVarUnsigned(array, node.symbol.offset);

                if (value != null) {
                    this.emitNode(array, value);
                }

                // Default initialization
                else {
                    array.append(WASM_OPCODE_I32_CONST);
                    wasmWriteVarSigned(array, 0);
                }
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.NAME) {
            var symbol = node.symbol;

            if (symbol.kind == SymbolKind.VARIABLE_ARGUMENT || symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                array.append(WASM_OPCODE_GET_LOCAL);
                wasmWriteVarUnsigned(array, symbol.offset);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
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
            array.append(WASM_OPCODE_I32_CONST);
            wasmWriteVarSigned(array, 0);
        }

        else if (node.kind == NodeKind.INT32 || node.kind == NodeKind.BOOLEAN) {
            array.append(WASM_OPCODE_I32_CONST);
            wasmWriteVarSigned(array, node.intValue);
        }

        else if (node.kind == NodeKind.STRING) {
            array.append(WASM_OPCODE_I32_CONST);
            wasmWriteVarSigned(array, WASM_MEMORY_INITIALIZER_BASE + node.intValue);
        }

        else if (node.kind == NodeKind.CALL) {
            var value = node.callValue();
            var symbol = value.symbol;
            assert(isFunction(symbol.kind));

            array.append(symbol.node.functionBody() == null ? WASM_OPCODE_CALL_IMPORT : WASM_OPCODE_CALL);
            wasmWriteVarUnsigned(array, symbol.offset);

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

            array.append(WASM_OPCODE_CALL);
            wasmWriteVarUnsigned(array, this.mallocFunctionIndex);

            // Pass the object size as the first argument
            assert(size > 0);
            array.append(WASM_OPCODE_I32_CONST);
            wasmWriteVarSigned(array, size);
        }

        else if (node.kind == NodeKind.POSITIVE) {
            this.emitNode(array, node.unaryValue());
        }

        else if (node.kind == NodeKind.NEGATIVE) {
            array.append(WASM_OPCODE_I32_SUB);
            array.append(WASM_OPCODE_I32_CONST);
            wasmWriteVarSigned(array, 0);
            this.emitNode(array, node.unaryValue());
        }

        else if (node.kind == NodeKind.COMPLEMENT) {
            array.append(WASM_OPCODE_I32_XOR);
            array.append(WASM_OPCODE_I32_CONST);
            wasmWriteVarSigned(array, ~0);
            this.emitNode(array, node.unaryValue());
        }

        else if (node.kind == NodeKind.NOT) {
            array.append(WASM_OPCODE_I32_EQZ);
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
                    array.append(WASM_OPCODE_I32_SHR_S);
                    array.append(WASM_OPCODE_I32_SHL);
                    this.emitNode(array, value);
                    array.append(WASM_OPCODE_I32_CONST);
                    wasmWriteVarSigned(array, shift);
                    array.append(WASM_OPCODE_I32_CONST);
                    wasmWriteVarSigned(array, shift);
                }

                // Mask
                else if (type == context.byteType || type == context.ushortType) {
                    array.append(WASM_OPCODE_I32_AND);
                    this.emitNode(array, value);
                    array.append(WASM_OPCODE_I32_CONST);
                    wasmWriteVarSigned(array, type.integerBitMask(this.context));
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
            var left = node.binaryLeft();
            var right = node.binaryRight();
            var symbol = left.symbol;

            if (left.kind == NodeKind.DEREFERENCE) {
                this.emitStoreToMemory(array, left.resolvedType.underlyingType(this.context), left.unaryValue(), 0, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitStoreToMemory(array, symbol.resolvedType, left.dotTarget(), symbol.offset, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                this.emitStoreToMemory(array, symbol.resolvedType, null, WASM_MEMORY_INITIALIZER_BASE + symbol.offset, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_ARGUMENT || symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                array.append(WASM_OPCODE_SET_LOCAL);
                wasmWriteVarUnsigned(array, symbol.offset);
                this.emitNode(array, right);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.LOGICAL_AND) {
            array.append(WASM_OPCODE_IF_ELSE);
            this.emitNode(array, node.binaryLeft());
            this.emitNode(array, node.binaryRight());
            array.append(WASM_OPCODE_I32_CONST);
            wasmWriteVarSigned(array, 0);
        }

        else if (node.kind == NodeKind.LOGICAL_OR) {
            array.append(WASM_OPCODE_IF_ELSE);
            this.emitNode(array, node.binaryLeft());
            array.append(WASM_OPCODE_I32_CONST);
            wasmWriteVarSigned(array, 1);
            this.emitNode(array, node.binaryRight());
        }

        else {
            var isUnsigned = node.isUnsignedOperator();

            if (node.kind == NodeKind.ADD) {
                var left = node.binaryLeft();
                var right = node.binaryRight();

                array.append(WASM_OPCODE_I32_ADD);
                this.emitNode(array, left);

                if (left.resolvedType.pointerTo == null) {
                    this.emitNode(array, right);
                }

                // Need to multiply the right by the size of the pointer target
                else {
                    assert(right.resolvedType.isInteger());
                    var size = left.resolvedType.pointerTo.allocationSizeOf(this.context);

                    if (size == 2) {
                        if (right.kind == NodeKind.INT32) {
                            array.append(WASM_OPCODE_I32_CONST);
                            wasmWriteVarSigned(array, right.intValue << 1);
                        }

                        else {
                            array.append(WASM_OPCODE_I32_SHL);
                            this.emitNode(array, right);
                            array.append(WASM_OPCODE_I32_CONST);
                            wasmWriteVarSigned(array, 1);
                        }
                    }

                    else if (size == 4) {
                        if (right.kind == NodeKind.INT32) {
                            array.append(WASM_OPCODE_I32_CONST);
                            wasmWriteVarSigned(array, right.intValue << 2);
                        }

                        else {
                            array.append(WASM_OPCODE_I32_SHL);
                            this.emitNode(array, right);
                            array.append(WASM_OPCODE_I32_CONST);
                            wasmWriteVarSigned(array, 2);
                        }
                    }

                    else {
                        this.emitNode(array, right);
                    }
                }
            }

            else if (node.kind == NodeKind.BITWISE_AND) this.emitBinaryExpression(array, node, WASM_OPCODE_I32_AND);
            else if (node.kind == NodeKind.BITWISE_OR) this.emitBinaryExpression(array, node, WASM_OPCODE_I32_OR);
            else if (node.kind == NodeKind.BITWISE_XOR) this.emitBinaryExpression(array, node, WASM_OPCODE_I32_XOR);
            else if (node.kind == NodeKind.EQUAL) this.emitBinaryExpression(array, node, WASM_OPCODE_I32_EQ);
            else if (node.kind == NodeKind.MULTIPLY) this.emitBinaryExpression(array, node, WASM_OPCODE_I32_MUL);
            else if (node.kind == NodeKind.NOT_EQUAL) this.emitBinaryExpression(array, node, WASM_OPCODE_I32_NE);
            else if (node.kind == NodeKind.SHIFT_LEFT) this.emitBinaryExpression(array, node, WASM_OPCODE_I32_SHL);
            else if (node.kind == NodeKind.SUBTRACT) this.emitBinaryExpression(array, node, WASM_OPCODE_I32_SUB);

            else if (node.kind == NodeKind.DIVIDE) this.emitBinaryExpression(array, node, isUnsigned ? WASM_OPCODE_I32_DIV_U : WASM_OPCODE_I32_DIV_S);
            else if (node.kind == NodeKind.GREATER_THAN) this.emitBinaryExpression(array, node, isUnsigned ? WASM_OPCODE_I32_GT_U : WASM_OPCODE_I32_GT_S);
            else if (node.kind == NodeKind.GREATER_THAN_EQUAL) this.emitBinaryExpression(array, node, isUnsigned ? WASM_OPCODE_I32_GE_U : WASM_OPCODE_I32_GE_S);
            else if (node.kind == NodeKind.LESS_THAN) this.emitBinaryExpression(array, node, isUnsigned ? WASM_OPCODE_I32_LT_U : WASM_OPCODE_I32_LT_S);
            else if (node.kind == NodeKind.LESS_THAN_EQUAL) this.emitBinaryExpression(array, node, isUnsigned ? WASM_OPCODE_I32_LE_U : WASM_OPCODE_I32_LE_S);
            else if (node.kind == NodeKind.REMAINDER) this.emitBinaryExpression(array, node, isUnsigned ? WASM_OPCODE_I32_REM_U : WASM_OPCODE_I32_REM_S);
            else if (node.kind == NodeKind.SHIFT_RIGHT) this.emitBinaryExpression(array, node, isUnsigned ? WASM_OPCODE_I32_SHR_U : WASM_OPCODE_I32_SHR_S);

            else {
                assert(false);
            }
        }

        return 1;
    }

    getWasmType(type: Type): WasmType {
        var context = this.context;

        if (type == context.booleanType || type.isInteger() || type.isFloat() || type.isReference()) {
            return WasmType.I32;
        }

        if (type == context.voidType) {
            return WasmType.VOID;
        }

        assert(false);
        return WasmType.VOID;
    }
}

function wasmPatchVarUnsigned(array: ByteArray, offset: int32, value: int32, maxValue: int32): void {
    var current = value;
    var max = maxValue;
    while (true) {
        var element = current & 127;
        current = current >> 7;
        max = max >> 7;
        if (max != 0) {
            element = element | 128;
        }
        array.set(offset, element);
        offset = offset + 1;
        if (max == 0) {
            break;
        }
    }
}

function wasmWriteVarUnsigned(array: ByteArray, value: int32): void {
    var current = value;
    while (true) {
        var element = current & 127;
        current = current >> 7;
        if (current != 0) {
            element = element | 128;
        }
        array.append(element);
        if (current == 0) {
            break;
        }
    }
}

function wasmWriteVarSigned(array: ByteArray, value: int32): void {
    while (true) {
        var element = value & 127;
        value = value >> 7;
        var done =
            value == 0 && (element & 64) == 0 ||
            value == -1 && (element & 64) != 0;
        if (!done) {
            element = element | 128;
        }
        array.append(element);
        if (done) {
            break;
        }
    }
}

function wasmWriteLengthPrefixedASCII(array: ByteArray, value: string): void {
    var length = value.length;
    wasmWriteVarUnsigned(array, length);
    var index = array.length();
    array.resize(index + length);
    var i = 0;
    while (i < length) {
        array.set(index + i, value.charCodeAt(i));
        i = i + 1;
    }
}

function wasmStartSection(array: ByteArray, id: int32, name: string): int32 {
    var offset = array.length();
    wasmWriteVarUnsigned(array, id);//section code
    wasmWriteVarUnsigned(array, ~0);//size of this section in bytes, will be filled in later
    if (id == 0) {
        wasmWriteLengthPrefixedASCII(array, name);
    }
    return offset;
}

function wasmFinishSection(array: ByteArray, offset: int32): void {
    wasmPatchVarUnsigned(array, offset + 1, array.length() - offset - 6, ~0);
}

function wasmWrapType(id: WasmType): WasmWrappedType {
    assert(id == WasmType.VOID || id == WasmType.I32);
    var type = new WasmWrappedType();
    type.id = id;
    return type;
}

class WasmSharedOffset {
    nextLocalOffset: int32;
    intLocalCount: int32;
}

function wasmAssignLocalVariableOffsets(node: Node, shared: WasmSharedOffset): void {
    if (node.kind == NodeKind.VARIABLE) {
        assert(node.symbol.kind == SymbolKind.VARIABLE_LOCAL);
        node.symbol.offset = shared.nextLocalOffset;
        shared.nextLocalOffset = shared.nextLocalOffset + 1;
        shared.intLocalCount = shared.intLocalCount + 1;
    }

    var child = node.firstChild;
    while (child != null) {
        wasmAssignLocalVariableOffsets(child, shared);
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
    assert(module.mallocFunctionIndex != -1);
    assert(module.currentHeapPointer != -1);
    assert(module.originalHeapPointer != -1);

    compiler.outputWASM = new ByteArray();
    module.emitModule(compiler.outputWASM);
}
