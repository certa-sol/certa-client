"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CheckCircle2,
    Medal,
    Trophy,
    FileText,
    Star
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Diagnostics", href: "/dashboard/diagnostic", icon: CheckCircle2 },
        { name: "Assessment", href: "/dashboard/assessment", icon: FileText },
    ];

    return (
        <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 border-r border-white/5 bg-surface-container-lowest/60 backdrop-blur-xl flex-col pt-8 pb-8 z-40">
            <div className="px-6 mb-12">
                <h2 className="text-2xl font-black text-on-surface font-h2 uppercase tracking-tighter">CERTA</h2>
                <p className="font-mono-data text-xs text-primary-fixed-dim opacity-80 mt-1">Solana Verification</p>
            </div>
            <div className="flex flex-col grow space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`px-6 py-3 flex items-center gap-3 group transition-all ${isActive
                                ? "bg-primary/10 text-primary border-r-2 border-primary"
                                : "text-on-surface-variant hover:text-on-surface hover:bg-white/5 border-r-2 border-transparent"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-body-main text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
