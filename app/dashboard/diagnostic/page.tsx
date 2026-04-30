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
    <main className="flex-1 overflow-y-auto p-6 md:p-8 w-full mx-auto scrollbar-hide flex flex-col">
      {!isFinished ? (
        <>
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface mb-3">
              Diagnostic
            </h1>
            <p className="text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed mb-6">
              Evaluate your Solana development skills.
            </p>

            {!hasStarted ? (
              <button
                onClick={handleStart}
                disabled={isAnalyzing}
                className="bg-primary text-on-primary-fixed cursor-pointer px-6 py-3 rounded-lg font-label-caps text-xs hover:bg-primary-fixed transition-all active:scale-95 inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? "Starting..." : "Start Diagnostic"}
              </button>
            ) : (
              /* Diagnostic Info */
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-data text-xs text-on-surface-variant uppercase tracking-widest">
                  Question {questionCount}
                </span>
                {isAnalyzing ? (
                  <span className="font-mono-data text-xs text-primary animate-pulse">Processing...</span>
                ) : (
                  <span className={`font-mono-data text-xs ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                    Time Left: {timeLeft}s
                  </span>
                )}
              </div>
            )}
          </div>

          {hasStarted && (
            <>
              {/* Question Area */}
              <div className="bg-surface-container/20 border border-white/5 rounded-xl overflow-hidden shadow-2xl mb-8 flex flex-col grow">
                {/* Top half: The Question */}
                <div className="flex flex-row gap-4 bg-surface-container/40 backdrop-blur-md p-8 md:p-10 border-b border-white/5 relative">
                  <div className="pt-1">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="relative z-10 font-body-main text-lg text-on-surface leading-snug font-medium">
                    {currentQuestion || "Loading question..."}
                  </h2>
                </div>

                {/* Bottom half: The Answer */}
                <div className="p-8 md:p-12 bg-surface-container-lowest/30 flex flex-col grow relative">
                  <label htmlFor="answer" className="font-label-caps text-xs text-primary tracking-widest mb-6 flex items-center gap-2 opacity-80">
                    YOUR ANALYSIS
                  </label>
                  <textarea
                    id="answer"
                    value={currentAnswer}
                    onChange={(e) => updateAnswer(e.target.value)}
                    disabled={isAnalyzing}
                    placeholder={isAnalyzing ? "Waiting for next question..." : "Break down your analysis here. Be as detailed as possible..."}
                    className="w-full bg-transparent text-on-surface text-base leading-relaxed focus:outline-none resize-none grow min-h-[160px] placeholder:text-on-surface-variant/30 scrollbar-hide disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={isAnalyzing}
                  className="bg-primary text-on-primary-fixed px-8 py-3 rounded-lg font-label-caps text-xs hover:bg-primary-fixed transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? "Submitting..." : "Submit Answer"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        /* Results Screen */
        <div className="grow flex items-center justify-center">

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6 glow-effect"></div>
              <h2 className="font-h2 text-2xl text-on-surface font-bold mb-2">Analyzing Responses</h2>
              <p className="font-body-main text-on-surface-variant">Reviewing your answers and mapping your Solana skill topology...</p>
            </div>
          ) : sessionResult ? (
            <div className="flex flex-col max-w-2xl w-full items-center py-4">
              {/* Icon + Title */}
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 glow-effect">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-h2 text-3xl text-on-surface font-bold mb-3">Diagnostic Complete!</h2>

              {/* Verdict badge */}
              {sessionResult.verdict && (
                <span className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 font-mono-data text-xs text-primary uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  {sessionResult.verdict}
                </span>
              )}

              {/* Summary */}
              <p className="font-body-main text-on-surface-variant mb-8 text-center leading-relaxed">
                {sessionResult.summary || "Based on your responses, you show a strong understanding of core Solana concepts."}
              </p>

              {/* Scores */}
              {sessionResult.scores && Object.keys(sessionResult.scores).length > 0 && (
                <div className="w-full mb-8 text-left bg-surface-container/30 p-6 rounded-xl border border-white/5">
                  <h3 className="font-h2 text-sm font-semibold text-on-surface mb-4 uppercase tracking-widest">Skill Scores</h3>
                  <div className="space-y-3">
                    {Object.entries(sessionResult.scores).map(([topic, score]) => {
                      const pct = Math.round(((score as number) / 10) * 100);
                      return (
                        <div key={topic}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono-data text-xs text-on-surface-variant uppercase">{topic}</span>
                            <span className="font-mono-data text-xs text-primary font-bold">{score as number}/10</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Identified Gaps */}
              {sessionResult.gaps && sessionResult.gaps.length > 0 && (
                <div className="w-full mb-8 text-left bg-surface-container/30 p-6 rounded-xl border border-white/5">
                  <h3 className="font-h2 text-sm font-semibold text-on-surface mb-3 uppercase tracking-widest">Identified Gaps</h3>
                  <ul className="space-y-2">
                    {sessionResult.gaps.map((gap: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-on-surface-variant text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Resources */}
              {sessionResult.resources && sessionResult.resources.length > 0 && (
                <div className="w-full mb-8 text-left bg-surface-container/30 p-6 rounded-xl border border-white/5">
                  <h3 className="font-h2 text-sm font-semibold text-on-surface mb-3 uppercase tracking-widest">Recommended Resources</h3>
                  <ul className="space-y-2">
                    {sessionResult.resources.map((url: string, i: number) => (
                      <li key={i}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary text-sm hover:underline underline-offset-4 break-all"
                        >
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleReturnToDashboard}
                className="bg-primary text-on-primary-fixed px-6 py-4 rounded-lg font-label-caps text-xs hover:bg-primary-fixed transition-all active:scale-95 cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
