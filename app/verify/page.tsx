import axios from 'axios'
import { createAccessToken, createSignature } from '@/lib/sumsub'
import SumsubWidget from '@/app/verify/sumsub-widget'

axios.interceptors.request.use(createSignature, function (error) {
  return Promise.reject(error)
})

function PageError({ message }: { message: string }) {
  return <p className="mt-20 text-center text-red-500">{message}</p>
}

export default async function Verify({ searchParams }: { searchParams: Promise<{ userId?: string }> }) {
  const { userId } = await searchParams

  if (!userId) {
    return <PageError message={'No userId set'} />
  }

  const externalUserId = userId
  const levelName = 'id-only'

  let token: string | null = null
  let error: string | null = null

  try {
    const response = await axios(createAccessToken(externalUserId, levelName, 1200))
    token = response.data.token
  } catch (err: any) {
    error = err.response?.data?.message || 'Failed to fetch token'
  }

  if (!token) {
    return <PageError message={`Failed to load verification, ${error}`} />
  }

  return <SumsubWidget accessToken={token} />
}
