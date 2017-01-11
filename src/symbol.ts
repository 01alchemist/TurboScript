import {Type} from "./type";
import {Node, NodeKind} from "./node";
import {CheckContext} from "./checker";
import {Scope} from "./scope";
import {Range} from "./log";
import {alignToNextMultipleOf} from "./imports";

export enum SymbolKind {
    TYPE_MODULE,
    TYPE_INTERFACE,
    TYPE_CLASS,
    TYPE_ENUM,
    TYPE_GLOBAL,
    TYPE_NATIVE,

    FUNCTION_INSTANCE,
    FUNCTION_GLOBAL,

    VARIABLE_ARGUMENT,
    VARIABLE_CONSTANT,
    VARIABLE_GLOBAL,
    VARIABLE_INSTANCE,
    VARIABLE_LOCAL,
}

export function isModule(kind: SymbolKind): boolean {
    return kind == SymbolKind.TYPE_MODULE;
}
export function isType(kind: SymbolKind): boolean {
    return kind >= SymbolKind.TYPE_CLASS && kind <= SymbolKind.TYPE_NATIVE;
}

export function isFunction(kind: SymbolKind): boolean {
    return kind >= SymbolKind.FUNCTION_INSTANCE && kind <= SymbolKind.FUNCTION_GLOBAL;
}

export function isVariable(kind: SymbolKind): boolean {
    return kind >= SymbolKind.VARIABLE_ARGUMENT && kind <= SymbolKind.VARIABLE_LOCAL;
}

export enum SymbolState {
    UNINITIALIZED,
    INITIALIZING,
    INITIALIZED,
}

export const SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL = 1 << 0;
export const SYMBOL_FLAG_IS_BINARY_OPERATOR = 1 << 1;
export const SYMBOL_FLAG_IS_REFERENCE = 1 << 2;
export const SYMBOL_FLAG_IS_UNARY_OPERATOR = 1 << 3;
export const SYMBOL_FLAG_IS_UNSIGNED = 1 << 4;
export const SYMBOL_FLAG_NATIVE_INTEGER = 1 << 5;
export const SYMBOL_FLAG_NATIVE_FLOAT = 1 << 6;
export const SYMBOL_FLAG_USED = 1 << 7;

export class Symbol {
    kind: SymbolKind;
    name: string;
    node: Node;
    range: Range;
    scope: Scope;
    resolvedType: Type;
    next: Symbol;
    state: SymbolState = SymbolState.UNINITIALIZED;
    flags: int32;
    byteSize: int32;
    maxAlignment: int32;
    rename: string;

    // The "offset" variable is used to store kind-specific information
    //
    //   TYPE_CLASS: N/A
    //   TYPE_ENUM: N/A
    //   TYPE_GLOBAL: N/A
    //   TYPE_NATIVE: N/A
    //
    //   FUNCTION_INSTANCE: N/A
    //   FUNCTION_GLOBAL: N/A
    //
    //   VARIABLE_ARGUMENT: Argument index
    //   VARIABLE_CONSTANT: Integer constant value
    //   VARIABLE_GLOBAL: Memory address relative to start address
    //   VARIABLE_INSTANCE: Instance offset
    //   VARIABLE_LOCAL: N/A
    //
    offset: int32;

    isEnumValue(): boolean {
        return this.node.parent.kind == NodeKind.ENUM;
    }

    isUnsafe(): boolean {
        return this.node != null && this.node.isUnsafe();
    }

    isGetter(): boolean {
        return this.node.isGet();
    }

    isSetter(): boolean {
        return this.node.isSet();
    }

    isBinaryOperator(): boolean {
        return (this.flags & SYMBOL_FLAG_IS_BINARY_OPERATOR) != 0;
    }

    isUnaryOperator(): boolean {
        return (this.flags & SYMBOL_FLAG_IS_UNARY_OPERATOR) != 0;
    }

    shouldConvertInstanceToGlobal(): boolean {
        return (this.flags & SYMBOL_FLAG_CONVERT_INSTANCE_TO_GLOBAL) != 0;
    }

    isUsed(): boolean {
        return (this.flags & SYMBOL_FLAG_USED) != 0;
    }

    parent(): Symbol {
        var parent = this.node.parent;
        return parent.kind == NodeKind.CLASS ? parent.symbol : null;
    }

    resolvedTypeUnderlyingIfEnumValue(context: CheckContext): Type {
        return this.isEnumValue() ? this.resolvedType.underlyingType(context) : this.resolvedType;
    }

    determineClassLayout(context: CheckContext): void {
        assert(this.kind == SymbolKind.TYPE_CLASS);

        // Only determine class layout once
        if (this.byteSize != 0) {
            return;
        }

        var offset = 0;
        var child = this.node.firstChild;
        var maxAlignment = 1;

        while (child != null) {
            if (child.kind == NodeKind.VARIABLE) {
                var type = child.symbol.resolvedType;

                // Ignore invalid members
                if (type != context.errorType) {
                    var alignmentOf = type.variableAlignmentOf(context);

                    // Align the member to the next available slot
                    offset = alignToNextMultipleOf(offset, alignmentOf);
                    if (alignmentOf > maxAlignment) maxAlignment = alignmentOf;

                    // Allocate the member by extending the object
                    child.symbol.offset = offset;
                    offset = offset + type.variableSizeOf(context);
                }
            }

            child = child.nextSibling;
        }

        // All objects must have a non-zero size
        if (offset == 0) {
            offset = 1;
        }

        // The object size must be a multiple of the maximum alignment for arrays to work correctly
        offset = alignToNextMultipleOf(offset, maxAlignment);

        this.byteSize = offset;
        this.maxAlignment = maxAlignment;
    }
}
