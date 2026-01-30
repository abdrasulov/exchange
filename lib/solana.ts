import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com'

type CreateSolSwapTxParams = {
  fromAddress: string
  toAddress: string
  amount: string // in SOL
  memo: string
}

export async function createSolSwapTransaction(params: CreateSolSwapTxParams): Promise<string> {
  const { fromAddress, toAddress, amount, memo } = params

  const connection = new Connection(SOLANA_RPC, 'confirmed')
  const fromPubkey = new PublicKey(fromAddress)
  const toPubkey = new PublicKey(toAddress)

  const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL)

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  const transferInstruction = SystemProgram.transfer({
    fromPubkey,
    toPubkey,
    lamports
  })

  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, 'utf8')
  })

  const transaction = new Transaction()
  transaction.add(transferInstruction)
  transaction.add(memoInstruction)
  transaction.recentBlockhash = blockhash
  transaction.lastValidBlockHeight = lastValidBlockHeight
  transaction.feePayer = fromPubkey

  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false
  })

  return Buffer.from(serialized).toString('base64')
}
