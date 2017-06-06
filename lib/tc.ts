#! /usr/bin/env node

const debug = true;

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

const fs = require('fs');
const path = require('path');

if (!process.env.TURBO_PATH) {
    process.env.TURBO_PATH = path.resolve(__dirname, "../");
}

global["TURBO_PATH"] = process.env.TURBO_PATH;

console.log("TURBO_PATH:" + global["TURBO_PATH"]);

//Import compiler
const turbo = require("./turbo.js");

const Color = turbo.Color;
const turboMain = turbo.main;

function main() {

    for (var i = 2; i < process.argv.length; i++) {
        turboMain.addArgument(process.argv[i]);
    }

    process.exit(turboMain.entry());
}

main();