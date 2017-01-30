#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ !$TURBO_PATH ];
    then
        export TURBO_PATH=${DIR}/../
fi

#node ${TURBO_PATH}/lib/tc.js $1 $2 $3 $4.wasm
ts-node ${TURBO_PATH}/lib/tc.ts $1 $2 $3 $4.wasm
if [ $? == 0 ];
    then
        wasm2wast $4.wasm -o $4.wast -v
fi

exit $?