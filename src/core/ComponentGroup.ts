import {Component} from './Component';
import type {EventBus} from '@/event/EventBus';
import type {SceneState} from './SceneState';

/**
 * an ordered group of components.
 */
export class ComponentGroup extends Component {
    private readonly components: Component[];

    constructor(eventBus: EventBus, scene: SceneState, components: Component[] = []) {
        super(eventBus, scene);
        this.components = components.slice();
    }

    override getName() {
        return 'ComponentGroup';
    }

    /**
     * add a component to this group.
     */
    add(component: Component) {
        this.components.push(component);
    }

    /**
     * return the component with the given name
     */
    getComponent(name: string): Component | null {
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

    override initialise() {
        this.components.forEach(c => c.initialise());
    }

    override isEnabled() {
        return this.components.some(c => c.isEnabled());
    }

    override tick() {
        this.components.forEach(c => {
            if (c.isEnabled()) c.tick();
        });
    }

    override draw() {
        this.components.forEach(c => {
            if (c.isEnabled()) c.draw();
        });
    }
}