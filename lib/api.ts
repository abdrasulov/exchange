import { TokenBalance, TransactionHistoryResponse } from '@/app/api/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://swap-api.unstoppable.money'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

type FetchOptions = {
  method?: string
  headers?: Record<string, string>
  body?: string
  signal?: AbortSignal
}

async function apiRequest<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API request failed: ${response.status} - ${errorText}`)
  }

  return response.json()
}

export type Token = {
  identifier: string
  address: string | null
  chain: string
  chainId: string
  decimals: number
  ticker: string
  name: string
}

export type TokensResponse = {
  tokens: Token[]
}

export async function fetchTokens(provider: string = 'THORCHAIN'): Promise<TokensResponse> {
  const url = `${API_BASE_URL}/v1/tokens?provider=${provider}`
  return apiRequest<TokensResponse>(url, {
    headers: {
      'x-api-key': API_KEY
    }
  })
}

export type QuoteRoute = {
  expectedBuyAmount: string
  estimatedTime: { total: number }
  tx?: {
    to?: string
    value?: string
    data?: string
    gasPrice?: string
  }
  targetAddress?: string
  inboundAddress?: string
  memo?: string
}

export type QuoteResponse = {
  routes: QuoteRoute[]
  providerErrors: Array<{ provider: string; error: string }>
}

export type QuoteRequest = {
  sellAsset: string
  buyAsset: string
  sellAmount: string
  destinationAddress: string
  sourceAddress?: string
  slippage: number
  providers: string[]
  dry: boolean
}

export async function fetchQuote(request: QuoteRequest, signal?: AbortSignal): Promise<QuoteResponse> {
  return apiRequest<QuoteResponse>(`${API_BASE_URL}/v1/quote`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY
    },
    body: JSON.stringify(request),
    signal
  })
}

export async function fetchBalances(address: string, addressFormat: string): Promise<TokenBalance[]> {
  const url = `/api/balances?${new URLSearchParams({ address, addressFormat })}`
  return apiRequest<TokenBalance[]>(url)
}

export async function fetchTransactions(
  address: string,
  addressFormat: string,
  pageKey?: string
): Promise<TransactionHistoryResponse> {
  let url = `/api/transactions?address=${address}&addressFormat=${addressFormat}`
  if (pageKey) {
    url += `&pageKey=${pageKey}`
  }

  return apiRequest<TransactionHistoryResponse>(url)
}

export type VerificationResponse = {
  verified: boolean
}

export async function fetchVerificationStatus(userId: string): Promise<VerificationResponse> {
  const url = `/api/verification/?userId=${userId}`
  return apiRequest<VerificationResponse>(url)
}
