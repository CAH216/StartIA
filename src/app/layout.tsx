import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "StratIA – Implémentation IA pour les entreprises",
  description: "Diagnostic IA, roadmap personnalisée et accompagnement pour implémenter l'intelligence artificielle dans votre entreprise.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <LanguageProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}