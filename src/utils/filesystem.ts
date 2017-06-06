import {isBrowser, isNode} from "./env";

/**
 * Created by n.vinayakan on 06.06.17.
 */
let fs = null;
if (isBrowser) {
    console.log("----> Browser environment");
    fs = {
        fileMap: new Map(),
        readFileSync: (path, options) => {
            return fs.fileMap.get(path);
        },
        writeFileSync: (path, data, options) => {
            return fs.fileMap.set(path, data);
        }
    };
    window["Buffer"] = class NodeBuffer {
        constructor(public array) {
        }
    }
} else if (isNode) {
    console.log("----> NodeJS environment");
    fs = require("fs");
} else {
    console.error("----> Unknown host environment!!!. Where are we?");
}

export class FileSystem {

    static readTextFile(path) {
        try {
            return fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
        } catch (e) {
            return null;
        }
    }

    static writeTextFile(path, contents) {
        try {
            fs.writeFileSync(path, contents);
            return true;
        } catch (e) {
            return false;
        }
    }


    static readBinaryFile(path) {
        try {
            return fs.readFileSync(path);
        } catch (e) {
            return null;
        }
    }

    static writeBinaryFile(path, contents) {
        try {
            fs.writeFileSync(path, new Buffer(contents.array.subarray(0, contents.length)));
            return true;
        } catch (e) {
            return false;
        }
    }
}