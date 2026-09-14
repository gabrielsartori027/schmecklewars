"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ADD_CHAIN_PARAMS } from "@/lib/chain";
import { Button } from "@/components/ui/Button";

interface Eip1193 {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

/** `wallet_addEthereumChain` (EIP-3085) with the official Robinhood Chain values. Never asks for a signature. */
export function AddNetworkButton({ size = "md" }: { size?: "sm" | "md" }) {
  const [busy, setBusy] = useState(false);
  const add = async () => {
    const eth = (window as Window & { ethereum?: Eip1193 }).ethereum;
    if (!eth) {
      toast(
        "No EVM wallet detected. Install MetaMask, Rabby, Trust or OKX Wallet (Phantom is not supported).",
      );
      return;
    }
    setBusy(true);
    try {
      await eth.request({ method: "wallet_addEthereumChain", params: [ADD_CHAIN_PARAMS] });
      toast.success("Robinhood Chain added to your wallet.");
    } catch (err) {
      const code = (err as { code?: number }).code;
      toast.error(
        code === 4001
          ? "Request rejected in the wallet."
          : "The wallet refused to add the network. Add it manually with the values shown.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button size={size} onClick={() => void add()} disabled={busy}>
      <PlusCircle size={16} strokeWidth={1.75} /> Add Robinhood Chain to wallet
    </Button>
  );
}
