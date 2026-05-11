"use client";

import { useEffect, useState } from "react";
import { getCredentials } from "@/lib/api";
import { CheckCircle2, ArrowRight, Award, LayoutDashboard, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function DevelopersPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.wallet.token);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCredentials(70, 50, 0);
        setCredentials(data.credentials);
      } catch (err) {
        setError("Failed to load verified developers.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const truncate = (str: string) => str.slice(0, 4) + "..." + str.slice(-4);

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
      <main className="pt-32 pb-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto w-full grow">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-4">
            <Globe className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Public Directory</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Verified Developers
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg font-light leading-relaxed">
            The global list of engineers who have passed the Certa technical assessment. Every credential is an immutable on-chain record.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-on-surface-variant animate-pulse font-mono-data text-xs uppercase tracking-widest">Scanning Blockchain...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container/40 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Wallet</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Credential</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Score</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Issued At</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {credentials.map((cred) => (
                    <tr key={cred.mintAddress} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-mono text-primary border border-white/5">
                            {cred.wallet.slice(0, 2)}
                          </div>
                          <span className="font-mono-data text-sm text-on-surface">{truncate(cred.wallet)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono-data text-xs text-on-surface-variant">{truncate(cred.mintAddress)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono-data text-sm font-bold text-primary">{cred.score}/100</span>
                          <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${cred.score}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-body-main text-xs text-on-surface-variant">
                          {new Date(cred.issuedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link 
                          href={`/verify/${cred.mintAddress}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest hover:underline underline-offset-4 group"
                        >
                          Verify
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {credentials.length === 0 && (
              <div className="py-20 text-center">
                <Award className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                <p className="text-on-surface-variant">No verified developers found yet.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-12 bg-surface-container-lowest/50 mt-auto">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant/40">
            © 2024 Certa Protocol • Immutable Verification
          </div>
          <div className="flex gap-6">
            <Link className="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" href="/">Home</Link>
            <Link className="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" href="/dashboard">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
