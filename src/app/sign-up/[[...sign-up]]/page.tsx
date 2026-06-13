import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

export default function SignUpPage() {
  if (!clerkEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h1 className="text-xl font-semibold">Authentication is not configured</h1>
          <p className="mt-2 text-sm text-gray-500">
            This deployment is running in demo mode. Set the Clerk environment
            variables to enable sign-up. See <code>.env.example</code>.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <SignUp />
    </div>
  );
}
