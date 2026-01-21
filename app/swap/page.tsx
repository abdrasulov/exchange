import { SwapPageClient } from './swap-page-client'

export default async function SwapPage({ searchParams }: { searchParams: Promise<{ sellAsset?: string }> }) {
  const { sellAsset } = await searchParams
  return (
    <main className="min-h-screen">
      <SwapPageClient sellAsset={sellAsset} />
    </main>
  )
}
