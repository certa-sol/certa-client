"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useWallet } from "@solana/react-hooks";

export function RouteGuard() {
  const { isConnected } = useSelector((state: RootState) => state.wallet);
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
    if (!mounted) return;

    if (isConnected && pathname === "/") {
      setIsRedirecting(true);
      router.push("/dashboard");
    } else if (!isConnected && pathname === "/dashboard") {
      setIsRedirecting(true);
      router.push("/");
    }
  }, [isConnected, pathname, router, mounted]);

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
