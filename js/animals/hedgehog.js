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
