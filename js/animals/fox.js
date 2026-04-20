function drawFox() {
    let fx = fox.x;
    if (fox.phase === 'wander_out' || fox.phase === 'wander_sniff' || fox.phase === 'wander_in') fx = fox.wanderX;

    const shivering = fox.poseBlend < 0.05 &&
        (season === 'winter' || weather === 'storm' || weather === 'rain' || weather === 'snow');
    if (shivering) fox.shiverT++;
    const sx = shivering ? Math.sin(fox.shiverT * 1.9) * 1.2 : 0;
    const sy = shivering ? Math.sin(fox.shiverT * 2.7) * 0.5 : 0;

    if (weather === 'snow' && fox.poseBlend < 0.05) fox.snowLevel = Math.min(1, fox.snowLevel + 0.00025);
    else fox.snowLevel = Math.max(0, fox.snowLevel - 0.0012);

    ctx.save();
    ctx.translate(fx + sx, fox.y + sy);
    if (fox.spinAngle !== 0) ctx.scale(Math.cos(fox.spinAngle), 1 - Math.abs(Math.sin(fox.spinAngle)) * 0.08);

    const b = fox.poseBlend;
    const wanderFacingLeft = !(fox.phase === 'wander_out' || fox.phase === 'wander_sniff');
    const facingLeft = bunny.phase === 'fox_waking' || bunny.phase === 'nuzzle' || bunny.phase === 'fox_sleep';
    const fl = facingLeft || wanderFacingLeft;

    if (b < 0.01) drawCurledFox();
    else if (b > 0.99) drawStandingFox(fl);
    else {
        ctx.save();
        ctx.globalAlpha = 1 - b;
        drawCurledFox();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = b;
        drawStandingFox(fl);
        ctx.restore();
    }
    ctx.restore();

    // Winter breath
    if (season === 'winter' && b < 0.05) {
        fox.breathT++;
        if (fox.breathT % 90 < 22) {
            const bt = (fox.breathT % 90) / 22;
            ctx.save();
            ctx.globalAlpha = 0.25 * (1 - bt);
            ctx.fillStyle = '#ddeeff';
            ctx.beginPath();
            ctx.arc(fx - 40 + bt * 10, fox.y - 22 - bt * 7, 2 + bt * 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

function drawCurledFox() {
    const tuck = (weather === 'rain' || weather === 'storm') ? 1 : 0;
    fox.rainTuck = lerp(fox.rainTuck, tuck, 0.05);
    const bob = Math.sin(frame * 0.038) * lerp(1.4, 0.25, fox.rainTuck);

    ctx.save();
    ctx.translate(0, bob);
    ctx.scale(1 + fox.rainTuck * 0.04, 1 - fox.rainTuck * 0.03);

    // Drop shadow
    blob(() => ctx.ellipse(2, 6, 42, 9, 0, 0, Math.PI * 2),
        'rgba(0,0,0,0.18)');

    // Draw tail first so body sits on top
    blob(() => {
        ctx.moveTo(28, -2);
        ctx.bezierCurveTo(62, -2, 66, -32, 48, -52);
        ctx.bezierCurveTo(40, -62, 22, -58, 18, -48);
        ctx.bezierCurveTo(12, -36, 16, -18, 10, -8);
        ctx.bezierCurveTo(8, -2, 16, 0, 28, -2);
    }, rg(38, -28, 4, 34, [0, '#f5a030'], [0.5, '#e06018'], [1, '#9a2c08']));

    // White tail tip
    blob(() => {
        ctx.moveTo(18, -48);
        ctx.bezierCurveTo(12, -62, 28, -70, 48, -52);
        ctx.bezierCurveTo(38, -58, 24, -54, 18, -48);
    }, rg(32, -58, 2, 18, [0, '#ffffff'], [0.5, '#e8f5f0'], [1, '#b8ddd8']));

    // Body
    blob(() => ctx.ellipse(0, -10, 38, 22, 0.12, 0, Math.PI * 2),
        rg(-4, -20, 3, 40,
            [0, '#f5a050'], [0.4, '#e86820'], [0.75, '#c04412'], [1, '#882408']));

    // Chest
    blob(() => ctx.ellipse(6, -5, 20, 15, 0.1, 0, Math.PI * 2),
        rg(8, -2, 2, 20, [0, '#fdecd8'], [0.5, '#f8d4b0'], [1, '#e8b080']));

    // Far paw
    blob(() => ctx.ellipse(-12, 4, 10, 5.5, 0.1, 0, Math.PI * 2),
        rg(-12, 4, 1, 10, [0, '#d85c18'], [1, '#882408']));
    // Near paw
    blob(() => ctx.ellipse(-1, 5, 10, 5.5, 0.08, 0, Math.PI * 2),
        rg(-1, 5, 1, 10, [0, '#e06820'], [1, '#9a2c0a']));
    // Toe dimples
    ctx.strokeStyle = 'rgba(90,18,4,0.4)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    [[-14, 7], [-11, 8], [-8, 7]].forEach(([tx, ty]) => {
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx, ty + 2.5);
        ctx.stroke();
    });
    [[-3, 8], [0, 9], [3, 8]].forEach(([tx, ty]) => {
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx, ty + 2.5);
        ctx.stroke();
    });

    // Head
    ctx.save();
    ctx.translate(-22, -22);
    ctx.rotate(-0.25 + fox.rainTuck * 0.18);
    blob(() => ctx.arc(0, 0, 16, 0, Math.PI * 2),
        rg(-2, -4, 2, 18,
            [0, '#f5a050'], [0.5, '#e86820'], [1, '#c04412']));

    // Far ear (slightly behind, darker)
    ctx.fillStyle = '#c04010';
    ctx.beginPath();
    ctx.moveTo(-9, -13);
    ctx.lineTo(-14, -32);
    ctx.lineTo(-2, -13);
    ctx.closePath();
    ctx.fill();
    // Near ear
    ctx.fillStyle = '#e06828';
    ctx.beginPath();
    ctx.moveTo(1, -13);
    ctx.lineTo(-3, -34);
    ctx.lineTo(10, -13);
    ctx.closePath();
    ctx.fill();
    // Dark interior — just the inside of the ear
    ctx.fillStyle = 'rgba(20,6,2,0.75)';
    ctx.beginPath();
    ctx.moveTo(-8, -14);
    ctx.lineTo(-12, -29);
    ctx.lineTo(-3, -14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(20,6,2,0.75)';
    ctx.beginPath();
    ctx.moveTo(2, -14);
    ctx.lineTo(-1, -30);
    ctx.lineTo(9, -14);
    ctx.closePath();
    ctx.fill();
    // Tiny pink inner
    ctx.fillStyle = 'rgba(220,130,110,0.55)';
    ctx.beginPath();
    ctx.moveTo(2, -15);
    ctx.lineTo(-0, -27);
    ctx.lineTo(8, -15);
    ctx.closePath();
    ctx.fill();

    // Ear twitch flash
    if (fox.earTwitchT >= 0 && fox.earTwitchT < 20) {
        const et = 1 - fox.earTwitchT / 20;
        ctx.fillStyle = `rgba(255,210,130,${0.55 * et})`;
        ctx.beginPath();
        ctx.moveTo(1, -13);
        ctx.lineTo(-3, -34);
        ctx.lineTo(10, -13);
        ctx.closePath();
        ctx.fill();
    }

    // Muzzle
    blob(() => ctx.ellipse(-9, 5, 11, 8, -0.15, 0, Math.PI * 2),
        rg(-6, 4, 1, 13, [0, '#fde8c8'], [0.6, '#f5cfa0'], [1, '#dba070']));

    // Nose
    ctx.fillStyle = '#1a0804';
    ctx.beginPath();
    ctx.arc(-18, 5, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(-17.4, 4.2, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.strokeStyle = '#1a0804';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    if (fox.yawnT >= 0 && fox.yawnT < 60) {
        const yt = fox.yawnT / 60, mo = Math.sin(yt * Math.PI) * 9;
        ctx.beginPath();
        ctx.arc(1, -5, 5, Math.PI * 0.1, Math.PI * 0.65);
        ctx.stroke();
        ctx.fillStyle = '#5a0800';
        ctx.beginPath();
        ctx.ellipse(-13, 10, 5, mo * 0.5, 0.1, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Closed eye
        ctx.beginPath();
        ctx.arc(1, -5, 5, Math.PI * 0.18, Math.PI * 0.82);
        ctx.stroke();
        // Small lash flick above
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(1, -10.2);
        ctx.lineTo(2.5, -12);
        ctx.stroke();
    }

    ctx.restore(); // head

    // Grumble !
    if (fox.grumbleT >= 0 && fox.grumbleT < 40) {
        const gt = fox.grumbleT / 40;
        ctx.save();
        ctx.globalAlpha = 1 - gt;
        ctx.fillStyle = '#ff7700';
        ctx.font = `bold ${13 + gt * 5}px serif`;
        ctx.fillText('!', -8, -55 - gt * 14);
        ctx.restore();
    }

    // ZZZs
    if (todBlend < 0.5 && fox.phase === 'idle') {
        ['z', 'z', 'Z'].forEach((z, i) => {
            ctx.globalAlpha = 0.45 + 0.3 * Math.sin(frame * 0.04 + i * 0.9 + Math.PI);
            ctx.fillStyle = 'rgba(180,210,255,0.9)';
            ctx.font = `bold ${10 + i * 3}px serif`;
            ctx.fillText(z, -2 - i * 6, -46 - i * 12);
        });
        ctx.globalAlpha = 1;
    }

    // Snow accumulation
    if (fox.snowLevel > 0.02) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.bezierCurveTo(-38, -44, 20, -44, 30, -16);
        ctx.lineTo(26, 0);
        ctx.closePath();
        ctx.clip();
        const d = fox.snowLevel * 15;
        ctx.fillStyle = 'rgba(255,255,255,0.93)';
        ctx.beginPath();
        ctx.moveTo(-42, -44);
        for (let sx = -42; sx <= 32; sx += 5) {
            const lump = Math.sin(sx * 0.42 + frame * 0.01) * 1.8 * fox.snowLevel;
            ctx.lineTo(sx, -44 + d * (0.15 + 0.85 * ((sx + 42) / 74)) + lump);
        }
        ctx.lineTo(32, 4);
        ctx.lineTo(-42, 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.97)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-42, -44);
        for (let sx = -42; sx <= 32; sx += 4) {
            const lump = Math.sin(sx * 0.42 + frame * 0.01) * 1.8 * fox.snowLevel;
            ctx.lineTo(sx, -44 + d * (0.15 + 0.85 * ((sx + 42) / 74)) + lump);
        }
        ctx.stroke();
        ctx.restore();
    }

    ctx.restore(); // bob+scale
}

// Canonical: faces LEFT (head at -x). facingLeft=false flips to face right.
function drawStandingFox(facingLeft = true) {
    const s = fox.stretchBlend, legLen = 34 + s * 14, nk = s * 8;
    ctx.save();
    if (!facingLeft) ctx.scale(-1, 1);

    // Shadow
    blob(() => ctx.ellipse(0, 5, 44, 8, 0, 0, Math.PI * 2), 'rgba(0,0,0,0.18)');

    // Tail
    ctx.save();
    ctx.translate(24, -18);
    ctx.rotate(fox.tailWag);
    blob(() => {
        ctx.moveTo(0, 2);
        ctx.bezierCurveTo(28, -2, 40, -24, 30, -48);
        ctx.bezierCurveTo(24, -56, 10, -54, 8, -46);
        ctx.bezierCurveTo(4, -36, 4, -16, 0, 2);
    }, rg(12, -24, 4, 30, [0, '#f5a030'], [0.5, '#e06018'], [1, '#9a2c08']));
    // White tip
    blob(() => {
        ctx.moveTo(8, -46);
        ctx.bezierCurveTo(4, -56, 18, -62, 30, -48);
        ctx.bezierCurveTo(22, -54, 12, -50, 8, -46);
    }, rg(20, -52, 2, 14, [0, '#ffffff'], [0.5, '#e8f5f0'], [1, '#b8ddd8']));
    ctx.restore();

    // Back pair of legs (rump side = positive x)
    [[14, -4], [8, -4], [-12, -8], [-6, -8]].forEach(([lx, ly], i) => {
        const dark = i < 2;
        const topC = dark ? '#b03c10' : '#c84818';
        const botC = dark ? '#6a1e08' : '#7a2810';
        blob(() => ctx.ellipse(lx, ly + legLen / 2, 5, legLen / 2 + 2, 0, 0, Math.PI * 2),
            lg(lx, ly, lx, ly + legLen, [0, topC], [1, botC]));
        // Paw
        blob(() => ctx.ellipse(lx, ly + legLen, 7, 4, 0, 0, Math.PI * 2),
            rg(lx, ly + legLen, 1, 7, [0, '#c04010'], [1, '#701808']));
    });

    // Body
    blob(() => ctx.ellipse(2, -22, 30, 18, 0.05, 0, Math.PI * 2),
        rg(-4, -30, 4, 36,
            [0, '#f5a050'], [0.4, '#e86820'], [0.75, '#c04412'], [1, '#882408']));

    // Bellay
    blob(() => ctx.ellipse(-2, -16, 14, 13, 0.05, 0, Math.PI * 2),
        rg(-2, -14, 2, 16, [0, '#fdecd8'], [0.5, '#f8d4b0'], [1, '#e0a870']));

    // Neck
    blob(() => {
        ctx.moveTo(-8, -34);
        ctx.bezierCurveTo(-6, -44, -12, -52 - nk, -16, -54 - nk);
        ctx.bezierCurveTo(-22, -52 - nk, -26, -44, -22, -34);
        ctx.closePath();
    }, rg(-14, -42, 2, 14, [0, '#f5a050'], [1, '#c04412']));

    // Head
    const hy = -58 - nk;
    blob(() => ctx.arc(-16, hy, 16, 0, Math.PI * 2),
        rg(-16, hy - 4, 3, 18,
            [0, '#f5a050'], [0.45, '#e86820'], [1, '#b83c10']));

    // Far ear
    ctx.fillStyle = '#c04010';
    ctx.beginPath();
    ctx.moveTo(-26, hy - 12);
    ctx.lineTo(-30, hy - 36);
    ctx.lineTo(-14, hy - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(18,5,2,0.78)';
    ctx.beginPath();
    ctx.moveTo(-25, hy - 13);
    ctx.lineTo(-28, hy - 32);
    ctx.lineTo(-16, hy - 13);
    ctx.closePath();
    ctx.fill();

    // Near ear
    ctx.fillStyle = '#e06828';
    ctx.beginPath();
    ctx.moveTo(-10, hy - 12);
    ctx.lineTo(-12, hy - 36);
    ctx.lineTo(-1, hy - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(18,5,2,0.78)';
    ctx.beginPath();
    ctx.moveTo(-10, hy - 13);
    ctx.lineTo(-11, hy - 32);
    ctx.lineTo(-3, hy - 13);
    ctx.closePath();
    ctx.fill();
    // Pink inner near ear
    ctx.fillStyle = 'rgba(210,120,100,0.6)';
    ctx.beginPath();
    ctx.moveTo(-9, hy - 14);
    ctx.lineTo(-10, hy - 29);
    ctx.lineTo(-4, hy - 14);
    ctx.closePath();
    ctx.fill();

    // White cheek ruff
    blob(() => ctx.ellipse(-18, hy + 6, 14, 9, -0.1, 0, Math.PI * 2),
        rg(-18, hy + 4, 2, 14, [0, '#fdecd8'], [0.6, '#f5d4a8'], [1, 'rgba(240,200,140,0)']));

    // Muzzle
    blob(() => ctx.ellipse(-28, hy + 2, 11, 8, -0.12, 0, Math.PI * 2),
        rg(-26, hy + 1, 1, 13, [0, '#fde8c8'], [0.6, '#f5cfa0'], [1, '#d8a068']));

    // Nose
    ctx.fillStyle = '#1a0804';
    ctx.beginPath();
    ctx.arc(-36, hy + 2, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(-35.5, hy + 1.2, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // Sclera glow
    blob(() => ctx.arc(-8, hy - 4, 5.5, 0, Math.PI * 2),
        rg(-8, hy - 4, 0, 5.5, [0, 'rgba(255,245,220,0.6)'], [1, 'rgba(255,245,220,0)']));
    // Dark ring
    ctx.fillStyle = '#1a0804';
    ctx.beginPath();
    ctx.arc(-8, hy - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    // Amber iris
    ctx.fillStyle = '#c06010';
    ctx.beginPath();
    ctx.arc(-8, hy - 4, 3.8, 0, Math.PI * 2);
    ctx.fill();
    // Vertical slit pupil
    ctx.fillStyle = '#0a0402';
    ctx.beginPath();
    ctx.ellipse(-8, hy - 4, 1.2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Catchlights
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(-6.8, hy - 5.5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-9.5, hy - 2.5, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}
