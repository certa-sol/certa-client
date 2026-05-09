"use client";

import { address } from "@solana/kit";
import { useState, useEffect } from "react";
import { useSolTransfer, useWallet } from "@solana/react-hooks";
import toast from "react-hot-toast";

const LAMPORTS_PER_SOL = 1_000_000_000n;

function parseLamports(input: string) {
    const value = Number(input);
    if (!Number.isFinite(value) || value <= 0) return null;
    const lamports = BigInt(Math.floor(value * Number(LAMPORTS_PER_SOL)));
    return lamports > 0 ? lamports : null;
}

interface SolTransferCardProps {
    onPaymentSuccess: (signature: string) => void;
}

export function SolTransferCard({ onPaymentSuccess }: SolTransferCardProps) {
    const wallet = useWallet();
    const { send, isSending, signature } = useSolTransfer();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (signature) {
            onPaymentSuccess(signature);
        }
    }, [signature, onPaymentSuccess]);

    const statusText =
        wallet.status === "connected" ? "Wallet connected" : "Wallet disconnected";

    async function sendSol() {
        if (wallet.status !== "connected") {
            toast.error("Wallet not connected.");
            return;
        }

        const AMOUNT_SOL = "0.05"; // TODO: Change this to 0.5 SOL
        const lamports = parseLamports(AMOUNT_SOL);
        if (!lamports) {
            toast.error("Failed to process the payment.");
            return;
        }

        const dest = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
        if (!dest) {
            toast.error("Something went wrong.");
            return;
        }

        setError(null);
        try {
            await send({
                destination: address(dest),
                amount: lamports
            });
        } catch (err) {
            console.log(err)
            toast.error("Failed to process the payment.");
            return;
        }
    }


    return (
        <section className="space-y-4 w-full rounded-xl border border-white/5 bg-surface-container-lowest p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                    Assessment Fee
                </p>
                <h2 className="text-2xl font-bold text-white">
                    Pay 0.5 SOL to Start
                </h2>
                <p className="text-sm text-white/50 leading-relaxed">
                    This fee is required to begin the formal assessment.
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-white/5">
                <p className="text-sm text-white/50">Status: <span className="text-white/70">{statusText}</span></p>
                <button
                    type="button"
                    onClick={() => void sendSol()}
                    disabled={wallet.status !== "connected" || isSending}
                    className="rounded-lg bg-primary-container cursor-pointer px-6 py-3 text-sm font-semibold text-white hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                    {isSending ? "Processing…" : "Pay 0.5 SOL"}
                </button>
            </div>
            {error ? (
                <p className="text-sm font-semibold text-red-500 mt-2">{error}</p>
            ) : null}
        </section>
    );
}
