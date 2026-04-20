function drawDeer(x, y, grazing) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.15, 1.15); // slightly larger

    const graze = grazing ? Math.sin(frame * 0.04) * 0.18 : 0;
    const lb = Math.sin(frame * 0.09) * 2.5;
    const sc = '#6a4020'; // leg colour

    // Rear legs
    ctx.strokeStyle = sc;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.lineTo(12, 28 + lb);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(16, -2);
    ctx.lineTo(18, 28 - lb);
    ctx.stroke();
    // Front legs
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-10, 28 + lb);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.lineTo(-4, 28 - lb);
    ctx.stroke();
    // Hooves
    ctx.fillStyle = '#2a1008';
    [[12, 29], [18, 29], [-10, 29], [-4, 29]].forEach(([hx, hy]) => {
        ctx.beginPath();
        ctx.ellipse(hx, hy + lb * 0.3, 3.5, 2, 0.1, 0, Math.PI * 2);
        ctx.fill();
    });

    // Body - main torso
    const bg = ctx.createRadialGradient(0, -14, 3, 2, -10, 26);
    bg.addColorStop(0, '#d4844a');
    bg.addColorStop(0.6, '#a85a28');
    bg.addColorStop(1, '#7a3e18');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(4, -12, 26, 16, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Lighter belly
    ctx.fillStyle = '#d4a06a';
    ctx.beginPath();
    ctx.ellipse(4, -6, 16, 7, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // White rump patch
    ctx.fillStyle = '#e8d4b0';
    ctx.beginPath();
    ctx.ellipse(22, -10, 8, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    const tf = Math.sin(frame * 0.07) * 0.25;
    ctx.fillStyle = '#f0e0c0';
    ctx.beginPath();
    ctx.ellipse(25, -8, 4, 6, tf, 0, Math.PI * 2);
    ctx.fill();

    // Neck - angled forward (or down if grazing)
    const neckAngle = -0.5 + graze * 1.2;
    ctx.save();
    ctx.translate(-14, -16);
    ctx.rotate(neckAngle);
    const ng = ctx.createLinearGradient(-5, 0, 5, 0);
    ng.addColorStop(0, '#8a4a20');
    ng.addColorStop(0.5, '#b06030');
    ng.addColorStop(1, '#8a4a20');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-4, -26);
    ctx.lineTo(4, -26);
    ctx.lineTo(5, 0);
    ctx.closePath();
    ctx.fill();

    // Head on top of neck
    const headY = -28;
    ctx.fillStyle = '#a85a28';
    ctx.beginPath();
    ctx.ellipse(0, headY, 9, 7, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Muzzle
    ctx.fillStyle = '#c07840';
    ctx.beginPath();
    ctx.ellipse(-8, headY + 2, 7, 5, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Nostril
    ctx.fillStyle = '#3a1a08';
    ctx.beginPath();
    ctx.ellipse(-14, headY + 3, 1.8, 1.4, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Ear
    ctx.fillStyle = '#b06030';
    ctx.beginPath();
    ctx.moveTo(4, headY - 4);
    ctx.bezierCurveTo(10, headY - 18, 16, headY - 20, 14, headY - 10);
    ctx.bezierCurveTo(12, headY - 4, 6, headY, 4, headY - 4);
    ctx.fill();
    ctx.fillStyle = '#e8a070';
    ctx.beginPath();
    ctx.moveTo(5, headY - 5);
    ctx.bezierCurveTo(10, headY - 15, 14, headY - 17, 12, headY - 10);
    ctx.bezierCurveTo(10, headY - 5, 7, headY - 1, 5, headY - 5);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    ctx.arc(-2, headY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-1, headY - 4, 1, 0, Math.PI * 2);
    ctx.fill();

    // Antlers
    ctx.strokeStyle = '#6a3a10';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    // Main beam
    ctx.beginPath();
    ctx.moveTo(2, headY - 7);
    ctx.bezierCurveTo(5, headY - 20, 8, headY - 26, 6, headY - 32);
    ctx.stroke();
    // Tines
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(6, headY - 20);
    ctx.lineTo(12, headY - 26);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, headY - 26);
    ctx.lineTo(2, headY - 32);
    ctx.stroke();

    ctx.restore(); // neck rotation
    ctx.restore(); // translate+scale
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
