#!/usr/bin/env bash
#node lib/tc.js $1 $2 $3 $4.wasm
ts-node tc.ts $1 $2 $3 $4.wasm
if [ $? == 0 ];
    then
        wasm2wast $4.wasm -o $4.wast -v
fi

exit $?