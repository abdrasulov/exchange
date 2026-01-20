import Link from 'next/link'
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react'

interface TokenProps {
  name: string
  code: string
  amount: string
  fiatAmount: string
  onReceive: () => void
  onSend: () => void
  tokenIdentifier?: string
}

export function Asset({ name, code, amount, fiatAmount, onReceive, onSend, tokenIdentifier }: TokenProps) {
  return (
    <details className="group rounded-xl border border-neutral-200 bg-neutral-50 transition-all duration-300 open:ring-1 open:ring-neutral-200 dark:border-neutral-800 dark:bg-neutral-950/50 dark:open:ring-neutral-800">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 focus:outline-none">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500"></div>
          <div>
            <div className="font-semibold text-neutral-900 dark:text-white">{name}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{code}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-neutral-900 dark:text-white">{amount}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{fiatAmount}</div>
        </div>
      </summary>
      <div className="rounded-b-xl border-t border-neutral-200 bg-white px-4 py-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={onSend}
            type="submit"
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
              <ArrowUpRight size={16} />
            </div>
            Send
          </button>
          <button
            onClick={onReceive}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
              <ArrowDownLeft size={16} />
            </div>
            Receive
          </button>
          <Link
            href={tokenIdentifier ? `/swap?sellAsset=${encodeURIComponent(tokenIdentifier.toUpperCase())}` : '/swap'}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
              <ArrowLeftRight size={16} />
            </div>
            Swap
          </Link>
        </div>
      </div>
    </details>
  )
}
