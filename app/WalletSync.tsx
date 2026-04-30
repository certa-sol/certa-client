"use client";
import { useEffect } from 'react';
import { useWallet } from '@solana/react-hooks';
import { useDispatch } from 'react-redux';
import { setWalletStatus } from '../store/walletSlice';

export function WalletSync() {
  const wallet = useWallet();
  const dispatch = useDispatch();

  useEffect(() => {
    const isConnected = wallet.status === "connected";
    // @ts-ignore
    const address = isConnected ? wallet.session?.account?.address?.toString() : null;

    // Only sync physical connection state — never touch the token here.
    // Token is set by handleAuth() and cleared by handleDisconnect() in WalletConnectButton.
    // Clearing token here would wipe the persisted JWT on every page load because
    // the wallet adapter starts in a transient non-connected state before auto-reconnecting.
    if (isConnected) {
      dispatch(setWalletStatus({ isConnected: true, address }));
    }
    // When wallet disconnects, WalletConnectButton.handleDisconnect clears the token.
    // We don't react to disconnect here to avoid clearing token during page reload.
  }, [wallet.status, (wallet as any).session, dispatch]);

  return null;
}
