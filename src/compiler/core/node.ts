import {Type} from "./type";
import {isType, Symbol, SYMBOL_FLAG_IS_TEMPLATE, SymbolKind} from "./symbol";
import {SourceRange} from "../../utils/log";
import {Scope} from "./scope";
import {CheckContext} from "../analyzer/type-checker";
import {assert} from "../../utils/assert";

/**
 * Author: Nidin Vinayakan
 */

export enum NodeKind {
    // Other
    EXTENDS,
    FILE,
    GLOBAL,
    IMPLEMENTS,
    PARAMETER,
    PARAMETERS,
    VARIABLE,
    IMPORT,
    IMPORT_FROM,
        // Statements
    BLOCK,
    BREAK,
    MODULE,
    IMPORTS,
    CLASS,
    CONSTANTS,
    CONTINUE,
    EMPTY,
    ENUM,
    EXPRESSION,
    FUNCTION,
    IF,
    RETURN,
    UNSAFE,
    JAVASCRIPT,
    START,
    VARIABLES,
    WHILE,

        // Expressions
    ALIGN_OF,
    BOOLEAN,
    CALL,
    CAST,
    DOT,
    HOOK,
    INDEX,
    POINTER_INDEX,
    ANY,
    INT32,
    INT64,
    FLOAT32,
    FLOAT64,
    ARRAY,
    GENERIC,
    NAME,
    NEW,
    DELETE,
    NULL,
    UNDEFINED,
    PARSE_ERROR,
    SIZE_OF,
    STRING,
    THIS,
    TYPE,

        // Unary expressions
    ADDRESS_OF,
    COMPLEMENT,
    DEREFERENCE,
    NEGATIVE,
    NOT,
    POINTER_TYPE,
    POSITIVE,
    POSTFIX_DECREMENT,
    POSTFIX_INCREMENT,
    PREFIX_DECREMENT,
    PREFIX_INCREMENT,

        // Binary expressions
    ADD,
    ASSIGN,
    BITWISE_AND,
    BITWISE_OR,
    BITWISE_XOR,
    DIVIDE,
    EQUAL,
    EXPONENT,
    GREATER_THAN,
    GREATER_THAN_EQUAL,
    LESS_THAN,
    LESS_THAN_EQUAL,
    LOGICAL_AND,
    LOGICAL_OR,
    MULTIPLY,
    NOT_EQUAL,
    REMAINDER,
    SHIFT_LEFT,
    SHIFT_RIGHT,
    SUBTRACT,

        //JavaScript
    JS_NUMBER,
    JS_OBJECT,
    JS_STRING,
    JS_ARRAY
}

export function isUnary(kind: NodeKind): boolean {
    return kind >= NodeKind.ADDRESS_OF && kind <= NodeKind.PREFIX_INCREMENT;
}

export function isUnaryPostfix(kind: NodeKind): boolean {
    return kind >= NodeKind.POSTFIX_DECREMENT && kind <= NodeKind.POSTFIX_INCREMENT;
}

export function isBinary(kind: NodeKind): boolean {
    return kind >= NodeKind.ADD && kind <= NodeKind.SUBTRACT;
}

export function invertedBinaryKind(kind: NodeKind): NodeKind {
    if (kind == NodeKind.EQUAL) return NodeKind.NOT_EQUAL;
    if (kind == NodeKind.NOT_EQUAL) return NodeKind.EQUAL;
    if (kind == NodeKind.GREATER_THAN) return NodeKind.LESS_THAN_EQUAL;
    if (kind == NodeKind.GREATER_THAN_EQUAL) return NodeKind.LESS_THAN;
    if (kind == NodeKind.LESS_THAN) return NodeKind.GREATER_THAN_EQUAL;
    if (kind == NodeKind.LESS_THAN_EQUAL) return NodeKind.GREATER_THAN;
    return kind;
}

export function isExpression(node: Node): boolean {
    return node.kind >= NodeKind.ALIGN_OF && node.kind <= NodeKind.SUBTRACT;
}

export function isCompactNodeKind(kind: NodeKind): boolean {
    return kind == NodeKind.CONSTANTS || kind == NodeKind.EXPRESSION || kind == NodeKind.VARIABLES;
}

export const NODE_FLAG_DECLARE = 1 << 0;
export const NODE_FLAG_EXPORT = 1 << 1;
export const NODE_FLAG_IMPORT = 1 << 2;
export const NODE_FLAG_LIBRARY = 1 << 3;
export const NODE_FLAG_GET = 1 << 4;
export const NODE_FLAG_OPERATOR = 1 << 5;
export const NODE_FLAG_POSITIVE = 1 << 6;
export const NODE_FLAG_PRIVATE = 1 << 7;
export const NODE_FLAG_PROTECTED = 1 << 8;
export const NODE_FLAG_PUBLIC = 1 << 9;
export const NODE_FLAG_SET = 1 << 10;
export const NODE_FLAG_STATIC = 1 << 11;
export const NODE_FLAG_UNSAFE = 1 << 12;
export const NODE_FLAG_JAVASCRIPT = 1 << 13;
export const NODE_FLAG_UNSIGNED_OPERATOR = 1 << 14;
export const NODE_FLAG_VIRTUAL = 1 << 15;
export const NODE_FLAG_START = 1 << 16;
export const NODE_FLAG_ANYFUNC = 1 << 17;
export const NODE_FLAG_GENERIC = 1 << 18;

export class NodeFlag {
    flag: int32;
    range: SourceRange;
    next: NodeFlag;
}

export function appendFlag(first: NodeFlag, flag: int32, range: SourceRange): NodeFlag {
    let link = new NodeFlag();
    link.flag = flag;
    link.range = range;

    // Is the list empty?
    if (first == null) {
        return link;
    }

    // Append the flag to the end of the list
    let secondToLast = first;
    while (secondToLast.next != null) {
        secondToLast = secondToLast.next;
    }
    secondToLast.next = link;
    return first;
}

export function allFlags(link: NodeFlag): int32 {
    let all = 0;
    while (link != null) {
        all = all | link.flag;
        link = link.next;
    }
    return all;
}

export function rangeForFlag(link: NodeFlag, flag: int32): SourceRange {
    while (link != null) {
        if (link.flag == flag) {
            return link.range;
        }
        link = link.next;
    }
    return null;
}

export class Node {
    kind: NodeKind;
    flags: int32;
    firstFlag: NodeFlag;
    range: SourceRange;
    internalRange: SourceRange;
    parent: Node;
    firstChild: Node;
    lastChild: Node;
    previousSibling: Node;
    nextSibling: Node;
    resolvedType: Type;
    symbol: Symbol;
    scope: Scope;
    offset: int32;

    returnNode: Node;
    constructorFunctionNode: Node;
    derivedNodes: Node[];

    private _rawValue: any;
    private _hasValue: boolean;
    private _hasStringValue: boolean;

    get hasValue(): boolean {
        return this._hasValue;
    }

    get rawValue(): any {
        if (this._hasStringValue) {
            return `"${this._rawValue}"`;
        } else {
            return this._rawValue;
        }
    }

    get __internal_rawValue(): any {
        return this._rawValue;
    }

    set rawValue(newValue: any) {
        this._hasValue = true;
        this._rawValue = newValue;
    }

    get intValue(): int32 {
        let n = this._rawValue;
        if (Number(n) === n && n % 1 === 0) {
            return this._rawValue;
        }
        return null;
    }

    set intValue(newValue: int32) {
        this._hasValue = true;
        this._rawValue = newValue;
    }

    get longValue(): int64 {
        //TODO: Implement Int64
        return this._rawValue;
    }

    set longValue(newValue: int64) {
        //TODO: Implement Int64
        this._hasValue = true;
        this._rawValue = newValue;
    }

    get floatValue(): float32 {
        return this._rawValue;
    }

    set floatValue(newValue: float32) {
        this._hasValue = true;
        this._rawValue = newValue;
    }

    get doubleValue(): float64 {
        return this._rawValue;
    }

    set doubleValue(newValue: float64) {
        this._hasValue = true;
        this._rawValue = newValue;
    }

    get stringValue(): string {
        return this._rawValue;
    }

    set stringValue(newValue: string) {
        this._hasValue = true;
        this._hasStringValue = true;
        this._rawValue = newValue;
    }

    get referenceValue(): string {
        return this._rawValue;
    }

    set referenceValue(newValue: string) {
        this._hasValue = true;
        this._rawValue = newValue;
    }

    becomeTypeOf(node: Node, context: CheckContext): void {

        switch (node.resolvedType) {
            case context.int64Type:
                if (this.kind != NodeKind.NAME) {
                    this.kind = NodeKind.INT64;
                }
                this.resolvedType = context.int64Type;
                break;
            case context.float64Type:
                if (this.kind != NodeKind.NAME) {
                    this.kind = NodeKind.FLOAT64;
                }
                this.resolvedType = context.float64Type;
                break;
        }

        if (node.flags) {
            this.flags = node.flags;
        }
    }

    becomeValueTypeOf(symbol: Symbol, context: CheckContext): void {
        // let resolvedSymbol = symbol.resolvedType.pointerTo ? symbol.resolvedType.pointerTo.symbol : symbol.resolvedType.symbol;
        let resolvedSymbol = symbol.resolvedType.symbol;

        if (resolvedSymbol) {

            switch (symbol.resolvedType) {
                case context.int64Type:
                    this.resolvedType = context.int64Type;
                    if (this.kind == NodeKind.NULL) {
                        this.longValue = 0;
                    }
                    if (this.kind != NodeKind.NAME) {
                        this.kind = NodeKind.INT64;
                    }
                    break;
                case context.float64Type:
                    this.resolvedType = context.float64Type;
                    if (this.kind == NodeKind.NULL) {
                        this.doubleValue = 0.0;
                    }
                    if (this.kind != NodeKind.NAME) {
                        this.kind = NodeKind.FLOAT64;
                    }
                    break;
            }
        }
    }

    clone(): Node {
        let node: Node = new Node();
        node.kind = this.kind;
        if (this.offset !== undefined) node.offset = this.offset;
        if (this.flags !== undefined) node.flags = this.flags;
        if (this.firstFlag !== undefined) node.firstFlag = this.firstFlag;
        // if(this.constructorFunctionNode) node.constructorFunctionNode = this.constructorFunctionNode;
        if (this.range !== undefined) node.range = this.range;
        if (this.internalRange !== undefined) node.internalRange = this.internalRange;
        if (this.hasValue) node.rawValue = this.__internal_rawValue;
        return node;
    }

    becomeSymbolReference(symbol: Symbol): void {
        this.kind = NodeKind.NAME;
        this.symbol = symbol;
        this.referenceValue = symbol.name;
        this.resolvedType = symbol.resolvedType;
        this.removeChildren();
    }

    becomeIntegerConstant(value: int32): void {
        this.kind = NodeKind.INT32;
        this.symbol = null;
        this.intValue = value;
        this.removeChildren();
    }

    becomeLongConstant(value: int64): void {
        this.kind = NodeKind.INT64;
        this.symbol = null;
        this.longValue = value;
        this.removeChildren();
    }

    becomeFloatConstant(value: float32): void {
        this.kind = NodeKind.FLOAT32;
        this.symbol = null;
        this.floatValue = value;
        this.removeChildren();
    }

    becomeDoubleConstant(value: float64): void {
        this.kind = NodeKind.FLOAT64;
        this.symbol = null;
        this.doubleValue = value;
        this.removeChildren();
    }

    becomeBooleanConstant(value: boolean): void {
        this.kind = NodeKind.BOOLEAN;
        this.symbol = null;
        this.intValue = value ? 1 : 0;
        this.removeChildren();
    }

    isNegativeInteger(): boolean {
        return this.kind == NodeKind.INT32 && this.intValue < 0;
    }

    isNonNegativeInteger(): boolean {
        return this.kind == NodeKind.INT32 && this.intValue >= 0;
    }

    isDeclare(): boolean {
        return (this.flags & NODE_FLAG_DECLARE) != 0;
    }

    isLibrary(): boolean {
        return (this.flags & NODE_FLAG_LIBRARY) != 0;
    }

    isVirtual(): boolean {
        return (this.flags & NODE_FLAG_VIRTUAL) != 0;
    }

    isExport(): boolean {
        return (this.flags & NODE_FLAG_EXPORT) != 0;
    }

    isImport(): boolean {
        return (this.flags & NODE_FLAG_IMPORT) != 0;
    }

    isExternalImport(): boolean {
        return this.isDeclare() && !this.isLibrary();
    }

    isStart(): boolean {
        return (this.flags & NODE_FLAG_START) != 0;
    }

    isJavaScript(): boolean {
        return (this.flags & NODE_FLAG_JAVASCRIPT) != 0;
    }

    isStatic(): boolean {
        return (this.flags & NODE_FLAG_STATIC) != 0;
    }

    isAnyfunc(): boolean {
        return (this.flags & NODE_FLAG_ANYFUNC) != 0;
    }

    isDeclareOrJavaScript(): boolean {
        return (this.flags & (NODE_FLAG_DECLARE | NODE_FLAG_JAVASCRIPT)) != 0;
    }

    isDeclareOrExport(): boolean {
        return (this.flags & (NODE_FLAG_DECLARE | NODE_FLAG_EXPORT)) != 0;
    }

    isGet(): boolean {
        return (this.flags & NODE_FLAG_GET) != 0;
    }

    isSet(): boolean {
        return (this.flags & NODE_FLAG_SET) != 0;
    }

    isOperator(): boolean {
        return (this.flags & NODE_FLAG_OPERATOR) != 0;
    }

    isPositive(): boolean {
        return (this.flags & NODE_FLAG_POSITIVE) != 0;
    }

    isPrivate(): boolean {
        return (this.flags & NODE_FLAG_PRIVATE) != 0;
    }

    isUnsafe(): boolean {
        return (this.flags & NODE_FLAG_UNSAFE) != 0;
    }

    isGeneric(): boolean {
        return (this.flags & NODE_FLAG_GENERIC) != 0;
    }

    isTemplate(): boolean {
        return this.symbol && (this.symbol.flags & SYMBOL_FLAG_IS_TEMPLATE) != 0;
    }

    isUnsignedOperator(): boolean {
        return (this.flags & NODE_FLAG_UNSIGNED_OPERATOR) != 0;
    }

    childCount(): int32 {
        let count = 0;
        let child = this.firstChild;
        while (child != null) {
            count = count + 1;
            child = child.nextSibling;
        }
        return count;
    }

    parameterCount(): int32 {
        let count = 0;
        let child = this.firstChild;
        if (child.kind == NodeKind.PARAMETERS) {
            child = child.firstChild;
            while (child != null) {
                count = count + 1;
                child = child.nextSibling;
            }
        }
        return count;
    }

    hasParameters(): boolean {
        if (this.firstChild) {
            let child = this.firstChild;
            if (child.kind == NodeKind.PARAMETERS) {
                return child.childCount() > 0;
            }
        }
        return false;
    }

    appendChild(child: Node): void {
        child.parent = this;

        if (this.firstChild == null) {
            this.firstChild = child;
            this.firstChild.offset = 0;
        }

        else {
            child.previousSibling = this.lastChild;
            this.lastChild.nextSibling = child;
            child.offset = this.lastChild.offset + 1;
        }

        this.lastChild = child;
    }

    insertChildBefore(after: Node, before: Node): void {
        if (before == null) {
            return;
        }

        assert(before != after);
        assert(before.parent == null);
        assert(before.previousSibling == null);
        assert(before.nextSibling == null);
        assert(after == null || after.parent == this);

        if (after == null) {
            this.appendChild(before);
            return;
        }

        before.parent = this;
        before.previousSibling = after.previousSibling;
        before.nextSibling = after;

        if (after.previousSibling != null) {
            assert(after == after.previousSibling.nextSibling);
            after.previousSibling.nextSibling = before;
        } else {
            assert(after == this.firstChild);
            this.firstChild = before;
        }

        after.previousSibling = before;
    }

    insertChildAfter(before: Node, after: Node): void {
        if (after == null) {
            return;
        }

        assert(before != after);
        assert(after.parent == null);
        assert(after.previousSibling == null);
        assert(after.nextSibling == null);
        assert(before == null || before.parent == this);

        if (before == null) {
            this.appendChild(after);
            return;
        }

        after.parent = this;
        after.previousSibling = before;
        after.nextSibling = before.nextSibling;

        if (before.nextSibling != null) {
            assert(before == before.nextSibling.previousSibling);
            before.nextSibling.previousSibling = after;
        }

        before.nextSibling = after;
    }

    remove(): Node {
        assert(this.parent != null);

        if (this.previousSibling != null) {
            assert(this.previousSibling.nextSibling == this);
            this.previousSibling.nextSibling = this.nextSibling;
        } else {
            assert(this.parent.firstChild == this);
            this.parent.firstChild = this.nextSibling;
        }

        if (this.nextSibling != null) {
            assert(this.nextSibling.previousSibling == this);
            this.nextSibling.previousSibling = this.previousSibling;
        } else {
            assert(this.parent.lastChild == this);
            this.parent.lastChild = this.previousSibling;
        }

        this.parent = null;
        this.previousSibling = null;
        this.nextSibling = null;
        return this;
    }

    removeChildren(): void {
        while (this.lastChild != null) {
            this.lastChild.remove();
        }
    }

    replaceWith(node: Node): void {
        assert(node != this);
        assert(this.parent != null);
        assert(node.parent == null);
        assert(node.previousSibling == null);
        assert(node.nextSibling == null);

        node.parent = this.parent;
        node.previousSibling = this.previousSibling;
        node.nextSibling = this.nextSibling;

        if (this.previousSibling != null) {
            assert(this.previousSibling.nextSibling == this);
            this.previousSibling.nextSibling = node;
        } else {
            assert(this.parent.firstChild == this);
            this.parent.firstChild = node;
        }

        if (this.nextSibling != null) {
            assert(this.nextSibling.previousSibling == this);
            this.nextSibling.previousSibling = node;
        } else {
            assert(this.parent.lastChild == this);
            this.parent.lastChild = node;
        }

        this.parent = null;
        this.previousSibling = null;
        this.nextSibling = null;
    }

    isType(): boolean {
        return this.kind == NodeKind.TYPE || this.kind == NodeKind.POINTER_TYPE || this.symbol != null && isType(this.symbol.kind);
    }

    isCallValue(): boolean {
        return this.parent.kind == NodeKind.CALL && this == this.parent.callValue();
    }

    isAssignTarget(): boolean {
        return this.parent.kind == NodeKind.ASSIGN && this == this.parent.binaryLeft();
    }

    withRange(range: SourceRange): Node {
        this.range = range;
        return this;
    }

    withInternalRange(range: SourceRange): Node {
        this.internalRange = range;
        return this;
    }

    functionFirstArgument(): Node {
        assert(this.kind == NodeKind.FUNCTION);
        assert(this.childCount() >= 2);
        let child = this.firstChild;
        if (child.kind == NodeKind.PARAMETERS) {
            child = child.nextSibling;
        }
        return child;
    }

    functionLastArgument(): Node {
        assert(this.kind == NodeKind.FUNCTION);
        assert(this.childCount() >= 2);
        let child = this.firstChild;
        if (child.kind == NodeKind.PARAMETERS) {
            child = child.nextSibling;
        }
        let lastArgument: Node = null;
        while (child != null) {
            let nextChild = child.nextSibling;
            if (nextChild.kind !== NodeKind.VARIABLE) {
                lastArgument = child;
                child = null;
            } else {
                child = nextChild;
            }
        }

        return lastArgument;
    }

    functionFirstArgumentIgnoringThis(): Node {
        assert(this.kind == NodeKind.FUNCTION);
        assert(this.childCount() >= 2);
        assert(this.symbol != null);
        let child = this.functionFirstArgument();
        if (this.symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
            child = child.nextSibling;
        }
        return child;
    }

    functionReturnType(): Node {
        assert(this.kind == NodeKind.FUNCTION);
        assert(this.childCount() >= 2);
        assert(isExpression(this.lastChild.previousSibling));
        return this.lastChild.previousSibling;
    }

    constructorNode(): Node {
        assert(this.kind == NodeKind.NEW);
        assert(this.childCount() > 0);
        assert(this.resolvedType.symbol.node.kind == NodeKind.CLASS);
        return this.resolvedType.symbol.node.constructorFunctionNode;
    }

    functionBody(): Node {
        assert(this.kind == NodeKind.FUNCTION);
        assert(this.childCount() >= 2);
        assert(this.lastChild.kind == NodeKind.BLOCK || this.lastChild.kind == NodeKind.EMPTY);
        let body = this.lastChild;
        return body.kind == NodeKind.BLOCK ? body : null;
    }

    newType(): Node {
        assert(this.kind == NodeKind.NEW);
        assert(this.childCount() >= 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    deleteType(): Node {
        assert(this.kind == NodeKind.DELETE);
        assert(this.childCount() >= 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    callValue(): Node {
        assert(this.kind == NodeKind.CALL);
        assert(this.childCount() >= 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    castValue(): Node {
        assert(this.kind == NodeKind.CAST);
        assert(this.childCount() == 2);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    castType(): Node {
        assert(this.kind == NodeKind.CAST);
        assert(this.childCount() == 2);
        assert(isExpression(this.lastChild));
        return this.lastChild;
    }

    alignOfType(): Node {
        assert(this.kind == NodeKind.ALIGN_OF);
        assert(this.childCount() == 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    sizeOfType(): Node {
        assert(this.kind == NodeKind.SIZE_OF);
        assert(this.childCount() == 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    dotTarget(): Node {
        assert(this.kind == NodeKind.DOT);
        assert(this.childCount() == 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    returnValue(): Node {
        assert(this.kind == NodeKind.RETURN);
        assert(this.childCount() <= 1);
        assert(this.firstChild == null || isExpression(this.firstChild));
        return this.firstChild;
    }

    ifReturnNode(): Node {
        assert(this.kind == NodeKind.IF);
        assert(this.firstChild !== null);
        assert(this.firstChild.nextSibling !== null);
        return this.firstChild.nextSibling.returnNode || null;
    }

    deleteValue(): Node {
        assert(this.kind == NodeKind.DELETE);
        assert(this.childCount() <= 1);
        assert(this.firstChild == null || isExpression(this.firstChild));
        return this.firstChild;
    }

    extendsType(): Node {
        assert(this.kind == NodeKind.EXTENDS);
        assert(this.childCount() == 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    firstGenericType(): Node {
        assert(this.firstChild.kind == NodeKind.PARAMETERS);
        assert(this.firstChild.childCount() > 0);
        return this.firstChild.firstChild;
    }

    variableType(): Node {
        assert(this.kind == NodeKind.VARIABLE);
        assert(this.childCount() <= 2);
        assert(isExpression(this.firstChild) || this.firstChild.kind == NodeKind.EMPTY);
        let type = this.firstChild;
        return type.kind != NodeKind.EMPTY ? type : null;
    }

    variableValue(): Node {
        assert(this.kind == NodeKind.VARIABLE);
        assert(this.childCount() <= 2);
        assert(this.firstChild.nextSibling == null || isExpression(this.firstChild.nextSibling));
        return this.firstChild.nextSibling;
    }

    hasVariableValue(): boolean {
        assert(this.kind == NodeKind.VARIABLE);
        return this.firstChild != undefined && this.firstChild.nextSibling != undefined;
    }

    expressionValue(): Node {
        assert(this.kind == NodeKind.EXPRESSION);
        assert(this.childCount() == 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    binaryLeft(): Node {
        assert(isBinary(this.kind));
        assert(this.childCount() == 2);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    binaryRight(): Node {
        assert(isBinary(this.kind));
        assert(this.childCount() == 2);
        assert(isExpression(this.lastChild));
        return this.lastChild;
    }

    unaryValue(): Node {
        assert(isUnary(this.kind));
        assert(this.childCount() == 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    pointer(): Node {
        assert(this.kind == NodeKind.POINTER_INDEX);
        assert(this.childCount() >= 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    pointerOffset(): int32 {
        assert(this.firstChild);
        assert(this.firstChild.nextSibling);
        return this.firstChild.nextSibling.intValue;
    }

    whileValue(): Node {
        assert(this.kind == NodeKind.WHILE);
        assert(this.childCount() == 2);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    whileBody(): Node {
        assert(this.kind == NodeKind.WHILE);
        assert(this.childCount() == 2);
        assert(this.lastChild.kind == NodeKind.BLOCK);
        return this.lastChild;
    }

    hookValue(): Node {
        assert(this.kind == NodeKind.HOOK);
        assert(this.childCount() == 3);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    hookTrue(): Node {
        assert(this.kind == NodeKind.HOOK);
        assert(this.childCount() == 3);
        assert(isExpression(this.firstChild.nextSibling));
        return this.firstChild.nextSibling;
    }

    hookFalse(): Node {
        assert(this.kind == NodeKind.HOOK);
        assert(this.childCount() == 3);
        assert(isExpression(this.lastChild));
        return this.lastChild;
    }

    indexTarget(): Node {
        assert(this.kind == NodeKind.INDEX);
        assert(this.childCount() >= 1);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    ifValue(): Node {
        assert(this.kind == NodeKind.IF);
        assert(this.childCount() == 2 || this.childCount() == 3);
        assert(isExpression(this.firstChild));
        return this.firstChild;
    }

    ifTrue(): Node {
        assert(this.kind == NodeKind.IF);
        assert(this.childCount() == 2 || this.childCount() == 3);
        assert(this.firstChild.nextSibling.kind == NodeKind.BLOCK);
        return this.firstChild.nextSibling;
    }

    ifFalse(): Node {
        assert(this.kind == NodeKind.IF);
        assert(this.childCount() == 2 || this.childCount() == 3);
        assert(this.firstChild.nextSibling.nextSibling == null || this.firstChild.nextSibling.nextSibling.kind == NodeKind.BLOCK);
        return this.firstChild.nextSibling.nextSibling || null;
    }

    expandCallIntoOperatorTree(): boolean {
        if (this.kind != NodeKind.CALL) {
            return false;
        }

        let value = this.callValue();
        let symbol = value.symbol;

        if (value.kind == NodeKind.DOT && symbol.node.isOperator() && symbol.node.isDeclare()) {
            let binaryKind = NodeKind.NULL;

            if (symbol.name == "%") binaryKind = NodeKind.REMAINDER;
            else if (symbol.name == "&") binaryKind = NodeKind.BITWISE_AND;
            else if (symbol.name == "*") binaryKind = NodeKind.MULTIPLY;
            else if (symbol.name == "**") binaryKind = NodeKind.EXPONENT;
            else if (symbol.name == "/") binaryKind = NodeKind.DIVIDE;
            else if (symbol.name == "<") binaryKind = NodeKind.LESS_THAN;
            else if (symbol.name == "<<") binaryKind = NodeKind.SHIFT_LEFT;
            else if (symbol.name == "==") binaryKind = NodeKind.EQUAL;
            else if (symbol.name == ">") binaryKind = NodeKind.GREATER_THAN;
            else if (symbol.name == ">>") binaryKind = NodeKind.SHIFT_RIGHT;
            else if (symbol.name == "[]") binaryKind = NodeKind.INDEX;
            else if (symbol.name == "^") binaryKind = NodeKind.BITWISE_XOR;
            else if (symbol.name == "|") binaryKind = NodeKind.BITWISE_OR;

            if (binaryKind != NodeKind.NULL) {
                this.kind = binaryKind;
                value.remove();
                this.insertChildBefore(this.firstChild, value.dotTarget().remove());
                return true;
            }

            else if (symbol.name == "[]=") {
                this.kind = NodeKind.ASSIGN;
                let target = createIndex(value.remove().dotTarget().remove());
                target.appendChild(this.firstChild.remove());
                this.insertChildBefore(this.firstChild, target);
                return true;
            }
        }

        return false;
    }

    arrayLength(): Node {
        assert(this.kind == NodeKind.NEW);
        assert(this.childCount() >= 1);
        assert(isExpression(this.firstChild));
        assert(this.firstChild.resolvedType.isArray());
        return this.firstChild.nextSibling;
    }
}

export function createNew(type: Node): Node {
    assert(isExpression(type));
    let node = new Node();
    node.kind = NodeKind.NEW;
    node.appendChild(type);
    return node;
}

export function createDelete(value: Node): Node {
    assert(value == null || isExpression(value));
    let node = new Node();
    node.kind = NodeKind.DELETE;
    if (value != null) {
        node.appendChild(value);
    }
    return node;
}

export function createHook(test: Node, primary: Node, secondary: Node): Node {
    assert(isExpression(test));
    assert(isExpression(primary));
    assert(isExpression(secondary));
    let node = new Node();
    node.kind = NodeKind.HOOK;
    node.appendChild(test);
    node.appendChild(primary);
    node.appendChild(secondary);
    return node;
}

export function createIndex(target: Node): Node {
    assert(isExpression(target));
    let node = new Node();
    node.kind = NodeKind.INDEX;
    node.appendChild(target);
    return node;
}

export function createNull(): Node {
    let node = new Node();
    node.kind = NodeKind.NULL;
    return node;
}

export function createUndefined(): Node {
    let node = new Node();
    node.kind = NodeKind.UNDEFINED;
    return node;
}

export function createThis(): Node {
    let node = new Node();
    node.kind = NodeKind.THIS;
    return node;
}

export function createAddressOf(value: Node): Node {
    assert(isExpression(value));
    let node = new Node();
    node.kind = NodeKind.ADDRESS_OF;
    node.appendChild(value);
    return node;
}

export function createDereference(value: Node): Node {
    assert(isExpression(value));
    let node = new Node();
    node.kind = NodeKind.DEREFERENCE;
    node.appendChild(value);
    return node;
}

export function createAlignOf(type: Node): Node {
    assert(isExpression(type));
    let node = new Node();
    node.kind = NodeKind.ALIGN_OF;
    node.appendChild(type);
    return node;
}

export function createSizeOf(type: Node): Node {
    assert(isExpression(type));
    let node = new Node();
    node.kind = NodeKind.SIZE_OF;
    node.appendChild(type);
    return node;
}

export function createboolean(value: boolean): Node {
    let node = new Node();
    node.kind = NodeKind.BOOLEAN;
    node.intValue = value ? 1 : 0;
    return node;
}

export function createInt(value: int32): Node {
    let node = new Node();
    node.kind = NodeKind.INT32;
    node.intValue = value;
    return node;
}

export function createLong(value: int64): Node {
    let node = new Node();
    node.kind = NodeKind.INT64;
    node.longValue = value;
    return node;
}

export function createFloat(value: float32): Node {
    let node = new Node();
    node.kind = NodeKind.FLOAT32;
    node.floatValue = value;
    return node;
}

export function createDouble(value: float64): Node {
    let node = new Node();
    node.kind = NodeKind.FLOAT64;
    node.doubleValue = value;
    return node;
}

export function createString(value: string): Node {
    let node = new Node();
    node.kind = NodeKind.STRING;
    node.stringValue = value;
    return node;
}

export function createArray(type: Type): Node {
    let node = new Node();
    node.kind = NodeKind.ARRAY;
    node.resolvedType = type;
    return node;
}

export function createName(value: string): Node {
    let node = new Node();
    node.kind = NodeKind.NAME;
    node.referenceValue = value;
    return node;
}

export function createType(type: Type): Node {
    assert(type != null);
    let node = new Node();
    node.kind = NodeKind.TYPE;
    node.resolvedType = type;
    return node;
}

export function createAny(): Node {
    let node = new Node();
    node.kind = NodeKind.ANY;
    return node;
}

export function createEmpty(): Node {
    let node = new Node();
    node.kind = NodeKind.EMPTY;
    return node;
}

export function createExpression(value: Node): Node {
    assert(isExpression(value));
    let node = new Node();
    node.kind = NodeKind.EXPRESSION;
    node.appendChild(value);
    return node;
}

export function createBlock(): Node {
    let node = new Node();
    node.kind = NodeKind.BLOCK;
    return node;
}

export function createModule(name: string): Node {
    let node = new Node();
    node.kind = NodeKind.MODULE;
    node.stringValue = name;
    return node;
}

export function createClass(name: string): Node {
    let node = new Node();
    node.kind = NodeKind.CLASS;
    node.stringValue = name;
    return node;
}

export function createEnum(name: string): Node {
    let node = new Node();
    node.kind = NodeKind.ENUM;
    node.stringValue = name;
    return node;
}

export function createIf(value: Node, trueBranch: Node, falseBranch: Node): Node {
    assert(isExpression(value));
    assert(trueBranch.kind == NodeKind.BLOCK);
    assert(falseBranch == null || falseBranch.kind == NodeKind.BLOCK);
    let node = new Node();
    node.kind = NodeKind.IF;
    node.appendChild(value);
    node.appendChild(trueBranch);
    if (falseBranch != null) {
        node.appendChild(falseBranch);
    }
    return node;
}

export function createWhile(value: Node, body: Node): Node {
    assert(isExpression(value));
    assert(body.kind == NodeKind.BLOCK);
    let node = new Node();
    node.kind = NodeKind.WHILE;
    node.appendChild(value);
    node.appendChild(body);
    return node;
}

export function createReturn(value: Node): Node {
    assert(value == null || isExpression(value));
    let node = new Node();
    node.kind = NodeKind.RETURN;
    if (value != null) {
        node.appendChild(value);
    }
    return node;
}

export function createImports(): Node {
    let node = new Node();
    node.kind = NodeKind.IMPORTS;
    return node;
}

export function createImport(name: string): Node {
    let node = new Node();
    node.kind = NodeKind.IMPORT;
    node.stringValue = name;
    return node;
}

export function createImportFrom(name: string): Node {
    let node = new Node();
    node.kind = NodeKind.IMPORT_FROM;
    node.stringValue = name;
    return node;
}

export function createVariables(): Node {
    let node = new Node();
    node.kind = NodeKind.VARIABLES;
    return node;
}

export function createConstants(): Node {
    let node = new Node();
    node.kind = NodeKind.CONSTANTS;
    return node;
}

export function createParameters(): Node {
    let node = new Node();
    node.kind = NodeKind.PARAMETERS;
    return node;
}

export function createExtends(type: Node): Node {
    assert(isExpression(type));
    let node = new Node();
    node.kind = NodeKind.EXTENDS;
    node.appendChild(type);
    return node;
}

export function createImplements(): Node {
    let node = new Node();
    node.kind = NodeKind.IMPLEMENTS;
    return node;
}

export function createParameter(name: string): Node {
    let node = new Node();
    node.kind = NodeKind.PARAMETER;
    node.stringValue = name;
    return node;
}

export function createVariable(name: string, type: Node, value: Node): Node {
    assert(type == null || isExpression(type));
    assert(value == null || isExpression(value));

    let node = new Node();
    node.kind = NodeKind.VARIABLE;
    node.stringValue = name;

    node.appendChild(type != null ? type : createEmpty());
    if (value != null) {
        node.appendChild(value);
    }

    return node;
}

export function createFunction(name: string): Node {
    let node = new Node();
    node.kind = NodeKind.FUNCTION;
    node.stringValue = name;
    return node;
}

export function createUnary(kind: NodeKind, value: Node): Node {
    assert(isUnary(kind));
    assert(isExpression(value));
    let node = new Node();
    node.kind = kind;
    node.appendChild(value);
    return node;
}

export function createBinary(kind: NodeKind, left: Node, right: Node): Node {
    assert(isBinary(kind));
    assert(isExpression(left));
    assert(isExpression(right));
    let node = new Node();
    node.kind = kind;
    node.appendChild(left);
    node.appendChild(right);
    return node;
}

export function createCall(value: Node): Node {
    assert(isExpression(value));
    let node = new Node();
    node.kind = NodeKind.CALL;
    node.appendChild(value);
    return node;
}

export function createCast(value: Node, type: Node): Node {
    assert(isExpression(value));
    assert(isExpression(type));
    let node = new Node();
    node.kind = NodeKind.CAST;
    node.appendChild(value);
    node.appendChild(type);
    return node;
}

export function createDot(value: Node, name: string): Node {
    assert(isExpression(value));
    let node = new Node();
    node.kind = NodeKind.DOT;
    node.stringValue = name;
    node.appendChild(value);
    return node;
}

export function createSymbolReference(symbol: Symbol): Node {
    let node = createName(symbol.name);
    node.symbol = symbol;
    node.resolvedType = symbol.resolvedType;
    return node;
}

export function createMemberReference(value: Node, symbol: Symbol): Node {
    let node = createDot(value, symbol.name);
    node.symbol = symbol;
    node.resolvedType = symbol.resolvedType;
    return node;
}

export function createParseError(): Node {
    let node = new Node();
    node.kind = NodeKind.PARSE_ERROR;
    return node;
}

//JavaScript
export function createJSNumber(): Node {
    let node = new Node();
    node.kind = NodeKind.JS_NUMBER;
    return node;
}

export function createJSObject(): Node {
    let node = new Node();
    node.kind = NodeKind.JS_OBJECT;
    return node;
}

export function createJSString(): Node {
    let node = new Node();
    node.kind = NodeKind.JS_STRING;
    return node;
}

export function createJSArray(): Node {
    let node = new Node();
    node.kind = NodeKind.JS_ARRAY;
    return node;
}