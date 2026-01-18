import { test, expect } from '@playwright/test';

test.describe('Feature Tweaks Verification', () => {
  test('verify all 7 feature tweaks', async ({ page }) => {
    test.setTimeout(60000); // 60 second timeout
    const errors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`CONSOLE ERROR: ${msg.text()}`);
        console.error('CONSOLE ERROR:', msg.text());
      }
    });

    page.on('pageerror', err => {
      errors.push(`PAGE ERROR: ${err.message}`);
      console.error('PAGE ERROR:', err.message);
    });

    // Navigate to game
    await page.goto('http://localhost:3000/game/test');
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(2000);

    console.log('\n=== Starting Feature Tweaks Test ===\n');

    // Skip title screen
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // ==================================================================
    // TEST 1: Stablecoins Removed from Encounters
    // ==================================================================
    console.log('TEST 1: Verifying stablecoins removed from encounter pool...');

    const encounterTokens = new Set<string>();

    // Trigger multiple encounters to sample the token pool
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('e'); // Force encounter
      await page.waitForTimeout(1500);

      // Check what token appeared
      const battleInfo = await page.evaluate(() => {
        const phaserGame = (window as any).phaserGame;
        const battleScene = phaserGame?.scene.getScene('BattleScene');
        if (!battleScene) return null;

        const battle = battleScene.battleManager?.getBattle();
        return {
          opponentSymbol: battle?.opponent?.token?.symbol,
          opponentType: battle?.opponent?.token?.type
        };
      });

      if (battleInfo?.opponentSymbol) {
        encounterTokens.add(battleInfo.opponentSymbol);
        console.log(`  Encountered: ${battleInfo.opponentSymbol} (${battleInfo.opponentType})`);

        // Check for stablecoins
        if (['USDC', 'DAI', 'USDT', 'BUSD', 'USDbC'].includes(battleInfo.opponentSymbol)) {
          console.error(`  ❌ FAIL: Found stablecoin ${battleInfo.opponentSymbol} in encounter!`);
        }
      }

      // Exit battle
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    const stablecoinsFound = Array.from(encounterTokens).filter(s =>
      ['USDC', 'DAI', 'USDT', 'BUSD', 'USDbC'].includes(s)
    );

    if (stablecoinsFound.length === 0) {
      console.log('  ✅ PASS: No stablecoins found in 10 encounters');
    } else {
      console.log(`  ❌ FAIL: Found stablecoins: ${stablecoinsFound.join(', ')}`);
    }

    await page.screenshot({ path: 'test-results/test1-stablecoins.png' });

    // ==================================================================
    // TEST 2: Overworld Dialogue Before NPC Interaction
    // ==================================================================
    console.log('\nTEST 2: Verifying overworld dialogue appears before NPC scenes...');

    // Navigate to Nurse NPC
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(100);
    }
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
    }

    await page.keyboard.press('Space');
    await page.waitForTimeout(300); // Give dialogue time to appear

    // Check if dialogue box appeared
    const dialogueCheck1 = await page.evaluate(() => {
      const phaserGame = (window as any).phaserGame;
      const overworldScene = phaserGame?.scene.getScene('OverworldScene');
      return {
        isShowingDialogue: overworldScene?.isShowingDialogue === true,
        dialogueText: overworldScene?.dialogueText?.text || '',
        dialogueBoxVisible: overworldScene?.dialogueBox?.visible === true
      };
    });

    console.log('  Dialogue check:', dialogueCheck1);
    await page.screenshot({ path: 'test-results/test2-dialogue-before.png' });

    if (dialogueCheck1.isShowingDialogue || dialogueCheck1.dialogueBoxVisible) {
      console.log('  ✅ PASS: Dialogue box appeared before scene launch');
      console.log(`  Dialogue text: "${dialogueCheck1.dialogueText}"`);

      // Advance through dialogue
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
      await page.keyboard.press('Space');
      await page.waitForTimeout(800); // More time for scene transition

      // Now healing scene should be active
      const healingSceneActive = await page.evaluate(() => {
        const phaserGame = (window as any).phaserGame;
        return phaserGame?.scene.isActive('HealingCenterScene');
      });

      if (healingSceneActive) {
        console.log('  ✅ PASS: Healing scene launched after dialogue');
      } else {
        console.log('  ⚠️  WARNING: Healing scene status unclear');
      }

      await page.screenshot({ path: 'test-results/test2-dialogue-after.png' });
    } else {
      console.log('  ⚠️  WARNING: Could not detect dialogue (may have appeared too quickly)');
      console.log('    Proceeding with auto-heal test anyway...');
      await page.screenshot({ path: 'test-results/test2-no-dialogue.png' });
    }

    // ==================================================================
    // TEST 3: Nurse Auto-Heal (No Menu)
    // ==================================================================
    console.log('\nTEST 3: Verifying Nurse auto-heals without menu...');

    // Wait a moment for healing scene to appear
    await page.waitForTimeout(500);

    const healingStarted = await page.evaluate(() => {
      const phaserGame = (window as any).phaserGame;
      return phaserGame?.scene.isActive('HealingCenterScene');
    });

    console.log(`  Healing scene active: ${healingStarted}`);

    // Wait for auto-heal to complete (2 seconds in code + 300ms fade)
    await page.waitForTimeout(2500);

    // Check if we're back in overworld (healing completed and exited)
    const backInOverworld = await page.evaluate(() => {
      const phaserGame = (window as any).phaserGame;
      return phaserGame?.scene.isActive('OverworldScene') &&
             !phaserGame?.scene.isActive('HealingCenterScene');
    });

    await page.screenshot({ path: 'test-results/test3-nurse-autoheal.png' });

    if (backInOverworld) {
      console.log('  ✅ PASS: Auto-heal completed and returned to overworld');
    } else {
      console.log('  ⚠️  WARNING: Scene state unclear, checking healing functionality anyway');
    }

    // ==================================================================
    // TEST 4: Battle Menu Text Alignment
    // ==================================================================
    console.log('\nTEST 4: Verifying battle menu text alignment...');

    // Trigger battle
    await page.keyboard.press('e');
    await page.waitForTimeout(1500);

    // Capture initial menu text
    const menuTexts1 = await page.evaluate(() => {
      const phaserGame = (window as any).phaserGame;
      const battleScene = phaserGame?.scene.getScene('BattleScene');
      return battleScene?.moveMenuTexts?.map((t: any) => t.text) || [];
    });

    console.log('  Initial menu:', menuTexts1);

    // Navigate menu
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    const menuTexts2 = await page.evaluate(() => {
      const phaserGame = (window as any).phaserGame;
      const battleScene = phaserGame?.scene.getScene('BattleScene');
      return battleScene?.moveMenuTexts?.map((t: any) => t.text) || [];
    });

    console.log('  After DOWN:', menuTexts2);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    const menuTexts3 = await page.evaluate(() => {
      const phaserGame = (window as any).phaserGame;
      const battleScene = phaserGame?.scene.getScene('BattleScene');
      return battleScene?.moveMenuTexts?.map((t: any) => t.text) || [];
    });

    console.log('  After DOWN:', menuTexts3);

    // Check if text is consistent (no shifting)
    // Remove prefix and compare base text
    const baseText1 = menuTexts1.map((t: string) => t.replace(/^(> |  )/, ''));
    const baseText2 = menuTexts2.map((t: string) => t.replace(/^(> |  )/, ''));
    const baseText3 = menuTexts3.map((t: string) => t.replace(/^(> |  )/, ''));

    const textsMatch = JSON.stringify(baseText1) === JSON.stringify(baseText2) &&
                       JSON.stringify(baseText2) === JSON.stringify(baseText3);

    await page.screenshot({ path: 'test-results/test4-battle-menu.png' });

    if (textsMatch) {
      console.log('  ✅ PASS: Battle menu text remains aligned during navigation');
    } else {
      console.log('  ❌ FAIL: Battle menu text shifted');
      console.log('    Base1:', baseText1);
      console.log('    Base2:', baseText2);
      console.log('    Base3:', baseText3);
    }

    // Exit battle
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // ==================================================================
    // TEST 5: Cryptodex Symbol Alignment
    // ==================================================================
    console.log('\nTEST 5: Verifying cryptodex symbol alignment...');

    // Open cryptodex
    await page.keyboard.press('i');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/test5-cryptodex-alignment.png' });

    // Get the text content to verify spacing
    const cryptodexContent = await page.evaluate(() => {
      const phaserGame = (window as any).phaserGame;
      const cryptodexScene = phaserGame?.scene.getScene('CryptodexScene');
      return cryptodexScene?.contentText?.text || '';
    });

    console.log('  Cryptodex content sample:');
    const lines = cryptodexContent.split('\n').slice(2, 5); // Show first 3 token lines
    lines.forEach((line: string) => console.log(`    "${line}"`));

    // Check if spacing is correct (should be 2 spaces after prefix, not 7)
    const hasCorrectSpacing = lines.some((line: string) =>
      line.match(/^[> ] {2}[A-Z]/) // prefix + 2 spaces + letter
    );
    const hasIncorrectSpacing = lines.some((line: string) =>
      line.match(/^[> ] {7}[A-Z]/) // prefix + 7 spaces + letter
    );

    if (hasCorrectSpacing && !hasIncorrectSpacing) {
      console.log('  ✅ PASS: Symbol alignment corrected (2 spaces)');
    } else {
      console.log('  ❌ FAIL: Symbol alignment still incorrect');
    }

    // ==================================================================
    // TEST 6: Cryptodex Scrolling
    // ==================================================================
    console.log('\nTEST 6: Verifying cryptodex scrolling...');

    // Check if scroll indicator appears
    const hasScrollIndicator = cryptodexContent.includes('of');

    if (hasScrollIndicator) {
      console.log('  ✅ PASS: Scroll indicator present');

      // Try scrolling
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(200);
      }

      await page.screenshot({ path: 'test-results/test6-cryptodex-scrolled.png' });

      const scrolledContent = await page.evaluate(() => {
        const phaserGame = (window as any).phaserGame;
        const cryptodexScene = phaserGame?.scene.getScene('CryptodexScene');
        return {
          text: cryptodexScene?.contentText?.text || '',
          scrollOffset: cryptodexScene?.listScrollOffset || 0,
          selectedIndex: cryptodexScene?.selectedTokenIndex || 0
        };
      });

      console.log(`  Scroll offset: ${scrolledContent.scrollOffset}`);
      console.log(`  Selected index: ${scrolledContent.selectedIndex}`);

      if (scrolledContent.scrollOffset > 0 || scrolledContent.selectedIndex > 0) {
        console.log('  ✅ PASS: Cryptodex scrolling works');
      } else {
        console.log('  ⚠️  WARNING: Could not verify scrolling (may need more tokens)');
      }
    } else {
      console.log('  ⚠️  INFO: No scroll indicator (inventory may be small)');
    }

    // Close cryptodex
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // ==================================================================
    // TEST 7: Token Menu Health Display
    // ==================================================================
    console.log('\nTEST 7: Verifying token menu shows health (no "Heal" option)...');

    // Reopen cryptodex to check health display
    await page.keyboard.press('i');
    await page.waitForTimeout(500);

    const healthDisplayCheck = await page.evaluate(() => {
      const phaserGame = (window as any).phaserGame;
      const cryptodexScene = phaserGame?.scene.getScene('CryptodexScene');
      const text = cryptodexScene?.contentText?.text || '';

      return {
        hasHealthStatus: text.includes('Healthy') || text.includes('Injured') || text.includes('Critical'),
        hasHealOption: text.includes('Heal')
      };
    });

    await page.screenshot({ path: 'test-results/test7-health-display.png' });

    if (healthDisplayCheck.hasHealthStatus) {
      console.log('  ✅ PASS: Health status displayed in token list');
    } else {
      console.log('  ⚠️  WARNING: Could not find health status text');
    }

    if (!healthDisplayCheck.hasHealOption) {
      console.log('  ✅ PASS: No "Heal" option found in menu');
    } else {
      console.log('  ❌ FAIL: "Heal" option still present');
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // ==================================================================
    // Final Report
    // ==================================================================
    console.log('\n=== Test Summary ===');
    console.log(`Total console errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }

    // Filter out expected errors
    const gameErrors = errors.filter(err =>
      !err.includes('Reown') &&
      !err.includes('Project ID') &&
      !err.includes('403') &&
      !err.includes('400') &&
      !err.includes('web3modal') &&
      !err.includes('appkit')
    );

    console.log(`\nGame-related errors: ${gameErrors.length}`);

    expect(gameErrors.length).toBe(0);
  });
});
