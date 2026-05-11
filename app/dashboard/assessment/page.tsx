"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Award,
  Zap,
  Shield,
  XCircle,
  CheckCircle2,
  Clock,
  Flag,
  Code2,
  Network,
  ShieldAlert,
  PlayCircle,
  Video,
  MonitorPlay,
  MinusCircle,
  HelpCircle,
  X,
  FileText,
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SolTransferCard } from "@/components/SolTransferCard";
import { verifyPayment, startAssessment, submitTurn, getSessionResult, getPaymentStatus } from "@/lib/api";
import { openStream } from "@/lib/stream";
import toast from "react-hot-toast";

type Phase = 'idle' | 'paying' | 'confirming' | 'active' | 'analyzing' | 'complete' | 'error';

export default function AssessmentPage() {
  const { isConnected, token } = useSelector((state: RootState) => state.wallet);
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('idle');
  const [paymentSignature, setPaymentSignature] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questionShownAt, setQuestionShownAt] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!token || phase !== 'idle') {
        setIsCheckingStatus(false);
        return;
      }

      const savedSession = localStorage.getItem("certa_current_session");
      if (savedSession) {
        try {
          const res = await getSessionResult(savedSession, token);
          setSessionId(savedSession);
          if (res && res.status === 'complete') {
            setResult(res);
            setPhase('complete');
            setIsCheckingStatus(false);
            return; // Don't check payment if session is complete
          } else if (res && res.status !== 'complete') {
            setPhase('active');
            setIsCheckingStatus(false);
            return; // Don't check payment if session is active
          }
        } catch (e) {
          localStorage.removeItem("certa_current_session");
        }
      }

      // If no active session, check for unconsumed payment
      try {
        const status = await getPaymentStatus(token);
        if (status.hasPaidAssessment && status.payment) {
          setPaymentSignature(status.payment.signature);
          setPhase('confirming');
        }
      } catch (e) {
        console.error("Failed to check payment status", e);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    restoreSession();
  }, [token, phase]);

  useEffect(() => {
    if (!sessionId || !token || phase !== 'active') return;

    const cleanup = openStream(
      sessionId,
      token,
      (question) => {
        setCurrentQuestion(question);
        setQuestionShownAt(Date.now());
        setQuestionCount(prev => prev + 1);
        setCurrentAnswer("");
      },
      async (res) => {
        if (res.complete) {
          try {
            const finalResult = await getSessionResult(sessionId, token);
            setResult(finalResult);
            setPhase('complete');
            localStorage.removeItem("certa_current_session");
          } catch (err: any) {
            setErrorMsg(err.message || "Failed to fetch session results.");
          }
        }
      },
      (err) => {
        setErrorMsg(err);
      }
    );

    return cleanup;
  }, [sessionId, token, phase]);

  if (!isConnected) {
    return null;
  }

  if (isCheckingStatus) {
    return (
      <div className="grow w-full h-full flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6 glow-effect"></div>
        <p className="text-on-surface-variant animate-pulse font-mono-data text-xs uppercase tracking-widest">Checking Session Status...</p>
      </div>
    );
  }

  const handlePaymentSuccess = async (sig: string) => {
    setPaymentSignature(sig);
    setPhase('confirming');

    try {
      if (token) {
        await verifyPayment(sig, "SOL", token);
      }
    } catch (err) {
      toast.error("Payment verification failed");
      setPhase('idle');
    }
  };

  const handleBeginAssessment = async () => {
    if (!paymentSignature || !token) return;

    setPhase('analyzing');
    try {
      const { sessionId, question } = await startAssessment(paymentSignature, "SOL", token);
      setSessionId(sessionId);
      localStorage.setItem("certa_current_session", sessionId);
      setCurrentQuestion(question);
      setQuestionShownAt(Date.now());
      setPhase('active');
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start assessment");
      setPhase('error');
    }
  };

  const handleNext = async () => {
    if (!currentAnswer.trim() || !sessionId || !token) return;

    const elapsedMs = Date.now() - questionShownAt;

    // Optimistically clear the answer so user knows it's processing
    const submittedAnswer = currentAnswer;
    setCurrentAnswer("");
    setCurrentQuestion("Loading next question...");

    try {
      await submitTurn(sessionId, submittedAnswer, elapsedMs, token);
      // We don't change state here. We wait for the SSE stream to push the next question.
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit answer");
    }
  };

  const handleReturnToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <>
      <main className="flex-1 p-5 overflow-y-auto h-full w-full mx-auto scrollbar-hide flex flex-col relative z-0">
        {['idle', 'paying', 'confirming', 'analyzing'].includes(phase) ? (
          <>
            <div className={`flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full transition-all duration-300 ${phase !== 'idle' ? 'blur-md pointer-events-none opacity-50' : ''}`}>
              {/* Left Column */}
              <div className="flex-1 space-y-10">
                {/* Badge & Title */}
                <div>
                  <div className="flex flex-row flex-wrap justify-between mb-6">
                    <div className="flex flex-col items-start justify-start gap-1">
                      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        Assessment
                      </h1>
                      <p className="text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed">
                        Advanced Solana Engineering Certification.
                      </p>
                    </div>

                    <div className="mt-6 lg:hidden">
                      <button
                        onClick={() => setPhase('paying')}
                        className="min-w-fit bg-primary-container hover:bg-primary-fixed-dim/90 text-white font-medium py-2.5 px-6 text-base rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        Start Assessment
                      </button>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-x-12 gap-y-6 py-6 border-y border-white/5">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Duration</div>
                      <div className="flex items-center gap-2 text-white font-medium text-sm">
                        <Clock className="w-4 h-4 text-white/70" />
                        30-45 Minutes
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Questions</div>
                      <div className="flex items-center gap-2 text-white font-medium text-sm">
                        <HelpCircle className="w-4 h-4 text-white/70" />
                        15-20 Questions
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Status</div>
                      <div className="flex items-center gap-2 text-[#4edea3] font-medium text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Ready to Start
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Passing Score</div>
                      <div className="flex items-center gap-2 text-white font-medium text-sm">
                        <Flag className="w-4 h-4 text-white/70" />
                        70+ (7/10 in Security)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Prerequisites */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Technical Prerequisites</h2>
                  <div className="bg-surface-container-lowest/30 border border-white/5 rounded-xl p-6 space-y-6">
                    <div className="flex items-start gap-4">
                      <Code2 className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-white font-semibold mb-1">Intermediate at Solana development</h3>
                        <p className="text-white/50 text-sm leading-relaxed">You should be comfortable with reading, debugging, and writing secure Solana programs, including understanding account models and basic security practices.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Sidebar) */}
              <div className="w-full hidden lg:block lg:w-[380px] shrink-0">
                <div className="bg-surface-container-lowest/50 border border-white/5 rounded-xl p-8 sticky top-8">
                  <h2 className="text-xl font-bold text-white mb-3">Ready to begin?</h2>
                  <p className="text-white/50 text-sm leading-relaxed mb-8">
                    Once the assessment begins, it cannot be paused, cancelled, or abandoned. Navigation is strictly forward-only, so you will not be able to return to previous questions.
                  </p>
                  <button
                    onClick={() => setPhase('paying')}
                    className="w-full bg-primary-container hover:bg-primary-fixed-dim/90 text-white font-medium py-3 text-base rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>

            {phase !== 'idle' && (
              <div className="absolute inset-0 w-full h-full z-60 flex items-center justify-center">
                <div className="absolute w-full h-full inset-0 bg-background/60 backdrop-blur-sm" onClick={() => phase === 'paying' && setPhase('idle')}></div>
                <div className="relative flex p-5 items-center justify-center w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 z-10">
                  {phase === 'paying' && (
                    <button
                      onClick={() => setPhase('idle')}
                      className="absolute top-6 right-6 p-2 text-white hover:text-white transition-colors z-20 cursor-pointer rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}

                  {phase === 'paying' && <SolTransferCard onPaymentSuccess={handlePaymentSuccess} />}

                  {phase === 'confirming' && (
                    <div className="bg-surface-container-lowest p-8 rounded-xl border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-[#4edea3]/10 flex items-center justify-center mb-6 border border-[#4edea3]/20">
                          <CheckCircle className="w-8 h-8 text-[#4edea3]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">
                          Payment Confirmed
                        </h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-8">
                          Warning: Once the assessment starts, it cannot be paused, cancelled, or abandoned. Navigation is strictly forward-only.
                        </p>
                        <button
                          onClick={handleBeginAssessment}
                          className="w-full bg-primary-container hover:bg-primary-fixed-dim/85 text-white font-medium py-3 text-base rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          I Understand, Begin Now
                        </button>
                      </div>
                    </div>
                  )}

                  {phase === 'analyzing' && (
                    <div className="bg-surface-container-lowest p-8 rounded-xl border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6 glow-effect"></div>
                        <h3 className="text-xl text-center font-bold text-white mb-2">Preparing Assessment</h3>
                        <p className="text-white/50 text-sm text-center">Connecting to secure environment...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : phase !== 'complete' ? (
          <>
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface mb-3">
                Assessment
              </h1>
              <p className="text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed mb-6">
                Complete your formal Solana development assessment for certification.
              </p>

              {phase === 'active' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-data text-xs text-on-surface-variant uppercase tracking-widest">
                      Question {questionCount}
                    </span>
                    <span className="font-mono-data text-xs text-primary">Active</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-out w-full animate-pulse"
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-8">
                {errorMsg}
              </div>
            )}

            {phase === 'active' && (
              <>
                {/* Question Area */}
                <div className="bg-surface-container/20 border border-white/5 rounded-xl overflow-hidden shadow-2xl mb-8 flex flex-col grow">
                  <div className="flex flex-row gap-4 bg-surface-container/40 backdrop-blur-md p-8 md:p-10 border-b border-white/5 relative">
                    <div className="pt-1">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="relative z-10 font-body-main text-lg text-on-surface leading-snug font-medium">
                      {currentQuestion}
                    </h2>
                  </div>

                  <div className="p-8 md:p-12 bg-surface-container-lowest/30 flex flex-col grow relative">
                    <label htmlFor="answer" className="font-label-caps text-xs text-primary tracking-widest mb-6 flex items-center gap-2 opacity-80">
                      YOUR ANSWER
                    </label>
                    <textarea
                      id="answer"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Provide your comprehensive answer here..."
                      className="w-full bg-transparent text-on-surface text-base leading-relaxed focus:outline-none resize-none grow min-h-[160px] placeholder:text-on-surface-variant/30 scrollbar-hide"
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={!currentAnswer.trim() || currentQuestion === "Loading next question..."}
                    className="bg-primary text-on-primary-fixed px-8 py-3 rounded-lg font-label-caps text-xs hover:bg-primary-fixed transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          /* Premium Results Screen */
          <div className="grow flex flex-col items-center justify-center w-full px-4 py-8">
            <div className="max-w-6xl w-full">
              <div className="flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-bottom-4">
                <div className={`w-24 h-24 rounded-full ${result?.verdict === 'pass' ? 'bg-primary-container/10 border-primary-container/30' : 'bg-error-container/10 border-error-container/30'} border-2 flex items-center justify-center mb-6`}>
                  {result?.verdict === 'pass' ? (
                    <CheckCircle className="w-12 h-12 text-primary-container" />
                  ) : (
                    <XCircle className="w-12 h-12 text-error-container" />
                  )}
                </div>
                <h2 className="font-h2 text-4xl md:text-5xl text-white font-black mb-4 tracking-tight">
                  {result?.verdict === 'pass' ? 'Assessment Passed' : 'Assessment Failed'}
                </h2>
                {result?.verdict === 'pass' && (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/15 border border-primary-container/30 font-mono-data text-sm text-primary-container uppercase tracking-widest">
                    <Sparkles className="w-4 h-4 text-primary-container" />
                    Level 1 Certified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full animate-in fade-in slide-in-from-bottom-4 delay-200">
                {/* Left Column: Summary & Scores */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                  {/* Summary Card */}
                  <div className="bg-surface-container-lowest/50 border border-white/5 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                      <FileText className="w-32 h-32 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" /> Evaluation Summary
                    </h3>
                    <p className="text-white/70 leading-relaxed text-lg">
                      {result?.summary || "You have completed the assessment. Check your detailed score below."}
                    </p>
                  </div>

                  {/* Skill Breakdown */}
                  <div className="bg-surface-container-lowest/50 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
                    <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2">
                      <Network className="w-5 h-5 text-primary" /> Skill Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      {Object.entries(result?.scores || {}).map(([key, value]: [string, any]) => {
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        const percent = Math.min(100, value > 10 ? value : value * 10);
                        const isGood = percent >= 70;
                        const isWarn = percent >= 50 && percent < 70;

                        return (
                          <div key={key}>
                            <div className="flex justify-between items-end mb-2">
                              <span className="text-white/80 font-medium text-sm">{label}</span>
                              <span className={`font-mono text-sm font-bold ${isGood ? 'text-primary' : isWarn ? 'text-yellow-400' : 'text-error-container'}`}>
                                {value}{value <= 10 ? '/10' : '/100'}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${isGood ? 'bg-primary' : isWarn ? 'bg-yellow-400' : 'bg-red-400'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Gaps (Only if failed or present) */}
                  {result?.gaps && result.gaps.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 backdrop-blur-md">
                      <h3 className="text-red-400 font-bold text-xl mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" /> Knowledge Gaps Identified
                      </h3>
                      <ul className="grid grid-cols-1 gap-3">
                        {result.gaps.map((gap: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 bg-black/20 p-4 rounded-xl border border-red-500/10">
                            <MinusCircle className="w-5 h-5 text-red-500/70 shrink-0 mt-0.5" />
                            <span className="text-red-100/80 leading-relaxed">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Column: Score & Actions */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                  {/* Overall Score */}
                  <div className="bg-surface-container-lowest/50 border border-white/5 rounded-2xl p-8 backdrop-blur-md flex flex-col items-center justify-center py-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none"></div>
                    <span className="font-mono-data text-xs text-white/50 mb-4 uppercase tracking-widest font-bold">Overall Score</span>
                    <div className="relative flex items-center justify-center">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="12"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke={result?.verdict === 'pass' ? '#4edea3' : '#ef4444'}
                          strokeWidth="12"
                          strokeDasharray="439.8"
                          strokeDashoffset={439.8 - (439.8 * (result?.score || 0)) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className={`text-5xl font-black ${result?.verdict === 'pass' ? 'text-[#4edea3]' : 'text-red-500'}`}>
                          {result?.score}
                        </span>
                        <span className="text-white/40 text-sm mt-1">/ 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-4">
                    {result?.verdict === 'pass' ? (
                      <button
                        className="w-full bg-primary hover:bg-primary text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <Award className="w-5 h-5" /> Mint NFT Credential
                      </button>
                    ) : (
                      <button
                        className="w-full bg-surface-container-highest hover:bg-surface-bright text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/10 cursor-pointer"
                        onClick={() => window.location.reload()}
                      >
                        Retake Assessment
                      </button>
                    )}
                    <button
                      onClick={handleReturnToDashboard}
                      className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white/70 hover:text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
