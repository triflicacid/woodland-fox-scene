import {DrawComponent} from '@/core/DrawComponent';
import {clamp} from '@/utils';
import {CONSTELLATIONS} from "@/components/stargazing/constellationDefinitions.ts";

/**
 * draws fixed constellations in the night sky with connecting lines.
 * brightness varies inversely with moon phase - brightest at new moon.
 */
export class ConstellationsComponent extends DrawComponent {
    public static COMPONENT_NAME = 'ConstellationsComponent';

    public override getName() {
        return ConstellationsComponent.COMPONENT_NAME;
    }

    public override isEnabled() {
        const {weather} = this.scene;
        return this.scene.stargazing && this.scene.timeOfDay === 'night' && (weather === 'clear' || weather === 'wind');
    }

    public override draw() {
        const {ctx} = this;
        const {moonPhase, frame} = this.scene;

        const moonDim = 0.15 + (Math.abs(moonPhase - 4) / 4) * 0.85;
        const nightAlpha = clamp(1 - this.scene.todBlend * 2.5, 0, 1);
        const baseAlpha = nightAlpha * moonDim;

        CONSTELLATIONS.forEach(con => {
            // draw connecting lines first
            ctx.save();
            ctx.strokeStyle = 'rgba(160,180,255,0.35)';
            ctx.lineWidth = 0.8;
            ctx.setLineDash([]);
            con.lines.forEach(([a, b]) => {
                ctx.beginPath();
                ctx.moveTo(con.stars[a]!.x, con.stars[a]!.y);
                ctx.lineTo(con.stars[b]!.x, con.stars[b]!.y);
                ctx.globalAlpha = baseAlpha * 0.5;
                ctx.stroke();
            });
            ctx.restore();

            // draw stars
            con.stars.forEach((s, i) => {
                const twinkle = 0.7 + 0.3 * Math.sin(frame * 0.04 + i * 1.7 + con.stars.length);
                ctx.save();
                ctx.globalAlpha = baseAlpha * twinkle;
                ctx.shadowBlur = 6;
                ctx.shadowColor = '#c8d8ff';
                ctx.fillStyle = '#e8eeff';
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        });
    }
}