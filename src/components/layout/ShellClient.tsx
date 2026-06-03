"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface ShellClientProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}

export default function ShellClient({ title, subtitle, badge, children }: ShellClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — offset by sidebar width on large screens */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 overflow-hidden">
        <TopBar
          title={title}
          subtitle={subtitle}
          badge={badge}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-8 page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
