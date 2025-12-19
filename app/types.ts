export type Balance = {
  id: string;
  code: string;
  name: string;
  balance: number;
};

export class Token {
  code: string;
  name: string;
  decimals: number;
  blockchainType: BlockchainType;
  tokenType: TokenType;

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
  }

  get id(): string {
    return this.blockchainType + ":" + this.tokenType.id;
  }
}

export enum BlockchainType {
  Ethereum = 'Ethereum',
  BSC = 'Bsc',
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
