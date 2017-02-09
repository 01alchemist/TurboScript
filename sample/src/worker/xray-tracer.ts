/**
 * Created by Nidin Vinayakan on 26-10-2016.
 */

var Color = xray.Color;
var Color3 = xray.Color3;
var Camera = xray.Camera;
var Sampler = xray.Sampler;
// var Vector = xray.Vector;
// var Scene = xray.Scene;

export class xRayTracer {

    id:number;
    flags:Uint8Array;
    pixelMemory:Uint8ClampedArray;
    sampleMemory:Float32Array;
    camera:number;
    scene:number;
    full_width:number;
    full_height:number;
    width:number;
    height:number;
    xoffset:number;
    yoffset:number;

    cameraSamples:number;
    absCameraSamples:number;
    hitSamples:number;
    bounces:number;
    iterations:number = 1;
    private locked:boolean;

    /* Render Domain */
    public sampler;
    public buffer:number;
    public samplesPerPixel:number = 1;
    public stratifiedSampling:boolean = true;
    public AdaptiveSamples:number;
    public FireflySamples:number;
    public FireflyThreshold:number;

    constructor(data?) {
        if(data){
            this.init(data);
        }
    }

    init(data:any) {

        this.id = data.id;
        this.flags = new Uint8Array(data.flagBuffer);
        this.pixelMemory = new Uint8ClampedArray(data.pixelBuffer);
        this.sampleMemory = new Float32Array(data.sampleBuffer);
        this.scene = data.traceData.scene;
        this.camera = data.traceData.camera;

        this.full_width = data.traceData.renderOptions.full_width;
        this.full_height = data.traceData.renderOptions.full_height;
        this.cameraSamples = data.traceData.renderOptions.cameraSamples;
        this.hitSamples = data.traceData.renderOptions.hitSamples;
        this.bounces = data.traceData.renderOptions.bounces;

        if(!this.sampler){
            this.sampler = xray.NewSampler(4, 4);
        }
    }

    updateRenderRegion(width:number, height:number, xoffset:number, yoffset:number):void {
        this.width = width;
        this.height = height;
        this.xoffset = xoffset;
        this.yoffset = yoffset;
        this.absCameraSamples = Math.round(Math.abs(this.cameraSamples));
    }

    private lock() {
        if (!this.locked) {
            this.locked = true;
            postMessage("LOCKED");
        }
    }

    trace(data):boolean {

        if (this.flags[this.id] === 2) {//thread locked
            console.log("exit:1");
            this.lock();
            return;
        }

        this.updateRenderRegion(
            data.rect.width,
            data.rect.height,
            data.rect.xoffset,
            data.rect.yoffset
        );

        this.cameraSamples = data.cameraSamples || this.cameraSamples;
        this.hitSamples = data.hitSamples || this.hitSamples;

        this.iterations = data.init_iterations || 0;

        if (this.locked) {
            console.log("restarted:" + this.iterations, "samples:" + this.checkSamples());
            this.locked = false;
        }

        if (this.iterations > 0 && data.blockIterations) {
            for (var i = 0; i < data.blockIterations; i++) {
                if (this.flags[this.id] === 2) {//thread locked
                    this.lock();
                    return false;
                }
                this.run();
            }
        } else {
            if (this.flags[this.id] === 2) {//thread locked
                this.lock();
                return false;
            }
            this.run();
        }
        if (this.flags[this.id] === 2) {//thread locked
            this.lock();
            return false;
        }
        return true;
    }

    run():void {

        let scene = this.scene;
        let camera = this.camera;
        let sampler = this.sampler;
        let buf = this.buffer;
        // let w = buf.W;
        // let h = buf.H;
        let spp = this.samplesPerPixel;
        let sppRoot = Math.round(Math.sqrt(this.samplesPerPixel));

        this.iterations++;
        var hitSamples = this.hitSamples;
        var cameraSamples = this.cameraSamples;
        var absCameraSamples = this.absCameraSamples;
        if (this.iterations == 1) {
            hitSamples = 1;
            cameraSamples = -1;
            absCameraSamples = Math.round(Math.abs(cameraSamples));
        }


        for (var y:number = this.yoffset; y < this.yoffset + this.height; y++) {

            for (var x:number = this.xoffset; x < this.xoffset + this.width; x++) {

                if (this.flags[this.id] === 2) {//thread locked
                    console.log("exit:3");
                    this.lock();
                    return;
                }

                let c = new Color3();

                if (this.stratifiedSampling) {
                    // stratified subsampling
                    for (let u = 0; u < sppRoot; u++) {
                        for (let v = 0; v < sppRoot; v++) {
                            let fu = (u + 0.5) / sppRoot;
                            let fv = (v + 0.5) / sppRoot;
                            let ray = Camera.CastRay(camera, x, y, this.full_width, this.full_height, fu, fv);
                            let sample = sampler.sample(scene, ray, true, sampler.FirstHitSamples, 1);
                            c = c.add(sample);
                        }
                    }
                    c = c.divScalar(sppRoot * sppRoot);
                } else {
                    // random subsampling
                    for (let i = 0; i < spp; i++) {
                        let fu = Math.random();
                        let fv = Math.random();
                        let ray = Camera.CastRay(camera, x, y, this.full_width, this.full_height, fu, fv);
                        // let sample = Sampler.Sample(sampler, scene, ray);
                        let sample = sampler.sample(scene, ray, true, sampler.FirstHitSamples, 1);
                        c = c.add(sample);
                        //Color.Add_mem(c, sample, c);
                        //Buffer.AddSample(buf, x, y, sample);
                    }
                    c = c.divScalar(spp);
                }

                /*// adaptive sampling
                if (this.AdaptiveSamples > 0) {
                    let v = Clamp(buf.StandardDeviation(x, y).MaxComponent(), 0, 1);
                    // v = math.Pow(v, 2)
                    let samples = int(v * float64(r.AdaptiveSamples))
                    for (let i = 0; i < samples; i++) {
                        let fu = Math.random();
                        let fv = Math.random();
                        let ray = Camera.CastRay(camera, x, y, this.full_width, this.full_height, fu, fv);
                        let sample = Sampler.Sample(sampler, scene, ray);
                        Color.Add_mem(this.c, sample, this.c);
                        //Buffer.AddSample(buf, x, y, sample);
                    }
                }
                // firefly reduction
                if (this.FireflySamples > 0) {
                    if (buf.StandardDeviation(x, y).MaxComponent() > this.FireflyThreshold) {
                        for (let i = 0; i < this.FireflySamples; i++) {
                            let fu = Math.random();
                            let fv = Math.random();
                            let ray = Camera.CastRay(camera, x, y, this.full_width, this.full_height, fu, fv);
                            let sample = Sampler.Sample(sampler, scene, ray);
                            Color.Add_mem(this.c, sample, this.c);
                            // Buffer.AddSample(buf, x, y, sample);
                        }
                    }
                }*/

                c = c.pow(1 / 2.2);
                var screen_index:number = (y * (this.full_width * 3)) + (x * 3);
                this.updatePixel(c, screen_index);
            }
        }

        //console.time("render");
        /*for (var y:number = this.yoffset; y < this.yoffset + this.height; y++) {

            for (var x:number = this.xoffset; x < this.xoffset + this.width; x++) {

                if (this.flags[this.id] === 2) {//thread locked
                    console.log("exit:3");
                    this.lock();
                    return;
                }

                var screen_index:number = (y * (this.full_width * 3)) + (x * 3);
                // var _x:number = x - this.xoffset;
                // var _y:number = y - this.yoffset;

                var c:Color = new Color();

                if (cameraSamples <= 0) {
                    // random subsampling
                    for (let i = 0; i < absCameraSamples; i++) {
                        var fu = Math.random();
                        var fv = Math.random();
                        var ray = this.camera.castRay(x, y, this.full_width, this.full_height, fu, fv);
                        c = c.add(this.scene.sample(ray, true, hitSamples, this.bounces))
                    }
                    c = c.divScalar(absCameraSamples);
                } else {
                    // stratified subsampling
                    var n:number = Math.round(Math.sqrt(cameraSamples));
                    for (var u = 0; u < n; u++) {
                        for (var v = 0; v < n; v++) {
                            var fu = (u + 0.5) / n;
                            var fv = (v + 0.5) / n;
                            var ray:Ray = this.camera.castRay(x, y, this.full_width, this.full_height, fu, fv);
                            c = c.add(this.scene.sample(ray, true, hitSamples, this.bounces));
                        }
                    }
                    c = c.divScalar(n * n);
                }

                if (this.flags[this.id] === 2) {//thread locked
                    console.log("exit:7");
                    this.lock();
                    return;
                }

                c = c.pow(1 / 2.2);

                this.updatePixel(c, screen_index);
            }
        }*/
        //console.timeEnd("render");
    }

    updatePixel(color, si:number):void {

        if (this.flags[this.id] === 2) {//thread locked
            console.log("exit:8");
            this.lock();
            return;
        }
        this.sampleMemory[si] += color.R;
        this.sampleMemory[si + 1] += color.G;
        this.sampleMemory[si + 2] += color.B;

        this.pixelMemory[si] = Math.max(0, Math.min(255, (this.sampleMemory[si] / this.iterations) * 255));
        this.pixelMemory[si + 1] = Math.max(0, Math.min(255, (this.sampleMemory[si + 1] / this.iterations) * 255));
        this.pixelMemory[si + 2] = Math.max(0, Math.min(255, (this.sampleMemory[si + 2] / this.iterations) * 255));

    }

    checkSamples() {
        for (var y:number = this.yoffset; y < this.yoffset + this.height; y++) {
            for (var x:number = this.xoffset; x < this.xoffset + this.width; x++) {
                var si:number = (y * (this.full_width * 3)) + (x * 3);
                if (this.sampleMemory[si] !== 0 &&
                    this.sampleMemory[si + 1] !== 0 &&
                    this.sampleMemory[si + 2] !== 0) {
                    return "NOT_OK";
                }
            }
        }
        return "OK";
    }
}