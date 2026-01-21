'use client'

import { Credenza, CredenzaContent, CredenzaHeader, CredenzaTitle } from '@/components/ui/credenza'
import { BalanceAsset } from '@/app/api/types'

export function AssetReceive({
  isOpen,
  onOpenChange,
  address,
  asset
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  address: string
  asset: BalanceAsset | null
}) {
  if (!asset) {
    return null
  }

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent className="sm:max-w-md">
        <CredenzaHeader>
          <CredenzaTitle>Receive {asset.ticker}</CredenzaTitle>
        </CredenzaHeader>

        <div className="space-y-3">
          <div>
            <p className="text-muted-foreground text-xs">Address</p>
            <p className="font-mono text-sm break-all">{address}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs">Network</p>
            <p className="font-medium">{asset.chain}</p>
          </div>

          {/* later: QR code, copy button, network badge */}
        </div>
      </CredenzaContent>
    </Credenza>
  )
}
