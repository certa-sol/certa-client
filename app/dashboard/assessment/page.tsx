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
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SolTransferCard } from "@/components/SolTransferCard";
import { verifyPayment, startAssessment, submitTurn, getSessionResult } from "@/lib/api";
import { openStream } from "@/lib/stream";
import toast from "react-hot-toast";
import console from "console";

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
      (res) => {
        setResult(res);
        setPhase('complete');
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
      {/* Background Glow Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
      </div>

      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none -z-20 opacity-50"></div>

      <main className="flex-1 overflow-y-auto p-6 md:p-3 w-full mx-auto scrollbar-hide flex flex-col relative z-0">
        {['idle', 'paying', 'confirming', 'analyzing'].includes(phase) ? (
          <>
            <div className={`flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full pt-4 md:pt-8 transition-all duration-300 ${phase !== 'idle' ? 'blur-md pointer-events-none opacity-50' : ''}`}>
              {/* Left Column */}
              <div className="flex-1 space-y-10">
                {/* Badge & Title */}
                <div>
                  <div className="flex flex-col items-start justify-start gap-1">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                      Assessment
                    </h1>
                    <p className="text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed mb-6">
                      Advanced Solana Engineering Certification.
                    </p>
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
              <div className="w-full lg:w-[380px] shrink-0">
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
              <div className="fixed inset-0 top-16 left-64 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-xs" onClick={() => phase === 'paying' && setPhase('idle')}></div>
                <div className="flex items-center justify-center w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 z-10">
                  {phase === 'paying' && (
                    <button
                      onClick={() => setPhase('idle')}
                      className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-20 cursor-pointer"
                    >
                      <X className="w-6 h-6 text-on-background" />
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
                        <h3 className="text-xl font-bold text-white mb-2">Preparing Assessment</h3>
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
          /* Results Screen */
          <div className="grow flex items-center justify-center">
            <div className="flex flex-col max-w-2xl w-full items-center py-4 text-center">
              <div className={`w-20 h-20 rounded-full ${result?.verdict === 'pass' ? 'bg-primary/10 border-primary/30' : 'bg-red-500/10 border-red-500/30'} border flex items-center justify-center mb-6 glow-effect animate-in zoom-in-95`}>
                {result?.verdict === 'pass' ? (
                  <CheckCircle className="w-10 h-10 text-primary" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-500" />
                )}
              </div>
              <h2 className="font-h2 text-3xl text-on-surface font-bold mb-3 animate-in fade-in slide-in-from-bottom-4">
                {result?.verdict === 'pass' ? 'Assessment Passed!' : 'Assessment Failed'}
              </h2>

              {result?.verdict === 'pass' && (
                <span className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 font-mono-data text-xs text-primary uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 delay-100">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Level 1 Certified
                </span>
              )}

              <p className="font-body-main text-on-surface-variant mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-4 delay-200">
                {result?.summary || "You have completed the assessment. Check your detailed score below."}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mb-8 text-left">
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-white/5 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 delay-300">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Award className={`w-12 h-12 ${result?.verdict === 'pass' ? 'text-primary' : 'text-red-500'}`} />
                  </div>
                  <span className="block font-mono-data text-xs text-on-surface-variant mb-1 uppercase tracking-widest">SCORE</span>
                  <span className={`font-bold ${result?.verdict === 'pass' ? 'text-primary' : 'text-red-500'} text-2xl`}>
                    {result?.score}%
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-white/5 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 delay-300">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Shield className="w-12 h-12 text-on-surface-variant" />
                  </div>
                  <span className="block font-mono-data text-xs text-on-surface-variant mb-1 uppercase tracking-widest">
                    {result?.verdict === 'pass' ? 'CERTIFICATE ID' : 'STATUS'}
                  </span>
                  <span className="font-bold text-on-surface text-lg font-mono">
                    {result?.verdict === 'pass' ? 'PENDING MINT' : 'NOT ISSUED'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full animate-in fade-in slide-in-from-bottom-4 delay-500">
                <button
                  onClick={handleReturnToDashboard}
                  className="flex-1 bg-surface-container-highest text-on-surface px-6 py-4 rounded-lg font-label-caps text-xs hover:bg-surface-bright transition-all active:scale-95"
                >
                  Return to Dashboard
                </button>
                {result?.verdict === 'pass' && (
                  <button
                    className="flex-1 bg-primary text-on-primary-fixed px-6 py-4 rounded-lg font-label-caps text-xs hover:bg-primary-fixed transition-all active:scale-95 glow-hover shadow-[0_0_20px_rgba(78,222,163,0.2)]"
                  >
                    Mint NFT Credential
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
