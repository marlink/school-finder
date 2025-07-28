import type { Metadata } from "next";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

export const metadata: Metadata = {
  title: "School Finder - Znajdź idealną szkołę dla swojego dziecka",
  description: "Przeglądaj tysiące szkół w Polsce, czytaj opinie rodziców i uczniów, porównuj placówki i podejmuj świadome decyzje o edukacji.",
  keywords: "szkoły, edukacja, opinie, ranking szkół, szkoły podstawowe, licea, technika",
  authors: [{ name: "School Finder Team" }],
  openGraph: {
    title: "School Finder - Znajdź idealną szkołę",
    description: "Kompleksowy portal do wyszukiwania i porównywania szkół w Polsce",
    type: "website",
    locale: "pl_PL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className="font-sans antialiased"
      >
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
      </body>
    </html>
  );
}
