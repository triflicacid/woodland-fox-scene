function drawFox() {
    let fx = fox.x;
    if (fox.phase === 'wander_out' || fox.phase === 'wander_sniff' || fox.phase === 'wander_in') fx = fox.wanderX;

    ctx.save();
    ctx.translate(fx, fox.y);
    if (fox.spinAngle !== 0) ctx.scale(Math.cos(fox.spinAngle), 1 - Math.abs(Math.sin(fox.spinAngle)) * 0.08);

    const b = fox.poseBlend;
    const facingLeft = bunny.phase === 'fox_waking' || bunny.phase === 'nuzzle' || bunny.phase === 'fox_sleep';
    const wanderFacing = fox.phase === 'wander_in';

    if (b < 0.01) drawCurledFox();
    else if (b > 0.99) drawStandingFox(facingLeft || wanderFacing);
    else {
        ctx.save();
        ctx.globalAlpha = 1 - b;
        drawCurledFox();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = b;
        drawStandingFox(facingLeft || wanderFacing);
        ctx.restore();
    }
    ctx.restore();

    // Winter breath puff
    if (season === 'winter' && b < 0.05) {
        fox.breathT++;
        if (fox.breathT % 80 < 20) {
            const bt = (fox.breathT % 80) / 20;
            ctx.save();
            ctx.globalAlpha = 0.25 * (1 - bt);
            ctx.fillStyle = '#ddeeff';
            ctx.beginPath();
            ctx.arc(fx - 38 + bt * 8, fox.y - 18 - bt * 6, 2 + bt * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

function drawCurledFox() {
    const tuck = (weather === 'rain' || weather === 'storm') ? 1 : 0;
    fox.rainTuck = lerp(fox.rainTuck, tuck, 0.05);
    const bob = Math.sin(frame * 0.04) * lerp(1.5, 0.3, fox.rainTuck);

    ctx.save();
    ctx.translate(0, bob);
    ctx.scale(1 + fox.rainTuck * 0.08, 1 - fox.rainTuck * 0.05);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 45, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const bg = ctx.createRadialGradient(-8, -8, 5, -5, -5, 40);
    bg.addColorStop(0, '#f09040');
    bg.addColorStop(0.5, '#e07028');
    bg.addColorStop(1, '#c05018');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(0, -12, 38, 22, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5ede0';
    ctx.beginPath();
    ctx.ellipse(5, -8, 16, 12, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = '#e07028';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -10, 32, Math.PI * 0.1, Math.PI * 1.3, false);
    ctx.stroke();
    ctx.strokeStyle = '#f5ede0';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, -10, 32, Math.PI * 1.15, Math.PI * 1.3, false);
    ctx.stroke();

    // Head
    ctx.save();
    ctx.rotate(fox.rainTuck * 0.15);
    ctx.fillStyle = '#e07028';
    ctx.beginPath();
    ctx.ellipse(-22, -18, 16, 13, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#d06020';
    ctx.beginPath();
    ctx.moveTo(-30, -28);
    ctx.lineTo(-22, -38);
    ctx.lineTo(-16, -28);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-20, -26);
    ctx.lineTo(-13, -34);
    ctx.lineTo(-10, -26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffaaaa';
    ctx.beginPath();
    ctx.moveTo(-28, -29);
    ctx.lineTo(-22, -36);
    ctx.lineTo(-18, -29);
    ctx.closePath();
    ctx.fill();

    // Ear twitch glow
    if (fox.earTwitchT >= 0 && fox.earTwitchT < 20) {
        const et = fox.earTwitchT / 20;
        const tx = fox.earTwitchSide > 0 ? -16 : -28;
        ctx.fillStyle = '#e89040';
        ctx.globalAlpha = 0.4 * (1 - et);
        ctx.beginPath();
        ctx.arc(tx, -30, 5 * (1 - et), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Eyes - closed normally, squint during yawn
    ctx.strokeStyle = '#3a1a00';
    ctx.lineWidth = 1.5;
    if (fox.yawnT >= 0 && fox.yawnT < 60) {
        const yt = fox.yawnT / 60;
        const mo = Math.sin(yt * Math.PI) * 8;
        ctx.beginPath();
        ctx.arc(-25, -20, 4, 0, Math.PI * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-16, -19, 4, 0, Math.PI * 0.5);
        ctx.stroke();
        ctx.fillStyle = '#3a0800';
        ctx.beginPath();
        ctx.ellipse(-29, -13, 5, mo * 0.6, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8c0a0';
        ctx.beginPath();
        ctx.ellipse(-29, -13, 3, mo * 0.4, 0.1, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(-25, -20, 4, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-16, -19, 4, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
    }
    ctx.restore(); // head rotation

    // Nose
    ctx.fillStyle = '#2a0a00';
    ctx.beginPath();
    ctx.ellipse(-32, -17, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grumble exclamation !
    if (fox.grumbleT >= 0 && fox.grumbleT < 40) {
        const gt = fox.grumbleT / 40;
        ctx.save();
        ctx.globalAlpha = 1 - gt;
        ctx.fillStyle = '#ff8800';
        ctx.font = `bold ${12 + gt * 4}px serif`;
        ctx.fillText('!', -8, -45 - gt * 15);
        ctx.fillStyle = 'rgba(255,150,50,0.35)';
        ctx.beginPath();
        ctx.arc(-5, -50 - gt * 10, 8 + gt * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // ZZZs at night
    if (todBlend < 0.5 && fox.phase === 'idle') {
        ['z', 'z', 'Z'].forEach((z, i) => {
            ctx.globalAlpha = 0.4 + 0.3 * Math.sin(frame * 0.04 + i * 0.8 + Math.PI);
            ctx.fillStyle = 'rgba(200,220,255,0.8)';
            ctx.font = `bold ${10 + i * 3}px serif`;
            ctx.fillText(z, -15 - i * 5 - i * 6, -32 - i * 10);
        });
        ctx.globalAlpha = 1;
    }

    ctx.restore(); // translate/scale
}

// direction: head at -x (left), tail at +x (right).
// facingLeft=true -> no flip (faces left). facingLeft=false -> scale(-1,1) to face right.
function drawStandingFox(facingLeft = true) {
    const s = fox.stretchBlend;
    const legLen = 28 + s * 12, neckLen = s * 6;
    ctx.save();
    if (!facingLeft) ctx.scale(-1, 1);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 45, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = '#c05018';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(18, -8);
    ctx.lineTo(22, -8 + legLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.lineTo(12, -8 + legLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-14, -10);
    ctx.lineTo(-18 - s * 5, -10 + legLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-6, -10);
    ctx.lineTo(-8 - s * 3, -10 + legLen);
    ctx.stroke();
    ctx.fillStyle = '#c05018';
    [[-18 - s * 5, -10 + legLen], [-8 - s * 3, -10 + legLen], [22, -8 + legLen], [12, -8 + legLen]].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.ellipse(px, py, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    // Body
    const bg = ctx.createRadialGradient(-6, -30, 5, 2, -26, 38);
    bg.addColorStop(0, '#f09040');
    bg.addColorStop(0.5, '#e07028');
    bg.addColorStop(1, '#c05018');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(2, -26, 32, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5ede0';
    ctx.beginPath();
    ctx.ellipse(2, -22, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.save();
    ctx.translate(28, -22);
    ctx.rotate(fox.tailWag);
    ctx.strokeStyle = '#e07028';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(18, -10, 30, -28, 16, -44);
    ctx.stroke();
    ctx.strokeStyle = '#f5ede0';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(12, -36);
    ctx.bezierCurveTo(18, -40, 18, -46, 16, -44);
    ctx.stroke();
    ctx.restore();

    // Neck
    ctx.fillStyle = '#e07028';
    ctx.beginPath();
    ctx.ellipse(-18, -42 - neckLen, 10, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const hy = -56 - neckLen;
    ctx.fillStyle = '#e07028';
    ctx.beginPath();
    ctx.ellipse(-18, hy, 18, 15, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c05018';
    ctx.beginPath();
    ctx.ellipse(-30, hy + 4, 10, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#d06020';
    ctx.beginPath();
    ctx.moveTo(-26, hy - 10);
    ctx.lineTo(-20, hy - 24);
    ctx.lineTo(-12, hy - 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-14, hy - 8);
    ctx.lineTo(-8, hy - 20);
    ctx.lineTo(-4, hy - 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffaaaa';
    ctx.beginPath();
    ctx.moveTo(-24, hy - 11);
    ctx.lineTo(-20, hy - 21);
    ctx.lineTo(-14, hy - 11);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    ctx.arc(-22, hy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-12, hy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-21, hy - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-11, hy - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#2a0a00';
    ctx.beginPath();
    ctx.ellipse(-34, hy + 5, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
