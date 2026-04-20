const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const eio = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const eo = t => 1 - Math.pow(1 - t, 3);
const rnd = n => Math.random() * n;
const rndPM = n => (Math.random() - 0.5) * n * 2;
const p = n => Math.random() < n;

// build a radial gradient
function rg(x, y, r1, r2, ...stops) {
    const g = ctx.createRadialGradient(x, y, r1, x, y, r2);
    stops.forEach(([t, c]) => g.addColorStop(t, c));
    return g;
}

// build a linear gradient
function lg(x1, y1, x2, y2, ...stops) {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach(([t, c]) => g.addColorStop(t, c));
    return g;
}

// draw a path provided by the given function, with the fill
function blob(path, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    path();
    ctx.fill();
}

// probability tables
const PROBABILITY = {
    LIGHTNING: 0.003,
    FOX_YAWN: 0.0008,
    EAR_TWITCH: 0.002,
    HEDGEHOG: 0.0004,
    DEER: 0.0008,
    OWL_BLINK: 0.15,
};

// colour palettes
const PALETTES = {
    spring: {
        sky0: '#1a2840', sky1: '#2a4060', sky2: '#3a6040',
        daySky0: '#a8d8f8', daySky1: '#d8eeff', daySky2: '#b8e8a0',
        gnd0: '#2a4a18', gnd1: '#203c10', gnd2: '#121e08',
        treeH: 115, treeSat: 50, treeL: 20, fH: 115, fSat: 55, fL: 22, gH: 115, gSat: 50, gL: 25
    },
    summer: {
        sky0: '#0a1120', sky1: '#162235', sky2: '#1e3d22',
        daySky0: '#7abce8', daySky1: '#c0e0ff', daySky2: '#90c870',
        gnd0: '#1a3a12', gnd1: '#162e0f', gnd2: '#0a1a08',
        treeH: 122, treeSat: 40, treeL: 18, fH: 122, fSat: 42, fL: 18, gH: 120, gSat: 45, gL: 22
    },
    autumn: {
        sky0: '#1a1010', sky1: '#2a1a18', sky2: '#3a2010',
        daySky0: '#d8a868', daySky1: '#f0c888', daySky2: '#c87840',
        gnd0: '#3a2808', gnd1: '#2e1e06', gnd2: '#1a1004',
        treeH: 25, treeSat: 65, treeL: 25, fH: 28, fSat: 70, fL: 28, gH: 35, gSat: 40, gL: 22
    },
    winter: {
        sky0: '#08101a', sky1: '#101828', sky2: '#182030',
        daySky0: '#b8c8d8', daySky1: '#dce8f0', daySky2: '#a8b8c8',
        gnd0: '#d8e4ec', gnd1: '#c0d0dc', gnd2: '#a8b8c8',
        treeH: 210, treeSat: 10, treeL: 55, fH: 210, fSat: 15, fL: 60, gH: 210, gSat: 15, gL: 70
    }
};
// get the current palette colour
const pal = () => PALETTES[season];

// background trees
const trees = [
    {x: 50, h: 220, r: 50, sway: 0.012, ph: 0.0, layers: 3, dark: false, type: 'oak', background: false},
    {x: 148, h: 170, r: 40, sway: 0.009, ph: 1.1, layers: 3, dark: true, type: 'birch', background: true},
    {x: 555, h: 230, r: 52, sway: 0.011, ph: 0.7, layers: 3, dark: false, type: 'oak', background: false},
    {x: 625, h: 180, r: 44, sway: 0.013, ph: 2.3, layers: 3, dark: true, type: 'birch', background: true},
    {x: 25, h: 140, r: 32, sway: 0.016, ph: 1.7, layers: 2, dark: true, type: 'pine', background: true},
    {x: 678, h: 150, r: 34, sway: 0.014, ph: 0.5, layers: 2, dark: false, type: 'pine', background: true},
    {x: 100, h: 270, r: 58, sway: 0.008, ph: 3.1, layers: 4, dark: false, type: 'oak', background: false},
    {x: 598, h: 260, r: 54, sway: 0.010, ph: 2.0, layers: 4, dark: true, type: 'oak', background: false},
    {x: 200, h: 130, r: 28, sway: 0.014, ph: 0.8, layers: 2, dark: true, type: 'birch', background: true},
    {x: 480, h: 120, r: 26, sway: 0.011, ph: 2.5, layers: 2, dark: false, type: 'birch', background: true},
    {x: 260, h: 100, r: 22, sway: 0.018, ph: 1.4, layers: 2, dark: true, type: 'pine', background: true},
    {x: 440, h: 110, r: 24, sway: 0.016, ph: 3.5, layers: 2, dark: false, type: 'pine', background: true},
];

// weather particles
const raindrops = Array.from({length: 200}, () => resetRain({}));
const weatherSnow = Array.from({length: 120}, () => resetSnow({}));
const fogParticles = Array.from({length: 14}, (_, i) => ({
    x: (i / 14) * W * 1.3 - W * 0.15, y: H * 0.3 + rnd(H * 0.4),
    w: 100 + rnd(200), h: 45 + rnd(65), speed: 0.15 + rnd(0.2), alpha: 0.04 + rnd(0.06)
}));
const windDebris = Array.from({length: 50}, () => resetWind({}));
const canopyLeaves = Array.from({length: 30}, () => resetCanopyLeaf({}));

function resetRain(p) {
    p.x = rnd(W);
    p.y = rnd(H);
    p.len = 8 + rnd(14);
    p.speed = 12 + rnd(8);
    return p;
}

function resetSnow(p) {
    p.x = rnd(W);
    p.y = -10 - rnd(H);
    p.size = 1.5 + rnd(3);
    p.speed = 0.5 + rnd(0.8);
    p.phase = rnd(Math.PI * 2);
    return p;
}

function resetWind(p) {
    p.x = -30 - rnd(100);
    p.y = H * 0.2 + rnd(H * 0.7);
    p.vx = 4 + rnd(3);
    p.vy = rndPM(0.5);
    p.len = 12 + rnd(22);
    p.alpha = 0.2 + rnd(0.4);
    return p;
}

function resetCanopyLeaf(p) {
    const trs = [trees[0], trees[2], trees[6], trees[7]];
    const tr = trs[Math.floor(rnd(4))];
    p.x = tr.x + rndPM(tr.r);
    p.y = H * 0.62 - tr.h * 0.5;
    p.vx = rndPM(1.5);
    p.vy = 0.3 + rnd(0.8);
    p.rot = rnd(Math.PI * 2);
    p.drot = rndPM(0.08);
    p.hue = 15 + rnd(30);
    p.active = false;
    p.timer = rnd(300) | 0;
    return p;
}

//ground particles
const fallenLeaves = Array.from({length: 80}, () => ({
    x: rnd(W), y: H * 0.62 + rnd(H * 0.25),
    size: 3 + rnd(4), rot: rnd(Math.PI * 2), hueOff: rndPM(10)
}));
const puddles = Array.from({length: 5}, (_, i) => ({
    x: 120 + i * 110, y: H * 0.68 + rnd(H * 0.1),
    rx: 0, maxRx: 20 + rnd(25), ry: 0, maxRy: 5 + rnd(4)
}));

// aurora colour bands
const auroraBands = Array.from({length: 6}, (_, i) => ({
    phase: i * Math.PI * 0.35,
    amp: 25 + rnd(45),
    freq: 0.003 + rnd(0.003),
    // Gold and purple hues
    hue: i % 2 === 0 ? 45 + rnd(20) : 270 + rnd(40),
    alpha: 0.10 + rnd(0.10),
    width: 70 + rnd(70),
    y: H * 0.07 + i * H * 0.07
}));

// birds
const perchData = [
    {treeIdx: 0, offset: -0.7, side: 1},
    {treeIdx: 2, offset: -0.6, side: -1},
    {treeIdx: 6, offset: -0.55, side: 1},
    {treeIdx: 7, offset: -0.65, side: -1},
    {treeIdx: 1, offset: -0.5, side: 1},
];
const perchBirds = perchData.map(pd => ({...pd}));
const flockBirds = Array.from({length: 12}, () => ({
    x: rnd(W), y: 20 + rnd(H * 0.25),
    vx: 0.4 + rnd(0.5), vy: 0,
    flapT: rnd(Math.PI * 2), flapSpeed: 0.08 + rnd(0.04),
    scale: 0.7 + rnd(0.5)
}));
const bats = Array.from({length: 6}, () => ({
    x: rnd(W), y: 40 + rnd(H * 0.3),
    vx: (0.8 + rnd(0.6)) * (p(0.5) ? 1 : -1),
    flapT: rnd(Math.PI * 2), flapSpeed: 0.14 + rnd(0.06)
}));
const owl = {
    headAngle: 0,
    headTarget: 0,
    headTimer: 0,
    blinkT: -1,
    treeIdx: 6,
    show() {
        return owlForced
            || todBlend < 0.35
            && (season === 'autumn' || season === 'winter')
            && weather === 'clear';
    }
};

// woodsmoke
const smoke = Array.from({length: 12}, (_, i) => resetSmoke({}, i));

function resetSmoke(p, i = 0) {
    p.x = 640 + rndPM(3);
    p.y = H * 0.62 - 50 - i * 8;
    p.vx = rndPM(0.3) + 0.2;
    p.vy = -0.4 - rnd(0.3);
    p.size = 4 + i * 1.5;
    p.alpha = 0.18 - i * 0.013;
    p.life = 0;
    return p;
}
