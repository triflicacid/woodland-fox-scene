// Return the sway of the tree
function getWindSway(tr) {
    const windE = (weather === 'wind' || weather === 'storm') ? Math.sin(frame * 0.06 + tr.ph) * 10 : 0;
    return Math.sin(frame * tr.sway + tr.ph) * 5 + windE;
}

// Return if the tree is bare or not
function isBare(tr)
{
    return season === 'winter' && tr.type !== 'pine';
}

// Return the trunk height of the tree
function getTrunkHeight(tr) {
    return isBare(tr) ? tr.h * 0.75 : tr.h * 0.18;
}

// Returns the world-space sway offset for a tree's canopy top (used by birds)
function getTreeTopPos(tr) {
    const sway = getWindSway(tr);
    const trunkH = getTrunkHeight(tr);
    const isPine = tr.type === 'pine';
    const topLayerLy = -(trunkH) - (tr.layers - 1) * (tr.h * (isPine ? 0.14 : 0.16));
    // x offset: trunk rotates by sway*0.008, so at height topLayerLy the tip offset is:
    const tipOffsetX = sway * 0.7 * (1 + (tr.layers - 1) * 0.3) + Math.sin(sway * 0.008) * (-topLayerLy);
    return {x: tr.x + tipOffsetX, y: H * 0.62 + topLayerLy - 8};
}

function drawTree(tr) {
    const p = pal();
    const sway = getWindSway(tr);
    const bare = isBare(tr);
    const trunkH = getTrunkHeight(tr);

    ctx.save();
    ctx.translate(tr.x, H * 0.62);
    // Whole tree leans together from the base
    ctx.rotate(sway * 0.008);

    // Tree trunk
    const isBirch = tr.type === 'birch';
    const trunkW = bare ? 7 : 5; // slightly fatter when bare for presence
    const tg = ctx.createLinearGradient(-trunkW, 0, trunkW, 0);
    const tb = isBirch ? '#c8b89a' : bare ? '#7a6a5a' : '#2e1a08';
    const tdark = isBirch ? '#a89878' : bare ? '#5a4a3a' : '#1a0e05';
    tg.addColorStop(0, tdark);
    tg.addColorStop(0.4, tb);
    tg.addColorStop(0.6, tb);
    tg.addColorStop(1, tdark);
    ctx.fillStyle = tg;
    ctx.beginPath();
    // Taper the trunk slightly — wider at base
    ctx.moveTo(-trunkW, 0);
    ctx.lineTo(-trunkW * 0.5, -trunkH);
    ctx.lineTo(trunkW * 0.5, -trunkH);
    ctx.lineTo(trunkW, 0);
    ctx.closePath();
    ctx.fill();

    if (isBirch) {
        ctx.strokeStyle = 'rgba(60,40,20,0.35)';
        ctx.lineWidth = 1.5;
        for (let by = -4; by > -trunkH; by -= 18) {
            ctx.beginPath();
            ctx.moveTo(-trunkW * 0.7, by);
            ctx.lineTo(trunkW * 0.7, by + 3);
            ctx.stroke();
        }
    }

    // Bare winter branches
    if (bare) {
        // Draw a full branching crown — main scaffold branches, then secondary, then twigs
        const branchColor = isBirch ? '#8a7858' : '#4a3a2a';
        ctx.lineCap = 'round';

        // Helper: recursive branch drawer
        function drawBranch(bx, by, angle, len, width, depth) {
            if (depth === 0 || len < 3) return;
            const ex = bx + Math.cos(angle) * len;
            const ey = by + Math.sin(angle) * len;
            ctx.strokeStyle = branchColor;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            // Snow on upward-facing branches
            if (season === 'winter' && angle < -0.3 && width > 1.5) {
                ctx.fillStyle = 'rgba(225,238,252,0.75)';
                ctx.beginPath();
                ctx.ellipse(ex, ey, len * 0.25, Math.max(1, width * 0.4), angle + Math.PI * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            const spread = 0.45 + depth * 0.05;
            const lenMul = 0.65;
            drawBranch(ex, ey, angle - spread, len * lenMul, width * 0.6, depth - 1);
            drawBranch(ex, ey, angle + spread * 0.8, len * lenMul, width * 0.6, depth - 1);
            if (depth > 2) drawBranch(ex, ey, angle - spread * 0.2, len * lenMul * 0.8, width * 0.5, depth - 2);
        }

        // Main branches from upper trunk at various heights
        const numMain = tr.type === 'oak' ? 4 : 3;
        for (let i = 0; i < numMain; i++) {
            const by = -trunkH * (0.45 + i * 0.14);
            const side = i % 2 === 0 ? 1 : -1;
            const angle = (side > 0 ? -Math.PI * 0.38 : -Math.PI * 0.62) + (i * 0.08);
            const len = tr.r * (0.7 + i * 0.05);
            drawBranch(0, by, angle, len, 3.5 - i * 0.3, 4);
        }
        // Crown branches from top of trunk
        for (let i = 0; i < 3; i++) {
            const angle = -Math.PI * 0.5 + (i - 1) * 0.38;
            drawBranch(0, -trunkH, angle, tr.r * 0.65, 2.5, 3);
        }

    } else {
        // We have a leafy canopy
        const layers = tr.type === 'pine' ? tr.layers + 1 : tr.layers;
        const extraSway = sway * 0.7;

        for (let l = 0; l < layers; l++) {
            const isPine = tr.type === 'pine';
            const ly = -(trunkH) - l * (tr.h * (isPine ? 0.14 : 0.16));
            const lr = tr.r * (1 - l * (isPine ? 0.08 : 0.10));
            const ls = extraSway * (1 + l * 0.3);
            const li = tr.dark ? p.treeL + l * 3 : p.treeL + l * 5;

            if (isPine) {
                ctx.fillStyle = `hsl(${p.treeH},${p.treeSat + 5}%,${li}%)`;
                ctx.shadowColor = 'rgba(0,0,0,0.35)';
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.moveTo(ls, ly - lr * 1.1);
                ctx.lineTo(ls + lr * 0.95, ly + lr * 0.6);
                ctx.lineTo(ls - lr * 0.95, ly + lr * 0.6);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                if (season === 'winter') {
                    ctx.fillStyle = 'rgba(225,238,252,0.82)';
                    ctx.beginPath();
                    ctx.moveTo(ls, ly - lr * 0.75);
                    ctx.lineTo(ls + lr * 0.6, ly + lr * 0.45);
                    ctx.lineTo(ls - lr * 0.6, ly + lr * 0.45);
                    ctx.closePath();
                    ctx.fill();
                }
            } else {
                const g = ctx.createRadialGradient(ls * 0.3, ly - lr * 0.2, lr * 0.1, ls * 0.3, ly, lr);
                g.addColorStop(0, `hsl(${p.treeH},${p.treeSat}%,${li + 9}%)`);
                g.addColorStop(0.55, `hsl(${p.treeH},${p.treeSat - 2}%,${li}%)`);
                g.addColorStop(1, `hsl(${p.treeH - 3},${p.treeSat - 5}%,${li - 7}%)`);
                ctx.fillStyle = g;
                ctx.shadowColor = 'rgba(0,0,0,0.35)';
                ctx.shadowBlur = 7;
                ctx.beginPath();
                ctx.moveTo(ls, ly - lr);
                ctx.bezierCurveTo(ls + lr * 0.6, ly - lr * 0.25, ls + lr * 0.95, ly + lr * 0.55, ls, ly + lr * 0.42);
                ctx.bezierCurveTo(ls - lr * 0.95, ly + lr * 0.55, ls - lr * 0.6, ly - lr * 0.25, ls, ly - lr);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    ctx.restore();
}