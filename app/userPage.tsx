import {useTurnkey} from "@turnkey/react-wallet-kit";

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

export function UserPage() {
    const {user} = useTurnkey();
    console.log(user);
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-80 text-center">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">User Profile</h2>
                <div className="mt-4 text-left">
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">Username:</span> {user?.userName}
                    </p>
                    <p className="text-gray-600 mt-2">
                        <span className="font-semibold text-gray-800">Email:</span> {user?.userEmail}
                    </p>
                </div>
                <LogoutButton/>
            </div>
        </div>
    );
}