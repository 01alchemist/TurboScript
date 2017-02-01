#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ !$TURBO_PATH ];
    then
        export TURBO_PATH=${DIR}/../
fi

ext=wasm

if [ $2 == --asmjs ];
    then
        ext=asm.js

else
    if [ $2 == --wasm ];
        then
            ext=wasm
    fi
fi

#node ${TURBO_PATH}/lib/tc.js $1 $2 $3 $4.wasm
ts-node ${TURBO_PATH}/lib/tc.ts $1 $2 $3 $4.$ext
if [ $? == 0 ] && [ $2 == --wasm ];
    then
        wasm2wast $4.$ext -o $4.wast -v
fi

exit $?