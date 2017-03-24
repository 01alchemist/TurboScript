/* imports */
var Color = xray.Color;
var Vector = xray.Vector;
var MasterScene = xray.MasterScene;
var Camera = xray.Camera;
var Material = xray.Material;
var Cube = xray.Cube;
var Sphere = xray.Sphere;
var Utils = xray.Utils;

let NUM_CPU = 8;
let CPU_available = 7;
let workerPool = [];
var numReady = 0;
var numBusy = 0;
let canvas;
let container;
let ctx;
let imageData;
let pixelData;
let bucketSize = 32;
let renderOptions = {
    // full_width: 2560 / 4,
    // full_height: 1440 / 4,
    full_width: 448,
    full_height: 640,
    iterations: 1,
    hitSamples: 1,
    cameraSamples: 1,
    blockIterations: 1,
    bounces: 0
};

let flags = new Uint8Array(new SharedArrayBuffer(CPU_available));
let pixelMemory = new Uint8Array(new SharedArrayBuffer(renderOptions.full_width * renderOptions.full_height * 3));
let sampleMemory = new Float32Array(new SharedArrayBuffer(4 * renderOptions.full_width * renderOptions.full_height * 3));

let masterScene = new MasterScene();
let camera = Camera.LookAt(Vector.NewVector(0, 5, 15), Vector.NewVector(0, 5, 0), Vector.NewVector(0, 1, 0), 45);
let traceData = {
    renderOptions: renderOptions,
    scene: masterScene.scenePtr,
    camera: camera
};

let traceJobs = [];
let refJobs = [];
let deferredQueue = [];

function add_debug_scene(){
    let wall = Material.GlossyMaterial(Color.HexColor(0xFCFAE1), 1.5, Utils.radians(10));
    let light = Material.LightMaterial(Color.WHITE, 50);
    let green_light = Material.LightMaterial(Color.HexColor(0x00FF00), 80);

    // add walls and lights
    // masterScene.Add(Cube.NewCube(Vector.NewVector(-10, -1, -10), Vector.NewVector(-2, 10, 10), wall));
    // masterScene.Add(Cube.NewCube(Vector.NewVector(-10, -1, -10), Vector.NewVector(10, 0, 10), wall));
    masterScene.Add(Sphere.NewSphere(Vector.NewVector(0, 8, 0), 0.5, light));
    // masterScene.Add(Sphere.NewSphere(Vector.NewVector(20, 20, 0), 1, green_light));
}

function init() {
    container = document.getElementById("output");
    canvas = document.createElement("canvas");
    canvas.id = "giImageOutput";

    canvas.style.backgroundColor = "#3C3C3C";
    canvas.style.position = "absolute";

    canvas.width = renderOptions.full_width;
    canvas.height = renderOptions.full_height;

    container.appendChild(canvas);

    ctx = canvas.getContext("2d");

    imageData = ctx.getImageData(0, 0, renderOptions.full_width, renderOptions.full_height);
    pixelData = imageData.data;

    var col = renderOptions.full_width / bucketSize;
    var row = renderOptions.full_height / bucketSize;

    for (var j = 0; j < row; j++) {
        for (var i = 0; i < col; i++) {
            let job = {
                id: j + "_" + i,
                index:traceJobs.length,
                init_iterations:0,
                rect: {
                    width: bucketSize,
                    height: bucketSize,
                    xoffset: i * bucketSize,
                    yoffset: j * bucketSize
                }
            };
            traceJobs.push(job);
            refJobs.push(job);
        }
    }

}

init();
//add_debug_scene();
loadModel("box-slit");
//loadModel("cornellbox_suzanne_lucy");
//loadModel("cornellbox_suzanne_lucy");
// loadModel("gopher");
// loadModel("sphere");
// loadModel("teapot");
// loadModel("uvplane");
//debug_init();

function debug_init(){
    masterScene.AddDebugScene();
    masterScene.Commit();
    initTracers();
}

function initTracers() {

    /* spawn trace workers */
    // CPU_available = 1;
    console.time("Tracers initialized");
    for (let i = 0; i < CPU_available; i++) {

        let tracer = new Worker('thread.js?id=' + i);
        tracer.onmessage = onTracerMessage.bind(this);
        workerPool.push(tracer);

        if (navigator.userAgent.search("Firefox") > -1) {
            tracer.postMessage({
                command: "INIT_MEMORY",
                buffer: unsafe.RAW_MEMORY,
                flagBuffer: flags.buffer,
                pixelBuffer: pixelMemory.buffer,
                sampleBuffer: sampleMemory.buffer
            });
        } else {
            tracer.postMessage({
                command: "INIT_MEMORY",
                buffer: unsafe.RAW_MEMORY,
                flagBuffer: flags.buffer,
                pixelBuffer: pixelMemory.buffer,
                sampleBuffer: sampleMemory.buffer
            }, [
                unsafe.RAW_MEMORY,
                flags.buffer,
                pixelMemory.buffer,
                sampleMemory.buffer
            ]);
        }
    }
}

function onTracerMessage(msg) {
    switch (msg.data.event) {
        case "BOOTED":
            //console.info(`Tracer ${msg.data.id} booted`);
            break;
        case "MEMORY_INITIALIZED":
            workerPool[msg.data.id].postMessage({command: "INIT", traceData: traceData});
            break;
        case "INITIALIZED":
            workerPool[msg.data.id].ready = true;
            numReady++;
            if (numReady == CPU_available) {
                console.timeEnd("Tracers initialized");
                start_trace(1);
            }
            break;
        case "TRACE_COMPLETED":
            refJobs[msg.data.jobIndex].init_iterations++;
            updatePixelsRect(msg.data.rect);
            --numBusy
            process_queue(msg.data.id);
            break;
        case "IDLE":
            break;
    }
}
/* Ray tracing section */
let iterations_target = 0;
let iterations_completed = 0;
let maximum_time = 0;
let start_time = 0;
let elapsed_time = 0;
let isTracing = false;
let interruptTracing = false;

function reset_trace(){
    iterations_target = 0;
    iterations_completed = 0;
    elapsed_time = 0;
}

function start_trace(iterations, time) {
    console.log("Trace started!");
    iterations_target += iterations || 1;
    maximum_time = time || 0;
    start_time = Date.now();
    interruptTracing = false;
    if(iterations_completed > 0){
        next_iteration();
    }else{
        trace();
    }
}
function trace() {
    console.time(`Iteration:${iterations_completed + 1}`);
    workerPool.forEach(function (tracer) {
        if(traceJobs && traceJobs.length > 0) {
            let job = traceJobs.shift();
            deferredQueue.push(job);
            tracer.postMessage({command: "TRACE", jobData: job});
            numBusy++;
        }
    });
}
function process_queue(id){
    if(traceJobs && traceJobs.length > 0) {
        let job = traceJobs.shift();
        deferredQueue.push(job);
        workerPool[id].postMessage({command: "TRACE", jobData: job});
        numBusy++;
    }else{
        if (numBusy == 0) {
            iteration_completed();
        }
    }
}
function iteration_completed() {
    iterations_completed++;
    console.timeEnd(`Iteration:${iterations_completed}`);
    if (interruptTracing) {
        return;
    }
    if (iterations_target == 0 && maximum_time == 0) {
        //trace until interrupt
        next_iteration();
    } else {
        if (maximum_time > 0 && elapsed_time < maximum_time) {
            next_iteration();
        } else if (iterations_target > iterations_completed) {
            next_iteration();
        } else {
            elapsed_time = Date.now() - start_time;
            console.log(`Trace completed, time:${elapsed_time/1000} sec`);
        }
    }
}
function next_iteration(){
    traceJobs = deferredQueue;
    deferredQueue = [];
    trace();
}
function stop_trace() {
    interruptTracing = true;

    workerPool.forEach(function (tracer, i) {
        //tracer.postMessage({command: "STOP_TRACE"});
        flags[i] = 2;
    });
}

/* Pixel manipulation*/
function updatePixels() {

    for (var y = 0; y < renderOptions.full_height; y++) {
        for (var x = 0; x < renderOptions.full_width; x++) {
            var i = y * (renderOptions.full_width * 4) + (x * 4);
            var pi = y * (renderOptions.full_width * 3) + (x * 3);
            pixelData[i] = pixelMemory[pi];
            pixelData[i + 1] = pixelMemory[pi + 1];
            pixelData[i + 2] = pixelMemory[pi + 2];
            pixelData[i + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function updatePixelsRect(rect) {

    for (var y = rect.yoffset; y < rect.yoffset + rect.height; y++) {
        for (var x = rect.xoffset; x < rect.xoffset + rect.width; x++) {

            var i = y * (renderOptions.full_width * 4) + (x * 4);
            var pi = y * (renderOptions.full_width * 3) + (x * 3);
            pixelData[i] = pixelMemory[pi];
            pixelData[i + 1] = pixelMemory[pi + 1];
            pixelData[i + 2] = pixelMemory[pi + 2];
            pixelData[i + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

function updateIndicator(rect) {

    var color = Color.random();

//top-left
    fillRect({x: rect.xoffset, y: rect.yoffset, width: 4, height: 1}, color);
    fillRect({x: rect.xoffset, y: rect.yoffset + 1, width: 1, height: 3}, color);

//top-right
    fillRect({x: rect.xoffset + rect.width - 4, y: rect.yoffset, width: 4, height: 1}, color);
    fillRect({x: rect.xoffset + rect.width - 1, y: rect.yoffset + 1, width: 1, height: 3}, color);

//bottom-left
    fillRect({x: rect.xoffset, y: rect.yoffset + rect.height - 4, width: 1, height: 4}, color);
    fillRect({x: rect.xoffset + 1, y: rect.yoffset + rect.height - 1, width: 3, height: 1}, color);

//bottom-right
    fillRect({x: rect.xoffset + rect.width - 4, y: rect.yoffset + rect.height - 1, width: 4, height: 1}, color);
    fillRect({x: rect.xoffset + rect.width - 1, y: rect.yoffset + rect.height - 4, width: 1, height: 3}, color);

    ctx.putImageData(imageData, 0, 0);
}

function fillRect(rect, color) {
    for (var y = rect.y; y < rect.y + rect.height; y++) {
        for (var x = rect.x; x < rect.x + rect.width; x++) {

            var i = y * (renderOptions.full_width * 4) + (x * 4);
            pixelData[i] = color.R * 255;
            pixelData[i + 1] = color.G * 255;
            pixelData[i + 2] = color.B * 255;
            pixelData[i + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
/* Model loading section */
function loadModel(file) {
    var name = file;
    var folder = file + "/";

    // texture
    var manager = new THREE.LoadingManager();
    /*manager.onProgress = function (item, loaded, total) {
     console.log(item, loaded, total);
     };*/
    manager.onLoad = function () {
        //console.log(arguments);
    };

    var onProgress = function (xhr) {
        // if (xhr.lengthComputable) {
        //     var percentComplete = xhr.loaded / xhr.total * 100;
        //     console.log(Math.round(percentComplete) + '% downloaded of ' + Math.round(xhr.total / (1024 * 1024)));
        // }
    };

    var onError = function (xhr) {
    };

    THREE.Loader.Handlers.add( /\.dds$/i, new THREE["DDSLoader"]() );
    var mtlLoader = new THREE["MTLLoader"](manager);
    mtlLoader.setPath('./models/' + folder);
    mtlLoader.load(name + '.mtl', function (materials) {
        var objLoader = new THREE["OBJLoader"]();
        objLoader.setMaterials(materials);
        objLoader.setPath('./models/' + folder);
        materials.preload();
        objLoader.load(name + '.obj', function (object) {
            // object.position.y = -95;
            object.scale.set(0.3, 0.3, 0.3);
            object.smooth = true;

            console.time("BufferGeometry::Create");
            xray.BufferGeometry.NewBufferGeometry(object, masterScene);
            masterScene.Commit();
            console.timeEnd("BufferGeometry::Create");
            initTracers();
        }, onProgress, onError);
    });
}