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
