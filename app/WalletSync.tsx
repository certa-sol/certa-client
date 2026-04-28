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

    if (!isConnected) {
      dispatch(setWalletStatus({ isConnected, address, token: null }));
    } else {
      dispatch(setWalletStatus({ isConnected, address }));
    }
  }, [wallet.status, (wallet as any).session, dispatch]);

  return null;
}
