// Expose store to window for Phaser scenes to access
import { useGameStore } from './gameStore';

if (typeof window !== 'undefined') {
  (window as any).gameStore = useGameStore;
}
