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
        let result = await readFileAsync("./tests/data.txt");
        Expect(result.err).not.toBeTruthy();
        Expect(result.data.length).toBe(9);
        let len = result.data.length;
        Expect(len).toBe(9);
        for (let i=0; i < len-1; i++) {
            Expect(result.data[i]).toBe(i + 0x31);
        }
        Expect(result.data[len-1]).toBe(0x0a);
    }

    @AsyncTest("Test readFileAsync failing")
    public async testReadFileAsyncFail() {
        let result = await readFileAsync("non-existent-file");
        Expect(result.err).toBeTruthy();
        Expect(result.data.length).toBe(0);
    }

    @AsyncTest("Test tcCompile succeeds")
    public async testTcCompileSuccess() {
        const inFile = "./tests/addTwo.tbs";
        const outFile = "./tests/t1.wasm";

        debug(`tcCompile:+ ${inFile} to ${outFile}`);

        let compResult = await tcCompile(inFile, outFile);
        debug(`tcCompileSuccess: result=${JSON.stringify(compResult)}`);
        Expect(compResult.err).not.toBeDefined();
        
        let statResult = await statAsync(outFile);
        debug(`tcCompileSuccess: stat ${outFile} result=${JSON.stringify(statResult)} done`);
        Expect(statResult.err).not.toBeDefined();

        let unlinkResult = await unlinkAsync(outFile);
        debug(`tcCompileSuccess: unlink ${outFile} result=${JSON.stringify(unlinkResult)} done`);
        Expect(unlinkResult.err).not.toBeDefined();

        debug(`tcCompile:- ${inFile} to ${outFile}`);
    }

    @AsyncTest("Test tcCompile fails on non tbs file")
    public async testTcCompileFailsOnBadFile() {
        const inFile = "./tests/data.txt";
        const outFile = "./tests/tx1.wasm";

        let result = await tcCompile(inFile, outFile);
        debug(`tcCompileFailsOnBadFile: error=${result.err}`);
        Expect(result.err).toBeTruthy();
    }

    @AsyncTest("Test tcCompile fails on non existent file")
    public async testTcCompileFailsOnNonExistentFile() {
        const inFile = "non-existent-file";
        const outFile = "./tests/tx2.wasm";

        let result = await tcCompile(inFile, outFile);
        debug(`tcCompileFailsOnNonExistentFile: error=${result.err}`);
        Expect(result.err).toBeTruthy();
    }
}
