import { NextRequest } from 'next/server'
import { BlockchainType, Token, TokenBalance, TokenTypeEip20, TokenTypeNative } from '@/app/api/types'
import { Alchemy, Network } from 'alchemy-sdk'

async function fetchTokenPrices(contractAddresses: string[]): Promise<Record<string, number>> {
  if (contractAddresses.length === 0) return {}

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddresses.join(',')}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      console.error('Failed to fetch prices from CoinGecko')
      return {}
    }

    const data = await response.json()
    const prices: Record<string, number> = {}

    for (const address of contractAddresses) {
      const lowerAddress = address.toLowerCase()
      if (data[lowerAddress]?.usd) {
        prices[lowerAddress] = data[lowerAddress].usd
      }
    }

    return prices
  } catch (error) {
    console.error('Error fetching token prices:', error)
    return {}
  }
}

async function fetchEthPrice(): Promise<number | undefined> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
      next: { revalidate: 60 }
    })

    if (!response.ok) return undefined

    const data = await response.json()
    return data.ethereum?.usd
  } catch {
    return undefined
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
    // Fetch native ETH balance
    const balanceWei = await alchemy.core.getBalance(address)
    const balanceEth = Number(balanceWei) / Math.pow(10, 18)
    const ethToken = new Token('ETH', 'Ethereum', 18, BlockchainType.Ethereum, new TokenTypeNative())

    balances.push({
      balance: balanceEth,
      token: ethToken
    })

    // Fetch all ERC-20 token balances
    const tokensResponse = await alchemy.core.getTokensForOwner(address)

    for (const ownedToken of tokensResponse.tokens) {
      if (!ownedToken.contractAddress || !ownedToken.balance) continue

      const balance = parseFloat(ownedToken.balance)
      if (balance === 0) continue

      const token = new Token(
        ownedToken.symbol || 'UNKNOWN',
        ownedToken.name || 'Unknown Token',
        ownedToken.decimals ?? 18,
        BlockchainType.Ethereum,
        new TokenTypeEip20(ownedToken.contractAddress)
      )

      balances.push({
        balance,
        token
      })
    }
  } catch (e) {
    console.error(e)
  }

  // Fetch prices for ERC-20 tokens
  const contractAddresses = balances
    .filter(b => b.token.tokenType instanceof TokenTypeEip20)
    .map(b => (b.token.tokenType as TokenTypeEip20).contractAddress)

  const [tokenPrices, ethPrice] = await Promise.all([fetchTokenPrices(contractAddresses), fetchEthPrice()])

  // Add USD price and value to each balance
  const balancesWithPrices = balances.map(balance => {
    let usdPrice: number | undefined
    if (balance.token.tokenType instanceof TokenTypeNative) {
      usdPrice = ethPrice
    } else if (balance.token.tokenType instanceof TokenTypeEip20) {
      usdPrice = tokenPrices[balance.token.tokenType.contractAddress.toLowerCase()]
    }

    return {
      ...balance,
      usdPrice,
      usdValue: usdPrice ? balance.balance * usdPrice : undefined
    }
  })

  return Response.json(balancesWithPrices)
}
