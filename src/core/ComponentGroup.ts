import {Component} from './Component';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from './SceneState';

/**
 * an ordered group of components.
 */
export class ComponentGroup extends Component {
    private readonly components: Component[];

    public constructor(eventBus: EventBus, scene: SceneState, components: Component[] = []) {
        super(eventBus, scene);
        this.components = components.slice();
    }

    public override getName() {
        return 'ComponentGroup';
    }

    /**
     * add a component to this group.
     */
    public add(component: Component) {
        this.components.push(component);
    }

    /**
     * return the component with the given name
     */
    public getComponent(name: string): Component | null {
        for (const component of this.components) {
            if (component instanceof ComponentGroup) {
                const found = component.getComponent(name);
                if (found !== null) return found;
            } else if (component.getName() === name) {
                return component;
            }
        }
        return null;
    }

    public override initialise() {
        this.components.forEach(c => c.initialise());
    }

    public override isEnabled() {
        return this.components.some(c => c.isEnabled());
    }

    public override tick() {
        this.components.forEach(c => {
            if (c.isEnabled()) c.tick();
        });
    }

    public override draw() {
        this.components.forEach(c => {
            if (c.isEnabled()) c.draw();
        });
    }
}