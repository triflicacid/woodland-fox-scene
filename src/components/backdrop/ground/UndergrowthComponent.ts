import {DrawComponent} from '@/core/DrawComponent';

interface Bush {
    x: number;
    r: number;
    dark: boolean;
}

interface Rock {
    x: number;
    y: number;
    dm: number;
}

/**
 * render undergrowth
 */
export class UndergrowthComponent extends DrawComponent {
    static COMPONENT_NAME = 'UndergrowthComponent';

    private readonly bushes: Bush[] = [
        {x: 130, r: 28, dark: true}, {x: 175, r: 20, dark: false},
        {x: 510, r: 25, dark: false}, {x: 545, r: 18, dark: true},
        {x: 240, r: 16, dark: true}, {x: 420, r: 14, dark: false},
        {x: 80, r: 18, dark: false}, {x: 620, r: 22, dark: true},
    ];

    private rocks: Rock[] = [
        {x: 195, y: 0, dm: 0.04}, {x: 290, y: 0, dm: 0.05},
        {x: 400, y: 0, dm: 0.04}, {x: 490, y: 0, dm: 0.055},
        {x: 660, y: 0, dm: 0.04},
    ];

    override getName() {
        return UndergrowthComponent.COMPONENT_NAME;
    }

    override initialise() {
        this.rocks.forEach(r => {
            r.y = this.scene.groundY + (this.H * r.dm);
        });
    }

    override draw() {
        const {ctx} = this;
        const {fox, season, weather, frame, groundY: y} = this.scene;
        const p = this.scene.pal();

        this.bushes.forEach(b => {
            const li = b.dark ? p.fL - 5 : p.fL + 3;
            const bg = ctx.createRadialGradient(b.x, y - b.r * 0.4, b.r * 0.1, b.x, y, b.r);
            bg.addColorStop(0, `hsl(${p.fH},${p.fSat}%,${li + 12}%)`);
            bg.addColorStop(1, `hsl(${p.fH},${p.fSat - 5}%,${li}%)`);
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.arc(b.x, y, b.r, Math.PI, 0);
            ctx.arc(b.x + b.r * 0.7, y - b.r * 0.3, b.r * 0.6, Math.PI, 0);
            ctx.arc(b.x - b.r * 0.6, y - b.r * 0.2, b.r * 0.55, Math.PI, 0);
            ctx.fill();
        });

        const wsh = weather === 'wind' ? Math.sin(frame * 0.04) * 5 : 0;
        for (let fx = 160; fx < 560; fx += 45) {
            if (Math.abs(fx - fox.x) < 60) continue;
            const sw = Math.sin(frame * 0.015 + fx * 0.06) * 2.5 + wsh;
            ctx.strokeStyle = `hsl(${p.fH + 10},${p.fSat}%,${p.fL + 8}%)`;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.7;
            for (let leaf = -3; leaf <= 3; leaf++) {
                const la = leaf * 0.22;
                ctx.beginPath();
                ctx.moveTo(fx, y);
                ctx.quadraticCurveTo(
                    fx + sw + Math.sin(la) * 18, y - 20 + la * 5,
                    fx + Math.cos(la) * 28 + sw, y - 16 + leaf * 4,
                );
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        // small rocks / roots
        this.rocks.forEach(r => {
            ctx.fillStyle = season === 'winter' ? '#c0d0dc' : '#3a3228';
            ctx.beginPath();
            ctx.ellipse(r.x, r.y, 12, 7, 0.2, 0, Math.PI * 2);
            ctx.fill();
            if (season !== 'winter') {
                ctx.fillStyle = `hsl(${p.fH},40%,20%)`;
                ctx.beginPath();
                ctx.ellipse(r.x, r.y - 3, 8, 4, 0.2, 0, Math.PI);
                ctx.fill();
            }
        });
    }
}
