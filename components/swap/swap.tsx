'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { useTurnkey } from '@turnkey/react-wallet-kit'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SwapApproval, SwapConfirm, SwapForm, SwapProgress, SwapSuccess } from '@/components/swap'
import { fetchBalances, fetchQuote, QuoteRoute } from '@/lib/api'
import { createApprovalTransaction } from '@/lib/erc20'
import { signPsbtWithExternalSigner } from '@/lib/bitcoin'
import { chainAddressFormats, rpcUrls } from '@/lib/chains'
import { useQuote } from '@/hooks/use-quote'
import { useSimulation } from '@/hooks/use-simulation'
import { useTokens } from '@/hooks/use-tokens'

type SwapStep = 'form' | 'confirm' | 'approve' | 'approving' | 'swapping' | 'success'
type SwapProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  sellAsset?: string
}

export function Swap({ isOpen, onOpenChange, sellAsset }: SwapProps) {
  const { wallets, signAndSendTransaction, httpClient } = useTurnkey()
  const { tokens } = useTokens()

  const [fromToken, setFromToken] = useState<string>('')
  const [toToken, setToToken] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState('1')
  const [balance, setBalance] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [swapStep, setSwapStep] = useState<SwapStep>('form')
  const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null)
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null)
  const [confirmQuote, setConfirmQuote] = useState<QuoteRoute | null>(null)
  const [isConfirmQuoteLoading, setIsConfirmQuoteLoading] = useState(false)
  const [confirmQuoteError, setConfirmQuoteError] = useState<string | null>(null)
  const [manualDestinationAddress, setManualDestinationAddress] = useState('')

  // Helper to find token case-insensitively
  const findToken = useCallback(
    (identifier: string) => tokens.find(t => t.identifier.toUpperCase() === identifier.toUpperCase()),
    [tokens]
  )

  const fromTokenMeta = useMemo(() => findToken(fromToken), [fromToken, findToken])
  const toTokenMeta = useMemo(() => findToken(toToken), [toToken, findToken])

  // Set fromToken from sellAsset prop when tokens are loaded
  useEffect(() => {
    if (!sellAsset || tokens.length === 0) return
    const matched = findToken(sellAsset)
    if (matched) {
      setFromToken(matched.identifier)
    }
  }, [sellAsset, tokens, findToken])

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

  const sourceAddress = fromTokenMeta ? resolveAddressForChain(fromTokenMeta.chain) : null
  const resolvedDestinationAddress = toTokenMeta ? resolveAddressForChain(toTokenMeta.chain) : null
  const destinationAddress = resolvedDestinationAddress || manualDestinationAddress || null

  const {
    quote: previewQuote,
    isLoading: isPreviewQuoteLoading,
    error: previewQuoteError
  } = useQuote({
    sellAsset: fromTokenMeta?.identifier,
    buyAsset: toTokenMeta?.identifier,
    sellAmount: amount,
    slippage: Number(slippage),
    sourceAddress: sourceAddress || undefined,
    destinationAddress: destinationAddress || undefined,
    refundAddress: sourceAddress || undefined,
    providers: ['THORCHAIN', 'MAYACHAIN', 'ONEINCH', 'NEAR'],
    dry: true
  })

  const {
    needsApproval,
    approveData,
    isLoading: isSimulating,
    refetch: refetchSimulation
  } = useSimulation({
    quote: previewQuote,
    fromToken: fromTokenMeta,
    amount,
    sourceAddress
  })

  // Set default tokens when tokens load (only if not already set)
  useEffect(() => {
    if (tokens.length === 0) return

    if (!fromToken && !sellAsset) {
      setFromToken(tokens[0].identifier)
    }

    if (!toToken) {
      const currentFrom = fromToken || tokens[0].identifier
      const differentToken = tokens.find(t => t.identifier !== currentFrom)
      setToToken(differentToken?.identifier || tokens[1]?.identifier || '')
    }
  }, [tokens, fromToken, toToken, sellAsset])

  // Fetch balance
  useEffect(() => {
    if (!fromTokenMeta) return
    const address = resolveAddressForChain(fromTokenMeta.chain)
    if (!address) return
    const addressFormat = chainAddressFormats[fromTokenMeta.chain]
    if (!addressFormat) return

    fetchBalances(address, addressFormat)
      .then(data => {
        const tokenBalance = data.find(b => b.ticker === fromTokenMeta.ticker)
        setBalance(tokenBalance?.value ?? '0')
      })
      .catch(() => setBalance(null))
  }, [fromTokenMeta, resolveAddressForChain])

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSwapStep('form')
      setConfirmQuote(null)
      setConfirmQuoteError(null)
      setApprovalTxHash(null)
      setSwapTxHash(null)
      setStatus(null)
    }
  }, [isOpen])

  useEffect(() => {
    setConfirmQuoteError(null)
  }, [fromToken, toToken, amount])

  const fetchConfirmQuote = async () => {
    if (!fromTokenMeta || !toTokenMeta || !destinationAddress || !previewQuote) return

    setIsConfirmQuoteLoading(true)
    setConfirmQuoteError(null)

    try {
      const response = await fetchQuote({
        sellAsset: fromTokenMeta.identifier,
        buyAsset: toTokenMeta.identifier,
        sellAmount: amount,
        destinationAddress,
        sourceAddress: sourceAddress || undefined,
        refundAddress: sourceAddress || undefined,
        slippage: Number(slippage),
        providers: [previewQuote.providers[0]],
        dry: false
      })

      if (!response.routes.length && response.providerErrors?.length) {
        const errorMsg = response.providerErrors[0].error
        throw new Error(typeof errorMsg === 'string' ? errorMsg : 'Quote error')
      }

      const best = response.routes?.reduce<QuoteRoute | null>(
        (acc, r) => (!acc || Number(r.expectedBuyAmount) > Number(acc.expectedBuyAmount) ? r : acc),
        null
      )

      if (!best) throw new Error('No valid routes found')

      setConfirmQuote(best)
      setSwapStep('confirm')
    } catch (err) {
      setConfirmQuoteError(err instanceof Error ? err.message : 'Failed to fetch confirmation quote')
    } finally {
      setIsConfirmQuoteLoading(false)
    }
  }

  const handleFormSubmit = async () => {
    if (needsApproval && fromTokenMeta?.address) {
      await handleFormApprove()
    } else {
      await fetchConfirmQuote()
    }
  }

  const sendApproval = async () => {
    if (!fromTokenMeta?.address || !approveData) return null

    const walletAccount = resolveAccountForChain(fromTokenMeta.chain)
    const rpcUrl = rpcUrls[fromTokenMeta.chain]
    const address = resolveAddressForChain(fromTokenMeta.chain)

    if (!walletAccount || !rpcUrl || !address) {
      setStatus('Wallet or RPC not configured')
      return null
    }

    setSwapStep('approving')
    setStatus(null)

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const nonce = await provider.getTransactionCount(address, 'latest')
    const feeData = await provider.getFeeData()

    const { unsignedTransaction } = createApprovalTransaction(
      fromTokenMeta.address,
      approveData.spender,
      amount,
      fromTokenMeta.decimals,
      address,
      Number(fromTokenMeta.chainId),
      nonce,
      feeData
    )

    const hash = await signAndSendTransaction({
      unsignedTransaction,
      transactionType: 'TRANSACTION_TYPE_ETHEREUM',
      walletAccount,
      rpcUrl
    })

    setApprovalTxHash(hash)
    await provider.waitForTransaction(hash)
    return hash
  }

  const handleFormApprove = async () => {
    try {
      const hash = await sendApproval()
      if (hash) {
        refetchSimulation()
        setSwapStep('form')
      }
    } catch (error) {
      setStatus(`Approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSwapStep('form')
    }
  }

  const handleConfirmSwap = async () => {
    if (!fromTokenMeta || !toTokenMeta || !confirmQuote) return

    if (needsApproval && fromTokenMeta.address) {
      setSwapStep('approve')
      return
    }

    await executeSwap()
  }

  const handleApprovalSubmit = async () => {
    try {
      const hash = await sendApproval()
      if (hash) await executeSwap()
    } catch (error) {
      setStatus(`Approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSwapStep('approve')
    }
  }

  const executeSwap = async () => {
    if (!fromTokenMeta || !toTokenMeta || !confirmQuote) return

    if (fromTokenMeta.chain === 'BTC') {
      const walletAccount = resolveAccountForChain('BTC')
      if (!walletAccount) return setStatus('BTC wallet not configured')
      if (!httpClient) return setStatus('Turnkey client not initialized')
      if (typeof confirmQuote.tx !== 'string') return setStatus('Swap route missing transaction data')

      setSwapStep('swapping')
      setStatus('Submitting swap...')

      try {
        const signFn = async (sighashHex: string) => {
          const result = await httpClient.signRawPayload({
            signWith: walletAccount.address,
            payload: sighashHex,
            encoding: 'PAYLOAD_ENCODING_HEXADECIMAL' as any,
            hashFunction: 'HASH_FUNCTION_NO_OP' as any
          })
          return { r: result.r, s: result.s, v: result.v }
        }

        const signedTxHex = await signPsbtWithExternalSigner(confirmQuote.tx, signFn)

        const broadcastRes = await fetch('https://mempool.space/api/tx', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: signedTxHex
        })

        if (!broadcastRes.ok) {
          const errText = await broadcastRes.text()
          throw new Error(`Broadcast failed: ${errText}`)
        }

        const txid = await broadcastRes.text()
        setSwapTxHash(txid)
        setSwapStep('success')
        setTimeout(() => onOpenChange(false), 3000)
      } catch (error) {
        setStatus(`Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setSwapStep('confirm')
      }
    } else if (fromTokenMeta.chain === 'SOL') {
      const walletAccount = resolveAccountForChain('SOL')
      if (!walletAccount) return setStatus('SOL wallet not configured')
      if (typeof confirmQuote.tx !== 'string') return setStatus('Swap route missing transaction data')

      setSwapStep('swapping')
      setStatus('Submitting swap...')

      try {
        const txBytes = Uint8Array.from(atob(confirmQuote.tx), c => c.charCodeAt(0))
        const unsignedTransaction = Array.from(txBytes, b => b.toString(16).padStart(2, '0')).join('')

        const hash = await signAndSendTransaction({
          unsignedTransaction,
          transactionType: 'TRANSACTION_TYPE_SOLANA',
          walletAccount,
          rpcUrl: 'https://solana-rpc.publicnode.com'
        })

        setSwapTxHash(hash)
        setSwapStep('success')
        setTimeout(() => onOpenChange(false), 3000)
      } catch (error) {
        setStatus(`Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setSwapStep('confirm')
      }
    } else if (typeof confirmQuote.tx === 'object' && confirmQuote.tx) {
      // EVM chains
      const walletAccount = resolveAccountForChain(fromTokenMeta.chain)
      const rpcUrl = rpcUrls[fromTokenMeta.chain]
      if (!walletAccount || !rpcUrl) {
        return setStatus('Wallet or RPC not configured')
      }

      setSwapStep('swapping')
      setStatus('Submitting swap...')

      try {
        const { to, value, data, gasPrice } = confirmQuote.tx
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const address = resolveAddressForChain(fromTokenMeta.chain)
        if (!address) throw new Error('Source address not found')

        const nonce = await provider.getTransactionCount(address, 'latest')
        const feeData = await provider.getFeeData()

        const txParams: any = {
          to,
          value: value || 0,
          data: data || '0x',
          chainId: Number(fromTokenMeta.chainId),
          nonce,
          gasLimit: 300000
        }

        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
          txParams.maxFeePerGas = feeData.maxFeePerGas
          txParams.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
          txParams.type = 2
        } else {
          txParams.gasPrice = gasPrice || feeData.gasPrice
          txParams.type = 0
        }

        const unsignedTransaction = ethers.Transaction.from(txParams).unsignedSerialized

        const hash = await signAndSendTransaction({
          unsignedTransaction,
          transactionType: 'TRANSACTION_TYPE_ETHEREUM',
          walletAccount,
          rpcUrl
        })

        setSwapTxHash(hash)
        await provider.waitForTransaction(hash)
        setSwapStep('success')
        setTimeout(() => onOpenChange(false), 3000)
      } catch (error) {
        setStatus(`Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setSwapStep('confirm')
      }
    } else {
      setStatus(`Swapping from ${fromTokenMeta.chain} is not supported yet`)
    }
  }

  const displayError = previewQuoteError?.message || confirmQuoteError

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto p-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Tokens</DialogTitle>
        </DialogHeader>

        {swapStep === 'form' && (
          <SwapForm
            amount={amount}
            slippage={slippage}
            balance={balance}
            fromTokenMeta={fromTokenMeta}
            toTokenMeta={toTokenMeta}
            previewQuote={previewQuote}
            isLoading={isPreviewQuoteLoading || isConfirmQuoteLoading || isSimulating}
            needsApproval={needsApproval}
            error={displayError}
            onFromTokenChange={token => setFromToken(token.identifier)}
            onToTokenChange={token => setToToken(token.identifier)}
            onAmountChange={setAmount}
            onSlippageChange={setSlippage}
            destinationAddress={manualDestinationAddress}
            resolvedDestinationAddress={resolvedDestinationAddress}
            onDestinationAddressChange={setManualDestinationAddress}
            onSubmit={handleFormSubmit}
          />
        )}

        {swapStep === 'confirm' && confirmQuote && (
          <SwapConfirm
            amount={amount}
            fromTokenMeta={fromTokenMeta}
            toTokenMeta={toTokenMeta}
            confirmQuote={confirmQuote}
            needsApproval={needsApproval}
            status={status}
            onBack={() => {
              setSwapStep('form')
              setConfirmQuote(null)
            }}
            onConfirm={handleConfirmSwap}
          />
        )}

        {swapStep === 'approve' && (
          <SwapApproval
            amount={amount}
            fromTokenMeta={fromTokenMeta}
            approveData={approveData}
            status={status}
            onBack={() => setSwapStep('confirm')}
            onApprove={handleApprovalSubmit}
          />
        )}
        {swapStep === 'approving' && <SwapProgress type="approving" />}
        {swapStep === 'swapping' && <SwapProgress type="swapping" approvalConfirmed={!!approvalTxHash} />}
        {swapStep === 'success' && (
          <SwapSuccess
            amount={amount}
            fromTokenMeta={fromTokenMeta}
            toTokenMeta={toTokenMeta}
            confirmQuote={confirmQuote}
            swapTxHash={swapTxHash}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
