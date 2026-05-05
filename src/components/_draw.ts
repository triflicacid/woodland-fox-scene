import {DrawComponent} from '@/core/DrawComponent';

/**
 * ...
 */
export class BasicDrawComponent extends DrawComponent {
    public static COMPONENT_NAME = 'BasicDrawComponent';

    public override getName() {
        return BasicDrawComponent.COMPONENT_NAME;
    }

    public override draw() {}
}