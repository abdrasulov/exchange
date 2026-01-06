'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { useTurnkey } from '@turnkey/react-wallet-kit'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

type Token = {
  identifier: string
  address: string | null
  chain: string
  chainId: string
  decimals: number
  ticker: string
  name: string
}

type QuoteRoute = {
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

type QuoteResponse = {
  routes: QuoteRoute[]
  providerErrors: Array<{ provider: string; error: string }>
}

const chainAddressFormats: Record<string, string> = {
  ETH: 'ADDRESS_FORMAT_ETHEREUM',
  BSC: 'ADDRESS_FORMAT_ETHEREUM',
  AVAX: 'ADDRESS_FORMAT_ETHEREUM',
  BASE: 'ADDRESS_FORMAT_ETHEREUM',
  ARB: 'ADDRESS_FORMAT_ETHEREUM'
}

const rpcUrls: Record<string, string> = {
  ETH: 'https://ethereum-rpc.publicnode.com',
  BSC: 'https://bsc-rpc.publicnode.com',
  AVAX: 'https://avalanche-c-chain-rpc.publicnode.com'
}

export function SwapModal({
  open,
  onOpenChange,
  sellAsset
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sellAsset?: string
}) {
  const router = useRouter()
  const { wallets, signAndSendTransaction } = useTurnkey()

  const [tokens, setTokens] = useState<Token[]>([])
  const [fromToken, setFromToken] = useState<string>(sellAsset || '')
  const [toToken, setToToken] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState('1')

  const [balance, setBalance] = useState<string | null>(null)
  const [estimatedReceive, setEstimatedReceive] = useState<string | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [isFetchingQuote, setIsFetchingQuote] = useState(false)
  const [bestRoute, setBestRoute] = useState<QuoteRoute | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const fromTokenMeta = useMemo(() => tokens.find(t => t.identifier === fromToken), [fromToken, tokens])
  const toTokenMeta = useMemo(() => tokens.find(t => t.identifier === toToken), [toToken, tokens])

  const resolveAccountForChain = useCallback(
    (chain: string) => {
      if (!wallets?.length) return null
      const format = chainAddressFormats[chain]
      if (!format) return null
      for (const wallet of wallets) {
        const account = wallet.accounts.find((acct: { addressFormat: string }) => acct.addressFormat === format)
        if (account) return account
      }
      return null
    },
    [wallets]
  )

  const resolveAddressForChain = useCallback(
    (chain: string) => resolveAccountForChain(chain)?.address ?? null,
    [resolveAccountForChain]
  )

  // Fetch tokens
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/tokens?provider=THORCHAIN`, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
      }
    })
      .then(res => res.json())
      .then((data: { tokens: Token[] }) => {
        setTokens(data.tokens || [])
        if (data.tokens?.length > 0) {
          if (!fromToken || !data.tokens.find(t => t.identifier === fromToken)) {
            setFromToken(data.tokens[0].identifier)
          }
          if (!toToken) {
            const differentToken = data.tokens.find(t => t.identifier !== (fromToken || data.tokens[0].identifier))
            setToToken(differentToken?.identifier || data.tokens[1]?.identifier || '')
          }
        }
      })
      .catch(console.error)
  }, [fromToken, toToken])

  // Fetch balance
  useEffect(() => {
    if (!fromTokenMeta) return
    const address = resolveAddressForChain(fromTokenMeta.chain)
    if (!address) return

    const addressFormat = chainAddressFormats[fromTokenMeta.chain]
    if (!addressFormat) return

    fetch(`/api/balances?${new URLSearchParams({ address, addressFormat })}`)
      .then(res => res.json())
      .then(data => {
        const tokenBalance = Array.isArray(data)
          ? data.find((b: { token: { code: string } }) => b.token.code === fromTokenMeta.ticker)
          : null
        setBalance(tokenBalance?.balance ? tokenBalance.balance.toFixed(6) : '0')
      })
      .catch(() => setBalance(null))
  }, [fromTokenMeta, resolveAddressForChain])

  // Fetch quote
  useEffect(() => {
    if (!amount || !fromTokenMeta || !toTokenMeta) {
      setEstimatedReceive(null)
      setBestRoute(null)
      return
    }

    const destinationAddress = resolveAddressForChain(toTokenMeta.chain)
    if (!destinationAddress) return

    const controller = new AbortController()
    setIsFetchingQuote(true)
    setQuoteError(null)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/quote`, {
      method: 'POST',
      headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' },
      body: JSON.stringify({
        sellAsset: fromTokenMeta.identifier,
        buyAsset: toTokenMeta.identifier,
        sellAmount: amount,
        destinationAddress,
        sourceAddress: resolveAddressForChain(fromTokenMeta.chain) || undefined,
        slippage: Number(slippage),
        providers: ['THORCHAIN'],
        dry: false
      }),
      signal: controller.signal
    })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Quote request failed: ${res.status}`)
        }
        return res.json() as Promise<QuoteResponse>
      })
      .then(data => {
        if (data.providerErrors?.length) {
          const errorMsg = data.providerErrors[0].error
          setQuoteError(typeof errorMsg === 'string' ? errorMsg : 'Quote error')
          setEstimatedReceive(null)
          setBestRoute(null)
          return
        }
        const best = data.routes?.reduce<QuoteRoute | null>(
          (acc, r) => (!acc || Number(r.expectedBuyAmount) > Number(acc.expectedBuyAmount) ? r : acc),
          null
        )
        setEstimatedReceive(best?.expectedBuyAmount || null)
        setBestRoute(best || null)
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          const errorMsg = err instanceof Error ? err.message : 'Failed to fetch quote'
          setQuoteError(errorMsg)
          setEstimatedReceive(null)
          setBestRoute(null)
        }
      })
      .finally(() => setIsFetchingQuote(false))

    return () => controller.abort()
  }, [amount, fromTokenMeta, toTokenMeta, slippage, resolveAddressForChain])

  const handleSwap = async () => {
    if (!fromTokenMeta || !toTokenMeta || !bestRoute) return

    if (bestRoute.tx) {
      const walletAccount = resolveAccountForChain(fromTokenMeta.chain)
      const rpcUrl = rpcUrls[fromTokenMeta.chain]
      if (!walletAccount || !rpcUrl) {
        setStatus('Wallet or RPC not configured')
        return
      }

      setIsSubmitting(true)
      setStatus('Submitting swap...')

      try {
        const { to, value, data, gasPrice } = bestRoute.tx
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const sourceAddress = resolveAddressForChain(fromTokenMeta.chain)
        if (!sourceAddress) throw new Error('Source address not found')

        const nonce = await provider.getTransactionCount(sourceAddress, 'latest')

        // Get fee data from the network
        const feeData = await provider.getFeeData()

        // Use EIP-1559 if available, otherwise legacy
        let txParams: any = {
          to,
          value: value || 0,
          data: data || '0x',
          chainId: Number(fromTokenMeta.chainId),
          nonce,
          gasLimit: 300000
        }

        // Prefer EIP-1559 transaction type
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
          txParams.maxFeePerGas = feeData.maxFeePerGas
          txParams.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
          txParams.type = 2
        } else {
          // Fallback to legacy transaction with gasPrice
          txParams.gasPrice = gasPrice || feeData.gasPrice
          txParams.type = 0
        }

        const unsignedTransaction = ethers.Transaction.from(txParams).unsignedSerialized

        await signAndSendTransaction({
          unsignedTransaction,
          transactionType: 'TRANSACTION_TYPE_ETHEREUM',
          walletAccount,
          rpcUrl
        })
        setStatus('Transaction submitted!')
        setTimeout(() => onOpenChange(false), 2000)
      } catch (error) {
        setStatus(`Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setStatus(
        `Send ${amount} ${fromTokenMeta.ticker} to ${bestRoute.targetAddress || bestRoute.inboundAddress || 'N/A'} with memo: ${bestRoute.memo || 'N/A'}`
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Tokens</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <select
              value={fromToken}
              onChange={e => setFromToken(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {tokens.map(token => (
                <option key={token.identifier} value={token.identifier}>
                  {token.ticker} - {token.name} ({token.chain})
                </option>
              ))}
            </select>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <select
              value={toToken}
              onChange={e => setToToken(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {tokens.map(token => (
                <option key={token.identifier} value={token.identifier}>
                  {token.ticker} - {token.name} ({token.chain})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Amount</label>
              {balance && (
                <span className="text-xs text-slate-500">
                  Balance: {balance} {fromTokenMeta?.ticker}
                </span>
              )}
            </div>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2"
            />
          </div>

          {/* Slippage */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Slippage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={slippage}
              onChange={e => setSlippage(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2"
            />
          </div>

          {/* Estimated Receive */}
          {estimatedReceive && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-slate-600">You will receive</p>
              <p className="text-lg font-semibold">
                {estimatedReceive} {toTokenMeta?.ticker}
              </p>
              {bestRoute?.estimatedTime && (
                <p className="text-xs text-slate-500">Est. time: ~{bestRoute.estimatedTime.total}s</p>
              )}
            </div>
          )}

          {quoteError && <p className="text-sm text-red-500">{quoteError}</p>}
          {status && <p className="text-sm text-slate-600">{status}</p>}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={isSubmitting || isFetchingQuote || !bestRoute}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Swap'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
