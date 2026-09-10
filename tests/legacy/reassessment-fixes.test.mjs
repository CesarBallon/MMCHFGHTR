import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const game = readFileSync(new URL('../../dist/game.js', import.meta.url), 'utf8');
const combatSource = game.slice(game.indexOf('  function rects('), game.indexOf('  function updateProjectiles('));

function makeContext() {
  const match = { particles: [], shake: 0, hitstop: 0, state: 'fight' };
  const context = vm.createContext({ sfx() {}, match, FLOOR: 628, W: 1280 });
  vm.runInContext(combatSource, context);
  return { context, match };
}
function fighter(x, facing, extra = {}) {
  return Object.assign({
    d: { id: 'saja', size: 306, speed: 4.8, jump: 12, accent: '#fff', power: 1, defense: 1 },
    x, y: 628, facing, vx: 0, vy: 0, grounded: true, crouching: false, block: false,
    stun: 0, hp: 100, meter: 0, combo: 0, lastHit: undefined, attackId: 0,
    timer: 0, cool: 0, flash: 0, trail: [],
  }, extra);
}

test('a blocked hit resets the combo chain, so a later guard-break is not scaled by a stale prior combo', () => {
  const { context } = makeContext();
  const a = fighter(400, 1), d = fighter(460, -1);
  for (let i = 0; i < 5; i += 1) { a.attackId += 1; context.hit(a, d, 10, 4, -2, 0.5, '#fff'); }
  assert.equal(d.hitsTaken, 5);
  d.stun = 0; d.block = true; d.facing = -1;
  a.attackId += 1; context.hit(a, d, 10, 4, -2, 0.11, '#fff');
  assert.equal(d.hitsTaken, 0, 'blocking should clear the combo chain');
  d.block = false;
  const hpBefore = d.hp;
  a.attackId += 1;
  context.hit(a, d, 10, 4, -2, 0.2, '#fff', false, 'low');
  const dmg = hpBefore - d.hp;
  assert.ok(dmg > 9.9 && dmg <= 10.01, `guard-breaking hit should deal full base damage, got ${dmg}`);
});

test('the jumpattack multi-hit is classified as overhead (beats crouch block, blocked only standing)', () => {
  const { context } = makeContext();
  const crouchBlock = fighter(430, -1, { block: true, crouching: true, facing: -1 });
  const a1 = fighter(400, 1);
  const landed = context.hit(a1, crouchBlock, 3.2, 2, -2, 0.13, '#62b7ff', false, 'overhead');
  assert.ok(landed);
  assert.ok(crouchBlock.hp < 100, 'a jump-in hit should not be blockable while crouching');

  const standBlock = fighter(430, -1, { block: true, crouching: false, facing: -1 });
  const a2 = fighter(400, 1);
  context.hit(a2, standBlock, 3.2, 2, -2, 0.13, '#62b7ff', false, 'overhead');
  assert.ok(standBlock.hp > 99, 'a jump-in hit should still be blockable standing');
});
