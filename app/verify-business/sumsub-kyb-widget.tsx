'use client'

import { useEffect } from 'react'

interface SumsubKYBWidgetProps {
  accessToken: string
  applicantEmail?: string
  applicantPhone?: string
}

export default function SumsubKYBWidget({ accessToken, applicantEmail, applicantPhone }: SumsubKYBWidgetProps) {
  useEffect(() => {
    // Dynamically load the Sumsub SDK
    const script = document.createElement('script')
    script.src = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js'
    script.async = true
    script.onload = () => {
      if (typeof window !== 'undefined' && (window as any).snsWebSdk) {
        const snsWebSdk = (window as any).snsWebSdk
          .init(accessToken, getNewAccessToken)
          .withConf({
            lang: 'en',
            email: applicantEmail,
            phone: applicantPhone
          })
          .withOptions({
            addViewportTag: false,
            adaptIframeHeight: true
          })
          .on('idCheck.onStepCompleted', (payload: any) => {
            console.log('KYB onStepCompleted', payload)
          })
          .on('idCheck.onApplicantLoaded', (payload: any) => {
            console.log('KYB onApplicantLoaded', payload)
          })
          .on('idCheck.onApplicantSubmitted', (payload: any) => {
            console.log('KYB onApplicantSubmitted', payload)
          })
          .on('idCheck.onApplicantResubmitted', (payload: any) => {
            console.log('KYB onApplicantResubmitted', payload)
          })
          .on('idCheck.onError', (error: any) => {
            console.log('KYB onError', error)
          })
          .onMessage((type: string, payload: any) => {
            console.log('KYB onMessage', type, payload)
          })
          .build()

        snsWebSdk.launch('#sumsub-kyb-container')
      }
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://static.sumsub.com/idensic/static/sns-websdk-builder.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [accessToken, applicantEmail, applicantPhone])

  // Requests a new access token from backend
  function getNewAccessToken() {
    // You can replace this with your own API call to refresh the KYB token
    return Promise.resolve('NEW_ACCESS_TOKEN_PLACEHOLDER')
  }

  return <div id="sumsub-kyb-container" />
}