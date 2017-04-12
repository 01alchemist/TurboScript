/**
 * Test Utils
 */
import {
    AsyncTest,
    Expect,
    SetupFixture,
    TeardownFixture,
    TestFixture,
} from "alsatian";

import {
    readFileAsync,
    tcCompile,
    statAsync,
    unlinkAsync,
} from "./utils";

import * as debugModule from "debug";
const debug = debugModule("utils.spec");

@TestFixture("utils tests")
export class UtilsTests {
    @SetupFixture
    public setupFixture() {
        debug("setupFixture:#");
    }

    @TeardownFixture
    public teardownFixture() {
        debug("teardownFixture:#");
    }

    @AsyncTest("Test readFileAsync success")
    public async testReadFileAsync() {
        let data = await readFileAsync("./tests/data.txt");
        Expect(data.length).toBe(9);
        let len = data.length;
        Expect(len).toBe(9);
        for (let i=0; i < len-1; i++) {
            Expect(data[i]).toBe(i + 0x31);
        }
        Expect(data[len-1]).toBe(0x0a);
    }

    @AsyncTest("Test readFileAsync failing")
    public async testReadFileAsyncFail() {
        let file="non-existent-file";

        // TODO: This should work:
        //    Expect(async () => await readFileAsync(file)).toThrow();
        // But there appears to be a bug in Alsatian.
        try {
            await readFileAsync(file);
            Expect(`testReadFileAsyncFail: reading ${file} succeeded but shouldn't have`).not.toBeTruthy();
        } catch (err) {
            debug(`testReadFileAsyncFail: reading ${file} failed as expected`);
        }
    }

    @AsyncTest("Test tcCompile succeeds")
    public async testTcCompileSuccess() {
        const inFile = "./tests/addTwo.tbs";
        const outFile = "./tests/t1.wasm";

        debug(`testTcCompileSuccess:+ ${inFile} to ${outFile}`);

        Expect(async () => await tcCompile(inFile, outFile)).not.toThrow();
        debug(`testTcCompileSuccess: ${inFile} to ${outFile}`);
        
        Expect(async () => {
            let stats = await statAsync(outFile);
            debug(`testTcCompileSuccess: stat ${outFile} stats=${JSON.stringify(stats)} done`);
        }).not.toThrow();

        Expect(async () => await unlinkAsync(outFile)).not.toThrow();
        debug(`testTcCompileSuccess: unlink ${outFile} done`);

        debug(`tcCompile:- ${inFile} to ${outFile}`);
    }

    @AsyncTest("Test tcCompile fails on non tbs file")
    public async testTcCompileFailsOnBadFile() {
        const inFile = "./tests/data.txt";
        const outFile = "./tests/tx1.wasm";

        // TODO: This should work:
        //    Expect(async () => await tcCompile(inFile, outFile))).toThrow();
        try {
            await tcCompile(inFile, outFile);
            Expect(`testTcCompileFailsOnBadFile: ${inFile} to ${outFile} succeeded but shouldn't have`).not.toBeTruthy();
        } catch (err) {
            debug(`testTcCompileFailsOnBadFile: ${inFile} to ${outFile} failed as expected`);
        }
    }

    @AsyncTest("Test tcCompile fails on non existent file")
    public async testTcCompileFailsOnNonExistentFile() {
        const inFile = "non-existent-file";
        const outFile = "./tests/tx2.wasm";

        // TODO: This should work:
        //    Expect(async () => await tcCompile(inFile, outFile))).toThrow();
        try {
            await tcCompile(inFile, outFile);
            Expect(`testTcCompileFailsOnNonExistentFile: ${inFile} to ${outFile} Succeeded but shouldn't have`).not.toBeTruthy();
        } catch (err) {
            debug(`testTcCompileFailsOnNonExistentFile: ${inFile} to ${outFile} failed as expected`);
        }
    }
}
