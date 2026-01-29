'use client'

import { useCallback, useEffect, useState } from 'react'
import SumsubWebSdk from '@sumsub/websdk-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useBusinessVerificationStore } from '@/stores/business-verification-store'
import { fetchBusinessVerificationStatus } from '@/lib/api'

interface BusinessVerificationModalProps {
  userId: string
}

export function BusinessVerificationModal({ userId }: BusinessVerificationModalProps) {
  const { isModalOpen, closeModal, setStatus, setReviewResult, setIsLoading } = useBusinessVerificationStore()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch access token when modal opens
  useEffect(() => {
    if (!isModalOpen) {
      setAccessToken(null)
      setError(null)
      return
    }

    async function fetchToken() {
      try {
        const response = await fetch(`/api/kyb-access-token?userId=${userId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get access token')
        }

        setAccessToken(data.token)
      } catch (err: any) {
        setError(err.message)
      }
    }

    fetchToken()
  }, [isModalOpen, userId])

  // Refresh status from API
  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetchBusinessVerificationStatus(userId)

      if (response.verified) {
        setStatus('verified')
      } else {
        setStatus('idle')
      }
    } catch (err) {
      console.error('Failed to refresh status:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, setStatus, setIsLoading])

  // Get new access token for SDK refresh
  const getNewAccessToken = useCallback(async () => {
    try {
      const response = await fetch(`/api/kyb-access-token?userId=${userId}`)
      const data = await response.json()
      return data.token
    } catch (err) {
      console.error('Failed to refresh token:', err)
      return null
    }
  }, [userId])

  // SDK event handlers
  const handleError = useCallback((error: any) => {
    console.error('KYB SDK error:', error)
  }, [])

  const handleMessage = useCallback(
    (type: string, payload: any) => {
      console.log('KYB message:', type, payload)

      // Handle different event types
      switch (type) {
        case 'idCheck.onApplicantStatusChanged':
          if (payload?.reviewStatus === 'completed') {
            if (payload?.reviewResult?.reviewAnswer === 'GREEN') {
              setStatus('verified')
              closeModal()
            } else if (payload?.reviewResult?.reviewAnswer === 'RED') {
              setStatus('rejected')
              setReviewResult(payload.reviewResult)
            }
          } else if (payload?.reviewStatus === 'pending' || payload?.reviewStatus === 'queued') {
            setStatus('pending')
          }
          break

        case 'idCheck.onApplicantSubmitted':
          console.log('KYB applicant submitted')
          setStatus('pending')
          setTimeout(refreshStatus, 2000)
          break

        case 'idCheck.onApplicantResubmitted':
          console.log('KYB applicant resubmitted')
          setStatus('pending')
          setTimeout(refreshStatus, 2000)
          break

        case 'idCheck.onApplicantLoaded':
          console.log('KYB applicant loaded:', payload)
          break

        case 'idCheck.stepCompleted':
          console.log('KYB step completed:', payload)
          break
      }
    },
    [setStatus, setReviewResult, closeModal, refreshStatus]
  )

  return (
    <Dialog open={isModalOpen} onOpenChange={open => !open && closeModal()}>
      <DialogContent className="h-[90vh] max-w-3xl" showCloseButton={true}>
        <div className="flex h-full flex-col overflow-hidden">
          <div className="border-b border-neutral-200 p-6 dark:border-neutral-800">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Business Verification</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Complete your business verification to unlock all features
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            {error ? (
              <div className="flex h-full items-center justify-center p-6">
                <div className="text-center">
                  <p className="mb-4 text-red-500">{error}</p>
                  <button
                    onClick={() => {
                      setError(null)
                      setAccessToken(null)
                    }}
                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : !accessToken ? (
              <div className="flex h-full items-center justify-center">
                <svg
                  className="h-8 w-8 animate-spin text-neutral-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
            ) : (
              <SumsubWebSdk
                accessToken={accessToken}
                expirationHandler={getNewAccessToken}
                config={{
                  lang: 'en'
                }}
                options={{
                  addViewportTag: false,
                  adaptIframeHeight: true
                }}
                onMessage={handleMessage}
                onError={handleError}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
