import { useQuery } from '@tanstack/react-query'
import { fetchTokens, Token } from '@/lib/api'

const SWAP_PROVIDERS = ['THORCHAIN', 'MAYACHAIN', 'ONEINCH', 'NEAR']

type UseTokensResult = {
  tokens: Token[]
  isLoading: boolean
  error: Error | null
}

export const useTokens = (): UseTokensResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tokens', SWAP_PROVIDERS.join(',')],
    queryFn: async () => {
      const responses = await Promise.all(
        SWAP_PROVIDERS.map(provider => fetchTokens(provider).catch(() => ({ tokens: [] })))
      )

      const tokenMap = new Map<string, Token>()
      for (const response of responses) {
        for (const token of response.tokens || []) {
          if (!tokenMap.has(token.identifier)) {
            tokenMap.set(token.identifier, token)
          }
        }
      }

      return Array.from(tokenMap.values()).sort((a, b) => a.ticker.localeCompare(b.ticker))
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnMount: false
  })

  return {
    tokens: data ?? [],
    isLoading,
    error: error as Error | null
  }
}
