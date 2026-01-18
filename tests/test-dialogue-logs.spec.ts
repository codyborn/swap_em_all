import { test } from '@playwright/test';

test('dialogue logs debug', async ({ page }) => {
  test.setTimeout(60000);

  const logs: string[] = [];
  page.on('console', msg => {
    if (msg.text().includes('[Overworld]')) {
      logs.push(msg.text());
      console.log(msg.text());
    }
  });

  await page.goto('http://localhost:3000/game/test');
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(4000);

  // Skip title
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);

  // Move to nurse (adjust to get closer)
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
  }
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
  }

  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/dialogue-debug-1-before.png' });

  console.log('\n=== PRESSING SPACE (1st time) ===');
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/dialogue-debug-2-first-space.png' });

  console.log('\n=== PRESSING SPACE (2nd time) ===');
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/dialogue-debug-3-second-space.png' });

  console.log('\n=== PRESSING SPACE (3rd time) ===');
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/dialogue-debug-4-third-space.png' });

  console.log('\n=== All logs ===');
  logs.forEach(log => console.log(log));

  await page.waitForTimeout(2000);
});
