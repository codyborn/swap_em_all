import { test, expect } from '@playwright/test';

test.describe('Sprite Loading', () => {
  test('should load player sprites and animations correctly', async ({ page }) => {
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];
    const networkRequests: string[] = [];

    // Capture console messages
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      consoleErrors.push(`PAGE ERROR: ${error.message}\n${error.stack}`);
    });

    // Capture network requests for atlas files
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('atlas') || url.includes('sprites')) {
        networkRequests.push(`REQUEST: ${request.method()} ${url}`);
      }
    });

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('atlas') || url.includes('sprites')) {
        networkRequests.push(`RESPONSE: ${response.status()} ${url}`);
      }
    });

    // Navigate to the test game route (bypasses wallet requirement)
    console.log('Navigating to /game/test...');
    await page.goto('http://localhost:3000/game/test', {
      waitUntil: 'load',
      timeout: 30000
    });

    // Take immediate screenshot
    await page.screenshot({
      path: 'tests/screenshots/page-loaded.png',
      fullPage: true
    });

    // Wait for Phaser game to initialize
    console.log('Waiting for Phaser game to initialize...');
    await page.waitForTimeout(3000);

    // Take screenshot after initialization
    await page.screenshot({
      path: 'tests/screenshots/game-initialized.png',
      fullPage: true
    });

    // Wait additional time for all sprites to load
    console.log('Waiting for sprites to load...');
    await page.waitForTimeout(2000);

    // Take a screenshot of game
    await page.screenshot({
      path: 'tests/screenshots/game-loaded.png',
      fullPage: true
    });

    // Wait for boot animation to complete
    console.log('Waiting for title screen...');
    await page.waitForTimeout(2000);

    // Screenshot of title screen
    await page.screenshot({
      path: 'tests/screenshots/title-screen.png',
      fullPage: true
    });

    // Press Enter/Space to start game (simulates user input)
    console.log('Pressing Enter to start game...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Also try Space bar
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000);

    // Take final screenshot of overworld scene
    console.log('Taking final overworld screenshot...');
    await page.screenshot({
      path: 'tests/screenshots/overworld.png',
      fullPage: true
    });

    // Print network requests
    console.log('\n========== NETWORK REQUESTS (SPRITES/ATLAS) ==========');
    networkRequests.forEach(req => console.log(req));
    console.log('======================================================\n');

    // Print all console logs
    console.log('\n========== CONSOLE LOGS ==========');
    consoleLogs.forEach(log => console.log(log));
    console.log('==================================\n');

    // Print errors
    if (consoleErrors.length > 0) {
      console.log('\n========== ERRORS ==========');
      consoleErrors.forEach(err => console.error(err));
      console.log('============================\n');
    }

    // Check for specific logs
    const playerTextureLog = consoleLogs.find(log => log.includes('Player texture loaded'));
    const playerFramesLog = consoleLogs.find(log => log.includes('Player texture frames'));
    const idleAnimLog = consoleLogs.find(log => log.includes('player-idle exists'));

    console.log('\n========== KEY FINDINGS ==========');
    console.log('Player texture loaded:', playerTextureLog || 'NOT FOUND');
    console.log('Player frames log:', playerFramesLog || 'NOT FOUND');
    console.log('Idle animation log:', idleAnimLog || 'NOT FOUND');
    console.log('Total console logs:', consoleLogs.length);
    console.log('Total errors:', consoleErrors.length);
    console.log('Total network requests:', networkRequests.length);
    console.log('==================================\n');

    // Check if atlas files were requested
    const playerAtlasRequested = networkRequests.some(r => r.includes('player-sprites-atlas.json'));
    const npcAtlasRequested = networkRequests.some(r => r.includes('overworld-npcs-atlas.json'));

    console.log('\n========== ATLAS FILE CHECKS ==========');
    console.log('Player atlas requested:', playerAtlasRequested);
    console.log('NPC atlas requested:', npcAtlasRequested);
    console.log('=======================================\n');

    // Report success/failure
    if (!playerAtlasRequested || !npcAtlasRequested) {
      console.error('❌ FAILED: Atlas files were not requested');
    } else if (consoleErrors.filter(e => !e.includes('Reown') && !e.includes('cloud.reown.com')).length > 0) {
      console.error('❌ FAILED: Errors found (excluding Reown errors)');
    } else if (!playerTextureLog || !idleAnimLog) {
      console.error('❌ FAILED: Expected console logs not found');
    } else {
      console.log('✅ SUCCESS: All checks passed');
    }
  });
});
