import * as fs from "fs";
import * as child from "child_process";

// An empty UintArray to return with errors
var emptyU8 = new Uint8Array(0);

// An emptyStatsto return with errors
var emptyStats: fs.Stats = {
    isFile() { return false; },
    isDirectory() { return false; },
    isBlockDevice() { return false; },
    isCharacterDevice() { return false; },
    isSymbolicLink() { return false; },
    isFIFO() { return false; },
    isSocket() { return false; },
    dev: 0,
    ino: 0,
    mode: 0,
    nlink: 0,
    uid: 0,
    gid: 0,
    rdev: 0,
    size: 0,
    blksize: 0,
    blocks: 0,
    atime: new Date(),
    mtime: new Date(),
    ctime: new Date(),
    birthtime: new Date()
};

/**
 * Read the file and return a Uint8Array
 *
 * @param filePath is the path to the input file
 * @return on success {err: undefined, data: Uint8Array}
 *         on error {err: string, data: Unint8Array(0)}
 */
export function readFileAsync(filePath: string):
        Promise<{err?: string, data: Uint8Array}> {
    try {
        return new Promise<{err?: string, data: Uint8Array}>((resolve) => {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    return resolve({err: `readFileAsync: err=${err}`, data: emptyU8});
                } else {
                    return resolve({data: new Uint8Array(data)});
                }
            });
        });
    } catch (ex) {
        return Promise.resolve({err: `readFileAsync: exception=${ex}`, data: emptyU8});
    }
}

/**
 * Use `tc` to compile an input file to the output file
 *
 * @param inputPath is the input file
 * @param outputPath is the output file
 * @return on success {err: undefined}
 *         on error {err: string}
 */
export function tcCompile(inputPath: string, outputPath:string):
        Promise<{err?: string}> {
    try {
        let tc = child.spawn("./bin/tc",
            [ "--out", outputPath, inputPath ], { shell: true });
        return new Promise<{err?: string}>((resolve) => {
            tc.on("close", (code) => {
                if (code !== 0) {
                    resolve({err: `tcCompile: code=${code}`});
                } else {
                    resolve({}); // Success
                }
            });
        });
    } catch (err) {
        return Promise.resolve({err: `tcCompile: exception=${err}`});
    }
}

/**
 * Stat a file
 *
 * @param path to file
 * @return on success {err: undefined, stats: fs.Stats}
 *         on error {err: string, stats: emptyStats}
 */
export function statAsync(path: string):
        Promise<{err?: string, stats: fs.Stats}> {
    try {
        return new Promise<{err?: string, stats: fs.Stats}>((resolve) => {
            fs.stat(path, (statErr: NodeJS.ErrnoException, data: fs.Stats) => {
                if (statErr) {
                    resolve({err: `statAsync: err=${statErr} file=${path}`,
                             stats: emptyStats});
                }
                resolve({stats: data});
            });
        });
    } catch (ex) {
        return Promise.resolve({err: `statAsync: exception=${ex} file=${path}`,
                                stats: emptyStats});
    }
}

/**
 * Use unlink a file
 *
 * @param path to file
 * @return: undefined on success else the error string
 */
export function unlinkAsync(path: string): Promise<{err?: string}> {
    try {
        return new Promise<{err?: string}>((resolve) => {
            fs.unlink(path, (unlinkErr) => {
                if (unlinkErr) {
                    resolve({err: `unlinkAsync: err=${unlinkErr}`});
                }
                resolve({});
            });
        });
    } catch (ex) {
        return Promise.resolve({err: `unlinkAsync: err=${ex}`});
    }
}
