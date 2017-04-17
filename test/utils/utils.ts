import * as fs from "fs";
import * as child from "child_process";
import * as path from "path";

//Windows spawn work around
let spawnSync:any = child.spawnSync;
if (process.platform === 'win32') {
    spawnSync = function(cmd, args) {
        return child.spawnSync('node', [cmd].concat(args));
    }
}

/**
 * Compile TurboScript to WebAssembly and instantiate synchronously
 * @param sourcePath
 * @param outputFile
 * @returns {WebAssembly.Instance}
 */
export function getWasmInstanceSync(sourcePath: string, outputFile?:string): WebAssembly.Instance {
    outputFile = outputFile || sourcePath.replace(".tbs", ".wasm");
    spawnSync(path.join(__dirname, '../../bin/tc'), [sourcePath, '--out', outputFile]);
    const data = fs.readFileSync(outputFile);
    const mod = new WebAssembly.Module(data);
    return new WebAssembly.Instance(mod);
}

/**
 * Compile TurboScript to WebAssembly and asynchronous instantiate
 * @param sourcePath
 * @param outputFile
 * @returns {Promise<Instance>}
 */
export async function getWasmInstance(sourcePath: string, outputFile?:string): Promise<WebAssembly.Instance> {
    outputFile = outputFile || sourcePath.replace(".tbs", ".wasm");
    spawnSync(path.join(__dirname, '../../bin/tc'), [sourcePath, '--out', outputFile]);
    const data = fs.readFileSync(outputFile);
    const result:WebAssembly.ResultObject = await WebAssembly.instantiate(data);
    return result.instance;
}
