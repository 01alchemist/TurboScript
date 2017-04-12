import * as debugModule from "debug";
const debug = debugModule("turboscript.spec");

import { instantiateTbsFile } from "./utils";

import {
    AsyncTest,
    Expect,
    SetupFixture,
    Setup,
    Teardown,
    TeardownFixture,
    Test,
    TestCase,
    TestFixture,
} from "alsatian";

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

    /**
     * An example synchronous test which adds two numbers using TypeScript
     */
    @TestCase(1, 2, 3)
    @TestCase(-1, 2, 1)
    @TestCase(0, 0, 0)
    @Test("Test adding two numbers using TypeScript")
    public testAddTwoTypeScript(val1: number, val2: number, expectedResult: number) {
        debug("testAddTwoTypeScript:+");

        Expect(val1 + val2).toBe(expectedResult);

        debug("testAddTwoTypeScript:-");
    }

    /**
     * Test TurboScript can add numbers
     */
    @TestCase(1, 2, 3)
    @TestCase(-1, 2, 1)
    @TestCase(0, 0, 0)
    @AsyncTest("Test adding two numbers")
    public async testAddTwo(val1: number, val2: number, expectedResult: number) {
        debug("testAddTwo:+");

        // Only instantiate the file once
        if (!this.addTwoInst) {
            this.addTwoInst = await instantiateTbsFile("./tests/addTwo.tbs");
        }

        // Calculate the sum using addTwo1
        let sum;
        Expect(() => {
            sum = this.addTwoInst.exports.addTwo1(val1, val2)
        }).not.toThrow();
        Expect(sum).toBe(expectedResult);

        debug(`testAddTwo:- sum=${sum}`);
    }
    private addTwoInst: WebAssembly.Instance; // Used only by testAddTwo
}
