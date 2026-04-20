function summonOwlBats() {
    owlForced = !owlForced; // toggle
}

function drawOwl() {
    // show owl at night (or forced), non-winter
    if (!owl.show()) return;
    const tr = trees[owl.treeIdx];
    let { x, y } = getTreeTopPos(tr);
    y -= 15;
    x -= 5;

    owl.headTimer++;
    if (owl.headTimer > 120) {
        owl.headTarget = rndPM(0.8);
        owl.headTimer = 0;
        if (p(PROBABILITY.OWL_BLINK)) owl.blinkT = 0;
    }
    owl.headAngle = lerp(owl.headAngle, owl.headTarget, 0.04);
    if (owl.blinkT >= 0) {
        owl.blinkT++;
        if (owl.blinkT > 8) owl.blinkT = -1;
    }

    ctx.save();
    ctx.translate(x, y);
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
