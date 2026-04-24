import {rnd, rndchoice} from "@/utils";

export const MONSTER_TYPES = [
  'frankenstein', 'swampthing', 'reaper', 'butcher',
  'psycho', 'deadlysphere', 'vampire', 'eyezor',
  'fritz', 'possessed', 'nailhead', 'creature',
];

const FORM_COUNTS = {
  frankenstein: 2, swampthing: 1, reaper: 2, butcher: 2,
  psycho: 1, deadlysphere: 3, vampire: 1, eyezor: 1,
  fritz: 1, possessed: 2, nailhead: 1, creature: 1,
};

/**
 * Return a random monster
 * @return {string}
 */
export function randomMonster() {
  return rndchoice(MONSTER_TYPES);
}

/**
 * return a random form for a monster
 * @param {string} type monster type
 * @returns {number}
 */
export function randomMonsterForm(type) {
  return Math.floor(rnd(FORM_COUNTS[type]));
}

/**
 * shared monster drawing functions for eclipse components.
 * each function draws at the origin in local transform space.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} type
 * @param {number} frame
 * @param {boolean} silhouette
 * @param {number} form - fixed visual variant chosen at spawn
 */
export function drawMonster(ctx, type, frame, silhouette, form) {
  switch (type) {
    case 'frankenstein':
      drawFrankenstein(ctx, frame, silhouette, form);
      break;
    case 'swampthing':
      drawSwampThing(ctx, frame, silhouette);
      break;
    case 'reaper':
      drawReaper(ctx, frame, silhouette, form);
      break;
    case 'butcher':
      drawButcher(ctx, frame, silhouette, form);
      break;
    case 'psycho':
      drawPsycho(ctx, frame, silhouette);
      break;
    case 'deadlysphere':
      drawDeadlySphere(ctx, frame, silhouette, form);
      break;
    case 'vampire':
      drawVampire(ctx, frame, silhouette);
      break;
    case 'eyezor':
      drawEyezor(ctx, frame, silhouette);
      break;
    case 'fritz':
      drawFritz(ctx, frame, silhouette);
      break;
    case 'possessed':
      drawPossessed(ctx, frame, silhouette, form);
      break;
    case 'nailhead':
      drawNailhead(ctx, frame, silhouette);
      break;
    case 'creature':
      drawCreature(ctx, frame, silhouette);
      break;
  }
}

/**
 * return silhouette colour or the given colour.
 * @param {string} col
 * @param {boolean} silhouette
 * @returns {string}
 */
function c(col, silhouette) {
  return silhouette ? '#2a1040' : col;
}


// Frankenstein - form 0: classic green suit, form 1: shirtless
export function drawFrankenstein(ctx, frame, silhouette, form) {
  const walk = Math.sin(frame * 0.07) * 5;

  // legs
  ctx.strokeStyle = c(form === 0 ? '#2a4a20' : '#3a2a18', silhouette);
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(-10, 14 + walk);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, -8);
  ctx.lineTo(10, 14 - walk);
  ctx.stroke();

  // boots
  ctx.fillStyle = c('#1a1008', silhouette);
  ctx.beginPath();
  ctx.ellipse(-10, 15, 7, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, 15, 7, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // body
  ctx.fillStyle = c(form === 0 ? '#3a5a28' : '#8a7060', silhouette);
  ctx.fillRect(-14, -46, 28, 38);

  if (!silhouette) {
    if (form === 0) {
      // jacket lapels
      ctx.fillStyle = '#2a4a18';
      ctx.beginPath();
      ctx.moveTo(-14, -46);
      ctx.lineTo(0, -30);
      ctx.lineTo(14, -46);
      ctx.closePath();
      ctx.fill();
      // buttons
      ctx.fillStyle = '#1a2a10';
      [-38, -30, -22].forEach(by => {
        ctx.beginPath();
        ctx.arc(0, by, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // stitches on shirtless form
      ctx.strokeStyle = '#604030';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, -46);
      ctx.lineTo(0, -8);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // outstretched arms
  ctx.strokeStyle = c(form === 0 ? '#3a5a28' : '#8a7060', silhouette);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-14, -38);
  ctx.lineTo(-40, -35 + Math.sin(frame * 0.05) * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, -38);
  ctx.lineTo(40, -35 + Math.sin(frame * 0.05) * 2);
  ctx.stroke();

  // hands
  ctx.fillStyle = c('#7a9060', silhouette);
  ctx.beginPath();
  ctx.arc(-40, -35, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(40, -35, 5, 0, Math.PI * 2);
  ctx.fill();

  // neck bolts
  if (!silhouette) {
    ctx.fillStyle = '#708060';
    ctx.fillRect(-16, -52, 5, 9);
    ctx.fillRect(11, -52, 5, 9);
  }

  // head
  ctx.fillStyle = c('#7a9060', silhouette);
  ctx.fillRect(-12, -70, 24, 24);

  if (!silhouette) {
    // flat top hair
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-12, -70, 24, 6);
    // brow ridge
    ctx.fillStyle = '#506040';
    ctx.fillRect(-10, -58, 20, 4);
    // eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, -54, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -54, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    ctx.arc(-4, -54, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -54, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // mouth - straight line
    ctx.strokeStyle = '#304020';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, -47);
    ctx.lineTo(5, -47);
    ctx.stroke();
  }
}


// Swamp Thing
export function drawSwampThing(ctx, frame, silhouette) {
  const sway = Math.sin(frame * 0.05) * 3;

  // legs - thick plant-like
  ctx.strokeStyle = c('#1a3a10', silhouette);
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -8);
  ctx.lineTo(-12, 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -8);
  ctx.lineTo(10, 14);
  ctx.stroke();

  // feet - splayed roots
  ctx.lineWidth = 4;
  [[-12, 14], [10, 14]].forEach(([fx, fy]) => {
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx - 8, fy + 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx, fy + 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + 8, fy + 5);
    ctx.stroke();
  });

  // body - organic bulky blob
  ctx.fillStyle = c('#1a4010', silhouette);
  ctx.beginPath();
  ctx.moveTo(-20 + sway, -8);
  ctx.bezierCurveTo(-26 + sway, -28, -18, -58, 0, -60);
  ctx.bezierCurveTo(18, -58, 26, -28, 20 + sway, -8);
  ctx.closePath();
  ctx.fill();

  // vine/moss lumps on body
  if (!silhouette) {
    ctx.fillStyle = '#0d2808';
    [[-14, -20], [10, -30], [-8, -42], [12, -18]].forEach(([vx, vy]) => {
      ctx.beginPath();
      ctx.arc(vx + sway * 0.5, vy, 5 + Math.sin(vx) * 2, 0, Math.PI * 2);
      ctx.fill();
    });
    // dripping vines
    ctx.strokeStyle = '#0a2808';
    ctx.lineWidth = 2;
    [[-10, -20], [0, -15], [8, -25]].forEach(([vx, vy]) => {
      const dripLen = 10 + Math.sin(frame * 0.04 + vx) * 4;
      ctx.beginPath();
      ctx.moveTo(vx + sway, vy);
      ctx.bezierCurveTo(vx + sway + 3, vy + dripLen * 0.5, vx + sway - 2, vy + dripLen * 0.8, vx + sway, vy + dripLen);
      ctx.stroke();
    });
  }

  // long dragging arms
  ctx.strokeStyle = c('#1a4010', silhouette);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-18, -36 + sway);
  ctx.lineTo(-34, -10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, -36 + sway);
  ctx.lineTo(32, -12);
  ctx.stroke();
  // clawed hands
  ctx.lineWidth = 3;
  [[-34, -10], [32, -12]].forEach(([hx, hy]) => {
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx - 6, hy + 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx, hy + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + 6, hy + 5);
    ctx.stroke();
  });

  // head - mossy organic shape
  ctx.fillStyle = c('#1a4010', silhouette);
  ctx.beginPath();
  ctx.arc(sway * 0.4, -64, 16, 0, Math.PI * 2);
  ctx.fill();

  // head moss lumps
  if (!silhouette) {
    ctx.fillStyle = '#0d2808';
    [[-8, -72], [4, -74], [-2, -70]].forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.arc(lx + sway * 0.4, ly, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    // glowing green eyes
    ctx.fillStyle = '#60ff30';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#40ff20';
    ctx.beginPath();
    ctx.arc(-5 + sway * 0.4, -66, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5 + sway * 0.4, -66, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // open snarling mouth
    ctx.fillStyle = '#060f04';
    ctx.beginPath();
    ctx.ellipse(sway * 0.4, -58, 6, 3, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#30ff10';
    ctx.lineWidth = 0.8;
    [-3, 0, 3].forEach(tx => {
      ctx.beginPath();
      ctx.moveTo(tx + sway * 0.4, -58);
      ctx.lineTo(tx + sway * 0.4, -55);
      ctx.stroke();
    });
  }
}


// Reaper - form 0: classic hood, form 1: exposed skull face
export function drawReaper(ctx, frame, silhouette, form) {
  const float = Math.sin(frame * 0.04) * 4;

  ctx.save();
  ctx.translate(0, float);

  // flowing cloak
  ctx.fillStyle = c('#080810', silhouette);
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.bezierCurveTo(-20, -18, -18, -48, -10, -60);
  ctx.lineTo(10, -60);
  ctx.bezierCurveTo(18, -48, 20, -18, 16, 0);
  for (let wx = 3; wx >= -3; wx--) {
    ctx.quadraticCurveTo(wx * 5.5 + 2, 7, wx * 5, 0);
  }
  ctx.closePath();
  ctx.fill();

  // scythe handle
  ctx.strokeStyle = c('#3a2010', silhouette);
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(12, -8);
  ctx.lineTo(28, -56);
  ctx.stroke();

  // scythe blade
  ctx.strokeStyle = c(form === 0 ? '#7888a0' : '#c0a040', silhouette);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(26, -53);
  ctx.bezierCurveTo(38, -72, 18, -78, 8, -67);
  ctx.stroke();

  if (!silhouette && form === 1) {
    // glowing blade for form 1
    ctx.strokeStyle = 'rgba(180,140,20,0.4)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(26, -53);
    ctx.bezierCurveTo(38, -72, 18, -78, 8, -67);
    ctx.stroke();
  }

  if (!silhouette) {
    if (form === 0) {
      // glowing red eyes under hood
      ctx.fillStyle = '#ff2020';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff0000';
      ctx.beginPath();
      ctx.arc(-3, -56, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, -56, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // exposed skull face
      ctx.fillStyle = '#d8cca8';
      ctx.beginPath();
      ctx.arc(0, -56, 9, 0, Math.PI * 2);
      ctx.fill();
      // skull details
      ctx.fillStyle = '#1a1010';
      ctx.beginPath();
      ctx.ellipse(-3, -58, 3, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(3, -58, 3, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // nasal cavity
      ctx.beginPath();
      ctx.ellipse(0, -54, 1.5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // teeth
      ctx.fillStyle = '#c8bc98';
      [-3, 0, 3].forEach(tx => {
        ctx.fillRect(tx - 1, -51, 2, 3);
      });
    }
  }

  ctx.restore();
}


// Butcher - form 0: cleaver, form 1: chainsaw
export function drawButcher(ctx, frame, silhouette, form) {
  const walk = Math.sin(frame * 0.09) * 5;

  // legs
  ctx.strokeStyle = c('#2a1010', silhouette);
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, -6);
  ctx.lineTo(-10, 16 + walk);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, -6);
  ctx.lineTo(10, 16 - walk);
  ctx.stroke();
  // boots
  ctx.fillStyle = c('#180a08', silhouette);
  ctx.beginPath();
  ctx.ellipse(-10, 17, 8, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, 17, 8, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // large body
  ctx.fillStyle = c('#3a1818', silhouette);
  ctx.beginPath();
  ctx.ellipse(0, -34, 22, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!silhouette) {
    // white apron
    ctx.fillStyle = '#d8d0b8';
    ctx.beginPath();
    ctx.moveTo(-14, -20);
    ctx.lineTo(14, -20);
    ctx.lineTo(10, 4);
    ctx.lineTo(-10, 4);
    ctx.closePath();
    ctx.fill();
    // blood stains
    ctx.fillStyle = 'rgba(160,15,15,0.75)';
    ctx.beginPath();
    ctx.ellipse(-5, -12, 5, 3.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, -4, 3, 2, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-2, 0, 4, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  if (form === 0) {
    // cleaver arm
    ctx.strokeStyle = c('#3a1818', silhouette);
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(20, -44);
    ctx.lineTo(38, -38 + Math.sin(frame * 0.08) * 4);
    ctx.stroke();
    // cleaver blade
    ctx.fillStyle = c('#8898a8', silhouette);
    ctx.beginPath();
    ctx.moveTo(35, -46);
    ctx.lineTo(50, -42);
    ctx.lineTo(47, -28);
    ctx.lineTo(32, -30);
    ctx.closePath();
    ctx.fill();
    if (!silhouette) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(36, -45);
      ctx.lineTo(48, -42);
      ctx.lineTo(46, -38);
      ctx.closePath();
      ctx.fill();
    }
    // cleaver handle
    ctx.fillStyle = c('#5a3010', silhouette);
    ctx.fillRect(30, -32, 6, 10);
  } else {
    // chainsaw arm
    ctx.strokeStyle = c('#3a1818', silhouette);
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(20, -44);
    ctx.lineTo(38, -40);
    ctx.stroke();
    // chainsaw body
    ctx.fillStyle = c('#606870', silhouette);
    ctx.fillRect(36, -48, 22, 12);
    // chainsaw blade
    ctx.fillStyle = c('#808890', silhouette);
    ctx.fillRect(58, -46, 16, 4);
    if (!silhouette) {
      // chain teeth
      ctx.fillStyle = '#404850';
      for (let tx = 58; tx < 74; tx += 4) {
        ctx.fillRect(tx, -47, 2, 2);
        ctx.fillRect(tx, -42, 2, 2);
      }
      // engine detail
      ctx.fillStyle = '#404850';
      ctx.fillRect(38, -46, 6, 4);
      // revving motion blur
      const rev = Math.sin(frame * 0.4) * 1.5;
      ctx.strokeStyle = 'rgba(200,200,200,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(58, -46 + rev);
      ctx.lineTo(74, -46 + rev);
      ctx.stroke();
    }
  }

  // other arm hanging
  ctx.strokeStyle = c('#3a1818', silhouette);
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-20, -44);
  ctx.lineTo(-30, -28);
  ctx.stroke();
  ctx.fillStyle = c('#7a5050', silhouette);
  ctx.beginPath();
  ctx.arc(-30, -28, 5, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.fillStyle = c('#4a2020', silhouette);
  ctx.beginPath();
  ctx.arc(0, -62, 14, 0, Math.PI * 2);
  ctx.fill();

  if (!silhouette) {
    // leather mask
    ctx.fillStyle = '#c0a870';
    ctx.beginPath();
    ctx.ellipse(0, -62, 10, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a0808';
    ctx.beginPath();
    ctx.ellipse(-3.5, -64, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3.5, -64, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // stitched mouth
    ctx.strokeStyle = '#8a6040';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -57);
    ctx.lineTo(4, -57);
    ctx.stroke();
    ctx.setLineDash([1, 2]);
    ctx.beginPath();
    ctx.moveTo(-3, -57);
    ctx.lineTo(-3, -54);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -57);
    ctx.lineTo(0, -54);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, -57);
    ctx.lineTo(3, -54);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}


// Psycho
export function drawPsycho(ctx, frame, silhouette) {
  const jerk = Math.sin(frame * 0.28) * 3;
  const walk = Math.sin(frame * 0.20) * 6;

  // legs
  ctx.strokeStyle = c('#102030', silhouette);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.lineTo(-8, 16 + walk);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5, -4);
  ctx.lineTo(6, 16 - walk);
  ctx.stroke();
  ctx.fillStyle = c('#0a1820', silhouette);
  ctx.beginPath();
  ctx.ellipse(-8, 17, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, 17, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // wiry body
  ctx.fillStyle = c('#102030', silhouette);
  ctx.beginPath();
  ctx.ellipse(jerk * 0.3, -28, 10, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!silhouette) {
    // straitjacket straps
    ctx.strokeStyle = '#e0d090';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -42);
    ctx.lineTo(10, -36);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, -32);
    ctx.lineTo(10, -30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, -22);
    ctx.lineTo(10, -22);
    ctx.stroke();
    // buckles
    ctx.fillStyle = '#a09040';
    [-38, -28, -20].forEach(by => {
      ctx.fillRect(-1, by, 2, 3);
    });
  }

  // raised knife arm
  const knifeAngle = -1.3 + Math.sin(frame * 0.16) * 0.5;
  ctx.strokeStyle = c('#102030', silhouette);
  ctx.lineWidth = 6;
  ctx.save();
  ctx.translate(12, -40);
  ctx.rotate(knifeAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -24);
  ctx.stroke();
  // knife
  ctx.fillStyle = c('#c8d0d8', silhouette);
  ctx.beginPath();
  ctx.moveTo(-2, -22);
  ctx.lineTo(3, -22);
  ctx.lineTo(1, -38);
  ctx.closePath();
  ctx.fill();
  if (!silhouette) {
    // blood on blade
    ctx.fillStyle = 'rgba(160,15,15,0.6)';
    ctx.beginPath();
    ctx.moveTo(2, -28);
    ctx.lineTo(3, -22);
    ctx.lineTo(1, -22);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // flailing arm
  ctx.strokeStyle = c('#102030', silhouette);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-10, -40);
  ctx.lineTo(-26 + jerk, -26 + jerk * 0.5);
  ctx.stroke();
  ctx.fillStyle = c('#304050', silhouette);
  ctx.beginPath();
  ctx.arc(-26 + jerk, -26, 5, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.save();
  ctx.translate(jerk * 0.5, -52);
  ctx.rotate(jerk * 0.04);
  ctx.fillStyle = c('#1a2a3a', silhouette);
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();

  if (!silhouette) {
    // wild hair
    ctx.strokeStyle = '#2a1808';
    ctx.lineWidth = 1.5;
    [-6, -3, 0, 3, 6].forEach(hx => {
      ctx.beginPath();
      ctx.moveTo(hx, -10);
      ctx.bezierCurveTo(hx + (Math.random() - 0.5) * 4, -16, hx + (Math.random() - 0.5) * 4, -18, hx + (Math.random() - 0.5) * 3, -14);
      ctx.stroke();
    });
    // wide crazy eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-3.5, -1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3.5, -1, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-3.5 + jerk * 0.1, -1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3.5 + jerk * 0.1, -1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-2.5, -2, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4.5, -2, 0.8, 0, Math.PI * 2);
    ctx.fill();
    // manic grin
    ctx.strokeStyle = '#ff2020';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 3, 6, 0.15, Math.PI - 0.15);
    ctx.stroke();
    // teeth
    ctx.fillStyle = '#fff';
    [-3, 0, 3].forEach(tx => {
      ctx.fillRect(tx - 1, 2, 2, 2.5);
    });
  }
  ctx.restore();
}


// Deadly Sphere - 3 forms
export function drawDeadlySphere(ctx, frame, silhouette, form) {
  const float = Math.sin(frame * 0.06) * 5;
  const spin = frame * 0.03;
  const r = 14;

  ctx.save();
  ctx.translate(0, -40 + float);

  if (!silhouette) {
    const glowCol = form === 0 ? 'rgba(255,120,20,' : form === 1 ? 'rgba(40,160,255,' : 'rgba(255,220,80,';
    const glow = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.2);
    glow.addColorStop(0, `${glowCol}0.3)`);
    glow.addColorStop(1, `${glowCol}0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.rotate(spin);

  if (form === 0) {
    ctx.strokeStyle = c('#808898', silhouette);
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.8);
    ctx.bezierCurveTo(-r * 1.4, -r * 0.6, -r * 1.4, r * 0.6, -r * 0.3, r * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.3, -r * 0.8);
    ctx.bezierCurveTo(r * 1.4, -r * 0.6, r * 1.4, r * 0.6, r * 0.3, r * 0.8);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = c('#a0a8b8', silhouette);
    [[-r * 0.3, -r * 0.8], [-r * 0.3, r * 0.8], [r * 0.3, -r * 0.8], [r * 0.3, r * 0.8]].forEach(([px, py]) => {
      const ax = px < 0 ? -r * 0.6 : r * 0.6;
      const ay = py < 0 ? -r * 1.2 : r * 1.2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(ax, ay);
      ctx.stroke();
    });
  } else if (form === 1) {
    ctx.strokeStyle = c('#7090b0', silhouette);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6);
      ctx.lineTo(Math.cos(a) * r * 1.8, Math.sin(a) * r * 1.8);
      ctx.stroke();
      ctx.lineWidth = 1.2;
      const px = Math.cos(a) * r * 1.3, py = Math.sin(a) * r * 1.3;
      const nx = -Math.sin(a) * 4, ny = Math.cos(a) * 4;
      ctx.beginPath();
      ctx.moveTo(px - nx, py - ny);
      ctx.lineTo(px + nx, py + ny);
      ctx.stroke();
    }
  } else {
    ctx.strokeStyle = c('#c0c060', silhouette);
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const len = i % 2 === 0 ? r * 1.6 : r * 1.1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5);
      ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      ctx.stroke();
    }
  }
  ctx.restore();

  // dark body
  if (!silhouette) {
    const bodyGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
    bodyGrad.addColorStop(0, '#484858');
    bodyGrad.addColorStop(0.5, '#282838');
    bodyGrad.addColorStop(1, '#101018');
    ctx.fillStyle = bodyGrad;
  } else {
    ctx.fillStyle = '#1a0a2a';
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
  ctx.fill();

  if (!silhouette) {
    const coreCol = form === 0 ? ['#ff8020', '#ff4000', '#200800']
        : form === 1 ? ['#80e0ff', '#20a0e0', '#002040']
            : ['#ffee80', '#ffc000', '#201000'];
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.42);
    cg.addColorStop(0, coreCol[0]);
    cg.addColorStop(0.5, coreCol[1]);
    cg.addColorStop(1, coreCol[2]);
    ctx.shadowBlur = 8;
    ctx.shadowColor = coreCol[1];
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(-r * 0.1, -r * 0.15, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}


// Vampire - humanoid, cape, pale face
export function drawVampire(ctx, frame, silhouette) {
  const walk = Math.sin(frame * 0.08) * 4;

  // legs
  ctx.strokeStyle = c('#1a1428', silhouette);
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(-8, 14 + walk);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -6);
  ctx.lineTo(7, 14 - walk);
  ctx.stroke();
  ctx.fillStyle = c('#100c1a', silhouette);
  ctx.beginPath();
  ctx.ellipse(-8, 15, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(7, 15, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // flowing cape - drawn first so body overlaps
  ctx.fillStyle = c('#0f0a1f', silhouette);
  ctx.beginPath();
  ctx.moveTo(-14, -44);
  ctx.bezierCurveTo(-22, -30, -28, -10, -24, 8);
  ctx.lineTo(-10, 2);
  ctx.bezierCurveTo(-8, -10, -6, -30, -6, -44);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -44);
  ctx.bezierCurveTo(22, -30, 28, -10, 24, 8);
  ctx.lineTo(10, 2);
  ctx.bezierCurveTo(8, -10, 6, -30, 6, -44);
  ctx.closePath();
  ctx.fill();
  // cape lining (red)
  if (!silhouette) {
    ctx.fillStyle = '#600010';
    ctx.beginPath();
    ctx.moveTo(-12, -44);
    ctx.bezierCurveTo(-18, -30, -22, -10, -20, 8);
    ctx.lineTo(-10, 2);
    ctx.bezierCurveTo(-9, -10, -7, -30, -7, -44);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -44);
    ctx.bezierCurveTo(18, -30, 22, -10, 20, 8);
    ctx.lineTo(10, 2);
    ctx.bezierCurveTo(9, -10, 7, -30, 7, -44);
    ctx.closePath();
    ctx.fill();
  }

  // body - dark suit
  ctx.fillStyle = c('#1a1428', silhouette);
  ctx.beginPath();
  ctx.ellipse(0, -28, 12, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!silhouette) {
    // white shirt front
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(-5, -44);
    ctx.lineTo(5, -44);
    ctx.lineTo(4, -14);
    ctx.lineTo(-4, -14);
    ctx.closePath();
    ctx.fill();
    // bow tie
    ctx.fillStyle = '#800010';
    ctx.beginPath();
    ctx.moveTo(-4, -43);
    ctx.lineTo(0, -40);
    ctx.lineTo(-4, -37);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4, -43);
    ctx.lineTo(0, -40);
    ctx.lineTo(4, -37);
    ctx.closePath();
    ctx.fill();
  }

  // arms
  ctx.strokeStyle = c('#1a1428', silhouette);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-12, -38);
  ctx.lineTo(-22, -22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(12, -38);
  ctx.lineTo(22, -22);
  ctx.stroke();
  ctx.fillStyle = c('#c8b8a8', silhouette);
  ctx.beginPath();
  ctx.arc(-22, -22, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, -22, 4, 0, Math.PI * 2);
  ctx.fill();

  // head
  ctx.fillStyle = c('#d0c4b4', silhouette);
  ctx.beginPath();
  ctx.arc(0, -56, 11, 0, Math.PI * 2);
  ctx.fill();

  if (!silhouette) {
    // slicked hair
    ctx.fillStyle = '#1a1010';
    ctx.beginPath();
    ctx.moveTo(-11, -58);
    ctx.bezierCurveTo(-8, -68, 8, -68, 11, -58);
    ctx.lineTo(6, -56);
    ctx.lineTo(0, -62);
    ctx.lineTo(-6, -56);
    ctx.closePath();
    ctx.fill();
    // widow's peak
    ctx.fillStyle = '#1a1010';
    ctx.beginPath();
    ctx.moveTo(-3, -58);
    ctx.lineTo(0, -64);
    ctx.lineTo(3, -58);
    ctx.closePath();
    ctx.fill();
    // pale face features
    ctx.fillStyle = '#1a0808';
    ctx.beginPath();
    ctx.ellipse(-3.5, -57, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3.5, -57, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff2020';
    ctx.beginPath();
    ctx.arc(-3.5, -57, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3.5, -57, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // fanged smile
    ctx.strokeStyle = '#1a0808';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -52, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-2, -52);
    ctx.lineTo(-1, -49);
    ctx.lineTo(0, -52);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, -52);
    ctx.lineTo(1, -49);
    ctx.lineTo(0, -52);
    ctx.closePath();
    ctx.fill();
  }
}

// Zombie with big eye
function drawEyezor(ctx, frame, silhouette) {
  const walk  = Math.sin(frame * 0.08) * 5;
  const blink = Math.sin(frame * 0.025) > 0.9;

  // legs
  ctx.strokeStyle = c('#3a2a18', silhouette);
  ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, -6);  ctx.lineTo(-9, 14 + walk);  ctx.stroke();
  ctx.beginPath(); ctx.moveTo( 6, -6);  ctx.lineTo(  8, 14 - walk); ctx.stroke();
  ctx.fillStyle = c('#2a1a10', silhouette);
  ctx.beginPath(); ctx.ellipse(-9, 15, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( 8, 15, 7, 3, 0, 0, Math.PI * 2); ctx.fill();

  // body - tattered clothes
  ctx.fillStyle = c('#4a3828', silhouette);
  ctx.beginPath(); ctx.ellipse(0, -28, 13, 22, 0, 0, Math.PI * 2); ctx.fill();

  if (!silhouette) {
    // torn shirt detail
    ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-4, -48); ctx.lineTo(-6, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 4, -48); ctx.lineTo(  5, -8); ctx.stroke();
  }

  // arms
  ctx.strokeStyle = c('#4a3828', silhouette);
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-12, -38); ctx.lineTo(-24, -20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( 12, -38); ctx.lineTo( 24, -20); ctx.stroke();
  ctx.fillStyle = c('#5a4838', silhouette);
  ctx.beginPath(); ctx.arc(-24, -20, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 24, -20, 5, 0, Math.PI * 2); ctx.fill();

  // neck stub
  ctx.fillStyle = c('#5a4838', silhouette);
  ctx.beginPath(); ctx.roundRect(-5, -52, 10, 8, 2); ctx.fill();

  // head - small skull shape mostly consumed by the eye
  ctx.fillStyle = c('#4a3828', silhouette);
  ctx.beginPath(); ctx.ellipse(0, -62, 16, 14, 0, 0, Math.PI * 2); ctx.fill();

  // THE massive eye - takes up most of the face
  const er = 12;
  if (!silhouette) {
    // sclera
    const eyeGrad = ctx.createRadialGradient(-er*0.2, -62 - er*0.2, 0, 0, -62, er);
    eyeGrad.addColorStop(0,   '#f8f0e8');
    eyeGrad.addColorStop(0.6, '#e0d4c8');
    eyeGrad.addColorStop(1,   '#c0b0a0');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath(); ctx.arc(0, -62, er, 0, Math.PI * 2); ctx.fill();

    // bloodshot veins
    ctx.strokeStyle = 'rgba(200,60,60,0.5)';
    ctx.lineWidth = 0.7;
    [[-8,-56],[6,-54],[-4,-68],[8,-66],[-9,-62]].forEach(([vx,vy]) => {
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.bezierCurveTo(vx+3, vy-3, vx+5, vy+2, vx+8, vy+1);
      ctx.stroke();
    });

    if (!blink) {
      // iris - red/orange like the sprite
      const irisGrad = ctx.createRadialGradient(0, -62, 0, 0, -62, er * 0.55);
      irisGrad.addColorStop(0,   '#ff8020');
      irisGrad.addColorStop(0.5, '#cc3000');
      irisGrad.addColorStop(1,   '#800000');
      ctx.fillStyle = irisGrad;
      ctx.beginPath(); ctx.arc(0, -62, er * 0.55, 0, Math.PI * 2); ctx.fill();

      // pupil - vertical slit
      ctx.fillStyle = '#0a0000';
      ctx.beginPath(); ctx.ellipse(0, -62, er * 0.18, er * 0.42, 0, 0, Math.PI * 2); ctx.fill();

      // catchlight
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(-er*0.22, -62 - er*0.2, er*0.12, 0, Math.PI * 2); ctx.fill();

      // laser beam shooting from eye
      if (!silhouette) {
        ctx.strokeStyle = 'rgba(255,80,0,0.55)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(er, -62);
        ctx.lineTo(er * 3.5, -62);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,160,40,0.2)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(er, -62);
        ctx.lineTo(er * 3.5, -62);
        ctx.stroke();
      }
    } else {
      // eyelid closed
      ctx.fillStyle = '#6a5040';
      ctx.beginPath(); ctx.ellipse(0, -62, er, er * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    }

    // eyelid outline / brow ridge
    ctx.strokeStyle = '#2a1808'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, -62, er, Math.PI, 0); ctx.stroke(); // brow
  } else {
    // silhouette - just the large eye circle
    ctx.fillStyle = '#2a1040';
    ctx.beginPath(); ctx.arc(0, -62, er, 0, Math.PI * 2); ctx.fill();
  }
}


// Fritz - hunchbacked Igor assistant
export function drawFritz(ctx, frame, silhouette) {
  const walk = Math.sin(frame * 0.09) * 4;
  const hunch = 0.3; // forward lean

  ctx.save();
  ctx.rotate(hunch * 0.15); // slight forward lean

  // legs - shuffling
  ctx.strokeStyle = c('#2a2030', silhouette);
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.lineTo(-8, 16 + walk);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5, -4);
  ctx.lineTo(5, 16 - walk);
  ctx.stroke();
  ctx.fillStyle = c('#1a1020', silhouette);
  ctx.beginPath();
  ctx.ellipse(-8, 17, 7, 3, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5, 17, 7, 3, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // hunched body
  ctx.fillStyle = c('#2a2030', silhouette);
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.bezierCurveTo(-16, -22, -10, -46, 0, -50);
  ctx.bezierCurveTo(10, -46, 14, -22, 12, -8);
  ctx.closePath();
  ctx.fill();

  if (!silhouette) {
    // tattered coat
    ctx.strokeStyle = '#1a1428';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(-16, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, -8);
    ctx.lineTo(14, 2);
    ctx.stroke();
    // hump on back
    ctx.fillStyle = '#3a3048';
    ctx.beginPath();
    ctx.arc(-8, -30, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // arms - one raised holding a beaker, one low
  ctx.strokeStyle = c('#2a2030', silhouette);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-10, -36);
  ctx.lineTo(-24, -50);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, -36);
  ctx.lineTo(20, -20);
  ctx.stroke();

  if (!silhouette) {
    // beaker in raised hand
    ctx.fillStyle = 'rgba(40,200,100,0.6)';
    ctx.beginPath();
    ctx.moveTo(-28, -54);
    ctx.lineTo(-22, -54);
    ctx.lineTo(-20, -44);
    ctx.lineTo(-30, -44);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#60a060';
    ctx.lineWidth = 1;
    ctx.stroke();
    // bubbles
    ctx.fillStyle = 'rgba(80,255,120,0.5)';
    ctx.beginPath();
    ctx.arc(-26, -56, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-23, -58, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // head - forward on hunched neck
  ctx.save();
  ctx.translate(-4, -56);
  ctx.rotate(-0.2); // head tilts forward
  ctx.fillStyle = c('#b0a080', silhouette);
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  if (!silhouette) {
    // scraggly hair
    ctx.strokeStyle = '#2a1808';
    ctx.lineWidth = 1.5;
    [-5, 0, 5].forEach(hx => {
      ctx.beginPath();
      ctx.moveTo(hx, -9);
      ctx.lineTo(hx - 2, -15);
      ctx.stroke();
    });
    // beady eyes - one larger than other
    ctx.fillStyle = '#1a0808';
    ctx.beginPath();
    ctx.arc(-3, -1, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, -1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff8020';
    ctx.beginPath();
    ctx.arc(-3, -1, 1.2, 0, Math.PI * 2);
    ctx.fill();
    // oversized nose
    ctx.fillStyle = '#c09060';
    ctx.beginPath();
    ctx.ellipse(0, 3, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // grin
    ctx.strokeStyle = '#604020';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 6, 4, 0, Math.PI);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore(); // lean
}


// The Possessed - floating armour
// form 0: knight armour, form 1: samurai armour
export function drawPossessed(ctx, frame, silhouette, form) {
  const float = Math.sin(frame * 0.04) * 5;
  const spin = Math.sin(frame * 0.03) * 0.06; // slight hovering rotation

  ctx.save();
  ctx.translate(0, float);
  ctx.rotate(spin);

  if (form === 0) {
    // -- knight armour --
    // greaves (legs floating, slightly apart)
    ctx.fillStyle = c('#6878a0', silhouette);
    ctx.beginPath();
    ctx.roundRect(-10, 4, 8, 18, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(2, 4, 8, 18, 2);
    ctx.fill();
    if (!silhouette) {
      ctx.strokeStyle = '#8090b8';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-10, 4, 8, 18);
      ctx.strokeRect(2, 4, 8, 18);
    }
    // sabatons
    ctx.fillStyle = c('#505870', silhouette);
    ctx.beginPath();
    ctx.roundRect(-12, 20, 10, 4, 1);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(1, 20, 10, 4, 1);
    ctx.fill();

    // tassets (hip plates)
    ctx.fillStyle = c('#6878a0', silhouette);
    ctx.beginPath();
    ctx.roundRect(-14, -4, 10, 10, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(4, -4, 10, 10, 2);
    ctx.fill();

    // breastplate
    ctx.fillStyle = c('#7888b0', silhouette);
    ctx.beginPath();
    ctx.roundRect(-14, -46, 28, 44, 3);
    ctx.fill();
    if (!silhouette) {
      ctx.strokeStyle = '#90a0c8';
      ctx.lineWidth = 1;
      ctx.strokeRect(-14, -46, 28, 44);
      // breastplate detail line
      ctx.beginPath();
      ctx.moveTo(0, -46);
      ctx.lineTo(0, -2);
      ctx.stroke();
      // rivets
      [[-10, -40], [-10, -20], [10, -40], [10, -20]].forEach(([rx, ry]) => {
        ctx.fillStyle = '#a0b0d0';
        ctx.beginPath();
        ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // pauldrons (shoulder plates)
    ctx.fillStyle = c('#8090b8', silhouette);
    ctx.beginPath();
    ctx.ellipse(-18, -42, 8, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(18, -42, 8, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // gauntlets
    ctx.fillStyle = c('#6878a0', silhouette);
    ctx.beginPath();
    ctx.roundRect(-28, -40, 10, 18, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(18, -40, 10, 18, 2);
    ctx.fill();

    // helmet
    ctx.fillStyle = c('#7888b0', silhouette);
    ctx.beginPath();
    ctx.moveTo(-12, -46);
    ctx.lineTo(-12, -68);
    ctx.bezierCurveTo(-12, -78, 12, -78, 12, -68);
    ctx.lineTo(12, -46);
    ctx.closePath();
    ctx.fill();
    if (!silhouette) {
      // visor slit glowing
      ctx.fillStyle = '#40c0ff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#40a0ff';
      ctx.fillRect(-8, -62, 16, 4);
      ctx.shadowBlur = 0;
      // helmet ridge
      ctx.strokeStyle = '#90a0c8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -46);
      ctx.lineTo(0, -78);
      ctx.stroke();
    }

  } else {
    // -- samurai armour --
    // hakama (leg coverings)
    ctx.fillStyle = c('#4a2a18', silhouette);
    ctx.beginPath();
    ctx.roundRect(-11, 4, 9, 20, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(2, 4, 9, 20, 2);
    ctx.fill();
    if (!silhouette) {
      // hakama pleats
      ctx.strokeStyle = '#3a1a10';
      ctx.lineWidth = 0.8;
      [-8, -5, -2, 4, 7].forEach(px => {
        ctx.beginPath();
        ctx.moveTo(px, 4);
        ctx.lineTo(px, 24);
        ctx.stroke();
      });
    }

    // do (chest armour) - banded lamellar
    ctx.fillStyle = c('#8a2020', silhouette);
    ctx.beginPath();
    ctx.roundRect(-14, -46, 28, 50, 3);
    ctx.fill();
    if (!silhouette) {
      // lamellar bands
      ctx.strokeStyle = '#601010';
      ctx.lineWidth = 1;
      [-36, -26, -16, -6].forEach(by => {
        ctx.beginPath();
        ctx.moveTo(-14, by);
        ctx.lineTo(14, by);
        ctx.stroke();
      });
      // gold trim
      ctx.strokeStyle = '#c8a020';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-14, -46, 28, 50);
    }

    // large shoulder guards (osode)
    ctx.fillStyle = c('#8a2020', silhouette);
    ctx.beginPath();
    ctx.roundRect(-26, -48, 14, 22, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(12, -48, 14, 22, 2);
    ctx.fill();
    if (!silhouette) {
      ctx.strokeStyle = '#c8a020';
      ctx.lineWidth = 1;
      ctx.strokeRect(-26, -48, 14, 22);
      ctx.strokeRect(12, -48, 14, 22);
    }

    // kote (gauntlets)
    ctx.fillStyle = c('#6a1818', silhouette);
    ctx.beginPath();
    ctx.roundRect(-28, -38, 10, 16, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(18, -38, 10, 16, 2);
    ctx.fill();

    // kabuto (helmet)
    ctx.fillStyle = c('#8a2020', silhouette);
    ctx.beginPath();
    ctx.moveTo(-13, -46);
    ctx.bezierCurveTo(-16, -58, -10, -74, 0, -76);
    ctx.bezierCurveTo(10, -74, 16, -58, 13, -46);
    ctx.closePath();
    ctx.fill();
    if (!silhouette) {
      ctx.strokeStyle = '#c8a020';
      ctx.lineWidth = 1;
      ctx.stroke();
      // maedate (front crest)
      ctx.fillStyle = '#c8a020';
      ctx.beginPath();
      ctx.moveTo(-4, -76);
      ctx.bezierCurveTo(-6, -86, 6, -86, 4, -76);
      ctx.closePath();
      ctx.fill();
      // visor glow - orange for samurai
      ctx.fillStyle = '#ff6020';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff4000';
      ctx.fillRect(-8, -60, 16, 4);
      ctx.shadowBlur = 0;
      // mempo (face mask) suggestion
      ctx.fillStyle = '#701010';
      ctx.fillRect(-8, -54, 16, 8);
    }
  }

  ctx.restore();
}


// Nailhead - grey figure with nails in head
export function drawNailhead(ctx, frame, silhouette) {
  const walk = Math.sin(frame * 0.07) * 4;

  // legs
  ctx.strokeStyle = c('#303840', silhouette);
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(-8, 14 + walk);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -6);
  ctx.lineTo(7, 14 - walk);
  ctx.stroke();
  ctx.fillStyle = c('#202830', silhouette);
  ctx.beginPath();
  ctx.ellipse(-8, 15, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(7, 15, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // body - stocky grey
  ctx.fillStyle = c('#404858', silhouette);
  ctx.beginPath();
  ctx.ellipse(0, -28, 14, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // arms
  ctx.strokeStyle = c('#404858', silhouette);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-14, -38);
  ctx.lineTo(-26, -24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, -38);
  ctx.lineTo(26, -24);
  ctx.stroke();
  ctx.fillStyle = c('#505868', silhouette);
  ctx.beginPath();
  ctx.arc(-26, -24, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(26, -24, 5, 0, Math.PI * 2);
  ctx.fill();

  // large cube/box head - distinctive feature
  ctx.fillStyle = c('#505868', silhouette);
  ctx.fillRect(-14, -72, 28, 26);
  if (!silhouette) {
    ctx.strokeStyle = '#606878';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-14, -72, 28, 26);
    // face
    ctx.fillStyle = '#1a2028';
    ctx.fillRect(-8, -66, 5, 6);   // left eye socket
    ctx.fillRect(3, -66, 5, 6);   // right eye socket
    ctx.fillStyle = '#ff3020';
    ctx.beginPath();
    ctx.arc(-5.5, -63, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5.5, -63, 2, 0, Math.PI * 2);
    ctx.fill();
    // mouth grill
    ctx.strokeStyle = '#1a2028';
    ctx.lineWidth = 1.5;
    [-4, -2, 0, 2, 4].forEach(mx => {
      ctx.beginPath();
      ctx.moveTo(mx, -55);
      ctx.lineTo(mx, -51);
      ctx.stroke();
    });
  }

  // nails sticking out of head - the key feature
  ctx.strokeStyle = c('#8898a8', silhouette);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const nails = [
    [-8, -72, -10, -84],
    [-3, -72, -4, -85],
    [3, -72, 4, -85],
    [8, -72, 10, -84],
    [0, -72, 0, -86],
    [-11, -68, -18, -76],
    [11, -68, 18, -76],
  ];
  nails.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    // nail head (flat top)
    ctx.fillStyle = c('#a0b0c0', silhouette);
    ctx.beginPath();
    ctx.arc(x2, y2, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}


// Creature from the Deep - fishman with scuba gear
export function drawCreature(ctx, frame, silhouette) {
  const walk = Math.sin(frame * 0.07) * 5;

  // legs/fins
  ctx.strokeStyle = c('#1a4a28', silhouette);
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-7, -6);
  ctx.lineTo(-10, 14 + walk);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(7, -6);
  ctx.lineTo(9, 14 - walk);
  ctx.stroke();
  // webbed feet
  ctx.fillStyle = c('#0f3018', silhouette);
  [[-10, 16], [9, 16]].forEach(([fx, fy]) => {
    ctx.beginPath();
    ctx.moveTo(fx - 8, fy + 4);
    ctx.bezierCurveTo(fx - 4, fy, fx, fy + 2, fx + 4, fy);
    ctx.bezierCurveTo(fx + 8, fy + 2, fx + 8, fy + 5, fx, fy + 6);
    ctx.closePath();
    ctx.fill();
  });

  // body - scaly green
  ctx.fillStyle = c('#1a5030', silhouette);
  ctx.beginPath();
  ctx.ellipse(0, -28, 15, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!silhouette) {
    // scale pattern
    ctx.strokeStyle = '#0f3820';
    ctx.lineWidth = 0.7;
    for (let sy = -44; sy < -8; sy += 6) {
      for (let sx = -13; sx < 13; sx += 7) {
        const off = (sy % 12 === 0) ? 0 : 3.5;
        ctx.beginPath();
        ctx.arc(sx + off, sy, 3.5, Math.PI, 0);
        ctx.stroke();
      }
    }
    // scuba tanks on back
    ctx.fillStyle = '#a0a0b0';
    ctx.fillRect(-18, -44, 6, 22);
    ctx.fillRect(12, -44, 6, 22);
    ctx.fillStyle = '#808090';
    ctx.fillRect(-19, -38, 8, 4);
    ctx.fillRect(11, -38, 8, 4);
    // hose
    ctx.strokeStyle = '#606070';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -30);
    ctx.bezierCurveTo(-20, -25, -20, -60, -10, -60);
    ctx.stroke();
  }

  // arms with claws
  ctx.strokeStyle = c('#1a5030', silhouette);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-14, -36);
  ctx.lineTo(-28, -22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, -36);
  ctx.lineTo(28, -22);
  ctx.stroke();
  // clawed hands
  ctx.strokeStyle = c('#0f3820', silhouette);
  ctx.lineWidth = 3;
  [[-28, -22], [28, -22]].forEach(([hx, hy]) => {
    const dir = hx < 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + dir * 8, hy - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + dir * 9, hy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + dir * 7, hy + 6);
    ctx.stroke();
  });

  // fish head
  ctx.fillStyle = c('#1a5030', silhouette);
  ctx.beginPath();
  ctx.arc(0, -56, 14, 0, Math.PI * 2);
  ctx.fill();

  if (!silhouette) {
    // scuba mask
    ctx.fillStyle = '#303848';
    ctx.beginPath();
    ctx.roundRect(-10, -64, 20, 14, 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(40,160,200,0.4)';
    ctx.beginPath();
    ctx.roundRect(-8, -62, 16, 10, 2);
    ctx.fill();
    ctx.strokeStyle = '#505860';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -64, 20, 14);
    // eyes behind mask
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(-4, -57, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -57, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath();
    ctx.arc(-4, -57, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -57, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // gills
    ctx.strokeStyle = '#0f3820';
    ctx.lineWidth = 1.2;
    [-12, -10, -8].forEach(gx => {
      ctx.beginPath();
      ctx.moveTo(gx, -56);
      ctx.lineTo(gx, -48);
      ctx.stroke();
    });
    // regulator mouthpiece
    ctx.fillStyle = '#505060';
    ctx.beginPath();
    ctx.ellipse(-8, -48, 5, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // dorsal fin suggestion
    ctx.fillStyle = '#0f3820';
    ctx.beginPath();
    ctx.moveTo(-4, -70);
    ctx.bezierCurveTo(-8, -80, 4, -78, 4, -70);
    ctx.closePath();
    ctx.fill();
  }
}
