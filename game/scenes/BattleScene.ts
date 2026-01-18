import * as Phaser from 'phaser';
import { BattleManager } from '../systems/BattleManager';
import { CaughtToken, Move } from '../../lib/types/token';
import { DamageCalculator } from '../../lib/utils/damageCalculator';

interface BattleData {
  type: 'gym' | 'wild';
  playerToken?: CaughtToken;
  opponentToken?: CaughtToken;
  gymId?: string;
}

export class BattleScene extends Phaser.Scene {
  private battleManager: BattleManager;
  private selectedMoveIndex: number = 0;
  private isSelectingMove: boolean = true;

  // UI elements
  private playerSprite?: Phaser.GameObjects.Sprite;
  private opponentSprite?: Phaser.GameObjects.Sprite;
  private playerHealthBar?: Phaser.GameObjects.Rectangle;
  private opponentHealthBar?: Phaser.GameObjects.Rectangle;
  private playerHealthText?: Phaser.GameObjects.Text;
  private opponentHealthText?: Phaser.GameObjects.Text;
  private playerNameText?: Phaser.GameObjects.Text;
  private opponentNameText?: Phaser.GameObjects.Text;
  private battleLogText?: Phaser.GameObjects.Text;
  private moveMenuTexts: Phaser.GameObjects.Text[] = [];
  private moveMenuBg?: Phaser.GameObjects.Rectangle;
  private turnIndicator?: Phaser.GameObjects.Text;

  constructor() {
    super('BattleScene');
    this.battleManager = new BattleManager();
  }

  create(data: BattleData) {
    const store = (window as any).gameStore?.getState();

    // Initialize battle
    let playerToken: CaughtToken | undefined;

    if (data.playerToken) {
      playerToken = data.playerToken;
    } else {
      // Find first healthy token
      playerToken = store.inventory.find((t: CaughtToken) => DamageCalculator.canBattle(t));
    }

    if (!playerToken) {
      this.showMessage('No healthy tokens available!');
      this.time.delayedCall(2000, () => {
        this.exitBattle();
      });
      return;
    }

    // Initialize battle based on type
    if (data.type === 'gym' && data.gymId) {
      const battle = this.battleManager.initGymBattle(playerToken, data.gymId);
      if (!battle) {
        this.showMessage('Gym not found!');
        this.time.delayedCall(2000, () => {
          this.exitBattle();
        });
        return;
      }
    } else if (data.type === 'wild' && data.opponentToken) {
      this.battleManager.initWildBattle(playerToken, data.opponentToken);
    } else {
      this.showMessage('Invalid battle configuration!');
      this.time.delayedCall(2000, () => {
        this.exitBattle();
      });
      return;
    }

    // Create UI
    this.createBattleUI();

    // Set up input
    this.setupInput();

    // Initial AI move selection
    this.battleManager.selectAIMove();
  }

  private createBattleUI() {
    const battle = this.battleManager.getBattle();
    if (!battle) return;

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x87CEEB)
      .setOrigin(0);

    // Battle arena ground
    this.add.rectangle(0, centerY + 20, this.cameras.main.width, this.cameras.main.height / 2, 0x90EE90)
      .setOrigin(0);

    // Player token (bottom-left)
    const playerSpriteKey = `token-${battle.player.token.type}-battle`;
    if (this.textures.exists(playerSpriteKey)) {
      this.playerSprite = this.add.sprite(40, centerY + 35, playerSpriteKey);
      if (this.anims.exists(playerSpriteKey + '-anim')) {
        this.playerSprite.play(playerSpriteKey + '-anim');
      }
    } else {
      console.error(`Missing sprite texture: ${playerSpriteKey}`);
      // Create a placeholder
      this.playerSprite = this.add.rectangle(40, centerY + 35, 24, 24, 0xFF0000) as any;
    }

    // Opponent token (top-right)
    const opponentSpriteKey = `token-${battle.opponent.token.type}-battle`;
    if (this.textures.exists(opponentSpriteKey)) {
      this.opponentSprite = this.add.sprite(120, centerY - 20, opponentSpriteKey);
      if (this.anims.exists(opponentSpriteKey + '-anim')) {
        this.opponentSprite.play(opponentSpriteKey + '-anim');
      }
    } else {
      console.error(`Missing sprite texture: ${opponentSpriteKey}`);
      // Create a placeholder
      this.opponentSprite = this.add.rectangle(120, centerY - 20, 24, 24, 0xFF0000) as any;
    }

    // Player info panel (top-left)
    this.createInfoPanel(
      10, 10,
      battle.player.token.symbol,
      battle.player.token.level,
      battle.player.currentHP,
      battle.player.token.maxHealth,
      'player'
    );

    // Opponent info panel (top-right)
    this.createInfoPanel(
      90, 10,
      battle.opponent.token.symbol,
      battle.opponent.token.level,
      battle.opponent.currentHP,
      battle.opponent.token.maxHealth,
      'opponent'
    );

    // Battle log (middle)
    this.battleLogText = this.add.text(
      centerX,
      centerY - 5,
      '',
      {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#000000',
        backgroundColor: '#FFFFFF',
        padding: { x: 6, y: 3 },
        wordWrap: { width: 140 },
        lineSpacing: 2,
      }
    ).setOrigin(0.5).setDepth(100);

    // Show initial log
    this.updateBattleLog();

    // Create move menu
    this.createMoveMenu();
  }

  private createInfoPanel(
    x: number,
    y: number,
    name: string,
    level: number,
    currentHP: number,
    maxHP: number,
    side: 'player' | 'opponent'
  ) {
    // Background
    this.add.rectangle(x, y, 70, 24, 0x000000, 0.7).setOrigin(0);

    // Name and level
    const nameText = this.add.text(x + 3, y + 3, `${name} Lv.${level}`, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1,
    });

    if (side === 'player') {
      this.playerNameText = nameText;
    } else {
      this.opponentNameText = nameText;
    }

    // Health bar background
    this.add.rectangle(x + 3, y + 13, 64, 5, 0x333333).setOrigin(0);

    // Health bar
    const healthPercent = currentHP / maxHP;
    const healthBarWidth = 64 * healthPercent;
    const healthColor = DamageCalculator.getHealthColor(currentHP, maxHP);

    const healthBar = this.add.rectangle(
      x + 3,
      y + 13,
      healthBarWidth,
      5,
      parseInt(healthColor.replace('#', '0x'))
    ).setOrigin(0);

    if (side === 'player') {
      this.playerHealthBar = healthBar;
    } else {
      this.opponentHealthBar = healthBar;
    }

    // HP text
    const hpText = this.add.text(x + 3, y + 19, `${currentHP}/${maxHP}`, {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 1,
    });

    if (side === 'player') {
      this.playerHealthText = hpText;
    } else {
      this.opponentHealthText = hpText;
    }
  }

  private createMoveMenu() {
    const battle = this.battleManager.getBattle();
    if (!battle) return;

    const moves = battle.player.token.moves;
    const menuX = 10;
    const menuY = this.cameras.main.height - 40;
    const menuWidth = 140;
    const menuHeight = 35;

    // Background
    this.moveMenuBg = this.add.rectangle(menuX, menuY, menuWidth, menuHeight, 0x000000, 0.8)
      .setOrigin(0);

    // Title
    this.add.text(menuX + 3, menuY + 3, 'Select Move:', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#FFFF00',
      stroke: '#000000',
      strokeThickness: 1,
    });

    // Move options
    moves.forEach((move, index) => {
      const moveText = this.add.text(
        menuX + 5,
        menuY + 13 + index * 8,
        `  ${move.name} (PWR:${move.power} ACC:${move.accuracy})`,
        {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 1,
        }
      );

      this.moveMenuTexts.push(moveText);
    });

    this.updateMoveSelection();
  }

  private updateMoveSelection() {
    this.moveMenuTexts.forEach((text, index) => {
      const isSelected = index === this.selectedMoveIndex;
      // Remove any existing prefix (either "> " or "  ")
      const cleanText = text.text.replace(/^(> |  )/, '');
      // Add appropriate prefix
      text.setText(isSelected ? `> ${cleanText}` : `  ${cleanText}`);
      text.setColor(isSelected ? '#FFFF00' : '#FFFFFF');
    });
  }

  private setupInput() {
    // Arrow keys for move selection
    this.input.keyboard?.on('keydown-UP', () => {
      if (!this.isSelectingMove) return;
      const moves = this.battleManager.getAvailableMoves('player');
      this.selectedMoveIndex = (this.selectedMoveIndex - 1 + moves.length) % moves.length;
      this.updateMoveSelection();
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (!this.isSelectingMove) return;
      const moves = this.battleManager.getAvailableMoves('player');
      this.selectedMoveIndex = (this.selectedMoveIndex + 1) % moves.length;
      this.updateMoveSelection();
    });

    // Enter to confirm move
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.handleMoveSelection();
    });

    // ESC to forfeit (only in wild battles)
    this.input.keyboard?.on('keydown-ESC', () => {
      const battle = this.battleManager.getBattle();
      if (battle?.type === 'wild') {
        this.exitBattle();
      }
    });
  }

  private handleMoveSelection() {
    const battle = this.battleManager.getBattle();
    if (!battle || !this.isSelectingMove || battle.phase !== 'select_move') return;

    const moves = this.battleManager.getAvailableMoves('player');
    const selectedMove = moves[this.selectedMoveIndex];

    if (!selectedMove) return;

    // Select player move
    this.battleManager.selectMove('player', selectedMove);

    // Disable move selection during animation
    this.isSelectingMove = false;

    // Hide move menu
    if (this.moveMenuBg) {
      this.moveMenuBg.setVisible(false);
    }
    this.moveMenuTexts.forEach((text) => text.setVisible(false));

    // Start turn animation phase
    this.battleManager.startTurnAnimation();

    // Get turn order
    const turnOrder = this.battleManager.getTurnOrder();
    if (!turnOrder) return;

    // Execute first move
    this.time.delayedCall(300, () => {
      const battleEnded = this.battleManager.executeSideMove(turnOrder.first);
      this.updateBattleUI();
      this.updateBattleLog();

      if (battleEnded) {
        this.time.delayedCall(1500, () => {
          this.handleBattleEnd();
        });
        return;
      }

      // Execute second move after delay
      this.time.delayedCall(1500, () => {
        const battleEnded2 = this.battleManager.executeSideMove(turnOrder.second);
        this.updateBattleUI();
        this.updateBattleLog();

        if (battleEnded2) {
          this.time.delayedCall(1500, () => {
            this.handleBattleEnd();
          });
          return;
        }

        // Complete turn
        this.time.delayedCall(1500, () => {
          this.battleManager.completeTurn();

          // Re-enable move selection for next turn
          this.isSelectingMove = true;
          if (this.moveMenuBg) {
            this.moveMenuBg.setVisible(true);
          }
          this.moveMenuTexts.forEach((text) => text.setVisible(true));

          // AI selects move for next turn
          this.battleManager.selectAIMove();
        });
      });
    });
  }

  private updateBattleUI() {
    const battle = this.battleManager.getBattle();
    if (!battle) return;

    // Update player health
    this.updateHealthBar(
      'player',
      battle.player.currentHP,
      battle.player.token.maxHealth
    );

    // Update opponent health
    this.updateHealthBar(
      'opponent',
      battle.opponent.currentHP,
      battle.opponent.token.maxHealth
    );

    // Flash effect for damage
    this.cameras.main.flash(100, 255, 100, 100);
  }

  private updateHealthBar(side: 'player' | 'opponent', currentHP: number, maxHP: number) {
    const healthBar = side === 'player' ? this.playerHealthBar : this.opponentHealthBar;
    const healthText = side === 'player' ? this.playerHealthText : this.opponentHealthText;

    if (!healthBar || !healthText) return;

    const healthPercent = currentHP / maxHP;
    const healthBarWidth = 64 * healthPercent;
    const healthColor = DamageCalculator.getHealthColor(currentHP, maxHP);

    healthBar.width = healthBarWidth;
    healthBar.fillColor = parseInt(healthColor.replace('#', '0x'));
    healthText.setText(`${currentHP}/${maxHP}`);
  }

  private updateBattleLog() {
    const battle = this.battleManager.getBattle();
    if (!battle || !this.battleLogText) return;

    // Show last 3 log entries
    const recentLogs = battle.log.slice(-3);
    const logText = recentLogs.map((log) => log.message).join('\n');
    this.battleLogText.setText(logText);
  }

  private handleBattleEnd() {
    const battle = this.battleManager.getBattle();
    if (!battle) return;

    const store = (window as any).gameStore?.getState();

    // Save player token's health back to store
    if (store && battle.player.token) {
      store.updateTokenHealth(battle.player.token.address, battle.player.currentHP);
    }

    if (battle.winner === 'player') {
      // Award rewards
      if (battle.rewards?.usdc) {
        store.addUSDC(battle.rewards.usdc);
      }

      if (battle.rewards?.badge) {
        store.earnBadge(battle.rewards.badge);
      }

      if (battle.gymData?.gymId) {
        store.defeatGym(battle.gymData.gymId);
      }

      // Flash victory
      this.cameras.main.flash(500, 255, 215, 0);
    } else {
      // Flash defeat
      this.cameras.main.flash(500, 139, 0, 0);
    }

    // Exit after delay
    this.time.delayedCall(3000, () => {
      this.exitBattle();
    });
  }

  private showMessage(message: string) {
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      message,
      {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#FFFFFF',
        backgroundColor: '#000000',
        padding: { x: 10, y: 6 },
        stroke: '#FFFFFF',
        strokeThickness: 0.5,
      }
    ).setOrigin(0.5);
  }

  private getTokenColor(type: string): number {
    const colorMap: Record<string, number> = {
      defi: 0x1E90FF,      // DodgerBlue
      layer1: 0xFFD700,    // Gold
      layer2: 0x9370DB,    // MediumPurple
      stablecoin: 0x00FF00, // Green
      meme: 0xFF1493,      // DeepPink
      exchange: 0xFF8C00,  // DarkOrange
      governance: 0x4169E1, // RoyalBlue
      wrapped: 0x8B4513,   // SaddleBrown
      unknown: 0x808080,   // Gray
    };

    return colorMap[type] || 0x808080;
  }

  private exitBattle() {
    // Clean up keyboard listeners
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-ESC');

    // Reset battle manager
    this.battleManager.reset();

    // Return to overworld
    this.scene.stop();
    this.scene.resume('OverworldScene');
  }

  shutdown() {
    // Clean up
    this.moveMenuTexts = [];
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-ENTER');
    this.input.keyboard?.off('keydown-ESC');
  }
}
