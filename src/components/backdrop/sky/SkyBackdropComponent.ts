import {DrawComponent} from '@/core/DrawComponent';
import {clamp, rgb, sample, sampleCol} from '@/utils';
import {
    GLOW_COL,
    GLOW_R,
    GLOW_Y,
    SEASON_GLOW_OFFSET,
    SKY_BOT,
    SKY_MID,
    SKY_TOP
} from "@/components/backdrop/sky/skyDefinitions.ts";

export class SkyBackdropComponent extends DrawComponent {
    static COMPONENT_NAME = 'SkyBackdropComponent';

    override getName() {
        return SkyBackdropComponent.COMPONENT_NAME;
    }

    override draw() {
        const {ctx, W, H} = this;
        const {weather, todBlend: td, specialEvent, groundY} = this.scene;

        const top = sampleCol(td, SKY_TOP)!;
        const mid = sampleCol(td, SKY_MID)!;
        const bot = sampleCol(td, SKY_BOT)!;

        const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.7);
        skyG.addColorStop(0, rgb(top));
        skyG.addColorStop(0.5, rgb(mid));
        skyG.addColorStop(1, rgb(bot));
        ctx.fillStyle = skyG;
        ctx.fillRect(0, 0, W, H);

        // horizon glow band
        const glowR = sample(td, GLOW_R);
        if (glowR > 0.01 && weather !== 'storm' && weather !== 'rain') {
            const glowY = sample(td, GLOW_Y) + SEASON_GLOW_OFFSET[this.scene.season];
            const glowCol = sampleCol(td, GLOW_COL)!;
            const hor = ctx.createLinearGradient(0, H * (glowY - 0.15), 0, groundY);
            hor.addColorStop(0, rgb(glowCol, 0));
            hor.addColorStop(0.5, rgb(glowCol, glowR));
            hor.addColorStop(1, rgb(glowCol, glowR));
            ctx.fillStyle = hor;
            ctx.fillRect(0, H * (glowY - 0.15), W, groundY - H * (glowY - 0.15));
        }

        // storm/rain overlay
        if (weather === 'storm' || weather === 'rain') {
            ctx.fillStyle = '#1a2030';
            ctx.globalAlpha = 0.85;
            ctx.fillRect(0, 0, W, H);
            ctx.globalAlpha = 1;
        }

        // eclipse darkening
        if (specialEvent === 'eclipse') {
            const sa = clamp((td - 0.2) / 0.6, 0, 1);
            ctx.fillStyle = `rgba(10,4,20,${0.88 * sa})`;
            ctx.fillRect(0, 0, W, H);
        }
    }
}
