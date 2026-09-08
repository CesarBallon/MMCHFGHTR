import { expect, test, type Page } from '@playwright/test';

const status = (page: Page) => page.locator('#status');

async function boot(page: Page, expectKeyboardPrompt = true): Promise<void> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#loading')).toHaveClass(/hide/, { timeout: 60_000 });
  await expect(page.locator('#game')).toBeVisible();
  if (expectKeyboardPrompt) await expect(status(page)).toContainText('Press Enter');
  expect(errors, 'uncaught errors while loading the game').toEqual([]);
}

async function canvasSignature(page: Page): Promise<number> {
  return page.locator('#game').evaluate((node: HTMLCanvasElement) => {
    const context = node.getContext('2d');
    if (!context) return 0;
    const pixels = context.getImageData(0, 0, node.width, node.height).data;
    let signature = 0;
    for (let index = 0; index < pixels.length; index += 4096) {
      signature = (signature + pixels[index]! + pixels[index + 1]! + pixels[index + 2]!) >>> 0;
    }
    return signature;
  });
}

test('boots the playable title screen and renders the canvas', async ({ page }) => {
  await boot(page);
  await expect(page).toHaveTitle('Mamacha Fighter');
  expect(await canvasSignature(page)).toBeGreaterThan(0);
});

test('keyboard starts arcade mode, selects a fighter, and accepts combat input', async ({ page }) => {
  await boot(page);
  await page.keyboard.press('Enter');
  await expect(status(page)).toHaveText('Choose your fighter');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('KeyJ');
  await expect(status(page)).toContainText('PRISON YARD');
  await page.keyboard.press('KeyD');
  await page.keyboard.press('KeyJ');
  await expect(status(page)).toContainText('Arcade');
});

test('keyboard completes the two-player local-versus selection flow', async ({ page }) => {
  await boot(page);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(status(page)).toHaveText('Choose your fighter');
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(100);
  await expect(status(page)).toHaveText('Choose your fighter');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Numpad1');
  await expect(status(page)).toContainText('LAKE TITICACA');
  await expect(status(page)).toContainText('Local versus');
});

test('a standard gamepad can enter fighter selection', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { connected: true };
    const buttons = Array.from({ length: 16 }, () => ({ pressed: false, touched: false, value: 0 }));
    const pad = { axes: [0, 0, 0, 0], buttons, connected: true, id: 'Smoke Test Gamepad', index: 0, mapping: 'standard', timestamp: 0 };
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => state.connected ? [pad] : [] });
    Object.assign(window, {
      __gamepadButton(index: number, pressed: boolean) {
        buttons[index] = { pressed, touched: pressed, value: pressed ? 1 : 0 };
        pad.timestamp += 1;
      },
      __disconnectGamepad() { state.connected = false; },
    });
  });
  await boot(page, false);
  await page.evaluate(() => (window as unknown as { __gamepadButton(index: number, pressed: boolean): void }).__gamepadButton(9, true));
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    const controls = window as unknown as { __gamepadButton(index: number, pressed: boolean): void; __disconnectGamepad(): void };
    controls.__gamepadButton(9, false);
    controls.__disconnectGamepad();
  });
  await expect(status(page)).toHaveText('Choose your fighter');
});
