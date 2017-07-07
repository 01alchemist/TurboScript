## Import Cases
* ###  import from local tbs file
```typescript
import {func,class,var} from "./local/module"
```
.tbs will automatically append to import from file

* ###  import from javascript built-ins
```typescript
import {Math} from "javascript"
```
special tbs file where all javascript methods declared. it should be outside library source.

* ###  import from compiled wasm binary
```typescript
import {func,global_var,memory} from "./bin/module.wasm"
```
import from compiled wasm should parse wasm binary and generate an internal structure of module.
this will allow conditional import of desired part of the module. imported wasm modules can be linked dynamically or statically. While linking statically, offsets of function index, import index, call index etc. need to be adjusted.
unwanted functions from imported wasm should be removed and combine in to one wasm output.

Notes: All declare syntax outside library source should allocate imports. import from wasm binary need a wasm binary parser.

### import strategy
#### Static linking
`if a function is declared and available in binary importer ---> no import`

`if a function is declared and not available in binary importer ---> import`
#### Dynamic linking
`if a function is declared ---> import`

