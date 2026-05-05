import {DrawComponent} from '@/core/DrawComponent';
import {clamp, eio} from '@/utils';

/**
 * render the moon in the sky.
 * depending on season etc, it may move, or be a pumpkin moon.
 */
export class MoonComponent extends DrawComponent {
    static COMPONENT_NAME = 'MoonComponent';

    override getName() {
        return MoonComponent.COMPONENT_NAME;
    }

    override isEnabled() {
        return this.scene.timeOfDay === 'night' || this.scene.timeOfDay === 'twilight';
    }

    override draw() {
        const {weather, specialEvent, moonPhase, todBlend} = this.scene;

        if (specialEvent === 'halloween') {
            this.drawPumpkinMoon();
        } else if (weather !== 'storm' && weather !== 'rain') {
            this.drawMoon(todBlend, moonPhase);
        }
    }

    /**
     * draw the moon at the given phase.
     * phase 0 = new moon, 4 = full moon, 0-7 maps to the 8 standard phases.
     * uses two-arc clipping for a geometrically correct terminator curve.
     */
    private drawMoon(td: number, phase: number) {
        const {ctx} = this;
        const ma = clamp(eio(1 - td * 2), 0, 1);
        if (ma <= 0.02) return;

        const cx = 580, cy = 55, r = 22;

        ctx.save();
        ctx.globalAlpha = ma;

        // new moon - just a faint dark disc
        if (phase === 0) {
            ctx.fillStyle = 'rgba(30,40,60,0.5)';
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(100,120,160,0.3)';
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        // full moon
        if (phase === 4) {
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#fffbe0';
            ctx.fillStyle = '#fffde8';
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }

        // for all other phases, draw using two-arc clipping:
        // the lit portion is a semicircle on one side, with the terminator
        // being an ellipse whose x-radius varies from -r (full) to +r (new)
        const waxing = phase < 4;
        const t = waxing ? (phase - 1) / 3 : (7 - phase) / 3;
        const isGibbous = t > 0.5;
        const terminatorX = r * (phase % 2 === 1 ? 0.6 : 0);

        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fffbe0';

        // clip to moon disc
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        // draw dark side first (full disc)
        ctx.fillStyle = '#1a2030';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // draw lit side using composite of semicircle + terminator ellipse
        ctx.save();
        ctx.beginPath();
        if (waxing) {
            ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2);
            ctx.ellipse(cx, cy, terminatorX, r, 0, Math.PI / 2, -Math.PI / 2, !isGibbous);
        } else {
            ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2);
            ctx.ellipse(cx, cy, terminatorX, r, 0, -Math.PI / 2, Math.PI / 2, !isGibbous);
        }
        ctx.closePath();
        ctx.fillStyle = '#fffde8';
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    /**
     * draw a special jack-o-lantern moon for halloween
     */
    private drawPumpkinMoon() {
        const {ctx} = this;
        ctx.save();
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ff6600';
        // pumpkin body
        ctx.fillStyle = '#e06010';
        ctx.beginPath();
        ctx.arc(580, 55, 22, 0, Math.PI * 2);
        ctx.fill();
        // ribs
        ctx.strokeStyle = '#c04800';
        ctx.lineWidth = 1.5;
        [-8, 0, 8].forEach(ox => {
            ctx.beginPath();
            ctx.ellipse(580 + ox, 55, 6, 20, ox * 0.04, 0, Math.PI * 2);
            ctx.stroke();
        });
        // face
        ctx.fillStyle = 'rgba(255,200,0,0.9)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffcc00';
        // eyes
        ([[-8, -6], [6, -6]] as [number, number][]).forEach(([ex, ey]) => {
            ctx.beginPath();
            ctx.moveTo(580 + ex, 55 + ey - 4);
            ctx.lineTo(580 + ex - 4, 55 + ey + 3);
            ctx.lineTo(580 + ex + 4, 55 + ey + 3);
            ctx.closePath();
            ctx.fill();
        });
        // mouth
        ctx.beginPath();
        ctx.moveTo(580 - 9, 55 + 5);
        ctx.lineTo(580 - 5, 55 + 9);
        ctx.lineTo(580 - 1, 55 + 6);
        ctx.lineTo(580 + 3, 55 + 9);
        ctx.lineTo(580 + 7, 55 + 5);
        ctx.stroke();
        ctx.restore();
    }
}
