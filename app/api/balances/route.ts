import { NextRequest } from 'next/server'
import { BlockchainType, Token, TokenBalance, TokenTypeEip20, TokenTypeNative, TokenTypeSpl } from '@/app/api/types'
import { Alchemy, Network } from 'alchemy-sdk'

async function fetchErc20TokenPrices(contractAddresses: string[]): Promise<Record<string, number>> {
  if (contractAddresses.length === 0) return {}

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddresses.join(',')}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return {}

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
    console.error('Error fetching ERC-20 token prices:', error)
    return {}
  }
}

async function fetchNativePrices(): Promise<Record<string, number>> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,bitcoin&vs_currencies=usd',
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return {}

    const data = await response.json()
    return {
      ETH: data.ethereum?.usd,
      SOL: data.solana?.usd,
      BTC: data.bitcoin?.usd
    }
  } catch {
    return {}
  }
}

async function fetchSplTokenPrices(mints: string[]): Promise<Record<string, number>> {
  if (mints.length === 0) return {}

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mints.join(',')}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) return {}

    const data = await response.json()
    const prices: Record<string, number> = {}

    for (const mint of mints) {
      if (data[mint]?.usd) {
        prices[mint] = data[mint].usd
      }
    }

    return prices
  } catch (error) {
    console.error('Error fetching SPL token prices:', error)
    return {}
  }
}

async function fetchEthereumBalances(address: string): Promise<TokenBalance[]> {
  const balances: TokenBalance[] = []

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
    console.error('Error fetching Ethereum balances:', e)
  }

  return balances
}

async function fetchSolanaBalances(address: string): Promise<TokenBalance[]> {
  const balances: TokenBalance[] = []

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
      const solToken = new Token('SOL', 'Solana', 9, BlockchainType.Solana, new TokenTypeNative())
      balances.push({
        balance: balanceSol,
        token: solToken
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

        const token = new Token(
          info.mint?.slice(0, 6) || 'UNKNOWN',
          'SPL Token',
          tokenAmount.decimals ?? 9,
          BlockchainType.Solana,
          new TokenTypeSpl(info.mint)
        )

        balances.push({
          balance: tokenAmount.uiAmount,
          token
        })
      }
    }
  } catch (e) {
    console.error('Error fetching Solana balances:', e)
  }

  return balances
}

async function fetchBitcoinBalances(address: string): Promise<TokenBalance[]> {
  const balances: TokenBalance[] = []

  try {
    // Use blockchain.info API for Bitcoin balance
    const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`)
    const satoshis = await response.text()
    const balanceBtc = parseInt(satoshis, 10) / Math.pow(10, 8)

    const btcToken = new Token('BTC', 'Bitcoin', 8, BlockchainType.Bitcoin, new TokenTypeNative())
    balances.push({
      balance: balanceBtc,
      token: btcToken
    })
  } catch (e) {
    console.error('Error fetching Bitcoin balances:', e)
  }

  return balances
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const addressFormat = searchParams.get('addressFormat')

  if (address == null || addressFormat == null) {
    return Response.json([])
  }

  let balances: TokenBalance[] = []

  if (addressFormat === 'ADDRESS_FORMAT_ETHEREUM') {
    balances = await fetchEthereumBalances(address)
  } else if (addressFormat === 'ADDRESS_FORMAT_SOLANA') {
    balances = await fetchSolanaBalances(address)
  } else if (addressFormat.startsWith('ADDRESS_FORMAT_BITCOIN')) {
    balances = await fetchBitcoinBalances(address)
  } else {
    return Response.json([])
  }

  // Collect contract addresses for price fetching
  const erc20Addresses = balances
    .filter(b => b.token.tokenType instanceof TokenTypeEip20)
    .map(b => (b.token.tokenType as TokenTypeEip20).contractAddress)

  const splMints = balances
    .filter(b => b.token.tokenType instanceof TokenTypeSpl)
    .map(b => (b.token.tokenType as TokenTypeSpl).mint)

  // Fetch all prices in parallel
  const [nativePrices, erc20Prices, splPrices] = await Promise.all([
    fetchNativePrices(),
    fetchErc20TokenPrices(erc20Addresses),
    fetchSplTokenPrices(splMints)
  ])

  // Add USD price and value to each balance
  const balancesWithPrices = balances.map(balance => {
    let usdPrice: number | undefined

    if (balance.token.tokenType instanceof TokenTypeNative) {
      usdPrice = nativePrices[balance.token.code]
    } else if (balance.token.tokenType instanceof TokenTypeEip20) {
      usdPrice = erc20Prices[balance.token.tokenType.contractAddress.toLowerCase()]
    } else if (balance.token.tokenType instanceof TokenTypeSpl) {
      usdPrice = splPrices[balance.token.tokenType.mint]
    }

    return {
      ...balance,
      usdPrice,
      usdValue: usdPrice ? balance.balance * usdPrice : undefined
    }
  })

  return Response.json(balancesWithPrices)
}
