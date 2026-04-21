import {rnd, rndf} from '../utils.js';
import {Component} from "../core/Component.js";
import {Events} from "../event/Events.js";

const GRAVESTONES = [
  {x: 160, lean: -0.08}, {x: 230, lean: 0.05},
  {x: 290, lean: -0.04}, {x: 460, lean: 0.07},
  {x: 530, lean: -0.06},
];
const SCARECROWS = [{x: 200}, {x: 490}];
const SNOWMEN = [{x: 180}, {x: 420}, {x: 560}];
const PRESENTS = [
  {x: 155, w: 22, h: 16, col: '#cc2020', ribbon: '#ffdd00'},
  {x: 185, w: 16, h: 12, col: '#2060cc', ribbon: '#ff80ff'},
  {x: 430, w: 20, h: 14, col: '#20aa40', ribbon: '#ff4040'},
  {x: 455, w: 14, h: 18, col: '#aa20cc', ribbon: '#ffffaa'},
  {x: 575, w: 18, h: 13, col: '#cc6020', ribbon: '#aaffaa'},
];

/**
 * DrawSpecialEvents draws halloween and christmas scene overlays:
 * ghosts, gravestones, scarecrows (halloween) and
 * snowmen, presents (christmas).
 */
export class DrawSpecialEvents extends Component {
  /**
   * @param {EventBus} eventBus
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} W
   * @param {number} H
   */
  constructor(eventBus, ctx, W, H) {
    super(eventBus);
    this.ctx = ctx;
    this.W = W;
    this.H = H;

    /** @type {Array<object>} */
    this._ghosts = [];
  }

  initialise(state) {
    this.eventBus.subscribe(Events.weatherChangeSubscription("DrawSpecialEvents", this._onWeatherChange.bind(this)));

    this._generateGhosts(state);
  }

  /**
   * @param {SceneState} state
   */
  draw(state) {
    if (!state.specialEvent) return;
    if (state.specialEvent === 'halloween') this._drawHalloween(state);
    if (state.specialEvent === 'christmas') this._drawChristmas(state);
  }

  /**
   * @param {ValueChange<string>} update
   */
  _onWeatherChange(update) {
    this._generateGhosts(update.state);
  }

  /**
   * populate ghost array
   * @param {SceneState} state
   */
  _generateGhosts(state) {
    const {H} = this;
    const length = state.weather === 'storm' ? 9 : 5;
    this._ghosts = Array.from({length}, (_, i) => ({
      x: 80 + i * 130 + rndf(30),
      y: H * 0.15 + rnd(H * 0.25),
      vx: (0.3 + rnd(0.3)) * (i % 2 === 0 ? 1 : -1),
      phase: rnd(Math.PI * 2),
    }));
  }

  /**
   * draw all halloween decorations: pumpkin moon, ghosts, gravestones, scarecrows.
   * @param {SceneState} state
   */
  _drawHalloween(state) {
    const {frame} = state;
    this._drawGhosts(state);
    this._drawGravestones(frame);
    this._drawScarecrows(frame);
  }

  /**
   * draw and advance drifting ghosts in the background sky.
   * @param {SceneState} state
   */
  _drawGhosts(state) {
    const {ctx, W, H} = this;
    const {frame} = state;
    this._ghosts.forEach(g => {
      g.x += g.vx;
      if (g.x > W + 50) g.x = -50;
      if (g.x < -50) g.x = W + 50;
      const bob = Math.sin(frame * 0.025 + g.phase) * 8;
      const y = g.y + bob;

      ctx.save();
      ctx.globalAlpha = 0.55;
      // body
      ctx.fillStyle = 'rgba(220,230,255,0.9)';
      ctx.beginPath();
      ctx.arc(g.x, y - 12, 14, Math.PI, 0);
      ctx.lineTo(g.x + 14, y + 8);
      // wavy bottom
      for (let wx = 3; wx >= -3; wx--) {
        ctx.quadraticCurveTo(
            g.x + wx * 5 + 2, y + 14,
            g.x + wx * 4.5, y + 8
        );
      }
      ctx.lineTo(g.x - 14, y + 8);
      ctx.closePath();
      ctx.fill();
      // eyes
      ctx.fillStyle = 'rgba(30,10,60,0.8)';
      ctx.beginPath();
      ctx.ellipse(g.x - 5, y - 12, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(g.x + 5, y - 12, 3, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /**
   * draw mossy gravestones along the ground.
   * @param {number} frame
   */
  _drawGravestones(frame) {
    const {ctx, H} = this;
    const gy = H * 0.62;
    GRAVESTONES.forEach(g => {
      ctx.save();
      ctx.translate(g.x, gy);
      ctx.rotate(g.lean);
      // stone
      ctx.fillStyle = '#4a4a5a';
      ctx.beginPath();
      ctx.roundRect(-10, -36, 20, 36, [8, 8, 2, 2]);
      ctx.fill();
      // moss
      ctx.fillStyle = '#3a5a3a';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(0, -36, 10, 5, 0, Math.PI, 0);
      ctx.fill();
      ctx.globalAlpha = 1;
      // RIP text
      ctx.fillStyle = '#8a8aaa';
      ctx.font = 'bold 7px serif';
      ctx.textAlign = 'center';
      ctx.fillText('RIP', 0, -20);
      ctx.restore();
    });
  }

  /**
   * draw scarecrows with gently swaying arms.
   * @param {number} frame
   */
  _drawScarecrows(frame) {
    const {ctx, H} = this;
    SCARECROWS.forEach((sc, i) => {
      const sway = Math.sin(frame * 0.02 + i) * 0.06;
      const y = H * 0.62;
      ctx.save();
      ctx.translate(sc.x, y);
      ctx.rotate(sway);
      // post
      ctx.strokeStyle = '#5a3a10';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -55);
      ctx.stroke();
      // crossbar
      ctx.beginPath();
      ctx.moveTo(-22, -38);
      ctx.lineTo(22, -38);
      ctx.stroke();
      // body - ragged coat
      ctx.fillStyle = '#5a3a18';
      ctx.beginPath();
      ctx.moveTo(-10, -48);
      ctx.lineTo(10, -48);
      ctx.lineTo(13, -22);
      ctx.lineTo(-13, -22);
      ctx.closePath();
      ctx.fill();
      // sleeves
      ctx.strokeStyle = '#5a3a18';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-10, -40);
      ctx.lineTo(-22, -36);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, -40);
      ctx.lineTo(22, -36);
      ctx.stroke();
      // head
      ctx.fillStyle = '#e8a020';
      ctx.beginPath();
      ctx.arc(0, -56, 10, 0, Math.PI * 2);
      ctx.fill();
      // pumpkin face
      ctx.fillStyle = '#1a0800';
      ctx.beginPath();
      ctx.ellipse(-4, -57, 2, 3, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(4, -57, 2, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5, -52);
      ctx.lineTo(-2, -50);
      ctx.lineTo(1, -52);
      ctx.lineTo(4, -50);
      ctx.lineTo(5, -52);
      ctx.stroke();
      // hat
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-10, -72, 20, 6);
      ctx.fillRect(-7, -84, 14, 14);
      ctx.restore();
    });
  }

  /**
   * draw all christmas decorations: snowmen and presents.
   * @param {SceneState} state
   */
  _drawChristmas(state) {
    const {frame} = state;
    this._drawSnowmen(frame);
    this._drawPresents(frame);
  }

  /**
   * draw snowmen with carrot noses and scarves.
   * @param {number} frame
   */
  _drawSnowmen(frame) {
    const {ctx, H} = this;
    SNOWMEN.forEach((sm, i) => {
      const y = H * 0.62;
      ctx.save();
      ctx.translate(sm.x, y);
      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.ellipse(0, 2, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // lower body
      ctx.fillStyle = '#eef4ff';
      ctx.beginPath();
      ctx.arc(0, -16, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c8d8e8';
      ctx.lineWidth = 1;
      ctx.stroke();
      // upper body
      ctx.fillStyle = '#f4f8ff';
      ctx.beginPath();
      ctx.arc(0, -38, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c8d8e8';
      ctx.stroke();
      // head
      ctx.fillStyle = '#f8faff';
      ctx.beginPath();
      ctx.arc(0, -55, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // eyes
      ctx.fillStyle = '#1a1a2a';
      ctx.beginPath();
      ctx.arc(-3, -57, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, -57, 1.2, 0, Math.PI * 2);
      ctx.fill();
      // carrot nose
      ctx.fillStyle = '#e06010';
      ctx.beginPath();
      ctx.moveTo(0, -55);
      ctx.lineTo(9, -54);
      ctx.lineTo(0, -53);
      ctx.closePath();
      ctx.fill();
      // smile
      [-3, -1, 1, 3].forEach(dx => {
        ctx.fillStyle = '#2a2a3a';
        ctx.beginPath();
        ctx.arc(dx, -51, 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
      // scarf
      ctx.strokeStyle = ['#cc2020', '#2060cc', '#20aa40'][i % 3];
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -47, 11, -0.4, Math.PI + 0.4);
      ctx.stroke();
      // scarf tail
      ctx.beginPath();
      ctx.moveTo(-11, -47);
      ctx.lineTo(-14, -43);
      ctx.lineTo(-12, -39);
      ctx.stroke();
      // buttons
      ctx.fillStyle = '#3a3a4a';
      [-44, -38, -32].forEach(by => {
        ctx.beginPath();
        ctx.arc(0, by, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      // stick arms
      ctx.strokeStyle = '#6a4020';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-11, -40);
      ctx.lineTo(-22, -48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-22, -48);
      ctx.lineTo(-24, -44);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(11, -40);
      ctx.lineTo(22, -48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(22, -48);
      ctx.lineTo(24, -44);
      ctx.stroke();
      // hat
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(-9, -70, 18, 5);
      ctx.fillRect(-6, -80, 12, 12);
      // hat band
      ctx.fillStyle = ['#cc2020', '#2060cc', '#20aa40'][i % 3];
      ctx.fillRect(-6, -69, 12, 3);
      ctx.restore();
    });
  }

  /**
   * draw wrapped presents on the ground with bows.
   * @param {number} frame
   */
  _drawPresents(frame) {
    const {ctx, H} = this;
    PRESENTS.forEach((pr, i) => {
      const y = H * 0.62;
      const bob = Math.sin(frame * 0.03 + i * 0.8) * 0.5;
      ctx.save();
      ctx.translate(pr.x, y + bob);
      // box
      ctx.fillStyle = pr.col;
      ctx.fillRect(-pr.w / 2, -pr.h, pr.w, pr.h);
      // shading on right side
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(pr.w / 2 - 5, -pr.h, 5, pr.h);
      // ribbon vertical
      ctx.fillStyle = pr.ribbon;
      ctx.fillRect(-2, -pr.h, 4, pr.h);
      // ribbon horizontal
      ctx.fillRect(-pr.w / 2, -pr.h / 2 - 2, pr.w, 4);
      // bow loops
      ctx.fillStyle = pr.ribbon;
      ctx.beginPath();
      ctx.ellipse(-6, -pr.h - 4, 7, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(6, -pr.h - 4, 7, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(0, -pr.h - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}