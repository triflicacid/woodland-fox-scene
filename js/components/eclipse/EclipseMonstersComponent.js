import {DrawComponent} from '@/core/DrawComponent';
import {prob, rnd} from '@/utils';
import {drawMonster, randomMonster} from "@/components/eclipse/drawMonsters";
import {PROBABILITY} from "@/config";

/**
 * foreground walking monsters during solar eclipse.
 * drawn in front of trees, sorted by y for correct perspective.
 */
export class EclipseMonstersComponent extends DrawComponent {
  /** @type {Array<Object>} */
  _monsters = [];
  _spawnCooldown = 0;

  static COMPONENT_NAME = "EclipseMonstersComponent";
  getName() {
    return EclipseMonstersComponent.COMPONENT_NAME;
  }

  isEnabled() {
    return this.scene.specialEvent === 'eclipse';
  }

  tick() {
    const {W, H} = this;
    this._spawnCooldown--;

    if (this._spawnCooldown <= 0 && prob(PROBABILITY.ECLIPSE.MONSTER_SPAWN)) {
      const fromRight = prob(0.5);
      this._monsters.push({
        x: fromRight ? W + 60 : -60,
        y: H * 0.62,
        vx: fromRight ? -(0.6 + rnd(0.5)) : (0.6 + rnd(0.5)),
        type: randomMonster(),
        phase: rnd(Math.PI * 2),
        scale: 0.9 + rnd(0.4),
      });
      this._spawnCooldown = 100 + Math.floor(rnd(150));
    }

    this._monsters = this._monsters.filter(m => {
      m.x += m.vx;
      return m.x > -100 && m.x < W + 100;
    });
  }

  draw() {
    const {ctx} = this;
    const {frame} = this.scene;

    this._monsters
        .sort((a, b) => a.y - b.y)
        .forEach(m => {
          ctx.save();
          ctx.translate(m.x, m.y);
          ctx.scale(m.scale * (m.vx < 0 ? -1 : 1), m.scale);
          drawMonster(ctx, m.type, frame + m.phase, false);
          ctx.restore();
        });
  }
}