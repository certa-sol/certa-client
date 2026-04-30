"use client";

import { useState, useEffect } from "react";
import {
  useConnectWallet,
  useDisconnectWallet,
  useWallet
} from "@solana/react-hooks";


import { getChallenge, verifySignature } from "../lib/auth";
import { useDispatch, useSelector } from "react-redux";
import { setWalletStatus } from "../store/walletSlice";
import { toast } from "react-hot-toast";

function truncate(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const wallet = useWallet();
  const connectWallet = useConnectWallet();
  const disconnectWallet = useDisconnectWallet();
  const dispatch = useDispatch();
  const { token, address: reduxAddress } = useSelector((state: any) => state.wallet);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(false);

  const isConnected = wallet.status === "connected";
  const address = isConnected
    ? wallet.session.account.address.toString()
    : null;
  // Prefer live wallet address; fall back to persisted Redux address
  const displayAddress = address ?? reduxAddress;

  async function handleConnect() {
    const connectorId = "wallet-standard:phantom";
    try {
      setPendingAuth(true);
      await connectWallet(connectorId, { autoConnect: true });
    } catch (err) {
      setPendingAuth(false);
      toast.error(err instanceof Error ? err.message : "Unable to connect");
    }
  }

  async function handleDisconnect() {
    try {
      await disconnectWallet();
      dispatch(setWalletStatus({ isConnected: false, address: null, token: null }));
      toast.success("Wallet disconnected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to disconnect");
    }
  }

  async function handleAuth() {
    if (!address || !(wallet as any).session?.account) return;

    setIsAuthenticating(true);
    try {
      const challenge = await getChallenge(address);
      const message = new TextEncoder().encode(challenge);

      const signatureResult = await (wallet as any).session.signMessage(message);
      const signatureBase64 = Buffer.from(signatureResult).toString('base64');

      const jwt = await verifySignature(address, challenge, signatureBase64);
      dispatch(setWalletStatus({ isConnected: true, address, token: jwt }));
      toast.success("Wallet authenticated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  }

  useEffect(() => {
    // Only run auth if we explicitly clicked connect (pendingAuth is true)
    if (pendingAuth && isConnected && address && (wallet as any).session?.account && !token && !isAuthenticating) {
      setPendingAuth(false);
      handleAuth();
    }
  }, [pendingAuth, isConnected, address, (wallet as any).session, token, isAuthenticating]);

  return (
    <div className="relative">
      <button
        type="button"
        className="bg-primary/10 cursor-pointer border border-primary text-primary px-4 py-2 rounded font-label-caps text-label-caps hover:bg-primary/20 transition-colors"
      >
        {!token || !displayAddress ? (
          <span onClick={handleConnect}>{isAuthenticating ? "Signing..." : "Connect wallet"}</span>
        ) : (
          <span onClick={handleDisconnect} className="font-mono">{truncate(displayAddress)}</span>
        )}
      </button>
    </div>
  );
}