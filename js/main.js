// ═══════════════════════════════════════════════════════════════
// UI, BUTTONS, CLICK HANDLERS & MAIN LOOP
// ═══════════════════════════════════════════════════════════════

const statusEl = document.getElementById('status');

function refreshUI() {
    ['spring', 'summer', 'autumn', 'winter'].forEach(s =>
        document.getElementById('btn-' + s).classList.toggle('btn-active', season === s));
    ['day', 'night'].forEach(s =>
        document.getElementById('btn-' + s).classList.toggle('btn-active', timeOfDay === s));
    ['clear', 'rain', 'fog', 'snow', 'storm', 'wind'].forEach(s =>
        document.getElementById('btn-' + s).classList.toggle('btn-active', weather === s));
    document.getElementById('btn-aurora').classList.toggle('btn-active', auroraOn);

    // Snow only in winter; Aurora only in winter + night
    document.getElementById('btn-snow').disabled = season !== 'winter';
    document.getElementById('btn-aurora').disabled = season !== 'winter' || timeOfDay !== 'night';
}

refreshUI();

function disableButtons() {
    ['btn', 'btn-bunny', 'btn-wander'].forEach(id => document.getElementById(id).disabled = true);
}

function enableButtons() {
    ['btn', 'btn-bunny', 'btn-wander'].forEach(id => document.getElementById(id).disabled = false);
}

// Canvas click: fox grumble or scare bird
canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top) * (H / rect.height);

    // click on fox
    let fx = fox.x;
    if (fox.phase === 'wander_out' || fox.phase === 'wander_sniff' || fox.phase === 'wander_in') fx = fox.wanderX;
    if (Math.abs(cx - fx) < 46 && Math.abs(cy - (fox.y - 15)) < 32) {
        if (fox.phase === 'idle' && fox.poseBlend < 0.05 && bunny.phase === 'off') {
            triggerGrumble();
        }
        return;
    }

    // click on tree to scare a bird
    trees.slice(0, 8).forEach(tr => {
        if (Math.abs(cx - tr.x) < tr.r && cy < H * 0.62 && cy > H * 0.62 - tr.h * 0.7) {
            if (birdsActive()) {
                windStartledBirds.push({
                    x: tr.x, y: H * 0.62 - tr.h * 0.5,
                    vx: (2 + rnd(3)) * (Math.random() < 0.5 ? 1 : -1), vy: -(3 + rnd(2)),
                    flapT: 0, flapSpeed: 0.18, scale: 0.8 + rnd(0.3), life: 0
                });
            }
        }
    });
});

// fox reaction helpers
// (use fancy ellipses)
function triggerGrumble() {
    fox.grumbleT = 0;
    fox.earTwitchT = 0;
    fox.earTwitchSide = 1;
    statusEl.textContent = 'The fox grumbles sleepily…';
}

function triggerYawn() {
    if (fox.phase === 'idle' && fox.poseBlend < 0.05) {
        fox.yawnT = 0;
        statusEl.textContent = 'The fox has a big yawn…';
    }
}

function triggerEarTwitch() {
    fox.earTwitchT = 0;
    fox.earTwitchSide = Math.random() < 0.5 ? 1 : -1;
    statusEl.textContent = 'The fox\'s ear twitches…';
}

// ── Button wiring ────────────────────────────────────────────────
document.getElementById('btn').addEventListener('click', () => {
    if (bunny.phase !== 'off' && bunny.phase !== 'done') return;
    fox.phase = 'standup';
    fox.phaseT = 0;
    disableButtons();
    statusEl.textContent = 'Waking up…';
});

document.getElementById('btn-wander').addEventListener('click', () => {
    if (bunny.phase !== 'off' && bunny.phase !== 'done') return;
    fox.phase = 'wander_out';
    fox.phaseT = 0;
    fox.poseBlend = 1;
    fox.wanderX = fox.x;
    disableButtons();
    statusEl.textContent = 'Off for a little wander…';
});

document.getElementById('btn-bunny').addEventListener('click', () => {
    fox.phase = 'idle';
    fox.phaseT = 0;
    fox.poseBlend = 0;
    fox.stretchBlend = 0;
    fox.spinAngle = 0;
    fox.tailWag = 0;
    hearts = [];
    bunny.phase = 'hopping_in';
    bunny.phaseT = 0;
    bunny.x = -80;
    bunny.hop.arc = 0;
    startHop(-80, bunny.meetX, 135);
    disableButtons();
    statusEl.textContent = 'Something stirs in the trees…';
});

['spring', 'summer', 'autumn', 'winter'].forEach(s =>
    document.getElementById('btn-' + s).addEventListener('click', () => changeSeason(s)));

document.getElementById('btn-day').addEventListener('click', () => setTOD('day'));
document.getElementById('btn-night').addEventListener('click', () => setTOD('night'));

['clear', 'rain', 'fog', 'snow', 'storm', 'wind'].forEach(w =>
    document.getElementById('btn-' + w).addEventListener('click', () => {
        if (w === 'snow' && season !== 'winter') return;
        weather = w;
        savePref();
        refreshUI();
    }));

document.getElementById('btn-aurora').addEventListener('click', () => {
    if (season !== 'winter' || timeOfDay !== 'night') return;
    auroraOn = !auroraOn;
    refreshUI();
});

// Summon buttons
document.getElementById('btn-deer').addEventListener('click', summonDeer);
document.getElementById('btn-hog').addEventListener('click', summonHedgehog);
document.getElementById('btn-owl').addEventListener('click', summonOwlBats);
document.getElementById('btn-yawn').addEventListener('click', triggerYawn);
document.getElementById('btn-ear').addEventListener('click', triggerEarTwitch);
document.getElementById('btn-grumble').addEventListener('click', triggerGrumble);

// ── Main loop ────────────────────────────────────────────────────
function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    tickFox();
    tickBunny();

    drawBackground();

    // Background trees
    [trees[1], trees[3], trees[4], trees[5], trees[8], trees[9], trees[10], trees[11]].forEach(drawTree);

    drawSmoke();
    drawFireflies();
    drawButterflies();
    drawBirds();

    // Foreground trees
    [trees[0], trees[2], trees[6], trees[7]].forEach(drawTree);

    tickDeer();
    tickHedgehog();
    tickCanopyLeaves();
    drawSeasonTransition();

    drawFox();

    if (bunny.phase !== 'off' && bunny.phase !== 'done') drawBunny(bunny.x, bunny.y, bunny.hop.arc);

    if (bunny.phase === 'nuzzle') {
        const pulse = 0.22 + 0.22 * Math.sin(bunny.phaseT * 0.15);
        const nx = (bunny.x + 35 + fox.x - 34) / 2, ny = bunny.y - 60;
        ctx.save();
        ctx.globalAlpha = pulse;
        const grd = ctx.createRadialGradient(nx, ny, 2, nx, ny, 34);
        grd.addColorStop(0, '#ffe8bb');
        grd.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(nx, ny, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    if (hearts.length)
        hearts.forEach(h => {
            const a = clamp(1 - h.life / 60, 0, 1);
            drawHeart(h.x, h.y, 6 + h.life * 0.09, a);
        });

    drawWeather();
    requestAnimationFrame(draw);
}

draw();
