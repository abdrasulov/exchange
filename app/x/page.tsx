'use client';
import MainLayout from "@/components/MainLayout";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import {useTurnkey} from "@turnkey/react-wallet-kit";

export default function Index() {
  const {user} = useTurnkey();

  return (
    <MainLayout>
      <header className="mb-10 items-center justify-between flex">
        <div>
          <p className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">Settings</p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Manage your profile, security, and assets.</p>
        </div>
        <div className="sm:block hidden">
          <span className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 inline-flex">
            <svg className="h-6 w-6 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" id="Windframe_EkDUhbk7O">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
          </span>
        </div>
      </header>
      <div className="lg:grid-cols-3 grid gap-8">
        {user && (
          <>
            <Sidebar user={user}/>
            <MainContent />
          </>
        )}
      </div>
    </MainLayout>
  );
}
