import type {SceneState} from '@/core/SceneState';

/**
 * a data class for a given value change in the scene
 */
export class ValueChange<T> {
    public constructor(
        public readonly previous: T,
        public readonly updated: T,
        public readonly state: SceneState,
    ) {}
}
