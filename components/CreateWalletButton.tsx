import { useTurnkey } from '@turnkey/react-wallet-kit'

export function CreateWalletButton() {
  const { createWallet } = useTurnkey()

  const handleCreateWallet = async () => {
    try {
      const walletId = await createWallet({
        walletName: 'My New Wallet',
        accounts: ['ADDRESS_FORMAT_ETHEREUM', 'ADDRESS_FORMAT_SOLANA'] // This will create one Ethereum and one Solana account within the wallet
      })
      console.log('Wallet created:', walletId)
    } catch (error) {
      console.error('Error creating wallet:', error)
    }
  }

  return (
    <button
      onClick={handleCreateWallet} // your create wallet handler
      type="button"
      className="flex w-full items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
    >
      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="Windframe_CreateWallet">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
      Create Wallet
    </button>
  )
}
