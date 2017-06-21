//import * as fs from "fs";
import {
  SetupFixture,
  //AsyncTeardownFixture,
  //AsyncTest,
  Expect,
  Test,
  TestCase,
  TestFixture,
} from "alsatian";

import * as debugModule from "debug";
const debug = debugModule("addTwo.spec");

@TestFixture("Add two tests")
export class AddTwoTests {
  @SetupFixture
  public setupFixture() {
    debug("setupFixture:+");
  
    let memory = new WebAssembly.Memory({initial:1});
    let u8 = new Uint8Array(memory.buffer);

    debug(`setupFixture: u8.length=${u8.length}`);

    //this.instance = await loadWasm("../build/tests/addTwo.wasm");
  
    debug("setupFixture:-");
  }

  @TestCase(1, 2, 3)
  @TestCase(-1, 2, 1)
  @TestCase(0, 0, 0)
  @Test("Test adding two numbers")
  public testAddTwo(val1: number, val2: number, expectedResult: number) {
    debug("testAddTwo:+");

    try {
      let result = val1 + val2 //this.instance.exports.addTwo(val1, val2);
      Expect(result).toBe(expectedResult);
    } catch (e) {
      debug(`testAddTwo caught e=${e}`);
      Expect(false).toBe(true); // Always fail.
    }

    debug("testAddTwo:-");
  }
}
