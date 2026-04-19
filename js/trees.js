function drawTree(tr) {
    const p = pal();
    const windE = (weather === 'wind' || weather === 'storm') ? Math.sin(frame * 0.06 + tr.ph) * 10 : 0;
    const sw = Math.sin(frame * tr.sway + tr.ph) * 5 + windE;
    ctx.save();
    ctx.translate(tr.x, H * 0.62);

    // Trunk
    const isBirch = tr.type === 'birch';
    const tg = ctx.createLinearGradient(-5, 0, 5, 0);
    const tb = isBirch ? '#c8b89a' : season === 'winter' ? '#8a7a6a' : '#2e1a08';
    const td = isBirch ? '#a89878' : season === 'winter' ? '#6a5a4a' : '#1a0e05';
    tg.addColorStop(0, td);
    tg.addColorStop(0.5, tb);
    tg.addColorStop(1, td);
    ctx.fillStyle = tg;
    const trH = tr.h * 0.38;
    ctx.fillRect(-5, -trH, 10, trH);
    if (isBirch) {
        ctx.strokeStyle = 'rgba(80,60,40,0.4)';
        ctx.lineWidth = 1.5;
        for (let by = 0; by > -trH; by -= 22) {
            ctx.beginPath();
            ctx.moveTo(-5, by);
            ctx.lineTo(5, by + 3);
            ctx.stroke();
        }
    }

    const bare = season === 'winter' && tr.type !== 'pine';
    if (bare) {
        // Bare winter branches
        ctx.strokeStyle = '#5a4a3a';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        [-trH * 0.6, -trH * 0.75, -trH * 0.88].forEach((by, i) => {
            const side = i % 2 === 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(0, by);
            ctx.quadraticCurveTo(side * 15 + sw * 0.5, by - 10, side * 28 + sw * 0.5, by - 18);
            ctx.stroke();
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(side * 14 + sw * 0.5, by - 8);
            ctx.quadraticCurveTo(side * 22 + sw * 0.5, by - 18, side * 30 + sw * 0.5, by - 12);
            ctx.stroke();
            ctx.lineWidth = 3;
        });
        ctx.fillStyle = 'rgba(225,238,252,0.88)';
        [-trH * 0.6, -trH * 0.75].forEach((by, i) => {
            const side = i % 2 === 0 ? 1 : -1;
            ctx.beginPath();
            ctx.ellipse(side * 20 + sw * 0.3, by - 12, 10, 4, 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
    } else {
        const layers = tr.type === 'pine' ? tr.layers + 1 : tr.layers;
        for (let l = 0; l < layers; l++) {
            const isPine = tr.type === 'pine';
            const ly = -tr.h * (isPine ? 0.2 : 0.25) - l * (tr.h * (isPine ? 0.18 : 0.22));
            const lr = tr.r * (1 - l * (isPine ? 0.12 : 0.15));
            const ls = sw * (1 + l * 0.4);
            const li = tr.dark ? p.treeL + l * 3 : p.treeL + l * 5;

            if (isPine) {
                ctx.fillStyle = `hsl(${p.treeH},${p.treeSat + 5}%,${li}%)`;
                ctx.shadowColor = 'rgba(0,0,0,0.4)';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.moveTo(ls, ly - lr * 1.1);
                ctx.lineTo(ls + lr * 0.95, ly + lr * 0.55);
                ctx.lineTo(ls - lr * 0.95, ly + lr * 0.55);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                if (season === 'winter') {
                    ctx.fillStyle = 'rgba(225,238,252,0.82)';
                    ctx.beginPath();
                    ctx.moveTo(ls, ly - lr * 0.8);
                    ctx.lineTo(ls + lr * 0.6, ly + lr * 0.4);
                    ctx.lineTo(ls - lr * 0.6, ly + lr * 0.4);
                    ctx.closePath();
                    ctx.fill();
                }
            } else {
                const g = ctx.createRadialGradient(ls * 0.3, ly - lr * 0.2, lr * 0.1, ls * 0.3, ly, lr);
                g.addColorStop(0, `hsl(${p.treeH},${p.treeSat}%,${li + 8}%)`);
                g.addColorStop(0.6, `hsl(${p.treeH},${p.treeSat - 2}%,${li}%)`);
                g.addColorStop(1, `hsl(${p.treeH - 3},${p.treeSat - 5}%,${li - 6}%)`);
                ctx.fillStyle = g;
                ctx.shadowColor = 'rgba(0,0,0,0.4)';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(ls, ly - lr);
                ctx.bezierCurveTo(ls + lr * 0.6, ly - lr * 0.3, ls + lr * 0.9, ly + lr * 0.5, ls, ly + lr * 0.4);
                ctx.bezierCurveTo(ls - lr * 0.9, ly + lr * 0.5, ls - lr * 0.6, ly - lr * 0.3, ls, ly - lr);
                ctx.fill();
                ctx.shadowBlur = 0;
                if (season === 'winter' && l === layers - 1) {
                    ctx.fillStyle = 'rgba(225,238,252,0.88)';
                    ctx.beginPath();
                    ctx.moveTo(ls, ly - lr * 0.9);
                    ctx.bezierCurveTo(ls + lr * 0.5, ly - lr * 0.2, ls + lr * 0.5, ly + lr * 0.1, ls, ly + lr * 0.15);
                    ctx.bezierCurveTo(ls - lr * 0.5, ly + lr * 0.1, ls - lr * 0.5, ly - lr * 0.2, ls, ly - lr * 0.9);
                    ctx.fill();
                }
            }
        }
    }
    ctx.restore();
}
