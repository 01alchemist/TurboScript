import * as fs from "fs";
import * as child from "child_process";

export function getWasmInstance(sourcePath: string, outputFile?:string): WebAssembly.Instance {
    outputFile = outputFile || sourcePath.replace(".tbs", ".wasm");
    let result = child.spawnSync('../bin/tc', [sourcePath, '--out', outputFile]);
    console.log(result);
    const data = fs.readFileSync(outputFile);
    const mod = new WebAssembly.Module(data);
    return new WebAssembly.Instance(mod);
}
