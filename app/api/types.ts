export enum Chain {
  ETH = 'ETH',
  BSC = 'BSC',
  SOL = 'SOL',
  BTC = 'BTC'
}

export type BalanceAsset = {
  chain: Chain
  decimal: number
  ticker: string
  identifier: string
  value: string
  value_usd: string
  address: string | null
}

export interface TransactionHistoryItem {
  uniqueId: string
  category: 'external' | 'internal' | 'erc20' | 'spl' | 'native'
  blockNum: string
  timestamp: string
  from: string
  to: string | null
  value: number | null
  asset: string | null
  hash: string
  chain: Chain
  rawContract: {
    address: string | null
    decimal: string | null
  }
}

export interface TransactionHistoryResponse {
  transfers: TransactionHistoryItem[]
  pageKey?: string
}
