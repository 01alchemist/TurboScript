const original_spawn = require('child_process').spawn;
const path = require('path');
const fs = require('fs');

//Windows spawn work around
let spawn = original_spawn;
if (process.platform === 'win32') {
    spawn = function(cmd, args) {
        return original_spawn('cmd', ['/s', '/c', cmd].concat(args), {
            windowsVerbatimArguments: true
        });
    }
}

const tests = [
    {file: "addTwo.tbs", success: false},
    {file: "array.tbs", success: false},
    {file: "binary.tbs", success: false},
    {file: "block.tbs", success: false},
];

let total = tests.length;
let asmjsFinishedCount = 0;
let wasmFinishedCount = 0;

const binDir = path.join(__dirname, 'bin');

if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir);
}

/**
 * ##################################
 * #      Compile ASM.JS Tests      #
 * ##################################
 **/
console.log("Compiling ASM.JS tests...");
tests.forEach((entry) => {
    let hasError = false;
    const tc = spawn('tc', [path.join(__dirname, entry.file), '--asmjs', '--out', `./bin/${entry.file.replace("tbs", "asm.js")}`]);

    // tc.stdout.on('data', (data) => {
    //     console.log(`${data.toString().replace("\n","")}`);
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
    const tc = spawn('tc', [path.join(__dirname, entry.file), '--wasm', '--out',
        path.join(__dirname, 'bin', entry.file.replace("tbs", "wasm"))]);

    // tc.stdout.on('data', (data) => {
    //     console.log(`${data.toString().replace("\n","")}`);
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
