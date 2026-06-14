"use client";

import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

/**
 * Auth controls for the app header. Renders the Clerk organization switcher
 * (the visible tenant boundary) and user menu ONLY when Clerk is configured.
 * In demo mode this renders nothing, leaving the original header untouched.
 *
 * The publishable key is inlined into the client bundle at build time, so this
 * check works on the client without a server round-trip.
 */
const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function AuthControls() {
  if (!clerkEnabled) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:block">
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/"
          appearance={{ elements: { rootBox: "flex items-center" } }}
        />
      </div>
      <UserButton afterSignOutUrl="/sign-in" />
    </div>
  );
}
