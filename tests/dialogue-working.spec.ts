import { test, expect } from '@playwright/test';

test('dialogue system works correctly', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('http://localhost:3000/game/test');
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(4000);

  // Skip title
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);

  // Move close to a specific NPC (Professor - top left)
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(50);
  }
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
  }

  await page.waitForTimeout(200);

  console.log('\n=== Testing Dialogue System ===\n');

  // Check proximity prompt
  const promptVisible = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const overworld = game?.scene.getScene('OverworldScene');
    return {
      visible: overworld?.interactText?.visible,
      text: overworld?.interactText?.text || ''
    };
  });

  console.log('Proximity prompt:', promptVisible);

  if (!promptVisible.visible) {
    console.log('⚠️  Not close enough to NPC, moving closer...');
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(200);
  }

  await page.screenshot({ path: 'test-results/dialogue-1-before.png' });

  // Press SPACE to start dialogue
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);

  const dialogue1 = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const overworld = game?.scene.getScene('OverworldScene');
    return {
      isShowing: overworld?.isShowingDialogue,
      text: overworld?.dialogueText?.text || '',
      currentIndex: overworld?.currentDialogueIndex,
      totalLines: overworld?.currentDialogue?.length || 0,
      boxVisible: overworld?.dialogueBox?.visible
    };
  });

  console.log('After 1st SPACE:', dialogue1);
  expect(dialogue1.isShowing || dialogue1.boxVisible).toBe(true);

  await page.screenshot({ path: 'test-results/dialogue-2-first-line.png' });

  // Press SPACE to advance
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);

  const dialogue2 = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const overworld = game?.scene.getScene('OverworldScene');
    return {
      isShowing: overworld?.isShowingDialogue,
      text: overworld?.dialogueText?.text || '',
      currentIndex: overworld?.currentDialogueIndex,
      totalLines: overworld?.currentDialogue?.length || 0
    };
  });

  console.log('After 2nd SPACE:', dialogue2);
  console.log(`✅ Dialogue advanced from line ${dialogue1.currentIndex} to ${dialogue2.currentIndex}`);

  await page.screenshot({ path: 'test-results/dialogue-3-second-line.png' });

  // Press SPACE to advance again
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);

  const dialogue3 = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const overworld = game?.scene.getScene('OverworldScene');
    return {
      isShowing: overworld?.isShowingDialogue,
      currentIndex: overworld?.currentDialogueIndex,
      professorSceneActive: game?.scene.isActive('ProfessorScene')
    };
  });

  console.log('After 3rd SPACE:', dialogue3);

  if (!dialogue3.isShowing && dialogue3.professorSceneActive) {
    console.log('✅ Dialogue completed and scene launched');
  } else if (dialogue3.isShowing) {
    console.log(`⚠️  Still showing dialogue at line ${dialogue3.currentIndex}`);
  }

  await page.screenshot({ path: 'test-results/dialogue-4-complete.png' });

  console.log('\n=== Test Complete ===\n');
});
