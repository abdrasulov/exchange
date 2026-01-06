import { SwapModalClient } from './SwapModalClient'

export default function SwapModalPage({ searchParams }: { searchParams: { sellAsset?: string } }) {
  return <SwapModalClient sellAsset={searchParams.sellAsset} />
}