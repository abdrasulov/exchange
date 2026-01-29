const crypto = require('crypto')
const FormData = require('form-data')

// These parameters should be used for all requests
const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY
const SUMSUB_BASE_URL = 'https://api.sumsub.com'

const config = {}
config.baseURL = SUMSUB_BASE_URL

export function createSignature(config) {
  console.log('Creating a signature for the request...')

  const ts = Math.floor(Date.now() / 1000)
  const signature = crypto.createHmac('sha256', SUMSUB_SECRET_KEY)
  signature.update(ts + config.method.toUpperCase() + config.url)

  if (config.data instanceof FormData) {
    signature.update(config.data.getBuffer())
  } else if (config.data) {
    signature.update(config.data)
  }

  config.headers['X-App-Access-Ts'] = ts
  config.headers['X-App-Access-Sig'] = signature.digest('hex')

  return config
}

export function getApplicantData(externalUserId) {
  console.log('Getting the applicant data...')

  const method = 'get'
  const url = `/resources/applicants/-;externalUserId=${externalUserId}/one`

  const headers = {
    Accept: 'application/json',
    'X-App-Token': SUMSUB_APP_TOKEN
  }

  config.method = method
  config.url = url
  config.headers = headers
  config.data = null

  return config
}

export function createAccessToken(externalUserId, levelName = 'basic-kyc-level', ttlInSecs = 600) {
  console.log('Creating an access token for initializng SDK...')

  const body = {
    userId: externalUserId,
    levelName: levelName,
    ttlInSecs: ttlInSecs
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-App-Token': SUMSUB_APP_TOKEN
  }

  config.method = 'post'
  config.url = '/resources/accessTokens/sdk'
  config.headers = headers
  config.data = JSON.stringify(body)

  return config
}

// ============ KYB Functions ============

export function createKYBAccessToken(externalUserId, levelName = 'basic-kyb-level', ttlInSecs = 600) {
  console.log('Creating a KYB access token for initializing SDK...')
  return createAccessToken(externalUserId, levelName, ttlInSecs)
}
