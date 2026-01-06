import { NextRequest } from 'next/server'
import { TransactionHistoryItem, TransactionHistoryResponse } from '@/app/api/types'
import {
  Alchemy,
  AssetTransfersCategory,
  AssetTransfersWithMetadataParams,
  AssetTransfersWithMetadataResult,
  Network,
  SortingOrder
} from 'alchemy-sdk'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const addressFormat = searchParams.get('addressFormat')
  const pageKey = searchParams.get('pageKey')
  const maxCountParam = searchParams.get('maxCount')

  if (address == null || addressFormat == null) {
    return Response.json({ transfers: [], pageKey: undefined })
  }

  let network
  if (addressFormat == 'ADDRESS_FORMAT_ETHEREUM') {
    network = Network.ETH_MAINNET
  }

  if (network === undefined) {
    return Response.json({ transfers: [], pageKey: undefined })
  }

  const maxCount = maxCountParam ? Math.min(parseInt(maxCountParam), 100) : 100

  const alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: network,
    connectionInfoOverrides: {
      skipFetchSetup: true
    }
  })

  const categories: AssetTransfersCategory[] = [
    AssetTransfersCategory.EXTERNAL,
    AssetTransfersCategory.INTERNAL,
    AssetTransfersCategory.ERC20
  ]

  try {
    // Fetch outgoing transactions (from address)
    const outgoingParams: AssetTransfersWithMetadataParams = {
      fromAddress: address,
      category: categories,
      withMetadata: true,
      maxCount: maxCount,
      order: SortingOrder.DESCENDING,
      ...(pageKey && { pageKey })
    }

    // Fetch incoming transactions (to address)
    const incomingParams: AssetTransfersWithMetadataParams = {
      toAddress: address,
      category: categories,
      withMetadata: true,
      maxCount: maxCount,
      order: SortingOrder.DESCENDING,
      ...(pageKey && { pageKey })
    }

    const [outgoingResponse, incomingResponse] = await Promise.all([
      alchemy.core.getAssetTransfers(outgoingParams),
      alchemy.core.getAssetTransfers(incomingParams)
    ])

    // Combine and deduplicate transfers
    const allTransfers = [...outgoingResponse.transfers, ...incomingResponse.transfers]
    const uniqueTransfers = new Map<string, AssetTransfersWithMetadataResult>()

    for (const transfer of allTransfers) {
      uniqueTransfers.set(transfer.uniqueId, transfer)
    }

    // Sort by block number descending (newest first)
    const sortedTransfers = Array.from(uniqueTransfers.values()).sort((a, b) => {
      const blockA = parseInt(a.blockNum, 16)
      const blockB = parseInt(b.blockNum, 16)
      return blockB - blockA
    })

    // Format the response
    const formattedTransfers: TransactionHistoryItem[] = sortedTransfers.map(transfer => ({
      uniqueId: transfer.uniqueId,
      category: transfer.category as 'external' | 'internal' | 'erc20',
      blockNum: transfer.blockNum,
      timestamp: transfer.metadata.blockTimestamp || '',
      from: transfer.from,
      to: transfer.to,
      value: transfer.value,
      asset: transfer.asset,
      hash: transfer.hash,
      rawContract: {
        address: transfer.rawContract?.address || null,
        decimal: transfer.rawContract?.decimal || null
      }
    }))

    const response: TransactionHistoryResponse = {
      transfers: formattedTransfers,
      pageKey: outgoingResponse.pageKey || incomingResponse.pageKey
    }

    return Response.json(response)
  } catch (e) {
    console.error(e)
    return Response.json({ transfers: [], pageKey: undefined })
  }
}
