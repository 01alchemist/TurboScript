import {CheckContext} from "./checker";
import {StringBuilder, StringBuilder_appendQuoted, StringBuilder_new} from "./stringbuilder";
import {Symbol, SymbolKind} from "./symbol";
import {Node, NodeKind, isCompactNodeKind, isUnaryPostfix, invertedBinaryKind} from "./node";
import {Precedence} from "./parser";
import {Compiler} from "./compiler";
export enum EmitBinary {
    NORMAL,
    CAST_TO_INT,
    CAST_TO_FLOAT,
    CAST_TO_DOUBLE,
}

export class JsResult {
    context: CheckContext;
    code: StringBuilder;
    indent: int32;
    foundMultiply: boolean;
    previousNode: Node;

    emitIndent(): void {
        var i = this.indent;
        while (i > 0) {
            this.code.append("  ");
            i = i - 1;
        }
    }

    emitNewlineBefore(node: Node): void {
        if (this.previousNode != null && (!isCompactNodeKind(this.previousNode.kind) || !isCompactNodeKind(node.kind))) {
            this.code.append('\n');
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

    emitBlock(node: Node): void {
        this.previousNode = null;
        this.code.append("{\n");
        this.indent = this.indent + 1;
        this.emitStatements(node.firstChild);
        this.indent = this.indent - 1;
        this.emitIndent();
        this.code.append('}');
        this.previousNode = null;
    }

    emitUnary(node: Node, parentPrecedence: Precedence, operator: string): void {
        var isPostfix = isUnaryPostfix(node.kind);
        var shouldCastToInt = node.kind == NodeKind.NEGATIVE && !jsKindCastsOperandsToInt(node.parent.kind);
        var isUnsigned = node.isUnsignedOperator();
        var operatorPrecedence = shouldCastToInt ? isUnsigned ? Precedence.SHIFT : Precedence.BITWISE_OR : isPostfix ? Precedence.UNARY_POSTFIX : Precedence.UNARY_PREFIX;
        var code = this.code;

        if (parentPrecedence > operatorPrecedence) {
            code.append('(');
        }

        if (!isPostfix) {
            code.append(operator);
        }

        this.emitExpression(node.unaryValue(), operatorPrecedence);

        if (isPostfix) {
            code.append(operator);
        }

        if (shouldCastToInt) {
            code.append(isUnsigned ? " >>> 0" : " | 0");
        }

        if (parentPrecedence > operatorPrecedence) {
            code.append(')');
        }
    }

    emitBinary(node: Node, parentPrecedence: Precedence, operator: string, operatorPrecedence: Precedence, mode: EmitBinary): void {
        var isRightAssociative = node.kind == NodeKind.ASSIGN;
        var isUnsigned = node.isUnsignedOperator();
        var code = this.code;

        // Avoid casting when the parent operator already does a cast
        var shouldCastToInt = mode == EmitBinary.CAST_TO_INT && (isUnsigned || !jsKindCastsOperandsToInt(node.parent.kind));
        var selfPrecedence = shouldCastToInt ? isUnsigned ? Precedence.SHIFT : Precedence.BITWISE_OR : parentPrecedence;

        if (parentPrecedence > selfPrecedence) {
            code.append('(');
        }

        if (selfPrecedence > operatorPrecedence) {
            code.append('(');
        }

        this.emitExpression(node.binaryLeft(), isRightAssociative ? (operatorPrecedence + 1) as Precedence : operatorPrecedence);
        code.append(operator);
        this.emitExpression(node.binaryRight(), isRightAssociative ? operatorPrecedence : (operatorPrecedence + 1) as Precedence);

        if (selfPrecedence > operatorPrecedence) {
            code.append(')');
        }

        if (shouldCastToInt) {
            code.append(isUnsigned ? " >>> 0" : " | 0");
        }

        if (parentPrecedence > selfPrecedence) {
            code.append(')');
        }
    }

    emitCommaSeparatedExpressions(start: Node, stop: Node): void {
        while (start != stop) {
            this.emitExpression(start, Precedence.LOWEST);
            start = start.nextSibling;

            if (start != stop) {
                this.code.append(", ");
            }
        }
    }

    emitExpression(node: Node, parentPrecedence: Precedence): void {
        var code = this.code;

        if (node.kind == NodeKind.NAME) {
            var symbol = node.symbol;
            if (symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.node.isDeclare()) {
                code.append("__declare.");
            }
            this.emitSymbolName(symbol);
        }

        else if (node.kind == NodeKind.NULL) {
            code.append("null");
        }

        else if (node.kind == NodeKind.BOOLEAN) {
            code.append(node.intValue != 0 ? "true" : "false");
        }

        else if (node.kind == NodeKind.INT32) {
            if (parentPrecedence == Precedence.MEMBER) {
                code.append('(');
            }

            code.append(node.resolvedType.isUnsigned()
                ? (node.intValue).toString()
                : node.intValue.toString());

            if (parentPrecedence == Precedence.MEMBER) {
                code.append(')');
            }
        }

        else if (node.kind == NodeKind.STRING) {
            this.code.append(`\`${node.stringValue}\``);
            // StringBuilder_appendQuoted(code, node.stringValue);
        }

        else if (node.kind == NodeKind.CAST) {
            var context = this.context;
            var value = node.castValue();
            var from = value.resolvedType.underlyingType(context);
            var type = node.resolvedType.underlyingType(context);
            var fromSize = from.variableSizeOf(context);
            var typeSize = type.variableSizeOf(context);

            // The cast isn't needed if it's to a wider integer type
            if (from == type || fromSize < typeSize) {
                this.emitExpression(value, parentPrecedence);
            }

            else {
                // Sign-extend
                if (type == context.sbyteType || type == context.shortType) {
                    if (parentPrecedence > Precedence.SHIFT) {
                        code.append('(');
                    }

                    var shift = (32 - typeSize * 8).toString();
                    this.emitExpression(value, Precedence.SHIFT);
                    code.append(" << ");
                    code.append(shift);
                    code.append(" >> ");
                    code.append(shift);

                    if (parentPrecedence > Precedence.SHIFT) {
                        code.append(')');
                    }
                }

                // Mask
                else if (type == context.byteType || type == context.ushortType) {
                    if (parentPrecedence > Precedence.BITWISE_AND) {
                        code.append('(');
                    }

                    this.emitExpression(value, Precedence.BITWISE_AND);
                    code.append(" & ");
                    code.append(type.integerBitMask(context).toString());

                    if (parentPrecedence > Precedence.BITWISE_AND) {
                        code.append(')');
                    }
                }

                // Truncate signed
                else if (type == context.int32Type) {
                    if (parentPrecedence > Precedence.BITWISE_OR) {
                        code.append('(');
                    }

                    this.emitExpression(value, Precedence.BITWISE_OR);
                    code.append(" | 0");

                    if (parentPrecedence > Precedence.BITWISE_OR) {
                        code.append(')');
                    }
                }

                // Truncate unsigned
                else if (type == context.uint32Type) {
                    if (parentPrecedence > Precedence.SHIFT) {
                        code.append('(');
                    }

                    this.emitExpression(value, Precedence.SHIFT);
                    code.append(" >>> 0");

                    if (parentPrecedence > Precedence.SHIFT) {
                        code.append(')');
                    }
                }

                // No cast needed
                else {
                    this.emitExpression(value, parentPrecedence);
                }
            }
        }

        else if (node.kind == NodeKind.DOT) {
            this.emitExpression(node.dotTarget(), Precedence.MEMBER);
            code.append('.');
            this.emitSymbolName(node.symbol);
        }

        else if (node.kind == NodeKind.HOOK) {
            if (parentPrecedence > Precedence.ASSIGN) {
                code.append('(');
            }

            this.emitExpression(node.hookValue(), Precedence.LOGICAL_OR);
            code.append(" ? ");
            this.emitExpression(node.hookTrue(), Precedence.ASSIGN);
            code.append(" : ");
            this.emitExpression(node.hookFalse(), Precedence.ASSIGN);

            if (parentPrecedence > Precedence.ASSIGN) {
                code.append(')');
            }
        }

        else if (node.kind == NodeKind.INDEX) {
            var value = node.indexTarget();
            this.emitExpression(value, Precedence.UNARY_POSTFIX);
            code.append('[');
            this.emitCommaSeparatedExpressions(value.nextSibling, null);
            code.append(']');
        }

        else if (node.kind == NodeKind.CALL) {
            if (node.expandCallIntoOperatorTree()) {
                this.emitExpression(node, parentPrecedence);
            }

            else {
                var value = node.callValue();
                this.emitExpression(value, Precedence.UNARY_POSTFIX);

                if (value.symbol == null || !value.symbol.isGetter()) {
                    code.append('(');
                    this.emitCommaSeparatedExpressions(value.nextSibling, null);
                    code.append(')');
                }
            }
        }

        else if (node.kind == NodeKind.NEW) {
            code.append("new ");
            this.emitExpression(node.newType(), Precedence.UNARY_POSTFIX);
            code.append("()");
        }

        else if (node.kind == NodeKind.NOT) {
            var value = node.unaryValue();

            // Automatically invert operators for readability
            value.expandCallIntoOperatorTree();
            var invertedKind = invertedBinaryKind(value.kind);

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

        else if (node.kind == NodeKind.ADD) this.emitBinary(node, parentPrecedence, " + ", Precedence.ADD, EmitBinary.CAST_TO_INT);
        else if (node.kind == NodeKind.ASSIGN) this.emitBinary(node, parentPrecedence, " = ", Precedence.ASSIGN, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.BITWISE_AND) this.emitBinary(node, parentPrecedence, " & ", Precedence.BITWISE_AND, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.BITWISE_OR) this.emitBinary(node, parentPrecedence, " | ", Precedence.BITWISE_OR, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.BITWISE_XOR) this.emitBinary(node, parentPrecedence, " ^ ", Precedence.BITWISE_XOR, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.DIVIDE) this.emitBinary(node, parentPrecedence, " / ", Precedence.MULTIPLY, EmitBinary.CAST_TO_INT);
        else if (node.kind == NodeKind.EQUAL) this.emitBinary(node, parentPrecedence, " === ", Precedence.EQUAL, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.GREATER_THAN) this.emitBinary(node, parentPrecedence, " > ", Precedence.COMPARE, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.GREATER_THAN_EQUAL) this.emitBinary(node, parentPrecedence, " >= ", Precedence.COMPARE, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.LESS_THAN) this.emitBinary(node, parentPrecedence, " < ", Precedence.COMPARE, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.LESS_THAN_EQUAL) this.emitBinary(node, parentPrecedence, " <= ", Precedence.COMPARE, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.LOGICAL_AND) this.emitBinary(node, parentPrecedence, " && ", Precedence.LOGICAL_AND, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.LOGICAL_OR) this.emitBinary(node, parentPrecedence, " || ", Precedence.LOGICAL_OR, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.NOT_EQUAL) this.emitBinary(node, parentPrecedence, " !== ", Precedence.EQUAL, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.REMAINDER) this.emitBinary(node, parentPrecedence, " % ", Precedence.MULTIPLY, EmitBinary.CAST_TO_INT);
        else if (node.kind == NodeKind.SHIFT_LEFT) this.emitBinary(node, parentPrecedence, " << ", Precedence.SHIFT, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.SHIFT_RIGHT) this.emitBinary(node, parentPrecedence, node.isUnsignedOperator() ? " >>> " : " >> ", Precedence.SHIFT, EmitBinary.NORMAL);
        else if (node.kind == NodeKind.SUBTRACT) this.emitBinary(node, parentPrecedence, " - ", Precedence.ADD, EmitBinary.CAST_TO_INT);

        else if (node.kind == NodeKind.MULTIPLY) {
            var left = node.binaryLeft();
            var right = node.binaryRight();
            var isUnsigned = node.isUnsignedOperator();

            if (isUnsigned && parentPrecedence > Precedence.SHIFT) {
                code.append('(');
            }

            code.append("__imul(");
            this.emitExpression(left, Precedence.LOWEST);
            code.append(", ");
            this.emitExpression(right, Precedence.LOWEST);
            code.append(')');
            this.foundMultiply = true;

            if (isUnsigned) {
                code.append(" >>> 0");

                if (parentPrecedence > Precedence.SHIFT) {
                    code.append(')');
                }
            }
        }

        else {
            assert(false);
        }
    }

    emitSymbolName(symbol: Symbol): void {
        this.code.append(symbol.rename != null ? symbol.rename : symbol.name);
    }

    emitStatement(node: Node): void {
        var code = this.code;

        if (node.kind == NodeKind.FUNCTION) {
            var body = node.functionBody();
            if (body == null) {
                return;
            }

            var symbol = node.symbol;
            var needsSemicolon = false;
            this.emitNewlineBefore(node);
            this.emitIndent();

            if (symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
                this.emitSymbolName(symbol.parent());
                code.append(".prototype.");
                this.emitSymbolName(symbol);
                code.append(" = function");
                needsSemicolon = true;
            }

            else if (node.isExport()) {
                code.append("var ");
                this.emitSymbolName(symbol);
                code.append(" = __exports.");
                this.emitSymbolName(symbol);
                code.append(" = function");
                needsSemicolon = true;
            }

            else {
                code.append("function ");
                this.emitSymbolName(symbol);
            }

            code.append('(');

            var returnType = node.functionReturnType();
            var child = node.functionFirstArgumentIgnoringThis();

            while (child != returnType) {
                assert(child.kind == NodeKind.VARIABLE);
                this.emitSymbolName(child.symbol);
                child = child.nextSibling;
                if (child != returnType) {
                    code.append(", ");
                }
            }

            code.append(") ");
            this.emitBlock(node.functionBody());
            code.append(needsSemicolon ? ";\n" : "\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.IF) {
            this.emitNewlineBefore(node);
            this.emitIndent();
            while (true) {
                code.append("if (");
                this.emitExpression(node.ifValue(), Precedence.LOWEST);
                code.append(") ");
                this.emitBlock(node.ifTrue());
                var no = node.ifFalse();
                if (no == null) {
                    code.append('\n');
                    break;
                }
                code.append("\n\n");
                this.emitIndent();
                code.append("else ");
                if (no.firstChild == null || no.firstChild != no.lastChild || no.firstChild.kind != NodeKind.IF) {
                    this.emitBlock(no);
                    code.append('\n');
                    break;
                }
                node = no.firstChild;
            }
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.WHILE) {
            this.emitNewlineBefore(node);
            this.emitIndent();
            code.append("while (");
            this.emitExpression(node.whileValue(), Precedence.LOWEST);
            code.append(") ");
            this.emitBlock(node.whileBody());
            code.append('\n');
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.BREAK) {
            this.emitNewlineBefore(node);
            this.emitIndent();
            code.append("break;\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.CONTINUE) {
            this.emitNewlineBefore(node);
            this.emitIndent();
            code.append("continue;\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.EXPRESSION) {
            this.emitNewlineBefore(node);
            this.emitIndent();
            this.emitExpression(node.expressionValue(), Precedence.LOWEST);
            code.append(";\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.EMPTY) {
        }

        else if (node.kind == NodeKind.RETURN) {
            var value = node.returnValue();
            this.emitNewlineBefore(node);
            this.emitIndent();
            if (value != null) {
                code.append("return ");
                this.emitExpression(value, Precedence.LOWEST);
                code.append(";\n");
            } else {
                code.append("return;\n");
            }
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.BLOCK) {
            if (node.parent.kind == NodeKind.BLOCK) {
                this.emitStatements(node.firstChild);
            } else {
                this.emitNewlineBefore(node);
                this.emitIndent();
                this.emitBlock(node);
                code.append('\n');
                this.emitNewlineAfter(node);
            }
        }

        else if (node.kind == NodeKind.VARIABLES) {
            this.emitNewlineBefore(node);
            this.emitIndent();
            code.append("var ");
            var child = node.firstChild;

            while (child != null) {
                var value = child.variableValue();
                this.emitSymbolName(child.symbol);
                child = child.nextSibling;
                if (child != null) {
                    code.append(", ");
                }
                assert(value != null);
                code.append(" = ");
                this.emitExpression(value, Precedence.LOWEST);
            }

            code.append(";\n");
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.CLASS) {
            // Emit constructor
            if (!node.isDeclare()) {
                this.emitNewlineBefore(node);
                this.emitIndent();
                code.append("function ");
                this.emitSymbolName(node.symbol);
                code.append("() {\n");
                this.indent = this.indent + 1;

                var argument = node.firstChild;
                while (argument != null) {
                    if (argument.kind == NodeKind.VARIABLE) {
                        this.emitIndent();
                        code.append("this.");
                        this.emitSymbolName(argument.symbol);
                        code.append(" = ");
                        this.emitExpression(argument.variableValue(), Precedence.LOWEST);
                        code.append(";\n");
                    }
                    argument = argument.nextSibling;
                }

                this.indent = this.indent - 1;
                this.emitIndent();
                code.append("}\n");
                this.emitNewlineAfter(node);
            }

            // Emit instance functions
            var child = node.firstChild;
            while (child != null) {
                if (child.kind == NodeKind.FUNCTION) {
                    this.emitStatement(child);
                }
                child = child.nextSibling;
            }
        }

        else if (node.kind == NodeKind.ENUM) {
            if (node.isExport()) {
                this.emitNewlineBefore(node);
                this.emitIndent();
                code.append("__exports.");
                this.emitSymbolName(node.symbol);
                code.append(" = {\n");
                this.indent = this.indent + 1;

                // Emit enum values
                var child = node.firstChild;
                while (child != null) {
                    assert(child.kind == NodeKind.VARIABLE);
                    this.emitIndent();
                    this.emitSymbolName(child.symbol);
                    code.append(": ");
                    code.append(child.symbol.offset.toString());
                    child = child.nextSibling;
                    code.append(child != null ? ",\n" : "\n");
                }

                this.indent = this.indent - 1;
                this.emitIndent();
                code.append("};\n");
                this.emitNewlineAfter(node);
            }
        }

        else if (node.kind == NodeKind.CONSTANTS) {
        }

        else {
            assert(false);
        }
    }
}

export function jsKindCastsOperandsToInt(kind: NodeKind): boolean {
    return kind == NodeKind.SHIFT_LEFT || kind == NodeKind.SHIFT_RIGHT ||
        kind == NodeKind.BITWISE_OR || kind == NodeKind.BITWISE_AND || kind == NodeKind.BITWISE_XOR;
}

export function jsEmit(compiler: Compiler): void {
    var code = StringBuilder_new();
    var result = new JsResult();
    result.context = compiler.context;
    result.code = code;

    code.append("(function(__declare, __exports) {\n");
    result.indent = 1;
    result.emitStatements(compiler.global.firstChild);

    if (result.foundMultiply) {
        code.append('\n');
        result.emitIndent();
        code.append("var __imul = Math.imul || function(a, b) {\n");
        result.indent = 2;
        result.emitIndent();
        code.append("return (a * (b >>> 16) << 16) + a * (b & 65535) | 0;\n");
        result.indent = 1;
        result.emitIndent();
        code.append("};\n");
    }

    code.append("}(\n");
    result.emitIndent();
    code.append("typeof global !== 'undefined' ? global : this,\n");
    result.emitIndent();
    code.append("typeof exports !== 'undefined' ? exports : this\n");
    code.append("));\n");

    compiler.outputJS = code.finish();
}
