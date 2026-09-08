import { describe, expect, test } from 'vitest';
import { createInitialState, InputFlag, stepMatch } from '../../src/core';

describe('simulation performance budget', () => {
  test('advances 20,000 deterministic frames within two seconds', () => {
    let state = createInitialState(0x4d4d4348);
    const started = performance.now();
    for (let frame = 0; frame < 20_000; frame += 1) {
      const first = frame % 180 < 90 ? InputFlag.Right : InputFlag.Left;
      const second = frame % 240 < 120 ? InputFlag.Left : InputFlag.Right;
      state = stepMatch(state, [first, second]);
    }
    const durationMs = performance.now() - started;
    console.log(`simulation_budget frames=20000 duration_ms=${durationMs.toFixed(2)}`);
    expect(state.frame).toBe(20_000);
    expect(durationMs).toBeLessThan(2_000);
  });
});
