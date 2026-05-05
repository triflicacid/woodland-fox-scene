import {DrawComponent} from '@/core/DrawComponent';
import {clamp} from '@/utils';

/**
 * a laptop on the camping table showing astronomy content
 */
export class LaptopComponent extends DrawComponent {
  // offset from fox
  offsetX = 210;
  offsetY = 30;
  scale = 1.1;
  // half-width of the laptop
  laptopW = 28;
  // screen height of the laptop
  laptopH = 26;
  // keyboard height
  laptopKH = 6;

  // contan current mode of the laptop (drives screen content)
  modes = ['off', 'starfield', 'app', 'telescope_feed', 'orrery', 'spectrograph', 'light_curve', 'chat', 'research_paper'];
  mode = 'spectrograph';

  static COMPONENT_NAME = 'LaptopComponent';

  getName() {
    return LaptopComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.scene.stargazing;
  }

  cycleScreenMode() {
    const idx = this.modes.indexOf(this.mode);
    this.mode = this.modes[(idx + 1) % this.modes.length];
  }

  draw() {
    const {ctx} = this;
    const {fox} = this.scene;
    const x = fox.x + this.offsetX;
    const y = fox.y + this.offsetY;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(this.scale, this.scale);
    this._drawLaptop();
    ctx.restore();

    // screen glow on surroundings
    if (this.scene.timeOfDay !== 'day') {
      this._drawScreenGlow(x, y);
    }
  }

  _drawLaptop() {
    const {ctx} = this;
    const lw = this.laptopW;
    const kh = this.laptopKH;
    const sh = this.laptopH;

    // top face of keyboard base - trapezoid giving depth illusion
    const baseGrad = ctx.createLinearGradient(0, -kh, 0, 0);
    baseGrad.addColorStop(0, '#686e78');
    baseGrad.addColorStop(1, '#505860');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.moveTo(-lw, 0);     // bottom left
    ctx.lineTo(lw, 0);     // bottom right
    ctx.lineTo(lw - 3, -kh);   // top right (slightly narrower - perspective)
    ctx.lineTo(-lw + 3, -kh);   // top left
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#404850';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // keyboard keys (rows of tiny rectangles on the top face)
    ctx.fillStyle = '#3a4050';
    const keyRows = [
      {y: -kh + 1.5, count: 10, w: 3.8, h: 1.4},
      {y: -kh + 3.2, count: 9, w: 4.0, h: 1.4},
      {y: -kh + 5.0, count: 8, w: 4.2, h: 1.4},
    ];
    keyRows.forEach(row => {
      const totalW = row.count * row.w + (row.count - 1) * 0.6;
      const startX = -totalW / 2;
      for (let k = 0; k < row.count; k++) {
        const kx = startX + k * (row.w + 0.6);
        // skew keys to match trapezoid perspective
        const skew = (row.y / -kh) * 2;
        ctx.beginPath();
        ctx.rect(kx + skew, row.y, row.w, row.h);
        ctx.fill();
      }
    });

    // trackpad
    ctx.fillStyle = '#424850';
    ctx.strokeStyle = '#363c44';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.roundRect(-6, -kh + 1.2, 12, 3.5, 0.5);
    ctx.fill();
    ctx.stroke();

    // front edge of base
    ctx.fillStyle = '#404850';
    ctx.beginPath();
    ctx.moveTo(-lw, 0);
    ctx.lineTo(lw, 0);
    ctx.lineTo(lw, 2);
    ctx.lineTo(-lw, 2);
    ctx.closePath();
    ctx.fill();

    // hinge
    ctx.fillStyle = '#303840';
    ctx.beginPath();
    ctx.roundRect(-lw + 3, -kh - 1, (lw - 3) * 2, 2, 1);
    ctx.fill();

    // screen
    const tilt = 3;
    const screenY = -kh;

    // screen back
    const backGrad = ctx.createLinearGradient(-lw, screenY - sh, lw, screenY);
    backGrad.addColorStop(0, '#383e48');
    backGrad.addColorStop(1, '#484e58');
    ctx.fillStyle = backGrad;
    ctx.beginPath();
    ctx.moveTo(-lw + 3, screenY);
    ctx.lineTo(lw - 3, screenY);
    ctx.lineTo(lw - 3 + tilt, screenY - sh);
    ctx.lineTo(-lw + 3 + tilt, screenY - sh);
    ctx.closePath();
    ctx.fill();

    // bezel
    const bz = 2;
    ctx.fillStyle = '#181c22';
    ctx.beginPath();
    ctx.moveTo(-lw + 3 + bz, screenY - bz);
    ctx.lineTo(lw - 3 - bz, screenY - bz);
    ctx.lineTo(lw - 3 - bz + tilt, screenY - sh + bz);
    ctx.lineTo(-lw + 3 + bz + tilt, screenY - sh + bz);
    ctx.closePath();
    ctx.fill();

    this._drawScreen(lw, sh, kh, bz, tilt, screenY);

    // webcam dot
    ctx.fillStyle = '#1a1e24';
    ctx.beginPath();
    ctx.arc(tilt * 0.5, screenY - sh + 1.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#204020';
    ctx.beginPath();
    ctx.arc(tilt * 0.5, screenY - sh + 1.5, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * draw the screen content clipped and skewed to the parallelogram.
   * @param {number} lw - laptop half-width
   * @param {number} sh - screen height
   * @param {number} kh - keyboard height
   * @param {number} bz - bezel thickness
   * @param {number} tilt - horizontal lean of screen top in px
   * @param {number} screenY - y position of screen bottom edge
   */
  _drawScreen(lw, sh, kh, bz, tilt, screenY) {
    const {ctx} = this;

    // content parallelogram corners
    // bottom-left, bottom-right, top-right, top-left
    const cx1 = -lw + 3 + bz + 1, cy1 = screenY - bz - 1;
    const cx2 = lw - 3 - bz - 1, cy2 = screenY - bz - 1;
    const cx3 = lw - 3 - bz - 1 + tilt, cy3 = screenY - sh + bz + 1;
    const cx4 = -lw + 3 + bz + 1 + tilt, cy4 = screenY - sh + bz + 1;

    const cw = cx2 - cx1; // content width
    const ch = cy1 - cy4; // content height (positive)

    ctx.save();

    // clip to parallelogram
    ctx.beginPath();
    ctx.moveTo(cx1, cy1);
    ctx.lineTo(cx2, cy2);
    ctx.lineTo(cx3, cy3);
    ctx.lineTo(cx4, cy4);
    ctx.closePath();
    ctx.clip();

    // move origin to top-left corner of parallelogram, then apply
    // the exact horizontal shear so content drawn in (0,0)-(cw,ch)
    // maps onto the leaning screen
    ctx.translate(cx4, cy4);
    ctx.transform(1, 0, -(tilt / ch), 1, 0, 0);

    if (this.mode !== 'off') {
      switch (this.mode) {
        case 'starfield':
          this._drawStarfieldScreen(0, 0, cw, ch);
          break;
        case 'app':
          this._drawAppScreen(0, 0, cw, ch);
          break;
        case 'telescope_feed':
          this._drawTelescopeFeedScreen(0, 0, cw, ch);
          break;
        case 'orrery':
          this._drawOrreryScreen(0, 0, cw, ch);
          break;
        case 'spectrograph':
          this._drawSpectrographScreen(0, 0, cw, ch);
          break;
        case 'light_curve':
          this._drawLightCurveScreen(0, 0, cw, ch);
          break;
        case 'chat':
          this._drawChatScreen(0, 0, cw, ch);
          break;
        case 'research_paper':
          this._drawResearchPaperScreen(0, 0, cw, ch);
          break;
      }
    }

    // glare - drawn in transformed space so it aligns with screen
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 0, cw * 0.4, ch);

    ctx.restore();
  }

  /**
   * draw a deep space star map with grid and constellation lines.
   * @param {number} ox - content origin x
   * @param {number} oy - content origin y
   * @param {number} sw - content width
   * @param {number} sh - content height
   */
  _drawStarfieldScreen(ox, oy, sw, sh) {
    const {ctx} = this;

    ctx.fillStyle = '#060a14';
    ctx.fillRect(ox, oy, sw, sh);

    // ra/dec grid lines
    ctx.strokeStyle = 'rgba(40,60,100,0.5)';
    ctx.lineWidth = 0.4;
    for (let gx = ox; gx < ox + sw; gx += 8) {
      ctx.beginPath();
      ctx.moveTo(gx, oy);
      ctx.lineTo(gx, oy + sh);
      ctx.stroke();
    }
    for (let gy = oy; gy < oy + sh; gy += 8) {
      ctx.beginPath();
      ctx.moveTo(ox, gy);
      ctx.lineTo(ox + sw, gy);
      ctx.stroke();
    }

    const cx = ox + sw * 0.5;
    const cy = oy + sh * 0.5;
    const stars = [
      [-18, -12, 1.5], [-5, -6, 1.0], [8, -14, 1.8], [14, -4, 1.2],
      [-12, -2, 0.8], [2, -10, 1.0], [16, -12, 0.9], [-8, -16, 1.3],
      [10, -2, 0.7], [-18, -6, 1.1], [4, 4, 0.8], [-4, 6, 0.9],
    ];
    stars.forEach(([sx, sy, sr]) => {
      ctx.fillStyle = '#e8eeff';
      ctx.shadowBlur = 2;
      ctx.shadowColor = '#c0ccff';
      ctx.beginPath();
      ctx.arc(cx + sx, cy + sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(100,140,220,0.55)';
    ctx.lineWidth = 0.5;
    [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 5]].forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(cx + stars[a][0], cy + stars[a][1]);
      ctx.lineTo(cx + stars[b][0], cy + stars[b][1]);
      ctx.stroke();
    });
  }

  /**
   * draw a stylised starmap pro astronomy app ui.
   * @param {number} ox
   * @param {number} oy
   * @param {number} sw
   * @param {number} sh
   */
  _drawAppScreen(ox, oy, sw, sh) {
    const {ctx} = this;
    const cx = ox + sw * 0.5;
    const cy = oy + sh * 0.52;
    const cr = sh * 0.32;

    ctx.fillStyle = '#080c18';
    ctx.fillRect(ox, oy, sw, sh);

    // top bar
    ctx.fillStyle = '#101828';
    ctx.fillRect(ox, oy, sw, 5);
    ctx.fillStyle = '#4080ff';
    ctx.font = '3px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('STARMAP PRO', ox + 2, oy + 3.5);

    // sky circle
    ctx.fillStyle = '#0a1020';
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2040a0';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(40,80,160,0.3)';
    ctx.lineWidth = 0.4;
    [0.33, 0.66].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, cr * r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(cx - cr, cy);
    ctx.lineTo(cx + cr, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - cr);
    ctx.lineTo(cx, cy + cr);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, cr - 1, 0, Math.PI * 2);
    ctx.clip();
    const appStars = [
      [cx - 8, cy - 6, 1.4, '#fffde8'],
      [cx + 5, cy - 10, 1.0, '#e8f0ff'],
      [cx - 3, cy + 4, 0.8, '#fff0e0'],
      [cx + 9, cy + 2, 1.2, '#e8eeff'],
      [cx - 12, cy + 1, 0.7, '#fffde8'],
      [cx + 2, cy - 4, 0.9, '#e8f0ff'],
    ];
    appStars.forEach(([sx, sy, sr, col]) => {
      ctx.fillStyle = col;
      ctx.shadowBlur = 2;
      ctx.shadowColor = col;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(80,140,255,0.5)';
    ctx.lineWidth = 0.5;
    [[0, 1], [1, 2], [2, 3], [3, 4]].forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(appStars[a][0], appStars[a][1]);
      ctx.lineTo(appStars[b][0], appStars[b][1]);
      ctx.stroke();
    });
    ctx.strokeStyle = 'rgba(80,200,80,0.8)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(appStars[0][0], appStars[0][1], 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // bottom bar
    ctx.fillStyle = '#101828';
    ctx.fillRect(ox, oy + sh - 5, sw, 5);
    ctx.fillStyle = '#6090ff';
    ctx.font = '2.5px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('RA 05h 34m  DEC +22°', ox + 2, oy + sh - 1.5);
  }

  /**
   * draw a circular telescope eyepiece view with a planet or star cluster.
   * @param {number} ox
   * @param {number} oy
   * @param {number} sw
   * @param {number} sh
   */
  _drawTelescopeFeedScreen(ox, oy, sw, sh) {
    const {ctx} = this;
    const cx = ox + sw * 0.5;
    const cy = oy + sh * 0.5;
    const cr = Math.min(sw, sh) * 0.42;

    // black background
    ctx.fillStyle = '#000';
    ctx.fillRect(ox, oy, sw, sh);

    // vignette outside eyepiece circle
    const vig = ctx.createRadialGradient(cx, cy, cr * 0.7, cx, cy, cr * 1.2);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = vig;
    ctx.fillRect(ox, oy, sw, sh);

    // clip to eyepiece circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.clip();

    // deep space background
    ctx.fillStyle = '#02040a';
    ctx.fillRect(ox, oy, sw, sh);

    // background stars
    const bgStars = [
      [-cr * 0.7, -cr * 0.5, 0.5], [cr * 0.6, -cr * 0.3, 0.6], [-cr * 0.3, cr * 0.6, 0.5],
      [cr * 0.4, cr * 0.5, 0.4], [-cr * 0.1, -cr * 0.7, 0.6], [cr * 0.7, cr * 0.2, 0.4],
      [-cr * 0.6, cr * 0.1, 0.5], [cr * 0.2, -cr * 0.6, 0.5], [-cr * 0.5, -cr * 0.2, 0.4],
    ];
    bgStars.forEach(([sx, sy, sr]) => {
      ctx.fillStyle = '#c8d0e8';
      ctx.beginPath();
      ctx.arc(cx + sx, cy + sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });

    // jupiter - banded planet as target
    const pr = cr * 0.22;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, pr, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#e8c89a';
    ctx.fillRect(cx - pr, cy - pr, pr * 2, pr * 2);
    const bands = ['#c8a878', '#e8d0a8', '#b89060', '#ddc090', '#c8a878'];
    bands.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(cx - pr, cy - pr + i * (pr * 2 / bands.length), pr * 2, pr * 2 / bands.length);
    });
    // great red spot
    ctx.fillStyle = 'rgba(180,80,50,0.6)';
    ctx.beginPath();
    ctx.ellipse(cx + pr * 0.3, cy + pr * 0.2, pr * 0.2, pr * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // planet highlight
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.arc(cx - pr * 0.3, cy - pr * 0.35, pr * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // crosshairs
    ctx.strokeStyle = 'rgba(80,160,80,0.5)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(cx - cr, cy);
    ctx.lineTo(cx + cr, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - cr);
    ctx.lineTo(cx, cy + cr);
    ctx.stroke();
    ctx.setLineDash([]);

    // target circle
    ctx.strokeStyle = 'rgba(80,200,80,0.6)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, pr * 1.4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore(); // eyepiece clip

    // eyepiece rim
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.stroke();

    // data readout
    ctx.fillStyle = 'rgba(0,40,0,0.7)';
    ctx.fillRect(ox, oy + sh - 6, sw, 6);
    ctx.fillStyle = '#40ff60';
    ctx.font = '2.8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('JUP  MAG -2.9  F/8  200x', ox + 2, oy + sh - 1.5);
  }

  /**
   * draw an animated orrery showing planets orbiting the sun.
   * @param {number} ox
   * @param {number} oy
   * @param {number} sw
   * @param {number} sh
   */
  _drawOrreryScreen(ox, oy, sw, sh) {
    const {ctx} = this;
    const cx = ox + sw * 0.5;
    const cy = oy + sh * 0.5;
    const frame = this.scene.frame;

    ctx.fillStyle = '#04060e';
    ctx.fillRect(ox, oy, sw, sh);

    // label
    ctx.fillStyle = '#3060a0';
    ctx.font = '2.5px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('INNER SOLAR SYSTEM', ox + 2, oy + 3.5);

    // orbit rings and planets [radius, speed, size, col, name]
    const planets = [
      {r: 5, speed: 0.08, size: 1.0, col: '#b0a8a0', name: 'Mer'},
      {r: 9, speed: 0.05, size: 1.3, col: '#e8d888', name: 'Ven'},
      {r: 13, speed: 0.03, size: 1.4, col: '#4488ff', name: 'Ear'},
      {r: 17, speed: 0.016, size: 1.1, col: '#dd6644', name: 'Mar'},
    ];

    // orbit trails
    ctx.strokeStyle = 'rgba(30,50,100,0.4)';
    ctx.lineWidth = 0.4;
    planets.forEach(p => {
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // sun
    ctx.fillStyle = '#fff8a0';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffcc00';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // planets
    planets.forEach(p => {
      const angle = frame * p.speed;
      const px = cx + Math.cos(angle) * p.r;
      const py = cy + Math.sin(angle) * p.r;
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * draw a stellar spectrograph with absorption lines.
   * @param {number} ox
   * @param {number} oy
   * @param {number} sw
   * @param {number} sh
   */
  _drawSpectrographScreen(ox, oy, sw, sh) {
    const {ctx} = this;

    ctx.fillStyle = '#04060e';
    ctx.fillRect(ox, oy, sw, sh);

    ctx.fillStyle = '#3060a0';
    ctx.font = '2.5px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('STELLAR SPECTRUM  HD 48915', ox + 2, oy + 3.5);

    const barY = oy + sh * 0.25;
    const barH = sh * 0.45;
    const barX = ox + 2;
    const barW = sw - 4;

    // rainbow spectrum gradient
    const spec = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    spec.addColorStop(0, '#7000ff');
    spec.addColorStop(0.15, '#4040ff');
    spec.addColorStop(0.3, '#0080ff');
    spec.addColorStop(0.45, '#00cc88');
    spec.addColorStop(0.55, '#88dd00');
    spec.addColorStop(0.7, '#ffdd00');
    spec.addColorStop(0.85, '#ff6600');
    spec.addColorStop(1, '#cc0000');
    ctx.fillStyle = spec;
    ctx.fillRect(barX, barY, barW, barH);

    // absorption lines (Fraunhofer lines) [position 0-1, width, label]
    const lines = [
      {t: 0.12, w: 0.8, label: 'Ca'},
      {t: 0.14, w: 0.6, label: ''},
      {t: 0.38, w: 1.0, label: 'Hβ'},
      {t: 0.52, w: 0.7, label: 'Mg'},
      {t: 0.68, w: 1.2, label: 'Hα'},
      {t: 0.78, w: 0.6, label: 'Na'},
      {t: 0.80, w: 0.5, label: ''},
    ];
    lines.forEach(l => {
      const lx = barX + l.t * barW;
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(lx - l.w * 0.5, barY, l.w, barH);
      if (l.label) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '2.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(l.label, lx, barY + barH + 4);
      }
    });

    // wavelength axis
    ctx.strokeStyle = 'rgba(60,100,160,0.5)';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(barX, barY + barH + 1);
    ctx.lineTo(barX + barW, barY + barH + 1);
    ctx.stroke();

    ctx.fillStyle = '#4060a0';
    ctx.font = '2.5px sans-serif';
    ['380nm', '450nm', '550nm', '650nm', '700nm'].forEach((label, i) => {
      ctx.textAlign = 'center';
      ctx.fillText(label, barX + (i / 4) * barW, barY + barH + 7);
    });

    // intensity curve above spectrum
    const curveY = barY - 2;
    ctx.strokeStyle = 'rgba(180,220,255,0.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let x = 0; x <= barW; x += 1) {
      const t = x / barW;
      // rough blackbody-ish curve peaking in blue-green
      const iy = curveY - (8 * Math.sin(t * Math.PI) * (0.6 + 0.4 * Math.cos(t * Math.PI)));
      x === 0 ? ctx.moveTo(barX + x, iy) : ctx.lineTo(barX + x, iy);
    }
    ctx.stroke();

    // bottom readout
    ctx.fillStyle = '#3060a0';
    ctx.font = '2.5px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TYPE: A1V   TEMP: 9,940K   Z: +0.00012', ox + 2, oy + sh - 1.5);
  }

  /**
   * draw a light curve graph showing an exoplanet transit dip.
   * @param {number} ox
   * @param {number} oy
   * @param {number} sw
   * @param {number} sh
   */
  _drawLightCurveScreen(ox, oy, sw, sh) {
    const {ctx} = this;
    const frame = this.scene.frame;

    ctx.fillStyle = '#04060e';
    ctx.fillRect(ox, oy, sw, sh);

    ctx.fillStyle = '#3060a0';
    ctx.font = '2.5px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LIGHT CURVE  Kepler-452b', ox + 2, oy + 3.5);

    const gx = ox + 4;
    const gy = oy + sh * 0.2;
    const gw = sw - 8;
    const gh = sh * 0.58;

    // axes
    ctx.strokeStyle = 'rgba(60,100,160,0.6)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx, gy + gh);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh);
    ctx.lineTo(gx + gw, gy + gh);
    ctx.stroke();

    // axis labels
    ctx.fillStyle = '#4060a0';
    ctx.font = '2px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Flux', gx, gy - 1);
    ctx.textAlign = 'right';
    ctx.fillText('Time (hrs)', gx + gw, gy + gh + 4.5);

    // horizontal grid
    ctx.strokeStyle = 'rgba(30,60,120,0.3)';
    ctx.lineWidth = 0.3;
    [0.25, 0.5, 0.75].forEach(f => {
      const gy2 = gy + f * gh;
      ctx.beginPath();
      ctx.moveTo(gx, gy2);
      ctx.lineTo(gx + gw, gy2);
      ctx.stroke();
    });

    // light curve - flat with transit dip
    // animate a slow scan line
    const scanT = (frame * 0.003) % 1;

    ctx.strokeStyle = '#40aaff';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let px = 0; px <= gw; px++) {
      const t = px / gw;
      // transit dip centred at 0.5, width 0.18, depth 0.012
      const dip = Math.max(0, 1 - Math.pow((t - 0.5) / 0.09, 2));
      const flux = 1 - dip * 0.012;
      // add slight noise
      const noise = Math.sin(px * 7.3 + frame * 0.05) * 0.003;
      const y = gy + gh * (1 - (flux + noise - 0.975) / 0.03);
      px === 0 ? ctx.moveTo(gx + px, y) : ctx.lineTo(gx + px, y);
    }
    ctx.stroke();

    // scan line
    ctx.strokeStyle = 'rgba(80,200,80,0.6)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([1, 1]);
    const scanX = gx + scanT * gw;
    ctx.beginPath();
    ctx.moveTo(scanX, gy);
    ctx.lineTo(scanX, gy + gh);
    ctx.stroke();
    ctx.setLineDash([]);

    // transit marker
    ctx.strokeStyle = 'rgba(255,200,60,0.5)';
    ctx.lineWidth = 0.4;
    const dipX = gx + gw * 0.5;
    ctx.beginPath();
    ctx.moveTo(dipX, gy);
    ctx.lineTo(dipX, gy + gh);
    ctx.stroke();
    ctx.fillStyle = '#ffcc40';
    ctx.font = '2.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('transit', dipX, gy - 1);

    // bottom readout
    ctx.fillStyle = '#3060a0';
    ctx.font = '2.5px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Δflux: 1.2%   P: 385.0d   Rp: 1.6 R⊕', ox + 2, oy + sh - 1.5);
  }

  /**
   * draw an astronomy discord-style chat with slowly scrolling messages.
   * @param {number} ox
   * @param {number} oy
   * @param {number} sw
   * @param {number} sh
   */
  _drawChatScreen(ox, oy, sw, sh) {
    const {ctx} = this;
    const frame = this.scene.frame;

    // background
    ctx.fillStyle = '#1a1d23';
    ctx.fillRect(ox, oy, sw, sh);

    // top bar
    ctx.fillStyle = '#111318';
    ctx.fillRect(ox, oy, sw, 6);
    ctx.fillStyle = '#7289da';
    ctx.font = '2.8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('# general-stargazing', ox + 2, oy + 4.2);

    // messages [user, col, text, lines]
    const MSGS = [
      {user: 'AstroFox', col: '#f0a030', lines: ['Jupiter is stunning tonight,']},
      {user: 'NightOwl99', col: '#7289da', lines: ['seeing conditions are perfect']},
      {user: 'StarryEyes', col: '#43b581', lines: ['just spotted the Great Red Spot!', 'took me 20 mins to find it']},
      {user: 'AstroFox', col: '#f0a030', lines: ['what magnification?']},
      {user: 'NightOwl99', col: '#7289da', lines: ['200x on my 8" dob', 'absolutely incredible']},
      {user: 'CosmicWren', col: '#f04747', lines: ["anyone else see that meteor??"]},
      {user: 'StarryEyes', col: '#43b581', lines: ['YES! bright green trail!']},
      {user: 'AstroFox', col: '#f0a030', lines: ['Perseid must be early this yr']},
      {user: 'NightOwl99', col: '#7289da', lines: ['Orion rising in the east now']},
      {user: 'CosmicWren', col: '#f04747', lines: ['perfect, setting up scope now', 'clear skies everyone ✨']},
      {user: 'StarryEyes', col: '#43b581', lines: ['clear skies!']},
      {user: 'AstroFox', col: '#f0a030', lines: ['anyone imaging tonight?']},
      {user: 'NightOwl99', col: '#7289da', lines: ['trying M42, first attempt']},
      {user: 'CosmicWren', col: '#f04747', lines: ['post results!!']},
    ];

    // compute row heights
    const lineH = 3.5;
    const padY = 1.5;
    const rows = MSGS.map(m => ({...m, h: padY + m.lines.length * lineH + padY}));
    const totalH = rows.reduce((s, r) => s + r.h, 0);

    // slow upward scroll - loops
    const scrollSpeed = 0.12;
    const scrollY = (frame * scrollSpeed) % totalH;

    // clip to content area
    const contentY = oy + 7;
    const contentH = sh - 13;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, contentY, sw, contentH);
    ctx.clip();

    // draw messages offset by scroll
    let curY = contentY - scrollY + totalH; // start one loop ahead so no gap
    for (let loop = 0; loop < 2; loop++) {
      rows.forEach(msg => {
        const my = curY;

        // avatar circle
        ctx.fillStyle = msg.col;
        ctx.beginPath();
        ctx.arc(ox + 4, my + msg.h * 0.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '2px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(msg.user[0], ox + 4, my + msg.h * 0.5 + 0.8);

        // username
        ctx.fillStyle = msg.col;
        ctx.font = 'bold 2.8px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(msg.user, ox + 9, my + padY + lineH * 0.8);

        // message lines
        ctx.fillStyle = '#dcddde';
        ctx.font = '2.5px sans-serif';
        msg.lines.forEach((line, i) => {
          ctx.fillText(line, ox + 9, my + padY + lineH * (i + 1) + lineH * 0.5);
        });

        curY += msg.h;
      });
      curY = contentY - scrollY; // second loop starts from natural position
    }

    ctx.restore();

    // input bar
    ctx.fillStyle = '#2f3136';
    ctx.fillRect(ox, oy + sh - 6, sw, 6);
    ctx.fillStyle = '#40444b';
    ctx.beginPath();
    ctx.roundRect(ox + 1, oy + sh - 5, sw - 2, 4, 1);
    ctx.fill();
    ctx.fillStyle = '#72767d';
    ctx.font = '2.5px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Message #general-stargazing', ox + 3, oy + sh - 2.2);
  }

  /**
   * draw a latex-style dual-column research paper with a transit diagram.
   * @param {number} ox
   * @param {number} oy
   * @param {number} sw
   * @param {number} sh
   */
  _drawResearchPaperScreen(ox, oy, sw, sh) {
    const {ctx} = this;
    const frame = this.scene.frame;

    // paper background - off-white
    ctx.fillStyle = '#f4f2eb';
    ctx.fillRect(ox, oy, sw, sh);

    // journal header bar
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(ox, oy, sw, 5);
    ctx.fillStyle = '#a0b8d8';
    ctx.font = '2px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('The Astrophysical Journal  •  Vol. 924  •  DOI: 10.3847/1538-4357/ac3e04', ox + 2, oy + 3.4);

    // title
    ctx.fillStyle = '#0a0a0a';
    ctx.font = 'bold 3px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Photometric Detection of Transiting', ox + sw * 0.5, oy + 9);
    ctx.fillText('Exoplanets in M-Dwarf Systems', ox + sw * 0.5, oy + 12.5);

    // authors
    ctx.fillStyle = '#2a4a8a';
    ctx.font = '2.2px sans-serif';
    ctx.fillText('J. Harrison, M. Chen, A. Petrov  •  Institute of Astrophysics, Cambridge', ox + sw * 0.5, oy + 16);

    // divider
    ctx.strokeStyle = '#2a4a8a';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(ox + 3, oy + 18);
    ctx.lineTo(ox + sw - 3, oy + 18);
    ctx.stroke();

    // abstract header
    ctx.fillStyle = '#0a0a0a';
    ctx.font = 'bold 2.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Abstract', ox + sw * 0.5, oy + 22);

    // abstract text (full width)
    const abstractLines = [
      'We present photometric observations of 47 M-dwarf',
      'stars using the 2.4m aperture at La Palma. Transit',
      'signals were detected in 3 systems with depths of',
      '0.8–2.1%, consistent with super-Earth radii. Radial',
      'velocity follow-up confirms planetary companions.',
    ];
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '2px sans-serif';
    abstractLines.forEach((line, i) => {
      ctx.fillText(line, ox + sw * 0.5, oy + 26 + i * 3.2);
    });

    // column divider
    const colDiv = ox + sw * 0.5;
    const colTop = oy + 42;
    const colH = sh - 44;
    ctx.strokeStyle = '#c0bdb0';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(colDiv, colTop);
    ctx.lineTo(colDiv, colTop + colH);
    ctx.stroke();

    // text in left column
    const lx = ox + 2;
    const lcw = sw * 0.5 - 4;

    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 2.5px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('1. Introduction', lx, colTop + 4);

    const bodyLines = [
      'Transiting exoplanets provide a unique',
      'opportunity to characterise atmospheric',
      'composition via transmission spectroscopy.',
      'M-dwarf host stars are particularly',
      'favourable due to the large planet-to-star',
      'radius ratio, enhancing signal depth.',
      '',
      '2. Observations',
      'Data were acquired over 18 nights between',
      'March–June 2023. Exposure times of 30s',
      'were used in the i-band filter. Comparison',
      'stars were selected within 0.1 mag of',
      'target brightness to minimise systematics.',
    ];
    ctx.font = '2px sans-serif';
    let bodyY = colTop + 8;
    bodyLines.forEach(line => {
      if (line === '') {
        bodyY += 2;
        return;
      }
      if (line.match(/^\d\./)) {
        ctx.font = 'bold 2.5px sans-serif';
        ctx.fillText(line, lx, bodyY);
        ctx.font = '2px sans-serif';
      } else {
        ctx.fillText(line, lx, bodyY);
      }
      bodyY += 3.2;
    });

    // figure in right column
    const rx = colDiv + 2;
    const rcw = sw * 0.5 - 4;
    const figY = colTop + 2;
    const figH = colH * 0.55;

    // figure box
    ctx.fillStyle = '#eeeae0';
    ctx.strokeStyle = '#c0bdb0';
    ctx.lineWidth = 0.4;
    ctx.fillRect(rx, figY, rcw, figH);
    ctx.strokeRect(rx, figY, rcw, figH);

    // transit schematic diagram inside figure
    const fcx = rx + rcw * 0.5;
    const fcy = figY + figH * 0.42;
    const starR = rcw * 0.22;

    // star
    const starGrad = ctx.createRadialGradient(fcx, fcy, 0, fcx, fcy, starR);
    starGrad.addColorStop(0, '#fff8e0');
    starGrad.addColorStop(0.6, '#ffcc60');
    starGrad.addColorStop(1, '#e88020');
    ctx.fillStyle = starGrad;
    ctx.beginPath();
    ctx.arc(fcx, fcy, starR, 0, Math.PI * 2);
    ctx.fill();

    // planet transit positions [x offset, alpha]
    const transitAnim = (frame * 0.008) % 1;
    const planetR = starR * 0.25;
    const txRange = starR * 2.2;
    const txPos = fcx - txRange + transitAnim * txRange * 2;

    // planet shadow on star (if overlapping)
    const dist = Math.abs(txPos - fcx);
    if (dist < starR + planetR) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(fcx, fcy, starR, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.arc(txPos, fcy, planetR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // planet
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.arc(txPos, fcy, planetR, 0, Math.PI * 2);
    ctx.fill();

    // orbit line behind star
    ctx.strokeStyle = 'rgba(80,100,140,0.3)';
    ctx.lineWidth = 0.4;
    ctx.setLineDash([1, 1]);
    ctx.beginPath();
    ctx.moveTo(rx + 2, fcy);
    ctx.lineTo(rx + rcw - 2, fcy);
    ctx.stroke();
    ctx.setLineDash([]);

    // light curve below diagram
    const lcY = figY + figH * 0.72;
    const lcX = rx + 3;
    const lcW = rcw - 6;
    const lcH = figH * 0.22;

    ctx.strokeStyle = '#2a5a9a';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let px = 0; px <= lcW; px++) {
      const t = px / lcW;
      const dip = Math.max(0, 1 - Math.pow((t - 0.5) / 0.1, 2));
      const y = lcY + lcH * 0.2 + dip * lcH * 0.6;
      px === 0 ? ctx.moveTo(lcX + px, y) : ctx.lineTo(lcX + px, y);
    }
    ctx.stroke();

    // figure caption
    ctx.fillStyle = '#3a3a3a';
    ctx.font = '2px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fig. 1 — Transit geometry and', rx + rcw * 0.5, figY + figH + 3.5);
    ctx.fillText('synthetic light curve for KIC-7742.', rx + rcw * 0.5, figY + figH + 6.5);

    // right column body text
    const rightLines = [
      '3. Results',
      'Three candidates were identified with',
      'transit depths exceeding 5σ detection',
      'threshold. Periods range from 4.2 to',
      '18.7 days. Stellar limb-darkening was',
      'modelled using a quadratic law with',
      'coefficients from Claret (2017).',
    ];
    let rightY = figY + figH + 11;
    rightLines.forEach(line => {
      ctx.textAlign = 'left';
      if (line.match(/^\d\./)) {
        ctx.font = 'bold 2.5px sans-serif';
        ctx.fillStyle = '#0a0a0a';
        ctx.fillText(line, rx, rightY);
        ctx.font = '2px sans-serif';
      } else {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText(line, rx, rightY);
      }
      rightY += 3.2;
    });

    // page number
    ctx.fillStyle = '#888';
    ctx.font = '2px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('2', ox + sw * 0.5, oy + sh - 1);
  }

  /**
   * draw a soft blue screen glow on the surrounding area.
   * @param {number} x
   * @param {number} y
   */
  _drawScreenGlow(x, y) {
    const {ctx} = this;
    const {todBlend} = this.scene;
    const nightAlpha = clamp(1 - todBlend * 2.5, 0, 1) * 0.3;
    if (nightAlpha <= 0) return;

    const glow = ctx.createRadialGradient(x, y - 15, 0, x, y - 15, 40);
    glow.addColorStop(0, `rgba(40,80,200,${nightAlpha})`);
    glow.addColorStop(1, 'rgba(40,80,200,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - 15, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * return true if the given canvas coordinates are inside the laptop body.
   * tests against the combined bounding trapezoid of keyboard + screen.
   * @param {number} cx - canvas x
   * @param {number} cy - canvas y
   * @returns {boolean}
   */
  containsPoint(cx, cy) {
    const {fox} = this.scene;
    // translate into laptop-local space
    const lx = (cx - (fox.x + this.offsetX)) / this.scale;
    const ly = (cy - (fox.y + this.offsetY)) / this.scale;

    const lw = this.laptopW;
    const kh = this.laptopKH;
    const sh = this.laptopH;
    const tilt = 3;

    // keyboard trapezoid: y in [0, kh] (drawn upward so [-kh, 0] in local)
    // screen parallelogram: y in [kh, kh+sh] ([-kh-sh, -kh] in local)
    // combined bounding box with a little padding
    const top = -(kh + sh) - 2;
    const bottom = 2;
    const left = -lw - 2;
    const right = lw + tilt + 2;

    if (lx < left || lx > right || ly < top || ly > bottom) return false;

    // more precise: above keyboard check if within the leaning screen parallelogram
    if (ly < -kh) {
      // inside screen parallelogram - left edge leans right as y decreases
      const leanAtY = tilt * (-ly - kh) / sh;
      const screenLeft = -lw + 3 + leanAtY;
      const screenRight = lw - 3 + leanAtY;
      return lx >= screenLeft && lx <= screenRight;
    }

    // inside keyboard trapezoid
    const taper = 3 * (-ly / kh); // trapezoid narrows toward top
    return lx >= -lw + taper && lx <= lw - taper;
  }
}
