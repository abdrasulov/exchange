"use client";

import {useEffect, useState} from "react";
import {WalletAccount} from "@turnkey/core";
import {Balance} from "@/app/balance";

import axios from "axios";

export function Balances(props: { account: WalletAccount }) {
    const account = props.account;

    const [balances, setBalances] = useState<Balance[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBalances = async () => {
            if (!account.address) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(`/api/balances/?address=${account.address}&addressFormat=${account.addressFormat}`);

                setBalances(response.data as Balance[]);
            } catch (e) {
                console.error(e);
                setError("Failed to load balances.");
            } finally {
                setLoading(false);
            }
        };

        fetchBalances();
    }, [account.address, account.addressFormat]);

    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-500 break-all">
                <span className="font-semibold">Address:</span> {account.address}
            </div>

            {loading && <div className="text-sm text-gray-500">Loading balances...</div>}

            {error && <div className="text-sm text-red-500">{error}</div>}

            {!loading && !error && (
                <div className="space-y-2">
                    {balances.length > 0 && (
                        <ul className="space-y-1 text-sm">
                            {balances.map((token) => (
                                <li className="flex justify-between gap-4">
                                    <div>
                                        {token.symbol || "Unknown"}
                                        {token.name && (
                                            <div>
                                                {token.name}
                                            </div>
                                        )}
                                    </div>
                                    {token.balance}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}