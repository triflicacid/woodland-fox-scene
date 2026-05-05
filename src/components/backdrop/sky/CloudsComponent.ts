import {DrawComponent} from '@/core/DrawComponent';

type CloudSeed = [number, number, number];

/**
 * render clouds (differ on weather)
 */
export class CloudsComponent extends DrawComponent {
    static COMPONENT_NAME = 'CloudsComponent';

    override getName() {
        return CloudsComponent.COMPONENT_NAME;
    }

    override isEnabled() {
        return !this.scene.stargazing && this.scene.specialEvent !== 'eclipse';
    }

    override draw() {
        const {ctx} = this;
        const {weather, season, frame} = this.scene;
        const isRainy = weather === 'rain' || weather === 'storm';
        const windM = weather === 'wind' || weather === 'storm' ? 2.2 : 1;
        const seeds: CloudSeed[] = [[100, 80, 0.7], [280, 60, 0.5], [450, 90, 0.6], [600, 70, 0.45]];
        const extra: CloudSeed[] = isRainy ? [[160, 50, 0.8], [380, 40, 0.9], [520, 65, 0.85]] : [];

        ([...seeds, ...extra] as CloudSeed[]).forEach(([cx, cy, a], i) => {
            const dx = Math.sin(frame * 0.002 + i * 0.8) * 20 * windM;
            ctx.save();
            ctx.globalAlpha = a * (isRainy ? 0.92 : season === 'winter' ? 0.82 : 0.58);
            ctx.fillStyle = isRainy
                ? '#4a5a6a'
                : season === 'winter'
                    ? '#e8eef4'
                    : season === 'autumn'
                        ? '#d8b888'
                        : '#fff';
            const x = cx + dx;
            ctx.beginPath();
            ctx.arc(x, cy, 28, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 30, cy + 5, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 22, cy + 6, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 10, cy - 12, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}
