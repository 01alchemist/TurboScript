# TurboScript Module System
A TurboScript module can be local tbs file or folder with index.tbs, external compiled wasm binary or well typed typescript module.

## Import
```typescript
import defaultExportSymbol as symbol from "module"
import * as symbol from "module"
import {exportSymbol1,exportSymbol2} as symbol from "module"
```
