"use client";

import { ClientConfigContext } from "@/lib/hooks/useClientConfig";
import defaultConfig, { type ClientConfig } from "@/config/client.config";

interface Props {
  config?: ClientConfig;
  children: React.ReactNode;
}

export default function ClientConfigProvider({ config = defaultConfig, children }: Props) {
  return (
    <ClientConfigContext.Provider value={config}>
      {children}
    </ClientConfigContext.Provider>
  );
}
