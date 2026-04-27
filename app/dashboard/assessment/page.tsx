"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  ArrowRight,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

const mockQuestions = [
  "Can you explain the nuances of Cross-Program Invocation (CPI) and how privilege escalation is prevented?",
  "How do you handle large data sets in Solana programs given the 10MB account size limit?",
  "Describe the process of optimizing compute units for a complex Solana smart contract.",
];

export default function AssessmentPage() {
  const { isConnected } = useSelector((state: RootState) => state.wallet);
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  if (!isConnected) {
    return null;
  }

  const progressPercentage = ((currentIndex) / mockQuestions.length) * 100;

  const handleNext = () => {
    if (!currentAnswer.trim()) return;

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentIndex < mockQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
      setIsAnalyzing(true);

      // Fake API delay for analyzing results
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 3000);
    }
  };

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
              Assessment
            </h1>
            <p className="text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed mb-6">
              Complete your formal Solana development assessment for certification.
            </p>

            {!hasStarted ? (
              <button
                onClick={() => setHasStarted(true)}
                className="bg-primary text-on-primary-fixed cursor-pointer px-6 py-3 rounded-lg font-label-caps text-xs hover:bg-primary-fixed transition-all active:scale-95 inline-flex items-center gap-2"
              >
                Start Assessment
              </button>
            ) : (
              /* Progress Bar */
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-data text-xs text-on-surface-variant uppercase tracking-widest">
                    Question {currentIndex + 1} of {mockQuestions.length}
                  </span>
                  <span className="font-mono-data text-xs text-primary">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
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
                    {mockQuestions[currentIndex]}
                  </h2>
                </div>

                {/* Bottom half: The Answer */}
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
                  disabled={!currentAnswer.trim()}
                  className="bg-primary text-on-primary-fixed px-8 py-3 rounded-lg font-label-caps text-xs hover:bg-primary-fixed transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentIndex === mockQuestions.length - 1 ? "Submit Assessment" : "Next Question"}
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
            <div className="flex flex-col items-center w-full h-full justify-center py-8">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6 glow-effect"></div>
              <h2 className="font-h2 text-2xl text-on-surface font-bold mb-2">Grading Assessment</h2>
              <p className="font-body-main text-on-surface-variant">Our AI is meticulously reviewing your submission...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 glow-effect">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-h2 text-3xl text-on-surface font-bold mb-3">Assessment Passed!</h2>
              <p className="font-body-main text-on-surface-variant mb-8">
                Congratulations! You have successfully passed the Solana developer assessment and earned your certification.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mb-8 text-left">
                <div className="bg-surface-container-lowest p-4 rounded-lg border border-white/5">
                  <span className="block font-mono-data text-xs text-on-surface-variant mb-1">SCORE</span>
                  <span className="font-bold text-primary">94%</span>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-lg border border-white/5">
                  <span className="block font-mono-data text-xs text-on-surface-variant mb-1">CERTIFICATE ID</span>
                  <span className="font-bold text-tertiary-fixed-dim">CERT-8902</span>
                </div>
              </div>

              <button
                onClick={handleReturnToDashboard}
                className="w-full bg-primary text-on-primary-fixed px-6 py-4 rounded-lg font-label-caps text-xs hover:bg-primary-fixed transition-all active:scale-95 glow-hover"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
