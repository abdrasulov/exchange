import { useMemo } from 'react'
import { useTurnkey } from '@turnkey/react-wallet-kit'
import MainSidebar from '@/components/main/main-sidebar'
import Wallets from '@/components/wallets/wallets'

export function Main() {
  const { user, wallets } = useTurnkey()

  const uniqueWallets = useMemo(() => {
    return wallets.map(wallet => {
      const seen = new Set<string>()
      const uniqueAccounts = wallet.accounts.filter(account => {
        if (seen.has(account.walletAccountId)) {
          return false
        }

        seen.add(account.walletAccountId)
        return true
      })

      return { ...wallet, accounts: uniqueAccounts }
    })
  }, [wallets])

  return (
    <div className="relative isolate min-h-screen w-full bg-white text-neutral-900 antialiased transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {user && <MainSidebar user={user} />}
          {wallets && <Wallets wallets={uniqueWallets} />}
        </div>
      </main>
    </div>
  )
}
