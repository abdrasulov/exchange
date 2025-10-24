import {useTurnkey} from "@turnkey/react-wallet-kit";
import {CreateWalletButton} from "@/app/createWalletButton";
import Link from "next/link";

function LogoutButton() {
    const {logout} = useTurnkey();

    const handleLogout = async () => {
        try {
            await logout();
            // Handle successful logout (e.g., redirect to login page)
            console.log('Logged out successfully');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <button onClick={handleLogout} className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Logout
        </button>
    );
}

function VerifyButton({userId}: { userId: string }) {
    return (
        <Link
            href={`/verify?userId=${userId}`}
            className="w-full py-2 text-center border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
            Complete KYC
        </Link>
    );
}

export function UserPage() {
    const {user, wallets} = useTurnkey();

    if (!user) {
        return (
            <div>Loading</div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6 space-x-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 w-80">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">User Profile</h2>
                <div className="mt-4 text-left">
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">Username:</span> {user.userName}
                    </p>
                    <p className="text-gray-600 mt-2">
                        <span className="font-semibold text-gray-800">Email:</span> {user.userEmail}
                    </p>
                </div>
                <div className="mt-6 flex flex-col space-y-3">
                    <VerifyButton userId={user.userId}/>
                    <LogoutButton/>
                </div>
            </div>

            {/* Wallets Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Wallets</h3>

                {wallets && wallets.length > 0 ? (
                    <div className="space-y-4">
                        {wallets.map((wallet) => (
                            <div
                                key={wallet.walletName}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                            >
                                <div className="text-lg font-medium text-gray-800 mb-2">
                                    {wallet.walletName}
                                </div>
                                <div className="space-y-1">
                                    {wallet.accounts.map((account) => (
                                        <div
                                            key={account.address}
                                            className="text-sm font-mono text-gray-600 break-all">
                                            <div className="font-semibold text-gray-700">
                                              {account.addressFormat}:
                                            </div>
                                            {account.address}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-500">No wallets found.</p>
                        <CreateWalletButton/>
                    </div>
                )}
            </div>

        </div>
    );
}