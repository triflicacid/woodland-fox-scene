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
    public season!: Season;
    public timeOfDay!: TimeOfDay;
    public prevTimeOfDay!: TimeOfDay;
    public todBlend!: number;
    public todTarget!: number;
    public weather!: Weather;
    public specialEvent: SpecialEvent = null;
    public stargazing!: boolean;
    public moonPhase!: number;

    public readonly W: number;
    public readonly H: number;
    public frame = 0;
    public readonly groundY: number;

    public fox: FoxState;
    public trees: TreeDef[];

    public constructor(W: number, H: number) {
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

    public pal() {
        return PALETTES[this.season];
    }

    /**
     * change the time of day and start blend animation.
     */
    public setTOD(v: TimeOfDay) {
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
    public changeSeason(s: Season) {
        if (s === this.season) return;
        this.season = s;
        if (this.weather === 'snow' && s !== 'winter') this.weather = 'clear';
    }

    /**
     * correct any invalid states
     */
    public clearInvalidStates() {
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
