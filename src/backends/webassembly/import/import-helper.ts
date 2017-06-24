import {WasmBinaryImport} from "../../../importer/kinds/wasm-binary-import";
/**
 * Created by n.vinayakan on 23.06.17.
 */

export function isBinaryImport(name: string): boolean {

}
export function getBinaryImport(name: string):WasmBinaryImport {
    return new WasmBinaryImport();
}
