export enum BlockchainType {
  Ethereum = 'Ethereum',
  BSC = 'BSC',
}

const chainIds: Record<BlockchainType, number> = {
  Ethereum: 1,
  BSC: 56
};

export type TokenBalance = {
  balance: number;
  token: Token;
};

export class Token {
  code: string;
  name: string;
  decimals: number;
  blockchainType: BlockchainType;
  tokenType: TokenType;
  id: string;
  chainId: number;

  constructor(
    code: string,
    name: string,
    decimals: number,
    blockchainType: BlockchainType,
    tokenType: TokenType,
  ) {
    this.code = code;
    this.name = name;
    this.decimals = decimals;
    this.blockchainType = blockchainType;
    this.tokenType = tokenType;
    this.id = blockchainType + ":" + tokenType.id;
    this.chainId = chainIds[this.blockchainType];
  }
}

interface TokenType {
  get id(): string
}

export class TokenTypeNative implements TokenType {
  get id(): string {
    return "Native";
  }
}

export class TokenTypeEip20 implements TokenType {
  contractAddress: string;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress
  }

  get id(): string {
    return "Eip20-" + this.contractAddress;
  }
}
