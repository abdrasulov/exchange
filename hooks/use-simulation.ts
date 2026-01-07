import { useQuery } from '@tanstack/react-query'
import { getAllowance } from '@/lib/erc20'
import { QuoteRoute, Token } from '@/lib/api'
import { rpcUrls, EVM_CHAINS } from '@/lib/chains'
import { ethers } from 'ethers'

type UseSimulationParams = {
  quote?: QuoteRoute | null
  fromToken?: Token | null
  amount: string
  sourceAddress?: string | null
}

type ApproveData = {
  spender: string
  contract: string
  amount: bigint
}

type UseSimulationResult = {
  needsApproval: boolean
  approveData: ApproveData | null
  currentAllowance: bigint | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export const useSimulation = (params: UseSimulationParams): UseSimulationResult => {
  const { quote, fromToken, amount, sourceAddress } = params

  const isEnabled = !!(
    quote &&
    fromToken?.address &&
    amount &&
    Number(amount) > 0 &&
    sourceAddress &&
    EVM_CHAINS.includes(fromToken.chain)
  )

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['simulation', quote, fromToken?.address, amount, sourceAddress],
    queryFn: async () => {
      if (!quote || !fromToken?.address || !amount || !sourceAddress) {
        return { needsApproval: false, approveData: null, currentAllowance: null }
      }

      const rpcUrl = rpcUrls[fromToken.chain]
      const spenderAddress = quote.meta?.approvalAddress

      if (!rpcUrl || !spenderAddress) {
        return { needsApproval: false, approveData: null, currentAllowance: null }
      }

      const currentAllowance = await getAllowance(fromToken.address, sourceAddress, spenderAddress, rpcUrl)

      const requiredAmount = ethers.parseUnits(amount, fromToken.decimals)
      const needsApproval = currentAllowance < requiredAmount

      const approveData: ApproveData | null = needsApproval
        ? {
            spender: spenderAddress,
            contract: fromToken.address,
            amount: requiredAmount
          }
        : null

      return { needsApproval, approveData, currentAllowance }
    },
    enabled: isEnabled,
    retry: false,
    refetchOnMount: false
  })

  return {
    needsApproval: data?.needsApproval ?? false,
    approveData: data?.approveData ?? null,
    currentAllowance: data?.currentAllowance ?? null,
    isLoading,
    error: error as Error | null,
    refetch
  }
}
