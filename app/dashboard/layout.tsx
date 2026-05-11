import { Sidebar } from "@/components/common/Sidebar";
import { TopNavBar } from "@/components/common/TopNavBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
      </div>

      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0 opacity-50"></div>

      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <TopNavBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
