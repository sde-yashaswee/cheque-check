import { BottomNav } from "@/components/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col pb-16">
      <main className="flex-1 px-4 pt-12 md:px-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
