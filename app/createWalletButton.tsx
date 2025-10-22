import { useTurnkey } from "@turnkey/react-wallet-kit";

export function CreateWalletButton() {
    const { createWallet } = useTurnkey();

    const handleCreateWallet = async () => {
        try {
            const walletId = await createWallet({
                walletName: "My New Wallet",
                accounts: ["ADDRESS_FORMAT_ETHEREUM", "ADDRESS_FORMAT_SOLANA"], // This will create one Ethereum and one Solana account within the wallet
            });
            console.log("Wallet created:", walletId);
        } catch (error) {
            console.error("Error creating wallet:", error);
        }
    };

    return <button
        className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        onClick={handleCreateWallet}>
        Create Wallet
    </button>;
}