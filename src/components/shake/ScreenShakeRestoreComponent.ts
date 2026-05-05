import {DrawComponent} from '@/core/DrawComponent';
import {ScreenShakeComponent} from '@/components/shake/ScreenShakeComponent';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from '@/core/SceneState';

/**
 * paired with ScreenShakeComponent - restores the canvas transform.
 * must be registered LAST in the component list.
 */
export class ScreenShakeRestoreComponent extends DrawComponent {
    static COMPONENT_NAME = 'ScreenShakeRestoreComponent';

    private readonly shake: ScreenShakeComponent;

    constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D, W: number, H: number, shake: ScreenShakeComponent) {
        super(eventBus, scene, ctx, W, H);
        this.shake = shake;
    }

    override getName() {
        return ScreenShakeRestoreComponent.COMPONENT_NAME;
    }

    override isEnabled() {
        return this.shake.needsRestoring();
    }

    override draw() {
        this.shake.restore();
    }
}
