import { test } from '@playwright/test';

test('debug game state', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('http://localhost:3000/game/test');
  await page.waitForSelector('canvas', { timeout: 10000 });

  // Wait longer for Phaser to initialize
  await page.waitForTimeout(4000);

  // Check if game exists at all
  const gameExists = await page.evaluate(() => {
    return {
      hasPhaserGame: !!(window as any).phaserGame,
      hasGameStore: !!(window as any).gameStore,
      windowKeys: Object.keys(window).filter(k => k.includes('game') || k.includes('phaser'))
    };
  });

  console.log('Game existence check:', gameExists);

  // Skip title screen
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);

  // Check game state
  const gameState = await page.evaluate(() => {
    const store = (window as any).gameStore?.getState();
    const phaserGame = (window as any).phaserGame;

    return {
      inventory: store?.inventory?.map((t: any) => ({
        symbol: t.symbol,
        type: t.type,
        health: t.health,
        maxHealth: t.maxHealth,
        level: t.level
      })) || [],
      scenes: phaserGame?.scene?.getScenes(true)?.map((s: any) => ({
        key: s.scene.key,
        active: s.scene.isActive()
      })) || [],
      overworldExists: !!phaserGame?.scene?.getScene('OverworldScene'),
      cryptodexExists: !!phaserGame?.scene?.getScene('CryptodexScene')
    };
  });

  console.log('\n=== Game State ===');
  console.log('Inventory:', JSON.stringify(gameState.inventory, null, 2));
  console.log('\nScenes:', JSON.stringify(gameState.scenes, null, 2));
  console.log('\nScene checks:');
  console.log('  Overworld exists:', gameState.overworldExists);
  console.log('  Cryptodex exists:', gameState.cryptodexExists);

  // Test NPC proximity and dialogue
  console.log('\n=== Testing NPC Dialogue ===');

  // Navigate to nurse
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
  }
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
  }

  await page.screenshot({ path: 'test-results/debug-before-interact.png' });

  const beforeInteract = await page.evaluate(() => {
    const phaserGame = (window as any).phaserGame;
    const overworldScene = phaserGame?.scene?.getScene('OverworldScene');

    return {
      npcsCount: overworldScene?.npcs?.length || 0,
      playerPos: overworldScene?.player ? {
        x: overworldScene.player.x,
        y: overworldScene.player.y
      } : null,
      interactTextVisible: overworldScene?.interactText?.visible,
      interactTextContent: overworldScene?.interactText?.text || ''
    };
  });

  console.log('Before interact:', JSON.stringify(beforeInteract, null, 2));

  await page.keyboard.press('Space');
  await page.waitForTimeout(100);

  await page.screenshot({ path: 'test-results/debug-after-space.png' });

  const afterSpace = await page.evaluate(() => {
    const phaserGame = (window as any).phaserGame;
    const overworldScene = phaserGame?.scene?.getScene('OverworldScene');

    return {
      isShowingDialogue: overworldScene?.isShowingDialogue,
      dialogueBoxVisible: overworldScene?.dialogueBox?.visible,
      dialogueTextVisible: overworldScene?.dialogueText?.visible,
      dialogueTextContent: overworldScene?.dialogueText?.text || '',
      currentDialogue: overworldScene?.currentDialogue || [],
      currentDialogueIndex: overworldScene?.currentDialogueIndex,
      healingSceneActive: phaserGame?.scene?.isActive('HealingCenterScene')
    };
  });

  console.log('\nAfter Space:', JSON.stringify(afterSpace, null, 2));

  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/debug-after-wait.png' });

  // Check cryptodex
  console.log('\n=== Testing Cryptodex ===');
  await page.keyboard.press('Escape'); // Exit any open scenes
  await page.waitForTimeout(500);

  await page.keyboard.press('i');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/debug-cryptodex.png' });

  const cryptodexState = await page.evaluate(() => {
    const phaserGame = (window as any).phaserGame;
    const cryptodexScene = phaserGame?.scene?.getScene('CryptodexScene');

    return {
      active: phaserGame?.scene?.isActive('CryptodexScene'),
      contentText: cryptodexScene?.contentText?.text || '',
      selectedIndex: cryptodexScene?.selectedTokenIndex,
      scrollOffset: cryptodexScene?.listScrollOffset,
      maxVisible: cryptodexScene?.maxVisibleTokens
    };
  });

  console.log('Cryptodex state:', JSON.stringify(cryptodexState, null, 2));
  console.log('\nCryptodex content:\n', cryptodexState.contentText);
});
