import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const game = readFileSync(new URL('../../dist/game.js', import.meta.url), 'utf8');
const combatSource = game.slice(game.indexOf('  function rects('), game.indexOf('  function projectile('));

function fixture() {
  const match = { particles: [], shake: 0, hitstop: 0, state: 'fight' };
  const context = vm.createContext({ sfx() {}, match });
  vm.runInContext(combatSource, context);
  const attacker = { d: { id: 'saja', size: 306, accent: '#fff', power: 1 }, x: 400, y: 628, facing: 1, stun: 0, lastHit: undefined, attackId: 0 };
  const defender = { d: { id: 'benita', size: 312, defense: 1 }, x: 460, y: 628, facing: -1, block: false, grounded: true, stun: 0, hp: 100, meter: 0, combo: 0 };
  return { context, attacker, defender };
}

test('rects() detects overlap even when one box is much smaller than the other', () => {
  const { context } = fixture();
  // A short, narrow attack box against a tall hurtbox it genuinely overlaps.
  const attackBox = { x: 420, y: 511.5, w: 77, h: 64.2 };
  const hurtBox = { x: 407.7, y: 389, w: 104.6, h: 233 };
  assert.equal(context.rects(attackBox, hurtBox), true);
});

test('rects() still rejects boxes that truly do not overlap', () => {
  const { context } = fixture();
  assert.equal(context.rects({ x: 0, y: 0, w: 10, h: 10 }, { x: 100, y: 100, w: 10, h: 10 }), false);
});

test('a press does not resolve a hit on the same frame (real startup delay)', () => {
  const { context, attacker, defender } = fixture();
  context.melee(attacker, 'light');
  context.resolveMeleeHit(attacker, defender);
  assert.equal(attacker.hitResolved, false);
  assert.equal(defender.hp, 100);
});

test('a light attack in range connects once elapsed time enters the active window', () => {
  const { context, attacker, defender } = fixture();
  context.melee(attacker, 'light');
  let hitFrame = null;
  for (let i = 0; i < 20; i += 1) {
    attacker.timer = Math.max(0, attacker.timer - 1 / 60);
    context.resolveMeleeHit(attacker, defender);
    if (attacker.hitResolved && hitFrame === null) hitFrame = i;
  }
  assert.ok(hitFrame !== null, 'expected the attack to connect before recovery ended');
  const elapsedAtHit = attacker.actionDuration - (attacker.actionDuration - (hitFrame + 1) / 60);
  assert.ok(elapsedAtHit >= attacker.atkStartup, 'hit should not land before startup ends');
  assert.ok(elapsedAtHit < attacker.atkActiveEnd, 'hit should not land after the active window closes');
  assert.ok(defender.hp < 100, 'defender should have taken damage');
});

test('a light attack only resolves once per press (no double-hit within the active window)', () => {
  const { context, attacker, defender } = fixture();
  context.melee(attacker, 'light');
  for (let i = 0; i < 20; i += 1) {
    attacker.timer = Math.max(0, attacker.timer - 1 / 60);
    context.resolveMeleeHit(attacker, defender);
  }
  const hpAfterFirstResolution = defender.hp;
  for (let i = 0; i < 10; i += 1) {
    attacker.timer = Math.max(0, attacker.timer - 1 / 60);
    context.resolveMeleeHit(attacker, defender);
  }
  assert.equal(defender.hp, hpAfterFirstResolution);
});

test('an out-of-range light attack never resolves a hit', () => {
  const { context, attacker, defender } = fixture();
  defender.x = attacker.x + 1000;
  context.melee(attacker, 'light');
  for (let i = 0; i < 20; i += 1) {
    attacker.timer = Math.max(0, attacker.timer - 1 / 60);
    context.resolveMeleeHit(attacker, defender);
  }
  assert.equal(attacker.hitResolved, false);
  assert.equal(defender.hp, 100);
});
