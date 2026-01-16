import { useAccount, useReadContract, useChainId } from 'wagmi';
import { CONTRACTS } from '@/lib/web3/config';
import { formatUnits } from 'viem';

const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

export function useUSDCBalance() {
  const { address } = useAccount();
  const chainId = useChainId();

  const usdcAddress = CONTRACTS.USDC[chainId as keyof typeof CONTRACTS.USDC];

  const { data: balance, isLoading, refetch } = useReadContract({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const formattedBalance = balance !== undefined ? formatUnits(balance as bigint, 6) : '0';

  return {
    balance: formattedBalance,
    rawBalance: balance,
    isLoading,
    refetch,
  };
}
