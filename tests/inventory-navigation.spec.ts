import { test, expect } from '@playwright/test';

test('inventory menu navigation works correctly', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('http://localhost:3000/game/test');
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(4000);

  // Skip title
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);

  console.log('\n=== Opening Inventory (Bag) ===\n');

  // Press B to open bag
  await page.keyboard.press('KeyB');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/inventory-1-opened.png' });

  // Get initial menu state
  const initial = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const bag = game?.scene.getScene('BagScene');
    return {
      sceneActive: game?.scene.isActive('BagScene'),
      selectedOption: bag?.selectedOption,
      menuText: bag?.menuText?.text || '',
      currentState: bag?.currentState,
      availableItemsCount: bag?.availableItems?.length,
    };
  });

  console.log('Initial state:', initial);

  // Try pressing DOWN
  console.log('\n=== Pressing DOWN ===');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);

  const afterDown1 = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const bag = game?.scene.getScene('BagScene');
    return {
      selectedOption: bag?.selectedOption,
      menuText: bag?.menuText?.text || '',
      availableItemsCount: bag?.availableItems?.length,
    };
  });

  console.log('After 1st DOWN:', afterDown1);
  await page.screenshot({ path: 'test-results/inventory-2-after-down-1.png' });

  // Try pressing DOWN again
  console.log('\n=== Pressing DOWN again ===');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);

  const afterDown2 = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const bag = game?.scene.getScene('BagScene');
    return {
      selectedOption: bag?.selectedOption,
      menuText: bag?.menuText?.text || '',
    };
  });

  console.log('After 2nd DOWN:', afterDown2);
  await page.screenshot({ path: 'test-results/inventory-3-after-down-2.png' });

  // Try pressing UP
  console.log('\n=== Pressing UP ===');
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(300);

  const afterUp = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const bag = game?.scene.getScene('BagScene');
    return {
      selectedOption: bag?.selectedOption,
      menuText: bag?.menuText?.text || '',
    };
  });

  console.log('After UP:', afterUp);
  await page.screenshot({ path: 'test-results/inventory-4-after-up.png' });

  // Try cycling through all options
  console.log('\n=== Cycling through all options ===');
  const availableCount = initial.availableItemsCount || 0;
  const totalOptions = availableCount + 1; // items + exit

  for (let i = 0; i < totalOptions + 2; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      const bag = game?.scene.getScene('BagScene');
      return bag?.selectedOption;
    });

    console.log(`After DOWN ${i + 1}: selectedOption = ${state}`);
  }

  await page.screenshot({ path: 'test-results/inventory-5-cycled.png' });

  console.log('\n=== Test Complete ===\n');
});
