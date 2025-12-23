'use client';
import AssetCard from "@/components/AssetCard";
import {useEffect, useState} from "react";
import {TokenBalance} from "@/app/types";
import axios from "axios";
import {WalletAccount} from "@turnkey/core";
import {ReceiveDialog} from "@/components/ReceiveDialog";
import {SendDialog} from "@/components/SendDialog";

interface AssetDetailsProps {
  account: WalletAccount
}

export default function AssetDetails({account}: AssetDetailsProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [balances, setBalances] = useState<TokenBalance[]>([]);

  const address = account.address;
  const addressFormat = account.addressFormat;

  if (account.addressFormat != "ADDRESS_FORMAT_ETHEREUM") {
    return <div/>;
  }

  useEffect(() => {
    const fetchBalances = async () => {
      // if (!account.address) {
      //   return;
      // }
      //
      setLoading(true);
      // setError(null);
      //
      try {
        const response = await axios.get(`/api/balances/?address=${address}&addressFormat=${addressFormat}`);

        setBalances(response.data as TokenBalance[]);
      } catch (e) {
        console.error(e);
        // setError("Failed to load balances.");
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [address, addressFormat])

  const [sendOpen, setSendOpen] = useState(false);
  const [sendToken, setSendToken] = useState<TokenBalance | null>(null);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveToken, setReceiveToken] = useState<TokenBalance | null>(null);

  if (loading) {
    return (
      <div className="mb-4 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center h-24">
        <svg
          className="h-6 w-6 animate-spin text-neutral-400 dark:text-neutral-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {balances.map((token) => (
        <AssetCard
          key={token.token.id}
          name={token.token.name}
          code={token.token.code}
          amount={token.balance.toFixed(token.token.decimals).replace(/\.?0+$/, '')}
          fiatAmount=""
          onReceive={() => {
            setReceiveOpen(true);
            setReceiveToken(token);
          }}
          onSend={() => {
            setSendOpen(true);
            setSendToken(token);
          }}
        />
      ))}

      <SendDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        address={address}
        tokenBalance={sendToken}
        walletAccount={account}
      />

      <ReceiveDialog
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        address={address}
        token={receiveToken}
      />
    </div>
  );
}
