import { QuoteRoute, Token } from '@/lib/api'
import { SwapSelectAsset } from '@/components/swap/swap-select-asset'
import { AssetIcon } from '@/components/asset-icon'
import { ChevronDown } from 'lucide-react'
import { useDialog } from '@/components/global-dialog'

type SwapFormProps = {
  amount: string
  slippage: string
  balance: string | null
  fromTokenMeta?: Token
  toTokenMeta?: Token
  previewQuote?: QuoteRoute | null
  isLoading: boolean
  needsApproval: boolean
  error?: string | null
  onFromTokenChange: (token: Token) => void
  onToTokenChange: (token: Token) => void
  onAmountChange: (value: string) => void
  onSlippageChange: (value: string) => void
  onSubmit: () => void
}

export function SwapForm({
  amount,
  slippage,
  balance,
  fromTokenMeta,
  toTokenMeta,
  previewQuote,
  isLoading,
  needsApproval,
  error,
  onFromTokenChange,
  onToTokenChange,
  onAmountChange,
  onSlippageChange,
  onSubmit
}: SwapFormProps) {
  const { openDialog } = useDialog()
  const getButtonText = () => {
    if (!fromTokenMeta || !toTokenMeta) return ''
    if (!amount || Number(amount) <= 0) return 'Enter Amount'
    if (isLoading) return 'Quoting...'
    if (error || !previewQuote) return 'No Valid Quotes'
    if (needsApproval && fromTokenMeta?.address) return `Approve ${fromTokenMeta.ticker}`
    return 'Next'
  }

  const isDisabled = !amount || Number(amount) <= 0 || isLoading || !!error || !previewQuote

  const openFromTokenSelector = () => {
    openDialog(SwapSelectAsset, {
      selected: fromTokenMeta,
      onSelectAsset: onFromTokenChange
    })
  }

  const openToTokenSelector = () => {
    openDialog(SwapSelectAsset, {
      selected: toTokenMeta,
      onSelectAsset: onToTokenChange
    })
  }

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="space-y-2">
        <label className="text-sm font-medium">From</label>
        <button
          type="button"
          onClick={openFromTokenSelector}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
        >
          {fromTokenMeta ? (
            <div className="flex items-center gap-2">
              <AssetIcon token={fromTokenMeta} className="h-6 w-6" />
              <span className="font-medium">{fromTokenMeta.ticker}</span>
              <span className="text-slate-500">{fromTokenMeta.chain}</span>
            </div>
          ) : (
            <span className="text-slate-400">Select token</span>
          )}
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">To</label>
        <button
          type="button"
          onClick={openToTokenSelector}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
        >
          {toTokenMeta ? (
            <div className="flex items-center gap-2">
              <AssetIcon token={toTokenMeta} className="h-6 w-6" />
              <span className="font-medium">{toTokenMeta.ticker}</span>
              <span className="text-slate-500">{toTokenMeta.chain}</span>
            </div>
          ) : (
            <span className="text-slate-400">Select token</span>
          )}
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Amount</label>
          {balance && (
            <span className="text-xs text-slate-500">
              Balance: {balance} {fromTokenMeta?.ticker}
            </span>
          )}
        </div>
        <input
          type="number"
          min="0"
          step="any"
          placeholder="0.0"
          value={amount}
          onChange={e => onAmountChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Slippage (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={slippage}
          onChange={e => onSlippageChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2"
        />
      </div>

      {previewQuote && (
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-slate-600">Estimated receive</p>
          <p className="text-lg font-semibold">
            ~{previewQuote.expectedBuyAmount} {toTokenMeta?.ticker}
          </p>
          {previewQuote.estimatedTime && (
            <p className="text-xs text-slate-500">Est. time: ~{previewQuote.estimatedTime.total}s</p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={onSubmit}
        disabled={isDisabled}
        className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {getButtonText()}
      </button>
    </div>
  )
}
