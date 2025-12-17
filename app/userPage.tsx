import {useTurnkey} from "@turnkey/react-wallet-kit";
import {CreateWalletButton} from "@/app/createWalletButton";
import Link from "next/link";
import axios from "axios";
import {useState} from "react";
import {Balances} from "@/app/balances";

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

function DeleteAccountButton() {
    const {logout, deleteSubOrganization} = useTurnkey();

    const handleDeleteAccount = async () => {
        try {
            if (window.confirm('Are you sure you want to perform this action?')) {
                // User confirmed, proceed with the action
                await deleteSubOrganization({deleteWithoutExport: true});
                await logout();
                // Handle successful logout (e.g., redirect to login page)
                console.log('Action confirmed!');
            } else {
                // User canceled
                console.log('Action canceled.');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <button onClick={handleDeleteAccount} className="mt-6 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition">
            Delete Account
        </button>
    );
}

function VerifyButton({userId}: { userId: string }) {
    return (
        <Link
            target="_blank"
            href={`/verify?userId=${userId}`}
            className="w-full py-2 text-center border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
            Complete KYC
        </Link>
    );
}

export function UserPage() {
    const {user, wallets} = useTurnkey();
    const [verified, setVerified] = useState<boolean | null>(null);

    if (!user) {
        return (
            <div>Loading</div>
        )
    }

    axios.get(`/api/verification/?userId=${user.userId}`)
        .then((response) => {
            console.log(response.data.verified);
            setVerified(response.data.verified);
        })
        .catch((error) => {
            console.error(error);
            setVerified(false)
        })

    return (
        <div className="flex justify-center min-h-screen bg-gray-50 p-6 space-x-6">
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
                    <LogoutButton/>
                    <DeleteAccountButton/>
                </div>
            </div>

            {/* Wallets Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 min-w-80">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Wallets</h2>

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
                                            <Balances account={account}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}


                        <Link href={"swap"}>
                            Swap
                        </Link>

                    </div>
                ) : (
                    <div>
                        <p className="text-gray-500">No wallets found.</p>
                        <CreateWalletButton/>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 w-80">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Verification</h2>
                <div className="mt-4 text-left">
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">Status: </span>
                        {verified === true ? <span>Account Verified</span> : null}
                        {verified === false ? <span>Account Not Verified</span> : null}
                        {verified === null ? <span>Loading...</span> : null}
                    </p>
                </div>
                <div className="mt-6 flex flex-col space-y-3">
                    {verified === false ? <VerifyButton userId={user.userId}/> : null}
                </div>
            </div>

        </div>
    );
}