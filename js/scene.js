function drawBackground() {
    const p = pal();
    todBlend = lerp(todBlend, todTarget, 0.025);
    const td = todBlend;

    // Night sky base
    const skyN = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    skyN.addColorStop(0, p.sky0);
    skyN.addColorStop(0.5, p.sky1);
    skyN.addColorStop(1, p.sky2);
    ctx.fillStyle = skyN;
    ctx.fillRect(0, 0, W, H);

    // Day sky overlay
    if (weather !== 'storm' && weather !== 'rain') {
        const skyD = ctx.createLinearGradient(0, 0, 0, H * 0.7);
        skyD.addColorStop(0, p.daySky0);
        skyD.addColorStop(0.5, p.daySky1);
        skyD.addColorStop(1, p.daySky2);
        ctx.globalAlpha = td;
        ctx.fillStyle = skyD;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
    } else {
        ctx.fillStyle = '#1a2030';
        ctx.globalAlpha = 0.85;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
    }

    // Aurora - winter night or manually toggled
    if (auroraOn && season === 'winter' && td < 0.35) drawAurora();

    // Moon / stars at night
    if (td < 0.8 && weather !== 'storm' && weather !== 'rain') {
        const ma = clamp(1 - td * 1.5, 0, 1);
        if (ma > 0.02) {
            ctx.save();
            ctx.globalAlpha = ma;
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#fffbe0';
            ctx.fillStyle = '#fffde8';
            ctx.beginPath();
            ctx.arc(580, 55, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(10,17,32,0.35)';
            ctx.beginPath();
            ctx.ellipse(577 + Math.sin(frame * 0.003) * 8, 52, 18, 10, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        if (weather === 'clear' || weather === 'wind') {
            const stars = [[80, 30], [140, 18], [220, 40], [310, 12], [410, 28], [480, 15], [55, 60], [165, 45], [270, 25], [340, 50], [450, 8], [520, 38], [620, 20], [670, 45], [700, 10]];
            stars.forEach(([sx, sy], i) => {
                ctx.globalAlpha = clamp((1 - td * 2) * (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(frame * 0.02 + i * 1.3))), 0, 1);
                ctx.fillStyle = 'rgba(255,255,230,0.8)';
                ctx.beginPath();
                ctx.arc(sx, sy, 1, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
    }

    // Sun during day
    if (td > 0.2 && weather !== 'fog' && weather !== 'rain' && weather !== 'storm') {
        const sa = clamp((td - 0.2) / 0.6, 0, 1);
        const sunX = season === 'autumn' ? 120 : season === 'winter' ? 160 : 550;
        const sunY = season === 'winter' ? 90 : 65;
        ctx.save();
        ctx.globalAlpha = sa;
        ctx.shadowBlur = 60;
        ctx.shadowColor = '#ffe87888';
        ctx.fillStyle = season === 'autumn' ? '#f0a030' : season === 'winter' ? '#dde8f0' : '#fffad0';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = sa * 0.15;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (season === 'summer' && weather === 'clear') {
            ctx.strokeStyle = 'rgba(255,250,180,0.08)';
            ctx.lineWidth = 18;
            ctx.globalAlpha = sa;
            for (let r = 0; r < 6; r++) {
                const a = r * Math.PI / 3 + frame * 0.003;
                ctx.beginPath();
                ctx.moveTo(sunX, sunY);
                ctx.lineTo(sunX + Math.cos(a) * 180, sunY + Math.sin(a) * 180);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    }

    // Dawn/dusk glow
    if (td > 0.1 && td < 0.9) {
        const dg = clamp(1 - Math.abs(td - 0.5) * 8, 0, 1) * 0.38;
        const hor = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.72);
        hor.addColorStop(0, `rgba(255,155,55,${dg})`);
        hor.addColorStop(1, 'rgba(255,90,10,0)');
        ctx.fillStyle = hor;
        ctx.fillRect(0, H * 0.5, W, H * 0.22);
    }

    drawClouds();

    // Mist
    if (weather !== 'fog') {
        const mA = season === 'winter' ? 0.22 : season === 'autumn' ? 0.10 : 0.05;
        const mist = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.72);
        mist.addColorStop(0, 'rgba(200,220,200,0)');
        mist.addColorStop(1, `rgba(200,220,210,${mA})`);
        ctx.fillStyle = mist;
        ctx.fillRect(0, H * 0.5, W, H * 0.22);
    }

    drawGround();
}

function drawAurora() {
    ctx.save();
    auroraBands.forEach(b => {
        const g = ctx.createLinearGradient(0, b.y - b.width, 0, b.y + b.width);
        const shimmer = b.alpha + Math.sin(frame * 0.008 + b.phase) * 0.05;
        const hShift = Math.sin(frame * 0.003 + b.phase) * 18;
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.5, `hsla(${b.hue + hShift}, 85%, 60%, ${shimmer})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, b.y);
        for (let x = 0; x <= W; x += 18) {
            const wy = b.y + Math.sin(x * b.freq + frame * 0.012 + b.phase) * b.amp;
            ctx.lineTo(x, wy);
        }
        ctx.lineTo(W, H * 0.5);
        ctx.lineTo(0, H * 0.5);
        ctx.closePath();
        ctx.fill();
    });
    ctx.restore();
}

function drawClouds() {
    const isRainy = weather === 'rain' || weather === 'storm';
    const windM = weather === 'wind' || weather === 'storm' ? 2.2 : 1;
    const seeds = [[100, 80, 0.7], [280, 60, 0.5], [450, 90, 0.6], [600, 70, 0.45]];
    const extra = isRainy ? [[160, 50, 0.8], [380, 40, 0.9], [520, 65, 0.85]] : [];
    [...seeds, ...extra].forEach(([cx, cy, a], i) => {
        const dx = Math.sin(frame * 0.002 + i * 0.8) * 20 * windM;
        ctx.save();
        ctx.globalAlpha = a * (isRainy ? 0.92 : season === 'winter' ? 0.82 : 0.58);
        ctx.fillStyle = isRainy ? '#4a5a6a' : season === 'winter' ? '#e8eef4' : season === 'autumn' ? '#d8b888' : '#fff';
        const x = cx + dx;
        ctx.beginPath();
        ctx.arc(x, cy, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 30, cy + 5, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - 22, cy + 6, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 10, cy - 12, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawGround() {
    const p = pal();
    const gnd = ctx.createLinearGradient(0, H * 0.62, 0, H);
    gnd.addColorStop(0, p.gnd0);
    gnd.addColorStop(0.4, p.gnd1);
    gnd.addColorStop(1, p.gnd2);
    ctx.fillStyle = gnd;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);

    if (season === 'winter') {
        ctx.fillStyle = 'rgba(235,245,255,0.93)';
        ctx.fillRect(0, H * 0.62, W, H * 0.38);
        ctx.fillStyle = '#e8f2fa';
        ctx.beginPath();
        ctx.moveTo(0, H * 0.62);
        for (let sx = 0; sx <= W; sx += 20) ctx.lineTo(sx, H * 0.62 + Math.sin(sx * 0.05) * 4 + Math.sin(sx * 0.11 + 1) * 3);
        ctx.lineTo(W, H * 0.62);
        ctx.closePath();
        ctx.fill();
    }

    ctx.strokeStyle = season === 'winter' ? '#c8dcea' : season === 'autumn' ? '#5a3a1a' : '#2a5e1a';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.62 + 1);
    ctx.lineTo(W, H * 0.62 + 1);
    ctx.stroke();
    ctx.globalAlpha = 1;

    drawUndergrowth();
    if (season === 'autumn') drawFallenLeaves();
    if (season === 'winter') drawSnowDrifts();
    if (season === 'spring') drawSpringFlowers();
    drawPuddles();
    drawGrass();
}

function drawUndergrowth() {
    const p = pal();
    const bushDefs = [
        {x: 130, r: 28, dark: true}, {x: 175, r: 20, dark: false}, {x: 510, r: 25, dark: false},
        {x: 545, r: 18, dark: true}, {x: 240, r: 16, dark: true}, {x: 420, r: 14, dark: false},
        {x: 80, r: 18, dark: false}, {x: 620, r: 22, dark: true}
    ];
    bushDefs.forEach(b => {
        const li = b.dark ? p.fL - 5 : p.fL + 3;
        const bg = ctx.createRadialGradient(b.x, H * 0.62 - b.r * 0.4, b.r * 0.1, b.x, H * 0.62, b.r);
        bg.addColorStop(0, `hsl(${p.fH},${p.fSat}%,${li + 12}%)`);
        bg.addColorStop(1, `hsl(${p.fH},${p.fSat - 5}%,${li}%)`);
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(b.x, H * 0.62, b.r, Math.PI, 0);
        ctx.arc(b.x + b.r * 0.7, H * 0.62 - b.r * 0.3, b.r * 0.6, Math.PI, 0);
        ctx.arc(b.x - b.r * 0.6, H * 0.62 - b.r * 0.2, b.r * 0.55, Math.PI, 0);
        ctx.fill();
    });
    const wsh = weather === 'wind' ? Math.sin(frame * 0.04) * 5 : 0;
    for (let fx = 160; fx < 560; fx += 45) {
        if (Math.abs(fx - fox.x) < 60) continue;
        const sw = Math.sin(frame * 0.015 + fx * 0.06) * 2.5 + wsh;
        ctx.strokeStyle = `hsl(${p.fH + 10},${p.fSat}%,${p.fL + 8}%)`;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        for (let leaf = -3; leaf <= 3; leaf++) {
            const la = leaf * 0.22;
            ctx.beginPath();
            ctx.moveTo(fx, H * 0.62);
            ctx.quadraticCurveTo(fx + sw + Math.sin(la) * 18, H * 0.62 - 20 + la * 5, fx + Math.cos(la) * 28 + sw, H * 0.62 - 16 + leaf * 4);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    [{x: 195, y: H * 0.63}, {x: 290, y: H * 0.64}, {x: 400, y: H * 0.63}, {x: 490, y: H * 0.64}, {
        x: 660,
        y: H * 0.63
    }].forEach(r => {
        ctx.fillStyle = season === 'winter' ? '#c0d0dc' : '#3a3228';
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, 12, 7, 0.2, 0, Math.PI * 2);
        ctx.fill();
        if (season !== 'winter') {
            ctx.fillStyle = `hsl(${p.fH},40%,20%)`;
            ctx.beginPath();
            ctx.ellipse(r.x, r.y - 3, 8, 4, 0.2, 0, Math.PI);
            ctx.fill();
        }
    });
}

function drawFallenLeaves() {
    fallenLeaves.forEach(l => {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot + Math.sin(frame * 0.01 + l.x * 0.05) * (weather === 'wind' ? 0.35 : 0.1));
        const hue = [18, 28, 38, 12, 45][Math.floor(l.x * 5 / W) % 5] + l.hueOff;
        ctx.fillStyle = `hsl(${hue},75%,45%)`;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size, l.size * 0.55, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `hsl(${hue - 5},60%,35%)`;
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(-l.size, 0);
        ctx.lineTo(l.size, 0);
        ctx.stroke();
        ctx.restore();
    });
    if (weather === 'wind' || weather === 'storm') {
        fallenLeaves.slice(0, 25).forEach((l, i) => {
            const fl = (l.x + frame * 2 * (1 + i * 0.05)) % W;
            const fy = H * 0.55 + Math.sin(frame * 0.05 + i) * 30;
            ctx.save();
            ctx.translate(fl, fy);
            ctx.rotate(frame * 0.12 + i);
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = `hsl(${20 + i * 4},70%,45%)`;
            ctx.beginPath();
            ctx.ellipse(0, 0, 5, 3, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}

function drawSnowDrifts() {
    [[130, H * 0.62], [175, H * 0.62], [510, H * 0.62], [545, H * 0.62]].forEach(([sx, sy]) => {
        ctx.fillStyle = 'rgba(230,242,252,0.95)';
        ctx.beginPath();
        ctx.ellipse(sx, sy, 32, 10, 0, Math.PI, 0);
        ctx.fill();
    });
}

function drawSpringFlowers() {
    [{x: 220, c: '#ff88cc'}, {x: 250, c: '#ffdd44'}, {x: 310, c: '#ff99dd'}, {x: 380, c: '#ffffaa'},
        {x: 420, c: '#ff88bb'}, {x: 475, c: '#ddffaa'}, {x: 160, c: '#ffaaee'}, {x: 540, c: '#ffcc44'}].forEach(f => {
        const bob = Math.sin(frame * 0.04 + f.x * 0.1) * 0.8;
        ctx.fillStyle = f.c;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(f.x, H * 0.66 + bob, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffee';
        ctx.beginPath();
        ctx.arc(f.x, H * 0.66 + bob, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

function drawPuddles() {
    const growing = weather === 'rain' || weather === 'storm';
    puddleLevel = clamp(puddleLevel + (growing ? 0.004 : -0.002), 0, 1);
    puddles.forEach(pd => {
        pd.rx = lerp(0, pd.maxRx, puddleLevel);
        pd.ry = lerp(0, pd.maxRy, puddleLevel);
        if (pd.rx < 1) return;
        const pg = ctx.createRadialGradient(pd.x, pd.y, 0, pd.x, pd.y, pd.rx);
        const c = todBlend > 0.5 ? 'rgba(120,160,200,' : 'rgba(20,40,80,';
        pg.addColorStop(0, `${c}0.4)`);
        pg.addColorStop(1, `${c}0.1)`);
        ctx.fillStyle = pg;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(pd.x, pd.y, pd.rx, pd.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (growing && p(0.06)) {
            ctx.strokeStyle = 'rgba(140,180,220,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(pd.x + rndPM(pd.rx * 0.5), pd.y, pd.rx * 0.3, pd.ry * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

function drawGrass() {
    const p = pal();
    if (season !== 'winter') {
        const wsh = weather === 'wind' ? Math.sin(frame * 0.04) * 10 : weather === 'storm' ? Math.sin(frame * 0.06) * 14 : 0;
        for (let gx = 10; gx < W; gx += 18) {
            const sw = Math.sin(frame * 0.018 + gx * 0.07) * 3 + wsh;
            ctx.strokeStyle = `hsl(${p.gH + Math.sin(gx) * 8},${p.gSat}%,${p.gL + Math.sin(gx * 0.3) * 4}%)`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(gx, H - 16);
            ctx.quadraticCurveTo(gx + sw, H - 30, gx + sw * 1.5, H - 42);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(gx + 7, H - 18);
            ctx.quadraticCurveTo(gx + 7 + sw * 0.7, H - 26, gx + 7 + sw, H - 34);
            ctx.stroke();
        }
    } else {
        for (let gx = 10; gx < W; gx += 28) {
            ctx.strokeStyle = 'rgba(180,200,220,0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(gx, H * 0.62);
            ctx.lineTo(gx, H * 0.62 - 12);
            ctx.stroke();
        }
    }
}

function drawWeather() {
    if (weather === 'rain' || weather === 'storm') {
        const angle = weather === 'storm' ? 0.15 : 0.06;
        ctx.strokeStyle = weather === 'storm' ? 'rgba(160,180,220,0.5)' : 'rgba(120,160,200,0.45)';
        ctx.lineWidth = weather === 'storm' ? 1.5 : 1;
        raindrops.forEach(r => {
            r.y += r.speed;
            r.x += r.speed * angle;
            if (r.y > H || r.x > W) resetRain(r);
            ctx.beginPath();
            ctx.moveTo(r.x, r.y);
            ctx.lineTo(r.x - r.len * angle, r.y - r.len);
            ctx.stroke();
        });
    }
    if (weather === 'snow') {
        weatherSnow.forEach(sf => {
            sf.y += sf.speed;
            sf.x += Math.sin(frame * 0.02 + sf.phase) * 0.5;
            if (sf.y > H) resetSnow(sf);
            ctx.save();
            ctx.globalAlpha = 0.75;
            ctx.fillStyle = '#e8f0ff';
            ctx.shadowBlur = 3;
            ctx.shadowColor = '#fff';
            ctx.beginPath();
            ctx.arc(sf.x, sf.y, sf.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
    if (weather === 'fog') {
        fogParticles.forEach(fp => {
            fp.x += fp.speed;
            if (fp.x > W + fp.w) fp.x = -fp.w;
            ctx.save();
            ctx.globalAlpha = fp.alpha;
            const fg = ctx.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, fp.w * 0.7);
            fg.addColorStop(0, 'rgba(200,210,200,1)');
            fg.addColorStop(1, 'rgba(200,210,200,0)');
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.ellipse(fp.x, fp.y, fp.w, fp.h, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        const fo = ctx.createLinearGradient(0, H * 0.4, 0, H);
        fo.addColorStop(0, 'rgba(175,185,180,0)');
        fo.addColorStop(0.4, 'rgba(175,185,180,0.35)');
        fo.addColorStop(1, 'rgba(175,185,180,0.58)');
        ctx.fillStyle = fo;
        ctx.fillRect(0, H * 0.4, W, H * 0.6);
    }
    if (weather === 'wind') {
        windDebris.forEach(wd => {
            wd.x += wd.vx;
            wd.y += wd.vy;
            if (wd.x > W + 30) resetWind(wd);
            ctx.save();
            ctx.globalAlpha = wd.alpha;
            ctx.strokeStyle = 'rgba(180,200,170,0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(wd.x, wd.y);
            ctx.lineTo(wd.x - wd.len, wd.y + wd.vy * 3);
            ctx.stroke();
            ctx.restore();
        });
    }
    if (weather === 'storm') {
        if (p(PROBABILITY.LIGHTNING)) {
            lightning.path = [];
            let lx = 200 + rnd(300), ly = 0;
            while (ly < H * 0.65) {
                lightning.path.push([lx, ly]);
                lx += rndPM(40);
                ly += 20 + rnd(20);
            }
            lightning.active = true;
            lightning.t = 0;
        }
        if (lightning.active) {
            lightning.t++;
            if (lightning.t < 8) {
                ctx.fillStyle = `rgba(200,220,255,${0.15 * (1 - lightning.t / 8)})`;
                ctx.fillRect(0, 0, W, H);
                ctx.strokeStyle = `rgba(220,230,255,${1 - lightning.t / 8})`;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                lightning.path.forEach(([lx, ly], i) => i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly));
                ctx.stroke();
                ctx.strokeStyle = `rgba(180,200,255,${0.4 * (1 - lightning.t / 8)})`;
                ctx.lineWidth = 8;
                ctx.beginPath();
                lightning.path.forEach(([lx, ly], i) => i === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly));
                ctx.stroke();
            } else lightning.active = false;
        }
    }
}

function drawSeasonTransition() {
    if (!seasonLeafActive) return;
    let allDone = true;
    seasonLeaves.forEach(l => {
        if (l.y < H * 0.62) {
            allDone = false;
            l.x += l.vx;
            l.y += l.vy;
            l.rot += l.drot;
            l.life++;
            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.rot);
            ctx.globalAlpha = 0.85;
            // Spring: pink/white petals (hue 300-360); Autumn: warm orange/red (hue 15-45)
            ctx.fillStyle = `hsl(${l.hue}, ${season === 'spring' ? 60 : 75}%, ${season === 'spring' ? 80 : 45}%)`;
            ctx.beginPath();
            ctx.ellipse(0, 0, 5, 3, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    });
    if (allDone) seasonLeafActive = false;
}

function drawSmoke() {
    if (weather === 'storm' || weather === 'rain') return;
    smoke.forEach((s, i) => {
        s.x += s.vx + (weather === 'wind' ? 1.5 : 0);
        s.y += s.vy;
        s.life++;
        s.size += 0.08;
        s.alpha -= 0.002;
        if (s.life > 90 || s.alpha <= 0) resetSmoke(s, i);
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = season === 'winter' ? 'rgba(220,230,240,1)' : 'rgba(180,180,170,1)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawFireflies() {
    if (todBlend > 0.5) return;
    if (weather === 'rain' || weather === 'storm') return;
    const alpha = clamp(1 - todBlend * 2, 0, 1);
    fireflies.forEach(f => {
        f.angle += (Math.random() - 0.5) * 0.08;
        f.x += Math.cos(f.angle) * f.speed;
        f.y += Math.sin(f.angle) * f.speed * 0.5;
        f.x = clamp(f.x, 60, W - 60);
        f.y = clamp(f.y, H * 0.3, H * 0.65);
        const g = 0.4 + 0.6 * Math.sin(frame * 0.05 + f.phase);
        ctx.save();
        ctx.globalAlpha = g * 0.85 * alpha;
        ctx.shadowBlur = 12 + g * 8;
        ctx.shadowColor = '#aaff88';
        ctx.fillStyle = '#ccff99';
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

const fireflies = Array.from({length: 18}, () => ({
    x: 80 + rnd(W - 160), y: H * 0.35 + rnd(H * 0.3),
    speed: 0.3 + rnd(0.4), angle: rnd(Math.PI * 2), phase: rnd(Math.PI * 2), size: 1.5 + rnd(1.5)
}));

function drawButterflies() {
    if (todBlend < 0.4) return;
    if (season === 'winter' || season === 'autumn') return;
    if (weather === 'rain' || weather === 'storm') return;
    const count = weather === 'wind' ? 2 : butterflies.length;
    butterflies.slice(0, count).forEach(bf => {
        bf.x += bf.vx + (weather === 'wind' ? 0.8 : 0);
        bf.flapT += 0.12;
        bf.y += Math.sin(bf.flapT * 0.3) * 0.5;
        if (bf.x > W + 30) bf.x = -30;
        const flap = Math.abs(Math.sin(bf.flapT));
        ctx.save();
        ctx.translate(bf.x, bf.y);
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = bf.col;
        ctx.beginPath();
        ctx.ellipse(-7 * flap, -2, 7 * flap, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(7 * flap, -2, 7 * flap, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a1a00';
        ctx.beginPath();
        ctx.ellipse(0, 0, 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

const butterflies = Array.from({length: 5}, (_, i) => ({
    x: 100 + i * 120, y: H * 0.3 + rnd(H * 0.2),
    vx: 0.5 + rnd(0.4), flapT: rnd(Math.PI * 2),
    col: `hsl(${[280, 320, 40, 200, 160][i]},70%,65%)`
}));

function tickCanopyLeaves() {
    const shouldFall = season === 'autumn' && (weather === 'wind' || weather === 'storm');
    canopyLeaves.forEach(l => {
        if (!l.active) {
            if (shouldFall) {
                l.timer--;
                if (l.timer <= 0) {
                    resetCanopyLeaf(l);
                    l.active = true;
                }
            }
            return;
        }
        l.x += l.vx + (weather === 'wind' ? 1.5 : 0);
        l.y += l.vy;
        l.rot += l.drot;
        if (l.y > H * 0.63) {
            l.active = false;
            l.timer = rnd(120) | 0;
        }
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.rot);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = `hsl(${l.hue},72%,44%)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
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

