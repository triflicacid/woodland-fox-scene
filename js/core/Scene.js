import {CANVAS, MOON_PHASES} from '@/config';
import {SceneState} from './SceneState.js';
import {EventBus} from '@/event/EventBus';
import {BackgroundTreesComponent, ForegroundTreesComponent} from '@/components/TreeComponent';
import {LightningComponent} from "@/components/weather/LightningComponent";
import {FoxComponent} from '@/components/animals/FoxComponent';
import {BunnyComponent} from '@/components/animals/BunnyComponent';
import {HedgehogComponent} from '@/components/animals/HedgehogComponent';
import {DeerComponent} from '@/components/animals/DeerComponent';
import {Events} from "@/core/Events";
import {GhostsComponent} from "@/components/halloween/GhostsComponent";
import {ComponentGroup} from "./ComponentGroup";
import {TimeOfDayComponent} from "@/components/TimeOfDayComponent";
import {GroundBackdropComponents, SkyBackdropComponents} from "@/components/backdrop/components";
import {GravestoneComponent} from "@/components/halloween/GravestoneComponent";
import {ScarecrowComponent} from "@/components/halloween/ScarecrowComponent";
import {SnowmenComponent} from "@/components/christmas/SnowmenComponent";
import {SmokeComponent} from "@/components/particles/SmokeComponent";
import {FirefliesComponent} from "@/components/particles/FirefliesComponent";
import {HeartsComponent} from "@/components/particles/HeartsComponent";
import {ButterfliesComponent} from "@/components/particles/ButterfliesComponent";
import {SeasonTransitionLeavesComponent} from "@/components/particles/SeasonTransitionLeavesComponent";
import {AutumnBlowingLeavesComponent} from "@/components/particles/AutumnBlowingLeavesComponent";
import {RainComponent} from "@/components/weather/RainComponent";
import {SnowflakesComponent} from "@/components/weather/SnowflakesComponent";
import {WindComponent} from "@/components/weather/WindComponent";
import {FogOverlayComponent} from "@/components/weather/FogOverlayComponent";
import {BirdsComponent} from "@/components/animals/BirdsComponent";
import {BatsComponent} from "@/components/animals/BatsComponent";
import {OwlComponent} from "@/components/animals/OwlComponent";
import {AuroraComponent} from "@/components/backdrop/sky/AuroraComponent";
import {FireworksComponent} from "@/components/bonfire/FireworkComponent";
import {BonfireComponent} from "@/components/bonfire/BonfireComponent";
import {GuyFawkesComponent} from "@/components/bonfire/GuyFawkesComponent";
import {EventListenerComponent} from "@/components/EventListenerComponent";
import {requireNonNull} from "@/utils";
import {Subscriptions} from "@/core/Subscriptions";
import {BalloonsComponent} from "@/components/birthday/BalloonsComponent";
import {BuntingComponent} from "@/components/birthday/BuntingComponent";
import {BirthdayBannerComponent} from "@/components/birthday/BirthdayBannerComponent";
import {PresentsComponent} from "@/components/PresentsComponent";
import {MusicalNotesComponent} from "@/components/birthday/MusicalNotesComponent";
import {EasterEggsComponent} from "@/components/easter/EasterEggsComponent";
import {ChicksComponent} from "@/components/animals/ChicksComponent";
import {PlanetsComponent} from "@/components/stargazing/PlanetsComponent";
import {ConstellationsComponent} from "@/components/stargazing/ConstellationsComponent";
import {NorthStarComponent} from "@/components/stargazing/NorthStarComponent";
import {TelescopeComponent} from "@/components/stargazing/TelescopeComponent";
import {CampingTableComponent} from "@/components/stargazing/CampingTableComponent";
import {FoldingStoolComponent} from "@/components/stargazing/FoldingStoolComponent";
import {LaptopComponent} from "@/components/stargazing/LaptopComponent";
import {MothronComponent} from "@/components/eclipse/MothronComponent";
import {EclipseMonstersComponent} from "@/components/eclipse/EclipseMonstersComponent";
import {ScreenShakeComponent} from "@/components/shake/ScreenShakeComponent";
import {ScreenShakeRestoreComponent} from "@/components/shake/ScreenShakeRestoreComponent";
import {EclipseSilhouettesComponent} from "@/components/eclipse/EclipseSilhouttesComponent";

/**
 * Scene is the main entry point, containing all components, objects,
 * and state to the scene and make it interactive.
 * it sets up the canvas, instantiates all components, and runs the render loop.
 */
export class Scene {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLElement} statusEl - the status text element
   */
  constructor(canvas, statusEl) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.statusEl = statusEl;

    const W = CANVAS.WIDTH;
    const H = CANVAS.HEIGHT;

    // central mutable state
    this.state = new SceneState(W, H);

    // store the handle for the drawing loop
    /** @type {number | undefined} */
    this._handle = undefined;
    // also store playing flag
    this._active = false;

    // store the event bus for this scene
    this.eventBus = new EventBus();

    this._musicalNotes = new MusicalNotesComponent(this.eventBus, this.state, this.ctx, W, H);

    /** @type {ComponentGroup} */
    this._components = new ComponentGroup(this.eventBus, this.state, [
      new EventListenerComponent(this.eventBus, this.state),
      this._shake = new ScreenShakeComponent(this.eventBus, this.state, this.ctx, W, H),
      new TimeOfDayComponent(this.eventBus, this.state),

      new SkyBackdropComponents(this.eventBus, this.state, this.ctx, W, H),
      new GroundBackdropComponents(this.eventBus, this.state, this.ctx, W, H),

      new PlanetsComponent(this.eventBus, this.state, this.ctx, W, H),
      new ConstellationsComponent(this.eventBus, this.state, this.ctx, W, H),
      new NorthStarComponent(this.eventBus, this.state, this.ctx, W, H),

      new EclipseSilhouettesComponent(this.eventBus, this.state, this.ctx, W, H),

      new BackgroundTreesComponent(this.eventBus, this.state, this.ctx),

      new LightningComponent(this.eventBus, this.state, this.ctx, W, H),
      new SmokeComponent(this.eventBus, this.state, this.ctx, W, H),

      new ForegroundTreesComponent(this.eventBus, this.state, this.ctx),

      new FireworksComponent(this.eventBus, this.state, this.ctx, W, H),

      new GravestoneComponent(this.eventBus, this.state, this.ctx, W, H),
      new ScarecrowComponent(this.eventBus, this.state, this.ctx, W, H),

      new SnowmenComponent(this.eventBus, this.state, this.ctx, W, H),
      new PresentsComponent(this.eventBus, this.state, this.ctx, W, H),

      new BalloonsComponent(this.eventBus, this.state, this.ctx, W, H),
      new BirthdayBannerComponent(this.eventBus, this.state, this.ctx, W, H),
      new BuntingComponent(this.eventBus, this.state, this.ctx, W, H),

      new FirefliesComponent(this.eventBus, this.state, this.ctx, W, H),
      new ButterfliesComponent(this.eventBus, this.state, this.ctx, W, H),
      new HeartsComponent(this.eventBus, this.state, this.ctx, W, H),

      new SeasonTransitionLeavesComponent(this.eventBus, this.state, this.ctx, W, H),
      new AutumnBlowingLeavesComponent(this.eventBus, this.state, this.ctx, W, H),

      new RainComponent(this.eventBus, this.state, this.ctx, W, H),
      new SnowflakesComponent(this.eventBus, this.state, this.ctx, W, H),
      new WindComponent(this.eventBus, this.state, this.ctx, W, H),
      new FogOverlayComponent(this.eventBus, this.state, this.ctx, W, H),

      new BatsComponent(this.eventBus, this.state, this.ctx, W, H),
      this._birds = new BirdsComponent(this.eventBus, this.state, this.ctx, W, H),
      this._eclipseMonsters = new EclipseMonstersComponent(this.eventBus, this.state, this.ctx, W, H),
      new OwlComponent(this.eventBus, this.state, this.ctx, W, H),
      this._mothron = new MothronComponent(this.eventBus, this.state, this.ctx, W, H),
      this._guyFawkes = new GuyFawkesComponent(this.eventBus, this.state, this.ctx, W, H),
      this._fox = new FoxComponent(this.eventBus, this.state, this.ctx, W, H, this._musicalNotes),
      new BunnyComponent(this.eventBus, this.state, this.ctx, W, H, this._musicalNotes),
      new GhostsComponent(this.eventBus, this.state, this.ctx, W, H),
      this._deer = new DeerComponent(this.eventBus, this.state, this.ctx, W, H, this._musicalNotes),
      new EasterEggsComponent(this.eventBus, this.state, this.ctx, W, H),

      this._hedgehog = new HedgehogComponent(this.eventBus, this.state, this.ctx, W, H, this._musicalNotes),
      new CampingTableComponent(this.eventBus, this.state, this.ctx, W, H),
      this._laptop = new LaptopComponent(this.eventBus, this.state, this.ctx, W, H),
      new FoldingStoolComponent(this.eventBus, this.state, this.ctx, W, H),
      new TelescopeComponent(this.eventBus, this.state, this.ctx, W, H),
      this._chicks = new ChicksComponent(this.eventBus, this.state, this.ctx, W, H),
      this._musicalNotes,
      new BonfireComponent(this.eventBus, this.state, this.ctx, W, H),

      new ScreenShakeRestoreComponent(this.eventBus, this.state, this.ctx, W, H, this._shake),
    ]);
    this._aurora = requireNonNull(this._components.getComponent(AuroraComponent.COMPONENT_NAME));
  }

  /**
   * initialise the scene.
   */
  initialise() {
    Events.registerAll(this.eventBus);
    this._setupCanvasEvents();
    this._refreshUI();
    this._components.initialise(this.state);

    this._loop = this._loop.bind(this);

    this.eventBus.subscribe(Subscriptions.onStatusTextChange('Scene', ({text}) => {
      this.statusEl.textContent = text;
    }));
    this.eventBus.subscribe(Subscriptions.onMainButtonsStateChange('Scene', ({enabled}) => {
      this._setButtonsDisabled(!enabled);
    }));
  }

  /**
   * start the rendering loop.
   */
  start() {
    if (this._active) {
      throw new Error("Scene is already active");
    }
    this._handle = requestAnimationFrame(this._loop);
    this._active = true;
  }

  /**
   * stop the rendering loop.
   */
  stop() {
    console.warn("Stopping scene.");
    this._active = false;
    if (this._handle !== undefined) {
      cancelAnimationFrame(this._handle);
      this._handle = undefined;
    }
  }

  /**
   * run one frame: clear, tick, draw all components, then request next frame.
   */
  _loop() {
    if (!this._active) return; // return as cancelAnimationFrame doesn't always work if stop() is called and new frame overwritten

    const {ctx, state} = this;
    ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    state.frame++;

    this._components.tick();
    this._components.draw();

    this._handle = requestAnimationFrame(this._loop);
  }

  /**
   * enable or disable the main action buttons.
   * @param {boolean} disabled
   */
  _setButtonsDisabled(disabled) {
    ['btn', 'btn-bunny', 'btn-wander'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = disabled;
    });
  }

  /**
   * refresh active-state classes and disabled flags on all buttons.
   */
  _refreshUI() {
    const {state} = this;
    ['spring', 'summer', 'autumn', 'winter'].forEach(s =>
        document.getElementById('btn-' + s).classList.toggle('btn-active', state.season === s));
    ['day', 'night'].forEach(s =>
        document.getElementById('btn-' + s).classList.toggle('btn-active', state.timeOfDay === s));
    ['clear', 'rain', 'fog', 'snow', 'storm', 'wind'].forEach(s =>
        document.getElementById('btn-' + s).classList.toggle('btn-active', state.weather === s));
    document.getElementById('btn-aurora').classList.toggle('btn-active', this._aurora.on);

    const snowBtn = document.getElementById('btn-snow');
    snowBtn.disabled = state.season !== 'winter';

    const auroraBtn = document.getElementById('btn-aurora');
    auroraBtn.disabled = state.season !== 'winter' || state.timeOfDay !== 'night' || state.stargazing;
    auroraBtn.classList.toggle('btn-active', this._aurora.on);

    const halloweenBtn = document.getElementById('btn-halloween');
    halloweenBtn.disabled = !(state.season === 'autumn' && state.timeOfDay === 'night');
    halloweenBtn.classList.toggle('btn-active', state.specialEvent === 'halloween');

    const christmasBtn = document.getElementById('btn-christmas');
      christmasBtn.disabled = state.season !== 'winter';
      christmasBtn.classList.toggle('btn-active', state.specialEvent === 'christmas');

    const bonfireBtn = document.getElementById('btn-bonfire');
    bonfireBtn.disabled = state.season !== 'autumn' || state.timeOfDay !== 'night';
    bonfireBtn.classList.toggle('btn-active', state.specialEvent === 'bonfire');

    MOON_PHASES.forEach((_, i) => {
      const btn = document.getElementById(`btn-phase-${i}`);
      btn.classList.toggle('btn-active', state.moonPhase === i);
      btn.disabled = state.timeOfDay !== 'night';
    });

    const guyBtn = document.getElementById('btn-guy-fawkes');
    guyBtn.disabled = state.specialEvent !== 'bonfire';

    const chicksBtn = document.getElementById('btn-chicks');
    chicksBtn.classList.toggle('btn-active', this._chicks.forced);

    const mothronBtn = document.getElementById('btn-mothron');
    mothronBtn.disabled = state.specialEvent !== 'eclipse';

    const wakeBtn = document.getElementById('btn-wake-fox');
    wakeBtn.textContent = !state.fox.asleep ? '😴 Sleep' : '👁 Wake';
    wakeBtn.classList.toggle('btn-active', !state.fox.asleep);

    const birthdayBtn = document.getElementById('btn-birthday');
    birthdayBtn.disabled = !!state.specialEvent && state.specialEvent !== 'birthday';
    birthdayBtn.classList.toggle('btn-active', state.specialEvent === 'birthday');

    const easterBtn = document.getElementById('btn-easter');
    easterBtn.disabled = !(state.season === 'spring' && state.timeOfDay === 'day');
    easterBtn.classList.toggle('btn-active', state.specialEvent === 'easter');

    const stargazeBtn = document.getElementById('btn-stargaze');
    if (stargazeBtn) {
      const canStargaze = state.timeOfDay === 'night'
          && (state.weather === 'clear' || state.weather === 'wind')
          && !this._aurora.on;
      stargazeBtn.disabled = !canStargaze;
      stargazeBtn.classList.toggle('btn-active', state.stargazing);
    }

    const eclipseBtn = document.getElementById('btn-eclipse');
    eclipseBtn.disabled = state.timeOfDay === 'night' || (state.specialEvent !== null && state.specialEvent !== 'eclipse');
    eclipseBtn.classList.toggle('btn-active', state.specialEvent === 'eclipse');
  }

  /**
   * wire up all canvas click and button events.
   */
  _setupCanvasEvents() {
    const {canvas, state} = this;
    const {W, H} = {W: CANVAS.WIDTH, H: CANVAS.HEIGHT};

    // click on fox: grumble; click on tree: scare birds
    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) * (W / rect.width);
      const cy = (e.clientY - rect.top) * (H / rect.height);

      let fx = state.fox.x;
      const wandering = ['wander_out', 'wander_sniff', 'wander_in'].includes(state.fox.phase);
      if (wandering) fx = state.fox.wanderX;

      if (Math.abs(cx - fx) < 46 && Math.abs(cy - (state.fox.y - 15)) < 32) {
        if (state.fox.phase === 'idle' && state.fox.poseBlend < 0.05 && state.bunny.phase === 'off') {
          this._fox.triggerGrumble();
        }
        return;
      }

      // click on a tree top to startle a bird
      state.trees.forEach(tr => {
        if (Math.abs(cx - tr.x) < tr.r && cy < H * 0.62 && cy > H * 0.62 - tr.h * 0.7) {
          this._birds.spawnStartledBird(tr);
        }
      });

      // click on laptop to cycle screen mode
      if (this._laptop.isEnabled() && this._laptop.containsPoint(cx, cy)) {
        this._laptop.cycleScreenMode();
        return;
      }
    });

    // main wake button
    document.getElementById('btn')?.addEventListener('click', () => {
      if (state.bunny.phase !== 'off' && state.bunny.phase !== 'done') return;
      state.fox.phase = 'standup';
      state.fox.phaseT = 0;
      this._setButtonsDisabled(true);
      this.statusEl.textContent = 'Waking up...';
    });

    // wander button
    document.getElementById('btn-wander')?.addEventListener('click', () => {
      if (state.bunny.phase !== 'off' && state.bunny.phase !== 'done') return;
      state.fox.phase = 'wander_out';
      state.fox.phaseT = 0;
      state.fox.poseBlend = 1;
      state.fox.wanderX = state.fox.x;
      this._setButtonsDisabled(true);
      this.statusEl.textContent = 'Off for a little wander...';
    });

    // visitor button (bunny)
    document.getElementById('btn-bunny')?.addEventListener('click', () => {
      // TODO move into BunnyComponent
      const {fox, bunny} = state;
      fox.phase = 'idle';
      fox.phaseT = 0;
      fox.poseBlend = 0;
      fox.stretchBlend = 0;
      fox.spinAngle = 0;
      fox.tailWag = 0;
      state.hearts = [];
      bunny.phase = 'hopping_in';
      bunny.phaseT = 0;
      bunny.x = -80;
      bunny.hop.arc = 0;
      state.startHop(-80, bunny.meetX, 135);
      this._setButtonsDisabled(true);
      this.statusEl.textContent = 'Something stirs in the trees...';
      this.eventBus.dispatch(Events.characterAction('Scene', 'bunny', 'enter'));
    });

    // season buttons
    ['spring', 'summer', 'autumn', 'winter'].forEach(s =>
        document.getElementById('btn-' + s)?.addEventListener('click', () => {
          const oldSeason = state.season;
          state.changeSeason(s);
          state.clearInvalidSpecialEvent();
          this.eventBus.dispatch(Events.seasonChange("Scene", oldSeason, state));
          this._refreshUI();
        }));

    // time of day buttons
    document.getElementById('btn-day')?.addEventListener('click', () => {
      state.setTOD('day');
      state.clearInvalidSpecialEvent();
      this._refreshUI();
    });
    document.getElementById('btn-night')?.addEventListener('click', () => {
      state.setTOD('night');
      state.clearInvalidSpecialEvent();
      this._refreshUI();
    });

    // weather buttons
    ['clear', 'rain', 'fog', 'snow', 'storm', 'wind'].forEach(w =>
        document.getElementById('btn-' + w)?.addEventListener('click', () => {
          if (w === 'snow' && state.season !== 'winter') return;
          const oldWeather = state.weather;
          state.weather = w;
          state.clearInvalidSpecialEvent();
          state.savePref();
          this._refreshUI();
          this.eventBus.dispatch(Events.weatherChange("Scene", oldWeather, state));
        }));

    // aurora toggle
    document.getElementById('btn-aurora')?.addEventListener('click', () => {
      if (state.season !== 'winter' || state.timeOfDay !== 'night' || state.stargazing) return;
      this._aurora.toggle();
      if (this._aurora.on && state.stargazing) {
        state.stargazing = false; // supress stargazing
        state.savePref();
      }
      this._refreshUI();
    });
    // stargazing toggle
    document.getElementById('btn-stargaze')?.addEventListener('click', () => {
      state.stargazing = !state.stargazing;
      state.savePref();
      if (state.stargazing && this._aurora.on) {
        this._aurora.on = false; // supress aurora
      }
      this._refreshUI();
    });

    // animal / reaction summon buttons
    document.getElementById('btn-deer')?.addEventListener('click', () => this._deer.summon());
    document.getElementById('btn-hog')?.addEventListener('click', () => this._hedgehog.summon());
    document.getElementById('btn-owl')?.addEventListener('click', function() {
      state.owlForced = !state.owlForced;
      this.classList.toggle('btn-active');
    });
    document.getElementById('btn-yawn')?.addEventListener('click', () => this._fox.triggerYawn());
    document.getElementById('btn-ear')?.addEventListener('click', () => this._fox.triggerEarTwitch());
    document.getElementById('btn-grumble')?.addEventListener('click', () => this._fox.triggerGrumble());
    document.getElementById('btn-chicks')?.addEventListener('click', e => {
      this._chicks.forced = !this._chicks.forced;
      e.target.classList.toggle('btn-active', this._chicks.forced);
    });

    document.getElementById('btn-halloween')?.addEventListener('click', () => {
      const old = state.specialEvent;
      state.specialEvent = state.specialEvent === 'halloween' ? null : 'halloween';
      state.savePref();
      this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
      this._refreshUI();
    });
    document.getElementById('btn-christmas')?.addEventListener('click', () => {
      const old = state.specialEvent;
      state.specialEvent = state.specialEvent === 'christmas' ? null : 'christmas';
      state.savePref();
      this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
      this._refreshUI();
    });
    document.getElementById('btn-bonfire')?.addEventListener('click', () => {
      const old = state.specialEvent;
      state.specialEvent = state.specialEvent === 'bonfire' ? null : 'bonfire';
      state.savePref();
      this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
      this._refreshUI();
    });
    document.getElementById('btn-birthday')?.addEventListener('click', () => {
      const old = state.specialEvent;
      state.specialEvent = state.specialEvent === 'birthday' ? null : 'birthday';
      state.savePref();
      this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
      this._refreshUI();
    });
    document.getElementById('btn-easter')?.addEventListener('click', () => {
      const old = state.specialEvent;
      state.specialEvent = state.specialEvent === 'easter' ? null : 'easter';
      state.savePref();
      this.eventBus.dispatch(Events.specialEventChange('Scene', old, state));
      this.eventBus.dispatch(Events.statusText('Scene', 'Happy Easter!'));
      this._refreshUI();
    });

    MOON_PHASES.forEach((_, i) => {
      document.getElementById(`btn-phase-${i}`)?.addEventListener('click', () => {
        const oldMoonPhase = state.moonPhase;
        state.moonPhase = i;
        state.savePref();
        this.eventBus.dispatch(Events.moonPhaseChange("Scene", oldMoonPhase, state));
        this._refreshUI();
      });
    });

    document.getElementById('btn-guy-fawkes').addEventListener('click', () => {
      this._guyFawkes.summon();
    });
    document.getElementById('btn-mothron').addEventListener('click', () => {
      this._mothron.summon();
    });

    document.getElementById('btn-eye').addEventListener('click', () => {
      state.fox.eyeTransitionT = 0;
    });

    document.getElementById('btn-wake-fox').addEventListener('click', () => {
      const {fox} = state;
      if (fox.phase === 'idle') {
        fox.asleep = !fox.asleep;
        this._refreshUI();
      }
    });

    document.getElementById('btn-eclipse')?.addEventListener('click', () => {
      const old = state.specialEvent;
      state.specialEvent = state.specialEvent === 'eclipse' ? null : 'eclipse';
      this.eventBus.dispatch(Events.seasonChange('Scene', old, state));
      state.savePref();
      if (state.specialEvent === 'eclipse') {
        this.eventBus.dispatch(Events.statusText('Scene', 'The sky darkens as the moon devours the sun...'));
      }
      this._refreshUI();
    });
  }
}
