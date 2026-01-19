import * as Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text;
  private startText?: Phaser.GameObjects.Text;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('TitleScene');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Title
    this.titleText = this.add.text(centerX, centerY - 30, 'SWAP EM ALL', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#9bbc0f',
      align: 'center',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY - 10, 'Catch & Trade Tokens', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#9bbc0f',
      align: 'center',
    }).setOrigin(0.5);

    // Start prompt with blinking animation
    this.startText = this.add.text(centerX, centerY + 30, 'PRESS START', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#9bbc0f',
      align: 'center',
    }).setOrigin(0.5);

    // Blinking animation for start text
    this.tweens.add({
      targets: this.startText,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      yoyo: true,
      repeat: -1,
    });

    // Version text
    this.add.text(centerX, this.cameras.main.height - 10, 'v0.1.0 - Built on Unichain', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#306230',
      align: 'center',
    }).setOrigin(0.5);

    // Set up input
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Add Enter key as alternative to start
    this.input.keyboard?.on('keydown-ENTER', this.startGame, this);
    this.input.keyboard?.on('keydown-SPACE', this.startGame, this);

    // Make the scene clickable
    this.input.on('pointerdown', this.startGame, this);
  }

  update() {
    // Check for Start button (we'll map this to Enter or Space)
    if (this.cursors?.space.isDown || this.cursors?.shift.isDown) {
      this.startGame();
    }
  }

  private startGame() {
    // Transition to Pallet Town (new tilemap-based overworld)
    this.cameras.main.fade(500, 15, 56, 15);
    this.time.delayedCall(500, () => {
      this.scene.start('PalletTownScene');
    });

    // Play start sound (when we have audio)
    // this.sound.play('select');
  }
}
