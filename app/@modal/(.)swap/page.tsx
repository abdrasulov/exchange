import { SwapModalClient } from './SwapModalClient'

export default async function SwapModalPage({ params }: { params: Promise<{ sellAsset?: string }> }) {
  const { sellAsset } = await params
  return <SwapModalClient sellAsset={sellAsset} />
}
