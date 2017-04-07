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

import {readFileAsync} from "./utils";

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

    @AsyncTest("Test readFileAsync")
    public async testReadFileAsync() {
        let data = await readFileAsync("./tests/data.txt");
        Expect(data.length).toBe(9);
        for (let i=0; i < data.length-1; i++) {
            Expect(data[i]).toBe(i + 0x31);
        }
        Expect(data[data.length-1]).toBe(0x0a);
    }
}
