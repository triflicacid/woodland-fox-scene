import {DrawComponent} from '@/core/DrawComponent';

/**
 * render a faint mist in the ground (different to fog, mutually exclusive)
 * TODO is needed?
 */
export class MistComponent extends DrawComponent {
    public static COMPONENT_NAME = 'MistComponent';

    public override getName() {
        return MistComponent.COMPONENT_NAME;
    }

    public override isEnabled() {
        return this.scene.weather !== 'fog';
    }

    public override draw() {
        const {ctx, W, H} = this;
        const {season} = this.scene;
        const mA = season === 'winter' ? 0.22 : season === 'autumn' ? 0.10 : 0.05;
        const mist = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.72);
        mist.addColorStop(0, 'rgba(200,220,200,0)');
        mist.addColorStop(1, `rgba(200,220,210,${mA})`);
        ctx.fillStyle = mist;
        ctx.fillRect(0, H * 0.5, W, H * 0.22);
    }
}
