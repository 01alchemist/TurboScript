# Program Parser (Proposal)

## Requirements
* TurboScript program should be able to parse TurboScript & TypeScript syntax.
* Whole TypeScript program parsing can be skipped by making blind source references and later feed it to ts compiler
* Parser should be modular and more program features should be able to add easily.

## Pre-Parser
Pre-parser will parse and build high level program dependency map.
  
```
entry
  |
  |-> import tbs
  |     |
  |     '-> import wasm
  |
  '-> import ts
```

### Method 

    [peek `import`]
      |
      |
      |-> peek `*` --------> wildcard import -.
      |                                       |->
      |-> peek `a-z0-9` ---> default import  -' 
      |                                       
      |-> peek `{` -> named import
      |                |
      |                '-> expect `a-z0-9` -> peek `,` -> false -> expect ``
      '-> exception          ↑______________________| true
                             
