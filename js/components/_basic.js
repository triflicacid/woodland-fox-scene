import {Component} from "@/core/Component";

/**
 * ...
 */
export class BasicComponent extends Component {
  /**
   * @param {EventBus} eventBus
   * @param {SceneState} scene
   */
  constructor(eventBus, scene) {
    super(eventBus, scene);
  }

  static COMPONENT_NAME = "BasicComponent";
  getName() {
    return BasicComponent.COMPONENT_NAME;
  }
}

