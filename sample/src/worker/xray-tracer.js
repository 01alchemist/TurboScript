"use strict";
var Color = xray.Color;
var Color3 = xray.Color3;
var Camera = xray.Camera;
var Sampler = xray.Sampler;
var xRayTracer = (function () {
    function xRayTracer(data) {
        this.iterations = 1;
        this.samplesPerPixel = 1;
        this.stratifiedSampling = true;
        if (data) {
            this.init(data);
        }
    }
    xRayTracer.prototype.init = function (data) {
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
        if (!this.sampler) {
            this.sampler = xray.NewSampler(4, 4);
        }
    };
    xRayTracer.prototype.updateRenderRegion = function (width, height, xoffset, yoffset) {
        this.width = width;
        this.height = height;
        this.xoffset = xoffset;
        this.yoffset = yoffset;
        this.absCameraSamples = Math.round(Math.abs(this.cameraSamples));
    };
    xRayTracer.prototype.lock = function () {
        if (!this.locked) {
            this.locked = true;
            postMessage("LOCKED");
        }
    };
    xRayTracer.prototype.trace = function (data) {
        if (this.flags[this.id] === 2) {
            console.log("exit:1");
            this.lock();
            return;
        }
        this.updateRenderRegion(data.rect.width, data.rect.height, data.rect.xoffset, data.rect.yoffset);
        this.cameraSamples = data.cameraSamples || this.cameraSamples;
        this.hitSamples = data.hitSamples || this.hitSamples;
        this.iterations = data.init_iterations || 0;
        if (this.locked) {
            console.log("restarted:" + this.iterations, "samples:" + this.checkSamples());
            this.locked = false;
        }
        if (this.iterations > 0 && data.blockIterations) {
            for (var i = 0; i < data.blockIterations; i++) {
                if (this.flags[this.id] === 2) {
                    this.lock();
                    return false;
                }
                this.run();
            }
        }
        else {
            if (this.flags[this.id] === 2) {
                this.lock();
                return false;
            }
            this.run();
        }
        if (this.flags[this.id] === 2) {
            this.lock();
            return false;
        }
        return true;
    };
    xRayTracer.prototype.run = function () {
        var scene = this.scene;
        var camera = this.camera;
        var sampler = this.sampler;
        var buf = this.buffer;
        var spp = this.samplesPerPixel;
        var sppRoot = Math.round(Math.sqrt(this.samplesPerPixel));
        this.iterations++;
        var hitSamples = this.hitSamples;
        var cameraSamples = this.cameraSamples;
        var absCameraSamples = this.absCameraSamples;
        if (this.iterations == 1) {
            hitSamples = 1;
            cameraSamples = -1;
            absCameraSamples = Math.round(Math.abs(cameraSamples));
        }
        for (var y = this.yoffset; y < this.yoffset + this.height; y++) {
            for (var x = this.xoffset; x < this.xoffset + this.width; x++) {
                if (this.flags[this.id] === 2) {
                    console.log("exit:3");
                    this.lock();
                    return;
                }
                var c = new Color3();
                if (this.stratifiedSampling) {
                    for (var u = 0; u < sppRoot; u++) {
                        for (var v = 0; v < sppRoot; v++) {
                            var fu = (u + 0.5) / sppRoot;
                            var fv = (v + 0.5) / sppRoot;
                            var ray = Camera.CastRay(camera, x, y, this.full_width, this.full_height, fu, fv);
                            var sample = sampler.sample(scene, ray, true, sampler.firstHitSamples, 1);
                            c = c.add(sample);
                        }
                    }
                    c = c.divScalar(sppRoot * sppRoot);
                }
                else {
                    for (var i = 0; i < spp; i++) {
                        var fu = Math.random();
                        var fv = Math.random();
                        var ray = Camera.CastRay(camera, x, y, this.full_width, this.full_height, fu, fv);
                        var sample = sampler.sample(scene, ray, true, sampler.firstHitSamples, 1);
                        c = c.add(sample);
                    }
                    c = c.divScalar(spp);
                }
                c = c.pow(1 / 2.2);
                var screen_index = (y * (this.full_width * 3)) + (x * 3);
                this.updatePixel(c, screen_index);
            }
        }
    };
    xRayTracer.prototype.updatePixel = function (color, si) {
        if (this.flags[this.id] === 2) {
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
    };
    xRayTracer.prototype.checkSamples = function () {
        for (var y = this.yoffset; y < this.yoffset + this.height; y++) {
            for (var x = this.xoffset; x < this.xoffset + this.width; x++) {
                var si = (y * (this.full_width * 3)) + (x * 3);
                if (this.sampleMemory[si] !== 0 &&
                    this.sampleMemory[si + 1] !== 0 &&
                    this.sampleMemory[si + 2] !== 0) {
                    return "NOT_OK";
                }
            }
        }
        return "OK";
    };
    return xRayTracer;
}());
exports.xRayTracer = xRayTracer;
//# sourceMappingURL=xray-tracer.js.map