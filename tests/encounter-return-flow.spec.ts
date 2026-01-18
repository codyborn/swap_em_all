import { test, expect } from '@playwright/test';

/**
 * Test: Encounter Return Flow
 *
 * Reproduces bug where game freezes after encounter finishes
 * because EncounterScene tries to resume 'OverworldScene'
 * but 'PalletTownScene' was the one that paused.
 */

test.describe('Encounter Return Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/game');
    await page.waitForTimeout(2000); // Wait for boot

    // Get past title screen to PalletTownScene
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  });

  test('should return to PalletTownScene after running from encounter', async ({ page }) => {
    // Force an encounter with E key
    await page.keyboard.press('E');
    await page.waitForTimeout(500);

    // Verify we're in encounter (check for "appeared" text)
    const encounterText = page.locator('text=/appeared!/i');
    await expect(encounterText).toBeVisible({ timeout: 5000 });

    // Run away from encounter
    await page.keyboard.press('R');
    await page.waitForTimeout(2000);

    // BUG: Game should return to PalletTownScene and player should be able to move
    // Currently game freezes because EncounterScene tries to resume 'OverworldScene'
    // which was never paused

    // Try to move - if game is frozen, this won't work
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    // Check that we can still trigger another encounter (means game is not frozen)
    await page.keyboard.press('E');
    await page.waitForTimeout(500);

    // Should see encounter text again if game is working
    await expect(encounterText).toBeVisible({ timeout: 5000 });
  });

  test('should return to PalletTownScene after catching token', async ({ page }) => {
    // Force an encounter
    await page.keyboard.press('E');
    await page.waitForTimeout(500);

    const encounterText = page.locator('text=/appeared!/i');
    await expect(encounterText).toBeVisible({ timeout: 5000 });

    // Attempt to catch (will fail if no pokeballs, but that's ok)
    await page.keyboard.press('C');
    await page.waitForTimeout(3000);

    // Try to move after encounter finishes
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // Try to force another encounter - if game frozen, this won't work
    await page.keyboard.press('E');
    await page.waitForTimeout(500);

    // Should see encounter or "No pokeballs" message
    const hasEncounter = await encounterText.isVisible().catch(() => false);
    const noPokeballs = await page.locator('text=/No pokeballs/i').isVisible().catch(() => false);

    expect(hasEncounter || noPokeballs).toBe(true);
  });

  test('should track which scene launched the encounter', async ({ page }) => {
    // This test documents the expected behavior:
    // EncounterScene should resume whichever scene launched it,
    // not hardcoded 'OverworldScene'

    // Get debug info about active scenes
    const sceneInfo = await page.evaluate(() => {
      const game = (window as any).game;
      if (!game || !game.scene) return null;

      const scenes = game.scene.scenes.map((s: any) => ({
        key: s.scene.key,
        isActive: s.scene.isActive(),
        isPaused: s.scene.isPaused(),
        isVisible: s.scene.isVisible(),
      }));

      return scenes;
    });

    console.log('Active scenes before encounter:', sceneInfo);

    // Trigger encounter
    await page.keyboard.press('E');
    await page.waitForTimeout(500);

    const scenesAfterEncounter = await page.evaluate(() => {
      const game = (window as any).game;
      if (!game || !game.scene) return null;

      return game.scene.scenes.map((s: any) => ({
        key: s.scene.key,
        isActive: s.scene.isActive(),
        isPaused: s.scene.isPaused(),
        isVisible: s.scene.isVisible(),
      }));
    });

    console.log('Active scenes during encounter:', scenesAfterEncounter);

    // Expected: PalletTownScene should be paused, EncounterScene should be active
    const palletTown = scenesAfterEncounter?.find((s: any) => s.key === 'PalletTownScene');
    const encounter = scenesAfterEncounter?.find((s: any) => s.key === 'EncounterScene');

    expect(palletTown?.isPaused).toBe(true);
    expect(encounter?.isActive).toBe(true);

    // Run away
    await page.keyboard.press('R');
    await page.waitForTimeout(1500);

    const scenesAfterReturn = await page.evaluate(() => {
      const game = (window as any).game;
      if (!game || !game.scene) return null;

      return game.scene.scenes.map((s: any) => ({
        key: s.scene.key,
        isActive: s.scene.isActive(),
        isPaused: s.scene.isPaused(),
        isVisible: s.scene.isVisible(),
      }));
    });

    console.log('Active scenes after return:', scenesAfterReturn);

    // Expected: PalletTownScene should be active again, EncounterScene stopped
    const palletTownAfter = scenesAfterReturn?.find((s: any) => s.key === 'PalletTownScene');
    const encounterAfter = scenesAfterReturn?.find((s: any) => s.key === 'EncounterScene');

    // BUG: Currently fails because PalletTownScene is still paused
    expect(palletTownAfter?.isActive).toBe(true);
    expect(palletTownAfter?.isPaused).toBe(false);
    expect(encounterAfter?.isActive).toBe(false);
  });
});
