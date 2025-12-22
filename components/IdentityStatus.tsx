'use client';
import axios from "axios";
import {v1User} from "@turnkey/sdk-types";
import {useState} from "react";
import Link from "next/link";

interface IdentityStatusProps {
  user: v1User
}

function Verified() {
  return <section
    className="rounded-2xl bg-white/60 shadow-sm dark:bg-neutral-900/40 group relative overflow-hidden border border-neutral-200 backdrop-blur-xl transition-all hover:shadow-md dark:border-neutral-800">
    <div
      className="bg-gradient-to-b absolute inset-0 -z-10 from-neutral-50/50 to-transparent dark:from-neutral-800/20"></div>
    <div className="p-6">
      <div className="mb-4 items-center justify-between flex">
        <p className="font-semibold text-neutral-900 dark:text-white">Identity Status</p>
        <span
          className="items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 inline-flex ring-1 ring-inset ring-green-600/20 dark:text-green-400 dark:ring-green-500/30">Verified</span>
      </div>
      <div
        className="mx-auto mb-6 h-40 w-full items-center justify-center rounded-xl bg-neutral-50/50 dark:bg-neutral-800/30 relative flex flex-col border border-neutral-200 dark:border-neutral-700/50">
        <div
          className="w-48 rounded-lg bg-white shadow-xl dark:bg-neutral-900 relative z-10 border border-neutral-200 p-3 dark:border-neutral-700">
          <div className="mb-3 items-center pb-2 flex gap-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-800"></div>
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
              <div className="h-1.5 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="items-center flex gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className="h-1.5 w-3/4 rounded-full bg-green-500/50"></div>
              </div>
            </div>
            <div className="h-12 w-full bg-neutral-50 dark:bg-neutral-800 rounded p-2">
              <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
              <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
          </div>
          <div
            className="h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-lg absolute -right-2 -top-2 flex ring-2 ring-white dark:ring-neutral-900">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
                 id="Windframe_VBJe6WLjV">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        <div
          className="rounded-xl bg-white/50 dark:bg-neutral-800/50 absolute inset-x-8 bottom-4 top-8 -z-10 border border-neutral-200 dark:border-neutral-700"></div>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">Your identity has been verified.</p>
    </div>
  </section>;
}

interface NonVerifiedProps {
  userId: string
}

function NonVerified({userId}: NonVerifiedProps) {
  return <section
    className="rounded-2xl bg-white/60 shadow-sm dark:bg-neutral-900/40 group relative overflow-hidden border border-neutral-200 backdrop-blur-xl transition-all hover:shadow-md dark:border-neutral-800">
    <div
      className="bg-gradient-to-b absolute inset-0 -z-10 from-neutral-50/50 to-transparent dark:from-neutral-800/20"></div>

    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-neutral-900 dark:text-white">
          Identity Status
        </p>

        <span
          className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1
                   text-xs font-medium text-yellow-700 ring-1 ring-inset
                   ring-yellow-600/20 dark:bg-yellow-900/30
                   dark:text-yellow-400 dark:ring-yellow-500/30"
        >
        Not verified
      </span>
      </div>

      <div
        className="relative mx-auto mb-6 flex h-40 w-full flex-col
                 items-center justify-center rounded-xl bg-neutral-50/50
                 dark:bg-neutral-800/30 border border-neutral-200
                 dark:border-neutral-700/50"
      >
        <div
          className="relative z-10 w-48 rounded-lg bg-white p-3 shadow-xl
                   border border-neutral-200 dark:bg-neutral-900
                   dark:border-neutral-700"
        >
          <div
            className="mb-3 flex items-center gap-2 border-b
                     border-neutral-100 pb-2 dark:border-neutral-800"
          >
            <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
              <div className="h-1.5 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800"></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full bg-yellow-400
                         shadow-[0_0_8px_rgba(250,204,21,0.6)]"
              ></div>

              <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className="h-1.5 w-1/3 rounded-full bg-yellow-400/60"></div>
              </div>
            </div>

            <div className="h-12 w-full rounded bg-neutral-50 p-2 dark:bg-neutral-800">
              <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
              <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
          </div>

          <div
            className="absolute -right-2 -top-2 flex h-6 w-6
                     items-center justify-center rounded-full
                     bg-yellow-400 text-white shadow-lg
                     ring-2 ring-white dark:ring-neutral-900"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01"
              />
            </svg>
          </div>
        </div>

        <div
          className="absolute inset-x-8 bottom-4 top-8 -z-10
                   rounded-xl bg-white/50 border
                   border-neutral-200 dark:bg-neutral-800/50
                   dark:border-neutral-700"
        ></div>
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Your identity has not been verified yet.
      </p>
      <div className="mt-8 space-y-3">
        <Link
          target="_blank"
          href={`/verify?userId=${userId}`}
          type="submit"
          className="flex border border-neutral-200 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700 w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm dark:bg-neutral-800">
          Complete KYC
        </Link>
      </div>
    </div>
  </section>;
}

function StatusLoading() {
  return <section
    className="rounded-2xl bg-white/60 shadow-sm dark:bg-neutral-900/40 group relative overflow-hidden border border-neutral-200 backdrop-blur-xl transition-all hover:shadow-md dark:border-neutral-800">
    <div
      className="bg-gradient-to-b absolute inset-0 -z-10 from-neutral-50/50 to-transparent dark:from-neutral-800/20"></div>

    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-neutral-900 dark:text-white">
          Identity Status
        </p>

        <span
          className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1
                   text-xs font-medium text-neutral-600 ring-1 ring-inset
                   ring-neutral-300 dark:bg-neutral-800
                   dark:text-neutral-400 dark:ring-neutral-700"
        >
        Checking…
      </span>
      </div>

      <div
        className="relative mx-auto mb-6 flex h-40 w-full
                 items-center justify-center rounded-xl
                 bg-neutral-50/50 dark:bg-neutral-800/30
                 border border-neutral-200 dark:border-neutral-700/50"
      >
        {/* Spinner */}
        <svg
          className="h-8 w-8 animate-spin text-neutral-400 dark:text-neutral-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>

      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Checking your verification status…
      </p>
    </div>
  </section>
}

export default function IdentityStatus({user}: IdentityStatusProps) {
  const [verified, setVerified] = useState<boolean | null>(null);

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
    <>
      {verified === true ? <Verified/> : null}
      {verified === false ? <NonVerified userId={user.userId} /> : null}
      {verified === null ? <StatusLoading/> : null}
    </>
  );
}
