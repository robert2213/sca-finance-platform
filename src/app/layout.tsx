import type { Metadata } from "next";
import "./globals.css";
import ClientConfigProvider from "@/components/layout/ClientConfigProvider";
import defaultConfig from "@/config/client.config";

export const metadata: Metadata = {
  title: {
    default: defaultConfig.clientName,
    template: `%s — ${defaultConfig.clientName}`,
  },
  description:
    "AI-powered FP&A and IT Finance management platform with six specialized financial agents covering budget variance, vendor spend, external labor, headcount, cloud costs, and executive reporting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* TODO: Apply route-level role guards — see /lib/auth/roles.ts */}
        <ClientConfigProvider>
          {children}
        </ClientConfigProvider>
      </body>
    </html>
  );
}
