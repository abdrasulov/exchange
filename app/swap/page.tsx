"use client";

import { FormEvent, useMemo, useState } from "react";

const TOKENS = [
    { symbol: "USDC", name: "USD Coin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "WBTC", name: "Wrapped BTC" },
];

export default function Swap() {
    const [fromToken, setFromToken] = useState(TOKENS[0].symbol);
    const [toToken, setToToken] = useState(TOKENS[1].symbol);
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
                                <option key={token.symbol} value={token.symbol}>
                                    {token.symbol}
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
                            <option key={token.symbol} value={token.symbol}>
                                {token.symbol}
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
