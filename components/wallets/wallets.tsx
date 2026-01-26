'use client'

import { useEffect, useState } from 'react'
import { Loader } from 'lucide-react'
import { Wallet } from '@turnkey/core'
import { WalletsAccount } from '@/components/wallets/wallets-account'
import { TransactionHistory } from '@/components/transaction-history'
import { WalletsCreateButton } from '@/components/wallets/wallets-create-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BalanceAsset } from '@/app/api/types'
import { fetchBalances } from '@/lib/api'

interface MainContentProps {
  wallets: Wallet[]
}

export function Wallets({ wallets }: MainContentProps) {
  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true)
  const [accountBalances, setAccountBalances] = useState<Record<string, BalanceAsset[]>>({})

  useEffect(() => {
    const fetchAllBalances = async () => {
      if (wallets.length === 0) {
        return setIsLoadingBalance(false)
      }

      setIsLoadingBalance(true)
      let total = 0
      const balancesByAccount: Record<string, BalanceAsset[]> = {}

      try {
        for (const wallet of wallets) {
          for (const account of wallet.accounts) {
            const balances = await fetchBalances(account.address, account.addressFormat)

            // Store balances for this account
            balancesByAccount[account.walletAccountId] = balances

            // Calculate total
            for (const balance of balances) {
              const usdValue = parseFloat(balance.value_usd)
              if (usdValue > 0) {
                total += usdValue
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching balances:', error)
      }

      setAccountBalances(balancesByAccount)
      setTotalBalance(total)
      setIsLoadingBalance(false)
    }

    fetchAllBalances()
  }, [wallets])

  return (
    <div className="lg:col-span-2">
      <section className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200 p-6 dark:border-neutral-800">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Balance</p>
              <div className="mt-1 flex items-baseline gap-2">
                {isLoadingBalance ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          {wallets.length == 0 ? (
            <WalletsCreateButton />
          ) : (
            <Tabs defaultValue="assets" className="w-full">
              <TabsList className="mb-4 bg-neutral-100 dark:bg-neutral-800">
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="assets">
                <div className="space-y-4">
                  {wallets.map(wallet => (
                    <div className="space-y-4" key={wallet.walletId}>
                      <div className="mb-2">{wallet.walletName}</div>
                      {wallet.accounts.map(account => (
                        <WalletsAccount
                          account={account}
                          key={account.walletAccountId}
                          balances={accountBalances[account.walletAccountId] || []}
                          loading={isLoadingBalance}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="history">
                <TransactionHistory accounts={wallets.flatMap(wallet => wallet.accounts)} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  )
}
