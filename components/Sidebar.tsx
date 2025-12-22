'use client';
import IdentityStatus from "@/components/IdentityStatus";
import {v1User} from "@turnkey/sdk-types";
import {useTurnkey} from "@turnkey/react-wallet-kit";

interface SidebarProps {
  user: v1User
}

export default function Sidebar({user}: SidebarProps) {
  const {logout, deleteSubOrganization} = useTurnkey();

  const handleLogout = async () => {
    try {
      await logout();
      // Handle successful logout (e.g., redirect to login page)
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
    <div className="lg:col-span-1 space-y-8">
      <section
        className="rounded-2xl bg-white/60 shadow-sm dark:bg-neutral-900/40 border border-neutral-200 p-6 backdrop-blur-xl dark:border-neutral-800">
        <div className="items-center text-center flex flex-col">
          <div
            className="mb-4 h-20 w-20 rounded-full shadow-lg relative overflow-hidden border-2 border-white dark:border-neutral-700">
            <img alt="Profile" src="https://placehold.co/150x150/262626/FFFFFF/png?text=U"
                 className="object-cover h-full w-full"/>
          </div>
          <p className="text-xl font-semibold text-neutral-900 dark:text-white">{user.userName}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.userEmail}</p>
        </div>
        <div className="mt-8 space-y-3">
          <button
            onClick={handleLogout}
            type="submit"
                  className="flex border border-neutral-200 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700 w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm dark:bg-neutral-800">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                 id="Windframe_mxV33UPUo">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Log out
          </button>
          <button
            onClick={handleDeleteAccount}
            type="submit"
            className="flex border border-transparent transition-all hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-red-600">Delete
            Account
          </button>
        </div>
      </section>
      <IdentityStatus user={user}/>
    </div>
  );
}
