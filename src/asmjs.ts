///<reference path="declarations.d.ts" />

import {Symbol, SymbolKind, isFunction} from "./symbol";
import {ByteArray, ByteArray_append32, ByteArray_set32, ByteArray_setString, ByteArray_set16} from "./bytearray";
import {CheckContext} from "./checker";
import {alignToNextMultipleOf} from "./imports";
import {Node, NodeKind, isExpression, isUnary, isCompactNodeKind} from "./node";
import {Type} from "./type";
import {StringBuilder_new, StringBuilder} from "./stringbuilder";
import {Compiler} from "./compiler";
import {Precedence} from "./parser";
import {EmitBinary, jsKindCastsOperandsToInt} from "./js";

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

function asmAreSignaturesEqual(a: AsmSignature, b: AsmSignature): boolean {
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

    getAsmType(type: Type): AsmType {
        let context = this.context;

        if (type == context.booleanType || type.isInteger() || type.isReference()) {
            return AsmType.INT;
        }

        else if (type.isLong() || type.isReference()) {
            return AsmType.INT; // We don't have native I64 and we will not emulate it.
        }

        else if (type.isDouble()) {
            return AsmType.DOUBLE;
        }

        else if (type.isFloat()) {
            return AsmType.FLOAT;
        }

        if (type == context.voidType) {
            return AsmType.VOID;
        }

        assert(false);
        return AsmType.VOID;
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
            if (asmAreSignaturesEqual(signature, check)) {
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

        asmFinishSection(code, section);
    }

    emitExportTable(code: StringBuilder): void {
        let i = 0;
        let fn = this.firstFunction;
        while (fn != null) {
            if (fn.isExported) {
                code.append(`${fn.symbol.name}:${fn.symbol.name},`);
            }
            fn = fn.next;
            i = i + 1;
        }
    }

    emitFunctionBodies(code: StringBuilder): void {
        if (!this.firstFunction) {
            return;
        }
        let offset = array.position;
        let section = asmStartSection(code, AsmSection.Code, "function_bodies");
        log(section.data, this.functionCount, "num functions");
        section.data.writeUnsignedLEB128(this.functionCount);
        let count = 0;
        let fn = this.firstFunction;
        while (fn != null) {
            let sectionOffset = offset + section.data.position;
            let bodyData: ByteArray = new ByteArray();
            if (fn.localCount > 0) {
                let local = fn.firstLocal;
                while (local) {
                    let asmType: AsmType = symbolToValueType(local.symbol);
                    log(bodyData, sectionOffset, asmType, AsmType[asmType]);
                    bodyData.append(asmType); //value_type
                    local = local.next;
                    code.append(`var ${local.symbol.name} = ${symbolToIdentifier(local.symbol)}`);
                }

            } else {
                bodyData.writeUnsignedLEB128(0);
            }

            let child = fn.symbol.node.functionBody().firstChild;
            while (child != null) {
                this.emitNode(code, child);
                child = child.nextSibling;
            }

            //Copy and finish body
            section.data.writeUnsignedLEB128(bodyData.length);
            log(section.data, null, ` - function body ${count++} (${fn.symbol.name})`);
            log(section.data, bodyData.length, "func body size");
            section.data.log += bodyData.log;
            section.data.copy(bodyData);

            fn = fn.next;
        }

        asmFinishSection(code, section);
    }

    emitDataSegments(code: StringBuilder): void {
        this.growMemoryInitializer();
        let memoryInitializer = this.memoryInitializer;
        let initializerLength = memoryInitializer.length;
        let initialHeapPointer = alignToNextMultipleOf(ASM_MEMORY_INITIALIZER_BASE + initializerLength, 8);

        // Pass the initial heap pointer to the "malloc" function
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.originalHeapPointer);
        memoryInitializer.writeUnsignedInt(initialHeapPointer, this.currentHeapPointer);

        //data, sequence of size bytes
        // Copy the entire memory initializer (also includes zero-initialized data for now)
        let i = 0;
        let value;
        code.append(`var DATA_SEGMENT = new Uint8Array([`);
        while (i < initializerLength) {
            value = memoryInitializer.get(i);
            code.append(`${value}${i < initializerLength - 1 ? "," : ""}`);
            i++;
        }
        code.append(`];`);
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
                let type = asmWrapType(this.getAsmType(argument.variableType().resolvedType));

                if (argumentTypesFirst == null) argumentTypesFirst = type;
                else argumentTypesLast.next = type;
                argumentTypesLast = type;

                shared.nextLocalOffset = shared.nextLocalOffset + 1;
                argument = argument.nextSibling;
            }
            let signatureIndex = this.allocateSignature(argumentTypesFirst, asmWrapType(this.getAsmType(returnType.resolvedType)));
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
            asmAssignLocalVariableOffsets(fn, body, shared);
            fn.localCount = shared.localCount;
        }

        let child = node.firstChild;
        while (child != null) {
            this.prepareToEmit(child);
            child = child.nextSibling;
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

    emitLoadFromMemory(code: StringBuilder, type: Type, relativeBase: Node, offset: int32): void {
        let heapType;
        let address: string | number = 0;
        // Relative address
        if (relativeBase != null) {
            address = this.emitNode(code, relativeBase);
        }

        address = `address + ${offset}`;

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            heapType = type.isUnsigned() ? "U8" : "8";
            code.append(`HEAP${heapType}[${address}]`);
        }

        else if (sizeOf == 2) {
            heapType = type.isUnsigned() ? "U16" : "16";
            code.append(`HEAP${heapType}[${address}]`);
        }

        else if (sizeOf == 4) {

            heapType = type.isFloat() ? "F32" : (type.isUnsigned() ? "U32" : "I32");
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
        let address: string | number = 0;
        // Relative address
        if (relativeBase != null) {
            address = this.emitNode(code, relativeBase);
        }

        address = `${address} + ${offset}`;

        let sizeOf = type.variableSizeOf(this.context);

        let valueRef = this.emitNode(code, value);

        if (sizeOf == 1) {
            heapType = type.isUnsigned() ? "U8" : "8";
            code.append(`HEAP${heapType}[${address}] = ${valueRef}|0`);
        }

        else if (sizeOf == 2) {
            heapType = type.isUnsigned() ? "U16" : "16";
            code.append(`HEAP${heapType}[${address}] = ${valueRef}|0`);
        }

        else if (sizeOf == 4) {

            if (type.isFloat()) {
                code.append(`HEAPF32[${address}] = Math.fround(${valueRef})`);
            } else {
                heapType = type.isUnsigned() ? "U32" : "I32";
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

    emitUnary(code: StringBuilder, node: Node, parentPrecedence: Precedence, operator: string): void {
        let isPostfix = isUnaryPostfix(node.kind);
        let shouldCastToInt = !node.resolvedType.isFloat() && node.kind == NodeKind.NEGATIVE && !jsKindCastsOperandsToInt(node.parent.kind);
        let isUnsigned = node.isUnsignedOperator();
        let operatorPrecedence = shouldCastToInt ? isUnsigned ? Precedence.SHIFT : Precedence.BITWISE_OR : isPostfix ? Precedence.UNARY_POSTFIX : Precedence.UNARY_PREFIX;

        if (parentPrecedence > operatorPrecedence) {
            this.code.append("(");
        }

        if (!isPostfix) {
            this.code.append(operator);
        }

        this.emitExpression(node.unaryValue(), operatorPrecedence);

        if (isPostfix) {
            this.code.append(operator);
        }

        if (shouldCastToInt) {
            this.code.append(isUnsigned ? " >>> 0" : " | 0");
        }

        if (parentPrecedence > operatorPrecedence) {
            this.code.append(")");
        }
    }

    emitBinary(code: StringBuilder, node: Node, parentPrecedence: Precedence, operator: string, operatorPrecedence: Precedence, mode: EmitBinary): void {
        let isRightAssociative = node.kind == NodeKind.ASSIGN;
        let isUnsigned = node.isUnsignedOperator();

        // Avoid casting when the parent operator already does a cast
        let shouldCastToInt = mode == EmitBinary.CAST_TO_INT && (isUnsigned || !jsKindCastsOperandsToInt(node.parent.kind));
        let selfPrecedence = shouldCastToInt ? isUnsigned ? Precedence.SHIFT : Precedence.BITWISE_OR : parentPrecedence;

        if (parentPrecedence > selfPrecedence) {
            code.append("(");
        }

        if (selfPrecedence > operatorPrecedence) {
            code.append("(");
        }

        this.emitNode(code, node.binaryLeft(), isRightAssociative ? (operatorPrecedence + 1) as Precedence : operatorPrecedence);
        code.append(operator);
        this.emitNode(code, node.binaryRight(), isRightAssociative ? operatorPrecedence : (operatorPrecedence + 1) as Precedence);

        if (selfPrecedence > operatorPrecedence) {
            code.append(")");
        }

        if (shouldCastToInt) {
            code.append(isUnsigned ? " >>> 0" : " | 0");
        }

        if (parentPrecedence > selfPrecedence) {
            code.append(")");
        }
    }

    emitCommaSeparatedExpressions(code: StringBuilder, start: Node, stop: Node, needComma: boolean = false): void {
        while (start != stop) {
            if (needComma) {
                this.code.append(" , ");
                needComma = false;
            }
            this.emitExpression(start, Precedence.LOWEST);
            start = start.nextSibling;

            if (start != stop) {
                this.code.append(", ");
            }
        }
    }

    emitSymbolName(code: StringBuilder, symbol: Symbol): string {
        let name = symbol.rename != null ? symbol.rename : symbol.name;
        code.append(name);
        return name;
    }

    emitStatements(code: StringBuilder, node: Node): void {
        while (node != null) {
            this.emitStatement(node);
            node = node.nextSibling;
        }
    }

    emitStatement(code: StringBuilder, node: Node): void {

        if (node.kind == NodeKind.EXTENDS) {
            console.log("Extends found");
            this.code.append(" /*extends*/ ")
        }

        else if (node.kind == NodeKind.MODULE) {

        }

        else if (node.kind == NodeKind.CLASS) {

            currentClass = node.symbol.name;
            let classDef = this.getClassDef(node);
            let isTurbo = node.isTurbo();
            // Emit constructor
            if (!node.isDeclare()) {
                this.emitNewlineBefore(node);
                if (isTurbo) {
                    //Emit class object
                    // this.code.append(`let ${classDef.name} = {};\n`);
                    // this.code.append(`var ${classDef.name}_NAME = "${classDef.name}";\n`);
                    this.code.append(`var ${classDef.name}_SIZE = ${classDef.size};\n`);
                    this.code.append(`var ${classDef.name}_ALIGN = ${classDef.align};\n`);
                    this.code.append(`var ${classDef.name}_CLSID = ${classDef.clsid};\n`);

                    if (classDef.base) {
                        // this.code.append(`var ${classDef.name}_BASE = "${classDef.base}";\n`);
                    }

                    // this.code.append(`${namespace}_idToType[${classDef.name}.CLSID] = ${classDef.name};\n`);

                } else {
                    this.code.append(`class ${classDef.name} {`);
                }

                this.emitNewlineAfter(node);
            }

            // Emit instance functions
            let child = node.firstChild;
            while (child != null) {
                if (child.kind == NodeKind.FUNCTION) {
                    if (!isTurbo) this.code.indent += 1;
                    this.emitStatement(child);
                    if (!isTurbo) this.code.indent -= 1;
                }
                child = child.nextSibling;
            }

            if (!node.isDeclare() && !isTurbo) {
                this.code.clearIndent(1);
                this.code.append("}\n");
            }
            if (node.isExport()) {
                // this.code.append(`${classDef.name} = ${classDef.name};\n`);
                exportedFunctions.push(classDef.name);
            }
        }

        else if (node.kind == NodeKind.FUNCTION) {
            let body = node.functionBody();
            if (body == null) {
                return;
            }

            let symbol = node.symbol;
            let needsSemicolon = false;
            this.emitNewlineBefore(node);

            let isConstructor: boolean = symbol.name == "constructor";
            let isTurbo: boolean = node.parent.isTurbo();

            if (symbol.kind == SymbolKind.FUNCTION_INSTANCE) {

                if (isConstructor && isTurbo) {
                    this.code.append("function ");
                    this.emitSymbolName(symbol.parent());
                    this.code.append("_new");
                    needsSemicolon = false;
                } else {
                    if (isTurbo) {
                        this.code.append("function ");
                        this.emitSymbolName(symbol.parent());
                        this.code.append("_");
                        if (node.isVirtual()) {
                            this.code.append(symbol.name + "_impl");
                        } else {
                            this.emitSymbolName(symbol);
                        }
                        needsSemicolon = false;
                    } else {
                        if (node.isStatic()) {
                            this.code.append("static ");
                        }
                        this.emitSymbolName(symbol);
                    }
                }
            }

            else if (node.isExport()) {
                this.code.append("let ");
                this.emitSymbolName(symbol);
                this.code.append(" = function ");
                this.emitSymbolName(symbol);
                needsSemicolon = true;
            }

            else {
                this.code.append("function ");
                this.emitSymbolName(symbol);
            }

            this.code.append("(");

            let returnType = node.functionReturnType();
            let child = node.functionFirstArgumentIgnoringThis();
            let needComma = false;
            let signature = "";

            if (!isConstructor && isTurbo && !node.isStatic()) {
                this.code.append("ptr");
                signature += "ptr";
                needComma = true;
            }


            while (child != returnType) {
                assert(child.kind == NodeKind.VARIABLE);
                if (needComma) {
                    this.code.append(", ");
                    signature += ",";
                    needComma = false;
                }
                this.emitSymbolName(child.symbol);
                if (child.firstChild != child.lastChild && child.lastChild.hasValue) {
                    this.code.append(` = ${child.lastChild.rawValue}`);
                }
                signature += child.symbol.name;
                child = child.nextSibling;
                if (child != returnType) {
                    this.code.append(", ");
                    signature += ", ";
                }
            }

            this.code.append(") ");

            let parent = symbol.parent();
            let parentName: string = parent? parent.name : "";
            let classDef = classMap.get(parentName);

            if (isConstructor && isTurbo) {
                this.code.append("{\n", 1);
                this.code.append(`let ptr = ${namespace}malloc(${parentName}.SIZE, ${parentName}.ALIGN);\n`);
                this.code.append(`${namespace}HEAP32[ptr >> 2] = ${classDef.name}.CLSID;\n`);
                this.code.append(`${parentName}_init_mem(ptr, `);
                this.code.append(`${signature});\n`);
                this.code.append("return ptr;\n", -1);
                this.code.append("}\n\n");

                this.code.append(`function ${classDef.name}_init_mem(ptr, `);
                this.code.append(`${signature}) {\n`, 1);
            }

            if (node.isVirtual()) {
                let chunkIndex = this.code.breakChunk();
                this.updateVirtualTable(node, chunkIndex, classDef.base, signature);
            }

            this.emitBlock(node.functionBody(), !isConstructor || !isTurbo);

            if (node.isVirtual()) {
                this.code.breakChunk();
            }

            if (isConstructor && isTurbo) {
                this.code.append(`return ptr;\n`);
                this.code.clearIndent(1);
                this.code.append("}");
                this.code.indent -= 1;
            }

            // this.code.append(needsSemicolon ? ";\n" : "\n");

            if(node.isExport()){
                exportedFunctions.push(this.emitSymbolName(symbol));
                this.code.append(" = ");
                this.emitSymbolName(symbol);
                this.code.append(";\n");
            }

            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.IF) {
            this.emitNewlineBefore(node);
            while (true) {
                this.code.append("if (");
                this.emitExpression(node.ifValue(), Precedence.LOWEST);
                this.code.append(") ");
                this.emitBlock(node.ifTrue(), true);
                let no = node.ifFalse();
                if (no == null) {
                    this.code.append("\n");
                    break;
                }
                this.code.append("\n\n");
                this.code.append("else ");
                if (no.firstChild == null || no.firstChild != no.lastChild || no.firstChild.kind != NodeKind.IF) {
                    this.emitBlock(no, true);
                    this.code.append("\n");
                    break;
                }
                node = no.firstChild;
            }
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.WHILE) {
            this.emitNewlineBefore(node);
            this.code.append("while (");
            this.emitExpression(node.whileValue(), Precedence.LOWEST);
            this.code.append(") ");
            this.emitBlock(node.whileBody(), true);
            this.code.append("\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.BREAK) {
            this.emitNewlineBefore(node);
            this.code.append("break;\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.CONTINUE) {
            this.emitNewlineBefore(node);
            this.code.append("continue;\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.EXPRESSION) {
            this.emitNewlineBefore(node);
            this.emitExpression(node.expressionValue(), Precedence.LOWEST);
            this.code.append(";\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.EMPTY) {
        }

        else if (node.kind == NodeKind.RETURN) {
            let value = node.returnValue();
            //this.emitNewlineBefore(node);
            if (value != null) {
                this.code.append("return ");
                this.emitExpression(value, Precedence.LOWEST);
                this.code.append(";\n");
            } else {
                this.code.append("return;\n");
            }
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.BLOCK) {
            if (node.parent.kind == NodeKind.BLOCK) {
                this.emitStatements(node.firstChild);
            } else {
                this.emitNewlineBefore(node);
                this.emitBlock(node, true);
                this.code.append("\n");
                this.emitNewlineAfter(node);
            }
        }

        else if (node.kind == NodeKind.VARIABLES) {
            this.emitNewlineBefore(node);
            this.code.append("let ");
            let child = node.firstChild;

            while (child != null) {
                let value = child.variableValue();
                this.emitSymbolName(child.symbol);
                child = child.nextSibling;
                if (child != null) {
                    this.code.append(", ");
                }
                assert(value != null);
                this.code.append(" = ");
                this.emitExpression(value, Precedence.LOWEST);
            }

            this.code.append(";\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.ENUM) {
            if (node.isExport()) {
                this.emitNewlineBefore(node);
                exportedFunctions.push(this.emitSymbolName(node.symbol));
                this.code.append(" = {\n");
                this.code.indent += 1;

                // Emit enum values
                let child = node.firstChild;
                while (child != null) {
                    assert(child.kind == NodeKind.VARIABLE);
                    // this.code.emitIndent();
                    this.emitSymbolName(child.symbol);
                    this.code.append(": ");
                    this.code.append(child.symbol.offset.toString());
                    child = child.nextSibling;
                    this.code.append(child != null ? ",\n" : "\n");
                }

                this.code.clearIndent(1);
                this.code.append("};\n");
                this.emitNewlineAfter(node);
            } else if (turboJsOptimiztion == 0) {
                this.emitNewlineBefore(node);
                // this.code.emitIndent();
                this.code.append("let ");
                this.emitSymbolName(node.symbol);
                this.code.append(";\n");
                // this.code.emitIndent();
                this.code.append("(function (");
                this.emitSymbolName(node.symbol);
                this.code.append(") {\n");
                this.code.indent += 1;

                // Emit enum values
                let child = node.firstChild;
                while (child != null) {
                    assert(child.kind == NodeKind.VARIABLE);
                    // this.code.emitIndent();
                    this.emitSymbolName(node.symbol);
                    this.code.append("[");
                    this.emitSymbolName(node.symbol);
                    this.code.append("['");
                    this.emitSymbolName(child.symbol);
                    this.code.append("'] = ");
                    this.code.append(child.symbol.offset.toString());
                    this.code.append("] = ");
                    this.code.append("'");
                    this.emitSymbolName(child.symbol);
                    this.code.append("'");
                    child = child.nextSibling;
                    this.code.append(";\n");
                }

                this.code.clearIndent(1);
                this.code.append("})(");
                this.emitSymbolName(node.symbol);
                this.code.append(" || (");
                this.emitSymbolName(node.symbol);
                this.code.append(" = {}));\n");

                this.emitNewlineAfter(node);
            }
        }

        else if (node.kind == NodeKind.CONSTANTS) {
        }

        else {
            assert(false);
        }
    }

    emitExpression(code: StringBuilder, node: Node, parentPrecedence: Precedence): void {

        if (node.kind == NodeKind.NAME) {
            let symbol = node.symbol;
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.node.isDeclare()) {
                this.code.append("global.");
            }
            this.emitSymbolName(symbol);
        }

        else if (node.kind == NodeKind.NULL) {
            this.code.append("0");
        }

        else if (node.kind == NodeKind.UNDEFINED) {
            this.code.append("undefined");
        }

        else if (node.kind == NodeKind.BOOLEAN) {
            this.code.append(node.intValue != 0 ? "true" : "false");
        }

        else if (node.kind == NodeKind.INT32) {
            if (parentPrecedence == Precedence.MEMBER) {
                this.code.append("(");
            }

            this.code.append(node.resolvedType.isUnsigned() ? (node.intValue).toString() : node.intValue.toString());

            if (parentPrecedence == Precedence.MEMBER) {
                this.code.append(")");
            }
        }

        else if (node.kind == NodeKind.FLOAT32) {
            if (parentPrecedence == Precedence.MEMBER) {
                this.code.append("(");
            }

            this.code.append(node.floatValue.toString());

            if (parentPrecedence == Precedence.MEMBER) {
                this.code.append(")");
            }
        }

        else if (node.kind == NodeKind.STRING) {
            this.code.append(`\`${node.stringValue}\``);
        }

        else if (node.kind == NodeKind.CAST) {
            let context = this.context;
            let value = node.castValue();
            let from = value.resolvedType.underlyingType(context);
            let type = node.resolvedType.underlyingType(context);
            let fromSize = from.variableSizeOf(context);
            let typeSize = type.variableSizeOf(context);

            // The cast isn't needed if it's to a wider integer type
            if (from == type || fromSize < typeSize) {
                this.emitExpression(value, parentPrecedence);
            }

            else {
                // Sign-extend
                if (type == context.sbyteType || type == context.shortType) {
                    if (parentPrecedence > Precedence.SHIFT) {
                        this.code.append("(");
                    }

                    let shift = (32 - typeSize * 8).toString();
                    this.emitExpression(value, Precedence.SHIFT);
                    this.code.append(" << ");
                    this.code.append(shift);
                    this.code.append(" >> ");
                    this.code.append(shift);

                    if (parentPrecedence > Precedence.SHIFT) {
                        this.code.append(")");
                    }
                }

                // Mask
                else if (type == context.byteType || type == context.ushortType) {
                    if (parentPrecedence > Precedence.BITWISE_AND) {
                        this.code.append("(");
                    }

                    this.emitExpression(value, Precedence.BITWISE_AND);
                    this.code.append(" & ");
                    this.code.append(type.integerBitMask(context).toString());

                    if (parentPrecedence > Precedence.BITWISE_AND) {
                        this.code.append(")");
                    }
                }

                // Truncate signed
                else if (type == context.int32Type) {
                    if (parentPrecedence > Precedence.BITWISE_OR) {
                        this.code.append("(");
                    }

                    this.emitExpression(value, Precedence.BITWISE_OR);
                    this.code.append(" | 0");

                    if (parentPrecedence > Precedence.BITWISE_OR) {
                        this.code.append(")");
                    }
                }

                // Truncate unsigned
                else if (type == context.uint32Type) {
                    if (parentPrecedence > Precedence.SHIFT) {
                        this.code.append("(");
                    }

                    this.emitExpression(value, Precedence.SHIFT);
                    this.code.append(" >>> 0");

                    if (parentPrecedence > Precedence.SHIFT) {
                        this.code.append(")");
                    }
                }

                // No cast needed
                else {
                    this.emitExpression(value, parentPrecedence);
                }
            }
        }

        else if (node.kind == NodeKind.DOT) {
            let dotTarget = node.dotTarget();
            let resolvedTargetNode = dotTarget.resolvedType.symbol.node;
            let targetSymbolName: string;

            if (dotTarget.symbol) {
                targetSymbolName = dotTarget.symbol.name;
            } else {
                targetSymbolName = "(::unknown::)";
            }

            let resolvedNode = null;

            if (node.resolvedType.pointerTo) {
                resolvedNode = node.resolvedType.pointerTo.symbol.node;
            } else {
                resolvedNode = node.resolvedType.symbol.node;
            }

            if (resolvedTargetNode.isDeclareOrTurbo()) {

                let ref: string = targetSymbolName == "this" ? "ptr" : targetSymbolName;

                if (node.symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                    let memory: string = classMap.get(currentClass).members[node.symbol.name].memory;
                    let offset: number = classMap.get(currentClass).members[node.symbol.name].offset;
                    let shift: number = classMap.get(currentClass).members[node.symbol.name].shift;

                    //check if
                    if (node.parent.kind == NodeKind.DOT) {
                        //store the variable pointer, we need to move it as function argument
                        turboTargetPointer = `${namespace}${memory}[(${ref} + ${offset}) >> ${shift}]`;
                        //emit class name for static call
                        this.code.append(`${resolvedNode.symbol.name}`);
                    } else {
                        this.code.append(`${namespace}${memory}[(${ref} + ${offset}) >> ${shift}]`);
                    }
                }

                else if (node.symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
                    turboTargetPointer = ref;
                    this.code.append(resolvedTargetNode.stringValue);
                    this.code.append(".");
                    this.emitSymbolName(node.symbol);
                }

                else {
                    this.emitExpression(dotTarget, Precedence.MEMBER);
                    this.code.append(".");
                    this.emitSymbolName(node.symbol);
                }

            } else {
                this.emitExpression(node.dotTarget(), Precedence.MEMBER);
                this.code.append(".");
                this.emitSymbolName(node.symbol);
            }
        }

        else if (node.kind == NodeKind.HOOK) {
            if (parentPrecedence > Precedence.ASSIGN) {
                this.code.append("(");
            }

            this.emitExpression(node.hookValue(), Precedence.LOGICAL_OR);
            this.code.append(" ? ");
            this.emitExpression(node.hookTrue(), Precedence.ASSIGN);
            this.code.append(" : ");
            this.emitExpression(node.hookFalse(), Precedence.ASSIGN);

            if (parentPrecedence > Precedence.ASSIGN) {
                this.code.append(")");
            }
        }

        else if (node.kind == NodeKind.INDEX) {
            let value = node.indexTarget();
            this.emitExpression(value, Precedence.UNARY_POSTFIX);
            this.code.append("[");
            this.emitCommaSeparatedExpressions(value.nextSibling, null);
            this.code.append("]");
        }

        else if (node.kind == NodeKind.CALL) {
            if (node.expandCallIntoOperatorTree()) {
                this.emitExpression(node, parentPrecedence);
            }

            else {
                let value = node.callValue();
                this.emitExpression(value, Precedence.UNARY_POSTFIX);

                if (value.symbol == null || !value.symbol.isGetter()) {
                    this.code.append("(");
                    let needComma = false;
                    if (node.firstChild) {
                        let firstNode = node.firstChild.resolvedType.symbol.node;
                        if (!firstNode.isDeclare() && node.firstChild.firstChild.resolvedType.symbol.node.isTurbo() && turboTargetPointer) {
                            this.code.append(`${turboTargetPointer}`);
                            needComma = true;
                        }
                    }
                    this.emitCommaSeparatedExpressions(value.nextSibling, null, needComma);
                    this.code.append(")");
                }
            }
        }

        else if (node.kind == NodeKind.NEW) {
            let resolvedNode = node.resolvedType.symbol.node;
            let type = node.newType();
            if (resolvedNode.isDeclareOrTurbo()) {
                this.emitExpression(type, Precedence.UNARY_POSTFIX);
                this.code.append("_new");
            } else {
                this.code.append("new ");
                this.emitExpression(type, Precedence.UNARY_POSTFIX);
            }

            this.code.append("(");
            let valueNode = type.nextSibling;
            while (valueNode) {
                this.code.append(`${valueNode.rawValue}`);

                if (valueNode.nextSibling) {
                    this.code.append(",");
                    valueNode = valueNode.nextSibling;
                } else {
                    valueNode = null;
                }
            }
            this.code.append(")");

        }

        else if (node.kind == NodeKind.NOT) {
            let value = node.unaryValue();

            // Automatically invert operators for readability
            value.expandCallIntoOperatorTree();
            let invertedKind = invertedBinaryKind(value.kind);

            if (invertedKind != value.kind) {
                value.kind = invertedKind;
                this.emitExpression(value, parentPrecedence);
            }

            else {
                this.emitUnary(node, parentPrecedence, "!");
            }
        }

        else if (node.kind == NodeKind.COMPLEMENT) this.emitUnary(node, parentPrecedence, "~");
        else if (node.kind == NodeKind.NEGATIVE) this.emitUnary(node, parentPrecedence, "-");
        else if (node.kind == NodeKind.POSITIVE) this.emitUnary(node, parentPrecedence, "+");
        else if (node.kind == NodeKind.PREFIX_INCREMENT) this.emitUnary(node, parentPrecedence, "++");
        else if (node.kind == NodeKind.PREFIX_DECREMENT) this.emitUnary(node, parentPrecedence, "--");
        else if (node.kind == NodeKind.POSTFIX_INCREMENT) this.emitUnary(node, parentPrecedence, "++");
        else if (node.kind == NodeKind.POSTFIX_DECREMENT) this.emitUnary(node, parentPrecedence, "--");

        else if (node.kind == NodeKind.ADD) {
            this.emitBinary(node, parentPrecedence, " + ", Precedence.ADD,
                node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL
            );
        }
        else if (node.kind == NodeKind.ASSIGN) {
            this.emitBinary(node, parentPrecedence, " = ", Precedence.ASSIGN, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.BITWISE_AND) {
            this.emitBinary(node, parentPrecedence, " & ", Precedence.BITWISE_AND, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.BITWISE_OR) {
            this.emitBinary(node, parentPrecedence, " | ", Precedence.BITWISE_OR, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.BITWISE_XOR) {
            this.emitBinary(node, parentPrecedence, " ^ ", Precedence.BITWISE_XOR, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.DIVIDE) {
            this.emitBinary(node, parentPrecedence, " / ", Precedence.MULTIPLY,
                node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL
            );
        }
        else if (node.kind == NodeKind.EQUAL) {
            this.emitBinary(node, parentPrecedence, " === ", Precedence.EQUAL, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.GREATER_THAN) {
            this.emitBinary(node, parentPrecedence, " > ", Precedence.COMPARE, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.GREATER_THAN_EQUAL) {
            this.emitBinary(node, parentPrecedence, " >= ", Precedence.COMPARE, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.LESS_THAN) {
            this.emitBinary(node, parentPrecedence, " < ", Precedence.COMPARE, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.LESS_THAN_EQUAL) {
            this.emitBinary(node, parentPrecedence, " <= ", Precedence.COMPARE, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.LOGICAL_AND) {
            this.emitBinary(node, parentPrecedence, " && ", Precedence.LOGICAL_AND, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.LOGICAL_OR) {
            this.emitBinary(node, parentPrecedence, " || ", Precedence.LOGICAL_OR, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.NOT_EQUAL) {
            this.emitBinary(node, parentPrecedence, " !== ", Precedence.EQUAL, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.REMAINDER) {
            this.emitBinary(node, parentPrecedence, " % ", Precedence.MULTIPLY,
                node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL
            );
        }
        else if (node.kind == NodeKind.SHIFT_LEFT) {
            this.emitBinary(node, parentPrecedence, " << ", Precedence.SHIFT, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.SHIFT_RIGHT) {
            this.emitBinary(node, parentPrecedence, node.isUnsignedOperator() ? " >>> " : " >> ", Precedence.SHIFT, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.SUBTRACT) {
            this.emitBinary(node, parentPrecedence, " - ", Precedence.ADD,
                node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL
            );
        }

        else if (node.kind == NodeKind.MULTIPLY) {
            let left = node.binaryLeft();
            let right = node.binaryRight();
            let isUnsigned = node.isUnsignedOperator();

            if (isUnsigned && parentPrecedence > Precedence.SHIFT) {
                this.code.append("(");
            }

            if(left.intValue && right.intValue){
                this.code.append("__imul(");
                this.emitExpression(left, Precedence.LOWEST);
                this.code.append(", ");
                this.emitExpression(right, Precedence.LOWEST);
                this.code.append(")");

                if (isUnsigned) {
                    this.code.append(" >>> 0");

                    if (parentPrecedence > Precedence.SHIFT) {
                        this.code.append(")");
                    }
                }

            }else{
                this.emitExpression(left, Precedence.LOWEST);
                this.code.append(" * ");
                this.emitExpression(right, Precedence.LOWEST);
            }
            this.foundMultiply = true;

        }

        else {
            assert(false);
        }
    }

    emitNode(code: StringBuilder, node: Node, parentPrecedence?: Precedence): int32 {
        assert(!isExpression(node) || node.resolvedType != null);
        if (node.kind == NodeKind.BLOCK) {

            if (node.parent.kind == NodeKind.BLOCK) {
                this.emitStatements(code, node.firstChild);
            } else {
                this.emitNewlineBefore(node);
                this.emitBlock(code, node, true);
                this.code.append("\n");
                this.emitNewlineAfter(node);
            }

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
                code.append("(");
            }

            this.emitNode(code, node.hookValue(), Precedence.LOGICAL_OR);
            code.append(" ? ");
            this.emitNode(code, node.hookTrue(), Precedence.ASSIGN);
            code.append(" : ");
            this.emitNode(code, node.hookFalse(), Precedence.ASSIGN);

            if (parentPrecedence > Precedence.ASSIGN) {
                code.append(")");
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

            if (node.kind == NodeKind.NOT) {
                let value = node.unaryValue();

                // Automatically invert operators for readability
                value.expandCallIntoOperatorTree();
                let invertedKind = invertedBinaryKind(value.kind);

                if (invertedKind != value.kind) {
                    value.kind = invertedKind;
                    this.emitExpression(value, parentPrecedence);
                }

                else {
                    this.emitUnary(node, parentPrecedence, "!");
                }
            }

            else if (node.kind == NodeKind.COMPLEMENT) this.emitUnary(node, parentPrecedence, "~");
            else if (node.kind == NodeKind.NEGATIVE) this.emitUnary(node, parentPrecedence, "-");
            else if (node.kind == NodeKind.POSITIVE) this.emitUnary(node, parentPrecedence, "+");
            else if (node.kind == NodeKind.PREFIX_INCREMENT) this.emitUnary(node, parentPrecedence, "++");
            else if (node.kind == NodeKind.PREFIX_DECREMENT) this.emitUnary(node, parentPrecedence, "--");
            else if (node.kind == NodeKind.POSTFIX_INCREMENT) this.emitUnary(node, parentPrecedence, "++");
            else if (node.kind == NodeKind.POSTFIX_DECREMENT) this.emitUnary(node, parentPrecedence, "--");

            else if (node.kind == NodeKind.ADD) {
                this.emitBinary(node, parentPrecedence, " + ", Precedence.ADD,
                    node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL
                );
            }
            else if (node.kind == NodeKind.ASSIGN) {
                this.emitBinary(node, parentPrecedence, " = ", Precedence.ASSIGN, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.BITWISE_AND) {
                this.emitBinary(node, parentPrecedence, " & ", Precedence.BITWISE_AND, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.BITWISE_OR) {
                this.emitBinary(node, parentPrecedence, " | ", Precedence.BITWISE_OR, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.BITWISE_XOR) {
                this.emitBinary(node, parentPrecedence, " ^ ", Precedence.BITWISE_XOR, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.DIVIDE) {
                this.emitBinary(node, parentPrecedence, " / ", Precedence.MULTIPLY,
                    node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL
                );
            }
            else if (node.kind == NodeKind.EQUAL) {
                this.emitBinary(node, parentPrecedence, " === ", Precedence.EQUAL, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.GREATER_THAN) {
                this.emitBinary(node, parentPrecedence, " > ", Precedence.COMPARE, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.GREATER_THAN_EQUAL) {
                this.emitBinary(node, parentPrecedence, " >= ", Precedence.COMPARE, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.LESS_THAN) {
                this.emitBinary(node, parentPrecedence, " < ", Precedence.COMPARE, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.LESS_THAN_EQUAL) {
                this.emitBinary(node, parentPrecedence, " <= ", Precedence.COMPARE, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.LOGICAL_AND) {
                this.emitBinary(node, parentPrecedence, " && ", Precedence.LOGICAL_AND, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.LOGICAL_OR) {
                this.emitBinary(node, parentPrecedence, " || ", Precedence.LOGICAL_OR, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.NOT_EQUAL) {
                this.emitBinary(node, parentPrecedence, " !== ", Precedence.EQUAL, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.REMAINDER) {
                this.emitBinary(node, parentPrecedence, " % ", Precedence.MULTIPLY,
                    node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL
                );
            }
            else if (node.kind == NodeKind.SHIFT_LEFT) {
                this.emitBinary(node, parentPrecedence, " << ", Precedence.SHIFT, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.SHIFT_RIGHT) {
                this.emitBinary(node, parentPrecedence, node.isUnsignedOperator() ? " >>> " : " >> ", Precedence.SHIFT, EmitBinary.NORMAL);
            }
            else if (node.kind == NodeKind.SUBTRACT) {
                this.emitBinary(node, parentPrecedence, " - ", Precedence.ADD,
                    node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL
                );
            }

            else if (node.kind == NodeKind.MULTIPLY) {
                let left = node.binaryLeft();
                let right = node.binaryRight();
                let isUnsigned = node.isUnsignedOperator();

                if (isUnsigned && parentPrecedence > Precedence.SHIFT) {
                    this.code.append("(");
                }

                if (left.intValue && right.intValue) {
                    this.code.append("__imul(");
                    this.emitExpression(left, Precedence.LOWEST);
                    this.code.append(", ");
                    this.emitExpression(right, Precedence.LOWEST);
                    this.code.append(")");

                    if (isUnsigned) {
                        this.code.append(" >>> 0");

                        if (parentPrecedence > Precedence.SHIFT) {
                            this.code.append(")");
                        }
                    }

                } else {
                    this.emitExpression(left, Precedence.LOWEST);
                    this.code.append(" * ");
                    this.emitExpression(right, Precedence.LOWEST);
                }
                this.foundMultiply = true;

            }

            else {
                assert(false);
            }
        }

        return 1;
    }
}

function asmWrapType(id: AsmType): AsmWrappedType {
    assert(id == AsmType.VOID || id == AsmType.INT || id == AsmType.FLOAT || id == AsmType.DOUBLE);
    let type = new AsmWrappedType();
    type.id = id;
    return type;
}
function symbolToIdentifier(symbol: Symbol): string {
    let type = symbol.resolvedType;
    if (type.isFloat()) {
        return `Math.fround(${symbol.name})`;
    }
    else if (type.isDouble()) {
        return `+${symbol.name}`;
    }
    else if (type.isInteger() || type.pointerTo) {
        return `${symbol.name}|0`;
    }
    else if (type.isLong() || type.pointerTo) {
        return `${symbol.name}|0`;
    } else {
        return `${symbol.name}|0`;
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

function asmAssignLocalVariableOffsets(fn: AsmFunction, node: Node, shared: AsmSharedOffset): void {
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
        asmAssignLocalVariableOffsets(fn, child, shared);
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
export function asmEmit(compiler: Compiler): void {
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
