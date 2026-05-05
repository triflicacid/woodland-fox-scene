import {DrawComponent} from '@/core/DrawComponent';

/**
 * ...
 */
export class BasicDrawComponent extends DrawComponent {
    static COMPONENT_NAME = 'BasicDrawComponent';

    override getName() {
        return BasicDrawComponent.COMPONENT_NAME;
    }

    override draw() {}
}