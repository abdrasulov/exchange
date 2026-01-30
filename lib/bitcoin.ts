import { Transaction } from 'bitcoinjs-lib'
import { secp256k1 } from '@noble/curves/secp256k1'

type WitnessUtxo = {
  value: bigint
  script: Uint8Array
}

type SignResult = { r: string; s: string; v: string }
type SignFn = (sighashHex: string) => Promise<SignResult>

// --- Binary helpers ---

function readVarInt(buf: Uint8Array, offset: number): [number, number] {
  const first = buf[offset]
  if (first < 0xfd) return [first, offset + 1]
  if (first === 0xfd) return [buf[offset + 1] | (buf[offset + 2] << 8), offset + 3]
  if (first === 0xfe) {
    return [
      (buf[offset + 1] | (buf[offset + 2] << 8) | (buf[offset + 3] << 16) | (buf[offset + 4] << 24)) >>> 0,
      offset + 5
    ]
  }
  throw new Error('VarInt too large')
}

function readUint64LE(buf: Uint8Array, offset: number): bigint {
  let value = BigInt(0)
  for (let i = 0; i < 8; i++) {
    value |= BigInt(buf[offset + i]) << BigInt(i * 8)
  }
  return value
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// --- PSBT parsing ---

function parsePsbt(base64: string): { unsignedTx: Uint8Array; witnessUtxos: WitnessUtxo[] } {
  const buf = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

  if (buf[0] !== 0x70 || buf[1] !== 0x73 || buf[2] !== 0x62 || buf[3] !== 0x74 || buf[4] !== 0xff) {
    throw new Error('Invalid PSBT magic')
  }

  let offset = 5
  let unsignedTx: Uint8Array | null = null

  // Parse global key-value pairs
  while (offset < buf.length) {
    const [keyLen, kOff] = readVarInt(buf, offset)
    offset = kOff
    if (keyLen === 0) break

    const keyType = buf[offset]
    offset += keyLen

    const [valueLen, vOff] = readVarInt(buf, offset)
    offset = vOff

    if (keyType === 0x00) {
      unsignedTx = buf.slice(offset, offset + valueLen)
    }
    offset += valueLen
  }

  if (!unsignedTx) throw new Error('PSBT missing unsigned transaction')

  const tx = Transaction.fromBuffer(unsignedTx)
  const witnessUtxos: WitnessUtxo[] = []

  // Parse per-input sections
  for (let i = 0; i < tx.ins.length; i++) {
    let witnessUtxo: WitnessUtxo | null = null

    while (offset < buf.length) {
      const [keyLen, kOff] = readVarInt(buf, offset)
      offset = kOff
      if (keyLen === 0) break

      const keyType = buf[offset]
      offset += keyLen

      const [valueLen, vOff] = readVarInt(buf, offset)
      offset = vOff

      if (keyType === 0x01) {
        const value = readUint64LE(buf, offset)
        const [scriptLen, scriptOff] = readVarInt(buf, offset + 8)
        const script = buf.slice(scriptOff, scriptOff + scriptLen)
        witnessUtxo = { value, script }
      }
      offset += valueLen
    }

    if (!witnessUtxo) throw new Error(`Missing witness UTXO for input ${i}`)
    witnessUtxos.push(witnessUtxo)
  }

  return { unsignedTx, witnessUtxos }
}

// --- Signature helpers ---

const SECP256K1_ORDER = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141')

function normalizeS(s: bigint): bigint {
  return s > SECP256K1_ORDER / BigInt(2) ? SECP256K1_ORDER - s : s
}

function derEncodeSignature(rBytes: Uint8Array, sBytes: Uint8Array): Uint8Array {
  let r = rBytes
  while (r.length > 1 && r[0] === 0 && r[1] < 0x80) r = r.slice(1)
  if (r[0] >= 0x80) {
    const padded = new Uint8Array(r.length + 1)
    padded.set(r, 1)
    r = padded
  }

  let s = sBytes
  while (s.length > 1 && s[0] === 0 && s[1] < 0x80) s = s.slice(1)
  if (s[0] >= 0x80) {
    const padded = new Uint8Array(s.length + 1)
    padded.set(s, 1)
    s = padded
  }

  const totalLen = r.length + s.length + 4
  const der = new Uint8Array(totalLen + 2)
  der[0] = 0x30
  der[1] = totalLen
  der[2] = 0x02
  der[3] = r.length
  der.set(r, 4)
  der[4 + r.length] = 0x02
  der[5 + r.length] = s.length
  der.set(s, 6 + r.length)

  return der
}

function recoverPublicKey(msgHash: Uint8Array, rHex: string, sHex: string, vHex: string): Uint8Array {
  const r = BigInt('0x' + rHex)
  const s = normalizeS(BigInt('0x' + sHex))
  const v = parseInt(vHex, 16)
  const recoveryBit = v >= 27 ? v - 27 : v

  const sig = new secp256k1.Signature(r, s).addRecoveryBit(recoveryBit)
  return sig.recoverPublicKey(msgHash).toRawBytes(true)
}

/**
 * Signs a PSBT using an external signing function (e.g., Turnkey's signRawPayload).
 * Handles P2WPKH inputs with BIP143 sighash computation.
 * Returns the fully signed transaction as hex, ready for broadcast.
 */
export async function signPsbtWithExternalSigner(psbtBase64: string, signFn: SignFn): Promise<string> {
  const { unsignedTx, witnessUtxos } = parsePsbt(psbtBase64)
  const tx = Transaction.fromBuffer(unsignedTx)

  const SIGHASH_ALL = 1
  let pubkey: Uint8Array | null = null

  for (let i = 0; i < tx.ins.length; i++) {
    const { value, script } = witnessUtxos[i]

    // P2WPKH scriptPubKey: OP_0 (0x00) PUSH_20 (0x14) <20-byte pubkey-hash>
    if (script.length !== 22 || script[0] !== 0x00 || script[1] !== 0x14) {
      throw new Error(`Input ${i} is not P2WPKH`)
    }

    // Build script code for BIP143: OP_DUP OP_HASH160 <pubkey-hash> OP_EQUALVERIFY OP_CHECKSIG
    const pubkeyHash = script.slice(2)
    const scriptCode = new Uint8Array(25)
    scriptCode[0] = 0x76 // OP_DUP
    scriptCode[1] = 0xa9 // OP_HASH160
    scriptCode[2] = 0x14 // PUSH 20
    scriptCode.set(pubkeyHash, 3)
    scriptCode[23] = 0x88 // OP_EQUALVERIFY
    scriptCode[24] = 0xac // OP_CHECKSIG

    const sighash = tx.hashForWitnessV0(i, scriptCode, value, SIGHASH_ALL)

    const { r, s, v } = await signFn(bytesToHex(sighash))

    if (!pubkey) {
      pubkey = recoverPublicKey(sighash, r, s, v)
    }

    const sNorm = normalizeS(BigInt('0x' + s))
    const derSig = derEncodeSignature(hexToBytes(r.padStart(64, '0')), hexToBytes(sNorm.toString(16).padStart(64, '0')))

    // Append SIGHASH_ALL type byte
    const sigWithType = new Uint8Array(derSig.length + 1)
    sigWithType.set(derSig)
    sigWithType[derSig.length] = SIGHASH_ALL

    tx.setWitness(i, [sigWithType, pubkey])
  }

  return tx.toHex()
}
