import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BontiLand 2.0 — Speak English with Confidence",
  description: "Daily English fluency trainer. No translation. Just speaking.",
  manifest: "/manifest.json",
  themeColor: "#1a1a2e",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
