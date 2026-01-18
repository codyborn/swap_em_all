import { BaseMapScene, MapData } from '../BaseMapScene';
import { PALLET_TOWN_MAP } from '../../data/maps/pallet-town-data';

/**
 * Pallet Town - Starting area
 *
 * Features:
 * - Professor Oak (tutorial NPC)
 * - Pokeball Shop
 * - Token Center (healing)
 * - Token Trader
 * - Exit to Route 1 (north)
 */
export class PalletTownScene extends BaseMapScene {
  constructor() {
    super('PalletTownScene');
  }

  protected getMapData(): MapData {
    return PALLET_TOWN_MAP as MapData;
  }

  protected getSceneName(): string {
    return 'PalletTown';
  }

  // Override if we need custom logic for Pallet Town
  create(data?: { spawnPoint?: string }) {
    super.create(data);

    // Add Pallet Town specific logic here if needed
    // For example, first-time tutorial triggers, etc.
  }
}
