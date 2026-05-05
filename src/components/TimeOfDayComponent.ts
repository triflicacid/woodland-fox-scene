import {Component} from '@/core/Component';
import {lerp} from '@/utils';
import {Events} from '@/core/Events';

/**
 * a non-drawing component which advances time of day blend only.
 */
export class TimeOfDayComponent extends Component {
    public static COMPONENT_NAME = 'TimeOfDayComponent';

    public override getName() {
        return TimeOfDayComponent.COMPONENT_NAME;
    }

    public override isEnabled() {
        return !this.isAtTarget();
    }

    public override tick() {
        this.scene.todBlend = lerp(this.scene.todBlend, this.scene.todTarget, 0.025);

        if (this.isAtTarget()) { // done! notify of change completion
            this.eventBus.dispatch(Events.todChange(this.getName(), this.scene.prevTimeOfDay, this.scene));
        }
    }

    private isAtTarget() {
        return Math.abs(this.scene.todBlend - this.scene.todTarget) <= 0.01;
    }
}
