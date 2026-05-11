"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getCredentialsByWallet } from "@/lib/api";
import {
  Award,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Zap,
  LayoutGrid,
  List,
  Search,
  Filter,
  Download,
  Share2,
  Copy,
  Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { X } from "lucide-react";

export default function CredentialsPage() {
  const { isConnected, token, address } = useSelector((state: RootState) => state.wallet);
  const router = useRouter();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!token || !address) return;
      try {
        const data = await getCredentialsByWallet(address, token);
        setCredentials(data.credentials);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch certificates");
      } finally {
        setLoading(false);
      }
    };

    if (isConnected && token && address) {
      fetchCredentials();
    } else if (!loading) {
      setLoading(false);
    }
  }, [isConnected, token, address, loading]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Address copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10 text-white/20" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Wallet Disconnected</h3>
        <p className="text-on-surface-variant mb-8">Please connect your wallet to view your earned certificates.</p>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <main className="overflow-y-auto p-5 h-full scrollbar-hide flex flex-col relative">
      <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full h-full">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
          <div className="flex flex-col items-start justify-start gap-1">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Diagnostic
            </h1>
            <p className="text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed">
              Evaluate your Solana development skills.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-surface-container-lowest/40 border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center min-w-[100px]">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Total Minted</span>
              <span className="text-2xl font-bold text-white">{credentials.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grow w-full flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-on-surface-variant animate-pulse font-mono-data text-xs uppercase tracking-widest">Retrieving Credentials...</p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest/20 rounded-3xl border border-white/5 border-dashed">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Certificates Found</h3>
            <p className="text-white/40 text-center mb-8 max-w-lg">You haven't minted any certificates yet. Complete an assessment with a passing score to earn your first NFT credential.</p>
            <button
              onClick={() => router.push('/dashboard/assessment')}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Start Assessment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {credentials.map((cert) => (
              <div
                key={cert.id}
                onClick={() => setSelectedCert(cert)}
                className="group relative bg-surface-container-lowest/40 border border-white/5 hover:border-primary/40 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-20px_rgba(var(--primary-rgb),0.3)] flex flex-col cursor-pointer"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-primary/20 rounded-3xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                {/* Certificate Image Preview */}
                <div className="aspect-4/3 relative overflow-hidden bg-black/40">
                  <Image
                    src="/image.png"
                    alt="Certificate"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Score Overlay */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 flex flex-col items-center">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-tight">Score</span>
                    <span className="text-xl font-bold text-[#4edea3]">{cert.score}%</span>
                  </div>

                  {/* ID Tag */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[10px] font-mono text-white/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/5">
                      ID: {cert.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col grow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                        Solana Developer Certificate
                      </h3>
                      <div className="flex items-center gap-2 text-white/40 text-[10px] font-medium uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {formatDate(cert.issuedAt)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Mint Address</span>
                        <button
                          onClick={() => copyToClipboard(cert.mintAddress, cert.id)}
                          className="text-white/20 hover:text-primary transition-colors"
                        >
                          {copiedId === cert.id ? <Check className="w-3 h-3 text-[#4edea3]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-white/60 truncate">
                        {cert.mintAddress}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    <a
                      href={`https://solscan.io/token/${cert.mintAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                      View on Solscan <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificate Detail Modal */}
        {selectedCert && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={() => setSelectedCert(null)}></div>

            <div className="relative bg-surface-container-lowest border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 fade-in duration-300 scrollbar-hide overflow-hidden">
              {/* Close Button */}
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-6 right-6 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left: Big Image */}
              <div className="md:w-3/5 relative aspect-square md:aspect-auto bg-black flex items-center justify-center p-8">
                <div className="relative w-full h-full shadow-[0_0_100px_-20px_rgba(var(--primary-rgb),0.5)]">
                  <Image
                    src="/image.png"
                    alt="Certificate"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Right: Info */}
              <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Verified Credential</span>
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-2 leading-tight">Solana Developer Certificate</h2>
                  <p className="text-white/40 text-sm mb-8">Issued via Certa Diagnostic Protocol</p>

                  <div className="space-y-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Achievement Score</span>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold text-[#4edea3]">{selectedCert.score}%</span>
                        <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full bg-[#4edea3]" style={{ width: `${selectedCert.score}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Issuance Date</span>
                      <div className="flex items-center gap-2 text-white/80">
                        <Calendar className="w-4 h-4 opacity-50" />
                        <span className="text-sm">{formatDate(selectedCert.issuedAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Credential ID</span>
                      <div className="bg-black/40 rounded-xl p-3 border border-white/5 font-mono text-[11px] text-white/60">
                        {selectedCert.id}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">On-Chain Mint</span>
                      <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-white/60 truncate mr-2">{selectedCert.mintAddress}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(selectedCert.mintAddress, 'modal');
                          }}
                          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4 text-white/20" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex flex-col gap-4">
                  <a
                    href={`https://solscan.io/token/${selectedCert.mintAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-primary text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-primary/90"
                  >
                    View on Explorer <ExternalLink className="w-4 h-4" />
                  </a>
                  <div className="flex gap-3">
                    <button
                      onClick={() => toast.success("Sharing options coming soon!")}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      Share Proof
                    </button>
                    <button
                      onClick={() => toast.success("Download started...")}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
