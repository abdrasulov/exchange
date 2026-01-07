import { Token, QuoteRoute } from '@/lib/api'
import { getExplorerTxUrl } from '@/lib/chains'

type SwapSuccessProps = {
  amount: string
  fromTokenMeta?: Token
  toTokenMeta?: Token
  confirmQuote: QuoteRoute | null
  swapTxHash: string | null
}

export function SwapSuccess({
  amount,
  fromTokenMeta,
  toTokenMeta,
  confirmQuote,
  swapTxHash
}: SwapSuccessProps) {
  const explorerUrl = swapTxHash && fromTokenMeta
    ? getExplorerTxUrl(fromTokenMeta.chain, swapTxHash)
    : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-8">
        <svg className="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="mt-4 text-lg font-semibold">Swap Successful!</p>
        <p className="text-sm text-slate-600">
          {amount} {fromTokenMeta?.ticker} → {confirmQuote?.expectedBuyAmount} {toTokenMeta?.ticker}
        </p>
      </div>

      {swapTxHash && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600">Transaction Hash</p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
            <p className="flex-1 font-mono text-xs break-all">{swapTxHash}</p>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}