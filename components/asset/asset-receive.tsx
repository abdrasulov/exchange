'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BalanceAsset } from '@/app/api/types'

export function AssetReceive({
  open,
  onOpenChange,
  address,
  asset
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: string
  asset: BalanceAsset | null
}) {
  if (!asset) {
    return
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive {asset.ticker}</DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  )
}
