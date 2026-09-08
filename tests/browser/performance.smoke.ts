import { expect, test } from '@playwright/test';

test('startup, download, rendering, and memory stay within M1 budgets', async ({ page }) => {
  const started = Date.now();
  await page.goto('/');
  await expect(page.locator('#loading')).toHaveClass(/hide/, { timeout: 60_000 });
  const bootMs = Date.now() - started;
  const metrics = await page.evaluate(async () => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const transferBytes = resources.reduce((sum, entry) => sum + entry.transferSize, 0);
    const intervals: number[] = [];
    await new Promise<void>((resolve) => {
      let previous = performance.now();
      const sample = (now: number) => {
        intervals.push(now - previous);
        previous = now;
        if (intervals.length >= 120) resolve();
        else requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    intervals.sort((a, b) => a - b);
    const p95FrameMs = intervals[Math.floor(intervals.length * 0.95)] ?? Infinity;
    const memory = performance as Performance & { memory?: { usedJSHeapSize: number } };
    return { transferBytes, p95FrameMs, usedJSHeapBytes: memory.memory?.usedJSHeapSize ?? 0 };
  });

  console.log(`browser_budget boot_ms=${bootMs} transfer_bytes=${metrics.transferBytes} p95_frame_ms=${metrics.p95FrameMs.toFixed(2)} used_js_heap_bytes=${metrics.usedJSHeapBytes}`);
  expect(bootMs).toBeLessThan(60_000);
  expect(metrics.transferBytes).toBeLessThan(70 * 1024 * 1024);
  expect(metrics.p95FrameMs).toBeLessThan(75);
  if (metrics.usedJSHeapBytes > 0) expect(metrics.usedJSHeapBytes).toBeLessThan(256 * 1024 * 1024);
});
