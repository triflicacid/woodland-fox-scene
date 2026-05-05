import type {Scene} from './core/Scene';
import type {PROBABILITY} from './config';

/**
 * Expose debugging variables.
 */
export interface Debug {
    scene: Scene;
    probs: typeof PROBABILITY;

    /**
     * Global yes/no, or filter to show.
     *
     * - false: disabled, print no events
     * - true: print all events
     * - string[]: print only matching event names
     */
    printEvents?: boolean | string[];

}

declare global {
    var debug: Debug;
}

export {};
