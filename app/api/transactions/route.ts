import { NextRequest } from 'next/server'
import { Chain, TransactionHistoryItem, TransactionHistoryResponse } from '@/app/api/types'
import {
  Alchemy,
  AssetTransfersCategory,
  AssetTransfersWithMetadataParams,
  AssetTransfersWithMetadataResult,
  Network,
  SortingOrder
} from 'alchemy-sdk'

async function fetchEthereumTransactions(
  address: string,
  pageKey?: string,
  maxCount: number = 100
): Promise<TransactionHistoryResponse> {
  const alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
    connectionInfoOverrides: {
      skipFetchSetup: true
    }
  })

  const categories: AssetTransfersCategory[] = [
    AssetTransfersCategory.EXTERNAL,
    AssetTransfersCategory.INTERNAL,
    AssetTransfersCategory.ERC20
  ]

  const outgoingParams: AssetTransfersWithMetadataParams = {
    fromAddress: address,
    category: categories,
    withMetadata: true,
    maxCount: maxCount,
    order: SortingOrder.DESCENDING,
    ...(pageKey && { pageKey })
  }

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

  const allTransfers = [...outgoingResponse.transfers, ...incomingResponse.transfers]
  const uniqueTransfers = new Map<string, AssetTransfersWithMetadataResult>()

  for (const transfer of allTransfers) {
    uniqueTransfers.set(transfer.uniqueId, transfer)
  }

  const sortedTransfers = Array.from(uniqueTransfers.values()).sort((a, b) => {
    const blockA = parseInt(a.blockNum, 16)
    const blockB = parseInt(b.blockNum, 16)
    return blockB - blockA
  })

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
    chain: Chain.ETH,
    rawContract: {
      address: transfer.rawContract?.address || null,
      decimal: transfer.rawContract?.decimal || null
    }
  }))

  return {
    transfers: formattedTransfers,
    pageKey: outgoingResponse.pageKey || incomingResponse.pageKey
  }
}

async function fetchSolanaTransactions(address: string): Promise<TransactionHistoryResponse> {
  const transfers: TransactionHistoryItem[] = []

  try {
    const response = await fetch(`https://solana-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSignaturesForAddress',
        params: [address, { limit: 50 }]
      })
    })

    const data = await response.json()
    if (data.result) {
      for (const sig of data.result) {
        // Fetch transaction details
        const txResponse = await fetch(`https://solana-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTransaction',
            params: [sig.signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
          })
        })

        const txData = await txResponse.json()
        const tx = txData.result

        if (tx) {
          const blockTime = tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : ''

          // Try to extract transfer info from parsed instructions
          let value: number | null = null
          let from = ''
          let to: string | null = null
          let asset = 'SOL'

          const instructions = tx.transaction?.message?.instructions || []
          for (const ix of instructions) {
            if (ix.parsed?.type === 'transfer' && ix.program === 'system') {
              value = (ix.parsed.info?.lamports || 0) / 1e9
              from = ix.parsed.info?.source || ''
              to = ix.parsed.info?.destination || null
            } else if (ix.parsed?.type === 'transferChecked' && ix.program === 'spl-token') {
              value = ix.parsed.info?.tokenAmount?.uiAmount || 0
              from = ix.parsed.info?.source || ''
              to = ix.parsed.info?.destination || null
              asset = ix.parsed.info?.mint?.slice(0, 6) || 'SPL'
            }
          }

          transfers.push({
            uniqueId: sig.signature,
            category: 'native',
            blockNum: String(tx.slot || ''),
            timestamp: blockTime,
            from: from || address,
            to,
            value,
            asset,
            hash: sig.signature,
            chain: Chain.SOL,
            rawContract: {
              address: null,
              decimal: null
            }
          })
        }
      }
    }
  } catch (e) {
    console.error('Error fetching Solana transactions:', e)
  }

  return { transfers }
}

async function fetchBitcoinTransactions(address: string): Promise<TransactionHistoryResponse> {
  const transfers: TransactionHistoryItem[] = []

  try {
    const response = await fetch(`https://blockchain.info/rawaddr/${address}?limit=50`)
    const data = await response.json()

    if (data.txs) {
      for (const tx of data.txs) {
        // Calculate if incoming or outgoing
        let value = 0
        let isIncoming = false

        // Check outputs to see if address received funds
        for (const output of tx.out || []) {
          if (output.addr === address) {
            value += output.value
            isIncoming = true
          }
        }

        // Check inputs to see if address sent funds
        for (const input of tx.inputs || []) {
          if (input.prev_out?.addr === address) {
            value -= input.prev_out.value
            isIncoming = false
          }
        }

        const btcValue = Math.abs(value) / 1e8

        transfers.push({
          uniqueId: tx.hash,
          category: 'native',
          blockNum: String(tx.block_height || ''),
          timestamp: tx.time ? new Date(tx.time * 1000).toISOString() : '',
          from: isIncoming ? tx.inputs?.[0]?.prev_out?.addr || 'Unknown' : address,
          to: isIncoming ? address : tx.out?.[0]?.addr || null,
          value: btcValue,
          asset: 'BTC',
          hash: tx.hash,
          chain: Chain.BTC,
          rawContract: {
            address: null,
            decimal: null
          }
        })
      }
    }
  } catch (e) {
    console.error('Error fetching Bitcoin transactions:', e)
  }

  return { transfers }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const addressFormat = searchParams.get('addressFormat')
  const chain = searchParams.get('chain')
  const pageKey = searchParams.get('pageKey') || undefined
  const maxCountParam = searchParams.get('maxCount')

  if (address == null || addressFormat == null || chain == null) {
    return Response.json({ transfers: [], pageKey: undefined })
  }

  const maxCount = maxCountParam ? Math.min(parseInt(maxCountParam), 100) : 100

  try {
    let response: TransactionHistoryResponse

    if (chain === Chain.ETH) {
      response = await fetchEthereumTransactions(address, pageKey, maxCount)
    } else if (chain === Chain.SOL) {
      response = await fetchSolanaTransactions(address)
    } else if (chain === Chain.BTC) {
      response = await fetchBitcoinTransactions(address)
    } else {
      return Response.json({ transfers: [], pageKey: undefined })
    }

    return Response.json(response)
  } catch (e) {
    console.error(e)
    return Response.json({ transfers: [], pageKey: undefined })
  }
}
