'use client'

import { useBusiness } from "@/hooks/use-business";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { businesses, isLoading, isFetching } = useBusiness();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until both loading (first fetch) and fetching (background invalidation/refetch) are done
    const isReady = !isLoading && !isFetching;
    
    if (isReady && businesses.length === 0 && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [businesses, isLoading, isFetching, pathname, router]);

  if (isLoading || isFetching) return null;

  return <>{children}</>;
}
