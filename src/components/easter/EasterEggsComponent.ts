import {DrawComponent} from '@/core/DrawComponent';
import {prob, rnd, rndf} from '@/utils';

interface Dot {
    dx: number;
    dy: number;
}

interface Egg {
    x: number;
    yFrac: number;
    tilt: number;
    rx: number;
    ry: number;
    col: string;
    accent: string;
    pattern: 'dots' | 'lines' | 'plain';
    dots: Dot[];
}

const PASTEL_COLS = [
    '#fff5b0', // pastel yellow
    '#ffffff', // white
    '#ffb3d1', // pastel pink
    '#d4b3ff', // light purple
    '#b3d9ff', // light blue
    '#c8f5c8', // pastel mint
];

// cluster definitions - [centreX, centreY_fraction, eggCount]
const CLUSTERS: [number, number, number][] = [
    // near tree bases
    [55, 0.65, 4],
    [148, 0.65, 3],
    [100, 0.66, 4],
    [555, 0.65, 3],
    [598, 0.66, 4],
    [625, 0.65, 3],
    // scattered mid-field
    [200, 0.68, 4],
    [300, 0.70, 3],
    [420, 0.69, 5],
    [500, 0.67, 3],
    [260, 0.72, 4],
    [460, 0.71, 3],
];

/**
 * scattered easter eggs in clusters around the field and tree bases.
 * eggs are pastel-coloured ellipses with optional dot or line decoration.
 */
export class EasterEggsComponent extends DrawComponent {
    static COMPONENT_NAME = 'EasterEggsComponent';

    private eggs: Egg[] = [];

    override getName() {
        return EasterEggsComponent.COMPONENT_NAME;
    }

    override initialise() {
        this.eggs = CLUSTERS.flatMap(([cx, cyF, count]) =>
            Array.from({length: count}, () => {
                const pattern = prob(0.33) ? 'dots' : prob(0.5) ? 'lines' : 'plain';
                const col = PASTEL_COLS[Math.floor(rnd(PASTEL_COLS.length))]!;
                const accent = PASTEL_COLS[Math.floor(rnd(PASTEL_COLS.length))]!;
                // pre-generate dot positions so they don't jump each frame
                const dots = pattern === 'dots'
                    ? Array.from({length: 5}, () => ({dx: rndf(1) * 0.6, dy: rndf(1) * 0.6}))
                    : [];
                return {
                    x: cx + rndf(28),
                    yFrac: cyF,
                    tilt: rndf(0.4),
                    rx: 7 + rnd(5),
                    ry: 9 + rnd(6),
                    col,
                    accent,
                    pattern,
                    dots
                } as Egg;
            })
        );
    }

    override isEnabled() {
        return this.scene.specialEvent === 'easter';
    }

    override draw() {
        const {ctx, H} = this;
        this.eggs.forEach(e => {
            const y = H * e.yFrac;
            ctx.save();
            ctx.translate(e.x, y);
            ctx.rotate(e.tilt);

            // egg body
            ctx.fillStyle = e.col;
            ctx.beginPath();
            ctx.ellipse(0, 0, e.rx, e.ry, 0, 0, Math.PI * 2);
            ctx.fill();

            // subtle shadow on right
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.beginPath();
            ctx.ellipse(e.rx * 0.2, 0, e.rx * 0.5, e.ry * 0.85, 0, 0, Math.PI * 2);
            ctx.fill();

            if (e.pattern === 'dots') {
                ctx.fillStyle = e.accent;
                e.dots.forEach(({dx, dy}) => {
                    ctx.beginPath();
                    ctx.arc(dx * e.rx, dy * e.ry, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else if (e.pattern === 'lines') {
                ctx.strokeStyle = e.accent;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.7;
                [-e.ry * 0.35, 0, e.ry * 0.35].forEach(ly => {
                    ctx.beginPath();
                    ctx.moveTo(-e.rx * 0.8, ly);
                    ctx.lineTo(e.rx * 0.8, ly);
                    ctx.stroke();
                });
                ctx.globalAlpha = 1;
            }

            // highlight
            ctx.fillStyle = 'rgba(255,255,255,0.45)';
            ctx.beginPath();
            ctx.ellipse(-e.rx * 0.25, -e.ry * 0.3, e.rx * 0.3, e.ry * 0.2, -0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }
}
