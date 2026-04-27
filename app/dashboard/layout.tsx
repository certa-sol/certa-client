import { Sidebar } from "@/components/common/Sidebar";
import { TopNavBar } from "@/components/common/TopNavBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col h-full overflow-hidden">
        <TopNavBar />
        {children}
      </div>
    </div>
  );
}
