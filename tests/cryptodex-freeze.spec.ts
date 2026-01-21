import { test, expect } from '@playwright/test';

/**
 * Test: Cryptodex Freeze Bug
 *
 * Reproduces bug where game freezes after opening and closing Cryptodex.
 * Player can't move and encounters don't trigger.
 */

test.describe('Cryptodex Freeze Bug', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/game/test');

    // Wait for canvas (game) to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for boot

    // Get past title screen
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
  });

  test('should allow player movement after closing Cryptodex', async ({ page }) => {
    console.log('📝 Starting test: should allow player movement after closing Cryptodex');

    // Take screenshot to see current state
    await page.screenshot({ path: 'test-results/cryptodex-test-start.png' });

    // Check initial scene state
    const initialScenes = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      if (!game || !game.scene) {
        console.log('Game or scene not available');
        return null;
      }

      return game.scene.scenes.map((s: any) => ({
        key: s.scene.key,
        isActive: s.scene.isActive(),
        isPaused: s.scene.isPaused(),
        inputEnabled: s.input?.enabled,
      }));
    });

    console.log('Initial scenes:', JSON.stringify(initialScenes, null, 2));

    // Verify we can trigger encounter BEFORE opening Cryptodex
    console.log('Testing encounter before Cryptodex...');
    await page.keyboard.press('E');
    await page.waitForTimeout(500);

    const encounterTextBefore = page.locator('text=/appeared!/i');
    const hasEncounterBefore = await encounterTextBefore.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Encounter triggered before Cryptodex:', hasEncounterBefore);

    // Run away if encounter triggered
    if (hasEncounterBefore) {
      await page.keyboard.press('R');
      await page.waitForTimeout(1500);
    }

    // Make sure we're not in an encounter before opening Cryptodex
    console.log('Checking if in encounter...');
    let isInEncounter = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      const encounterScene = game?.scene?.getScene('EncounterScene');
      return encounterScene?.scene?.isActive();
    });

    // If in encounter, run away first
    if (isInEncounter) {
      console.log('In encounter, running away first...');
      await page.keyboard.press('r');
      await page.waitForTimeout(2000);
    }

    // Wait a bit to avoid random encounters from triggering right after
    await page.waitForTimeout(500);

    // Open Cryptodex with C key (uppercase to be explicit)
    console.log('Opening Cryptodex...');
    await page.keyboard.press('KeyC'); // Use key code instead of lowercase
    await page.waitForTimeout(1000);

    // Take screenshot after opening
    await page.screenshot({ path: 'test-results/cryptodex-test-opened.png' });

    // Check scene state after opening Cryptodex
    const cryptodexOpenScenes = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      if (!game || !game.scene) return null;

      return game.scene.scenes.map((s: any) => ({
        key: s.scene.key,
        isActive: s.scene.isActive(),
        isPaused: s.scene.isPaused(),
        inputEnabled: s.input?.enabled,
      }));
    });

    console.log('Scenes after opening Cryptodex:', JSON.stringify(cryptodexOpenScenes, null, 2));

    // Verify Cryptodex is open
    const cryptodexScene = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      const cryptodex = game?.scene?.getScene('CryptodexScene');
      return {
        isActive: cryptodex?.scene?.isActive(),
        exists: !!cryptodex,
      };
    });

    console.log('Cryptodex scene state:', cryptodexScene);

    // Verify Cryptodex is open (look for "CRYPTODEX" text or check scene)
    const cryptodexTitle = page.locator('text=/CRYPTODEX/i');
    const isCryptodexVisible = await cryptodexTitle.isVisible().catch(() => false);
    console.log('Is Cryptodex title visible:', isCryptodexVisible);

    if (!isCryptodexVisible && !cryptodexScene.isActive) {
      // Get page text content to debug
      const pageText = await page.textContent('body');
      console.log('Page text content:', pageText?.substring(0, 500));
      throw new Error('Cryptodex did not open');
    }

    console.log('✅ Cryptodex opened successfully');

    // Close Cryptodex with ESC key
    console.log('Closing Cryptodex...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Check scene state after closing Cryptodex
    const scenesAfterClose = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      if (!game || !game.scene) return null;

      return game.scene.scenes.map((s: any) => ({
        key: s.scene.key,
        isActive: s.scene.isActive(),
        isPaused: s.scene.isPaused(),
        inputEnabled: s.input?.enabled,
      }));
    });

    console.log('Scenes after closing Cryptodex:', scenesAfterClose);

    // Check if PalletTownScene input is enabled
    const palletTown = scenesAfterClose?.find((s: any) => s.key === 'PalletTownScene');
    console.log('PalletTownScene state:', palletTown);

    // BUG: Input should be enabled after closing Cryptodex
    expect(palletTown?.inputEnabled).toBe(true);
    expect(palletTown?.isActive).toBe(true);
    expect(palletTown?.isPaused).toBe(false);

    // Try to move player
    console.log('Testing player movement...');
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // Try to trigger encounter - if game is frozen, this won't work
    console.log('Testing encounter after Cryptodex...');
    await page.keyboard.press('E');
    await page.waitForTimeout(500);

    // Should see encounter text if game is working
    const encounterTextAfter = page.locator('text=/appeared!/i');
    const hasEncounterAfter = await encounterTextAfter.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Encounter triggered after Cryptodex:', hasEncounterAfter);

    // BUG: Encounter should trigger, proving game is not frozen
    expect(hasEncounterAfter).toBe(true);
  });

  test('should allow navigation to Bag from Cryptodex and back', async ({ page }) => {
    console.log('📝 Starting test: navigation between menus');

    // Open Cryptodex
    await page.keyboard.press('c');
    await page.waitForTimeout(500);

    const cryptodexTitle = page.locator('text=/CRYPTODEX/i');
    await expect(cryptodexTitle).toBeVisible({ timeout: 2000 });

    // Navigate to Bag using right arrow
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Should see "BAG" title
    const bagTitle = page.locator('text=/^BAG$/i');
    await expect(bagTitle).toBeVisible({ timeout: 2000 });

    // Navigate back to Cryptodex
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    await expect(cryptodexTitle).toBeVisible({ timeout: 2000 });

    // Close and test movement
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Try to trigger encounter
    await page.keyboard.press('E');
    await page.waitForTimeout(500);

    const encounterText = page.locator('text=/appeared!/i');
    const hasEncounter = await encounterText.isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasEncounter).toBe(true);
  });

  test('should track input.enabled state through scene transitions', async ({ page }) => {
    console.log('📝 Starting test: input.enabled state tracking');

    // Function to get detailed input state
    const getInputState = async () => {
      return await page.evaluate(() => {
        const game = (window as any).phaserGame;
        if (!game || !game.scene) return null;

        const palletTown = game.scene.getScene('PalletTownScene');
        const cryptodex = game.scene.getScene('CryptodexScene');

        return {
          palletTown: {
            exists: !!palletTown,
            isActive: palletTown?.scene?.isActive?.(),
            isPaused: palletTown?.scene?.isPaused?.(),
            inputEnabled: palletTown?.input?.enabled,
            keyboardEnabled: palletTown?.input?.keyboard?.enabled,
          },
          cryptodex: {
            exists: !!cryptodex,
            isActive: cryptodex?.scene?.isActive?.(),
            isPaused: cryptodex?.scene?.isPaused?.(),
            inputEnabled: cryptodex?.input?.enabled,
            keyboardEnabled: cryptodex?.input?.keyboard?.enabled,
          },
        };
      });
    };

    console.log('1. Initial state:');
    const state1 = await getInputState();
    console.log(JSON.stringify(state1, null, 2));

    console.log('2. Opening Cryptodex...');
    await page.keyboard.press('c');
    await page.waitForTimeout(500);

    const state2 = await getInputState();
    console.log(JSON.stringify(state2, null, 2));

    console.log('3. Closing Cryptodex...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const state3 = await getInputState();
    console.log(JSON.stringify(state3, null, 2));

    // After closing Cryptodex, PalletTownScene input should be enabled
    expect(state3?.palletTown?.inputEnabled).toBe(true);
    expect(state3?.palletTown?.keyboardEnabled).toBe(true);
    expect(state3?.palletTown?.isActive).toBe(true);
    expect(state3?.palletTown?.isPaused).toBe(false);
  });
});
