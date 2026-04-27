"use client"

import type { SolanaClientConfig } from "@solana/client";
import { SolanaProvider } from "@solana/react-hooks";
import StoreProvider from "./StoreProvider";
import { WalletSync } from "./WalletSync";
import { RouteGuard } from "@/components/RouteGuard";

const defaultConfig: SolanaClientConfig = {
    cluster: "devnet",
    rpc: "https://api.devnet.solana.com",
    websocket: "wss://api.devnet.solana.com"
};

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <StoreProvider>
            <SolanaProvider config={defaultConfig}>
                <WalletSync />
                <RouteGuard />
                {children}
            </SolanaProvider>
        </StoreProvider>
    );
}
