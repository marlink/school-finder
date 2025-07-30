'use client';

import { MainLayout } from "@/components/layout/MainLayout";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

export default function MainGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnalyticsProvider>
      <SessionProvider>
        <SWRProvider>
          <FeatureFlagProvider>
            <OnboardingProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </OnboardingProvider>
          </FeatureFlagProvider>
        </SWRProvider>
      </SessionProvider>
    </AnalyticsProvider>
  );
}