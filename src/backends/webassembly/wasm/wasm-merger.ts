import { WasmBinary } from "./wasm-binary";
import { WasmSection } from "../core/wasm-section";
import { DataSection } from "./sections/data-section";
import { CodeSection } from "./sections/code-section";
import { ElementSection } from "./sections/element-section";
import { StartSection } from "./sections/start-section";
import { ExportSection } from "./sections/export-section";
import { SignatureSection } from "./sections/signature-section";
import { ImportSection } from "./sections/import-section";
import { FunctionSection } from "./sections/function-section";
import { TableSection } from "./sections/table-section";
import { MemorySection } from "./sections/memory-section";
import { GlobalSection } from "./sections/global-section";
import { NameSection } from "./sections/name-section";
import { WasmImport } from "../core/wasm-import";
import { WasmFunction } from "../core/wasm-function";
import { Terminal } from "../../../utils/terminal";
import { WasmExport } from "../core/wasm-export";
/**
 * Created by n.vinayakan on 29.06.17.
 */
export class WasmMerger {

    static merge(inputs: WasmBinary[], output: WasmBinary): WasmBinary {

        if (inputs.length > 1) {
            let error = "Not supported! Maximum wasm binaries supported in WasmMerger is 1.";
            Terminal.error(error);
            throw error;
        }

        // let output: WasmBinary = new WasmBinary();
        // output.initializeSections();
        let signatureSection: SignatureSection;
        let importSection: ImportSection;
        let exportSection: ExportSection;
        let outputFunctionSection: FunctionSection;
        let functionSection: FunctionSection;
        let codeSection: CodeSection;

        inputs.forEach(binary => {
            binary.sections.forEach(importedSection => {
                switch (importedSection.id) {
                    case WasmSection.Signature: {
                        signatureSection = importedSection as SignatureSection;
                        let section: SignatureSection = output.getSection(WasmSection.Signature) as SignatureSection;
                        section.signatures = section.signatures.concat(signatureSection.signatures);
                        break;
                    }
                    case WasmSection.Import: {
                        importSection = importedSection as ImportSection;
                        let section: ImportSection = output.getSection(WasmSection.Import) as ImportSection;
                        section.imports = section.imports.concat(importSection.imports);
                        break;
                    }
                    case WasmSection.Function: {
                        functionSection = importedSection as FunctionSection;
                        outputFunctionSection = output.getSection(WasmSection.Function) as FunctionSection;
                        outputFunctionSection.functions = outputFunctionSection.functions.concat(functionSection.functions);
                        break;
                    }
                    case WasmSection.Table: {
                        let section: TableSection = output.getSection(importedSection.id) as TableSection;
                        section.tables = section.tables.concat((importedSection as TableSection).tables);
                        break;
                    }
                    case WasmSection.Memory: {
                        let section: MemorySection = output.getSection(importedSection.id) as MemorySection;
                        section.memory = section.memory.concat((importedSection as MemorySection).memory);
                        break;
                    }
                    case WasmSection.Global: {
                        let section: GlobalSection = output.getSection(importedSection.id) as GlobalSection;
                        section.globals = section.globals.concat((importedSection as GlobalSection).globals);
                        break;
                    }
                    case WasmSection.Export: {
                        exportSection = importedSection as ExportSection;
                        let section: ExportSection = output.getSection(importedSection.id) as ExportSection;
                        concatUniqueExports(section, exportSection);
                        // section.exports = section.exports.concat(exportSection.exports);
                        break;
                    }
                    case WasmSection.Start: {
                        let section: StartSection = output.getSection(importedSection.id) as StartSection;
                        if (section.startFunctionIndex === -1) {
                            section.startFunctionIndex = (importedSection as StartSection).startFunctionIndex;
                        }
                        break;
                    }
                    case WasmSection.Element: {
                        let section: ElementSection = output.getSection(importedSection.id) as ElementSection;
                        section.elements = section.elements.concat((importedSection as ElementSection).elements);
                        break;
                    }
                    case WasmSection.Code: {
                        codeSection = importedSection as CodeSection;
                        let section: CodeSection = output.getSection(WasmSection.Code) as CodeSection;
                        // section.functions = section.functions.concat(codeSection.functions);
                        section.functions = outputFunctionSection.functions;
                        break;
                    }
                    case WasmSection.Data: {
                        let section: DataSection = output.getSection(importedSection.id) as DataSection;
                        section.data = section.data.concat((importedSection as DataSection).data);
                        break;
                    }
                    case WasmSection.Custom: {
                        console.log("Name section found!");
                        // let section: NameSection = output.getSection(importedSection.id) as NameSection;
                        // section.funcNameMap
                        // section.funcLocalNameMap

                        //section.names = section.names.concat((importedSection as NameSection).names);
                        updateFunctionNames(outputFunctionSection, importedSection as NameSection);
                        break;
                    }
                }
            });
        });

        return output;
    }



    // static mergeSignatures(section1, section2): SignatureSection {
    //
    // }

}

function concatUniqueExports(outputExportSection:ExportSection, inputExportSection:ExportSection) {
    inputExportSection.exports.forEach(exportIn => {
        let duplicate = outputExportSection.exports.find(exportOut => exportIn.name === exportOut.name);
        if(duplicate === undefined) {
            outputExportSection.exports.push(exportIn);
        }
    });
}

function updateFunctionNames(functionSection: FunctionSection, nameSection: NameSection): void {
    let funcNameMap = nameSection.funcNameMap;
    functionSection.functions.forEach((func, index) => {
        func.name = funcNameMap.get(index);
    });
    console.log("Function names updated");
    console.log(functionSection.functions);
}