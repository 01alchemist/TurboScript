import {isFunction, SYMBOL_FLAG_USED} from "./symbol";
import {NodeKind, Node} from "./node";

export function treeShakingMarkAllUsed(node: Node): void {
    var symbol = node.symbol;
    if (symbol != null && !symbol.isUsed() && isFunction(symbol.kind) && symbol.node != null) {
        symbol.flags = symbol.flags | SYMBOL_FLAG_USED;
        treeShakingMarkAllUsed(symbol.node);
        if (node == symbol.node) return;
    }

    if (node.kind == NodeKind.NEW) {
        var type = node.newType().resolvedType;
        if (type.symbol != null) {
            type.symbol.flags = type.symbol.flags | SYMBOL_FLAG_USED;
        }
    }

    var child = node.firstChild;
    while (child != null) {
        treeShakingMarkAllUsed(child);
        child = child.nextSibling;
    }
}

export function treeShakingSearchForUsed(node: Node): void {
    if (node.kind == NodeKind.FUNCTION && (node.isImport() || node.isExport() || node.isStart())) {
        treeShakingMarkAllUsed(node);
    }

    else if (node.kind == NodeKind.GLOBAL || node.kind == NodeKind.CLASS) {
        var child = node.firstChild;
        while (child != null) {
            treeShakingSearchForUsed(child);
            child = child.nextSibling;
        }

        if (node.kind == NodeKind.CLASS && node.isExport()) {
            node.symbol.flags = node.symbol.flags | SYMBOL_FLAG_USED;
        }
    }
}

export function treeShakingRemoveUnused(node: Node): void {
    if (node.kind == NodeKind.FUNCTION && !node.symbol.isUsed() && node.range.source.isLibrary) {
        node.remove();
    }

    else if (node.kind == NodeKind.GLOBAL || node.kind == NodeKind.CLASS) {
        var child = node.firstChild;
        while (child != null) {
            var next = child.nextSibling;
            treeShakingRemoveUnused(child);
            child = next;
        }

        if (node.kind == NodeKind.CLASS && !node.symbol.isUsed() && !node.isDeclare() && node.range.source.isLibrary) {
            node.remove();
        }
    }
}

export function treeShaking(node: Node): void {
    treeShakingSearchForUsed(node);
    treeShakingRemoveUnused(node);
}
