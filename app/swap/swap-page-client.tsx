'use client'

import { Swap } from '@/components/swap/swap'
import { useRouter } from 'next/navigation'

export function SwapPageClient({ sellAsset }: { sellAsset?: string }) {
  const router = useRouter()

  return <Swap isOpen={true} onOpenChange={open => !open && router.push('/')} sellAsset={sellAsset} />
}
