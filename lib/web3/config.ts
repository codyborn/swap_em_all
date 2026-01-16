import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

// WalletConnect Project ID - Get from https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: "Swap 'Em All" }),
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// Contract addresses
export const CONTRACTS = {
  USDC: {
    [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  },
  UNISWAP_UNIVERSAL_ROUTER: {
    [base.id]: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
    [baseSepolia.id]: '0x050E797f3625EC8785265e1d9BDd4799b97528A1',
  },
} as const;

// Game configuration
export const GAME_CONFIG = {
  POKEBALL_COST_USDC: '1', // 1 USDC per pokeball
  MIN_SWAP_AMOUNT_USDC: '1', // Minimum 1 USDC to catch a token
  MAX_SLIPPAGE: 0.5, // 0.5% slippage tolerance
} as const;
