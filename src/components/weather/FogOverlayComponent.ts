import {DrawComponent} from '@/core/DrawComponent';
import {rnd} from '@/utils';

interface FogParticle {
    x: number;
    y: number;
    w: number;
    h: number;
    speed: number;
    alpha: number;
}

/**
 * render fog overlay when foggy
 */
export class FogOverlayComponent extends DrawComponent {
    public static COMPONENT_NAME = 'FogOverlayComponent';

    private fogParticles: FogParticle[] = [];

    public override getName() {
        return FogOverlayComponent.COMPONENT_NAME;
    }

    public override initialise() {
        const {W, H} = this;
        this.fogParticles = Array.from({length: 14}, (_, i) => ({
            x: (i / 14) * W * 1.3 - W * 0.15,
            y: H * 0.3 + rnd(H * 0.4),
            w: 100 + rnd(200),
            h: 45 + rnd(65),
            speed: 0.15 + rnd(0.2),
            alpha: 0.04 + rnd(0.06),
        }));
    }

    public override isEnabled() {
        return this.scene.weather === 'fog';
    }

    public override tick() {
        const {W} = this;
        this.fogParticles.forEach(fp => {
            fp.x += fp.speed;
            if (fp.x > W + fp.w) fp.x = -fp.w;
        });
    }

    public override draw() {
        const {ctx, W, H} = this;
        this.fogParticles.forEach(fp => {
            ctx.save();
            ctx.globalAlpha = fp.alpha;
            const fg = ctx.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, fp.w * 0.7);
            fg.addColorStop(0, 'rgba(200,210,200,1)');
            fg.addColorStop(1, 'rgba(200,210,200,0)');
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.ellipse(fp.x, fp.y, fp.w, fp.h, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        // full-scene fog thickening toward the ground
        const fo = ctx.createLinearGradient(0, H * 0.4, 0, H);
        fo.addColorStop(0, 'rgba(175,185,180,0)');
        fo.addColorStop(0.4, 'rgba(175,185,180,0.35)');
        fo.addColorStop(1, 'rgba(175,185,180,0.58)');
        ctx.fillStyle = fo;
        ctx.fillRect(0, H * 0.4, W, H * 0.6);
    }
}
