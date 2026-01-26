'use client'

import { useTurnkey } from '@turnkey/react-wallet-kit'
import { IdentityStatus } from '@/components/identity-status'
import { BusinessIdentityStatus } from '@/components/business-identity-status'
import { v1User } from '@turnkey/sdk-types'

interface SidebarProps {
  user: v1User
}

export function MainSidebar({ user }: SidebarProps) {
  const { logout, deleteSubOrganization } = useTurnkey()

  const handleLogout = async () => {
    try {
      await logout()
      // Handle successful logout (e.g., redirect to login page)
      console.log('Logged out successfully')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      if (window.confirm('Are you sure you want to perform this action?')) {
        // User confirmed, proceed with the action
        await deleteSubOrganization({ deleteWithoutExport: true })
        await logout()
        // Handle successful logout (e.g., redirect to login page)
        console.log('Action confirmed!')
      } else {
        // User canceled
        console.log('Action canceled.')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="space-y-8 lg:col-span-1">
      <section className="rounded-2xl border border-neutral-200 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-lg dark:border-neutral-700">
            <img
              alt="Profile"
              src="https://placehold.co/150x150/262626/FFFFFF/png?text=U"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{user.userName}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.userEmail}</p>
        </div>
        <div className="mt-8 space-y-3">
          <button
            onClick={handleLogout}
            type="submit"
            className="flex w-full items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              id="Windframe_mxV33UPUo"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            Log out
          </button>
          <button
            onClick={handleDeleteAccount}
            type="submit"
            className="flex w-full items-center justify-center rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
          >
            Delete Account
          </button>
        </div>
      </section>
      <IdentityStatus user={user} />
      <BusinessIdentityStatus user={user} />
    </div>
  )
}
