"use client";

import {useTurnkey} from "@turnkey/react-wallet-kit";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Token = {
    chain: string;
    address?: string;
    chainId: string;
    ticker: string;
    identifier: string;
    symbol?: string;
    name: string;
    decimals: number;
    logoURI: string;
    coingeckoId: string;
};

const TOKENS: Token[] = [
    {
        "chain": "ETH",
        "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "chainId": "1",
        "ticker": "USDT",
        "identifier": "ETH.USDT-0xdac17f958d2ee523a2206206994597c13d831ec7",
        "symbol": "USDT-0xdac17f958d2ee523a2206206994597c13d831ec7",
        "name": "Tether",
        "decimals": 6,
        "logoURI": "https://storage.googleapis.com/token-list-swapkit/images/eth.usdt-0xdac17f958d2ee523a2206206994597c13d831ec7.png",
        "coingeckoId": "tether"
    },
    {
        "chain": "SOL",
        "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "chainId": "solana",
        "ticker": "USDC",
        "identifier": "SOL.USDC-EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC-EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "name": "USDC",
        "decimals": 6,
        "logoURI": "https://storage.googleapis.com/token-list-swapkit/images/sol.usdc-epjfwdd5aufqssqem2qn1xzybapc8g4weggkzwytdt1v.png",
        "coingeckoId": "usd-coin"
    },
];

const chainNames: Record<string, string> = {
    ETH: "Ethereum",
    SOL: "Solana",
};

const chainAddressFormats: Record<string, string> = {
    ETH: "ADDRESS_FORMAT_ETHEREUM",
    SOL: "ADDRESS_FORMAT_SOLANA",
};

const getChainName = (chain: string) => chainNames[chain] ?? chain;

type QuoteResponse = {
    routes?: Array<{
        expectedBuyAmount?: string;
        approvalAddress?: string | null;
        tx?: unknown;
    }>;
};

const QUOTE_ENDPOINT = "https://swap-api.unstoppable.money/quote";
const QUOTE_HEADERS = {
    "content-type": "application/json",
    "x-api-key": "79a24bddb8b1768dbb2662e136aca9006baa6d4e3e6d761219b2ab4279a42bb4",
};

export default function Swap() {
    const {user, wallets} = useTurnkey();
    const [fromToken, setFromToken] = useState(TOKENS[0].ticker);
    const [toToken, setToToken] = useState(TOKENS[1].ticker);
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [estimatedReceive, setEstimatedReceive] = useState<string | null>(null);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);

    const fromTokenMeta = useMemo(
        () => TOKENS.find((token) => token.ticker === fromToken),
        [fromToken]
    );
    const toTokenMeta = useMemo(
        () => TOKENS.find((token) => token.ticker === toToken),
        [toToken]
    );

    const resolveAddressForChain = useCallback(
        (chain: string) => {
            // mock ETH address for USDT balance validation
            if (chain === "ETH") {
                return "0x3f4E9c3Ac73a4cff7540293c24a3D055E03fd78d";
            }

            if (!wallets || wallets.length === 0) return null;
            const format = chainAddressFormats[chain];
            if (!format) return null;
            for (const wallet of wallets) {
                const account = wallet.accounts.find(
                    (acct: { addressFormat: string; address: string }) =>
                        acct.addressFormat === format
                );
                if (account) {
                    return account.address;
                }
            }
            return null;
        },
        [wallets]
    );

    useEffect(() => {
        if (!amount) {
            setEstimatedReceive(null);
            setQuoteError(null);
            return;
        }
        if (!fromTokenMeta || !toTokenMeta) {
            setEstimatedReceive(null);
            setQuoteError("Select both tokens.");
            return;
        }
        const parsedAmount = Number(amount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            setEstimatedReceive(null);
            setQuoteError("Enter a valid amount.");
            return;
        }

        const sourceAddress = resolveAddressForChain(fromTokenMeta.chain);
        const destinationAddress = resolveAddressForChain(toTokenMeta.chain);

        if (!sourceAddress || !destinationAddress) {
            setEstimatedReceive(null);
            setQuoteError("Missing wallet address for selected chain.");
            return;
        }

        const controller = new AbortController();
        setIsFetchingQuote(true);
        setQuoteError(null);

        const payload = {
            buyAsset: toTokenMeta.identifier,
            destinationAddress,
            includeTx: true,
            providers: ["NEAR"],
            sellAmount: amount,
            sellAsset: fromTokenMeta.identifier,
            slippage: 1,
            sourceAddress,
        };

        console.log(payload);

        fetch(QUOTE_ENDPOINT, {
            method: "POST",
            headers: QUOTE_HEADERS,
            body: JSON.stringify(payload),
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Quote error (${response.status})`);
                }
                return response.json() as Promise<QuoteResponse>;
            })
            .then((data) => {
                const routes = Array.isArray(data.routes) ? data.routes : [];
                const best = routes.reduce<
                    { raw: string; numeric: number } | null
                >((currentBest, route) => {
                    const raw = route?.expectedBuyAmount;
                    if (!raw) return currentBest;
                    const numeric = Number(raw);
                    if (Number.isNaN(numeric)) return currentBest;
                    if (!currentBest || numeric > currentBest.numeric) {
                        return { raw, numeric };
                    }
                    return currentBest;
                }, null);

                if (!best) {
                    setEstimatedReceive(null);
                    setQuoteError("No quotes available.");
                    return;
                }

                setEstimatedReceive(best.raw);
            })
            .catch((error) => {
                if (error.name === "AbortError") {
                    return;
                }
                setEstimatedReceive(null);
                setQuoteError(error.message ?? "Failed to fetch quote.");
            })
            .finally(() => {
                setIsFetchingQuote(false);
            });

        return () => controller.abort();
    }, [amount, fromTokenMeta, toTokenMeta, resolveAddressForChain]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!amount || Number.isNaN(Number(amount))) {
            setStatus("Enter a valid amount.");
            return;
        }
        setStatus(`Swapping ${amount} ${fromToken} → ${toToken}...`);
        setTimeout(() => {
            setStatus(
                `Swap complete! Received ${estimatedReceive ?? "0"} ${toToken}.`
            );
        }, 500);
    };

    if (!wallets || wallets.length === 0) {
        return (
            <div>Loading wallets...</div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Swap tokens</h1>
                    <p className="text-sm text-slate-500">Choose tokens and amount to swap.</p>
                </div>

                <label className="block space-y-2 text-sm text-slate-900">
                    From
                    <div className="flex gap-2">
                        <select
                            value={fromToken}
                            onChange={(e) => setFromToken(e.target.value)}
                            className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            {TOKENS.map((token) => (
                                <option key={token.identifier} value={token.ticker}>
                                    {token.ticker} • {getChainName(token.chain)}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-right text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <p className="text-xs text-slate-500">
                        Chain: {fromTokenMeta ? getChainName(fromTokenMeta.chain) : "—"}
                    </p>
                </label>

                <label className="block space-y-2 text-sm text-slate-900">
                    To
                    <select
                        value={toToken}
                        onChange={(e) => setToToken(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {TOKENS.map((token) => (
                            <option key={token.identifier} value={token.ticker}>
                                {token.ticker} • {getChainName(token.chain)}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-500">
                        Chain: {toTokenMeta ? getChainName(toTokenMeta.chain) : "—"}
                    </p>
                </label>

                <div className="rounded-xl bg-blue-50 p-3 text-sm text-slate-700">
                    <p>Estimated receive:</p>
                    <p className="text-xl text-slate-900">
                        {isFetchingQuote
                            ? "Fetching quote..."
                            : estimatedReceive
                                ? `${estimatedReceive} ${toToken}`
                                : "—"}
                    </p>
                    {quoteError && (
                        <p className="text-xs text-red-500 mt-1">{quoteError}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 py-3 text-center text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    Swap
                </button>

                {status && (
                    <p className="text-center text-sm text-blue-600">{status}</p>
                )}
            </form>
        </div>
    );
}
