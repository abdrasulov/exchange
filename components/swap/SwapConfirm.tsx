import { Token, QuoteRoute } from '@/lib/api'

type SwapConfirmProps = {
  amount: string
  fromTokenMeta?: Token
  toTokenMeta?: Token
  confirmQuote: QuoteRoute
  needsApproval: boolean
  status: string | null
  onBack: () => void
  onConfirm: () => void
}

export function SwapConfirm({
  amount,
  fromTokenMeta,
  toTokenMeta,
  confirmQuote,
  needsApproval,
  status,
  onBack,
  onConfirm
}: SwapConfirmProps) {
  const buttonText = needsApproval && fromTokenMeta?.address
    ? `Approve ${fromTokenMeta.ticker}`
    : 'Swap'

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">Confirm Swap</p>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">You pay</span>
            <span className="font-medium">
              {amount} {fromTokenMeta?.ticker}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">You receive</span>
            <span className="font-medium">
              {confirmQuote.expectedBuyAmount} {toTokenMeta?.ticker}
            </span>
          </div>
          {confirmQuote.estimatedTime && (
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Est. time</span>
              <span className="text-sm">~{confirmQuote.estimatedTime.total}s</span>
            </div>
          )}
        </div>
      </div>

      {needsApproval && fromTokenMeta?.address && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-xs text-yellow-900">Token approval required before swap</p>
        </div>
      )}

      {status && <p className="text-sm text-slate-600">{status}</p>}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="basis-1/3 rounded-lg border border-slate-200 py-2.5 font-medium hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="basis-2/3 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-500"
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}