"use client";

import { useEffect, useState } from "react";
import { getCredential } from "@/lib/api";
import { ArrowRight, ExternalLink, Award, ShieldCheck, Fingerprint, LayoutDashboard, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function VerifyPage() {
  const router = useRouter();
  const params = useParams();
  const mintAddress = params.mintAddress as string;
  const token = useSelector((state: RootState) => state.wallet.token);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mintAddress) return;
    async function fetchData() {
      try {
        const result = await getCredential(mintAddress);
        setData(result);
      } catch (err) {
        setError("Credential not found or invalid mint address.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [mintAddress]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/3 blur-[120px]"></div>
        <div className="absolute top-[40%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/3 blur-[120px]"></div>
      </div>

      {/* Nav */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-5xl border border-white/10 z-50 bg-surface-container-lowest/60 backdrop-blur-xl rounded-2xl flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 shadow-2xl">
        <Link href="/" className="text-lg sm:text-xl font-black tracking-tighter text-primary font-h2 uppercase">CERTA</Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/developers" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:text-white transition-colors mr-2 sm:mr-4">Directory</Link>
          {token && (
            <button
              onClick={() => router.push("/dashboard")}
              className="hidden sm:flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-4 py-2 rounded font-label-caps text-xs hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          )}
          <WalletConnectButton />
        </div>
      </nav>

      {/* Main */}
      <main className="pt-32 pb-24 px-4 sm:px-6 md:px-8 max-w-3xl mx-auto w-full grow flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-on-surface-variant animate-pulse font-mono-data text-sm uppercase tracking-widest">Querying Blockchain...</p>
          </div>
        ) : error ? (
          <div className="bg-surface-container-lowest/30 border border-white/10 rounded-2xl p-8 sm:p-12 text-center w-full max-w-xl shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-red-400 opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
            <p className="text-on-surface-variant mb-8">{error}</p>
            <Link href="/developers" className="text-primary font-bold uppercase tracking-widest text-xs hover:underline underline-offset-4">Back to Directory</Link>
          </div>
        ) : (
          <div className="w-full animate-in fade-in zoom-in-95 duration-700">
            {/* Verification Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Authenticity Verified</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                Proof of Expertise
              </h1>
              <p className="text-on-surface-variant text-lg font-light">
                Immutable technical credential for Solana Engineering.
              </p>
            </div>

            {/* Credential Card */}
            <div className="bg-surface-container-lowest/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.4)] relative">
              {/* Inner Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

              <div className="p-6 sm:p-8 md:p-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between gap-10">
                  {/* Left Side: Stats */}
                  <div className="flex-1 space-y-8 sm:space-y-10">
                    <div>
                      <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 block opacity-60">Verified Developer</label>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container border border-white/10 flex items-center justify-center text-xl font-mono text-primary">
                          {data.credential.wallet.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-mono text-base sm:text-lg truncate max-w-[200px] sm:max-w-none">{data.credential.wallet}</p>
                          <Link href={`https://solscan.io/account/${data.credential.wallet}`} target="_blank" className="text-[10px] text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 mt-1">
                            VIEW ON SOLSCAN <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-8">
                      <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block opacity-40">Skill Score</label>
                        <p className="text-2xl sm:text-3xl font-black text-white font-h2">{data.credential.score}<span className="text-primary text-lg sm:text-xl">/100</span></p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block opacity-40">Issued At</label>
                        <p className="text-base sm:text-lg font-medium text-white">{new Date(data.credential.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 block opacity-40">Technical Summary</label>
                      <p className="text-on-surface-variant text-sm leading-relaxed italic">
                        "Demonstrated exceptional depth in Solana account model, program security, and cross-program invocations during the adaptive verification session."
                      </p>
                    </div>
                  </div>

                  {/* Right Side: NFT / Badge */}
                  <div className="w-full md:w-64 flex flex-col items-center justify-center">
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                      <div className="w-48 h-48 rounded-3xl bg-linear-to-br from-surface-container to-surface-container-lowest border border-white/10 flex flex-col items-center justify-center relative p-6 text-center shadow-inner">
                        <Award className="w-16 h-16 text-primary mb-4" />
                        <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-1">LEVEL 1</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">VERIFIED</p>
                        <div className="absolute bottom-4 font-mono-data text-[8px] text-on-surface-variant/40">ID: {data.credential.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 sm:mt-12 pt-10 sm:pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 overflow-hidden">
                    <Fingerprint className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Mint Address</p>
                      <p className="text-xs text-on-surface font-mono truncate">{data.credential.mintAddress}</p>
                    </div>
                    <Link href={data.solscanUrl} target="_blank" className="p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0">
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 overflow-hidden">
                    <Globe className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Metadata</p>
                      <p className="text-xs text-on-surface font-mono truncate">{data.verifyUrl}</p>
                    </div>
                    <Link href={data.verifyUrl} target="_blank" className="p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0">
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => router.push("/")}
                className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <ArrowRight className="w-3 h-3 rotate-180" />
                Back to Home
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-12 bg-surface-container-lowest/50 mt-auto">
        <div className="max-w-3xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant/40 text-center mx-auto">
            Immutable Verification Protocol • Solana Mainnet
          </div>
        </div>
      </footer>
    </div>
  );
}
