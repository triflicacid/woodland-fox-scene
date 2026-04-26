import {DrawComponent} from '@/core/DrawComponent';
import {prob, rnd} from '@/utils';
import {drawMonster, randomMonster, randomMonsterForm} from "@/components/eclipse/drawMonsters";
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
    const {W} = this;
    this._spawnCooldown--;

    if (this._spawnCooldown <= 0 && prob(PROBABILITY.ECLIPSE.MONSTER_SPAWN)) {
      this.summon();
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
          drawMonster(ctx, m.type, frame + m.phase, false, m.form);
          ctx.restore();
        });
  }

  /**
   * summon a monster of the given type
   * @type {string | undefined} type monster type (random if unspecified)
   * @type {number | undefined} form monster form (random if unspecified)
   */
  summon(type = undefined, form = undefined) {
    if (type === undefined) type = randomMonster();
    const fromRight = prob(0.5);
    this._monsters.push({
      x: fromRight ? this.W + 60 : -60,
      y: this.H * 0.62,
      vx: fromRight ? -(0.6 + rnd(0.5)) : (0.6 + rnd(0.5)),
      type,
      form: form !== undefined ? form : randomMonsterForm(type),
      phase: rnd(Math.PI * 2),
      scale: 0.9 + rnd(0.4),
    });
  }
}