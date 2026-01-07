import { Token } from '@/lib/api'

type ApproveData = {
  spender: string
  contract: string
  amount: bigint
}

type SwapApprovalProps = {
  amount: string
  fromTokenMeta?: Token
  approveData: ApproveData | null
  status: string | null
  onBack: () => void
  onApprove: () => void
}

export function SwapApproval({
  amount,
  fromTokenMeta,
  approveData,
  status,
  onBack,
  onApprove
}: SwapApprovalProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-900">Approval Required</p>
        <p className="mt-1 text-xs text-yellow-700">
          Approve {amount} {fromTokenMeta?.ticker} for swapping
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 p-3">
        <div>
          <p className="text-xs text-slate-600">Token</p>
          <p className="font-medium">{fromTokenMeta?.ticker}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Amount</p>
          <p className="font-medium">{amount}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600">Spender</p>
          <p className="font-mono text-xs break-all">{approveData?.spender}</p>
        </div>
      </div>

      {status && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{status}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="basis-1/3 rounded-lg border border-slate-200 py-2.5 font-medium hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={onApprove}
          className="basis-2/3 rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-500"
        >
          Approve
        </button>
      </div>
    </div>
  )
}