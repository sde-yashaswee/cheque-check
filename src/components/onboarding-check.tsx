'use client'

import { useBusiness } from "@/hooks/use-business";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { businesses, isLoading, isFetching } = useBusiness();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isReady = !isLoading && !isFetching;
    
    if (isReady && businesses.length === 0 && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [businesses, isLoading, isFetching, pathname, router]);

  if (isLoading || (isFetching && businesses.length === 0)) return null;

  return <>{children}</>;
}
