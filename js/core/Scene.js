import {CANVAS, TREE_DEFS} from '@/config';
import {SceneState} from './SceneState.js';
import {EventBus} from '@/event/EventBus';
import {BackgroundTreesComponent, ForegroundTreesComponent} from '@/components/TreeComponent';
import {LightningComponent} from "@/components/weather/LightningComponent";
import {FoxComponent} from '@/components/animals/FoxComponent';
import {BunnyComponent} from '@/components/animals/BunnyComponent';
import {HedgehogComponent} from '@/components/animals/HedgehogComponent';
import {DeerComponent} from '@/components/animals/DeerComponent';
import {Events} from "@/event/Events";
import {GhostsComponent} from "@/components/halloween/GhostsComponent";
import {ComponentGroup} from "./ComponentGroup";
import {TimeOfDayComponent} from "@/components/TimeOfDayComponent";
import {GroundBackdropComponents, SkyBackdropComponents} from "@/components/backdrop/components";
import {GravestoneComponent} from "@/components/halloween/GravestoneComponent";
import {ScarecrowComponent} from "@/components/halloween/ScarecrowComponent";
import {SnowmenComponent} from "@/components/christmas/SnowmenComponent";
import {PresentsComponent} from "@/components/christmas/PresentsComponent";
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
    // give state a reference to tree defs so canopy leaves can use it
    this.state.trees = TREE_DEFS;

    // store the handle for the drawing loop
    /** @type {number | undefined} */
    this._handle = undefined;

    // store the event bus for this scene
    this.eventBus = new EventBus();

    /** @type {ComponentGroup} */
    this._components = new ComponentGroup(this.eventBus, [
      new TimeOfDayComponent(this.eventBus),
      new SkyBackdropComponents(this.eventBus, this.ctx, W, H),
      new GroundBackdropComponents(this.eventBus, this.ctx, W, H),

      new BackgroundTreesComponent(this.eventBus, this.ctx),

      new SmokeComponent(this.eventBus, this.ctx, W, H),

      new ForegroundTreesComponent(this.eventBus, this.ctx),

      new GravestoneComponent(this.eventBus, this.ctx, W, H),
      new ScarecrowComponent(this.eventBus, this.ctx, W, H),

      new SnowmenComponent(this.eventBus, this.ctx, W, H),
      new PresentsComponent(this.eventBus, this.ctx, W, H),

      new FirefliesComponent(this.eventBus, this.ctx, W, H),
      new ButterfliesComponent(this.eventBus, this.ctx, W, H),
      new HeartsComponent(this.eventBus, this.ctx, W, H),

      new SeasonTransitionLeavesComponent(this.eventBus, this.ctx, W, H),
      new AutumnBlowingLeavesComponent(this.eventBus, this.ctx, W, H),

      new LightningComponent(this.eventBus, this.ctx, W, H),
      new RainComponent(this.eventBus, this.ctx, W, H),
      new SnowflakesComponent(this.eventBus, this.ctx, W, H),
      new WindComponent(this.eventBus, this.ctx, W, H),
      new FogOverlayComponent(this.eventBus, this.ctx, W, H),

      new BatsComponent(this.eventBus, this.ctx, W, H),
      this._birds = new BirdsComponent(this.eventBus, this.ctx, W, H),
      new OwlComponent(this.eventBus, this.ctx, W, H),
      new FoxComponent(this.eventBus, this.ctx, W, H),
      new BunnyComponent(this.eventBus, this.ctx, W, H),
      new GhostsComponent(this.eventBus, this.ctx, W, H),
      this._deer = new DeerComponent(this.eventBus, this.ctx, W, H),
      this._hedgehog = new HedgehogComponent(this.eventBus, this.ctx, W, H),
    ]);
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
  }

  /**
   * start the rendering loop.
   */
  start() {
    if (this._handle === undefined) {
      this._handle = requestAnimationFrame(this._loop);
    }
  }

  /**
   * stop the rendering loop.
   */
  stop() {
    if (this._handle !== undefined) {
      cancelAnimationFrame(this._handle);
      this._handle = undefined;
    }
  }

  /**
   * run one frame: clear, tick, draw all components, then request next frame.
   */
  _loop() {
    const {ctx, state} = this;
    ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    state.frame++;

    // tick entity states
    const setStatus = msg => {
      this.statusEl.textContent = msg;
    };
    const enableButtons = () => {
      this._setButtonsDisabled(false);
    };

    this._components.tick(state, setStatus, enableButtons);
    this._components.draw(state);

    requestAnimationFrame(this._loop);
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
        document.getElementById('btn-' + s)?.classList.toggle('btn-active', state.season === s));
    ['day', 'night'].forEach(s =>
        document.getElementById('btn-' + s)?.classList.toggle('btn-active', state.timeOfDay === s));
    ['clear', 'rain', 'fog', 'snow', 'storm', 'wind'].forEach(s =>
        document.getElementById('btn-' + s)?.classList.toggle('btn-active', state.weather === s));
    document.getElementById('btn-aurora')?.classList.toggle('btn-active', state.auroraOn);

    const snowBtn = document.getElementById('btn-snow');
    const auroraBtn = document.getElementById('btn-aurora');
    if (snowBtn) snowBtn.disabled = state.season !== 'winter';
    if (auroraBtn) auroraBtn.disabled = state.season !== 'winter' || state.timeOfDay !== 'night';

    const halloweenBtn = document.getElementById('btn-halloween');
    halloweenBtn.disabled = !(state.season === 'autumn' && state.timeOfDay === 'night');
    halloweenBtn.classList.toggle('btn-active', state.specialEvent === 'halloween');

    const christmasBtn = document.getElementById('btn-christmas');
      christmasBtn.disabled = state.season !== 'winter';
      christmasBtn.classList.toggle('btn-active', state.specialEvent === 'christmas');
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
          this._triggerGrumble();
        }
        return;
      }

      // click on a tree top to startle a bird
      TREE_DEFS.forEach(tr => {
        if (Math.abs(cx - tr.x) < tr.r && cy < H * 0.62 && cy > H * 0.62 - tr.h * 0.7) {
          this._birds.spawnStartledBird(state, tr);
        }
      });
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
    });

    // season buttons
    ['spring', 'summer', 'autumn', 'winter'].forEach(s =>
        document.getElementById('btn-' + s)?.addEventListener('click', () => {
          const oldSeason = state.season;
          state.changeSeason(s);
          this._clearInvalidSpecialEvent();
          this._refreshUI();
          this.eventBus.receive(Events.seasonChange("Scene", oldSeason, state));
        }));

    // time of day buttons
    document.getElementById('btn-day')?.addEventListener('click', () => {
      state.setTOD('day');
      this._clearInvalidSpecialEvent();
      this._refreshUI();
    });
    document.getElementById('btn-night')?.addEventListener('click', () => {
      state.setTOD('night');
      this._clearInvalidSpecialEvent();
      this._refreshUI();
    });

    // weather buttons
    ['clear', 'rain', 'fog', 'snow', 'storm', 'wind'].forEach(w =>
        document.getElementById('btn-' + w)?.addEventListener('click', () => {
          if (w === 'snow' && state.season !== 'winter') return;
          const oldWeather = state.weather;
          state.weather = w;
          this._clearInvalidSpecialEvent();
          state.savePref();
          this._refreshUI();
          this.eventBus.receive(Events.weatherChange("Scene", oldWeather, state));
        }));

    // aurora toggle
    document.getElementById('btn-aurora')?.addEventListener('click', () => {
      if (state.season !== 'winter' || state.timeOfDay !== 'night') return;
      state.auroraOn = !state.auroraOn;
      this._refreshUI();
    });

    // animal / reaction summon buttons
    document.getElementById('btn-deer')?.addEventListener('click', () => this._deer.summon());
    document.getElementById('btn-hog')?.addEventListener('click', () => this._hedgehog.summon());
    document.getElementById('btn-owl')?.addEventListener('click', function() {
      state.owlForced = !state.owlForced;
      this.classList.toggle('btn-active');
    });
    document.getElementById('btn-yawn')?.addEventListener('click', () => this._triggerYawn());
    document.getElementById('btn-ear')?.addEventListener('click', () => this._triggerEarTwitch());
    document.getElementById('btn-grumble')?.addEventListener('click', () => this._triggerGrumble());

    document.getElementById('btn-halloween')?.addEventListener('click', () => {
      state.specialEvent = state.specialEvent === 'halloween' ? null : 'halloween';
      state.savePref();
      this._refreshUI();
    });
    document.getElementById('btn-christmas')?.addEventListener('click', () => {
      state.specialEvent = state.specialEvent === 'christmas' ? null : 'christmas';
      state.savePref();
      this._refreshUI();
    });
  }

  /**
   * clears out specialEvent if now invalid
   */
  _clearInvalidSpecialEvent() {
    const {state} = this;

    if (state.specialEvent === 'halloween' &&
        !(state.season === 'autumn' && state.timeOfDay === 'night')) {
      state.specialEvent = null;
    }
    if (state.specialEvent === 'christmas' && state.season !== 'winter') {
      state.specialEvent = null;
    }
  }

  /**
   * trigger the fox grumble animation.
   */
  _triggerGrumble() {
    const {fox} = this.state;
    fox.grumbleT = 0;
    fox.earTwitchT = 0;
    fox.earTwitchSide = 1;
    this.statusEl.textContent = 'The fox grumbles sleepily...';
  }

  /**
   * trigger the fox yawn animation if idle.
   */
  _triggerYawn() {
    const {fox} = this.state;
    if (fox.phase === 'idle' && fox.poseBlend < 0.05) {
      fox.yawnT = 0;
      this.statusEl.textContent = 'The fox has a big yawn...';
    }
  }

  /**
   * trigger the fox ear-twitch animation.
   */
  _triggerEarTwitch() {
    const {fox} = this.state;
    fox.earTwitchT = 0;
    fox.earTwitchSide = Math.random() < 0.5 ? 1 : -1;
    this.statusEl.textContent = "The fox's ear twitches...";
  }
}
