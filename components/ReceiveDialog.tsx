'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TokenBalance } from '@/app/api/types'

export function ReceiveDialog({
  open,
  onOpenChange,
  address,
  token
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: string
  token: TokenBalance | null
}) {
  if (!token) {
    return
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive {token.token.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <p className="text-muted-foreground text-xs">Address</p>
            <p className="font-mono text-sm break-all">{address}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-xs">Network</p>
            <p className="font-medium">{token.token.blockchainType}</p>
          </div>

          {/* later: QR code, copy button, network badge */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
