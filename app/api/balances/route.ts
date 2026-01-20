import { NextRequest } from 'next/server'
import { BalanceAsset, Chain } from '@/app/api/types'
import { Alchemy, Network } from 'alchemy-sdk'
import coingeckoIds from '@/data/coingecko-ids.json'

type BalanceItem = {
  chain: Chain
  decimal: number
  ticker: string
  value: number
  address: string | null
}

const COINGECKO_IDS: Record<string, string> = coingeckoIds

async function fetchTokenPrices(tickers: string[]): Promise<Record<string, number>> {
  if (tickers.length === 0) return {}

  const coingeckoIds = tickers.map(ticker => COINGECKO_IDS[ticker.toUpperCase()]).filter(Boolean)

  if (coingeckoIds.length === 0) return {}

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds.join(',')}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return {}

    const data = await response.json()
    const prices: Record<string, number> = {}

    for (const ticker of tickers) {
      const coingeckoId = COINGECKO_IDS[ticker.toUpperCase()]
      if (coingeckoId && data[coingeckoId]?.usd) {
        prices[ticker.toUpperCase()] = data[coingeckoId].usd
      }
    }

    return prices
  } catch (error) {
    console.error('Error fetching token prices:', error)
    return {}
  }
}

async function fetchEthereumBalances(address: string): Promise<BalanceItem[]> {
  const balances: BalanceItem[] = []

  const alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
    connectionInfoOverrides: {
      skipFetchSetup: true
    }
  })

  try {
    // Fetch native ETH balance
    const balanceWei = await alchemy.core.getBalance(address)
    const balanceEth = Number(balanceWei) / Math.pow(10, 18)

    balances.push({
      chain: Chain.ETH,
      decimal: 18,
      ticker: 'ETH',
      value: balanceEth,
      address: null
    })

    // Fetch all ERC-20 token balances
    const tokensResponse = await alchemy.core.getTokensForOwner(address)

    for (const ownedToken of tokensResponse.tokens) {
      if (!ownedToken.contractAddress || !ownedToken.balance) continue

      const balance = parseFloat(ownedToken.balance)
      if (balance === 0) continue

      balances.push({
        chain: Chain.ETH,
        decimal: ownedToken.decimals ?? 18,
        ticker: ownedToken.symbol || 'UNKNOWN',
        value: balance,
        address: ownedToken.contractAddress
      })
    }
  } catch (e) {
    console.error('Error fetching Ethereum balances:', e)
  }

  return balances
}

async function fetchSolanaBalances(address: string): Promise<BalanceItem[]> {
  const balances: BalanceItem[] = []

  try {
    // Fetch SOL balance using Alchemy Solana API
    const response = await fetch(`https://solana-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address]
      })
    })

    const data = await response.json()
    if (data.result?.value !== undefined) {
      const balanceSol = data.result.value / Math.pow(10, 9)
      balances.push({
        chain: Chain.SOL,
        decimal: 9,
        ticker: 'SOL',
        value: balanceSol,
        address: null
      })
    }

    // Fetch SPL token balances
    const tokensResponse = await fetch(`https://solana-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'getTokenAccountsByOwner',
        params: [address, { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, { encoding: 'jsonParsed' }]
      })
    })

    const tokensData = await tokensResponse.json()
    if (tokensData.result?.value) {
      for (const account of tokensData.result.value) {
        const info = account.account?.data?.parsed?.info
        if (!info) continue

        const tokenAmount = info.tokenAmount
        if (!tokenAmount || tokenAmount.uiAmount === 0) continue

        balances.push({
          chain: Chain.SOL,
          decimal: tokenAmount.decimals ?? 9,
          ticker: info.mint?.slice(0, 6) || 'UNKNOWN',
          value: tokenAmount.uiAmount,
          address: info.mint
        })
      }
    }
  } catch (e) {
    console.error('Error fetching Solana balances:', e)
  }

  return balances
}

async function fetchBitcoinBalances(address: string): Promise<BalanceItem[]> {
  const balances: BalanceItem[] = []

  try {
    // Use blockchain.info API for Bitcoin balance
    const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`)
    const satoshis = await response.text()
    const balanceBtc = parseInt(satoshis, 10) / Math.pow(10, 8)

    balances.push({
      chain: Chain.BTC,
      decimal: 8,
      ticker: 'BTC',
      value: balanceBtc,
      address: null
    })
  } catch (e) {
    console.error('Error fetching Bitcoin balances:', e)
  }

  return balances
}

function buildIdentifier(balance: BalanceItem): string {
  if (balance.address) {
    return `${balance.chain}.${balance.ticker}-${balance.address.toUpperCase()}`
  }

  return `${balance.chain}.${balance.ticker}`
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const addressFormat = searchParams.get('addressFormat')

  if (address == null || addressFormat == null) {
    return Response.json([])
  }

  let balances: BalanceItem[] = []

  if (addressFormat === 'ADDRESS_FORMAT_ETHEREUM') {
    balances = await fetchEthereumBalances(address)
  } else if (addressFormat === 'ADDRESS_FORMAT_SOLANA') {
    balances = await fetchSolanaBalances(address)
  } else if (addressFormat.startsWith('ADDRESS_FORMAT_BITCOIN')) {
    balances = await fetchBitcoinBalances(address)
  } else {
    return Response.json([])
  }

  // Collect all tickers for price fetching
  const tickers = balances.map(b => b.ticker)
  const prices = await fetchTokenPrices(tickers)

  // Build final response with USD prices
  const result: BalanceAsset[] = balances.map(balance => {
    const usdPrice = prices[balance.ticker.toUpperCase()]
    const usdValue = usdPrice ? balance.value * usdPrice : undefined

    return {
      chain: balance.chain,
      decimal: balance.decimal,
      ticker: balance.ticker,
      identifier: buildIdentifier(balance),
      value: balance.value.toString(),
      value_usd: usdValue?.toFixed(2) ?? '0.00',
      address: balance.address
    }
  })

  return Response.json(result)
}
