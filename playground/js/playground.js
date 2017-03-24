/**
 * Created by Nidin Vinayakan on 07/02/17.
 */

TURBO_PATH = "../";

(function () {
    $("#input").linedtextarea();
    var clear = document.getElementById('clear');
    var input = document.getElementById('input');
    var samplesSelector = document.getElementById('samples');
    var output = document.getElementById('output');
    var outputButton = document.getElementById('output-button');
    var secondaryOutput = document.getElementById('secondary-output');
    var secondaryOutputButton = document.getElementById('secondary-output-button');
    var terminal = document.getElementById('terminal');
    var terminalButton = document.getElementById('run-button');
    var log = document.getElementById('log');
    var compileTime = document.getElementById('compile-time');

    var backendWebAssembly = document.getElementById('backend-wasm');
    var backendJavaScript = document.getElementById('backend-js');

    var targetAsmJs = document.getElementById('target-asmjs');
    var targetJavaScript = document.getElementById('target-js');
    var targetWebAssembly = document.getElementById('target-wasm');

    var compiledWebAssembly = null;
    var compiledJavaScript = null;

    var terminalName = null;
    var terminalContents = null;

    var outputName = null;
    var outputContents = null;

    var secondaryOutputName = null;
    var secondaryOutputContents = null;

    function joinLines(lines) {
        return lines.join('\n');
    }

    var selectedSample = 2;
    var samples = [
        {
            name: "empty",
            content: "",
            usage: ""
        },
        {
            name: "simple",
            content: joinLines([
                'export function addTwo1(a:int32, b:int32): int32 {',
                '  return a + b;',
                '}',
                'export function addTwo2(a:uint32, b:uint32): uint32 {',
                '  return a + b;',
                '}',
                'export function addTwo3(a:float32, b:float32): float32 {',
                '  return a + b;',
                '}',
                'export function addTwo4(a:float64, b:float64): float64 {',
                '  return a + b;',
                '}',
                '//Not yet supported in MVP',
                '//export function addTwo5(a:int64, b:int64): int64 {',
                '//  return a + b;',
                '//}',
                '//export function addTwo6(a:uint64, b:uint64): uint64 {',
                '//  return a + b;',
                '//}',
            ]) + '\n',
            usage: joinLines([
                "//WASM Compiled and exports can access by window.exports",
                "console.log(exports.addTwo1(-1, 1));",
                "console.log(exports.addTwo2(1, 1));",
                "console.log(exports.addTwo3(1.1, 2.5));",
                "console.log(exports.addTwo4(0.5, 10.5));",
                "//Not yet supported in MVP",
                "//console.log(exports.addTwo5(-10,15));",
                "//console.log(exports.addTwo6(2,2));",
            ])
        },
        {
            name: "class",
            content: joinLines([
                'class Vec3 {',
                '   x: float32;',
                '   y: float32;',
                '   z: float32;',
                '   ',
                '   constructor(x: float32, y: float32, z: float32): Vec3 {',
                '       this.x = x;',
                '       this.y = y;',
                '       this.z = z;',
                '       return this;',
                '   }',
                '   ',
                '   add(b: Vec3): Vec3 {',
                '       return new Vec3(this.x + b.x, this.y + b.y, this.z + b.z);',
                '   }',
                '}',
                '',
                'export function newVec3(x: float32, y: float32, z: float32): Vec3 {',
                '    return new Vec3(x, y, z);',
                '}',
                '',
                'export function addVec3(a:Vec3, b:Vec3): Vec3 {',
                '    return a.add(b);',
                '}',
                '',
                'export function destroyVec3(a:Vec3): void {',
                '    delete a;',
                '}',
            ]) + '\n',
            usage: joinLines([
                "//WASM Compiled and exports can access by window.exports",
                "var v1 = exports.newVec3(1.0, 1.0, 1.5);",
                "var v2 = exports.newVec3(0.5, 2.5, 2.5);",
                "var v3 = exports.addVec3(v1,v2);",
                "console.log(vec3_to_string(v1))",
                "console.log(vec3_to_string(v2))",
                "console.log(vec3_to_string(v3))",
                "exports.destroyVec3(v1);",
                "exports.destroyVec3(v2);",
                "exports.destroyVec3(v3);",
            ])
        }
    ];

    function setSample(index) {
        selectedSample = index;
        input.value = samples[index].content;
        compile();
    }

    samplesSelector.addEventListener('change', () => {
        setSample(samplesSelector.selectedIndex);
    });

    samplesSelector.selectedIndex = selectedSample;


    function hexdump(bytes) {
        var text = '';
        var rows = bytes.length + 15 >>> 4;

        for (var i = 0; i < rows; i++) {
            if (i > 0) {
                text += '\n';
            }

            var columns = Math.min(16, bytes.length - i * 16);

            for (var j = 0; j < columns; j++) {
                text += (0x100 | bytes[i * 16 + j]).toString(16).slice(-2) + ' ';
            }

            for (var j = columns; j < 16; j++) {
                text += '   ';
            }

            text += '| ';

            for (var j = 0; j < columns; j++) {
                var c = bytes[i * 16 + j];
                text += c >= 0x20 && c <= 0x7E ? String.fromCharCode(c) : '\xB7';
            }
        }

        return text;
    }

    function compile() {
        clearLog();
        var target = targetAsmJs.checked ? 'asmjs' : targetJavaScript.checked ? 'JavaScript' : 'WebAssembly';
        var sources = [{
            name: '<stdin>',
            contents: input.value,
        }];

        var compiled = null;

        try {
            if (backendWebAssembly.checked) {
                compiled = compiledWebAssembly(sources, target, 'compiled');
            } else {
                compiled = compiledJavaScript(sources, target, 'compiled');
            }
        } catch (e) {
            var message = e + '';
            if (e.stack) {
                message = e.stack.indexOf(message) !== -1 ? e.stack : message + '\n' + e.stack;
            }
            compiled = {stdout: message, totalTime: 0, success: false};
        }

        secondaryOutputName = null;
        secondaryOutputContents = '';

        terminalName = null;
        terminalContents = '';

        if (!compiled.success) {
            output.style.borderColor = "#ff0000";
        } else {
            output.style.borderColor = "#00ff00";
        }

        if (compiled.stdout) {
            output.value = compiled.stdout;
            outputName = 'log.txt';
            outputContents = compiled.stdout;
        }

        else {
            switch (target) {
                case 'asmjs': {
                    output.value = compiled.output;
                    outputName = 'compiled.asm.js';
                    outputContents = compiled.output;
                    terminalName = 'main.asm.js';

                    var asmJsCode = joinLines([
                        `window.turbo = (function(){`,
                        compiled.output,
                        '   return initTurbo(0x10000);',
                        '})()',
                    ]);

                    terminalContents = samples[selectedSample].usage;
                    runJavaScript(asmJsCode);
                    break;
                }

                case 'JavaScript': {
                    output.value = compiled.output;
                    outputName = 'compiled.js';
                    outputContents = compiled.output;
                    terminalName = 'main.js';
                    terminalContents = joinLines([
                        'function compileAndRunJavaScript(compiled) {',
                        '  var global = {',
                        '    print: function(text) {',
                        '      console.log(text);',
                        '    },',
                        '  };',
                        '  var exports = {};',
                        '  var code = new Function("global", "exports", compiled)',
                        '  code(global, exports);',
                        '  var result = exports.demo();',
                        '  console.log("result:", result);',
                        '}',
                        '',
                        'compileAndRunJavaScript(' + JSON.stringify(compiled.output) + ');',
                    ]);

                    break;
                }

                case 'WebAssembly': {
                    //output.value = hexdump(compiled.output);
                    output.value = compiled.log;
                    outputName = 'compiled.wasm';
                    outputContents = compiled.output;
                    terminalName = 'main.js';

                    try {
                        WebAssembly.compile(compiled.output).then(function (compiled) {
                            window.exports = new WebAssembly.Instance(compiled).exports;
                            window.memory = exports.memory;
                            window.data = new DataView(memory.buffer);
                            window.array = new Uint8Array(memory.buffer);
                            window.f32 = new Float32Array(memory.buffer);
                            console.info("WASM Compiled and exports can access by window.exports");
                            terminalContents = samples[selectedSample].usage;
                            terminal.textContent = terminalContents;
                            output.style.borderColor = "#00ff00";
                        }).catch(function (e) {
                            output.style.borderColor = "#ff0000";
                            terminal.textContent = e.message;
                            console.error(e);
                        })

                    } catch (e) {
                        output.style.borderColor = "#ff0000";
                        terminal.textContent = e.message;
                        console.error(e);
                    }
                    break;
                }

                default: {
                    throw new Error('Invalid target: ' + target);
                }
            }
        }

        if (secondaryOutputName !== null) {
            output.parentNode.classList.add('double-output');
        } else {
            output.parentNode.classList.remove('double-output');
        }
        secondaryOutput.value = secondaryOutputContents;

        terminal.textContent = terminalContents;
        terminalButton.textContent = (target === 'asmjs' || target === 'JavaScript' || (target === 'WebAssembly' && supportsWebAssembly()) ) ? 'Run' : 'Download';
        terminalButton.disabled = terminalName === null;

        compileTime.textContent = compiled.totalTime + 'ms';
    }

    function runJavaScript(code) {
        eval(code);

        if (window.turbo) {
            window.exports = window.turbo.exports;
            window.data = new DataView(window.turbo.RAW_MEMORY);
            window.array = new Uint8Array(window.turbo.RAW_MEMORY);
            window.f32 = new Float32Array(window.turbo.RAW_MEMORY);
        }
    }

    function triggerDownload(name, contents) {
        var link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([contents], {type: typeof contents === 'string' ? 'text/plain' : 'application/octet-stream'}));
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function logAppend() {
        log.value += (log.value !== '' ? '\n' : '') + '> ' + Array.prototype.map.call(arguments, function (item) {
                var text = item + '';
                return text === '' || text.indexOf('\n') !== -1 ? JSON.stringify(text) : text;
            }).join(' ');
        log.scrollTop = log.scrollHeight;
    }

    function updateTerminalContent() {
        terminalContents = terminal.value;
    }

    function runOrDownloadShim() {
        if (terminalButton.disabled) {
            return;
        }

        if (terminalButton.textContent === 'Download') {
            triggerDownload(terminalName, terminalContents);
            return;
        }

        if (log.value !== '') log.value += '\n';
        clear.disabled = false;

        try {
            new Function('terminal', terminalContents)();
        } catch (e) {
            logAppend(e + '');
        }
    }

    function clearLog() {
        log.value = '';
        clear.disabled = true;
    }

    function supportsWebAssembly() {
        return typeof WebAssembly !== 'undefined';
    }

    function main() {
        loadLibrary(function (libs) {

            SystemJS.import("main").then(function (exports) {
                backendWebAssembly.onchange = compile;
                backendJavaScript.onchange = compile;
                targetWebAssembly.onchange = compile;
                targetJavaScript.onchange = compile;
                terminal.oninput = updateTerminalContent;
                targetAsmJs.onchange = compile;
                input.oninput = compile;
                outputButton.onclick = function () {
                    triggerDownload(outputName, outputContents);
                };
                secondaryOutputButton.onclick = function () {
                    triggerDownload(secondaryOutputName, secondaryOutputContents);
                };
                terminalButton.onclick = runOrDownloadShim;
                clear.onclick = clearLog;

                compiledJavaScript = compileJavaScript(exports, libs);
                input.value = samples[selectedSample].content;
                input.selectionStart = input.selectionEnd = 0;
                compile();

//                if (supportsWebAssembly()) {
//                    compiledWebAssembly = compileWebAssembly(wasm);
//                    backendWebAssembly.checked = true;
//                }
//
//                else {
//                    backendJavaScript.checked = true;
//                    backendWebAssembly.disabled = true;
//                    document.body.className = 'wasm-unavailable';
//                }

            });
        });
    }

    console.log = logAppend;
    main();
})();

function vec3_to_string(ptr) {
    return `{x: ${data.getFloat32(ptr, true)},y: ${data.getFloat32(ptr + 4, true)},z: ${data.getFloat32(ptr + 8, true)}}`
}
