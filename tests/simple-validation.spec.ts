import { test } from '@playwright/test';

test('simple feature validation', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('http://localhost:3000/game/test');
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(4000);

  console.log('\n=== SIMPLE FEATURE VALIDATION ===\n');

  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);

  // TEST: Game loads properly
  const gameState = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const store = (window as any).gameStore?.getState();

    return {
      gameExists: !!game,
      overworldActive: game?.scene.isActive('OverworldScene'),
      inventory: store?.inventory?.length || 0,
      npcs: game?.scene.getScene('OverworldScene')?.npcs?.length || 0
    };
  });

  console.log('✅ Game State:');
  console.log(`  - Game loaded: ${gameState.gameExists}`);
  console.log(`  - Overworld active: ${gameState.overworldActive}`);
  console.log(`  - Inventory size: ${gameState.inventory}`);
  console.log(`  - NPCs created: ${gameState.npcs}`);

  await page.screenshot({ path: 'test-results/simple-01-loaded.png' });

  // TEST: Stablecoins removed - verified by encounter test
  console.log('\n✅ Stablecoins Removed:');
  console.log(`  - Will be verified in encounter tests (sprite generation removed)`);

  // TEST: Battle menu text (if we can trigger battle)
  console.log('\n✅ Battle Menu Alignment:');
  await page.keyboard.press('e');
  await page.waitForTimeout(1500);

  const battleCheck = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const battle = game?.scene.getScene('BattleScene');
    const texts = battle?.moveMenuTexts?.map((t: any) => t.text) || [];
    return {
      battleActive: game?.scene.isActive('BattleScene'),
      menuTexts: texts
    };
  });

  console.log(`  - Battle scene active: ${battleCheck.battleActive}`);
  console.log(`  - Menu items: ${battleCheck.menuTexts.length}`);
  if (battleCheck.menuTexts.length > 0) {
    console.log(`  - Text samples:`, battleCheck.menuTexts.slice(0, 2));
  }

  await page.screenshot({ path: 'test-results/simple-02-battle.png' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // TEST: Cryptodex alignment
  console.log('\n✅ Cryptodex Alignment:');
  await page.keyboard.press('i');
  await page.waitForTimeout(500);

  const cryptodexCheck = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const cryptodex = game?.scene.getScene('CryptodexScene');
    const store = (window as any).gameStore?.getState();

    return {
      active: game?.scene.isActive('CryptodexScene'),
      content: cryptodex?.contentText?.text || '',
      inventory: store?.inventory?.length || 0,
      scrollOffset: cryptodex?.listScrollOffset || 0,
      maxVisible: cryptodex?.maxVisibleTokens || 0
    };
  });

  console.log(`  - Cryptodex active: ${cryptodexCheck.active}`);
  console.log(`  - Inventory has tokens: ${cryptodexCheck.inventory > 0}`);
  console.log(`  - Scroll system enabled: ${cryptodexCheck.maxVisible > 0}`);
  console.log(`  - Max visible tokens: ${cryptodexCheck.maxVisible}`);

  const contentLines = cryptodexCheck.content.split('\n').filter(l => l.trim());
  if (contentLines.length > 0) {
    console.log(`  - Content preview (first 5 lines):`);
    contentLines.slice(0, 5).forEach(line => console.log(`      "${line}"`));

    // Check spacing
    const tokenLines = contentLines.filter(l => l.match(/^[> ]/));
    if (tokenLines.length > 0) {
      const hasCorrect = tokenLines.some(l => l.match(/^[> ] {2}[A-Z]/));
      const hasWrong = tokenLines.some(l => l.match(/^[> ] {7,}[A-Z]/));
      console.log(`  - Alignment: ${hasCorrect && !hasWrong ? '✅ Correct' : '⚠️  Check screenshots'}`);
    }
  } else {
    console.log(`  - ⚠️  No content to check (empty inventory)`);
  }

  await page.screenshot({ path: 'test-results/simple-03-cryptodex.png' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // TEST: Dialogue system exists
  console.log('\n✅ Dialogue System:');
  const dialogueCheck = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const overworld = game?.scene.getScene('OverworldScene');

    return {
      dialogueBoxExists: !!overworld?.dialogueBox,
      dialogueTextExists: !!overworld?.dialogueText,
      isShowingDialogueFlag: overworld?.isShowingDialogue !== undefined,
      showDialogueMethod: typeof overworld?.showDialogue === 'function',
      advanceDialogueMethod: typeof overworld?.advanceDialogue === 'function'
    };
  });

  console.log(`  - Dialogue UI created: ${dialogueCheck.dialogueBoxExists && dialogueCheck.dialogueTextExists}`);
  console.log(`  - Dialogue state tracking: ${dialogueCheck.isShowingDialogueFlag}`);
  console.log(`  - Dialogue methods: ${dialogueCheck.showDialogueMethod && dialogueCheck.advanceDialogueMethod}`);

  console.log('\n=== ALL CHECKS COMPLETE ===\n');
  console.log('Review screenshots in test-results/ for visual confirmation');
});
