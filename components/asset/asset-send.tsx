'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { WalletAccount } from '@turnkey/core'
import { useTurnkey } from '@turnkey/react-wallet-kit'
import { CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import { Credenza, CredenzaContent, CredenzaHeader, CredenzaTitle } from '@/components/ui/credenza'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BalanceAsset, Chain } from '@/app/api/types'

const CHAIN_IDS: Record<Chain, number> = {
  [Chain.ETH]: 1,
  [Chain.BSC]: 56,
  [Chain.SOL]: 0,
  [Chain.BTC]: 0
}

export function AssetSend({
  isOpen,
  onOpenChange,
  address,
  asset,
  walletAccount
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  address: string
  asset: BalanceAsset | null
  walletAccount: WalletAccount
}) {
  if (!asset) return null

  type Step = 'form' | 'confirm' | 'success'

  const [step, setStep] = useState<Step>('form')
  const [txHash, setTxHash] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [recipientError, setRecipientError] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { signAndSendTransaction } = useTurnkey()

  useEffect(() => {
    if (!isOpen) {
      setStep('form')
      setRecipient('')
      setAmount('')
      setRecipientError(null)
      setAmountError(null)
      setError(null)
      setTxHash('')
    }
  }, [isOpen])

  const getRpcUrl = (chainId: number): string => {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return 'https://ethereum-rpc.publicnode.com'
      case 56: // BSC Mainnet
        return 'https://bsc-rpc.publicnode.com'
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`)
    }
  }

  const isFormValid = !recipientError && !amountError && recipient.length > 0 && amount.length > 0

  const handleReview = () => {
    if (!isFormValid) return
    setStep('confirm')
  }

  const isNativeToken = asset.address === null
  const chainId = CHAIN_IDS[asset.chain]

  const onEnterRecipient = (value: string) => {
    setRecipient(value)

    if (!value) {
      setRecipientError('Recipient address is required')
      return
    }

    if (!ethers.isAddress(value)) {
      setRecipientError('Invalid wallet address')
      return
    }

    setRecipientError(null)
  }

  const validateAmount = (value: string) => {
    if (!value) {
      return 'Amount is required'
    }

    const numeric = Number(value)

    if (isNaN(numeric) || numeric <= 0) {
      return 'Amount must be greater than 0'
    }

    // Decimal precision check
    const decimals = asset.decimal
    const decimalPart = value.split('.')[1]

    if (decimalPart && decimalPart.length > decimals) {
      return `Max ${decimals} decimal places allowed`
    }

    // Balance check (BigInt safe)
    try {
      const valueWei = ethers.parseUnits(value, decimals)
      const balanceWei = ethers.parseUnits(asset.value, decimals)

      if (valueWei > balanceWei) {
        return 'Insufficient balance'
      }
    } catch {
      return 'Invalid amount'
    }

    return null
  }

  const onEnterAmount = (value: string) => {
    setAmount(value)
    setAmountError(validateAmount(value))
  }

  const handleConfirmSend = async () => {
    try {
      if (!chainId) return

      setLoading(true)
      setError(null)

      const rpcUrl = getRpcUrl(chainId)

      // Fetch the current nonce for the address
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const nonce = await provider.getTransactionCount(address, 'latest')

      // Get current fee data
      const feeData = await provider.getFeeData()

      let unsignedTransaction: string

      if (isNativeToken) {
        const amountWei = ethers.parseUnits(amount, asset.decimal)
        const tx = {
          to: recipient,
          value: amountWei,
          chainId: chainId,
          gasLimit: 21000,
          nonce: nonce,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          type: 2 // EIP-1559 transaction
        }
        unsignedTransaction = ethers.Transaction.from(tx).unsignedSerialized
      } else {
        const contractAddress = asset.address!
        const erc20Interface = new ethers.Interface(['function transfer(address to, uint256 amount) returns (bool)'])

        const amountWei = ethers.parseUnits(amount, asset.decimal)
        const data = erc20Interface.encodeFunctionData('transfer', [recipient, amountWei])

        const tx = {
          to: contractAddress,
          data: data,
          value: 0,
          chainId: chainId,
          gasLimit: 100000,
          nonce: nonce,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          type: 2 // EIP-1559 transaction
        }
        unsignedTransaction = ethers.Transaction.from(tx).unsignedSerialized
      }

      // Sign and send transaction, get the transaction hash
      const hash = await signAndSendTransaction({
        unsignedTransaction,
        transactionType: 'TRANSACTION_TYPE_ETHEREUM',
        walletAccount: walletAccount,
        rpcUrl
      })

      setTxHash(hash)

      // Wait for transaction to be mined
      await provider.waitForTransaction(hash)

      // Show success screen
      setStep('success')
    } catch (err) {
      console.error('Send transaction error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Credenza open={isOpen} onOpenChange={loading ? () => {} : onOpenChange}>
      <CredenzaContent className="sm:max-w-md">
        <CredenzaHeader>
          <CredenzaTitle>Send {asset.ticker}</CredenzaTitle>
        </CredenzaHeader>

        {step === 'form' && (
          <div className="space-y-5">
            {/* Network */}
            <div>
              <p className="text-muted-foreground text-xs">Network</p>
              <p className="font-medium">{asset.chain}</p>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                placeholder="Wallet address"
                value={recipient}
                onChange={e => onEnterRecipient(e.target.value)}
                className={recipientError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />

              {recipientError && <p className="text-sm text-red-500">{recipientError}</p>}
            </div>
            {/* Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Amount</Label>
                <span className="text-muted-foreground text-xs">
                  Balance: {asset.value} {asset.ticker}
                </span>
              </div>

              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                placeholder="0.0"
                value={amount}
                onChange={e => onEnterAmount(e.target.value)}
                className={amountError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />

              {amountError && <p className="text-sm text-red-500">{amountError}</p>}
            </div>

            {/* Action */}
            <Button className="w-full" onClick={handleReview} disabled={!isFormValid}>
              Next
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-5">
            <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              <div>
                <p className="text-muted-foreground text-xs">Asset</p>
                <p className="font-medium">
                  {amount} {asset.ticker}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">To</p>
                <p className="font-mono text-sm break-all">{recipient}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Network</p>
                <p className="font-medium">{asset.chain}</p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="basis-1/3" onClick={() => setStep('form')} disabled={loading}>
                Back
              </Button>

              <Button className="basis-2/3" onClick={handleConfirmSend} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Sending…' : 'Confirm & Send'}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-5">
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Transaction Confirmed</h3>
                <p className="text-muted-foreground text-sm">
                  {amount} {asset.ticker} sent successfully
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">Transaction Hash</p>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                <p className="flex-1 font-mono text-xs break-all">{txHash}</p>
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-blue-500 hover:text-blue-600"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        )}
      </CredenzaContent>
    </Credenza>
  )
}
