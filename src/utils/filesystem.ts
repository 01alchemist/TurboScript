import {isBrowser, isNode, isWorker} from "./env";
import {Terminal} from "./terminal";

/**
 * Created by n.vinayakan on 06.06.17.
 */
if (typeof Map === "undefined") {
    var Map = function () {
        this.get = (key) => { return this[key]; };
        this.set = (key, value) => { return this[key] = value; };
    };
}

let fs = null;
let virtualFileSystem = {
    fileMap: new Map(),
    readFileSync: (path, options?) => {
        return virtualFileSystem.fileMap.get(path);
    },
    writeFileSync: (path, data, options?) => {
        return virtualFileSystem.fileMap.set(path, data);
    }
};
if (isWorker) {
    Terminal.write("----> Worker environment");
    fs = virtualFileSystem;
    window["Buffer"] = Uint8Array;
}
else if (isBrowser) {
    Terminal.write("----> Browser environment");
    fs = virtualFileSystem;
    window["Buffer"] = Uint8Array;
} else if (isNode) {
    Terminal.write("----> NodeJS environment\n");
    fs = require("fs");
} else {
    Terminal.error("----> Unknown host environment!!!. Where are we?");
}

export class FileSystem {

    static readTextFile(path, virtual = false) {
        if (virtual) {
            let virtualFile = virtualFileSystem.readFileSync(path, 'utf8');
            return virtualFile === undefined ? null : virtualFile.replace(/\r\n/g, '\n');
        }
        try {
            return fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
        } catch (e) {
            let virtualFile = virtualFileSystem.readFileSync(path, 'utf8');
            return virtualFile === undefined ? null : virtualFile.replace(/\r\n/g, '\n');
        }
    }

    static writeTextFile(path, contents, virtual = false) {
        try {
            if (virtual) {
                virtualFileSystem.writeFileSync(path, contents);
            } else {
                fs.writeFileSync(path, contents);
            }
            return true;
        } catch (e) {
            Terminal.error(e.message);
            return false;
        }
    }


    static readBinaryFile(path, virtual = false) {
        if (virtual) {
            let virtualFile = virtualFileSystem.readFileSync(path);
            return virtualFile === undefined ? null : virtualFile;
        }
        try {
            return fs.readFileSync(path);
        } catch (e) {
            Terminal.warn(`Requested file ${path} not found, searching in virtual file system`);
            let virtualFile = virtualFileSystem.readFileSync(path);
            return virtualFile === undefined ? null : virtualFile;
        }
    }

    static writeBinaryFile(path, contents, virtual = false) {
        let uint8: boolean = contents instanceof Uint8Array;
        try {
            if (virtual) {
                virtualFileSystem.writeFileSync(path, new Buffer(uint8 ? contents : contents.array.subarray(0, contents.length)));
            } else {
                fs.writeFileSync(path, new Buffer(uint8 ? contents : contents.array.subarray(0, contents.length)));
            }
            return true;
        } catch (e) {
            Terminal.error(e.message);
            return false;
        }
    }

    static getBasePath(path: string): string {
        let pathSeparator = path.indexOf("/") > -1 ? "/" : (path.indexOf("\\") > -1 ? "\\" : "/");
        return path.substring(0, path.lastIndexOf(pathSeparator));
    }

    static getFileName(path: string): string {
        let pathSeparator = path.indexOf("/") > -1 ? "/" : (path.indexOf("\\") > -1 ? "\\" : "/");
        return path.substring(path.lastIndexOf(pathSeparator) + 1, path.length);
    }
}