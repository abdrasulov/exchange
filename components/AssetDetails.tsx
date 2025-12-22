'use client';
import AssetCard from "@/components/AssetCard";
import {useEffect, useState} from "react";
import {TokenBalance} from "@/app/types";
import axios from "axios";
import {WalletAccount} from "@turnkey/core";
import {ReceiveDialog} from "@/components/ReceiveDialog";

interface AssetDetailsProps {
  account: WalletAccount
}

export default function AssetDetails({account}: AssetDetailsProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);

  const address = account.address;
  const addressFormat = account.addressFormat;

  useEffect(() => {
    const fetchBalances = async () => {
      // if (!account.address) {
      //   return;
      // }
      //
      // setLoading(true);
      // setError(null);
      //
      try {
        const response = await axios.get(`/api/balances/?address=${address}&addressFormat=${addressFormat}`);

        setBalances(response.data as TokenBalance[]);
      } catch (e) {
        console.error(e);
        // setError("Failed to load balances.");
      } finally {
        // setLoading(false);
      }
    };

    fetchBalances();
  }, [address, addressFormat])

  const [open, setOpen] = useState(false);
  const [receiveToken, setReceiveToken] = useState<TokenBalance | null>(null);

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
            setOpen(true);
            setReceiveToken(token);
          }}
        />
      ))}

      <ReceiveDialog
        open={open}
        onOpenChange={setOpen}
        address={address}
        token={receiveToken}
      />
    </div>
  );
}
