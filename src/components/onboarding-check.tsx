'use client'

import { useBusiness } from "@/hooks/use-business";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { businesses, isLoading } = useBusiness();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && businesses.length === 0 && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [businesses, isLoading, pathname, router]);

  if (isLoading) return null;

  return <>{children}</>;
}
