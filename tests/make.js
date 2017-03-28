const spawn = require('child_process').spawn;
const fs = require('fs');

const tests = [
    {file: "addTwo.tbs", success: false},
    {file: "array.tbs", success: false},
    {file: "binary.tbs", success: false},
    {file: "block.tbs", success: false},
];

let total = tests.length;
let asmjsFinishedCount = 0;
let wasmFinishedCount = 0;

const dir = './bin/';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

/**
 * ##################################
 * #      Compile ASM.JS Tests      #
 * ##################################
 **/
console.log("Compiling ASM.JS tests...");
tests.forEach((entry) => {
    let hasError = false;
    const tc = spawn('tc', [entry.file, '--asmjs', '--out', `./bin/${entry.file.replace("tbs", "asm.js")}`]);

    // tc.stdout.on('data', (data) => {
    //     console.log(`${data}`);
    // });

    tc.stderr.on('data', (data) => {
        hasError = true;
        console.log(`${data}`);
    });

    tc.on('close', (code) => {
        entry.success = code == 0;
        if (entry.success && !hasError) {
            if (total == ++asmjsFinishedCount) {
                console.log(`All tests compiled to ASM.JS successfully`);
            }
        } else {
            console.log(`${entry.file} failed to compile`);
        }
    });

});

/**
 * ##################################
 * #       Compile WASM Tests       #
 * ##################################
 **/
console.log("Compiling WASM tests...");
tests.forEach((entry) => {
    let hasError = false;
    const tc = spawn('tc', [entry.file, '--wasm', '--out', `./bin/${entry.file.replace("tbs", "wasm")}`]);

    // tc.stdout.on('data', (data) => {
    //     console.log(`${data}`);
    // });

    tc.stderr.on('data', (data) => {
        hasError = true;
        console.log(`${data}`);
    });

    tc.on('close', (code) => {
        entry.success = code == 0;
        if (entry.success && !hasError) {
            if (total == ++wasmFinishedCount) {
                console.log(`All tests compiled to WASM successfully`);
            }
        } else {
            console.log(`${entry.file} failed to compile`);
        }
    });

});
