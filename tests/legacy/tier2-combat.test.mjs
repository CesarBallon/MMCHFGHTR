import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const game = readFileSync(new URL('../../dist/game.js', import.meta.url), 'utf8');
const combatSource = game.slice(game.indexOf('  function rects('), game.indexOf('  function projectile('));

function makeContext() {
  const match = { particles: [], shake: 0, hitstop: 0, state: 'fight' };
  const context = vm.createContext({ sfx() {}, match });
  vm.runInContext(combatSource, context);
  return context;
}
function fighter(x, facing, extra = {}) {
  return Object.assign({
    d: { id: 'saja', size: 306, accent: '#fff', power: 1, defense: 1 },
    x, y: 628, facing, vx: 0, vy: 0, grounded: true, crouching: false, block: false,
    stun: 0, hp: 100, meter: 0, combo: 0, lastHit: undefined, attackId: 0,
  }, extra);
}

test('hit() pushes both fighters apart, attacker less than defender', () => {
  const context = makeContext();
  const a = fighter(400, 1), d = fighter(460, -1);
  context.hit(a, d, 10, 8, -2, 0.2, '#fff');
  assert.ok(d.vx > 0, 'defender pushed away from attacker');
  assert.ok(a.vx < 0, 'attacker pushed away from defender');
});

test('pushback on block is stronger than pushback on hit (prevents block infinites)', () => {
  const hitCtx = makeContext();
  const a1 = fighter(400, 1), d1 = fighter(460, -1);
  hitCtx.hit(a1, d1, 10, 8, -2, 0.2, '#fff');
  const blockCtx = makeContext();
  const a2 = fighter(400, 1), d2 = fighter(460, -1, { block: true, facing: -1 });
  blockCtx.hit(a2, d2, 10, 8, -2, 0.2, '#fff');
  assert.ok(Math.abs(a2.vx) > Math.abs(a1.vx));
});

test('damage scales down across a chained combo and floors at 50%', () => {
  const context = makeContext();
  const a = fighter(400, 1), d = fighter(460, -1);
  const dmgs = [];
  let prevHp = d.hp;
  for (let i = 0; i < 6; i += 1) {
    a.attackId += 1;
    context.hit(a, d, 10, 4, -2, 0.5, '#fff');
    dmgs.push(prevHp - d.hp);
    prevHp = d.hp;
  }
  for (let i = 1; i < dmgs.length; i += 1) assert.ok(dmgs[i] <= dmgs[i - 1], `hit ${i} should not deal more than hit ${i - 1}`);
  assert.ok(dmgs[dmgs.length - 1] >= 4.9 && dmgs[dmgs.length - 1] <= 5.1, 'damage should floor around 50% of base');
});

test('a fresh hit (defender not currently stunned) is not scaled', () => {
  const context = makeContext();
  const a = fighter(400, 1), d = fighter(460, -1);
  context.hit(a, d, 10, 4, -2, 0.01, '#fff');
  const hpAfterFirst = d.hp;
  d.stun = 0;
  a.attackId += 1;
  context.hit(a, d, 10, 4, -2, 0.01, '#fff');
  assert.equal(hpAfterFirst - d.hp, hpAfterFirst - (hpAfterFirst - 10), 'second unchained hit should deal full base damage again');
});

test('an overhead attack beats a crouching block', () => {
  const context = makeContext();
  const a = fighter(400, 1), d = fighter(460, -1, { block: true, crouching: true, facing: -1 });
  context.hit(a, d, 10, 4, -2, 0.2, '#fff', false, 'overhead');
  assert.ok(d.hp < 95, 'overhead should not be blocked by a crouching defender');
});

test('an overhead attack is still blocked standing', () => {
  const context = makeContext();
  const a = fighter(400, 1), d = fighter(460, -1, { block: true, crouching: false, facing: -1 });
  context.hit(a, d, 10, 4, -2, 0.2, '#fff', false, 'overhead');
  assert.ok(d.hp > 95, 'overhead should be blocked by a standing defender');
});

test('a low attack beats a standing block', () => {
  const context = makeContext();
  const a = fighter(400, 1), d = fighter(460, -1, { block: true, crouching: false, facing: -1 });
  context.hit(a, d, 10, 4, -2, 0.2, '#fff', false, 'low');
  assert.ok(d.hp < 95, 'low should not be blocked by a standing defender');
});

test('a low attack is still blocked crouching', () => {
  const context = makeContext();
  const a = fighter(400, 1), d = fighter(460, -1, { block: true, crouching: true, facing: -1 });
  context.hit(a, d, 10, 4, -2, 0.2, '#fff', false, 'low');
  assert.ok(d.hp > 95, 'low should be blocked by a crouching defender');
});

test('a mid attack is blocked regardless of stance', () => {
  const context = makeContext();
  const a = fighter(400, 1);
  const standing = fighter(460, -1, { block: true, crouching: false, facing: -1 });
  const crouched = fighter(460, -1, { block: true, crouching: true, facing: -1 });
  context.hit(a, standing, 10, 4, -2, 0.2, '#fff', false, 'mid');
  a.attackId += 1;
  context.hit(a, crouched, 10, 4, -2, 0.2, '#fff', false, 'mid');
  assert.ok(standing.hp > 95 && crouched.hp > 95);
});

test('a throw in range beats block and applies a hard knockdown', () => {
  const context = makeContext();
  const a = fighter(400, 1), d = fighter(440, -1, { block: true, facing: -1 });
  context.throwAttempt(a, d);
  assert.equal(a.action, 'throw');
  assert.equal(d.action, 'thrown');
  assert.ok(d.hp < 100);
  assert.equal(d.knockdown, true);
  assert.equal(d.grounded, false);
});

test('a throw attempt out of range whiffs without affecting the opponent, with shorter recovery than a landed throw', () => {
  const landed = makeContext();
  const a1 = fighter(400, 1), d1 = fighter(440, -1);
  landed.throwAttempt(a1, d1);
  const whiffed = makeContext();
  const a2 = fighter(400, 1), d2 = fighter(900, -1);
  whiffed.throwAttempt(a2, d2);
  assert.equal(d2.hp, 100);
  assert.equal(d2.action, undefined);
  assert.ok(a2.timer < a1.timer, 'a whiffed throw should recover faster than a landed one');
});

test('wake-up invincibility prevents a downed fighter from being hit', () => {
  const context = makeContext();
  const a = fighter(400, 1), d = fighter(460, -1, { wakeupInvincible: true });
  const landed = context.hit(a, d, 20, 4, -2, 0.2, '#fff');
  assert.equal(landed, false);
  assert.equal(d.hp, 100);
});

test('a hit landing on an airborne defender flags a hard knockdown', () => {
  const context = makeContext();
  const a = fighter(400, 1), d = fighter(460, -1, { grounded: false });
  context.hit(a, d, 10, 4, -2, 0.2, '#fff');
  assert.equal(d.knockdown, true);
});
