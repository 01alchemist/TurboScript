import * as fs from "fs";
import * as child from "child_process";


//Windows spawn work around
let spawnSync = child.spawnSync;
if (process.platform === 'win32') {
    spawnSync = function(cmd, args) {
        return child.spawnSync('cmd', ['/s', '/c', cmd].concat(args));
    }
}

export function getTurboInstance(sourcePath: string): WebAssembly.Instance {
    const outputFile = sourcePath.replace(".tbs", ".wasm");
    let result = child.spawnSync('../bin/tc', [sourcePath, '--out', outputFile], {stdio: "inherit"});
    console.log(result.error);
    const data = fs.readFileSync(outputFile);
    const mod = new WebAssembly.Module(data);
    return new WebAssembly.Instance(mod);
}