import { NextRequest } from 'next/server'
import { Token, TokenBalance, TokenTypeEip20 } from '@/app/api/types'
import { Alchemy, Network } from 'alchemy-sdk'
import { getNativeToken, getSupportedTokens } from '@/app/api/tokens'

const coinGeckoIds: Record<string, string> = {
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin'
}

async function fetchTokenPrices(tokenCodes: string[]): Promise<Record<string, number>> {
  try {
    const geckoIds = tokenCodes.map(code => coinGeckoIds[code]).filter(Boolean)
    if (geckoIds.length === 0) return {}

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds.join(',')}&vs_currencies=usd`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    )

    if (!response.ok) {
      console.error('Failed to fetch prices from CoinGecko')
      return {}
    }

    const data = await response.json()
    const prices: Record<string, number> = {}

    for (const code in coinGeckoIds) {
      const geckoId = coinGeckoIds[code]
      if (data[geckoId]?.usd) {
        prices[code] = data[geckoId].usd
      }
    }

    return prices
  } catch (error) {
    console.error('Error fetching token prices:', error)
    return {}
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const addressFormat = searchParams.get('addressFormat')

  if (address == null || addressFormat == null) {
    return Response.json([])
  }

  let network
  if (addressFormat == 'ADDRESS_FORMAT_ETHEREUM') {
    network = Network.ETH_MAINNET
  }

  if (network === undefined) {
    return Response.json([])
  }

  const alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: network,
    connectionInfoOverrides: {
      skipFetchSetup: true
    }
  })

  const balances: TokenBalance[] = []

  try {
    const nativeToken = getNativeToken(addressFormat)
    if (nativeToken) {
      // ETH balance
      const balanceWei = await alchemy.core.getBalance(address)
      const balanceEth = Number(balanceWei) / Math.pow(10, Number(nativeToken.decimals))
      balances.push({
        balance: balanceEth,
        token: nativeToken
      })
    }

    const tokens = getSupportedTokens(addressFormat)
    if (tokens.length > 0) {
      const contractAddresses = tokens.map((token: Token) => {
        return (token.tokenType as TokenTypeEip20).contractAddress
      })
      // ERC-20 token balances
      const { tokenBalances } = await alchemy.core.getTokenBalances(address, contractAddresses)

      for (const token of tokens) {
        const tokenBalance = tokenBalances.find(balance => {
          return balance.contractAddress == (token.tokenType as TokenTypeEip20).contractAddress
        })

        const balanceString = tokenBalance?.tokenBalance ?? '0'
        const balance = Number(balanceString) / Math.pow(10, Number(token.decimals))

        balances.push({
          balance: balance,
          token: token
        })
      }
    }
  } catch (e) {
    console.error(e)
  }

  // Fetch prices for all tokens
  const tokenCodes = balances.map(b => b.token.code)
  const prices = await fetchTokenPrices(tokenCodes)

  // Add USD price and value to each balance
  const balancesWithPrices = balances.map(balance => ({
    ...balance,
    usdPrice: prices[balance.token.code],
    usdValue: prices[balance.token.code] ? balance.balance * prices[balance.token.code] : undefined
  }))

  return Response.json(balancesWithPrices)
}
