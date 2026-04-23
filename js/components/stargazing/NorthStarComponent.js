import {DrawComponent} from '@/core/DrawComponent';
import {clamp} from '@/utils';

/**
 * draws Polaris, the North Star, with a distinctive cross-shaped diffraction spike.
 * only visible when stargazing is active. brighter than ordinary stars but
 * still dims slightly under a full moon.
 */
export class NorthStarComponent extends DrawComponent {
  x = 360;
  y = 28;

  isEnabled() {
    const {stargazing, weather, season} = this.scene;
    return (weather === 'clear' || weather === 'wind') && (stargazing || season === 'winter');
  }

  draw() {
    const {ctx, x, y} = this;
    const {moonPhase, frame} = this.scene;

    const nightAlpha = clamp(1 - this.scene.todBlend * 2.5, 0, 1);
    const moonDim = 1 - (Math.abs(moonPhase - 4) / 4) * 0.3; // less affected than others
    const baseAlpha = nightAlpha * moonDim;
    const twinkle = 0.85 + 0.15 * Math.sin(frame * 0.03);

    ctx.save();
    ctx.globalAlpha = baseAlpha * twinkle;

    // outer soft glow
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, 22);
    outerGlow.addColorStop(0, 'rgba(200,220,255,0.5)');
    outerGlow.addColorStop(0.4, 'rgba(180,200,255,0.15)');
    outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // diffraction spikes - cross shape
    const spikeLen = 18;
    const spikeW = 1.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#c8dcff';

    [[1, 0], [0, 1], [0.7, 0.7], [0.7, -0.7]].forEach(([dx, dy]) => {
      const grad = ctx.createLinearGradient(
          x - dx * spikeLen, y - dy * spikeLen,
          x + dx * spikeLen, y + dy * spikeLen
      );
      grad.addColorStop(0, 'rgba(200,220,255,0)');
      grad.addColorStop(0.4, 'rgba(220,235,255,0.6)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.9)');
      grad.addColorStop(0.6, 'rgba(220,235,255,0.6)');
      grad.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = spikeW;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - dx * spikeLen, y - dy * spikeLen);
      ctx.lineTo(x + dx * spikeLen, y + dy * spikeLen);
      ctx.stroke();
    });

    ctx.shadowBlur = 0;

    // star core
    const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, 4);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, '#e8f0ff');
    coreGrad.addColorStop(1, 'rgba(200,220,255,0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
