var rpgSimulator;
(function (rpgSimulator) {
    class Sky extends Phaser.Group {
        constructor(game) {
            super(game);
            this.game = game;
            this.create();
        }
        create() {
            this.game.stage.backgroundColor = '#D5EDF7';
            var sun = this.game.add.sprite(350, 100, 'bgElements', 'sun.png');
            var clouds1 = this.game.add.sprite(0, 250, 'bgElements', 'clouds2.png');
            var hill1 = this.game.add.sprite(0, 430, 'bgElements', 'hills1.png');
            var hill2x1 = this.game.add.sprite(198, 473, 'bgElements', 'hills2.png');
            var hill2x2 = this.game.add.sprite(-600, 473, 'bgElements', 'hills2.png');
            clouds1.width = this.game.width;
            hill1.width = this.game.width;
            hill2x1.width = this.game.width;
            hill2x2.width = this.game.width;
            hill1.tint = 0xD5E7C4;
            hill2x1.tint = 0xBAD0A4;
            hill2x2.tint = 0xBAD0A4;
            sun.fixedToCamera = true;
            clouds1.fixedToCamera = true;
            hill1.fixedToCamera = true;
            hill2x1.fixedToCamera = true;
            hill2x2.fixedToCamera = true;
        }
    }
    rpgSimulator.Sky = Sky;
})(rpgSimulator || (rpgSimulator = {}));
/*
 * A speed-improved simplex noise algorithm for 2D, 3D and 4D in JavaScript.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 */
class FastSimplexNoise {
    constructor(options = {}) {
        if (options.hasOwnProperty('amplitude')) {
            if (typeof options.amplitude !== 'number')
                throw new Error('options.amplitude must be a number');
            this.amplitude = options.amplitude;
        }
        else
            this.amplitude = 1.0;
        if (options.hasOwnProperty('frequency')) {
            if (typeof options.frequency !== 'number')
                throw new Error('options.frequency must be a number');
            this.frequency = options.frequency;
        }
        else
            this.frequency = 1.0;
        if (options.hasOwnProperty('octaves')) {
            if (typeof options.octaves !== 'number' ||
                !isFinite(options.octaves) ||
                Math.floor(options.octaves) !== options.octaves) {
                throw new Error('options.octaves must be an integer');
            }
            this.octaves = options.octaves;
        }
        else
            this.octaves = 1;
        if (options.hasOwnProperty('persistence')) {
            if (typeof options.persistence !== 'number')
                throw new Error('options.persistence must be a number');
            this.persistence = options.persistence;
        }
        else
            this.persistence = 0.5;
        if (options.hasOwnProperty('random')) {
            if (typeof options.random !== 'function')
                throw new Error('options.random must be a function');
            this.random = options.random;
        }
        else
            this.random = Math.random;
        let min;
        if (options.hasOwnProperty('min')) {
            if (typeof options.min !== 'number')
                throw new Error('options.min must be a number');
            min = options.min;
        }
        else
            min = -1;
        let max;
        if (options.hasOwnProperty('max')) {
            if (typeof options.max !== 'number')
                throw new Error('options.max must be a number');
            max = options.max;
        }
        else
            max = 1;
        if (min >= max)
            throw new Error(`options.min (${min}) must be less than options.max (${max})`);
        this.scale = min === -1 && max === 1
            ? value => value
            : value => min + ((value + 1) / 2) * (max - min);
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++)
            p[i] = i;
        let n;
        let q;
        for (let i = 255; i > 0; i--) {
            n = Math.floor((i + 1) * this.random());
            q = p[i];
            p[i] = p[n];
            p[n] = q;
        }
        this.perm = new Uint8Array(512);
        this.permMod12 = new Uint8Array(512);
        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }
    }
    cylindrical(circumference, coords) {
        switch (coords.length) {
            case 2: return this.cylindrical2D(circumference, coords[0], coords[1]);
            case 3: return this.cylindrical3D(circumference, coords[0], coords[1], coords[2]);
            default: return null;
        }
    }
    cylindrical2D(circumference, x, y) {
        const nx = x / circumference;
        const r = circumference / (2 * Math.PI);
        const rdx = nx * 2 * Math.PI;
        const a = r * Math.sin(rdx);
        const b = r * Math.cos(rdx);
        return this.scaled3D(a, b, y);
    }
    cylindrical3D(circumference, x, y, z) {
        const nx = x / circumference;
        const r = circumference / (2 * Math.PI);
        const rdx = nx * 2 * Math.PI;
        const a = r * Math.sin(rdx);
        const b = r * Math.cos(rdx);
        return this.scaled4D(a, b, y, z);
    }
    dot(gs, coords) {
        return gs
            .slice(0, Math.min(gs.length, coords.length))
            .reduce((total, g, i) => total + (g * coords[i]), 0);
    }
    raw(coords) {
        switch (coords.length) {
            case 2: return this.raw2D(coords[0], coords[1]);
            case 3: return this.raw3D(coords[0], coords[1], coords[2]);
            case 4: return this.raw4D(coords[0], coords[1], coords[2], coords[3]);
            default: return null;
        }
    }
    raw2D(x, y) {
        // Skew the input space to determine which simplex cell we're in
        const s = (x + y) * 0.5 * (Math.sqrt(3.0) - 1.0); // Hairy factor for 2D
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const t = (i + j) * FastSimplexNoise.G2;
        const X0 = i - t; // Unskew the cell origin back to (x,y) space
        const Y0 = j - t;
        const x0 = x - X0; // The x,y distances from the cell origin
        const y0 = y - Y0;
        // Determine which simplex we are in.
        const i1 = x0 > y0 ? 1 : 0;
        const j1 = x0 > y0 ? 0 : 1;
        // Offsets for corners
        const x1 = x0 - i1 + FastSimplexNoise.G2;
        const y1 = y0 - j1 + FastSimplexNoise.G2;
        const x2 = x0 - 1.0 + 2.0 * FastSimplexNoise.G2;
        const y2 = y0 - 1.0 + 2.0 * FastSimplexNoise.G2;
        // Work out the hashed gradient indices of the three simplex corners
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.permMod12[ii + this.perm[jj]];
        const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
        const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
        // Calculate the contribution from the three corners
        const t0 = 0.5 - x0 * x0 - y0 * y0;
        const n0 = t0 < 0 ? 0.0 : Math.pow(t0, 4) * this.dot(FastSimplexNoise.GRAD3D[gi0], [x0, y0]);
        const t1 = 0.5 - x1 * x1 - y1 * y1;
        const n1 = t1 < 0 ? 0.0 : Math.pow(t1, 4) * this.dot(FastSimplexNoise.GRAD3D[gi1], [x1, y1]);
        const t2 = 0.5 - x2 * x2 - y2 * y2;
        const n2 = t2 < 0 ? 0.0 : Math.pow(t2, 4) * this.dot(FastSimplexNoise.GRAD3D[gi2], [x2, y2]);
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1, 1]
        return 70.14805770653952 * (n0 + n1 + n2);
    }
    raw3D(x, y, z) {
        // Skew the input space to determine which simplex cell we're in
        const s = (x + y + z) / 3.0; // Very nice and simple skew factor for 3D
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const k = Math.floor(z + s);
        const t = (i + j + k) * FastSimplexNoise.G3;
        const X0 = i - t; // Unskew the cell origin back to (x,y,z) space
        const Y0 = j - t;
        const Z0 = k - t;
        const x0 = x - X0; // The x,y,z distances from the cell origin
        const y0 = y - Y0;
        const z0 = z - Z0;
        // Deterine which simplex we are in
        let i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        let i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = i2 = j2 = 1;
                j1 = k1 = k2 = 0;
            }
            else if (x0 >= z0) {
                i1 = i2 = k2 = 1;
                j1 = k1 = j2 = 0;
            }
            else {
                k1 = i2 = k2 = 1;
                i1 = j1 = j2 = 0;
            }
        }
        else {
            if (y0 < z0) {
                k1 = j2 = k2 = 1;
                i1 = j1 = i2 = 0;
            }
            else if (x0 < z0) {
                j1 = j2 = k2 = 1;
                i1 = k1 = i2 = 0;
            }
            else {
                j1 = i2 = j2 = 1;
                i1 = k1 = k2 = 0;
            }
        }
        const x1 = x0 - i1 + FastSimplexNoise.G3; // Offsets for second corner in (x,y,z) coords
        const y1 = y0 - j1 + FastSimplexNoise.G3;
        const z1 = z0 - k1 + FastSimplexNoise.G3;
        const x2 = x0 - i2 + 2.0 * FastSimplexNoise.G3; // Offsets for third corner in (x,y,z) coords
        const y2 = y0 - j2 + 2.0 * FastSimplexNoise.G3;
        const z2 = z0 - k2 + 2.0 * FastSimplexNoise.G3;
        const x3 = x0 - 1.0 + 3.0 * FastSimplexNoise.G3; // Offsets for last corner in (x,y,z) coords
        const y3 = y0 - 1.0 + 3.0 * FastSimplexNoise.G3;
        const z3 = z0 - 1.0 + 3.0 * FastSimplexNoise.G3;
        // Work out the hashed gradient indices of the four simplex corners
        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
        const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
        const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
        const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];
        // Calculate the contribution from the four corners
        const t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
        const n0 = t0 < 0 ? 0.0 : Math.pow(t0, 4) * this.dot(FastSimplexNoise.GRAD3D[gi0], [x0, y0, z0]);
        const t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
        const n1 = t1 < 0 ? 0.0 : Math.pow(t1, 4) * this.dot(FastSimplexNoise.GRAD3D[gi1], [x1, y1, z1]);
        const t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
        const n2 = t2 < 0 ? 0.0 : Math.pow(t2, 4) * this.dot(FastSimplexNoise.GRAD3D[gi2], [x2, y2, z2]);
        const t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
        const n3 = t3 < 0 ? 0.0 : Math.pow(t3, 4) * this.dot(FastSimplexNoise.GRAD3D[gi3], [x3, y3, z3]);
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to stay just inside [-1,1]
        return 94.68493150681972 * (n0 + n1 + n2 + n3);
    }
    raw4D(x, y, z, w) {
        // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
        const s = (x + y + z + w) * (Math.sqrt(5.0) - 1.0) / 4.0; // Factor for 4D skewing
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);
        const k = Math.floor(z + s);
        const l = Math.floor(w + s);
        const t = (i + j + k + l) * FastSimplexNoise.G4; // Factor for 4D unskewing
        const X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
        const Y0 = j - t;
        const Z0 = k - t;
        const W0 = l - t;
        const x0 = x - X0; // The x,y,z,w distances from the cell origin
        const y0 = y - Y0;
        const z0 = z - Z0;
        const w0 = w - W0;
        // To find out which of the 24 possible simplices we're in, we need to determine the magnitude ordering of x0, y0,
        // z0 and w0. Six pair-wise comparisons are performed between each possible pair of the four coordinates, and the
        // results are used to rank the numbers.
        let rankx = 0;
        let ranky = 0;
        let rankz = 0;
        let rankw = 0;
        if (x0 > y0)
            rankx++;
        else
            ranky++;
        if (x0 > z0)
            rankx++;
        else
            rankz++;
        if (x0 > w0)
            rankx++;
        else
            rankw++;
        if (y0 > z0)
            ranky++;
        else
            rankz++;
        if (y0 > w0)
            ranky++;
        else
            rankw++;
        if (z0 > w0)
            rankz++;
        else
            rankw++;
        // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
        // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
        // impossible. Only the 24 indices which have non-zero entries make any sense.
        // We use a thresholding to set the coordinates in turn from the largest magnitude.
        // Rank 3 denotes the largest coordinate.
        const i1 = rankx >= 3 ? 1 : 0;
        const j1 = ranky >= 3 ? 1 : 0;
        const k1 = rankz >= 3 ? 1 : 0;
        const l1 = rankw >= 3 ? 1 : 0;
        // Rank 2 denotes the second largest coordinate.
        const i2 = rankx >= 2 ? 1 : 0;
        const j2 = ranky >= 2 ? 1 : 0;
        const k2 = rankz >= 2 ? 1 : 0;
        const l2 = rankw >= 2 ? 1 : 0;
        // Rank 1 denotes the second smallest coordinate.
        const i3 = rankx >= 1 ? 1 : 0;
        const j3 = ranky >= 1 ? 1 : 0;
        const k3 = rankz >= 1 ? 1 : 0;
        const l3 = rankw >= 1 ? 1 : 0;
        // The fifth corner has all coordinate offsets = 1, so no need to compute that.
        const x1 = x0 - i1 + FastSimplexNoise.G4; // Offsets for second corner in (x,y,z,w) coords
        const y1 = y0 - j1 + FastSimplexNoise.G4;
        const z1 = z0 - k1 + FastSimplexNoise.G4;
        const w1 = w0 - l1 + FastSimplexNoise.G4;
        const x2 = x0 - i2 + 2.0 * FastSimplexNoise.G4; // Offsets for third corner in (x,y,z,w) coords
        const y2 = y0 - j2 + 2.0 * FastSimplexNoise.G4;
        const z2 = z0 - k2 + 2.0 * FastSimplexNoise.G4;
        const w2 = w0 - l2 + 2.0 * FastSimplexNoise.G4;
        const x3 = x0 - i3 + 3.0 * FastSimplexNoise.G4; // Offsets for fourth corner in (x,y,z,w) coords
        const y3 = y0 - j3 + 3.0 * FastSimplexNoise.G4;
        const z3 = z0 - k3 + 3.0 * FastSimplexNoise.G4;
        const w3 = w0 - l3 + 3.0 * FastSimplexNoise.G4;
        const x4 = x0 - 1.0 + 4.0 * FastSimplexNoise.G4; // Offsets for last corner in (x,y,z,w) coords
        const y4 = y0 - 1.0 + 4.0 * FastSimplexNoise.G4;
        const z4 = z0 - 1.0 + 4.0 * FastSimplexNoise.G4;
        const w4 = w0 - 1.0 + 4.0 * FastSimplexNoise.G4;
        // Work out the hashed gradient indices of the five simplex corners
        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        const ll = l & 255;
        const gi0 = this.perm[ii + this.perm[jj + this.perm[kk + this.perm[ll]]]] % 32;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1 + this.perm[ll + l1]]]] % 32;
        const gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2 + this.perm[ll + l2]]]] % 32;
        const gi3 = this.perm[ii + i3 + this.perm[jj + j3 + this.perm[kk + k3 + this.perm[ll + l3]]]] % 32;
        const gi4 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1 + this.perm[ll + 1]]]] % 32;
        // Calculate the contribution from the five corners
        const t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
        const n0 = t0 < 0 ? 0.0 : Math.pow(t0, 4) * this.dot(FastSimplexNoise.GRAD4D[gi0], [x0, y0, z0, w0]);
        const t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
        const n1 = t1 < 0 ? 0.0 : Math.pow(t1, 4) * this.dot(FastSimplexNoise.GRAD4D[gi1], [x1, y1, z1, w1]);
        const t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
        const n2 = t2 < 0 ? 0.0 : Math.pow(t2, 4) * this.dot(FastSimplexNoise.GRAD4D[gi2], [x2, y2, z2, w2]);
        const t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
        const n3 = t3 < 0 ? 0.0 : Math.pow(t3, 4) * this.dot(FastSimplexNoise.GRAD4D[gi3], [x3, y3, z3, w3]);
        const t4 = 0.5 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
        const n4 = t4 < 0 ? 0.0 : Math.pow(t4, 4) * this.dot(FastSimplexNoise.GRAD4D[gi4], [x4, y4, z4, w4]);
        // Sum up and scale the result to cover the range [-1,1]
        return 72.37855765153665 * (n0 + n1 + n2 + n3 + n4);
    }
    scaled(coords) {
        switch (coords.length) {
            case 2: return this.scaled2D(coords[0], coords[1]);
            case 3: return this.scaled3D(coords[0], coords[1], coords[2]);
            case 4: return this.scaled4D(coords[0], coords[1], coords[2], coords[3]);
            default: return null;
        }
    }
    scaled2D(x, y) {
        let amplitude = this.amplitude;
        let frequency = this.frequency;
        let maxAmplitude = 0;
        let noise = 0;
        for (let i = 0; i < this.octaves; i++) {
            noise += this.raw2D(x * frequency, y * frequency) * amplitude;
            maxAmplitude += amplitude;
            amplitude *= this.persistence;
            frequency *= 2;
        }
        return this.scale(noise / maxAmplitude);
    }
    scaled3D(x, y, z) {
        let amplitude = this.amplitude;
        let frequency = this.frequency;
        let maxAmplitude = 0;
        let noise = 0;
        for (let i = 0; i < this.octaves; i++) {
            noise += this.raw3D(x * frequency, y * frequency, z * frequency) * amplitude;
            maxAmplitude += amplitude;
            amplitude *= this.persistence;
            frequency *= 2;
        }
        return this.scale(noise / maxAmplitude);
    }
    scaled4D(x, y, z, w) {
        let amplitude = this.amplitude;
        let frequency = this.frequency;
        let maxAmplitude = 0;
        let noise = 0;
        for (let i = 0; i < this.octaves; i++) {
            noise += this.raw4D(x * frequency, y * frequency, z * frequency, w * frequency) * amplitude;
            maxAmplitude += amplitude;
            amplitude *= this.persistence;
            frequency *= 2;
        }
        return this.scale(noise / maxAmplitude);
    }
    spherical(circumference, coords) {
        switch (coords.length) {
            case 3: return this.spherical3D(circumference, coords[0], coords[1], coords[2]);
            case 2: return this.spherical2D(circumference, coords[0], coords[1]);
            default: return null;
        }
    }
    spherical2D(circumference, x, y) {
        const nx = x / circumference;
        const ny = y / circumference;
        const rdx = nx * 2 * Math.PI;
        const rdy = ny * Math.PI;
        const sinY = Math.sin(rdy + Math.PI);
        const sinRds = 2 * Math.PI;
        const a = sinRds * Math.sin(rdx) * sinY;
        const b = sinRds * Math.cos(rdx) * sinY;
        const d = sinRds * Math.cos(rdy);
        return this.scaled3D(a, b, d);
    }
    spherical3D(circumference, x, y, z) {
        const nx = x / circumference;
        const ny = y / circumference;
        const rdx = nx * 2 * Math.PI;
        const rdy = ny * Math.PI;
        const sinY = Math.sin(rdy + Math.PI);
        const sinRds = 2 * Math.PI;
        const a = sinRds * Math.sin(rdx) * sinY;
        const b = sinRds * Math.cos(rdx) * sinY;
        const d = sinRds * Math.cos(rdy);
        return this.scaled4D(a, b, d, z);
    }
}
FastSimplexNoise.G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
FastSimplexNoise.G3 = 1.0 / 6.0;
FastSimplexNoise.G4 = (5.0 - Math.sqrt(5.0)) / 20.0;
FastSimplexNoise.GRAD3D = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, -1], [0, 1, -1], [0, -1, -1]
];
FastSimplexNoise.GRAD4D = [
    [0, 1, 1, 1], [0, 1, 1, -1], [0, 1, -1, 1], [0, 1, -1, -1],
    [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1],
    [1, 0, 1, 1], [1, 0, 1, -1], [1, 0, -1, 1], [1, 0, -1, -1],
    [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1],
    [1, 1, 0, 1], [1, 1, 0, -1], [1, -1, 0, 1], [1, -1, 0, -1],
    [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1],
    [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0],
    [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]
];
///<reference path="../lib/FastSimplexNoise.ts" />
var rpgSimulator;
(function (rpgSimulator) {
    var BlockType;
    (function (BlockType) {
        BlockType[BlockType["dirt_grass"] = 0] = "dirt_grass";
        BlockType[BlockType["dirt"] = 1] = "dirt";
        BlockType[BlockType["gnome"] = 2] = "gnome";
        BlockType[BlockType["zombie"] = 3] = "zombie";
        BlockType[BlockType["alien"] = 4] = "alien";
        BlockType[BlockType["skeleton"] = 5] = "skeleton";
    })(BlockType = rpgSimulator.BlockType || (rpgSimulator.BlockType = {}));
    class World extends Phaser.Group {
        constructor(game) {
            super(game);
            this.BLOCKS = [];
            this.worldSize = 50;
            this.size = 32;
            this.generate();
        }
        generate() {
            var hillNoise = new FastSimplexNoise({ amplitude: 64, persistence: 0.5, frequency: .001, octaves: 3 });
            // var hillNoise = new FastSimplexNoise({ amplitude:1, persistence:0.25, frequency: 1, octaves: 6 })
            for (var i = 0; i < this.worldSize; i++) {
                var totalX = i + (this.worldSize * (this.size * i));
                var freq = 1 / (this.worldSize * 1.25);
                var v = hillNoise.scaled([totalX * freq, totalX * freq]);
                var _y = Math.round((v * 25) + 24);
                // var _y = Math.round((v * 25) + 24);
                // float v = simplex.noise
                // var _y=simplex.noise2D(size*i, size*i);
                // hardcode force from bottom screen
                // var y = this.game.height-Math.round((200*_y)/size)*size;
                if (typeof this.BLOCKS[i] == 'undefined') {
                    this.BLOCKS[i] = [];
                }
                this.BLOCKS[i][_y] = BlockType.dirt_grass;
                var groundBlock = this.game.add.sprite(i * this.size, _y * this.size, 'tiles', 'dirt_grass.png');
                this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
                groundBlock.width = this.size;
                groundBlock.height = this.size;
                groundBlock.body.immovable = true;
                groundBlock.body.allowGravity = false;
                this.add(groundBlock);
                for (var j = _y + 1; j < this.worldSize; j++) {
                    this.BLOCKS[i][j] = BlockType.dirt;
                    var groundBlock = this.game.add.sprite(i * this.size, j * this.size, 'tiles', 'dirt.png');
                    this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
                    groundBlock.width = this.size;
                    groundBlock.height = this.size;
                    groundBlock.body.immovable = true;
                    groundBlock.body.allowGravity = false;
                    this.add(groundBlock);
                }
                // for(y+=32;y < this.game.height*2;y+=32){
                //   var groundBlock = this.game.add.sprite(i*size, y, 'tiles', 'dirt.png');
                //   this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
                //   groundBlock.width = 32;
                //   groundBlock.height = 32;
                //   groundBlock.body.immovable = true;
                //   groundBlock.body.allowGravity = false;
                //   this.add(groundBlock);
                // }
                // }
            }
        }
        getBound() {
            return this.worldSize * this.size;
        }
        getSpawnPosition() {
            var mid = Math.round(this.worldSize / 2);
            var _ypos = Object.keys(this.BLOCKS[mid])[0];
            return { x: mid * this.size, y: _ypos * this.size };
        }
    }
    rpgSimulator.World = World;
})(rpgSimulator || (rpgSimulator = {}));
var rpgSimulator;
(function (rpgSimulator) {
    var PlayerState;
    (function (PlayerState) {
        PlayerState[PlayerState["IDLE"] = 0] = "IDLE";
        PlayerState[PlayerState["WALK"] = 1] = "WALK";
        PlayerState[PlayerState["JUMP"] = 2] = "JUMP";
        PlayerState[PlayerState["FALL"] = 3] = "FALL";
    })(PlayerState = rpgSimulator.PlayerState || (rpgSimulator.PlayerState = {}));
    var CharacterType;
    (function (CharacterType) {
        CharacterType[CharacterType["male"] = 0] = "male";
        CharacterType[CharacterType["female"] = 1] = "female";
        CharacterType[CharacterType["gnome"] = 2] = "gnome";
        CharacterType[CharacterType["zombie"] = 3] = "zombie";
        CharacterType[CharacterType["alien"] = 4] = "alien";
        CharacterType[CharacterType["skeleton"] = 5] = "skeleton";
    })(CharacterType = rpgSimulator.CharacterType || (rpgSimulator.CharacterType = {}));
    class Player extends Phaser.Sprite {
        constructor(game, x, y, type) {
            super(game, x, y);
            this.AnimationName = ["idle", "walk", "jump", "fall"];
            //public static WALK_SPEED: number = 30;
            //public static RUN_SPEED: number = 50;
            //jump: number = -400;
            this.MAX_SPEED = 200; // pixels/second
            this.ACCELERATION = 1500; // pixels/second/second
            this.DRAG = 600; // pixels/second
            this.JUMP_SPEED = -700; // pixels/second (negative y is up)
            this.jumps = 2;
            this.jumping = false;
            this.x = x;
            this.y = y;
            this.game = game;
            this.dragonBonesPlugin = this.game.plugins.add(Rift.DragonBonesPlugin);
            this.characterType = type;
            this.create();
        }
        create() {
            //this.RIGHT_ARROW = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
            //this.RIGHT_ARROW.onDown.add(Player.prototype.MoveRight, this);
            //this.LEFT_ARROW = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
            //this.LEFT_ARROW.onDown.add(Player.prototype.MoveLessRight, this);
            // perlu re-pos gnome,alien
            this.sprite = this.dragonBonesPlugin.getArmature("key");
            this.sprite.scale.setTo(0.4);
            this.anchor.set(0.4, 1.4);
            this.addChild(this.sprite);
            this.game.physics.arcade.enable(this, false);
            this.body.width = 25;
            this.body.height = 65; // 80
            this.body.collideWorldBounds = true;
            this.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10);
            this.body.drag.setTo(this.DRAG, 0);
            //var names = sprite.animation._animationNames;
            this.sprite.animation.play(this.AnimationName[PlayerState.IDLE], null, true);
            this.scale.set(-1, 1);
            this.is_emitted = false;
            //this.addChild(this.game.add.sprite(0, 0, "player", CharacterType[this.characterType] + "_head.png"));
            //this.addChild(this.game.add.sprite(13, 63, "player", CharacterType[this.characterType] + "_arm.png"));
            //this.addChild(this.game.add.sprite(13, 121, "player", CharacterType[this.characterType] + "_leg.png"));
            //this.addChild(this.game.add.sprite(13, 63, "player", CharacterType[this.characterType] + "_body.png"));
            //this.addChild(this.game.add.sprite(29, 121, "player", CharacterType[this.characterType] + "_leg.png"));
            //this.addChild(this.game.add.sprite(29, 63, "player", CharacterType[this.characterType]+ "_arm.png"));
            //this.scale.x = this.scale.y = 1;
            this.shift = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
            this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            this.W = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
            this.A = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
            this.S = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
            this.D = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
            this.cursors = this.game.input.keyboard.createCursorKeys();
            // this.game.input.keyboard.addKeyCapture([
            //     Phaser.Keyboard.W,
            //     Phaser.Keyboard.A,
            //     Phaser.Keyboard.S,
            //     Phaser.Keyboard.D,
            //     Phaser.Keyboard.LEFT,
            //     Phaser.Keyboard.RIGHT,
            //     Phaser.Keyboard.UP,
            //     Phaser.Keyboard.DOWN,
            //     Phaser.Keyboard.SHIFT,
            //     Phaser.Keyboard.SPACEBAR,
            // ]);
            this.emitter = this.game.add.emitter(this.x, this.y);
            this.emitter.makeParticles('particle', ['swirl_white.png', 'square_white.png'], 50, false, true);
            this.emitter.pivot.set(0, -20);
            this.emitter.minParticleSpeed = new Phaser.Point(-20, -40);
            this.emitter.maxParticleSpeed = new Phaser.Point(20, 10);
            this.emitter.minParticleScale = 0.2;
            this.emitter.maxParticleScale = 0.6;
            this.emitter.gravity.y = -this.game.physics.arcade.gravity.y * 1.1;
            this.emitter.flow(400, 200, 1, -1, false);
            this.emitter.on = false;
            this.emitter.angle = 0;
            // console.log(this.emitter.angle)
            this.game.add.existing(this);
        }
        update() {
            this.game.input.update();
            if (this.cursors.down.isDown || this.S.isDown || this.cursors.up.isDown || this.W.isDown || this.cursors.left.isDown || this.A.isDown || this.cursors.right.isDown || this.D.isDown) {
                //if (this.playerState != PlayerState.WALK) {
                //    this.playerState = PlayerState.WALK;
                //    this.sprite.animation.play(this.AnimationName[PlayerState.WALK], null, true);
                //}
                if (this.cursors.left.isDown || this.A.isDown) {
                    this.scale.set(1, 1);
                    if (this.shift.isDown) {
                        this.body.maxVelocity.x = this.MAX_SPEED * 2;
                        this.body.acceleration.x = -this.ACCELERATION;
                    }
                    else {
                        this.body.maxVelocity.x = this.MAX_SPEED;
                        this.body.acceleration.x = -this.ACCELERATION;
                    }
                }
                if (this.cursors.right.isDown || this.D.isDown) {
                    this.scale.set(-1, 1);
                    if (this.shift.isDown) {
                        this.body.maxVelocity.x = this.MAX_SPEED * 2;
                        this.body.acceleration.x = this.ACCELERATION;
                    }
                    else {
                        this.body.maxVelocity.x = this.MAX_SPEED;
                        this.body.acceleration.x = this.ACCELERATION;
                    }
                }
            }
            else {
                this.body.acceleration.x = 0;
            }
            if (this.body.touching.down) {
                this.jumps = 2;
                this.jumping = false;
            }
            //if (this.space.onDown) {
            //    if (this.playerState != PlayerState.WALK) {
            //        this.playerState = PlayerState.JUMP;
            //        this.sprite.animation.play(this.AnimationName[PlayerState.JUMP], null, true);
            //    }
            //}
            // Jump! Keep y velocity constant while the jump button is held for up to 150 ms
            if (this.jumps > 0 && this.game.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR, 150)) {
                this.body.velocity.y = this.JUMP_SPEED;
                this.jumping = true;
            }
            // Reduce the number of available jumps if the jump input is released
            if (this.jumping && this.game.input.keyboard.upDuration(Phaser.Keyboard.SPACEBAR)) {
                this.jumps--;
                this.jumping = false;
            }
            if (this.body.velocity.y != 0) {
                this.emitter.on = false;
                if (this.body.velocity.y < 0 && this.playerState != PlayerState.JUMP) {
                    this.playerState = PlayerState.JUMP;
                    this.sprite.animation.play(this.AnimationName[PlayerState.JUMP], 1);
                }
                if (this.body.velocity.y > 0 && this.playerState != PlayerState.FALL) {
                    this.playerState = PlayerState.FALL;
                    this.sprite.animation.play(this.AnimationName[PlayerState.FALL], 1);
                }
            }
            else if (this.body.velocity.x != 0) {
                if (Math.abs(this.body.velocity.x) > 100 && PlayerState.WALK) {
                    this.emitter.y = this.position.y;
                    this.emitter.x = this.position.x;
                    this.emitter.on = true;
                }
                if (this.playerState != PlayerState.WALK) {
                    this.playerState = PlayerState.WALK;
                    this.sprite.animation.play(this.AnimationName[PlayerState.WALK], null);
                }
            }
            else {
                if (this.playerState != PlayerState.IDLE && this.body.touching.down) {
                    this.emitter.on = false;
                    this.playerState = PlayerState.IDLE;
                    this.sprite.animation.play(this.AnimationName[PlayerState.IDLE], null);
                }
            }
            super.update();
        }
        damaged() {
            this.game.camera.flash(0xff0000, 500);
        }
    }
    rpgSimulator.Player = Player;
})(rpgSimulator || (rpgSimulator = {}));
///<reference path="../GameObjects/Sky.ts" />
///<reference path="../GameObjects/World.ts" />
///<reference path="../GameObjects/Player.ts" />
var rpgSimulator;
(function (rpgSimulator) {
    class MainState extends Phaser.State {
        constructor() {
            super();
            this.GRAVITY = 2600;
            this.prefix = "assets/gfx/player_";
        }
        init() {
            this.dragonBonesPlugin = this.game.plugins.add(Rift.DragonBonesPlugin);
        }
        preload() {
            // console.log(this.game.cache.getJSON('player_skeleton'));
            this.dragonBonesPlugin.addResourceByNames("key", this.prefix + "ske.json", this.prefix + "tex.json", this.prefix + "tex.png");
            this.dragonBonesPlugin.loadResources();
        }
        create() {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.physics.arcade.gravity.y = this.GRAVITY;
            this.game.time.advancedTiming = true;
            this.sky = new rpgSimulator.Sky(this.game);
            // this.game.stage.backgroundColor = '#D5EDF7';
            // var clouds1 = this.game.add.sprite(0, 200, 'bgElements', 'clouds2.png');
            // var hill1 = this.game.add.sprite(0, 350, 'bgElements', 'hills1.png');
            // var hill2x1 = this.game.add.sprite(0, 450, 'bgElements', 'hills2.png');
            // var hill2x2 = this.game.add.sprite(0, 450, 'bgElements', 'hills2.png');
            // clouds1.width = this.game.width;
            // hill1.width = this.game.width;
            // hill2x1.width = this.game.width;
            // hill1.tint = 0xD5E7C4;
            // hill2x1.tint = 0xBAD0A4;
            // clouds1.fixedToCamera = true;
            // hill1.fixedToCamera = true;
            // hill2x1.fixedToCamera = true;
            this.player = new rpgSimulator.Player(this.game, 0, 0, rpgSimulator.CharacterType.male);
            // this.exit = this.game.add.button(this.game.width - 36, 0, "redSheet", () => {
            //   this.BackToMenu();
            // }, this, "red_boxCross.png", "red_boxCross.png");
            this.music = this.game.add.audio("music");
            //this.music.play();
            this.music.volume = 0;
            this.game.add.tween(this.music).to({
                volume: 1
            }, 2000, Phaser.Easing.Quadratic.In, true, 0);
            this.ground = new rpgSimulator.World(this.game);
            // this.game.add.group();
            // for (var x = -800; x < this.game.width+800; x += 32) {
            //   var groundBlock = this.game.add.sprite(x, this.game.height - 32, 'tiles', 'dirt_grass.png');
            //   this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
            //   groundBlock.width = 32;
            //   groundBlock.height = 32;
            //   groundBlock.body.immovable = true;
            //   groundBlock.body.allowGravity = false;
            //   this.ground.add(groundBlock);
            // }
            // this.drawHeightMarkers();
            this.game.world.setBounds(0, 0, this.ground.getBound(), this.ground.getBound());
            var spawnPoint = this.ground.getSpawnPosition();
            this.player.x = spawnPoint.x + 14;
            this.player.y = spawnPoint.y - 20;
            this.game.camera.follow(this.player);
        }
        drawHeightMarkers() {
            var bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
            for (var y = this.game.height - 64; y >= 0; y -= 32) {
                bitmap.context.beginPath();
                bitmap.context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                bitmap.context.moveTo(0, y);
                bitmap.context.lineTo(this.game.width, y);
                bitmap.context.stroke();
            }
            this.game.add.image(0, 0, bitmap);
        }
        ;
        update() {
            this.game.physics.arcade.collide(this.player, this.ground);
        }
        render() {
            this.game.debug.text(this.game.time.fps.toString(), 2, 14, "#00ff00");
            this.game.debug.text(rpgSimulator.PlayerState[this.player.playerState] + "", 2, 30, "#00ff00");
            this.game.debug.text(this.player.body.velocity, 2, 50, "#00ff00");
            this.game.debug.cameraInfo(this.game.camera, 2, 70, "#00ff00");
            // this.game.debug.bodyInfo(this.player, 32, 32);
            // this.game.debug.body(this.player);
        }
        BackToMenu() {
            this.game.state.start("TitleState", true, false);
        }
        shake() {
            this.game.camera.shake(0.05, 500);
        }
        shutdown() {
            this.music.stop();
        }
    }
    rpgSimulator.MainState = MainState;
})(rpgSimulator || (rpgSimulator = {}));
var rpgSimulator;
(function (rpgSimulator) {
    class TitleState extends Phaser.State {
        constructor() {
            super();
        }
        preload() {
            this.slickUI = this.game.plugins.add(Phaser.Plugin.SlickUI);
            this.game.load.image("title", "assets/gfx/phaser-logo-small.png");
            this.game.load.audio("intro", "assets/sfx/Reinorpgintro.ogg");
            this.game.load.image('menu-button', 'assets/ui/menu.png');
            this.game.load.image('backdrop', 'assets/backdrop.png');
            this.slickUI.load('assets/ui/kenney/kenney.json');
            //this.game.load.atlasXML("player", "assets/gfx/spritesheet_characters.png", "assets/gfx/spritesheet_characters.xml");
            this.game.load.atlasXML("tiles", "assets/gfx/spritesheet_tiles.png", "assets/gfx/spritesheet_tiles.xml");
            this.game.load.atlasXML("bgElements", "assets/gfx/bgElements_spritesheet.png", "assets/gfx/bgElements_spritesheet.xml");
            this.game.load.atlasXML("particle", "assets/gfx/spritesheet_particles.png", "assets/gfx/spritesheet_particles.xml");
            this.game.load.atlasXML("redSheet", "assets/gfx/redSheet.png", "assets/gfx/redSheet.xml");
            this.game.load.audio("music", "assets/sfx/PU-Route 03.ogg");
            this.game.load.json('player_skeleton', "assets/gfx/player_ske.json");
        }
        create() {
            this.titleScreenImage = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "title");
            this.titleScreenImage.anchor.setTo(0.5, 0.5);
            this.titleScreenImage.alpha = 0;
            this.input.onTap.addOnce(this.titleClicked, this);
            this.intro = this.game.add.audio("intro");
            //this.intro.play();
            this.game.add.tween(this.titleScreenImage).to({
                alpha: 1
            }, 1000, Phaser.Easing.Quadratic.In, true, 0);
            this.input.onTap.addOnce(this.titleClicked, this);
            setTimeout(() => {
                if (this.game.state.current != "MainState") {
                    this.showMenu();
                }
            }, 5000);
        }
        showMenu() {
            var backdrop = new Phaser.Sprite(this.game, 0, 0, 'backdrop');
            // this.game.add.sprite(0,0,'');
            this.game.add.existing(backdrop);
            var button, panel, menuButton, startButton;
            this.slickUI.add(panel = new SlickUI.Element.Panel(this.game.width - 156, 8, 150, this.game.height - 16));
            panel.add(new SlickUI.Element.Text(10, 0, "Menu")).centerHorizontally().text.alpha = 0.5;
            panel.add(button = new SlickUI.Element.Button(0, this.game.height - 166, 140, 80)).events.onInputUp.add(() => {
                console.log('Clicked save game');
            });
            button.add(new SlickUI.Element.Text(0, 0, "Save game")).center();
            panel.add(button = new SlickUI.Element.Button(0, this.game.height - 76, 140, 40));
            button.add(new SlickUI.Element.Text(0, 0, "Close")).center();
            panel.visible = false;
            var basePosition = panel.x;
            this.slickUI.add(startButton = new SlickUI.Element.Button(this.game.width / 2 - 70, this.game.height - 166, 140, 80)).events.onInputUp.add(() => {
                this.game.state.start("MainState", true, false);
                // backdrop.kill()
                // backdrop.destroy(true,true)
            });
            startButton.add(new SlickUI.Element.Text(0, 0, "start game")).center();
            this.slickUI.add(menuButton = new SlickUI.Element.DisplayObject(this.game.width - 45, 8, this.game.make.sprite(0, 0, 'menu-button')));
            menuButton.inputEnabled = true;
            menuButton.input.useHandCursor = true;
            menuButton.events.onInputDown.add(() => {
                this.slickUI.container.displayGroup.bringToTop(panel.container.displayGroup);
                if (panel.visible) {
                    return;
                }
                panel.visible = true;
                panel.x = basePosition + 156;
                this.game.add.tween(panel).to({ x: basePosition }, 500, Phaser.Easing.Exponential.Out, true).onComplete.add(() => {
                    menuButton.visible = false;
                });
            }, this);
            button.events.onInputUp.add(() => {
                this.game.add.tween(panel).to({ x: basePosition + 156 }, 500, Phaser.Easing.Exponential.Out, true).onComplete.add(() => {
                    panel.visible = false;
                    panel.x -= 156;
                });
                menuButton.visible = true;
            });
            // var cb1, cb2;
            // panel.add(cb1 = new SlickUI.Element.Checkbox(0,100, SlickUI.Element.Checkbox.TYPE_RADIO));
            // cb1.events.onInputDown.add(()=>{
            //     if(cb1.checked && cb2.checked) {
            //         cb2.checked = false;
            //     }
            //     if(!cb1.checked && !cb2.checked) {
            //         cb1.checked = true;
            //     }
            // }, this);
            // panel.add(cb2 = new SlickUI.Element.Checkbox(50,100, SlickUI.Element.Checkbox.TYPE_RADIO));
            // cb2.events.onInputDown.add(()=>{
            //     if(cb1.checked && cb2.checked) {
            //         cb1.checked = false;
            //     }
            //     if(!cb1.checked && !cb2.checked) {
            //         cb2.checked = true;
            //     }
            // }, this);
            // panel.add(new SlickUI.Element.Checkbox(100,100));
        }
        titleClicked() {
            // this.game.state.start("MainState", true, false);
            this.showMenu();
        }
        shutdown() {
            this.intro.stop();
        }
    }
    rpgSimulator.TitleState = TitleState;
})(rpgSimulator || (rpgSimulator = {}));
///<reference path="../States/MainState.ts" />
///<reference path="../States/TitleState.ts" />
var rpgSimulator;
(function (rpgSimulator) {
    class Init {
        constructor() {
            this.game = new Phaser.Game(800, 600, Phaser.CANVAS, "content");
            this.game.state.add("MainState", rpgSimulator.MainState, false);
            this.game.state.add("TitleState", rpgSimulator.TitleState, false);
            this.game.state.start("TitleState", true, true);
        }
    }
    rpgSimulator.Init = Init;
})(rpgSimulator || (rpgSimulator = {}));
window.onload = () => {
    var game = new rpgSimulator.Init();
};
//# sourceMappingURL=rpgsimulator.js.map