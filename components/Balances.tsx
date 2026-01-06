'use client'

import { useEffect, useState } from 'react'
import { WalletAccount } from '@turnkey/core'
import { TokenBalance } from '@/app/api/types'
import { fetchBalances } from '@/lib/api'

export function Balances(props: { account: WalletAccount }) {
  const account = props.account

  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBalances = async () => {
      if (!account.address) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await fetchBalances(account.address, account.addressFormat)
        setBalances(data)
      } catch (e) {
        console.error(e)
        setError('Failed to load balances.')
      } finally {
        setLoading(false)
      }
    }

    loadBalances()
  }, [account.address, account.addressFormat])

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm text-gray-500">Loading balances...</div>}

      {error && <div className="text-sm text-red-500">{error}</div>}

      {!loading && !error && (
        <div className="space-y-2">
          {balances.length > 0 && (
            <ul className="space-y-1 text-sm">
              {balances.map(token => (
                <li className="flex justify-between gap-4">
                  <div>
                    {token.token.code}
                    <div>{token.token.name}</div>
                  </div>
                  {token.balance}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
