import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col pb-16">
      <TopNav />
      <main className="flex-1 px-4 pt-6 md:px-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
