import type { Metadata } from "next";
import { Varela_Round, Nunito_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/lib/env";
import { ThemeScript } from "@/lib/theme/theme-script";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

const varelaRound = Varela_Round({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bloom & Bind",
  description:
    "Handcrafted crochet and artificial flower bouquets — customised for every occasion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // data-theme and .dark will be set synchronously by ThemeScript.
      // These defaults prevent a server/client attribute mismatch on the
      // first paint before the inline script runs.
      data-theme="blue"
      className={`${varelaRound.variable} ${nunitoSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Must be first in <head> — runs sync before paint to prevent flash */}
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-bg-base text-text-primary">
        {/* Skip navigation for keyboard users */}
        <a
          href="#skip-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent-primary focus:text-text-primary focus:font-medium"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <main id="main" className="flex-1">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
