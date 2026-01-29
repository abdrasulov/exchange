import axios from 'axios'
import { NextRequest } from 'next/server'
import { createSignature, getApplicantData } from '@/lib/sumsub'

axios.interceptors.request.use(createSignature, function (error) {
  return Promise.reject(error)
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')

  let error: string | null = null
  let verified: boolean

  try {
    const response = await axios(getApplicantData(userId))
    console.log('verification response', response.data)

    verified = response.data.review.reviewStatus == 'completed'
  } catch (err: any) {
    error = err.response?.data?.message || 'Failed to fetch token'
    console.error(error)

    verified = false
  }

  return Response.json({ verified: verified })
}
