import { SwapPageClient } from './swap-page-client'

export default async function SwapPage({ searchParams }: { searchParams: Promise<{ sellAsset?: string }> }) {
  const { sellAsset } = await searchParams
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SwapPageClient sellAsset={sellAsset} />
    </div>
  )
}
