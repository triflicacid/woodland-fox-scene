import {DrawComponent} from '@/core/DrawComponent';
import {Subscriptions} from '@/core/Subscriptions';

/**
 * applies a screen shake effect to the canvas transform.
 * must be registered before all other drawing components so
 * the translate applies to everything drawn after it.
 * call restore() equivalent via a paired component registered last.
 */
export class ScreenShakeComponent extends DrawComponent {
    public static COMPONENT_NAME = 'ScreenShakeComponent';

    private shakeT = 0;
    private shakeAmt = 0;
    private active = false;
    // prevents double-save if active=true then tick sets active=false
    private didSave = false;

    public override getName() {
        return ScreenShakeComponent.COMPONENT_NAME;
    }

    public override initialise() {
        // shake on loud firework bangs
        this.eventBus.subscribe(Subscriptions.onFireworkBang(this.getName(), ({loud}) => {
            if (loud) this.trigger(loud ? 4 : 2, 8);
        }));
        // shake on super-bolt lightning
        this.eventBus.subscribe(Subscriptions.onLightningStrike(this.getName(), ({superBolt}) => {
            if (superBolt) this.trigger(3, 6);
        }));
        // shake on mothron dive
        this.eventBus.subscribe(Subscriptions.onMothronDive(this.getName(), () => {
            this.trigger(5, 12);
        }));
    }

    /**
     * trigger a screen shake.
     */
    private trigger(amt: number, duration: number) {
        this.shakeAmt = amt;
        this.shakeT = duration;
        this.active = true;
    }

    public override isEnabled() {
        return this.active;
    }

    public override tick() {
        this.shakeT--;
        if (this.shakeT <= 0) this.active = false;
    }

    public override draw() {
        if (this.didSave) { // don't double-save... but this shouldn't happen, so panic
            console.error('draw() called twice without restore');
            return;
        }
        const {ctx} = this;
        const decay = this.shakeT / 12;
        const sx = (Math.random() - 0.5) * this.shakeAmt * decay;
        const sy = (Math.random() - 0.5) * this.shakeAmt * decay;
        ctx.save();
        ctx.translate(sx, sy);
        this.didSave = true;
    }

    /**
     * does this component need restoring?
     */
    public needsRestoring() {
        return this.didSave;
    }

    /**
     * restore the change done by this component
     */
    public restore() {
        if (this.didSave) {
            this.ctx.restore();
            this.didSave = false;
        }
    }
}
