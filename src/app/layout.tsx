import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nexora AI Finance",
    template: "%s — Nexora AI Finance",
  },
  description:
    "AI-powered FP&A and IT Finance management platform with six specialized financial agents covering budget variance, vendor spend, external labor, headcount, cloud costs, and executive reporting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
