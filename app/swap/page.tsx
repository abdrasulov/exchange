"use client";

import { FormEvent, useMemo, useState } from "react";

type Token = {
    chain: string;
    chainId: string;
    ticker: string;
    identifier: string;
    name: string;
    decimals: number;
    logoURI: string;
    shortCode: string;
    coingeckoId: string;
};

const TOKENS: Token[] = [
    {
        chain: "BSC",
        chainId: "56",
        ticker: "BNB",
        identifier: "BSC.BNB",
        name: "BNB",
        decimals: 18,
        logoURI: "https://storage.googleapis.com/token-list-swapkit/images/bsc.bnb.png",
        shortCode: "s",
        coingeckoId: "binancecoin",
    },
    {
        chain: "ETH",
        chainId: "1",
        ticker: "ETH",
        identifier: "ETH.ETH",
        name: "Ethereum",
        decimals: 18,
        logoURI: "https://storage.googleapis.com/token-list-swapkit/images/eth.eth.png",
        shortCode: "s",
        coingeckoId: "ethereum",
    },
    {
        chain: "POL",
        chainId: "137",
        ticker: "USDC",
        identifier: "POL.USDC",
        name: "USD Coin",
        decimals: 6,
        logoURI: "https://storage.googleapis.com/token-list-swapkit/images/pol.usdc.png",
        shortCode: "s",
        coingeckoId: "usd-coin",
    },
];

export default function Swap() {
    const [fromToken, setFromToken] = useState(TOKENS[0].ticker);
    const [toToken, setToToken] = useState(TOKENS[1].ticker);
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState<string | null>(null);

    // Simple mock rate: pretend 1 FROM = rate TO; purely UI feedback
    const mockRate = useMemo(() => {
        if (!amount) return null;
        const parsed = Number(amount);
        if (Number.isNaN(parsed)) return null;
        if (fromToken === toToken) return parsed;
        return parsed * 0.95;
    }, [amount, fromToken, toToken]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!amount || Number.isNaN(Number(amount))) {
            setStatus("Enter a valid amount.");
            return;
        }
        setStatus(`Swapping ${amount} ${fromToken} → ${toToken}...`);
        setTimeout(() => {
            setStatus(`Swap complete! Received ${mockRate ?? "0"} ${toToken}.`);
        }, 500);
    };

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
                                    {token.ticker}
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
                                {token.ticker}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="rounded-xl bg-blue-50 p-3 text-sm text-slate-700">
                    <p>Estimated receive:</p>
                    <p className="text-xl text-slate-900">
                        {mockRate ? `${mockRate.toFixed(4)} ${toToken}` : "—"}
                    </p>
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
