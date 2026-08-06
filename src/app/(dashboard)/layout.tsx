import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";
import { ScrollToTop } from "@/components/scroll-to-top";
import { OnboardingCheck } from "@/components/onboarding-check";
import { PageTransition } from "@/components/ui/page-transition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingCheck>
      <div className="flex min-h-full flex-col pb-16">
        <ScrollToTop />
        <TopNav />
        <main className="flex-1 px-4 pt-6 md:px-8 flex flex-col">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <BottomNav />
      </div>
    </OnboardingCheck>
  );
}
