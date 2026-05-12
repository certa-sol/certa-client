"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { Sidebar } from "@/components/common/Sidebar";
import {
  LayoutDashboard,
  CheckCircle2,
  Trophy,
  FileText,
  Star,
  Bell,
  Settings,
  Shield,
  Radar,
  Medal,
  User
} from "lucide-react";
import Link from "next/link";

function truncate(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export default function DashboardPage() {
  const { isConnected, address } = useSelector((state: RootState) => state.wallet);

  if (!isConnected) {
    return null; // RouteGuard handles the redirect
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 w-full scrollbar-hide">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-on-surface mb-3">
          Developer Vault
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-sm md:text-base leading-relaxed">
          Overview of your verification status, skill assessments, and on-chain credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Diagnostic Action */}
        <Link href="/dashboard/diagnostic" className="group">
          <div className="h-full bg-surface-container/20 hover:bg-surface-container/40 border border-white/5 hover:border-primary/20 rounded-xl p-6 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Radar className="w-16 h-16 text-primary" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Free Diagnostic</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Take a quick adaptive interview to map your current Solana knowledge topology.
            </p>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
              Start Now <Trophy className="w-3 h-3" />
            </div>
          </div>
        </Link>

        {/* Assessment Action */}
        <Link href="/dashboard/assessment" className="group">
          <div className="h-full bg-surface-container/20 hover:bg-surface-container/40 border border-white/5 hover:border-primary/20 rounded-xl p-6 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Shield className="w-16 h-16 text-primary" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
              <Medal className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Technical Assessment</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Ready for certification? Launch the full-depth assessment to earn your on-chain credential.
            </p>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
              Get Certified <Trophy className="w-3 h-3" />
            </div>
          </div>
        </Link>
      </div>
    </main>
  );
}
