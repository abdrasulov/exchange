import { SwapPageClient } from './SwapPageClient'

export default function SwapPage({ searchParams }: { searchParams: { sellAsset?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SwapPageClient sellAsset={searchParams.sellAsset} />
    </div>
  )
}