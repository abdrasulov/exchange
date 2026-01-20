type SwapProgressProps = {
  type: 'approving' | 'swapping'
  approvalConfirmed?: boolean
}

export function SwapProgress({ type, approvalConfirmed }: SwapProgressProps) {
  const isApproving = type === 'approving'

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 font-medium">{isApproving ? 'Approving Token...' : 'Swapping...'}</p>
        <p className="text-sm text-slate-600">
          {isApproving ? 'Please confirm in your wallet' : 'Transaction in progress'}
        </p>
        {!isApproving && approvalConfirmed && <p className="mt-2 text-xs text-green-600">Approval confirmed</p>}
      </div>
    </div>
  )
}
