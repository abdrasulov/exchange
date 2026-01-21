'use client'

import { Swap } from '@/components/swap/swap'
import { useRouter } from 'next/navigation'

export function SwapModalClient({ sellAsset }: { sellAsset?: string }) {
  const router = useRouter()

  return <Swap isOpen={true} onOpenChange={open => !open && router.back()} sellAsset={sellAsset} />
}
