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

let turboJsOptimiztion: uint8 = 0;
let classMap: Map<string, any> = new Map<string, any>();
let virtualMap: Map<string, any> = new Map<string, any>();
let currentClass: string;
let turboTargetPointer: string; //to store temporary pointer for variable access rewrite

export class TurboJsResult {
    context: CheckContext;
    code: StringBuilder;
    foundMultiply: boolean;
    previousNode: Node;

    emitNewlineBefore(node: Node): void {
        if (this.previousNode != null && (!isCompactNodeKind(this.previousNode.kind) || !isCompactNodeKind(node.kind))) {
            this.code.append("\n");
        }
        this.previousNode = null;
    }

    emitNewlineAfter(node: Node): void {
        this.previousNode = node;
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

    emitBinary(node: Node, parentPrecedence: Precedence, operator: string, operatorPrecedence: Precedence, mode: EmitBinary): void {
        let isRightAssociative = node.kind == NodeKind.ASSIGN;
        let isUnsigned = node.isUnsignedOperator();

        // Avoid casting when the parent operator already does a cast
        let shouldCastToInt = mode == EmitBinary.CAST_TO_INT && (isUnsigned || !jsKindCastsOperandsToInt(node.parent.kind));
        let selfPrecedence = shouldCastToInt ? isUnsigned ? Precedence.SHIFT : Precedence.BITWISE_OR : parentPrecedence;

        if (parentPrecedence > selfPrecedence) {
            this.code.append("(");
        }

        if (selfPrecedence > operatorPrecedence) {
            this.code.append("(");
        }

        this.emitExpression(node.binaryLeft(), isRightAssociative ? (operatorPrecedence + 1) as Precedence : operatorPrecedence);
        this.code.append(operator);
        this.emitExpression(node.binaryRight(), isRightAssociative ? operatorPrecedence : (operatorPrecedence + 1) as Precedence);

        if (selfPrecedence > operatorPrecedence) {
            this.code.append(")");
        }

        if (shouldCastToInt) {
            this.code.append(isUnsigned ? " >>> 0" : " | 0");
        }

        if (parentPrecedence > selfPrecedence) {
            this.code.append(")");
        }
    }

    emitCommaSeparatedExpressions(start: Node, stop: Node, needComma: boolean = false): void {
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

    emitExpression(node: Node, parentPrecedence: Precedence): void {

        if (node.kind == NodeKind.NAME) {
            let symbol = node.symbol;
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.node.isDeclare()) {
                this.code.append("__declare.");
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
                        turboTargetPointer = `unsafe.${memory}[(${ref} + ${offset}) >> ${shift}]`;
                        //emit class name for static call
                        this.code.append(`${resolvedNode.symbol.name}`);
                    } else {
                        this.code.append(`unsafe.${memory}[(${ref} + ${offset}) >> ${shift}]`);
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
                this.code.append(".new");
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

    emitSymbolName(symbol: Symbol): void {
        this.code.append(symbol.rename != null ? symbol.rename : symbol.name);
    }

    emitStatement(node: Node): void {

        if (node.kind == NodeKind.EXTENDS) {
            console.log("Extends found");
            this.code.append(" /*extends*/ ")
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
                    this.code.append(`let ${classDef.name} = {};\n`);
                    this.code.append(`${classDef.name}.NAME = "${classDef.name}";\n`);
                    this.code.append(`${classDef.name}.SIZE = ${classDef.size};\n`);
                    this.code.append(`${classDef.name}.ALIGN = ${classDef.align};\n`);
                    this.code.append(`${classDef.name}.CLSID = ${classDef.clsid};\n`);

                    if (classDef.base) {
                        this.code.append(`${classDef.name}.BASE = "${classDef.base}";\n`);
                    }

                    this.code.append(`unsafe._idToType[${classDef.name}.CLSID] = ${classDef.name};\n`);

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
                this.code.append(`__exports.${classDef.name} = ${classDef.name};\n`);
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
                    this.emitSymbolName(symbol.parent());
                    this.code.append(".new");
                    this.code.append(" = function");
                    needsSemicolon = true;
                } else {
                    if (isTurbo) {
                        this.emitSymbolName(symbol.parent());
                        this.code.append(".");
                        if (node.isVirtual()) {
                            this.code.append(symbol.name + "_impl");
                        } else {
                            this.emitSymbolName(symbol);
                        }
                        this.code.append(" = function");
                        needsSemicolon = true;
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
                this.code.append(`let ptr = unsafe.alloc(${parentName}.SIZE, ${parentName}.ALIGN);\n`);
                this.code.append(`unsafe._mem_i32[ptr >> 2] = ${classDef.name}.CLSID;\n`);
                this.code.append(`${parentName}.init_mem(ptr, `);
                this.code.append(`${signature});\n`);
                this.code.append("return ptr;\n", -1);
                this.code.append("};\n\n");

                this.code.append(`${classDef.name}.init_mem = function(ptr, `);
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

            this.code.append(needsSemicolon ? ";\n" : "\n");

            if(node.isExport()){
                this.code.append("__exports.");
                this.emitSymbolName(symbol);
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
                this.code.append("__exports.");
                this.emitSymbolName(node.symbol);
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

    emitVirtuals() {

        this.code.append("\n");
        this.code.append("//FIXME: Virtuals should emit next to base class virtual function\n");

        virtualMap.forEach((virtual, virtualName) => {

            this.code.append("\n");

            this.code.append(`${virtual.name} = function (${virtual.signature}) {\n`, 1);

            this.code.append("switch (unsafe._mem_i32[ptr >> 2]) {\n", 1);

            for (let impl of virtual.functions) {
                this.code.append(`case ${impl.parent}.CLSID:\n`, 1);
                this.code.append(`return ${impl.parent}.${impl.name}_impl(${virtual.signature});\n`);
                this.code.clearIndent(1);
                this.code.indent -= 1;
            }

            this.code.append("default:\n", 1);
            this.code.append("throw unsafe._badType(ptr);\n");
            this.code.indent -= 2;
            this.code.clearIndent(2);
            this.code.append("}\n");
            this.code.indent -= 1;
            this.code.clearIndent(1);
            this.code.append("};\n");
            // for (let virtual of vtable) {
            //     let signature = virtual.signature;
            //     this.code.append(`${virtual.name} = function (ptr, ${signature}) {\n`);
            //     this.code.append("        switch (unsafe._mem_i32[ptr >> 2]) {\n");
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
            //             "throw unsafe._badType(ptr)") + ";");
            //     this.code.append("  }");
            //     this.code.append("}");
            // }

        })
    }

    updateVirtualTable(node, chunkIndex, baseClassName, signature) {
        let virtualName = baseClassName ? `${baseClassName}.${node.stringValue}` : `${node.parent.stringValue}.${node.stringValue}`;
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
            clsid: this.computeClassId(node.symbol.name),
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
                    memory = `_mem_i32`;
                    offset = 4 + (argument.offset * typeSize);
                    shift = Math.log2(typeSize);
                }
                else if (resolvedType.symbol.kind == SymbolKind.TYPE_CLASS) {
                    typeSize = 4;
                    memory = `_mem_i32`;
                    offset = 4 + (argument.offset * typeSize);
                    shift = Math.log2(typeSize);
                }
                else {
                    typeSize = resolvedType.symbol.byteSize;
                    memory = `_mem_${this.getMemoryType(argument.firstChild.stringValue)}`;
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

    computeClassId(name: string): number {
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

    getMemoryType(name: string): string {
        if (name == "int32") {
            return "i32";
        } else if (name == "int16") {
            return "i16";
        } else if (name == "int8") {
            return "i8";
        } else if (name == "uint32") {
            return "u32";
        } else if (name == "uint16") {
            return "u16";
        } else if (name == "uint8") {
            return "u8";
        } else if (name == "float32") {
            return "f32";
        } else if (name == "float64") {
            return "f64";
        }
        //Pointer object
        return "i32";
    }
}

// function jsKindCastsOperandsToInt(kind: NodeKind): boolean {
//   return
//     kind == NodeKind.SHIFT_LEFT || kind == NodeKind.SHIFT_RIGHT ||
//     kind == NodeKind.BITWISE_OR || kind == NodeKind.BITWISE_AND || kind == NodeKind.BITWISE_XOR;
// }

export function turboJsEmit(compiler: Compiler): void {
    let code: StringBuilder = StringBuilder_new();
    let result = new TurboJsResult();
    result.context = compiler.context;
    result.code = code;

    code.append("(function(__declare, __exports) {\n");
    code.emitIndent(1);
    // code.append("let turbo = {};\n");
    // code.append("__exports.turbo = turbo;\n");
    //code.append("__exports = __exports.turbo;\n");
    result.emitStatements(compiler.global.firstChild);
    result.emitVirtuals();
    if (result.foundMultiply) {
        code.append("\n");
        code.append("let __imul = Math.imul || function(a, b) {\n");
        code.append("return (a * (b >>> 16) << 16) + a * (b & 65535) | 0;\n");
        code.append("};\n");
    }

    code.clearIndent(1);
    code.append("}(\n");
    code.append("typeof global !== 'undefined' ? global : this,\n");
    code.append("typeof exports !== 'undefined' ? exports : turbo\n");
    code.clearIndent(1);
    code.append("));\n");

    compiler.outputJS = code.finish();
}
