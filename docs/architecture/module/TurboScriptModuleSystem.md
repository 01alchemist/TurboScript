# TurboScript Module System (Proposal)
A TurboScript module can be a local tbs file or folder with index.tbs, external compiled wasm binary or well typed typescript module.
A TurboScript project is a collection of interconnected modules.

![Diagram](https://rawgit.com/01alchemist/TurboScript/raw-files/turboscript-module-system.svg)

## Import
```typescript
import defaultExportSymbol as symbol from "module"
// or
import {exportSymbol1,exportSymbol2} from "module"
// or
import * as symbol from "module"
// or
import {exportSymbol1,exportSymbol2} as symbol from "module"
```
`module` can be local turboscript module, local typescript module or compiled wasm module.

#### import default export from a module
```typescript
import defaultAwesomeComponent from "./components/awesome-component"
// or
import defaultAwesomeComponent from "./components/awesome-component.tbs"
// or
import defaultAwesomeComponent from "./external/lib.wasm"
// or
import defaultAwesomeComponent from "./external/lib.ts"

// if it is a const
const awesomeConstRef = defaultAwesomeComponent;

// if it is a function 
let result = defaultAwesomeComponent();

// if it is a class
const instance = new defaultAwesomeComponent();
instance.awesomeMember();
```

#### import named exports from a module
```typescript
import {func1, const1, class1} from "./components/awesome-component"
// or
import {func1, const1, class1} from "./components/awesome-component.tbs"
// or
import {func1, const1, class1} from "./external/lib.wasm"
// or
import {func1, const1, class1} from "./external/lib.ts"

const awesomeConstRef = const1;
let result = func1();
const instance = new class1();
instance.awesomeMember();
```

#### import named exports as "something" from a module
```typescript
import {func1, const1, class1} as awesome from "./components/awesome-component"
// or
import {func1, const1, class1} as awesome from "./components/awesome-component.tbs"
// or
import {func1, const1, class1} as awesome from "./external/lib.wasm"
// or
import {func1, const1, class1} as awesome from "./external/lib.ts"

const awesomeConstRef = awesome.const1;
let result = awesome.func1();
const instance = new awesome.class1();
instance.awesomeMember();
```

#### import everything ( * ) as "something" from a module
```typescript
import * as awesome from "./components/awesome-component"
// or
import * as awesome from "./components/awesome-component.tbs"
// or
import * as awesome from "./external/lib.wasm"
// or
import * as awesome from "./external/lib.ts"

const awesomeConstRef = awesome.const1;
let result = awesome.func1();
let result2 = awesome.somethingElse();
const instance = new awesome.class1();
instance.awesomeMember();
```

## Export 
#### from TurboScript
##### Constant
```typescript
export const ROCK_SOLID:int32 = 1000;
```
##### Variable
```typescript
export let CRACKED_ROCK:int32 = 1001;
```
##### Function
```typescript
export function doSomething(...arguments:<type>):<type>{}
```
##### Class
```typescript
export class someMightyClass{}
```
##### Grouped
```typescript
export {
    ROCK_SOLID,
    someMightyClass,
    doSomething,
    doSomethingAsSomethingElse:doSomething
}
```
##### Default
```typescript
export default function doThisByDefault(...arguments:<type>):<type>{}
```


#### from TypeScript
No special changes needed as TypeScript will compile to JavaScript and linked to TurboScript binary at runtime.

#### from WASM module
Any compiled wasm module can be imported to TurboScript. Compiler will parse wasm module and generate declarations on the fly.

## Special cases
#### Module folder with multiple targets
When a module folder contains index.wasm and index.tbs or index.ts. 

**Import everything and link separately.**
 * If content of index.tbs, index.ts and index.wasm is different.

**Import only index.wasm use declarations from index.tbs or index.ts**
 * If content of index.tbs, index.ts and index.wasm is same.

**Import only index.tbs**
 * If content of index.tbs and index.ts is same and no index.wasm present.

