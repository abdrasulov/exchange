import axios from 'axios'
import { NextRequest } from 'next/server'
import { createSignature, getCompanyApplicantData } from '@/lib/sumsub'

axios.interceptors.request.use(createSignature, function (error) {
  return Promise.reject(error)
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return Response.json({ error: 'userId is required' }, { status: 400 })
  }

  const externalUserId = userId

  let error: string | null = null
  let verified: boolean
  let reviewStatus: string | null = null
  let reviewResult: any = null

  try {
    const response = await axios(getCompanyApplicantData(externalUserId))
    console.log('Business verification response', response.data)

    reviewStatus = response.data.review?.reviewStatus
    reviewResult = response.data.review?.reviewResult

    // KYB is verified when review is completed and the result is approved
    verified = reviewStatus === 'completed' && reviewResult?.reviewAnswer === 'GREEN'
  } catch (err: any) {
    error = err.response?.data?.message || 'Failed to fetch business verification status'
    console.error(error)

    verified = false
  }

  return Response.json({
    verified,
    reviewStatus,
    reviewResult: reviewResult ? {
      reviewAnswer: reviewResult.reviewAnswer,
      rejectLabels: reviewResult.rejectLabels,
      reviewRejectType: reviewResult.reviewRejectType
    } : null
  })
}
