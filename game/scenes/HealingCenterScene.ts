import * as Phaser from "phaser";
import { CaughtToken } from "@/lib/types/token";

export class HealingCenterScene extends Phaser.Scene {
  private dialogText?: Phaser.GameObjects.Text;
  private callingScene: string = "OverworldScene"; // Default for backwards compatibility

  constructor() {
    super("HealingCenterScene");
  }

  create(data?: { callingScene?: string }) {
    // Store the calling scene so we can resume it later
    if (data?.callingScene) {
      this.callingScene = data.callingScene;
    }
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Pink/purple background for healing center
    this.add
      .rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0xffb6c1,
      )
      .setOrigin(0);

    // Nurse NPC (placeholder - white rectangle for now)
    this.add.rectangle(centerX, centerY - 40, 16, 16, 0xffffff);

    // Add a cross symbol above nurse
    this.add
      .text(centerX, centerY - 52, "+", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#FF0000",
      })
      .setOrigin(0.5);

    // Dialog box
    this.add
      .rectangle(
        0,
        this.cameras.main.height - 50,
        this.cameras.main.width,
        50,
        0x000000,
        0.8,
      )
      .setOrigin(0);

    // Message text
    this.dialogText = this.add.text(
      8,
      this.cameras.main.height - 45,
      "Healing your tokens...",
      {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#9bbc0f",
        lineSpacing: 2,
      },
    );

    // Auto-heal immediately
    this.time.delayedCall(500, () => {
      this.healAll();
    });

    // Set up input (allow ESC to exit early)
    this.input.keyboard?.on("keydown-ESC", () => this.exitCenter());
  }

  private healAll() {
    const store = (window as any).gameStore;
    if (!store) return;

    const inventory: CaughtToken[] = store.getState().inventory;
    let healedCount = 0;
    let revivedCount = 0;

    inventory.forEach((token: CaughtToken) => {
      if (token.isKnockedOut) {
        // Revive knocked out tokens to full health
        store.getState().reviveToken(token.address, 100);
        revivedCount++;
      } else if (token.health < token.maxHealth) {
        // Heal injured tokens
        store.getState().healToken(token.address, token.maxHealth);
        healedCount++;
      }
    });

    const totalRestored = healedCount + revivedCount;

    if (totalRestored === 0) {
      this.showMessage("Your tokens are already\nat full health!");
    } else {
      const messages = [];
      if (revivedCount > 0) {
        messages.push(
          `Revived ${revivedCount} token${revivedCount > 1 ? "s" : ""}!`,
        );
      }
      if (healedCount > 0) {
        messages.push(
          `Healed ${healedCount} token${healedCount > 1 ? "s" : ""}!`,
        );
      }
      messages.push("Your tokens are feeling great!");
      this.showMessage(messages.join("\n"));
    }

    this.time.delayedCall(2000, () => {
      this.exitCenter();
    });
  }

  private showMessage(message: string) {
    this.dialogText?.setText(message);
  }

  private exitCenter() {
    this.cameras.main.fade(300, 255, 182, 193);

    this.time.delayedCall(300, () => {
      // Clean up input
      this.input.keyboard?.off("keydown-ESC");

      this.scene.stop();
      this.scene.resume(this.callingScene);
    });
  }
}
