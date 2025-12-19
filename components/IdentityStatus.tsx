'use client';
export default function IdentityStatus() {
  return (
    <section className="rounded-2xl bg-white/60 shadow-sm dark:bg-neutral-900/40 group relative overflow-hidden border border-neutral-200 backdrop-blur-xl transition-all hover:shadow-md dark:border-neutral-800">
      <div className="bg-gradient-to-b absolute inset-0 -z-10 from-neutral-50/50 to-transparent dark:from-neutral-800/20"></div>
      <div className="p-6">
        <div className="mb-4 items-center justify-between flex">
          <p className="font-semibold text-neutral-900 dark:text-white">Identity Status</p>
          <span className="items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 inline-flex ring-1 ring-inset ring-green-600/20 dark:text-green-400 dark:ring-green-500/30">Verified</span>
        </div>
        <div className="mx-auto mb-6 h-40 w-full items-center justify-center rounded-xl bg-neutral-50/50 dark:bg-neutral-800/30 relative flex flex-col border border-neutral-200 dark:border-neutral-700/50">
          <div className="w-48 rounded-lg bg-white shadow-xl dark:bg-neutral-900 relative z-10 border border-neutral-200 p-3 dark:border-neutral-700">
            <div className="mb-3 items-center pb-2 flex gap-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-800"></div>
              <div className="space-y-1">
                <div className="h-1.5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-1.5 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="items-center flex gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className="h-1.5 w-3/4 rounded-full bg-green-500/50"></div>
                </div>
              </div>
              <div className="h-12 w-full bg-neutral-50 dark:bg-neutral-800 rounded p-2">
                <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
              </div>
            </div>
            <div className="h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-lg absolute -right-2 -top-2 flex ring-2 ring-white dark:ring-neutral-900">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" id="Windframe_VBJe6WLjV">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                                    </svg>
            </div>
          </div>
          <div className="rounded-xl bg-white/50 dark:bg-neutral-800/50 absolute inset-x-8 bottom-4 top-8 -z-10 border border-neutral-200 dark:border-neutral-700"></div>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Your identity has been verified. You have full access to all platform features including high-limit withdrawals.</p>
      </div>
    </section>
  );
}
