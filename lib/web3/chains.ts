import { base, baseSepolia } from 'wagmi/chains';

// Re-export chains for easy access
export { base, baseSepolia };

// Helper to get current chain based on environment
export const getCurrentChain = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? base : baseSepolia;
};

// Helper to check if we're on testnet
export const isTestnet = (chainId: number) => {
  return chainId === baseSepolia.id;
};
