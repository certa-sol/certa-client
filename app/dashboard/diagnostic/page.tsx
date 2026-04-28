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

import { API_BASE_URL } from "@/lib/auth";
import { startDiagnostic, submitTurn } from "@/lib/api";
// Imports combined above

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
  const [error, setError] = useState<string | null>(null);

  const questionStartTime = useRef<number>(0);
  const eventSource = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (eventSource.current) {
        eventSource.current.close();
      }
    };
  }, []);

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
        setError(data.error);
        return;
      }
      
      if (data.complete) {
        setIsFinished(true);
        setSessionResult(data);
        setIsAnalyzing(false);
        es.close();
      } else if (data.question) {
        setCurrentQuestion(data.question);
        setQuestionCount(prev => prev + 1);
        setIsAnalyzing(false);
        questionStartTime.current = Date.now();
        setTimeLeft(30);
      }
    };

    es.onerror = () => {
      console.error("SSE connection error");
      // Optional: implement reconnect logic
    };

    eventSource.current = es;
  };

  const handleStart = async () => {
    try {
      setHasStarted(true);
      setIsAnalyzing(true);
      setError(null);
      const data = await startDiagnostic(token);
      setSessionId(data.sessionId);
      setCurrentQuestion(data.question);
      setQuestionCount(1);
      questionStartTime.current = Date.now();
      setTimeLeft(30);
      setupSSE(data.sessionId);
      setIsAnalyzing(false);
    } catch (err) {
      setError("Failed to start diagnostic session");
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
      setError("Failed to submit answer");
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
              Evaluate your Solana development skills powered by Claude AI.
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
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
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
              <p className="font-body-main text-on-surface-variant">Claude is reviewing your answers and mapping your Solana skill topology...</p>
            </div>
          ) : sessionResult ? (
            <div className="flex flex-col max-w-2xl items-center py-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 glow-effect">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-h2 text-3xl text-on-surface font-bold mb-3">Diagnostic Complete!</h2>
              <p className="font-body-main text-on-surface-variant mb-8 text-center">
                {sessionResult.summary || "Based on your responses, you show a strong understanding of core Solana concepts. You are recommended to proceed to the paid assessment for certification."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8 text-left">
                {sessionResult.scores && Object.entries(sessionResult.scores).map(([topic, score]) => (
                  <div key={topic} className="bg-surface-container-lowest p-4 rounded-lg border border-white/5">
                    <span className="block font-mono-data text-xs text-on-surface-variant mb-1 uppercase">{topic}</span>
                    <span className="font-bold text-primary">{score as number}/10</span>
                  </div>
                ))}
              </div>

              {sessionResult.gaps && sessionResult.gaps.length > 0 && (
                <div className="w-full mb-8 text-left bg-surface-container/30 p-6 rounded-xl border border-white/5">
                  <h3 className="font-h2 text-lg text-on-surface mb-3">Identified Gaps</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {sessionResult.gaps.map((gap: string, i: number) => (
                      <li key={i} className="text-on-surface-variant text-sm">{gap}</li>
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
