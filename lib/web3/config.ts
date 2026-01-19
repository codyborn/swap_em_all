import { http, createConfig } from 'wagmi';
import { unichain } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

// WalletConnect Project ID - Get from https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [unichain],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: "Swap 'Em All" }),
    walletConnect({ projectId }),
  ],
  transports: {
    [unichain.id]: http(),
  },
});

// Contract addresses on Unichain
export const CONTRACTS = {
  USDC: {
    [unichain.id]: '0x078d782b760474a361dda0af3839290b0ef57ad6',
  },
  UNISWAP_UNIVERSAL_ROUTER: {
    [unichain.id]: '0xef740bf23acae26f6492b10de645d6b98dc8eaf3',
  },
  PERMIT2: {
    [unichain.id]: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  },
} as const;

// Token addresses on Unichain mainnet
// These are the tokens players can catch/swap
export const TOKENS = {
  // Stablecoins
  USDC: {
    address: '0x078d782b760474a361dda0af3839290b0ef57ad6' as const,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
  },
  DAI: {
    address: '0x20cab320a855b39f724131c69424240519573f81' as const,
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
  USDT: {
    address: '0x9151434b16b9763660705744891fa906f660ecc5' as const,
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD',
  },
  // Wrapped Assets
  WETH: {
    address: '0x4200000000000000000000000000000000000006' as const,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  WBTC: {
    address: '0x927B51f251480a681271180DA4de28D44EC4AfB8' as const,
    decimals: 8,
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
  },
  // DeFi Tokens
  UNI: {
    address: '0x8f187aA05619a017077f5308904739877ce9eA21' as const,
    decimals: 18,
    symbol: 'UNI',
    name: 'Uniswap',
  },
  USDS: {
    address: '0x7E10036Acc4B56d4dFCa3b77810356CE52313F9C' as const,
    decimals: 18,
    symbol: 'USDS',
    name: 'USDS Stablecoin',
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
