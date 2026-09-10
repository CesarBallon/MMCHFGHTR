import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const game = readFileSync(new URL('../../dist/game.js', import.meta.url), 'utf8');
const combatSource = game.slice(game.indexOf('  function rects('), game.indexOf('  function updateProjectiles('));

function makeContext() {
  const match = { particles: [], shake: 0, hitstop: 0, state: 'fight', projectiles: [] };
  const context = vm.createContext({ sfx() {}, match, FLOOR: 628, W: 1280 });
  vm.runInContext(combatSource, context);
  return { context, match };
}
function fighter(x, facing, kind, extra = {}) {
  return Object.assign({
    d: { id: 'f', size: 310, speed: 4.8, jump: 12, accent: '#fff', power: 1, defense: 1, kind },
    x, y: 628, facing, vx: 0, vy: 0, grounded: true, crouching: false, block: false,
    stun: 0, hp: 100, meter: 0, combo: 0, lastHit: undefined, attackId: 0,
    timer: 0, cool: 0, flash: 0, trail: [],
  }, extra);
}

test('a projectile special does not spawn its projectile on the same frame it is pressed', () => {
  const { context, match } = makeContext();
  const f = fighter(400, 1, 'heavy'), o = fighter(500, -1, 'balanced');
  context.special(f, o, 1);
  assert.equal(match.projectiles.length, 0);
});

test('a projectile special spawns its projectile once the startup window elapses', () => {
  const { context, match } = makeContext();
  const f = fighter(400, 1, 'heavy'), o = fighter(500, -1, 'balanced');
  context.special(f, o, 1);
  for (let i = 0; i < 15; i += 1) {
    f.timer = Math.max(0, f.timer - 1 / 60);
    context.resolveSpecial(f, o);
  }
  assert.equal(match.projectiles.length, 1);
});

test('a melee-hitbox special (whip) does not resolve its hit check on the press frame', () => {
  const { context } = makeContext();
  const f = fighter(400, 1, 'whip'), o = fighter(430, -1, 'balanced');
  context.special(f, o, 1);
  context.resolveSpecial(f, o);
  assert.equal(o.hp, 100, 'the whip hit should not have resolved yet on the same frame');
});

test('a melee-hitbox special (whip) connects once its startup window elapses, if still in range', () => {
  const { context } = makeContext();
  const f = fighter(400, 1, 'whip'), o = fighter(430, -1, 'balanced');
  context.special(f, o, 1);
  for (let i = 0; i < 15; i += 1) {
    f.timer = Math.max(0, f.timer - 1 / 60);
    context.resolveSpecial(f, o);
  }
  assert.ok(o.hp < 100);
});

test('a special only resolves once, even if resolveSpecial is called many times after the window opens', () => {
  const { context, match } = makeContext();
  const f = fighter(400, 1, 'heavy'), o = fighter(500, -1, 'balanced');
  context.special(f, o, 1);
  for (let i = 0; i < 30; i += 1) {
    f.timer = Math.max(0, f.timer - 1 / 60);
    context.resolveSpecial(f, o);
  }
  assert.equal(match.projectiles.length, 1);
});
