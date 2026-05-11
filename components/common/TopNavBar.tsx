import { Bell, Settings } from "lucide-react";
import { WalletConnectButton } from "@/components/WalletConnectButton";

export function TopNavBar() {
  return (
    <header className="w-full border-b border-white/5 bg-surface-container-lowest/40 backdrop-blur-xl flex justify-between items-center px-6 h-16 shrink-0 z-30">
      <div className="flex items-center gap-4 pl-12 md:pl-0 md:hidden">
        <span className="text-xl font-black tracking-tighter text-primary font-h2 uppercase">Certa</span>
      </div>
      <div className="hidden md:block"></div>
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:bg-primary/10 hover:text-primary p-2 rounded-full transition-all duration-200">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-on-surface-variant hover:bg-primary/10 hover:text-primary p-2 rounded-full transition-all duration-200">
          <Settings className="w-5 h-5" />
        </button>
        <div className="ml-2">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
