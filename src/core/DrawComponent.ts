import {Component} from './Component';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from './SceneState';

/**
 * a Component used for drawing.
 * a component which will draw need not extend this, but this adds `ctx`, `W`, and `H` properties.
 * it is more so that this class _aids_ in drawing by providing a constructor, rather than is necessary.
 */
export class DrawComponent extends Component {
    readonly ctx: CanvasRenderingContext2D;
    readonly W: number;
    readonly H: number;

    constructor(eventBus: EventBus, scene: SceneState, ctx: CanvasRenderingContext2D, W: number, H: number) {
        super(eventBus, scene);
        this.ctx = ctx;
        this.W = W;
        this.H = H;
    }

    override getName(): string {
        throw new Error('DrawComponent subclass does not implement getName()');
    }
}