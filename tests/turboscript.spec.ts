import * as debugModule from "debug";
const debug = debugModule("turboscript.spec");

import {readFileAsync} from "./utils";

import {
    SetupFixture,
    Setup,
    TeardownFixture,
    Teardown,
    AsyncTest,
    Expect,
    Test,
    TestCase,
    TestFixture,
} from "alsatian";

async function instantiateFile(filePath: string): Promise<WebAssembly.Instance> {
    debug("instantiateFile:+");

    // Read the file
    debug("instantiateFile: readFile:");
    let data = await readFileAsync(filePath);
    debug(`instantiateFile: file read length=${data.length}`);

    // Compile
    debug("instantiateFile compile:");
    let mod = await WebAssembly.compile(data);
    debug("instantiateFile compiled:");

    // Instantiate:
    debug("instantiateFile instantiate:");
    let instance = await WebAssembly.instantiate(mod);
    debug("instantiateFile instantiated:");

    debug("instantiateFile:-");
    return instance;
}

@TestFixture("TurboScript tests")
export class TurboScriptTests {
    /**
     * Called once before any tests have been run.
     */
    @SetupFixture
    public setupFixture() {
        debug("setupFixture:+");
    
        // Add code

        debug("setupFixture:-");
    }

    /**
     * Called once after all tests have been run.
     */
    @TeardownFixture
    public teardownFixture() {
        debug("teardownFixture:+");

        // Add code

        debug("teardownFixture:-");
    }

    /**
     * Called once before every test
     */
    @Setup
    public setup() {
        debug("setup:+");

        // Add code

        debug("setup:-");
    }

    /**
     * Called once after every test
     */
    @Teardown
    public teardown() {
        debug("teardown:+");

        // Add code

        debug("teardown:-");
    }

    @TestCase(1, 2, 3)
    @TestCase(-1, 2, 1)
    @TestCase(0, 0, 0)
    @Test("Test adding two numbers using TypeScript")
    public testAddTwoTypeScript(val1: number, val2: number, expectedResult: number) {
        debug("testAddTwoTypeScript:+");

        try {
          let result = val1 + val2; //this.instance.exports.addTwo(val1, val2);
          Expect(result).toBe(expectedResult);
        } catch (e) {
          debug(`testAddTwoTypeScript caught e=${e}`);
          Expect(false).toBe(true); // Always fail.
        }

        debug("testAddTwoTypeScript:-");
    }

    @TestCase(1, 2, 3)
    @TestCase(-1, 2, 1)
    @TestCase(0, 0, 0)
    @AsyncTest("Test adding two numbers")
    public async testAddTwo(val1: number, val2: number, expectedResult: number) {
        debug("testAddTwo:+");

        let addTwoInst = await instantiateFile("./tests/addTwo.wasm");
        debug(`addTwoInst=${addTwoInst}`);

        try {
            let result = addTwoInst.exports.addTwo1(val1, val2);
            debug(`testAddTwo: result=${result}`);
            Expect(result).toBe(expectedResult);
        } catch (e) {
            debug(`testAddTwo caught e=${e}`);
            Expect(false).toBe(true); // Always fail.
        }

        debug("testAddTwo:-");
    }
}
