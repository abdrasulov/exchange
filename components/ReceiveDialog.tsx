'use client';

import {Dialog, DialogContent, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Balance} from "@/app/types";

export function ReceiveDialog({
                                open,
                                onOpenChange,
                                address,
                                token
                              }: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  address: string,
  token: Balance | null
}) {

  if (!token) {
    return;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Token</p>
            <p className="font-medium">{token.name}</p>
            <p className="font-medium">{token.code}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="font-mono break-all text-sm">{address}</p>
          </div>

          {/* later: QR code, copy button, network badge */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
