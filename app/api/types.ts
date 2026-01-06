export enum BlockchainType {
  Ethereum = 'Ethereum',
  BSC = 'BSC'
}

const chainIds: Record<BlockchainType, number> = {
  Ethereum: 1,
  BSC: 56
}

export type TokenBalance = {
  balance: number
  token: Token
  usdPrice?: number
  usdValue?: number
}

export class Token {
  code: string
  name: string
  decimals: number
  blockchainType: BlockchainType
  tokenType: TokenType
  id: string
  chainId: number

  constructor(code: string, name: string, decimals: number, blockchainType: BlockchainType, tokenType: TokenType) {
    this.code = code
    this.name = name
    this.decimals = decimals
    this.blockchainType = blockchainType
    this.tokenType = tokenType
    this.id = blockchainType + ':' + tokenType.id
    this.chainId = chainIds[this.blockchainType]
  }
}

interface TokenType {
  id: string
}

export class TokenTypeNative implements TokenType {
  id: string

  constructor() {
    this.id = 'Native'
  }
}

export class TokenTypeEip20 implements TokenType {
  id: string
  contractAddress: string

  constructor(contractAddress: string) {
    this.id = 'Eip20-' + contractAddress
    this.contractAddress = contractAddress
  }
}

export interface TransactionHistoryItem {
  uniqueId: string
  category: 'external' | 'internal' | 'erc20'
  blockNum: string
  timestamp: string
  from: string
  to: string | null
  value: number | null
  asset: string | null
  hash: string
  rawContract: {
    address: string | null
    decimal: string | null
  }
}

export interface TransactionHistoryResponse {
  transfers: TransactionHistoryItem[]
  pageKey?: string
}
