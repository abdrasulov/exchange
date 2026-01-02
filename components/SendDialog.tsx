'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TokenBalance } from '@/app/api/types'
import { useEffect, useState } from 'react'
import { useTurnkey } from '@turnkey/react-wallet-kit'
import { ethers } from 'ethers'
import { WalletAccount } from '@turnkey/core'
import { Loader2 } from 'lucide-react'
import { sleep } from '@walletconnect/utils'

export function SendDialog({
  open,
  onOpenChange,
  address,
  tokenBalance,
  walletAccount
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: string
  tokenBalance: TokenBalance | null
  walletAccount: WalletAccount
}) {
  if (!tokenBalance) return null

  type Step = 'form' | 'confirm'

  const [step, setStep] = useState<Step>('form')

  const [loading, setLoading] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [recipientError, setRecipientError] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState<string | null>(null)
  const { signAndSendTransaction, signTransaction } = useTurnkey()

  useEffect(() => {
    if (!open) {
      setStep('form')
      setRecipient('')
      setAmount('')
      setRecipientError(null)
      setAmountError(null)
    }
  }, [open])

  const isFormValid = !recipientError && !amountError && recipient.length > 0 && amount.length > 0

  const handleReview = () => {
    if (!isFormValid) return
    setStep('confirm')
  }

  const token = tokenBalance.token

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
    const decimals = tokenBalance.token.decimals
    const decimalPart = value.split('.')[1]

    if (decimalPart && decimalPart.length > decimals) {
      return `Max ${decimals} decimal places allowed`
    }

    // Balance check (BigInt safe)
    try {
      const valueWei = ethers.parseUnits(value, decimals)
      const balanceWei = ethers.parseUnits(tokenBalance.balance.toString(), decimals)

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
      setLoading(true)

      const tx = {
        to: recipient,
        value: ethers.parseEther(amount),
        chainId: token.chainId
      }

      const unsignedTransaction = ethers.Transaction.from(tx).unsignedSerialized

      // await signAndSendTransaction({
      //         unsignedTransaction: unsignedTransaction,
      //         transactionType: "TRANSACTION_TYPE_ETHEREUM",
      //         walletAccount: walletAccount,
      //         rpcUrl: "https://ethereum-rpc.publicnode.com",
      //         // stampWith?: StamperType | undefined,
      //         // organizationId?: string,
      //       }
      //     )

      // await signTransaction({
      //   unsignedTransaction,
      //   transactionType: "TRANSACTION_TYPE_ETHEREUM",
      //   walletAccount,
      // });

      await sleep(1000)

      onOpenChange(false)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={loading ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send {tokenBalance.token.code}</DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-5">
            {/* Network */}
            <div>
              <p className="text-muted-foreground text-xs">Network</p>
              <p className="font-medium">{tokenBalance.token.blockchainType}</p>
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
                  Balance: {tokenBalance.balance} {tokenBalance.token.code}
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
              Review
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-5">
            <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              <div>
                <p className="text-muted-foreground text-xs">Asset</p>
                <p className="font-medium">
                  {amount} {token.code}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">To</p>
                <p className="font-mono text-sm break-all">{recipient}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Network</p>
                <p className="font-medium">{token.blockchainType}</p>
              </div>
            </div>

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
      </DialogContent>
    </Dialog>
  )
}
