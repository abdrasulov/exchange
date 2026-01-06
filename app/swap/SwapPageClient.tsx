'use client'

import { SwapModal } from '@/components/SwapModal'
import { useRouter } from 'next/navigation'

export function SwapPageClient({ sellAsset }: { sellAsset?: string }) {
  const router = useRouter()

  return <SwapModal open={true} onOpenChange={isOpen => !isOpen && router.push('/')} sellAsset={sellAsset} />
}