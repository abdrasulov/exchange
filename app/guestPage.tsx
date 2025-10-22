import {useTurnkey} from "@turnkey/react-wallet-kit";

export function GuestPage() {
    const {handleLogin} = useTurnkey();
    return (
        <div
            className="flex items-center justify-center h-screen">
            <button onClick={handleLogin}
                    className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition">
                Log in
            </button>
        </div>
    );
}