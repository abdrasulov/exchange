'use client'

import { useEffect } from 'react'

interface SumsubWidgetProps {
  accessToken: string
  applicantEmail?: string
  applicantPhone?: string
}

export default function SumsubWidget({ accessToken, applicantEmail, applicantPhone }: SumsubWidgetProps) {
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
            console.log('onStepCompleted', payload)
          })
          .on('idCheck.onError', (error: any) => {
            console.log('onError', error)
          })
          .onMessage((type: string, payload: any) => {
            console.log('onMessage', type, payload)
          })
          .build()

        snsWebSdk.launch('#sumsub-websdk-container')
      }
    }

    document.body.appendChild(script)
  }, [accessToken, applicantEmail, applicantPhone])

  // Requests a new access token from backend (dummy placeholder)
  function getNewAccessToken() {
    // You can replace this with your own API call
    return Promise.resolve('NEW_ACCESS_TOKEN_PLACEHOLDER')
  }

  return <div id="sumsub-websdk-container" />
}
