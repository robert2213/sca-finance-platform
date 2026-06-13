import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
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

// Clerk is engaged only when fully configured (BOTH keys) — the same gate used
// by middleware.ts and tenant-context.ts, so the provider is never mounted while
// the auth middleware is a no-op. In demo mode the app renders exactly as before.
const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tree = (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientConfigProvider>
          {children}
        </ClientConfigProvider>
      </body>
    </html>
  );

  return clerkEnabled ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
