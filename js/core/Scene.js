import {CANVAS, TREE_DEFS} from '../config.js';
import {SceneState} from './SceneState.js';
import {EventBus} from '../event/EventBus.js';
import {DrawWorld} from '../drawing/DrawWorld.js';
import {DrawParticles} from '../drawing/DrawParticles.js';
import {DrawBackgroundTrees, DrawForegroundTrees} from '../drawing/DrawTrees.js';
import {DrawWeather} from '../drawing/DrawWeather.js';
import {DrawLightning} from "../drawing/DrawLightning.js";
import {DrawFox} from '../animals/DrawFox.js';
import {DrawBunny} from '../animals/DrawBunny.js';
import {DrawAvians} from '../animals/DrawAvians.js';
import {DrawHedgehog} from '../animals/DrawHedgehog.js';
import {DrawDeer} from '../animals/DrawDeer.js';
import {Events} from "../event/Events.js";
import {DrawSpecialEvents} from "../drawing/DrawSpecialEvents.js";

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

    /** @type {Array<Component>} */
    this._components = [];

    // store the handle for the drawing loop
    /** @type {number | undefined} */
    this._handle = undefined;

    // store the event bus for this scene
    this.eventBus = new EventBus();

    // instantiate the core drawing components
    this._world = new DrawWorld(this.eventBus, this.ctx, W, H);
    this._specialEvents = new DrawSpecialEvents(this.eventBus, this.ctx, W, H);
    this._particles = new DrawParticles(this.eventBus, this.ctx, W, H);
    this._bgTrees = new DrawBackgroundTrees(this.eventBus, this.ctx);
    this._fgTrees = new DrawForegroundTrees(this.eventBus, this.ctx);
    this._lightning = new DrawLightning(this.eventBus, this.ctx, W, H);
    this._weather = new DrawWeather(this.eventBus, this.ctx, W, H);
    this._fox = new DrawFox(this.eventBus, this.ctx, W, H);
    this._bunny = new DrawBunny(this.eventBus, this.ctx, W, H);
    this._birds = new DrawAvians(this.eventBus, this.ctx, W, H, TREE_DEFS);
    this._deer = new DrawDeer(this.eventBus, this.ctx, W, H);
    this._hedgehog = new DrawHedgehog(this.eventBus, this.ctx, W, H);
  }

  /**
   * register a component.
   * @param {Component} component
   */
  register(component) {
    this._components.push(component);
  }

  /**
   * initialise the scene.
   */
  initialise() {
    Events.registerAll(this.eventBus);
    this._registerDefaultComponents();
    this._setupCanvasEvents();
    this._refreshUI();
    this._components.forEach(c => c.initialise(this.state));

    this._loop = this._loop.bind(this);
  }

  /**
   * register up all the built-in components in the correct draw order.
   */
  _registerDefaultComponents() {
    this.register(this._world);
    this.register(this._bgTrees);
    this.register(this._birds);
    this.register(this._fgTrees);
    this.register(this._specialEvents);
    this.register(this._lightning);
    this.register(this._deer);
    this.register(this._hedgehog);
    this.register(this._bunny);
    this.register(this._fox);
    this.register(this._particles);
    this.register(this._weather);
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

    this._components.forEach(c => c.tick(state, setStatus, enableButtons));
    this._components.forEach(c => c.draw(state));
    this._particles.drawCanopyLeaves(state);

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
      TREE_DEFS.slice(0, 8).forEach(tr => {
        if (Math.abs(cx - tr.x) < tr.r && cy < H * 0.62 && cy > H * 0.62 - tr.h * 0.7) {
          if (this._birdsActive()) {
            const {rnd, prob} = {rnd: n => Math.random() * n, prob: n => Math.random() < n};
            state.windStartledBirds.push({
              x: tr.x, y: H * 0.62 - tr.h * 0.5,
              vx: (2 + rnd(3)) * (prob(0.5) ? 1 : -1), vy: -(3 + rnd(2)),
              flapT: 0, flapSpeed: 0.18, scale: 0.8 + rnd(0.3), life: 0,
            });
          }
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
          this.eventBus.receive(Events.seasonChange("Scene", oldWeather, state));
        }));

    // aurora toggle
    document.getElementById('btn-aurora')?.addEventListener('click', () => {
      if (state.season !== 'winter' || state.timeOfDay !== 'night') return;
      state.auroraOn = !state.auroraOn;
      this._refreshUI();
    });

    // animal / reaction summon buttons
    document.getElementById('btn-deer')?.addEventListener('click', () => this._deer.summon(state));
    document.getElementById('btn-hog')?.addEventListener('click', () => this._hedgehog.summon(state));
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

    console.log(state.specialEvent, state.season, state.timeOfDay);
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

  /**
   * return true if daytime birds are currently active (used for click-startle).
   * @returns {boolean}
   */
  _birdsActive() {
    const {season, todBlend, weather} = this.state;
    if (season === 'winter') return false;
    if (todBlend <= 0.4) return false;
    if (weather === 'storm' || weather === 'wind') return false;
    return true;
  }
}
