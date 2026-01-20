'use client'

import { useState } from 'react'
import { Asset } from '@/components/asset/asset'
import { Loader } from 'lucide-react'
import { BalanceAsset } from '@/app/api/types'
import { WalletAccount } from '@turnkey/core'
import { AssetReceive } from '@/components/asset/asset-receive'
import { AssetSend } from '@/components/asset/asset-send'

interface AssetDetailsProps {
  account: WalletAccount
  balances: BalanceAsset[]
  loading: boolean
}

export function WalletsAccount({ account, balances, loading }: AssetDetailsProps) {
  const address = account.address
  const [sendOpen, setSendOpen] = useState(false)
  const [sendToken, setSendToken] = useState<BalanceAsset | null>(null)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [receiveToken, setReceiveToken] = useState<BalanceAsset | null>(null)

  if (loading) {
    return (
      <div className="mb-4 flex h-24 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <Loader className="animate-spin" size={24} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {balances.map((asset, i) => (
        <Asset
          key={i}
          name={asset.ticker}
          code={asset.ticker}
          amount={parseFloat(asset.value).toFixed(asset.decimal).replace(/\.?0+$/, '')}
          fiatAmount={parseFloat(asset.value_usd) > 0 ? `$${asset.value_usd}` : ''}
          onReceive={() => {
            setReceiveOpen(true)
            setReceiveToken(asset)
          }}
          onSend={() => {
            setSendOpen(true)
            setSendToken(asset)
          }}
          tokenIdentifier={asset.identifier}
        />
      ))}

      <AssetSend
        open={sendOpen}
        onOpenChange={setSendOpen}
        address={address}
        asset={sendToken}
        walletAccount={account}
      />

      <AssetReceive open={receiveOpen} onOpenChange={setReceiveOpen} address={address} asset={receiveToken} />
    </div>
  )
}
