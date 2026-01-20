'use client'

import { AuthState, useTurnkey } from '@turnkey/react-wallet-kit'
import { Main } from '@/components/main/main'
import { MainGuest } from '@/components/main/main-guest'

export default function Home() {
  const { authState } = useTurnkey()

  return authState === AuthState.Authenticated ? <Main /> : <MainGuest />
}
