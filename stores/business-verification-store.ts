'use client'

import { create } from 'zustand'

export type BusinessVerificationStatus = 'idle' | 'pending' | 'verified' | 'rejected'

export interface BusinessVerificationState {
  status: BusinessVerificationStatus
  reviewResult: {
    reviewAnswer: string
    rejectLabels?: string[]
    reviewRejectType?: string
  } | null
  isLoading: boolean
  isModalOpen: boolean
  setStatus: (status: BusinessVerificationStatus) => void
  setReviewResult: (result: BusinessVerificationState['reviewResult']) => void
  setIsLoading: (loading: boolean) => void
  openModal: () => void
  closeModal: () => void
  reset: () => void
}

export const useBusinessVerificationStore = create<BusinessVerificationState>(set => ({
  status: 'idle',
  reviewResult: null,
  isLoading: true,
  isModalOpen: false,
  setStatus: status => set({ status }),
  setReviewResult: reviewResult => set({ reviewResult }),
  setIsLoading: isLoading => set({ isLoading }),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  reset: () =>
    set({
      status: 'idle',
      reviewResult: null,
      isLoading: true,
      isModalOpen: false
    })
}))
