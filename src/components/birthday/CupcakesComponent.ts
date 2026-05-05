import {DrawComponent} from '@/core/DrawComponent';
import {shadeHex} from '@/utils';
import {drawFlame} from '@/components/birthday/drawFlame';

interface Sprinkle {
    dx: number;
    dy: number;
    rot: number;
    col: string;
}

interface Cupcake {
    x: number;
    yFrac: number;
    scale: number;
    cupCol: string;
    pattern: 'dots' | 'stripes' | 'plain';
    accentCol: string;
    hasCandle: boolean;
    sprinkles: Sprinkle[];
}

const DOLLOP_COLS = ['#ff88cc', '#88ccff', '#ffcc44', '#88ffcc', '#cc88ff', '#ff8844', '#44ffcc'];
const SPRINKLE_COLS = DOLLOP_COLS;

/**
 * draws cupcakes near the birthday scene.
 * each cupcake has a coloured paper cup, white cream swirl, sprinkles,
 * and optionally a candle.
 */
export class CupcakesComponent extends DrawComponent {
    static COMPONENT_NAME = 'CupcakesComponent';

    private cupcakes: Cupcake[] = [
        {
            x: 220,
            yFrac: 0.865,
            scale: 0.80,
            cupCol: '#cc88ff',
            pattern: 'stripes',
            accentCol: '#9944ff',
            hasCandle: false,
            sprinkles: []
        },
        {
            x: 260,
            yFrac: 0.850,
            scale: 1.00,
            cupCol: '#ff88cc',
            pattern: 'stripes',
            accentCol: '#ff44aa',
            hasCandle: true,
            sprinkles: []
        },
        {
            x: 310,
            yFrac: 0.845,
            scale: 0.85,
            cupCol: '#88ccff',
            pattern: 'dots',
            accentCol: '#4499ff',
            hasCandle: false,
            sprinkles: []
        },
        {
            x: 345,
            yFrac: 0.840,
            scale: 0.90,
            cupCol: '#ffcc44',
            pattern: 'plain',
            accentCol: '#ffaa00',
            hasCandle: true,
            sprinkles: []
        },
        {
            x: 470,
            yFrac: 0.865,
            scale: 1.00,
            cupCol: '#88ffcc',
            pattern: 'dots',
            accentCol: '#22cc88',
            hasCandle: true,
            sprinkles: []
        },
        {
            x: 520,
            yFrac: 0.843,
            scale: 0.85,
            cupCol: '#ff8844',
            pattern: 'plain',
            accentCol: '#ff5500',
            hasCandle: true,
            sprinkles: []
        },
    ];

    override getName() {
        return CupcakesComponent.COMPONENT_NAME;
    }

    override initialise() {
        this.cupcakes.forEach(def => {
            def.sprinkles = Array.from({length: 9}, (_, i) => ({
                dx: (Math.random() - 0.5) * 18,
                dy: (Math.random() - 0.5) * 6 - 2,
                rot: Math.random() * Math.PI,
                col: SPRINKLE_COLS[i % SPRINKLE_COLS.length]!,
            }));
        });
    }

    override isEnabled() {
        return this.scene.specialEvent === 'birthday';
    }

    override draw() {
        const {frame} = this.scene;
        this.cupcakes.forEach((cup, i) => {
            const y = this.H * cup.yFrac;
            this.ctx.save();
            this.ctx.translate(cup.x, y);
            this.ctx.scale(cup.scale, cup.scale);
            this.drawCupcake(cup, frame, i);
            this.ctx.restore();
        });
    }

    /**
     * draw a single cupcake, centred at the current transform origin (bottom-centre of the cup).
     */
    private drawCupcake(cup: Cupcake, frame: number, index: number) {
        const {ctx} = this;
        const cupW = 18;  // half-width at top rim
        const cupWb = 13; // half-width at base
        const cupH = 22;  // height of cup

        // drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.ellipse(0, 2, cupW * 0.85, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // cup side face (slightly darker, for 3d feel)
        ctx.fillStyle = shadeHex(cup.cupCol, -18);
        ctx.beginPath();
        ctx.moveTo(-cupWb, 0);
        ctx.lineTo(cupWb, 0);
        ctx.lineTo(cupW, -cupH + 2);
        ctx.lineTo(-cupW, -cupH + 2);
        ctx.closePath();
        ctx.fill();

        // cup main face
        ctx.fillStyle = cup.cupCol;
        ctx.beginPath();
        ctx.moveTo(-cupWb, -2);
        ctx.lineTo(cupWb, -2);
        ctx.lineTo(cupW, -cupH);
        ctx.lineTo(-cupW, -cupH);
        ctx.closePath();
        ctx.fill();

        this.drawCupPattern(cup, cupW, cupWb, cupH, frame, index);

        // rim highlight
        ctx.strokeStyle = shadeHex(cup.cupCol, 30);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-cupW, -cupH);
        ctx.lineTo(cupW, -cupH);
        ctx.stroke();

        // vertical pleats
        ctx.strokeStyle = shadeHex(cup.cupCol, -28);
        ctx.lineWidth = 0.7;
        ctx.globalAlpha = 0.5;
        const pleatCount = 5;
        for (let p = 1; p < pleatCount; p++) {
            const t = p / pleatCount;
            const bx = -cupWb + t * cupWb * 2;
            const tx = -cupW + t * cupW * 2;
            ctx.beginPath();
            ctx.moveTo(bx, -2);
            ctx.lineTo(tx, -cupH);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        const creamBaseY = -cupH - 1;
        this.drawCreamSwirl(creamBaseY, cupW, frame, index);
        this.drawSprinkles(cup.sprinkles, creamBaseY);

        if (cup.hasCandle) this.drawCandle(creamBaseY - 12, frame, index);
    }

    /**
     * draw the cup surface pattern (dots or stripes).
     */
    private drawCupPattern(cup: Cupcake, cupW: number, cupWb: number, cupH: number, frame: number, index: number) {
        const {ctx} = this;
        ctx.save();
        // clip to cup shape so patterns don't bleed outside
        ctx.beginPath();
        ctx.moveTo(-cupWb, -2);
        ctx.lineTo(cupWb, -2);
        ctx.lineTo(cupW, -cupH);
        ctx.lineTo(-cupW, -cupH);
        ctx.closePath();
        ctx.clip();

        if (cup.pattern === 'dots') {
            ctx.fillStyle = cup.accentCol;
            const positions: [number, number][] = [
                [-8, -cupH * 0.3], [2, -cupH * 0.5], [-3, -cupH * 0.7],
                [8, -cupH * 0.25], [6, -cupH * 0.65], [-9, -cupH * 0.65],
            ];
            positions.forEach(([px, py]) => {
                const pulse = 0.7 + 0.3 * Math.sin(frame * 0.05 + index + px);
                ctx.globalAlpha = 0.45 * pulse;
                ctx.beginPath();
                ctx.arc(px, py, 2.2, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        } else if (cup.pattern === 'stripes') {
            ctx.strokeStyle = cup.accentCol;
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = 0.35;
            // diagonal stripes
            for (let s = -3; s <= 3; s++) {
                const ox = s * 9;
                ctx.beginPath();
                ctx.moveTo(ox - 10, -2);
                ctx.lineTo(ox + 10, -cupH);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
        // 'plain' has no extra decoration

        ctx.restore();
    }

    /**
     * draw the cream swirl on top of the cup.
     */
    private drawCreamSwirl(baseY: number, cupW: number, frame: number, index: number) {
        const {ctx} = this;
        const bob = Math.sin(frame * 0.04 + index * 0.9) * 0.4;

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(200,180,180,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, baseY + bob, cupW * 0.75, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8f4f0';
        ctx.beginPath();
        ctx.ellipse(0, baseY - 6 + bob, cupW * 0.55, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, baseY - 11 + bob, cupW * 0.35, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8f4f0';
        ctx.beginPath();
        ctx.ellipse(0, baseY - 15 + bob, cupW * 0.18, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    /**
     * draw sprinkles scattered across the cream.
     */
    private drawSprinkles(sprinkles: Sprinkle[], baseY: number) {
        const {ctx} = this;
        sprinkles.forEach(({dx, dy, rot, col}) => {
            ctx.fillStyle = col;
            ctx.save();
            ctx.translate(dx, baseY - 4 + dy);
            ctx.rotate(rot);
            ctx.fillRect(-2.5, -0.8, 5, 1.6);
            ctx.restore();
        });
    }

    /**
     * draw a single candle with black wick and dancing flame.
     */
    private drawCandle(tipY: number, frame: number, index: number) {
        const {ctx} = this;
        const candleW = 3.5;
        const candleH = 12;
        const candleTopY = tipY - candleH;
        const candleCol = DOLLOP_COLS[index % DOLLOP_COLS.length]!;

        // candle body
        ctx.fillStyle = candleCol;
        ctx.beginPath();
        ctx.roundRect(-candleW, candleTopY, candleW * 2, candleH, 1.5);
        ctx.fill();

        // candle highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.roundRect(-candleW + 1, candleTopY + 1, candleW * 0.5, candleH - 2, 1);
        ctx.fill();

        // wick
        const wickTipY = candleTopY - 5;
        ctx.strokeStyle = '#2a1808';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, candleTopY);
        ctx.quadraticCurveTo(1, candleTopY - 3, 1, wickTipY);
        ctx.stroke();

        const flicker = Math.sin(frame * 0.22 + index * 1.3) * 1.5;
        const fSway = Math.sin(frame * 0.15 + index * 0.9) * 1.2;
        drawFlame(ctx, 1, wickTipY, flicker, fSway);
    }
}
