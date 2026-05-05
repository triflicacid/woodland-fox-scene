import {DrawComponent} from '@/core/DrawComponent';
import {ScreenShakeComponent} from '@/components/shake/ScreenShakeComponent';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from '@/core/SceneState';

/**
 * paired with ScreenShakeComponent - restores the canvas transform.
 * must be registered LAST in the component list.
 */
export class ScreenShakeRestoreComponent extends DrawComponent {
    public static COMPONENT_NAME = 'ScreenShakeRestoreComponent';

    private readonly shake: ScreenShakeComponent;

    public constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D, W: number, H: number, shake: ScreenShakeComponent) {
        super(eventBus, scene, ctx, W, H);
        this.shake = shake;
    }

    public override getName() {
        return ScreenShakeRestoreComponent.COMPONENT_NAME;
    }

    public override isEnabled() {
        return this.shake.needsRestoring();
    }

    public override draw() {
        this.shake.restore();
    }
}
