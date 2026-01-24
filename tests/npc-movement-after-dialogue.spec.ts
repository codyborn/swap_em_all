import { test, expect } from "@playwright/test";

/**
 * BUG REPRODUCTION TEST: Player freeze after NPC dialogue
 *
 * This test reproduces a critical bug where:
 * 1. Player talks to an NPC that has both dialogue and an onInteract callback
 * 2. After dialogue completes, the onInteract scene (e.g., TraderScene) launches
 * 3. The launched scene becomes active but doesn't respond to any inputs
 * 4. Player is completely frozen - cannot close the scene or return to gameplay
 *
 * Expected behavior: Player should be able to close the scene and continue playing
 * Actual behavior: Game is frozen, no inputs work
 */
test("player can move after NPC dialogue", async ({ page }) => {
  test.setTimeout(60000);

  console.log("\n=== Testing Player Movement After NPC Dialogue ===\n");

  await page.goto("http://localhost:3000/game/test");
  await page.waitForSelector("canvas", { timeout: 10000 });
  await page.waitForTimeout(4000);

  // Check game state before pressing Enter
  const beforeEnter = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const scenes = game?.scene.getScenes(true).map((s: any) => s.scene.key);
    return {
      gameExists: !!game,
      activeScenes: scenes || [],
    };
  });
  console.log("Before pressing Enter:", beforeEnter);

  // Skip title screen
  await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);

  // Check game state after pressing Enter
  const afterEnter = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const scenes = game?.scene.getScenes(true).map((s: any) => s.scene.key);
    const overworld = game?.scene.getScene("PalletTownScene");
    return {
      gameExists: !!game,
      activeScenes: scenes || [],
      overworldActive: game?.scene.isActive("PalletTownScene"),
      playerExists: !!overworld?.player,
    };
  });
  console.log("After pressing Enter:", afterEnter);

  // If we're in PalletTownScene, we need to skip it
  if (afterEnter.activeScenes.includes("PalletTownScene")) {
    console.log("In PalletTownScene, pressing Enter again to skip...");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);

    const finalState = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      const scenes = game?.scene.getScenes(true).map((s: any) => s.scene.key);
      return {
        activeScenes: scenes || [],
        overworldActive: game?.scene.isActive("PalletTownScene"),
      };
    });
    console.log("After skipping PalletTown:", finalState);
  }

  console.log("\nStep 1: Getting initial player position");
  const initialPosition = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const scene = game?.scene.getScene("PalletTownScene");
    return {
      x: scene?.player?.x,
      y: scene?.player?.y,
      sceneActive: game?.scene.isActive("PalletTownScene"),
      sceneExists: !!scene,
      playerExists: !!scene?.player,
    };
  });
  console.log("Initial position:", initialPosition);

  // Move close to Professor Oak (top-left area)
  console.log("\nStep 2: Moving towards Professor Oak");
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(50);
  }
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(200);

  const positionNearNPC = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const overworld = game?.scene.getScene("PalletTownScene");
    return {
      x: overworld?.player?.x,
      y: overworld?.player?.y,
      proximityPrompt: {
        visible: overworld?.interactText?.visible,
        text: overworld?.interactText?.text || "",
      },
    };
  });
  console.log("Position near NPC:", positionNearNPC);

  // If not close enough, move closer
  if (!positionNearNPC.proximityPrompt.visible) {
    console.log("Not close enough to NPC, moving closer...");
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(200);
  }

  await page.screenshot({ path: "test-results/move-test-1-near-npc.png" });

  // Start dialogue
  console.log("\nStep 3: Starting dialogue with Space key");

  // Click on canvas to ensure focus
  await page.click("canvas");
  await page.waitForTimeout(100);

  // Press Space using down/up for better compatibility
  await page.keyboard.down("Space");
  await page.waitForTimeout(50);
  await page.keyboard.up("Space");

  // Wait for dialogue to actually start (check for dialogue box visibility)
  await page.waitForTimeout(500);

  const dialogueState1 = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const scene = game?.scene.getScene("PalletTownScene");
    return {
      isShowingDialogue: scene?.isShowingDialogue,
      dialogueText: scene?.dialogueText?.text || "",
      dialogueBoxVisible: scene?.dialogueBox?.visible,
      currentIndex: scene?.currentDialogueIndex,
      totalLines: scene?.currentDialogue?.length || 0,
      playerX: scene?.player?.x,
      playerY: scene?.player?.y,
    };
  });
  console.log("Dialogue started:", dialogueState1);

  // If dialogue didn't start, try pressing Space again
  if (!dialogueState1.isShowingDialogue && !dialogueState1.dialogueBoxVisible) {
    console.log("Dialogue didn't start, trying Space again...");
    await page.keyboard.press("Space");
    await page.waitForTimeout(500);

    const dialogueState2 = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      const scene = game?.scene.getScene("PalletTownScene");
      return {
        isShowingDialogue: scene?.isShowingDialogue,
        dialogueBoxVisible: scene?.dialogueBox?.visible,
        dialogueText: scene?.dialogueText?.text || "",
      };
    });
    console.log("After second Space press:", dialogueState2);
  }

  expect(
    dialogueState1.isShowingDialogue || dialogueState1.dialogueBoxVisible,
  ).toBe(true);

  await page.screenshot({
    path: "test-results/move-test-2-dialogue-started.png",
  });

  // Advance through all dialogue lines
  console.log("\nStep 4: Advancing through dialogue");
  const maxDialogueLines = 10; // Safety limit
  for (let i = 0; i < maxDialogueLines; i++) {
    // Click canvas to ensure focus, then press Space properly
    await page.click("canvas");
    await page.waitForTimeout(50);
    await page.keyboard.down("Space");
    await page.waitForTimeout(50);
    await page.keyboard.up("Space");
    await page.waitForTimeout(300);

    const dialogueState = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      const scene = game?.scene.getScene("PalletTownScene");
      return {
        isShowingDialogue: scene?.isShowingDialogue,
        currentIndex: scene?.currentDialogueIndex,
        dialogueText: scene?.dialogueText?.text || "",
      };
    });

    console.log(
      `  Line ${i + 1}: isShowingDialogue=${dialogueState.isShowingDialogue}, text="${dialogueState.dialogueText}"`,
    );

    // If dialogue ended, break
    if (!dialogueState.isShowingDialogue) {
      console.log("  ✅ Dialogue ended successfully!");
      break;
    }

    if (i === maxDialogueLines - 1) {
      console.log("  ⚠️  Reached max dialogue lines without completion");
    }
  }

  await page.screenshot({
    path: "test-results/move-test-3-dialogue-ended.png",
  });

  // Wait a moment to ensure dialogue is fully closed
  await page.waitForTimeout(500);

  // Get position right after dialogue
  const positionAfterDialogue = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const scene = game?.scene.getScene("PalletTownScene");
    const allScenes = game?.scene.getScenes(true).map((s: any) => s.scene.key);
    return {
      x: scene?.player?.x,
      y: scene?.player?.y,
      isShowingDialogue: scene?.isShowingDialogue,
      palletTownActive: game?.scene.isActive("PalletTownScene"),
      palletTownPaused: game?.scene.isPaused("PalletTownScene"),
      allActiveScenes: allScenes || [],
      traderSceneActive: game?.scene.isActive("TraderScene"),
    };
  });
  console.log(
    "\nStep 5: Scene state after dialogue ended:",
    positionAfterDialogue,
  );
  console.log(
    `  isShowingDialogue: ${positionAfterDialogue.isShowingDialogue}`,
  );
  console.log(`  palletTownActive: ${positionAfterDialogue.palletTownActive}`);
  console.log(`  palletTownPaused: ${positionAfterDialogue.palletTownPaused}`);
  console.log(
    `  traderSceneActive: ${positionAfterDialogue.traderSceneActive}`,
  );
  console.log(
    `  allActiveScenes: ${positionAfterDialogue.allActiveScenes.join(", ")}`,
  );

  // If TraderScene is active, close it properly by waiting for menu and selecting Exit
  if (positionAfterDialogue.traderSceneActive) {
    console.log(
      "\nStep 6a: TraderScene is active, waiting for it to auto-close or manually closing it",
    );

    // Wait for the TraderScene to display "You don't have any tokens" and auto-close
    // Or if there's a menu, we'd navigate to Exit Trader option
    await page.waitForTimeout(3000); // Wait for auto-close or menu display

    const afterWait = await page.evaluate(() => {
      const game = (window as any).phaserGame;
      return {
        palletTownActive: game?.scene.isActive("PalletTownScene"),
        traderSceneActive: game?.scene.isActive("TraderScene"),
        allActiveScenes: game?.scene
          .getScenes(true)
          .map((s: any) => s.scene.key),
      };
    });
    console.log("After waiting for TraderScene:", afterWait);

    // If still active, try pressing Escape with proper click and keyboard method
    if (afterWait.traderSceneActive) {
      console.log("TraderScene still active, trying Escape key...");
      await page.click("canvas");
      await page.waitForTimeout(100);
      await page.keyboard.down("Escape");
      await page.waitForTimeout(50);
      await page.keyboard.up("Escape");
      await page.waitForTimeout(500);

      const afterEscape = await page.evaluate(() => {
        const game = (window as any).phaserGame;
        return {
          palletTownActive: game?.scene.isActive("PalletTownScene"),
          traderSceneActive: game?.scene.isActive("TraderScene"),
          allActiveScenes: game?.scene
            .getScenes(true)
            .map((s: any) => s.scene.key),
        };
      });
      console.log("After Escape:", afterEscape);
    }
  }

  // Now try to move the player
  console.log("\nStep 6b: Attempting to move player RIGHT");

  // Click canvas first to ensure focus
  await page.click("canvas");
  await page.waitForTimeout(100);

  for (let i = 0; i < 5; i++) {
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(50);
    await page.keyboard.up("ArrowRight");
    await page.waitForTimeout(50);
  }

  await page.waitForTimeout(300);

  const positionAfterMovement = await page.evaluate(() => {
    const game = (window as any).phaserGame;
    const overworld = game?.scene.getScene("PalletTownScene");
    return {
      x: overworld?.player?.x,
      y: overworld?.player?.y,
      isShowingDialogue: overworld?.isShowingDialogue,
    };
  });
  console.log(
    "Position after attempting to move RIGHT:",
    positionAfterMovement,
  );

  await page.screenshot({
    path: "test-results/move-test-4-after-movement-attempt.png",
  });

  // Calculate if player actually moved
  const xDifference = Math.abs(
    positionAfterMovement.x - positionAfterDialogue.x,
  );
  const yDifference = Math.abs(
    positionAfterMovement.y - positionAfterDialogue.y,
  );
  const didMove = xDifference > 2 || yDifference > 2;

  console.log("\n=== RESULTS ===");
  console.log(
    `Position before movement: (${positionAfterDialogue.x.toFixed(2)}, ${positionAfterDialogue.y.toFixed(2)})`,
  );
  console.log(
    `Position after movement:  (${positionAfterMovement.x.toFixed(2)}, ${positionAfterMovement.y.toFixed(2)})`,
  );
  console.log(`X difference: ${xDifference.toFixed(2)}`);
  console.log(`Y difference: ${yDifference.toFixed(2)}`);
  console.log(`Player moved: ${didMove ? "✅ YES" : "❌ NO"}`);

  if (!didMove) {
    console.log("\n❌ BUG REPRODUCED: Player cannot move after dialogue!");
    console.log("Expected: Player should be able to move after dialogue ends");
    console.log(
      "Actual: Player position did not change after pressing arrow keys",
    );
  } else {
    console.log("\n✅ Player CAN move after dialogue");
  }

  console.log("\n=== Test Complete ===\n");

  // Document the bug if reproduced
  if (!didMove) {
    console.log("\n❌ BUG REPRODUCED!");
    console.log("Issue: Player cannot move after NPC dialogue completes");
    console.log(
      ` - isShowingDialogue after dialogue: ${positionAfterDialogue.isShowingDialogue}`,
    );
    console.log(
      ` - PalletTownScene active: ${positionAfterDialogue.palletTownActive}`,
    );
    console.log(
      ` - PalletTownScene paused: ${positionAfterDialogue.palletTownPaused}`,
    );
    console.log(
      ` - TraderScene active: ${positionAfterDialogue.traderSceneActive}`,
    );
    console.log(
      ` - All active scenes: ${positionAfterDialogue.allActiveScenes.join(", ")}`,
    );
    console.log(
      ` - Player position frozen at: (${positionAfterDialogue.x.toFixed(2)}, ${positionAfterDialogue.y.toFixed(2)})`,
    );
    console.log("\nThis test will FAIL until the bug is fixed.");
  } else {
    console.log("\n✅ BUG FIXED! Player can move after dialogue.");
  }

  // This test should PASS when the bug is fixed (player should be able to move)
  expect(didMove).toBe(true);
});
