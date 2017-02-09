/*global turbo, unsafe, xray, THREE*/
exports = {};
importScripts('../turbo-runtime.js', '../../../../node_modules/three/build/three.js');
importScripts('../../../../node_modules/three/examples/js/loaders/MTLLoader.js');
importScripts('../../../../node_modules/three/examples/js/loaders/OBJLoader.js');

var WORKER_ID = parseInt(location.search.split("=")[1]);
var xTracer = null;

var flagBuffer = null;
var pixelBuffer = null;
var sampleBuffer = null;

var renderData = null;

onmessage = (msg) => {

    switch (msg.data.command) {
        case "INIT_MEMORY":
            let RAW_MEMORY = msg.data.buffer;
            flagBuffer = msg.data.flagBuffer;
            pixelBuffer = msg.data.pixelBuffer;
            sampleBuffer = msg.data.sampleBuffer;

            turbo.Runtime.init(RAW_MEMORY, 0, RAW_MEMORY.byteLength, false);
            importScripts('../xray-kernel-turbo.js');
            importScripts('../src/worker/xray-tracer.js');
            unsafe.RAW_MEMORY = RAW_MEMORY;
            postMessage({event: "MEMORY_INITIALIZED", id: WORKER_ID});
            break;
        case "INIT":
            renderData = {
                id:WORKER_ID,
                traceData:msg.data.traceData,
                flagBuffer:flagBuffer,
                pixelBuffer:pixelBuffer,
                sampleBuffer:sampleBuffer
            };
            xTracer = new xRayTracer(renderData);
            xTracer.sampler = xray.NewSampler(4, 5);

            postMessage({event: "INITIALIZED", id: WORKER_ID});

            break;

        case "TRACE":

            xTracer.trace(msg.data.jobData);
            postMessage({event:"TRACE_COMPLETED", id:WORKER_ID, jobIndex:msg.data.jobData.index, rect:msg.data.jobData.rect});

            break;

        case "STOP_TRACE":

            //xTracer.stop();

            break;

        default:
            console.error("Unknown command received");
            break;
    }

};

postMessage({event: "BOOTED", id: WORKER_ID});
