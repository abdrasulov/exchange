'use client'

import { Swap } from '@/components/swap/swap'
import { useRouter } from 'next/navigation'

export function SwapModalClient({ sellAsset }: { sellAsset?: string }) {
  const router = useRouter()

  return <Swap open={true} onOpenChange={isOpen => !isOpen && router.back()} sellAsset={sellAsset} />
}
