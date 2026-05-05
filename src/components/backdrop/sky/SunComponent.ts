import {DrawComponent} from '@/core/DrawComponent';
import type {Season, TimeOfDay} from '@/config';
import {TOD_BLEND} from '@/config';
import {clamp, rgb, sampleCol} from '@/utils';
import {SUN_COLS} from "@/components/backdrop/sky/skyDefinitions.ts";

// arc position per state
const ARC_POS: Partial<Record<TimeOfDay, number>> = {dawn: 0.0, day: 0.5, twilight: 1.0};

/**
 * render the sun, moving position and colour based on tod.
 * at twilight the sun moves off the bottom of the scene.
 * at dawn it sits low on the horizon and climbs toward day position.
 */
export class SunComponent extends DrawComponent {
    static COMPONENT_NAME = 'SunComponent';

    override getName() {
        return SunComponent.COMPONENT_NAME;
    }

    override isEnabled() {
        const {weather, specialEvent, timeOfDay} = this.scene;
        if (timeOfDay === 'night') return false;
        if (weather === 'fog' || weather === 'rain' || weather === 'storm') return specialEvent === 'eclipse';
        return true;
    }

    override draw() {
        const {ctx} = this;
        const {season, weather, frame, todBlend: td, specialEvent, timeOfDay, prevTimeOfDay} = this.scene;

        const {x: sunX, y: sunY, alpha} = this.sunPos(td, season, timeOfDay, prevTimeOfDay);
        if (alpha <= 0.01) return;

        if (specialEvent === 'eclipse') {
            ctx.save();
            ctx.globalAlpha = alpha;
            this.drawEclipse(sunX, sunY, frame, alpha);
            ctx.restore();
            return;
        }

        const sunCol = sampleCol(td, SUN_COLS)!;
        const glowCol = timeOfDay === 'dawn' || timeOfDay === 'twilight'
            ? rgb(sunCol, 0.5)
            : 'rgba(255,232,120,0.5)';

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = timeOfDay === 'dawn' ? 80 : 60;
        ctx.shadowColor = glowCol;
        ctx.fillStyle = rgb(sunCol);
        ctx.beginPath();
        ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = alpha * 0.15;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (season === 'summer' && weather === 'clear' && timeOfDay === 'day') {
            ctx.strokeStyle = 'rgba(255,250,180,0.08)';
            ctx.lineWidth = 18;
            ctx.globalAlpha = alpha;
            for (let r = 0; r < 6; r++) {
                const a = r * Math.PI / 3 + frame * 0.003;
                ctx.beginPath();
                ctx.moveTo(sunX, sunY);
                ctx.lineTo(sunX + Math.cos(a) * 180, sunY + Math.sin(a) * 180);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    }

    /**
     * compute sun x, y and alpha from todBlend and season.
     * sun arcs across the sky from left to right.
     */
    private sunPos(td: number, season: Season, timeOfDay: TimeOfDay, prevTimeOfDay: TimeOfDay) {
        const dayX = season === 'autumn' ? 120 : season === 'winter' ? 160 : 550;
        const dayY = season === 'winter' ? 90 : 65;

        const from = ARC_POS[prevTimeOfDay] ?? 0;
        const to = ARC_POS[timeOfDay] ?? 0;

        const tFrom = TOD_BLEND[prevTimeOfDay];
        const tTo = TOD_BLEND[timeOfDay];
        const progress = Math.abs(tTo - tFrom) < 0.001 ? 1.0 : clamp((td - tFrom) / (tTo - tFrom), 0, 1);

        const arc = from + (to - from) * progress;

        // x: -60 at arc=0 (dawn), dayX at arc=0.5 (day), W+80 at arc=1 (twilight)
        const x = arc <= 0.5
            ? -60 + (dayX + 60) * (arc / 0.5)
            : dayX + (this.W + 80 - dayX) * ((arc - 0.5) / 0.5);

        // y: parabola peaking at arc=0.5, low at both ends
        const horizonY = this.H * 0.55;
        const y = horizonY - Math.sin(arc * Math.PI) * (horizonY - dayY);

        const alpha = timeOfDay === 'day' ? 1.0 : clamp(1 - Math.abs(arc - 0.5) * 2.5, 0, 1);
        return {x, y, alpha};
    }

    /**
     * draw the eclipsed sun - black disc with animated organic corona.
     */
    private drawEclipse(x: number, y: number, frame: number, sa: number) {
        const {ctx} = this;

        const glow = ctx.createRadialGradient(x, y, 26, x, y, 26 * 4.5);
        glow.addColorStop(0, 'rgba(255,240,180,0.35)');
        glow.addColorStop(0.3, 'rgba(255,200,80,0.15)');
        glow.addColorStop(0.7, 'rgba(255,140,20,0.05)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 26 * 4.5, 0, Math.PI * 2);
        ctx.fill();

        const r = 26;
        for (let i = 0; i < 8; i++) {
            const baseAngle = (i / 8) * Math.PI * 2;
            const wobble = Math.sin(frame * 0.018 + i * 1.3) * 0.18;
            const angle = baseAngle + wobble;
            const len = r * (1.4 + 0.6 * Math.sin(frame * 0.025 + i * 0.9));
            const bulge = r * (0.5 + 0.3 * Math.cos(frame * 0.02 + i * 1.1));
            const cx1 = x + Math.cos(angle - 0.4) * (r + bulge);
            const cy1 = y + Math.sin(angle - 0.4) * (r + bulge);
            const cx2 = x + Math.cos(angle + 0.4) * (r + bulge);
            const cy2 = y + Math.sin(angle + 0.4) * (r + bulge);
            const ex = x + Math.cos(angle) * (r + len);
            const ey = y + Math.sin(angle) * (r + len);
            const alpha = sa * (0.4 + 0.3 * Math.sin(frame * 0.03 + i));

            ctx.save();
            ctx.strokeStyle = `rgba(255,220,100,${alpha})`;
            ctx.lineWidth = 1.2 + Math.sin(frame * 0.02 + i) * 0.5;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ffcc40';
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle - 0.3) * r, y + Math.sin(angle - 0.3) * r);
            ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey);
            ctx.bezierCurveTo(cx2, cy2, cx1, cy1, x + Math.cos(angle + 0.3) * r, y + Math.sin(angle + 0.3) * r);
            ctx.stroke();
            ctx.restore();
        }

        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2 + frame * 0.002;
            const rayLen = r * (2 + Math.sin(frame * 0.015 + i * 0.7) * 0.8);
            ctx.save();
            ctx.strokeStyle = `rgba(255,240,180,${sa * (0.15 + 0.1 * Math.sin(frame * 0.02 + i))})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
            ctx.lineTo(x + Math.cos(angle) * (r + rayLen), y + Math.sin(angle) * (r + rayLen));
            ctx.stroke();
            ctx.restore();
        }

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#050208';
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,60,20,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.stroke();
    }
}
