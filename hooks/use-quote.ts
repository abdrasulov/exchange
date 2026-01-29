import { RefetchOptions, useQuery } from '@tanstack/react-query'
import { fetchQuote, QuoteResponse, QuoteRoute } from '@/lib/api'

type QuoteParams = {
  sellAsset?: string
  buyAsset?: string
  sellAmount: string
  slippage: number
  sourceAddress?: string
  destinationAddress?: string
  providers?: string[]
  dry?: boolean
}

type UseQuoteResult = {
  isLoading: boolean
  refetch: (options?: RefetchOptions) => void
  quote?: QuoteRoute
  quoteResponse?: QuoteResponse
  error: Error | null
}

export const useQuote = (params: QuoteParams): UseQuoteResult => {
  const {
    sellAsset,
    buyAsset,
    sellAmount,
    slippage,
    sourceAddress,
    destinationAddress,
    providers = ['THORCHAIN', 'MAYACHAIN', 'ONEINCH', 'NEAR'],
    dry = true
  } = params

  const queryKey = [
    'quote',
    sellAsset,
    buyAsset,
    sellAmount,
    slippage,
    sourceAddress,
    destinationAddress,
    providers.join(','),
    dry
  ]

  const isEnabled = !!(sellAsset && buyAsset && sellAmount && Number(sellAmount) > 0 && (dry || destinationAddress))

  const { data, refetch, isLoading, isRefetching, error } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!sellAsset || !buyAsset || !sellAmount) {
        return null
      }
      if (!dry && !destinationAddress) {
        return null
      }

      const response = await fetchQuote(
        {
          sellAsset,
          buyAsset,
          sellAmount,
          destinationAddress,
          sourceAddress,
          slippage,
          providers,
          dry
        },
        signal
      )

      if (!response.routes.length && response.providerErrors?.length) {
        const errorMsg = response.providerErrors[0].error
        throw new Error(typeof errorMsg === 'string' ? errorMsg : 'Quote error')
      }

      const bestRoute = response.routes?.reduce<QuoteRoute | null>(
        (acc, r) => (!acc || Number(r.expectedBuyAmount) > Number(acc.expectedBuyAmount) ? r : acc),
        null
      )

      return { bestRoute, response }
    },
    enabled: isEnabled,
    retry: false,
    refetchOnMount: false
  })

  return {
    isLoading: isLoading || isRefetching,
    refetch,
    quote: isLoading || isRefetching || error ? undefined : (data?.bestRoute ?? undefined),
    quoteResponse: data?.response,
    error: error as Error | null
  }
}
