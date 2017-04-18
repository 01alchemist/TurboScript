#! /usr/bin/env node

var debug = true;
var stdlib = {};
global["stdlib"] = stdlib;
stdlib["assert"] = function (truth) {
    if (!truth) {
        if(debug){
            debugger;
        }
        console.error(new Error('Assertion failed'));
        process.exit(1);
    }
};
global["assert"] = stdlib["assert"];
stdlib["Profiler_begin"] = function (name: string) {
    console.time(name)
};
stdlib["Profiler_end"] = function (name: string) {
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

var fs = require('fs');
var path = require('path');
var SystemJS = require('systemjs');
global["System"] = SystemJS;
SystemJS.defaultJSExtensions = true;

if(!process.env.TURBO_PATH){
    process.env.TURBO_PATH = path.resolve(__dirname, "../");
}

global["TURBO_PATH"] = process.env.TURBO_PATH;

console.log("TURBO_PATH:"+global["TURBO_PATH"]);

//Import compiler
require("./turbo.js");

SystemJS.import("main").then(function (mod) {
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

    function main() {

        for (var i = 2; i < process.argv.length; i++) {
            turboMain.addArgument(process.argv[i]);
        }

        process.exit(turboMain.entry());
    }

    main();
});