import * as path from "path";
import {getWasmInstance} from "./utils/utils";

test('it should compile an empty file', async () => {
    const instance:WebAssembly.Instance = await getWasmInstance(path.join(__dirname, './empty.tbs'));
    expect(instance).toBeTruthy();
});
