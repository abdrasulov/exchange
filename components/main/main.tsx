'use client'

import { useMemo } from 'react'
import { AuthState, useTurnkey } from '@turnkey/react-wallet-kit'
import { MainGuest } from '@/components/main/main-guest'
import MainSidebar from '@/components/main/main-sidebar'
import Wallets from '@/components/wallets/wallets'

export function Main() {
  const { user, wallets, authState } = useTurnkey()

  if (authState !== AuthState.Authenticated) {
    return <MainGuest />
  }

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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {user && <MainSidebar user={user} />}
        {wallets && <Wallets wallets={uniqueWallets} />}
      </div>
    </div>
  )
}
