import {isFunction, Symbol, SymbolKind} from "../../compiler/core/symbol";
import {ByteByteArray_set32, ByteArray_setString, ByteArray, ByteArray_set32} from "../../utils/bytearray";
import {CheckContext} from "../../compiler/analyzer/type-checker";
import {alignToNextMultipleOf, toHex} from "../../utils/utils";
import {isExpression, isUnary, isUnaryPostfix, Node, NodeKind} from "../../compiler/core/node";
import {Type} from "../../compiler/core/type";
import {Compiler} from "../../compiler/compiler";
import {WasmOpcode} from "./opcode";
import {getBuiltinOpcode, isBuiltin} from "./builtins-helper";
import {assert} from "../../utils/assert";
import {WasmType, WasmTypeToString, WasmWrappedType} from "./core/wasm-type";
import {log, logData} from "./utils/logger";
import {wasmAreSignaturesEqual, WasmSignature} from "./core/wasm-signature";
import {Bitness} from "../bitness";
import {WasmSection} from "./core/wasm-section";
import {WasmExternalKind} from "./core/wasm-external-kind";
import {WasmGlobal} from "./core/wasm-global";
import {WasmFunction} from "./core/wasm-function";
import {WasmImport} from "./core/wasm-import";
import {WasmLocal} from "./core/wasm-local";
import {WasmSharedOffset} from "./core/wasm-shared-offset";
import {append, WasmAssembler} from "./assembler/wasm-assembler";
import {Terminal} from "../../utils/terminal";
import {
    getTypedArrayElementSize,
    getWasmFunctionName,
    symbolToWasmType,
    typeToDataType
} from "./utils";
import {WasmOptimizer} from "./optimizer/wasm-optimizer";
import {SignatureSection} from "./wasm/sections/signature-section";
import {ImportSection} from "./wasm/sections/import-section";
import {FunctionSection} from "./wasm/sections/function-section";
import {MemorySection} from "./wasm/sections/memory-section";
import {WasmMemory} from "./core/wasm-memory";
import {WasmModule} from "./wasm/wasm-module";
import {WasmBinary} from "./wasm/wasm-binary";
import {GlobalSection} from "./wasm/sections/global-section";

class WasmModuleEmitter {
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

    emitModule(): void {
        this.emitSignatures();
        this.emitImportTable();
        this.emitFunctionDeclarations();
        // this.emitTables();
        this.emitMemory();
        this.emitGlobalDeclarations();
        this.emitExportTable();
        this.emitStart();
        this.emitElements();
        this.emitFunctionBodies();
        this.emitDataSegments();
        // this.emitNames(array);
        this.assembler.finish();
    }

    emitSignatures(): void {
        let section = this.assembler.startSection(WasmSection.Signature) as SignatureSection;
        let signatures = section.signatures;
        let offset = 0;
        signatures.forEach((signature, index) => {
            // Emit signature
            section.code.append(`(type (;${index};) (func`);
            log(section.payload, offset, WasmType.func, "func sig " + index);
            this.assembler.writeUnsignedLEB128(WasmType.func); //form, the value for the func type constructor
            log(section.payload, offset, signature.argumentTypes.length, "num params");
            this.assembler.writeUnsignedLEB128(signature.argumentTypes.length); //param_count, the number of parameters to the function
            if (signature.argumentTypes.length > 0) {
                section.code.append(` (param`);
            }

            signature.argumentTypes.forEach(type => {
                log(section.payload, offset, type, WasmType[type]);
                this.assembler.writeUnsignedLEB128(type); //value_type, the parameter types of the function
                section.code.append(` ${WasmTypeToString[type]}`);
            });

            if (signature.argumentTypes.length > 0) {
                section.code.append(`)`);
            }

            if (signature.returnType !== WasmType.VOID) {
                log(section.payload, offset, 1, "num results");
                this.assembler.writeUnsignedLEB128(1); //return_count, the number of results from the function
                log(section.payload, offset, signature.returnType, WasmType[signature.returnType]);
                this.assembler.writeUnsignedLEB128(signature.returnType);
                section.code.append(` (result ${WasmTypeToString[signature.returnType]})`);
            } else {
                this.assembler.writeUnsignedLEB128(0);
            }

            section.code.append("))\n");
        });
        this.assembler.endSection(section);
    }

    emitImportTable(): void {
        if (this.assembler.module.importCount == 0) {
            return;
        }

        let section = this.assembler.startSection(WasmSection.Import)  as ImportSection;
        let imports = section.imports;
        let offset = 0;

        log(section.payload, offset, imports.length, "num imports");
        this.assembler.writeUnsignedLEB128(imports.length);

        imports.forEach((_import, index) => {
            log(section.payload, offset, null, `import func (${index}) ${_import.namespace} ${_import.name}`);
            section.code.append(`(import "${_import.namespace}" "${_import.name}" (func (;${index};) (type ${_import.signatureIndex})))\n`);
            this.assembler.writeWasmString(_import.namespace);
            this.assembler.writeWasmString(_import.name);
            this.assembler.writeUnsignedLEB128(WasmExternalKind.Function);
            this.assembler.writeUnsignedLEB128(_import.signatureIndex);
        });

        this.assembler.endSection(section);
    }

    emitFunctionDeclarations(): void {
        if(this.assembler.module.functionCount === 0){
            return;
        }

        let section = this.assembler.startSection(WasmSection.Function) as FunctionSection;
        let functions = section.functions;
        let offset = 0;
        log(section.payload, offset, functions.length, "num functions");
        this.assembler.writeUnsignedLEB128(functions.length);

        let importCount = this.assembler.module.importCount;
        functions.forEach((fn, index) => {
            log(section.payload, offset, fn.signatureIndex, `func ${importCount + index} sig ${getWasmFunctionName(fn.symbol)}`);
            this.assembler.writeUnsignedLEB128(fn.signatureIndex);
        });

        this.assembler.endSection(section);
    }

    emitTables(): void {
        //TODO
    }

    emitMemory(): void {
        let section = this.assembler.startSection(WasmSection.Memory) as MemorySection;
        let memory = section.memory;
        if(memory.length > 1) {
            Terminal.warn("More than 1 memory found, In the MVP, the number of memories must be no more than 1.")
        }
        let offset = 0;
        log(section.payload, offset, memory.length, "num memories");
        this.assembler.writeUnsignedLEB128(1); //indicating the number of memories defined by the namespace, In the MVP, the number of memories must be no more than 1.
        //resizable_limits
        log(section.payload, offset, 0, "memory flags");
        this.assembler.writeUnsignedLEB128(WasmBinary.SET_MAX_MEMORY ? 0x1 : 0); //flags, bit 0x1 is set if the maximum field is present
        log(section.payload, offset, WasmBinary.SIZE_IN_PAGES, "memory initial pages");
        this.assembler.writeUnsignedLEB128(WasmBinary.SIZE_IN_PAGES); //initial length (in units of table elements or wasm pages)
        if (WasmBinary.SET_MAX_MEMORY) {
            log(section.payload, offset, WasmBinary.MAX_MEMORY, "maximum memory");
            this.assembler.writeUnsignedLEB128(WasmBinary.MAX_MEMORY);// maximum, only present if specified by flags
        }
        section.code.append("(memory (;0;) 1)\n");
        this.assembler.endSection(section);
    }

    emitGlobalDeclarations(): void {
        if (this.assembler.module.globalCount === 0) {
            return;
        }

        let section = this.assembler.startSection(WasmSection.Global) as GlobalSection;
        let globals = section.globals;
        this.assembler.writeUnsignedLEB128(globals.length);
        this.assembler.stackTracer.setGlobals(globals);

        globals.forEach((global, index) => {
            let dataType: string = typeToDataType(global.symbol.resolvedType, this.bitness);
            let value = global.symbol.node.variableValue();
            section.payload.append(WasmType[dataType]); //content_type
            this.assembler.writeUnsignedLEB128(1); //mutability, 0 if immutable, 1 if mutable. MVP only support immutable global variables
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

            this.assembler.appendOpcode(offset, WasmOpcode[`${dataType}_CONST`], rawValue);
            switch (dataType) {
                case "I32":
                    this.assembler.writeUnsignedLEB128(rawValue);
                    break;
                case "I64":
                    this.assembler.writeUnsignedLEB128(rawValue);
                    break;
                case "F32":
                    this.assembler.writeFloat(section.payload, rawValue);
                    break;
                case "F64":
                    this.assembler.writeDouble(section.payload, rawValue);
                    break;
            }
            let wasmTypeStr = WasmTypeToString[WasmType[dataType]];
            section.code.append(`(global (;${count++};) (mut ${wasmTypeStr}) (${wasmTypeStr}.const ${rawValue}))\n`);
            this.assembler.appendOpcode(offset, WasmOpcode.END);
        });

        let global = this.firstGlobal;
        let count = 0;
        while (global) {
            let dataType: string = typeToDataType(global.symbol.resolvedType, this.bitness);
            let value = global.symbol.node.variableValue();
            section.payload.append(WasmType[dataType]); //content_type
            this.assembler.writeUnsignedLEB128(1); //mutability, 0 if immutable, 1 if mutable. MVP only support immutable global variables
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

            this.assembler.appendOpcode(offset, WasmOpcode[`${dataType}_CONST`], rawValue);
            switch (dataType) {
                case "I32":
                    this.assembler.writeUnsignedLEB128(rawValue);
                    break;
                case "I64":
                    this.assembler.writeUnsignedLEB128(rawValue);
                    break;
                case "F32":
                    this.assembler.writeFloat(section.payload, rawValue);
                    break;
                case "F64":
                    this.assembler.writeDouble(section.payload, rawValue);
                    break;
            }
            let wasmTypeStr = WasmTypeToString[WasmType[dataType]];
            section.code.append(`(global (;${count++};) (mut ${wasmTypeStr}) (${wasmTypeStr}.const ${rawValue}))\n`);
            this.assembler.appendOpcode(offset, WasmOpcode.END);

            global = global.next;
        }

        this.assembler.endSection(section);
    }

    addGlobalToStartFunction(global: WasmGlobal): void {
        let value = global.symbol.node.variableValue();
        let startFn = this.startFunction;

        this.emitNode(startFn.body, 0, value);
        this.assembler.appendOpcode(startFn.body, 0, WasmOpcode.SET_GLOBAL);
        this.assembler.writeUnsignedLEB128(startFn.body, global.symbol.offset);
    }

    emitExportTable(): void {
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

        let section = this.assembler.startSection(WasmSection.Export, "export_table");
        log(section.payload, offset, exportedCount, "num exports");
        this.assembler.writeUnsignedLEB128(exportedCount + 1);

        //Export main memory
        let memoryName: string = "memory";
        log(section.payload, offset, memoryName.length, "export name length");
        log(section.payload, null, null, `${toHex(section.payload.position + offset + 4)}: ${memoryName} // export name`);
        this.assembler.writeWasmString(memoryName);
        log(section.payload, offset, WasmExternalKind.Function, "export kind");
        this.assembler.writeUnsignedLEB128(WasmExternalKind.Memory);
        log(section.payload, offset, 0, "export memory index");
        this.assembler.writeUnsignedLEB128(0);
        section.code.append(`(export "memory" (memory 0))\n`);
        let i = this.assembler.module.importCount;
        fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                let fnName: string = getWasmFunctionName(fn.symbol);
                log(section.payload, offset, fnName.length, "export name length");
                log(section.payload, null, null, `${toHex(section.payload.position + offset + 4)}: ${fnName} // export name`);
                this.assembler.writeWasmString(fnName);
                log(section.payload, offset, WasmExternalKind.Function, "export kind");
                this.assembler.writeUnsignedLEB128(WasmExternalKind.Function);
                log(section.payload, offset, i, "export func index");
                this.assembler.writeUnsignedLEB128(i);

                section.code.append(`(export "${fnName}" (func $${fnName}))\n`);
            }
            fn = fn.next;
            i = i + 1;
        }

        this.assembler.endSection(section);
    }

    emitStart(): void {
        if (this.startFunctionIndex != -1) {
            let section = this.assembler.startSection(WasmSection.Start, "start_function");
            log(section.payload, offset, this.startFunctionIndex, "start function index");
            section.code.append(`(start ${this.assembler.module.importCount + this.startFunctionIndex})\n`);
            this.assembler.writeUnsignedLEB128(this.assembler.module.importCount + this.startFunctionIndex);
            this.assembler.endSection(section);
        }
    }

    emitElements(): void {
        //TODO
    }

    emitFunctionBodies(): void {
        if (!this.firstFunction) {
            return;
        }
        let offset = 0;
        let signatures = (this.assembler.module.binary.getSection(WasmSection.Signature) as SignatureSection).signatures;
        let section = this.assembler.startSection(WasmSection.Code, "function_bodies");
        log(section.payload, offset, this.assembler.module.functionCount, "num functions");
        this.assembler.writeUnsignedLEB128(this.assembler.module.functionCount);
        let count = 0;
        let fn = this.firstFunction;
        while (fn != null) {
            this.currentFunction = fn;
            let sectionOffset = offset + section.payload.position;
            let wasmFunctionName = getWasmFunctionName(fn.symbol);
            let bodyData = new ByteArray();
            log(bodyData, sectionOffset, fn.locals.length, "local var count");

            this.assembler.stackTracer.startFunction(this.assembler.module.importCount + count);

            /* wasm text format */
            section.code.append(`(func $${wasmFunctionName} (type ${fn.signatureIndex})`);

            fn.argumentVariables.forEach((argumentEntry) => {
                section.code.append(` (param $${argumentEntry.name} ${WasmTypeToString[argumentEntry.type]}) `);
            });
            let signature = signatures[fn.signatureIndex];
            if (signature.returnType !== WasmType.VOID) {
                section.code.append(`(result ${WasmTypeToString[signature.returnType]})`);
            }
            section.code.append("\n", 1);

            if (fn.localVariables.length > 0) {
                bodyData.writeUnsignedLEB128(fn.localVariables.length); //local_count

                // TODO: Optimize local declarations
                fn.localVariables.forEach((localVariableEntry) => {
                    log(bodyData, sectionOffset, 1, "local index");
                    bodyData.writeUnsignedLEB128(1); //count
                    log(bodyData, sectionOffset, localVariableEntry.type, WasmType[localVariableEntry.type]);
                    bodyData.append(localVariableEntry.type); //value_type

                    section.code.append(`(local $${localVariableEntry.name} ${WasmTypeToString[localVariableEntry.type]}) `);
                });

                section.code.append("\n");
            }
            else {
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

            this.assembler.appendOpcode(bodyData, sectionOffset, WasmOpcode.END, null, true); //end, 0x0b, indicating the end of the body

            this.assembler.stackTracer.endFunction();

            //Copy and finish body
            section.payload.writeUnsignedLEB128(bodyData.length);
            log(section.payload, offset, null, ` - func body ${this.assembler.module.importCount + (count++)} (${wasmFunctionName})`);
            log(section.payload, offset, bodyData.length, "func body size");
            section.payload.log += bodyData.log;
            section.payload.copy(bodyData);

            section.code.indent -= 1;
            section.code.removeLastLinebreak();
            section.code.append(`)\n`);

            fn = fn.next;
        }

        this
            .assembler
            .endSection(section);
    }

    emitDataSegments(): void {
        this.growMemoryInitializer();
        let memoryInitializer = this.memoryInitializer;
        let initializerLength = memoryInitializer.length;
        let initialHeapPointer = alignToNextMultipleOf(WASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);

        // Pass the initial heap pointer to the "malloc" function
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.originalHeapPointer);
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.currentHeapPointer);

        let section = this.assembler.startSection(Wasmsection.payload, "data_segments");

        // This only writes one single section containing everything
        log(section.payload, offset, 1, "num data segments");
        this.assembler.writeUnsignedLEB128(1);

        //data_segment
        log(section.payload, offset, null, " - data segment header 0");
        log(section.payload, offset, 0, "memory index");
        this.assembler.writeUnsignedLEB128(0); //index, the linear memory index (0 in the MVP)

        //offset, an i32 initializer expression that computes the offset at which to place the data
        this.assembler.appendOpcode(offset, WasmOpcode.I32_CONST);
        log(section.payload, offset, WASM_MEMORY_INITIALIZER_BASE, "i32 literal");
        this.assembler.writeUnsignedLEB128(WASM_MEMORY_INITIALIZER_BASE); //const value
        this.assembler.appendOpcode(offset, WasmOpcode.END);

        log(section.payload, offset, initializerLength, "data segment size");
        this.assembler.writeUnsignedLEB128(initializerLength); //size, size of data (in bytes)

        log(section.payload, offset, null, " - data segment data 0");
        //data, sequence of size bytes
        // Copy the entire memory initializer (also includes zero-initialized data for now)
        section.code.append(`(data (i32.const ${WASM_MEMORY_INITIALIZER_BASE}) "  `);
        let i = 0;
        let value;
        while (i < initializerLength) {
            for (let j = 0; j < 16; j++) {
                if (i + j < initializerLength) {
                    value = memoryInitializer.get(i + j);
                    section.payload.append(value);
                    section.code.append("\\" + toHex(value, 2));
                    logData(section.payload, offset, value, j == 0);
                }
            }
            section.payload.log += "\n";
            i = i + 16;
        }
        section.code.append('")\n');
        // section.payload.copy(memoryInitializer, initializerLength);

        this.assembler.endSection(section);
    }

    // Custom section for debug names
    //
    emitNames(): void {
        let section = this.assembler.startSection(0, "name");

        let subsectionFunc: ByteArray = new ByteArray();
        let subsectionLocal: ByteArray = new ByteArray();

        this.assembler.writeUnsignedLEB128(subsectionFunc, this.assembler.module.functionCount);
        this.assembler.writeUnsignedLEB128(subsectionLocal, this.assembler.module.functionCount);
        let fn = this.firstFunction;
        while (fn != null) {
            let fnIndex = this.assembler.module.importCount + fn.symbol.offset;
            let name = getWasmFunctionName(fn.symbol);
            this.assembler.writeUnsignedLEB128(subsectionFunc, fnIndex);
            this.assembler.writeWasmString(subsectionFunc, name);
            this.assembler.writeUnsignedLEB128(subsectionLocal, fnIndex);
            this.assembler.writeUnsignedLEB128(subsectionLocal, fn.locals.length);

            fn.locals.forEach((local, index) => {
                this.assembler.writeUnsignedLEB128(subsectionLocal, index);
                this.assembler.writeWasmString(subsectionLocal, local.name);
            });

            fn = fn.next;
        }

        //subsection for function names
        this.assembler.writeUnsignedLEB128(1); // name_type
        this.assembler.writeUnsignedLEB128(subsectionFunc.length); // name_payload_len
        section.payload.copy(subsectionFunc); // name_payload_data

        //subsection for local names
        this.assembler.writeUnsignedLEB128(2); // name_type
        this.assembler.writeUnsignedLEB128(subsectionLocal.length); // name_payload_len
        section.payload.copy(subsectionLocal); // name_payload_data

        this.assembler.endSection(section);
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

                let global = this.assembler.module.allocateGlobal(symbol, this.bitness);

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

            let returnType:Node = node.functionReturnType();
            let wasmReturnType = this.getWasmType(returnType.resolvedType);
            let shared = new WasmSharedOffset();
            let argumentTypesFirst: WasmWrappedType = null;
            let argumentTypesLast: WasmWrappedType = null;
            let symbol = node.symbol;
            let isConstructor: boolean = symbol.name == "constructor";
            let wasmFunctionName: string = getWasmFunctionName(symbol);

            // Make sure to include the implicit "this" variable as a normal argument
            let argument = node.isExternalImport() ? node.functionFirstArgumentIgnoringThis() : node.functionFirstArgument();
            let argumentVariables: WasmLocal[] = [];
            let argumentTypes: WasmType[] = [];
            while (argument != returnType) {
                let wasmType = this.getWasmType(argument.variableType().resolvedType);
                argumentVariables.push(new WasmLocal(wasmType, argument.symbol.name, argument.symbol, true));
                argumentTypes.push(wasmType);
                shared.nextLocalOffset = shared.nextLocalOffset + 1;
                argument = argument.nextSibling;
            }

            let signatureIndex = this.assembler.module.allocateSignature(argumentTypes, wasmReturnType);

            let body = node.functionBody();

            // Functions without bodies are imports
            if (body == null) {
                if (!isBuiltin(wasmFunctionName)) {
                    let moduleName = symbol.kind == SymbolKind.FUNCTION_INSTANCE ? symbol.parent().name : "global";
                    symbol.offset = this.assembler.module.importCount;
                    this.assembler.module.allocateImport(signatureIndex, moduleName, symbol.name);
                }
                node = node.nextSibling;
                return;
            } else {
                symbol.offset = this.assembler.module.functionCount;
            }

            let fn = this.assembler.module.allocateFunction(symbol, signatureIndex);
            fn.argumentVariables = argumentVariables;
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
            fn.locals = argumentVariables.concat(fn.localVariables);
        }

        let child = node.firstChild;
        while (child != null) {
            this.prepareToEmit(child);
            child = child.nextSibling;
        }
    }

    emitBinaryExpression(, byteOffset: int32, node: Node, opcode: uint8): void {
        this.emitNode(byteOffset, node.binaryLeft());
        this.emitNode(byteOffset, node.binaryRight());
        this.assembler.appendOpcode(byteOffset, opcode);
    }

    emitLoadFromMemory(, byteOffset: int32, type: Type, relativeBase: Node, offset: int32): void {
        let opcode;
        // Relative address
        if (relativeBase != null) {
            this.emitNode(byteOffset, relativeBase);
        }
        // Absolute address
        else {
            opcode = WasmOpcode.I32_CONST;
            this.assembler.appendOpcode(byteOffset, opcode);
            log(byteOffset, 0, "i32 literal");
            this.assembler.writeUnsignedLEB128(0);
        }

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            opcode = type.isUnsigned() ? WasmOpcode.I32_LOAD8_U : WasmOpcode.I32_LOAD8_S;
            this.assembler.appendOpcode(byteOffset, opcode);
            log(byteOffset, 0, "alignment");
            this.assembler.writeUnsignedLEB128(0);
        }

        else if (sizeOf == 2) {
            opcode = type.isUnsigned() ? WasmOpcode.I32_LOAD16_U : WasmOpcode.I32_LOAD16_S;
            this.assembler.appendOpcode(byteOffset, opcode);
            log(byteOffset, 1, "alignment");
            this.assembler.writeUnsignedLEB128(1);
        }

        else if (sizeOf == 4 || type.isClass()) {

            if (type.isFloat()) {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_LOAD);
            }

            else {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_LOAD);
            }
            log(byteOffset, 2, "alignment");
            this.assembler.writeUnsignedLEB128(2);
        }

        else if (sizeOf == 8) {

            if (type.isDouble()) {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_LOAD);
            }

            else {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_LOAD);
            }
            log(byteOffset, 3, "alignment");
            this.assembler.writeUnsignedLEB128(3);
        }

        else {
            assert(false);
        }

        log(byteOffset, offset, "load offset");
        this.assembler.writeUnsignedLEB128(offset);

    }

    emitStoreToMemory(, byteOffset: int32, type: Type, relativeBase: Node, offset: int32, value: Node): void {
        // Relative address
        if (relativeBase != null
        ) {
            this.emitNode(byteOffset, relativeBase);
        }
        // Absolute address
        else {
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST);
            log(byteOffset, 0, "i32 literal");
            this.assembler.writeUnsignedLEB128(0);
        }

        this.emitNode(byteOffset, value);

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_STORE8);
            log(byteOffset, 0, "alignment");
            this.assembler.writeUnsignedLEB128(0);
        }

        else if (sizeOf == 2) {
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_STORE16);
            log(byteOffset, 1, "alignment");
            this.assembler.writeUnsignedLEB128(1);
        }

        else if (sizeOf == 4 || type.isClass()) {

            if (type.isFloat()) {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_STORE);
            }

            else {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_STORE);
            }
            log(byteOffset, 2, "alignment");
            this.assembler.writeUnsignedLEB128(2);
        }

        else if (sizeOf == 8) {

            if (type.isDouble()) {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_STORE);
            }

            else if (type.isLong()) {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_STORE);
            }

            log(byteOffset, 3, "alignment");
            this.assembler.writeUnsignedLEB128(3);
        }

        else {
            assert(false);
        }

        log(byteOffset, offset, "load offset");
        this.assembler.writeUnsignedLEB128(offset);
    }

    /**
     * Emit instance
     * @param array
     * @param byteOffset
     * @param node
     */
    emitInstance(, byteOffset: int32, node: Node): void {
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
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, length);
                this.assembler.writeLEB128(length); //array byteLength
            } else {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, size);
                this.assembler.writeLEB128(size);
                this.emitNode(byteOffset, lengthNode);
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_MUL); //array byteLength
            }

            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(size); // array element size

            let callIndex: int32 = this.getWasmFunctionCallIndex(callSymbol);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.CALL);
            log(byteOffset, callIndex, `call func index (${callIndex})`);
            this.assembler.writeUnsignedLEB128(callIndex);
        }
        else if (type.resolvedType.isTypedArray()) {
            // let elementSize = getTypedArrayElementSize(type.resolvedType.symbol.name);
            // this.assembler.appendOpcode(byteOffset, WasmOpcode.GET_LOCAL);
            // this.assembler.writeLEB128(0);
            // this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST);
            // this.assembler.writeLEB128(elementSize);
            // this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_SHL);
            // this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST);
            // this.assembler.writeLEB128(size);
            // this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_ADD);
        }
        else {

            // Emit constructor argumentVariables
            let child = node.firstChild.nextSibling;
            while (child != null) {
                this.emitNode(byteOffset, child);
                child = child.nextSibling;
            }

            let callIndex: int32 = this.getWasmFunctionCallIndex(callSymbol);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.CALL, callIndex);
            this.assembler.writeUnsignedLEB128(callIndex);
        }
    }

    /**
     * Emit constructor function where malloc happens
     * @param array
     * @param byteOffset
     * @param fn
     */
    emitConstructor(byteOffset: int32, fn: WasmFunction): void {
        let constructorNode: Node = fn.symbol.node;
        let type = constructorNode.parent.symbol;
        let size = type.resolvedType.allocationSizeOf(this.context);
        assert(size > 0);

        if (type.resolvedType.isArray()) {
            this.assembler.appendOpcode(byteOffset, WasmOpcode.GET_LOCAL, 0);
            this.assembler.writeUnsignedLEB128(0); // array parameter byteLength
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(size); // size of array class, default is 8 bytes
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_ADD);

        }
        else if (type.resolvedType.isTypedArray()) {
            let elementSize = getTypedArrayElementSize(type.resolvedType.symbol.name);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.GET_LOCAL, 0);
            this.assembler.writeUnsignedLEB128(0);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, elementSize);
            this.assembler.writeLEB128(elementSize);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_SHL);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(size);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_ADD);
        }
        else {
            // Pass the object size as the first argument
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, size);
            this.assembler.writeLEB128(size);
        }

        // Allocate memory
        let mallocIndex = this.calculateWasmFunctionIndex(this.mallocFunctionIndex);
        this.assembler.appendOpcode(byteOffset, WasmOpcode.CALL, mallocIndex);
        this.assembler.writeUnsignedLEB128(mallocIndex);
        this.assembler.appendOpcode(byteOffset, WasmOpcode.SET_LOCAL, fn.signature.argumentCount);
        this.assembler.writeUnsignedLEB128(fn.signature.argumentCount);
        // Set self pointer to first local variable which is immediate after the argument variable
    }

    emitNode(, byteOffset: int32, node: Node): int32 {
        // Assert
        assert(!isExpression(node) || node.resolvedType != null);

        if (node.kind == NodeKind.BLOCK) {
            /**
             * Skip emitting block if parent is 'if' or 'loop' since it is already a block
             */
            let skipBlock = node.parent.kind === NodeKind.IF;

            if (!skipBlock) {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.BLOCK);
                if (node.returnNode !== undefined) {
                    log(byteOffset, this.currentFunction.returnType, WasmType[this.currentFunction.returnType]);
                    array.append(this.currentFunction.returnType);
                    this.assembler.currentSection.code.removeLastLinebreak();
                    this.assembler.currentSection.code.append(" (result " + WasmTypeToString[this.currentFunction.returnType] + ")\n", 1);
                } else {
                    log(byteOffset, WasmType.block_type, WasmType[WasmType.block_type]);
                    array.append(WasmType.block_type);
                }
            }

            let child = node.firstChild;
            while (child != null) {
                this.emitNode(byteOffset, child);
                child = child.nextSibling;
            }

            if (!skipBlock) {
                this.assembler.currentSection.code.clearIndent(1);
                this.assembler.currentSection.code.indent -= 1;
                this.assembler.appendOpcode(byteOffset, WasmOpcode.END);
            }
        }

        else if (node.kind == NodeKind.WHILE) {
            let value = node.whileValue();
            let body = node.whileBody();

            // Ignore "while (false) { ... }"
            if (value.kind == NodeKind.BOOLEAN && value.intValue == 0) {
                return 0;
            }

            this.assembler.appendOpcode(byteOffset, WasmOpcode.BLOCK);
            log(0, WasmType.block_type, WasmType[WasmType.block_type]);
            array.append(WasmType.block_type);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.LOOP);
            log(0, WasmType.block_type, WasmType[WasmType.block_type]);
            array.append(WasmType.block_type);

            if (value.kind != NodeKind.BOOLEAN) {
                this.emitNode(byteOffset, value);
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_EQZ);
                this.assembler.appendOpcode(byteOffset, WasmOpcode.BR_IF);
                this.assembler.writeUnsignedLEB128(1); // Break out of the immediately enclosing loop
            }

            let child = body.firstChild;
            while (child != null) {
                this.emitNode(byteOffset, child);
                child = child.nextSibling;
            }

            // Jump back to the top (this doesn't happen automatically)
            this.assembler.appendOpcode(byteOffset, WasmOpcode.BR);
            this.assembler.writeUnsignedLEB128(0); // Continue back to the immediately enclosing loop

            this.assembler.appendOpcode(byteOffset, WasmOpcode.END); // end inner block
            this.assembler.appendOpcode(byteOffset, WasmOpcode.END); // end outer block
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
            this.assembler.appendOpcode(byteOffset, WasmOpcode.BR);
            this.assembler.writeUnsignedLEB128(label - (node.kind == NodeKind.BREAK ? 0 : 1));
        }

        else if (node.kind == NodeKind.EMPTY) {
            return 0;
        }

        else if (node.kind == NodeKind.EXPRESSION) {
            this.emitNode(byteOffset, node.expressionValue());
        }

        else if (node.kind == NodeKind.RETURN) {
            let value = node.returnValue();
            if (value != null) {
                this.emitNode(byteOffset, value);
            }
            this.assembler.appendOpcode(byteOffset, WasmOpcode.RETURN);
        }

        else if (node.kind == NodeKind.VARIABLES) {
            let count = 0;
            let child = node.firstChild;
            while (child != null) {
                assert(child.kind == NodeKind.VARIABLE);
                count = count + this.emitNode(byteOffset, child);
                child = child.nextSibling;
            }
            return count;
        }

        else if (node.kind == NodeKind.IF) {
            let branch = node.ifFalse();

            this.emitNode(byteOffset, node.ifValue());
            this.assembler.appendOpcode(byteOffset, WasmOpcode.IF);

            let returnNode = node.ifReturnNode();
            let needEmptyElse = false;
            if (returnNode == null && branch === null) {
                append(0, WasmType.block_type, WasmType[WasmType.block_type]);
            } else {
                if (returnNode !== null) {
                    let returnType: WasmType = symbolToWasmType(returnNode.resolvedType.symbol);
                    append(0, returnType, WasmType[returnType]);
                    this.assembler.currentSection.code.removeLastLinebreak();
                    this.assembler.currentSection.code.append(` (result ${WasmTypeToString[returnType]})\n`);
                    if (branch == null) {
                        needEmptyElse = true;
                    }
                } else {
                    append(0, WasmType.block_type, WasmType[WasmType.block_type]);
                }
            }

            this.emitNode(byteOffset, node.ifTrue());

            if (branch != null) {
                this.assembler.currentSection.code.indent -= 1;
                this.assembler.currentSection.code.clearIndent(1);
                this.assembler.appendOpcode(byteOffset, WasmOpcode.IF_ELSE);
                this.emitNode(byteOffset, branch);
            } else if (needEmptyElse) {
                this.assembler.currentSection.code.indent -= 1;
                this.assembler.currentSection.code.clearIndent(1);
                this.assembler.appendOpcode(byteOffset, WasmOpcode.IF_ELSE);
                let dataType: string = typeToDataType(returnNode.resolvedType, this.bitness);
                this.assembler.appendOpcode(byteOffset, WasmOpcode[`${dataType}_CONST`]);
                if (dataType === "I32" || dataType === "I64") {
                    this.assembler.writeUnsignedLEB128(0);
                } else if (dataType === "F32") {
                    this.assembler.writeFloat(0);
                } else if (dataType === "F64") {
                    this.assembler.writeDouble(0);
                }
            }

            this.assembler.appendOpcode(byteOffset, WasmOpcode.END);
        }

        else if (node.kind == NodeKind.HOOK) {
            this.emitNode(byteOffset, node.hookValue());
            this.assembler.appendOpcode(byteOffset, WasmOpcode.IF);
            let trueValue = node.hookTrue();
            let trueValueType = symbolToWasmType(trueValue.resolvedType.symbol);
            append(0, trueValueType, WasmType[trueValueType]);
            this.emitNode(byteOffset, trueValue);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.IF_ELSE);
            this.emitNode(byteOffset, node.hookFalse());
            this.assembler.appendOpcode(byteOffset, WasmOpcode.END);
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
                        this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_CONST, value.floatValue);
                        this.assembler.writeFloat(value.floatValue);

                    }

                    else if (node.symbol.resolvedType.isDouble()) {
                        this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_CONST, value.doubleValue);
                        this.assembler.writeDouble(value.doubleValue);
                    }

                    else if (node.symbol.resolvedType.isLong()) {
                        this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, value.longValue);
                        this.assembler.writeLEB128(value.longValue);
                    }

                    else {
                        this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, value.intValue);
                        this.assembler.writeLEB128(value.intValue);
                    }

                } else {
                    if (value != null) {
                        this.emitNode(byteOffset, value);
                    } else {
                        // Default value
                        if (node.symbol.resolvedType.isFloat()) {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_CONST, 0);
                            this.assembler.writeFloat(0);
                        }

                        else if (node.symbol.resolvedType.isDouble()) {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_CONST, 0);
                            this.assembler.writeDouble(0);
                        }

                        else if (node.symbol.resolvedType.isLong()) {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, 0);
                            this.assembler.writeLEB128(0);
                        }

                        else {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, 0);
                            this.assembler.writeLEB128(0);
                        }
                    }
                }

                let skipSetLocal = value && isUnaryPostfix(value.kind);

                if (skipSetLocal == false) {
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.SET_LOCAL, node.symbol.offset);
                    this.assembler.writeUnsignedLEB128(node.symbol.offset);
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
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.GET_LOCAL, this.currentFunction.signature.argumentCount);
                    this.assembler.writeUnsignedLEB128(this.currentFunction.signature.argumentCount);
                } else {
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.GET_LOCAL, symbol.offset);
                    this.assembler.writeUnsignedLEB128(symbol.offset);
                }
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                // FIXME: Final spec allow immutable global variables
                this.assembler.appendOpcode(byteOffset, WasmOpcode.GET_GLOBAL, symbol.offset);
                this.assembler.writeUnsignedLEB128(symbol.offset);
                // this.emitLoadFromMemory(byteOffset, symbol.resolvedType, null, MEMORY_INITIALIZER_BASE + symbol.offset);
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.DEREFERENCE) {
            this.emitLoadFromMemory(byteOffset, node.resolvedType.underlyingType(this.context), node.unaryValue(), 0);
        }

        else if (node.kind == NodeKind.POINTER_INDEX) {
            this.emitLoadFromMemory(byteOffset, node.resolvedType.underlyingType(this.context), node.pointer(), node.pointerOffset());
        }

        else if (node.kind == NodeKind.NULL) {
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, 0);
            this.assembler.writeLEB128(0);
        }

        else if (node.kind == NodeKind.INT32 || node.kind == NodeKind.BOOLEAN) {
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, node.intValue);
            this.assembler.writeLEB128(node.intValue || 0);
        }

        else if (node.kind == NodeKind.INT64) {
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, node.longValue);
            this.assembler.writeLEB128(node.longValue);
        }

        else if (node.kind == NodeKind.FLOAT32) {
            this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_CONST, node.floatValue);
            this.assembler.writeFloat(node.floatValue);
        }

        else if (node.kind == NodeKind.FLOAT64) {
            this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_CONST, node.doubleValue);
            this.assembler.writeDouble(node.doubleValue);
        }

        else if (node.kind == NodeKind.STRING) {
            let value = WASM_MEMORY_INITIALIZER_BASE + node.intValue;
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, value);
            this.assembler.writeLEB128(value);
        }

        else if (node.kind == NodeKind.CALL) {
            let value = node.callValue();
            let symbol = value.symbol;
            assert(isFunction(symbol.kind));

            // Write out the implicit "this" argument
            if (!symbol.node.isExternalImport() && symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
                let dotTarget = value.dotTarget();
                this.emitNode(byteOffset, dotTarget);
                if (dotTarget.kind == NodeKind.NEW) {
                    this.emitInstance(byteOffset, dotTarget);
                }
            }

            let child = value.nextSibling;
            while (child != null) {
                this.emitNode(byteOffset, child);
                child = child.nextSibling;
            }

            let wasmFunctionName: string = getWasmFunctionName(symbol);
            if (isBuiltin(wasmFunctionName)) {
                this.assembler.appendOpcode(byteOffset, getBuiltinOpcode(symbol.name));
            }
            else {
                let callIndex: int32 = this.getWasmFunctionCallIndex(symbol);
                this.assembler.appendOpcode(byteOffset, WasmOpcode.CALL, callIndex);
                this.assembler.writeUnsignedLEB128(callIndex);
            }
        }

        else if (node.kind == NodeKind.NEW) {
            this.emitInstance(byteOffset, node);
        }

        else if (node.kind == NodeKind.DELETE) {
            let value = node.deleteValue();

            this.emitNode(byteOffset, value);

            let freeIndex = this.calculateWasmFunctionIndex(this.freeFunctionIndex);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.CALL, freeIndex);
            this.assembler.writeUnsignedLEB128(freeIndex);
        }

        else if (node.kind == NodeKind.POSITIVE) {
            this.emitNode(byteOffset, node.unaryValue());
        }

        else if (node.kind == NodeKind.NEGATIVE) {
            let resolvedType = node.unaryValue().resolvedType;
            if (resolvedType.isFloat()) {
                this.emitNode(byteOffset, node.unaryValue());
                this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_NEG);
            }

            else if (resolvedType.isDouble()) {
                this.emitNode(byteOffset, node.unaryValue());
                this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_NEG);
            }

            else if (resolvedType.isInteger()) {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, 0);
                this.assembler.writeLEB128(0);
                this.emitNode(byteOffset, node.unaryValue());
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_SUB);
            }

            else if (resolvedType.isLong()) {
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, 0);
                this.assembler.writeLEB128(0);
                this.emitNode(byteOffset, node.unaryValue());
                this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_SUB);
            }

        }

        else if (node.kind == NodeKind.COMPLEMENT) {
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, ~0);
            this.assembler.writeLEB128(~0);
            this.emitNode(byteOffset, node.unaryValue());
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_XOR);
        }

        else if (node.kind == NodeKind.NOT) {
            this.emitNode(byteOffset, node.unaryValue());
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_EQZ);
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
            //     this.emitNode(byteOffset, value);
            //     this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST);
            //     log(byteOffset, shift, "i32 literal");
            //     this.assembler.writeLEB128(shift);
            //     this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_SHR_S);
            //     this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST);
            //     log(byteOffset, shift, "i32 literal");
            //     this.assembler.writeLEB128(shift);
            //     this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_SHL);
            // }
            //
            // // Mask
            // else if (
            //     from == context.int32Type || from == context.uint32Type &&
            //     type == context.uint8Type || type == context.uint16Type
            // ) {
            //     this.emitNode(byteOffset, value);
            //     this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST);
            //     let _value = type.integerBitMask(this.context);
            //     log(byteOffset, _value, "i32 literal");
            //     this.assembler.writeLEB128(_value);
            //     this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_AND);
            // }

            // --- 32 bit Integer casting ---
            // i32 > i64
            if (
                (from == context.nullType || from == context.booleanType || from == context.int32Type || from == context.uint32Type ) &&
                (type == context.int64Type || type == context.uint64Type)
            ) {
                if (value.kind == NodeKind.NULL) {
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, 0);
                    this.assembler.writeLEB128(0);
                }
                else if (value.kind == NodeKind.BOOLEAN) {
                    let intValue = value.intValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, intValue);
                    this.assembler.writeLEB128(intValue);
                } else if (value.kind == NodeKind.INT32) {
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, value.longValue);
                    this.assembler.writeLEB128(value.longValue);
                } else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, isUnsigned ? WasmOpcode.I64_EXTEND_U_I32 : WasmOpcode.I64_EXTEND_S_I32);
                }
            }

            // i32 > f32
            else if (
                (from == context.nullType || from == context.booleanType || from == context.int32Type || from == context.uint32Type) &&
                type == context.float32Type
            ) {
                if (value.kind == NodeKind.NULL) {
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_CONST, 0);
                    this.assembler.writeFloat(0);
                }
                else if (value.kind == NodeKind.BOOLEAN) {
                    let floatValue = value.intValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(floatValue);
                }
                else if (value.kind == NodeKind.INT32) {
                    let floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(floatValue);
                } else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, isUnsigned ? WasmOpcode.F32_CONVERT_U_I32 : WasmOpcode.F32_CONVERT_S_I32);
                }
            }

            // i32 > f64
            else if (
                (from == context.nullType || from == context.int32Type || from == context.uint32Type) &&
                type == context.float64Type
            ) {
                if (value.kind == NodeKind.NULL) {
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_CONST, 0);
                    this.assembler.writeDouble(0);
                }
                else if (value.kind == NodeKind.BOOLEAN) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(doubleValue);
                }
                else if (value.kind == NodeKind.INT32) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(doubleValue);
                } else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, isUnsigned ? WasmOpcode.F64_CONVERT_U_I32 : WasmOpcode.F64_CONVERT_S_I32);
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
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(intValue);
                } else {
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_WRAP_I64);
                }
            }

            // i64 > f32
            else if (
                (from == context.int64Type || from == context.uint64Type) &&
                type == context.float32Type
            ) {
                if (value.kind == NodeKind.INT32) {
                    let floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(floatValue);
                } else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, isUnsigned ? WasmOpcode.F32_CONVERT_U_I64 : WasmOpcode.F32_CONVERT_S_I64);
                }
            }

            // i64 > f64
            else if (
                (from == context.int64Type || from == context.uint64Type) &&
                type == context.float64Type) {

                if (value.kind == NodeKind.INT64) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(doubleValue);
                } else {
                    let isUnsigned = value.resolvedType.isUnsigned();
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, isUnsigned ? WasmOpcode.F64_CONVERT_U_I64 : WasmOpcode.F64_CONVERT_S_I64);
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
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(intValue);
                } else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, isUnsigned ? WasmOpcode.I32_TRUNC_U_F32 : WasmOpcode.I32_TRUNC_S_F32);
                }
            }

            // f32 > i64
            else if (
                from == context.float32Type &&
                (type == context.int64Type || type == context.uint64Type)
            ) {
                if (value.kind == NodeKind.FLOAT32) {
                    let longValue = value.longValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, longValue);
                    this.assembler.writeLEB128(longValue);
                } else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, isUnsigned ? WasmOpcode.I64_TRUNC_U_F32 : WasmOpcode.I64_TRUNC_S_F32);
                }
            }

            // f32 > f64
            else if (from == context.float32Type && type == context.float64Type) {

                if (value.kind == NodeKind.FLOAT32) {
                    let doubleValue = value.doubleValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_CONST, doubleValue);
                    this.assembler.writeDouble(doubleValue);
                } else {
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_PROMOTE_F32);
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
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, intValue);
                    this.assembler.writeLEB128(intValue);
                } else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, isUnsigned ? WasmOpcode.I32_TRUNC_U_F64 : WasmOpcode.I32_TRUNC_S_F64);
                }
            }

            // f64 > i64
            else if (
                from == context.float64Type &&
                (type == context.int64Type || type == context.uint64Type)
            ) {

                if (value.kind == NodeKind.FLOAT64) {
                    let longValue = value.longValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, longValue);
                    this.assembler.writeLEB128(longValue);
                } else {
                    let isUnsigned = type.isUnsigned();
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, isUnsigned ? WasmOpcode.I64_TRUNC_U_F64 : WasmOpcode.I64_TRUNC_S_F64);
                }
            }

            // f64 > f32
            else if (from == context.float64Type && type == context.float32Type) {

                if (value.kind == NodeKind.FLOAT64) {
                    let floatValue = value.floatValue || 0;
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_CONST, floatValue);
                    this.assembler.writeFloat(floatValue);
                } else {
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_DEMOTE_F64);
                }
            }

            // No cast needed
            else {
                this.emitNode(byteOffset, value);
            }
        }

        else if (node.kind == NodeKind.DOT) {
            let symbol = node.symbol;

            if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitLoadFromMemory(byteOffset, symbol.resolvedType, node.dotTarget(), symbol.offset);
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
                this.emitStoreToMemory(byteOffset, left.resolvedType.underlyingType(this.context), left.unaryValue(), 0, right);
            }

            else if (left.kind == NodeKind.POINTER_INDEX) {
                this.emitStoreToMemory(byteOffset, left.resolvedType.underlyingType(this.context), left.pointer(), left.pointerOffset(), right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitStoreToMemory(byteOffset, symbol.resolvedType, left.dotTarget(), symbol.offset, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                this.emitNode(byteOffset, right);
                this.assembler.appendOpcode(byteOffset, WasmOpcode.SET_GLOBAL);
                this.assembler.writeUnsignedLEB128(symbol.offset);
                // this.emitStoreToMemory(byteOffset, symbol.resolvedType, null, MEMORY_INITIALIZER_BASE + symbol.offset, right);
            }

            else if (symbol.kind == SymbolKind.VARIABLE_ARGUMENT || symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                this.emitNode(byteOffset, right);
                if (!isUnaryPostfix(right.kind)) {
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.SET_LOCAL, symbol.offset);
                    this.assembler.writeUnsignedLEB128(symbol.offset);
                }
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.LOGICAL_AND) {
            this.emitNode(byteOffset, node.binaryLeft());
            this.emitNode(byteOffset, node.binaryRight());
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_AND);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, 1);
            this.assembler.writeLEB128(1);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_EQ);
        }

        else if (node.kind == NodeKind.LOGICAL_OR) {
            this.emitNode(byteOffset, node.binaryLeft());
            this.emitNode(byteOffset, node.binaryRight());
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_OR);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST);
            log(byteOffset, 1, "i32 literal");
            this.assembler.writeLEB128(1);
            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_EQ);
        }

        else if (isUnary(node.kind)) {
            let kind = node.kind;

            if (kind == NodeKind.POSTFIX_INCREMENT || kind == NodeKind.POSTFIX_DECREMENT) {

                let value = node.unaryValue();
                let dataType: string = typeToDataType(value.resolvedType, this.bitness);

                //TODO handle instance variable
                if (node.parent.kind == NodeKind.VARIABLE) {
                    this.emitNode(byteOffset, value);
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.SET_LOCAL, node.parent.symbol.offset);
                    this.assembler.writeUnsignedLEB128(node.parent.symbol.offset);
                }
                else if (node.parent.kind == NodeKind.ASSIGN) {
                    this.emitNode(byteOffset, value);
                    let left = node.parent.binaryLeft();
                    this.assembler.appendOpcode(byteOffset, WasmOpcode.SET_LOCAL, left.symbol.offset);
                    this.assembler.writeUnsignedLEB128(left.symbol.offset);
                }

                this.emitNode(byteOffset, value);

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
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, 1);
                            this.assembler.writeLEB128(1);
                        }

                        else {
                            Terminal.error("Wrong type");
                        }
                    }

                    else if (size == 4) {
                        if (value.kind == NodeKind.INT32 || value.resolvedType.isInteger()) {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, 1);
                            this.assembler.writeLEB128(1);
                        }

                        else if (value.kind == NodeKind.FLOAT32 || value.resolvedType.isFloat()) {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_CONST, 1.0);
                            this.assembler.writeFloat(1);
                        }

                        else {
                            Terminal.error("Wrong type");
                        }
                    }

                    else if (size == 8) {

                        if (value.kind == NodeKind.INT64 || value.resolvedType.isLong()) {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, 1);
                            this.assembler.writeLEB128(1);
                        }

                        else if (value.kind == NodeKind.FLOAT64 || value.resolvedType.isDouble()) {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_CONST, 1.0);
                            this.assembler.writeDouble(1);
                        }

                        else {
                            Terminal.error("Wrong type");
                        }
                    }

                    //TODO extend to other operations
                    let operation = kind == NodeKind.POSTFIX_INCREMENT ? "ADD" : "SUB";

                    this.assembler.appendOpcode(byteOffset, WasmOpcode[`${dataType}_${operation}`]);

                    if (value.symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                        this.assembler.appendOpcode(byteOffset, WasmOpcode.SET_GLOBAL, value.symbol.offset);
                        this.assembler.writeLEB128(value.symbol.offset);
                    }
                    else if (value.symbol.kind == SymbolKind.VARIABLE_LOCAL || value.symbol.kind == SymbolKind.VARIABLE_ARGUMENT) {
                        this.assembler.appendOpcode(byteOffset, WasmOpcode.SET_LOCAL, value.symbol.offset);
                        this.assembler.writeLEB128(value.symbol.offset);
                    }
                    else if (value.symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                        //FIXME
                        //this.emitStoreToMemory(byteOffset, value.symbol.resolvedType, value.dotTarget(), value.symbol.offset, node);
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

                this.emitNode(byteOffset, left);

                if (left.resolvedType.pointerTo == null) {
                    this.emitNode(byteOffset, right);
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
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, _value);
                            this.assembler.writeLEB128(_value);
                        }

                        else {
                            this.emitNode(byteOffset, right);
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, 1);
                            this.assembler.writeLEB128(1);
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_SHL);
                        }
                    }

                    else if (size == 4) {
                        if (right.kind == NodeKind.INT32) {
                            let _value = right.intValue << 2;
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, _value);
                            this.assembler.writeLEB128(_value);
                        }

                        else if (right.kind == NodeKind.FLOAT32) {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.F32_CONST, right.floatValue);
                            this.assembler.writeFloat(right.floatValue);
                        }

                        else {
                            this.emitNode(byteOffset, right);
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_CONST, 2);
                            this.assembler.writeLEB128(2);
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I32_SHL);
                        }
                    }

                    else if (size == 8) {

                        if (right.kind == NodeKind.INT64) {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.I64_CONST, right.longValue);
                            this.assembler.writeLEB128(right.longValue);
                        }

                        else if (right.kind == NodeKind.FLOAT64) {
                            this.assembler.appendOpcode(byteOffset, WasmOpcode.F64_CONST, right.doubleValue);
                            this.assembler.writeDouble(right.doubleValue);
                        }
                    }

                    else {
                        this.emitNode(byteOffset, right);
                    }
                }
                this.assembler.appendOpcode(byteOffset, WasmOpcode[`${dataTypeLeft}_ADD`]);
            }

            else if (node.kind == NodeKind.BITWISE_AND) {
                if (isFloat || isDouble) {
                    let error = "Cannot do bitwise operations on floating point number"
                    Terminal.error(error);
                    throw error;
                }
                this.emitBinaryExpression(byteOffset, node, WasmOpcode[`${dataTypeLeft}_AND`]);
            }

            else if (node.kind == NodeKind.BITWISE_OR) {
                if (isFloat || isDouble) {
                    let error = "Cannot do bitwise operations on floating point number";
                    Terminal.error(error);
                    throw error;
                }
                this.emitBinaryExpression(byteOffset, node, WasmOpcode[`${dataTypeLeft}_OR`]);
            }

            else if (node.kind == NodeKind.BITWISE_XOR) {
                this.emitBinaryExpression(byteOffset, node, WasmOpcode[`${dataTypeLeft}_XOR`]);
            }

            else if (node.kind == NodeKind.EQUAL) {
                this.emitBinaryExpression(byteOffset, node, WasmOpcode[`${dataTypeLeft}_EQ`]);
            }

            else if (node.kind == NodeKind.MULTIPLY) {
                this.emitBinaryExpression(byteOffset, node, WasmOpcode[`${dataTypeLeft}_MUL`]);
            }

            else if (node.kind == NodeKind.NOT_EQUAL) {
                this.emitBinaryExpression(byteOffset, node, WasmOpcode[`${dataTypeLeft}_NE`]);
            }

            else if (node.kind == NodeKind.SHIFT_LEFT) {
                if (isFloat || isDouble) {
                    let error = "Cannot do bitwise operations on floating point number";
                    Terminal.error(error);
                    throw error;
                }
                this.emitBinaryExpression(byteOffset, node, WasmOpcode[`${dataTypeLeft}_SHL`]);
            }

            else if (node.kind == NodeKind.SUBTRACT) {
                this.emitBinaryExpression(byteOffset, node, WasmOpcode[`${dataTypeLeft}_SUB`]);
            }

            else if (node.kind == NodeKind.DIVIDE) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_DIV`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_DIV_U`] : WasmOpcode[`${dataTypeLeft}_DIV_S`]);
                this.emitBinaryExpression(byteOffset, node, opcode);
            }

            else if (node.kind == NodeKind.GREATER_THAN) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_GT`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_GT_U`] : WasmOpcode[`${dataTypeLeft}_GT_S`]);
                this.emitBinaryExpression(byteOffset, node, opcode);
            }

            else if (node.kind == NodeKind.GREATER_THAN_EQUAL) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_GE`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_GE_U`] : WasmOpcode[`${dataTypeLeft}_GE_S`]);
                this.emitBinaryExpression(byteOffset, node, opcode);
            }

            else if (node.kind == NodeKind.LESS_THAN) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_LT`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_LT_U`] : WasmOpcode[`${dataTypeLeft}_LT_S`]);
                this.emitBinaryExpression(byteOffset, node, opcode);
            }

            else if (node.kind == NodeKind.LESS_THAN_EQUAL) {
                let opcode = (isFloat || isDouble) ?
                    WasmOpcode[`${dataTypeLeft}_LE`] :
                    (isUnsigned ? WasmOpcode[`${dataTypeLeft}_LE_U`] : WasmOpcode[`${dataTypeLeft}_LE_S`]);
                this.emitBinaryExpression(byteOffset, node, opcode);
            }

            else if (node.kind == NodeKind.REMAINDER) {
                if (isFloat || isDouble) {
                    let error = "Floating point remainder is not yet supported in WebAssembly. Please import javascript function to handle this";
                    Terminal.error(error);
                    throw error;
                }
                this.emitBinaryExpression(byteOffset, node, isUnsigned ?
                    WasmOpcode[`${dataTypeLeft}_REM_U`] : WasmOpcode[`${dataTypeLeft}_REM_S`]);
            }

            else if (node.kind == NodeKind.SHIFT_RIGHT) {
                if (isFloat || isDouble) {
                    let error = "Cannot do bitwise operations on floating point number";
                    Terminal.error(error);
                    throw error;
                }
                this.emitBinaryExpression(byteOffset, node, isUnsigned ?
                    WasmOpcode[`${dataTypeLeft}_SHR_U`] : WasmOpcode[`${dataTypeLeft}_SHR_S`]);
            }

            else {
                assert(false);
            }
        }

        return 1;
    }

    calculateWasmFunctionIndex(index: int32): int32 {
        return this.assembler.module.importCount + index;
    }

    getWasmFunctionCallIndex(symbol: Symbol): int32 {
        return symbol.node.isExternalImport() ? symbol.offset : this.assembler.module.importCount + symbol.offset;
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

function wasmAssignLocalVariableOffsets(fn: WasmFunction, node: Node, shared: WasmSharedOffset, bitness: Bitness): void {
    if (node.kind == NodeKind.VARIABLE) {
        assert(node.symbol.kind == SymbolKind.VARIABLE_LOCAL);
        // node.symbol.offset = shared.nextLocalOffset;
        shared.nextLocalOffset = shared.nextLocalOffset + 1;
        shared.localCount = shared.localCount + 1;

        let local = new WasmLocal(
            symbolToWasmType(node.symbol, bitness),
            node.symbol.internalName,
            node.symbol,
            false
        );
        node.symbol.offset = fn.argumentVariables.length + fn.localVariables.length;
        fn.localVariables.push(new WasmLocal(local.type, local.symbol.name));
    }

    let child = node.firstChild;
    while (child != null) {
        wasmAssignLocalVariableOffsets(fn, child, shared, bitness);
        child = child.nextSibling;
    }
}

export function wasmEmit(compiler: Compiler, bitness: Bitness = Bitness.x32, optimize: boolean = true): void {
    let wasmEmitter = new WasmModuleEmitter(bitness);
    wasmEmitter.context = compiler.context;
    wasmEmitter.memoryInitializer = new ByteArray();

    // Set these to invalid values since "0" is valid
    wasmEmitter.startFunctionIndex = -1;
    wasmEmitter.mallocFunctionIndex = -1;
    wasmEmitter.freeFunctionIndex = -1;
    wasmEmitter.currentHeapPointer = -1;
    wasmEmitter.originalHeapPointer = -1;

    // Emission requires two passes
    wasmEmitter.prepareToEmit(compiler.global);
    wasmEmitter.assembler.sealFunctions();

    compiler.outputWASM = wasmEmitter.assembler.module.binary.data;
    wasmEmitter.emitModule();

    if (optimize) {
        WasmOptimizer.optimize(compiler.outputWASM)
    }

    compiler.outputWAST = wasmEmitter.assembler.textOutput;
}
