import {NextRequest} from "next/server";
import {Balance} from "@/app/types";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')
    const addressFormat = searchParams.get('addressFormat')

    const balances: Balance[] = [];

    if (addressFormat == "ADDRESS_FORMAT_ETHEREUM") {
        balances.push({
            symbol: "ETH",
            name: "Ethereum",
            balance: "500.12341234"
        });

        balances.push({
            symbol: "USDT",
            name: "Tether",
            balance: "123.00123452"
        });
    }

    return Response.json(balances)
}

// const alchemy = new Alchemy({
//     apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
//     network: Network.ETH_MAINNET,
// });
//
//  useEffect(() => {
//     const fetchBalances = async () => {
//       if (account.addressFormat !== "ADDRESS_FORMAT_ETHEREUM") {
//         return;
//       }
//
//       if (!account.address) {
//         return;
//       }
//
//       if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
//         setError("Alchemy API key is not configured.");
//         return;
//       }
//
//       setLoading(true);
//       setError(null);
//
//       try {
//         // ETH balance
//         const balanceWei = await alchemy.core.getBalance(account.address);
//         const balanceEth = Number(balanceWei) / 1e18;
//         setEthBalance(balanceEth.toFixed(6));
//
//         // ERC-20 token balances
//         const { tokenBalances } = await alchemy.core.getTokenBalances(
//           account.address
//         );
//
//         const nonZeroTokens = tokenBalances.filter(
//           (token) => token.tokenBalance && token.tokenBalance !== "0"
//         );
//
//         const detailedTokens: TokenBalance[] = [];
//
//         for (const token of nonZeroTokens) {
//           if (!token.contractAddress || !token.tokenBalance) continue;
//
//           const metadata = await alchemy.core.getTokenMetadata(
//             token.contractAddress
//           );
//
//           const decimals = metadata.decimals ?? 18;
//           const balance =
//             Number(token.tokenBalance) / Math.pow(10, Number(decimals));
//
//           detailedTokens.push({
//             contractAddress: token.contractAddress,
//             symbol: metadata.symbol || "",
//             name: metadata.name || "",
//             balance: balance.toFixed(6),
//           });
//         }
//
//         setTokenBalances(detailedTokens);
//       } catch (e) {
//         console.error(e);
//         setError("Failed to load balances.");
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     fetchBalances();
//   }, [account.address, account.addressFormat]);