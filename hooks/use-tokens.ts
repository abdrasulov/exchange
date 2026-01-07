import { useQuery } from '@tanstack/react-query'
import { fetchTokens, Token } from '@/lib/api'

type UseTokensParams = {
  provider?: string
}

type UseTokensResult = {
  tokens: Token[]
  isLoading: boolean
  error: Error | null
}

export const useTokens = (params: UseTokensParams = {}): UseTokensResult => {
  const { provider = 'THORCHAIN' } = params

  const { data, isLoading, error } = useQuery({
    queryKey: ['tokens', provider],
    queryFn: async () => {
      const response = await fetchTokens(provider)
      return (response.tokens || []).sort((a, b) => a.ticker.localeCompare(b.ticker))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false
  })

  return {
    tokens: data ?? [],
    isLoading,
    error: error as Error | null
  }
}