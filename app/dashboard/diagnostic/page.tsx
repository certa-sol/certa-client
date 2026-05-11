"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  BrainCircuit,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Clock,
  HelpCircle,
  CheckCircle2,
  Target,
  Code2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { API_BASE_URL } from "@/lib/auth";
import { startDiagnostic, submitTurn, getSessionResult } from "@/lib/api";

export default function DiagnosticPage() {
  const { isConnected, token } = useSelector((state: RootState) => state.wallet);
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const currentAnswerRef = useRef("");
  const [timeLeft, setTimeLeft] = useState(30);

  const updateAnswer = (val: string) => {
    setCurrentAnswer(val);
    currentAnswerRef.current = val;
  };
  const [questionCount, setQuestionCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionResult, setSessionResult] = useState<any>(null);

  const questionStartTime = useRef<number>(0);
  const eventSource = useRef<EventSource | null>(null);

  /** Fetch the result once after SSE completes. */
  const fetchAndApplyResult = useCallback(async (sid: string, tk: string) => {
    try {
      const result = await getSessionResult(sid, tk);
      if (result.status === "complete") {
        setSessionResult(result);
        setIsFinished(true);
        setIsAnalyzing(false);
        sessionStorage.removeItem("certa_session_id");
      }
    } catch {
      // Non-fatal — SSE result is already displayed
    }
  }, []);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSource.current) {
        eventSource.current.close();
      }
    };
  }, []);

  // On reload: if a session was in-flight, fetch once.
  // If complete → show results. If still active → clear and let user start fresh.
  useEffect(() => {
    if (!token) return;
    const storedId = sessionStorage.getItem("certa_session_id");
    if (!storedId) return;

    (async () => {
      try {
        const result = await getSessionResult(storedId, token);
        if (result.status === "complete") {
          setSessionResult(result);
          setIsFinished(true);
          sessionStorage.removeItem("certa_session_id");
        } else {
          // Session was in-progress — auto-end it, start fresh
          sessionStorage.removeItem("certa_session_id");
        }
      } catch {
        sessionStorage.removeItem("certa_session_id");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!isConnected || !token) {
    return null;
  }

  const setupSSE = (sid: string) => {
    if (eventSource.current) {
      eventSource.current.close();
    }
    const es = new EventSource(`${API_BASE_URL}/api/session/${sid}/stream?token=${token}`);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);

      console.log(data);

      if (data.heartbeat) return;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.complete) {
        setIsFinished(true);
        setIsAnalyzing(true); // show spinner while we fetch canonical result
        toast.success("Diagnostic complete!");
        es.close();
        // Fetch the authoritative result from the REST endpoint
        fetchAndApplyResult(sid, token);
      } else if (data.question) {
        setCurrentQuestion(data.question);
        setQuestionCount(prev => prev + 1);
        setIsAnalyzing(false);
        questionStartTime.current = Date.now();
        setTimeLeft(30);
      }
    };

    es.onerror = () => {
      toast.error("Connection lost. Please refresh and try again.", { id: 'sse-error' });
    };

    eventSource.current = es;
  };

  const handleStart = async () => {
    try {
      setHasStarted(true);
      setIsAnalyzing(true);
      const data = await startDiagnostic(token);
      setSessionId(data.sessionId);
      sessionStorage.setItem("certa_session_id", data.sessionId);
      setCurrentQuestion(data.question);
      setQuestionCount(1);
      questionStartTime.current = Date.now();
      setTimeLeft(30);
      setupSSE(data.sessionId);
      setIsAnalyzing(false);
    } catch (err) {
      toast.error("Failed to start diagnostic session");
      setHasStarted(false);
      setIsAnalyzing(false);
    }
  };

  const handleNext = useCallback(async () => {
    if (!sessionId) return;

    const finalAnswer = currentAnswerRef.current.trim() ? currentAnswerRef.current : "No answer provided";
    const elapsedMs = Date.now() - questionStartTime.current;
    setIsAnalyzing(true);

    try {
      await submitTurn(sessionId, finalAnswer, elapsedMs, token);
      updateAnswer("");
    } catch (err) {
      toast.error("Failed to submit answer");
      setIsAnalyzing(false);
    }
  }, [sessionId, token]);

  useEffect(() => {
    if (!hasStarted || isAnalyzing || isFinished) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime.current) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        handleNext();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isAnalyzing, isFinished, handleNext]);

  const handleReturnToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <main className="flex-1 overflow-y-auto p-5 w-full mx-auto scrollbar-hide flex flex-col">
      {!isFinished ? (
        <>
          {!hasStarted ? (
            <div className={`flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full transition-all duration-300 ${isAnalyzing ? 'blur-md pointer-events-none opacity-50' : ''}`}>
              {/* Left Column */}
              <div className="flex-1 space-y-10">
                {/* Badge & Title */}
                <div>
                  <div className="flex flex-row flex-wrap justify-between mb-6">
                    <div className="flex flex-col items-start justify-start gap-1">
                      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                        Diagnostic
                      </h1>
                      <p className="text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed">
                        Evaluate your Solana development skills.
                      </p>
                    </div>

                    <div className="mt-6 lg:hidden">
                      <button
                        onClick={handleStart}
                        disabled={isAnalyzing}
                        className="min-w-fit bg-primary-container hover:bg-primary-fixed-dim/90 text-white font-medium py-2.5 px-6 text-base rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        {isAnalyzing ? "Starting..." : "Start Diagnostic"}
                      </button>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-x-12 gap-y-6 py-6 border-y border-white/5">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Duration</div>
                      <div className="flex items-center gap-2 text-white font-medium text-sm">
                        <Clock className="w-4 h-4 text-white/70" />
                        15-20 Minutes
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Questions</div>
                      <div className="flex items-center gap-2 text-white font-medium text-sm">
                        <HelpCircle className="w-4 h-4 text-white/70" />
                        ~10 Adaptive Questions
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
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Type</div>
                      <div className="flex items-center gap-2 text-white font-medium text-sm">
                        <Target className="w-4 h-4 text-white/70" />
                        Skill Mapping
                      </div>
                    </div>
                  </div>
                </div>

                {/* What to Expect */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">What to Expect</h2>
                  <div className="bg-surface-container-lowest/30 border border-white/5 rounded-xl p-6 space-y-6">
                    <div className="flex items-start gap-4">
                      <BrainCircuit className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-white font-semibold mb-1">Adaptive Questioning</h3>
                        <p className="text-white/50 text-sm leading-relaxed">The diagnostic engine will adjust the difficulty of questions based on your previous answers to accurately gauge your current proficiency level.</p>
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
                    Take your time to answer the questions thoughtfully. Your results will help personalize your learning path and recommend the most suitable resources.
                  </p>
                  <button
                    onClick={handleStart}
                    disabled={isAnalyzing}
                    className="w-full bg-primary-container hover:bg-primary-fixed-dim/90 text-white font-medium py-3 text-base rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAnalyzing ? "Starting..." : "Start Diagnostic"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="">
                <div className="flex flex-col items-start justify-start gap-1 mb-6">
                  <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                    Diagnostic
                  </h1>
                  <p className="text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed">
                    Evaluate your Solana development skills.
                  </p>
                </div>

                {/* Diagnostic Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm font-bold">
                      {questionCount}
                    </div>
                    <span className="font-mono-data text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-60">
                      Question Progress
                    </span>
                  </div>
                  {isAnalyzing ? (
                    <span className="font-mono-data text-[10px] text-primary font-bold uppercase tracking-widest">Processing...</span>
                  ) : (
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-mono-data text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                        {timeLeft}s Remaining
                      </span>
                      <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${(timeLeft / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Area */}
              <div className="bg-surface-container-lowest/50 border border-white/10 rounded-2xl overflow-hidden shadow-xl mb-8 flex flex-col grow">
                {/* Question Section */}
                <div className="bg-surface-container/40 p-6 md:p-6 border-b border-white/5 backdrop-blur-sm">
                  <div className="flex items-start gap-5">
                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                      <BrainCircuit className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-60">Question</span>
                      <h2 className="text-lg md:text-xl text-white font-medium leading-relaxed tracking-tight">
                        {currentQuestion || "Preparing question..."}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Answer Section */}
                <div className="p-6 md:p-8 flex flex-col grow relative bg-surface-container-lowest/20">
                  <div className="flex items-center justify-between mb-4">
                    <label htmlFor="answer" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">
                      Your Answer
                    </label>
                  </div>

                  <textarea
                    id="answer"
                    value={currentAnswer}
                    onChange={(e) => updateAnswer(e.target.value)}
                    disabled={isAnalyzing}
                    placeholder="Provide a detailed technical breakdown..."
                    className="w-full bg-transparent text-on-surface text-md leading-relaxed focus:outline-none resize-none grow min-h-[220px] placeholder:text-on-surface-variant/20 scrollbar-hide disabled:opacity-50 font-light"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div />
                <button
                  onClick={handleNext}
                  disabled={isAnalyzing || !currentAnswer.trim()}
                  className="w-full sm:w-auto bg-primary text-on-primary-fixed px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-fixed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? "Processing..." : "Submit Answer"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        /* Results Screen */
        <div className="grow flex flex-col items-center justify-center w-full px-4 py-8">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl text-on-surface font-bold mb-2">Analyzing Responses</h2>
              <p className="text-on-surface-variant text-center max-w-80">Reviewing your answers and mapping your Solana skill topology...</p>
            </div>
          ) : sessionResult ? (
            <div className="max-w-5xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Header section */}
              <div className="flex flex-col items-center text-center mb-12">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Diagnostic Complete</h2>
                {sessionResult.verdict && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono-data text-xs uppercase tracking-widest font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    {sessionResult.verdict}
                  </div>
                )}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left side: Summary & Gaps */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="bg-surface-container-lowest/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 opacity-70">Executive Summary</h3>
                    <p className="text-on-surface-variant text-lg leading-relaxed font-light">
                      {sessionResult.summary || "Based on your responses, you show a strong understanding of core Solana concepts."}
                    </p>
                  </div>

                  {sessionResult.gaps && sessionResult.gaps.length > 0 && (
                    <div className="bg-surface-container-lowest/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                      <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-6 opacity-70">Focus Areas for Improvement</h3>
                      <ul className="space-y-4">
                        {sessionResult.gaps.map((gap: string, i: number) => (
                          <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/2 border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-2 shrink-0"></div>
                            <span className="text-on-surface-variant text-sm leading-relaxed">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right side: Scores & Resources */}
                <div className="lg:col-span-5 space-y-8">
                  {(sessionResult.scores || sessionResult.topicScores) && (
                    <div className="bg-surface-container-lowest/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                      <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-6 opacity-70">Skill Metrics</h3>
                      <div className="space-y-5">
                        {Object.entries(sessionResult.topicScores || sessionResult.scores || {}).map(([topic, score]) => {
                          const pct = Math.round(((score as number) / 10) * 100);
                          const label = topic.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          const isHigh = pct >= 75;
                          const isMid = pct >= 45 && pct < 75;

                          return (
                            <div key={topic}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-mono-data text-xs text-on-surface-variant/80 uppercase tracking-wider">{label}</span>
                                <span className={`font-mono-data text-xs font-bold ${isHigh ? 'text-[#4edea3]' : isMid ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {score as number}/10
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

                  {sessionResult.resources && sessionResult.resources.length > 0 && (
                    <div className="bg-surface-container-lowest/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                      <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-6 opacity-70">Curated Learning Path</h3>
                      <div className="space-y-3">
                        {sessionResult.resources.map((url: string, i: number) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5 text-primary text-xs hover:bg-primary/5 transition-all group"
                          >
                            <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                            <span className="truncate">{url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleReturnToDashboard}
                    className="w-full bg-primary text-on-primary-fixed py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-fixed transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
