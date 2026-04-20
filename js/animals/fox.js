// colours
const FC = {
    orange: '#e8621a',
    mid: '#cc4e10',
    dark: '#8a2a08',
    white: '#f5ede4',
    cream: '#eddcc8',
    black: '#1a0a04',
    pink: '#e8a0a0',
};

function drawFox() {
    let fx = fox.x;
    if (fox.phase === 'wander_out' || fox.phase === 'wander_sniff' || fox.phase === 'wander_in') fx = fox.wanderX;

    // Shiver when cold/stormy and curled
    const shivering = fox.poseBlend < 0.05 &&
        (season === 'winter' || weather === 'storm' || weather === 'rain' || weather === 'snow');
    if (shivering) fox.shiverT++;
    const sx = shivering ? Math.sin(fox.shiverT * 1.9) * 1.3 : 0;
    const sy = shivering ? Math.sin(fox.shiverT * 2.6) * 0.6 : 0;

    // Snow accumulation
    if (weather === 'snow' && fox.poseBlend < 0.05) fox.snowLevel = Math.min(1, fox.snowLevel + 0.00025);
    else fox.snowLevel = Math.max(0, fox.snowLevel - 0.0012);

    ctx.save();
    ctx.translate(fx + sx, fox.y + sy);
    if (fox.spinAngle !== 0) ctx.scale(Math.cos(fox.spinAngle), 1 - Math.abs(Math.sin(fox.spinAngle)) * 0.08);

    const b = fox.poseBlend;
    const facingLeft = bunny.phase === 'fox_waking' || bunny.phase === 'nuzzle' || bunny.phase === 'fox_sleep';
    const wanderFacingLeft = fox.phase !== 'wander_out' && fox.phase !== 'wander_sniff';

    if (b < 0.01) drawCurledFox();
    else if (b > 0.99) drawStandingFox(facingLeft || wanderFacingLeft);
    else {
        ctx.save();
        ctx.globalAlpha = 1 - b;
        drawCurledFox();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = b;
        drawStandingFox(facingLeft || wanderFacingLeft);
        ctx.restore();
    }

    ctx.restore();

    // Winter breath puff
    if (season === 'winter' && b < 0.05) {
        fox.breathT++;
        if (fox.breathT % 90 < 22) {
            const bt = (fox.breathT % 90) / 22;
            ctx.save();
            ctx.globalAlpha = 0.3 * (1 - bt);
            ctx.fillStyle = '#ddeeff';
            ctx.beginPath();
            ctx.arc(fx - 40 + bt * 10, fox.y - 20 - bt * 7, 2 + bt * 5, 0, Math.PI * 2);
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
    ctx.scale(1 + fox.rainTuck * 0.06, 1 - fox.rainTuck * 0.04);

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 46, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Tail wrapping around (drawn first, behind body) ──────────
    // Thick fluffy arc — main orange fill
    ctx.save();
    ctx.strokeStyle = FC.orange;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(4, -8, 30, Math.PI * 0.05, Math.PI * 1.25, false);
    ctx.stroke();
    // Mid shading on tail
    ctx.strokeStyle = FC.mid;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(4, -8, 30, Math.PI * 0.05, Math.PI * 1.25, false);
    ctx.stroke();
    // White tip
    ctx.strokeStyle = FC.white;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(4, -8, 30, Math.PI * 1.1, Math.PI * 1.25, false);
    ctx.stroke();
    // Fluffy white tip highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(4, -8, 30, Math.PI * 1.15, Math.PI * 1.22, false);
    ctx.stroke();
    ctx.restore();

    // ── Main body ────────────────────────────────────────────────
    // Back/flank — rich orange gradient
    const bodyGrad = ctx.createRadialGradient(-5, -20, 4, 2, -10, 42);
    bodyGrad.addColorStop(0, '#f07828');
    bodyGrad.addColorStop(0.45, FC.orange);
    bodyGrad.addColorStop(0.8, FC.mid);
    bodyGrad.addColorStop(1, FC.dark);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, -13, 36, 20, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // White belly / chest patch
    ctx.fillStyle = FC.cream;
    ctx.beginPath();
    ctx.ellipse(6, -7, 18, 13, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // ── Head ─────────────────────────────────────────────────────
    // Head is tucked, tilted down slightly when rain-tucked
    const headRot = -0.3 + fox.rainTuck * 0.25;
    ctx.save();
    ctx.translate(-20, -20);
    ctx.rotate(headRot);

    // White cheek/ruff behind head
    ctx.fillStyle = FC.white;
    ctx.beginPath();
    ctx.ellipse(0, 2, 15, 12, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Head skull — rounded on top
    ctx.fillStyle = FC.orange;
    ctx.beginPath();
    ctx.arc(0, -2, 13, 0, Math.PI * 2);
    ctx.fill();

    // Dark forehead/mask markings
    ctx.fillStyle = FC.mid;
    ctx.beginPath();
    ctx.ellipse(0, -4, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Ears — large, upright triangles ─────────────────────────
    // Left ear (further)
    ctx.fillStyle = FC.mid;
    ctx.beginPath();
    ctx.moveTo(-7, -13);
    ctx.lineTo(-14, -30);
    ctx.lineTo(-1, -14);
    ctx.closePath();
    ctx.fill();
    // Right ear (nearer, slightly in front)
    ctx.fillStyle = FC.orange;
    ctx.beginPath();
    ctx.moveTo(2, -13);
    ctx.lineTo(-4, -31);
    ctx.lineTo(10, -14);
    ctx.closePath();
    ctx.fill();
    // Inner ear pink
    ctx.fillStyle = FC.pink;
    ctx.beginPath();
    ctx.moveTo(3, -14);
    ctx.lineTo(-2, -27);
    ctx.lineTo(8, -15);
    ctx.closePath();
    ctx.fill();

    // Ear twitch highlight
    if (fox.earTwitchT >= 0 && fox.earTwitchT < 20) {
        const et = 1 - fox.earTwitchT / 20;
        ctx.fillStyle = `rgba(255,200,100,${0.5 * et})`;
        ctx.beginPath();
        ctx.moveTo(2, -13);
        ctx.lineTo(-4, -31);
        ctx.lineTo(10, -14);
        ctx.closePath();
        ctx.fill();
    }

    // ── Muzzle — elongated fox snout ────────────────────────────
    // White muzzle base
    ctx.fillStyle = FC.white;
    ctx.beginPath();
    ctx.ellipse(-8, 4, 10, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Muzzle top (orange)
    ctx.fillStyle = FC.orange;
    ctx.beginPath();
    ctx.ellipse(-7, 0, 8, 5, -0.15, 0, Math.PI * 2);
    ctx.fill();
    // Dark nose
    ctx.fillStyle = FC.black;
    ctx.beginPath();
    ctx.ellipse(-15, 4, 3.5, 2.8, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(-14.5, 3.2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.strokeStyle = FC.black;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    if (fox.yawnT >= 0 && fox.yawnT < 60) {
        // Yawn - eyes half open, mouth open
        const yt = fox.yawnT / 60;
        const mo = Math.sin(yt * Math.PI) * 9;
        ctx.beginPath();
        ctx.arc(-2, -4, 4.5, Math.PI * 0.05, Math.PI * 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(6, -4, 4.5, Math.PI * 0.05, Math.PI * 0.6);
        ctx.stroke();
        // Open mouth
        ctx.fillStyle = '#5a0800';
        ctx.beginPath();
        ctx.ellipse(-10, 8, 6, mo * 0.6, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f0a090';
        ctx.beginPath();
        ctx.ellipse(-10, 8, 4, mo * 0.35, -0.15, 0, Math.PI * 2);
        ctx.fill();
        // Tongue tip
        if (mo > 4) {
            ctx.fillStyle = '#e06060';
            ctx.beginPath();
            ctx.ellipse(-10, 9 + mo * 0.2, 3, mo * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        // Sleeping
        ctx.beginPath();
        ctx.arc(-2, -4, 4.5, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(6, -4, 4.5, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
        // Tiny eyelash dots
        ctx.fillStyle = FC.black;
        ctx.beginPath();
        ctx.arc(-2, -8, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6, -8, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore(); // head

    // Grumble exclamation
    if (fox.grumbleT >= 0 && fox.grumbleT < 40) {
        const gt = fox.grumbleT / 40;
        ctx.save();
        ctx.globalAlpha = 1 - gt;
        ctx.fillStyle = '#ff7700';
        ctx.font = `bold ${14 + gt * 5}px serif`;
        ctx.fillText('!', -10, -52 - gt * 18);
        ctx.fillStyle = 'rgba(255,140,40,0.3)';
        ctx.beginPath();
        ctx.arc(-7, -56 - gt * 12, 9 + gt * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // ZZZs when eepy
    if (todBlend < 0.5 && fox.phase === 'idle') {
        ['z', 'z', 'Z'].forEach((z, i) => {
            ctx.globalAlpha = 0.45 + 0.3 * Math.sin(frame * 0.04 + i * 0.9 + Math.PI);
            ctx.fillStyle = 'rgba(180,210,255,0.9)';
            ctx.font = `bold ${10 + i * 3}px serif`;
            ctx.fillText(z, -5 - i * 6, -42 - i * 11);
        });
        ctx.globalAlpha = 1;
    }

    // Snow accumulation
    if (fox.snowLevel > 0.02) {
        ctx.save();
        // Clip to the top-facing surface of the fox body
        ctx.beginPath();
        // Spine curve: follows the top arc of the curled body
        ctx.moveTo(-34, -10);
        ctx.bezierCurveTo(-28, -38, 10, -38, 24, -18);
        ctx.bezierCurveTo(28, -10, 20, -6, 0, -2);
        ctx.bezierCurveTo(-18, -2, -30, -4, -34, -10);
        ctx.clip();

        // Snow layer — thicker as level increases
        const snowDepth = fox.snowLevel * 14;
        const snowGrad = ctx.createLinearGradient(0, -38, 0, -38 + snowDepth + 6);
        snowGrad.addColorStop(0, 'rgba(255,255,255,0.97)');
        snowGrad.addColorStop(0.6, 'rgba(230,242,255,0.90)');
        snowGrad.addColorStop(1, 'rgba(210,230,250,0.0)');
        ctx.fillStyle = snowGrad;
        ctx.beginPath();
        ctx.moveTo(-36, -38);
        // Slightly lumpy snow surface
        for (let sx = -36; sx <= 30; sx += 6) {
            const lump = Math.sin(sx * 0.4 + frame * 0.01) * 1.5 * fox.snowLevel;
            ctx.lineTo(sx, -38 + snowDepth * (0.3 + 0.7 * ((sx + 36) / 66)) + lump);
        }
        ctx.lineTo(30, 10);
        ctx.lineTo(-36, 10);
        ctx.closePath();
        ctx.fill();

        // Crisp white top edge
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-36, -38);
        for (let sx = -36; sx <= 30; sx += 4) {
            const lump = Math.sin(sx * 0.4 + frame * 0.01) * 1.5 * fox.snowLevel;
            ctx.lineTo(sx, -38 + snowDepth * (0.3 + 0.7 * ((sx + 36) / 66)) + lump);
        }
        ctx.stroke();

        ctx.restore(); // clip
    }

    ctx.restore(); // translate+scale
}

// Canonical: faces LEFT (head at -x). facingLeft=false flips to face right.
function drawStandingFox(facingLeft = true) {
    const s = fox.stretchBlend;
    const legLen = 32 + s * 14;
    const neckExt = s * 8;

    ctx.save();
    if (!facingLeft) ctx.scale(-1, 1);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    ctx.beginPath();
    ctx.ellipse(0, 5, 44, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (behind body)
    ctx.lineCap = 'round';
    // Back pair (on positive-x/tail side)
    ctx.strokeStyle = FC.dark;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(18, -6);
    ctx.lineTo(22, -6 + legLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, -6);
    ctx.lineTo(14, -6 + legLen);
    ctx.stroke();
    // Front pair
    ctx.beginPath();
    ctx.moveTo(-12, -10);
    ctx.lineTo(-16 - s * 6, -10 + legLen);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4, -10);
    ctx.lineTo(-6 - s * 3, -10 + legLen);
    ctx.stroke();
    // Paws — slightly darker, rounded
    ctx.fillStyle = FC.dark;
    [[-16 - s * 6, -10 + legLen], [-6 - s * 3, -10 + legLen], [22, -6 + legLen], [14, -6 + legLen]].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.ellipse(px, py, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    // White toe tips
    ctx.fillStyle = FC.white;
    [[-16 - s * 6, -10 + legLen], [-6 - s * 3, -10 + legLen], [22, -6 + legLen], [14, -6 + legLen]].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.ellipse(px - 1, py, 3, 1.8, 0, 0, Math.PI);
        ctx.fill();
    });

    // Body
    const bodyG = ctx.createRadialGradient(-4, -28, 5, 4, -22, 36);
    bodyG.addColorStop(0, '#f07828');
    bodyG.addColorStop(0.4, FC.orange);
    bodyG.addColorStop(0.85, FC.mid);
    bodyG.addColorStop(1, FC.dark);
    ctx.fillStyle = bodyG;
    // Taper to haunches
    ctx.beginPath();
    ctx.ellipse(2, -24, 30, 18, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // White chest
    ctx.fillStyle = FC.cream;
    ctx.beginPath();
    ctx.ellipse(0, -18, 14, 12, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Darker back saddle
    ctx.fillStyle = 'rgba(180,60,10,0.25)';
    ctx.beginPath();
    ctx.ellipse(8, -30, 22, 10, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.save();
    ctx.translate(30, -20);
    ctx.rotate(fox.tailWag);
    // Main tail body
    ctx.strokeStyle = FC.orange;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(20, -8, 32, -26, 20, -44);
    ctx.stroke();
    // Mid shading
    ctx.strokeStyle = FC.mid;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(20, -8, 32, -26, 20, -44);
    ctx.stroke();
    // White tip — thick fluffy end
    ctx.strokeStyle = FC.white;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(16, -36);
    ctx.bezierCurveTo(20, -40, 22, -46, 20, -44);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(17, -38);
    ctx.bezierCurveTo(20, -42, 21, -45, 20, -44);
    ctx.stroke();
    ctx.restore();

    // White chest connects neck to body
    ctx.fillStyle = FC.white;
    ctx.beginPath();
    ctx.ellipse(-16, -40 - neckExt * 0.3, 12, 10, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = FC.orange;
    ctx.beginPath();
    ctx.ellipse(-16, -42 - neckExt * 0.5, 9, 11, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const hy = -56 - neckExt;

    // White cheek ruff
    ctx.fillStyle = FC.white;
    ctx.beginPath();
    ctx.ellipse(-20, hy + 2, 16, 13, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Skull
    ctx.fillStyle = FC.orange;
    ctx.beginPath();
    ctx.arc(-18, hy - 2, 14, 0, Math.PI * 2);
    ctx.fill();

    // Dark mask / forehead
    ctx.fillStyle = FC.mid;
    ctx.beginPath();
    ctx.ellipse(-18, hy - 4, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Far ear
    ctx.fillStyle = FC.mid;
    ctx.beginPath();
    ctx.moveTo(-26, hy - 12);
    ctx.lineTo(-30, hy - 34);
    ctx.lineTo(-16, hy - 12);
    ctx.closePath();
    ctx.fill();
    // Near ear
    ctx.fillStyle = FC.orange;
    ctx.beginPath();
    ctx.moveTo(-14, hy - 12);
    ctx.lineTo(-17, hy - 34);
    ctx.lineTo(-4, hy - 12);
    ctx.closePath();
    ctx.fill();
    // Inner ear
    ctx.fillStyle = FC.pink;
    ctx.beginPath();
    ctx.moveTo(-14, hy - 13);
    ctx.lineTo(-16, hy - 30);
    ctx.lineTo(-6, hy - 13);
    ctx.closePath();
    ctx.fill();

    // Muzzle
    ctx.fillStyle = FC.white;
    ctx.beginPath();
    ctx.ellipse(-30, hy + 3, 10, 8, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = FC.orange;
    ctx.beginPath();
    ctx.ellipse(-28, hy - 1, 8, 5.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = FC.black;
    ctx.beginPath();
    ctx.ellipse(-36, hy + 4, 3.8, 3, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(-35.5, hy + 3, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye white (sclera is mostly hidden in foxes — just the iris)
    ctx.fillStyle = '#3a1a00'; // dark amber iris base
    ctx.beginPath();
    ctx.arc(-22, hy - 1, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c06010'; // amber iris
    ctx.beginPath();
    ctx.arc(-22, hy - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = FC.black;  // pupil — vertical slit
    ctx.beginPath();
    ctx.ellipse(-22, hy - 1, 1.2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; // catchlight
    ctx.beginPath();
    ctx.arc(-21, hy - 2.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Far eye (smaller, behind head curve)
    ctx.fillStyle = '#3a1a00';
    ctx.beginPath();
    ctx.arc(-12, hy - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c06010';
    ctx.beginPath();
    ctx.arc(-12, hy - 1, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = FC.black;
    ctx.beginPath();
    ctx.ellipse(-12, hy - 1, 1, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(-11.5, hy - 2, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}