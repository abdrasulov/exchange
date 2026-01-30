export const chainAddressFormats: Record<string, string> = {
  // EVM chains
  ETH: 'ADDRESS_FORMAT_ETHEREUM',
  BSC: 'ADDRESS_FORMAT_ETHEREUM',
  AVAX: 'ADDRESS_FORMAT_ETHEREUM',
  BASE: 'ADDRESS_FORMAT_ETHEREUM',
  ARB: 'ADDRESS_FORMAT_ETHEREUM',
  OP: 'ADDRESS_FORMAT_ETHEREUM',
  // Non-EVM chains
  BTC: 'ADDRESS_FORMAT_BITCOIN_MAINNET_P2WPKH',
  SOL: 'ADDRESS_FORMAT_SOLANA',
  DOGE: 'ADDRESS_FORMAT_DOGECOIN',
  LTC: 'ADDRESS_FORMAT_LITECOIN',
  BCH: 'ADDRESS_FORMAT_BITCOIN',
  GAIA: 'ADDRESS_FORMAT_COSMOS'
}

export const rpcUrls: Record<string, string> = {
  ETH: 'https://ethereum-rpc.publicnode.com',
  BSC: 'https://bsc-rpc.publicnode.com',
  AVAX: 'https://avalanche-c-chain-rpc.publicnode.com',
  BASE: 'https://base-rpc.publicnode.com',
  ARB: 'https://arbitrum-one-rpc.publicnode.com',
  OP: 'https://optimism-rpc.publicnode.com',
  SOL: 'https://solana-rpc.publicnode.com'
}

export const EVM_CHAINS = ['ETH', 'BSC', 'AVAX', 'BASE', 'ARB', 'OP']

export const blockExplorers: Record<string, string> = {
  ETH: 'https://etherscan.io',
  BSC: 'https://bscscan.com',
  AVAX: 'https://snowtrace.io',
  BASE: 'https://basescan.org',
  ARB: 'https://arbiscan.io',
  OP: 'https://optimistic.etherscan.io',
  BTC: 'https://mempool.space',
  SOL: 'https://solscan.io'
}

export function getExplorerTxUrl(chain: string, txHash: string): string {
  const explorer = blockExplorers[chain] || blockExplorers.ETH
  return `${explorer}/tx/${txHash}`
}