"use client";

import { useState } from "react";
import {
  useConnectWallet,
  useDisconnectWallet,
  useWallet
} from "@solana/react-hooks";


function truncate(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const wallet = useWallet();
  const connectWallet = useConnectWallet();
  const disconnectWallet = useDisconnectWallet();
  const [error, setError] = useState<string | null>(null);

  const isConnected = wallet.status === "connected";
  const address = isConnected
    ? wallet.session.account.address.toString()
    : null;

  async function handleConnect() {
    setError(null);
    const connectorId = "wallet-standard:phantom"
    try {
      await connectWallet(connectorId, { autoConnect: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect");
    }
  }

  async function handleDisconnect() {
    setError(null);
    try {
      await disconnectWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to disconnect");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="bg-primary/10 cursor-pointer border border-primary text-primary px-4 py-2 rounded font-label-caps text-label-caps hover:bg-primary/20 transition-colors"
      >
        {isConnected ? (
          <span onClick={handleDisconnect} className="font-mono">{truncate(address!)}</span>
        ) : (
          <span onClick={handleConnect}>Connect wallet</span>
        )}
      </button>
    </div>
  );
}