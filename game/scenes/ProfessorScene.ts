import * as Phaser from "phaser";

export class ProfessorScene extends Phaser.Scene {
  private dialogText?: Phaser.GameObjects.Text;
  private currentDialogIndex = 0;
  private dialogues = [
    "Hello there! Welcome to\nthe world of Swap 'Em All!",
    "In this world, you can\ncatch and collect tokens\nby swapping USDC!",
    "Visit the Store to buy\nPokeballs, then explore\nto find wild tokens!",
    "Press C to view your\nCryptodex anytime.\nGood luck, trainer!",
  ];
  private callingScene: string = "OverworldScene"; // Default for backwards compatibility

  constructor() {
    super("ProfessorScene");
  }

  create(data?: { callingScene?: string }) {
    // Store the calling scene so we can resume it later
    if (data?.callingScene) {
      this.callingScene = data.callingScene;
    }
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.add
      .rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0x306230,
      )
      .setOrigin(0);

    // Professor sprite
    this.add.rectangle(centerX, centerY - 40, 16, 16, 0xffffff);

    // Name label
    this.add
      .text(centerX, centerY - 20, "Professor Oak", {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#9bbc0f",
        align: "center",
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

    // Dialog text
    this.dialogText = this.add.text(
      8,
      this.cameras.main.height - 45,
      this.dialogues[0],
      {
        fontFamily: "monospace",
        fontSize: "8px",
        color: "#9bbc0f",
        lineSpacing: 2,
      },
    );

    // Instruction
    this.add.text(
      this.cameras.main.width - 60,
      this.cameras.main.height - 15,
      "SPACE: Next",
      {
        fontFamily: "monospace",
        fontSize: "7px",
        color: "#306230",
      },
    );

    // Set up input
    this.input.keyboard?.on("keydown-SPACE", () => this.nextDialog());
    this.input.keyboard?.on("keydown-ENTER", () => this.nextDialog());
    this.input.keyboard?.on("keydown-ESC", () => this.exitDialog());
  }

  private nextDialog() {
    this.currentDialogIndex++;

    if (this.currentDialogIndex >= this.dialogues.length) {
      this.exitDialog();
    } else {
      this.dialogText?.setText(this.dialogues[this.currentDialogIndex]);
    }
  }

  private exitDialog() {
    this.cameras.main.fade(300, 48, 98, 48);

    this.time.delayedCall(300, () => {
      this.input.keyboard?.off("keydown-SPACE");
      this.input.keyboard?.off("keydown-ENTER");
      this.input.keyboard?.off("keydown-ESC");

      this.scene.stop();
      this.scene.resume(this.callingScene);
    });
  }
}
