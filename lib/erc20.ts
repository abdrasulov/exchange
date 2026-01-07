import { ethers } from 'ethers'
import { Token } from './api'

/**
 * Check if a token is native (ETH, BNB, etc.) or ERC20
 */
export function isNativeToken(tokenMeta: Token): boolean {
  return tokenMeta.address === null
}

/**
 * Get current ERC20 allowance for a spender
 */
export async function getAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  rpcUrl: string
): Promise<bigint> {
  const provider = new ethers.JsonRpcProvider(rpcUrl)

  const erc20Interface = new ethers.Interface([
    'function allowance(address owner, address spender) view returns (uint256)'
  ])

  const data = erc20Interface.encodeFunctionData('allowance', [ownerAddress, spenderAddress])

  const result = await provider.call({
    to: tokenAddress,
    data
  })

  const [allowance] = erc20Interface.decodeFunctionResult('allowance', result)

  return allowance
}

/**
 * Create an ERC20 approval transaction
 */
export function createApprovalTransaction(
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  decimals: number,
  ownerAddress: string,
  chainId: number,
  nonce: number,
  feeData: ethers.FeeData
): { unsignedTransaction: string } {
  const erc20Interface = new ethers.Interface([
    'function approve(address spender, uint256 amount) returns (bool)'
  ])

  const amountWei = ethers.parseUnits(amount, decimals)
  const data = erc20Interface.encodeFunctionData('approve', [spenderAddress, amountWei])

  let txParams: any = {
    to: tokenAddress,
    data,
    value: 0,
    chainId,
    nonce,
    gasLimit: 100000
  }

  // Prefer EIP-1559 transaction type
  if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
    txParams.maxFeePerGas = feeData.maxFeePerGas
    txParams.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
    txParams.type = 2
  } else {
    // Fallback to legacy transaction with gasPrice
    txParams.gasPrice = feeData.gasPrice
    txParams.type = 0
  }

  const unsignedTransaction = ethers.Transaction.from(txParams).unsignedSerialized

  return { unsignedTransaction }
}
