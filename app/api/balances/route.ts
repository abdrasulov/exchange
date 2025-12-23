import {NextRequest} from "next/server";
import {TokenBalance, TokenTypeEip20, Token} from "@/app/types";
import {Alchemy, Network} from "alchemy-sdk";
import {getNativeToken, getSupportedTokens} from "@/app/tokens";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')
    const addressFormat = searchParams.get('addressFormat')

    if (address == null || addressFormat == null) {
        return Response.json([])
    }

    let network
    if (addressFormat == "ADDRESS_FORMAT_ETHEREUM") {
        network = Network.ETH_MAINNET;
    }

    if (network === undefined) {
        return Response.json([])
    }

    const alchemy = new Alchemy({
        apiKey: process.env.ALCHEMY_API_KEY,
        network: network,
        connectionInfoOverrides: {
            skipFetchSetup: true,
        }
    });

    const balances: TokenBalance[] = [];

    try {
        const nativeToken = getNativeToken(addressFormat);
        if (nativeToken) {
            // ETH balance
            const balanceWei = await alchemy.core.getBalance(address);
            const balanceEth = Number(balanceWei) / Math.pow(10, Number(nativeToken.decimals));
            balances.push({
                balance: balanceEth,
                token: nativeToken,
            })
        }

        const tokens = getSupportedTokens(addressFormat);
        if (tokens.length > 0) {
            const contractAddresses = tokens.map((token: Token) => {
              return (token.tokenType as TokenTypeEip20).contractAddress;
            });
            // ERC-20 token balances
            const {tokenBalances} = await alchemy.core.getTokenBalances(
                address,
                contractAddresses
            );

            for (const token of tokens) {
                const tokenBalance = tokenBalances.find(balance => {
                  return balance.contractAddress == (token.tokenType as TokenTypeEip20).contractAddress;
                });
                const balanceString = tokenBalance?.tokenBalance ?? "0";

                // const balance = Number(balanceString) / Math.pow(10, Number(token.decimals));
                const balance = Math.random() * 100

                balances.push({
                    balance: balance,
                    token: token,
                });
            }
        }
    } catch (e) {
        console.error(e);
    }

    return Response.json(balances)
}
