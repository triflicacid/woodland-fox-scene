import {rndchoice} from "@/utils";

export const MONSTER_TYPES = ['frankenstein', 'swampthing', 'reaper', 'butcher', 'deadlysphere', 'psycho'];

/**
 * Return a random monster
 * @return {string}
 */
export function randomMonster() {
  return rndchoice(MONSTER_TYPES);
}

/**
 * shared monster drawing functions for eclipse components.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} type monster type, e.g., `swampthing` or `reaper`
 * @param {number} frame current frame, used for animation
 * @param {boolean} silhouette render as a silhouette?
 */
export function drawMonster(ctx, type, frame, silhouette) {
  switch (type) {
    case 'frankenstein':
      drawFrankenstein(ctx, frame, silhouette);
      break;
    case 'swampthing':
      drawSwampThing(ctx, frame, silhouette);
      break;
    case 'reaper':
      drawReaper(ctx, frame, silhouette);
      break;
    case 'butcher':
      drawButcher(ctx, frame, silhouette);
      break;
    case 'deadlysphere':
      drawDeadlySphere(ctx, frame, silhouette);
      break;
    case 'psycho':
      drawPsycho(ctx, frame, silhouette);
      break;
  }
}

/**
 * return silhouette colour if silhouette is `true`, otherwise returns `col`
 * @param {string} col
 * @param {boolean} silhouette
 * @returns {string}
 */
function c(col, silhouette) {
  return silhouette ? '#5a3a7a' : col;
}

/**
 * draw frankenstein - large lumbering humanoid with bolts.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} frame
 * @param {boolean} silhouette
 */
function drawFrankenstein(ctx, frame, silhouette) {
  const walk = Math.sin(frame * 0.08) * 5;

  // legs
  ctx.strokeStyle = c('#2a3a1a', silhouette);
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, -10);
  ctx.lineTo(-10, 10 + walk);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, -10);
  ctx.lineTo(8, 10 - walk);
  ctx.stroke();

  // body - big blocky torso
  ctx.fillStyle = c('#3a4a2a', silhouette);
  ctx.fillRect(-14, -45, 28, 35);

  // arms - outstretched like classic frankenstein
  ctx.strokeStyle = c('#3a4a2a', silhouette);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-14, -38);
  ctx.lineTo(-38, -36 + Math.sin(frame * 0.06) * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, -38);
  ctx.lineTo(38, -36 + Math.sin(frame * 0.06) * 2);
  ctx.stroke();

  // neck bolts
  if (!silhouette) {
    ctx.fillStyle = '#708060';
    ctx.fillRect(-14, -50, 5, 8);
    ctx.fillRect(9, -50, 5, 8);
  }

  // head
  ctx.fillStyle = c('#4a5a38', silhouette);
  ctx.fillRect(-11, -68, 22, 22);

  // face
  if (!silhouette) {
    ctx.fillStyle = '#ff4040';
    ctx.fillRect(-7, -62, 5, 4);
    ctx.fillRect(2, -62, 5, 4);
    ctx.fillStyle = '#2a3a1a';
    ctx.fillRect(-5, -54, 10, 3);
  }

  // hair
  ctx.fillStyle = c('#1a1a1a', silhouette);
  ctx.fillRect(-11, -68, 22, 5);
}

/**
 * draw swamp thing - hunched creature dripping with vines.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} frame
 * @param {boolean} silhouette
 */
function drawSwampThing(ctx, frame, silhouette) {
  const sway = Math.sin(frame * 0.05) * 3;

  // legs - hunched
  ctx.strokeStyle = c('#1a3a10', silhouette);
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -8);
  ctx.lineTo(-12, 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -8);
  ctx.lineTo(10, 12);
  ctx.stroke();

  // body - hunched blob
  ctx.fillStyle = c('#1a4010', silhouette);
  ctx.beginPath();
  ctx.moveTo(-18 + sway, -10);
  ctx.bezierCurveTo(-22 + sway, -30, -10, -55, 0, -55);
  ctx.bezierCurveTo(10, -55, 22, -30, 18 + sway, -10);
  ctx.closePath();
  ctx.fill();

  // vine drips
  if (!silhouette) {
    ctx.strokeStyle = '#0a2808';
    ctx.lineWidth = 2;
    [[-10, -20], [0, -15], [8, -25]].forEach(([vx, vy]) => {
      const dripLen = 8 + Math.sin(frame * 0.04 + vx) * 4;
      ctx.beginPath();
      ctx.moveTo(vx + sway, vy);
      ctx.bezierCurveTo(vx + sway + 3, vy + dripLen * 0.5, vx + sway - 2, vy + dripLen * 0.8, vx + sway, vy + dripLen);
      ctx.stroke();
    });
  }

  // arms - long dragging
  ctx.strokeStyle = c('#1a4010', silhouette);
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-15, -35 + sway);
  ctx.lineTo(-30, -15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(15, -35 + sway);
  ctx.lineTo(28, -18);
  ctx.stroke();

  // head
  ctx.fillStyle = c('#1a4010', silhouette);
  ctx.beginPath();
  ctx.arc(sway * 0.5, -60, 14, 0, Math.PI * 2);
  ctx.fill();

  // glowing eyes
  if (!silhouette) {
    ctx.fillStyle = '#40ff20';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#40ff20';
    ctx.beginPath();
    ctx.arc(-4 + sway * 0.5, -62, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4 + sway * 0.5, -62, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/**
 * draw the reaper - hooded floating figure with scythe.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} frame
 * @param {boolean} silhouette
 */
function drawReaper(ctx, frame, silhouette) {
  const float = Math.sin(frame * 0.04) * 4;

  ctx.save();
  ctx.translate(0, float);

  // cloak - flowing dark shape
  ctx.fillStyle = c('#0a0a14', silhouette);
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.bezierCurveTo(-22, -20, -20, -50, -12, -62);
  ctx.lineTo(12, -62);
  ctx.bezierCurveTo(20, -50, 22, -20, 18, 0);
  // wavy cloak bottom
  for (let wx = 3; wx >= -3; wx--) {
    ctx.quadraticCurveTo(wx * 6 + 2, 6, wx * 5.5, 0);
  }
  ctx.closePath();
  ctx.fill();

  // scythe handle
  ctx.strokeStyle = c('#3a2a10', silhouette);
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(14, -10);
  ctx.lineTo(30, -55);
  ctx.stroke();

  // scythe blade
  ctx.strokeStyle = c('#8090a0', silhouette);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(28, -52);
  ctx.bezierCurveTo(40, -70, 20, -75, 10, -65);
  ctx.stroke();

  // glowing eyes inside hood
  if (!silhouette) {
    ctx.fillStyle = '#ff2020';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(-3, -58, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, -58, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

/**
 * draw the butcher - large imposing figure with cleaver.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} frame
 * @param {boolean} silhouette
 */
function drawButcher(ctx, frame, silhouette) {
  const walk = Math.sin(frame * 0.1) * 4;

  // legs
  ctx.strokeStyle = c('#2a1010', silhouette);
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(-10, 14 + walk);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, -8);
  ctx.lineTo(10, 14 - walk);
  ctx.stroke();

  // large body
  ctx.fillStyle = c('#3a1818', silhouette);
  ctx.beginPath();
  ctx.ellipse(0, -35, 20, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // apron
  if (!silhouette) {
    ctx.fillStyle = '#c8a060';
    ctx.beginPath();
    ctx.moveTo(-12, -20);
    ctx.lineTo(12, -20);
    ctx.lineTo(8, 0);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();
    // blood stains
    ctx.fillStyle = 'rgba(180,20,20,0.7)';
    ctx.beginPath();
    ctx.ellipse(-4, -12, 4, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, -6, 3, 2, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // cleaver arm
  ctx.strokeStyle = c('#3a1818', silhouette);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(18, -45);
  ctx.lineTo(36, -38 + Math.sin(frame * 0.08) * 5);
  ctx.stroke();

  // cleaver blade
  ctx.fillStyle = c('#9098a8', silhouette);
  ctx.beginPath();
  ctx.moveTo(34, -44);
  ctx.lineTo(48, -40);
  ctx.lineTo(45, -28);
  ctx.lineTo(32, -30);
  ctx.closePath();
  ctx.fill();

  // other arm
  ctx.strokeStyle = c('#3a1818', silhouette);
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-18, -45);
  ctx.lineTo(-28, -30);
  ctx.stroke();

  // head
  ctx.fillStyle = c('#4a2020', silhouette);
  ctx.beginPath();
  ctx.arc(0, -62, 13, 0, Math.PI * 2);
  ctx.fill();

  // mask
  if (!silhouette) {
    ctx.fillStyle = '#c8b080';
    ctx.beginPath();
    ctx.ellipse(0, -62, 9, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a0808';
    ctx.beginPath();
    ctx.ellipse(-3, -64, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3, -64, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * draw the deadly sphere - floating spiky orb.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} frame
 * @param {boolean} silhouette
 */
function drawDeadlySphere(ctx, frame, silhouette) {
  const float = Math.sin(frame * 0.06) * 5;
  const spin = frame * 0.04;
  const r = 18;

  ctx.save();
  ctx.translate(0, -40 + float);

  // outer glow
  if (!silhouette) {
    const glow = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2);
    glow.addColorStop(0, 'rgba(180,20,20,0.3)');
    glow.addColorStop(1, 'rgba(180,20,20,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // spikes
  const spikeCount = 10;
  ctx.strokeStyle = c('#8a1010', silhouette);
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < spikeCount; i++) {
    const a = spin + (i / spikeCount) * Math.PI * 2;
    const pulsedR = r + Math.sin(frame * 0.08 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8);
    ctx.lineTo(Math.cos(a) * (pulsedR + 8), Math.sin(a) * (pulsedR + 8));
    ctx.stroke();
  }

  // main orb
  const orbGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
  if (silhouette) {
    ctx.fillStyle = '#0a0a14';
  } else {
    orbGrad.addColorStop(0, '#ff4040');
    orbGrad.addColorStop(0.5, '#aa1010');
    orbGrad.addColorStop(1, '#500808');
    ctx.fillStyle = orbGrad;
  }
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  // eye
  if (!silhouette) {
    ctx.fillStyle = '#ff8020';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff4000';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 10, spin, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0000';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(0, 0, 3, 8, spin, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(-2, -3, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * draw the psycho - wiry frantic figure with knife.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} frame
 * @param {boolean} silhouette
 */
function drawPsycho(ctx, frame, silhouette) {
  const jerk = Math.sin(frame * 0.25) * 3; // fast twitchy movement
  const walk = Math.sin(frame * 0.18) * 6;

  // legs - fast twitchy
  ctx.strokeStyle = c('#102030', silhouette);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-5, -5);
  ctx.lineTo(-8, 14 + walk);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(6, 14 - walk);
  ctx.stroke();

  // body - wiry
  ctx.fillStyle = c('#102030', silhouette);
  ctx.beginPath();
  ctx.ellipse(jerk * 0.3, -28, 10, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // strait jacket straps
  if (!silhouette) {
    ctx.strokeStyle = '#e0d0a0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -40);
    ctx.lineTo(10, -35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, -30);
    ctx.lineTo(10, -28);
    ctx.stroke();
  }

  // raised knife arm
  const knifeAngle = -1.2 + Math.sin(frame * 0.15) * 0.4;
  ctx.strokeStyle = c('#102030', silhouette);
  ctx.lineWidth = 5;
  ctx.save();
  ctx.translate(12, -40);
  ctx.rotate(knifeAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -22);
  ctx.stroke();
  // knife blade
  ctx.fillStyle = c('#c0c8d0', silhouette);
  ctx.beginPath();
  ctx.moveTo(-2, -20);
  ctx.lineTo(3, -20);
  ctx.lineTo(1, -34);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // other arm flailing
  ctx.strokeStyle = c('#102030', silhouette);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-10, -40);
  ctx.lineTo(-24 + jerk, -28 + jerk);
  ctx.stroke();

  // head - small, tilted
  ctx.save();
  ctx.translate(jerk * 0.5, -52);
  ctx.rotate(jerk * 0.04);
  ctx.fillStyle = c('#1a2a3a', silhouette);
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  if (!silhouette) {
    // wide crazy eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-3.5, -1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3.5, -1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(-3.5 + jerk * 0.1, -1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3.5 + jerk * 0.1, -1, 2, 0, Math.PI * 2);
    ctx.fill();
    // manic grin
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 2, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  ctx.restore();
}