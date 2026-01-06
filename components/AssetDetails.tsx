'use client'

import AssetCard from '@/components/AssetCard'
import { useState } from 'react'
import { TokenBalance } from '@/app/api/types'
import { WalletAccount } from '@turnkey/core'
import { ReceiveDialog } from '@/components/ReceiveDialog'
import { SendDialog } from '@/components/SendDialog'

interface AssetDetailsProps {
  account: WalletAccount
  balances: TokenBalance[]
  loading: boolean
}

export default function AssetDetails({ account, balances, loading }: AssetDetailsProps) {
  const address = account.address

  if (account.addressFormat != 'ADDRESS_FORMAT_ETHEREUM') {
    return <div />
  }

  const [sendOpen, setSendOpen] = useState(false)
  const [sendToken, setSendToken] = useState<TokenBalance | null>(null)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [receiveToken, setReceiveToken] = useState<TokenBalance | null>(null)

  if (loading) {
    return (
      <div className="mb-4 flex h-24 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <svg
          className="h-6 w-6 animate-spin text-neutral-400 dark:text-neutral-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {balances.map(token => (
        <AssetCard
          key={token.token.id}
          name={token.token.name}
          code={token.token.code}
          amount={token.balance.toFixed(token.token.decimals).replace(/\.?0+$/, '')}
          fiatAmount={
            token.usdValue
              ? `$${token.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : ''
          }
          onReceive={() => {
            setReceiveOpen(true)
            setReceiveToken(token)
          }}
          onSend={() => {
            setSendOpen(true)
            setSendToken(token)
          }}
        />
      ))}

      <SendDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        address={address}
        tokenBalance={sendToken}
        walletAccount={account}
      />

      <ReceiveDialog open={receiveOpen} onOpenChange={setReceiveOpen} address={address} token={receiveToken} />
    </div>
  )
}
