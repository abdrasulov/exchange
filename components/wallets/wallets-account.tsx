'use client'

import { Asset } from '@/components/asset/asset'
import { Loader } from 'lucide-react'
import { BalanceAsset } from '@/app/api/types'
import { WalletAccount } from '@turnkey/core'
import { AssetReceive } from '@/components/asset/asset-receive'
import { AssetSend } from '@/components/asset/asset-send'
import { useDialog } from '@/components/global-dialog'

interface AssetDetailsProps {
  account: WalletAccount
  balances: BalanceAsset[]
  loading: boolean
}

export function WalletsAccount({ account, balances, loading }: AssetDetailsProps) {
  const address = account.address
  const { openDialog } = useDialog()

  if (loading) {
    return (
      <div className="mb-4 flex h-24 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
        <Loader className="animate-spin" size={24} />
      </div>
    )
  }

  const handleSend = (asset: BalanceAsset) => {
    openDialog(AssetSend, {
      address,
      asset,
      walletAccount: account
    })
  }

  const handleReceive = (asset: BalanceAsset) => {
    openDialog(AssetReceive, {
      address,
      asset
    })
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
          onReceive={() => handleReceive(asset)}
          onSend={() => handleSend(asset)}
          tokenIdentifier={asset.identifier}
        />
      ))}
    </div>
  )
}
