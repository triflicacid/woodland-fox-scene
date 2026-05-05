import {PALETTES, type Season, type SpecialEvent, type TimeOfDay, TOD_BLEND, type Weather} from '@/config';
import {TREE_DEFS, type TreeDef} from '@/components/trees/treeDefinitions';

// TODO migrate all but x/y into FoxComponent
export interface FoxState {
    x: number;
    y: number;
}

/**
 * manages the shared state of the scene.
 * most state is kept to individual components unless it is needed by multiple.
 */
export class SceneState {
    season!: Season;
    timeOfDay!: TimeOfDay;
    prevTimeOfDay!: TimeOfDay;
    todBlend!: number;
    todTarget!: number;
    weather!: Weather;
    specialEvent: SpecialEvent = null;
    stargazing!: boolean;
    moonPhase!: number;

    readonly W: number;
    readonly H: number;
    frame = 0;
    readonly groundY: number;

    fox: FoxState;
    trees: TreeDef[];

    constructor(W: number, H: number) {
        this.W = W;
        this.H = H;
        this.groundY = H * 0.62;

        this.fox = {
            x: 350,
            y: this.groundY + 0.02 * H,
        };

        this.trees = (TREE_DEFS as TreeDef[]).map(t => ({...t, y: this.groundY}));

        this.clearInvalidStates();
    }

    pal() {
        return PALETTES[this.season];
    }

    /**
     * change the time of day and start blend animation.
     */
    setTOD(v: TimeOfDay) {
        if (!this.timeOfDay) {
            this.prevTimeOfDay = this.timeOfDay = v;
            this.todBlend = this.todTarget = TOD_BLEND[v];
        } else {
            this.prevTimeOfDay = this.timeOfDay;
            this.timeOfDay = v;
            this.todTarget = TOD_BLEND[v];
        }
    }

    /**
     * change the current season, triggering leaf transition if relevant.
     */
    changeSeason(s: Season) {
        if (s === this.season) return;
        this.season = s;
        if (this.weather === 'snow' && s !== 'winter') this.weather = 'clear';
    }

    /**
     * correct any invalid states
     */
    clearInvalidStates() {
        if (this.specialEvent === 'halloween' && !(this.season === 'autumn' && this.timeOfDay === 'night')) {
            this.specialEvent = null;
        } else if (this.specialEvent === 'christmas' && this.season !== 'winter') {
            this.specialEvent = null;
        } else if (this.specialEvent === 'bonfire' && !(this.season === 'autumn' && this.timeOfDay === 'night')) {
            this.specialEvent = null;
        } else if (this.specialEvent === 'easter' && !(this.season === 'spring' && this.timeOfDay === 'night')) {
            this.specialEvent = null;
        } else if (this.specialEvent === 'eclipse' && this.timeOfDay !== 'day') {
            this.specialEvent = null;
        }

        if (this.stargazing && (this.timeOfDay !== 'night' || this.specialEvent !== null)) {
            this.stargazing = false;
        }

        if (this.weather === 'snow' && this.season !== 'winter') {
            this.weather = 'clear';
        }
    }
}