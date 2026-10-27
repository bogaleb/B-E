import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource/noto-serif-ethiopic/500.css";
import "@fontsource/noto-sans-ethiopic/400.css";
import "./globals.css";
import { publicEnv } from "@/lib/env";
import { PREFS_SCRIPT } from "@/lib/prefs-script";

// Self-hosted, preloaded, with metric-matched fallbacks to avoid layout shift.
const display = localFont({ src: "../fonts/young-serif-latin-400-normal.woff2", weight: "400", variable: "--font-young", display: "swap", adjustFontFallback: "Times New Roman", fallback: ["Georgia", "Times New Roman", "serif"] });
const body = localFont({
  src: [
    { path: "../fonts/hanken-grotesk-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/hanken-grotesk-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/hanken-grotesk-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-hanken", display: "swap", fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: "ETHIO Foods — Lentils, fava beans and flaxseed", template: "%s · ETHIO Foods" },
  description: "ETHIO packs red lentils, split fava beans, flaxseed and pantry staples for homes, grocery stores and restaurants. A brand of B&E Wholesale LLC, Sterling, Virginia.",
  applicationName: "ETHIO Foods",
  openGraph: { type: "website", siteName: "ETHIO Foods", locale: "en_US", images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "ETHIO Foods" }] },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = { themeColor: "#103F2D", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
