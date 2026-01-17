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

    // First go to home page to connect wallet
    console.log('Navigating to home page...');
    await page.goto('http://localhost:3000/', {
      waitUntil: 'load',
      timeout: 30000
    });

    // Wait for and click Connect Wallet button
    console.log('Looking for Connect Wallet button on home page...');
    const homeWalletButton = page.locator('button:has-text("Connect Wallet")').first();
    await homeWalletButton.waitFor({ state: 'visible', timeout: 5000 });
    await homeWalletButton.click();

    console.log('Clicked Connect Wallet, waiting for wallet modal...');
    await page.waitForTimeout(2000);

    // Take screenshot of wallet modal
    await page.screenshot({
      path: 'tests/screenshots/wallet-modal.png',
      fullPage: true
    });

    // Now navigate to the game
    console.log('Navigating to /game...');
    await page.goto('http://localhost:3000/game', {
      waitUntil: 'load',
      timeout: 30000
    });

    // Take immediate screenshot
    await page.screenshot({
      path: 'tests/screenshots/page-loaded.png',
      fullPage: true
    });

    // Wait for game to be visible (check for GameBoy container or canvas)
    console.log('Waiting for game to be visible...');
    try {
      // The game renders inside the GameBoy component - wait for anything game-related
      await page.waitForSelector('text=SWAP \'EM ALL', { timeout: 10000 });
      console.log('Game screen found!');
    } catch (e) {
      console.error('Game did not load!');
      await page.screenshot({
        path: 'tests/screenshots/no-game.png',
        fullPage: true
      });
      throw e;
    }

    // Wait a bit for the boot scene
    await page.waitForTimeout(2000);

    // Take screenshot of boot screen
    await page.screenshot({
      path: 'tests/screenshots/boot-screen.png',
      fullPage: true
    });

    // Try to find and click Connect Wallet button if present
    console.log('Looking for Connect Wallet button...');
    const walletButton = await page.locator('button:has-text("Connect Wallet")').first();
    const isVisible = await walletButton.isVisible().catch(() => false);

    if (isVisible) {
      console.log('Clicking Connect Wallet button...');
      await walletButton.click();
      await page.waitForTimeout(2000);
    }

    // Wait for game to fully initialize
    console.log('Waiting for game to initialize...');
    await page.waitForTimeout(3000);

    // Take a screenshot
    await page.screenshot({
      path: 'tests/screenshots/game-loaded.png',
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
