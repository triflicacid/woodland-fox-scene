import {Component} from '@/core/Component';

/**
 * ...
 */
export class BasicComponent extends Component {
    static COMPONENT_NAME = 'BasicComponent';

    override getName() {
        return BasicComponent.COMPONENT_NAME;
    }
}