import {MOON_PHASES, Season, type Tab, TABS, TimeOfDay, Weather} from '@/config';
import {SceneState} from './SceneState';
import {EventBus} from '@/event/EventBus';
import {BackgroundTreesComponent, ForegroundTreesComponent} from '@/components/trees/TreeComponent';
import {LightningComponent} from '@/components/weather/LightningComponent';
import {FoxComponent} from '@/components/animals/FoxComponent';
import {BunnyComponent} from '@/components/animals/BunnyComponent';
import {HedgehogComponent} from '@/components/animals/HedgehogComponent';
import {DeerComponent} from '@/components/animals/DeerComponent';
import {Events} from '@/core/Events';
import {GhostsComponent} from '@/components/halloween/GhostsComponent';
import {ComponentGroup} from './ComponentGroup';
import {TimeOfDayComponent} from '@/components/TimeOfDayComponent';
import {GroundBackdropComponents, SkyBackdropComponents} from '@/components/backdrop/components';
import {GravestoneComponent} from '@/components/halloween/GravestoneComponent';
import {ScarecrowComponent} from '@/components/halloween/ScarecrowComponent';
import {SnowmenComponent} from '@/components/christmas/SnowmenComponent';
import {SmokeComponent} from '@/components/particles/SmokeComponent';
import {FirefliesComponent} from '@/components/particles/FirefliesComponent';
import {HeartsComponent} from '@/components/particles/HeartsComponent';
import {ButterfliesComponent} from '@/components/particles/ButterfliesComponent';
import {SeasonTransitionLeavesComponent} from '@/components/particles/SeasonTransitionLeavesComponent';
import {AutumnBlowingLeavesComponent} from '@/components/particles/AutumnBlowingLeavesComponent';
import {RainComponent} from '@/components/weather/RainComponent';
import {SnowflakesComponent} from '@/components/weather/SnowflakesComponent';
import {WindComponent} from '@/components/weather/WindComponent';
import {FogOverlayComponent} from '@/components/weather/FogOverlayComponent';
import {BirdsComponent} from '@/components/animals/BirdsComponent';
import {BatsComponent} from '@/components/animals/BatsComponent';
import {OwlComponent} from '@/components/animals/OwlComponent';
import {AuroraComponent} from '@/components/backdrop/sky/AuroraComponent';
import {FireworksComponent} from '@/components/bonfire/FireworkComponent';
import {BonfireComponent} from '@/components/bonfire/BonfireComponent';
import {GuyFawkesComponent} from '@/components/bonfire/GuyFawkesComponent';
import {EventListenerComponent} from '@/components/EventListenerComponent';
import {hideElement, requireNonNull} from '@/utils';
import {Subscriptions} from '@/core/Subscriptions';
import {BalloonsComponent} from '@/components/birthday/BalloonsComponent';
import {BuntingComponent} from '@/components/birthday/BuntingComponent';
import {BirthdayBannerComponent} from '@/components/birthday/BirthdayBannerComponent';
import {PresentsComponent} from '@/components/PresentsComponent';
import {MusicalNotesComponent} from '@/components/birthday/MusicalNotesComponent';
import {EasterEggsComponent} from '@/components/easter/EasterEggsComponent';
import {ChicksComponent} from '@/components/animals/ChicksComponent';
import {PlanetsComponent} from '@/components/stargazing/PlanetsComponent';
import {ConstellationsComponent} from '@/components/stargazing/ConstellationsComponent';
import {NorthStarComponent} from '@/components/stargazing/NorthStarComponent';
import {TelescopeComponent} from '@/components/stargazing/TelescopeComponent';
import {CampingTableComponent} from '@/components/stargazing/CampingTableComponent';
import {FoldingStoolComponent} from '@/components/stargazing/FoldingStoolComponent';
import {LaptopComponent} from '@/components/stargazing/LaptopComponent';
import {MothronComponent} from '@/components/eclipse/MothronComponent';
import {EclipseMonstersComponent} from '@/components/eclipse/EclipseMonstersComponent';
import {ScreenShakeComponent} from '@/components/shake/ScreenShakeComponent';
import {ScreenShakeRestoreComponent} from '@/components/shake/ScreenShakeRestoreComponent';
import {EclipseSilhouettesComponent} from '@/components/eclipse/EclipseSilhouttesComponent';
import {BirthdayCakeComponent} from '@/components/birthday/BirthdayCakeComponent';
import {CupcakesComponent} from '@/components/birthday/CupcakesComponent';
import {SaveState} from '@/core/SaveState';
import {FrameRateMonitor} from '@/frames/FrameRateMonitor.ts';

/**
 * Scene is the main entry point, containing all components, objects,
 * and state to the scene and make it interactive.
 * it sets up the canvas, instantiates all components, and runs the render loop.
 */
export class Scene {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly W: number;
    private readonly H: number;
    private readonly statusEl: HTMLElement;
    private readonly state: SceneState;
    private readonly saveState: SaveState;
    private readonly eventBus: EventBus;
    private readonly components: ComponentGroup;
    private readonly frameRateMonitor = new FrameRateMonitor(1_000);
    private handle: number | undefined = undefined;
    private active = false;
    private activeTab: Tab | null = null;

    // components held by reference for direct calls and save state
    private readonly musicalNotes: MusicalNotesComponent;
    private readonly bonfire: BonfireComponent;
    private readonly shake: ScreenShakeComponent;
    private readonly aurora: AuroraComponent;
    private readonly fox: FoxComponent;
    private readonly bunny: BunnyComponent;
    private readonly hearts: HeartsComponent;
    private readonly bats: BatsComponent;
    private readonly birds: BirdsComponent;
    private readonly owl: OwlComponent;
    private readonly mothron: MothronComponent;
    private readonly guyFawkes: GuyFawkesComponent;
    private readonly deer: DeerComponent;
    private readonly hedgehog: HedgehogComponent;
    private readonly laptop: LaptopComponent;
    private readonly chicks: ChicksComponent;

    public constructor(canvas: HTMLCanvasElement, dimensions: { width: number, height: number }, statusEl: HTMLElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.statusEl = statusEl;

        this.W = dimensions.width;
        this.H = dimensions.height;

        // central mutable state
        this.state = new SceneState(this.W, this.H);
        this.saveState = new SaveState();

        // store the event bus for this scene
        this.eventBus = new EventBus();

        this.musicalNotes = new MusicalNotesComponent(this.eventBus, this.state, this.ctx, this.W, this.H);
        this.bonfire = new BonfireComponent(this.eventBus, this.state, this.ctx, this.W, this.H);

        this.components = new ComponentGroup(this.eventBus, this.state, [
            new EventListenerComponent(this.eventBus, this.state),
            this.shake = new ScreenShakeComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new TimeOfDayComponent(this.eventBus, this.state),

            new SkyBackdropComponents(this.eventBus, this.state, this.ctx, this.W, this.H),
            new GroundBackdropComponents(this.eventBus, this.state, this.ctx, this.W, this.H),

            new PlanetsComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new ConstellationsComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new NorthStarComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            new EclipseSilhouettesComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            new BackgroundTreesComponent(this.eventBus, this.state, this.ctx),

            new LightningComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new SmokeComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            new ForegroundTreesComponent(this.eventBus, this.state, this.ctx),

            new FireworksComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            new GravestoneComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new ScarecrowComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            new SnowmenComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new PresentsComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            new BalloonsComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new BirthdayBannerComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new BuntingComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            new FirefliesComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new ButterfliesComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            this.hearts = new HeartsComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            new SeasonTransitionLeavesComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new AutumnBlowingLeavesComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            new RainComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new SnowflakesComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new WindComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new FogOverlayComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            this.bats = new BatsComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            this.birds = new BirdsComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new EclipseMonstersComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            this.owl = new OwlComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            this.mothron = new MothronComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            this.guyFawkes = new GuyFawkesComponent(this.eventBus, this.state, this.ctx, this.W, this.H, this.bonfire.getPosition()),
            this.fox = new FoxComponent(this.eventBus, this.state, this.ctx, this.W, this.H, this.musicalNotes),
            this.bunny = new BunnyComponent(this.eventBus, this.state, this.ctx, this.W, this.H, this.musicalNotes, this.hearts),
            new GhostsComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            this.deer = new DeerComponent(this.eventBus, this.state, this.ctx, this.W, this.H, this.musicalNotes),
            new EasterEggsComponent(this.eventBus, this.state, this.ctx, this.W, this.H),

            this.hedgehog = new HedgehogComponent(this.eventBus, this.state, this.ctx, this.W, this.H, this.musicalNotes),
            new BirthdayCakeComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new CupcakesComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new CampingTableComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            this.laptop = new LaptopComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new FoldingStoolComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            new TelescopeComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            this.chicks = new ChicksComponent(this.eventBus, this.state, this.ctx, this.W, this.H),
            this.musicalNotes,
            this.bonfire,

            new ScreenShakeRestoreComponent(this.eventBus, this.state, this.ctx, this.W, this.H, this.shake),
        ]);

        this.aurora = requireNonNull(this.components.getComponent(AuroraComponent.COMPONENT_NAME)) as AuroraComponent;
    }

    /**
     * initialise the scene.
     */
    public initialise() {
        Events.registerAll(this.eventBus);
        this.initSaveState();
        this.initTabs();
        this.setupCanvasEvents();
        this.refreshUI();
        this.components.initialise();

        this.loop = this.loop.bind(this);

        this.eventBus.subscribe(Subscriptions.onStatusTextChange('Scene', ({text}) => {
            this.statusEl.textContent = text;
        }));
        this.eventBus.subscribe(Subscriptions.onMainButtonsStateChange('Scene', ({enabled}) => {
            this.setButtonsDisabled(!enabled);
        }));
    }

    /**
     * start the rendering loop.
     */
    public start() {
        if (this.active) {
            throw new Error('scene is already active');
        }
        this.frameRateMonitor.reset();
        this.handle = requestAnimationFrame(this.loop);
        this.active = true;
    }

    /**
     * stop the rendering loop.
     */
    public stop() {
        console.warn('stopping scene.');
        this.active = false;
        if (this.handle !== undefined) {
            cancelAnimationFrame(this.handle);
            this.handle = undefined;
        }
    }

    /**
     * run one frame: clear, tick, draw all components.
     * (Note, this does not record as a frame)
     */
    public tick() {
        const {ctx, state} = this;
        ctx.clearRect(0, 0, this.W, this.H);
        state.frame++;

        this.components.tick();
        this.components.draw();
    }

    /**
     * ticks for the given number of frames at max speed.
     * this will not adjust the frame rate monitor.
     */
    public tickMany(frames: number) {
        for (let i = 0; i < frames; i++) {
            this.tick();
        }
    }

    /**
     * run one frame: clear, tick, draw all components, then request next frame.
     */
    private loop(timestamp: DOMHighResTimeStamp) {
        if (!this.active) return; // return as cancelAnimationFrame doesn't always work if stop() is called and new frame overwritten

        this.tick();
        this.frameRateMonitor.recordFrame(+timestamp);
        this.handle = requestAnimationFrame(this.loop);
    }

    /**
     * gets the calculated actual FPS this Scene is rendering at.
     */
    public getActualFps() {
        return this.active ? this.frameRateMonitor.getFps() : 0;
    }

    /**
     * enable or disable the main action buttons.
     */
    private setButtonsDisabled(disabled: boolean) {
        ['btn', 'btn-bunny', 'btn-wander'].forEach(id => {
            const el = document.getElementById(id) as HTMLButtonElement | null;
            if (el) el.disabled = disabled;
        });
    }

    /**
     * register providers to `this.saveState` and load in values
     */
    private initSaveState() {
        const {state} = this;
        this.saveState
            .register({
                key: 'active_tab',
                save: () => this.activeTab,
                load: v => this.setActiveTab(v),
                defaultValue: TABS[0],
            })
            .register({
                key: 'season',
                save: () => state.season,
                load: v => state.changeSeason(v as Season),
                defaultValue: 'summer',
            })
            .register({
                key: 'tod',
                save: () => state.timeOfDay,
                load: v => state.setTOD(v as TimeOfDay),
                defaultValue: 'night',
            })
            .register({
                key: 'weather',
                save: () => state.weather,
                load: v => state.weather = v as Weather,
                defaultValue: 'clear',
            })
            .register({
                key: 'special_event',
                save: () => state.specialEvent,
                load: v => state.specialEvent = v,
                defaultValue: null,
            })
            .register({
                key: 'moon_phase',
                save: () => state.moonPhase,
                load: v => state.moonPhase = v,
                defaultValue: 4,
            })
            .register({
                key: 'stargazing',
                save: () => state.stargazing,
                load: v => state.stargazing = v,
                defaultValue: false,
            })
            .register({
                key: 'owl',
                save: () => this.owl.isForced(),
                load: (v: boolean) => this.owl.setForced(v),
                defaultValue: false,
            })
            .register({
                key: 'bats',
                save: () => this.bats.isForced(),
                load: (v: boolean) => this.bats.setForced(v),
                defaultValue: false,
            })
            .register({
                key: 'aurora',
                save: () => this.aurora.isOn(),
                load: (v: boolean) => this.aurora.setOn(v),
                defaultValue: false,
            });

        this.saveState.load();
        state.clearInvalidStates();
    }

    /**
     * initialise tab switching and restore last active tab.
     */
    private initTabs() {
        TABS.forEach(tab => {
            document.getElementById(`tab-${tab}`)!.addEventListener('click', () => {
                this.setActiveTab(tab);
                this.saveState.save('active_tab');
            });
        });
    }

    /**
     * switch to the given tab and persist the choice.
     */
    private setActiveTab(tab: Tab | null) {
        // clicking active tab deselects it
        const newTab = this.activeTab === tab ? null : tab;
        this.activeTab = newTab;

        TABS.forEach(t => {
            document.getElementById(`tab-${t}`)!.classList.toggle('btn-active', t === newTab);
            document.getElementById(`tab-panel-${t}`)!.classList.toggle('tab-active', t === newTab);
        });
    }

    /**
     * refresh active-state classes and disabled flags on all buttons.
     */
    private refreshUI() {
        const {state} = this;

        (['spring', 'summer', 'autumn', 'winter'] as const).forEach(s =>
            (document.getElementById('btn-' + s) as HTMLButtonElement).classList.toggle('btn-active', state.season === s));
        (['day', 'twilight', 'night', 'dawn'] as const).forEach(s =>
            (document.getElementById('btn-' + s) as HTMLButtonElement).classList.toggle('btn-active', state.timeOfDay === s));
        (['clear', 'rain', 'fog', 'snow', 'storm', 'wind'] as const).forEach(s =>
            (document.getElementById('btn-' + s) as HTMLButtonElement).classList.toggle('btn-active', state.weather === s));

        const snowBtn = document.getElementById('btn-snow') as HTMLButtonElement;
        snowBtn.disabled = state.season !== 'winter';

        const auroraBtn = document.getElementById('btn-aurora') as HTMLButtonElement;
        auroraBtn.disabled = state.season !== 'winter' || state.timeOfDay !== 'night' || state.stargazing;
        auroraBtn.classList.toggle('btn-active', this.aurora.isOn());

        const halloweenBtn = document.getElementById('btn-halloween') as HTMLButtonElement;
        halloweenBtn.disabled = !(state.season === 'autumn' && state.timeOfDay === 'night');
        halloweenBtn.classList.toggle('btn-active', state.specialEvent === 'halloween');

        const christmasBtn = document.getElementById('btn-christmas') as HTMLButtonElement;
        christmasBtn.disabled = state.season !== 'winter';
        christmasBtn.classList.toggle('btn-active', state.specialEvent === 'christmas');

        const bonfireBtn = document.getElementById('btn-bonfire') as HTMLButtonElement;
        bonfireBtn.disabled = state.season !== 'autumn' || state.timeOfDay !== 'night';
        bonfireBtn.classList.toggle('btn-active', state.specialEvent === 'bonfire');

        MOON_PHASES.forEach((_, i) => {
            const btn = document.getElementById(`btn-phase-${i}`) as HTMLButtonElement;
            btn.classList.toggle('btn-active', state.moonPhase === i);
        });
        // hide all moon buttons as there are a lot
        hideElement(document.getElementById('moon-buttons')!, state.timeOfDay !== 'night');

        const guyBtn = document.getElementById('btn-guy-fawkes') as HTMLButtonElement;
        guyBtn.disabled = state.specialEvent !== 'bonfire';

        const owlButton = document.getElementById('btn-owl') as HTMLButtonElement;
        owlButton.classList.toggle('btn-active', this.owl.isForced());

        const batsButton = document.getElementById('btn-bats') as HTMLButtonElement;
        batsButton.classList.toggle('btn-active', this.bats.isForced());

        const chicksBtn = document.getElementById('btn-chicks') as HTMLButtonElement;
        chicksBtn.classList.toggle('btn-active', this.chicks.isForced());

        const mothronBtn = document.getElementById('btn-mothron') as HTMLButtonElement;
        mothronBtn.disabled = state.specialEvent !== 'eclipse';

        const wakeBtn = document.getElementById('btn-wake-fox') as HTMLButtonElement;
        wakeBtn.textContent = !this.fox.isAsleep() ? '😴 Sleep' : '👁 Wake';
        wakeBtn.classList.toggle('btn-active', !this.fox.isAsleep());

        const birthdayBtn = document.getElementById('btn-birthday') as HTMLButtonElement;
        birthdayBtn.classList.toggle('btn-active', state.specialEvent === 'birthday');

        const easterBtn = document.getElementById('btn-easter') as HTMLButtonElement;
        easterBtn.disabled = !(state.season === 'spring' && state.timeOfDay === 'day');
        easterBtn.classList.toggle('btn-active', state.specialEvent === 'easter');

        const stargazeBtn = document.getElementById('btn-stargaze') as HTMLButtonElement | null;
        if (stargazeBtn) {
            const canStargaze = state.timeOfDay === 'night'
                && (state.weather === 'clear' || state.weather === 'wind')
                && !this.aurora.isOn();
            stargazeBtn.disabled = !canStargaze;
            stargazeBtn.classList.toggle('btn-active', state.stargazing);
        }

        const eclipseBtn = document.getElementById('btn-eclipse') as HTMLButtonElement;
        eclipseBtn.disabled = state.timeOfDay === 'night';
        eclipseBtn.classList.toggle('btn-active', state.specialEvent === 'eclipse');

        this.updateTabSummaries();
    }

    /**
     * wire up all canvas click and button events.
     */
    private setupCanvasEvents() {
        const {canvas, W, H, state} = this;

        // click on fox: grumble; click on tree: scare birds
        canvas.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect();
            const cx = (e.clientX - rect.left) * (W / rect.width);
            const cy = (e.clientY - rect.top) * (H / rect.height);

            if (this.fox.containsPoint(cx, cy)) {
                this.fox.click();
            }

            // click on a tree top to startle a bird
            state.trees.forEach(tr => {
                if (Math.abs(cx - tr.x) < tr.r && cy < state.groundY && cy > state.groundY - tr.h * 0.7) {
                    this.birds.spawnStartledBird(tr.x, tr.y);
                }
            });

            // click on laptop to cycle screen mode
            if (this.laptop.isEnabled() && this.laptop.containsPoint(cx, cy)) {
                this.laptop.cycleScreenMode();
            }
        });

        // main wake button
        document.getElementById('btn')!.addEventListener('click', () => {
            if (this.bunny.isEnabled()) return; // exit if doing something
            this.setButtonsDisabled(true);
            this.statusEl.textContent = 'Waking up...';
            this.fox.startWakeUpScene();
        });

        // wander button
        document.getElementById('btn-wander')!.addEventListener('click', () => {
            if (this.bunny.isEnabled()) return; // exit if doing something
            this.setButtonsDisabled(true);
            this.statusEl.textContent = 'Off for a little wander...';
            this.fox.startWanderScene();
        });

        // visitor button (bunny)
        document.getElementById('btn-bunny')!.addEventListener('click', () => {
            if (this.bunny.isEnabled()) return; // exit if doing something
            this.setButtonsDisabled(true);
            this.fox.forceIdle();
            this.hearts.clear();
            this.bunny.startVisitorScene();
            this.statusEl.textContent = 'Something stirs in the trees...';
        });

        // season buttons
        (['spring', 'summer', 'autumn', 'winter'] as const).forEach(s =>
            document.getElementById('btn-' + s)!.addEventListener('click', () => {
                const oldSeason = state.season;
                state.changeSeason(s);
                state.clearInvalidStates();
                this.eventBus.dispatch(Events.seasonChange('Scene', oldSeason, state));
                this.saveState.save();
                this.refreshUI();
            }));

        // time of day buttons
        (['day', 'twilight', 'night', 'dawn'] as const).forEach(t =>
            document.getElementById('btn-' + t)!.addEventListener('click', () => {
                state.setTOD(t);
                state.clearInvalidStates();
                this.saveState.save();
                this.refreshUI();
            }));

        // weather buttons
        (['clear', 'rain', 'fog', 'snow', 'storm', 'wind'] as const).forEach(w =>
            document.getElementById('btn-' + w)!.addEventListener('click', () => {
                if (w === 'snow' && state.season !== 'winter') return;
                const oldWeather = state.weather;
                state.weather = w;
                state.clearInvalidStates();
                this.saveState.save();
                this.refreshUI();
                this.eventBus.dispatch(Events.weatherChange('Scene', oldWeather, state));
            }));

        // aurora toggle
        document.getElementById('btn-aurora')!.addEventListener('click', () => {
            if (state.season !== 'winter' || state.timeOfDay !== 'night' || state.stargazing) return;
            this.aurora.setOn(!this.aurora.isOn());
            if (this.aurora.isOn() && state.stargazing) {
                state.stargazing = false; // supress stargazing
            }
            this.saveState.save('aurora', 'stargazing');
            this.refreshUI();
        });

        // stargazing toggle
        document.getElementById('btn-stargaze')!.addEventListener('click', () => {
            state.stargazing = !state.stargazing;
            if (state.stargazing && this.aurora.isOn()) {
                this.aurora.setOn(false); // supress aurora
            }
            this.saveState.save('aurora', 'stargazing');
            this.refreshUI();
        });

        // animal / reaction summon buttons
        document.getElementById('btn-deer')!.addEventListener('click', () => this.deer.summon());
        document.getElementById('btn-hog')!.addEventListener('click', () => this.hedgehog.summon());
        document.getElementById('btn-owl')!.addEventListener('click', e => {
            this.owl.setForced(!this.owl.isForced());
            this.saveState.save('owl');
            (e.target as HTMLButtonElement).classList.toggle('btn-active', this.owl.isEnabled());
        });
        document.getElementById('btn-bats')!.addEventListener('click', e => {
            this.bats.setForced(!this.bats.isForced());
            this.saveState.save('bats');
            (e.target as HTMLButtonElement).classList.toggle('btn-active', this.bats.isForced());
        });
        document.getElementById('btn-yawn')!.addEventListener('click', () => this.fox.triggerYawn());
        document.getElementById('btn-ear')!.addEventListener('click', () => this.fox.triggerEarTwitch());
        document.getElementById('btn-grumble')!.addEventListener('click', () => this.fox.triggerGrumble());
        document.getElementById('btn-chicks')!.addEventListener('click', e => {
            this.chicks.setForced(!this.chicks.isForced());
            this.saveState.save('chicks');
            (e.target as HTMLButtonElement).classList.toggle('btn-active', this.chicks.isForced());
        });

        document.getElementById('btn-halloween')!.addEventListener('click', () => {
            const old = state.specialEvent;
            state.specialEvent = state.specialEvent === 'halloween' ? null : 'halloween';
            this.saveState.save('special_event');
            this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
            this.refreshUI();
        });
        document.getElementById('btn-christmas')!.addEventListener('click', () => {
            const old = state.specialEvent;
            state.specialEvent = state.specialEvent === 'christmas' ? null : 'christmas';
            this.saveState.save('special_event');
            this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
            this.refreshUI();
        });
        document.getElementById('btn-bonfire')!.addEventListener('click', () => {
            const old = state.specialEvent;
            state.specialEvent = state.specialEvent === 'bonfire' ? null : 'bonfire';
            this.saveState.save('special_event');
            this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
            this.refreshUI();
        });
        document.getElementById('btn-birthday')!.addEventListener('click', () => {
            const old = state.specialEvent;
            state.specialEvent = state.specialEvent === 'birthday' ? null : 'birthday';
            this.deer.forceOff();
            this.hedgehog.forceOff();
            this.saveState.save('special_event');
            this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
            this.refreshUI();
        });
        document.getElementById('btn-easter')!.addEventListener('click', () => {
            const old = state.specialEvent;
            state.specialEvent = state.specialEvent === 'easter' ? null : 'easter';
            this.saveState.save('special_event');
            this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
            this.eventBus.dispatch(Events.statusText('Scene', 'Happy Easter!'));
            this.refreshUI();
        });

        MOON_PHASES.forEach((_, i) => {
            document.getElementById(`btn-phase-${i}`)!.addEventListener('click', () => {
                const oldMoonPhase = state.moonPhase;
                state.moonPhase = i;
                this.saveState.save('moon_phase');
                this.eventBus.dispatch(Events.moonPhaseChange('Scene', oldMoonPhase, state));
                this.refreshUI();
            });
        });

        document.getElementById('btn-guy-fawkes')!.addEventListener('click', () => this.guyFawkes.summon());
        document.getElementById('btn-mothron')!.addEventListener('click', () => this.mothron.summon());

        document.getElementById('btn-eye')!.addEventListener('click', () => {
            this.fox.triggerEyeTransition(true);
        });

        document.getElementById('btn-wake-fox')!.addEventListener('click', () => {
            if (this.fox.isIdle()) {
                this.fox.setAsleep(!this.fox.isAsleep());
                this.refreshUI();
            }
        });

        document.getElementById('btn-eclipse')!.addEventListener('click', () => {
            const old = state.specialEvent;
            state.specialEvent = state.specialEvent === 'eclipse' ? null : 'eclipse';
            this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
            this.saveState.save('special_event');
            if (state.specialEvent === 'eclipse') {
                this.eventBus.dispatch(Events.statusText('Scene', 'The sky darkens as the moon devours the sun...'));
            }
            this.refreshUI();
        });
    }

    /**
     * update the summary indicator shown on each inactive tab button.
     */
    private updateTabSummaries() {
        const {state} = this;

        const seasonEmoji: Record<string, string> = {spring: '🌸', summer: '🌿', autumn: '🍂', winter: '❄️'};
        const todEmoji: Record<string, string> = {day: '☀️', twilight: '🌇', night: '🌙', dawn: '🌅'};
        const weatherEmoji: Record<string, string> = {
            clear: '✨',
            rain: '🌧',
            wind: '🍃',
            fog: '🌫',
            snow: '🌨',
            storm: '⛈'
        };

        const todSummary = [
            todEmoji[state.timeOfDay],
            state.timeOfDay === 'night' ? MOON_PHASES[state.moonPhase] : '',
        ].filter(Boolean).join(' ');

        const weatherSummary = [
            weatherEmoji[state.weather] ?? '',
            this.aurora.isOn() ? '✦' : '',
            state.stargazing ? '🔭' : '',
        ].filter(Boolean).join(' ');

        const eventEmoji: Record<string, string> = {
            halloween: '🎃', christmas: '🎄', bonfire: '🎆',
            birthday: '🎂', easter: '🐣', eclipse: '🌑',
        };
        const eventsSummary = state.specialEvent ? (eventEmoji[state.specialEvent] ?? '') : '';

        const summaries: Record<string, string> = {
            season: seasonEmoji[state.season]!,
            tod: todSummary,
            weather: weatherSummary,
            events: eventsSummary,
            animals: '',
            fox: '',
        };

        const labels: Record<string, string> = {
            season: '🌍 Season',
            tod: '🕐 Time',
            weather: '🌦 Weather',
            events: '🎉 Events',
            animals: '🐾 Animals',
            fox: '🦊 Fox',
        };

        Object.entries(summaries).forEach(([tab, summary]) => {
            const btn = document.getElementById(`tab-${tab}`)!;
            btn.textContent = summary ? `${labels[tab]}  ${summary}` : labels[tab]!;
        });
    }
}
