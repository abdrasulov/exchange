import { useTurnkey } from '@turnkey/react-wallet-kit'

export function MainGuest() {
  const { handleLogin } = useTurnkey()

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={() => handleLogin()}
        type="button"
        className="flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-6 py-3 text-base font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
      >
        <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="Windframe_Login_Large">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12H3m12 0l-4-4m4 4l-4 4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Login or Sign Up
      </button>
    </div>
  )
}
