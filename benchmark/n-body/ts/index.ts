"use strict";

declare type float64 = number;
declare type int32   = number;
declare type uint32  = number;

var sqrt64 = Math.sqrt;

var PI: float64 = 3.141592653589793;
var SOLAR_MASS: float64 = 4 * PI * PI;
var DAYS_PER_YEAR: float64 = 365.24;

class Body {
    public x: float64;
    public y: float64;
    public z: float64;
    public vx: float64;
    public vy: float64;
    public vz: float64;
    public mass: float64;

    constructor(
        x: float64,
        y: float64,
        z: float64,
        vx: float64,
        vy: float64,
        vz: float64,
        mass: float64
    ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.mass = mass;
    }

    offsetMomentum(px: float64, py: float64, pz: float64): this {
        this.vx = -px / SOLAR_MASS;
        this.vy = -py / SOLAR_MASS;
        this.vz = -pz / SOLAR_MASS;
        return this;
    }
}

function Jupiter(): Body {
    return new Body(
        4.84143144246472090e+00,
        -1.16032004402742839e+00,
        -1.03622044471123109e-01,
        1.66007664274403694e-03 * DAYS_PER_YEAR,
        7.69901118419740425e-03 * DAYS_PER_YEAR,
        -6.90460016972063023e-05 * DAYS_PER_YEAR,
        9.54791938424326609e-04 * SOLAR_MASS
    );
}

function Saturn(): Body {
    return new Body(
        8.34336671824457987e+00,
        4.12479856412430479e+00,
        -4.03523417114321381e-01,
        -2.76742510726862411e-03 * DAYS_PER_YEAR,
        4.99852801234917238e-03 * DAYS_PER_YEAR,
        2.30417297573763929e-05 * DAYS_PER_YEAR,
        2.85885980666130812e-04 * SOLAR_MASS
    );
}

function Uranus(): Body {
    return new Body(
        1.28943695621391310e+01,
        -1.51111514016986312e+01,
        -2.23307578892655734e-01,
        2.96460137564761618e-03 * DAYS_PER_YEAR,
        2.37847173959480950e-03 * DAYS_PER_YEAR,
        -2.96589568540237556e-05 * DAYS_PER_YEAR,
        4.36624404335156298e-05 * SOLAR_MASS
    );
}

function Neptune(): Body {
    return new Body(
        1.53796971148509165e+01,
        -2.59193146099879641e+01,
        1.79258772950371181e-01,
        2.68067772490389322e-03 * DAYS_PER_YEAR,
        1.62824170038242295e-03 * DAYS_PER_YEAR,
        -9.51592254519715870e-05 * DAYS_PER_YEAR,
        5.15138902046611451e-05 * SOLAR_MASS
    );
}

function Sun(): Body {
    return new Body(
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, SOLAR_MASS
    );
}

class NBodySystem {
    public bodies: Array< Body >;
    constructor(bodies: Array< Body >) {
        var px: float64 = 0.0;
        var py: float64 = 0.0;
        var pz: float64 = 0.0;
        var size: uint32 = bodies.length;
        for (var i: uint32 = 0; i < size; i++) {
            var b: Body    = bodies[i];
            var m: float64 = b.mass;
            px += b.vx * m;
            py += b.vy * m;
            pz += b.vz * m;
        }
        this.bodies = bodies;
        this.bodies[0].offsetMomentum(px, py, pz);
    }

    advance(dt: float64): void {
        var dx: float64,
            dy: float64,
            dz: float64,
            ix: float64,
            iy: float64,
            iz: float64,
            bivx: float64,
            bivy: float64,
            bivz: float64,
            distance: float64,
            mag: float64;

        var bodies: Array< Body > = this.bodies;
        var size: uint32 = bodies.length;

        for (var i = 0; i < size; ++i) {
            var bodyi: Body = bodies[i];

            ix = bodyi.x;
            iy = bodyi.y;
            iz = bodyi.z;

            bivx = bodyi.vx;
            bivy = bodyi.vy;
            bivz = bodyi.vz;

            var bodyim: float64 = bodyi.mass;
            for (var j: uint32 = i + 1; j < size; ++j) {
                var bodyj: Body = bodies[j];
                dx = ix - bodyj.x;
                dy = iy - bodyj.y;
                dz = iz - bodyj.z;

                var distanceSq = dx * dx + dy * dy + dz * dz;
                distance = sqrt64(distanceSq);
                mag = dt / (distanceSq * distance);

                var bim = bodyim * mag;
                var bjm = bodyj.mass * mag;

                bivx -= dx * bjm;
                bivy -= dy * bjm;
                bivz -= dz * bjm;

                bodyj.vx += dx * bim;
                bodyj.vy += dy * bim;
                bodyj.vz += dz * bim;
            }

            bodyi.vx = bivx;
            bodyi.vy = bivy;
            bodyi.vz = bivz;

            bodyi.x += dt * bivx;
            bodyi.y += dt * bivy;
            bodyi.z += dt * bivz;
        }
    }

    energy(): float64 {
        var dx: float64, dy: float64, dz: float64, distance: float64;
        var ix: float64, iy: float64, iz: float64, vx: float64, vy: float64, vz: float64, bim: float64;
        var e : float64 = 0.0;
        var bodies: Array< Body > = this.bodies;
        var size: uint32 = bodies.length;

        for (var i: uint32 = 0; i < size; ++i) {
            var bodyi: Body = bodies[i];

            ix = bodyi.x;
            iy = bodyi.y;
            iz = bodyi.z;

            vx = bodyi.vx;
            vy = bodyi.vy;
            vz = bodyi.vz;

            bim = bodyi.mass;

            e += 0.5 * bim * (vx * vx + vy * vy + vz * vz);

            for (var j = i + 1; j < size; ++j) {
                var bodyj: Body = bodies[j];
                dx = ix - bodyj.x;
                dy = iy - bodyj.y;
                dz = iz - bodyj.z;

                distance = sqrt64(dx * dx + dy * dy + dz * dz);
                e -= bim * bodyj.mass / distance;
            }
        }
        return e;
    }
}

export function test(n: uint32): float64 {
    var bodies: NBodySystem = new NBodySystem(new Array< Body >(Sun(), Jupiter(), Saturn(), Uranus(), Neptune()));
    for (var i: uint32 = 0; i < n; i++) {
        bodies.advance(0.01);
    }
    return bodies.energy();
}

/*
var n: uint32 = 500000;

console.time('t');
var bodies: NBodySystem = new NBodySystem(new Array< Body >(Sun(), Jupiter(), Saturn(), Uranus(), Neptune()));

//console.log(bodies.energy().toFixed(9));
for (var i: uint32 = 0; i < n; i++) {
    bodies.advance(0.01);
}
//console.log(bodies.energy().toFixed(9));

// -0.169075164
// -0.169096567

console.timeEnd('t');
*/
