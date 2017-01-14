import {
    Symbol, SymbolKind, SYMBOL_FLAG_NATIVE_INTEGER, SYMBOL_FLAG_IS_UNSIGNED,
    SYMBOL_FLAG_NATIVE_FLOAT, SYMBOL_FLAG_IS_REFERENCE, SYMBOL_FLAG_NATIVE_LONG, SYMBOL_FLAG_NATIVE_DOUBLE
} from "./symbol";
import {CheckContext} from "./checker";
import {StringBuilder_new} from "./stringbuilder";
import {ScopeHint} from "./scope";

export enum ConversionKind {
    IMPLICIT,
    EXPLICIT,
}

export class Type {
    symbol: Symbol;
    pointerTo: Type;
    private cachedToString: string;
    private cachedPointerType: Type;

    isClass(): boolean {
        return this.symbol != null && this.symbol.kind == SymbolKind.TYPE_CLASS;
    }

    isEnum(): boolean {
        return this.symbol != null && this.symbol.kind == SymbolKind.TYPE_ENUM;
    }

    isInteger(): boolean {
        return this.symbol != null && (this.symbol.flags & SYMBOL_FLAG_NATIVE_INTEGER) != 0 || this.isEnum();
    }

    isLong(): boolean {
        return this.symbol != null && (this.symbol.flags & SYMBOL_FLAG_NATIVE_LONG) != 0;
    }

    isUnsigned(): boolean {
        return this.symbol != null && (this.symbol.flags & SYMBOL_FLAG_IS_UNSIGNED) != 0;
    }

    isFloat(): boolean {
        return this.symbol != null && (this.symbol.flags & SYMBOL_FLAG_NATIVE_FLOAT) != 0;
    }

    isDouble(): boolean {
        return this.symbol != null && (this.symbol.flags & SYMBOL_FLAG_NATIVE_DOUBLE) != 0;
    }

    isReference(): boolean {
        return this.pointerTo != null || this.symbol != null && (this.symbol.flags & SYMBOL_FLAG_IS_REFERENCE) != 0;
    }

    underlyingType(context: CheckContext): Type {
        return this.isEnum() ? context.int32Type : this.pointerTo != null ? context.uint32Type : this;
    }

    integerBitCount(context: CheckContext): int32 {
        return this.symbol != null ? this.symbol.byteSize * 8 : 0;
    }

    integerBitMask(context: CheckContext): uint32 {
        return ~0 >> (32 - this.integerBitCount(context));
    }

    allocationSizeOf(context: CheckContext): int32 {
        return this.symbol == null ? context.pointerByteSize : this.symbol.byteSize;
    }

    allocationAlignmentOf(context: CheckContext): int32 {
        return this.allocationSizeOf(context); // This is true right now
    }

    variableSizeOf(context: CheckContext): int32 {
        return this.isReference() ? context.pointerByteSize : this.symbol.byteSize;
    }

    variableAlignmentOf(context: CheckContext): int32 {
        return this.variableSizeOf(context); // This is true right now
    }

    pointerType(): Type {
        var type = this.cachedPointerType;
        if (type == null) {
            type = new Type();
            type.pointerTo = this;
            this.cachedPointerType = type;
        }
        return type;
    }

    toString(): string {
        if (this.cachedToString == null) {
            this.cachedToString =
                this.pointerTo != null ? StringBuilder_new().appendChar('*').append(this.pointerTo.toString()).finish() :
                    this.symbol.name;
        }
        return this.cachedToString;
    }

    findMember(name: string, hint: ScopeHint): Symbol {
        var symbol = this.symbol;
        return symbol != null && symbol.scope != null ? symbol.scope.findLocal(name, hint) : null;
    }

    hasInstanceMembers(): boolean {
        var symbol = this.symbol;
        return symbol != null && (symbol.kind == SymbolKind.TYPE_CLASS || symbol.kind == SymbolKind.TYPE_NATIVE);
    }

    // become(type: Type): void {
    //     this.symbol.flags = type.symbol.flags;
    //     this.symbol.name = type.symbol.name;
    //     this.symbol.byteSize = type.symbol.byteSize;
    //     this.symbol.kind = type.symbol.kind;
    //     this.symbol.maxAlignment = type.symbol.maxAlignment;
    //     this.symbol.node = type.symbol.node;
    // }
}
