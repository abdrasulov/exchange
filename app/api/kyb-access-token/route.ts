import axios from 'axios'
import { NextRequest } from 'next/server'
import { createKYBAccessToken, createSignature } from '@/lib/sumsub'

axios.interceptors.request.use(createSignature, function (error) {
  return Promise.reject(error)
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const levelName = searchParams.get('levelName')

  if (!userId) {
    return Response.json({ error: 'userId is required' }, { status: 400 })
  }

  // Use company-specific externalUserId to separate from individual KYC
  const externalUserId = userId
  const kybLevelName = levelName || 'basic-kyb-level'

  try {
    const response = await axios(createKYBAccessToken(externalUserId, kybLevelName, 1200))
    return Response.json({ token: response.data.token })
  } catch (err: any) {
    const error = err.response?.data?.message || 'Failed to generate access token'
    console.error('KYB access token error:', error)
    return Response.json({ error }, { status: 500 })
  }
}
