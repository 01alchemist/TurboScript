import {isKeyword, splitToken, Token, TokenKind, tokenToString} from "../scanner/scanner";
import {createRange, Log, SourceRange, spanRanges} from "../../utils/log";
import {
    allFlags,
    appendFlag,
    createAlignOf,
    createAny,
    createBinary,
    createBlock,
    createboolean,
    createCall,
    createCast,
    createClass,
    createConstants,
    createDelete,
    createDot,
    createDouble,
    createEmpty,
    createEnum,
    createExpression,
    createExtends,
    createFloat,
    createFunction,
    createHook,
    createIf,
    createImplements,
    createImport,
    createImportFrom,
    createImports,
    createIndex,
    createInt,
    createModule,
    createName,
    createNew,
    createNull,
    createParameter,
    createParameters,
    createParseError,
    createReturn,
    createSizeOf,
    createString,
    createThis,
    createUnary,
    createUndefined,
    createVariable,
    createVariables,
    createWhile,
    isUnary,
    Node,
    NODE_FLAG_ANYFUNC,
    NODE_FLAG_DECLARE,
    NODE_FLAG_EXPORT,
    NODE_FLAG_GET,
    NODE_FLAG_JAVASCRIPT,
    NODE_FLAG_OPERATOR,
    NODE_FLAG_POSITIVE,
    NODE_FLAG_PRIVATE,
    NODE_FLAG_PROTECTED,
    NODE_FLAG_PUBLIC,
    NODE_FLAG_SET,
    NODE_FLAG_START,
    NODE_FLAG_STATIC,
    NODE_FLAG_UNSAFE,
    NODE_FLAG_VIRTUAL,
    NodeFlag,
    NodeKind
} from "../core/node";
import {assert} from "../../utils/assert";
import {Terminal} from "../../utils/terminal";

export enum Precedence {
    LOWEST,
    ASSIGN,
    LOGICAL_OR,
    LOGICAL_AND,
    BITWISE_OR,
    BITWISE_XOR,
    BITWISE_AND,
    EQUAL,
    COMPARE,
    SHIFT,
    ADD,
    MULTIPLY,
    EXPONENT,
    UNARY_PREFIX,
    UNARY_POSTFIX,
    MEMBER,
}

function isRightAssociative(precedence: Precedence): boolean {
    return precedence == Precedence.ASSIGN || precedence == Precedence.EXPONENT;
}

enum ParseKind {
    EXPRESSION,
    TYPE,
}

enum StatementMode {
    NORMAL,
    FILE,
}

class ParserContext {
    previous: Token;
    current: Token;
    log: Log;

    // This is used to suppress subsequent errors for the same token
    lastError: Token;

    peek(kind: TokenKind): boolean {
        return this.current.kind == kind;
    }

    eat(kind: TokenKind): boolean {
        if (this.peek(kind)) {
            this.advance();
            return true;
        }

        return false;
    }

    advance(): void {
        if (!this.peek(TokenKind.END_OF_FILE)) {
            this.previous = this.current;
            this.current = this.current.next;
        }
    }

    unexpectedToken(): void {
        if (this.lastError != this.current) {
            this.lastError = this.current;
            this.log.error(this.current.range, `Unexpected ${tokenToString(this.current.kind)}`);
        }
    }

    expect(kind: TokenKind): boolean {
        if (!this.peek(kind)) {
            if (this.lastError != this.current) {
                this.lastError = this.current;

                let previousLine = this.previous.range.enclosingLine();
                let currentLine = this.current.range.enclosingLine();

                // Show missing token errors on the previous line for clarity
                if (kind != TokenKind.IDENTIFIER && !previousLine.equals(currentLine)) {
                    this.log.error(previousLine.rangeAtEnd(), `Expected ${tokenToString(kind)}`);
                }

                else {
                    this.log.error(this.current.range,
                        `Expected ${tokenToString(kind)} but found ${tokenToString(this.current.kind)}`);
                }
            }

            return false;
        }

        this.advance();
        return true;
    }

    parseUnaryPrefix(kind: NodeKind, mode: ParseKind): Node {
        assert(isUnary(kind));

        let token = this.current;
        this.advance();

        let value = this.parseExpression(Precedence.UNARY_PREFIX, mode);
        if (value == null) {
            return null;
        }

        return createUnary(kind, value).withRange(spanRanges(token.range, value.range)).withInternalRange(token.range);
    }

    parseBinary(kind: NodeKind, left: Node, localPrecedence: Precedence, operatorPrecedence: Precedence): Node {
        if (localPrecedence >= operatorPrecedence) {
            return left;
        }

        let token = this.current;
        this.advance();

        // Reduce the precedence for right-associative operators
        let precedence = isRightAssociative(operatorPrecedence) ? (operatorPrecedence - 1) as Precedence : operatorPrecedence;
        let right = this.parseExpression(precedence, ParseKind.EXPRESSION);

        if (right == null) {
            return null;
        }

        return createBinary(kind, left, right).withRange(spanRanges(left.range, right.range)).withInternalRange(token.range);
    }

    parseUnaryPostfix(kind: NodeKind, value: Node, localPrecedence: Precedence): Node {
        if (localPrecedence >= Precedence.UNARY_POSTFIX) {
            return value;
        }

        let token = this.current;
        this.advance();
        return createUnary(kind, value).withRange(spanRanges(value.range, token.range)).withInternalRange(token.range);
    }

    parseQuotedString(range: SourceRange): string {
        assert(range.end - range.start >= 2);
        let text = range.source.contents;
        let end = range.start + 1;
        let limit = range.end - 1;
        let start = end;
        let quotedString = "";

        while (end < limit) {
            let c = text[end];

            if (c == '\\') {
                quotedString += text.slice(start, end);
                end = end + 1;
                start = end + 1;
                c = text[end];

                if (c == '0') quotedString += '\0';
                else if (c == 't') quotedString += '\t';
                else if (c == 'n') quotedString += '\n';
                else if (c == 'r') quotedString += '\r';
                else if (c == '"' || c == '\'' || c == '`' || c == '\n' || c == '\\') start = end;
                else {
                    let escape = createRange(range.source, range.start + end - 1, range.start + end + 1);
                    this.log.error(escape, `Invalid escape code '${escape.toString()}'`);
                    return null;
                }
            }

            end = end + 1;
        }

        return quotedString + text.slice(start, end);
    }

    parsePrefix(mode: ParseKind): Node {
        let token = this.current;

        if (this.peek(TokenKind.IDENTIFIER)) {
            this.advance();
            return createName(token.range.toString()).withRange(token.range);
        }

        // if (this.peek(TokenKind.ARRAY)) {
        //     this.advance();
        //     return createArray(token.range.toString()).withRange(token.range);
        // }

        if (this.peek(TokenKind.EXPONENT)) {
            splitToken(this.current, TokenKind.MULTIPLY, TokenKind.MULTIPLY);
        }

        if (this.peek(TokenKind.MULTIPLY)) {
            return this.parseUnaryPrefix(mode == ParseKind.TYPE ? NodeKind.POINTER_TYPE : NodeKind.DEREFERENCE, mode);
        }

        if (mode == ParseKind.EXPRESSION) {
            if (this.eat(TokenKind.NULL)) {
                return createNull().withRange(token.range);
            }
            if (this.eat(TokenKind.UNDEFINED)) {
                return createUndefined().withRange(token.range);
            }

            if (this.eat(TokenKind.THIS)) {
                return createThis().withRange(token.range);
            }

            if (this.peek(TokenKind.CHARACTER)) {
                let text = this.parseQuotedString(token.range);
                if (text == null) {
                    return null;
                }
                this.advance();
                if (text.length != 1) {
                    this.log.error(token.range, "Invalid character literal (strings use double quotes)");
                    return createParseError().withRange(token.range);
                }
                return createInt(text.charCodeAt(0)).withRange(token.range);
            }

            if (this.peek(TokenKind.STRING)) {
                let text = this.parseQuotedString(token.range);
                if (text == null) {
                    return null;
                }
                this.advance();
                return createString(text).withRange(token.range);
            }

            if (this.peek(TokenKind.INT32)) {
                let value = createInt(0);
                if (!this.parseInt(token.range, value)) {
                    value = createParseError();
                }
                this.advance();
                return value.withRange(token.range);
            }

            if (this.peek(TokenKind.FLOAT32)) {
                let value = createFloat(0);
                if (!this.parseFloat(token.range, value)) {
                    value = createParseError();
                }
                this.advance();
                return value.withRange(token.range);
            }

            if (this.peek(TokenKind.FLOAT64)) {
                let value = createDouble(0);
                if (!this.parseDouble(token.range, value)) {
                    value = createParseError();
                }
                this.advance();
                return value.withRange(token.range);
            }

            if (this.eat(TokenKind.TRUE)) {
                return createboolean(true).withRange(token.range);
            }

            if (this.eat(TokenKind.FALSE)) {
                return createboolean(false).withRange(token.range);
            }

            if (this.eat(TokenKind.NEW)) {
                let type = this.parseType();
                if (type == null) {
                    return null;
                }

                if (this.peek(TokenKind.LESS_THAN)) {
                    let parameters = this.parseParameters();
                    if (parameters == null) {
                        return null;
                    }
                    type.appendChild(parameters);
                }

                return this.parseArgumentList(token.range, createNew(type));
            }

            if (this.eat(TokenKind.ALIGNOF)) {
                if (!this.expect(TokenKind.LEFT_PARENTHESIS)) {
                    return null;
                }
                let type = this.parseType();
                let close = this.current;
                if (type == null || !this.expect(TokenKind.RIGHT_PARENTHESIS)) {
                    return null;
                }
                return createAlignOf(type).withRange(spanRanges(token.range, close.range));
            }

            if (this.eat(TokenKind.SIZEOF)) {
                if (!this.expect(TokenKind.LEFT_PARENTHESIS)) {
                    return null;
                }
                let type = this.parseType();
                let close = this.current;
                if (type == null || !this.expect(TokenKind.RIGHT_PARENTHESIS)) {
                    return null;
                }
                return createSizeOf(type).withRange(spanRanges(token.range, close.range));
            }

            if (this.eat(TokenKind.LEFT_PARENTHESIS)) {
                let value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                let close = this.current;
                if (value == null || !this.expect(TokenKind.RIGHT_PARENTHESIS)) {
                    return null;
                }
                return value.withRange(spanRanges(token.range, close.range));
            }

            // Unary prefix
            if (this.peek(TokenKind.BITWISE_AND)) return this.parseUnaryPrefix(NodeKind.ADDRESS_OF, ParseKind.EXPRESSION);
            if (this.peek(TokenKind.COMPLEMENT)) return this.parseUnaryPrefix(NodeKind.COMPLEMENT, ParseKind.EXPRESSION);
            if (this.peek(TokenKind.MINUS)) return this.parseUnaryPrefix(NodeKind.NEGATIVE, ParseKind.EXPRESSION);
            if (this.peek(TokenKind.MINUS_MINUS)) return this.parseUnaryPrefix(NodeKind.PREFIX_DECREMENT, ParseKind.EXPRESSION);
            if (this.peek(TokenKind.NOT)) return this.parseUnaryPrefix(NodeKind.NOT, ParseKind.EXPRESSION);
            if (this.peek(TokenKind.PLUS)) return this.parseUnaryPrefix(NodeKind.POSITIVE, ParseKind.EXPRESSION);
            if (this.peek(TokenKind.PLUS_PLUS)) return this.parseUnaryPrefix(NodeKind.PREFIX_INCREMENT, ParseKind.EXPRESSION);
        }


        if (this.peek(TokenKind.LEFT_BRACE)) {
            Terminal.write("Check if its JS");

        }

        this.unexpectedToken();
        return null;
    }

    parseInfix(precedence: Precedence, node: Node, mode: ParseKind): Node {
        let token = this.current.range;

        // Dot
        if (this.peek(TokenKind.DOT) && precedence < Precedence.MEMBER) {
            this.advance();

            let name = this.current;
            let range = name.range;

            // Allow contextual keywords
            if (isKeyword(name.kind)) {
                this.advance();
            }

            // Recover from a missing identifier
            else if (!this.expect(TokenKind.IDENTIFIER)) {
                range = createRange(range.source, token.end, token.end);
            }

            return createDot(node, range.toString()).withRange(spanRanges(node.range, range)).withInternalRange(range);
        }

        if (mode == ParseKind.EXPRESSION) {
            // Binary
            if (this.peek(TokenKind.ASSIGN)) return this.parseBinary(NodeKind.ASSIGN, node, precedence, Precedence.ASSIGN);
            if (this.peek(TokenKind.BITWISE_AND)) return this.parseBinary(NodeKind.BITWISE_AND, node, precedence, Precedence.BITWISE_AND);
            if (this.peek(TokenKind.BITWISE_OR)) return this.parseBinary(NodeKind.BITWISE_OR, node, precedence, Precedence.BITWISE_OR);
            if (this.peek(TokenKind.BITWISE_XOR)) return this.parseBinary(NodeKind.BITWISE_XOR, node, precedence, Precedence.BITWISE_XOR);
            if (this.peek(TokenKind.DIVIDE)) return this.parseBinary(NodeKind.DIVIDE, node, precedence, Precedence.MULTIPLY);
            if (this.peek(TokenKind.EQUAL)) return this.parseBinary(NodeKind.EQUAL, node, precedence, Precedence.EQUAL);
            if (this.peek(TokenKind.EXPONENT)) return this.parseBinary(NodeKind.EXPONENT, node, precedence, Precedence.EXPONENT);
            if (this.peek(TokenKind.GREATER_THAN)) return this.parseBinary(NodeKind.GREATER_THAN, node, precedence, Precedence.COMPARE);
            if (this.peek(TokenKind.GREATER_THAN_EQUAL)) return this.parseBinary(NodeKind.GREATER_THAN_EQUAL, node, precedence, Precedence.COMPARE);
            if (this.peek(TokenKind.LESS_THAN)) return this.parseBinary(NodeKind.LESS_THAN, node, precedence, Precedence.COMPARE);
            if (this.peek(TokenKind.LESS_THAN_EQUAL)) return this.parseBinary(NodeKind.LESS_THAN_EQUAL, node, precedence, Precedence.COMPARE);
            if (this.peek(TokenKind.LOGICAL_AND)) return this.parseBinary(NodeKind.LOGICAL_AND, node, precedence, Precedence.LOGICAL_AND);
            if (this.peek(TokenKind.LOGICAL_OR)) return this.parseBinary(NodeKind.LOGICAL_OR, node, precedence, Precedence.LOGICAL_OR);
            if (this.peek(TokenKind.MINUS)) return this.parseBinary(NodeKind.SUBTRACT, node, precedence, Precedence.ADD);
            if (this.peek(TokenKind.MULTIPLY)) return this.parseBinary(NodeKind.MULTIPLY, node, precedence, Precedence.MULTIPLY);
            if (this.peek(TokenKind.NOT_EQUAL)) return this.parseBinary(NodeKind.NOT_EQUAL, node, precedence, Precedence.EQUAL);
            if (this.peek(TokenKind.PLUS)) return this.parseBinary(NodeKind.ADD, node, precedence, Precedence.ADD);
            if (this.peek(TokenKind.REMAINDER)) return this.parseBinary(NodeKind.REMAINDER, node, precedence, Precedence.MULTIPLY);
            if (this.peek(TokenKind.SHIFT_LEFT)) return this.parseBinary(NodeKind.SHIFT_LEFT, node, precedence, Precedence.SHIFT);
            if (this.peek(TokenKind.SHIFT_RIGHT)) return this.parseBinary(NodeKind.SHIFT_RIGHT, node, precedence, Precedence.SHIFT);

            // Unary postfix
            if (this.peek(TokenKind.PLUS_PLUS)) return this.parseUnaryPostfix(NodeKind.POSTFIX_INCREMENT, node, precedence);
            if (this.peek(TokenKind.MINUS_MINUS)) return this.parseUnaryPostfix(NodeKind.POSTFIX_DECREMENT, node, precedence);

            // Cast
            if (this.peek(TokenKind.AS) && precedence < Precedence.UNARY_PREFIX) {
                this.advance();

                let type = this.parseType();
                if (type == null) {
                    return null;
                }

                return createCast(node, type).withRange(spanRanges(node.range, type.range)).withInternalRange(token);
            }

            // Call or index
            let isIndex = this.peek(TokenKind.LEFT_BRACKET);
            if ((isIndex || this.peek(TokenKind.LEFT_PARENTHESIS)) && precedence < Precedence.UNARY_POSTFIX) {
                return this.parseArgumentList(node.range, isIndex ? createIndex(node) : createCall(node));
            }

            // Hook
            if (this.peek(TokenKind.QUESTION_MARK) && precedence < Precedence.ASSIGN) {
                this.advance();

                let middle = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (middle == null || !this.expect(TokenKind.COLON)) {
                    return null;
                }

                let right = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (right == null) {
                    return null;
                }

                return createHook(node, middle, right).withRange(spanRanges(node.range, right.range));
            }
        }

        return node;
    }

    parseDelete(): Node {
        let token = this.current;
        assert(token.kind == TokenKind.DELETE);
        this.advance();

        let value: Node = null;
        if (!this.peek(TokenKind.SEMICOLON)) {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null) {
                return null;
            }
        }

        let semicolon = this.current;
        this.expect(TokenKind.SEMICOLON);
        return createDelete(value).withRange(spanRanges(token.range, semicolon.range));
    }

    parseArgumentList(start: SourceRange, node: Node): Node {
        let open = this.current.range;
        let isIndex = node.kind == NodeKind.INDEX;
        let left = isIndex ? TokenKind.LEFT_BRACKET : TokenKind.LEFT_PARENTHESIS;
        let right = isIndex ? TokenKind.RIGHT_BRACKET : TokenKind.RIGHT_PARENTHESIS;

        if (!this.expect(left)) {
            return null;
        }

        if (!this.peek(right)) {
            while (true) {
                let value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (value == null) {
                    return null;
                }
                node.appendChild(value);

                if (!this.eat(TokenKind.COMMA)) {
                    break;
                }
            }
        }

        let close = this.current.range;
        if (!this.expect(right)) {
            return null;
        }

        return node.withRange(spanRanges(start, close)).withInternalRange(spanRanges(open, close));
    }

    parseExpression(precedence: Precedence, mode: ParseKind): Node {
        // Prefix
        let node = this.parsePrefix(mode);
        if (node == null) {
            return null;
        }
        assert(node.range != null);

        // Infix
        while (true) {
            let result = this.parseInfix(precedence, node, mode);
            if (result == null) {
                return null;
            }
            if (result == node) {
                break;
            }
            node = result;
            assert(node.range != null);
        }

        return node;
    }

    parseType(): Node {
        return this.parseExpression(Precedence.UNARY_POSTFIX, ParseKind.TYPE);
    }

    parseIf(): Node {
        let token = this.current;
        assert(token.kind == TokenKind.IF);
        this.advance();

        if (!this.expect(TokenKind.LEFT_PARENTHESIS)) {
            return null;
        }

        let value: Node;

        // Recover from a missing value
        if (this.peek(TokenKind.RIGHT_PARENTHESIS)) {
            this.unexpectedToken();
            this.advance();
            value = createParseError();
        }

        else {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null || !this.expect(TokenKind.RIGHT_PARENTHESIS)) {
                return null;
            }
        }

        let trueBranch = this.parseBody();
        if (trueBranch == null) {
            return null;
        }

        let falseBranch: Node = null;
        if (this.eat(TokenKind.ELSE)) {
            falseBranch = this.parseBody();
            if (falseBranch == null) {
                return null;
            }
        }

        return createIf(value, trueBranch, falseBranch).withRange(spanRanges(
            token.range, (falseBranch != null ? falseBranch : trueBranch).range));
    }

    parseWhile(): Node {
        let token = this.current;
        assert(token.kind == TokenKind.WHILE);
        this.advance();

        if (!this.expect(TokenKind.LEFT_PARENTHESIS)) {
            return null;
        }

        let value: Node;

        // Recover from a missing value
        if (this.peek(TokenKind.RIGHT_PARENTHESIS)) {
            this.unexpectedToken();
            this.advance();
            value = createParseError();
        }

        else {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null || !this.expect(TokenKind.RIGHT_PARENTHESIS)) {
                return null;
            }
        }

        let body = this.parseBody();
        if (body == null) {
            return null;
        }

        return createWhile(value, body).withRange(spanRanges(token.range, body.range));
    }

    parseFor(): Node {
        let token = this.current;
        assert(token.kind == TokenKind.FOR);
        this.advance();

        if (!this.expect(TokenKind.LEFT_PARENTHESIS)) {
            return null;
        }

        assert(token.kind == TokenKind.CONST || token.kind == TokenKind.LET || token.kind == TokenKind.VAR);
        this.advance();

        let node = token.kind == TokenKind.CONST ? createConstants() : createVariables();
        node.firstFlag = firstFlag;

        let value: Node;

        // Recover from a missing value
        if (this.peek(TokenKind.RIGHT_PARENTHESIS)) {
            this.unexpectedToken();
            this.advance();
            value = createParseError();
        }

        else {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null || !this.expect(TokenKind.RIGHT_PARENTHESIS)) {
                return null;
            }
        }

        let body = this.parseBody();
        if (body == null) {
            return null;
        }

        return createFor(value, body).withRange(spanRanges(token.range, body.range));
    }

    parseBody(): Node {
        let node = this.parseStatement(StatementMode.NORMAL);
        if (node == null) {
            return null;
        }

        if (node.kind == NodeKind.BLOCK) {
            return node;
        }

        let block = createBlock();
        block.appendChild(node);
        return block.withRange(node.range);
    }

    parseBlock(): Node {
        let open = this.current;
        if (!this.expect(TokenKind.LEFT_BRACE)) {
            return null;
        }

        let block = createBlock();
        if (!this.parseStatements(block)) {
            return null;
        }

        let close = this.current;
        if (!this.expect(TokenKind.RIGHT_BRACE)) {
            return null;
        }

        return block.withRange(spanRanges(open.range, close.range));
    }

    // parseObject():Node {
    //
    // }

    parseReturn(): Node {
        let token = this.current;
        assert(token.kind == TokenKind.RETURN);
        this.advance();

        let value: Node = null;
        if (!this.peek(TokenKind.SEMICOLON)) {
            value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
            if (value == null) {
                return null;
            }
        }

        let semicolon = this.current;
        this.expect(TokenKind.SEMICOLON);
        return createReturn(value).withRange(spanRanges(token.range, semicolon.range));
    }

    parseEmpty(): Node {
        let token = this.current;
        this.advance();
        return createEmpty().withRange(token.range);
    }

    parseEnum(firstFlag: NodeFlag): Node {
        let token = this.current;
        assert(token.kind == TokenKind.ENUM);
        this.advance();

        let name = this.current;
        if (!this.expect(TokenKind.IDENTIFIER) || !this.expect(TokenKind.LEFT_BRACE)) {
            return null;
        }

        let text = name.range.toString();
        let node = createEnum(text);
        node.firstFlag = firstFlag;
        node.flags = allFlags(firstFlag);

        while (!this.peek(TokenKind.END_OF_FILE) && !this.peek(TokenKind.RIGHT_BRACE)) {
            let member = this.current.range;
            let value: Node = null;

            if (!this.expect(TokenKind.IDENTIFIER)) {
                return null;
            }

            if (this.eat(TokenKind.ASSIGN)) {
                value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (value == null) {
                    return null;
                }
            }

            let variable = createVariable(member.toString(), createName(text), value);
            node.appendChild(variable.withRange(value != null ? spanRanges(member, value.range) : member).withInternalRange(member));

            // Recover from a terminating semicolon
            if (this.peek(TokenKind.SEMICOLON)) {
                this.expect(TokenKind.COMMA);
                this.advance();
            }

            // Recover from a missing comma
            else if (this.peek(TokenKind.IDENTIFIER)) {
                this.expect(TokenKind.COMMA);
            }

            else if (!this.eat(TokenKind.COMMA)) {
                break;
            }
        }

        let close = this.current;
        if (!this.expect(TokenKind.RIGHT_BRACE)) {
            return null;
        }

        return node.withRange(spanRanges(token.range, close.range)).withInternalRange(name.range);
    }

    parseParameters(): Node {
        let node = createParameters();
        let open = this.current;
        let close: Token;

        assert(open.kind == TokenKind.LESS_THAN);
        this.advance();

        while (true) {
            let name = this.current;
            if (!this.expect(TokenKind.IDENTIFIER)) {
                close = this.current;
                if (this.eat(TokenKind.GREATER_THAN)) {
                    break;
                }
                return null;
            }
            node.appendChild(createParameter(name.range.toString()).withRange(name.range));

            if (!this.eat(TokenKind.COMMA)) {
                close = this.current;
                if (!this.expect(TokenKind.GREATER_THAN)) {
                    return null;
                }
                break;
            }
        }

        return node.withRange(spanRanges(open.range, close.range));
    }

    parseImports(): Node {
        let token = this.current;
        assert(token.kind == TokenKind.IMPORT);
        this.advance();

        let node = createImports();
        node.flags = node.flags | TokenKind.IMPORT;

        if (this.peek(TokenKind.MULTIPLY)) { //check for wildcard '*' import

            this.log.error(this.current.range, "wildcard '*' import not supported");

            assert(this.eat(TokenKind.MULTIPLY));
            assert(this.eat(TokenKind.AS));

            let importName = this.current;
            let range = importName.range;
            let _import = createImport(importName.range.toString());
            node.appendChild(_import.withRange(range).withInternalRange(importName.range));
            this.advance();
        }
        else {

            if (!this.expect(TokenKind.LEFT_BRACE)) {
                return null;
            }
            while (!this.peek(TokenKind.END_OF_FILE) && !this.peek(TokenKind.RIGHT_BRACE)) {

                let importName = this.current;
                let range = importName.range;
                let _import = createImport(importName.range.toString());
                node.appendChild(_import.withRange(range).withInternalRange(importName.range));
                this.advance();

                if (!this.eat(TokenKind.COMMA)) {
                    break;
                }
            }

            // this.advance();
            // assert(this.expect(TokenKind.RIGHT_BRACE));
            this.expect(TokenKind.RIGHT_BRACE);
        }

        this.expect(TokenKind.FROM);
        let importFrom = this.current;
        let _from = createImportFrom(importFrom.range.toString());
        node.appendChild(_from.withRange(importFrom.range).withInternalRange(importFrom.range));
        this.advance();
        let semicolon = this.current;
        this.expect(TokenKind.SEMICOLON);
        return node.withRange(spanRanges(token.range, semicolon.range));
    }

    parseModule(firstFlag: NodeFlag): Node {
        let token = this.current;
        assert(token.kind == TokenKind.MODULE);
        this.advance();

        let name = this.current;
        if (!this.expect(TokenKind.IDENTIFIER)) {
            return null;
        }

        let node = createModule(name.range.toString());
        node.firstFlag = firstFlag;
        node.flags = allFlags(firstFlag);

        // Type parameters
        if (this.peek(TokenKind.LESS_THAN)) {
            let parameters = this.parseParameters();
            if (parameters == null) {
                return null;
            }
            node.appendChild(parameters);
        }

        if (!this.expect(TokenKind.LEFT_BRACE)) {
            return null;
        }

        while (!this.peek(TokenKind.END_OF_FILE) && !this.peek(TokenKind.RIGHT_BRACE)) {
            let childFlags = this.parseFlags();
            let childName = this.current;
            let oldKind = childName.kind;

            // Support contextual keywords
            if (isKeyword(childName.kind)) {
                childName.kind = TokenKind.IDENTIFIER;
                this.advance();
            }

            // The identifier must come first without any keyword
            if (!this.expect(TokenKind.IDENTIFIER)) {
                return null;
            }

            let text = childName.range.toString();

            // Support operator definitions
            if (text == "operator" && !this.peek(TokenKind.LEFT_PARENTHESIS) && !this.peek(TokenKind.IDENTIFIER)) {
                childName.kind = TokenKind.OPERATOR;
                this.current = childName;
                if (this.parseFunction(childFlags, node) == null) {
                    return null;
                }
                continue;
            }

            // Is there another identifier after the first one?
            else if (this.peek(TokenKind.IDENTIFIER)) {
                let isGet = text == "get";
                let isSet = text == "set";

                // The "get" and "set" flags are contextual
                if (isGet || isSet) {
                    childFlags = appendFlag(childFlags, isGet ? NODE_FLAG_GET : NODE_FLAG_SET, childName.range);

                    // Get the real identifier
                    childName = this.current;
                    this.advance();
                }

                // Recover from an extra "function" token
                else if (oldKind == TokenKind.FUNCTION) {
                    this.log.error(childName.range, "Instance functions don't need the 'function' keyword");

                    // Get the real identifier
                    childName = this.current;
                    this.advance();
                }

                // Recover from an extra variable tokens
                else if (oldKind == TokenKind.CONST || oldKind == TokenKind.LET || oldKind == TokenKind.VAR) {
                    this.log.error(childName.range,
                        `Instance variables don't need the '${childName.range.toString()}' keyword`);

                    // Get the real identifier
                    childName = this.current;
                    this.advance();
                }
            }

            // Function
            if (this.peek(TokenKind.LEFT_PARENTHESIS) || this.peek(TokenKind.LESS_THAN)) {
                this.current = childName;
                if (this.parseFunction(childFlags, node) == null) {
                    return null;
                }
            }

            // Variable
            else {
                this.current = childName;
                if (this.parseVariables(childFlags, node) == null) {
                    return null;
                }
            }
        }

        let close = this.current;
        if (!this.expect(TokenKind.RIGHT_BRACE)) {
            return null;
        }

        return node.withRange(spanRanges(token.range, close.range)).withInternalRange(name.range);
    }

    parseClass(firstFlag: NodeFlag): Node {
        let token = this.current;
        assert(token.kind == TokenKind.CLASS);
        this.advance();

        let name = this.current;
        if (!this.expect(TokenKind.IDENTIFIER)) {
            return null;
        }

        let node = createClass(name.range.toString());
        node.firstFlag = firstFlag;
        node.flags = allFlags(firstFlag);

        // Type parameters
        if (this.peek(TokenKind.LESS_THAN)) {
            let parameters = this.parseParameters();
            if (parameters == null) {
                return null;
            }
            node.appendChild(parameters);
        }

        // "extends" clause
        let extendsToken = this.current;
        if (this.eat(TokenKind.EXTENDS)) {
            let type: Node;

            // Recover from a missing type
            if (this.peek(TokenKind.LEFT_BRACE) || this.peek(TokenKind.IMPLEMENTS)) {
                this.unexpectedToken();
                type = createParseError();
            }

            else {
                type = this.parseType();
                if (type == null) {
                    return null;
                }
            }

            node.appendChild(createExtends(type).withRange(type.range != null ? spanRanges(extendsToken.range, type.range) : extendsToken.range));
        }

        // "implements" clause
        let implementsToken = this.current;
        if (this.eat(TokenKind.IMPLEMENTS)) {
            let list = createImplements();
            let type: Node = null;
            while (true) {
                // Recover from a missing type
                if (this.peek(TokenKind.LEFT_BRACE)) {
                    this.unexpectedToken();
                    break;
                }

                type = this.parseType();
                if (type == null) {
                    return null;
                }
                list.appendChild(type);
                if (!this.eat(TokenKind.COMMA)) {
                    break;
                }
            }
            node.appendChild(list.withRange(type != null ? spanRanges(implementsToken.range, type.range) : implementsToken.range));
        }

        if (!this.expect(TokenKind.LEFT_BRACE)) {
            return null;
        }

        while (!this.peek(TokenKind.END_OF_FILE) && !this.peek(TokenKind.RIGHT_BRACE)) {
            let childFlags = this.parseFlags();
            let childName = this.current;
            let oldKind = childName.kind;

            // Support contextual keywords
            if (isKeyword(childName.kind)) {
                childName.kind = TokenKind.IDENTIFIER;
                this.advance();
            }

            // The identifier must come first without any keyword
            if (!this.expect(TokenKind.IDENTIFIER)) {
                return null;
            }

            let text = childName.range.toString();

            // Support operator definitions
            if (text == "operator" && !this.peek(TokenKind.LEFT_PARENTHESIS) && !this.peek(TokenKind.IDENTIFIER)) {
                childName.kind = TokenKind.OPERATOR;
                this.current = childName;
                if (this.parseFunction(childFlags, node) == null) {
                    return null;
                }
                continue;
            }

            // Is there another identifier after the first one?
            else if (this.peek(TokenKind.IDENTIFIER)) {
                let isGet = text == "get";
                let isSet = text == "set";

                // The "get" and "set" flags are contextual
                if (isGet || isSet) {
                    childFlags = appendFlag(childFlags, isGet ? NODE_FLAG_GET : NODE_FLAG_SET, childName.range);

                    // Get the real identifier
                    childName = this.current;
                    this.advance();
                }

                // Recover from an extra "function" token
                else if (oldKind == TokenKind.FUNCTION) {
                    this.log.error(childName.range, "Instance functions don't need the 'function' keyword");

                    // Get the real identifier
                    childName = this.current;
                    this.advance();
                }

                // Recover from an extra variable tokens
                else if (oldKind == TokenKind.CONST || oldKind == TokenKind.LET || oldKind == TokenKind.VAR) {
                    this.log.error(childName.range,
                        `Instance variables don't need the '${childName.range.toString()}' keyword`);

                    // Get the real identifier
                    childName = this.current;
                    this.advance();
                }
            }

            // Function
            if (this.peek(TokenKind.LEFT_PARENTHESIS) || this.peek(TokenKind.LESS_THAN)) {
                this.current = childName;
                if (this.parseFunction(childFlags, node) == null) {
                    return null;
                }
            }

            // Variable
            else {
                this.current = childName;
                if (this.parseVariables(childFlags, node) == null) {
                    return null;
                }
            }
        }

        let close = this.current;
        if (!this.expect(TokenKind.RIGHT_BRACE)) {
            return null;
        }

        return node.withRange(spanRanges(token.range, close.range)).withInternalRange(name.range);
    }

    parseFunction(firstFlag: NodeFlag, parent: Node): Node {
        let isOperator = false;
        let token = this.current;
        let nameRange: SourceRange;
        let name: string;

        // Support custom operators
        if (parent != null && this.eat(TokenKind.OPERATOR)) {
            let end = this.current;

            if (this.eat(TokenKind.LEFT_BRACKET)) {
                if (!this.expect(TokenKind.RIGHT_BRACKET)) {
                    return null;
                }

                if (this.peek(TokenKind.ASSIGN)) {
                    nameRange = spanRanges(token.range, this.current.range);
                    name = "[]=";
                    this.advance();
                }

                else {
                    nameRange = spanRanges(token.range, end.range);
                    name = "[]";
                }

                isOperator = true;
            }

            else if (
                this.eat(TokenKind.BITWISE_AND) ||
                this.eat(TokenKind.BITWISE_OR) ||
                this.eat(TokenKind.BITWISE_XOR) ||
                this.eat(TokenKind.COMPLEMENT) ||
                this.eat(TokenKind.DIVIDE) ||
                this.eat(TokenKind.EQUAL) ||
                this.eat(TokenKind.EXPONENT) ||
                this.eat(TokenKind.LESS_THAN) ||
                this.eat(TokenKind.GREATER_THAN) ||
                this.eat(TokenKind.MINUS) ||
                this.eat(TokenKind.MINUS_MINUS) ||
                this.eat(TokenKind.MULTIPLY) ||
                this.eat(TokenKind.PLUS) ||
                this.eat(TokenKind.PLUS_PLUS) ||
                this.eat(TokenKind.REMAINDER) ||
                this.eat(TokenKind.SHIFT_LEFT) ||
                this.eat(TokenKind.SHIFT_RIGHT)) {
                nameRange = end.range;
                name = nameRange.toString();
                isOperator = true;
            }

            else if (
                this.eat(TokenKind.ASSIGN) ||
                this.eat(TokenKind.GREATER_THAN_EQUAL) ||
                this.eat(TokenKind.LESS_THAN_EQUAL) ||
                this.eat(TokenKind.LOGICAL_AND) ||
                this.eat(TokenKind.LOGICAL_OR) ||
                this.eat(TokenKind.NOT) ||
                this.eat(TokenKind.NOT_EQUAL)) {
                nameRange = end.range;
                name = nameRange.toString();

                // Recover from an invalid operator name
                this.log.error(nameRange,
                    `The operator '${name}' cannot be implemented ${
                        end.kind == TokenKind.NOT_EQUAL ? "(it is automatically derived from '==')" :
                            end.kind == TokenKind.LESS_THAN_EQUAL ? "(it is automatically derived from '>')" :
                                end.kind == TokenKind.GREATER_THAN_EQUAL ? "(it is automatically derived from '<')" :
                                    ""
                        }`);
            }

            else {
                this.unexpectedToken();
            }
        }

        else {
            // Functions inside class declarations don't use "function"
            if (parent == null) {
                assert(token.kind == TokenKind.FUNCTION);
                this.advance();
            }

            // Remember where the name is for the symbol later
            nameRange = this.current.range;
            if (!this.expect(TokenKind.IDENTIFIER)) {
                return null;
            }
            name = nameRange.toString();
        }

        let node = createFunction(name);
        node.firstFlag = firstFlag;
        node.flags = allFlags(firstFlag);
        if (isOperator) {
            node.flags = node.flags | NODE_FLAG_OPERATOR;
        }

        // Type parameters
        if (this.peek(TokenKind.LESS_THAN)) {
            let parameters = this.parseParameters();
            if (parameters == null) {
                return null;
            }
            node.appendChild(parameters);
        }

        if (!this.expect(TokenKind.LEFT_PARENTHESIS)) {
            return null;
        }

        if (!this.peek(TokenKind.RIGHT_PARENTHESIS)) {
            while (true) {
                let firstArgumentFlag = this.parseFlags();

                let argument = this.current;
                ;
                if (!this.expect(TokenKind.IDENTIFIER)) {
                    return null;
                }

                let type: Node;
                let value: Node = null;
                let range = argument.range;

                if (this.expect(TokenKind.COLON)) {
                    type = this.parseType();

                    if (this.peek(TokenKind.LESS_THAN)) {
                        let parameters = this.parseParameters();
                        if (parameters == null) {
                            return null;
                        }
                        type.appendChild(parameters);
                    }

                    if (type != null) {
                        range = spanRanges(range, type.range);
                    }

                    // Recover from a missing type
                    else if (this.peek(TokenKind.COMMA) || this.peek(TokenKind.RIGHT_PARENTHESIS)) {
                        type = createParseError();
                    }

                    else {
                        return null;
                    }
                }

                // Recover from a missing colon
                else if (this.peek(TokenKind.COMMA) || this.peek(TokenKind.RIGHT_PARENTHESIS)) {
                    type = createParseError();
                }

                let firstType = type;

                //Type alias
                while (this.eat(TokenKind.BITWISE_OR)) {
                    let aliasType = this.parseType();

                    if (this.peek(TokenKind.LESS_THAN)) {
                        let parameters = this.parseParameters();
                        if (parameters == null) {
                            return null;
                        }
                        aliasType.appendChild(parameters);
                    }

                    if (aliasType != null) {
                        range = spanRanges(range, aliasType.range);
                    }

                    // Recover from a missing type
                    else if (this.peek(TokenKind.COMMA) || this.peek(TokenKind.RIGHT_PARENTHESIS)) {
                        aliasType = createParseError();
                    }

                    else {
                        return null;
                    }

                    type.appendChild(aliasType);
                    type = aliasType;

                }

                if (this.eat(TokenKind.ASSIGN)) {
                    value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                }

                let variable = createVariable(argument.range.toString(), firstType, value);
                variable.firstFlag = firstArgumentFlag;
                variable.flags = allFlags(firstArgumentFlag);
                node.appendChild(variable.withRange(range).withInternalRange(argument.range));

                if (!this.eat(TokenKind.COMMA)) {
                    break;
                }
            }
        }

        if (!this.expect(TokenKind.RIGHT_PARENTHESIS)) {
            return null;
        }

        let returnType: Node;
        if (node.isAnyfunc()) {
            returnType = createAny();
        }
        else {

            if (node.stringValue == "constructor") {
                returnType = new Node();
                returnType.kind = NodeKind.NAME;
                returnType.stringValue = parent.stringValue;
            } else if (this.expect(TokenKind.COLON)) {
                returnType = this.parseType();

                if (this.peek(TokenKind.LESS_THAN)) {
                    let parameters = this.parseParameters();
                    if (parameters == null) {
                        return null;
                    }
                    returnType.appendChild(parameters);
                }

                if (returnType == null) {
                    // Recover from a missing return type
                    if (this.peek(TokenKind.SEMICOLON) || this.peek(TokenKind.LEFT_BRACE)) {
                        returnType = createParseError();
                    }

                    else {
                        return null;
                    }
                }

                let firstType = returnType;

                //Type alias
                while (this.eat(TokenKind.BITWISE_OR)) {
                    let aliasType = this.parseType();

                    if (this.peek(TokenKind.LESS_THAN)) {
                        let parameters = this.parseParameters();
                        if (parameters == null) {
                            return null;
                        }
                        aliasType.appendChild(parameters);
                    }

                    if (aliasType == null) {
                        // Recover from a missing return type
                        if (this.peek(TokenKind.SEMICOLON) || this.peek(TokenKind.LEFT_BRACE)) {
                            aliasType = createParseError();
                        }

                        else {
                            return null;
                        }
                    }

                    firstType.appendChild(aliasType);
                    firstType = aliasType;

                }

            }

            // Recover from a missing colon
            else if (this.peek(TokenKind.SEMICOLON) || this.peek(TokenKind.LEFT_BRACE)) {
                returnType = createParseError();
            }

            else {
                return null;
            }
        }

        node.appendChild(returnType);

        let block: Node = null;

        // Is this an import?
        let semicolon = this.current;
        if (this.eat(TokenKind.SEMICOLON)) {
            block = createEmpty().withRange(semicolon.range);
        }

        // Normal functions
        else {
            block = this.parseBlock();
            if (block == null) {
                return null;
            }
        }

        // Add this to the enclosing class
        if (parent != null) {
            parent.appendChild(node);
        }

        node.appendChild(block);
        return node.withRange(spanRanges(token.range, block.range)).withInternalRange(nameRange);
    }

    parseVariables(firstFlag: NodeFlag, parent: Node): Node {
        let token = this.current;

        // Variables inside class declarations don't use "var"
        if (parent == null) {
            assert(token.kind == TokenKind.CONST || token.kind == TokenKind.LET || token.kind == TokenKind.VAR);
            this.advance();
        }

        let node = token.kind == TokenKind.CONST ? createConstants() : createVariables();
        node.firstFlag = firstFlag;

        while (true) {
            let name = this.current;
            if (!this.expect(TokenKind.IDENTIFIER)) {
                return null;
            }

            let type: Node = null;
            if (this.eat(TokenKind.COLON)) {
                type = this.parseType();

                if (this.peek(TokenKind.LESS_THAN)) {
                    let parameters = this.parseParameters();
                    if (parameters == null) {
                        return null;
                    }
                    type.appendChild(parameters);
                }

                if (type == null) {
                    return null;
                }
            }

            let value: Node = null;
            if (this.eat(TokenKind.ASSIGN)) {
                value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);
                if (value == null) {
                    return null;
                }

                // TODO: Implement constructors
                if (parent != null) {
                    //this.log.error(value.range, "Inline initialization of instance variables is not supported yet");
                }
            }

            let range =
                value != null ? spanRanges(name.range, value.range) :
                    type != null ? spanRanges(name.range, type.range) :
                        name.range;

            let variable = createVariable(name.range.toString(), type, value);
            variable.firstFlag = firstFlag;
            variable.flags = allFlags(firstFlag);
            (parent != null ? parent : node).appendChild(variable.withRange(range).withInternalRange(name.range));

            if (!this.eat(TokenKind.COMMA)) {
                break;
            }
        }

        let semicolon = this.current;
        this.expect(TokenKind.SEMICOLON);
        return node.withRange(spanRanges(token.range, semicolon.range));
    }

    parseLoopJump(kind: NodeKind): Node {
        let token = this.current;
        this.advance();
        this.expect(TokenKind.SEMICOLON);
        let node = new Node();
        node.kind = kind;
        return node.withRange(token.range);
    }

    parseFlags(): NodeFlag {
        let firstFlag: NodeFlag = null;
        let lastFlag: NodeFlag = null;

        while (true) {
            let token = this.current;
            let flag: int32;

            if (this.eat(TokenKind.DECLARE)) flag = NODE_FLAG_DECLARE;
            else if (this.eat(TokenKind.EXPORT)) flag = NODE_FLAG_EXPORT;
            else if (this.eat(TokenKind.PRIVATE)) flag = NODE_FLAG_PRIVATE;
            else if (this.eat(TokenKind.PROTECTED)) flag = NODE_FLAG_PROTECTED;
            else if (this.eat(TokenKind.PUBLIC)) flag = NODE_FLAG_PUBLIC;
            else if (this.eat(TokenKind.STATIC)) flag = NODE_FLAG_STATIC;
            else if (this.eat(TokenKind.ANYFUNC)) flag = NODE_FLAG_ANYFUNC;
            else if (this.eat(TokenKind.UNSAFE)) flag = NODE_FLAG_UNSAFE;
            else if (this.eat(TokenKind.JAVASCRIPT)) flag = NODE_FLAG_JAVASCRIPT;
            else if (this.eat(TokenKind.START)) flag = NODE_FLAG_START;
            else if (this.eat(TokenKind.VIRTUAL)) flag = NODE_FLAG_VIRTUAL;
            else return firstFlag;

            let link = new NodeFlag();
            link.flag = flag;
            link.range = token.range;

            if (firstFlag == null) firstFlag = link;
            else lastFlag.next = link;
            lastFlag = link;
        }
    }

    parseUnsafe(): Node {
        let token = this.current;
        this.advance();

        let node = this.parseBlock();
        if (node == null) {
            return null;
        }

        node.flags = node.flags | NODE_FLAG_UNSAFE;
        return node.withRange(spanRanges(token.range, node.range));
    }

    parseJavaScript(): Node {
        let token = this.current;
        this.advance();

        let node = this.parseBlock();
        if (node == null) {
            return null;
        }

        node.flags = node.flags | NODE_FLAG_JAVASCRIPT;
        return node.withRange(spanRanges(token.range, node.range));
    }

    parseStart(): Node {
        let token = this.current;
        this.advance();

        let node = this.parseBlock();
        if (node == null) {
            return null;
        }

        node.flags = node.flags | NODE_FLAG_START;
        return node.withRange(spanRanges(token.range, node.range));
    }

    parseVirtual(firstFlag): Node {
        let token = this.current;
        this.advance();

        let node = this.parseFunction(firstFlag, null);
        if (node == null) {
            return null;
        }

        node.flags = node.flags | NODE_FLAG_VIRTUAL;
        return node.withRange(spanRanges(token.range, node.range));
    }

    parseStatement(mode: StatementMode): Node {
        let firstFlag = mode == StatementMode.FILE ? this.parseFlags() : null;

        // if (this.peek(TokenKind.UNSAFE) && firstFlag == null) return this.parseUnsafe(); //disabled for now
        if (this.peek(TokenKind.IMPORT) && firstFlag == null) return this.parseImports(); // This should handle before parsing
        if (this.peek(TokenKind.JAVASCRIPT) && firstFlag == null) return this.parseJavaScript();
        if (this.peek(TokenKind.START) && firstFlag == null) return this.parseStart();
        if (this.peek(TokenKind.CONST) || this.peek(TokenKind.LET) || this.peek(TokenKind.VAR)) return this.parseVariables(firstFlag, null);
        if (this.peek(TokenKind.FUNCTION)) return this.parseFunction(firstFlag, null);
        if (this.peek(TokenKind.VIRTUAL)) return this.parseVirtual(firstFlag);
        if (this.peek(TokenKind.MODULE)) return this.parseModule(firstFlag);
        if (this.peek(TokenKind.CLASS)) return this.parseClass(firstFlag);
        if (this.peek(TokenKind.ENUM)) return this.parseEnum(firstFlag);

        // Definition modifiers need to be attached to a definition
        if (firstFlag != null) {
            this.unexpectedToken();
            return null;
        }

        if (this.peek(TokenKind.LEFT_BRACE)) return this.parseBlock();
        if (this.peek(TokenKind.BREAK)) return this.parseLoopJump(NodeKind.BREAK);
        if (this.peek(TokenKind.CONTINUE)) return this.parseLoopJump(NodeKind.CONTINUE);
        if (this.peek(TokenKind.IF)) return this.parseIf();
        if (this.peek(TokenKind.WHILE)) return this.parseWhile();
        if (this.peek(TokenKind.FOR)) return this.parseFor();
        if (this.peek(TokenKind.DELETE)) return this.parseDelete();
        if (this.peek(TokenKind.RETURN)) return this.parseReturn();
        if (this.peek(TokenKind.SEMICOLON)) return this.parseEmpty();

        // Parse an expression statement
        let value = this.parseExpression(Precedence.LOWEST, ParseKind.EXPRESSION);

        if (value == null) {
            return null;
        }

        let semicolon = this.current;
        this.expect(TokenKind.SEMICOLON);
        return createExpression(value).withRange(spanRanges(value.range, semicolon.range));
    }

    parseStatements(parent: Node): boolean {
        while (!this.peek(TokenKind.END_OF_FILE) && !this.peek(TokenKind.RIGHT_BRACE)) {
            let child = this.parseStatement(parent.kind == NodeKind.FILE ? StatementMode.FILE : StatementMode.NORMAL);
            if (child == null) {
                return false;
            }
            if (child.kind === NodeKind.RETURN) {
                parent.returnNode = child;
            }
            parent.appendChild(child);
        }
        return true;
    }

    parseInt(range: SourceRange, node: Node): boolean {
        let source = range.source;
        let contents = source.contents;
        node.intValue = parseInt(contents.substring(range.start, range.end));
        node.flags = NODE_FLAG_POSITIVE;
        return true;
    }

    parseFloat(range: SourceRange, node: Node): boolean {
        let source = range.source;
        let contents = source.contents;
        node.floatValue = parseFloat(contents.substring(range.start, range.end));
        node.flags = NODE_FLAG_POSITIVE;
        return true;
    }

    parseDouble(range: SourceRange, node: Node): boolean {
        let source = range.source;
        let contents = source.contents;
        node.doubleValue = parseFloat(contents.substring(range.start, range.end));
        node.flags = NODE_FLAG_POSITIVE;
        return true;
    }
}

export function parse(firstToken: Token, log: Log): Node {
    let context = new ParserContext();
    context.current = firstToken;
    context.log = log;

    let file = new Node();
    file.kind = NodeKind.FILE;
    if (!context.parseStatements(file)) {
        return null;
    }
    return file;
}
