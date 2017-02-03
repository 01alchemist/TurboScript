@echo off

IF Not DEFINED TURBO_PATH (
    set TURBO_PATH=%~dp0..\
)

set ext=wasm

IF %2 EQU --asmjs (
    set ext=asm.js
) ELSE (
    IF %2 EQU --wasm (
        set ext=wasm
    )
)

rem ts-node tc.ts %1 %2 %3 %4.wasm
node %TURBO_PATH%\lib\tc.js %1 %2 %3 %4.%ext%
IF %ERRORLEVEL% EQU 0 (
    IF %ext% EQU wasm (
        wasm2wast %4.wasm -o %4.wast -v
    )
)

exit %ERRORLEVEL%