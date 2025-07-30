import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import "./globals.css";

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
      <body className="font-sans antialiased">
        <StackProvider app={stackServerApp}>
          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
