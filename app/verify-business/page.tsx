import axios from 'axios'
import { createKYBAccessToken, createSignature } from '@/lib/sumsub'
import SumsubKYBWidget from '@/app/verify-business/sumsub-kyb-widget'

axios.interceptors.request.use(createSignature, function (error) {
  return Promise.reject(error)
})

function PageError({ message }: { message: string }) {
  return <p className="mt-20 text-center text-red-500">{message}</p>
}

interface SearchParams {
  userId?: string
  levelName?: string
}

export default async function VerifyBusiness({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { userId, levelName } = await searchParams

  if (!userId) {
    return <PageError message={'No userId set'} />
  }

  const externalUserId = userId
  const kybLevelName = levelName || 'basic-kyb-level'

  let token: string | null = null
  let error: string | null = null

  try {
    const response = await axios(createKYBAccessToken(externalUserId, kybLevelName, 1200))
    token = response.data.token
  } catch (err: any) {
    error = err.response?.data?.message || 'Failed to fetch token'
  }

  if (!token) {
    return <PageError message={`Failed to load business verification, ${error}`} />
  }

  return <SumsubKYBWidget accessToken={token} />
}
