'use client'

import axios from 'axios'
import AssetDetails from '@/components/AssetDetails'
import TransactionHistory from '@/components/TransactionHistory'
import { Wallet } from '@turnkey/core'
import { CreateWalletButton } from '@/components/CreateWalletButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { TokenBalance } from '@/app/api/types'

interface MainContentProps {
  wallets: Wallet[]
}

export default function MainContent({ wallets }: MainContentProps) {
  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(true)
  const [accountBalances, setAccountBalances] = useState<Record<string, TokenBalance[]>>({})

  useEffect(() => {
    const fetchAllBalances = async () => {
      if (wallets.length === 0) {
        setIsLoadingBalance(false)
        return
      }

      setIsLoadingBalance(true)
      let total = 0
      const balancesByAccount: Record<string, TokenBalance[]> = {}

      try {
        for (const wallet of wallets) {
          for (const account of wallet.accounts) {
            if (account.addressFormat !== 'ADDRESS_FORMAT_ETHEREUM') continue

            const response = await axios.get(
              `/api/balances/?address=${account.address}&addressFormat=${account.addressFormat}`
            )
            const balances = response.data as TokenBalance[]

            // Store balances for this account
            balancesByAccount[account.walletAccountId] = balances

            // Calculate total
            for (const balance of balances) {
              if (balance.usdValue) {
                total += balance.usdValue
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
                  <div className="flex h-10 items-center">
                    <svg
                      className="h-5 w-5 animate-spin text-neutral-400 dark:text-neutral-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-label="Loading"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </div>
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
            <CreateWalletButton />
          ) : (
            <Tabs defaultValue="assets" className="w-full">
              <TabsList className="mb-4 bg-neutral-100 dark:bg-neutral-800">
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="assets">
                <div className="space-y-4">
                  {wallets.map(wallet =>
                    wallet.accounts.map(account => (
                      <AssetDetails
                        account={account}
                        key={account.walletAccountId}
                        balances={accountBalances[account.walletAccountId] || []}
                        loading={isLoadingBalance}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="history">
                <div className="space-y-6">
                  {wallets.map(wallet =>
                    wallet.accounts.map(account => (
                      <div key={account.walletAccountId}>
                        <h3 className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                          {account.addressFormat.replace('ADDRESS_FORMAT_', '')} - {account.address.slice(0, 6)}...
                          {account.address.slice(-4)}
                        </h3>
                        <TransactionHistory account={account} />
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  )
}
