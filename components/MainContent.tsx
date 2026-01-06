'use client'
import AssetDetails from '@/components/AssetDetails'
import TransactionHistory from '@/components/TransactionHistory'
import { Wallet } from '@turnkey/core'
import { CreateWalletButton } from '@/components/CreateWalletButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MainContentProps {
  wallets: Wallet[]
}

export default function MainContent({ wallets }: MainContentProps) {
  return (
    <div className="lg:col-span-2">
      <section className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {/*<div className="border-b border-neutral-200 p-6 dark:border-neutral-800">*/}
        {/*  <div className="items-end justify-between flex">*/}
        {/*    <div>*/}
        {/*      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Balance</p>*/}
        {/*      <div className="mt-1 items-baseline flex gap-2">*/}
        {/*        <span className="text-3xl font-bold text-neutral-900 dark:text-white">$42,850.54</span>*/}
        {/*        <span className="text-sm font-medium text-green-600 dark:text-green-400">+2.4%</span>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*    <button type="submit" className="border border-neutral-200 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 rounded-lg bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-600 dark:bg-neutral-800">History</button>*/}
        {/*  </div>*/}
        {/*</div>*/}
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
                    wallet.accounts.map(account => <AssetDetails account={account} key={account.walletAccountId} />)
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
