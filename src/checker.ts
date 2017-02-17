import {
    Symbol, SymbolKind, SYMBOL_FLAG_IS_REFERENCE, SYMBOL_FLAG_IS_UNARY_OPERATOR,
    SYMBOL_FLAG_IS_BINARY_OPERATOR, SYMBOL_FLAG_NATIVE_INTEGER, SYMBOL_FLAG_IS_UNSIGNED, SYMBOL_FLAG_NATIVE_FLOAT,
    SymbolState, isFunction, SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL, isVariable, SYMBOL_FLAG_NATIVE_DOUBLE,
    SYMBOL_FLAG_NATIVE_LONG, SYMBOL_FLAG_IS_ARRAY, SYMBOL_FLAG_IS_GENERIC
} from "./symbol";
import {Type, ConversionKind} from "./type";
import {
    Node, NodeKind, createVariable, createType, rangeForFlag, NODE_FLAG_EXPORT, NODE_FLAG_PRIVATE,
    NODE_FLAG_PUBLIC, NODE_FLAG_GET, NODE_FLAG_SET, NODE_FLAG_STATIC, NODE_FLAG_PROTECTED,
    NODE_FLAG_DECLARE, isExpression, createInt, createboolean, createNull, createMemberReference, createSymbolReference,
    isUnary, NODE_FLAG_UNSIGNED_OPERATOR, createCall, isBinary, createLong, createDouble, createFloat,
    NODE_FLAG_EXTERNAL_IMPORT
} from "./node";
import {CompileTarget} from "./compiler";
import {Log, Range, spanRanges} from "./log";
import {Scope, ScopeHint, FindNested} from "./scope";
import {StringBuilder_new} from "./stringbuilder";
import {alignToNextMultipleOf, isPositivePowerOf2} from "./imports";
import {MAX_UINT32_VALUE, MIN_INT32_VALUE, MAX_INT32_VALUE} from "./const";
/**
 * Author : Nidin Vinayakan
 */

export class CheckContext {
    log: Log;
    target: CompileTarget;
    pointerByteSize: int32;
    isUnsafeAllowed: boolean;
    enclosingModule: Symbol;
    enclosingClass: Symbol;
    currentReturnType: Type;
    nextGlobalVariableOffset: int32;

    //Foreign type
    anyType: Type;

    // Native types
    booleanType: Type;
    int8Type: Type;
    errorType: Type;
    int32Type: Type;
    int64Type: Type;
    float32Type: Type;
    float64Type: Type;
    nullType: Type;
    undefinedType: Type;
    int16Type: Type;
    stringType: Type;
    uint8Type: Type;
    uint32Type: Type;
    uint64Type: Type;
    uint16Type: Type;
    voidType: Type;
    arrayType: Type;

    allocateGlobalVariableOffset(sizeOf: int32, alignmentOf: int32): int32 {
        let offset = alignToNextMultipleOf(this.nextGlobalVariableOffset, alignmentOf);
        this.nextGlobalVariableOffset = offset + sizeOf;
        return offset;
    }
}

export function addScopeToSymbol(symbol: Symbol, parentScope: Scope): void {
    let scope = new Scope();
    scope.parent = parentScope;
    scope.symbol = symbol;
    symbol.scope = scope;
}

export function linkSymbolToNode(symbol: Symbol, node: Node): void {
    node.symbol = symbol;
    node.scope = symbol.scope;
    symbol.range = node.internalRange != null ? node.internalRange : node.range;
    symbol.node = node;
}

export enum CheckMode {
    NORMAL,
    INITIALIZE,
}

export function initialize(context: CheckContext, node: Node, parentScope: Scope, mode: CheckMode): void {
    let kind = node.kind;

    if (node.parent != null) {
        let parentKind = node.parent.kind;

        // Validate node placement
        if (kind != NodeKind.IMPORTS && kind != NodeKind.VARIABLE && kind != NodeKind.VARIABLES &&
            (kind != NodeKind.FUNCTION || parentKind != NodeKind.CLASS) &&
            (parentKind == NodeKind.FILE) != (parentKind == NodeKind.MODULE || kind == NodeKind.MODULE || kind == NodeKind.CLASS || kind == NodeKind.ENUM || kind == NodeKind.FUNCTION || kind == NodeKind.CONSTANTS)) {
            context.log.error(node.range, "This statement is not allowed here");
        }
    }

    // Module
    if (kind == NodeKind.MODULE) {
        assert(node.symbol == null);
        let symbol = new Symbol();
        symbol.kind = SymbolKind.TYPE_MODULE;
        symbol.name = node.stringValue;
        symbol.resolvedType = new Type();
        symbol.resolvedType.symbol = symbol;
        symbol.flags = SYMBOL_FLAG_IS_REFERENCE;
        addScopeToSymbol(symbol, parentScope);
        linkSymbolToNode(symbol, node);
        parentScope.define(context.log, symbol, ScopeHint.NORMAL);
        parentScope = symbol.scope;
    }

    // Class
    if (kind == NodeKind.CLASS || kind == NodeKind.ENUM) {
        assert(node.symbol == null);
        let symbol = new Symbol();
        symbol.kind = kind == NodeKind.CLASS ? SymbolKind.TYPE_CLASS : SymbolKind.TYPE_ENUM;
        symbol.name = node.stringValue;
        symbol.resolvedType = new Type();
        symbol.resolvedType.symbol = symbol;
        symbol.flags = SYMBOL_FLAG_IS_REFERENCE;
        addScopeToSymbol(symbol, parentScope);
        linkSymbolToNode(symbol, node);
        parentScope.define(context.log, symbol, ScopeHint.NORMAL);
        parentScope = symbol.scope;

        if (node.parameterCount() > 0) {
            //Class has generic parameters
            //TODO: Lift generic parameter limit from 1 to many
            let genericType = node.firstGenericType();
            let genericSymbol = new Symbol();
            genericSymbol.kind = SymbolKind.TYPE_GENERIC;
            genericSymbol.name = genericType.stringValue;
            genericSymbol.resolvedType = new Type();
            genericSymbol.resolvedType.symbol = genericSymbol;
            genericSymbol.flags = SYMBOL_FLAG_IS_GENERIC;
            addScopeToSymbol(genericSymbol, parentScope);
            linkSymbolToNode(genericSymbol, genericType);
            parentScope.define(context.log, genericSymbol, ScopeHint.NORMAL);

            symbol.generics = [];
            symbol.genericMaps = new Map<string, Map<string,Symbol>>();
            let genericMap = new Map<string, Symbol>();
            symbol.genericMaps.set(genericSymbol.name, genericMap);
            symbol.generics.push(genericSymbol.name);
        }

    }

    // Function
    else if (kind == NodeKind.FUNCTION) {
        assert(node.symbol == null);
        let symbol = new Symbol();
        symbol.kind =
            node.parent.kind == NodeKind.CLASS ? SymbolKind.FUNCTION_INSTANCE :
                SymbolKind.FUNCTION_GLOBAL;
        symbol.name = node.stringValue;
        if (node.isOperator()) {
            if (symbol.name == "+" || symbol.name == "-") {
                if (node.functionFirstArgument() == node.functionReturnType()) {
                    symbol.flags = SYMBOL_FLAG_IS_UNARY_OPERATOR;
                    symbol.rename = symbol.name == "+" ? "op_positive" : "op_negative";
                } else {
                    symbol.flags = SYMBOL_FLAG_IS_BINARY_OPERATOR;
                    symbol.rename = symbol.name == "+" ? "op_add" : "op_subtract";
                }
            } else {
                symbol.rename =
                    symbol.name == "%" ? "op_remainder" :
                        symbol.name == "&" ? "op_and" :
                            symbol.name == "*" ? "op_multiply" :
                                symbol.name == "**" ? "op_exponent" :
                                    symbol.name == "++" ? "op_increment" :
                                        symbol.name == "--" ? "op_decrement" :
                                            symbol.name == "/" ? "op_divide" :
                                                symbol.name == "<" ? "op_lessThan" :
                                                    symbol.name == "<<" ? "op_shiftLeft" :
                                                        symbol.name == "==" ? "op_equals" :
                                                            symbol.name == ">" ? "op_greaterThan" :
                                                                symbol.name == ">>" ? "op_shiftRight" :
                                                                    symbol.name == "[]" ? "op_get" :
                                                                        symbol.name == "[]=" ? "op_set" :
                                                                            symbol.name == "^" ? "op_xor" :
                                                                                symbol.name == "|" ? "op_or" :
                                                                                    symbol.name == "~" ? "op_complement" :
                                                                                        null;
            }
        }
        addScopeToSymbol(symbol, parentScope);
        linkSymbolToNode(symbol, node);
        parentScope.define(context.log, symbol,
            symbol.isSetter() ? ScopeHint.NOT_GETTER :
                symbol.isGetter() ? ScopeHint.NOT_SETTER :
                    symbol.isBinaryOperator() ? ScopeHint.NOT_UNARY :
                        symbol.isUnaryOperator() ? ScopeHint.NOT_BINARY :
                            ScopeHint.NORMAL);
        parentScope = symbol.scope;

        // All instance functions have a special "this" type
        if (symbol.kind != SymbolKind.FUNCTION_INSTANCE) {
        } else {
            let parent = symbol.parent();
            initializeSymbol(context, parent);
            node.insertChildBefore(node.functionFirstArgument(), createVariable("this", createType(parent.resolvedType), null));
        }
    }

    // Variable
    else if (kind == NodeKind.VARIABLE) {
        assert(node.symbol == null);
        let symbol = new Symbol();
        symbol.kind =
            node.parent.kind == NodeKind.CLASS ? SymbolKind.VARIABLE_INSTANCE :
                node.parent.kind == NodeKind.FUNCTION ? SymbolKind.VARIABLE_ARGUMENT :
                    node.parent.kind == NodeKind.CONSTANTS || node.parent.kind == NodeKind.ENUM ? SymbolKind.VARIABLE_CONSTANT :
                        node.parent.kind == NodeKind.VARIABLES && node.parent.parent.kind == NodeKind.FILE ? SymbolKind.VARIABLE_GLOBAL :
                            SymbolKind.VARIABLE_LOCAL;
        symbol.name = node.stringValue;
        symbol.scope = parentScope;
        linkSymbolToNode(symbol, node);
        parentScope.define(context.log, symbol, ScopeHint.NORMAL);
    }

    // Block
    else if (kind == NodeKind.BLOCK) {
        if (node.parent.kind != NodeKind.FUNCTION) {
            let scope = new Scope();
            scope.parent = parentScope;
            parentScope = scope;
        }
        node.scope = parentScope;
    }

    // Children
    let child = node.firstChild;
    while (child != null) {
        initialize(context, child, parentScope, mode);
        child = child.nextSibling;
    }

    if (kind == NodeKind.FILE && mode == CheckMode.INITIALIZE) {
        context.booleanType = parentScope.findLocal("boolean", ScopeHint.NORMAL).resolvedType;
        context.uint8Type = parentScope.findLocal("uint8", ScopeHint.NORMAL).resolvedType;
        context.int32Type = parentScope.findLocal("int32", ScopeHint.NORMAL).resolvedType;
        context.int64Type = parentScope.findLocal("int64", ScopeHint.NORMAL).resolvedType;
        context.int8Type = parentScope.findLocal("int8", ScopeHint.NORMAL).resolvedType;
        context.int16Type = parentScope.findLocal("int16", ScopeHint.NORMAL).resolvedType;
        context.stringType = parentScope.findLocal("string", ScopeHint.NORMAL).resolvedType;
        context.uint32Type = parentScope.findLocal("uint32", ScopeHint.NORMAL).resolvedType;
        context.uint64Type = parentScope.findLocal("uint64", ScopeHint.NORMAL).resolvedType;
        context.uint16Type = parentScope.findLocal("uint16", ScopeHint.NORMAL).resolvedType;

        context.float32Type = parentScope.findLocal("float32", ScopeHint.NORMAL).resolvedType;
        context.float64Type = parentScope.findLocal("float64", ScopeHint.NORMAL).resolvedType;

        prepareNativeType(context.booleanType, 1, 0);
        prepareNativeType(context.uint8Type, 1, SYMBOL_FLAG_NATIVE_INTEGER | SYMBOL_FLAG_IS_UNSIGNED);
        prepareNativeType(context.int8Type, 1, SYMBOL_FLAG_NATIVE_INTEGER);
        prepareNativeType(context.int16Type, 2, SYMBOL_FLAG_NATIVE_INTEGER);
        prepareNativeType(context.uint16Type, 2, SYMBOL_FLAG_NATIVE_INTEGER | SYMBOL_FLAG_IS_UNSIGNED);
        prepareNativeType(context.int32Type, 4, SYMBOL_FLAG_NATIVE_INTEGER);
        prepareNativeType(context.int64Type, 8, SYMBOL_FLAG_NATIVE_LONG);
        prepareNativeType(context.uint32Type, 4, SYMBOL_FLAG_NATIVE_INTEGER | SYMBOL_FLAG_IS_UNSIGNED);
        prepareNativeType(context.uint64Type, 8, SYMBOL_FLAG_NATIVE_LONG | SYMBOL_FLAG_IS_UNSIGNED);

        prepareNativeType(context.stringType, 4, SYMBOL_FLAG_IS_REFERENCE);

        prepareNativeType(context.float32Type, 4, SYMBOL_FLAG_NATIVE_FLOAT);
        prepareNativeType(context.float64Type, 8, SYMBOL_FLAG_NATIVE_DOUBLE);

        //Prepare builtin types
        context.arrayType = parentScope.findLocal("Array", ScopeHint.NORMAL).resolvedType;
        prepareBuiltinType(context.arrayType, 0, SYMBOL_FLAG_IS_ARRAY); //byteSize will calculate later
    }
}

function prepareNativeType(type: Type, byteSizeAndMaxAlignment: int32, flags: int32): void {
    let symbol = type.symbol;
    symbol.kind = SymbolKind.TYPE_NATIVE;
    symbol.byteSize = byteSizeAndMaxAlignment;
    symbol.maxAlignment = byteSizeAndMaxAlignment;
    symbol.flags = flags;
}

function prepareBuiltinType(type: Type, byteSizeAndMaxAlignment: int32, flags: int32): void {
    let symbol = type.symbol;
    symbol.kind = SymbolKind.TYPE_CLASS;
    symbol.byteSize = byteSizeAndMaxAlignment;
    symbol.maxAlignment = byteSizeAndMaxAlignment;
    symbol.flags = flags;
}

export function forbidFlag(context: CheckContext, node: Node, flag: int32, text: string): void {
    if ((node.flags & flag) != 0) {
        let range = rangeForFlag(node.firstFlag, flag);

        if (range != null) {
            node.flags = node.flags & ~flag;
            context.log.error(range, text);
        }
    }
}

export function requireFlag(context: CheckContext, node: Node, flag: int32, text: string): void {
    if ((node.flags & flag) == 0) {
        node.flags = node.flags | flag;
        context.log.error(node.range, text);
    }
}

export function initializeSymbol(context: CheckContext, symbol: Symbol): void {
    if (symbol.state == SymbolState.INITIALIZED) {
        assert(symbol.resolvedType != null);
        return;
    }

    assert(symbol.state == SymbolState.UNINITIALIZED);
    symbol.state = SymbolState.INITIALIZING;

    // Most flags aren't supported yet
    let node = symbol.node;
    // forbidFlag(context, node, NODE_FLAG_EXPORT, "Unsupported flag 'export'");
    forbidFlag(context, node, NODE_FLAG_PROTECTED, "Unsupported flag 'protected'");
    //forbidFlag(context, node, NODE_FLAG_STATIC, "Unsupported flag 'static'");

    // Module
    if (symbol.kind == SymbolKind.TYPE_MODULE) {
        forbidFlag(context, node, NODE_FLAG_GET, "Cannot use 'get' on a module");
        forbidFlag(context, node, NODE_FLAG_SET, "Cannot use 'set' on a module");
        forbidFlag(context, node, NODE_FLAG_PUBLIC, "Cannot use 'public' on a module");
        forbidFlag(context, node, NODE_FLAG_PRIVATE, "Cannot use 'private' on a module");
    }

    // Class
    else if (symbol.kind == SymbolKind.TYPE_CLASS || symbol.kind == SymbolKind.TYPE_NATIVE ||
        symbol.kind == SymbolKind.TYPE_GENERIC) {
        forbidFlag(context, node, NODE_FLAG_GET, "Cannot use 'get' on a class");
        forbidFlag(context, node, NODE_FLAG_SET, "Cannot use 'set' on a class");
        forbidFlag(context, node, NODE_FLAG_PUBLIC, "Cannot use 'public' on a class");
        forbidFlag(context, node, NODE_FLAG_PRIVATE, "Cannot use 'private' on a class");
    }

    // Interface
    else if (symbol.kind == SymbolKind.TYPE_INTERFACE) {
        forbidFlag(context, node, NODE_FLAG_GET, "Cannot use 'get' on a interface");
        forbidFlag(context, node, NODE_FLAG_SET, "Cannot use 'set' on a interface");
        forbidFlag(context, node, NODE_FLAG_PUBLIC, "Cannot use 'public' on a interface");
        forbidFlag(context, node, NODE_FLAG_PRIVATE, "Cannot use 'private' on a interface");
    }

    // Enum
    else if (symbol.kind == SymbolKind.TYPE_ENUM) {
        forbidFlag(context, node, NODE_FLAG_GET, "Cannot use 'get' on an enum");
        forbidFlag(context, node, NODE_FLAG_SET, "Cannot use 'set' on an enum");
        forbidFlag(context, node, NODE_FLAG_PUBLIC, "Cannot use 'public' on an enum");
        forbidFlag(context, node, NODE_FLAG_PRIVATE, "Cannot use 'private' on an enum");

        symbol.resolvedType = new Type();
        symbol.resolvedType.symbol = symbol;
        let underlyingSymbol = symbol.resolvedType.underlyingType(context).symbol;
        symbol.byteSize = underlyingSymbol.byteSize;
        symbol.maxAlignment = underlyingSymbol.maxAlignment;
    }

    // Function
    else if (isFunction(symbol.kind)) {
        if (node.firstChild.kind == NodeKind.PARAMETERS) {
            resolve(context, node.firstChild, symbol.scope);
        }

        let body = node.functionBody();
        let returnType = node.functionReturnType();
        let oldUnsafeAllowed = context.isUnsafeAllowed;
        context.isUnsafeAllowed = node.isUnsafe();
        resolveAsType(context, returnType, symbol.scope.parent);

        let argumentCount = 0;
        let child = node.functionFirstArgument();
        while (child != returnType) {
            assert(child.kind == NodeKind.VARIABLE);
            assert(child.symbol.kind == SymbolKind.VARIABLE_ARGUMENT);
            initializeSymbol(context, child.symbol);
            child.symbol.offset = argumentCount;
            argumentCount = argumentCount + 1;
            child = child.nextSibling;
        }

        if (symbol.kind != SymbolKind.FUNCTION_INSTANCE) {
            forbidFlag(context, node, NODE_FLAG_GET, "Cannot use 'get' here");
            forbidFlag(context, node, NODE_FLAG_SET, "Cannot use 'set' here");
            forbidFlag(context, node, NODE_FLAG_PUBLIC, "Cannot use 'public' here");
            forbidFlag(context, node, NODE_FLAG_PRIVATE, "Cannot use 'private' here");
        }

        else if (node.isGet()) {
            forbidFlag(context, node, NODE_FLAG_SET, "Cannot use both 'get' and 'set'");

            // Validate argument count including "this"
            if (argumentCount != 1) {
                context.log.error(symbol.range, "Getters must not have any arguments");
            }
        }

        else if (node.isSet()) {
            symbol.rename = StringBuilder_new()
                .append("set_")
                .append(symbol.name)
                .finish();

            // Validate argument count including "this"
            if (argumentCount != 2) {
                context.log.error(symbol.range, "Setters must have exactly one argument");
            }
        }

        // Validate operator argument counts including "this"
        else if (node.isOperator()) {
            if (symbol.name == "~" || symbol.name == "++" || symbol.name == "--") {
                if (argumentCount != 1) {
                    context.log.error(symbol.range, StringBuilder_new()
                        .append("Operator '")
                        .append(symbol.name)
                        .append("' must not have any arguments")
                        .finish());
                }
            }

            else if (symbol.name == "+" || symbol.name == "-") {
                if (argumentCount > 2) {
                    context.log.error(symbol.range, StringBuilder_new()
                        .append("Operator '")
                        .append(symbol.name)
                        .append("' must have at most one argument")
                        .finish());
                }
            }

            else if (symbol.name == "[]=") {
                if (argumentCount < 2) {
                    context.log.error(symbol.range, "Operator '[]=' must have at least one argument");
                }
            }

            else if (argumentCount != 2) {
                context.log.error(symbol.range, StringBuilder_new()
                    .append("Operator '")
                    .append(symbol.name)
                    .append("' must have exactly one argument")
                    .finish());
            }
        }

        symbol.resolvedType = new Type();
        symbol.resolvedType.symbol = symbol;

        if (symbol.kind == SymbolKind.FUNCTION_INSTANCE) {
            let parent = symbol.parent();
            let shouldConvertInstanceToGlobal = false;

            forbidFlag(context, node, NODE_FLAG_EXPORT, "Cannot use 'export' on an instance function");
            forbidFlag(context, node, NODE_FLAG_DECLARE, "Cannot use 'declare' on an instance function");

            // Functions inside declared classes are automatically declared
            if (parent.node.isDeclare()) {
                if (body == null) {
                    node.flags = node.flags | NODE_FLAG_DECLARE;
                    if (parent.node.isExternalImport()) {
                        node.flags = node.flags | NODE_FLAG_EXTERNAL_IMPORT;
                    }
                } else {
                    shouldConvertInstanceToGlobal = true;
                }
            }

            // Require implementations for functions not on declared classes
            else {
                if (body == null) {
                    context.log.error(node.lastChild.range, "Must implement this function");
                }

                // Functions inside export classes are automatically export
                if (parent.node.isExport()) {
                    node.flags = node.flags | NODE_FLAG_EXPORT;
                }
            }

            // Rewrite this symbol as a global function instead of an instance function
            if (shouldConvertInstanceToGlobal) {
                symbol.kind = SymbolKind.FUNCTION_GLOBAL;
                symbol.flags = symbol.flags | SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL;
                symbol.rename = StringBuilder_new()
                    .append(parent.name)
                    .appendChar('_')
                    .append(symbol.rename != null ? symbol.rename : symbol.name)
                    .finish();
                let argument = node.functionFirstArgument();
                assert(argument.symbol.name == "this");
                argument.symbol.rename = "__this";
            }
        }

        // Imported functions require a modifier for consistency with TypeScript
        else if (body == null) {
            forbidFlag(context, node, NODE_FLAG_EXPORT, "Cannot use 'export' on an unimplemented function");
            if (!node.parent || !node.parent.isDeclare()) {
                requireFlag(context, node, NODE_FLAG_DECLARE, "Declared functions must be prefixed with 'declare'");
            }
        }

        else {
            forbidFlag(context, node, NODE_FLAG_DECLARE, "Cannot use 'declare' on a function with an implementation");
        }

        context.isUnsafeAllowed = oldUnsafeAllowed;
    }

    // Variable
    else if (isVariable(symbol.kind)) {
        forbidFlag(context, node, NODE_FLAG_GET, "Cannot use 'get' on a variable");
        forbidFlag(context, node, NODE_FLAG_SET, "Cannot use 'set' on a variable");

        let type = node.variableType();
        let value = node.variableValue();
        let oldUnsafeAllowed = context.isUnsafeAllowed;
        context.isUnsafeAllowed = context.isUnsafeAllowed || node.isUnsafe();

        if (symbol.kind != SymbolKind.VARIABLE_INSTANCE) {
            forbidFlag(context, node, NODE_FLAG_PUBLIC, "Cannot use 'public' here");
            forbidFlag(context, node, NODE_FLAG_PRIVATE, "Cannot use 'private' here");
        }

        if (type != null) {
            resolveAsType(context, type, symbol.scope);
            // if(type.resolvedType.isArray() && type.firstChild){
            //     resolveAsType(context, type.firstChild, symbol.scope);
            // }
            symbol.resolvedType = type.resolvedType;
        }

        else if (value != null) {
            resolveAsExpression(context, value, symbol.scope);
            symbol.resolvedType = value.resolvedType;
        }

        else {
            context.log.error(node.internalRange, "Cannot create untyped variables");
            symbol.resolvedType = context.errorType;
        }

        // Validate the variable type
        if (symbol.resolvedType == context.voidType || symbol.resolvedType == context.nullType) {
            context.log.error(node.internalRange, StringBuilder_new()
                .append("Cannot create a variable with type '")
                .append(symbol.resolvedType.toString())
                .appendChar('\'')
                .finish());
            symbol.resolvedType = context.errorType;
        }

        // Resolve constant values at initialization time
        if (symbol.kind == SymbolKind.VARIABLE_CONSTANT) {
            if (value != null) {
                resolveAsExpression(context, value, symbol.scope);
                checkConversion(context, value, symbol.resolvedTypeUnderlyingIfEnumValue(context), ConversionKind.IMPLICIT);

                if (value.kind == NodeKind.INT32 || value.kind == NodeKind.INT64 || value.kind == NodeKind.BOOLEAN) {
                    symbol.offset = value.intValue;
                }

                else if (value.kind == NodeKind.FLOAT32 || value.kind == NodeKind.FLOAT64) {
                    symbol.offset = value.floatValue;
                }

                else if (value.resolvedType != context.errorType) {
                    context.log.error(value.range, "Invalid constant initializer");
                    symbol.resolvedType = context.errorType;
                }
            }

            // Automatically initialize enum values using the previous enum
            else if (symbol.isEnumValue()) {
                if (node.previousSibling != null) {
                    let previousSymbol = node.previousSibling.symbol;
                    initializeSymbol(context, previousSymbol);
                    symbol.offset = previousSymbol.offset + 1;
                } else {
                    symbol.offset = 0;
                }
            }

            else {
                context.log.error(node.internalRange, "Constants must be initialized");
            }
        }

        // Disallow shadowing at function scope
        if (symbol.scope.symbol == null) {
            let scope = symbol.scope.parent;
            while (scope != null) {
                let shadowed = scope.findLocal(symbol.name, ScopeHint.NORMAL);
                if (shadowed != null) {
                    context.log.error(node.internalRange, StringBuilder_new()
                        .append("The symbol '")
                        .append(symbol.name)
                        .append("' shadows another symbol with the same name in a parent scope")
                        .finish());
                    break;
                }

                // Stop when we pass through a function scope
                if (scope.symbol != null) {
                    break;
                }
                scope = scope.parent;
            }
        }

        context.isUnsafeAllowed = oldUnsafeAllowed;
    }

    else {
        assert(false);
    }

    assert(symbol.resolvedType != null);
    symbol.state = SymbolState.INITIALIZED;
}

export function resolveChildren(context: CheckContext, node: Node, parentScope: Scope): void {
    let child = node.firstChild;
    while (child != null) {
        resolve(context, child, parentScope);
        assert(child.resolvedType != null);
        child = child.nextSibling;
    }
}

export function resolveChildrenAsExpressions(context: CheckContext, node: Node, parentScope: Scope): void {
    let child = node.firstChild;
    while (child != null) {
        resolveAsExpression(context, child, parentScope);
        child = child.nextSibling;
    }
}

export function resolveAsExpression(context: CheckContext, node: Node, parentScope: Scope): void {
    assert(isExpression(node));
    resolve(context, node, parentScope);
    assert(node.resolvedType != null);

    if (node.resolvedType != context.errorType) {
        if (node.isType()) {
            context.log.error(node.range, "Expected expression but found type");
            node.resolvedType = context.errorType;
        }

        else if (node.resolvedType == context.voidType && node.parent.kind != NodeKind.EXPRESSION) {
            context.log.error(node.range, "This expression does not return a value");
            node.resolvedType = context.errorType;
        }
    }
}

export function resolveAsType(context: CheckContext, node: Node, parentScope: Scope): void {
    assert(isExpression(node));
    resolve(context, node, parentScope);
    assert(node.resolvedType != null);

    if (node.resolvedType != context.errorType && !node.isType()) {
        context.log.error(node.range, "Expected type but found expression");
        node.resolvedType = context.errorType;
    }
}

export function canConvert(context: CheckContext, node: Node, to: Type, kind: ConversionKind): boolean {
    let from = node.resolvedType;

    assert(isExpression(node));
    assert(from != null);
    assert(to != null);

    //Generic always accept any types
    if (from.isGeneric() || to.isGeneric()) {
        return true;
    }

    // Early-out if the types are identical or errors
    if (from == to || from == context.errorType || to == context.errorType) {
        return true;
    }

    // Allow conversions from null
    else if (from == context.nullType/* && to.isReference()*/) {
        return true;
    }

    // Allow explicit conversions between references in unsafe mode
    else if (/*context.isUnsafeAllowed && */(from.isReference() || to.isReference())) {
        if (kind == ConversionKind.EXPLICIT) {
            return true;
        }
    }

    // Check integer conversions
    else if (from.isInteger() && to.isInteger()) {
        let mask = to.integerBitMask(context);
        if (from.isUnsigned() && to.isUnsigned()) {
            return true;
        }
        // Allow implicit conversions between enums and int32
        if (from.isEnum() && to == from.underlyingType(context)) {
            return true;
        }
        if (!node.intValue) {
            return true;
        }
        // Only allow lossless conversions implicitly
        if (kind == ConversionKind.EXPLICIT || from.symbol.byteSize < to.symbol.byteSize ||
            node.kind == NodeKind.INT32 && (to.isUnsigned()
                ? node.intValue >= 0 && node.intValue <= MAX_UINT32_VALUE
                : node.intValue >= MIN_INT32_VALUE && node.intValue <= MAX_INT32_VALUE)) {
            return true;
        }
        return false;
    }

    else if (from.isInteger() && to.isLong()) {
        if (kind == ConversionKind.IMPLICIT) {
            return false;
        }
        return true;
    }

    else if (from.isInteger() && to.isFloat()) {
        if (kind == ConversionKind.IMPLICIT) {
            return false;
        }
        //TODO Allow only lossless conversions implicitly
        return true;
    }

    else if (from.isInteger() && to.isDouble()) {
        if (kind == ConversionKind.IMPLICIT) {
            return false;
        }
        //TODO Allow only lossless conversions implicitly
        return true;
    }

    else if (from.isFloat() && to.isInteger()) {
        if (kind == ConversionKind.IMPLICIT) {
            return false;
        }
        //TODO Allow only lossless conversions implicitly
        return true;
    }

    else if (from.isFloat() && to.isDouble()) {
        return true;
    }

    else if (from.isDouble() && to.isFloat()) {
        if (kind == ConversionKind.IMPLICIT) {
            return false;
        }
        //TODO Allow only lossless conversions implicitly
        return true;
    }
    else if (from.isFloat() && to.isFloat()) {
        return true;
    }
    else if (from.isDouble() && to.isDouble()) {
        return true;
    }

    return false;
}

export function checkConversion(context: CheckContext, node: Node, to: Type, kind: ConversionKind): void {
    if (!canConvert(context, node, to, kind)) {
        context.log.error(node.range, StringBuilder_new()
            .append("Cannot convert from type '")
            .append(node.resolvedType.toString())
            .append("' to type '")
            .append(to.toString())
            .append(kind == ConversionKind.IMPLICIT && canConvert(context, node, to, ConversionKind.EXPLICIT) ? "' without a cast" : "'")
            .finish());
        node.resolvedType = context.errorType;
    }
}

export function checkStorage(context: CheckContext, target: Node): void {
    assert(isExpression(target));

    if (target.resolvedType != context.errorType && target.kind != NodeKind.INDEX && target.kind != NodeKind.DEREFERENCE &&
        (target.kind != NodeKind.NAME && target.kind != NodeKind.DOT || target.symbol != null && (!isVariable(target.symbol.kind) || target.symbol.kind == SymbolKind.VARIABLE_CONSTANT))) {
        context.log.error(target.range, "Cannot store to this location");
        target.resolvedType = context.errorType;
    }
}

export function createDefaultValueForType(context: CheckContext, type: Type): Node {
    if (type.isLong()) {
        return createLong(0);
    }
    else if (type.isInteger()) {
        return createInt(0);
    }
    else if (type.isDouble()) {
        return createDouble(0);
    }
    else if (type.isFloat()) {
        return createFloat(0);
    }

    if (type == context.booleanType) {
        return createboolean(false);
    }

    if (type.isClass()) {
        return createNull();
    }

    assert(type.isReference());
    return createNull();
}

export function simplifyBinary(node: Node): void {
    let left = node.binaryLeft();
    let right = node.binaryRight();

    // Canonicalize commutative operators
    if ((node.kind == NodeKind.ADD || node.kind == NodeKind.MULTIPLY ||
        node.kind == NodeKind.BITWISE_AND || node.kind == NodeKind.BITWISE_OR || node.kind == NodeKind.BITWISE_XOR) &&
        left.kind == NodeKind.INT32 && right.kind != NodeKind.INT32) {
        node.appendChild(left.remove());
        left = node.binaryLeft();
        right = node.binaryRight();
    }

    // Convert multiplication or division by a power of 2 into a shift
    if ((node.kind == NodeKind.MULTIPLY || (node.kind == NodeKind.DIVIDE || node.kind == NodeKind.REMAINDER) && node.resolvedType.isUnsigned()) &&
        right.kind == NodeKind.INT32 && isPositivePowerOf2(right.intValue)) {
        // Extract the shift from the value
        let shift = -1;
        let value = right.intValue;
        while (value != 0) {
            value = value >> 1;
            shift = shift + 1;
        }

        // "x * 16" => "x << 4"
        if (node.kind == NodeKind.MULTIPLY) {
            node.kind = NodeKind.SHIFT_LEFT;
            right.intValue = shift;
        }

        // "x / 16" => "x >> 4" when x is unsigned
        else if (node.kind == NodeKind.DIVIDE) {
            node.kind = NodeKind.SHIFT_RIGHT;
            right.intValue = shift;
        }

        // "x % 16" => "x & 15" when x is unsigned
        else if (node.kind == NodeKind.REMAINDER) {
            node.kind = NodeKind.BITWISE_AND;
            right.intValue = right.intValue - 1;
        }

        else {
            assert(false);
        }
    }

    // Flip addition with negation into subtraction
    else if (node.kind == NodeKind.ADD && right.kind == NodeKind.NEGATIVE) {
        node.kind = NodeKind.SUBTRACT;
        right.replaceWith(right.unaryValue().remove());
    }

    // Flip addition with negative constants into subtraction
    else if (node.kind == NodeKind.ADD && right.isNegativeInteger()) {
        node.kind = NodeKind.SUBTRACT;
        right.intValue = -right.intValue;
    }
}

export function binaryHasUnsignedArguments(node: Node): boolean {
    let left = node.binaryLeft();
    let right = node.binaryRight();
    let leftType = left.resolvedType;
    let rightType = right.resolvedType;

    return leftType.isUnsigned() && rightType.isUnsigned() || leftType.isUnsigned() && right.isNonNegativeInteger() ||
        left.isNonNegativeInteger() && rightType.isUnsigned();
}

export function isBinaryLong(node: Node): boolean {
    let left = node.binaryLeft();
    let right = node.binaryRight();
    let leftType = left.resolvedType;
    let rightType = right.resolvedType;

    return leftType.isLong() || rightType.isLong();
}

export function isBinaryDouble(node: Node): boolean {
    let left = node.binaryLeft();
    let right = node.binaryRight();
    let leftType = left.resolvedType;
    let rightType = right.resolvedType;

    return leftType.isDouble() || rightType.isDouble();
}

export function isSymbolAccessAllowed(context: CheckContext, symbol: Symbol, node: Node, range: Range): boolean {
    if (symbol.isUnsafe() && !context.isUnsafeAllowed) {
        context.log.error(range, StringBuilder_new()
            .append("Cannot use symbol '")
            .append(symbol.name)
            .append("' outside an 'unsafe' block")
            .finish());
        return false;
    }

    if (symbol.node != null && symbol.node.isPrivate()) {
        let parent = symbol.parent();

        if (parent != null && context.enclosingClass != parent) {
            context.log.error(range, StringBuilder_new()
                .append("Cannot access private symbol '")
                .append(symbol.name)
                .append("' here")
                .finish());
            return false;
        }
    }

    if (isFunction(symbol.kind) && (symbol.isSetter() ? !node.isAssignTarget() : !node.isCallValue())) {
        if (symbol.isSetter()) {
            context.log.error(range, StringBuilder_new()
                .append("Cannot use setter '")
                .append(symbol.name)
                .append("' here")
                .finish());
        }

        else {
            context.log.error(range, StringBuilder_new()
                .append("Must call function '")
                .append(symbol.name)
                .appendChar('\'')
                .finish());
        }

        return false;
    }

    return true;
}

export function resolve(context: CheckContext, node: Node, parentScope: Scope): void {
    let kind = node.kind;
    assert(kind == NodeKind.FILE || parentScope != null);

    if (node.resolvedType != null) {
        return;
    }

    node.resolvedType = context.errorType;

    if (kind == NodeKind.FILE || kind == NodeKind.GLOBAL) {
        resolveChildren(context, node, parentScope);
    }

    else if (kind == NodeKind.MODULE) {
        let oldEnclosingModule = context.enclosingModule;
        initializeSymbol(context, node.symbol);
        context.enclosingModule = node.symbol;
        resolveChildren(context, node, node.scope);
        // if (node.symbol.kind == SymbolKind.TYPE_MODULE) {
        //     node.symbol.determineClassLayout(context);
        // }
        context.enclosingModule = oldEnclosingModule;
    }

    else if (kind == NodeKind.EXTERNAL_IMPORT) {
        let symbol = node.symbol;
    }

    else if (kind == NodeKind.CLASS) {
        let oldEnclosingClass = context.enclosingClass;
        initializeSymbol(context, node.symbol);
        context.enclosingClass = node.symbol;
        resolveChildren(context, node, node.scope);
        if (node.symbol.kind == SymbolKind.TYPE_CLASS) {
            node.symbol.determineClassLayout(context);
        }
        context.enclosingClass = oldEnclosingClass;
    }

    else if (kind == NodeKind.ENUM) {
        initializeSymbol(context, node.symbol);
        resolveChildren(context, node, node.scope);
    }

    else if (kind == NodeKind.FUNCTION) {
        let body = node.functionBody();
        initializeSymbol(context, node.symbol);

        if (node.stringValue == "constructor" && node.parent.kind == NodeKind.CLASS) {
            node.parent.constructorFunctionNode = node;
        }

        if (body != null) {
            let oldReturnType = context.currentReturnType;
            let oldUnsafeAllowed = context.isUnsafeAllowed;
            context.currentReturnType = node.functionReturnType().resolvedType;
            context.isUnsafeAllowed = node.isUnsafe();
            resolveChildren(context, body, node.scope);
            context.currentReturnType = oldReturnType;
            context.isUnsafeAllowed = oldUnsafeAllowed;
        }
    }

    else if (kind == NodeKind.PARAMETER) {
        let symbol = node.symbol;

    }

    else if (kind == NodeKind.VARIABLE) {
        let symbol = node.symbol;
        initializeSymbol(context, symbol);

        let oldUnsafeAllowed = context.isUnsafeAllowed;
        context.isUnsafeAllowed = context.isUnsafeAllowed || node.isUnsafe();

        let value = node.variableValue();
        if (value != null) {
            resolveAsExpression(context, value, parentScope);

            checkConversion(context, value, symbol.resolvedTypeUnderlyingIfEnumValue(context), ConversionKind.IMPLICIT);

            if (symbol.resolvedType != value.resolvedType) {
                value.becomeValueTypeOf(symbol, context);
            }

            // Variable initializers must be compile-time constants
            if (symbol.kind == SymbolKind.VARIABLE_GLOBAL && value.kind != NodeKind.INT32 && value.kind != NodeKind.BOOLEAN && value.kind != NodeKind.NULL) {
                //context.log.error(value.range, "Global initializers must be compile-time constants");
            }
        }

        else if (symbol.resolvedType != context.errorType) {
            value = createDefaultValueForType(context, symbol.resolvedType);
            resolveAsExpression(context, value, parentScope);
            node.appendChild(value);
        }

        // Allocate global variables
        if (symbol.kind == SymbolKind.VARIABLE_GLOBAL && symbol.resolvedType != context.errorType) {
            symbol.offset = context.allocateGlobalVariableOffset(symbol.resolvedType.variableSizeOf(context), symbol.resolvedType.variableAlignmentOf(context));
        }

        context.isUnsafeAllowed = oldUnsafeAllowed;
    }

    else if (kind == NodeKind.BREAK || kind == NodeKind.CONTINUE) {
        let found = false;
        let n = node;
        while (n != null) {
            if (n.kind == NodeKind.WHILE) {
                found = true;
                break;
            }
            n = n.parent;
        }
        if (!found) {
            context.log.error(node.range, "Cannot use this statement outside of a loop");
        }
    }

    else if (kind == NodeKind.BLOCK) {
        let oldUnsafeAllowed = context.isUnsafeAllowed;
        if (node.isUnsafe()) context.isUnsafeAllowed = true;
        resolveChildren(context, node, node.scope);
        context.isUnsafeAllowed = oldUnsafeAllowed;
    }

    else if (kind == NodeKind.IMPORTS || kind == NodeKind.CONSTANTS || kind == NodeKind.VARIABLES) {
        resolveChildren(context, node, parentScope);
    }

    else if (kind == NodeKind.ANY) {
        //imported functions have anyType
        node.kind = NodeKind.TYPE;
        node.resolvedType = context.anyType;
    }

    else if (kind == NodeKind.INT32) {
        // Use the positive flag to differentiate between -2147483648 and 2147483648
        node.resolvedType = node.intValue < 0 && !node.isPositive() ? context.uint32Type : context.int32Type;
    }

    else if (kind == NodeKind.INT64) {
        node.resolvedType = node.intValue < 0 && !node.isPositive() ? context.uint64Type : context.int64Type;
    }

    else if (kind == NodeKind.FLOAT32) {
        node.resolvedType = context.float32Type;
    }

    else if (kind == NodeKind.FLOAT64) {
        node.resolvedType = context.float64Type;
    }

    else if (kind == NodeKind.STRING) {
        node.resolvedType = context.stringType;
    }

    else if (kind == NodeKind.BOOLEAN) {
        node.resolvedType = context.booleanType;
    }

    else if (kind == NodeKind.NULL) {
        node.resolvedType = context.nullType;
    }

    else if (kind == NodeKind.INDEX) {
        resolveChildrenAsExpressions(context, node, parentScope);

        let target = node.indexTarget();
        let type = target.resolvedType;

        if (type != context.errorType) {
            let symbol = type.hasInstanceMembers() ? type.findMember("[]", ScopeHint.NORMAL) : null;

            if (symbol == null) {
                context.log.error(node.internalRange, StringBuilder_new()
                    .append("Cannot index into type '")
                    .append(target.resolvedType.toString())
                    .appendChar('\'')
                    .finish());
            }

            else {
                assert(symbol.kind == SymbolKind.FUNCTION_INSTANCE || symbol.kind == SymbolKind.FUNCTION_GLOBAL && symbol.shouldConvertInstanceToGlobal());

                // Convert to a regular function call and resolve that instead
                node.kind = NodeKind.CALL;
                target.remove();
                node.insertChildBefore(node.firstChild, createMemberReference(target, symbol));
                node.resolvedType = null;
                resolveAsExpression(context, node, parentScope);
            }
        }
    }

    else if (kind == NodeKind.ALIGN_OF) {
        let type = node.alignOfType();
        resolveAsType(context, type, parentScope);
        node.resolvedType = context.int32Type;

        if (type.resolvedType != context.errorType) {
            node.becomeIntegerConstant(type.resolvedType.allocationAlignmentOf(context));
        }
    }

    else if (kind == NodeKind.SIZE_OF) {
        let type = node.sizeOfType();
        resolveAsType(context, type, parentScope);
        node.resolvedType = context.int32Type;

        if (type.resolvedType != context.errorType) {
            node.becomeIntegerConstant(type.resolvedType.allocationSizeOf(context));
        }
    }

    else if (kind == NodeKind.THIS) {
        let symbol = parentScope.findNested("this", ScopeHint.NORMAL, FindNested.NORMAL);
        if (symbol == null) {
            context.log.error(node.range, "Cannot use 'this' here");
        } else {
            node.becomeSymbolReference(symbol);
        }
    }

    else if (kind == NodeKind.PARSE_ERROR) {
        node.resolvedType = context.errorType;
    }

    else if (kind == NodeKind.NAME) {
        let name = node.stringValue;
        let symbol = parentScope.findNested(name, ScopeHint.NORMAL, FindNested.NORMAL);

        if (symbol == null) {
            let builder = StringBuilder_new()
                .append("No symbol named '")
                .append(name)
                .append("' here");

            // In JavaScript, "this." before instance symbols is required
            symbol = parentScope.findNested(name, ScopeHint.NORMAL, FindNested.ALLOW_INSTANCE_ERRORS);
            if (symbol != null) {
                builder
                    .append(", did you mean 'this.")
                    .append(symbol.name)
                    .append("'?");
            }

            // People may try to use types from TypeScript
            else if (name == "number") builder.append(", did you mean 'int32'?");
            else if (name == "booleanean") builder.append(", did you mean 'boolean'?");

            context.log.error(node.range, builder.finish());
        }

        else if (symbol.state == SymbolState.INITIALIZING) {
            context.log.error(node.range, StringBuilder_new()
                .append("Cyclic reference to symbol '")
                .append(name)
                .append("' here")
                .finish());
        }

        else if (isSymbolAccessAllowed(context, symbol, node, node.range)) {
            initializeSymbol(context, symbol);
            if (symbol.resolvedType.isArray() && node.firstChild && node.firstChild.kind != NodeKind.PARAMETERS) {
                resolveAsType(context, node.firstChild, symbol.scope);
                let arrayType = node.firstChild.resolvedType;

                // let arrayTypeName = symbol.name + `<${arrayType.symbol.name}>`;
                // let arraySymbol = parentScope.findNested(arrayTypeName, ScopeHint.NORMAL, FindNested.NORMAL);
                //
                // if(arraySymbol ==  null) {
                //     let arraySymbolType = new Type();
                //     arraySymbol = symbol.clone();
                //     arraySymbol.name = symbol.name + `<${arrayType.symbol.name}>`;
                //     arraySymbol.resolvedType = arraySymbolType;
                //     arraySymbol.node = node;
                //     arraySymbolType.symbol = arraySymbol;
                //     parentScope.define(context.log, arraySymbol, ScopeHint.NORMAL);
                // }

                // node.symbol = arraySymbol;
                // node.resolvedType = arraySymbol.resolvedType;
                //
                let genericName = symbol.generics[0];
                let genericMap = symbol.genericMaps.get(genericName);
                genericMap.set(node.parent.previousSibling.symbol.name, arrayType.symbol);

                node.symbol = symbol;
                node.resolvedType = symbol.resolvedType;

            } else {
                node.symbol = symbol;
                node.resolvedType = symbol.resolvedType;
            }

            // Inline constants
            if (symbol.kind == SymbolKind.VARIABLE_CONSTANT) {
                if (symbol.resolvedType == context.booleanType) {
                    node.becomebooleaneanConstant(symbol.offset != 0);
                } else {
                    node.becomeIntegerConstant(symbol.offset);
                }
            }
        }
    }

    else if (kind == NodeKind.CAST) {
        let value = node.castValue();
        let type = node.castType();
        resolveAsExpression(context, value, parentScope);
        resolveAsType(context, type, parentScope);
        let castedType = type.resolvedType;
        checkConversion(context, value, castedType, ConversionKind.EXPLICIT);
        node.resolvedType = castedType;

        // Automatically fold constants
        if (value.kind == NodeKind.INT32 && castedType.isInteger()) {
            let result = value.intValue;
            let shift = 32 - castedType.integerBitCount(context);
            node.becomeIntegerConstant(castedType.isUnsigned()
                ? castedType.integerBitMask(context) & result
                : result << shift >> shift);
        }
        //i32 to f32
        else if (value.kind == NodeKind.INT32 && castedType.isFloat()) {
            node.becomeFloatConstant(value.intValue);
        }
        //i32 to f64
        else if (value.kind == NodeKind.INT32 && castedType.isDouble()) {
            node.becomeDoubleConstant(value.intValue);
        }
        //f32 to i32
        else if (value.kind == NodeKind.FLOAT32 && castedType.isInteger()) {
            node.becomeIntegerConstant(Math.round(value.floatValue));
        }
    }

    else if (kind == NodeKind.DOT) {
        let target = node.dotTarget();
        resolve(context, target, parentScope);

        if (target.resolvedType != context.errorType) {
            if (target.isType() && (target.resolvedType.isEnum() || target.resolvedType.hasInstanceMembers()) ||
                !target.isType() && target.resolvedType.hasInstanceMembers()) {
                let name = node.stringValue;

                // Empty names are left over from parse errors that have already been reported
                if (name.length > 0) {
                    let symbol = target.resolvedType.findMember(name, node.isAssignTarget() ? ScopeHint.PREFER_SETTER : ScopeHint.PREFER_GETTER);

                    if (symbol == null) {
                        context.log.error(node.internalRange, StringBuilder_new()
                            .append("No member named '")
                            .append(name)
                            .append("' on type '")
                            .append(target.resolvedType.toString())
                            .appendChar('\'')
                            .finish());
                    }

                    // Automatically call getters
                    else if (symbol.isGetter()) {
                        node.kind = NodeKind.CALL;
                        node.appendChild(createMemberReference(target.remove(), symbol));
                        node.resolvedType = null;
                        resolveAsExpression(context, node, parentScope);
                        return;
                    }

                    else if (isSymbolAccessAllowed(context, symbol, node, node.internalRange)) {
                        initializeSymbol(context, symbol);
                        node.symbol = symbol;
                        node.resolvedType = symbol.resolvedType;

                        // Inline constants
                        if (symbol.kind == SymbolKind.VARIABLE_CONSTANT) {
                            node.becomeIntegerConstant(symbol.offset);
                        }
                    }
                }
            }

            else {
                context.log.error(node.internalRange, StringBuilder_new()
                    .append("The type '")
                    .append(target.resolvedType.toString())
                    .append("' has no members")
                    .finish());
            }
        }
    }

    else if (kind == NodeKind.CALL) {
        let value = node.callValue();
        resolveAsExpression(context, value, parentScope);

        if (value.resolvedType != context.errorType) {
            let symbol = value.symbol;

            // Only functions are callable
            if (symbol == null || !isFunction(symbol.kind)) {
                context.log.error(value.range, StringBuilder_new()
                    .append("Cannot call value of type '")
                    .append(value.resolvedType.toString())
                    .appendChar('\'')
                    .finish());
            }

            else {
                initializeSymbol(context, symbol);

                if (symbol.shouldConvertInstanceToGlobal()) {
                    let name = createSymbolReference(symbol);
                    node.insertChildBefore(value, name.withRange(value.internalRange));
                    node.insertChildBefore(value, value.dotTarget().remove());
                    value.remove();
                    value = name;
                }

                let returnType = symbol.node.functionReturnType();
                let argumentVariable = symbol.node.functionFirstArgumentIgnoringThis();
                let argumentValue = value.nextSibling;

                // Match argument values with variables
                while (argumentVariable != returnType && argumentValue != null) {
                    resolveAsExpression(context, argumentValue, parentScope);
                    checkConversion(context, argumentValue, argumentVariable.symbol.resolvedType, ConversionKind.IMPLICIT);
                    argumentVariable = argumentVariable.nextSibling;
                    argumentValue = argumentValue.nextSibling;
                }

                // Not enough arguments?
                if (returnType.resolvedType != context.anyType) {

                    if (argumentVariable != returnType && !argumentVariable.hasVariableValue()) {
                        context.log.error(node.internalRange, StringBuilder_new()
                            .append("Not enough arguments for function '")
                            .append(symbol.name)
                            .appendChar('\'')
                            .finish());
                    }

                    // Too many arguments?
                    else if (argumentValue != null) {
                        while (argumentValue != null) {
                            resolveAsExpression(context, argumentValue, parentScope);
                            argumentValue = argumentValue.nextSibling;
                        }
                        context.log.error(node.internalRange, StringBuilder_new()
                            .append("Too many arguments for function '")
                            .append(symbol.name)
                            .appendChar('\'')
                            .finish());
                    }
                }

                // Pass the return type along
                node.resolvedType = returnType.resolvedType;
            }
        }
    }

    else if (kind == NodeKind.DELETE) {
        let value = node.deleteType();

        if (value != null) {
            resolveAsExpression(context, value, parentScope);

            if (value.resolvedType == null || value.resolvedType == context.voidType) {
                context.log.error(value.range, "Unexpected delete value 'void'");
            }
        }

        else {
            context.log.error(node.range, StringBuilder_new()
                .append("Expected delete value '")
                .append(context.currentReturnType.toString())
                .appendChar('\'')
                .finish());
        }
    }

    else if (kind == NodeKind.RETURN) {
        let value = node.returnValue();

        if (value != null) {
            resolveAsExpression(context, value, parentScope);

            if (context.currentReturnType != null) {
                if (context.currentReturnType != context.voidType) {
                    checkConversion(context, value, context.currentReturnType, ConversionKind.IMPLICIT);
                }

                else {
                    context.log.error(value.range, "Unexpected return value in function returning 'void'");
                }
            }
        }

        else if (context.currentReturnType != null && context.currentReturnType != context.voidType) {
            context.log.error(node.range, StringBuilder_new()
                .append("Expected return value in function returning '")
                .append(context.currentReturnType.toString())
                .appendChar('\'')
                .finish());
        }
    }

    else if (kind == NodeKind.EMPTY) {
    }

    else if (kind == NodeKind.PARAMETERS) {
        // resolveAsType(context, node.genericType(), parentScope);
        //resolveAsExpression(context, node.expressionValue(), parentScope);
        // context.log.error(node.range, "Generics are not implemented yet");
    }

    else if (kind == NodeKind.EXTENDS) {
        resolveAsType(context, node.extendsType(), parentScope);
        //context.log.error(node.range, "Subclassing is not implemented yet");
    }

    else if (kind == NodeKind.IMPLEMENTS) {
        let child = node.firstChild;
        while (child != null) {
            resolveAsType(context, child, parentScope);
            child = child.nextSibling;
        }
        context.log.error(node.range, "Interfaces are not implemented yet");
    }

    else if (kind == NodeKind.EXPRESSION) {
        resolveAsExpression(context, node.expressionValue(), parentScope);
    }

    else if (kind == NodeKind.WHILE) {
        let value = node.whileValue();
        let body = node.whileBody();
        resolveAsExpression(context, value, parentScope);
        checkConversion(context, value, context.booleanType, ConversionKind.IMPLICIT);
        resolve(context, body, parentScope);
    }

    else if (kind == NodeKind.IF) {
        let value = node.ifValue();
        let yes = node.ifTrue();
        let no = node.ifFalse();
        resolveAsExpression(context, value, parentScope);
        checkConversion(context, value, context.booleanType, ConversionKind.IMPLICIT);
        resolve(context, yes, parentScope);
        if (no != null) {
            resolve(context, no, parentScope);
        }
    }

    else if (kind == NodeKind.HOOK) {
        let value = node.hookValue();
        let yes = node.hookTrue();
        let no = node.hookFalse();
        resolveAsExpression(context, value, parentScope);
        checkConversion(context, value, context.booleanType, ConversionKind.IMPLICIT);
        resolve(context, yes, parentScope);
        resolve(context, no, parentScope);
        checkConversion(context, yes, no.resolvedType, ConversionKind.IMPLICIT);
        let commonType = (yes.resolvedType == context.nullType ? no : yes).resolvedType;
        if (yes.resolvedType != commonType && (yes.resolvedType != context.nullType || !commonType.isReference()) &&
            no.resolvedType != commonType && (no.resolvedType != context.nullType || !commonType.isReference())) {
            context.log.error(spanRanges(yes.range, no.range), StringBuilder_new()
                .append("Type '")
                .append(yes.resolvedType.toString())
                .append("' is not the same as type '")
                .append(no.resolvedType.toString())
                .appendChar('\'')
                .finish());
        }
        node.resolvedType = commonType;
    }

    else if (kind == NodeKind.ASSIGN) {
        let left = node.binaryLeft();
        let right = node.binaryRight();

        if (left.kind == NodeKind.INDEX) {
            resolveChildrenAsExpressions(context, left, parentScope);

            let target = left.indexTarget();
            let type = target.resolvedType;

            if (type != context.errorType) {
                let symbol = type.hasInstanceMembers() ? type.findMember("[]=", ScopeHint.NORMAL) : null;

                if (symbol == null) {
                    context.log.error(left.internalRange, StringBuilder_new()
                        .append("Cannot index into type '")
                        .append(target.resolvedType.toString())
                        .appendChar('\'')
                        .finish());
                }

                else {
                    assert(symbol.kind == SymbolKind.FUNCTION_INSTANCE);

                    // Convert to a regular function call and resolve that instead
                    node.kind = NodeKind.CALL;
                    target.remove();
                    left.remove();
                    while (left.lastChild != null) {
                        node.insertChildBefore(node.firstChild, left.lastChild.remove());
                    }
                    node.insertChildBefore(node.firstChild, createMemberReference(target, symbol));
                    node.internalRange = spanRanges(left.internalRange, right.range);
                    node.resolvedType = null;
                    resolveAsExpression(context, node, parentScope);
                    return;
                }
            }
        }

        resolveAsExpression(context, left, parentScope);

        // Automatically call setters
        if (left.symbol != null && left.symbol.isSetter()) {
            node.kind = NodeKind.CALL;
            node.internalRange = left.internalRange;
            node.resolvedType = null;
            resolveAsExpression(context, node, parentScope);
            return;
        }

        resolveAsExpression(context, right, parentScope);
        checkConversion(context, right, left.resolvedType, ConversionKind.IMPLICIT);
        checkStorage(context, left);
        node.resolvedType = left.resolvedType;
    }

    else if (kind == NodeKind.NEW) {
        let type = node.newType();
        resolveAsType(context, type, parentScope);

        //if (type.resolvedType.isArray()) {
        //resolveAsType(context, type.firstChild, parentScope);
        // node.resolvedType = type.resolvedType;
        //}

        if (type.resolvedType != context.errorType) {
            if (!type.resolvedType.isClass()) {
                context.log.error(type.range, StringBuilder_new()
                    .append("Cannot construct type '")
                    .append(type.resolvedType.toString())
                    .appendChar('\'')
                    .finish());
            }

            else {
                node.resolvedType = type.resolvedType;
            }
        }

        //Constructors arguments
        let child = type.nextSibling;
        let constructorNode = node.constructorNode();
        let argumentVariable = constructorNode.functionFirstArgumentIgnoringThis();
        while (child != null) {
            resolveAsExpression(context, child, parentScope);
            checkConversion(context, child, argumentVariable.symbol.resolvedType, ConversionKind.IMPLICIT);
            child = child.nextSibling;
            argumentVariable = argumentVariable.nextSibling;
        }

        // Match argument values with variables
        // while (argumentVariable != returnType && argumentValue != null) {
        //     resolveAsExpression(context, argumentValue, parentScope);
        //     checkConversion(context, argumentValue, argumentVariable.symbol.resolvedType, ConversionKind.IMPLICIT);
        //     argumentVariable = argumentVariable.nextSibling;
        //     argumentValue = argumentValue.nextSibling;
        // }
    }

    else if (kind == NodeKind.POINTER_TYPE) {
        let value = node.unaryValue();
        resolveAsType(context, value, parentScope);

        if (context.target == CompileTarget.JAVASCRIPT) {
            context.log.error(node.internalRange, "Cannot use pointers when compiling to JavaScript");
        }

        /*else if (!context.isUnsafeAllowed) {
         context.log.error(node.internalRange, "Cannot use pointers outside an 'unsafe' block");
         }*/

        else {
            let type = value.resolvedType;

            if (type != context.errorType) {
                // if ((!type.isInteger() && !type.symbol.node.isTurbo()) && type.pointerTo == null) {
                //     context.log.error(node.internalRange, StringBuilder_new()
                //         .append("Cannot create a pointer to non-integer type '")
                //         .append(type.toString())
                //         .appendChar('\'')
                //         .finish());
                // }
                //
                // else {
                node.resolvedType = type.pointerType();
                // }
            }
        }
    }

    else if (kind == NodeKind.DEREFERENCE) {
        let value = node.unaryValue();
        resolveAsExpression(context, value, parentScope);
        let type = value.resolvedType;

        if (type != context.errorType) {
            if (type.pointerTo == null) {
                context.log.error(node.internalRange, StringBuilder_new()
                    .append("Cannot dereference type '")
                    .append(type.toString())
                    .appendChar('\'')
                    .finish());
            }

            else {
                node.resolvedType = type.pointerTo;
            }
        }
    }

    else if (kind == NodeKind.ADDRESS_OF) {
        let value = node.unaryValue();
        resolveAsExpression(context, value, parentScope);
        context.log.error(node.internalRange, "The address-of operator is not supported");
    }

    else if (isUnary(kind)) {
        let value = node.unaryValue();
        resolveAsExpression(context, value, parentScope);

        // Operator "!" is hard-coded
        if (kind == NodeKind.NOT) {
            checkConversion(context, value, context.booleanType, ConversionKind.IMPLICIT);
            node.resolvedType = context.booleanType;
        }

        // Special-case integer types
        else if (value.resolvedType.isInteger()) {
            if (value.resolvedType.isUnsigned()) {
                node.flags = node.flags | NODE_FLAG_UNSIGNED_OPERATOR;
                node.resolvedType = context.uint32Type;
            } else {
                node.resolvedType = context.int32Type;
            }

            // Automatically fold constants
            if (value.kind == NodeKind.INT32) {
                let input = value.intValue;
                let output = input;
                if (kind == NodeKind.COMPLEMENT) output = ~input;
                else if (kind == NodeKind.NEGATIVE) output = -input;
                node.becomeIntegerConstant(output);
            }
        }

        // Special-case double types
        else if (value.resolvedType.isDouble()) {

            node.resolvedType = context.float64Type;

            // Automatically fold constants
            if (value.kind == NodeKind.FLOAT64) {
                let input = value.doubleValue;
                let output = input;
                if (kind == NodeKind.COMPLEMENT) output = ~input;
                else if (kind == NodeKind.NEGATIVE) output = -input;
                node.becomeDoubleConstant(output);
            }
        }

        // Special-case float types
        else if (value.resolvedType.isFloat()) {

            node.resolvedType = context.float32Type;

            // Automatically fold constants
            if (value.kind == NodeKind.FLOAT32) {
                let input = value.floatValue;
                let output = input;
                if (kind == NodeKind.COMPLEMENT) output = ~input;
                else if (kind == NodeKind.NEGATIVE) output = -input;
                node.becomeFloatConstant(output);
            }
        }

        // Support custom operators
        else if (value.resolvedType != context.errorType) {
            let name = node.internalRange.toString();
            let symbol = value.resolvedType.findMember(name, ScopeHint.NOT_BINARY);

            // Automatically call the function
            if (symbol != null) {
                node.appendChild(createMemberReference(value.remove(), symbol).withRange(node.range).withInternalRange(node.internalRange));
                node.kind = NodeKind.CALL;
                node.resolvedType = null;
                resolveAsExpression(context, node, parentScope);
            }

            else {
                context.log.error(node.internalRange, StringBuilder_new()
                    .append("Cannot use unary operator '")
                    .append(name)
                    .append("' with type '")
                    .append(value.resolvedType.toString())
                    .appendChar('\'')
                    .finish());
            }
        }
    }

    else if (isBinary(kind)) {
        let left = node.binaryLeft();
        let right = node.binaryRight();

        resolveAsExpression(context, left, parentScope);
        resolveAsExpression(context, right, parentScope);

        let leftType = left.resolvedType;
        if ((leftType.isDouble() && right.resolvedType.isFloat()) ||
            (leftType.isLong() && right.resolvedType.isInteger())) {
            right.becomeTypeOf(left, context);
        }

        let rightType = right.resolvedType;

        // Operators "&&" and "||" are hard-coded
        if (kind == NodeKind.LOGICAL_OR || kind == NodeKind.LOGICAL_AND) {
            checkConversion(context, left, context.booleanType, ConversionKind.IMPLICIT);
            checkConversion(context, right, context.booleanType, ConversionKind.IMPLICIT);
            node.resolvedType = context.booleanType;
        }

        // Special-case pointer types (it's the emitter's job to scale the integer delta by the size of the pointer target)
        else if (kind == NodeKind.ADD && leftType.pointerTo != null && rightType.isInteger()) {
            node.resolvedType = leftType;
        }

        // Special-case pointer types
        else if ((kind == NodeKind.LESS_THAN || kind == NodeKind.LESS_THAN_EQUAL ||
            kind == NodeKind.GREATER_THAN || kind == NodeKind.GREATER_THAN_EQUAL) && (
            leftType.pointerTo != null || rightType.pointerTo != null)) {
            node.resolvedType = context.booleanType;

            // Both pointer types must be exactly the same
            if (leftType != rightType) {
                context.log.error(node.internalRange, StringBuilder_new()
                    .append("Cannot compare type '")
                    .append(leftType.toString())
                    .append("' with type '")
                    .append(rightType.toString())
                    .appendChar('\'')
                    .finish());
            }
        }

        // Operators for integers are hard-coded
        else if ((leftType.isInteger() || leftType.isLong()) && kind != NodeKind.EQUAL && kind != NodeKind.NOT_EQUAL) {
            // Arithmetic operators
            if (kind == NodeKind.ADD ||
                kind == NodeKind.SUBTRACT ||
                kind == NodeKind.MULTIPLY ||
                kind == NodeKind.DIVIDE ||
                kind == NodeKind.REMAINDER ||
                kind == NodeKind.BITWISE_AND ||
                kind == NodeKind.BITWISE_OR ||
                kind == NodeKind.BITWISE_XOR ||
                kind == NodeKind.SHIFT_LEFT ||
                kind == NodeKind.SHIFT_RIGHT) {
                let isUnsigned = binaryHasUnsignedArguments(node);
                let isLong = isBinaryLong(node);
                let commonType = isUnsigned ? (isLong ? context.uint64Type : context.uint32Type) : (isLong ? context.int64Type : context.int32Type);
                if (isUnsigned) {
                    node.flags = node.flags | NODE_FLAG_UNSIGNED_OPERATOR;
                }
                checkConversion(context, left, commonType, ConversionKind.IMPLICIT);
                checkConversion(context, right, commonType, ConversionKind.IMPLICIT);
                node.resolvedType = commonType;

                // Automatically fold constants
                if (left.kind == NodeKind.INT32 && right.kind == NodeKind.INT32) {
                    let inputLeft = left.intValue;
                    let inputRight = right.intValue;
                    let output = 0;
                    if (kind == NodeKind.ADD) output = inputLeft + inputRight;
                    else if (kind == NodeKind.BITWISE_AND) output = inputLeft & inputRight;
                    else if (kind == NodeKind.BITWISE_OR) output = inputLeft | inputRight;
                    else if (kind == NodeKind.BITWISE_XOR) output = inputLeft ^ inputRight;
                    else if (kind == NodeKind.DIVIDE) output = inputLeft / inputRight;
                    else if (kind == NodeKind.MULTIPLY) output = inputLeft * inputRight;
                    else if (kind == NodeKind.REMAINDER) output = inputLeft % inputRight;
                    else if (kind == NodeKind.SHIFT_LEFT) output = inputLeft << inputRight;
                    else if (kind == NodeKind.SHIFT_RIGHT) output = isUnsigned ? ((inputLeft) >> (inputRight)) : inputLeft >> inputRight;
                    else if (kind == NodeKind.SUBTRACT) output = inputLeft - inputRight;
                    else return;
                    node.becomeIntegerConstant(output);
                }

                else {
                    simplifyBinary(node);
                }
            }

            // Comparison operators
            else if (
                kind == NodeKind.LESS_THAN ||
                kind == NodeKind.LESS_THAN_EQUAL ||
                kind == NodeKind.GREATER_THAN ||
                kind == NodeKind.GREATER_THAN_EQUAL) {
                let expectedType =
                    binaryHasUnsignedArguments(node) ? context.uint32Type :
                        context.int32Type;

                if (expectedType == context.uint32Type) {
                    node.flags = node.flags | NODE_FLAG_UNSIGNED_OPERATOR;
                }

                if (leftType != rightType) {
                    checkConversion(context, left, expectedType, ConversionKind.IMPLICIT);
                    checkConversion(context, right, expectedType, ConversionKind.IMPLICIT);
                }

                node.resolvedType = context.booleanType;
            }

            else {
                context.log.error(node.internalRange, "This operator is not currently supported");
            }
        }

        // Operators for float and double are hard-coded
        else if ((leftType.isFloat() || leftType.isDouble()) && kind != NodeKind.EQUAL && kind != NodeKind.NOT_EQUAL) {
            // Arithmetic operators
            if (kind == NodeKind.ADD ||
                kind == NodeKind.SUBTRACT ||
                kind == NodeKind.MULTIPLY ||
                kind == NodeKind.DIVIDE ||
                kind == NodeKind.REMAINDER ||
                kind == NodeKind.BITWISE_AND ||
                kind == NodeKind.BITWISE_OR ||
                kind == NodeKind.BITWISE_XOR ||
                kind == NodeKind.SHIFT_LEFT ||
                kind == NodeKind.SHIFT_RIGHT) {

                let commonType = isBinaryDouble(node) ? context.float64Type : context.float32Type;
                checkConversion(context, left, commonType, ConversionKind.IMPLICIT);
                checkConversion(context, right, commonType, ConversionKind.IMPLICIT);
                node.resolvedType = commonType;

                // Automatically fold constants
                if ((left.kind == NodeKind.FLOAT32 || left.kind == NodeKind.FLOAT64) &&
                    (right.kind == NodeKind.FLOAT32 || right.kind == NodeKind.FLOAT64)) {
                    let inputLeft = left.floatValue;
                    let inputRight = right.floatValue;
                    let output = 0;
                    if (kind == NodeKind.ADD) output = inputLeft + inputRight;
                    else if (kind == NodeKind.BITWISE_AND) output = inputLeft & inputRight;
                    else if (kind == NodeKind.BITWISE_OR) output = inputLeft | inputRight;
                    else if (kind == NodeKind.BITWISE_XOR) output = inputLeft ^ inputRight;
                    else if (kind == NodeKind.DIVIDE) output = inputLeft / inputRight;
                    else if (kind == NodeKind.MULTIPLY) output = inputLeft * inputRight;
                    else if (kind == NodeKind.REMAINDER) output = inputLeft % inputRight;
                    else if (kind == NodeKind.SHIFT_LEFT) output = inputLeft << inputRight;
                    else if (kind == NodeKind.SHIFT_RIGHT) output = inputLeft >> inputRight;
                    else if (kind == NodeKind.SUBTRACT) output = inputLeft - inputRight;
                    else return;

                    if (left.kind == NodeKind.FLOAT32) {
                        node.becomeFloatConstant(output);
                    } else {
                        node.becomeDoubleConstant(output);
                    }
                }

                else {
                    simplifyBinary(node);
                }
            }

            // Comparison operators
            else if (
                kind == NodeKind.LESS_THAN ||
                kind == NodeKind.LESS_THAN_EQUAL ||
                kind == NodeKind.GREATER_THAN ||
                kind == NodeKind.GREATER_THAN_EQUAL) {
                let expectedType = context.float32Type;

                if (leftType != rightType) {
                    checkConversion(context, left, expectedType, ConversionKind.IMPLICIT);
                    checkConversion(context, right, expectedType, ConversionKind.IMPLICIT);
                }

                node.resolvedType = context.booleanType;
            }

            else {
                context.log.error(node.internalRange, "This operator is not currently supported");
            }

        }

        // Support custom operators
        else if (leftType != context.errorType) {
            let name = node.internalRange.toString();
            let symbol = leftType.findMember(
                kind == NodeKind.NOT_EQUAL ? "==" :
                    kind == NodeKind.LESS_THAN_EQUAL ? ">" :
                        kind == NodeKind.GREATER_THAN_EQUAL ? "<" :
                            name,
                ScopeHint.NOT_UNARY);

            // Automatically call the function
            if (symbol != null) {
                left = createMemberReference(left.remove(), symbol).withRange(node.range).withInternalRange(node.internalRange);
                right.remove();

                if (kind == NodeKind.NOT_EQUAL ||
                    kind == NodeKind.LESS_THAN_EQUAL ||
                    kind == NodeKind.GREATER_THAN_EQUAL) {
                    let call = createCall(left);
                    call.appendChild(right);
                    node.kind = NodeKind.NOT;
                    node.appendChild(call.withRange(node.range).withInternalRange(node.range));
                }

                else {
                    node.appendChild(left);
                    node.appendChild(right);
                    node.kind = NodeKind.CALL;
                }

                node.resolvedType = null;
                resolveAsExpression(context, node, parentScope);
            }

            // Automatically implement equality operators
            else if (kind == NodeKind.EQUAL || kind == NodeKind.NOT_EQUAL) {
                node.resolvedType = context.booleanType;

                if (leftType != context.errorType && rightType != context.errorType && leftType != rightType && !canConvert(context, right, leftType, ConversionKind.IMPLICIT) && !canConvert(context, left, rightType, ConversionKind.IMPLICIT)) {
                    context.log.error(node.internalRange, StringBuilder_new()
                        .append("Cannot compare type '")
                        .append(leftType.toString())
                        .append("' with type '")
                        .append(rightType.toString())
                        .appendChar('\'')
                        .finish());
                }
            }

            // else if(){
            //
            // }

            else {
                context.log.error(node.internalRange, StringBuilder_new()
                    .append("Cannot use binary operator '")
                    .append(name)
                    .append("' with type '")
                    .append(leftType.toString())
                    .appendChar('\'')
                    .finish());
            }
        }
    }

    else {
        console.error(`Unexpected kind: ${NodeKind[kind]}`);
        assert(false);
    }
}
