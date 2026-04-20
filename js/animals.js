// belgian hare
// (apologies for the artistic license)
function drawBunny(bx, by, arcT) {
    const lift = Math.sin(arcT * Math.PI) * 24;
    ctx.save();
    ctx.translate(bx, by);
    ctx.save();
    const ss = lerp(1, 0.45, lift / 24);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 22 * ss, 5 * ss, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.translate(0, -lift);

    const body = '#8B3A10', dark = '#5c2208', lite = '#c0622a', belly = '#c8905a';
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(-10, 4, 14, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    const kick = Math.sin(arcT * Math.PI) * 10;
    ctx.beginPath();
    ctx.ellipse(-18 - kick * 0.6, 6, 11, 4, -0.15, 0, Math.PI * 2);
    ctx.fill();
    const bg2 = ctx.createRadialGradient(2, -10, 3, -2, -8, 22);
    bg2.addColorStop(0, lite);
    bg2.addColorStop(0.5, body);
    bg2.addColorStop(1, dark);
    ctx.fillStyle = bg2;
    ctx.beginPath();
    ctx.ellipse(-2, -8, 18, 13, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.ellipse(-4, -5, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    const ftuck = Math.sin(arcT * Math.PI) * 6;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(8, -4);
    ctx.lineTo(13, -4 + ftuck);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, -4);
    ctx.lineTo(8, -4 + ftuck * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#ede8e0';
    ctx.beginPath();
    ctx.arc(-16, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-15, -6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(12, -16, 8, 7, 0.4, 0, Math.PI * 2);
    ctx.fill();
    const hx = 18, hy2 = -27;
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(hx, hy2, 13, 11, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lite;
    ctx.beginPath();
    ctx.ellipse(hx + 10, hy2 + 3, 8, 5.5, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.moveTo(hx - 5, hy2 - 7);
    ctx.bezierCurveTo(hx - 10, hy2 - 28, hx - 13, hy2 - 37, hx - 10, hy2 - 41);
    ctx.bezierCurveTo(hx - 6, hy2 - 37, hx - 3, hy2 - 27, hx - 3, hy2 - 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(hx + 1, hy2 - 8);
    ctx.bezierCurveTo(hx - 3, hy2 - 30, hx - 7, hy2 - 40, hx - 4, hy2 - 44);
    ctx.bezierCurveTo(hx, hy2 - 40, hx + 4, hy2 - 29, hx + 5, hy2 - 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c06868';
    ctx.beginPath();
    ctx.moveTo(hx, hy2 - 9);
    ctx.bezierCurveTo(hx - 2, hy2 - 28, hx - 5, hy2 - 38, hx - 3, hy2 - 42);
    ctx.bezierCurveTo(hx - 1, hy2 - 38, hx + 2, hy2 - 27, hx + 3, hy2 - 9);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#120500';
    ctx.beginPath();
    ctx.arc(hx + 6, hy2 - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b86020';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx + 6, hy2 - 2, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(hx + 7, hy2 - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6a2828';
    ctx.beginPath();
    ctx.ellipse(hx + 17, hy2 + 4, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// deer
function drawDeer(x, y, grazing) {
    ctx.save();
    ctx.translate(x, y);
    const graze = grazing ? Math.sin(frame * 0.05) * 0.1 : 0;
    ctx.strokeStyle = '#6a4020';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const lb = Math.sin(frame * 0.08) * 2;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(-14, 32 + lb);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-8, 32 - lb);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(8, 32 + lb);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(14, 32 - lb);
    ctx.stroke();
    const bg = ctx.createRadialGradient(-2, -10, 4, 0, -8, 24);
    bg.addColorStop(0, '#c8783a');
    bg.addColorStop(1, '#8a4820');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(0, -8, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b06830';
    ctx.beginPath();
    ctx.ellipse(-16, -18 + graze * 10, 7, 12, -0.3 + graze, 0, Math.PI * 2);
    ctx.fill();
    const hy = -30 + graze * 15;
    ctx.fillStyle = '#b06830';
    ctx.beginPath();
    ctx.ellipse(-20, hy, 10, 8, -0.1 + graze * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d09060';
    ctx.beginPath();
    ctx.ellipse(-28, hy + 3, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c07040';
    ctx.beginPath();
    ctx.moveTo(-14, hy - 7);
    ctx.lineTo(-10, hy - 18);
    ctx.lineTo(-8, hy - 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a3010';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, hy - 8);
    ctx.lineTo(-10, hy - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, hy - 16);
    ctx.lineTo(-6, hy - 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, hy - 14);
    ctx.lineTo(-14, hy - 20);
    ctx.stroke();
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    ctx.arc(-24, hy - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-24.5, hy - 1.5, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a1800';
    ctx.beginPath();
    ctx.ellipse(-33, hy + 4, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const tf = Math.sin(frame * 0.07) * 0.2;
    ctx.fillStyle = '#f0e0c8';
    ctx.beginPath();
    ctx.ellipse(20, -6 + tf * 5, 5, 7, tf, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// animate the deer
function tickDeer() {
    deer.cooldown--;
    if (deer.phase === 'off') {
        const atTransition = Math.abs(todBlend - 0.5) < 0.15;
        if (atTransition && deer.cooldown <= 0 && Math.random() < 0.0008 && bunny.phase === 'off') {
            deer.phase = 'entering';
            deer.phaseT = 0;
            deer.x = W + 80;
            deer.cooldown = 2400;
        }
    }
    if (deer.phase === 'off') return;
    deer.phaseT++;
    const gx = W * 0.72;
    if (deer.phase === 'entering') {
        deer.x = lerp(W + 80, gx, eo(clamp(deer.phaseT / 150, 0, 1)));
        if (deer.phaseT >= 150) {
            deer.phase = 'grazing';
            deer.phaseT = 0;
        }
    } else if (deer.phase === 'grazing') {
        deer.x = gx + Math.sin(frame * 0.008) * 8;
        if (deer.phaseT > 300) {
            deer.phase = 'leaving';
            deer.phaseT = 0;
        }
    } else if (deer.phase === 'leaving') {
        deer.x = lerp(gx, W + 80, eo(clamp(deer.phaseT / 120, 0, 1)));
        if (deer.phaseT >= 120) {
            deer.phase = 'off';
            deer.x = W + 80;
        }
    }
    if (deer.phase !== 'off') drawDeer(deer.x, H * 0.62 - 28, deer.phase === 'grazing');
}

// summon deer immediately
function summonDeer() {
    deer.phase = 'entering';
    deer.phaseT = 0;
    deer.x = W + 80;
    deer.cooldown = 2400;
}

// hedgehog
function drawHedgehog(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#4a3010';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) {
        const a = -Math.PI + i * (Math.PI / 7);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 6 - 4);
        ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 10.4 - 4);
        ctx.stroke();
    }
    ctx.fillStyle = '#3a2808';
    ctx.beginPath();
    ctx.ellipse(0, -4, 16, 10, 0, 0, Math.PI, true);
    ctx.fill();
    ctx.fillStyle = '#d8c8a0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#9a7040';
    ctx.beginPath();
    ctx.ellipse(-14, -2, 8, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a5020';
    ctx.beginPath();
    ctx.ellipse(-20, -1, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a0800';
    ctx.beginPath();
    ctx.arc(-24, -1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#100800';
    ctx.beginPath();
    ctx.arc(-17, -4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    const waddle = Math.sin(frame * 0.12) * 3;
    ctx.strokeStyle = '#5a3a10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, 4);
    ctx.lineTo(-8, 10 + waddle);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(0, 11 - waddle);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(8, 10 + waddle);
    ctx.stroke();
    ctx.restore();
}

// animate the hedgehog
function tickHedgehog() {
    if (hog.phase === 'off' && Math.random() < 0.0004 && bunny.phase === 'off' && season === 'autumn') {
        hog.phase = 'in';
        hog.phaseT = 0;
        hog.x = -60;
    }
    if (hog.phase === 'off') return;
    hog.phaseT++;
    if (hog.phase === 'in') {
        hog.x = lerp(-60, fox.x - 90, eo(clamp(hog.phaseT / 300, 0, 1)));
        if (hog.phaseT >= 320) {
            hog.phase = 'sniff';
            hog.phaseT = 0;
        }
    } else if (hog.phase === 'sniff') {
        hog.x = fox.x - 90 + Math.sin(frame * 0.04) * 8;
        if (hog.phaseT > 180) {
            hog.phase = 'out';
            hog.phaseT = 0;
        }
    } else if (hog.phase === 'out') {
        hog.x = lerp(fox.x - 90, W + 80, eo(clamp(hog.phaseT / 280, 0, 1)));
        if (hog.phaseT >= 280) hog.phase = 'off';
    }
    if (hog.phase !== 'off') drawHedgehog(hog.x, H * 0.62 - 4);
}

// summon the hedgehog immediately
function summonHedgehog() {
    hog.phase = 'in';
    hog.phaseT = 0;
    hog.x = -60;
}

// birds
// return if the birds are currently active
function birdsActive() {
    if (season === 'winter') return false;
    if (todBlend <= 0.5) return false; // night
    if (todBlend < 0.4) return false;
    if (weather === 'storm' || weather === 'wind') return false;
    return true;
}

function drawPerchBird(x, y, facing) {
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);
    ctx.fillStyle = '#2a1a10';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 5, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c84010';
    ctx.beginPath();
    ctx.ellipse(2, 1, 4, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1008';
    ctx.beginPath();
    ctx.arc(-5, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-6, -4.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-6, -4.5, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(-9, -4);
    ctx.lineTo(-12, -3.5);
    ctx.lineTo(-9, -3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1a1008';
    ctx.beginPath();
    ctx.moveTo(7, 1);
    ctx.lineTo(14, 0);
    ctx.lineTo(14, 3);
    ctx.lineTo(7, 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a3a20';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, 4);
    ctx.lineTo(-2, 9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, 4);
    ctx.lineTo(2, 9);
    ctx.stroke();
    ctx.restore();
}

function drawFlyingBird(x, y, flapT, sc) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    const wing = Math.sin(flapT) * 12;
    ctx.strokeStyle = 'rgba(30,20,10,0.7)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, wing * 0.5);
    ctx.quadraticCurveTo(-7, wing, 0, 0);
    ctx.quadraticCurveTo(7, wing, 14, wing * 0.5);
    ctx.stroke();
    ctx.restore();
}

function drawOwl() {
    // show owl at night (or forced), non-winter
    const showOwl = owlForced || (todBlend < 0.35 && season !== 'winter');
    if (!showOwl) return;
    const tr = trees[owl.treeIdx];
    const topY = H * 0.62 - tr.h * 0.25 - (tr.layers - 1) * (tr.h * 0.22);
    const ox = tr.x, oy = topY - 15;

    owl.headTimer++;
    if (owl.headTimer > 120) {
        owl.headTarget = rndPM(0.8);
        owl.headTimer = 0;
        if (Math.random() < 0.15) owl.blinkT = 0;
    }
    owl.headAngle = lerp(owl.headAngle, owl.headTarget, 0.04);
    if (owl.blinkT >= 0) {
        owl.blinkT++;
        if (owl.blinkT > 8) owl.blinkT = -1;
    }

    ctx.save();
    ctx.translate(ox, oy);
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c8a878';
    ctx.beginPath();
    ctx.ellipse(0, 4, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1e10';
    ctx.beginPath();
    ctx.ellipse(-9, 2, 5, 11, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(9, 2, 5, 11, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.rotate(owl.headAngle);
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath();
    ctx.arc(0, -14, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1a08';
    ctx.beginPath();
    ctx.moveTo(-6, -20);
    ctx.lineTo(-8, -27);
    ctx.lineTo(-3, -21);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -20);
    ctx.lineTo(8, -27);
    ctx.lineTo(3, -21);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c8a060';
    ctx.beginPath();
    ctx.arc(0, -14, 6, 0, Math.PI * 2);
    ctx.fill();
    const blinking = owl.blinkT >= 0 && owl.blinkT < 5;
    ctx.fillStyle = '#f0c040';
    if (!blinking) {
        ctx.beginPath();
        ctx.arc(-3, -14, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3, -14, 3, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.strokeStyle = '#f0c040';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-6, -14);
        ctx.lineTo(0, -14);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(6, -14);
        ctx.stroke();
    }
    ctx.fillStyle = '#000';
    if (!blinking) {
        ctx.beginPath();
        ctx.arc(-3, -14, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(3, -14, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#a08040';
    ctx.beginPath();
    ctx.moveTo(-2, -11);
    ctx.lineTo(2, -11);
    ctx.lineTo(0, -9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#7a5a20';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, 13);
    ctx.lineTo(-4, 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 13);
    ctx.lineTo(4, 20);
    ctx.stroke();
    ctx.restore();
}

function drawBat(x, y, flapT, sc) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    const wing = Math.sin(flapT) * 10;
    ctx.fillStyle = 'rgba(30,10,40,0.8)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-8, wing - 4, -16, wing, -18, wing + 2);
    ctx.bezierCurveTo(-14, wing - 2, -8, wing - 6, 0, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(8, wing - 4, 16, wing, 18, wing + 2);
    ctx.bezierCurveTo(14, wing - 2, 8, wing - 6, 0, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(40,15,50,0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-3, -7);
    ctx.lineTo(-5, -12);
    ctx.lineTo(-1, -8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3, -7);
    ctx.lineTo(5, -12);
    ctx.lineTo(1, -8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawBirds() {
    // startle birds on wind
    if (weather === 'wind' && !windWasOn) {
        perchBirds.forEach(pb => {
            const tr = trees[pb.treeIdx];
            const top = getTreeTopPos(tr);
            windStartledBirds.push({
                x: top.x + pb.offset * tr.r * 0.5, y: top.y,
                vx: (3 + rnd(4)) * (Math.random() < 0.5 ? 1 : -1), vy: -(2 + rnd(2)),
                flapT: 0, flapSpeed: 0.15, scale: 0.8 + rnd(0.3), life: 0
            });
        });
        windWasOn = true;
    }
    if (weather !== 'wind' && weather !== 'storm') windWasOn = false;

    // bats at night autumn (or forced)
    const showBats = owlForced || (season === 'autumn' && todBlend < 0.4);
    if (showBats) {
        bats.forEach(b => {
            b.x += b.vx;
            b.flapT += b.flapSpeed;
            b.y += Math.sin(b.flapT * 0.15) * 1.2;
            if (b.x > W + 40) b.x = -40;
            if (b.x < -40) b.x = W + 40;
            drawBat(b.x, b.y, b.flapT, 0.9 + Math.random() * 0.1);
        });
    }

    // startled birds
    windStartledBirds = windStartledBirds.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.05;
        b.flapT += b.flapSpeed;
        b.life++;
        if (b.life > 200 || b.x < -50 || b.x > W + 50 || b.y < -50) return false;
        drawFlyingBird(b.x, b.y, b.flapT, b.scale);
        return true;
    });

    if (!birdsActive()) {
        drawOwl();
        return;
    }

    const flockCount = weather === 'wind' ? 3 : flockBirds.length;
    flockBirds.slice(0, flockCount).forEach(b => {
        b.x += b.vx;
        b.flapT += b.flapSpeed;
        b.y += Math.sin(b.flapT * 0.2) * 0.3;
        if (b.x > W + 30) {
            b.x = -30;
            b.y = 20 + rnd(H * 0.22);
        }
        drawFlyingBird(b.x, b.y, b.flapT, b.scale);
    });

    perchBirds.forEach(pb => {
        const tr = trees[pb.treeIdx];
        if (season === 'winter' && tr.type !== 'pine') return;
        // Birds sit on the swaying trees
        const top = getTreeTopPos(tr);
        const px = top.x + pb.offset * tr.r * 0.5;
        const py = top.y + Math.sin(frame * 0.03 + pb.treeIdx) * 0.8;
        // Bird also leans with the tree sway
        const windE = (weather === 'wind' || weather === 'storm') ? Math.sin(frame * 0.06 + tr.ph) * 10 : 0;
        const treeLean = (Math.sin(frame * tr.sway + tr.ph) * 5 + windE) * 0.008;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(treeLean);
        ctx.translate(-px, -py);
        drawPerchBird(px, py, pb.side);
        ctx.restore();
    });

    drawOwl();
}

function summonOwlBats() {
    owlForced = !owlForced; // toggle
}

// draw a heart particle
function drawHeart(x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ff88aa';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - size, x - size * 1.5, y - size, x - size * 1.5, y - size * 0.4);
    ctx.bezierCurveTo(x - size * 1.5, y + size * 0.3, x, y + size, x, y + size * 1.2);
    ctx.bezierCurveTo(x, y + size, x + size * 1.5, y + size * 0.3, x + size * 1.5, y - size * 0.4);
    ctx.bezierCurveTo(x + size * 1.5, y - size, x, y - size, x, y);
    ctx.fill();
    ctx.restore();
}
