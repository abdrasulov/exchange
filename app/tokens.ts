import {BlockchainType, TokenTypeEip20, TokenTypeNative, Token} from "@/app/types";

export function getSupportedTokens(addressFormat: string): Token[] {
  if (addressFormat == "ADDRESS_FORMAT_ETHEREUM") {
    return [
      new Token(
        "USDT",
        "Tether USD",
        6,
        BlockchainType.Ethereum,
        new TokenTypeEip20("0xdAC17F958D2ee523a2206206994597C13D831ec7")
      ),
      new Token(
        "USDC",
        "USDC",
        6,
        BlockchainType.Ethereum,
        new TokenTypeEip20("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")
      )

    ]
  }

  return []
}

export function getNativeToken(addressFormat: string): Token | null {
  if (addressFormat == "ADDRESS_FORMAT_ETHEREUM") {
    return new Token(
      "ETH",
      "Ethereum",
      18,
      BlockchainType.Ethereum,
      new TokenTypeNative()
    )
  }

  return null
}