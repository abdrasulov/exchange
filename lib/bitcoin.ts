import * as bitcoin from 'bitcoinjs-lib'

type UTXO = {
  txid: string
  vout: number
  value: number
  script?: string
}

type CreateBtcSwapTxParams = {
  fromAddress: string
  toAddress: string
  amount: string // in BTC
  memo: string
  utxos: UTXO[]
}

const DUST_THRESHOLD = 546 // satoshis
const FEE_RATE = 10 // sat/vbyte - should be dynamic in production

export async function fetchUtxos(address: string): Promise<UTXO[]> {
  const response = await fetch(`https://blockstream.info/api/address/${address}/utxo`)
  if (!response.ok) {
    throw new Error('Failed to fetch UTXOs')
  }
  const utxos = await response.json()
  return utxos.map((utxo: any) => ({
    txid: utxo.txid,
    vout: utxo.vout,
    value: utxo.value
  }))
}

export function createBtcSwapPsbt(params: CreateBtcSwapTxParams): string {
  const { fromAddress, toAddress, amount, memo, utxos } = params

  const network = bitcoin.networks.bitcoin
  const psbt = new bitcoin.Psbt({ network })

  // Convert amount to satoshis
  const amountSats = Math.floor(parseFloat(amount) * 1e8)

  // Calculate total input value
  let totalInput = 0
  for (const utxo of utxos) {
    totalInput += utxo.value
  }

  // Estimate transaction size for fee calculation
  // ~148 bytes per input, ~34 bytes per output, ~10 bytes overhead
  // Plus ~80 bytes for OP_RETURN output
  const estimatedSize = utxos.length * 148 + 3 * 34 + 10 + 80
  const fee = estimatedSize * FEE_RATE

  const change = totalInput - amountSats - fee

  if (change < 0) {
    throw new Error('Insufficient funds for transaction and fees')
  }

  // Add inputs
  for (const utxo of utxos) {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: utxo.script ? {
        script: Buffer.from(utxo.script, 'hex'),
        value: BigInt(utxo.value)
      } : undefined
    })
  }

  // Add main output (to inbound address)
  psbt.addOutput({
    address: toAddress,
    value: BigInt(amountSats)
  })

  // Add OP_RETURN output with memo
  const memoBuffer = Buffer.from(memo, 'utf8')
  const opReturnScript = bitcoin.script.compile([
    bitcoin.opcodes.OP_RETURN,
    memoBuffer
  ])
  psbt.addOutput({
    script: opReturnScript,
    value: BigInt(0)
  })

  // Add change output if above dust threshold
  if (change > DUST_THRESHOLD) {
    psbt.addOutput({
      address: fromAddress,
      value: BigInt(change)
    })
  }

  // Return PSBT as base64
  return psbt.toBase64()
}

export function btcToSatoshis(btc: string): number {
  return Math.floor(parseFloat(btc) * 1e8)
}

export function satoshisToBtc(satoshis: number): string {
  return (satoshis / 1e8).toFixed(8)
}