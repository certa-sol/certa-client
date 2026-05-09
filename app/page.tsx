"use client";

import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ArrowRight, MessageSquare, Shield, Award, Brain, CreditCard, Globe, Sparkles, Fingerprint, Eye, BarChart3, Lock, CheckCircle2, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const howItWorksSteps = [
  {
    num: "01",
    title: "Free Diagnostic",
    description: "Take a free adaptive interview. 8-12 questions that map your Solana knowledge across 6 core topic areas.",
    icon: Brain,
  },
  {
    num: "02",
    title: "Paid Assessment",
    description: "Ready for certification? Pay 0.5 SOL or 10 USDC to unlock the full-depth assessment. 15-20 rigorous questions with follow-up probing.",
    icon: CreditCard,
  },
  {
    num: "03",
    title: "Earn Credential",
    description: "Score 70+ to pass. Your verified credential is minted as an immutable NFT directly to your Solana wallet. Metadata stored on Arweave.",
    icon: Award,
  },
  {
    num: "04",
    title: "Public Verification",
    description: "Share your credential URL. Anyone can verify your skills by looking up the NFT on-chain. No middleman, no expiry.",
    icon: Globe,
  }
];

const featuresList = [
  {
    title: "AI-Adaptive Interview",
    description: "The question difficulty is adjusted in real-time based on your responses. Strong answers unlock deeper probing; weak ones trigger clarifying follow-ups.",
    icon: Sparkles,
  },
  {
    title: "Integrity Layer",
    description: "Response timing analysis, quality spike detection, and structured-paste flagging ensure authentic, unassisted responses throughout the assessment.",
    icon: Shield,
  },
  {
    title: "On-Chain Credential",
    description: "Pass the assessment and receive an immutable Metaplex NFT. Metadata including score and skill areas stored permanently on Arweave.",
    icon: Fingerprint,
  },
  {
    title: "Public Verifier",
    description: "Anyone can verify a credential by mint address. No login required. Reads directly from the Solana blockchain for trustless verification.",
    icon: Eye,
  },
  {
    title: "Topic-Level Scoring",
    description: "Granular scores across account model, security, SPL tokens, Anchor, testing, and advanced patterns. Know exactly where you stand.",
    icon: BarChart3,
  },
  {
    title: "Wallet-Native Auth",
    description: "No passwords. Sign a message with your Solana wallet to authenticate. Your wallet is your identity throughout the entire flow.",
    icon: Lock,
  },
];

const coverageTopics = [
  { title: "Account Model", description: "Ownership, rent, PDAs, account sizing", score: 90 },
  { title: "Transactions", description: "Lifecycle, instruction processing, versioned tx", score: 85 },
  { title: "Anchor Framework", description: "IDL, constraints, CPIs, error handling", score: 80 },
  { title: "Security", description: "Signer checks, ownership, re-entrancy, overflow", score: 95 },
  { title: "SPL Tokens", description: "Token accounts, ATAs, mint/burn/transfer", score: 75 },
  { title: "Advanced Patterns", description: "Escrow, vesting, governance primitives", score: 70 },
  { title: "Testing", description: "Unit tests, bankrun, integration tests", score: 65 },
  { title: "Deployment", description: "Upgrade authority, devnet/mainnet, CI/CD", score: 60 },
];

const pricingPlans = [
  {
    title: "Diagnostic",
    price: "Free",
    subPrice: "Free forever",
    features: [
      "8-12 adaptive questions",
      "Skill mapping across 6 topics",
      "Gap analysis with resources",
      "Readiness recommendation",
      "Unlimited retakes"
    ],
    buttonText: "Start Diagnostic",
    isVerifiable: false
  },
  {
    title: "Assessment",
    price: "0.5 SOL",
    priceAlt: "or 10 USDC",
    subPrice: "One-time payment",
    badge: "NFT Credential",
    features: [
      "15-20 deep technical questions",
      "Follow-up probing on answers",
      "Integrity layer protection",
      "Detailed score breakdown (8 areas)",
      "Verified NFT credential on pass",
      "Permanent on-chain record",
      "Public verification page"
    ],
    buttonText: "Get Certified",
    isVerifiable: true
  }
];

export default function Home() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.wallet.token);

  return (
    <>
      {/* Background Glow Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/3 blur-[120px]"></div>
        <div className="absolute top-[40%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/3 blur-[120px]"></div>
      </div>

      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none -z-20 opacity-50"></div>

      {/* TopNavBar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl border border-white/10 z-50 bg-surface-container-lowest/60 backdrop-blur-xl rounded-2xl flex justify-between items-center px-6 py-4 shadow-2xl">
        <div className="text-xl font-black tracking-tighter text-primary font-h2 text-h2 uppercase">CERTA</div>
        <div className="hidden md:flex gap-8">
          <a className="font-['Inter'] tracking-tight text-sm uppercase text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" href="#how-it-works">How It Works</a>
          <a className="font-['Inter'] tracking-tight text-sm uppercase text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" href="#features">Features</a>
          <a className="font-['Inter'] tracking-tight text-sm uppercase text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" href="#coverage">Coverage</a>
          <a className="font-['Inter'] tracking-tight text-sm uppercase text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer" href="#pricing">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
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

      {/* Hero Section */}
      <main className="pt-40 pb-24 px-6 md:px-lg max-w-container-max mx-auto text-center">
        <div className="flex flex-col gap-md items-center z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-surface-container/40 backdrop-blur-md border border-white/10 border-t-white/15 border-l-white/15 rounded-full px-4 py-2 w-max mx-auto">
            <span className="w-2 h-2 rounded-full bg-primary glow-effect"></span>
            <span className="font-mono-data text-mono-data text-primary">Live on Solana Devnet</span>
          </div>
          <h1 className="font-h1 text-h1 text-on-surface">
            Prove Your Solana Skills
          </h1>
          <h1 className="font-h1 text-h1 text-on-surface">
            <span className="text-primary">On-Chain</span>
          </h1>
          <p className="font-body-main text-body-main text-on-surface-variant max-w-2xl mx-auto">
            AI-powered adaptive assessments that verify your Solana development expertise. Pass the assessment and mint a verified NFT credential to your wallet.
          </p>
          <div className="flex flex-wrap justify-center gap-md mt-sm">
            <button onClick={() => router.push("/dashboard")} className="bg-primary cursor-pointer text-on-primary font-label-caps text-label-caps px-6 py-3 rounded-lg border border-primary hover:bg-primary-fixed-dim transition-all glow-hover flex items-center gap-2">
              Dashboard
              <ArrowRight className="w-[18px] h-[18px]" />
            </button>
            <button onClick={() => router.push("/dashboard/assessment")} className="bg-transparent cursor-pointer text-on-surface font-label-caps text-label-caps px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2">
              Get Certified
            </button>
          </div>
        </div>
      </main>

      {/* Diagnostic Conversation Section */}
      <section className="py-xl px-6 md:px-lg max-w-container-max mx-auto">
        <div className="text-center mb-xl">
          <div className="font-label-caps text-label-caps text-primary mb-4 tracking-widest uppercase">Try It Now</div>
          <h2 className="font-h2 text-h2 text-on-surface">Interactive AI Diagnostics</h2>
          <p className="font-body-main text-body-main text-on-surface-variant mt-2">Dynamic, conversational verification of your Solana expertise.</p>
        </div>
        <div className="bg-surface-container/40 backdrop-blur-xl border border-white/10 border-t-white/15 border-l-white/15 rounded-xl overflow-hidden max-w-4xl mx-auto shadow-2xl">
          {/* Window Header */}
          <div className="bg-surface-container-lowest/80 border-b border-white/10 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
            </div>
            <div className="flex-1 text-left font-mono-data text-xs text-outline flex items-center gap-2">
              <MessageSquare className="w-[14px] h-[14px]" />
              certa diagnostic session
            </div>
          </div>
          {/* Window Body */}
          <div className="p-6 flex flex-col gap-6 bg-surface-container-lowest/30">
            {/* AI Message 1 */}
            <div className="flex w-full">
              <div className="bg-surface-container/80 backdrop-blur-md border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[80%] text-on-surface font-body-main">
                Let&apos;s start with Solana&apos;s account model. Can you explain the relationship between an account&apos;s owner and the program that can modify its data?
              </div>
            </div>
            {/* User Message */}
            <div className="flex w-full justify-end">
              <div className="bg-primary/20 backdrop-blur-md border border-primary/30 rounded-2xl rounded-tr-sm px-5 py-4 max-w-[80%] text-on-surface font-body-main shadow-[0_0_15px_rgba(78,222,163,0.1)]">
                On Solana, every account has an owner field that points to a program ID. Only the owning program can modify the account&apos;s data and debit its lamports...
              </div>
            </div>
            {/* AI Message 2 */}
            <div className="flex w-full">
              <div className="bg-surface-container/80 backdrop-blur-md border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[80%] text-on-surface font-body-main">
                Good foundation. Now, what happens when you derive a PDA and the bump seed produces a point on the ed25519 curve?
              </div>
            </div>
            {/* Typing Indicator */}
            <div className="flex w-full">
              <div className="bg-surface-container/50 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                <div className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-outline rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-xl px-6 md:px-lg max-w-container-max mx-auto mt-xl pt-xl">
        <div className="text-center mb-xl">
          <div className="font-label-caps text-label-caps text-primary mb-4 tracking-widest uppercase">How It Works</div>
          <h2 className="font-h2 text-h2 text-on-surface">Four steps to verified expertise</h2>
          <p className="font-body-main text-body-main text-on-surface-variant mt-2">Dynamic, conversational verification of your Solana expertise.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {howItWorksSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-surface-container/40 backdrop-blur-md border border-white/10 border-t-white/15 border-l-white/15 rounded-xl p-6 hover:bg-surface-container/60 transition-all group relative">
                <div className="font-mono-data text-xs text-outline mb-4">{step.num}</div>
                <div className={`w-12 h-12 rounded-lg bg-surface-container-lowest border border-white/5 flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors`}>
                  <Icon className={`w-6 h-6 text-primary`} />
                </div>
                <h3 className="font-h2 text-lg mb-2 text-on-surface">{step.title}</h3>
                <p className="font-body-main text-body-main text-on-surface-variant text-sm">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Detail Section */}
      <section id="features" className="py-xl px-6 md:px-lg max-w-container-max mx-auto mt-xl">
        <div className="text-center mb-xl">
          <div className="font-label-caps text-label-caps text-primary mb-4 tracking-widest uppercase">Features</div>
          <h2 className="font-h2 text-h2 text-on-surface">Built for signal, not noise</h2>
          <p className="font-body-main text-body-main text-on-surface-variant mt-2 max-w-2xl mx-auto">
            No curriculum. No job board. Pure verification. Every feature exists to ensure the credential means something.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {featuresList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-surface-container/40 backdrop-blur-md border border-white/10 border-t-white/15 border-l-white/15 rounded-xl p-6 hover:bg-surface-container/60 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest border border-white/5 flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-h2 text-lg mb-2 text-on-surface">{feature.title}</h3>
                <p className="font-body-main text-body-main text-on-surface-variant text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Coverage Section */}
      <section id="coverage" className="py-xl px-6 md:px-lg max-w-container-max mx-auto mt-xl">
        <div className="flex flex-col lg:flex-row gap-xl">
          {/* Left Column */}
          <div className="lg:w-1/3">
            <div className="font-label-caps text-label-caps text-primary mb-4 tracking-widest uppercase">Coverage</div>
            <h2 className="font-h2 text-h2 text-on-surface text-4xl mb-6">Eight core topic areas</h2>
            <p className="font-body-main text-body-main text-on-surface-variant mb-8">
              The assessment covers every domain a professional Solana developer needs. The AI adapts depth per topic based on your demonstrated knowledge, spending more time where it matters.
            </p>
            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-6">
              <p className="font-body-main text-primary text-sm">
                Pass threshold: Score 70+ overall with no critical security topic below 5/10
              </p>
            </div>
          </div>
          {/* Right Column */}
          <div className="lg:w-2/3 flex flex-col gap-6">
            {coverageTopics.map((topic, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-wrap gap-x-2 items-baseline">
                    <span className="font-h2 text-on-surface font-bold">{topic.title}</span>
                    <span className="font-body-main text-on-surface-variant text-sm">{topic.description}</span>
                  </div>
                  <span className="font-mono-data text-xs text-on-surface-variant">{topic.score}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${topic.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-xl px-6 md:px-lg max-w-container-max mx-auto mt-xl">
        <div className="text-center mb-xl">
          <div className="font-label-caps text-label-caps text-primary mb-4 tracking-widest uppercase">Pricing</div>
          <h2 className="font-h2 text-h2 text-on-surface">Simple, transparent pricing</h2>
          <p className="font-body-main text-body-main text-on-surface-variant mt-2 max-w-2xl mx-auto">
            Start free. Pay only when you&apos;re ready to earn your verified credential.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg max-w-4xl mx-auto">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-surface-container/40 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 flex justify-between flex-col relative group overflow-hidden ${plan.isVerifiable ? 'border-primary/30 ring-1 ring-primary/20' : ''
                }`}
            >
              {plan.isVerifiable && (
                <div className="absolute top-[-100px] right-[-100px] w-[200px] h-[200px] bg-primary/10 rounded-full blur-[50px] pointer-events-none"></div>
              )}
              <div className="mb-8 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-h2 text-2xl text-on-surface">{plan.title}</h3>
                    <div className="text-on-surface-variant text-xs mt-1">{plan.subPrice}</div>
                  </div>
                  {plan.badge && (
                    <span className="bg-primary/20 text-primary text-[10px] px-2 py-1 rounded border border-primary/30 font-label-caps uppercase tracking-wider">{plan.badge}</span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-4">
                  <div className="text-on-surface font-h2 text-4xl font-bold">{plan.price}</div>
                  {plan.priceAlt && <div className="text-on-surface-variant text-sm font-body-main">{plan.priceAlt}</div>}
                </div>
                <ul className="space-y-4 mt-4 relative z-10">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-on-surface/80">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span className="font-body-main text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <button className={`w-full py-4 rounded-lg cursor-pointer font-label-caps text-label-caps transition-all active:scale-95 relative z-10 ${plan.isVerifiable
                  ? 'bg-primary text-on-primary-fixed shadow-[0_0_20px_rgba(78,222,163,0.2)] hover:bg-primary-fixed'
                  : 'bg-surface-container-highest text-on-surface hover:bg-surface-bright'
                  }`}>
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 md:px-lg max-w-container-max mx-auto text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-h1 text-h1 text-on-surface mb-6">Ready to verify your expertise?</h2>
          <p className="font-body-main text-body-main text-on-surface-variant max-w-2xl mx-auto mb-10">
            Join the growing network of verified Solana developers. Your credential <br />
            lives on-chain, forever.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-primary text-on-primary-fixed px-10 py-4 rounded-lg font-label-caps text-label-caps hover:bg-primary-fixed transition-all active:scale-95 glow-hover cursor-pointer">
              Connect Wallet & Start
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-surface-container-high py-8 bg-surface-container-lowest mt-xl">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <div className="font-['Inter'] text-[10px] uppercase tracking-widest text-outline">
            © 2024 Certa Protocol. Verified on Solana Mainnet.
          </div>
          <div className="flex gap-6">
            <Link className="font-['Inter'] text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Security Audit</Link>
            <Link className="font-['Inter'] text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Status</Link>
            <Link className="font-['Inter'] text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Privacy</Link>
            <Link className="font-['Inter'] text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer" href="#">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}