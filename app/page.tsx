'use client'

import { AuthState, useTurnkey } from '@turnkey/react-wallet-kit'
import { UserPage } from '@/components/UserPage'
import { GuestPage } from '@/components/GuestPage'

export default function Home() {
  const { authState } = useTurnkey()

  return authState === AuthState.Authenticated ? <UserPage /> : <GuestPage />
}
