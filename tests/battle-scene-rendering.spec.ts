import { test, expect } from '@playwright/test';

test.describe('Battle Scene Rendering', () => {
  test('should handle NPC interaction and battle scene loading', async ({ page }) => {
    const errors: string[] = [];

    // Capture all errors
    page.on('pageerror', err => {
      errors.push(`PAGE ERROR: ${err.message}\n${err.stack}`);
      console.error('PAGE ERROR:', err.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`CONSOLE ERROR: ${msg.text()}`);
        console.error('CONSOLE ERROR:', msg.text());
      }
    });

    // Navigate to game
    await page.goto('http://localhost:3000/game/test');
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Skip title screen
    await page.waitForTimeout(2000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    console.log('\n=== Testing NPC Interactions and Battle Scene ===');

    // Navigate to Professor (top-left area)
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(100);
    }

    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
    }

    // Take screenshot before interaction
    await page.screenshot({
      path: 'test-results/battle-test-before-interaction.png'
    });

    console.log('Interacting with Professor...');

    // Interact
    await page.keyboard.press('Space');

    // Wait for potential dialogue or scene transition
    await page.waitForTimeout(1500);

    // Also test force encounter
    console.log('\n=== Testing Force Encounter ===');
    await page.keyboard.press('Escape'); // Close any menus
    await page.waitForTimeout(300);

    await page.keyboard.press('e'); // Force encounter

    // Wait longer for battle scene to load and render
    await page.waitForTimeout(2000);

    // Take screenshot after interaction
    await page.screenshot({
      path: 'test-results/battle-test-after-interaction.png',
      fullPage: true
    });

    // Check if battle scene loaded
    const sceneInfo = await page.evaluate(() => {
      const phaserGame = (window as any).phaserGame;
      if (!phaserGame) return { error: 'No Phaser game found' };

      const scene = phaserGame.scene.keys['BattleScene'];
      const isActive = phaserGame.scene.isActive('BattleScene');
      const currentScenes = phaserGame.scene.getScenes(true).map((s: any) => s.scene.key);

      return {
        battleSceneExists: !!scene,
        battleSceneActive: isActive,
        activeScenes: currentScenes
      };
    });

    console.log('\nScene Info:', JSON.stringify(sceneInfo, null, 2));
    console.log(`\nErrors captured: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n=== ERRORS ===');
      errors.forEach((err, i) => {
        console.log(`\nError ${i + 1}:`);
        console.log(err);
      });
      console.log('==============\n');
    }

    // Filter out expected Reown errors
    const gameErrors = errors.filter(err =>
      !err.includes('Reown') &&
      !err.includes('Project ID') &&
      !err.includes('403') &&
      !err.includes('400') &&
      !err.includes('web3modal') &&
      !err.includes('appkit')
    );

    if (gameErrors.length > 0) {
      console.error('\n❌ GAME ERRORS DETECTED:');
      gameErrors.forEach(err => console.error(err));
    }

    // The test should fail if there are game-related errors
    expect(gameErrors.length).toBe(0);
  });
});
