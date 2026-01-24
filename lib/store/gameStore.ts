import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CaughtToken,
  DEFAULT_MOVES,
  getTokenType,
  getBaseStats,
} from "../types/token";
import { Badge } from "../types/battle";
import { LevelingSystem } from "../utils/levelingSystem";
import { DamageCalculator } from "../utils/damageCalculator";

// Legacy type for backward compatibility
export interface TokenCreature {
  symbol: string;
  name: string;
  address: string;
  amount: string;
  caughtAt: number;
  imageUrl?: string;
}

export interface GameState {
  // Player state
  walletAddress: string | null;
  pokeballs: number;
  usdc: number; // Track USDC balance (simulated for now)

  // Inventory - tokens the player has caught (V2 format)
  inventory: CaughtToken[];

  // Items
  items: {
    potions: number;
    superPotions: number;
    hyperPotions: number;
    maxPotions: number;
    revives: number;
    maxRevives: number;
  };

  // Cryptodex - all tokens the player has seen
  cryptodex: Set<string>; // Set of token addresses

  // Progress
  badges: Badge[];
  gymsDefeated: string[];
  tutorialComplete: boolean;
  encountersCount: number;

  // Settings
  priceUpdateInterval: number;

  // Stats cache
  statsCache: {
    data: any | null;
    lastFetched: number | null;
  };

  // Actions - Existing
  setWalletAddress: (address: string | null) => void;
  addPokeballs: (count: number) => void;
  usePokeball: () => boolean;
  catchToken: (
    token: Omit<CaughtToken, "level" | "health" | "stats"> | TokenCreature,
  ) => void;
  sellToken: (tokenAddress: string) => void;
  addToCryptodex: (tokenAddress: string) => void;
  completeTutorial: () => void;
  incrementEncounters: () => void;
  resetGame: () => void;

  // Actions - Items
  addItem: (itemType: keyof GameState["items"], quantity: number) => void;
  useItem: (
    itemType: keyof GameState["items"],
    tokenAddress: string,
  ) => boolean;

  // Actions - Price & Health
  updateTokenPrice: (address: string, newPrice: number) => void;
  updateTokenHealth: (address: string, newHealth: number) => void;
  healToken: (address: string, amount: number) => void;
  reviveToken: (address: string, percent?: number) => void;

  // Actions - Badges
  earnBadge: (badge: Badge) => void;
  defeatGym: (gymId: string) => void;

  // Actions - USDC
  addUSDC: (amount: number) => void;
  spendUSDC: (amount: number) => boolean;

  // Actions - Stats Cache
  fetchAndCacheStats: () => Promise<void>;
  clearStatsCache: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      walletAddress: null,
      pokeballs: 5, // Start with 5
      usdc: 1000, // Start with 1000 USDC
      inventory: [],
      items: {
        potions: 3,
        superPotions: 0,
        hyperPotions: 0,
        maxPotions: 0,
        revives: 1,
        maxRevives: 0,
      },
      cryptodex: new Set(),
      badges: [],
      gymsDefeated: [],
      tutorialComplete: false,
      encountersCount: 0,
      priceUpdateInterval: 300000, // 5 minutes
      statsCache: {
        data: null,
        lastFetched: null,
      },

      // Existing actions
      setWalletAddress: (address: string | null) =>
        set({ walletAddress: address }),

      addPokeballs: (count: number) =>
        set((state) => ({ pokeballs: state.pokeballs + count })),

      usePokeball: () => {
        const state = get();
        if (state.pokeballs > 0) {
          set({ pokeballs: state.pokeballs - 1 });
          return true;
        }
        return false;
      },

      catchToken: (
        token: Omit<CaughtToken, "level" | "health" | "stats"> | TokenCreature,
      ) => {
        // Convert legacy TokenCreature to CaughtToken if needed
        const isLegacy = "amount" in token;

        let caughtToken: CaughtToken;

        if (isLegacy) {
          // Convert from legacy format
          const legacyToken = token as TokenCreature;
          const tokenType = getTokenType(legacyToken.symbol);
          const baseStats = getBaseStats(tokenType);
          const purchasePrice = 100;
          const currentPrice = 100;
          const currGain = 0; // Starting at purchase price means 0 gain
          const maxGain = 0; // Starting at purchase price means 0 gain
          const level = 1;
          const stats = LevelingSystem.calculateStats(
            level,
            currGain,
            tokenType,
            baseStats,
          );
          const maxHealth = LevelingSystem.calculateMaxHealth(level, tokenType);

          caughtToken = {
            symbol: legacyToken.symbol,
            name: legacyToken.name,
            address: legacyToken.address,
            caughtAt: legacyToken.caughtAt,
            purchasePrice,
            currentPrice,
            peakPrice: currentPrice,
            maxGain,
            lastPriceUpdate: Date.now(),
            priceHistory: [{ price: currentPrice, timestamp: Date.now() }],
            level: 1,
            maxLevel: 1,
            experience: 0,
            health: maxHealth,
            maxHealth,
            isKnockedOut: false,
            lastHealthUpdate: Date.now(),
            stats,
            moves: DEFAULT_MOVES.filter((m) => m.learnedAt <= level),
            rarity: "common",
            type: tokenType,
            description: `A ${legacyToken.name} token from the blockchain.`,
            levelHistory: [
              {
                level: 1,
                price: currentPrice,
                timestamp: Date.now(),
                event: "caught",
              },
            ],
          };
        } else {
          // Already in new format, just add missing fields
          const newToken = token as Omit<
            CaughtToken,
            "level" | "health" | "stats"
          >;
          const tokenType = newToken.type || getTokenType(newToken.symbol);

          // Calculate gains
          const currGain = LevelingSystem.calculateCurrentGain(
            newToken.purchasePrice,
            newToken.currentPrice,
          );
          const maxGain = LevelingSystem.calculateMaxGain(
            newToken.purchasePrice,
            newToken.peakPrice || newToken.currentPrice,
          );
          const level = LevelingSystem.calculateLevel(maxGain);
          const stats = LevelingSystem.calculateStats(
            level,
            currGain,
            tokenType,
          );
          const maxHealth = LevelingSystem.calculateMaxHealth(level, tokenType);

          caughtToken = {
            ...newToken,
            level,
            maxLevel: level,
            maxGain: maxGain,
            experience: 0,
            health: maxHealth,
            maxHealth,
            isKnockedOut: false,
            lastHealthUpdate: Date.now(),
            stats,
            moves: DEFAULT_MOVES.filter((m) => m.learnedAt <= level),
            type: tokenType,
          } as CaughtToken;
        }

        set((state) => ({
          inventory: [...state.inventory, caughtToken],
          cryptodex: new Set([...state.cryptodex, caughtToken.address]),
        }));
      },

      sellToken: (tokenAddress: string) =>
        set((state) => {
          const tokenIndex = state.inventory.findIndex(
            (t) => t.address === tokenAddress,
          );
          if (tokenIndex === -1) return state;

          const token = state.inventory[tokenIndex];
          const salePrice = Math.floor(token.currentPrice * 0.8); // 80% of current price

          // Remove only the first token with this address (sell one at a time)
          const newInventory = [
            ...state.inventory.slice(0, tokenIndex),
            ...state.inventory.slice(tokenIndex + 1),
          ];

          return {
            inventory: newInventory,
            usdc: state.usdc + salePrice,
          };
        }),

      addToCryptodex: (tokenAddress: string) =>
        set((state) => ({
          cryptodex: new Set([...state.cryptodex, tokenAddress]),
        })),

      completeTutorial: () => set({ tutorialComplete: true }),

      incrementEncounters: () =>
        set((state) => ({ encountersCount: state.encountersCount + 1 })),

      // New V2 actions - Items
      addItem: (itemType, quantity) =>
        set((state) => ({
          items: {
            ...state.items,
            [itemType]: state.items[itemType] + quantity,
          },
        })),

      useItem: (itemType, tokenAddress) => {
        const state = get();
        const token = state.inventory.find((t) => t.address === tokenAddress);

        if (!token || state.items[itemType] <= 0) {
          return false;
        }

        // Define item effects
        const itemEffects: Record<
          string,
          { heal?: number; revive?: boolean; percent?: number }
        > = {
          potions: { heal: 20 },
          superPotions: { heal: 50 },
          hyperPotions: { heal: 100 },
          maxPotions: { heal: 999999 }, // Full heal
          revives: { revive: true, percent: 50 },
          maxRevives: { revive: true, percent: 100 },
        };

        const effect = itemEffects[itemType];

        if (effect.revive && token.isKnockedOut) {
          // Revive
          const newHealth = DamageCalculator.reviveToken(
            token.maxHealth,
            effect.percent,
          );
          get().updateTokenHealth(tokenAddress, newHealth);

          set((state) => ({
            items: {
              ...state.items,
              [itemType]: state.items[itemType] - 1,
            },
            inventory: state.inventory.map((t) =>
              t.address === tokenAddress
                ? { ...t, isKnockedOut: false, health: newHealth }
                : t,
            ),
          }));

          return true;
        } else if (effect.heal && !token.isKnockedOut) {
          // Heal
          const newHealth = DamageCalculator.healToken(
            token.health,
            token.maxHealth,
            effect.heal,
          );
          get().updateTokenHealth(tokenAddress, newHealth);

          set((state) => ({
            items: {
              ...state.items,
              [itemType]: state.items[itemType] - 1,
            },
          }));

          return true;
        }

        return false;
      },

      // New V2 actions - Price & Health
      updateTokenPrice: (address, newPrice) =>
        set((state) => {
          const tokenIndex = state.inventory.findIndex(
            (t) => t.address === address,
          );
          if (tokenIndex === -1) return state;

          const token = state.inventory[tokenIndex];
          const oldLevel = token.level;
          const newPeakPrice = Math.max(token.peakPrice, newPrice);
          const newMaxGain = LevelingSystem.calculateMaxGain(
            token.purchasePrice,
            newPeakPrice,
          );
          const newLevel = LevelingSystem.calculateLevel(newMaxGain);

          // Calculate level up
          let updates: Partial<CaughtToken> = {
            currentPrice: newPrice,
            peakPrice: newPeakPrice,
            maxGain: newMaxGain,
            lastPriceUpdate: Date.now(),
            priceHistory: [
              ...token.priceHistory,
              { price: newPrice, timestamp: Date.now() },
            ].slice(-100), // Keep last 100 price points
          };

          if (newLevel > oldLevel) {
            // Level up!
            const levelUpData = LevelingSystem.levelUp(
              token,
              newLevel,
              newMaxGain,
            );
            updates = { ...updates, ...levelUpData };
          } else {
            // Even if no level up, update stats because attack is tied to curr_gain
            const statsUpdate = LevelingSystem.updateStatsForPrice(
              token,
              newPrice,
            );
            updates = { ...updates, ...statsUpdate };
          }

          // Calculate damage from price drop
          if (newPrice < token.peakPrice) {
            const damageData = DamageCalculator.applyPriceDamage(
              token,
              newPrice,
            );
            updates = { ...updates, ...damageData };
          }

          const newInventory = [...state.inventory];
          newInventory[tokenIndex] = { ...token, ...updates };

          return { inventory: newInventory };
        }),

      updateTokenHealth: (address, newHealth) =>
        set((state) => ({
          inventory: state.inventory.map((t) =>
            t.address === address
              ? {
                  ...t,
                  health: Math.max(0, Math.min(t.maxHealth, newHealth)),
                  isKnockedOut: newHealth <= 0,
                  lastHealthUpdate: Date.now(),
                }
              : t,
          ),
        })),

      healToken: (address, amount) => {
        const state = get();
        const token = state.inventory.find((t) => t.address === address);

        if (!token || token.isKnockedOut) return;

        const newHealth = DamageCalculator.healToken(
          token.health,
          token.maxHealth,
          amount,
        );
        get().updateTokenHealth(address, newHealth);

        set((state) => ({
          inventory: state.inventory.map((t) =>
            t.address === address
              ? {
                  ...t,
                  levelHistory: [
                    ...t.levelHistory,
                    {
                      level: t.level,
                      price: t.currentPrice,
                      timestamp: Date.now(),
                      event: "healed" as const,
                    },
                  ],
                }
              : t,
          ),
        }));
      },

      reviveToken: (address, percent = 50) => {
        const state = get();
        const token = state.inventory.find((t) => t.address === address);

        if (!token || !token.isKnockedOut) return;

        const newHealth = DamageCalculator.reviveToken(
          token.maxHealth,
          percent,
        );

        set((state) => ({
          inventory: state.inventory.map((t) =>
            t.address === address
              ? {
                  ...t,
                  health: newHealth,
                  isKnockedOut: false,
                  lastHealthUpdate: Date.now(),
                  levelHistory: [
                    ...t.levelHistory,
                    {
                      level: t.level,
                      price: t.currentPrice,
                      timestamp: Date.now(),
                      event: "revived" as const,
                    },
                  ],
                }
              : t,
          ),
        }));
      },

      // New V2 actions - Badges
      earnBadge: (badge) =>
        set((state) => {
          // Don't add duplicate badges
          if (state.badges.some((b) => b.id === badge.id)) {
            return state;
          }

          return {
            badges: [...state.badges, { ...badge, earnedAt: Date.now() }].sort(
              (a, b) => a.order - b.order,
            ),
          };
        }),

      defeatGym: (gymId) =>
        set((state) => ({
          gymsDefeated: [...new Set([...state.gymsDefeated, gymId])],
        })),

      // New V2 actions - USDC
      addUSDC: (amount) => set((state) => ({ usdc: state.usdc + amount })),

      spendUSDC: (amount) => {
        const state = get();
        if (state.usdc >= amount) {
          set({ usdc: state.usdc - amount });
          return true;
        }
        return false;
      },

      // Stats Cache actions
      fetchAndCacheStats: async () => {
        const state = get();
        const walletAddress = state.walletAddress;

        if (!walletAddress) {
          console.warn("Cannot fetch stats: No wallet address");
          return;
        }

        try {
          const response = await fetch(
            `/api/game/stats?address=${walletAddress}`,
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.statusText}`);
          }

          const data = await response.json();
          set({
            statsCache: {
              data,
              lastFetched: Date.now(),
            },
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      },

      clearStatsCache: () => {
        set({
          statsCache: {
            data: null,
            lastFetched: null,
          },
        });
      },

      resetGame: () =>
        set({
          pokeballs: 5,
          usdc: 1000,
          inventory: [],
          items: {
            potions: 3,
            superPotions: 0,
            hyperPotions: 0,
            maxPotions: 0,
            revives: 1,
            maxRevives: 0,
          },
          cryptodex: new Set(),
          badges: [],
          gymsDefeated: [],
          tutorialComplete: false,
          encountersCount: 0,
        }),
    }),
    {
      name: "swap-em-all-storage-v2",
      version: 2,
      // Custom serialization for Set
      partialize: (state) => ({
        ...state,
        cryptodex: Array.from(state.cryptodex),
      }),
      // Custom deserialization for Set
      merge: (persistedState: any, currentState: GameState) => ({
        ...currentState,
        ...persistedState,
        cryptodex: new Set(persistedState.cryptodex || []),
      }),
    },
  ),
);

// Expose store to window for Phaser access
if (typeof window !== "undefined") {
  (window as any).gameStore = useGameStore;
}
