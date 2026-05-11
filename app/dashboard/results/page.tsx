"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getAllResults } from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  FileText,
  Activity,
  Sparkles,
  Calendar,
  Zap,
  Network,
  ShieldAlert,
  MinusCircle,
  ExternalLink,
  Award,
  ArrowRight,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ResultsPage() {
  const { isConnected, token } = useSelector((state: RootState) => state.wallet);
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!token) return;
      try {
        const data = await getAllResults(token);
        setResults(data.results);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };

    if (isConnected && token) {
      fetchResults();
    }
  }, [isConnected, token]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-on-surface-variant">Please connect your wallet to view results.</p>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className={`p-5 h-full scrollbar-hide flex flex-col relative ${selectedResult ? 'overflow-hidden' : 'overflow-y-auto'}`}>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full h-full">
        {/* Header */}
        <div className="flex flex-col items-start justify-start gap-1 border-b border-white/5 pb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Session Results
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed">
            Review your historical Solana development assessments and diagnostic sessions.
          </p>
        </div>

        {loading ? (
          <div className="grow w-full flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-on-surface-variant animate-pulse font-mono-data text-xs uppercase tracking-widest">Loading records...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest/20 rounded-3xl border border-white/5 border-dashed">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
            <p className="text-white/40 text-center mb-8">You haven't completed any assessment or diagnostic sessions yet.</p>
            <div className="flex gap-4">
              <button onClick={() => router.push('/dashboard/assessment')} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer">Start Diagnostic</button>
              <button onClick={() => router.push('/dashboard/diagnostic')} className="bg-primary hover:bg-primary text-white border border-primary px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer">Start Assessment</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-5">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => setSelectedResult(result)}
                className="group bg-surface-container-lowest/40 hover:bg-surface-container-lowest/60 border border-white/5 hover:border-primary/30 rounded-2xl p-5 transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:items-center gap-4 md:gap-8 relative overflow-hidden"
              >
                {/* Left: Icon & Mobile Header */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 ${result.type === 'assessment' ? 'bg-primary/10 text-primary' : 'bg-[#4edea3]/10 text-[#4edea3]'}`}>
                    {result.type === 'assessment' ? <Award className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                  </div>
                  <div className="md:hidden flex flex-col grow">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${result.type === 'assessment' ? 'text-primary' : 'text-[#4edea3]'
                        }`}>
                        {result.type}
                      </span>
                      <span className="text-white/30 text-[10px] font-mono">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate">
                      {result.type === 'assessment' ? `Score: ${result.score}/100` : `${result.verdict} Level`}
                    </h3>
                  </div>
                </div>

                {/* Center: Info (Desktop) */}
                <div className="hidden md:flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${result.type === 'assessment' ? 'text-primary' : 'text-[#4edea3]'
                      }`}>
                      {result.type}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/10"></div>
                    <span className="text-white/30 text-[10px] font-mono">
                      {formatDate(result.completedAt)}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm truncate leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Right: Outcome & Status */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <div className="hidden sm:flex flex-col items-start md:items-end">
                    <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">Outcome</div>
                    <div className="flex items-baseline gap-1">
                      {result.type === 'assessment' ? (
                        <>
                          <span className="text-xl font-bold text-white group-hover:text-primary transition-colors">{result.score}</span>
                          <span className="text-[10px] opacity-30 font-mono">/100</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-white capitalize group-hover:text-primary transition-colors">{result.verdict}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-background shadow-lg transition-transform group-hover:scale-110 ${result.verdict === 'pass' || result.type === 'diagnostic' ? 'bg-[#4edea3] text-background' : 'bg-red-500 text-white'
                      }`}>
                      {result.verdict === 'pass' || result.type === 'diagnostic' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="hidden lg:block text-white/10 group-hover:text-primary transition-colors">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail View Modal/Overlay */}
        {selectedResult && (
          <div className="absolute inset-0 z-100">
            <div className="sticky top-0 w-full h-full flex items-center justify-center p-4 md:p-8">
              <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setSelectedResult(null)}></div>

              <div className="relative bg-surface-container-lowest border border-white/10 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in zoom-in-95 fade-in duration-300 scrollbar-hide">
                {/* Modal Header */}
                <div className="sticky top-0 bg-surface-container-lowest/80 backdrop-blur-md p-6 border-b border-white/5 flex items-center justify-between z-20">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedResult.type === 'assessment' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}>
                      {selectedResult.type === 'assessment' ? <Award className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-tight">
                        {selectedResult.type === 'assessment' ? 'Assessment Record' : 'Diagnostic Record'}
                      </h2>
                      <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest">{selectedResult.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content - Assessment Style */}
                {selectedResult.type === 'assessment' ? (
                  <div className="p-6 md:p-10">
                    <div className="flex flex-col items-center text-center mb-12">
                      <div className={`w-24 h-24 rounded-full ${selectedResult.verdict === 'pass' ? 'bg-[#4edea3]/10 border-[#4edea3]/30' : 'bg-red-500/10 border-red-500/30'} border-2 flex items-center justify-center mb-6`}>
                        {selectedResult.verdict === 'pass' ? (
                          <CheckCircle className="w-12 h-12 text-[#4edea3]" />
                        ) : (
                          <XCircle className="w-12 h-12 text-red-500" />
                        )}
                      </div>
                      <h2 className="text-4xl md:text-5xl text-white font-bold mb-4 tracking-tight">
                        {selectedResult.verdict === 'pass' ? 'Assessment Passed' : 'Assessment Failed'}
                      </h2>
                      {selectedResult.verdict === 'pass' && (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4edea3]/15 border border-[#4edea3]/30 font-mono-data text-sm text-[#4edea3] uppercase tracking-widest">
                          <Sparkles className="w-4 h-4 text-[#4edea3]" />
                          Level 1 Certified
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                      {/* Left Column: Summary & Scores */}
                      <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Summary Card */}
                        <div className="bg-surface-container-lowest/50 border border-white/5 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <FileText className="w-32 h-32 text-white" />
                          </div>
                          <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 opacity-70">
                            Evaluation Summary
                          </h3>
                          <p className="text-white/70 leading-relaxed text-lg font-light">
                            {selectedResult.summary}
                          </p>
                        </div>

                        {/* Skill Breakdown */}
                        <div className="bg-surface-container-lowest/50 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
                          <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-6 opacity-70">
                            Skill Breakdown
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {Object.entries(selectedResult.topicScores || selectedResult.scores || {}).map(([key, value]: [string, any]) => {
                              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                              const percent = Math.min(100, value > 10 ? value : value * 10);
                              const isGood = percent >= 75;
                              const isWarn = percent >= 45 && percent < 75;

                              return (
                                <div key={key}>
                                  <div className="flex justify-between items-end mb-2">
                                    <span className="text-white/80 font-medium text-sm">{label}</span>
                                    <span className={`font-mono text-sm font-bold ${isGood ? 'text-[#4edea3]' : isWarn ? 'text-yellow-400' : 'text-red-400'}`}>
                                      {value}{value <= 10 ? '/10' : '/100'}
                                    </span>
                                  </div>
                                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div
                                      className={`h-full rounded-full transition-all duration-1000 ${isGood ? 'bg-[#4edea3]' : isWarn ? 'bg-yellow-400' : 'bg-red-400'}`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Gaps */}
                        {selectedResult.gaps && selectedResult.gaps.length > 0 && (
                          <div className="bg-surface-container-lowest/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-6 opacity-70">
                              Knowledge Gaps Identified
                            </h3>
                            <ul className="grid grid-cols-1 gap-3">
                              {selectedResult.gaps.map((gap: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 bg-black/20 p-4 rounded-xl border border-red-500/10">
                                  <MinusCircle className="w-5 h-5 text-red-500/70 shrink-0 mt-0.5" />
                                  <span className="text-red-100/80 leading-relaxed text-sm">{gap}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Score */}
                      <div className="lg:col-span-4 flex flex-col gap-8">
                        <div className="bg-surface-container-lowest/50 border border-white/5 rounded-2xl p-8 backdrop-blur-md flex flex-col items-center justify-center py-12 relative overflow-hidden">
                          <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none"></div>
                          <span className="font-mono-data text-xs text-white/50 mb-4 uppercase tracking-widest font-bold">Overall Score</span>
                          <div className="relative flex items-center justify-center">
                            <svg className="w-40 h-40 transform -rotate-90">
                              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                              <circle
                                cx="80" cy="80" r="70" fill="none"
                                stroke={selectedResult.verdict === 'pass' ? '#4edea3' : '#ef4444'}
                                strokeWidth="12"
                                strokeDasharray="439.8"
                                strokeDashoffset={439.8 - (439.8 * (selectedResult.score || 0)) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                              <span className={`text-5xl font-bold ${selectedResult.verdict === 'pass' ? 'text-[#4edea3]' : 'text-red-500'}`}>
                                {selectedResult.score}
                              </span>
                              <span className="text-white/40 text-sm mt-1">/ 100</span>
                            </div>
                          </div>
                        </div>

                        {selectedResult.resources && selectedResult.resources.length > 0 && (
                          <div className="bg-surface-container-lowest/50 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
                            <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary" /> Learning Resources
                            </h3>
                            <div className="flex flex-col gap-3">
                              {selectedResult.resources.map((res: string, i: number) => (
                                <a key={i} href={res} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-all group">
                                  <span className="text-white/60 text-xs truncate max-w-[200px]">{res}</span>
                                  <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Modal Content - Diagnostic Style */
                  <div className="p-6 md:p-12 max-w-5xl mx-auto w-full">
                    <div className="flex flex-col items-center text-center mb-12">
                      <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                        <CheckCircle className="w-7 h-7 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-4">Diagnostic Complete</h2>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono-data text-xs uppercase tracking-widest font-bold">
                        <Sparkles className="w-3 h-3" />
                        {selectedResult.verdict}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="lg:col-span-7 space-y-8">
                        <div className="bg-surface-container-lowest/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                          <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 opacity-70">Executive Summary</h3>
                          <p className="text-on-surface-variant text leading-relaxed font-light">
                            {selectedResult.summary}
                          </p>
                        </div>

                        {selectedResult.gaps && selectedResult.gaps.length > 0 && (
                          <div className="bg-surface-container-lowest/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-6 opacity-70">Focus Areas for Improvement</h3>
                            <ul className="space-y-3">
                              {selectedResult.gaps.map((gap: string, i: number) => (
                                <li key={i} className="flex items-start gap-4 px-4 py-3 rounded-xl bg-white/2 border border-white/5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-2 shrink-0"></div>
                                  <span className="text-on-surface-variant text-sm leading-relaxed">{gap}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-5 space-y-8">
                        {(selectedResult.scores || selectedResult.topicScores) && (
                          <div className="bg-surface-container-lowest/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                            <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-6 opacity-70">Skill Metrics</h3>
                            <div className="space-y-5">
                              {Object.entries(selectedResult.topicScores || selectedResult.scores || {}).map(([topic, score]) => {
                                const pct = Math.round(((score as number) / (selectedResult.type === 'assessment' ? 100 : 10)) * 100);
                                const label = topic.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                const isHigh = pct >= 75;
                                const isMid = pct >= 45 && pct < 75;

                                return (
                                  <div key={topic}>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-mono-data text-xs text-on-surface-variant/80 uppercase tracking-wider">{label}</span>
                                      <span className={`font-mono-data text-xs font-bold ${isHigh ? 'text-[#4edea3]' : isMid ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {score as number}/{selectedResult.type === 'assessment' ? '100' : '10'}
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isHigh ? 'bg-[#4edea3]' : isMid ? 'bg-yellow-400' : 'bg-red-400'}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {selectedResult.resources && selectedResult.resources.length > 0 && (
                          <div className="bg-surface-container-lowest/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                            <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-6 opacity-70">Curated Learning Path</h3>
                            <div className="space-y-3">
                              {selectedResult.resources.map((url: string, i: number) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5 text-primary text-xs hover:bg-primary/5 transition-all group">
                                  <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                                  <span className="truncate">{url}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
