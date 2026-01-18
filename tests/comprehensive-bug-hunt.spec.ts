import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Comprehensive Bug Hunt', () => {
  test('explore all game features and document issues', async ({ page }) => {
    const issues: Array<{
      category: string;
      severity: 'critical' | 'major' | 'minor' | 'cosmetic';
      title: string;
      description: string;
      screenshot?: string;
      location: string;
    }> = [];

    const bugReportDir = 'test-results/bug-hunt';
    if (!fs.existsSync(bugReportDir)) {
      fs.mkdirSync(bugReportDir, { recursive: true });
    }

    // Capture console errors and warnings
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    page.on('pageerror', err => {
      consoleMessages.push(`[PAGE ERROR] ${err.message}`);
    });

    // Navigate to game
    await page.goto('http://localhost:3000/game/test');
    console.log('Starting comprehensive bug hunt...\n');

    // Wait for game to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Test 1: Title Screen
    console.log('Testing: Title Screen');
    await page.screenshot({ path: `${bugReportDir}/01-title-screen.png` });

    // Check for proper text alignment and rendering
    const titleScreenCheck = await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return { error: 'No canvas found' };

      return {
        canvasSize: { width: canvas.width, height: canvas.height },
        visible: canvas.offsetWidth > 0 && canvas.offsetHeight > 0
      };
    });

    // Test 2: Press Enter to start
    console.log('Testing: Starting game from title screen');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${bugReportDir}/02-overworld-initial.png` });

    // Test 3: Player Movement
    console.log('Testing: Player movement controls');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${bugReportDir}/03-player-movement.png` });

    // Test 4: Interact with Professor NPC
    console.log('Testing: Professor NPC interaction');
    // Move to professor position (approximate)
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
    }
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(100);
    }
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${bugReportDir}/04-professor-dialogue.png` });

    // Test dialogue navigation
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${bugReportDir}/05-professor-dialogue-2.png` });

    // Close dialogue
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Test 5: Interact with Clerk NPC
    console.log('Testing: Clerk NPC interaction');
    // Navigate to clerk
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
    }
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(100);
    }
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${bugReportDir}/06-clerk-menu.png` });

    // Test clerk menu options
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${bugReportDir}/07-clerk-menu-selection.png` });

    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${bugReportDir}/08-clerk-action.png` });

    // Test 6: Open Inventory Menu
    console.log('Testing: Inventory menu (E key)');
    await page.keyboard.press('Escape'); // Close any open menus
    await page.waitForTimeout(300);
    await page.keyboard.press('e');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${bugReportDir}/09-inventory-menu.png` });

    // Test inventory scrolling if applicable
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${bugReportDir}/10-inventory-scroll-1.png` });

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${bugReportDir}/11-inventory-scroll-2.png` });

    // Test selecting an item
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${bugReportDir}/12-inventory-item-selected.png` });

    // Close inventory
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Test 7: Test Battle/Encounter System
    console.log('Testing: Force encounter (E key near NPC)');
    await page.keyboard.press('e'); // Force encounter
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${bugReportDir}/13-battle-start.png` });

    // Test battle menu
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${bugReportDir}/14-battle-menu-selection.png` });

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${bugReportDir}/15-battle-menu-selection-2.png` });

    // Make a move
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${bugReportDir}/16-battle-action.png` });

    // Test 8: Interact with Trader NPC
    console.log('Testing: Trader NPC');
    // First exit battle if still in it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Navigate to trader position
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
    }
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
    }
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${bugReportDir}/17-trader-dialogue.png` });

    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${bugReportDir}/18-trader-menu.png` });

    // Test 9: Interact with Nurse NPC
    console.log('Testing: Nurse NPC');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Navigate to nurse
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(100);
    }
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${bugReportDir}/19-nurse-dialogue.png` });

    // Test 10: Interact with Gym Leader NPC
    console.log('Testing: Gym Leader NPC');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
    }
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${bugReportDir}/20-gym-leader-dialogue.png` });

    // Test 11: Menu Alignment and Layout Issues
    console.log('Testing: Various menu states for alignment issues');

    // Open and close different menus rapidly
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await page.keyboard.press('e');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${bugReportDir}/21-menu-alignment-check-1.png` });

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // Test edge cases
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }
    await page.screenshot({ path: `${bugReportDir}/22-rapid-navigation.png` });

    // Test 12: Canvas and Rendering
    const renderingCheck = await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      const container = canvas?.parentElement;

      return {
        canvas: {
          width: canvas?.width,
          height: canvas?.height,
          style: {
            width: canvas?.style.width,
            height: canvas?.style.height,
            position: canvas?.style.position
          }
        },
        container: {
          width: container?.clientWidth,
          height: container?.clientHeight,
          overflow: container?.style.overflow
        }
      };
    });

    console.log('Canvas layout:', JSON.stringify(renderingCheck, null, 2));

    // Capture final state
    await page.screenshot({ path: `${bugReportDir}/23-final-state.png`, fullPage: true });

    // Analyze all console messages for errors
    const errors = consoleMessages.filter(msg => msg.includes('[error]') || msg.includes('ERROR'));
    if (errors.length > 0) {
      issues.push({
        category: 'Console Errors',
        severity: 'major',
        title: 'Console errors detected during testing',
        description: `Found ${errors.length} console errors:\n${errors.slice(0, 5).join('\n')}`,
        location: 'Browser Console'
      });
    }

    // Save bug report
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: issues.length,
      issues: issues,
      consoleMessages: consoleMessages,
      renderingInfo: renderingCheck
    };

    fs.writeFileSync(
      `${bugReportDir}/bug-report.json`,
      JSON.stringify(report, null, 2)
    );

    console.log(`\n=== BUG HUNT COMPLETE ===`);
    console.log(`Screenshots saved to: ${bugReportDir}`);
    console.log(`Issues found: ${issues.length}`);
    console.log(`Console messages: ${consoleMessages.length}`);
    console.log(`Full report: ${bugReportDir}/bug-report.json`);
  });
});
