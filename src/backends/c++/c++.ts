import {CheckContext} from "../../compiler/analyzer/type-checker";
import {StringBuilder, StringBuilder_new} from "../../utils/stringbuilder";
import {Compiler, replaceFileExtension} from "../../compiler/compiler";
import {Node, isCompactNodeKind, isUnaryPostfix, NodeKind} from "../../compiler/core/node";
import {Precedence} from "../../compiler/parser/parser";
import {Symbol, SymbolKind} from "../../compiler/core/symbol";
import {isAlpha, isNumber, isASCII} from "../../compiler/scanner/scanner";
import {Type} from "../../compiler/core/type";
import {assert} from "../../utils/assert";

export enum TypeMode {
    NORMAL,
    DECLARATION,
    BARE,
}

export enum SourceMode {
    HEADER,
    IMPLEMENTATION,
}

export class CResult {
    context: CheckContext;
    code: StringBuilder;
    codePrefix: StringBuilder;
    headerName: string;
    private indent: int32;
    private hasStrings: boolean;
    private previousNode: Node;
    private nextStringLiteral: int32;

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
        var operatorPrecedence = isPostfix ? Precedence.UNARY_POSTFIX : Precedence.UNARY_PREFIX;
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

        if (parentPrecedence > operatorPrecedence) {
            code.append(')');
        }
    }

    emitBinary(node: Node, parentPrecedence: Precedence, operator: string, operatorPrecedence: Precedence): void {
        var kind = node.kind;
        var isRightAssociative = kind == NodeKind.ASSIGN;
        var needsParentheses = parentPrecedence > operatorPrecedence;
        var parentKind = node.parent.kind;
        var code = this.code;

        // Try to avoid warnings from Clang and GCC
        if (parentKind == NodeKind.LOGICAL_OR && kind == NodeKind.LOGICAL_AND ||
            parentKind == NodeKind.BITWISE_OR && kind == NodeKind.BITWISE_AND ||
            (parentKind == NodeKind.EQUAL || parentKind == NodeKind.NOT_EQUAL) && (kind == NodeKind.EQUAL || kind == NodeKind.NOT_EQUAL) ||
            (kind == NodeKind.ADD || kind == NodeKind.SUBTRACT) && (
            parentKind == NodeKind.BITWISE_AND || parentKind == NodeKind.BITWISE_OR || parentKind == NodeKind.BITWISE_XOR ||
            parentKind == NodeKind.SHIFT_LEFT || parentKind == NodeKind.SHIFT_RIGHT)) {
            needsParentheses = true;
        }

        if (needsParentheses) {
            code.append('(');
        }

        this.emitExpression(node.binaryLeft(), isRightAssociative ? (operatorPrecedence + 1) as Precedence : operatorPrecedence);
        code.append(operator);
        this.emitExpression(node.binaryRight(), isRightAssociative ? operatorPrecedence : (operatorPrecedence + 1) as Precedence);

        if (needsParentheses) {
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

    emitSymbolName(symbol: Symbol): void {
        if (symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
            this.code.append(symbol.parent().name).append('_');
        }

        this.code.append(symbol.rename != null ? symbol.rename : symbol.name);
    }

    emitExpression(node: Node, parentPrecedence: Precedence): void {
        var code = this.code;

        assert(node.resolvedType != null);

        if (node.kind == NodeKind.NAME) {
            this.emitSymbolName(node.symbol);
        }

        else if (node.kind == NodeKind.NULL) {
            code.append("NULL");
        }

        else if (node.kind == NodeKind.BOOLEAN) {
            code.append(node.intValue != 0 ? '1' : '0');
        }

        else if (node.kind == NodeKind.INT32) {
            code.append(node.resolvedType.isUnsigned()
                ? (node.intValue).toString()
                : node.intValue.toString());
        }

        else if (node.kind == NodeKind.FLOAT32) {
            code.append(node.floatValue.toString());
        }

        else if (node.kind == NodeKind.STRING) {
            var id = this.nextStringLiteral;
            var builder = StringBuilder_new();
            builder.append("__string_").append(id.toString());
            var value = node.stringValue;
            var codePrefix = this.codePrefix;
            var length = value.length;
            var i = 0;
            if (!this.hasStrings) {
                codePrefix.append(`
#ifdef TURBOSCRIPT_BIG_ENDIAN
  #define S(a, b) (((a) << 16) | (b))
#else
  #define S(a, b) ((a) | ((b) << 16))
#endif

`);
                this.hasStrings = true;
            }
            var underscore = true;
            i = 0;
            while (i < length && i < 32) {
                var c = value[i];
                if (isAlpha(c) || isNumber(c)) {
                    if (underscore) {
                        builder.append('_');
                        underscore = false;
                    }
                    builder.append(c);
                } else {
                    underscore = true;
                }
                i = i + 1;
            }
            var name = builder.finish();
            codePrefix.append("static const uint32_t ").append(name).append("[] = {").append(length.toString());
            i = 0;
            while (i < length) {
                codePrefix.append(", S(");
                cEmitCharacter(codePrefix, value[i]);
                if (i + 1 < length) {
                    codePrefix.append(i % 32 == 20 ? ",\n  " : ", ");
                    cEmitCharacter(codePrefix, value[i + 1]);
                    codePrefix.append(')');
                } else {
                    codePrefix.append(", 0)");
                }
                i = i + 2;
            }
            codePrefix.append("};\n");
            this.nextStringLiteral = this.nextStringLiteral + 1;
            code.append("(const uint16_t *)").append(name);
        }

        else if (node.kind == NodeKind.CAST) {
            if (parentPrecedence > Precedence.UNARY_PREFIX) {
                code.append('(');
            }

            code.append('(');
            this.emitType(node.resolvedType, TypeMode.NORMAL);
            code.append(')');
            this.emitExpression(node.castValue(), Precedence.UNARY_PREFIX);

            if (parentPrecedence > Precedence.UNARY_PREFIX) {
                code.append(')');
            }
        }

        else if (node.kind == NodeKind.DOT) {
            var target = node.dotTarget();
            this.emitExpression(target, Precedence.MEMBER);
            code.append(target.resolvedType.isReference() ? "->" : ".");
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

        else if (node.kind == NodeKind.CALL) {
            let value = node.callValue();
            this.emitSymbolName(value.symbol);
            code.append('(');

            // Make sure to emit "this"
            if (value.kind == NodeKind.DOT) {
                this.emitExpression(value.dotTarget(), Precedence.LOWEST);
                if (value.nextSibling != null) {
                    code.append(", ");
                }
            }

            this.emitCommaSeparatedExpressions(value.nextSibling, null);
            code.append(')');
        }

        // This uses "calloc" instead of "malloc" because it needs to be zero-initialized
        else if (node.kind == NodeKind.NEW) {
            code.append("calloc(1, sizeof(");
            this.emitType(node.resolvedType, TypeMode.BARE);
            code.append("))");
        }

        else if (node.kind == NodeKind.COMPLEMENT) this.emitUnary(node, parentPrecedence, "~");
        else if (node.kind == NodeKind.DEREFERENCE) this.emitUnary(node, parentPrecedence, "*");
        else if (node.kind == NodeKind.NEGATIVE) this.emitUnary(node, parentPrecedence, "-");
        else if (node.kind == NodeKind.NOT) this.emitUnary(node, parentPrecedence, "!");
        else if (node.kind == NodeKind.POSITIVE) this.emitUnary(node, parentPrecedence, "+");
        else if (node.kind == NodeKind.POSTFIX_DECREMENT) this.emitUnary(node, parentPrecedence, "--");
        else if (node.kind == NodeKind.POSTFIX_INCREMENT) this.emitUnary(node, parentPrecedence, "++");
        else if (node.kind == NodeKind.PREFIX_DECREMENT) this.emitUnary(node, parentPrecedence, "--");
        else if (node.kind == NodeKind.PREFIX_INCREMENT) this.emitUnary(node, parentPrecedence, "++");

        else if (node.kind == NodeKind.ADD) this.emitBinary(node, parentPrecedence, " + ", Precedence.ADD);
        else if (node.kind == NodeKind.ASSIGN) this.emitBinary(node, parentPrecedence, " = ", Precedence.ASSIGN);
        else if (node.kind == NodeKind.BITWISE_AND) this.emitBinary(node, parentPrecedence, " & ", Precedence.BITWISE_AND);
        else if (node.kind == NodeKind.BITWISE_OR) this.emitBinary(node, parentPrecedence, " | ", Precedence.BITWISE_OR);
        else if (node.kind == NodeKind.BITWISE_XOR) this.emitBinary(node, parentPrecedence, " ^ ", Precedence.BITWISE_XOR);
        else if (node.kind == NodeKind.DIVIDE) this.emitBinary(node, parentPrecedence, " / ", Precedence.MULTIPLY);
        else if (node.kind == NodeKind.EQUAL) this.emitBinary(node, parentPrecedence, " == ", Precedence.EQUAL);
        else if (node.kind == NodeKind.GREATER_THAN) this.emitBinary(node, parentPrecedence, " > ", Precedence.COMPARE);
        else if (node.kind == NodeKind.GREATER_THAN_EQUAL) this.emitBinary(node, parentPrecedence, " >= ", Precedence.COMPARE);
        else if (node.kind == NodeKind.LESS_THAN) this.emitBinary(node, parentPrecedence, " < ", Precedence.COMPARE);
        else if (node.kind == NodeKind.LESS_THAN_EQUAL) this.emitBinary(node, parentPrecedence, " <= ", Precedence.COMPARE);
        else if (node.kind == NodeKind.LOGICAL_AND) this.emitBinary(node, parentPrecedence, " && ", Precedence.LOGICAL_AND);
        else if (node.kind == NodeKind.LOGICAL_OR) this.emitBinary(node, parentPrecedence, " || ", Precedence.LOGICAL_OR);
        else if (node.kind == NodeKind.MULTIPLY) this.emitBinary(node, parentPrecedence, " * ", Precedence.MULTIPLY);
        else if (node.kind == NodeKind.NOT_EQUAL) this.emitBinary(node, parentPrecedence, " != ", Precedence.EQUAL);
        else if (node.kind == NodeKind.REMAINDER) this.emitBinary(node, parentPrecedence, " % ", Precedence.MULTIPLY);
        else if (node.kind == NodeKind.SHIFT_LEFT) this.emitBinary(node, parentPrecedence, " << ", Precedence.SHIFT);
        else if (node.kind == NodeKind.SHIFT_RIGHT) this.emitBinary(node, parentPrecedence, " >> ", Precedence.SHIFT);
        else if (node.kind == NodeKind.SUBTRACT) this.emitBinary(node, parentPrecedence, " - ", Precedence.ADD);

        else {
            assert(false);
        }
    }

    shouldEmitClass(node: Node): boolean {
        assert(node.kind == NodeKind.CLASS);
        return node.symbol.kind == SymbolKind.TYPE_CLASS && node.symbol != this.context.stringType.symbol;
    }

    emitType(originalType: Type, mode: TypeMode): void {
        var context = this.context;
        var code = this.code;
        var type = originalType;

        if (type.isEnum()) {
            type = type.underlyingType(this.context);
        }

        else {
            while (type.pointerTo != null) {
                type = type.pointerTo;
            }
        }

        if (type.isClass()) {
            code.append("struct ");
        }

        if (type == context.booleanType || type == context.uint8Type) code.append("uint8_t");
        else if (type == context.int8Type) code.append("int8_t");
        else if (type == context.int32Type) code.append("int32_t");
        else if (type == context.int64Type) code.append("int64_t");
        else if (type == context.int16Type) code.append("int16_t");
        else if (type == context.stringType) code.append("const uint16_t");
        else if (type == context.uint32Type) code.append("uint32_t");
        else if (type == context.uint16Type) code.append("uint16_t");
        else if (type == context.float32Type) code.append("float");
        else this.emitSymbolName(type.symbol);

        if (originalType.pointerTo != null) {
            code.append(' ');
            while (originalType.pointerTo != null) {
                code.append('*');
                originalType = originalType.pointerTo;
            }
        }

        else if (mode != TypeMode.BARE) {
            if (type.isReference()) code.append(" *");
            else if (mode == TypeMode.DECLARATION) code.append(' ');
        }
    }

    emitStatement(node: Node): void {
        var code = this.code;

        if (node.kind == NodeKind.IF) {
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
            var child = node.firstChild;
            while (child != null) {
                var value = child.variableValue();
                this.emitIndent();
                this.emitType(child.symbol.resolvedType, TypeMode.DECLARATION);
                this.emitSymbolName(child.symbol);
                assert(value != null);
                code.append(" = ");
                this.emitExpression(value, Precedence.LOWEST);
                code.append(";\n");
                child = child.nextSibling;
            }
            this.emitNewlineAfter(node);
        }

        else if (node.kind == NodeKind.CONSTANTS || node.kind == NodeKind.ENUM) {
        }

        else {
            assert(false);
        }
    }

    emitIncludes(code: StringBuilder, mode: SourceMode): void {
        if (mode == SourceMode.HEADER) {
            code.append("#include <stdint.h>\n"); // Need "int32_t" and friends
        }

        else {
            code.append("#include \"").append(this.headerName).append("\"\n");
            code.append("#include <stdlib.h>\n"); // Need "NULL" and "calloc"
            code.append("#include <string.h>\n"); // Need "memcpy" and "memcmp"
        }
    }

    emitTypeDeclarations(node: Node, mode: SourceMode): void {
        var code = this.code;

        while (node != null) {
            if (node.kind == NodeKind.CLASS) {
                if (this.shouldEmitClass(node) && (node.isDeclareOrExport() ? mode == SourceMode.HEADER : mode == SourceMode.IMPLEMENTATION)) {
                    this.emitNewlineBefore(node);
                    code.append("struct ").append(node.symbol.name).append(";\n");
                }
            }

            node = node.nextSibling;
        }
    }

    emitTypeDefinitions(node: Node, mode: SourceMode): void {
        var code = this.code;

        while (node != null) {
            if (node.kind == NodeKind.CLASS) {
                if (this.shouldEmitClass(node) && mode != SourceMode.HEADER) {
                    this.emitNewlineBefore(node);
                    code.append("struct ");
                    this.emitSymbolName(node.symbol);
                    code.append(" {\n");
                    this.indent = this.indent + 1;

                    // Emit member variables
                    var child = node.firstChild;
                    while (child != null) {
                        if (child.kind == NodeKind.VARIABLE) {
                            this.emitIndent();
                            this.emitType(child.symbol.resolvedType, TypeMode.DECLARATION);
                            this.emitSymbolName(child.symbol);
                            code.append(";\n");
                        }
                        child = child.nextSibling;
                    }

                    this.indent = this.indent - 1;
                    code.append("};\n");
                    this.emitNewlineAfter(node);
                }
            }

            else if (node.kind == NodeKind.ENUM) {
                if (mode == SourceMode.HEADER && node.isExport()) {
                    this.emitNewlineBefore(node);
                    code.append("enum {\n");
                    this.indent = this.indent + 1;

                    // Emit enum values
                    var child = node.firstChild;
                    while (child != null) {
                        assert(child.kind == NodeKind.VARIABLE);
                        this.emitIndent();
                        this.emitSymbolName(node.symbol);
                        code.append("_");
                        this.emitSymbolName(child.symbol);
                        code.append(" = ");
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

            node = node.nextSibling;
        }
    }

    shouldEmitFunction(symbol: Symbol): boolean {
        return symbol.kind != SymbolKind.FUNCTION_GLOBAL || symbol.name != "malloc" && symbol.name != "memcpy" && symbol.name != "memcmp";
    }

    emitFunctionDeclarations(node: Node, mode: SourceMode): void {
        var code = this.code;

        while (node != null) {
            if (node.kind == NodeKind.FUNCTION && (mode != SourceMode.HEADER || node.isDeclareOrExport())) {
                var symbol = node.symbol;

                if (this.shouldEmitFunction(symbol)) {
                    var returnType = node.functionReturnType();
                    var child = node.functionFirstArgument();

                    this.emitNewlineBefore(node);
                    if (!node.isDeclareOrExport()) {
                        code.append("static ");
                    }
                    this.emitType(returnType.resolvedType, TypeMode.DECLARATION);
                    this.emitSymbolName(symbol);
                    code.append('(');

                    if (symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
                        child.symbol.rename = "__this";
                    }

                    while (child != returnType) {
                        assert(child.kind == NodeKind.VARIABLE);
                        this.emitType(child.symbol.resolvedType, TypeMode.DECLARATION);
                        this.emitSymbolName(child.symbol);
                        child = child.nextSibling;
                        if (child != returnType) {
                            code.append(", ");
                        }
                    }

                    code.append(");\n");
                }
            }

            else if (node.kind == NodeKind.CLASS) {
                this.emitFunctionDeclarations(node.firstChild, mode);
            }

            node = node.nextSibling;
        }
    }

    emitGlobalVariables(node: Node, mode: SourceMode): void {
        var code = this.code;

        while (node != null) {
            if (node.kind == NodeKind.VARIABLE && (mode != SourceMode.HEADER || node.isExport())) {
                var value = node.variableValue();
                this.emitNewlineBefore(node);
                if (!node.isDeclareOrExport()) {
                    code.append("static ");
                }
                this.emitType(node.symbol.resolvedType, TypeMode.DECLARATION);
                this.emitSymbolName(node.symbol);
                code.append(" = ");
                this.emitExpression(value, Precedence.LOWEST);
                code.append(";\n");
            }

            else if (node.kind == NodeKind.VARIABLES) {
                this.emitGlobalVariables(node.firstChild, mode);
            }

            node = node.nextSibling;
        }
    }

    emitFunctionDefinitions(node: Node): void {
        var code = this.code;

        while (node != null) {
            if (node.kind == NodeKind.FUNCTION) {
                var body = node.functionBody();
                var symbol = node.symbol;

                if (body != null && this.shouldEmitFunction(symbol)) {
                    var returnType = node.functionReturnType();
                    var child = node.firstChild;

                    this.emitNewlineBefore(node);
                    if (!node.isDeclareOrExport()) {
                        code.append("static ");
                    }
                    this.emitType(returnType.resolvedType, TypeMode.DECLARATION);
                    this.emitSymbolName(symbol);
                    code.append('(');

                    while (child != returnType) {
                        assert(child.kind == NodeKind.VARIABLE);
                        this.emitType(child.symbol.resolvedType, TypeMode.DECLARATION);
                        this.emitSymbolName(child.symbol);
                        child = child.nextSibling;
                        if (child != returnType) {
                            code.append(", ");
                        }
                    }

                    code.append(") ");
                    this.emitBlock(node.functionBody());
                    code.append('\n');
                    this.emitNewlineAfter(node);
                }
            }

            else if (node.kind == NodeKind.CLASS) {
                this.emitFunctionDefinitions(node.firstChild);
            }

            node = node.nextSibling;
        }
    }

    finishImplementation(): void {
        if (this.hasStrings) {
            this.codePrefix.append("\n#undef S\n");
        }
    }
}

export function cEmitCharacter(builder: StringBuilder, c: string): void {
    if (isASCII(c.charCodeAt(0))) {
        builder.append('\'');
        if (c == '\\' || c == '\'') {
            builder.append('\\');
        }
        builder.append(c);
        builder.append('\'');
    }
    else if (c == '\0') builder.append("\'\\0\'");
    else if (c == '\r') builder.append("\'\\r\'");
    else if (c == '\n') builder.append("\'\\n\'");
    else if (c == '\t') builder.append("\'\\t\'");
    else builder.append(c.toString());
}

export function cppEmit(compiler: Compiler): void {
    var child = compiler.global.firstChild;
    var temporaryCode = StringBuilder_new();
    var headerCode = StringBuilder_new();
    var implementationCode = StringBuilder_new();
    var result = new CResult();
    result.context = compiler.context;
    result.code = temporaryCode;
    result.codePrefix = implementationCode;
    result.headerName = replaceFileExtension(compiler.outputName, ".h");

    if (child != null) {
        // Emit implementation
        result.emitIncludes(implementationCode, SourceMode.IMPLEMENTATION);
        result.emitNewlineAfter(child);

        result.emitTypeDeclarations(child, SourceMode.IMPLEMENTATION);
        result.emitNewlineAfter(child);

        result.emitTypeDefinitions(child, SourceMode.IMPLEMENTATION);
        result.emitNewlineAfter(child);

        result.emitFunctionDeclarations(child, SourceMode.IMPLEMENTATION);
        result.emitNewlineAfter(child);

        result.emitGlobalVariables(child, SourceMode.IMPLEMENTATION);
        result.emitNewlineAfter(child);

        result.emitFunctionDefinitions(child);
        result.finishImplementation();
        implementationCode.append(temporaryCode.finish());

        // Emit header
        result.code = headerCode;
        result.emitIncludes(headerCode, SourceMode.HEADER);
        result.emitNewlineAfter(child);

        result.emitTypeDeclarations(child, SourceMode.HEADER);
        result.emitNewlineAfter(child);

        result.emitTypeDefinitions(child, SourceMode.HEADER);
        result.emitNewlineAfter(child);

        result.emitFunctionDeclarations(child, SourceMode.HEADER);
        result.emitNewlineAfter(child);

        result.emitGlobalVariables(child, SourceMode.HEADER);
        result.emitNewlineAfter(child);
    }

    compiler.outputCPP = implementationCode.finish();
    compiler.outputH = headerCode.finish();
}
