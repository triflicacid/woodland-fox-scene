import {DrawComponent} from '@/core/DrawComponent';
import {rnd, rndf} from '@/utils';
import {Position} from '@/core/Position';

interface SmokeParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    col: string;
    life: number;
}

type LogDef = [number, number, number, string];
type FlameDef = [number, number, number, string, number];
type TongueDef = [number, number, number, string, number];

/**
 * draws an animated bonfire with flickering flames and heavy smoke
 */
export class BonfireComponent extends DrawComponent {
    static COMPONENT_NAME = 'BonfireComponent';

    private x = 0;
    private y = 0;
    private smoke: SmokeParticle[] = [];

    override getName() {
        return BonfireComponent.COMPONENT_NAME;
    }

    override initialise() {
        this.x = 220;
        this.y = this.scene.groundY + (this.H * 0.1);
        this.smoke = Array.from({length: 20}, (_, i) => this.makeSmoke(i * 3));
    }

    override isEnabled() {
        return this.scene.specialEvent === 'bonfire';
    }

    getPosition() {
        return new Position(this.x, this.y);
    }

    override tick() {
        this.smoke.forEach(s => {
            s.x += s.vx + (this.scene.weather === 'wind' ? 2.5 : 0);
            s.y += s.vy;
            s.life++;
            s.size += 0.12;
            s.alpha -= 0.008;
            if (s.life > 80 || s.alpha <= 0) Object.assign(s, this.makeSmoke(0));
        });
    }

    override draw() {
        const {x, y} = this;
        const {frame, weather} = this.scene;
        const flameScale = this.getFlameScale();

        this.drawGlow(x, y, frame, flameScale);
        this.drawLogs(x, y);
        this.drawStones(x, y);
        if (flameScale > 0) {
            this.drawBackFlames(x, y, frame, flameScale);
            this.drawForeFlames(x, y, frame, flameScale);
        } else if (weather !== 'storm') {
            this.drawSmoulder(x, y, frame);
        }
        if (weather !== 'storm') this.drawSmoke();
    }

    /**
     * return a flame scale factor based on weather.
     * rain suppresses flames, wind fans them.
     */
    private getFlameScale() {
        const {weather} = this.scene;
        if (weather === 'rain' || weather === 'storm') return 0;
        if (weather === 'wind') return 1.6;
        return 1;
    }

    /**
     * draw a large warm ground glow beneath the fire.
     */
    private drawGlow(x: number, y: number, frame: number, flameScale = 1) {
        const {ctx} = this;
        const flicker = 0.85 + Math.sin(frame * 0.18) * 0.15;
        const radius = 160 * flicker * Math.max(0.3, flameScale);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, `rgba(255,120,20,${0.35 * Math.max(0.2, flameScale)})`);
        glow.addColorStop(0.5, `rgba(255,80,10,${0.15 * Math.max(0.2, flameScale)})`);
        glow.addColorStop(1, 'rgba(255,60,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * render stones around the campfire base in a circular arrangement.
     */
    private drawStones(x: number, y: number) {
        const {ctx} = this;
        const stoneAngles = [
            -1.2, -0.85, -0.5, -0.2, 0.0, 0.2, 0.5, 0.85, 1.2,
            -1.5, 1.5, Math.PI,
        ];
        stoneAngles.forEach((a, i) => {
            const radius = 42 + (i % 3) * 5;
            const sx = x + Math.sin(a) * radius;
            const sy = y + 12 + Math.abs(Math.cos(a)) * 8;
            const rw = 6 + (i % 3) * 2;
            const rh = rw * 0.55;
            ctx.fillStyle = '#4a4a5a';
            ctx.beginPath();
            ctx.ellipse(sx, sy, rw, rh, a * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#6a6a7a';
            ctx.beginPath();
            ctx.ellipse(sx - 1, sy - 1, rw * 0.55, rh * 0.5, a * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * render logs to form the bonfire's base.
     */
    private drawLogs(x: number, y: number) {
        const {ctx} = this;
        const logs: LogDef[] = [
            [-1.1, 52, 8, '#b86820'],
            [-0.75, 58, 9, '#c8782a'],
            [-0.42, 62, 10, '#d4883a'],
            [-0.15, 60, 10, '#c87828'],
            [0.15, 60, 10, '#d08030'],
            [0.42, 62, 10, '#c87828'],
            [0.75, 58, 9, '#c8782a'],
            [1.1, 52, 8, '#b86820'],
        ];

        logs.forEach(([angle, len, thickness, col]) => {
            const tipX = x + Math.sin(angle) * len * 0.35;
            const tipY = y - Math.cos(angle) * len * 0.5 - 8;
            const endX = x + Math.sin(angle) * len;
            const endY = y + 10;

            // shadow side
            ctx.strokeStyle = '#5a2a08';
            ctx.lineWidth = thickness + 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // main log body
            ctx.strokeStyle = col;
            ctx.lineWidth = thickness;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // highlight stripe
            ctx.strokeStyle = 'hsl(30, 70%, 65%)';
            ctx.lineWidth = thickness * 0.3;
            ctx.beginPath();
            ctx.moveTo(tipX - Math.cos(angle), tipY - Math.sin(angle));
            ctx.lineTo(endX - Math.cos(angle), endY - Math.sin(angle));
            ctx.stroke();

            // end circle with grain
            ctx.fillStyle = '#8a4818';
            ctx.beginPath();
            ctx.arc(endX, endY, thickness * 0.55, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#6a3010';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(endX, endY, thickness * 0.35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#5a2808';
            ctx.beginPath();
            ctx.arc(endX, endY, thickness * 0.15, 0, Math.PI * 2);
            ctx.fill();

            // fire glow tint on upper portion of each log
            ctx.strokeStyle = 'rgba(255,120,0,0.25)';
            ctx.lineWidth = thickness * 0.6;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX + (endX - tipX) * 0.4, tipY + (endY - tipY) * 0.4);
            ctx.stroke();
        });
    }

    /**
     * draw layered animated flame arcs.
     */
    private drawBackFlames(x: number, y: number, frame: number, flameScale = 1) {
        const {ctx} = this;
        const baseY = y - 4;
        const baseW = 32;

        const layers: FlameDef[] = [
            [0, baseW, 96, '#aa1500', 0.85],
            [-10, baseW * 0.7, 88, '#cc2200', 0.80],
            [10, baseW * 0.7, 80, '#cc2200', 0.80],
            [0, baseW * 0.9, 72, '#ee4400', 0.88],
            [-8, baseW * 0.6, 60, '#ff5500', 0.85],
            [8, baseW * 0.6, 58, '#ff5500', 0.85],
            [0, baseW * 0.7, 50, '#ff8800', 0.90],
            [-6, baseW * 0.5, 42, '#ffaa00', 0.88],
            [6, baseW * 0.5, 40, '#ffaa00', 0.88],
            [0, baseW * 0.4, 28, '#ffcc22', 0.92],
            [0, baseW * 0.2, 14, '#ffee88', 0.95],
        ];

        layers.forEach(([ox, bw, h, col, alpha], i) => {
            h *= flameScale;
            const flicker = Math.sin(frame * 0.22 + i * 1.1) * 6;
            const sway = Math.sin(frame * 0.13 + i * 0.8) * 4;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = col;
            ctx.shadowBlur = 16;
            ctx.shadowColor = col;
            ctx.beginPath();
            ctx.moveTo(x + ox - bw + sway, baseY);
            ctx.bezierCurveTo(
                x + ox - bw * 0.8 + sway, baseY - h * 0.4 + flicker,
                x + ox - bw * 0.2 + sway, baseY - h * 0.85 + flicker,
                x + ox + sway, baseY - h + flicker,
            );
            ctx.bezierCurveTo(
                x + ox + bw * 0.2 + sway, baseY - h * 0.85 + flicker,
                x + ox + bw * 0.8 + sway, baseY - h * 0.4 + flicker,
                x + ox + bw + sway, baseY,
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        // sparks
        if (Math.random() < 0.3) {
            for (let i = 0; i < 3; i++) {
                const sx = x + rndf(baseW);
                const sy = baseY - 20 - rnd(60);
                ctx.save();
                ctx.globalAlpha = 0.6 + rnd(0.4);
                ctx.fillStyle = Math.random() < 0.5 ? '#ffee44' : '#ffaa00';
                ctx.shadowBlur = 4;
                ctx.shadowColor = '#ffaa00';
                ctx.beginPath();
                ctx.arc(sx, sy, 1 + rnd(1.5), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }

    /**
     * draw smaller flames emanating through the gaps between logs.
     * these sit in front of the logs, appearing to burst through them.
     */
    private drawForeFlames(x: number, y: number, frame: number, flameScale = 1) {
        const {ctx} = this;
        const baseY = y - 3;

        const tongues: TongueDef[] = [
            [-18, 8, 28, '#ff6600', 0.85],
            [-8, 7, 24, '#ff8800', 0.88],
            [0, 9, 32, '#ffaa00', 0.90], // centre gap - brightest
            [8, 7, 24, '#ff8800', 0.88],
            [18, 8, 28, '#ff6600', 0.85],
            [-4, 4, 14, '#ffdd44', 0.92],
            [4, 4, 14, '#ffdd44', 0.92],
        ];

        tongues.forEach(([ox, bw, h, col, alpha], i) => {
            h *= flameScale;
            const flicker = Math.sin(frame * 0.28 + i * 1.4) * 4;
            const sway = Math.sin(frame * 0.18 + i * 0.9) * 2;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = col;
            ctx.shadowBlur = 10;
            ctx.shadowColor = col;
            ctx.beginPath();
            ctx.moveTo(x + ox - bw + sway, baseY);
            ctx.bezierCurveTo(
                x + ox - bw * 0.5 + sway, baseY - h * 0.5 + flicker,
                x + ox + bw * 0.5 + sway, baseY - h * 0.5 + flicker,
                x + ox + sway, baseY - h + flicker,
            );
            ctx.bezierCurveTo(
                x + ox + bw * 0.5 + sway, baseY - h * 0.5 + flicker,
                x + ox + bw + sway, baseY - h * 0.5 + flicker,
                x + ox + bw + sway, baseY,
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * draw heavy bonfire smoke particles.
     */
    private drawSmoke() {
        const {ctx} = this;
        this.smoke.forEach(s => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, s.alpha);
            ctx.fillStyle = s.col;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * create a new smoke particle.
     * life is an initial offset for staggering.
     */
    private makeSmoke(life = 0): SmokeParticle {
        const grey = 40 + Math.floor(rnd(40));
        return {
            x: this.x + rndf(4),
            y: this.y - 40,
            vx: rndf(0.6) + 0.3,
            vy: -(0.8 + rnd(0.8)),
            size: 8 + rnd(6),
            alpha: 0.55 + rnd(0.2),
            col: `rgb(${grey},${grey},${grey})`,
            life,
        };
    }

    /**
     * draw glowing embers when the fire is rain-suppressed.
     */
    private drawSmoulder(x: number, y: number, frame: number) {
        const {ctx} = this;
        const pulse = 0.4 + Math.sin(frame * 0.06) * 0.15;
        const grad = ctx.createRadialGradient(x, y - 4, 0, x, y - 4, 22);
        grad.addColorStop(0, `rgba(255,80,0,${pulse})`);
        grad.addColorStop(0.5, `rgba(180,30,0,${pulse * 0.6})`);
        grad.addColorStop(1, 'rgba(100,10,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, y - 4, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // occasional small ember flicker
        if (Math.random() < 0.08) {
            const ex = x + (Math.random() - 0.5) * 28;
            const ey = y - 4 - Math.random() * 6;
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.random() * 0.4;
            ctx.fillStyle = Math.random() < 0.5 ? '#ff4400' : '#ff8800';
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ff4400';
            ctx.beginPath();
            ctx.arc(ex, ey, 1 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}
