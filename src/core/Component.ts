import {requireNonNull} from '@/utils';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from './SceneState';

/**
 * represents a component which may be registered to a scene.
 */
export abstract class Component {
    public readonly eventBus: EventBus;
    public readonly scene: SceneState;

    public constructor(eventBus: EventBus, scene: SceneState) {
        this.eventBus = requireNonNull(eventBus);
        this.scene = requireNonNull(scene);
    }

    /**
     * get the name of this component
     */
    public abstract getName(): string;

    /**
     * called once after scene has been initialised
     */
    public initialise() {}

    /**
     * is this component enabled this frame?
     * if returns `false`, we do not tick or draw this component.
     * (this is not enforced in this class and should be done elsewhere.)
     */
    public isEnabled() {
        return true;
    }

    /**
     * draw this component.
     */
    draw() {}

    /**
     * process a tick update for this component.
     */
    tick() {}
}
