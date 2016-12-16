#!/usr/bin/env node

global["assert"] = require('assert');
global["Profiler_begin"] = function(name:string) {console.time(name)};
global["Profiler_end"] = function(name:string) {console.timeEnd(name)};
global["StringBuilder_append"] = function(a, b) { return a + b; };
global["StringBuilder_appendChar"] = function(a, b) { return a + String.fromCharCode(b); };
global["Uint8Array_new"] = function(x) { return new Uint8Array(x); };
global["Terminal_setColor"] = Terminal_setColor;
global["Terminal_write"] = Terminal_write;
global["IO_readTextFile"] = IO_readTextFile;
global["IO_writeTextFile"] = IO_writeTextFile;
global["IO_writeBinaryFile"] = IO_writeBinaryFile;

Math.imul = Math.imul || function(a, b) {
    return (a * (b >>> 16) << 16) + a * (b & 65535) | 0;
};
Math.log2 = Math.log2 || function (x) {
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

import {turbo, Color} from "../src/main";

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
        fs.writeFileSync(path, new Buffer(contents._data.subarray(0, contents._length)));
        return true;
    } catch (e) {
        return false;
    }
}

function main(){

    for (var i = 2; i < process.argv.length; i++) {
        turbo.main_addArgument(process.argv[i]);
    }

    process.exit(turbo.main_entry());
}

main();
