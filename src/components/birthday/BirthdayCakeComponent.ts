import {DrawComponent} from '@/core/DrawComponent';
import {shadeHex} from '@/utils';
import {drawFlame} from '@/components/birthday/drawFlame';

interface Tier {
    wm: number;
    w: number;
    h: number;
    col: string;
    dec: string;
    trim: string;
}

const SPRINKLE_COLS = ['#ff88cc', '#88ccff', '#ffcc44', '#88ffcc', '#cc88ff', '#ff8844', '#44ffcc'];

/**
 * draws a tiered birthday cake with digit candles
 */
export class BirthdayCakeComponent extends DrawComponent {
    public static COMPONENT_NAME = 'BirthdayCakeComponent';

    // offset from fox
    private readonly offsetX = 55;
    private readonly offsetY = 115;
    private readonly age = 20;

    // wm is the width multiplier; w is calculated in initialise
    private tiers: Tier[] = [
        {wm: 1, w: 0, h: 18, col: '#f5f0ea', dec: '#ff88cc', trim: '#ff66aa'},
        {wm: 0.75, w: 0, h: 16, col: '#f5f0ea', dec: '#88ccff', trim: '#44aaff'},
        {wm: 0.55, w: 0, h: 14, col: '#f5f0ea', dec: '#ffcc44', trim: '#ffaa00'},
    ];

    public override getName() {
        return BirthdayCakeComponent.COMPONENT_NAME;
    }

    public override initialise() {
        const digits = String(this.age).split('');
        const spacing = 18;
        const digitW = 14;
        const minW = 36;
        const requiredHW = Math.max(minW, (digits.length * (spacing + digitW)) / 2 + 10);
        this.tiers.forEach(tier => {
            tier.w = tier.wm * requiredHW;
        });
    }

    public override isEnabled() {
        return this.scene.specialEvent === 'birthday';
    }

    public override draw() {
        const {ctx} = this;
        const {fox, frame} = this.scene;
        const x = fox.x + this.offsetX;
        const y = fox.y + this.offsetY;

        ctx.save();
        ctx.translate(x, y);
        this.drawCake(frame);
        ctx.restore();
    }

    private drawCake(frame: number) {
        let tierY = 0;
        this.tiers.forEach((tier, i) => {
            this.drawTier(tier, tierY, frame, i);
            tierY -= tier.h;
        });

        // draw digit candles on top tier
        const topTier = this.tiers[this.tiers.length - 1]!;
        this.drawDigitCandles(this.age, tierY, frame);
        this.drawCreamDollops(topTier.w, tierY, frame);
    }

    /**
     * draw cream dollops/whirls along the rim of the top tier.
     */
    private drawCreamDollops(tierW: number, y: number, frame: number) {
        const {ctx} = this;
        const dollopR = 3;
        const spacing = dollopR * 2 + 2;
        const count = Math.max(1, Math.floor((tierW * 2 - 4) / spacing));
        const totalW = (count - 1) * spacing;
        const startX = -totalW / 2;

        for (let i = 0; i < count; i++) {
            const dx = startX + i * spacing;
            const bob = Math.sin(frame * 0.04 + i * 0.9) * 0.5;
            const dy = y + bob;

            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 3;
            ctx.shadowColor = 'rgba(200,180,180,0.3)';
            ctx.beginPath();
            ctx.arc(dx, dy, dollopR, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f8f4f0';
            ctx.beginPath();
            ctx.arc(dx, dy - 3, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(dx, dy - 5.5, 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f8f4f0';
            ctx.beginPath();
            ctx.arc(dx - 0.5, dy - 7, 1.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.fillStyle = SPRINKLE_COLS[i % SPRINKLE_COLS.length]!;
            ctx.save();
            ctx.translate(dx + 2, dy - 4);
            ctx.rotate(i * 0.8);
            ctx.fillRect(-2.5, -0.8, 5, 1.6);
            ctx.restore();
        }
    }

    /**
     * draw a single cake tier.
     */
    private drawTier(tier: Tier, y: number, frame: number, index: number) {
        const {ctx} = this;
        const {w, h, col, dec, trim} = tier;

        // shadow
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.beginPath();
        ctx.ellipse(0, y + 2, w * 0.9, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // side face - slightly darker
        ctx.fillStyle = shadeHex(col, -12);
        ctx.fillRect(-w, y - h + 2, w * 2, h);

        // main face
        ctx.fillStyle = col;
        ctx.fillRect(-w, y - h, w * 2, h);

        // frosting drips along top edge
        const dripCount = Math.floor(w / 6);
        ctx.fillStyle = '#ffffff';
        for (let d = 0; d < dripCount; d++) {
            const dx = -w + 4 + d * (w * 2 - 8) / (dripCount - 1);
            const dripLen = 4 + Math.sin(d * 1.7 + index) * 2;
            ctx.beginPath();
            ctx.moveTo(dx - 3, y - h);
            ctx.lineTo(dx + 3, y - h);
            ctx.quadraticCurveTo(dx + 3, y - h + dripLen, dx, y - h + dripLen + 2);
            ctx.quadraticCurveTo(dx - 3, y - h + dripLen, dx - 3, y - h);
            ctx.fill();
        }

        // top face - white frosting
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-w, y - h, w * 2, 3);

        // decorative dots along middle of tier
        const dotCount = Math.floor(w / 5);
        for (let d = 0; d < dotCount; d++) {
            const dx = -w + 5 + d * (w * 2 - 10) / (dotCount - 1);
            const pulse = 0.7 + 0.3 * Math.sin(frame * 0.05 + d * 0.8 + index);
            ctx.fillStyle = dec;
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.arc(dx, y - h * 0.5, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // trim lines top and bottom
        ctx.strokeStyle = trim;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-w, y - h + 3);
        ctx.lineTo(w, y - h + 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w, y - 2);
        ctx.lineTo(w, y - 2);
        ctx.stroke();

        // outline
        ctx.strokeStyle = shadeHex(col, -20);
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-w, y - h, w * 2, h);
    }

    /**
     * draw number candles for the age - gold chunky digit shapes with flames.
     */
    private drawDigitCandles(age: number, y: number, frame: number) {
        const digits = String(age).split('').map(Number);
        const spacing = 18;
        const totalW = (digits.length - 1) * spacing;
        const startX = -totalW / 2;

        digits.forEach((digit, i) => {
            this.drawNumberCandle(digit, startX + i * spacing, y - 15, frame, i);
        });
    }

    /**
     * draw a single gold number candle with a spike base and flame on top.
     */
    private drawNumberCandle(digit: number, x: number, y: number, frame: number, index: number) {
        const {ctx} = this;
        const dh = 20;
        const digitBottom = y;
        const digitTop = y - dh;

        // stake goes downward from digit bottom into cake
        ctx.strokeStyle = '#a07810';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, digitBottom);
        ctx.lineTo(x, digitBottom + 14);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,230,120,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, digitBottom);
        ctx.lineTo(x, digitBottom + 15);
        ctx.stroke();

        this.drawGoldDigit(digit, x, digitBottom, dh);

        // wick from digit top upward
        const wickTipY = digitTop - 5;
        ctx.strokeStyle = '#2a1808';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, digitTop);
        ctx.quadraticCurveTo(x + 1, digitTop - 3, x + 1, wickTipY);
        ctx.stroke();

        const flicker = Math.sin(frame * 0.22 + index * 1.3) * 1.5;
        const fSway = Math.sin(frame * 0.15 + index * 0.9) * 1.2;
        drawFlame(ctx, x + 1, wickTipY, flicker, fSway);
    }

    /**
     * draw a chunky inflated gold digit using thick rounded strokes.
     */
    private drawGoldDigit(digit: number, cx: number, baseY: number, h: number) {
        const {ctx} = this;
        const s = h / 30;

        ctx.save();
        ctx.translate(cx, baseY);
        ctx.scale(s, s);

        const thickness = 9;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const gg = ctx.createLinearGradient(0, -30, 0, 0);
        gg.addColorStop(0, '#ffe880');
        gg.addColorStop(0.35, '#ffd700');
        gg.addColorStop(0.7, '#c89010');
        gg.addColorStop(1, '#a07008');

        const stroke = () => {
            ctx.strokeStyle = '#906008';
            ctx.lineWidth = thickness + 2;
            ctx.stroke();
            ctx.strokeStyle = gg;
            ctx.lineWidth = thickness;
            ctx.stroke();
            // inner highlight
            ctx.strokeStyle = 'rgba(255,245,180,0.35)';
            ctx.lineWidth = thickness * 0.3;
            ctx.stroke();
        };

        switch (digit) {
            case 0:
                ctx.beginPath();
                ctx.ellipse(0, -15, 8, 13, 0, 0, Math.PI * 2);
                stroke();
                break;
            case 1:
                ctx.beginPath();
                ctx.moveTo(-5, -24);
                ctx.lineTo(0, -28);
                ctx.lineTo(0, 0);
                stroke();
                break;
            case 2:
                ctx.beginPath();
                ctx.arc(0, -21, 8, Math.PI * 1.1, 0);
                ctx.lineTo(-8, -2);
                ctx.lineTo(8, -2);
                stroke();
                break;
            case 3:
                ctx.beginPath();
                ctx.arc(0, -21, 8, Math.PI * 0.55, Math.PI * 1.45, true);
                stroke();
                ctx.beginPath();
                ctx.arc(0, -9, 8, Math.PI * 0.55, Math.PI * 1.45, true);
                stroke();
                break;
            case 4:
                ctx.beginPath();
                ctx.moveTo(-7, -28);
                ctx.lineTo(-7, -10);
                ctx.lineTo(7, -10);
                ctx.moveTo(7, -28);
                ctx.lineTo(7, 0);
                stroke();
                break;
            case 5:
                ctx.beginPath();
                ctx.moveTo(7, -28);
                ctx.lineTo(-7, -28);
                ctx.lineTo(-7, -16);
                ctx.lineTo(5, -16);
                ctx.arc(0, -8, 8, Math.PI * 1.55, Math.PI * 0.9);
                stroke();
                break;
            case 6:
                ctx.beginPath();
                ctx.moveTo(2, -28);
                ctx.bezierCurveTo(-2, -22, -10, -20, -8, -14);
                ctx.arc(0, -7, 7, Math.PI * 1.1, Math.PI * 2.9);
                stroke();
                break;
            case 7:
                ctx.beginPath();
                ctx.moveTo(-8, -28);
                ctx.lineTo(8, -28);
                ctx.lineTo(-4, 0);
                stroke();
                break;
            case 8:
                ctx.beginPath();
                ctx.arc(0, -20, 7, 0, Math.PI * 2);
                stroke();
                ctx.beginPath();
                ctx.arc(0, -8, 8.5, 0, Math.PI * 2);
                stroke();
                break;
            case 9:
                ctx.beginPath();
                ctx.moveTo(-2, -2);
                ctx.bezierCurveTo(2, -8, 10, -10, 8, -14);
                ctx.arc(0, -21, 7, Math.PI * -0.1, Math.PI * 1.9, true);
                stroke();
                break;
        }

        ctx.restore();
    }
}
