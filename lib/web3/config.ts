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
  PERMIT2: {
    [base.id]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    [baseSepolia.id]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  },
} as const;

// Token addresses on Base mainnet
// These are the tokens players can catch/swap
export const TOKENS = {
  // Stablecoins
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  },
  DAI: {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' as const,
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
  // Wrapped ETH
  WETH: {
    address: '0x4200000000000000000000000000000000000006' as const,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  // DeFi Tokens
  AERO: {
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631' as const,
    decimals: 18,
    symbol: 'AERO',
    name: 'Aerodrome',
  },
  // Meme Tokens
  BRETT: {
    address: '0x532f27101965dd16442E59d40670FaF5eBB142E4' as const,
    decimals: 18,
    symbol: 'BRETT',
    name: 'Brett',
  },
  DEGEN: {
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed' as const,
    decimals: 18,
    symbol: 'DEGEN',
    name: 'Degen',
  },
  TOSHI: {
    address: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4' as const,
    decimals: 18,
    symbol: 'TOSHI',
    name: 'Toshi',
  },
} as const;

// Token metadata lookup by address
export const TOKEN_BY_ADDRESS: Record<string, (typeof TOKENS)[keyof typeof TOKENS]> = Object.fromEntries(
  Object.values(TOKENS).map((token) => [token.address.toLowerCase(), token])
);

// Get token info by address
export function getTokenInfo(address: string) {
  return TOKEN_BY_ADDRESS[address.toLowerCase()];
}

// Game configuration
export const GAME_CONFIG = {
  POKEBALL_COST_USDC: '1', // 1 USDC per pokeball
  MIN_SWAP_AMOUNT_USDC: '1', // Minimum 1 USDC to catch a token
  MAX_SLIPPAGE: 0.5, // 0.5% slippage tolerance
} as const;
