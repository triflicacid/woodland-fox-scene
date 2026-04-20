function drawHedgehog(x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Scale up for better visibility
    ctx.scale(1.4, 1.4);

    const waddle = Math.sin(frame * 0.14) * 2.5;

    // Legs first (behind body)
    ctx.strokeStyle = '#6a4020';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-9, 3);
    ctx.lineTo(-10, 10 + waddle);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3, 5);
    ctx.lineTo(-4, 12 - waddle);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 5);
    ctx.lineTo(5, 12 + waddle);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(9, 3);
    ctx.lineTo(10, 10 - waddle);
    ctx.stroke();

    // Dark upper body ellipse
    ctx.fillStyle = '#2a1e0a';
    ctx.beginPath();
    ctx.ellipse(2, -5, 17, 11, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Individual spines radiating from back
    ctx.strokeStyle = '#3a2a0e';
    ctx.lineWidth = 1.2;
    const spineCount = 22;
    for (let i = 0; i < spineCount; i++) {
        const t = i / (spineCount - 1);
        const a = Math.PI * 1.05 + t * Math.PI * 0.9; // arc across top
        const bx = Math.cos(a) * 10 + 2;
        const by = Math.sin(a) * 7.5 - 5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(a) * 7, by + Math.sin(a) * 7);
        ctx.stroke();
    }
    // Spine highlight tips
    ctx.strokeStyle = '#c8a850';
    ctx.lineWidth = 0.6;
    for (let i = 2; i < spineCount - 2; i++) {
        const t = i / (spineCount - 1);
        const a = Math.PI * 1.05 + t * Math.PI * 0.9;
        const bx = Math.cos(a) * 10 + 2;
        const by = Math.sin(a) * 7.5 - 5;
        ctx.beginPath();
        ctx.moveTo(bx + Math.cos(a) * 5, by + Math.sin(a) * 5);
        ctx.lineTo(bx + Math.cos(a) * 7, by + Math.sin(a) * 7);
        ctx.stroke();
    }

    // Pale belly
    ctx.fillStyle = '#d4b87a';
    ctx.beginPath();
    ctx.ellipse(2, 2, 13, 5, 0, 0, Math.PI);
    ctx.fill();

    // Face / head — elongated snout
    const hg = ctx.createRadialGradient(-12, -5, 1, -10, -4, 10);
    hg.addColorStop(0, '#b07840');
    hg.addColorStop(1, '#7a5028');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(-10, -4, 10, 7, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = '#9a6030';
    ctx.beginPath();
    ctx.ellipse(-18, -3, 5, 3.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Wet nose
    ctx.fillStyle = '#1a0800';
    ctx.beginPath();
    ctx.ellipse(-22, -3, 2.2, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(-21.5, -3.5, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Eye — small, bright
    ctx.fillStyle = '#0a0500';
    ctx.beginPath();
    ctx.arc(-15, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(-14.3, -8.7, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Ear nub
    ctx.fillStyle = '#8a6030';
    ctx.beginPath();
    ctx.ellipse(-12, -12, 3, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();

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
