import Image from 'next/image'
import { useState } from 'react'
import { Token } from '@/lib/api'
import { cn } from '@/lib/utils'

export function AssetIcon({ token, className }: { token: Token | undefined; className?: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={cn('bg-blade relative flex h-8 w-8 rounded-full', className)}>
      {token && (
        <>
          {!isNativeToken(token) && (
            <Image
              className="outline-lawrence bg-lawrence absolute -top-1 -right-1 h-4 w-4 rounded-md"
              src={`/networks/${token.chain.toLowerCase()}.svg`}
              alt={token.chain.toLowerCase()}
              width={16}
              height={16}
            />
          )}
          {token.logoURI && (
            <img
              className={cn('shrink-0 rounded-full', { 'opacity-0': !loaded })}
              src={token.logoURI}
              alt={token.ticker}
              width={32}
              height={32}
              onLoad={() => setLoaded(true)}
              onError={() => setLoaded(false)}
            />
          )}
        </>
      )}
    </div>
  )
}

function isNativeToken(token: Token): boolean {
  return (
    ['THOR.RUNE', 'BSC.BNB', 'GAIA.ATOM'].includes(token.identifier) ||
    token.chain.toLowerCase() === token.ticker.toLowerCase()
  )
}
