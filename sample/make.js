// combine kernel modules and compile 
"use strict";
let fs = require("fs");
let path = require("path");
let childProcess = require("child_process");
let System = require('systemjs');
System.defaultJSExtensions = true;

// let modules = [ //     "./src/turbo/common.tts", //     "./src/tracer/axis.tts", //     "./src/turbo/color.tts", //     "./src/turbo/vector.tts", //     "./src/utils/util.tts", //     "./src/turbo/box.tts", //     "./src/turbo/matrix.tts", //     "./src/turbo/image.tts", //     "./src/turbo/texture.tts", //     "./src/turbo/material.tts", //     "./src/tracer/ray.tts", // //     "./src/turbo/shapes/shape.tts", //     "./src/turbo/shapes/cube.tts", //     "./src/turbo/shapes/sphere.tts", //     "./src/turbo/shapes/triangle.tts", //     "./src/turbo/shapes/mesh.tts", // //     "./src/turbo/tree.tts", //     "./src/tracer/hit.tts", //     "./src/turbo/camera.tts", //     "./src/turbo/scene.tts", //     "./src/three/buffer_geometry.tts", //     "./src/tracer/sampler.tts", // //     "./src/tracer/vector3.tts", //     "./src/tracer/color3.tts", //     "./src/tracer/matrix4.tts", // // ];
let modules = [
    "./src/turbo/vector3.tbs",
    "./src/turbo/color.tbs",
    "./src/turbo/image.tbs"
];
let buildCommand = [];
modules.forEach((file) => {
    buildCommand.push(path.resolve(__dirname, file));
});

let TURBO_PATH = path.resolve(__dirname, "../");
process.env.TURBO_PATH = TURBO_PATH;

// let outFile = path.resolve(__dirname, "xray-kernel-turbo.asm.js");
let outFile = path.resolve(__dirname, "xray-kernel-turbo");

// buildCommand.push("--out");
// buildCommand.push(outFile);

// let compilerShell = TURBO_PATH + "/lib/tc.sh";

// let code = shell.exec(`${compilerShell} ${buildCommand}`).code;

// console.log(`child process exited with code ${code}`);

function copyFile(source, target, cb) {
    let cbCalled = false;
    console.log('#########################');
    console.log(target);
    console.log('#########################');
    let rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        console.error(err);
        done(err);
    });
    let wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        console.error(err);
        done(err);
    });
    wr.on("close", function (ex) {
        done();
    });
    rd.pipe(wr);
    function done(err) {
        if (!cbCalled && cb) {
            cb(err);
            cbCalled = true;
        }
    }
}

var debug = true;
var stdlib = {};
global["outFile"] = outFile;
global["buildCommand"] = buildCommand;
global["System"] = System;
global["stdlib"] = stdlib;
stdlib["assert"] = function (truth) {
    if (!truth) {
        if (debug) {
            debugger;
        }
        console.error(new Error('Assertion failed'));
        process.exit(1);
    }
};
global["assert"] = stdlib["assert"];
stdlib["Profiler_begin"] = function (name) {
    console.time(name)
};
stdlib["Profiler_end"] = function (name) {
    console.timeEnd(name)
};
stdlib["StringBuilder_append"] = function (a, b) {
    return a + b;
};
stdlib["StringBuilder_appendChar"] = function (a, b) {
    return a + String.fromCharCode(b);
};
stdlib["Uint8Array_new"] = function (x) {
    return new Uint8Array(x);
};

Math["imul"] = Math["imul"] || function (a, b) {
        return (a * (b >>> 16) << 16) + a * (b & 65535) | 0;
    };
Math["log2"] = Math["log2"] || function (x) {
        if (x <= 0)
            throw "Error: log2: " + x;
        let i = 0;
        while (x > 1) {
            i++;
            x >>= 1;
        }
        return i;
    };


global["TURBO_PATH"] = process.env.TURBO_PATH;

console.log("TURBO_PATH:" + global["TURBO_PATH"])

//Import compiler
require(path.resolve(process.env.TURBO_PATH, "bin/turbo.js"));

System.import("main").then(function (mod) {
    var Color = mod.Color;
    var turboMain = mod.main;

    stdlib["Terminal_setColor"] = Terminal_setColor;
    stdlib["Terminal_write"] = Terminal_write;
    stdlib["IO_readTextFile"] = IO_readTextFile;
    stdlib["IO_writeTextFile"] = IO_writeTextFile;
    stdlib["IO_writeBinaryFile"] = IO_writeBinaryFile;

    function Terminal_setColor(color) {
        if (process.stdout.isTTY) {
            var code =
                color === Color.BOLD ? 1 :
                    color === Color.RED ? 91 :
                        color === Color.GREEN ? 92 :
                            color === Color.MAGENTA ? 95 :
                                0;
            process.stdout.write('\x1B[0;' + code + 'm');
        }
    }

    function Terminal_write(text) {
        process.stdout.write(text);
    }

    function IO_readTextFile(path) {
        try {
            return fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
        } catch (e) {
            return null;
        }
    }

    function IO_writeTextFile(path, contents) {
        try {
            fs.writeFileSync(path, contents);
            return true;
        } catch (e) {
            return false;
        }
    }

    function IO_writeBinaryFile(path, contents) {
        try {
            fs.writeFileSync(path, new Buffer(contents.array.subarray(0, contents.length)));
            return true;
        } catch (e) {
            return false;
        }
    }

    function main(args) {


        args = buildCommand.concat(args);

        for (var i = 0; i < args.length; i++) {
            turboMain.addArgument(args[i]);
        }
        return turboMain.entry();
    }

    console.log("=====================");
    console.log(" Compiling to wasm");
    console.log("=====================");
    console.log(`wasm compilation ${main(["--wasm", "--out", outFile + ".wasm"]) == 0 ? "success" : "failed"} \n`);
    turboMain.reset();

    childProcess.exec(`wasm2wast ${outFile + ".wasm"} -o ${outFile + ".wast"} -v`).code;

    console.log("=====================");
    console.log(" Compiling to asm.js");
    console.log("=====================");
    console.log(`asm.js compilation ${main(["--asmjs", "--out", outFile + ".asm.js"]) == 0 ? "success" : "failed"}`);

    process.exit();
});