'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { useTurnkey } from '@turnkey/react-wallet-kit'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { fetchBalances, fetchQuote, QuoteRoute } from '@/lib/api'
import { createApprovalTransaction } from '@/lib/erc20'
import { chainAddressFormats, rpcUrls } from '@/lib/chains'
import { useQuote } from '@/hooks/use-quote'
import { useSimulation } from '@/hooks/use-simulation'
import { useTokens } from '@/hooks/use-tokens'
import { SwapApproval, SwapConfirm, SwapForm, SwapProgress, SwapSuccess } from '@/components/swap'

type SwapStep = 'form' | 'confirm' | 'approve' | 'approving' | 'swapping' | 'success'

export function SwapModal({
  open,
  onOpenChange,
  sellAsset
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sellAsset?: string
}) {
  const { wallets, signAndSendTransaction } = useTurnkey()
  const { tokens } = useTokens()

  const [fromToken, setFromToken] = useState<string>(sellAsset || '')
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

  const sourceAddress = fromTokenMeta ? resolveAddressForChain(fromTokenMeta.chain) : null
  const destinationAddress = toTokenMeta ? resolveAddressForChain(toTokenMeta.chain) : null

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
    providers: ['THORCHAIN'],
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

  // Set default tokens when tokens load
  useEffect(() => {
    if (tokens.length === 0) return
    if (!fromToken || !tokens.find(t => t.identifier === fromToken)) {
      setFromToken(tokens[0].identifier)
    }
    if (!toToken) {
      const differentToken = tokens.find(t => t.identifier !== (fromToken || tokens[0].identifier))
      setToToken(differentToken?.identifier || tokens[1]?.identifier || '')
    }
  }, [tokens, fromToken, toToken])

  // Fetch balance
  useEffect(() => {
    if (!fromTokenMeta) return
    const address = resolveAddressForChain(fromTokenMeta.chain)
    if (!address) return
    const addressFormat = chainAddressFormats[fromTokenMeta.chain]
    if (!addressFormat) return

    fetchBalances(address, addressFormat)
      .then(data => {
        const tokenBalance = data.find(b => b.token.code === fromTokenMeta.ticker)
        setBalance(tokenBalance?.balance ? tokenBalance.balance.toFixed(6) : '0')
      })
      .catch(() => setBalance(null))
  }, [fromTokenMeta, resolveAddressForChain])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSwapStep('form')
      setConfirmQuote(null)
      setConfirmQuoteError(null)
      setApprovalTxHash(null)
      setSwapTxHash(null)
      setStatus(null)
    }
  }, [open])

  const fetchConfirmQuote = async () => {
    if (!fromTokenMeta || !toTokenMeta || !destinationAddress) return

    setIsConfirmQuoteLoading(true)
    setConfirmQuoteError(null)

    try {
      const response = await fetchQuote({
        sellAsset: fromTokenMeta.identifier,
        buyAsset: toTokenMeta.identifier,
        sellAmount: amount,
        destinationAddress,
        sourceAddress: sourceAddress || undefined,
        slippage: Number(slippage),
        providers: ['THORCHAIN'],
        dry: false
      })

      if (response.providerErrors?.length) {
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

  const handleFormApprove = async () => {
    if (!fromTokenMeta?.address || !approveData) return

    const walletAccount = resolveAccountForChain(fromTokenMeta.chain)
    const rpcUrl = rpcUrls[fromTokenMeta.chain]
    const address = resolveAddressForChain(fromTokenMeta.chain)

    if (!walletAccount || !rpcUrl || !address) {
      setStatus('Wallet or RPC not configured')
      return
    }

    setSwapStep('approving')
    setStatus(null)

    try {
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
      refetchSimulation()
      setSwapStep('form')
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
    if (!fromTokenMeta?.address || !approveData) return

    const walletAccount = resolveAccountForChain(fromTokenMeta.chain)
    const rpcUrl = rpcUrls[fromTokenMeta.chain]
    const address = resolveAddressForChain(fromTokenMeta.chain)

    if (!walletAccount || !rpcUrl || !address) {
      setStatus('Wallet or RPC not configured')
      return
    }

    setSwapStep('approving')
    setStatus(null)

    try {
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
      await executeSwap()
    } catch (error) {
      setStatus(`Approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSwapStep('approve')
    }
  }

  const executeSwap = async () => {
    if (!fromTokenMeta || !toTokenMeta || !confirmQuote) return

    if (confirmQuote.tx) {
      const walletAccount = resolveAccountForChain(fromTokenMeta.chain)
      const rpcUrl = rpcUrls[fromTokenMeta.chain]
      if (!walletAccount || !rpcUrl) {
        setStatus('Wallet or RPC not configured')
        return
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
      setStatus(
        `Send ${amount} ${fromTokenMeta.ticker} to ${confirmQuote.targetAddress || confirmQuote.inboundAddress || 'N/A'} with memo: ${confirmQuote.memo || 'N/A'}`
      )
    }
  }

  const displayError = previewQuoteError?.message || confirmQuoteError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Tokens</DialogTitle>
        </DialogHeader>

        {swapStep === 'form' && (
          <SwapForm
            tokens={tokens}
            fromToken={fromToken}
            toToken={toToken}
            amount={amount}
            slippage={slippage}
            balance={balance}
            fromTokenMeta={fromTokenMeta}
            toTokenMeta={toTokenMeta}
            previewQuote={previewQuote}
            isLoading={isPreviewQuoteLoading || isConfirmQuoteLoading || isSimulating}
            needsApproval={needsApproval}
            error={displayError}
            onFromTokenChange={setFromToken}
            onToTokenChange={setToToken}
            onAmountChange={setAmount}
            onSlippageChange={setSlippage}
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
