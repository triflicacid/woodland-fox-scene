import {Component} from '@/core/Component';

/**
 * ...
 */
export class BasicComponent extends Component {
    public static COMPONENT_NAME = 'BasicComponent';

    public override getName() {
        return BasicComponent.COMPONENT_NAME;
    }
}
