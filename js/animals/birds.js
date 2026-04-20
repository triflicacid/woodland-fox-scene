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
