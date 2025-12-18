import {Token} from "@/app/types";

export function getSupportedTokens(addressFormat: string) : Token[] {
    if (addressFormat == "ADDRESS_FORMAT_ETHEREUM") {
        return [
            {
                id: "tether",
                symbol: "USDT",
                name: "Tether USD",
                contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                decimals: 6,
            },
            {
                id: "usdc",
                symbol: "USDC",
                name: "USDC",
                contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                decimals: 6,
            },
        ]
    }

    return []
}

export function getNativeToken(addressFormat: string) : Token | null {
    if (addressFormat == "ADDRESS_FORMAT_ETHEREUM") {
        return {
            id: "ethereum",
            symbol: "ETH",
            name: "Ethereum",
            contractAddress: "",
            decimals: 18,
        }
    }

    return null
}