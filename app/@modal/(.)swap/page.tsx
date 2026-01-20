import { SwapModalClient } from './swap-modal-client'

export default async function SwapModalPage({ searchParams }: { searchParams: Promise<{ sellAsset?: string }> }) {
  const { sellAsset } = await searchParams
  return <SwapModalClient sellAsset={sellAsset} />
}
