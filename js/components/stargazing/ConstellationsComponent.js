import {DrawComponent} from '@/core/DrawComponent';
import {clamp} from '@/utils';

export const CONSTELLATIONS = [
  {
    name: 'Orion',
    stars: [
      {x: 120, y: 80, r: 2.8}, // Betelgeuse
      {x: 145, y: 95, r: 2.2}, // Bellatrix
      {x: 128, y: 115, r: 1.8}, // belt left
      {x: 138, y: 113, r: 1.8}, // belt centre
      {x: 148, y: 111, r: 1.8}, // belt right
      {x: 122, y: 135, r: 2.4}, // Rigel
      {x: 150, y: 128, r: 2.0}, // Saiph
      {x: 135, y: 70, r: 1.6}, // head
    ],
    lines: [[0, 1], [1, 4], [4, 2], [2, 3], [3, 4], [0, 2], [4, 6], [5, 2], [5, 6], [0, 7]],
  },
  {
    name: 'Ursa Major',
    stars: [
      {x: 280, y: 55, r: 2.2}, // Dubhe
      {x: 305, y: 60, r: 2.0}, // Merak
      {x: 320, y: 75, r: 1.8}, // Phecda
      {x: 300, y: 78, r: 1.8}, // Megrez
      {x: 315, y: 90, r: 2.0}, // Alioth
      {x: 340, y: 88, r: 2.2}, // Mizar
      {x: 365, y: 82, r: 1.6}, // Alkaid
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  },
  {
    name: 'Cassiopeia',
    stars: [
      {x: 480, y: 40, r: 2.0}, // Caph
      {x: 500, y: 55, r: 2.4}, // Schedar
      {x: 520, y: 45, r: 1.8}, // Gamma
      {x: 540, y: 58, r: 2.0}, // Ruchbah
      {x: 560, y: 48, r: 1.8}, // Segin
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: 'Leo',
    stars: [
      {x: 200, y: 110, r: 2.6}, // Regulus
      {x: 215, y: 95, r: 1.8}, // Eta
      {x: 230, y: 85, r: 2.0}, // Gamma
      {x: 248, y: 90, r: 1.6}, // Zeta
      {x: 255, y: 105, r: 1.8}, // Mu
      {x: 265, y: 118, r: 2.2}, // Denebola
      {x: 240, y: 115, r: 1.6}, // Delta
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [4, 6]],
  },
  {
    name: 'Scorpius',
    stars: [
      {x: 580, y: 95, r: 2.8}, // Antares
      {x: 595, y: 85, r: 1.8},
      {x: 608, y: 78, r: 1.6},
      {x: 570, y: 105, r: 1.8},
      {x: 560, y: 118, r: 1.6},
      {x: 568, y: 130, r: 1.8},
      {x: 582, y: 138, r: 1.6},
      {x: 596, y: 132, r: 1.8}, // stinger
      {x: 605, y: 122, r: 1.6},
    ],
    lines: [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]],
  },
];

/**
 * draws fixed constellations in the night sky with connecting lines.
 * brightness varies inversely with moon phase - brightest at new moon.
 */
export class ConstellationsComponent extends DrawComponent {
  static COMPONENT_NAME = 'ConstellationsComponent';
  getName() {
    return ConstellationsComponent.COMPONENT_NAME;
  }

  isEnabled() {
    const {stargazing, weather, timeOfDay} = this.scene;
    return stargazing && timeOfDay === 'night'
        && (weather === 'clear' || weather === 'wind');
  }

  draw() {
    const {ctx} = this;
    const {moonPhase, frame} = this.scene;

    const moonDim = 0.15 + (Math.abs(moonPhase - 4) / 4) * 0.85;
    const nightAlpha = clamp(1 - this.scene.todBlend * 2.5, 0, 1);
    const baseAlpha = nightAlpha * moonDim;

    CONSTELLATIONS.forEach(con => {
      // draw connecting lines first
      ctx.save();
      ctx.strokeStyle = 'rgba(160,180,255,0.35)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([]);
      con.lines.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(con.stars[a].x, con.stars[a].y);
        ctx.lineTo(con.stars[b].x, con.stars[b].y);
        ctx.globalAlpha = baseAlpha * 0.5;
        ctx.stroke();
      });
      ctx.restore();

      // draw stars
      con.stars.forEach((s, i) => {
        const twinkle = 0.7 + 0.3 * Math.sin(frame * 0.04 + i * 1.7 + con.stars.length);
        ctx.save();
        ctx.globalAlpha = baseAlpha * twinkle;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#c8d8ff';
        ctx.fillStyle = '#e8eeff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });
  }
}
