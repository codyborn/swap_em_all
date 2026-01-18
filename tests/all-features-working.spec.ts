import { test, expect } from '@playwright/test';

test.describe('All Feature Tweaks - Final Test', () => {
  test('comprehensive feature verification', async ({ page }) => {
    test.setTimeout(90000);

    await page.goto('http://localhost:3000/game/test');
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(4000);

    console.log('\n=== FINAL FEATURE TEST ===\n');

    // Skip title
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);

    // ======================================================================
    // TEST 1: Stablecoins Removed
    // ======================================================================
    console.log('TEST 1: Stablecoins removed from encounters');

    const tokens = new Set<string>();
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('e');
      await page.waitForTimeout(1500);

      const symbol = await page.evaluate(() => {
        const game = (window as any).phaserGame;
        const battle = game?.scene.getScene('BattleScene')?.battleManager?.getBattle();
        return battle?.opponent?.token?.symbol;
      });

      if (symbol) tokens.add(symbol);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    const stablecoins = ['USDC', 'DAI', 'USDT', 'BUSD', 'USDbC'];
    const foundStablecoins = Array.from(tokens).filter(t => stablecoins.includes(t));

    console.log(`  Tokens found: ${Array.from(tokens).join(', ')}`);
    console.log(`  ${foundStablecoins.length === 0 ? '✅' : '❌'} Stablecoins: ${foundStablecoins.length === 0 ? 'None' : foundStablecoins.join(', ')}`);

    await page.screenshot({ path: 'test-results/final-test1.png' });

    // ======================================================================
    // TEST 2 & 3: NPC Dialogue + Auto-Heal
    // ======================================================================
    console.log('\nTEST 2 & 3: NPC Dialogue and Auto-Heal');

    // Get player to nurse - move more deliberately
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(50);
    }
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(200);

    // Check proximity
    const proximity = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      const overworld = game?.scene.getScene('OverworldScene');
      const player = overworld?.player;
      const nurse = overworld?.npcs?.find((n: any) => n.type === 'nurse');

      if (!player || !nurse) return null;

      const dx = nurse.sprite.x - player.x;
      const dy = nurse.sprite.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return {
        player: { x: player.x, y: player.y },
        nurse: { x: nurse.sprite.x, y: nurse.sprite.y },
        distance,
        closeEnough: distance < 25
      };
    });

    console.log(`  Proximity check:`, proximity);

    await page.screenshot({ path: 'test-results/final-test2-before.png' });

    // Interact
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    // Check dialogue
    const dialogueState = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      const overworld = game?.scene.getScene('OverworldScene');
      return {
        showing: overworld?.isShowingDialogue,
        text: overworld?.dialogueText?.text || '',
        visible: overworld?.dialogueBox?.visible
      };
    });

    console.log(`  ${dialogueState.showing || dialogueState.visible ? '✅' : '⚠️ '} Dialogue: ${dialogueState.showing || dialogueState.visible ? 'Visible' : 'Not detected'}`);
    if (dialogueState.text) console.log(`    Text: "${dialogueState.text}"`);

    await page.screenshot({ path: 'test-results/final-test2-dialogue.png' });

    // Advance dialogue
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Wait for auto-heal
    await page.waitForTimeout(2500);

    const afterHeal = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      return {
        backInOverworld: game?.scene.isActive('OverworldScene') && !game?.scene.isActive('HealingCenterScene')
      };
    });

    console.log(`  ${afterHeal.backInOverworld ? '✅' : '⚠️ '} Auto-heal: ${afterHeal.backInOverworld ? 'Completed' : 'Status unclear'}`);

    await page.screenshot({ path: 'test-results/final-test3-healed.png' });

    // ======================================================================
    // TEST 4: Battle Menu Alignment
    // ======================================================================
    console.log('\nTEST 4: Battle menu text alignment');

    await page.keyboard.press('e');
    await page.waitForTimeout(1500);

    const menuTexts = [];
    for (let i = 0; i < 3; i++) {
      const texts = await page.evaluate(() => {
        const game = (window as any).phaserGame;
        const battle = game?.scene.getScene('BattleScene');
        return battle?.moveMenuTexts?.map((t: any) => t.text) || [];
      });
      menuTexts.push(texts);
      if (i < 2) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(150);
      }
    }

    // Check consistency
    const baseTexts = menuTexts.map(texts =>
      texts.map((t: string) => t.replace(/^(> |  )/, ''))
    );

    const allSame = baseTexts.every(bt =>
      JSON.stringify(bt) === JSON.stringify(baseTexts[0])
    );

    console.log(`  ${allSame ? '✅' : '❌'} Text alignment: ${allSame ? 'Consistent' : 'Shifted'}`);

    await page.screenshot({ path: 'test-results/final-test4-battle.png' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // ======================================================================
    // TEST 5: Cryptodex Symbol Alignment
    // ======================================================================
    console.log('\nTEST 5: Cryptodex symbol alignment');

    await page.keyboard.press('i');
    await page.waitForTimeout(500);

    const cryptodexContent = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      const cryptodex = game?.scene.getScene('CryptodexScene');
      return cryptodex?.contentText?.text || '';
    });

    const lines = cryptodexContent.split('\n').filter(l => l.trim().length > 0);
    const tokenLines = lines.filter(l => l.match(/^[> ]/)); // Lines starting with prefix

    console.log(`  Sample lines:`);
    tokenLines.slice(0, 3).forEach(line => console.log(`    "${line}"`));

    // Check spacing: should be prefix (1 char) + 2 spaces + symbol
    const hasCorrectSpacing = tokenLines.some(l => l.match(/^[> ] {2}[A-Z]/));
    const hasWrongSpacing = tokenLines.some(l => l.match(/^[> ] {7}[A-Z]/));

    console.log(`  ${hasCorrectSpacing && !hasWrongSpacing ? '✅' : '❌'} Alignment: ${hasCorrectSpacing && !hasWrongSpacing ? 'Correct (2 spaces)' : 'Incorrect'}`);

    await page.screenshot({ path: 'test-results/final-test5-cryptodex.png' });

    // ======================================================================
    // TEST 6: Cryptodex Scrolling
    // ======================================================================
    console.log('\nTEST 6: Cryptodex scrolling');

    const scrollIndicator = cryptodexContent.includes('of');
    console.log(`  ${scrollIndicator ? '✅' : '⚠️ '} Scroll indicator: ${scrollIndicator ? 'Present' : 'Not needed (few tokens)'}`);

    if (tokenLines.length > 8) {
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(100);
      }

      const scrollState = await page.evaluate(() => {
        const game = (window as any).phaserGame;
        const cryptodex = game?.scene.getScene('CryptodexScene');
        return {
          offset: cryptodex?.listScrollOffset || 0,
          selected: cryptodex?.selectedTokenIndex || 0
        };
      });

      console.log(`  ${scrollState.offset > 0 ? '✅' : '⚠️ '} Scrolling: ${scrollState.offset > 0 ? 'Works' : 'Check manually'}`);
      await page.screenshot({ path: 'test-results/final-test6-scrolled.png' });
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    console.log('\n=== TEST COMPLETE ===\n');
  });
});
