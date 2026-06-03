import ShellClient from "./ShellClient";

interface PageWrapperProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}

// Server component — passes shell down to client for mobile toggle
export default function PageWrapper({ title, subtitle, badge, children }: PageWrapperProps) {
  return (
    <ShellClient title={title} subtitle={subtitle} badge={badge}>
      {children}
    </ShellClient>
  );
}
