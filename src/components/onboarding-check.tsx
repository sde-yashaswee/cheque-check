'use client'

import { useBusiness } from "@/hooks/use-business";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { businesses, isLoading, isFetching } = useBusiness();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until loading (first fetch) is done
    const isReady = !isLoading;
    
    if (isReady && businesses.length === 0 && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [businesses, isLoading, pathname, router]);

  if (isLoading) return null;

  return <>{children}</>;
}
