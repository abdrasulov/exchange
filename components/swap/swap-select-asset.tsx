import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Credenza, CredenzaContent, CredenzaHeader, CredenzaTitle } from '@/components/ui/credenza'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Search } from 'lucide-react'
import { Token } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/lib/use-mobile'
import { cn } from '@/lib/utils'
import { AssetIcon } from '@/components/asset-icon'
import { useTokens } from '@/hooks/use-tokens'
import { useVirtualizer } from '@tanstack/react-virtual'

const CHAIN_LABELS: Record<string, string> = {
  AVAX: 'Avalanche',
  BASE: 'Base',
  BCH: 'Bitcoin Cash',
  BSC: 'BNB Chain',
  BTC: 'Bitcoin',
  DOGE: 'Dogecoin',
  ETH: 'Ethereum',
  GAIA: 'Cosmos',
  LTC: 'Litecoin',
  TRON: 'Tron',
  XRP: 'XRP Ledger',
  THOR: 'THORChain',
  OP: 'Optimism',
  ARB: 'Arbitrum',
  BERA: 'Berachain',
  SOL: 'Solana',
  POL: 'Polygon',
  GNO: 'Gnosis',
  ZEC: 'Zcash',
  NEAR: 'NEAR'
}

function chainLabel(chain: string): string {
  return CHAIN_LABELS[chain] || chain
}

const FEATURED_TOKENS = [
  'AVAX.AVAX',
  'BASE.ETH',
  'BCH.BCH',
  'BSC.BNB',
  'BTC.BTC',
  'DOGE.DOGE',
  'ETH.ETH',
  'GAIA.ATOM',
  'LTC.LTC',
  'TRON.TRX',
  'XRP.XRP',
  'THOR.RUNE',
  'OP.ETH',
  'ARB.ETH',
  'BERA.BERA',
  'SOL.SOL',
  'POL.POL',
  'GNO.xDAI',
  'ZEC.ZEC',
  'NEAR.NEAR'
]

interface SwapSelectAssetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  selected?: Token
  onSelectAsset: (token: Token) => void
}

enum Filter {
  All = 'All'
}

type FilterChain = string | Filter

export const SwapSelectAsset = ({ isOpen, onOpenChange, selected, onSelectAsset }: SwapSelectAssetProps) => {
  const isMobile = useIsMobile()
  const [selectedChain, setSelectedChain] = useState<FilterChain>(Filter.All)
  const [searchQuery, setSearchQuery] = useState('')

  const { tokens } = useTokens()

  const chainMap: Map<FilterChain, Token[]> = useMemo(() => {
    if (!tokens?.length) return new Map()

    const chainMap: Map<FilterChain, Token[]> = new Map()
    const allTokens: Token[] = []

    for (const token of tokens) {
      allTokens.push(token)

      const chainTokens = chainMap.get(token.chain)
      if (chainTokens) {
        chainTokens.push(token)
      } else {
        chainMap.set(token.chain, [token])
      }
    }

    chainMap.set(Filter.All, allTokens)

    return chainMap
  }, [tokens])

  const chains = useMemo(() => {
    return Array.from(chainMap.keys()).sort((a, b) => {
      if (a === Filter.All) return -1
      if (b === Filter.All) return 1
      return chainLabel(a)?.localeCompare(chainLabel(b))
    })
  }, [chainMap])

  const chainTokens = useMemo(() => {
    const tokens = chainMap.get(selectedChain) || []
    const query = searchQuery.toLowerCase()

    const filteredTokens = () => {
      if (!searchQuery) {
        if (selectedChain === Filter.All) {
          return tokens.filter(token => FEATURED_TOKENS.includes(token.identifier))
        } else {
          return tokens
        }
      }

      return tokens.filter(token => {
        const ticker = token.ticker.toLowerCase()
        const name = (token.name || '').toLowerCase()

        return ticker.includes(query) || name.includes(query)
      })
    }

    return filteredTokens().sort((a, b) => {
      const aTickerLower = a.ticker.toLowerCase()
      const bTickerLower = b.ticker.toLowerCase()

      const getPriority = (token: Token) => {
        if (query) {
          const ticker = token.ticker.toLowerCase()

          if (ticker === query) return 1
          if (ticker.startsWith(query)) return 2
          if (ticker.includes(query)) return 3

          const name = (token.name || '').toLowerCase()

          if (name.startsWith(query)) return 4
          if (name.includes(query)) return 5
        }

        const isFeatured = FEATURED_TOKENS.includes(token.identifier)

        if (isFeatured) return 6

        return 7
      }

      const aPriority = getPriority(a)
      const bPriority = getPriority(b)

      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      return aTickerLower.localeCompare(bTickerLower)
    })
  }, [chainMap, selectedChain, searchQuery])

  const handleChainSelect = (chain: FilterChain) => {
    setSelectedChain(chain)
  }

  const handleTokenSelect = (token: Token) => {
    onSelectAsset(token)
    onOpenChange(false)
  }

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: chainTokens.length,
    getScrollElement: () => {
      return parentRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    },
    estimateSize: () => 70,
    overscan: 5
  })

  useEffect(() => {
    const ref = parentRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
    if (ref) {
      ref.scrollTop = 0
    }
  }, [chainTokens])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        virtualizer.measure()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen, virtualizer])

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent className={cn('flex max-h-5/6 flex-col', !isMobile && 'sm:max-w-2xl')}>
        <CredenzaHeader>
          <CredenzaTitle>Select coin</CredenzaTitle>
        </CredenzaHeader>

        <div className={cn('flex min-h-0 flex-1', isMobile ? 'flex-col' : 'flex-row')}>
          <ScrollArea className={cn(isMobile ? 'border-b' : 'mr-8 w-2/5 border-r border-b-0 pl-8')}>
            <div className={cn(isMobile ? 'mx-4 mb-4 flex w-max gap-2' : 'mx-0 mb-8 block w-full')}>
              {chains.map((chain, index) => (
                <div
                  key={index}
                  onClick={() => handleChainSelect(chain)}
                  className={cn(
                    'm-0 flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800',
                    !isMobile && 'mr-10 mb-2 py-3',
                    selectedChain === chain && 'border-blue-500'
                  )}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full">
                    <Image
                      src={chain === Filter.All ? '/icons/windows.svg' : `/networks/${chain.toLowerCase()}.svg`}
                      alt=""
                      width="24"
                      height="24"
                    />
                  </div>
                  <span className="text-sm">{chain === Filter.All ? 'All Chains' : chainLabel(chain)}</span>
                </div>
              ))}
            </div>
            {isMobile && <ScrollBar orientation="horizontal" />}
          </ScrollArea>

          <div className={cn('flex min-h-0 flex-1 flex-col', isMobile ? 'mt-2' : 'mt-0')}>
            <div className={cn('relative', isMobile ? 'mx-4' : 'mr-8 ml-0')}>
              <Search className="absolute top-1/2 left-4 -translate-y-1/2 transform text-slate-400" size={24} />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-3xl border-slate-200 py-3 pl-12"
                tabIndex={isMobile ? -1 : 0}
              />
            </div>

            <div className="mt-4 flex min-h-0 flex-1">
              <ScrollArea className="flex-1" ref={parentRef}>
                <div
                  style={{
                    height: `${virtualizer.getTotalSize() + 20}px`,
                    width: '100%',
                    position: 'relative'
                  }}
                >
                  {virtualizer.getVirtualItems().map(virtualItem => {
                    const token = chainTokens[virtualItem.index]

                    return (
                      <div
                        key={virtualItem.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`
                        }}
                      >
                        <div
                          onClick={() => handleTokenSelect(token)}
                          className={cn(
                            'flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800',
                            isMobile ? 'mx-4' : 'mr-8 ml-0'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <AssetIcon key={token.identifier} token={token} />
                            <div className="text-left">
                              <div className="max-w-30 truncate font-semibold">{token.ticker}</div>
                              <div className="text-sm text-slate-500">{chainLabel(token.chain)}</div>
                            </div>
                          </div>
                          {token.identifier === selected?.identifier && (
                            <div className="rounded-full border border-slate-300 px-1.5 py-0.5 text-xs font-medium text-slate-500">
                              Selected
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  )
}
