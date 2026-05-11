"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  FileText,
  Home,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ClipboardList,
  Award
} from "lucide-react";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Diagnostics", href: "/dashboard/diagnostic", icon: CheckCircle2 },
    { name: "Assessment", href: "/dashboard/assessment", icon: FileText },
    { name: "Results", href: "/dashboard/results", icon: ClipboardList },
    { name: "Certificates", href: "/dashboard/credentials", icon: Award },
  ];

  const closeMobileSidebar = () => setIsMobileOpen(false);
  const toggleDesktopSidebar = () => setIsDesktopExpanded(!isDesktopExpanded);

  return (
    <>
      {/* Mobile Hamburger Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden cursor-pointer fixed top-3 left-4 z-50 p-2 rounded-lg bg-surface-container/50 backdrop-blur-md text-on-surface-variant border border-white/10 hover:bg-white/5 transition-colors"
        aria-label="Toggle Menu"
      >
        {isMobileOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <nav className={`
                fixed md:relative left-0 top-0 h-full border-r border-white/5 
                bg-surface-container-lowest/95 md:bg-surface-container-lowest/60 backdrop-blur-xl 
                flex flex-col pt-20 md:pt-8 pb-8 z-40 transition-all duration-300 ease-in-out shrink-0
                ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
                ${!isMobileOpen && !isDesktopExpanded ? 'md:w-20' : 'md:w-64'}
                ${!isMobileOpen && isDesktopExpanded ? 'w-64' : ''}
            `}>
        {/* Desktop Header */}
        <div className={`px-6 mb-12 hidden md:flex items-center ${isDesktopExpanded ? 'justify-between' : 'justify-center px-0'}`}>
          {isDesktopExpanded && (
            <div className="overflow-hidden">
              <h2 className="text-2xl font-black text-on-surface font-h2 uppercase tracking-tighter cursor-pointer" onClick={() => router.push("/")}>CERTA</h2>
              <p className="font-mono-data text-[10px] text-primary-fixed-dim opacity-80 mt-1 whitespace-nowrap">Solana Verification</p>
            </div>
          )}
          <button
            onClick={toggleDesktopSidebar}
            className="p-1.5 rounded-md cursor-pointer hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
            title={isDesktopExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isDesktopExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Header Inside Sidebar */}
        <div className="px-6 mb-8 md:hidden">
          <h2 className="text-2xl font-black text-on-surface font-h2 uppercase tracking-tighter cursor-pointer" onClick={() => { router.push("/"); closeMobileSidebar(); }}>CERTA</h2>
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
                onClick={closeMobileSidebar}
                className={`py-3 flex items-center group transition-all ${isActive
                  ? "bg-primary/10 text-primary border-r-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/5 border-r-2 border-transparent"
                  } ${isDesktopExpanded ? 'px-6 gap-3' : 'md:justify-center md:px-0 px-6 gap-3'}`}
                title={!isDesktopExpanded ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={`font-body-main text-sm font-medium whitespace-nowrap ${!isDesktopExpanded ? 'md:hidden' : ''}`}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
