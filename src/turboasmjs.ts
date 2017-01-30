import {CheckContext} from "./checker";
import {StringBuilder, StringBuilder_appendQuoted, StringBuilder_new} from "./stringbuilder";
import {
    Node, isCompactNodeKind, isUnaryPostfix, NodeKind, invertedBinaryKind, NODE_FLAG_DECLARE,
    NODE_FLAG_UNSAFE_TURBO
} from "./node";
import {Precedence} from "./parser";
import {jsKindCastsOperandsToInt, EmitBinary} from "./js";
import {SymbolKind, Symbol} from "./symbol";
import {Compiler} from "./compiler";
import {Type} from "./type";

const ASM_MEMORY_INITIALIZER_BASE = 8; // Leave space for "null"

let turboJsOptimiztion: uint8 = 0;
let importMap: Map<string, any> = new Map<string, any>();
let classMap: Map<string, any> = new Map<string, any>();
let functionMap: Map<string, any> = new Map<string, any>();
let signatureMap: Map<number, any> = new Map<number, any>();
let virtualMap: Map<string, any> = new Map<string, any>();
let currentClass: string;
let turboTargetPointer: string; //to store temporary pointer for variable access rewrite
let namespace: string = "";
let exportTable: string[] = [];

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

class AsmWrappedType {
    id: AsmType;
    next: AsmWrappedType;
}

class AsmSignature {
    argumentTypes: AsmWrappedType;
    returnType: AsmWrappedType;
    next: AsmSignature;
}

class AsmGlobal {
    symbol: Symbol;
    next: AsmGlobal;
}

class AsmLocal {
    symbol: Symbol;
    next: AsmLocal;
}

class AsmSharedOffset {
    nextLocalOffset: int32 = 0;
    localCount: int32 = 0;
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

export class TurboASMJsModule {
    context: CheckContext;
    code: StringBuilder;
    foundMultiply: boolean;
    previousNode: Node;

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
    currentHeapPointer: int32 = -1;
    originalHeapPointer: int32 = -1;
    mallocFunctionIndex: int32 = -1;
    freeFunctionIndex: int32 = -1;
    startFunctionIndex: int32 = -1;

    emitNewlineBefore(node: Node): void {
        if (this.previousNode != null && (!isCompactNodeKind(this.previousNode.kind) || !isCompactNodeKind(node.kind))) {
            this.code.append("\n");
        }
        this.previousNode = null;
    }

    emitNewlineAfter(node: Node): void {
        this.previousNode = node;
    }

    // emitGlobalDeclarations(): void {
    //
    //     if (!this.firstGlobal) {
    //         return;
    //     }
    //
    //     let global = this.firstGlobal;
    //     while (global) {
    //         let dataType: AsmType = typeToAsmType(global.symbol.resolvedType);
    //         let value = global.symbol.node.variableValue();
    //         global = global.next;
    //     }
    // }

    emitImports() {
        if (!this.firstImport) {
            return;
        }

        let _import: AsmImport = this.firstImport;
        while (_import) {
            let importName = _import.module + "_" + _import.name;
            this.code.append(`var ${importName} = global.${_import.module}.${_import.name};\n`);
            _import = _import.next;
        }
    }

    emitStatements(node: Node): void {
        while (node != null) {
            this.emitStatement(node);
            node = node.nextSibling;
        }
    }

    emitBlock(node: Node, needBraces: boolean): void {
        this.previousNode = null;
        if (needBraces) {
            this.code.append("{\n", 1);
        }

        this.emitStatements(node.firstChild);

        if (needBraces) {
            this.code.clearIndent(1);
            this.code.append("}");
            this.code.indent -= 1;
        }
        this.previousNode = null;
    }

    emitUnary(node: Node, parentPrecedence: Precedence, operator: string): void {
        let isPostfix = isUnaryPostfix(node.kind);
        let shouldCastToInt = !node.resolvedType.isFloat() && node.kind == NodeKind.NEGATIVE && !jsKindCastsOperandsToInt(node.parent.kind);
        let isUnsigned = node.isUnsignedOperator();
        let operatorPrecedence = shouldCastToInt ? isUnsigned ? Precedence.SHIFT : Precedence.BITWISE_OR : isPostfix ? Precedence.UNARY_POSTFIX : Precedence.UNARY_PREFIX;

        // if (parentPrecedence > operatorPrecedence) {
        //     this.code.append("(");
        // }

        if (!isPostfix) {
            this.code.append(operator);
        }

        this.emitExpression(node.unaryValue(), operatorPrecedence);

        if (isPostfix) {
            this.code.append(operator);
        }

        if (shouldCastToInt) {
            // this.code.append(isUnsigned ? " >>> 0" : " | 0");
            this.code.append("|0");
        }

        // if (parentPrecedence > operatorPrecedence) {
        //     this.code.append(")");
        // }
    }

    emitBinary(node: Node, parentPrecedence: Precedence, operator: string, operatorPrecedence: Precedence, mode: EmitBinary, forceCast: boolean = false, castToDouble: boolean = false): void {
        let isRightAssociative = node.kind == NodeKind.ASSIGN;
        let isUnsigned = node.isUnsignedOperator();

        // Avoid casting when the parent operator already does a cast
        let shouldCastToInt = mode == EmitBinary.CAST_TO_INT && (isUnsigned || !jsKindCastsOperandsToInt(node.parent.kind));
        let selfPrecedence = shouldCastToInt ? isUnsigned ? Precedence.SHIFT : Precedence.BITWISE_OR : parentPrecedence;

        let identifier = getIdentifier(node, castToDouble);

        if (parentPrecedence > selfPrecedence) {
            this.code.append("(");
        }

        if (selfPrecedence > operatorPrecedence) {
            this.code.append("(");
        }

        if (!isRightAssociative && forceCast) {
            this.code.append(identifier.left);
        }

        this.emitExpression(node.binaryLeft(), isRightAssociative ? (operatorPrecedence + 1) as Precedence : operatorPrecedence, forceCast && !isRightAssociative, castToDouble);
        this.code.append(operator);

        if (isRightAssociative && forceCast) {
            this.code.append(identifier.left);
        }

        this.emitExpression(node.binaryRight(), isRightAssociative ? operatorPrecedence : (operatorPrecedence + 1) as Precedence, forceCast, castToDouble);

        if (selfPrecedence > operatorPrecedence) {
            this.code.append(")");
        }

        if (forceCast) {
            this.code.append(identifier.right);
        }

        if (parentPrecedence > selfPrecedence) {
            this.code.append(")");
        }
    }

    emitCommaSeparatedExpressions(start: Node, stop: Node, needComma: boolean = false, castToDouble: boolean = false): void {
        while (start != stop) {
            if (needComma) {
                this.code.append(" , ");
                needComma = false;
            }
            this.emitExpression(start, Precedence.LOWEST, true, castToDouble);
            start = start.nextSibling;

            if (start != stop) {
                this.code.append(", ");
            }
        }
    }

    emitExpression(node: Node, parentPrecedence: Precedence, forceCast: boolean = false, castToDouble: boolean = false): void {

        if (node.kind == NodeKind.NAME) {
            let symbol = node.symbol;
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.node.isDeclare()) {
                this.code.append("global.");
            }
            if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                this.emitLoadFromMemory(symbol.resolvedType, null, ASM_MEMORY_INITIALIZER_BASE + symbol.offset);
            } else {
                if (forceCast) {

                    if (castToDouble || symbol.resolvedType.isDouble()) {
                        this.code.append("(+");
                        this.emitSymbolName(symbol);
                        this.code.append(")");
                    }

                    else if (symbol.resolvedType.isFloat()) {
                        this.code.append("fround(");
                        this.emitSymbolName(symbol);
                        this.code.append(")");
                    }

                    else {
                        this.code.append("(");
                        this.emitSymbolName(symbol);
                        this.code.append("|0)");
                    }

                } else {
                    this.code.append(symbol.name == "this" ? "ptr" : symbol.name);
                    // this.emitSymbolName(symbol);
                }
            }
        }

        else if (node.kind == NodeKind.NULL) {
            this.code.append("0");
        }

        else if (node.kind == NodeKind.UNDEFINED) {
            this.code.append("undefined");
        }

        else if (node.kind == NodeKind.BOOLEAN) {
            this.code.append(node.intValue != 0 ? "1" : "0");
        }

        else if (node.kind == NodeKind.INT32 || node.kind == NodeKind.INT64) {
            // if (parentPrecedence == Precedence.MEMBER) {
            //     this.code.append("(");
            // }
            if (castToDouble) {
                this.code.append(`(+${node.intValue})`);
            }
            else if (parentPrecedence != Precedence.ASSIGN) {
                this.code.append(`(${node.intValue}|0)`);
            }
            else {
                this.code.append(`${node.intValue}`);
            }

            // if (parentPrecedence == Precedence.MEMBER) {
            //     this.code.append(")");
            // }
        }

        else if (node.kind == NodeKind.FLOAT32) {
            if (parentPrecedence == Precedence.MEMBER) {
                this.code.append("(");
            }

            if (castToDouble) {
                if (node.floatValue - (node.floatValue | 0) == 0) {
                    this.code.append(`${node.floatValue}.0`);
                } else {
                    this.code.append(`${node.floatValue}`);
                }
            }
            else {
                this.code.append(`fround(${node.floatValue})`);
            }

            if (parentPrecedence == Precedence.MEMBER) {
                this.code.append(")");
            }
        }

        else if (node.kind == NodeKind.FLOAT64) {
            if (parentPrecedence == Precedence.MEMBER) {
                this.code.append("(");
            }

            if (node.floatValue - (node.floatValue | 0) == 0) {
                this.code.append(`${node.floatValue}.0`);
            } else {
                this.code.append(`${node.floatValue}`);
            }

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
            // if (from == type || fromSize < typeSize) {
            //     this.emitExpression(value, parentPrecedence);
            // }
            //
            // else {
            // Sign-extend
            if (type == context.sbyteType || type == context.shortType) {
                if (parentPrecedence > Precedence.SHIFT) {
                    this.code.append("(");
                }

                let shift = (32 - typeSize * 8).toString();
                this.emitExpression(value, Precedence.SHIFT, forceCast);
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

                this.emitExpression(value, Precedence.BITWISE_AND, forceCast);
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

                this.emitExpression(value, Precedence.BITWISE_OR, forceCast);
                this.code.append(" | 0");

                if (parentPrecedence > Precedence.BITWISE_OR) {
                    this.code.append(")");
                }
            }

            // Truncate unsigned
            else if (type == context.uint32Type) {
                // if (parentPrecedence > Precedence.SHIFT) {
                //     this.code.append("(");
                // }

                this.emitExpression(value, Precedence.SHIFT, forceCast);
                // this.code.append("|0");
                //
                // if (parentPrecedence > Precedence.SHIFT) {
                //     this.code.append(")");
                // }
            }

            // No cast needed
            else {
                this.emitExpression(value, parentPrecedence, forceCast);
            }
            // }
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

            let ref: string = targetSymbolName == "this" ? "ptr" : targetSymbolName;

            if (node.symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitLoadFromMemory(node.symbol.resolvedType, node.dotTarget(), node.symbol.offset);
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
                let fn = functionMap.get(value.symbol.name);
                let signature;
                let isImported = false;
                let isMath = false;
                let importedFnName = "";
                if (!fn) {
                    if (value.symbol.node.isDeclare() && value.symbol.node.parent.isImport()) {
                        let moduleName = value.symbol.node.parent.symbol.name;
                        let fnName = value.symbol.name;
                        isMath = moduleName == "Math";
                        importedFnName = moduleName + "_" + fnName;
                        let asmImport: AsmImport = importMap.get(moduleName + "." + fnName);
                        signature = signatureMap.get(asmImport.signatureIndex);
                        isImported = true;
                    }
                } else {
                    signature = signatureMap.get(fn.signatureIndex);
                }

                let returnType = signature.returnType;
                let identifier = null;
                if (returnType.id != AsmType.VOID) {
                    identifier = asmTypeToIdentifier(returnType.id);
                    this.code.append(identifier.left);
                }

                if (isImported) {
                    this.code.append(importedFnName);
                } else {
                    this.emitExpression(value, Precedence.UNARY_POSTFIX);
                }


                if (value.symbol == null || !value.symbol.isGetter()) {
                    this.code.append("(");
                    let needComma = false;
                    if (node.firstChild) {
                        let firstNode = node.firstChild.resolvedType.symbol.node;
                        if (!firstNode.isDeclare() && node.firstChild.firstChild && node.firstChild.firstChild.resolvedType.symbol.node.isTurbo() && turboTargetPointer) {
                            this.code.append(`${turboTargetPointer}`);
                            needComma = true;
                        }
                    }
                    this.emitCommaSeparatedExpressions(value.nextSibling, null, needComma, isMath);
                    this.code.append(")");
                    if (identifier) {
                        this.code.append(identifier.right);
                    }
                }
            }
        }

        else if (node.kind == NodeKind.NEW) {
            let resolvedNode = node.resolvedType.symbol.node;
            let type = node.newType();
            let size = type.resolvedType.allocationSizeOf(this.context);
            assert(size > 0);
            // Pass the object size as the first argument
            //this.code.append(`malloc(${size}|0)`);//TODO: access functions from function table using function index
            // this.code.append(`${node.resolvedType.symbol.name}_new(`);
            // this.code.append(`);`);
            this.emitConstructor(node);
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
            this.emitBinary(node, parentPrecedence, " + ", Precedence.ADD, EmitBinary.NORMAL, forceCast, castToDouble);
        }
        else if (node.kind == NodeKind.ASSIGN) {
            let left = node.binaryLeft();
            let right = node.binaryRight();
            let symbol = left.symbol;

            if (left.kind == NodeKind.DEREFERENCE) {
                this.emitStoreToMemory(left.resolvedType.underlyingType(this.context), left.unaryValue(), 0, right);
            }
            else if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                this.emitStoreToMemory(symbol.resolvedType, null, ASM_MEMORY_INITIALIZER_BASE + symbol.offset, right);
            }
            else if (symbol.kind == SymbolKind.VARIABLE_INSTANCE) {
                this.emitStoreToMemory(symbol.resolvedType, left.dotTarget(), symbol.offset, right);
            }
            else {
                this.emitBinary(node, parentPrecedence, " = ", Precedence.ASSIGN, EmitBinary.NORMAL, true);
            }
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
                node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL, true
            );
        }
        else if (node.kind == NodeKind.EQUAL) {
            this.emitBinary(node, parentPrecedence, " == ", Precedence.EQUAL, EmitBinary.NORMAL, forceCast);
        }
        else if (node.kind == NodeKind.GREATER_THAN) {
            this.emitBinary(node, parentPrecedence, " > ", Precedence.COMPARE, EmitBinary.NORMAL, true);
        }
        else if (node.kind == NodeKind.GREATER_THAN_EQUAL) {
            this.emitBinary(node, parentPrecedence, " >= ", Precedence.COMPARE, EmitBinary.NORMAL, true);
        }
        else if (node.kind == NodeKind.LESS_THAN) {
            this.emitBinary(node, parentPrecedence, " < ", Precedence.COMPARE, EmitBinary.NORMAL, true);
        }
        else if (node.kind == NodeKind.LESS_THAN_EQUAL) {
            this.emitBinary(node, parentPrecedence, " <= ", Precedence.COMPARE, EmitBinary.NORMAL, true);
        }
        else if (node.kind == NodeKind.LOGICAL_AND) {
            this.emitBinary(node, parentPrecedence, " && ", Precedence.LOGICAL_AND, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.LOGICAL_OR) {
            this.emitBinary(node, parentPrecedence, " || ", Precedence.LOGICAL_OR, EmitBinary.NORMAL);
        }
        else if (node.kind == NodeKind.NOT_EQUAL) {
            this.emitBinary(node, parentPrecedence, " != ", Precedence.EQUAL, EmitBinary.NORMAL, true);
        }
        else if (node.kind == NodeKind.REMAINDER) {
            this.emitBinary(node, parentPrecedence, " % ", Precedence.MULTIPLY,
                node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL, true
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
                node.parent.kind == NodeKind.INT32 ? EmitBinary.CAST_TO_INT : EmitBinary.NORMAL, true
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

        else if (node.kind == NodeKind.DEREFERENCE) {
            this.emitLoadFromMemory(node.resolvedType.underlyingType(this.context), node.unaryValue(), 0);
        }

        else {
            assert(false);
        }
    }


    emitLoadFromMemory(type: Type, relativeBase: Node, offset: int32): void {
        let heapType;
        let sizeOf = type.variableSizeOf(this.context);
        let idLeft = "";
        let idRight = "";

        if (sizeOf == 1) {
            idRight = "|0)";
            heapType = type.isUnsigned() ? "U8" : "8";
            this.code.append(`(HEAP${heapType}[(`);
        }

        else if (sizeOf == 2) {
            idRight = "|0)";
            heapType = type.isUnsigned() ? "U16" : "16";
            this.code.append(`(HEAP${heapType}[(`);
        }

        else if (sizeOf == 4) {

            if (type.isFloat()) {
                idLeft = "fround(";
                idRight = ")";
                heapType = "F32";
            } else {
                idLeft = "(";
                idRight = "|0)";
                heapType = type.isUnsigned() ? "U32" : "32";
            }

            this.code.append(`${idLeft}HEAP${heapType}[(`);
        }

        else if (sizeOf == 8) {
            idLeft = "(+";
            idRight = ")";
            this.code.append(`HEAPF64[(`);
        }

        else {
            assert(false);
        }

        // Relative address
        if (relativeBase != null) {
            this.emitExpression(relativeBase, Precedence.MEMBER);
            this.code.append(` ${offset == 0 ? "" : "+ (" + offset + "|0) "}) >> 2]`);
        } else {
            this.code.append(`${offset == 0 ? "" : offset}) >> 2]`);
        }
        this.code.append(idRight);
    }

    emitStoreToMemory(type: Type, relativeBase: Node, offset: int32, value: Node): void {
        let heapType;

        let sizeOf = type.variableSizeOf(this.context);

        if (sizeOf == 1) {
            heapType = type.isUnsigned() ? "U8" : "8";
            this.code.append(`HEAP${heapType}[(`);
        }

        else if (sizeOf == 2) {
            heapType = type.isUnsigned() ? "U16" : "16";
            this.code.append(`HEAP${heapType}[(`);
        }

        else if (sizeOf == 4) {

            if (type.isFloat()) {
                this.code.append(`HEAPF32[(`);
            } else {
                heapType = type.isUnsigned() ? "U32" : "32";
                this.code.append(`HEAP${heapType}[(`);
            }
        }

        else if (sizeOf == 8) {

            this.code.append(`HEAPF64[(`);
        }

        else {
            assert(false);
        }

        // Relative address
        if (relativeBase != null) {
            this.emitExpression(relativeBase, Precedence.ASSIGN);
            this.code.append(` ${offset == 0 ? "" : "+ (" + offset + "|0)"}) >> 2] = `);
        } else {
            this.code.append(`${offset == 0 ? "" : offset}) >> 2] = `);
        }

        this.emitExpression(value, Precedence.ASSIGN, true);
    }

    emitSymbolName(symbol: Symbol): string {
        let name = symbol.rename != null ? symbol.rename : symbol.name;
        this.code.append(name);
        return name;
    }

    emitStatement(node: Node): void {

        if (node.kind == NodeKind.EXTENDS) {
            console.log("Extends found");
            this.code.append(" /*extends*/ ")
        }

        else if (node.kind == NodeKind.MODULE) {

        }

        else if (node.kind == NodeKind.IMPORTS) {
            let child = node.firstChild;
            while (child) {
                assert(child.kind == NodeKind.IMPORT);
                child = child.nextSibling;
            }
        }

        else if (node.kind == NodeKind.CLASS) {

            currentClass = node.symbol.name;
            let classDef = this.getClassDef(node);
            let isTurbo = node.isTurbo();
            // Emit constructor
            // if (!node.isDeclare()) {
            //     this.emitNewlineBefore(node);
            //     if (isTurbo) {
            //         //Emit class object
            //         // this.code.append(`let ${classDef.name} = {};\n`);
            //         // this.code.append(`var ${classDef.name}_NAME = "${classDef.name}";\n`);
            //         this.code.append(`var ${classDef.name}_SIZE = ${classDef.size};\n`);
            //         this.code.append(`var ${classDef.name}_ALIGN = ${classDef.align};\n`);
            //         this.code.append(`var ${classDef.name}_CLSID = ${classDef.clsid};\n`);
            //
            //         if (classDef.base) {
            //             // this.code.append(`var ${classDef.name}_BASE = "${classDef.base}";\n`);
            //         }
            //
            //         // this.code.append(`${namespace}_idToType[${classDef.name}.CLSID] = ${classDef.name};\n`);
            //
            //     } else {
            //         this.code.append(`class ${classDef.name} {`);
            //     }
            //
            //     this.emitNewlineAfter(node);
            // }

            // Emit instance functions
            let child = node.firstChild;
            while (child != null) {
                if (child.kind == NodeKind.FUNCTION) {
                    // if (!isTurbo) this.code.indent += 1;
                    this.emitStatement(child);
                    // if (!isTurbo) this.code.indent -= 1;
                }
                child = child.nextSibling;
            }

            // if (!node.isDeclare() && !isTurbo) {
            //     this.code.clearIndent(1);
            //     this.code.append("}\n");
            // }
            if (node.isExport()) {
                // this.code.append(`${classDef.name} = ${classDef.name};\n`);
                //exportTable.push(classDef.name);
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

            if (symbol.kind == SymbolKind.FUNCTION_INSTANCE) {

                let funcName = "";

                if (isConstructor) {
                    this.code.append("function ");
                    funcName = this.emitSymbolName(symbol.parent()) + "_new";
                    this.code.append("_new");
                    needsSemicolon = false;
                } else {
                    this.code.append("function ");
                    funcName = this.emitSymbolName(symbol.parent()) + "_";
                    this.code.append("_");
                    if (node.isVirtual()) {
                        this.code.append(symbol.name + "_impl");
                        funcName += symbol.name + "_impl";
                    } else {
                        funcName += this.emitSymbolName(symbol);
                    }
                    needsSemicolon = false;
                }

                exportTable.push(funcName);
            }

            else if (node.isExport()) {
                this.code.append("function ");
                let name: string = this.emitSymbolName(symbol);
                needsSemicolon = false;
                exportTable.push(name);
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

            if (symbol.kind == SymbolKind.FUNCTION_INSTANCE && !isConstructor && !node.isStatic()) {
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
            let parentName: string = parent ? parent.name : "";
            let classDef = classMap.get(parentName);

            if (isConstructor) {
                let size = parent.resolvedType.allocationSizeOf(this.context);
                this.code.append("{\n", 1);

                child = node.functionFirstArgumentIgnoringThis();

                while (child != returnType) {
                    assert(child.kind == NodeKind.VARIABLE);
                    if (needComma) {
                        this.code.append(", ");
                        signature += ",";
                        needComma = false;
                    }
                    this.emitSymbolName(child.symbol);
                    this.code.append(` = `);
                    this.emitStatement(child);
                    this.code.append(`;\n`);
                    // signature += child.symbol.name;
                    child = child.nextSibling;
                }

                this.code.append(`var ptr = 0;\n`);
                this.code.append(`ptr = ${namespace}malloc(${size})|0;\n`);
                this.code.append(`${parentName}_set(ptr, `);
                this.code.append(`${signature});\n`);
                this.code.append("return ptr|0;\n", -1);
                this.code.append("}\n\n");

                this.code.append(`function ${classDef.name}_set(ptr, `);
                this.code.append(`${signature}) `);
            }

            if (node.isVirtual()) {
                let chunkIndex = this.code.breakChunk();
                this.updateVirtualTable(node, chunkIndex, classDef.base, signature);
            }

            child = node.functionFirstArgumentIgnoringThis();

            this.code.append("{\n");
            this.code.emitIndent();
            this.code.indent++;

            if (symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
                this.code.append(`ptr = ptr|0;\n`);
            }

            while (child != returnType) {
                assert(child.kind == NodeKind.VARIABLE);
                if (needComma) {
                    this.code.append(", ");
                    needComma = false;
                }
                this.emitSymbolName(child.symbol);
                this.code.append(` = `);
                this.emitStatement(child);
                this.code.append(`;\n`);
                child = child.nextSibling;
            }

            //collect all variables to declare
            let fnBody = node.functionBody();
            let vars = this.collectLocalVariables(fnBody);

            vars.forEach((child) => {
                //declare vars first
                this.code.append("var ");
                let value = child.variableValue();
                this.emitSymbolName(child.symbol);
                assert(value != null);

                if (isNaN(value.rawValue)) {
                    vars.push(child);
                    this.code.append(" = ");
                    this.emitNullInitializer(value);
                    this.code.append(";\n");
                } else {
                    this.code.append(" = ");
                    this.emitExpression(value, Precedence.ASSIGN);
                    this.code.append(";\n");
                }
            });

            this.emitBlock(fnBody, false);
            this.code.indent--;
            this.code.clearIndent(1);
            this.code.append("}\n");

            if (node.isVirtual()) {
                this.code.breakChunk();
            }

            // if (isConstructor) {
            //     this.code.append(`return ptr;\n`);
            //     this.code.clearIndent(1);
            //     this.code.append("}");
            //     this.code.indent -= 1;
            // }

            this.code.append(needsSemicolon ? ";\n" : "\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.IF) {
            this.emitNewlineBefore(node);
            while (true) {
                this.code.append("if (");
                this.emitExpression(node.ifValue(), Precedence.LOWEST, true);
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
            this.emitExpression(node.whileValue(), Precedence.LOWEST, true);
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
                if (value.kind == NodeKind.NULL) {
                    this.code.append("return 0;\n");
                }
                else {

                    // if (value.kind == NodeKind.NEW) {
                    //     this.emitConstructor(value);
                    // }

                    this.code.append("return ");

                    let identifier = getIdentifier(node.lastChild);

                    this.code.append(identifier.left);
                    this.emitExpression(value, Precedence.LOWEST);
                    this.code.append(identifier.right);

                    this.code.append(";\n");
                }

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
            let child = node.firstChild;

            while (child != null) {

                if (child.symbol.kind == SymbolKind.VARIABLE_LOCAL) {

                    let value = child.variableValue();
                    assert(value != null);
                    if (isNaN(value.rawValue)) {
                        this.emitSymbolName(child.symbol);
                        this.code.append(" = ");
                        this.emitExpression(value, Precedence.LOWEST, true);
                        this.code.append(";\n");
                    }
                }

                child = child.nextSibling;
            }

            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.VARIABLE) {

            if (node.symbol.kind == SymbolKind.VARIABLE_ARGUMENT) {

                // this.emitSymbolName(node.symbol);
                // this.code.append(" = ");

                if (node.symbol.resolvedType.isFloat()) {
                    this.code.append("fround(");
                    this.emitSymbolName(node.symbol);
                    this.code.append(")");
                }
                else if (node.symbol.resolvedType.isDouble()) {
                    this.code.append("+");
                    this.emitSymbolName(node.symbol);

                } else {
                    this.emitSymbolName(node.symbol);
                    this.code.append("|0");
                }
            }

            else {
                assert(false);
            }
        }

        else if (node.kind == NodeKind.ENUM) {
            if (node.isExport()) {
                this.emitNewlineBefore(node);
                exportTable.push(this.emitSymbolName(node.symbol));
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

    emitConstructor(node: Node): void {
        let constructorNode = node.constructorNode();
        let callSymbol = constructorNode.symbol;
        let child = node.firstChild.nextSibling;
        this.code.append(`${callSymbol.parent().name}_new(`);
        while (child != null) {
            this.emitExpression(child, Precedence.MEMBER, true);
            child = child.nextSibling;
            if (child) {
                this.code.append(", ");
            }
        }
        this.code.append(")|0");
    }

    emitVirtuals() {

        this.code.append("\n");
        this.code.append("//FIXME: Virtuals should emit next to base class virtual function\n");

        virtualMap.forEach((virtual, virtualName) => {

            this.code.append("\n");

            this.code.append(`function ${virtual.name}(${virtual.signature}) {\n`, 1);

            this.code.append(`switch (${namespace}HEAP32[ptr >> 2]) {\n`, 1);

            for (let impl of virtual.functions) {
                this.code.append(`case ${impl.parent}_CLSID:\n`, 1);
                this.code.append(`return ${impl.parent}_${impl.name}_impl(${virtual.signature});\n`);
                this.code.clearIndent(1);
                this.code.indent -= 1;
            }

            this.code.append("default:\n", 1);
            this.code.append(`throw ${namespace}_badType(ptr);\n`);
            this.code.indent -= 2;
            this.code.clearIndent(2);
            this.code.append("}\n");
            this.code.indent -= 1;
            this.code.clearIndent(1);
            this.code.append("}\n");
            // for (let virtual of vtable) {
            //     let signature = virtual.signature;
            //     this.code.append(`${virtual.name} = function (ptr, ${signature}) {\n`);
            //     this.code.append("        switch (${namespace}HEAP32[ptr >> 2]) {\n");
            //     let kv = virtual.reverseCases.keysValues();
            //     for (let [name,cases]=kv.next(); name; [name, cases] = kv.next()) {
            //         for (let c of cases) {
            //             this.code.append(`      case ${c}:`);
            //         }
            //         this.code.append(`      return ${name}(ptr ${signature});`);
            //     }
            //     this.code.append("      default:");
            //     this.code.append("      " + (virtual.default_ ?
            //             `return ${virtual.default_}(ptr ${signature})` :
            //             "throw ${namespace}_badType(ptr)") + ";");
            //     this.code.append("  }");
            //     this.code.append("}");
            // }

        })
    }

    updateVirtualTable(node, chunkIndex, baseClassName, signature) {
        let virtualName = baseClassName ? `${baseClassName}_${node.stringValue}` : `${node.parent.stringValue}_${node.stringValue}`;
        let virtual = virtualMap.get(virtualName);
        if (!virtual) {
            virtual = {
                name: virtualName,
                signature: signature,
                functions: [
                    {
                        chunkIndex: chunkIndex,
                        parent: node.parent.stringValue,
                        name: node.stringValue,
                        base: baseClassName || null,
                        signature: signature
                    }
                ]
            };
            virtualMap.set(virtualName, virtual);
        } else {
            virtual.functions.push({
                chunkIndex: chunkIndex,
                parent: node.parent.stringValue,
                name: node.stringValue,
                base: baseClassName || null,
                signature: signature
            });
        }
    }

    getClassDef(node: Node) {
        let def = classMap.get(node.symbol.name);

        if (def) {
            return def;
        }

        def = {
            name: node.symbol.name,
            size: 4,
            align: 4,
            clsid: computeClassId(node.symbol.name),
            members: {},
            code: ""
        };

        if (node.firstChild && node.firstChild.kind == NodeKind.EXTENDS) {
            def.base = node.firstChild.firstChild.stringValue;
        }

        let argument = node.firstChild;
        while (argument != null) {
            if (argument.kind == NodeKind.VARIABLE) {
                let typeSize: number;
                let memory: string;
                let offset: number;
                let shift: number;
                let resolvedType = argument.symbol.resolvedType;

                if (resolvedType.pointerTo) {
                    typeSize = 4;
                    memory = `HEAP32`;
                    offset = 4 + (argument.offset * typeSize);
                    shift = Math.log2(typeSize);
                }
                else if (resolvedType.symbol.kind == SymbolKind.TYPE_CLASS) {
                    typeSize = 4;
                    memory = `HEAP32`;
                    offset = 4 + (argument.offset * typeSize);
                    shift = Math.log2(typeSize);
                }
                else {
                    typeSize = resolvedType.symbol.byteSize;
                    memory = `HEAP${getMemoryType(argument.firstChild.stringValue)}`;
                    offset = 4 + (argument.offset * typeSize);
                    shift = Math.log2(typeSize);
                }
                def.members[argument.symbol.name] = {
                    memory: memory,
                    size: typeSize,
                    offset: offset,
                    shift: shift,
                    value: argument.variableValue()
                };
                def.size += typeSize;
            }
            argument = argument.nextSibling;
        }

        classMap.set(node.symbol.name, def);

        return def;
    }

    collectLocalVariables(node: Node, vars: Node[] = []): Node[] {
        if (node.kind == NodeKind.VARIABLE) {
            if (node.symbol.kind == SymbolKind.VARIABLE_LOCAL) {
                vars.push(node);
            }
        }

        let child = node.firstChild;
        while (child != null) {
            this.collectLocalVariables(child, vars);
            child = child.nextSibling;
        }
        return vars;
    }

    prepareToEmit(node: Node): void {
        if (node.kind == NodeKind.STRING) {
            let text = node.stringValue;
            let length = text.length;
            let offset = this.context.allocateGlobalVariableOffset(length * 2 + 4, 4);
            //TODO: write to initial memory
        }

        else if (node.kind == NodeKind.IMPORTS) {
            let child = node.firstChild;
            while (child) {
                assert(child.kind == NodeKind.IMPORT);
                child = child.nextSibling;
            }
        }

        else if (node.kind == NodeKind.VARIABLE) {
            let symbol = node.symbol;

            if (symbol.kind == SymbolKind.VARIABLE_GLOBAL) {
                let sizeOf = symbol.resolvedType.variableSizeOf(this.context);
                let value = symbol.node.variableValue();

                // Copy the initial value into the memory initializer

                let offset = symbol.offset;
                // let offset = this.context.allocateGlobalVariableOffset(sizeOf, symbol.resolvedType.allocationAlignmentOf(this.context));
                // symbol.byteOffset = offset;

                if (sizeOf == 1) {
                    if (symbol.resolvedType.isUnsigned()) {
                    } else {
                    }
                }
                else if (sizeOf == 2) {
                    if (symbol.resolvedType.isUnsigned()) {
                    } else {
                    }
                }
                else if (sizeOf == 4) {
                    if (symbol.resolvedType.isFloat()) {
                    } else {
                        if (symbol.resolvedType.isUnsigned()) {
                        } else {
                        }
                    }
                }
                else if (sizeOf == 8) {
                    if (symbol.resolvedType.isDouble()) {
                    } else {
                        //TODO Implement Int64 write
                        if (symbol.resolvedType.isUnsigned()) {
                        } else {
                        }
                    }
                }
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

        else if (node.kind == NodeKind.CLASS) {

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

            // console.log(symbol.name);

            // Functions without bodies are imports
            if (body == null) {
                // if (node.parent.isImport()) {
                //     let _import = importMap.get(node.parent.symbol.name);
                //     _import[node.symbol.name] = `${node.parent.symbol.name}.${node.symbol.name}`;
                // }
                if (node.isImport() || node.parent.isImport()) {
                    let moduleName = symbol.kind == SymbolKind.FUNCTION_INSTANCE ? symbol.parent().name : "global";
                    symbol.offset = this.importCount;
                    this.allocateImport(signatureIndex, moduleName, symbol.name);
                }
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

    allocateImport(signatureIndex: int32, mod: string, name: string): AsmImport {
        let result = new AsmImport();
        result.signatureIndex = signatureIndex;
        result.module = mod;
        result.name = name;

        if (this.firstImport == null) this.firstImport = result;
        else this.lastImport.next = result;
        this.lastImport = result;

        this.importCount = this.importCount + 1;

        importMap.set(mod + "." + name, result);

        return result;
    }

    allocateFunction(symbol: Symbol, signatureIndex: int32): AsmFunction {
        let fn = new AsmFunction();
        fn.symbol = symbol;
        fn.signatureIndex = signatureIndex;

        if (this.firstFunction == null) this.firstFunction = fn;
        else this.lastFunction.next = fn;
        this.lastFunction = fn;

        this.functionCount = this.functionCount + 1;

        functionMap.set(symbol.name, fn);

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

        signatureMap.set(i, signature);

        this.signatureCount = this.signatureCount + 1;
        return i;
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

        if (type == context.anyType) {
            return AsmType.VOID;
        }

        assert(false);
        return AsmType.VOID;
    }

    emitNullInitializer(node: Node) {
        let identifier = getIdentifier(node);
        if (identifier.float) {
            this.code.append(identifier.left);
        }
        this.code.append(`0${identifier.double ? ".0" : ""}`);
        if (identifier.float) {
            this.code.append(identifier.right);
        }
    }
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

function getIdentifier(node: Node, castToDouble:boolean=false) {
    let resolvedType = node.resolvedType.pointerTo ? node.resolvedType.pointerTo : node.resolvedType;
    let identifier_1 = "";
    let identifier_2 = "";
    let int: boolean = false;
    let float: boolean = false;
    let double: boolean = false;

    if (castToDouble || resolvedType.isDouble()) {
        identifier_1 = "+(";
        identifier_2 = ")";
        double = true;

    } else if (resolvedType.isFloat()) {
        identifier_1 = "fround(";
        identifier_2 = ")";
        float = true;
    }
    else if (resolvedType.isInteger()) {
        identifier_1 = "(";
        identifier_2 = "|0)";
        int = true;
    } else {
        identifier_1 = "(";
        identifier_2 = "|0)";
        int = true;
    }
    return {
        left: identifier_1,
        right: identifier_2,
        int: int,
        float: float,
        double: double
    };
}
function asmTypeToIdentifier(type: AsmType) {
    let identifier_1 = "";
    let identifier_2 = "";
    let int: boolean = false;
    let float: boolean = false;
    let double: boolean = false;

    if (type == AsmType.FLOAT) {
        identifier_1 = "fround(";
        identifier_2 = ")";
        float = true;
    }
    else if (type == AsmType.DOUBLE) {
        identifier_1 = "(+";
        identifier_2 = ")";
        double = true;

    } else if (type == AsmType.INT) {
        identifier_1 = "(";
        identifier_2 = "|0)";
        int = true;
    } else {
        identifier_1 = "(";
        identifier_2 = "|0)";
        int = true;
    }
    return {
        left: identifier_1,
        right: identifier_2,
        int: int,
        float: float,
        double: double
    };
}

function computeClassId(name: string): number {
    let n = name.length;
    for (let i = 0; i < name.length; i++) {
        let c = name.charAt(i);
        let v = 0;
        if (c >= 'A' && c <= 'Z')
            v = c.charCodeAt(0) - 'A'.charCodeAt(0);
        else if (c >= 'a' && c <= 'z')
            v = c.charCodeAt(0) - 'a'.charCodeAt(0) + 26;
        else if (c >= '0' && c <= '9')
            v = c.charCodeAt(0) - '0'.charCodeAt(0) + 52;
        else if (c == '_')
            v = 62;
        else if (c == '>')
            v = 63;
        else
            throw "Bad character in class name: " + c;
        n = (((n & 0x1FFFFFF) << 3) | (n >>> 25)) ^ v;
    }
    return n;
}

function getMemoryType(name: string): string {
    if (name == "int32") {
        return "32";
    } else if (name == "int16") {
        return "16";
    } else if (name == "int8") {
        return "8";
    } else if (name == "uint32") {
        return "U32";
    } else if (name == "uint16") {
        return "U16";
    } else if (name == "uint8") {
        return "U8";
    } else if (name == "float32") {
        return "F32";
    } else if (name == "float64") {
        return "F64";
    }
    //Pointer object
    return "32";
}

function symbolToValueType(symbol: Symbol) {
    let type = symbol.resolvedType;
    if (type.isFloat()) {
        return AsmType.FLOAT;
    }
    else if (type.isDouble()) {
        return AsmType.DOUBLE;
    }
    else if (type.isInteger() || type.isLong() || type.pointerTo) {
        return AsmType.INT;
    } else {
        return AsmType.INT;
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

function asmWrapType(id: AsmType): AsmWrappedType {
    assert(id == AsmType.VOID || id == AsmType.INT || id == AsmType.FLOAT || id == AsmType.DOUBLE);
    let type = new AsmWrappedType();
    type.id = id;
    return type;
}

export function turboASMJsEmit(compiler: Compiler): void {
    let code: StringBuilder = StringBuilder_new();
    let module = new TurboASMJsModule();
    module.context = compiler.context;
    module.code = code;

    module.prepareToEmit(compiler.global);

    code.append("function TurboModule(global, env, buffer) {\n");
    code.append('"use asm";\n');
    code.emitIndent(1);
    code.append(compiler.runtimeSource);
    code.append('\n');
    module.emitImports();
    code.append('\n');
    module.emitStatements(compiler.global.firstChild);
    module.emitVirtuals();

    if (module.foundMultiply) {
        code.append("\n");
        code.append("let __imul = Math.imul || function(a, b) {\n");
        code.append("return (a * (b >>> 16) << 16) + a * (b & 65535) | 0;\n");
        code.append("};\n");
    }

    code.append("return {\n");
    exportTable.forEach((name: string, index) => {
        code.append(`   ${name}:${name}${index < exportTable.length - 1 ? "," : ""}\n`);
    });
    code.append("}\n");
    code.indent -= 1;
    code.clearIndent(1);
    code.append("}\n");

    code.append(compiler.wrapperSource);

    compiler.outputJS = code.finish();
}
