"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useWallet } from "@solana/react-hooks";
import { toast } from "react-hot-toast";

export function RouteGuard() {
  const { isConnected, token } = useSelector((state: RootState) => state.wallet);
  // redux-persist injects _persist into the slice state after rehydration
  const rehydrated = useSelector((state: RootState) => (state.wallet as any)._persist?.rehydrated ?? false);
  const router = useRouter();
  const pathname = usePathname();
  const wallet = useWallet();
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsRedirecting(false);
  }, [pathname]);

  useEffect(() => {
    // Wait for both component mount (SSR) and redux-persist rehydration
    if (!mounted || !rehydrated) return;

    if (!token && pathname.startsWith("/dashboard")) {
      toast.error("Please connect your wallet", { id: 'auth-error' });
      setIsRedirecting(true);
      router.push("/");
    }
  }, [isConnected, token, pathname, router, mounted, rehydrated]);

  const showLoader = wallet.status === "connecting" || isRedirecting;

  if (showLoader && mounted) {
    return (
      <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md transition-all duration-300">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 glow-effect"></div>
        <p className="font-h2 text-xl text-primary font-bold animate-pulse tracking-widest uppercase">
          {wallet.status === "connecting" ? "Connecting Wallet..." : "Redirecting..."}
        </p>
      </div>
    );
  }

  return null;
}
