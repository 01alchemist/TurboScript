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

### Pre-parsing 


![Diagram](https://rawgit.com/01alchemist/TurboScript/raw-files/pre-parsing.svg?v=3)
