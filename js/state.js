// use localStorage to persist state across sessions
let season = localStorage.getItem('season') || 'summer';
let timeOfDay = localStorage.getItem('tod') || 'night';
let weather = localStorage.getItem('weather') || 'clear';
let auroraOn = false; // not persisted

// can only snow in winter!
if (weather === 'snow' && season !== 'winter') weather = 'clear';

function savePref() {
    localStorage.setItem('season', season);
    localStorage.setItem('tod', timeOfDay);
    localStorage.setItem('weather', weather);
}

// day/night animation blend
let todBlend = timeOfDay === 'day' ? 1 : 0;
let todTarget = timeOfDay === 'day' ? 1 : 0;

function setTOD(v) {
    timeOfDay = v;
    todTarget = v === 'day' ? 1 : 0;
    savePref();
    refreshUI();
}

// season transitions
let prevSeason = season;
let seasonLeafActive = false;
const seasonLeaves = Array.from({length: 40}, () => ({
    x: rnd(W),
    y: -rnd(200),
    vx: rndPM(1.5),
    vy: 1.5 + rnd(2),
    rot: rnd(Math.PI * 2),
    drot: 0.04 + rnd(0.08),
    hue: 20 + rnd(30),
    life: 0
}));

function changeSeason(s) {
    if (s === season) return; // no change required

    prevSeason = season;
    season = s;
    if (weather === 'snow' && season !== 'winter') weather = 'clear';
    if (auroraOn && (season !== 'winter' || timeOfDay !== 'night')) auroraOn = false;
    // only show leaf transition for spring and autumn
    if (season === 'spring' || season === 'autumn') {
        seasonLeafActive = true;
        seasonLeaves.forEach(l => {
            l.x = rnd(W);
            l.y = -rnd(200);
            l.life = 0;
            l.vy = 1.5 + rnd(2);
            // spring: pale pink/green petals; autumn: warm orange/red leaves
            l.hue = season === 'spring' ? 300 + rnd(60) : 15 + rnd(30);
        });
    }
    savePref();
    refreshUI();
}

// -- Fox state ---------------------------------------------------
const fox = {
    x: 350,
    y: H * 0.62,
    
    phase: 'idle',
    phaseT: 0, // track time in current phase
    poseBlend: 0,
    stretchBlend: 0,
    spinAngle: 0, // track angle when fox is spinning around y-axis
    tailWage: 0,
    wanderX: 350, // position of fox while wondering
    rainTuck: 0,
    breathT: 0, // track time in breath animation
    yawnT: -1, // track time in yawn animation (-1 = not entered)
    grumbleT: -1, // track time in grumble animation (-1 = not entered)
    earTwitchT: -1, // track time in ear twitch animation (-1 = not entered)
    earTwitchSide: 0, // side ear twitch happens on (TODO not working)
};

// track fox phase frames
const FP = {
    standup: {f: 80}, // fox standing up (when waking)
    stretch: {f: 80}, // fox stretching
    shake: {f: 90}, // fox shaking himself (stretching)
    spin: {f: 110}, // fox spinning himself (post-stretching)
    curling: {f: 80}, // fox curling back up (post-stretching)
    bunny_standup: {f: 70}, // fox standing up to greet bunny
    bunny_curling: {f: 85}, // fox curling back up (post-greeting bunny)
    // (next three) when fox is wandering
    wander_out: {f: 120},
    wander_sniff: {f: 80},
    wander_in: {f: 120},
};

// -- Bunny state -------------------------------------------------
const bunny = {
    x: -80, // off-screen
    meetX: fox.x - 80, // at which we meet the fox (stand still)
    y: fox.y,
    
    phase: 'off',
    phaseT: 0,
    hop: {
        arc: 0, // track where in the hop arc we are
        from: -80,
        to: -80,
        frame: 1,
        t: 0,
    },
};

let hearts = []; // contain heart particles

function startHop(f, t, fr) {
    bunny.hop.from = f;
    bunny.hop.to = t;
    bunny.hop.frame = fr;
    bunny.hop.t = 0;
}

function tickHop() {
    bunny.hop.t++;
    const p = clamp(bunny.hop.t / bunny.hop.frame, 0, 1);
    bunny.hop.arc = (p * Math.max(1, Math.round(Math.abs(bunny.hop.to - bunny.hop.from) / 55))) % 1;
    bunny.x = lerp(bunny.hop.from, bunny.hop.to, eo(p));
    return p >= 1;
}

// -- Deer state --------------------------------------------------
const deer = {
    x: W + 80,
    phase: 'off',
    phaseT: 0,
    cooldown: 0, // tickets before entering frame next
};

// -- Hedgehog state ----------------------------------------------
const hog = {
    x: -60,
    phase: 'off',
    phaseT: 0
};

// -- Bird/owl forced state ---------------------------------------
let owlForced = false;  // force owl/bats visible even in wrong conditions
let windWasOn = false;
let windStartledBirds = [];

const lightning = {
    active: false,
    t: 0,
    path: []
};

// level of the puddles (only build when raining)
let puddleLevel = 0;

// global frame counter
let frame = 0;
