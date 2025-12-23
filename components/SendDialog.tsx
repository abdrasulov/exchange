"use client";

import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {TokenBalance} from "@/app/types";
import {useState} from "react";
import {useTurnkey} from "@turnkey/react-wallet-kit";
import {ethers} from "ethers";
import {WalletAccount} from "@turnkey/core";
import {Loader2} from "lucide-react";

export function SendDialog({
                             open,
                             onOpenChange,
                             address,
                             tokenBalance,
                             walletAccount
                           }: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  address: string,
  tokenBalance: TokenBalance | null,
  walletAccount: WalletAccount
}) {
  if (!tokenBalance) return null;

  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const { signAndSendTransaction, signTransaction } = useTurnkey();

  const token = tokenBalance.token;

  const onEnterRecipient = (value: string) => {
    setRecipient(value);

    if (!value) {
      setRecipientError("Recipient address is required");
      return;
    }

    if (!ethers.isAddress(value)) {
      setRecipientError("Invalid wallet address");
      return;
    }

    setRecipientError(null);
  };

  const validateAmount = (value: string) => {
    if (!value) {
      return "Amount is required";
    }

    const numeric = Number(value);

    if (isNaN(numeric) || numeric <= 0) {
      return "Amount must be greater than 0";
    }

    // Decimal precision check
    const decimals = tokenBalance.token.decimals;
    const decimalPart = value.split(".")[1];

    if (decimalPart && decimalPart.length > decimals) {
      return `Max ${decimals} decimal places allowed`;
    }

    // Balance check (BigInt safe)
    try {
      const valueWei = ethers.parseUnits(value, decimals);
      const balanceWei = ethers.parseUnits(
        tokenBalance.balance.toString(),
        decimals
      );

      if (valueWei > balanceWei) {
        return "Insufficient balance";
      }
    } catch {
      return "Invalid amount";
    }

    return null;
  };

  const onEnterAmount = (value: string) => {
    setAmount(value);
    setAmountError(validateAmount(value));
  };

  const handleSend = () => {
    setLoading(true);
    const tx = {
      to: recipient,
      value: ethers.parseEther(amount),
      chainId: token.chainId,
      // type: 2, // EIP-1559
    };

    const unsignedTransaction =
      ethers.Transaction.from(tx).unsignedSerialized;

    // signAndSendTransaction({
    //         unsignedTransaction: unsignedTransaction,
    //         transactionType: "TRANSACTION_TYPE_ETHEREUM",
    //         walletAccount: walletAccount,
    //         rpcUrl: "https://ethereum-rpc.publicnode.com",
    //         // stampWith?: StamperType | undefined,
    //         // organizationId?: string,
    //       }
    //     )

    signTransaction({
      unsignedTransaction: unsignedTransaction,
      transactionType: "TRANSACTION_TYPE_ETHEREUM",
      walletAccount: walletAccount,
    }).then((result) => {
      console.log("Success");
      console.log(result);
    }).catch((err) => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    })
  };

  const isFormValid =
    !recipientError &&
    !amountError &&
    recipient.length > 0 &&
    amount.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send {tokenBalance.token.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Network */}
          <div>
            <p className="text-xs text-muted-foreground">Network</p>
            <p className="font-medium">{tokenBalance.token.blockchainType}</p>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="Wallet address"
              value={recipient}
              onChange={(e) => onEnterRecipient(e.target.value)}
              className={recipientError ? "border-red-500 focus-visible:ring-red-500" : ""}
            />

            {recipientError && (
              <p className="text-sm text-red-500">{recipientError}</p>
            )}
          </div>
          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount</Label>
              <span className="text-xs text-muted-foreground">
                Balance: {tokenBalance.balance} {tokenBalance.token.code}
              </span>
            </div>

            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(e) => onEnterAmount(e.target.value)}
              className={amountError ? "border-red-500 focus-visible:ring-red-500" : ""}
            />

            {amountError && (
              <p className="text-sm text-red-500">{amountError}</p>
            )}
          </div>

          {/* Action */}
          <Button
            className="w-full"
            onClick={handleSend}
            disabled={!isFormValid || loading}
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {loading ? "Sending…" : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
