"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface AgentShellProps {
  title:     string;
  subtitle?: string;
  badge?:    string;
  children:  React.ReactNode;
}

/**
 * AgentShell — a variant of the main shell that removes the page-level padding
 * and overflow-y-auto so the workspace component can control its own scrolling.
 *
 * Standard ShellClient wraps children in:
 *   <main class="flex-1 overflow-y-auto">
 *     <div class="p-5 md:p-8">  ← kills full-height flex layouts
 *
 * AgentShell replaces that with:
 *   <main class="flex-1 min-h-0 overflow-hidden">  ← workspace manages its own scroll
 */
export default function AgentShell({ title, subtitle, badge, children }: AgentShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 overflow-hidden">
        <TopBar
          title={title}
          subtitle={subtitle}
          badge={badge}
          onMenuClick={() => setSidebarOpen(true)}
        />
        {/* No padding wrapper, no overflow-y-auto — workspace owns its scroll */}
        <main className="flex-1 min-h-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
