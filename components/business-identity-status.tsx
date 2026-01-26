'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { v1User } from '@turnkey/sdk-types'
import { BusinessVerificationResponse, fetchBusinessVerificationStatus } from '@/lib/api'

interface BusinessIdentityStatusProps {
  user: v1User
}

function Verified() {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/60 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-50/50 to-transparent dark:from-neutral-800/20"></div>
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-neutral-900 dark:text-white">Business Verification</p>
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/30">
            Verified
          </span>
        </div>
        <div className="relative mx-auto mb-6 flex h-40 w-full flex-col items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-700/50 dark:bg-neutral-800/30">
          <div className="relative z-10 w-48 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-3 flex items-center gap-2 border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800">
                <svg
                  className="h-4 w-4 text-neutral-600 dark:text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-1.5 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className="h-1.5 w-3/4 rounded-full bg-green-500/50"></div>
                </div>
              </div>
              <div className="h-12 w-full rounded bg-neutral-50 p-2 dark:bg-neutral-800">
                <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-lg ring-2 ring-white dark:ring-neutral-900">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div className="absolute inset-x-8 top-8 bottom-4 -z-10 rounded-xl border border-neutral-200 bg-white/50 dark:border-neutral-700 dark:bg-neutral-800/50"></div>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Your business has been verified.</p>
      </div>
    </section>
  )
}

interface PendingProps {
  reviewStatus: string | null
}

function Pending({ reviewStatus }: PendingProps) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/60 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-50/50 to-transparent dark:from-neutral-800/20"></div>
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-neutral-900 dark:text-white">Business Verification</p>
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 ring-inset dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500/30">
            {reviewStatus === 'pending' ? 'Under Review' : 'In Progress'}
          </span>
        </div>
        <div className="relative mx-auto mb-6 flex h-40 w-full flex-col items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-700/50 dark:bg-neutral-800/30">
          <svg
            className="h-12 w-12 animate-spin text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Your business verification is being reviewed. This may take a few business days.
        </p>
      </div>
    </section>
  )
}

interface RejectedProps {
  userId: string
  rejectLabels?: string[]
}

function Rejected({ userId, rejectLabels }: RejectedProps) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/60 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-50/50 to-transparent dark:from-neutral-800/20"></div>
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-neutral-900 dark:text-white">Business Verification</p>
          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/20 ring-inset dark:bg-red-900/30 dark:text-red-400 dark:ring-red-500/30">
            Rejected
          </span>
        </div>
        <div className="relative mx-auto mb-6 flex h-40 w-full flex-col items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-700/50 dark:bg-neutral-800/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        {rejectLabels && rejectLabels.length > 0 && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">Reason: {rejectLabels.join(', ')}</p>
        )}
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Your business verification was not approved. Please try again with correct documents.
        </p>
        <div className="mt-8 space-y-3">
          <Link
            target="_blank"
            href={`/verify-business?userId=${userId}`}
            className="flex w-full items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            Retry KYB Verification
          </Link>
        </div>
      </div>
    </section>
  )
}

interface NonVerifiedProps {
  userId: string
}

function NonVerified({ userId }: NonVerifiedProps) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/60 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-50/50 to-transparent dark:from-neutral-800/20"></div>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-neutral-900 dark:text-white">Business Verification</p>

          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-yellow-600/20 ring-inset dark:bg-yellow-900/30 dark:text-yellow-400 dark:ring-yellow-500/30">
            Not verified
          </span>
        </div>

        <div className="relative mx-auto mb-6 flex h-40 w-full flex-col items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-700/50 dark:bg-neutral-800/30">
          <div className="relative z-10 w-48 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mb-3 flex items-center gap-2 border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-200 dark:bg-neutral-700">
                <svg
                  className="h-4 w-4 text-neutral-500 dark:text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-1.5 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>

                <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className="h-1.5 w-1/3 rounded-full bg-yellow-400/60"></div>
                </div>
              </div>

              <div className="h-12 w-full rounded bg-neutral-50 p-2 dark:bg-neutral-800">
                <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="mx-auto mt-1 h-1 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
              </div>
            </div>

            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-white shadow-lg ring-2 ring-white dark:ring-neutral-900">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
              </svg>
            </div>
          </div>

          <div className="absolute inset-x-8 top-8 bottom-4 -z-10 rounded-xl border border-neutral-200 bg-white/50 dark:border-neutral-700 dark:bg-neutral-800/50"></div>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400">Your business has not been verified yet.</p>
        <div className="mt-8 space-y-3">
          <Link
            target="_blank"
            href={`/verify-business?userId=${userId}`}
            className="flex w-full items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            Complete KYB
          </Link>
        </div>
      </div>
    </section>
  )
}

function StatusLoading() {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/60 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-50/50 to-transparent dark:from-neutral-800/20"></div>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-neutral-900 dark:text-white">Business Verification</p>

          <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 ring-1 ring-neutral-300 ring-inset dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700">
            Checking...
          </span>
        </div>

        <div className="relative mx-auto mb-6 flex h-40 w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-700/50 dark:bg-neutral-800/30">
          <svg
            className="h-8 w-8 animate-spin text-neutral-400 dark:text-neutral-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400">Checking your business verification status...</p>
      </div>
    </section>
  )
}

export function BusinessIdentityStatus({ user }: BusinessIdentityStatusProps) {
  const [status, setStatus] = useState<BusinessVerificationResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBusinessVerificationStatus(user.userId)
      .then(response => {
        setStatus(response)
        setLoading(false)
      })
      .catch(error => {
        console.error(error)
        setStatus({ verified: false, reviewStatus: null, reviewResult: null })
        setLoading(false)
      })
  }, [user.userId])

  if (loading) {
    return <StatusLoading />
  }

  if (!status) {
    return <NonVerified userId={user.userId} />
  }

  // Verified
  if (status.verified) {
    return <Verified />
  }

  // Rejected
  if (status.reviewResult?.reviewAnswer === 'RED') {
    return <Rejected userId={user.userId} rejectLabels={status.reviewResult.rejectLabels} />
  }

  // Pending review
  if (status.reviewStatus === 'pending' || status.reviewStatus === 'queued' || status.reviewStatus === 'onHold') {
    return <Pending reviewStatus={status.reviewStatus} />
  }

  // Not started
  return <NonVerified userId={user.userId} />
}
