'use client'

import { useEffect, useMemo, useState } from 'react'
import { TransactionHistoryItem } from '@/app/api/types'
import { WalletAccount } from '@turnkey/core'
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { fetchTransactions } from '@/lib/api'

interface TransactionHistoryProps {
  account: WalletAccount
}

type DirectionFilter = 'all' | 'incoming' | 'outgoing'

export default function TransactionHistory({ account }: TransactionHistoryProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([])
  const [pageKey, setPageKey] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all')
  const [assetFilter, setAssetFilter] = useState<string>('all')

  const address = account.address
  const addressFormat = account.addressFormat

  if (account.addressFormat != 'ADDRESS_FORMAT_ETHEREUM') {
    return <div className="text-sm text-neutral-500">Transaction history not available for this network</div>
  }

  useEffect(() => {
    fetchTransactionsData().catch(console.error)
  }, [address, addressFormat])

  const fetchTransactionsData = async (nextPageKey?: string) => {
    setLoading(true)

    try {
      const data = await fetchTransactions(address, addressFormat, nextPageKey)

      if (nextPageKey) {
        setTransactions(prev => [...prev, ...data.transfers])
      } else {
        setTransactions(data.transfers)
      }

      setPageKey(data.pageKey)
      setHasMore(!!data.pageKey)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (pageKey) {
      fetchTransactionsData(pageKey)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Unknown'
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatValue = (value: number | null, asset: string | null) => {
    if (value === null) return 'N/A'
    return `${value.toFixed(6).replace(/\.?0+$/, '')} ${asset || ''}`
  }

  const getExplorerUrl = (hash: string) => {
    return `https://etherscan.io/tx/${hash}`
  }

  const isIncoming = (tx: TransactionHistoryItem) => {
    return tx.to?.toLowerCase() === address.toLowerCase()
  }

  const availableAssets = useMemo(() => {
    const assets = new Set<string>()
    transactions.forEach(tx => {
      if (tx.asset) {
        assets.add(tx.asset)
      }
    })
    return Array.from(assets).sort()
  }, [transactions])

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Direction filter
      if (directionFilter === 'incoming' && !isIncoming(tx)) return false
      if (directionFilter === 'outgoing' && isIncoming(tx)) return false

      // Asset filter
      if (assetFilter !== 'all' && tx.asset !== assetFilter) return false

      return true
    })
  }, [transactions, directionFilter, assetFilter])

  if (loading && transactions.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <svg
          className="h-6 w-6 animate-spin text-neutral-400 dark:text-neutral-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No transactions found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Direction Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setDirectionFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              directionFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setDirectionFilter('incoming')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              directionFilter === 'incoming'
                ? 'bg-green-600 text-white dark:bg-green-500'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
            }`}
          >
            <ArrowDownLeft className="h-4 w-4" />
            Received
          </button>
          <button
            onClick={() => setDirectionFilter('outgoing')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              directionFilter === 'outgoing'
                ? 'bg-orange-600 text-white dark:bg-orange-500'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            Sent
          </button>
        </div>

        {/* Asset Filter Dropdown */}
        {availableAssets.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
                <Filter className="h-4 w-4" />
                {assetFilter === 'all' ? 'All Assets' : assetFilter}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Asset</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={assetFilter} onValueChange={setAssetFilter}>
                <DropdownMenuRadioItem value="all">All Assets</DropdownMenuRadioItem>
                {availableAssets.map(asset => (
                  <DropdownMenuRadioItem key={asset} value={asset}>
                    {asset}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Results count */}
        {(directionFilter !== 'all' || assetFilter !== 'all') && (
          <span className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
            {filteredTransactions.length} of {transactions.length} transactions
          </span>
        )}
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 && transactions.length > 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No transactions match the selected filters</p>
        </div>
      ) : (
        filteredTransactions.map(tx => {
          const incoming = isIncoming(tx)
          return (
            <div
              key={tx.uniqueId}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    incoming
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}
                >
                  {incoming ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {incoming ? 'Received' : 'Sent'} {tx.asset || 'Unknown'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatTimestamp(tx.timestamp)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p
                    className={`font-medium ${incoming ? 'text-green-600 dark:text-green-400' : 'text-neutral-900 dark:text-white'}`}
                  >
                    {incoming ? '+' : '-'}
                    {formatValue(tx.value, tx.asset)}
                  </p>
                  <a
                    href={getExplorerUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    View on Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )
        })
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
