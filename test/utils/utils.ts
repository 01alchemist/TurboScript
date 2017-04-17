import * as fs from "fs";
import * as child from "child_process";
import * as path from "path";

//Windows spawn work around
let spawnSync:any = child.spawnSync;
if (process.platform === 'win32') {
    spawnSync = function(cmd, args) {
        return child.spawnSync('cmd', ['/s', '/c', cmd].concat(args));
    }
}

export function getWasmInstance(sourcePath: string, outputFile?:string): WebAssembly.Instance {
    outputFile = outputFile || sourcePath.replace(".tbs", ".wasm");
    let result = spawnSync(path.join(__dirname, '../../bin/tc'), [sourcePath, '--out', outputFile]);
    const data = fs.readFileSync(outputFile);
    const mod = new WebAssembly.Module(data);
    return new WebAssembly.Instance(mod);
}
