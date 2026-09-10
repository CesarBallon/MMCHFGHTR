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

test('a heavier hit produces more hitstop and screen shake than a light one', () => {
  const { context: c1, match: m1 } = makeContext();
  c1.hit(fighter(400, 1), fighter(460, -1), 6, 4, -2, 0.2, '#fff');
  const { context: c2, match: m2 } = makeContext();
  c2.hit(fighter(400, 1), fighter(460, -1), 17, 8, -10, 0.45, '#fff');
  assert.ok(m2.hitstop > m1.hitstop);
  assert.ok(m2.shake > m1.shake);
});

test('canAct is false deep in a knockdown, true in the closing reversal window, true when neutral', () => {
  const { context } = makeContext();
  assert.equal(context.canAct({ action: 'down', timer: 0.5, stun: 0.5, cool: 0.5 }), false);
  assert.equal(context.canAct({ action: 'down', timer: 0.1, stun: 0.1, cool: 0.1 }), true);
  assert.equal(context.canAct({ action: 'idle', timer: 0, stun: 0, cool: 0 }), true);
});

test('a reversal thrown from the wake-up window clears wake-up invincibility once it commits', () => {
  const { context } = makeContext();
  const f = fighter(400, 1, { action: 'down', timer: 0.1, stun: 0.1, cool: 0.1, wakeupInvincible: true });
  assert.ok(context.canAct(f));
  context.melee(f, 'light', false, false);
  assert.equal(f.wakeupInvincible, false);
  assert.equal(f.action, 'light');
});

test('a button press during an unactionable frame is buffered and fires the instant the fighter becomes actionable', () => {
  const { context } = makeContext();
  const f = fighter(400, 1, { action: 'block', stun: 0.05, cool: 0.05 });
  const o = fighter(460, -1);
  let firedOnFrame = null;
  for (let i = 0; i < 20; i += 1) {
    context.updateFighter(f, o, { pressed: { light: i === 0 } }, 1 / 60);
    if (f.action === 'light' && firedOnFrame === null) firedOnFrame = i;
  }
  assert.ok(firedOnFrame !== null && firedOnFrame > 0, 'buffered press should fire a few frames later, not be dropped');
});

test('a press outside the buffer window is dropped, not fired late', () => {
  const { context } = makeContext();
  const f = fighter(400, 1, { action: 'block', stun: 0.3, cool: 0.3 });
  const o = fighter(460, -1);
  for (let i = 0; i < 5; i += 1) context.updateFighter(f, o, { pressed: { light: i === 0 } }, 1 / 60);
  for (let i = 0; i < 20; i += 1) context.updateFighter(f, o, { pressed: {} }, 1 / 60);
  assert.notEqual(f.action, 'light');
});

test('separate light-then-heavy presses a few frames apart do not misfire as a throw', () => {
  const { context } = makeContext();
  const f = fighter(400, 1, { action: 'block', stun: 0.05, cool: 0.05 });
  const o = fighter(900, -1);
  context.updateFighter(f, o, { pressed: { light: true } }, 1 / 60);
  context.updateFighter(f, o, { pressed: { heavy: true } }, 1 / 60);
  for (let i = 0; i < 10; i += 1) context.updateFighter(f, o, { pressed: {} }, 1 / 60);
  assert.notEqual(f.action, 'throw');
});

test('a true simultaneous light+heavy press still buffers into a throw attempt', () => {
  const { context } = makeContext();
  const f = fighter(400, 1, { action: 'block', stun: 0.05, cool: 0.05 });
  const o = fighter(430, -1);
  context.updateFighter(f, o, { pressed: { light: true, heavy: true } }, 1 / 60);
  let firedOnFrame = null;
  for (let i = 0; i < 10; i += 1) {
    context.updateFighter(f, o, { pressed: {} }, 1 / 60);
    if (f.action === 'throw' && firedOnFrame === null) firedOnFrame = i;
  }
  assert.ok(firedOnFrame !== null);
});
