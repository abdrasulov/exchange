import Link from "next/link";

interface AssetCardProps {
  name: string,
  code: string,
  amount: string,
  fiatAmount: string,
  onReceive: () => void
}

const AssetCard = ({
                     name,
                     code,
                     amount,
                     fiatAmount,
                     onReceive
                   }: AssetCardProps) => {

  return (
    <details className="rounded-xl bg-neutral-50 dark:bg-neutral-950/50 group open:ring-1
                  open:ring-neutral-200 dark:open:ring-neutral-800 border border-neutral-200 dark:border-neutral-800
                  transition-all duration-300">
      <summary className="items-center justify-between flex cursor-pointer list-none p-4 focus:outline-none">
        <div className="items-center flex gap-4">
          <div className="h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600
                        dark:bg-orange-900/30 flex dark:text-orange-500">

          </div>
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
      <div className="bg-white px-4 py-6 dark:bg-neutral-900 rounded-b-xl border-t border-neutral-200
                    dark:border-neutral-800">
        <div className="grid grid-cols-3 gap-4">
          <button type="submit" className="flex flex-col gap-2 border border-neutral-200 hover:bg-neutral-100
                        dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 items-center justify-center
                        rounded-lg bg-neutral-50 py-3 text-sm font-medium text-neutral-900 dark:bg-neutral-800">
            <div className="h-8 w-8 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700
                          flex">
              <svg className="h-4 w-4 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                   id="Windframe_JklDlkXF4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </div>
            Send
          </button>
          <button onClick={onReceive} className="flex flex-col gap-2 border border-neutral-200 hover:bg-neutral-100
                        dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 items-center justify-center
                        rounded-lg bg-neutral-50 py-3 text-sm font-medium text-neutral-900 dark:bg-neutral-800">
            <div className="h-8 w-8 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700
                          flex">
              <svg className="h-4 w-4 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                   id="Windframe_R5sSGf0hF">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
            Receive
          </button>
          <Link
            href={"/swap"}
            type="submit" className="flex flex-col gap-2 border border-neutral-200 hover:bg-neutral-100
                        dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 items-center justify-center
                        rounded-lg bg-neutral-50 py-3 text-sm font-medium text-neutral-900 dark:bg-neutral-800">
            <div className="h-8 w-8 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700
                          flex">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="Windframe_Vxi5xDhtK">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
            </div>
            Swap
          </Link>
        </div>
      </div>
    </details>
  )

};

export default AssetCard;
